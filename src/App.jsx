import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import './index.css';

// DATABASE COMPLETO A LISTE PUNTATE + LINK DIRETTI
const DATA = {
  casco: {
    id: 'casco', label: 'Caschi MIPS', title: 'Casco & Audio',
    brand: 'Scopri Sena Snow ↗', url: 'https://www.sena.com/eu-en/snow-sports',
    novita: ['Calotte ibride ultraleggere (Carbonio/ABS)', 'Sistema MIPS per l\'assorbimento degli impatti rotazionali', 'Moduli audio Sena Mesh per comunicazione vocale in gruppo'],
    livelli: { principiante: 'Ventilazione passiva e fit regolabile.', evoluto: 'Calotta ibrida + MIPS.', pro: 'Omologazione FIS RH 2013, mentoniera rimovibile.', maestro: 'Leggerezza per 8h + interfono Sena per didattica a distanza.' }
  },
  maschera: {
    id: 'maschera', label: 'Visori AR', title: 'Smart Goggles & AR',
    brand: 'Scopri Out Of Electra 3 ↗', url: 'https://out-of.com/it/product/electra-3/',
    novita: ['Lente elettronica IRID (S1-S3 in <1 secondo) a cella solare', 'HUD AR integrato (REKKIE 2027) per telemetria visiva', 'Lenti graduate native SnowVision Magnus'],
    livelli: { principiante: 'Doppia lente S2 anti-appannamento.', evoluto: 'Transizione elettronica istantanea.', pro: 'Lente torica ad alto contrasto.', maestro: 'Out Of: adattamento istantaneo per transizioni luce/ombra nei boschi.' }
  },
  abbigliamento: {
    id: 'abbigliamento', label: 'Aerogel', title: 'Termoregolazione',
    brand: 'Scopri Speed Demon Lab ↗', url: 'https://www.ispo.com',
    novita: ['Isolamento termico spaziale in Aerogel', 'Tessuti a cambiamento di fase (PCM)', 'Layering riscaldato attivamente (calzini/guanti)'],
    livelli: { principiante: 'Guscio impermeabile 10k.', evoluto: 'Layering modulare 3L (20k).', pro: 'Tute aerodinamiche (Speed Demon).', maestro: 'Aerogel + calzini riscaldati per sopravvivere alle fasi statiche.' }
  },
  protezioni: {
    id: 'protezioni', label: 'Esoscheletri', title: 'Supporto Muscolare',
    brand: 'Scopri Ski-Mojo ↗', url: 'https://www.ski-mojo.fr',
    novita: ['Ski-Mojo: riduce il carico del 30% su quadricipiti e ginocchia', 'Againer: assistenza meccanica regolabile', 'Dainese D-Air Ski 2 Evo: airbag elettronico'],
    livelli: { principiante: 'Paraschiena in materiale viscoelastico.', evoluto: 'Ski-Mojo a fine giornata per limitare la fatica.', pro: 'Airbag Dainese ad attivazione millisecondica.', maestro: 'Ski-Mojo è vitale per preservare le articolazioni usurate.' }
  },
  scarpone: {
    id: 'scarpone', label: 'Scarponi BOA', title: 'Calzata BOA',
    brand: 'Scopri BOA Fit System ↗', url: 'https://www.boafit.com',
    novita: ['Chiusura BOA Dial sullo scafo inferiore per avvolgimento a 360°', 'Memoria meccanica della tensione (Kästle RYF)', 'Scarpette termoformabili 3D ad alta densità'],
    livelli: { principiante: 'Flex 80-90, Last 102mm, GripWalk.', evoluto: 'BOA per microregolazioni rapide.', pro: 'Scafo race plug 93mm fresato.', maestro: 'Regolazione rapida BOA in seggiovia per alternare comfort e performance.' }
  },
  attacchi: {
    id: 'attacchi', label: 'Sicurezza LCA', title: 'Protezione LCA',
    brand: 'Scopri Tyrolia Protector ↗', url: 'https://www.tyrolia.com/it/protector',
    novita: ['Talloniera a sgancio laterale intelligente (Tyrolia Protector)', 'Prevenzione meccanica contro le lesioni al Legamento Crociato Anteriore'],
    livelli: { principiante: 'Attacco leggero (DIN basso).', evoluto: 'Tyrolia Protector: sgancio laterale talloniera.', pro: 'Piastra race rigida.', maestro: 'Prevenzione massima LCA per le continue dimostrazioni a spazzaneve.' }
  },
  sci: {
    id: 'sci', label: 'Sci Custom', title: 'Energia & Custom',
    brand: 'Scopri ORIGINAL+ 6X ↗', url: 'https://www.original.plus',
    novita: ['Costruzione algoritmica su misura (ORIGINAL+ / Wagner)', 'Smart Ski Experience (Rossignol/CEA): energia dalle vibrazioni', 'Smorzamento piezoelettrico (HEAD EMC) e VibeStop'],
    livelli: { principiante: 'Rocker per ingresso curva facile.', evoluto: 'Setup algoritmico ORIGINAL+.', pro: 'Race FIS Titanal reattivo.', maestro: 'L\'energia recuperata (Rossignol) alimenterà i device del professionista.' }
  },
  bastoni: {
    id: 'bastoni', label: 'Bastoni Tech', title: 'Assetto in Carbonio',
    brand: 'Scopri Leki Trigger ↗', url: 'https://www.leki.com',
    novita: ['Tubi in carbonio alto modulo (bilanciamento in alto)', 'Grip ergonomici stampati 3D', 'Sganci magnetici di sicurezza al lacciolo'],
    livelli: { principiante: 'Alluminio (Lunghezza: H/1.50).', evoluto: 'Carbonio ultraleggero (Lunghezza: H/1.53).', pro: 'Profilo curvo aerodinamico.', maestro: 'Grip anatomico prolungato e puntale in carburo.' }
  },
  telemetria: {
    id: 'telemetria', label: 'Telemetria IA', title: 'Sensori Inerziali',
    brand: 'Scopri Carv 2 ↗', url: 'https://getcarv.com',
    novita: ['Sensori wearable Carv 2 per l\'angolo di spigolo (audio live)', 'Solette Moticon OpenGo per mappare la pressione plantare', 'Analisi IA video (Dartfish, EDGIN)'],
    livelli: { principiante: 'Videoanalisi base da tablet.', evoluto: 'Carv 2 (coaching audio live in cuffia).', pro: 'Protern Live e Moticon OpenGo.', maestro: 'Dati oggettivi da mostrare all\'allievo al posto delle sole sensazioni.' }
  }
};

// Formule
const calculateDIN = (w, h, type, boot) => {
  let base = w / 10;
  if (h < 155) base -= 0.5;
  if (type === 2) base += 1.0;
  if (type === 3) base += 2.2;
  const factor = 290 / Math.max(240, Math.min(360, boot));
  return (Math.round(Math.max(0.75, Math.min(13, base * factor)) * 4) / 4).toFixed(2);
};
const calculatePole = (h, levelStr) => Math.round(h / (levelStr === 'l1' ? 1.50 : 1.53));

// Sci perfetti che non sprofondano
function PerfectSkis() {
  const geom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.045, -0.9);
    shape.quadraticCurveTo(-0.03, 0, -0.05, 0.9);
    shape.quadraticCurveTo(0, 1.05, 0.05, 0.9);
    shape.quadraticCurveTo(0.03, 0, 0.045, -0.9);
    shape.quadraticCurveTo(0, -0.95, -0.045, -0.9);
    const extrude = new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 3 });
    extrude.rotateX(-Math.PI / 2);
    return extrude;
  }, []);
  return (
    <group position={[0, -0.006, 0.05]}> {/* Zero esatto per appoggiarsi alla shadow */}
      <mesh geometry={geom} position={[-0.15, 0, 0]} castShadow receiveShadow><meshPhysicalMaterial color="#080a0d" roughness={0.2} metalness={0.8} clearcoat={1} /></mesh>
      <mesh geometry={geom} position={[0.15, 0, 0]} castShadow receiveShadow><meshPhysicalMaterial color="#080a0d" roughness={0.2} metalness={0.8} clearcoat={1} /></mesh>
    </group>
  );
}

function StudioScene({ activePage, onSelect }) {
  const { scene } = useGLTF('/mannequin.glb');
  const groupRef = useRef();

  // Bilanciamento del modello generato da AI per non farlo sprofondare
  const normalizedModel = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const targetScale = 2.0 / Math.max(size.x, size.y, size.z);
    clone.scale.setScalar(targetScale);
    
    // Lo posizioniamo in modo che il punto più basso tocchi ESATTAMENTE y=0
    clone.position.set(-center.x * targetScale, -box.min.y * targetScale, -center.z * targetScale);

    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ color: '#13161f', roughness: 0.65, metalness: 0.3 });
        child.castShadow = true;
      }
    });
    return clone;
  }, [scene]);

  useFrame((state) => {
    // Il gruppo intero fluttua lievemente senza toccare le ombre
    if (groupRef.current) groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.015;
  });

  const Hotspot = ({ pos, id }) => (
    <Html position={pos} center zIndexRange={[50, 0]}>
      <div className={`hotspot-node ${activePage === id ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); onSelect(activePage === id ? null : id); }}>
        <div className="hotspot-dot" />
        <div className="hotspot-tag">{DATA[id].label}</div>
      </div>
    </Html>
  );

  return (
    <group ref={groupRef} position={[0, -1.0, 0]}> {/* Gruppo posizionato esattamente sopra la contact shadow */}
      <primitive object={normalizedModel} />
      <PerfectSkis />

      <Hotspot pos={[0.15, 1.7, 0.15]} id="casco" />
      <Hotspot pos={[-0.15, 1.6, 0.2]} id="maschera" />
      <Hotspot pos={[0.25, 1.15, 0.15]} id="abbigliamento" />
      <Hotspot pos={[-0.25, 0.75, 0.15]} id="protezioni" />
      <Hotspot pos={[0.45, 0.9, 0.2]} id="bastoni" />
      <Hotspot pos={[-0.2, 0.25, 0.15]} id="scarpone" />
      <Hotspot pos={[0.2, 0.15, 0.05]} id="telemetria" />
      <Hotspot pos={[-0.2, 0.05, -0.05]} id="attacchi" />
      <Hotspot pos={[0, 0.05, 0.8]} id="sci" />
    </group>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState(null);
  const [activeLevel, setActiveLevel] = useState('maestro');

  const [dinW, setDinW] = useState(75);
  const [dinH, setDinH] = useState(175);
  const [dinBoot, setDinBoot] = useState(315);
  const [dinType, setDinType] = useState(2);
  const [poleH, setPoleH] = useState(175);
  const [poleL, setPoleL] = useState('l1');

  useEffect(() => {
    const onMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const activeData = activePage ? DATA[activePage] : null;

  return (
    <>
      <div className="studio-canvas" />
      <div className="noise-film" />

      <header className={`brand-header ${activePage ? 'hidden' : ''}`}>
        <span className="kicker">SAS Academy — Gruppo 1</span>
        <h1>Materiali<br/>Sci 2026</h1>
      </header>

      <div style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
        <Canvas shadows camera={{ position: [0, 0.1, 3.6], fov: 42 }} onPointerMissed={() => setActivePage(null)}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 6, 4]} intensity={2.5} castShadow color="#ffffff" />
          <directionalLight position={[-5, 3, -4]} intensity={1.5} color="#00e5ff" />
          <Environment preset="city" />
          
          <StudioScene activePage={activePage} onSelect={setActivePage} />
          
          {/* Ombra di contatto fissa, esatta su y=-1.0 */}
          <ContactShadows position={[0, -1.02, 0]} opacity={0.7} scale={6} blur={2.5} far={3} color="#000" />
          <OrbitControls enableZoom={true} enablePan={false} autoRotate={!activePage} autoRotateSpeed={0.4} minPolarAngle={Math.PI/3} maxPolarAngle={Math.PI/1.9} />
          
          <EffectComposer>
            <Bloom luminanceThreshold={0.9} mipmapBlur intensity={1.2} />
            <Vignette eskil={false} offset={0.25} darkness={1.1} />
          </EffectComposer>
        </Canvas>
      </div>

      <nav className="configurator-dock">
        {Object.values(DATA).map(cat => (
          <button key={cat.id} className={`dock-item ${activePage === cat.id ? 'active' : ''}`} onClick={() => setActivePage(activePage === cat.id ? null : cat.id)}>
            {cat.label}
          </button>
        ))}
      </nav>

      <aside className={`side-panel ${activePage ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setActivePage(null)}>✕ Chiudi e ruota modello</button>

        {activeData && (
          <div>
            <h2>{activeData.title}</h2>
            <a href={activeData.url} target="_blank" rel="noreferrer" className="panel-brand-link">{activeData.brand}</a>
            
            <div className="data-block">
              <h4>Innovazione 2026</h4>
              <ul className="feature-list">
                {activeData.novita.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>

            <div className="data-block">
              <h4>Scelta per Livello</h4>
              <div className="level-grid">
                {Object.keys(activeData.livelli).map(lvl => (
                  <div key={lvl} className={`level-card ${activeLevel === lvl ? 'active' : ''}`} onClick={() => setActiveLevel(lvl)}>
                    <span>{lvl === 'pro' ? 'Professionista' : lvl}</span>
                    <p>{activeData.livelli[lvl]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Typeform-style DIN Calculator */}
            {activeData.id === 'attacchi' && (
              <div className="typeform-module">
                <div className="tf-slider-group">
                  <div className="tf-slider-header"><label>Peso (kg)</label><span>{dinW} kg</span></div>
                  <input type="range" min="30" max="120" value={dinW} onChange={e => setDinW(Number(e.target.value))} />
                </div>
                <div className="tf-slider-group">
                  <div className="tf-slider-header"><label>Altezza (cm)</label><span>{dinH} cm</span></div>
                  <input type="range" min="140" max="210" value={dinH} onChange={e => setDinH(Number(e.target.value))} />
                </div>
                <div className="tf-slider-group">
                  <div className="tf-slider-header"><label>Scafo Scarpone (mm)</label><span>{dinBoot} mm</span></div>
                  <input type="range" min="250" max="360" value={dinBoot} onChange={e => setDinBoot(Number(e.target.value))} />
                </div>
                <div className="tf-slider-group">
                  <label style={{fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.2em'}}>Profilo Sciatore</label>
                  <div className="tf-choice-grid">
                    <div className={`tf-choice-btn ${dinType === 1 ? 'active' : ''}`} onClick={() => setDinType(1)}><span>1</span><small>Prudente</small></div>
                    <div className={`tf-choice-btn ${dinType === 2 ? 'active' : ''}`} onClick={() => setDinType(2)}><span>2</span><small>Intermedio</small></div>
                    <div className={`tf-choice-btn ${dinType === 3 ? 'active' : ''}`} onClick={() => setDinType(3)}><span>3</span><small>Aggressivo</small></div>
                  </div>
                </div>
                
                <div className="tf-result">
                  <p>Taratura DIN (ISO 11088)</p>
                  <h3>{calculateDIN(dinW, dinH, dinType, dinBoot)}</h3>
                </div>
              </div>
            )}

            {/* Typeform-style Pole Calculator */}
            {activeData.id === 'bastoni' && (
              <div className="typeform-module">
                <div className="tf-slider-group">
                  <div className="tf-slider-header"><label>Altezza Sciatore</label><span>{poleH} cm</span></div>
                  <input type="range" min="140" max="210" value={poleH} onChange={e => setPoleH(Number(e.target.value))} />
                </div>
                <div className="tf-slider-group">
                  <label style={{fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.2em'}}>Livello Tecnico</label>
                  <div className="tf-choice-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className={`tf-choice-btn ${poleL === 'l1' ? 'active' : ''}`} onClick={() => setPoleL('l1')}><span>Fino a L5</span><small>Moltiplicatore 1.50</small></div>
                    <div className={`tf-choice-btn ${poleL === 'l6' ? 'active' : ''}`} onClick={() => setPoleL('l6')}><span>L6 - Pro</span><small>Moltiplicatore 1.53</small></div>
                  </div>
                </div>
                
                <div className="tf-result">
                  <p>Lunghezza Consigliata</p>
                  <h3>{calculatePole(poleH, poleL)} cm</h3>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}