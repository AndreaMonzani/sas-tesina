import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import './index.css';

// MACRO CATEGORIE (Massimo 4 per non fare confusione)
const MACROS = [
  { id: 'performance', label: 'Performance', items: ['sci', 'scarpone'] },
  { id: 'sicurezza', label: 'Sicurezza', items: ['attacchi', 'casco', 'protezioni'] },
  { id: 'comfort', label: 'Comfort', items: ['termoregolazione', 'guanti'] },
  { id: 'dati_visione', label: 'Visione & Dati', items: ['maschera_outof', 'maschera_audio', 'telemetria'] }
];

// DATABASE COMPLETO
const DATA = {
  casco: {
    id: 'casco', title: 'Caschi MIPS', brand: 'Visita Sena Snow ↗', url: 'https://www.sena.com',
    novita: ['Calotte ibride ultraleggere (Carbonio/ABS)', 'Sistema MIPS contro gli impatti rotazionali', 'Audio Mesh Sena per comunicazione didattica'],
    info: 'Il casco moderno non è solo un guscio rigido: il MIPS fa scivolare la calotta interna in caso di caduta obliqua, salvando il collo. L\'audio integrato rivoluziona l\'insegnamento in pista.',
    consiglio: 'Consigliato a tutti. Per il Maestro è fondamentale l\'integrazione audio per non dover urlare a 50 metri di distanza.'
  },
  maschera_outof: {
    id: 'maschera_outof', title: 'Ottica IRID', brand: 'Visita Out Of ↗', url: 'https://out-of.com',
    novita: ['Lente elettronica IRID a cella solare', 'Transizione istantanea (S1-S3) in meno di 1 secondo'],
    info: 'Niente più lenti da cambiare: un chip cattura l\'energia solare e oscura la maschera istantaneamente in base alla luce esterna.',
    consiglio: 'Perfetta per ogni livello, dal principiante al pro, per non dover mai togliere la maschera quando il meteo cambia improvvisamente.'
  },
  maschera_audio: {
    id: 'maschera_audio', title: 'Sound BRKR', brand: 'Visita BoneTech ↗', url: 'https://www.bonetech.it',
    novita: ['Conduzione ossea integrata', 'Micro-vibrazioni al posto degli auricolari'],
    info: 'Trasmette l\'audio tramite le ossa craniche. Le orecchie restano libere di ascoltare lo scivolamento degli sci e i rumori della pista.',
    consiglio: 'Ideale in didattica e per il freeride, dove isolarsi acusticamente è un pericolo mortale.'
  },
  termoregolazione: {
    id: 'termoregolazione', title: 'Termoregolazione', brand: 'Scopri Aerogel ↗', url: 'https://www.ispo.com',
    novita: ['Isolamento spaziale Aerogel', 'Sistemi di calore attivi (Heat Sphere)'],
    info: 'Materiali leggerissimi che bloccano il freddo. La tecnologia Heat Sphere integra resistenze quasi invisibili per scaldare attivamente il corpo.',
    consiglio: 'Il Maestro passa ore fermo sulla neve: Aerogel e Heat Sphere gli cambiano letteralmente la vita.'
  },
  guanti: {
    id: 'guanti', title: 'Guanti & Grip', brand: 'Visita Leki ↗', url: 'https://www.leki.com',
    novita: ['Riscaldamento attivo intelligente', 'Integrazione magnetica con il bastone (es. Leki Trigger)'],
    info: 'I guanti si agganciano direttamente al bastone tramite un loop magnetico o meccanico, eliminando il lacciolo pericoloso per i pollici.',
    consiglio: 'Per chi soffre di sindrome di Raynaud (mani fredde) o vuole la massima sicurezza passiva del pollice dello sciatore.'
  },
  scarpone: {
    id: 'scarpone', title: 'Fit & Calzata', brand: 'Scopri BOA Fit ↗', url: 'https://www.boafit.com',
    novita: ['Chiusura BOA Dial per scafo inferiore', 'Termoformatura anatomica Custom Shell'],
    info: 'Il cavo in acciaio avvolge il piede in modo omogeneo senza i punti di pressione dolorosi dei vecchi ganci metallici.',
    consiglio: 'Una salvezza per i piedi a pianta larga e per sganciare/rilasciare la pressione al volo in seggiovia.'
  },
  attacchi: {
    id: 'attacchi', title: 'Attacchi più sicuri', brand: 'Visita Tyrolia ↗', url: 'https://www.tyrolia.com',
    novita: ['Sgancio laterale posteriore (Tyrolia Protector)', 'Riduzione del 50% dei traumi torsionali'],
    info: 'Nelle cadute all\'indietro, il classico attacco non sgancia. La nuova talloniera ruota lateralmente, prevenendo la rottura del crociato (LCA).',
    consiglio: 'Indispensabile a tutti i livelli, ma vitale per chi fa continue dimostrazioni a spazzaneve a bassa velocità.'
  },
  telemetria: {
    id: 'telemetria', title: 'Telemetria IA', brand: 'Scopri Carv 2 ↗', url: 'https://getcarv.com',
    novita: ['Sensori inerziali Carv e solette Moticon', 'Video analisi e feedback in tempo reale'],
    info: 'Registra i gradi di inclinazione e la pressione. L\'Intelligenza Artificiale traduce i dati in consigli vocali in cuffia.',
    consiglio: 'Il gadget definitivo per l\'amatore evoluto che vuole migliorare la tecnica con dati oggettivi.'
  },
  sci: {
    id: 'sci', title: 'Sci & Struttura', brand: 'Scopri ORIGINAL+ ↗', url: 'https://www.original.plus',
    novita: ['Costruzione algoritmica custom (Original+ 6X)', 'Smorzamento piezoelettrico EMC (Head)'],
    info: 'Non più sci fatti in serie, ma strutture costruite calcolando biometricamente il peso e la biomeccanica dello sciatore.',
    consiglio: 'Usa il nostro simulatore qui sotto per scoprire lo sci raccomandato in base al tuo profilo.'
  }
};

// SIMULATORI LOGIC
const calcDIN = (w, type) => (Math.round((w / 10 + (type === 2 ? 1 : type === 3 ? 2.2 : 0)) * 4) / 4).toFixed(2);
const recommendSki = (terrain, level, budget) => {
  if (level === 'principiante') return 'All-Round Entry Level (Rocker morbido)';
  if (terrain === 'fuoripista') return 'Freeride 95-105mm (Anima in legno leggero)';
  if (level === 'esperto' && terrain === 'pista') {
    if (budget === 'alto') return 'Race Carve / Algoritmico Custom (Es. Original+)';
    return 'All-Mountain Performance (Titanal + Smorzamento)';
  }
  return 'All-Mountain Intermedio (Raggio 14-16m)';
};

// SCI PROGRAMMATICI (Ripristinati senza nascondere l'errore del modello, ma rinforzando la sagoma)
function PerfectSkis() {
  const geom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.045, -0.9);
    shape.quadraticCurveTo(-0.03, 0, -0.05, 0.9);
    shape.quadraticCurveTo(0, 1.05, 0.05, 0.9);
    shape.quadraticCurveTo(0.03, 0, 0.045, -0.9);
    shape.quadraticCurveTo(0, -0.95, -0.045, -0.9);
    const extrude = new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002, bevelSegments: 3 });
    extrude.rotateX(-Math.PI / 2);
    return extrude;
  }, []);
  return (
    <group position={[0, -0.02, 0.05]}>
      <mesh geometry={geom} position={[-0.15, 0, 0]} receiveShadow><meshPhysicalMaterial color="#080a0e" roughness={0.3} metalness={0.8} clearcoat={1} /></mesh>
      <mesh geometry={geom} position={[0.15, 0, 0]} receiveShadow><meshPhysicalMaterial color="#080a0e" roughness={0.3} metalness={0.8} clearcoat={1} /></mesh>
    </group>
  );
}

function SkierScene({ activeItem, onSelect }) {
  const { scene } = useGLTF('/mannequin.glb');
  const groupRef = useRef();

  const normalizedModel = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetScale = 2.1 / maxDim;
    clone.scale.setScalar(targetScale);
    clone.position.set(-center.x * targetScale, -center.y * targetScale, -center.z * targetScale);

    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ color: '#1b202e', roughness: 0.55, metalness: 0.3 });
      }
    });
    return clone;
  }, [scene]);

  useFrame((state) => {
    if (groupRef.current) {
      const breath = Math.sin(state.clock.elapsedTime * 1.4) * 0.015;
      const isDesktop = window.innerWidth > 768;
      const targetX = activeItem && isDesktop ? -0.65 : 0;
      const targetRotY = activeItem && isDesktop ? 0.2 : 0;

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.06);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.06);
      groupRef.current.position.y = -0.05 + breath;
    }
  });

  const Hotspot = ({ pos, id, side = 'right' }) => (
    <Html position={pos} center zIndexRange={[50, 0]}>
      <div className="hotspot-anchor">
        <div
          className={`hotspot-container ${side} ${activeItem === id ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onSelect(activeItem === id ? null : id); }}
          onMouseEnter={() => document.body.classList.add('cursor-hovering')}
          onMouseLeave={() => document.body.classList.remove('cursor-hovering')}
        >
          <div className="hotspot-dot" />
          <div className="hotspot-line" />
          <div className="hotspot-tag">{DATA[id].title}</div>
        </div>
      </div>
    </Html>
  );

  return (
    <group ref={groupRef}>
      {/* Il modello originale resta, inclusi gli sci e le sbavature AI. Gli affianchiamo gli sci perfetti. */}
      <primitive object={normalizedModel} />
      <PerfectSkis />

      {/* Hotspots alternati e puliti */}
      <Hotspot pos={[0.08, 0.88, 0.1]} id="casco" side="right" />
      <Hotspot pos={[-0.1, 0.78, 0.12]} id="maschera_outof" side="left" />
      <Hotspot pos={[0.12, 0.72, 0.08]} id="maschera_audio" side="right" />
      <Hotspot pos={[-0.16, 0.35, 0.12]} id="termoregolazione" side="left" />
      <Hotspot pos={[0.3, 0.05, 0.15]} id="guanti" side="right" />
      <Hotspot pos={[-0.14, -0.35, 0.12]} id="protezioni" side="left" />
      <Hotspot pos={[0.16, -0.68, 0.1]} id="scarpone" side="right" />
      <Hotspot pos={[-0.15, -0.92, -0.05]} id="attacchi" side="left" />
      <Hotspot pos={[0.18, -0.84, 0.05]} id="telemetria" side="right" />
      <Hotspot pos={[-0.15, -0.96, 0.6]} id="sci" side="left" />
    </group>
  );
}

useGLTF.preload('/mannequin.glb');

export default function App() {
  const [activeMacro, setActiveMacro] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  // Stati Simulatori Typeform
  const [dinW, setDinW] = useState(75);
  const [dinType, setDinType] = useState(2);
  
  const [quizTerrain, setQuizTerrain] = useState('pista');
  const [quizLevel, setQuizLevel] = useState('intermedio');
  const [quizBudget, setQuizBudget] = useState('medio');

  useEffect(() => {
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let trailingX = mouseX, trailingY = mouseY;
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    const onMove = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('mousemove', onMove);

    let raf;
    const render = () => {
      trailingX += (mouseX - trailingX) * 0.16; trailingY += (mouseY - trailingY) * 0.16;
      if (dot) dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      if (ring) ring.style.transform = `translate3d(${trailingX}px, ${trailingY}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  const itemsToRender = activeItem ? [activeItem] : (activeMacro ? MACROS.find(m => m.id === activeMacro)?.items : []);
  const isPanelOpen = itemsToRender.length > 0;

  return (
    <>
      <div className="cursor-dot" />
      <div className="cursor-ring" />
      <div className="studio-canvas" />
      <div className="noise-film" />

      <header className={`brand-header ${isPanelOpen ? 'hidden' : ''}`}>
        <span className="kicker">SAS Academy — Andrea, Marco, Gianluca ed Emma</span>
        <h1>Innovazione<br/>Sci 2026</h1>
      </header>

      <div style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4.4], fov: 45 }} onPointerMissed={() => { setActiveItem(null); setActiveMacro(null); }}>
          <ambientLight intensity={1.6} />
          <directionalLight position={[3, 5, 4]} intensity={2.2} color="#ffffff" />
          <directionalLight position={[-4, 2, -2]} intensity={1.6} color="#00e5ff" />
          <Environment preset="city" />

          <SkierScene activeItem={activeItem || activeMacro} onSelect={(id) => { setActiveItem(id); setActiveMacro(null); }} />

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            autoRotate={!isPanelOpen}
            autoRotateSpeed={0.4}
            minDistance={3.0}
            maxDistance={6.0}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.8}
          />
          <EffectComposer>
            <Bloom luminanceThreshold={0.85} intensity={0.7} mipmapBlur />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Menu Macro Desktop */}
      <nav className={`macro-dock ${isPanelOpen ? 'hidden' : ''}`}>
        {MACROS.map((m) => (
          <button
            key={m.id}
            className="macro-btn"
            onClick={() => setActiveMacro(m.id)}
            onMouseEnter={() => document.body.classList.add('cursor-hovering')}
            onMouseLeave={() => document.body.classList.remove('cursor-hovering')}
          >
            {m.label}
          </button>
        ))}
      </nav>

      {/* Pannello Laterale */}
      <aside className={`side-panel ${isPanelOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => { setActiveItem(null); setActiveMacro(null); }}>
          ✕ Chiudi esplorazione
        </button>

        {activeMacro && !activeItem && <h2 className="macro-title">{MACROS.find(m => m.id === activeMacro).label}</h2>}

        {itemsToRender.map(itemId => {
          const data = DATA[itemId];
          if (!data) return null;
          return (
            <div key={itemId} className="item-card">
              <div className="item-header">
                <h3 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>{data.title}</h3>
                <a href={data.url} target="_blank" rel="noreferrer" className="brand-link">{data.brand}</a>
              </div>

              <ul style={{ marginTop: '20px', listStyle: 'none', color: '#fff', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {data.novita.map((n, i) => (
                  <li key={i} style={{ marginBottom: '10px', position: 'relative', paddingLeft: '15px' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--text-secondary)' }}>—</span> {n}
                  </li>
                ))}
              </ul>

              <details open>
                <summary>Cos’è, Cosa fa & Consigli</summary>
                <div className="details-content">
                  <p><strong>Cos’è:</strong> {data.info}</p>
                  <p style={{ marginTop: '10px' }}><strong>Per chi è:</strong> {data.consiglio}</p>
                </div>
              </details>

              {/* SIMULATORE 1: ATTACCHI DIN */}
              {data.id === 'attacchi' && (
                <div className="typeform-module">
                  <div className="tf-slider-group">
                    <div className="tf-slider-header"><label>Peso (kg)</label><span>{dinW} kg</span></div>
                    <input type="range" min="40" max="110" value={dinW} onChange={(e) => setDinW(Number(e.target.value))} />
                  </div>
                  <div className="tf-choice-grid">
                    <div className={`tf-choice-btn ${dinType === 1 ? 'active' : ''}`} onClick={() => setDinType(1)}><span>1</span><small>Prudente</small></div>
                    <div className={`tf-choice-btn ${dinType === 2 ? 'active' : ''}`} onClick={() => setDinType(2)}><span>2</span><small>Intermedio</small></div>
                    <div className={`tf-choice-btn ${dinType === 3 ? 'active' : ''}`} onClick={() => setDinType(3)}><span>3</span><small>Aggressivo</small></div>
                  </div>
                  <div className="tf-result"><p>Valore DIN Sicuro</p><h3 style={{ fontSize: '2.5rem', color: 'var(--accent-gold)' }}>{calcDIN(dinW, dinType)}</h3></div>
                </div>
              )}

              {/* SIMULATORE 2: TROVA IL TUO SCI */}
              {data.id === 'sci' && (
                <div className="typeform-module">
                  <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', marginBottom: '15px' }}>Quiz: Trova il tuo Sci</h4>
                  
                  <div className="tf-slider-group">
                    <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Terreno Preferito</label>
                    <div className="tf-choice-grid">
                      <div className={`tf-choice-btn ${quizTerrain === 'pista' ? 'active' : ''}`} onClick={() => setQuizTerrain('pista')}><span>Pista</span><small>Battuta</small></div>
                      <div className={`tf-choice-btn ${quizTerrain === 'allmountain' ? 'active' : ''}`} onClick={() => setQuizTerrain('allmountain')}><span>Mix</span><small>All-Mount</small></div>
                      <div className={`tf-choice-btn ${quizTerrain === 'fuoripista' ? 'active' : ''}`} onClick={() => setQuizTerrain('fuoripista')}><span>Powder</span><small>Freeride</small></div>
                    </div>
                  </div>

                  <div className="tf-slider-group">
                    <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Livello di Sciata</label>
                    <div className="tf-choice-grid">
                      <div className={`tf-choice-btn ${quizLevel === 'principiante' ? 'active' : ''}`} onClick={() => setQuizLevel('principiante')}><span>Base</span><small>L1-L3</small></div>
                      <div className={`tf-choice-btn ${quizLevel === 'intermedio' ? 'active' : ''}`} onClick={() => setQuizLevel('intermedio')}><span>Evoluto</span><small>L4-L5</small></div>
                      <div className={`tf-choice-btn ${quizLevel === 'esperto' ? 'active' : ''}`} onClick={() => setQuizLevel('esperto')}><span>Pro</span><small>L6-L7</small></div>
                    </div>
                  </div>

                  <div className="tf-slider-group">
                    <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Giorni sci all'anno (Budget)</label>
                    <div className="tf-choice-grid">
                      <div className={`tf-choice-btn ${quizBudget === 'basso' ? 'active' : ''}`} onClick={() => setQuizBudget('basso')}><span>&lt;7</span><small>Noleggio</small></div>
                      <div className={`tf-choice-btn ${quizBudget === 'medio' ? 'active' : ''}`} onClick={() => setQuizBudget('medio')}><span>7-15</span><small>Medio</small></div>
                      <div className={`tf-choice-btn ${quizBudget === 'alto' ? 'active' : ''}`} onClick={() => setQuizBudget('alto')}><span>15+</span><small>Custom</small></div>
                    </div>
                  </div>

                  <div className="tf-result">
                    <p>Tipologia Consigliata</p>
                    <h3 style={{ fontSize: '1.5rem', color: '#fff', lineHeight: 1.3, marginTop: '10px' }}>
                      {recommendSki(quizTerrain, quizLevel, quizBudget)}
                    </h3>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </aside>
    </>
  );
}