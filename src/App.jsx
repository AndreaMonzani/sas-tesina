import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import './index.css';

const DATA = {
  maschera_outof: {
    id: 'maschera_outof',
    title: 'Out Of — Ottica IRID',
    brand: 'Visita Out Of ↗',
    url: 'https://out-of.com',
    novita: [
      'Lente elettronica IRID alimentata a cella solare (zero batterie da ricaricare)',
      'Adattamento istantaneo continuo tra categoria S1 e S3 in meno di 1 secondo'
    ],
    info: 'A differenza delle tradizionali lenti fotocromatiche che impiegano decine di secondi a reagire al freddo, la tecnologia elettronica IRID legge la luce ambientale e modifica la tinta in tempo reale.',
    consiglio:
      'Ideale per chiunque — dal principiante allo sciatore giornaliero fino al maestro — perché elimina il pensiero di dover cambiare lente o togliere la maschera quando cambia il meteo o si entra nel bosco.'
  },
  maschera_audio: {
    id: 'maschera_audio',
    title: 'Sound BRKR',
    brand: 'Visita IceBRKR ↗',
    url: 'https://www.icebrkr.com',
    novita: [
      'Trasduttori a conduzione ossea integrati nella montatura',
      'Interfono Mesh Bluetooth multi-utente e chiamate a mani libere'
    ],
    info: 'Trasmette il suono attraverso micro-vibrazioni sugli zigomi direttamente all’orecchio interno, lasciando le orecchie completamente libere di percepire i rumori della pista e gli altri sciatori.',
    consiglio:
      'Perfetta per la didattica in pista, per sciare in famiglia o con amici e per restare sempre connessi in sicurezza senza isolarsi dall’ambiente esterno.'
  },
  termoregolazione: {
    id: 'termoregolazione',
    title: 'Termoregolazione',
    brand: 'Scopri ISPO & Aerogel ↗',
    url: 'https://www.ispo.com',
    novita: [
      'Isolamento termico in Aerogel (derivazione aerospaziale a spessore minimo)',
      'Tessuti a cambiamento di fase (PCM) e calzini/layer riscaldati attivamente'
    ],
    info: 'L’Aerogel blocca la dispersione del calore corporeo anche da fermo senza creare ingombro, mentre i tessuti intelligenti bilanciano sudorazione in discesa e freddo in risalita.',
    consiglio:
      'Ottimo anche per chi soffre il freddo in seggiovia o scia saltuariamente; indispensabile per chi passa 6–8 ore consecutive sulla neve.'
  },
  scarpone: {
    id: 'scarpone',
    title: 'Fit & Calzata',
    brand: 'Scopri BOA Fit System ↗',
    url: 'https://www.boafit.com',
    novita: [
      'Chiusura BOA Dial sullo scafo inferiore per avvolgimento uniforme a 360°',
      'Termoformatura personalizzata di scarpetta e scafo in 10–15 minuti',
      'Memoria meccanica della tensione di chiusura (Kästle RYF)'
    ],
    info: 'Lo scarpone moderno non deve più essere “soffocante” per essere preciso: la combinazione tra chiusura avvolgente e termoformatura replica l’anatomia esatta del piede.',
    consiglio:
      'La termoformatura non è un lusso da agonisti: anche uno sciatore amatoriale o principiante elimina così dolori a malleoli e collo del piede fin dalla prima sciata.'
  },
  attacchi: {
    id: 'attacchi',
    title: 'Sicurezza LCA',
    brand: 'Visita Tyrolia ↗',
    url: 'https://www.tyrolia.com',
    novita: [
      'Talloniera con sgancio laterale intelligente (linea Protector)',
      'Riduzione delle forze torsionali sul legamento crociato anteriore (LCA)'
    ],
    info: 'Nelle cadute torsionali all’indietro, la talloniera ruota lateralmente accompagnando lo scarpone anziché bloccarlo, scaricando lo stress meccanico dal ginocchio.',
    consiglio:
      'Consigliato a tutti i livelli — dal principiante allo sciatore esperto — per aumentare in modo concreto la sicurezza articolare.'
  },
  telemetria: {
    id: 'telemetria',
    title: 'Telemetria IA',
    brand: 'Scopri Carv 2 ↗',
    url: 'https://getcarv.com',
    novita: [
      'Sensori inerziali Carv 2 con coaching vocale in tempo reale',
      'Solette sensorizzate Moticon OpenGo e video-analisi IA (Dartfish, EDGIN)'
    ],
    info: 'Analizza angolazione di spigolo, centralità e distribuzione dei carichi curva dopo curva, traducendo i dati in consigli semplici direttamente in cuffia.',
    consiglio:
      'Uno strumento intuitivo anche per l’amatore curioso di capire come migliorare il proprio parallelismo in modo divertente e oggettivo.'
  }
};

const BOOT_BRANDS = [
  {
    name: 'Salomon',
    tech: 'Custom Shell HD',
    desc: 'Scafo in Kaprolene modellabile in forno in ~10 minuti per adattarsi a malleoli e pianta larga.',
    url: 'https://www.salomon.com'
  },
  {
    name: 'Atomic',
    tech: 'Memory Fit + Mimic',
    desc: 'Termoformatura completa di scafo, gambetto e scarpetta Mimic con memoria anatomica del tallone.',
    url: 'https://www.atomic.com'
  },
  {
    name: 'Tecnica',
    tech: 'C.A.S. System',
    desc: 'Custom Adaptive Shape: scarpetta e scafo termoformabili e fresabili con micro-celle anatomiche.',
    url: 'https://www.blizzard-tecnica.com'
  },
  {
    name: 'Fischer',
    tech: 'Vacuum Fit',
    desc: 'Adattamento a pressione controllata dello scafo intero intorno alla morfologia del piede.',
    url: 'https://www.fischersports.com'
  },
  {
    name: 'BOA Fit',
    tech: 'Micro-Adjust Dial',
    desc: 'Avvolgimento uniforme dello scafo inferiore senza punti di pressione e rilascio istantaneo.',
    url: 'https://www.boafit.com'
  },
  {
    name: 'Kästle',
    tech: 'RYF Mechanical Memory',
    desc: 'Sistema con memoria meccanica della tensione per ritrovare al volo il fit calibrato.',
    url: 'https://www.kaestle.com'
  }
];

const MACROS = [
  { id: 'visione', label: 'Visione', items: ['maschera_outof', 'maschera_audio'] },
  { id: 'comfort', label: 'Comfort', items: ['termoregolazione'] },
  { id: 'setup', label: 'Assetto', items: ['scarpone', 'attacchi'] },
  { id: 'dati', label: 'Dati', items: ['telemetria'] }
];

const calcDIN = (w, type) => (Math.round((w / 10 + (type === 2 ? 1 : type === 3 ? 2.2 : 0)) * 4) / 4).toFixed(2);

const calcLayering = (temp) => {
  if (temp < -10) return 'Aerogel + Midlayer Termico + Intimo Merino + Calzini Riscaldati';
  if (temp < 0) return 'Guscio 3L + Pile Tecnico + Intimo Sintetico';
  return 'Guscio Traspirante + Intimo Leggero';
};

const calcLens = (weather) => {
  if (weather === 'sole') return 'Filtro S3 (Specchiata scura)';
  if (weather === 'nuvoloso') return 'Filtro S2 (Adattamento rapido)';
  return 'Filtro S1 (Alto contrasto nebbia/neve)';
};

function SkierModel({ activeItem, onSelect }) {
  const { scene } = useGLTF('/mannequin.glb');
  const groupRef = useRef();

  // Centratura e normalizzazione matematica assoluta tramite Box3
  const normalizedModel = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetScale = 2.15 / maxDim;
    clone.scale.setScalar(targetScale);

    // Centra esattamente su X=0, Y=0, Z=0
    clone.position.set(
      -center.x * targetScale,
      -center.y * targetScale,
      -center.z * targetScale
    );

    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#1b202e',
          roughness: 0.58,
          metalness: 0.28
        });
      }
    });

    return clone;
  }, [scene]);

  useFrame((state) => {
    if (groupRef.current) {
      const breath = Math.sin(state.clock.elapsedTime * 1.4) * 0.015;
      const isDesktop = window.innerWidth > 768;
      const targetX = activeItem && isDesktop ? -0.68 : 0;
      const targetRotY = activeItem && isDesktop ? 0.26 : 0;

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.07);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.07);
      groupRef.current.position.y = -0.05 + breath;
    }
  });

  const Hotspot = ({ pos, id, side = 'right' }) => (
    <Html position={pos} center zIndexRange={[50, 0]}>
      <div className="hotspot-anchor">
        <div
          className={`hotspot-container ${side} ${activeItem === id ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(activeItem === id ? null : id);
          }}
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
      <primitive object={normalizedModel} />

      {/* Hotspots alternati destra/sinistra perfettamente allineati al manichino centrato */}
      <Hotspot pos={[0.08, 0.86, 0.12]} id="maschera_outof" side="right" />
      <Hotspot pos={[-0.10, 0.72, 0.08]} id="maschera_audio" side="left" />
      <Hotspot pos={[0.18, 0.30, 0.12]} id="termoregolazione" side="right" />
      <Hotspot pos={[-0.14, -0.66, 0.10]} id="scarpone" side="left" />
      <Hotspot pos={[0.16, -0.78, 0.08]} id="telemetria" side="right" />
      <Hotspot pos={[-0.14, -0.94, -0.04]} id="attacchi" side="left" />
    </group>
  );
}

useGLTF.preload('/mannequin.glb');

export default function App() {
  const [activeItem, setActiveItem] = useState(null);
  const [dinW, setDinW] = useState(75);
  const [dinType, setDinType] = useState(2);
  const [temp, setTemp] = useState(-5);
  const [weather, setWeather] = useState('nuvoloso');

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let trailingX = mouseX;
    let trailingY = mouseY;
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    let raf;
    const render = () => {
      trailingX += (mouseX - trailingX) * 0.16;
      trailingY += (mouseY - trailingY) * 0.16;
      if (dot) dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      if (ring) ring.style.transform = `translate3d(${trailingX}px, ${trailingY}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const data = activeItem ? DATA[activeItem] : null;

  return (
    <>
      <div className="cursor-dot" />
      <div className="cursor-ring" />
      <div className="studio-canvas" />
      <div className="noise-film" />

      <header className={`brand-header ${activeItem ? 'hidden' : ''}`}>
        <span className="kicker">SAS Academy — Gruppo 1</span>
        <h1>
          Innovazione
          <br />
          Sci 2026
        </h1>
      </header>

      <div style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0.04, 4.3], fov: 44 }} onPointerMissed={() => setActiveItem(null)}>
          <ambientLight intensity={1.6} />
          <directionalLight position={[3, 5, 4]} intensity={2.4} color="#ffffff" />
          <directionalLight position={[-4, 2, -2]} intensity={1.6} color="#00e5ff" />
          <Environment preset="city" />

          <SkierModel activeItem={activeItem} onSelect={setActiveItem} />

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            autoRotate={!activeItem}
            autoRotateSpeed={0.45}
            minDistance={3.0}
            maxDistance={6.0}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.9}
          />
          <EffectComposer>
            <Bloom luminanceThreshold={0.85} intensity={0.75} mipmapBlur />
          </EffectComposer>
        </Canvas>
      </div>

      <nav className={`macro-dock ${activeItem ? 'hidden' : ''}`}>
        {MACROS.map((m) => (
          <button
            key={m.id}
            className="macro-btn"
            onClick={() => setActiveItem(m.items[0])}
            onMouseEnter={() => document.body.classList.add('cursor-hovering')}
            onMouseLeave={() => document.body.classList.remove('cursor-hovering')}
          >
            {m.label}
          </button>
        ))}
      </nav>

      <aside className={`side-panel ${activeItem ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setActiveItem(null)}>
          ✕ Chiudi e Ruota
        </button>

        {data && (
          <div>
            <h3 style={{ fontSize: '2.1rem', marginBottom: '10px' }}>{data.title}</h3>
            <a href={data.url} target="_blank" rel="noreferrer" className="brand-link">
              {data.brand}
            </a>

            <ul style={{ marginTop: '24px', listStyle: 'none', color: '#fff', fontSize: '0.98rem', lineHeight: '1.6' }}>
              {data.novita.map((n, i) => (
                <li key={i} style={{ marginBottom: '10px' }}>
                  — {n}
                </li>
              ))}
            </ul>

            <details open>
              <summary>Cos’è, Cosa fa & Consigli</summary>
              <div className="details-content">
                <p>
                  <strong>Cos’è:</strong> {data.info}
                </p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Per chi è:</strong> {data.consiglio}
                </p>
              </div>
            </details>

            {/* Sezione dedicata Termoformatura Scarpetta & Scafo + Brand */}
            {data.id === 'scarpone' && (
              <div className="thermo-section">
                <h4>Termoformatura Scarpetta & Scafo</h4>
                <p className="thermo-intro">
                  Riscaldando in forno dedicato sia lo <strong>scafo esterno</strong> (plastiche termoformabili) sia la{' '}
                  <strong>scarpetta interna</strong>, lo scarpone si modella direttamente sull’anatomia del piede in circa 10–15 minuti, creando spazio dove serve e avvolgendo con precisione il tallone.
                </p>
                <div className="thermo-wink">
                  <strong>Non solo per agonisti:</strong> anche chi scia pochi giorni l’anno o sta imparando ne trae un beneficio enorme — addio dolori a malleoli, pianta e collo del piede senza dover “slacciare tutto” a ogni risalita.
                </div>
                <div className="boot-brand-grid">
                  {BOOT_BRANDS.map((b) => (
                    <a key={b.name} href={b.url} target="_blank" rel="noreferrer" className="boot-brand-card">
                      <div>
                        <div className="boot-brand-top">
                          <strong>{b.name}</strong>
                          <span>↗</span>
                        </div>
                        <div className="boot-brand-tech">{b.tech}</div>
                        <p>{b.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {data.id === 'attacchi' && (
              <div className="typeform-module">
                <div className="tf-slider-group">
                  <div className="tf-slider-header">
                    <label>Peso (kg)</label>
                    <span>{dinW} kg</span>
                  </div>
                  <input type="range" min="40" max="110" value={dinW} onChange={(e) => setDinW(Number(e.target.value))} />
                </div>
                <div className="tf-choice-grid">
                  <div className={`tf-choice-btn ${dinType === 1 ? 'active' : ''}`} onClick={() => setDinType(1)}>
                    <span>1</span>
                    <small>Prudente</small>
                  </div>
                  <div className={`tf-choice-btn ${dinType === 2 ? 'active' : ''}`} onClick={() => setDinType(2)}>
                    <span>2</span>
                    <small>Intermedio</small>
                  </div>
                  <div className={`tf-choice-btn ${dinType === 3 ? 'active' : ''}`} onClick={() => setDinType(3)}>
                    <span>3</span>
                    <small>Aggressivo</small>
                  </div>
                </div>
                <div className="tf-result">
                  <p>Valore DIN Indicativo</p>
                  <h3>{calcDIN(dinW, dinType)}</h3>
                </div>
              </div>
            )}

            {data.id === 'termoregolazione' && (
              <div className="typeform-module">
                <div className="tf-slider-group">
                  <div className="tf-slider-header">
                    <label>Meteo In Pista</label>
                    <span>{temp}°C</span>
                  </div>
                  <input type="range" min="-20" max="10" value={temp} onChange={(e) => setTemp(Number(e.target.value))} />
                </div>
                <div className="tf-result">
                  <p>Layering Ideale</p>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', lineHeight: 1.4 }}>{calcLayering(temp)}</h3>
                </div>
              </div>
            )}

            {data.id.includes('maschera') && (
              <div className="typeform-module">
                <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Condizione Meteo
                </label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#111',
                    color: '#fff',
                    padding: '12px',
                    marginTop: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}
                >
                  <option value="sole">Pieno Sole</option>
                  <option value="nuvoloso">Variabile / Ombra nel bosco</option>
                  <option value="nebbia">Nebbia / Neve fitta</option>
                </select>
                <div className="tf-result">
                  <p>Categoria Lente</p>
                  <h3 style={{ fontSize: '1.35rem', color: '#00e5ff' }}>{calcLens(weather)}</h3>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}