import React, { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import './index.css';

const MACROS = [
  { id: 'performance', label: 'Performance', items: ['sci', 'scarpone'] },
  { id: 'sicurezza', label: 'Sicurezza', items: ['casco', 'attacchi'] },
  { id: 'comfort', label: 'Comfort', items: ['termoregolazione', 'guanti'] },
  { id: 'dati_visione', label: 'Visione & Dati', items: ['maschera_outof', 'maschera_audio', 'telemetria'] }
];

const DATA = {
  casco: {
    id: 'casco',
    macro: 'sicurezza',
    shortLabel: 'Caschi',
    title: 'Dentro un Casco da Sci',
    brand: 'Visita Sena Snow ↗',
    url: 'https://www.sena.com',
    novita: [
      'Calotta esterna ibrida (policarbonato / ABS / compositi) e nucleo assorbente EPS / EPP',
      'Gestione dell’impatto obliquo (Mips, Koroyd, WaveCel) e omologazioni EN 1077 A/B, ASTM F2040, FIS RH 2013',
      'Sistemi di soccorso (RECCO, NFC Twiceme) e comunicazione Mesh Sena'
    ],
    info: 'La calotta distribuisce il carico, il nucleo si deforma assorbendo energia e gli strati interni gestiscono la rotazione negli impatti obliqui.',
    consiglio: 'Esplora qui sotto l’anatomia a strati, le differenze tra sigle/omologazioni, il consigliatore per disciplina e il mini quiz.'
  },
  maschera_outof: {
    id: 'maschera_outof',
    macro: 'dati_visione',
    shortLabel: 'Out Of',
    title: 'Out Of',
    brand: 'Visita Out Of ↗',
    url: 'https://out-of.com',
    novita: [
      'Lente elettronica IRID alimentata a cella solare (zero batterie da ricaricare)',
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
    title: 'Guanti & Grip',
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

// Dati modulo interattivo Casco (integrati dall'HTML allegato)
const HELMET_LAYERS = {
  shell: {
    title: 'La prima barriera (Calotta)',
    copy: 'La calotta esterna protegge la struttura interna e contribuisce a distribuire il carico. Può essere in policarbonato, ABS o materiali compositi.'
  },
  foam: {
    title: 'Il materiale che assorbe energia',
    copy: 'Il nucleo si deforma durante l’urto. L’EPS assorbe energia schiacciandosi; l’EPP è più resiliente. Dopo un urto importante va comunque sostituito.'
  },
  rotation: {
    title: 'Quando l’impatto è obliquo (Rotazione)',
    copy: 'Sistemi come Mips permettono un piccolo movimento relativo interno (10–15 mm), progettato per ridurre il movimento rotazionale trasmesso alla testa.'
  }
};

const HELMET_SIGLE = {
  standards: {
    note: 'Classe A e classe B prevedono coperture e prove di penetrazione differenti. La classe A, da sola, non equivale a FIS RH 2013.',
    cards: [
      ['Norma europea', 'EN 1077 A', 'Più superficie protetta.', 'Prevede una copertura maggiore della testa e una prova di penetrazione più severa rispetto alla classe B. Tipica dei caschi da gara.'],
      ['Norma europea', 'EN 1077 B', 'Una copertura differente.', 'Consente una copertura inferiore rispetto alla classe A, favorendo ventilazione e percezione dei suoni. Comune nei caschi da pista.'],
      ['Standard USA', 'ASTM F2040', 'Prove per sport sulla neve.', 'Comprende prove di impatto su diverse superfici, stabilità del casco e resistenza del sistema di ritenzione.'],
      ['Requisiti gara', 'FIS RH 2013', 'Requisiti aggiuntivi FIS.', 'Per GS, SG e DH FIS richiede EN 1077 A, ASTM F2040 e una prova aggiuntiva a 6,8 m/s.']
    ]
  },
  tech: {
    note: 'Mips, Koroyd e WaveCel sono tecnologie costruttive. I risultati del casco completo dipendono dal progetto complessivo.',
    cards: [
      ['Rotazione', 'Mips', 'Piccolo movimento interno.', 'Strato a basso attrito che consente movimento relativo interno negli urti obliqui (varianti Integra e Spherical).'],
      ['Assorbimento', 'Koroyd', 'Tubi che si accartocciano.', 'Piccoli tubi saldati si deformano in modo controllato per assorbire energia e favorire la ventilazione.'],
      ['Struttura cellulare', 'WaveCel', 'Flette, collassa e scorre.', 'Rete cellulare progettata per gestire componenti dirette e rotazionali dell’impatto.']
    ]
  },
  rescue: {
    note: 'Ricerca, identificazione e allarme hanno funzioni diverse. Il riflettore o il chip non aumentano l’assorbimento degli urti.',
    cards: [
      ['Ricerca soccorritori', 'RECCO', 'Riflettore senza batteria.', 'Rilevabile dai soccorritori dotati di sistema RECCO. Non è un GPS e non sostituisce ARTVA, pala e sonda.'],
      ['Identificazione', 'NFC / Twiceme', 'Dati medici con un tocco.', 'Avvicinando uno smartphone si accede ai contatti e alle informazioni emergenziali configurate.'],
      ['Rilevazione caduta', 'Sensori con SOS', 'Avviso automatico via app.', 'Alcuni sistemi (es. LIVALL) inviano un allarme ai contatti tramite smartphone collegato.']
    ]
  }
};

const HELMET_USES = {
  piste: {
    title: 'Un casco certificato per lo sci',
    copy: 'Verifica EN 1077 e dichiarazione UE di conformità. Valuta anche i risultati di test indipendenti (es. Virginia Tech) e provalo sempre con la tua maschera.'
  },
  race: {
    title: 'Controlla FIS RH 2013',
    copy: 'Per GS, SG e DH FIS verifica l’etichetta RH 2013 (EN 1077 A + ASTM F2040 + test 6,8 m/s). Il solo marchio Mips non attesta l’idoneità alla gara.'
  },
  tour: {
    title: 'Sci e alpinismo hanno rischi diversi',
    copy: 'Verifica le certificazioni dedicate: EN 18100 è la norma specifica per lo scialpinismo; diversi modelli riportano doppia omologazione EN 1077 ed EN 12492.'
  }
};

const HELMET_QUIZ = [
  {
    question: 'Mips è…',
    answers: ['un’omologazione da gara.', 'un sistema per gestire la rotazione.', 'un localizzatore GPS.'],
    correct: 1,
    explanation: 'Mips è una tecnologia costruttiva. EN 1077 e ASTM F2040 sono invece standard di prova.'
  },
  {
    question: 'Che cosa fa un riflettore RECCO?',
    answers: ['Invia automaticamente un SOS.', 'Mostra la posizione su qualsiasi telefono.', 'Aiuta la ricerca con un rilevatore dedicato.'],
    correct: 2,
    explanation: 'Il riflettore è passivo: viene cercato con un rilevatore RECCO e non trasmette autonomamente la posizione.'
  },
  {
    question: 'Per una gara FIS di gigante, quale etichetta cerchi?',
    answers: ['FIS RH 2013.', 'Soltanto Mips.', 'Soltanto EN 1078 per il ciclismo.'],
    correct: 0,
    explanation: 'La conformità FIS RH 2013 comprende EN 1077 A, ASTM F2040 e una prova aggiuntiva d’impatto.'
  }
];

const calcDIN = (w, type) => (Math.round((w / 10 + (type === 2 ? 1 : type === 3 ? 2.2 : 0)) * 4) / 4).toFixed(2);

// 27 combinazioni distinte (Terreno x Livello x Giorni/Budget)
const SKI_RECOMMENDATIONS = {
  pista: {
    principiante: {
      basso: { cat: 'Easy Carve Pista (Raggio 11–13 m)', ref: 'Anima leggera e rocker in spatola (es. Rossignol Forza 20° / Salomon S/Max 6): facilita l’ingresso curva senza sforzo.' },
      medio: { cat: 'All-Round Pista Evolutivo', ref: 'Nucleo legno/composito progressivo (es. Head Shape e-V5 / Atomic Cloud Q9): accompagna il passaggio alle prime conduzioni.' },
      alto: { cat: 'Piste Progression Comfort', ref: 'Costruzione sandwich leggera (es. Völkl Deacon 72 / Fischer RC One 73): massima stabilità sul duro senza affaticare.' }
    },
    intermedio: {
      basso: { cat: 'Frontside Carve Sport (Centro 72–75 mm)', ref: 'Inversione di spigolo rapida e tollerante (es. Elan Primetime 33 / Nordica Spitfire 73).' },
      medio: { cat: 'Sport Carve Multi-Turn', ref: 'Rinforzo in Titanal leggero + smorzamento attivo (es. Head Supershape e-Magnum / Salomon S/Max 10).' },
      alto: { cat: 'High-Performance Piste Carve', ref: 'Precisione chirurgica sul ghiaccio con raggio 14–15 m (es. Stöckli Montero AS / Kästle MX75).' }
    },
    esperto: {
      basso: { cat: 'Race Carve Commerciale (SL / GS)', ref: 'Reattività immediata e tenuta torsionale su neve barrata (es. Rossignol Hero Elite MT Ti / Atomic Redster Q9.8).' },
      medio: { cat: 'Master Race Carve Doppio Titanal', ref: 'Piastra gara e struttura agonistica (es. Head Worldcup Rebels e-Speed / Blizzard Thunderbird R15).' },
      alto: { cat: 'Sci Custom Algoritmico / Workshop', ref: 'Geometria e rigidità calibrati su misura (es. ORIGINAL+ Custom 6X / Wagner Custom Skis).' }
    }
  },
  allmountain: {
    principiante: {
      basso: { cat: 'All-Mountain Light Rocker (80 mm)', ref: 'Spatola rialzata tollerante su cumuli pomeridiani e neve morbida (es. Salomon Stance 80 / K2 Mindbender 85).' },
      medio: { cat: 'All-Mountain Comfort (82 mm)', ref: 'Fibra di basalto e flex progressivo (es. Rossignol Experience 82 Basalt / Elan Wingman 82).' },
      alto: { cat: 'All-Mountain Crossover Leggero', ref: 'Ottima galleggiabilità su neve trasformata e presa sicura in pista (es. Völkl Kanjo 84).' }
    },
    intermedio: {
      basso: { cat: 'All-Mountain Resort (84–86 mm)', ref: 'Versatilità 70% pista / 30% bordo pista su neve rotta (es. Atomic Maverick 86 C).' },
      medio: { cat: 'All-Mountain Titanal (84–88 mm)', ref: 'Struttura rinforzata per condurre sul duro e galleggiare su gobbe (es. Blizzard Anomaly 84 / Head Kore 85 X).' },
      alto: { cat: 'All-Mountain Adattivo Antivibrazione', ref: 'Polimeri a risposta variabile o costruzione artigianale (es. Renoun Endurance 88 VibeStop / Stöckli Stormrider 88).' }
    },
    esperto: {
      basso: { cat: 'All-Mountain Charger (88–90 mm)', ref: 'Rigidità torsionale elevata per sciare ad alta velocità su ogni neve (es. Völkl Mantra M7 / Salomon Stance 90).' },
      medio: { cat: 'Freeride-Carve Crossover (92–94 mm)', ref: 'Potenza in pista e galleggiamento sicuro fuori dalle linee battute (es. Nordica Enforcer 94 / Blizzard Rustler 9).' },
      alto: { cat: 'Custom All-Mountain Biometrico', ref: 'Profilo rocker e flex progettati sull’atleta (es. Wagner Custom All-Mountain / ORIGINAL+ Custom 8X).' }
    }
  },
  fuoripista: {
    principiante: {
      basso: { cat: 'Freeride Entry & Twin-Tip (90–92 mm)', ref: 'Rocker generoso e peso contenuto per i primi approcci in neve fresca (es. Salomon QST 92 / K2 Reckoner 92).' },
      medio: { cat: 'All-Terrain Powder (94–96 mm)', ref: 'Maneggevole nei boschi e gestibile nei rientri in pista (es. Rossignol Sender 94 Ti / Atomic Bent 90).' },
      alto: { cat: 'Freetouring Leggero (95–98 mm)', ref: 'Agilità immediata e peso ridotto anche per brevi risalite con pelli (es. Black Crows Camox / Blizzard Hustle 9).' }
    },
    intermedio: {
      basso: { cat: 'Freeride Playful (98–100 mm)', ref: 'Galleggiabilità naturale e grande manovrabilità sullo stretto (es. Salomon QST 98 / Faction Prodigy 2).' },
      medio: { cat: 'Freeride All-Conditions (100–102 mm)', ref: 'Equilibrio tra galleggiamento in powder e tenuta su neve ventata (es. Blizzard Rustler 10 / Atomic Maverick 100 Ti).' },
      alto: { cat: 'Freeride Carbon Tech (100–105 mm)', ref: 'Anima in legno e carbonio per reattività istantanea (es. DPS Pagoda 100 RP / Black Crows Atris).' }
    },
    esperto: {
      basso: { cat: 'Big Mountain Freeride (106–108 mm)', ref: 'Stabilità assoluta su pendii ripidi e neve rotta ad alta velocità (es. Salomon QST Blank / Nordica Unleashed 108).' },
      medio: { cat: 'Big Mountain Charger (110–114 mm)', ref: 'Struttura rinforzata per linee aggressive e powder profonda (es. Blizzard Cochise / Völkl Revolt 114).' },
      alto: { cat: 'Custom Powder & Big Mountain', ref: 'Sciancratura, rocker e flex costruiti su misura (es. Wagner Custom Powder / DPS Kaizen 112).' }
    }
  }
};

function HelmetInteractiveGuide() {
  const [section, setSection] = useState('anatomy');
  const [layer, setLayer] = useState('shell');
  const [sigleTab, setSigleTab] = useState('standards');
  const [openCard, setOpenCard] = useState(0);
  const [useCase, setUseCase] = useState('piste');

  // Quiz state
  const [qIndex, setQIndex] = useState(0);
  const [selectedAns, setSelectedAns] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQ = HELMET_QUIZ[qIndex];

  const handleAnswer = (idx) => {
    if (selectedAns !== null) return;
    setSelectedAns(idx);
    if (idx === currentQ.correct) setScore((s) => s + 1);
  };

  const handleNextQ = () => {
    if (qIndex < HELMET_QUIZ.length - 1) {
      setQIndex((i) => i + 1);
      setSelectedAns(null);
    } else {
      setFinished(true);
    }
  };

  const resetQuiz = () => {
    setQIndex(0);
    setSelectedAns(null);
    setScore(0);
    setFinished(false);
  };

  return (
    <div className="helmet-lab">
      <div className="helmet-tabs">
        <button className={`helmet-tab ${section === 'anatomy' ? 'active' : ''}`} onClick={() => setSection('anatomy')}>
          Anatomia
        </button>
        <button className={`helmet-tab ${section === 'sigle' ? 'active' : ''}`} onClick={() => setSection('sigle')}>
          Le Sigle
        </button>
        <button className={`helmet-tab ${section === 'choose' ? 'active' : ''}`} onClick={() => setSection('choose')}>
          Consigliatore
        </button>
        <button className={`helmet-tab ${section === 'quiz' ? 'active' : ''}`} onClick={() => setSection('quiz')}>
          Mini Quiz
        </button>
      </div>

      {/* 1. ANATOMIA INTERATTIVA DEL CASCO (SVG Dark Studio) */}
      {section === 'anatomy' && (
        <div>
          <div className="helmet-diagram-box">
            <svg viewBox="0 0 620 345" role="img" aria-label="Sezione illustrativa di un casco da sci">
              <defs>
                <linearGradient id="dark-shell-grad" x1="0.15" y1="0" x2="0.8" y2="1">
                  <stop stopColor={layer === 'shell' ? '#00e5ff' : '#334155'} />
                  <stop offset="1" stopColor={layer === 'shell' ? '#0284c7' : '#0f172a'} />
                </linearGradient>
              </defs>
              <ellipse cx="307" cy="318" rx="175" ry="9" fill="rgba(0, 229, 255, 0.14)" />
              {/* Calotta esterna */}
              <path
                fill="url(#dark-shell-grad)"
                stroke={layer === 'shell' ? '#ffffff' : 'rgba(255,255,255,0.2)'}
                strokeWidth={layer === 'shell' ? '2.5' : '1'}
                d="M130 266C92 230 91 159 124 110C166 47 237 21 309 28C404 35 470 84 509 158L529 201L481 218L455 202C440 195 427 200 418 216L390 261L346 287L300 267L276 246L255 271L230 297L193 300L176 275L154 270Z"
              />
              {/* Prese d'aria */}
              <path d="m224 59 31-6 3 17-29 6zm57-8 31 1-1 17-29-1zm58 7 29 9-5 16-27-9z" fill="#020305" />
              {/* Nucleo assorbente EPS/EPP */}
              <path
                fill={layer === 'foam' ? 'rgba(0, 229, 255, 0.42)' : 'rgba(148, 163, 184, 0.28)'}
                stroke={layer === 'foam' ? '#00e5ff' : 'rgba(255,255,255,0.15)'}
                strokeWidth={layer === 'foam' ? '2.5' : '1'}
                d="M150 247C126 213 127 160 156 121C189 76 243 58 302 65C380 72 433 111 465 171L485 201L459 186C435 173 414 185 400 208L372 247L345 264L307 247L276 217L244 250L220 275L201 277L190 255Z"
              />
              {/* Strato rotazione Mips */}
              <path
                d="M167 238C148 201 154 160 178 131C208 96 250 85 296 90C363 98 407 128 438 177"
                stroke={layer === 'rotation' ? '#ffcc00' : '#f97316'}
                strokeWidth={layer === 'rotation' ? '13' : '8'}
                strokeLinecap="round"
                fill="none"
              />
              {/* Imbottitura interna */}
              <path
                d="M184 229C171 199 177 169 197 147C222 119 254 108 290 114C345 121 384 144 408 173"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="24 10"
                fill="none"
              />
              {/* Sottogola */}
              <path d="m226 286 38 39c8 7 18 7 27 0l62-53" stroke="#64748b" strokeWidth="7" fill="none" strokeLinejoin="round" />
              <rect x="265" y="315" width="24" height="11" rx="4" fill="#ffcc00" transform="rotate(-4 265 315)" />

              {/* Callout lines */}
              <path d="M102 63h44l18 20" stroke={layer === 'shell' ? '#00e5ff' : 'rgba(255,255,255,0.4)'} strokeWidth="1.5" fill="none" />
              <circle cx="164" cy="83" r="4" fill="#00e5ff" />
              <text x="34" y="67" fill="#ffffff" fontSize="13" fontFamily="Inter, sans-serif">Calotta</text>

              <path d="M475 89h-44l-40 19" stroke={layer === 'foam' ? '#00e5ff' : 'rgba(255,255,255,0.4)'} strokeWidth="1.5" fill="none" />
              <circle cx="391" cy="108" r="4" fill="#00e5ff" />
              <text x="484" y="94" fill="#ffffff" fontSize="13" fontFamily="Inter, sans-serif">Assorbimento</text>

              <path d="M84 199h45l35-4" stroke={layer === 'rotation' ? '#ffcc00' : 'rgba(255,255,255,0.4)'} strokeWidth="1.5" fill="none" />
              <circle cx="164" cy="195" r="4" fill="#ffcc00" />
              <text x="20" y="188" fill="#ffcc00" fontSize="13" fontFamily="Inter, sans-serif">Rotazione*</text>
            </svg>
          </div>

          <div className="helmet-layer-btns">
            <button className={`helmet-layer-btn ${layer === 'shell' ? 'active' : ''}`} onClick={() => setLayer('shell')}>
              <span className="layer-dot" style={{ background: '#00e5ff' }} />
              Calotta
            </button>
            <button className={`helmet-layer-btn ${layer === 'foam' ? 'active' : ''}`} onClick={() => setLayer('foam')}>
              <span className="layer-dot" style={{ background: '#94a3b8' }} />
              Assorbimento
            </button>
            <button className={`helmet-layer-btn ${layer === 'rotation' ? 'active' : ''}`} onClick={() => setLayer('rotation')}>
              <span className="layer-dot" style={{ background: '#ffcc00' }} />
              Rotazione
            </button>
          </div>

          <div className="helmet-info-box">
            <h5>{HELMET_LAYERS[layer].title}</h5>
            <p>{HELMET_LAYERS[layer].copy}</p>
          </div>
        </div>
      )}

      {/* 2. LE SIGLE IN CHIARO */}
      {section === 'sigle' && (
        <div>
          <div className="sigle-subtabs">
            {[
              { id: 'standards', label: 'Omologazioni' },
              { id: 'tech', label: 'Tecnologie' },
              { id: 'rescue', label: 'Soccorso' }
            ].map((t) => (
              <button
                key={t.id}
                className={`sigle-subtab ${sigleTab === t.id ? 'active' : ''}`}
                onClick={() => {
                  setSigleTab(t.id);
                  setOpenCard(0);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="sigle-list">
            {HELMET_SIGLE[sigleTab].cards.map((c, idx) => {
              const isOpen = openCard === idx;
              return (
                <div key={c[1]} className="sigle-card" onClick={() => setOpenCard(isOpen ? -1 : idx)}>
                  <div className="sigle-card-head">
                    <div>
                      <div className="sigle-badge">{c[0]}</div>
                      <div className="sigle-card-title">{c[1]}</div>
                      <div className="sigle-card-sub">{c[2]}</div>
                    </div>
                    <span style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem' }}>{isOpen ? '−' : '+'}</span>
                  </div>
                  {isOpen && <p className="sigle-card-detail">{c[3]}</p>}
                </div>
              );
            })}
          </div>

          <p style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {HELMET_SIGLE[sigleTab].note}
          </p>
        </div>
      )}

      {/* 3. CONSIGLIATORE CASCO PER ATTIVITÀ */}
      {section === 'choose' && (
        <div>
          <div className="tf-choice-grid" style={{ marginBottom: '16px' }}>
            <div className={`tf-choice-btn ${useCase === 'piste' ? 'active' : ''}`} onClick={() => setUseCase('piste')}>
              <span>Pista</span>
              <small>EN 1077</small>
            </div>
            <div className={`tf-choice-btn ${useCase === 'race' ? 'active' : ''}`} onClick={() => setUseCase('race')}>
              <span>Gara</span>
              <small>FIS RH 2013</small>
            </div>
            <div className={`tf-choice-btn ${useCase === 'tour' ? 'active' : ''}`} onClick={() => setUseCase('tour')}>
              <span>Skialp</span>
              <small>EN 18100</small>
            </div>
          </div>

          <div className="helmet-info-box">
            <h5>{HELMET_USES[useCase].title}</h5>
            <p>{HELMET_USES[useCase].copy}</p>
          </div>

          <div className="thermo-wink" style={{ marginTop: '14px', marginBottom: 0 }}>
            <strong>La calzata conta:</strong> provalo sempre con la tua maschera per evitare spazi vuoti sulla fronte, regola il sottogola e verifica che rimanga stabile.
          </div>
        </div>
      )}

      {/* 4. MINI QUIZ INTERATTIVO */}
      {section === 'quiz' && (
        <div>
          {!finished ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <span>
                  Domanda {qIndex + 1} di {HELMET_QUIZ.length}
                </span>
                <span>{score} corrette</span>
              </div>
              <h5 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.15rem', color: '#ffffff' }}>{currentQ.question}</h5>

              <div className="quiz-options">
                {currentQ.answers.map((ans, idx) => {
                  let cls = 'quiz-opt-btn';
                  if (selectedAns !== null) {
                    if (idx === currentQ.correct) cls += ' correct';
                    else if (idx === selectedAns) cls += ' incorrect';
                  }
                  return (
                    <button key={idx} className={cls} disabled={selectedAns !== null} onClick={() => handleAnswer(idx)}>
                      <span className="quiz-letter">
                        {selectedAns !== null && idx === currentQ.correct
                          ? '✓'
                          : selectedAns === idx
                          ? '×'
                          : String.fromCharCode(65 + idx)}
                      </span>
                      <span>{ans}</span>
                    </button>
                  );
                })}
              </div>

              {selectedAns !== null && (
                <p style={{ marginTop: '12px', fontSize: '0.84rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.82)' }}>
                  <strong style={{ color: selectedAns === currentQ.correct ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
                    {selectedAns === currentQ.correct ? 'Esatto. ' : 'Da ricordare. '}
                  </strong>
                  {currentQ.explanation}
                </p>
              )}

              <button className="quiz-action-btn" disabled={selectedAns === null} onClick={handleNextQ}>
                {qIndex === HELMET_QUIZ.length - 1 ? 'Vedi il risultato' : 'Prossima domanda'}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--accent-cyan)' }}>
                Quiz completato
              </p>
              <h3 style={{ fontSize: '2.8rem', color: 'var(--accent-gold)', margin: '8px 0' }}>
                {score} / {HELMET_QUIZ.length}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.55 }}>
                {score === 3
                  ? 'Perfetto: hai distinto omologazioni, tecnologie costruttive e sistemi di soccorso.'
                  : 'Rivedi le schede tra omologazioni e tecnologie, poi riprova con calma.'}
              </p>
              <button className="quiz-action-btn" onClick={resetQuiz}>
                Riprova il quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
      // Spostato ancora più a sinistra (-0.92) quando il pannello è aperto
      const targetX = activeItem && isDesktop ? -0.92 : 0;
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
          <div
            className={`hotspot-container ${side} ${activeItem === id ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(activeItem === id ? null : id, false);
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

      <Hotspot pos={[0.06, 0.92, 0.08]} id="casco" side="right" />
      <Hotspot pos={[-0.09, 0.80, 0.12]} id="maschera_outof" side="left" />
      <Hotspot pos={[0.11, 0.70, 0.08]} id="maschera_audio" side="right" />
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
  const [openedFromMacro, setOpenedFromMacro] = useState(false);

  const [dinW, setDinW] = useState(75);
  const [dinType, setDinType] = useState(2);

  const [quizTerrain, setQuizTerrain] = useState('pista');
  const [quizLevel, setQuizLevel] = useState('intermedio');
  const [quizBudget, setQuizBudget] = useState('medio');

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
  const skiRec = SKI_RECOMMENDATIONS[quizTerrain][quizLevel][quizBudget];

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

      {/* Menu Macro Desktop (Max 4) */}
      <nav className={`macro-dock ${activeItem ? 'hidden' : ''}`}>
        {MACROS.map((m) => (
          <button
            key={m.id}
            className="macro-btn"
            onClick={() => handleSelectItem(m.items[0], true)}
            onMouseEnter={() => document.body.classList.add('cursor-hovering')}
            onMouseLeave={() => document.body.classList.remove('cursor-hovering')}
          >
            {m.label}
          </button>
        ))}
      </nav>

      {/* Pannello Laterale */}
      <aside className={`side-panel ${activeItem ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => handleSelectItem(null, false)}>
          ✕ Chiudi esplorazione
        </button>

        {/* Mostra le sottocategorie SOLO se si naviga dal menu macro in basso */}
        {activeMacroObj && activeMacroObj.items.length > 1 && (
          <div className="sub-nav">
            {activeMacroObj.items.map((subId) => (
              <button
                key={subId}
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

            {/* Modulo Interattivo Casco (Anatomia, Sigle, Consigliatore, Quiz) */}
            {data.id === 'casco' && <HelmetInteractiveGuide />}

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

            {/* Consigliatore Sci (27 profili differenziati) */}
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
                    {skiRec.cat}
                  </h3>
                  <p style={{ marginTop: '10px', fontSize: '0.84rem', textTransform: 'none', letterSpacing: 'normal', color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>
                    {skiRec.ref}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}