import React, { useState, useRef, useEffect, useMemo, Suspense, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import InteractiveLab from './InteractiveLabs';
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
          Usa il menu in basso per esplorare i laboratori.
        </div>
      );
    }
    return this.props.children;
  }
}

const MACROS = [
  { id: 'performance', label: 'Performance', items: ['sci', 'scarpone'] },
  { id: 'sicurezza', label: 'Sicurezza', items: ['casco', 'attacchi', 'bastoni'] },
  { id: 'comfort', label: 'Comfort', items: ['termoregolazione', 'guanti'] },
  { id: 'dati_visione', label: 'Visione & Dati', items: ['maschera_outof', 'maschera_audio', 'telemetria'] }
];

const DATA = {
  casco: {
    id: 'casco',
    macro: 'sicurezza',
    shortLabel: 'Caschi',
    title: 'Caschi & Protezione',
    brand: 'Visita Sena Snow ↗',
    url: 'https://www.sena.com',
    summary: 'Calotta esterna, nucleo assorbente EPS/EPP e sistemi per gli impatti obliqui (Mips, Koroyd, WaveCel) con comunicazione Mesh.'
  },
  maschera_outof: {
    id: 'maschera_outof',
    macro: 'dati_visione',
    shortLabel: 'Out Of',
    title: 'Out Of',
    brand: 'Visita Out Of ↗',
    url: 'https://out-of.com',
    summary: 'Lente elettronica IRID alimentata a cella solare che adatta la trasmissione luminosa tra S1 e S3 in meno di 1 secondo.'
  },
  maschera_audio: {
    id: 'maschera_audio',
    macro: 'dati_visione',
    shortLabel: 'Sound BRKR',
    title: 'Sound BRKR',
    brand: 'Visita BoneTech ↗',
    url: 'https://www.bonetech.it',
    summary: 'Trasduttori a conduzione ossea integrati nella montatura per comunicare in gruppo lasciando libere le orecchie.'
  },
  termoregolazione: {
    id: 'termoregolazione',
    macro: 'comfort',
    shortLabel: 'Termoregolazione',
    title: 'Termoregolazione',
    brand: 'Scopri ISPO & Aerogel ↗',
    url: 'https://www.ispo.com',
    summary: 'Isolamento passivo in Aerogel, riscaldamento attivo Heat Sphere e membrane 20.000+ mm con cuciture nastrate e DWR.'
  },
  guanti: {
    id: 'guanti',
    macro: 'comfort',
    shortLabel: 'Guanti & Grip',
    title: 'Guanti & Grip',
    brand: 'Visita Leki ↗',
    url: 'https://www.leki.com',
    summary: 'Strati isolanti differenziati, aggancio diretto Trigger al bastone e varianti con elementi riscaldanti alimentati a batteria.'
  },
  bastoni: {
    id: 'bastoni',
    macro: 'sicurezza',
    shortLabel: 'Bastoni',
    title: 'Bastoni & Misura',
    brand: 'Visita Nordica Poles ↗',
    url: 'https://www.nordica.com',
    summary: 'Aste in alluminio o carbonio ad alto modulo, rondelle dedicate per terreno e collegamenti sganciabili guanto–impugnatura.'
  },
  scarpone: {
    id: 'scarpone',
    macro: 'performance',
    shortLabel: 'Fit & Calzata',
    title: 'Fit & Calzata',
    brand: 'Scopri Nordica & BOA ↗',
    url: 'https://www.nordica.com',
    summary: 'Avvolgimento uniforme BOA Fit System, termoformatura di scafo e scarpetta e attenzione ai volumi anatomici.'
  },
  attacchi: {
    id: 'attacchi',
    macro: 'sicurezza',
    shortLabel: 'Attacchi più sicuri',
    title: 'Attacchi più sicuri',
    brand: 'Visita Tyrolia ↗',
    url: 'https://www.tyrolia.com',
    summary: 'Bilanciamento tra ritenzione elastica e sgancio, con talloniera a rotazione laterale Tyrolia Protector e verifica norme suola.'
  },
  telemetria: {
    id: 'telemetria',
    macro: 'dati_visione',
    shortLabel: 'Telemetria IA',
    title: 'Telemetria, GPS & AI',
    brand: 'Scopri Carv 2 ↗',
    url: 'https://getcarv.com',
    summary: 'Sensori inerziali Carv 2, solette Moticon OpenGo, tracciamento atleti Lympic e pettorine GPS per bambini.'
  },
  sci: {
    id: 'sci',
    macro: 'performance',
    shortLabel: 'Sci & Struttura',
    title: 'Sci & Struttura',
    brand: 'Esplora Gamma Nordica ↗',
    url: 'https://www.nordica.com',
    summary: 'Costruzioni Double Core con Titanal, smorzamento piezoelettrico HEAD EMC e personalizzazione algoritmica ORIGINAL+.'
  }
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
      const targetX = activeItem && isDesktop ? -0.95 : 0;
      const targetRotY = activeItem && isDesktop ? 0.28 : 0;

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

  return (
    <group ref={groupRef}>
      <primitive object={normalizedModel} />
      <PerfectSkis />

      <Hotspot pos={[0.06, 0.92, 0.08]} id="casco" side="right" />
      <Hotspot pos={[-0.09, 0.80, 0.12]} id="maschera_outof" side="left" />
      <Hotspot pos={[0.11, 0.70, 0.08]} id="maschera_audio" side="right" />
      <Hotspot pos={[-0.16, 0.34, 0.12]} id="termoregolazione" side="left" />
      <Hotspot pos={[0.30, 0.06, 0.14]} id="guanti" side="right" />
      <Hotspot pos={[-0.30, -0.04, 0.14]} id="bastoni" side="left" />
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
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0.02, 4.35], fov: 44 }} onPointerMissed={() => handleSelectItem(null, false)}>
            <ambientLight intensity={1.65} />
            <directionalLight position={[3, 5, 4]} intensity={2.3} color="#ffffff" />
            <directionalLight position={[-4, 2, -2]} intensity={1.6} color="#00e5ff" />
            <Environment preset="city" />

            <Suspense fallback={null}>
              <SkierScene activeItem={activeItem} onSelect={handleSelectItem} />
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

            {/* Laboratorio interattivo specifico a 4 schede */}
            <InteractiveLab itemId={data.id} />
          </div>
        )}
      </aside>
    </>
  );
}