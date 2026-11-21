import React, { useState, useRef, useEffect, useMemo, Suspense, Component, memo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import LegalCompliance from './LegalCompliance';
import { soundEngine } from './soundEngine';
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

const HOTSPOT_POINTS = [
  { id: 'casco', pos: [0.06, 0.92, 0.08], side: 'right' },
  { id: 'maschera_outof', pos: [-0.09, 0.80, 0.12], side: 'left' },
  { id: 'maschera_audio', pos: [0.11, 0.70, 0.08], side: 'right' },
  { id: 'termoregolazione', pos: [-0.16, 0.34, 0.12], side: 'left' },
  { id: 'guanti', pos: [0.30, 0.06, 0.14], side: 'right' },
  { id: 'bastoni', pos: [-0.30, -0.04, 0.14], side: 'left' },
  { id: 'scarpone', pos: [-0.14, -0.66, 0.10], side: 'left' },
  { id: 'telemetria', pos: [0.18, -0.80, 0.06], side: 'right' },
  { id: 'attacchi', pos: [-0.15, -0.94, -0.05], side: 'left' },
  { id: 'sci', pos: [0.15, -1.00, 0.60], side: 'right' }
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
      onMouseEnter={() => {
        soundEngine.play('hover');
        document.body.classList.add('cursor-hovering');
      }}
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
    soundEngine.play('hover');
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

/* --- MIRINO OLOGRAFICO 3D SULL'HOTSPOT HOVERATO --- */
function HoverBeacon({ pos }) {
  const outerRef = useRef();
  const innerRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (outerRef.current) {
      outerRef.current.rotation.z = t * 1.8;
      const pulse = 1 + Math.sin(t * 6) * 0.14;
      outerRef.current.scale.setScalar(pulse);
    }
    if (innerRef.current) {
      innerRef.current.rotation.z = -t * 2.6;
    }
  });

  if (!pos) return null;

  return (
    <group position={pos}>
      <mesh ref={outerRef}>
        <ringGeometry args={[0.065, 0.082, 32]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={innerRef}>
        <ringGeometry args={[0.032, 0.044, 6]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.95} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* --- SCI PROCEDURALI CON REAZIONE COLORE SU HOVER --- */
const PerfectSkis = memo(function PerfectSkis({ xray, isHighlighted }) {
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

  const skiColor = xray ? '#00e5ff' : isHighlighted ? '#0e3a47' : '#090c12';
  const emissiveColor = isHighlighted && !xray ? '#00e5ff' : '#000000';

  return (
    <group position={[0, -1.04, 0.05]}>
      <mesh geometry={geom} position={[-0.15, 0, 0]} receiveShadow>
        <meshPhysicalMaterial
          color={skiColor}
          emissive={emissiveColor}
          emissiveIntensity={isHighlighted ? 0.35 : 0}
          wireframe={xray}
          roughness={0.25}
          metalness={0.85}
          clearcoat={0.9}
        />
      </mesh>
      <mesh geometry={geom} position={[0.15, 0, 0]} receiveShadow>
        <meshPhysicalMaterial
          color={skiColor}
          emissive={emissiveColor}
          emissiveIntensity={isHighlighted ? 0.35 : 0}
          wireframe={xray}
          roughness={0.25}
          metalness={0.85}
          clearcoat={0.9}
        />
      </mesh>
    </group>
  );
});

/* --- HOTSPOT 3D MEMOIZZATO CON CALLBACK HOVER --- */
const Hotspot = memo(function Hotspot({ pos, id, side = 'right', isSelected, onSelect, onHoverChange }) {
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
          onMouseEnter={() => {
            soundEngine.play('hover');
            onHoverChange(id);
            document.body.classList.add('cursor-hovering');
          }}
          onMouseLeave={() => {
            onHoverChange(null);
            document.body.classList.remove('cursor-hovering');
          }}
        >
          <span className="hotspot-dot" />
          <span className="hotspot-line" />
          <span className="hotspot-tag">{item.shortLabel}</span>
        </button>
      </div>
    </Html>
  );
});

/* --- SCENA 3D MANICHINO + CAMBIO COLORE HOVER DINAMICO --- */
function SkierScene({ activeItem, hoveredId, onHoverChange, onSelect, xray, onToggleXray, hdgRef }) {
  const { scene } = useGLTF('/mannequin.glb');
  const groupRef = useRef();
  const lastTelemetryRef = useRef(0);
  const materialsRef = useRef([]);

  const targetBaseColor = useMemo(() => new THREE.Color(), []);
  const targetEmissiveColor = useMemo(() => new THREE.Color(), []);

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

    const mats = [];
    clone.traverse((child) => {
      if (child.isMesh) {
        const mat = new THREE.MeshStandardMaterial({
          color: xray ? '#00e5ff' : '#1b202e',
          emissive: '#000000',
          emissiveIntensity: 0,
          roughness: xray ? 0.2 : 0.52,
          metalness: xray ? 0.8 : 0.32,
          wireframe: xray
        });
        child.material = mat;
        mats.push(mat);
      }
    });
    materialsRef.current = mats;
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
      groupRef.current.position.y = (isDesktop ? -0.04 : -0.10) + breath;

      if (!xray && materialsRef.current.length > 0) {
        targetBaseColor.set(hoveredId ? '#22384f' : '#1b202e');
        targetEmissiveColor.set(hoveredId ? '#005f73' : '#000000');
        const targetIntensity = hoveredId ? 0.45 : 0;

        for (let i = 0; i < materialsRef.current.length; i++) {
          const m = materialsRef.current[i];
          m.color.lerp(targetBaseColor, 0.12);
          m.emissive.lerp(targetEmissiveColor, 0.12);
          m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, targetIntensity, 0.12);
        }
      }

      if (hdgRef?.current && state.clock.elapsedTime - lastTelemetryRef.current > 0.2) {
        lastTelemetryRef.current = state.clock.elapsedTime;
        const yaw = Math.round(((state.camera.position.x * 45) % 360 + 360) % 360);
        hdgRef.current.textContent = `46.5405° N · 12.1357° E · HDG ${String(yaw).padStart(3, '0')}°`;
      }
    }
  });

  const hoveredSpot = hoveredId ? HOTSPOT_POINTS.find((h) => h.id === hoveredId) : null;

  return (
    <group
      ref={groupRef}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onToggleXray();
      }}
    >
      <primitive object={normalizedModel} />
      <PerfectSkis xray={xray} isHighlighted={hoveredId === 'sci' || hoveredId === 'attacchi'} />

      {hoveredSpot && <HoverBeacon pos={hoveredSpot.pos} />}

      {HOTSPOT_POINTS.map((spot) => (
        <Hotspot
          key={spot.id}
          pos={spot.pos}
          id={spot.id}
          side={spot.side}
          isSelected={activeItem === spot.id}
          onSelect={onSelect}
          onHoverChange={onHoverChange}
        />
      ))}
    </group>
  );
}

useGLTF.preload('/mannequin.glb');

export default function App() {
  const [activeItem, setActiveItem] = useState(null);
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const [overdriveMode, setOverdriveMode] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [showShakeToast, setShowShakeToast] = useState(false);

  // Easter Egg Hover sul bottone HUD
  const [hudHovered, setHudHovered] = useState(false);
  const [hudLabel, setHudLabel] = useState('TELEMETRY HUD');
  const hdgRef = useRef(null);

  const dismissShakeToast = useCallback(() => {
    setShowShakeToast(false);
    try {
      sessionStorage.setItem('sas_shake_hint_seen', '1');
    } catch {}
  }, []);

  const requestMotionPermission = useCallback(() => {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      DeviceMotionEvent.requestPermission().catch(() => {});
    }
  }, []);

  const handleToggleAudio = () => {
    const nextState = soundEngine.toggle();
    setAudioOn(nextState);
  };

  const toggleOverdrive = useCallback(() => {
    setOverdriveMode((prev) => {
      const next = !prev;
      soundEngine.play(next ? 'overdrive' : 'click');
      return next;
    });
  }, []);

  const handleToggleItem = useCallback((id) => {
    soundEngine.play('click');
    setActiveItem((prev) => (prev === id ? null : id));
  }, []);

  const handleSelectDirect = useCallback((id) => {
    soundEngine.play('click');
    setActiveItem(id);
  }, []);

  // Mostra il popup "Prova ad agitare il telefono" solo se viene rilevato uno smartphone
  useEffect(() => {
    const isSmartphone =
      window.matchMedia('(pointer: coarse)').matches ||
      window.innerWidth <= 768 ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (!isSmartphone) return;

    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem('sas_shake_hint_seen') === '1';
    } catch {}

    if (alreadySeen) return;

    const showTimer = setTimeout(() => {
      setShowShakeToast(true);
    }, 1500);

    const hideTimer = setTimeout(() => {
      dismissShakeToast();
    }, 9500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [dismissShakeToast]);

  // Easter Egg Mobile: Shake del telefono per attivare Hyperspace Overdrive
  useEffect(() => {
    let lastX = null;
    let lastY = null;
    let lastZ = null;
    let lastShakeTime = 0;
    const SHAKE_THRESHOLD = 24;

    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc || acc.x === null) return;

      if (lastX !== null) {
        const delta =
          Math.abs(acc.x - lastX) +
          Math.abs(acc.y - lastY) +
          Math.abs(acc.z - lastZ);

        if (delta > SHAKE_THRESHOLD) {
          const now = Date.now();
          if (now - lastShakeTime > 1200) {
            lastShakeTime = now;
            dismissShakeToast();
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              try {
                navigator.vibrate([40, 30, 60]);
              } catch {}
            }
            toggleOverdrive();
          }
        }
      }

      lastX = acc.x;
      lastY = acc.y;
      lastZ = acc.z;
    };

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('touchend', requestMotionPermission, { once: true });

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('touchend', requestMotionPermission);
    };
  }, [toggleOverdrive, dismissShakeToast, requestMotionPermission]);

  // Scramble effect su Hover HUD
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

  const currentIndexInAll = activeItem ? ORDERED_ITEM_IDS.indexOf(activeItem) : -1;
  const prevItemId = currentIndexInAll !== -1 ? ORDERED_ITEM_IDS[(currentIndexInAll - 1 + ORDERED_ITEM_IDS.length) % ORDERED_ITEM_IDS.length] : null;
  const nextItemId = currentIndexInAll !== -1 ? ORDERED_ITEM_IDS[(currentIndexInAll + 1) % ORDERED_ITEM_IDS.length] : null;

  const memberHoverProps = {
    onMouseEnter: () => {
      soundEngine.play('hover');
      document.body.classList.add('cursor-hovering');
    },
    onMouseLeave: () => document.body.classList.remove('cursor-hovering')
  };

  return (
    <div className={`app-shell ${overdriveMode ? 'overdrive-mode' : ''}`}>
      <div className="cursor-dot" />
      <div className="cursor-ring" />
      <div className="studio-canvas" />
      <div className="telemetry-grid-bg" />
      <div className="overdrive-vignette" />
      <div className="noise-film" />

      <KineticIntro />

      {/* Header con Titolo Impilato + Hover su tutti i membri del team */}
      <header className={`brand-header ${activeItem ? 'hidden' : ''}`}>
        <span className="kicker">
          SAS ACADEMY //{' '}
          <a
            href="https://home.andreamonzani.com"
            target="_blank"
            rel="noreferrer"
            className="author-inline-link"
            {...memberHoverProps}
          >
            ANDREA
          </a>
          ,{' '}
          <span className="team-member-tag" {...memberHoverProps}>
            MARCO
          </span>
          ,{' '}
          <span className="team-member-tag" {...memberHoverProps}>
            GIANLUCA
          </span>{' '}
          ED{' '}
          <span className="team-member-tag" {...memberHoverProps}>
            EMMA
          </span>
        </span>
        <KineticTitle onTriggerEgg={toggleOverdrive} />
        <div className="hero-sub-telemetry">
          <span>
            {hoveredHotspot
              ? `[TARGET // ${DATA[hoveredHotspot]?.title.toUpperCase()}]`
              : overdriveMode
              ? '[HYPERSPACE OVERDRIVE ATTIVO — CLICCA HUD O SCUOTI PER USCIRE]'
              : '[TOCCA UN HOTSPOT SUL MODELLO O SCORRI IL MENU]'}
          </span>
        </div>
      </header>

      {/* Popup automatico su Smartphone per invitare ad agitare il telefono */}
      {showShakeToast && !activeItem && (
        <button
          type="button"
          className="mobile-shake-toast"
          onClick={() => {
            requestMotionPermission();
            soundEngine.play('click');
            dismissShakeToast();
          }}
        >
          <span className="shake-toast-icon" aria-hidden="true">📱</span>
          <span className="shake-toast-text">
            <strong>Prova ad agitare il telefono ⚡</strong>
            <span>Attiva modalità Hyperspace Overdrive</span>
          </span>
          <span className="shake-toast-close" aria-hidden="true">✕</span>
        </button>
      )}

      {/* HUD Top-Right (Barra superiore pulita su Mobile) */}
      <div className={`hud-top-right ${activeItem ? 'hidden' : ''}`}>
        <div className="hud-controls-row">
          <button
            type="button"
            className={`hud-pill-btn ${audioOn ? 'audio-on active' : ''}`}
            onClick={handleToggleAudio}
            aria-label={audioOn ? 'Disattiva audio' : 'Attiva audio'}
            onMouseEnter={() => {
              soundEngine.play('hover');
              document.body.classList.add('cursor-hovering');
            }}
            onMouseLeave={() => document.body.classList.remove('cursor-hovering')}
          >
            <span className="eq-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>{audioOn ? 'AUDIO ON' : 'AUDIO'}</span>
          </button>

          <button
            type="button"
            className={`hud-pill-btn ${overdriveMode ? 'active' : ''}`}
            onClick={toggleOverdrive}
            onMouseEnter={() => {
              setHudHovered(true);
              soundEngine.play('hover');
              document.body.classList.add('cursor-hovering');
            }}
            onMouseLeave={() => {
              setHudHovered(false);
              document.body.classList.remove('cursor-hovering');
            }}
          >
            <span className="hud-dot" />
            <span>{hudLabel}</span>
          </button>
        </div>

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
              {overdriveMode ? '⚡ MODALITÀ OVERDRIVE ATTIVA' : 'CLICCA O SCUOTI PER OVERDRIVE ⚡'}
            </div>
          </div>
        )}
      </div>

      {/* Scena 3D + Particelle */}
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
                hoveredId={hoveredHotspot}
                onHoverChange={setHoveredHotspot}
                onSelect={handleToggleItem}
                xray={overdriveMode}
                onToggleXray={toggleOverdrive}
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

      {/* Dock Magnetica (Fissa al centro su Desktop, Scorrevole Orizzontalmente su Mobile) */}
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

      {/* Pannello Laterale Desktop & Scheda Mobile */}
      <aside className={`side-panel ${activeItem ? 'open' : ''}`} aria-label="Scheda approfondimento">
        <div className="panel-top-actions">
          <button
            type="button"
            className="close-btn"
            onClick={() => {
              soundEngine.play('click');
              setActiveItem(null);
            }}
          >
            ✕ Torna al 3D
          </button>
          {activeMacroObj && (
            <span className="mono" style={{ fontSize: '0.64rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {activeMacroObj.label}
            </span>
          )}
        </div>

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
              onMouseEnter={() => {
                soundEngine.play('hover');
                document.body.classList.add('cursor-hovering');
              }}
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