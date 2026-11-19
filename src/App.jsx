import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import './index.css';

const DATA = {
  maschera_outof: {
    id: 'maschera_outof',
    title: 'Out Of Electra 3',
    brand: 'Visita Out Of ↗',
    url: 'https://out-of.com',
    novita: ['Lente elettronica IRID a cella solare (zero batterie)', 'Adattamento istantaneo S1–S3 in meno di 1 secondo'],
    info: 'Una lente attiva che si scurisce o schiarisce in meno di 1 secondo catturando l’energia del sole, senza batterie da ricaricare.',
    consiglio: 'Consigliata per Maestri ed Esperti (L6+) che passano continuamente da boschi in ombra a piste assolate.'
  },
  maschera_audio: {
    id: 'maschera_audio',
    title: 'Sound BRKR',
    brand: 'Visita IceBRKR ↗',
    url: 'https://www.icebrkr.com/',
    novita: ['Conduzione ossea integrata nella montatura', 'Comunicazione Mesh Bluetooth multi-utente'],
    info: 'Trasmette l’audio tramite micro-vibrazioni sulle ossa craniche, lasciando le orecchie completamente libere per percepire i rumori della pista.',
    consiglio: 'Ideale per Maestri in didattica o gruppi freeride per comunicare in tempo reale senza isolarsi dall’ambiente.'
  },
  termoregolazione: {
    id: 'termoregolazione',
    title: 'Termoregolazione',
    brand: 'Scopri ISPO & Aerogel ↗',
    url: 'https://www.ispo.com',
    novita: ['Isolamento spaziale in Aerogel a spessore ultra-ridotto', 'Calzini e layer riscaldati attivamente'],
    info: 'L’aerogel intrappola l’aria impedendo la dispersione termica pur mantenendo libertà di movimento. I calzini riscaldati si gestiscono via app.',
    consiglio: 'Per il principiante basta un buon 10k. L’Aerogel è fondamentale per il Maestro che alterna dimostrazioni a lunghe soste al gelo.'
  },
  scarpone: {
    id: 'scarpone',
    title: 'Fit & Calzata BOA',
    brand: 'BOA Fit System ↗',
    url: 'https://www.boafit.com',
    novita: ['Chiusura BOA Dial sullo scafo inferiore per avvolgimento a 360°', 'Memoria meccanica della tensione (Kästle RYF)'],
    info: 'Sostituisce i ganci bassi con un cavo in acciaio micro-regolabile per avvolgere il piede in modo uniforme senza punti di pressione.',
    consiglio: 'Ottimo per l’Amatore Evoluto. Il Maestro lo apprezza per allentare e richiudere lo scafo al volo in seggiovia.'
  },
  attacchi: {
    id: 'attacchi',
    title: 'Sicurezza LCA',
    brand: 'Tyrolia Protector ↗',
    url: 'https://www.tyrolia.com',
    novita: ['Sgancio laterale intelligente della talloniera', 'Riduzione dei traumi torsionali al legamento crociato'],
    info: 'A differenza degli attacchi tradizionali, la talloniera ruota anche lateralmente nelle cadute all’indietro, scaricando le forze sul ginocchio.',
    consiglio: 'Indicato per tutti i livelli: riduce drasticamente il rischio di lesione al crociato anteriore (LCA).'
  },
  telemetria: {
    id: 'telemetria',
    title: 'Telemetria IA',
    brand: 'Scopri Carv 2 ↗',
    url: 'https://getcarv.com',
    novita: ['Sensori inerziali Carv 2 per angolo di spigolo e pressione', 'Solette Moticon OpenGo & video-analisi IA (Dartfish, EDGIN)'],
    info: 'L’IA misura in tempo reale angolazione, parallelismo e distribuzione dei carichi, offrendo un coaching vocale immediato in cuffia.',
    consiglio: 'Strumento ideale per l’Intermedio/Evoluto e per il Maestro che vuole mostrare dati oggettivi all’allievo.'
  }
};

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

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({ color: '#161924', roughness: 0.6, metalness: 0.3 });
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (groupRef.current) {
      const breath = Math.sin(state.clock.elapsedTime * 1.5) * 0.015;
      const targetX = activeItem && window.innerWidth > 768 ? -0.45 : 0;
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.06);
      groupRef.current.position.y = -1.2 + breath;
    }
  });

  const Hotspot = ({ pos, id }) => (
    <Html position={pos} center zIndexRange={[50, 0]}>
      <div
        className={`hotspot-container ${activeItem === id ? 'active' : ''}`}
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
    </Html>
  );

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.8} position={[0, -0.6, 0]} />
      <Hotspot pos={[0.12, 1.68, 0.1]} id="maschera_outof" />
      <Hotspot pos={[-0.14, 1.5, 0.1]} id="maschera_audio" />
      <Hotspot pos={[0.2, 0.98, 0.1]} id="termoregolazione" />
      <Hotspot pos={[0.16, -0.68, 0.1]} id="scarpone" />
      <Hotspot pos={[-0.16, -0.9, -0.05]} id="attacchi" />
      <Hotspot pos={[0.22, -0.86, 0.05]} id="telemetria" />
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
      trailingX += (mouseX - trailingX) * 0.15;
      trailingY += (mouseY - trailingY) * 0.15;
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

      <header className={`brand-header ${activeItem ? 'hidden' : ''}`}>
        <span className="kicker">SAS Academy — Gruppo 1</span>
        <h1>
          Innovazione
          <br />
          Sci 2026
        </h1>
      </header>

      <div style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4.6], fov: 48 }} onPointerMissed={() => setActiveItem(null)}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[2, 5, 4]} intensity={2.5} color="#ffffff" />
          <directionalLight position={[-4, 2, -2]} intensity={1.5} color="#00e5ff" />
          <Environment preset="city" />

          <SkierModel activeItem={activeItem} onSelect={setActiveItem} />

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            autoRotate={!activeItem}
            autoRotateSpeed={0.5}
            minDistance={3.2}
            maxDistance={6.2}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.9}
          />
          <EffectComposer>
            <Bloom luminanceThreshold={0.8} intensity={0.8} mipmapBlur />
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
            <h3 style={{ fontSize: '2rem', marginBottom: '10px' }}>{data.title}</h3>
            <a href={data.url} target="_blank" rel="noreferrer" className="brand-link">
              {data.brand}
            </a>

            <ul style={{ marginTop: '25px', listStyle: 'none', color: '#fff', fontSize: '1rem', lineHeight: '1.6' }}>
              {data.novita.map((n, i) => (
                <li key={i} style={{ marginBottom: '10px' }}>
                  — {n}
                </li>
              ))}
            </ul>

            <details>
              <summary>Cos’è, Cosa fa & Consigli</summary>
              <div className="details-content">
                <p>
                  <strong>Cos’è:</strong> {data.info}
                </p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Consiglio d’uso:</strong> {data.consiglio}
                </p>
              </div>
            </details>

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
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', lineHeight: 1.4 }}>{calcLayering(temp)}</h3>
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
                  <h3 style={{ fontSize: '1.4rem', color: '#00e5ff' }}>{calcLens(weather)}</h3>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}