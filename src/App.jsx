import React, { useState, useRef, useEffect, useMemo, Suspense, Component, memo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import LegalCompliance from './LegalCompliance';
import './index.css';

const InteractiveLab = React.lazy(() => import('./InteractiveLabs'));

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
        <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', zIndex: 5 }}>
          Scena 3D non disponibile. Usa il menu in basso per esplorare i laboratori.
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

const ORDERED_ITEM_IDS = [
  'casco',
  'maschera_outof',
  'maschera_audio',
  'termoregolazione',
  'guanti',
  'bastoni',
  'scarpone',
  'attacchi',
  'telemetria',
  'sci'
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
    title: 'Bastoni & Misura', brand: 'Visita Leki Poles ↗', url: 'https://www.leki.com',
    summary: 'Aste in alluminio o carbonio ad alto modulo, rondelle dedicate per terreno e collegamenti sganciabili guanto–impugnatura.'
  },
  scarpone: {
    id: 'scarpone', macro: 'performance', shortLabel: 'Fit & Calzata',
    title: 'Fit & Calzata', brand: 'Scopri BOA Fit ↗', url: 'https://www.boafit.com',
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
    title: 'Sci & Struttura', brand: 'Scopri ORIGINAL+ ↗', url: 'https://www.original.plus',
    summary: 'Costruzioni multi-raggio con Titanal, smorzamento piezoelettrico HEAD EMC e personalizzazione algoritmica ORIGINAL+.'
  }
};

/* --- PRELOADER CINETICO FULL-SCREEN --- */
function KineticIntro() {
  const { progress } = useProgress();
  const [displayPct, setDisplayPct] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const target = Math.max(progress, 100);
    const timer = setInterval(() => {
      setDisplayPct((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const step = Math.ceil((target - prev) / 4);
        return Math.min(100, prev + Math.max(5, step));
      });
    }, 30);
    return () => clearInterval(timer);
  }, [progress]);

  useEffect(() => {
    if (displayPct >= 100) {
      const t = setTimeout(() => setDismissed(true), 280);
      return () => clearTimeout(t);
    }
  }, [displayPct]);

  return (
    <div className={`intro-curtain ${dismissed ? 'dismissed' : ''}`} aria-hidden={dismissed}>
      <div className="intro-scan-beam" />
      <div className="intro-top-bar">
        <span>SAS ACADEMY // SKITECH LAB</span>
        <span>ANDREA MONZANI · 2026</span>
      </div>

      <div className="intro-center">
        <div className="intro-mask-line">
          <span className="intro-kinetic-word">INNOVAZIONE</span>
        </div>
        <div className="intro-mask-line">
          <span className="intro-kinetic-word cyan">SCI 2026</span>
        </div>
      </div>

      <div className="intro-bottom-bar">
        <div className="intro-progress-track">
          <div className="intro-progress-fill" style={{ width: `${displayPct}%` }} />
        </div>
        <div className="intro-counter">{String(displayPct).padStart(3, '0')}%</div>
      </div>
    </div>
  );
}

/* --- TITOLO CON HOVER CINETICO 3D --- */
function KineticTitle({ onTriggerEgg }) {
  const line1 = 'INNOVAZIONE';
  const line2 = 'SCI 2026';

  return (
    <div
      className="kinetic-title"
      onClick={onTriggerEgg}
      title="Clicca per attivare Hyperspace Overdrive"
      onMouseEnter={() => document.body.classList.add('cursor-hovering')}
      onMouseLeave={() => document.body.classList.remove('cursor-hovering')}
    >
      <div className="kinetic-line">
        {line1.split('').map((ch, idx) => (
          <span key={idx} className="kinetic-char" style={{ '--char-idx': idx }}>
            {ch}
          </span>
        ))}
      </div>
      <div className="kinetic-line second">
        {line2.split('').map((ch, idx) => (
          <span key={idx} className="kinetic-char" style={{ '--char-idx': idx }}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </div>
      <div className="kinetic-underline-bar" />
    </div>
  );
}

/* --- NAVBAR MAGNETICA RIUTILIZZABILE CON ROLLING TEXT --- */
function MagneticNavBar({ items, activeId, onSelectItem, className = '' }) {
  const barRef = useRef(null);
  const [pill, setPill] = useState({ opacity: 0, width: 0, x: 0 });

  const handleEnter = (e) => {
    if (!barRef.current) return;
    const barRect = barRef.current.getBoundingClientRect();
    const btnRect = e.currentTarget.getBoundingClientRect();
    setPill({
      opacity: 1,
      width: btnRect.width,
      x: btnRect.left - barRect.left
    });
    document.body.classList.add('cursor-hovering');
  };

  const handleLeave = () => {
    setPill((prev) => ({ ...prev, opacity: 0 }));
    document.body.classList.remove('cursor-hovering');
  };

  return (
    <div ref={barRef} className={`magnetic-bar ${className}`} onMouseLeave={handleLeave}>
      <div
        className="dock-magnetic-pill"
        style={{
          opacity: pill.opacity,
          width: `${pill.width}px`,
          transform: `translateX(${pill.x}px)`
        }}
      />
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`mag-nav-btn ${activeId === item.id ? 'is-active' : ''}`}
          onClick={() => onSelectItem(item.id)}
          onMouseEnter={handleEnter}
        >
          <span className="roll-wrap">
            <span className="roll-text">{item.label}</span>
            <span className="roll-text clone" aria-hidden="true">
              {item.label}
            </span>
          </span>
          {item.badge && <span className="macro-count">{item.badge}</span>}
        </button>
      ))}
    </div>
  );
}

/* --- PARTICELLINE FIOCHE CHE SALGONO (E DIVENTANO SCIE STAR WARS IN OVERDRIVE) --- */
const RisingParticles = memo(function RisingParticles({ overdrive }) {
  const pointsRef = useRef();
  const count = 130;

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 7.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4.6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4.5 - 0.6;
      spd[i] = 0.14 + Math.random() * 0.22;
    }
    return { positions: pos, speeds: spd };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const arr = pointsRef.current.geometry.attributes.position.array;
    const mult = overdrive ? 24 : 1;

    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta * mult;
      if (arr[i * 3 + 1] > 2.3) {
        arr[i * 3 + 1] = -2.3;
        arr[i * 3] = (Math.random() - 0.5) * 7.5;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.scale.y = THREE.MathUtils.lerp(pointsRef.current.scale.y, overdrive ? 14 : 1, 0.12);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={overdrive ? 0.032 : 0.022}
        color={overdrive ? '#ffcc00' : '#00e5ff'}
        transparent
        opacity={overdrive ? 0.72 : 0.24}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
});

/* --- SCI PROCEDURALI --- */
const PerfectSkis = memo(function PerfectSkis({ xray }) {
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
        <meshPhysicalMaterial
          color={xray ? '#00e5ff' : '#090c12'}
          wireframe={xray}
          roughness={0.25}
          metalness={0.85}
          clearcoat={0.9}
        />
      </mesh>
      <mesh geometry={geom} position={[0.15, 0, 0]} receiveShadow>
        <meshPhysicalMaterial
          color={xray ? '#00e5ff' : '#090c12'}
          wireframe={xray}
          roughness={0.25}
          metalness={0.85}
          clearcoat={0.9}
        />
      </mesh>
    </group>
  );
});

/* --- HOTSPOT 3D MEMOIZZATO (FUORI DA SKIERSCENE PER ZERO LOOP/SCATTI) --- */
const Hotspot = memo(function Hotspot({ pos, id, side = 'right', isSelected, onSelect }) {
  const item = DATA[id];
  if (!item) return null;

  return (
    <Html position={pos} center zIndexRange={[50, 0]}>
      <div className="hotspot-anchor">
        <button
          type="button"
          className={`hotspot-container ${side} ${isSelected ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(id);
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
});

/* --- SCENA 3D MANICHINO --- */
function SkierScene({ activeItem, highlightedId, onSelect, xray, onToggleXray, hdgRef }) {
  const { scene } = useGLTF('/mannequin.glb');
  const groupRef = useRef();
  const lastTelemetryRef = useRef(0);

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
          color: xray ? '#00e5ff' : '#1b202e',
          roughness: xray ? 0.2 : 0.56,
          metalness: xray ? 0.8 : 0.28,
          wireframe: xray
        });
      }
    });
    return clone;
  }, [scene, xray]);

  useFrame((state) => {
    if (groupRef.current) {
      const breath = Math.sin(state.clock.elapsedTime * 1.4) * 0.014;
      const isDesktop = window.innerWidth > 768;
      const targetX = activeItem && isDesktop ? -0.95 : 0;
      const targetRotY = activeItem && isDesktop ? 0.28 : 0;

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.07);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.07);
      groupRef.current.position.y = (isDesktop ? -0.04 : 0.14) + breath;

      // Aggiornamento DOM diretto (zero re-render React!)
      if (hdgRef?.current && state.clock.elapsedTime - lastTelemetryRef.current > 0.2) {
        lastTelemetryRef.current = state.clock.elapsedTime;
        const yaw = Math.round(((state.camera.position.x * 45) % 360 + 360) % 360);
        hdgRef.current.textContent = `46.5405° N · 12.1357° E · HDG ${String(yaw).padStart(3, '0')}°`;
      }
    }
  });

  const currentFocus = activeItem || highlightedId;

  return (
    <group
      ref={groupRef}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onToggleXray();
      }}
    >
      <primitive object={normalizedModel} />
      <PerfectSkis xray={xray} />

      <Hotspot pos={[0.06, 0.92, 0.08]} id="casco" side="right" isSelected={currentFocus === 'casco'} onSelect={onSelect} />
      <Hotspot pos={[-0.09, 0.80, 0.12]} id="maschera_outof" side="left" isSelected={currentFocus === 'maschera_outof'} onSelect={onSelect} />
      <Hotspot pos={[0.11, 0.70, 0.08]} id="maschera_audio" side="right" isSelected={currentFocus === 'maschera_audio'} onSelect={onSelect} />
      <Hotspot pos={[-0.16, 0.34, 0.12]} id="termoregolazione" side="left" isSelected={currentFocus === 'termoregolazione'} onSelect={onSelect} />
      <Hotspot pos={[0.30, 0.06, 0.14]} id="guanti" side="right" isSelected={currentFocus === 'guanti'} onSelect={onSelect} />
      <Hotspot pos={[-0.30, -0.04, 0.14]} id="bastoni" side="left" isSelected={currentFocus === 'bastoni'} onSelect={onSelect} />
      <Hotspot pos={[-0.14, -0.66, 0.10]} id="scarpone" side="left" isSelected={currentFocus === 'scarpone'} onSelect={onSelect} />
      <Hotspot pos={[0.18, -0.80, 0.06]} id="telemetria" side="right" isSelected={currentFocus === 'telemetria'} onSelect={onSelect} />
      <Hotspot pos={[-0.15, -0.94, -0.05]} id="attacchi" side="left" isSelected={currentFocus === 'attacchi'} onSelect={onSelect} />
      <Hotspot pos={[0.15, -1.00, 0.60]} id="sci" side="right" isSelected={currentFocus === 'sci'} onSelect={onSelect} />
    </group>
  );
}

useGLTF.preload('/mannequin.glb');

export default function App() {
  const [activeItem, setActiveItem] = useState(null);
  const [overdriveMode, setOverdriveMode] = useState(false);

  // Easter Egg Hover sul bottone HUD (scramble text + mini-telemetria)
  const [hudHovered, setHudHovered] = useState(false);
  const [hudLabel, setHudLabel] = useState('TELEMETRY HUD');
  const hdgRef = useRef(null);

  // Stato Deck Mobile stile Videogame / Tinder
  const [mobileDeckIdx, setMobileDeckIdx] = useState(0);
  const touchStartX = useRef(null);

  const handleToggleItem = useCallback((id) => {
    setActiveItem((prev) => (prev === id ? null : id));
    const idx = ORDERED_ITEM_IDS.indexOf(id);
    if (idx !== -1) setMobileDeckIdx(idx);
  }, []);

  const handleSelectDirect = useCallback((id) => {
    setActiveItem(id);
    const idx = ORDERED_ITEM_IDS.indexOf(id);
    if (idx !== -1) setMobileDeckIdx(idx);
  }, []);

  // Scramble effect quando si fa hover sul bottone HUD
  useEffect(() => {
    if (overdriveMode) {
      setHudLabel('OVERDRIVE // ON');
      return;
    }
    if (!hudHovered) {
      setHudLabel('TELEMETRY HUD');
      return;
    }
    const target = 'SYS.SCAN // LIVE';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*';
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setHudLabel(
        target
          .split('')
          .map((ch, i) => (ch === ' ' || i < step ? ch : chars[Math.floor(Math.random() * chars.length)]))
          .join('')
      );
      if (step >= target.length) clearInterval(interval);
    }, 28);
    return () => clearInterval(interval);
  }, [hudHovered, overdriveMode]);

  // Cursore custom
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
  const activeMacroObj = data ? MACROS.find((m) => m.id === data.macro) : null;

  // Navigazione mobile Tinder deck
  const currentMobileId = ORDERED_ITEM_IDS[mobileDeckIdx];
  const currentMobileItem = DATA[currentMobileId];
  const currentMobileMacro = MACROS.find((m) => m.id === currentMobileItem.macro);

  const nextMobileCard = () => setMobileDeckIdx((i) => (i + 1) % ORDERED_ITEM_IDS.length);
  const prevMobileCard = () => setMobileDeckIdx((i) => (i - 1 + ORDERED_ITEM_IDS.length) % ORDERED_ITEM_IDS.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 42) {
      if (diff < 0) nextMobileCard();
      else prevMobileCard();
    }
    touchStartX.current = null;
  };

  const currentIndexInAll = activeItem ? ORDERED_ITEM_IDS.indexOf(activeItem) : -1;
  const prevItemId = currentIndexInAll !== -1 ? ORDERED_ITEM_IDS[(currentIndexInAll - 1 + ORDERED_ITEM_IDS.length) % ORDERED_ITEM_IDS.length] : null;
  const nextItemId = currentIndexInAll !== -1 ? ORDERED_ITEM_IDS[(currentIndexInAll + 1) % ORDERED_ITEM_IDS.length] : null;

  return (
    <div className={`app-shell ${overdriveMode ? 'overdrive-mode' : ''}`}>
      <div className="cursor-dot" />
      <div className="cursor-ring" />
      <div className="studio-canvas" />
      <div className="telemetry-grid-bg" />
      <div className="overdrive-vignette" />
      <div className="noise-film" />

      <KineticIntro />

      {/* Header con Titolo Impilato + Link Andrea */}
      <header className={`brand-header ${activeItem ? 'hidden' : ''}`}>
        <span className="kicker">
          SAS ACADEMY //{' '}
          <a
            href="https://home.andreamonzani.com"
            target="_blank"
            rel="noreferrer"
            className="author-inline-link"
            onMouseEnter={() => document.body.classList.add('cursor-hovering')}
            onMouseLeave={() => document.body.classList.remove('cursor-hovering')}
          >
            ANDREA
          </a>
          , MARCO, GIANLUCA ED EMMA
        </span>
        <KineticTitle onTriggerEgg={() => setOverdriveMode((v) => !v)} />
        <div className="hero-sub-telemetry">
          <span>
            {overdriveMode
              ? '[HYPERSPACE OVERDRIVE ATTIVO — CLICCA HUD PER USCIRE]'
              : '[SELEZIONA UN HOTSPOT SUL MODELLO O USA LA DOCK]'}
          </span>
        </div>
      </header>

      {/* HUD Top-Right con Doppio Easter Egg (Hover Scramble + Click Overdrive) */}
      <div
        className={`hud-top-right ${activeItem ? 'hidden' : ''}`}
        onMouseEnter={() => {
          setHudHovered(true);
          document.body.classList.add('cursor-hovering');
        }}
        onMouseLeave={() => {
          setHudHovered(false);
          document.body.classList.remove('cursor-hovering');
        }}
      >
        <button
          type="button"
          className={`hud-pill-btn ${overdriveMode ? 'active' : ''}`}
          onClick={() => setOverdriveMode((v) => !v)}
        >
          <span className="hud-dot" />
          <span>{hudLabel}</span>
        </button>

        <div ref={hdgRef} className="hud-coords">
          46.5405° N · 12.1357° E · HDG 000°
        </div>

        {(hudHovered || overdriveMode) && (
          <div className="hud-easter-card">
            <div className="hud-easter-row">
              <span style={{ color: 'var(--text-secondary)' }}>EDGE ANGLE</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>64.2° MAX</span>
            </div>
            <div className="hud-easter-row">
              <span style={{ color: 'var(--text-secondary)' }}>G-LOAD PEAK</span>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>2.38 G</span>
            </div>
            <div className="hud-easter-row">
              <span style={{ color: 'var(--text-secondary)' }}>SNOW TEMP</span>
              <span>-6.4°C COMPACT</span>
            </div>
            <div className="hud-easter-hint">
              {overdriveMode ? '⚡ MODALITÀ OVERDRIVE ATTIVA' : 'CLICCA PER HYPERSPACE OVERDRIVE ⚡'}
            </div>
          </div>
        )}
      </div>

      {/* Scena 3D + Particelle che salgono */}
      <SceneErrorBoundary>
        <div style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0.02, 4.35], fov: 44 }}
            onPointerMissed={() => setActiveItem(null)}
          >
            <hemisphereLight intensity={1.45} color="#ffffff" groundColor="#1e293b" />
            <directionalLight position={[3, 5, 4]} intensity={2.2} color="#ffffff" />
            <directionalLight position={[-4, 2, -2]} intensity={1.5} color="#00e5ff" />

            <RisingParticles overdrive={overdriveMode} />

            <Suspense fallback={null}>
              <SkierScene
                activeItem={activeItem}
                highlightedId={currentMobileId}
                onSelect={handleToggleItem}
                xray={overdriveMode}
                onToggleXray={() => setOverdriveMode((v) => !v)}
                hdgRef={hdgRef}
              />
            </Suspense>

            <OrbitControls
              enableZoom={true}
              enablePan={false}
              autoRotate={!activeItem}
              autoRotateSpeed={overdriveMode ? 3.2 : 0.45}
              minDistance={3.0}
              maxDistance={6.0}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.85}
              enableDamping={true}
              dampingFactor={0.05}
            />
          </Canvas>
        </div>
      </SceneErrorBoundary>

      {/* Dock Magnetica Desktop */}
      <nav className={`macro-dock ${activeItem ? 'hidden' : ''}`} aria-label="Categorie principali">
        <MagneticNavBar
          items={MACROS.map((m) => ({
            id: m.items[0],
            label: m.label,
            badge: `0${m.items.length}`
          }))}
          activeId={null}
          onSelectItem={handleSelectDirect}
        />
      </nav>

      {/* Deck Mobile Videogame / Tinder (Swipeable) */}
      <div
        className={`mobile-tinder-deck ${activeItem ? 'hidden' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="tinder-card">
          <div className="tinder-card-top">
            <span className="tinder-badge">{currentMobileMacro?.label}</span>
            <span className="tinder-counter">
              {String(mobileDeckIdx + 1).padStart(2, '0')} / {ORDERED_ITEM_IDS.length}
            </span>
          </div>
          <div className="tinder-card-title">{currentMobileItem.title}</div>
          <p className="tinder-card-desc">{currentMobileItem.summary}</p>
          <div className="tinder-controls">
            <button type="button" className="tinder-arrow-btn" onClick={prevMobileCard} aria-label="Precedente">
              ◀
            </button>
            <button type="button" className="tinder-open-btn" onClick={() => handleSelectDirect(currentMobileId)}>
              Esplora Lab →
            </button>
            <button type="button" className="tinder-arrow-btn" onClick={nextMobileCard} aria-label="Successivo">
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* Pannello Laterale Desktop & Scheda Mobile */}
      <aside className={`side-panel ${activeItem ? 'open' : ''}`} aria-label="Scheda approfondimento">
        <div className="panel-top-actions">
          <button type="button" className="close-btn" onClick={() => setActiveItem(null)}>
            ✕ Torna al 3D
          </button>
          {activeMacroObj && (
            <span className="mono" style={{ fontSize: '0.64rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {activeMacroObj.label}
            </span>
          )}
        </div>

        {/* Sottomenu con la stessa Navbar Magnetica a Rolling Text */}
        {activeMacroObj && activeMacroObj.items.length > 1 && (
          <div className="sub-nav-wrap">
            <MagneticNavBar
              className="sub-nav-bar"
              items={activeMacroObj.items.map((subId) => ({
                id: subId,
                label: DATA[subId].shortLabel
              }))}
              activeId={activeItem}
              onSelectItem={handleSelectDirect}
            />
          </div>
        )}

        {data && (
          <div>
            <h3 style={{ fontSize: '2.15rem', marginBottom: '6px' }}>{data.title}</h3>
            <a
              href={data.url}
              target="_blank"
              rel="noreferrer"
              className="brand-link"
              onMouseEnter={() => document.body.classList.add('cursor-hovering')}
              onMouseLeave={() => document.body.classList.remove('cursor-hovering')}
            >
              {data.brand}
            </a>

            <p style={{ marginTop: '14px', fontSize: '0.94rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.84)' }}>
              {data.summary}
            </p>

            <Suspense
              fallback={
                <p className="mono" style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                  Caricamento laboratorio...
                </p>
              }
            >
              <InteractiveLab itemId={data.id} />
            </Suspense>
          </div>
        )}
      </aside>

      {/* Barra rapida Precedente/Successivo su Mobile dentro la scheda */}
      {activeItem && (
        <div className="mobile-panel-nav">
          <button type="button" className="action-btn secondary" onClick={() => handleSelectDirect(prevItemId)}>
            ◀ {DATA[prevItemId]?.shortLabel}
          </button>
          <button type="button" className="action-btn" onClick={() => handleSelectDirect(nextItemId)}>
            {DATA[nextItemId]?.shortLabel} ▶
          </button>
        </div>
      )}

      <LegalCompliance isPanelOpen={Boolean(activeItem)} />
    </div>
  );
}