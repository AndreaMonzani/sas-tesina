import React, { useState, useRef, useEffect, useMemo, Suspense, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useGLTF, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import InteractiveLab from './InteractiveLabs';
import LegalCompliance from './LegalCompliance';
import './index.css';

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', zIndex: 5 }}>
          Modello 3D non disponibile. Usa il menu in basso per esplorare i laboratori.
        </div>
      );
    }
    return this.props.children;
  }
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ color: '#00e5ff', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
        Caricamento {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

const MACROS = [
  { id: 'performance', label: 'Performance', items: ['sci', 'scarpone'] },
  { id: 'sicurezza', label: 'Sicurezza', items: ['casco', 'attacchi', 'bastoni'] },
  { id: 'comfort', label: 'Comfort', items: ['termoregolazione', 'guanti'] },
  { id: 'dati_visione', label: 'Visione & Dati', items: ['maschera_outof', 'maschera_audio', 'telemetria'] }
];

const DATA = {
  casco: {
    id: 'casco', macro: 'sicurezza', shortLabel: 'Caschi',
    title: 'Caschi & Protezione', brand: 'Visita Sena Snow ↗', url: 'https://www.sena.com',
    summary: 'Calotta esterna, nucleo assorbente EPS/EPP e sistemi per gli impatti obliqui (Mips, Koroyd, WaveCel) con comunicazione Mesh.'
  },
  maschera_outof: {
    id: 'maschera_outof', macro: 'dati_visione', shortLabel: 'Out Of',
    title: 'Out Of', brand: 'Visita Out Of ↗', url: 'https://out-of.com',
    summary: 'Lente elettronica IRID alimentata a cella solare che adatta la trasmissione luminosa tra S1 e S3 in meno di 1 secondo.'
  },
  maschera_audio: {
    id: 'maschera_audio', macro: 'dati_visione', shortLabel: 'Sound BRKR',
    title: 'Sound BRKR', brand: 'Visita BoneTech ↗', url: 'https://www.bonetech.it',
    summary: 'Trasduttori a conduzione ossea integrati nella montatura per comunicare in gruppo lasciando libere le orecchie.'
  },
  termoregolazione: {
    id: 'termoregolazione', macro: 'comfort', shortLabel: 'Termoregolazione',
    title: 'Termoregolazione', brand: 'Scopri ISPO & Aerogel ↗', url: 'https://www.ispo.com',
    summary: 'Isolamento PrimaLoft Heat Sphere, Polartec Alpha e membrane 20.000+ mm con cuciture nastrate e DWR.'
  },
  guanti: {
    id: 'guanti', macro: 'comfort', shortLabel: 'Guanti & Grip',
    title: 'Guanti & Grip', brand: 'Visita Leki ↗', url: 'https://www.leki.com',
    summary: 'Strati isolanti differenziati, aggancio diretto Trigger al bastone e varianti con elementi riscaldanti alimentati a batteria.'
  },
  bastoni: {
    id: 'bastoni', macro: 'sicurezza', shortLabel: 'Bastoni',
    title: 'Bastoni & Misura', brand: 'Visita Nordica Poles ↗', url: 'https://www.nordica.com',
    summary: 'Aste in alluminio o carbonio ad alto modulo, rondelle dedicate per terreno e collegamenti sganciabili guanto–impugnatura.'
  },
  scarpone: {
    id: 'scarpone', macro: 'performance', shortLabel: 'Fit & Calzata',
    title: 'Fit & Calzata', brand: 'Scopri Nordica & BOA ↗', url: 'https://www.nordica.com',
    summary: 'Avvolgimento uniforme BOA Fit System, termoformatura di scafo e scarpetta e attenzione ai volumi anatomici.'
  },
  attacchi: {
    id: 'attacchi', macro: 'sicurezza', shortLabel: 'Attacchi più sicuri',
    title: 'Attacchi più sicuri', brand: 'Visita Tyrolia ↗', url: 'https://www.tyrolia.com',
    summary: 'Bilanciamento tra ritenzione elastica e sgancio, con talloniera a rotazione laterale Tyrolia Protector e verifica norme suola.'
  },
  telemetria: {
    id: 'telemetria', macro: 'dati_visione', shortLabel: 'Telemetria IA',
    title: 'Telemetria, GPS & AI', brand: 'Scopri Carv 2 ↗', url: 'https://getcarv.com',
    summary: 'Sensori inerziali Carv 2, solette Moticon OpenGo, tracciamento atleti Lympic e pettorine GPS per bambini.'
  },
  sci: {
    id: 'sci', macro: 'performance', shortLabel: 'Sci & Struttura',
    title: 'Sci & Struttura', brand: 'Esplora Gamma Nordica ↗', url: 'https://www.nordica.com',
    summary: 'Costruzioni Double Core con Titanal, smorzamento piezoelettrico HEAD EMC e personalizzazione algoritmica ORIGINAL+.'
  }
};

function DynamicHotspot({ id, nodeName, scene, activeItem, onSelect, side = 'right' }) {
  const item = DATA[id];
  const objRef = useRef(null);

  useEffect(() => {
    if (scene) {
      objRef.current = scene.getObjectByName(nodeName);
      if (!objRef.current) {
        scene.traverse((child) => {
          if (child.name.includes(id)) {
            objRef.current = child;
          }
        });
      }
    }
  }, [scene, nodeName, id]);

  if (!item) return null;

  return objRef.current ? (
    <group position={objRef.current.position}>
      <Html center zIndexRange={[50, 0]}>
        <div className="hotspot-anchor">
          <button
            type="button"
            className={`hotspot-container ${side} ${activeItem === id ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(activeItem === id ? null : id, false);
            }}
            onMouseEnter={() => document.body.classList.add('cursor-hovering')}
            onMouseLeave={() => document.body.classList.remove('cursor-hovering')}
          >
            <span className="hotspot-dot" />
            <span className="hotspot-line" />
            <span className="hotspot-tag">{item.shortLabel}</span>
          </button>
        </div>
      </Html>
    </group>
  ) : null;
}

const StaticHotspot = ({ pos, id, side = 'right', activeItem, onSelect }) => {
  const item = DATA[id];
  if (!item) return null;
  return (
    <Html position={pos} center zIndexRange={[50, 0]}>
      <div className="hotspot-anchor">
        <button
          type="button"
          className={`hotspot-container ${side} ${activeItem === id ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(activeItem === id ? null : id, false);
          }}
          onMouseEnter={() => document.body.classList.add('cursor-hovering')}
          onMouseLeave={() => document.body.classList.remove('cursor-hovering')}
        >
          <span className="hotspot-dot" />
          <span className="hotspot-line" />
          <span className="hotspot-tag">{item.shortLabel}</span>
        </button>
      </div>
    </Html>
  );
};

function MaestroScene({ activeItem, onSelect }) {
  const { scene } = useGLTF('/maestro-sas.glb');
  const groupRef = useRef();

  const hasAnchors = useMemo(() => {
    let found = false;
    scene.traverse((child) => {
      if (child.name && child.name.includes('ANCHOR')) found = true;
    });
    return found;
  }, [scene]);

  const normalizedModel = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const targetScale = 2.1 / (size.y || 1);
    clone.scale.setScalar(targetScale);
    clone.position.set(
      -center.x * targetScale,
      -box.min.y * targetScale - 1.05,
      -center.z * targetScale
    );

    return clone;
  }, [scene]);

  useFrame((state) => {
    if (groupRef.current) {
      const breath = Math.sin(state.clock.elapsedTime * 1.4) * 0.015;
      const isDesktop = window.innerWidth > 768;
      const targetX = activeItem && isDesktop ? -0.85 : 0;
      const targetRotY = activeItem && isDesktop ? 0.25 : 0;

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.08);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.08);
      groupRef.current.position.y = -0.1 + breath;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={normalizedModel} />

      {hasAnchors ? (
        normalizedModel.children.map((child, index) => (
          <React.Fragment key={index}>
            <DynamicHotspot id="casco" nodeName="ANCHOR_casco" scene={normalizedModel} activeItem={activeItem} onSelect={onSelect} side="right" />
            <DynamicHotspot id="maschera_outof" nodeName="ANCHOR_maschera_outof" scene={normalizedModel} activeItem={activeItem} onSelect={onSelect} side="left" />
            <DynamicHotspot id="maschera_audio" nodeName="ANCHOR_maschera_audio" scene={normalizedModel} activeItem={activeItem} onSelect={onSelect} side="right" />
            <DynamicHotspot id="termoregolazione" nodeName="ANCHOR_termoregolazione" scene={normalizedModel} activeItem={activeItem} onSelect={onSelect} side="left" />
            <DynamicHotspot id="guanti" nodeName="ANCHOR_guanti" scene={normalizedModel} activeItem={activeItem} onSelect={onSelect} side="right" />
            <DynamicHotspot id="bastoni" nodeName="ANCHOR_bastoni" scene={normalizedModel} activeItem={activeItem} onSelect={onSelect} side="left" />
            <DynamicHotspot id="scarpone" nodeName="ANCHOR_scarpone" scene={normalizedModel} activeItem={activeItem} onSelect={onSelect} side="left" />
            <DynamicHotspot id="telemetria" nodeName="ANCHOR_telemetria" scene={normalizedModel} activeItem={activeItem} onSelect={onSelect} side="right" />
            <DynamicHotspot id="attacchi" nodeName="ANCHOR_attacchi" scene={normalizedModel} activeItem={activeItem} onSelect={onSelect} side="left" />
            <DynamicHotspot id="sci" nodeName="ANCHOR_sci" scene={normalizedModel} activeItem={activeItem} onSelect={onSelect} side="right" />
          </React.Fragment>
        ))
      ) : (
        <group position={[0, -1.05, 0]}>
          <StaticHotspot pos={[0.06, 1.95, 0.08]} id="casco" side="right" activeItem={activeItem} onSelect={onSelect} />
          <StaticHotspot pos={[-0.09, 1.85, 0.15]} id="maschera_outof" side="left" activeItem={activeItem} onSelect={onSelect} />
          <StaticHotspot pos={[0.11, 1.75, 0.08]} id="maschera_audio" side="right" activeItem={activeItem} onSelect={onSelect} />
          <StaticHotspot pos={[-0.2, 1.35, 0.12]} id="termoregolazione" side="left" activeItem={activeItem} onSelect={onSelect} />
          <StaticHotspot pos={[0.35, 1.0, 0.14]} id="guanti" side="right" activeItem={activeItem} onSelect={onSelect} />
          <StaticHotspot pos={[-0.35, 0.9, 0.2]} id="bastoni" side="left" activeItem={activeItem} onSelect={onSelect} />
          <StaticHotspot pos={[-0.14, 0.2, 0.10]} id="scarpone" side="left" activeItem={activeItem} onSelect={onSelect} />
          <StaticHotspot pos={[0.18, 0.1, 0.06]} id="telemetria" side="right" activeItem={activeItem} onSelect={onSelect} />
          <StaticHotspot pos={[-0.15, 0.05, 0.0]} id="attacchi" side="left" activeItem={activeItem} onSelect={onSelect} />
          <StaticHotspot pos={[0.15, 0.02, 0.60]} id="sci" side="right" activeItem={activeItem} onSelect={onSelect} />
        </group>
      )}
    </group>
  );
}

useGLTF.preload('/maestro-sas.glb');

export default function App() {
  const [activeItem, setActiveItem] = useState(null);
  const [openedFromMacro, setOpenedFromMacro] = useState(false);

  const handleSelectItem = (id, fromMacro = false) => {
    setActiveItem(id);
    setOpenedFromMacro(Boolean(id && fromMacro));
  };

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

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (!isTouch) {
      window.addEventListener('mousemove', onMove);
    }

    let raf;
    const render = () => {
      trailingX += (mouseX - trailingX) * 0.16;
      trailingY += (mouseY - trailingY) * 0.16;
      if (dot) dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      if (ring) ring.style.transform = `translate3d(${trailingX}px, ${trailingY}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(render);
    };

    if (!isTouch) raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const data = activeItem ? DATA[activeItem] : null;
  const activeMacroObj = data && openedFromMacro ? MACROS.find((m) => m.id === data.macro) : null;

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

      <SceneErrorBoundary>
        <div style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
          <Canvas dpr={Math.min(window.devicePixelRatio, 2)} camera={{ position: [0, 0.02, 4.5], fov: 44 }} onPointerMissed={() => handleSelectItem(null, false)}>
            <ambientLight intensity={1.8} />
            <directionalLight position={[4, 5, 4]} intensity={2.0} color="#ffffff" />
            <directionalLight position={[-4, 2, -2]} intensity={1.2} color="#00e5ff" />

            <Suspense fallback={null}>
              <Environment preset="city" />
            </Suspense>

            <Suspense fallback={<Loader />}>
              <MaestroScene activeItem={activeItem} onSelect={handleSelectItem} />
            </Suspense>

            <OrbitControls
              enableZoom={true}
              enablePan={false}
              autoRotate={!activeItem}
              autoRotateSpeed={0.5}
              minDistance={2.5}
              maxDistance={6.5}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.85}
              enableDamping={true}
              dampingFactor={0.05}
            />
          </Canvas>
        </div>
      </SceneErrorBoundary>

      <nav className={`macro-dock ${activeItem ? 'hidden' : ''}`} aria-label="Categorie principali">
        {MACROS.map((m) => (
          <button
            key={m.id}
            type="button"
            className="macro-btn"
            onClick={() => handleSelectItem(m.items[0], true)}
            onMouseEnter={() => document.body.classList.add('cursor-hovering')}
            onMouseLeave={() => document.body.classList.remove('cursor-hovering')}
          >
            {m.label}
          </button>
        ))}
      </nav>

      <aside className={`side-panel ${activeItem ? 'open' : ''}`} aria-label="Scheda approfondimento">
        <button type="button" className="close-btn" onClick={() => handleSelectItem(null, false)}>
          ✕ Chiudi esplorazione
        </button>

        {activeMacroObj && activeMacroObj.items.length > 1 && (
          <div className="sub-nav">
            {activeMacroObj.items.map((subId) => (
              <button
                key={subId}
                type="button"
                className={`sub-pill ${activeItem === subId ? 'active' : ''}`}
                onClick={() => handleSelectItem(subId, true)}
              >
                {DATA[subId].shortLabel}
              </button>
            ))}
          </div>
        )}

        {data && (
          <div>
            <h3 style={{ fontSize: '2.05rem', marginBottom: '6px' }}>{data.title}</h3>
            <a href={data.url} target="_blank" rel="noreferrer" className="brand-link">
              {data.brand}
            </a>

            <p style={{ marginTop: '14px', fontSize: '0.94rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)' }}>
              {data.summary}
            </p>

            <InteractiveLab itemId={data.id} />
          </div>
        )}
      </aside>

      {/* --- ECCO DOVE VA INSERITO --- */}
      <LegalCompliance isPanelOpen={Boolean(activeItem)} />
    </>
  );
}