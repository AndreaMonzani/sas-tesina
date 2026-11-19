import React, { useState, useRef, useEffect, useMemo, Suspense, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
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
          Usa il menu in basso per esplorare le categorie.
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
    title: 'Dentro un Casco da Sci',
    brand: 'Visita Sena Snow ↗',
    url: 'https://www.sena.com',
    novita: [
      'Calotta esterna ibrida (policarbonato / ABS / compositi) e nucleo assorbente EPS / EPP',
      'Protezione negli impatti obliqui (Mips, Koroyd, WaveCel) e omologazioni EN 1077 A/B, ASTM F2040, FIS RH 2013',
      'Sistemi di soccorso (RECCO, NFC Twiceme) e comunicazione Mesh Sena'
    ],
    info: 'La calotta distribuisce il carico, il nucleo si deforma assorbendo energia e gli strati interni gestiscono le forze rotazionali negli impatti obliqui.',
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
      'Isolamento spaziale in Aerogel a spessore ultra-ridotto e riscaldamento attivo Heat Sphere',
      'Membrane impermeabili ad alte prestazioni (colonna d’acqua 20.000+ mm), cuciture termonastrate e trattamento DWR'
    ],
    info: 'Oltre all’Aerogel (che blocca la dispersione termica) e alle resistenze Heat Sphere, è decisiva la barriera esterna: l’impermeabilità si misura in colonna d’acqua (10.000 mm reggono neve leggera, oltre 20.000 mm con cuciture nastrate proteggono anche sotto nevicate umide o in seggiovia bagnata), abbinata alla traspirabilità (g/m²/24h) per evacuare il sudore.',
    consiglio: 'Per l’amatore bastano 10k–15k mm; per il Maestro o il freerider servono >20k mm, Aerogel e calzini riscaldati per gestire l’alternanza tra sforzo e soste al freddo.'
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
  bastoni: {
    id: 'bastoni',
    macro: 'sicurezza',
    shortLabel: 'Bastoni',
    title: 'Bastoni & Misura',
    brand: 'Visita Nordica Poles ↗',
    url: 'https://www.nordica.com',
    novita: [
      'Tubi in carbonio ad alto modulo con bilanciamento spostato verso l’impugnatura',
      'Impugnature ergonomiche 3D e sistemi di sgancio di sicurezza'
    ],
    info: 'La lunghezza corretta del bastone mantiene il baricentro centrale e favorisce il tempismo di ingresso curva senza arretrare con le spalle.',
    consiglio: 'Fino a Livello 5 si usa il divisore 1,50 (assetto centrale); dal Livello 6 al Pro si passa a 1,53 per un assetto più raccolto.'
  },
  scarpone: {
    id: 'scarpone',
    macro: 'performance',
    shortLabel: 'Fit & Calzata',
    title: 'Fit & Calzata',
    brand: 'Scopri Nordica & BOA ↗',
    url: 'https://www.nordica.com',
    novita: [
      'Chiusura BOA Dial sullo scafo inferiore per avvolgimento a 360° (es. Nordica Speedmachine 3 BOA)',
      'Termoformatura personalizzata di scarpetta e scafo in 10–15 minuti (Infrared Technology)',
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
    consiglio: 'Usa il calcolatore ISO 11088 qui sotto per ricavare il valore DIN corretto in base ai tuoi parametri.'
  },
  telemetria: {
    id: 'telemetria',
    macro: 'dati_visione',
    shortLabel: 'Telemetria IA',
    title: 'Telemetria, GPS & AI',
    brand: 'Scopri Carv 2 ↗',
    url: 'https://getcarv.com',
    novita: [
      'Carv 2: punteggio Ski:IQ, angolazione di spigolo, simmetria destra/sinistra, G-Force e bilanciamento anteroposteriore con coaching vocale live',
      'Lympic & GPS Pro per atleti: tracciamento traiettorie, velocità istantanea e intertempi al centesimo senza fotocellule fisse',
      'Pettorine GPS per bambini e scuole sci: geolocalizzazione in tempo reale del gruppo e allerta allontanamento'
    ],
    info: 'Carv 2 elabora migliaia di campioni per discesa offrendo statistiche dettagliate a fine giornata e correzioni vocali istantanee. In ambito agonistico, Lympic e i sistemi GPS professionali analizzano linee e micro-variazioni di velocità; nella didattica, le pettorine GPS garantiscono sicurezza attiva per i bambini.',
    consiglio: 'Carv 2 è perfetto per chi vuole migliorare la tecnica con dati oggettivi; le pettorine GPS rappresentano uno standard di sicurezza sempre più apprezzato da scuole sci e famiglie.'
  },
  sci: {
    id: 'sci',
    macro: 'performance',
    shortLabel: 'Sci & Struttura',
    title: 'Sci & Struttura',
    brand: 'Esplora Gamma Nordica ↗',
    url: 'https://www.nordica.com',
    novita: [
      'Costruzione Energy TI Double Core (Nordica Spitfire / Dobermann DC): doppio nucleo in legno con Titanal ed elastomero',
      'Costruzione algoritmica su misura (ORIGINAL+ Custom 6X) e smorzamento piezoelettrico (HEAD EMC)',
      'Ricerca: Smart Ski Experience (Rossignol/CEA) che genera energia sciando'
    ],
    info: 'La tecnologia Double Core inserisce uno strato antivibrazione tra due anime in legno, garantendo fluidità sul duro e precisione in conduzione.',
    consiglio: 'Usa il configuratore qui sotto per trovare il modello Nordica e la categoria di sci ideale per te.'
  }
};

const BOOT_BRANDS = [
  {
    name: 'Nordica',
    tech: 'Infrared + Tri-Force + BOA',
    desc: 'Personalizzazione mirata a lampada infrarossi su scafi Speedmachine e Sportmachine senza stressare la plastica.',
    url: 'https://www.nordica.com'
  },
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
  }
];

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
    title: 'Protezione negli impatti obliqui',
    copy: 'Sistemi come Mips permettono un micro-scorrimento interno (10–15 mm) progettato per ridurre le forze rotazionali trasmesse al cervello durante gli impatti obliqui.'
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
      ['Impatti obliqui', 'Mips', 'Riduce le forze rotazionali.', 'Strato a basso attrito (Multi-directional Impact Protection System) che consente uno scorrimento relativo di 10–15 mm negli urti obliqui.'],
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
    answers: [
      'un’omologazione obbligatoria da gara.',
      'un sistema che riduce le forze rotazionali negli impatti obliqui.',
      'un localizzatore GPS.'
    ],
    correct: 1,
    explanation: 'Mips (Multi-directional Impact Protection System) è una tecnologia costruttiva per gli impatti obliqui. EN 1077 e ASTM F2040 sono invece standard di prova.'
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

const calcDIN = (w, h, type, boot) => {
  let base = w / 10;
  if (h < 155) base -= 0.5;
  if (type === 2) base += 1.0;
  if (type === 3) base += 2.2;
  const factor = 290 / Math.max(240, Math.min(360, boot || 305));
  return (Math.round(Math.max(0.75, Math.min(13, base * factor)) * 4) / 4).toFixed(2);
};

const calcPole = (h, levelStr) => {
  const exact = Math.round(h / (levelStr === 'l1' ? 1.50 : 1.53));
  const commercial = Math.round(exact / 5) * 5;
  return { exact, commercial };
};

const calcLayering = (temp) => {
  if (temp <= -12) {
    return {
      title: 'Assetto Artico (-12°C e oltre)',
      detail: 'Intimo Merino pesante + Midlayer in Aerogel + Guscio 20.000 mm + Calzini e guanti riscaldati attivamente (Heat Sphere).'
    };
  }
  if (temp <= -3) {
    return {
      title: 'Assetto Invernale (-3°C / -11°C)',
      detail: 'Intimo termico traspirante + Pile tecnico / isolamento leggero + Giacca 20k mm termonastrata e scaldacollo antivento.'
    };
  }
  return {
    title: 'Assetto Primaverile (sopra -2°C)',
    detail: 'Intimo leggero ad asciugatura rapida + Guscio 3L sfoderato (15k–20k mm) con zip di ventilazione aperte.'
  };
};

// 27 combinazioni orientate sulla gamma Nordica
const SKI_RECOMMENDATIONS = {
  pista: {
    principiante: {
      basso: {
        cat: 'Nordica Spitfire 73 · Easy Carve',
        ref: 'Sciancratura multi-raggio morbida e rocker in spatola per curvare con il minimo sforzo fin dalle prime discese.'
      },
      medio: {
        cat: 'Nordica Spitfire 75 FDT · Progression',
        ref: 'Nucleo leggero e tollerante (75 mm al centro): accompagna la transizione dallo spazzaneve agli sci paralleli.'
      },
      alto: {
        cat: 'Nordica Spitfire CA FDT · Piste Comfort',
        ref: 'Costruzione in legno e carbonio (senza Titanal) per avere stabilità sul duro restando agile e riposante tutto il giorno.'
      }
    },
    intermedio: {
      basso: {
        cat: 'Nordica Spitfire CA · Frontside Sport',
        ref: 'Inversione di spigolo rapida e intuitiva su piste battute per affinare la conduzione a velocità medie.'
      },
      medio: {
        cat: 'Nordica Spitfire TI FDT · Sport Carve',
        ref: 'Rinforzo in Titanal ed elastomero: grande tenuta sul ghiaccio mattutino con raggio polivalente.'
      },
      alto: {
        cat: 'Nordica Dobermann Multipista DC 74 TI',
        ref: 'Tecnologia Energy TI Double Core: stabilità di derivazione race unita a una spatola docile e gestibile.'
      }
    },
    esperto: {
      basso: {
        cat: 'Nordica Dobermann SLR DC / GSR DC',
        ref: 'Precisione chirurgica nello stretto (SLR) o negli archi ampi (GSR) con piastra FDT ad alta trasmissione.'
      },
      medio: {
        cat: 'Nordica Dobermann Multigara DC',
        ref: 'Doppio nucleo in legno e doppio Titanal per sciatori di livello L6–L7 che spingono al massimo sul ripido.'
      },
      alto: {
        cat: 'Nordica Dobermann FIS / Custom Workshop',
        ref: 'Struttura gara pura (Dobermann GS/SL WC Dept) oppure sci su misura algoritmico (ORIGINAL+ Custom 6X).'
      }
    }
  },
  allmountain: {
    principiante: {
      basso: {
        cat: 'Nordica Steadfast 75 CA · All-Mountain Light',
        ref: 'Leggero e facile da girare, perdona gli arretramenti e gestisce bene la neve smossa del pomeriggio.'
      },
      medio: {
        cat: 'Nordica Steadfast 80 CA · Resort Comfort',
        ref: 'Centro da 80 mm con nucleo Energy CA: equilibrio ideale tra pista battuta e primi bordi pista.'
      },
      alto: {
        cat: 'Nordica Wild Belle 78 CA / Steadfast 80',
        ref: 'Profilo rocker progressivo per sciare in totale controllo da mattina a sera con pochissimo affaticamento.'
      }
    },
    intermedio: {
      basso: {
        cat: 'Nordica Steadfast 80 DC · Double Core',
        ref: 'Ammortizzazione naturale grazie al Double Core: assorbe le sconnessioni della neve rotta senza vibrare.'
      },
      medio: {
        cat: 'Nordica Steadfast 85 DC · All-Conditions',
        ref: '85 mm sotto il piede con rinforzo in elastomero: perfetto 70% pista e 30% neve fresca a bordo tracciato.'
      },
      alto: {
        cat: 'Nordica Enforcer 89 · All-Mountain Performance',
        ref: 'Anima in legno, doppio Titanal e spatola in carbonio: conduce come uno sci da pista ma galleggia ovunque.'
      }
    },
    esperto: {
      basso: {
        cat: 'Nordica Enforcer 89 / Dobermann Multipista 80',
        ref: 'Reattività e rigidità torsionale elevate per carvare forte anche su neve trasformata o primaverile.'
      },
      medio: {
        cat: 'Nordica Enforcer 94 · Benchmark All-Mountain',
        ref: 'Il riferimento assoluto per gli sciatori esperti che cercano un unico sci potente su ogni tipo di neve.'
      },
      alto: {
        cat: 'Nordica Enforcer 99 / Custom Biometrico',
        ref: 'Massima potenza e galleggiamento ad alta velocità (o profilo su misura Wagner / ORIGINAL+ Custom 8X).'
      }
    }
  },
  fuoripista: {
    principiante: {
      basso: {
        cat: 'Nordica Unleashed 90 · Freeride Entry',
        ref: 'Twin-tip agile e leggero (90 mm) per prendere confidenza con neve fresca, gobbe e boschetti.'
      },
      medio: {
        cat: 'Nordica Unleashed 98 CA · Playful Powder',
        ref: 'Costruzione senza metallo per una risposta elastica e intuitiva nei primi approcci fuori pista.'
      },
      alto: {
        cat: 'Nordica Unlimited 94 · Freetouring Light',
        ref: 'Peso contenuto per combinare discese in neve fresca e brevi risalite con le pelli di foca.'
      }
    },
    intermedio: {
      basso: {
        cat: 'Nordica Unleashed 98 · All-Terrain Freeski',
        ref: 'Foglio di Titanal sagomato per unire pop creativo, galleggiamento in powder e tenuta nei rientri in pista.'
      },
      medio: {
        cat: 'Nordica Enforcer 104 · Freeride Versatility',
        ref: 'Stabilità fluida su neve ventata e tracciata grazie alla costruzione Energy 2 TI True Tip.'
      },
      alto: {
        cat: 'Nordica Unlimited 104 · Backcountry Tour',
        ref: 'Rocker generoso e leggerezza strutturale per affrontare itinerari freeride impegnativi.'
      }
    },
    esperto: {
      basso: {
        cat: 'Nordica Unleashed 106 · Big Mountain Agile',
        ref: 'Galleggiamento immediato e controllo totale nei canali ripidi e nei boschi fitti.'
      },
      medio: {
        cat: 'Nordica Unleashed 114 · Deep Powder Charger',
        ref: '114 mm al centro con doppio rocker e Titanal per surfare la polvere profonda ad alta velocità.'
      },
      alto: {
        cat: 'Nordica Unleashed 120 · Pro Backcountry',
        ref: 'Il modello più largo della gamma Nordica, sviluppato con gli atleti del Freeride World Tour.'
      }
    }
  }
};

function HelmetInteractiveGuide() {
  const [section, setSection] = useState('anatomy');
  const [layer, setLayer] = useState('shell');
  const [sigleTab, setSigleTab] = useState('standards');
  const [openCard, setOpenCard] = useState(0);
  const [useCase, setUseCase] = useState('piste');

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
              <path
                fill="url(#dark-shell-grad)"
                stroke={layer === 'shell' ? '#ffffff' : 'rgba(255,255,255,0.2)'}
                strokeWidth={layer === 'shell' ? '2.5' : '1'}
                d="M130 266C92 230 91 159 124 110C166 47 237 21 309 28C404 35 470 84 509 158L529 201L481 218L455 202C440 195 427 200 418 222L390 261L346 287L300 267L276 246L255 271L230 297L193 300L176 275L154 270Z"
              />
              <path d="m224 59 31-6 3 17-29 6zm57-8 31 1-1 17-29-1zm58 7 29 9-5 16-27-9z" fill="#020305" />
              <path
                fill={layer === 'foam' ? 'rgba(0, 229, 255, 0.42)' : 'rgba(148, 163, 184, 0.28)'}
                stroke={layer === 'foam' ? '#00e5ff' : 'rgba(255,255,255,0.15)'}
                strokeWidth={layer === 'foam' ? '2.5' : '1'}
                d="M150 247C126 213 127 160 156 121C189 76 243 58 302 65C380 72 433 111 465 171L485 201L459 186C435 173 414 185 400 208L372 247L345 264L307 247L276 217L244 250L220 275L201 277L190 255Z"
              />
              <path
                d="M167 238C148 201 154 160 178 131C208 96 250 85 296 90C363 98 407 128 438 177"
                stroke={layer === 'rotation' ? '#ffcc00' : '#f97316'}
                strokeWidth={layer === 'rotation' ? '13' : '8'}
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M184 229C171 199 177 169 197 147C222 119 254 108 290 114C345 121 384 144 408 173"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="24 10"
                fill="none"
              />
              <path d="m226 286 38 39c8 7 18 7 27 0l62-53" stroke="#64748b" strokeWidth="7" fill="none" strokeLinejoin="round" />
              <rect x="265" y="315" width="24" height="11" rx="4" fill="#ffcc00" transform="rotate(-4 265 315)" />

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
        </div>
      )}

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

  const [dinW, setDinW] = useState(75);
  const [dinH, setDinH] = useState(176);
  const [dinBoot, setDinBoot] = useState(305);
  const [dinType, setDinType] = useState(2);

  const [poleH, setPoleH] = useState(176);
  const [poleL, setPoleL] = useState('l1');

  const [temp, setTemp] = useState(-5);

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
  const poleRes = calcPole(poleH, poleL);
  const layerRes = calcLayering(temp);

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

      <aside className={`side-panel ${activeItem ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => handleSelectItem(null, false)}>
          ✕ Chiudi esplorazione
        </button>

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

            {data.id === 'casco' && <HelmetInteractiveGuide />}

            {data.id === 'termoregolazione' && (
              <>
                <div className="thermo-section">
                  <h4>Protezione & Impermeabilità (Colonna d’Acqua)</h4>
                  <p className="thermo-intro">
                    La colonna d’acqua misura la pressione (in millimetri) che il tessuto sopporta prima di lasciar passare l’umidità: <strong>10.000 mm</strong> bastano per neve asciutta o brevi nevicate, mentre <strong>20.000+ mm</strong> (abbinati a cuciture termonastrate e trattamento idrorepellente DWR) garantiscono tenuta totale sotto neve bagnata e vento forte.
                  </p>
                  <div className="thermo-wink" style={{ marginBottom: 0 }}>
                    <strong>Equilibrio termico:</strong> l’impermeabilità da sola non basta senza traspirabilità (almeno 15.000–20.000 g/m²/24h) per evacuare il vapore corporeo ed evitare il raffreddamento in seggiovia.
                  </div>
                </div>

                <div className="typeform-module">
                  <h4 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent-cyan)', marginBottom: '16px' }}>
                    Simulatore: Quanto coprirsi?
                  </h4>
                  <div className="tf-slider-group">
                    <div className="tf-slider-header">
                      <label>Temperatura in Pista</label>
                      <span>{temp}°C</span>
                    </div>
                    <input type="range" min="-20" max="10" value={temp} onChange={(e) => setTemp(Number(e.target.value))} />
                  </div>
                  <div className="tf-result">
                    <p>{layerRes.title}</p>
                    <h3 style={{ fontSize: '1.15rem', color: '#fff', lineHeight: 1.45, marginTop: '8px' }}>
                      {layerRes.detail}
                    </h3>
                  </div>
                </div>
              </>
            )}

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

            {data.id === 'attacchi' && (
              <div className="typeform-module">
                <h4 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent-cyan)', marginBottom: '16px' }}>
                  Calcolatore DIN (ISO 11088)
                </h4>
                <div className="tf-slider-group">
                  <div className="tf-slider-header">
                    <label>Peso (kg)</label>
                    <span>{dinW} kg</span>
                  </div>
                  <input type="range" min="40" max="115" value={dinW} onChange={(e) => setDinW(Number(e.target.value))} />
                </div>
                <div className="tf-slider-group">
                  <div className="tf-slider-header">
                    <label>Altezza (cm)</label>
                    <span>{dinH} cm</span>
                  </div>
                  <input type="range" min="145" max="205" value={dinH} onChange={(e) => setDinH(Number(e.target.value))} />
                </div>
                <div className="tf-slider-group">
                  <div className="tf-slider-header">
                    <label>Scafo Scarpone (mm)</label>
                    <span>{dinBoot} mm</span>
                  </div>
                  <input type="range" min="250" max="350" value={dinBoot} onChange={(e) => setDinBoot(Number(e.target.value))} />
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
                  <h3>{calcDIN(dinW, dinH, dinType, dinBoot)}</h3>
                </div>
              </div>
            )}

            {data.id === 'bastoni' && (
              <div className="typeform-module">
                <h4 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent-cyan)', marginBottom: '16px' }}>
                  Calcolatore Altezza Bastone
                </h4>
                <div className="tf-slider-group">
                  <div className="tf-slider-header">
                    <label>Altezza Sciatore (cm)</label>
                    <span>{poleH} cm</span>
                  </div>
                  <input type="range" min="145" max="205" value={poleH} onChange={(e) => setPoleH(Number(e.target.value))} />
                </div>
                <div className="tf-slider-group">
                  <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    Livello Tecnico (Scuola Sci Italiana)
                  </label>
                  <div className="tf-choice-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className={`tf-choice-btn ${poleL === 'l1' ? 'active' : ''}`} onClick={() => setPoleL('l1')}>
                      <span>Fino a L5</span>
                      <small>Altezza / 1,50</small>
                    </div>
                    <div className={`tf-choice-btn ${poleL === 'l6' ? 'active' : ''}`} onClick={() => setPoleL('l6')}>
                      <span>L6 – Pro</span>
                      <small>Altezza / 1,53</small>
                    </div>
                  </div>
                </div>
                <div className="tf-result">
                  <p>Lunghezza Consigliata</p>
                  <h3>
                    {poleRes.exact} cm{' '}
                    <small style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                      (misura {poleRes.commercial} cm)
                    </small>
                  </h3>
                </div>
              </div>
            )}

            {data.id === 'sci' && (
              <div className="typeform-module">
                <h4 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent-cyan)', marginBottom: '16px' }}>
                  Consigliatore Sci · Gamma Nordica
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
                  <p>Modello & Categoria Consigliata</p>
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