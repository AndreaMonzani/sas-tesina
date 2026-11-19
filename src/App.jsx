import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import './index.css';

const MACROS = [
  { id: 'performance', label: 'Performance', items: ['sci', 'scarpone'] },
  { id: 'sicurezza', label: 'Sicurezza', items: ['attacchi', 'casco'] },
  { id: 'comfort', label: 'Comfort', items: ['termoregolazione', 'guanti'] },
  { id: 'dati_visione', label: 'Visione & Dati', items: ['maschera_outof', 'maschera_audio', 'telemetria'] }
];

const DATA = {
  casco: {
    id: 'casco',
    macro: 'sicurezza',
    shortLabel: 'Caschi MIPS',
    title: 'Caschi MIPS & Audio',
    brand: 'Visita Sena Snow ↗',
    url: 'https://www.sena.com',
    novita: [
      'Calotte ibride ultraleggere (Carbonio / Policarbonato)',
      'Sistema MIPS per dissipare gli impatti rotazionali obliqui',
      'Moduli audio Mesh Sena integrati per comunicazione didattica'
    ],
    info: 'La calotta interna a basso attrito (MIPS) permette un micro-scorrimento di 10–15 mm nell’impatto angolato, riducendo lo stress rotazionale sul cervello.',
    consiglio: 'Fondamentale per tutti i livelli; per il Maestro l’audio integrato Sena permette di correggere l’allievo in tempo reale senza urlare in pista.'
  },
  maschera_outof: {
    id: 'maschera_outof',
    macro: 'dati_visione',
    shortLabel: 'Ottica IRID',
    title: 'Out Of — Ottica IRID',
    brand: 'Visita Out Of ↗',
    url: 'https://out-of.com',
    novita: [
      'Lente elettronica IRID alimentata a cella solare (zero batterie)',
      'Adattamento istantaneo continuo tra S1 e S3 in meno di 1 secondo'
    ],
    info: 'Un micro-chip solare legge la luminosità ambientale e regola la tinta della lente in tempo reale, superando i limiti delle lenti fotocromatiche tradizionali.',
    consiglio: 'Ideale per tutti — dal principiante allo sciatore occasionale fino al maestro — perché evita di dover cambiare lente o togliere la maschera tra sole, bosco e nebbia.'
  },
  maschera_audio: {
    id: 'maschera_audio',
    macro: 'dati_visione',
    shortLabel: 'Sound BRKR',
    title: 'Sound BRKR',
    brand: 'Visita BoneTech ↗',
    url: 'https://www.bonetech.it',
    novita: [
      'Trasduttori a conduzione ossea integrati nella montatura',
      'Interfono Mesh multi-utente e chiamate a mani libere'
    ],
    info: 'Trasmette il suono attraverso micro-vibrazioni sugli zigomi direttamente all’orecchio interno, lasciando le orecchie completamente libere.',
    consiglio: 'Perfetta per la didattica, per sciare in famiglia o in gruppo e per sentire sempre gli altri sciatori che sopraggiungono.'
  },
  termoregolazione: {
    id: 'termoregolazione',
    macro: 'comfort',
    shortLabel: 'Termoregolazione',
    title: 'Termoregolazione',
    brand: 'Scopri ISPO & Aerogel ↗',
    url: 'https://www.ispo.com',
    novita: [
      'Isolamento spaziale in Aerogel a spessore ultra-ridotto',
      'Sistemi di riscaldamento attivo Heat Sphere e calzini termici'
    ],
    info: 'L’Aerogel blocca la dispersione del calore corporeo senza creare ingombro, mentre Heat Sphere distribuisce calore attivo controllabile in modo uniforme.',
    consiglio: 'Ottimo anche per chi soffre il freddo in seggiovia; indispensabile per chi passa 6–8 ore consecutive sulla neve alternando movimento e soste.'
  },
  guanti: {
    id: 'guanti',
    macro: 'comfort',
    shortLabel: 'Guanti & Grip',
    title: 'Guanti & Grip Tech',
    brand: 'Visita Leki ↗',
    url: 'https://www.leki.com',
    novita: [
      'Aggancio rapido diretto guanto-bastone (sistema Trigger)',
      'Elementi riscaldanti sottili su dorso e dita con batterie integrate'
    ],
    info: 'Il loop integrato nel guanto si aggancia direttamente all’impugnatura del bastone eliminando il lacciolo tradizionale e sganciandosi automaticamente in caso di caduta.',
    consiglio: 'Ideale per prevenire infortuni al pollice dello sciatore e mantenere le mani calde nelle giornate più rigide.'
  },
  scarpone: {
    id: 'scarpone',
    macro: 'performance',
    shortLabel: 'Fit & Calzata',
    title: 'Fit & Calzata',
    brand: 'Scopri BOA Fit ↗',
    url: 'https://www.boafit.com',
    novita: [
      'Chiusura BOA Dial sullo scafo inferiore per avvolgimento a 360°',
      'Termoformatura personalizzata di scarpetta e scafo in 10–15 minuti',
      'Memoria meccanica della tensione di chiusura (Kästle RYF)'
    ],
    info: 'La combinazione tra chiusure micro-regolabili e plastiche termoformabili permette di adattare lo scarpone alla morfologia esatta del piede.',
    consiglio: 'Anche per i non professionisti la termoformatura fa la differenza: elimina punti di pressione su malleoli e collo del piede fin dalla prima discesa.'
  },
  attacchi: {
    id: 'attacchi',
    macro: 'sicurezza',
    shortLabel: 'Attacchi più sicuri',
    title: 'Attacchi più sicuri',
    brand: 'Visita Tyrolia ↗',
    url: 'https://www.tyrolia.com',
    novita: [
      'Talloniera con sgancio laterale intelligente (linea Protector)',
      'Riduzione fino al 50% dei carichi torsionali sul crociato (LCA)'
    ],
    info: 'Nelle cadute torsionali all’indietro, la talloniera ruota lateralmente accompagnando lo scarpone anziché bloccarlo, scaricando le forze dal ginocchio.',
    consiglio: 'Consigliato a tutti i livelli — dal principiante allo sciatore esperto — per proteggere il ginocchio anche a bassa velocità.'
  },
  telemetria: {
    id: 'telemetria',
    macro: 'dati_visione',
    shortLabel: 'Telemetria IA',
    title: 'Telemetria & AI',
    brand: 'Scopri Carv 2 ↗',
    url: 'https://getcarv.com',
    novita: [
      'Sensori inerziali Carv 2 con coaching vocale in tempo reale',
      'Solette sensorizzate Moticon OpenGo & video-analisi IA (Dartfish, EDGIN)'
    ],
    info: 'Misura angolazione di spigolo, centralità e distribuzione delle pressioni plantari, traducendo i dati in feedback immediati e oggettivi.',
    consiglio: 'Utile anche all’amatore curioso per capire i propri movimenti curva dopo curva in modo intuitivo.'
  },
  sci: {
    id: 'sci',
    macro: 'performance',
    shortLabel: 'Sci & Struttura',
    title: 'Sci & Struttura',
    brand: 'Scopri ORIGINAL+ ↗',
    url: 'https://www.original.plus',
    novita: [
      'Costruzione algoritmica su misura (ORIGINAL+ Custom 6X / Wagner)',
      'Smorzamento piezoelettrico (HEAD EMC) e risposta variabile (Renoun VibeStop)',
      'Ricerca: Smart Ski Experience (Rossignol/CEA) che genera energia sciando'
    ],
    info: 'Gli sci moderni integrano circuiti piezoelettrici e polimeri intelligenti per assorbire le vibrazioni sul duro o vengono progettati via algoritmo su peso e stile.',
    consiglio: 'Usa il selettore qui sotto per individuare la macro-categoria di sci più adatta al tuo utilizzo.'
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

const calcDIN = (w, type) => (Math.round((w / 10 + (type === 2 ? 1 : type === 3 ? 2.2 : 0)) * 4) / 4).toFixed(2);

const recommendSki = (terrain, level, budget) => {
  if (level === 'principiante') return 'All-Round Entry Level (Rocker facilitante e flex morbido)';
  if (terrain === 'fuoripista') return 'Freeride / Backcountry (Centro 95–105 mm, anima leggera)';
  if (level === 'esperto' && terrain === 'pista') {
    if (budget === 'alto') return 'Race Carve / Custom Algoritmico (ORIGINAL+ / HEAD EMC)';
    return 'All-Mountain Performance (Struttura Titanal + smorzamento attivo)';
  }
  return 'All-Mountain Polivalente (Raggio 14–16 m, centro 76–84 mm)';
};

function PerfectSkis() {
  const geom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.044, -0.88);
    shape.quadraticCurveTo(-0.03, 0, -0.048, 0.86);
    shape.quadraticCurveTo(0, 1.0, 0.048, 0.86);
    shape.quadraticCurveTo(0.03, 0, 0.044, -0.88);
    shape.quadraticCurveTo(0, -0.93, -0.044, -0.88);
    const extrude = new THREE.ExtrudeGeometry(shape, {
      depth: 0.009,
      bevelEnabled: true,
      bevelSize: 0.002,
      bevelThickness: 0.002,
      bevelSegments: 3
    });
    extrude.rotateX(-Math.PI / 2);
    return extrude;
  }, []);

  return (
    <group position={[0, -1.04, 0.05]}>
      <mesh geometry={geom} position={[-0.15, 0, 0]} receiveShadow>
        <meshPhysicalMaterial color="#090c12" roughness={0.25} metalness={0.85} clearcoat={0.9} />
      </mesh>
      <mesh geometry={geom} position={[0.15, 0, 0]} receiveShadow>
        <meshPhysicalMaterial color="#090c12" roughness={0.25} metalness={0.85} clearcoat={0.9} />
      </mesh>
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
    clone.position.set(
      -center.x * targetScale,
      -center.y * targetScale,
      -center.z * targetScale
    );

    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#1b202e',
          roughness: 0.56,
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
      const targetRotY = activeItem && isDesktop ? 0.24 : 0;

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.07);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.07);
      groupRef.current.position.y = -0.04 + breath;
    }
  });

  const Hotspot = ({ pos, id, side = 'right' }) => {
    const item = DATA[id];
    if (!item) return null;
    return (
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
            <div className="hotspot-tag">{item.shortLabel}</div>
          </div>
        </div>
      </Html>
    );
  };

  return (
    <group ref={groupRef}>
      <primitive object={normalizedModel} />
      <PerfectSkis />

      <Hotspot pos={[0.08, 0.90, 0.10]} id="casco" side="right" />
      <Hotspot pos={[-0.10, 0.80, 0.12]} id="maschera_outof" side="left" />
      <Hotspot pos={[0.12, 0.72, 0.08]} id="maschera_audio" side="right" />
      <Hotspot pos={[-0.16, 0.34, 0.12]} id="termoregolazione" side="left" />
      <Hotspot pos={[0.30, 0.04, 0.14]} id="guanti" side="right" />
      <Hotspot pos={[-0.14, -0.66, 0.10]} id="scarpone" side="left" />
      <Hotspot pos={[0.18, -0.80, 0.06]} id="telemetria" side="right" />
      <Hotspot pos={[-0.15, -0.94, -0.05]} id="attacchi" side="left" />
      <Hotspot pos={[0.15, -1.00, 0.60]} id="sci" side="right" />
    </group>
  );
}

useGLTF.preload('/mannequin.glb');

export default function App() {
  const [activeItem, setActiveItem] = useState(null);
  const [dinW, setDinW] = useState(75);
  const [dinType, setDinType] = useState(2);

  const [quizTerrain, setQuizTerrain] = useState('pista');
  const [quizLevel, setQuizLevel] = useState('intermedio');
  const [quizBudget, setQuizBudget] = useState('medio');

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
  const activeMacroObj = data ? MACROS.find((m) => m.id === data.macro) : null;

  return (
    <>
      <div className="cursor-dot" />
      <div className="cursor-ring" />
      <div className="studio-canvas" />
      <div className="noise-film" />

      <header className={`brand-header ${activeItem ? 'hidden' : ''}`}>
        <span className="kicker">SAS Academy — Andrea, Marco, Gianluca ed Emma</span>
        <h1>
          Innovazione
          <br />
          Sci 2026
        </h1>
      </header>

      <div style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0.02, 4.35], fov: 44 }} onPointerMissed={() => setActiveItem(null)}>
          <ambientLight intensity={1.65} />
          <directionalLight position={[3, 5, 4]} intensity={2.3} color="#ffffff" />
          <directionalLight position={[-4, 2, -2]} intensity={1.6} color="#00e5ff" />
          <Environment preset="city" />

          <Suspense fallback={null}>
            <SkierScene activeItem={activeItem} onSelect={setActiveItem} />
          </Suspense>

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            autoRotate={!activeItem}
            autoRotateSpeed={0.4}
            minDistance={3.0}
            maxDistance={6.0}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.85}
          />
        </Canvas>
      </div>

      {/* Menu Macro Desktop (Max 4) */}
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

      {/* Pannello Laterale */}
      <aside className={`side-panel ${activeItem ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setActiveItem(null)}>
          ✕ Chiudi esplorazione
        </button>

        {activeMacroObj && activeMacroObj.items.length > 1 && (
          <div className="sub-nav">
            {activeMacroObj.items.map((subId) => (
              <button
                key={subId}
                className={`sub-pill ${activeItem === subId ? 'active' : ''}`}
                onClick={() => setActiveItem(subId)}
              >
                {DATA[subId].shortLabel}
              </button>
            ))}
          </div>
        )}

        {data && (
          <div>
            <h3 style={{ fontSize: '2.1rem', marginBottom: '8px' }}>{data.title}</h3>
            <a href={data.url} target="_blank" rel="noreferrer" className="brand-link">
              {data.brand}
            </a>

            <ul style={{ marginTop: '22px', listStyle: 'none', color: '#fff', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {data.novita.map((n, i) => (
                <li key={i} style={{ marginBottom: '10px', position: 'relative', paddingLeft: '16px' }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--text-secondary)' }}>—</span> {n}
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
                  <strong>Non solo per professionisti:</strong> anche chi scia pochi giorni l’anno o sta imparando elimina così dolori a malleoli, pianta e collo del piede fin dalla prima discesa.
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

            {/* Simulatore DIN */}
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

            {/* Quiz Trova lo Sci */}
            {data.id === 'sci' && (
              <div className="typeform-module">
                <h4 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent-cyan)', marginBottom: '16px' }}>
                  Consigliatore Sci
                </h4>

                <div className="tf-slider-group">
                  <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    Terreno di utilizzo
                  </label>
                  <div className="tf-choice-grid">
                    <div className={`tf-choice-btn ${quizTerrain === 'pista' ? 'active' : ''}`} onClick={() => setQuizTerrain('pista')}>
                      <span>Pista</span>
                      <small>Battuta</small>
                    </div>
                    <div className={`tf-choice-btn ${quizTerrain === 'allmountain' ? 'active' : ''}`} onClick={() => setQuizTerrain('allmountain')}>
                      <span>Mix</span>
                      <small>All-Mount</small>
                    </div>
                    <div className={`tf-choice-btn ${quizTerrain === 'fuoripista' ? 'active' : ''}`} onClick={() => setQuizTerrain('fuoripista')}>
                      <span>Powder</span>
                      <small>Freeride</small>
                    </div>
                  </div>
                </div>

                <div className="tf-slider-group">
                  <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    Livello di sciata
                  </label>
                  <div className="tf-choice-grid">
                    <div className={`tf-choice-btn ${quizLevel === 'principiante' ? 'active' : ''}`} onClick={() => setQuizLevel('principiante')}>
                      <span>Base</span>
                      <small>L1–L3</small>
                    </div>
                    <div className={`tf-choice-btn ${quizLevel === 'intermedio' ? 'active' : ''}`} onClick={() => setQuizLevel('intermedio')}>
                      <span>Evoluto</span>
                      <small>L4–L5</small>
                    </div>
                    <div className={`tf-choice-btn ${quizLevel === 'esperto' ? 'active' : ''}`} onClick={() => setQuizLevel('esperto')}>
                      <span>Pro</span>
                      <small>L6–L7</small>
                    </div>
                  </div>
                </div>

                <div className="tf-slider-group">
                  <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    Giorni all’anno (Budget)
                  </label>
                  <div className="tf-choice-grid">
                    <div className={`tf-choice-btn ${quizBudget === 'basso' ? 'active' : ''}`} onClick={() => setQuizBudget('basso')}>
                      <span>&lt;7</span>
                      <small>Base</small>
                    </div>
                    <div className={`tf-choice-btn ${quizBudget === 'medio' ? 'active' : ''}`} onClick={() => setQuizBudget('medio')}>
                      <span>7–15</span>
                      <small>Medio</small>
                    </div>
                    <div className={`tf-choice-btn ${quizBudget === 'alto' ? 'active' : ''}`} onClick={() => setQuizBudget('alto')}>
                      <span>15+</span>
                      <small>Top / Custom</small>
                    </div>
                  </div>
                </div>

                <div className="tf-result">
                  <p>Macro-Categoria Consigliata</p>
                  <h3 style={{ fontSize: '1.35rem', color: '#fff', lineHeight: 1.35, marginTop: '8px' }}>
                    {recommendSki(quizTerrain, quizLevel, quizBudget)}
                  </h3>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}