import React, { useState } from 'react';

/* --- COMPONENTI COMUNI RIUTILIZZABILI --- */
function LabTabs({ activeTab, onChange, labels = ['Anatomia', 'Tecnologie e sigle', 'Prova tu', 'Mini quiz'] }) {
  const keys = ['anatomy', 'tech', 'try', 'quiz'];
  return (
    <div className="lab-tabs" role="tablist">
      {keys.map((k, idx) => (
        <button
          key={k}
          type="button"
          role="tab"
          aria-selected={activeTab === k}
          className={`lab-tab ${activeTab === k ? 'active' : ''}`}
          onClick={() => onChange(k)}
        >
          {labels[idx]}
        </button>
      ))}
    </div>
  );
}

function TechAccordionList({ items }) {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <div className="tech-accordion-list">
      {items.map((item, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div key={item.title} className="tech-accordion">
            <button
              type="button"
              className="tech-accordion-btn"
              aria-expanded={isOpen}
              onClick={() => setOpenIdx(isOpen ? -1 : idx)}
            >
              <div>
                <span className={`tech-badge ${item.isResearch ? 'research' : ''}`}>{item.badge}</span>
                <div className="tech-accordion-title">{item.title}</div>
                <div className="tech-accordion-sub">{item.subtitle}</div>
              </div>
              <span style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem' }}>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <div className="tech-accordion-body">{item.body}</div>}
          </div>
        );
      })}
    </div>
  );
}

function QuizModule({ questions }) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[qIndex];

  const choose = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  };

  const restart = () => {
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '14px 4px' }}>
        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--accent-cyan)' }}>
          Quiz completato
        </p>
        <h3 style={{ fontSize: '2.6rem', color: 'var(--accent-gold)', margin: '8px 0' }}>
          {score} / {questions.length}
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.55, marginBottom: '14px' }}>
          {score === questions.length
            ? 'Ottimo lavoro: hai colto tutte le differenze tecniche chiave.'
            : 'Riguarda le schede Anatomia e Tecnologie e sigle, poi riprova.'}
        </p>
        <button type="button" className="action-btn" onClick={restart}>
          Riprova il quiz
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
        <span>
          Domanda {qIndex + 1} di {questions.length}
        </span>
        <span>{score} corrette</span>
      </div>
      <h5 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', color: '#ffffff', lineHeight: 1.35 }}>
        {q.question}
      </h5>
      <div className="quiz-options">
        {q.answers.map((ans, idx) => {
          let cls = 'quiz-opt-btn';
          if (selected !== null) {
            if (idx === q.correct) cls += ' correct';
            else if (idx === selected) cls += ' incorrect';
          }
          return (
            <button key={idx} type="button" className={cls} disabled={selected !== null} onClick={() => choose(idx)}>
              <span className="quiz-letter">
                {selected !== null && idx === q.correct ? '✓' : selected === idx ? '×' : String.fromCharCode(65 + idx)}
              </span>
              <span>{ans}</span>
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <p style={{ marginTop: '12px', fontSize: '0.85rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.84)' }}>
          <strong style={{ color: selected === q.correct ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
            {selected === q.correct ? 'Esatto. ' : 'Da ricordare. '}
          </strong>
          {q.explanation}
        </p>
      )}
      <button type="button" className="action-btn" style={{ marginTop: '14px' }} disabled={selected === null} onClick={next}>
        {qIndex === questions.length - 1 ? 'Vedi il risultato' : 'Prossima domanda'}
      </button>
    </div>
  );
}

function LabFooter({ sources }) {
  return (
    <div className="lab-footer">
      <div className="lab-sources">
        {sources.map((s) => (
          <a key={s.label} href={s.url} target="_blank" rel="noreferrer">
            {s.label} ↗
          </a>
        ))}
      </div>
      <span>Ultimo controllo fonti: 19 novembre 2026</span>
    </div>
  );
}

/* ============================================================================
   1. LABORATORIO CASCHI: "DENTRO UN CASCO DA SCI"
   ============================================================================ */
function HelmetLab() {
  const [tab, setTab] = useState('anatomy');
  const [layer, setLayer] = useState('shell');
  const [sigleCat, setSigleCat] = useState('standards');
  const [useCase, setUseCase] = useState('piste');

  const layers = {
    shell: {
      title: 'Calotta esterna — La prima barriera',
      copy: 'Protegge il nucleo interno e distribuisce il carico dell’impatto. Può essere in policarbonato (in-mold leggero), ABS rigido o fibre composite.'
    },
    foam: {
      title: 'Materiale assorbente — Nucleo EPS / EPP',
      copy: 'Si deforma durante l’urto assorbendo energia cinetica. L’EPS si schiaccia in modo permanente; l’EPP ha maggiore recupero elastico. Dopo un urto severo va comunque sostituito.'
    },
    rotation: {
      title: 'Gestione della rotazione — Impatti obliqui',
      copy: 'Sistemi come Mips permettono un micro-scorrimento interno (10–15 mm) progettato per ridurre le forze rotazionali trasmesse alla testa negli impatti angolati.'
    }
  };

  const sigleItems = {
    standards: [
      {
        badge: 'Norma europea',
        title: 'EN 1077 · Classe A',
        subtitle: 'Maggiore copertura laterale.',
        body: 'Prevede una copertura più estesa sulle orecchie e una prova di penetrazione più severa rispetto alla classe B. La sola classe A non equivale a FIS RH 2013.'
      },
      {
        badge: 'Norma europea',
        title: 'EN 1077 · Classe B',
        subtitle: 'Ventilazione e percezione acustica.',
        body: 'Consente paraorecchie morbidi o rimovibili, favorendo aerazione e ascolto dell’ambiente. È lo standard più diffuso nei caschi da pista.'
      },
      {
        badge: 'Standard USA',
        title: 'ASTM F2040',
        subtitle: 'Prove d’impatto su neve.',
        body: 'Include test d’impatto su incudini diverse, stabilità della calzata e resistenza del cinturino sottogola.'
      },
      {
        badge: 'Requisiti gara',
        title: 'FIS RH 2013',
        subtitle: 'Obbligatorio per GS, SG e DH FIS.',
        body: 'Richiede EN 1077 A + ASTM F2040 + prova aggiuntiva d’impatto a 6,8 m/s (velocità di test di laboratorio, non limite massimo di sciata garantito).'
      }
    ],
    tech: [
      {
        badge: 'Tecnologia · Impatti obliqui',
        title: 'Mips (Integra / Spherical)',
        subtitle: 'Strato a basso attrito interno.',
        body: 'Consente un piccolo movimento relativo tra testa e calotta negli urti obliqui. È una tecnologia costruttiva, non un’omologazione.'
      },
      {
        badge: 'Tecnologia · Assorbimento',
        title: 'Koroyd',
        subtitle: 'Struttura a tubi saldati.',
        body: 'I micro-tubi si accartocciano in modo controllato dissipando energia e favorendo il passaggio dell’aria.'
      },
      {
        badge: 'Tecnologia · Struttura cellulare',
        title: 'WaveCel',
        subtitle: 'Flette, collassa e scorre.',
        body: 'Rete cellulare progettata per gestire sia le componenti dirette sia quelle rotazionali dell’urto.'
      }
    ],
    rescue: [
      {
        badge: 'Ricerca soccorritori',
        title: 'RECCO',
        subtitle: 'Riflettore passivo senza batteria.',
        body: 'Rilevabile dai soccorritori dotati di detector RECCO. Non invia autonomamente un SOS e non sostituisce ARTVA, pala e sonda.'
      },
      {
        badge: 'Identificazione',
        title: 'NFC / Twiceme',
        subtitle: 'Scheda medica leggibile con smartphone.',
        body: 'Avvicinando un telefono si leggono contatti e dati d’emergenza salvati. Non localizza a distanza lo sciatore.'
      },
      {
        badge: 'Rilevazione caduta',
        title: 'Sensori con SOS (es. LIVALL)',
        subtitle: 'Allarme automatico via app.',
        body: 'Rileva un urto forte e invia un avviso ai contatti tramite smartphone abbinato (dipende da batteria e copertura rete).'
      }
    ]
  };

  const uses = {
    piste: {
      title: 'Pista & All-Mountain',
      copy: 'Verifica la certificazione EN 1077 (A o B) e consulta test indipendenti sul singolo modello (es. Virginia Tech). Provalo sempre insieme alla maschera.'
    },
    race: {
      title: 'Gara GS / SG / DH',
      copy: 'Controlla la presenza dell’etichetta FIS RH 2013 sulla calotta. Il solo logo Mips non rende un casco idoneo alle competizioni FIS.'
    },
    tour: {
      title: 'Scialpinismo',
      copy: 'Cerca la norma dedicata EN 18100 (o doppia certificazione sci EN 1077 + alpinismo EN 12492) per proteggere anche dalla caduta di sassi o ghiaccio.'
    }
  };

  const quiz = [
    {
      question: 'Mips è…',
      answers: [
        'un’omologazione obbligatoria da gara.',
        'un sistema che riduce le forze rotazionali negli impatti obliqui.',
        'un localizzatore satellitare GPS.'
      ],
      correct: 1,
      explanation: 'Mips è una tecnologia costruttiva per gli impatti obliqui; EN 1077 e ASTM F2040 sono invece norme di omologazione.'
    },
    {
      question: 'Che cosa fa un riflettore RECCO?',
      answers: [
        'Invia automaticamente un SOS con la posizione.',
        'Mostra la posizione su qualsiasi telefono.',
        'Aiuta la ricerca da parte di soccorritori con rilevatore dedicato.'
      ],
      correct: 2,
      explanation: 'È un riflettore passivo senza batteria: riflette il segnale del rilevatore RECCO dei soccorritori.'
    },
    {
      question: 'Per una gara FIS di gigante, quale etichetta cerchi?',
      answers: ['FIS RH 2013.', 'Soltanto Mips.', 'Soltanto EN 1078 per ciclismo.'],
      correct: 0,
      explanation: 'FIS RH 2013 unisce EN 1077 A, ASTM F2040 e il test d’impatto aggiuntivo a 6,8 m/s.'
    }
  ];

  return (
    <div className="lab-shell">
      <div className="lab-header">
        <div>
          <span className="lab-eyebrow">Laboratorio interattivo</span>
          <h4 className="lab-title">Dentro un casco da sci</h4>
        </div>
      </div>

      <LabTabs activeTab={tab} onChange={setTab} />

      {tab === 'anatomy' && (
        <div>
          <div className="diagram-stage">
            <svg viewBox="0 0 620 330" role="img" aria-label="Sezione schematica di un casco da sci">
              <defs>
                <linearGradient id="h-shell" x1="0.15" y1="0" x2="0.8" y2="1">
                  <stop stopColor={layer === 'shell' ? '#00e5ff' : '#334155'} />
                  <stop offset="1" stopColor={layer === 'shell' ? '#0284c7' : '#0f172a'} />
                </linearGradient>
              </defs>
              <path
                fill="url(#h-shell)"
                stroke={layer === 'shell' ? '#ffffff' : 'rgba(255,255,255,0.2)'}
                strokeWidth={layer === 'shell' ? '2.5' : '1'}
                d="M130 256C92 220 91 149 124 100C166 37 237 11 309 18C404 25 470 74 509 148L529 191L481 208L455 192C440 185 427 190 418 206L390 251L346 277L300 257L276 236L255 261L230 287L193 290L176 265L154 260Z"
              />
              <path
                fill={layer === 'foam' ? 'rgba(0, 229, 255, 0.44)' : 'rgba(148, 163, 184, 0.28)'}
                stroke={layer === 'foam' ? '#00e5ff' : 'rgba(255,255,255,0.15)'}
                strokeWidth={layer === 'foam' ? '2.5' : '1'}
                d="M150 237C126 203 127 150 156 111C189 66 243 48 302 55C380 62 433 101 465 161L485 191L459 176C435 163 414 175 400 198L372 237L345 254L307 237L276 207L244 240L220 265L201 267L190 245Z"
              />
              <path
                d="M167 228C148 191 154 150 178 121C208 86 250 75 296 80C363 88 407 118 438 167"
                stroke={layer === 'rotation' ? '#ffcc00' : '#f97316'}
                strokeWidth={layer === 'rotation' ? '13' : '8'}
                strokeLinecap="round"
                fill="none"
              />
              <path d="m226 276 38 35c8 7 18 7 27 0l62-49" stroke="#64748b" strokeWidth="7" fill="none" strokeLinejoin="round" />
              <text x="28" y="62" fill="#00e5ff" fontSize="13">Calotta</text>
              <line x1="82" y1="58" x2="155" y2="75" stroke="#00e5ff" strokeWidth="1.5" />
              <text x="482" y="88" fill="#cbd5e1" fontSize="13">Assorbimento</text>
              <line x1="474" y1="84" x2="395" y2="102" stroke="#cbd5e1" strokeWidth="1.5" />
              <text x="20" y="185" fill="#ffcc00" fontSize="13">Rotazione*</text>
              <line x1="90" y1="181" x2="162" y2="181" stroke="#ffcc00" strokeWidth="1.5" />
            </svg>
            <p className="diagram-caption">
              Schema illustrativo: la costruzione e la presenza dei diversi sistemi dipendono dal modello.
            </p>
          </div>

          <div className="part-pills">
            {[
              { id: 'shell', label: 'Calotta esterna', color: '#00e5ff' },
              { id: 'foam', label: 'Materiale assorbente', color: '#94a3b8' },
              { id: 'rotation', label: 'Gestione rotazione', color: '#ffcc00' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`part-pill ${layer === p.id ? 'active' : ''}`}
                onClick={() => setLayer(p.id)}
              >
                <span className="part-dot" style={{ background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>

          <div className="lab-card">
            <h5>{layers[layer].title}</h5>
            <p>{layers[layer].copy}</p>
          </div>
        </div>
      )}

      {tab === 'tech' && (
        <div>
          <div className="subtabs-row">
            {[
              { id: 'standards', label: 'Omologazioni' },
              { id: 'tech', label: 'Tecnologie' },
              { id: 'rescue', label: 'Soccorso' }
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                className={`subtab-btn ${sigleCat === s.id ? 'active' : ''}`}
                onClick={() => setSigleCat(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <TechAccordionList items={sigleItems[sigleCat]} />
        </div>
      )}

      {tab === 'try' && (
        <div>
          <div className="choice-grid-3" style={{ marginBottom: '14px' }}>
            <button type="button" className={`choice-card ${useCase === 'piste' ? 'active' : ''}`} onClick={() => setUseCase('piste')}>
              <strong>Pista</strong>
              <small>EN 1077 A/B</small>
            </button>
            <button type="button" className={`choice-card ${useCase === 'race' ? 'active' : ''}`} onClick={() => setUseCase('race')}>
              <strong>Gara</strong>
              <small>FIS RH 2013</small>
            </button>
            <button type="button" className={`choice-card ${useCase === 'tour' ? 'active' : ''}`} onClick={() => setUseCase('tour')}>
              <strong>Skialp</strong>
              <small>EN 18100</small>
            </button>
          </div>
          <div className="lab-card gold">
            <h5>{uses[useCase].title}</h5>
            <p>{uses[useCase].copy}</p>
          </div>
        </div>
      )}

      {tab === 'quiz' && <QuizModule questions={quiz} />}

      <LabFooter
        sources={[
          { label: 'Mips Protection', url: 'https://mipsprotection.com/snow/' },
          { label: 'RECCO', url: 'https://recco.com' },
          { label: 'Virginia Tech Ratings', url: 'https://helmet.beam.vt.edu/snowsport-helmet-ratings.html' }
        ]}
      />
    </div>
  );
}

/* ============================================================================
   2. LABORATORIO SCI: "DENTRO UNO SCI"
   ============================================================================ */
function SkiLab() {
  const [tab, setTab] = useState('anatomy');
  const [part, setPart] = useState('lamine');
  const [flexLong, setFlexLong] = useState(50);
  const [torsion, setTorsion] = useState(60);
  const [damping, setDamping] = useState(55);

  const [terrain, setTerrain] = useState('pista');
  const [level, setLevel] = useState('intermedio');
  const [budget, setBudget] = useState('medio');

  const skiParts = {
    soletta: {
      title: 'Soletta (Base in polietilene)',
      copy: 'Si trova nella parte inferiore a contatto diretto con la neve. Le solette sinterizzate ad alta densità trattengono meglio la sciolina e garantiscono scorrevolezza costante.'
    },
    lamine: {
      title: 'Lamine perimetrali in acciaio',
      copy: 'Corrono lungo i bordi inferiori dello sci. Incidono la neve compatta e il ghiaccio, fornendo la presa meccanica indispensabile nella fase di conduzione.'
    },
    anima: {
      title: 'Anima centrale (Core in legno / composito)',
      copy: 'È il cuore strutturale tra punta e coda. Determina il peso, la distribuzione della flessione longitudinale e il ritorno elastico a fine curva.'
    },
    rinforzi: {
      title: 'Rinforzi strutturali (Fibra di vetro, Carbonio, Titanal)',
      copy: 'Avvolgono l’anima sopra e sotto. Controllano soprattutto la rigidità torsionale: impediscono allo sci di svergolare sotto carico elevato.'
    },
    smorzamento: {
      title: 'Strati di smorzamento (Elastomeri / Inserti)',
      copy: 'Posizionati tra i laminati o nella spatola, assorbono le micro-vibrazioni ad alta frequenza mantendo la lamina stabile sul terreno irregolare.'
    }
  };

  const techItems = [
    {
      badge: 'Prodotto commerciale · Costruzione',
      title: 'Nordica Energy TI Double Core',
      subtitle: 'Doppio nucleo in legno con inserto centrale in elastomero e Titanal.',
      body: 'Inserire uno strato ammortizzante tra due anime in legno permette di ottenere stabilità torsionale sul duro senza rendere lo sci eccessivamente nervoso o faticoso.'
    },
    {
      badge: 'Prodotto commerciale · Vibrazioni',
      title: 'HEAD EMC (Energy Management Circuit)',
      subtitle: 'Circuito piezoelettrico integrato.',
      body: 'Converte l’energia cinetica delle vibrazioni in energia elettrica dissipata tramite un circuito interno, riducendo le oscillazioni parassite della spatola.'
    },
    {
      badge: 'Su ordinazione · Personalizzazione',
      title: 'ORIGINAL+ Custom 6X / Wagner Custom',
      subtitle: 'Costruzione su misura guidata dai dati dello sciatore.',
      body: 'La personalizzazione non riguarda solo la grafica: geometria, rigidità torsionale e distribuzione del flex vengono calibrate su peso, altezza, stile e terreno prevalente.'
    },
    {
      badge: 'Progetto di ricerca · Non commerciale',
      isResearch: true,
      title: 'Smart Ski Experience (Rossignol & CEA)',
      subtitle: 'Recupero energetico dalla deformazione dello sci.',
      body: 'Prototipo sperimentale che trasforma la flessione meccanica dello sci in elettricità per alimentare sensori o accessori. Non è un prodotto commerciale di serie.'
    }
  ];

  const nordicaRecs = {
    pista: {
      principiante: {
        basso: 'Nordica Spitfire 73 · Easy Carve: sciancratura intuitiva e flex progressivo per facilitare le prime curve.',
        medio: 'Nordica Spitfire 75 FDT · Progression: accompagna il passaggio allo sci parallelo con grande tolleranza.',
        alto: 'Nordica Spitfire CA FDT: legno e carbonio per tenuta sul duro senza il peso del metallo.'
      },
      intermedio: {
        basso: 'Nordica Spitfire CA · Frontside Sport: inversione rapida e maneggevolezza su piste battute.',
        medio: 'Nordica Spitfire TI FDT · Sport Carve: Titanal + elastomero per conduzione stabile sul compatto.',
        alto: 'Nordica Dobermann Multipista DC 74 TI: precisione Double Core con spatola gestibile tutto il giorno.'
      },
      esperto: {
        basso: 'Nordica Dobermann SLR DC / GSR DC: reattività nello stretto o negli archi ampi sul ripido.',
        medio: 'Nordica Dobermann Multigara DC: doppio legno e doppio Titanal per sciatori L6–L7.',
        alto: 'Nordica Dobermann FIS / ORIGINAL+ Custom 6X: massima precisione agonistica o costruzione su misura.'
      }
    },
    allmountain: {
      principiante: {
        basso: 'Nordica Steadfast 75 CA: leggero e tollerante anche sulla neve smossa del pomeriggio.',
        medio: 'Nordica Steadfast 80 CA: equilibrio tra pista battuta e bordo pista.',
        alto: 'Nordica Steadfast 80 DC: assorbimento fluido delle sconnessioni con minimo affaticamento.'
      },
      intermedio: {
        basso: 'Nordica Steadfast 80 DC · Double Core: comfort e presa sicura su neve variabile.',
        medio: 'Nordica Steadfast 85 DC: 85 mm al centro per alternare conduzione in pista e neve fresca.',
        alto: 'Nordica Enforcer 89: doppio Titanal e spatola in carbonio per prestazioni elevate ovunque.'
      },
      esperto: {
        basso: 'Nordica Enforcer 89: rigidità torsionale elevata per carvare forte su neve trasformata.',
        medio: 'Nordica Enforcer 94: riferimento polivalente per sciatori esperti su ogni tipo di pendio.',
        alto: 'Nordica Enforcer 99 / Wagner Custom All-Mountain: galleggiamento e potenza ad alta velocità.'
      }
    },
    fuoripista: {
      principiante: {
        basso: 'Nordica Unleashed 90: twin-tip agile e leggero per i primi approcci fuori pista.',
        medio: 'Nordica Unleashed 98 CA: risposta elastica e intuitiva in neve fresca e boschetti.',
        alto: 'Nordica Unlimited 94: peso contenuto per freeride leggero e brevi risalite.'
      },
      intermedio: {
        basso: 'Nordica Unleashed 98: Titanal sagomato per unire galleggiamento in powder e tenuta al rientro.',
        medio: 'Nordica Enforcer 104: stabilità su neve ventata e tracciata.',
        alto: 'Nordica Unlimited 104: geometria dedicata agli itinerari backcountry.'
      },
      esperto: {
        basso: 'Nordica Unleashed 106: galleggiamento immediato nei canali ripidi.',
        medio: 'Nordica Unleashed 114: 114 mm al centro con doppio rocker per polvere profonda.',
        alto: 'Nordica Unleashed 120: massima superficie portante per big mountain.'
      }
    }
  };

  const quiz = [
    {
      question: 'Quale elemento dello sci contribuisce direttamente alla presa meccanica sulla neve dura e ghiacciata?',
      answers: ['La serigrafia superiore.', 'Le lamine perimetrali in acciaio.', 'Il solo tappo di coda.'],
      correct: 1,
      explanation: 'Le lamine in acciaio incidono il manto nevoso compatto creando il vincolo necessario in curva.'
    },
    {
      question: 'Flessione longitudinale e rigidità torsionale indicano lo stesso comportamento?',
      answers: [
        'Sì, sono due sinonimi della durezza della soletta.',
        'No: la flessione riguarda l’arcuatura punta-coda, la torsione la resistenza allo svergolamento sull’asse.',
        'Sì, dipendono entrambe solo dal colore del Titanal.'
      ],
      correct: 1,
      explanation: 'Sono due movimenti meccanici distinti che influenzano rispettivamente facilità di deformazione e tenuta di spigolo.'
    },
    {
      question: 'Che cosa può riguardare la personalizzazione avanzata di uno sci (es. ORIGINAL+)?',
      answers: [
        'Anche la costruzione interna, la rigidità e la geometria oltre all’estetica.',
        'Esclusivamente il colore della grafica.',
        'Solo la lunghezza dei bastoni abbinati.'
      ],
      correct: 0,
      explanation: 'La produzione algoritmica su misura calibra stratificazione, flex e sciancratura sul singolo sciatore.'
    }
  ];

  // Calcolo visivo qualitativo SVG
  const arcDepth = 45 - (flexLong / 100) * 30;
  const twistSkew = 16 - (torsion / 100) * 14;
  const vibAmp = 14 - (damping / 100) * 12;

  return (
    <div className="lab-shell">
      <div className="lab-header">
        <div>
          <span className="lab-eyebrow">Laboratorio interattivo</span>
          <h4 className="lab-title">Dentro uno sci</h4>
        </div>
      </div>

      <LabTabs activeTab={tab} onChange={setTab} />

      {tab === 'anatomy' && (
        <div>
          <div className="diagram-stage">
            <svg viewBox="0 0 600 260" role="img" aria-label="Sezione esplosa illustrativa degli strati di uno sci">
              {/* Strato 1: Rinforzi superiori */}
              <polygon
                points="110,45 490,45 530,72 70,72"
                fill={part === 'rinforzi' ? 'rgba(0, 229, 255, 0.45)' : 'rgba(148, 163, 184, 0.25)'}
                stroke={part === 'rinforzi' ? '#00e5ff' : 'rgba(255,255,255,0.25)'}
                strokeWidth="2"
              />
              {/* Strato 2: Smorzamento */}
              <polygon
                points="110,84 490,84 530,111 70,111"
                fill={part === 'smorzamento' ? 'rgba(255, 204, 0, 0.45)' : 'rgba(255, 204, 0, 0.14)'}
                stroke={part === 'smorzamento' ? '#ffcc00' : 'rgba(255,204,0,0.35)'}
                strokeWidth="2"
              />
              {/* Strato 3: Anima */}
              <polygon
                points="100,124 500,124 542,155 58,155"
                fill={part === 'anima' ? 'rgba(0, 229, 255, 0.55)' : 'rgba(56, 189, 248, 0.22)'}
                stroke={part === 'anima' ? '#ffffff' : 'rgba(255,255,255,0.3)'}
                strokeWidth="2"
              />
              {/* Strato 4: Lamine laterali */}
              <rect
                x="56"
                y="168"
                width="488"
                height="12"
                rx="3"
                fill={part === 'lamine' ? '#ffcc00' : 'rgba(255,255,255,0.35)'}
                stroke={part === 'lamine' ? '#ffffff' : 'none'}
                strokeWidth="1.5"
              />
              {/* Strato 5: Soletta */}
              <polygon
                points="96,192 504,192 544,220 56,220"
                fill={part === 'soletta' ? 'rgba(0, 229, 255, 0.5)' : 'rgba(15, 23, 42, 0.9)'}
                stroke={part === 'soletta' ? '#00e5ff' : 'rgba(255,255,255,0.25)'}
                strokeWidth="2"
              />
              <text x="24" y="63" fill="#cbd5e1" fontSize="12">Rinforzi</text>
              <text x="16" y="102" fill="#ffcc00" fontSize="12">Smorzamento</text>
              <text x="24" y="144" fill="#ffffff" fontSize="12">Anima</text>
              <text x="24" y="178" fill="#ffcc00" fontSize="12">Lamine</text>
              <text x="24" y="210" fill="#00e5ff" fontSize="12">Soletta</text>
            </svg>
            <p className="diagram-caption">
              Esempio illustrativo di sezione esplosa: materiali e disposizione degli strati cambiano tra prodotti e discipline.
            </p>
          </div>

          <div className="part-pills">
            {[
              { id: 'soletta', label: 'Soletta', color: '#00e5ff' },
              { id: 'lamine', label: 'Lamine', color: '#ffcc00' },
              { id: 'anima', label: 'Anima', color: '#38bdf8' },
              { id: 'rinforzi', label: 'Rinforzi', color: '#94a3b8' },
              { id: 'smorzamento', label: 'Smorzamento', color: '#f97316' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`part-pill ${part === p.id ? 'active' : ''}`}
                onClick={() => setPart(p.id)}
              >
                <span className="part-dot" style={{ background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>

          <div className="lab-card">
            <h5>{skiParts[part].title}</h5>
            <p>{skiParts[part].copy}</p>
          </div>
        </div>
      )}

      {tab === 'tech' && <TechAccordionList items={techItems} />}

      {tab === 'try' && (
        <div>
          <div className="sim-box">
            <div className="diagram-stage" style={{ marginBottom: '14px' }}>
              <svg viewBox="0 0 560 150" role="img" aria-label="Simulazione qualitativa di flessione, torsione e vibrazioni dello sci">
                {/* Arco flessione longitudinale */}
                <path
                  d={`M 40 50 Q 280 ${50 + arcDepth} 520 50`}
                  stroke="#00e5ff"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Torsione */}
                <ellipse
                  cx="280"
                  cy="50"
                  rx="26"
                  ry={6 + twistSkew * 0.4}
                  transform={`rotate(${twistSkew} 280 50)`}
                  stroke="#ffcc00"
                  strokeWidth="2"
                  fill="rgba(255,204,0,0.12)"
                />
                {/* Onda vibrazioni residue */}
                <path
                  d={`M 60 120 Q 115 ${120 - vibAmp} 170 120 T 280 120 T 390 120 T 500 120`}
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="2.5"
                  fill="none"
                />
                <text x="40" y="25" fill="#00e5ff" fontSize="11">Arco flessione longitudinale</text>
                <text x="318" y="34" fill="#ffcc00" fontSize="11">Svergolamento torsionale</text>
                <text x="60" y="102" fill="#94a3b8" fontSize="11">Oscillazioni residue dopo impatto su neve dura</text>
              </svg>
            </div>

            <div className="sim-row">
              <div className="sim-row-head">
                <label>Flessione longitudinale</label>
                <span>{flexLong < 35 ? 'Morbida' : flexLong > 70 ? 'Rigida' : 'Media'}</span>
              </div>
              <input type="range" min="10" max="95" value={flexLong} onChange={(e) => setFlexLong(Number(e.target.value))} />
            </div>

            <div className="sim-row">
              <div className="sim-row-head">
                <label>Rigidità torsionale</label>
                <span>{torsion < 35 ? 'Bassa' : torsion > 70 ? 'Elevata' : 'Bilanciata'}</span>
              </div>
              <input type="range" min="10" max="95" value={torsion} onChange={(e) => setTorsion(Number(e.target.value))} />
            </div>

            <div className="sim-row" style={{ marginBottom: 0 }}>
              <div className="sim-row-head">
                <label>Smorzamento vibrazioni</label>
                <span>{damping < 35 ? 'Vivace / Secco' : damping > 70 ? 'Molto filtrato' : 'Equilibrato'}</span>
              </div>
              <input type="range" min="10" max="95" value={damping} onChange={(e) => setDamping(Number(e.target.value))} />
            </div>
          </div>

          <div className="lab-card" style={{ marginBottom: '16px' }}>
            <h5>Compromesso dinamico</h5>
            <p>
              {flexLong > 70
                ? 'Una flessione rigida offre sostegno ad alta velocità, ma richiede più forza e centralità per deformare lo sci a basse andature. '
                : 'Una flessione più morbida facilita l’ingresso curva a velocità moderata, ma tende a cedere se spinta al limite sul ripido. '}
              {torsion > 70
                ? 'L’alta rigidità torsionale massimizza la presa di spigolo sul ghiaccio, riducendo però la tolleranza agli errori di inclinazione. '
                : 'Una torsione più docile perdona le sbavature, ma perde precisione sul terreno ghiacciato. '}
              {damping > 70
                ? 'Un forte smorzamento rende la sciata silenziosa e fluida, attenuando però parte del feedback diretto della neve.'
                : 'Uno smorzamento contenuto mantiene lo sci reattivo e rapido nei cambi, trasmettendo più vibrazioni.'}
            </p>
          </div>

          <div className="sim-box" style={{ marginBottom: 0 }}>
            <h5 style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.98rem', color: 'var(--accent-gold)', marginBottom: '10px' }}>
              Consigliatore orientativo · Gamma Nordica
            </h5>
            <div className="choice-grid-3" style={{ marginBottom: '10px' }}>
              <button type="button" className={`choice-card ${terrain === 'pista' ? 'active' : ''}`} onClick={() => setTerrain('pista')}>
                <strong>Pista</strong>
                <small>Battuta</small>
              </button>
              <button type="button" className={`choice-card ${terrain === 'allmountain' ? 'active' : ''}`} onClick={() => setTerrain('allmountain')}>
                <strong>Mix</strong>
                <small>All-Mount</small>
              </button>
              <button type="button" className={`choice-card ${terrain === 'fuoripista' ? 'active' : ''}`} onClick={() => setTerrain('fuoripista')}>
                <strong>Powder</strong>
                <small>Freeride</small>
              </button>
            </div>
            <div className="choice-grid-3" style={{ marginBottom: '10px' }}>
              <button type="button" className={`choice-card ${level === 'principiante' ? 'active' : ''}`} onClick={() => setLevel('principiante')}>
                <strong>Base</strong>
                <small>L1–L3</small>
              </button>
              <button type="button" className={`choice-card ${level === 'intermedio' ? 'active' : ''}`} onClick={() => setLevel('intermedio')}>
                <strong>Evoluto</strong>
                <small>L4–L5</small>
              </button>
              <button type="button" className={`choice-card ${level === 'esperto' ? 'active' : ''}`} onClick={() => setLevel('esperto')}>
                <strong>Pro</strong>
                <small>L6–L7</small>
              </button>
            </div>
            <div className="choice-grid-3" style={{ marginBottom: '12px' }}>
              <button type="button" className={`choice-card ${budget === 'basso' ? 'active' : ''}`} onClick={() => setBudget('basso')}>
                <strong>&lt;7 gg</strong>
                <small>Base</small>
              </button>
              <button type="button" className={`choice-card ${budget === 'medio' ? 'active' : ''}`} onClick={() => setBudget('medio')}>
                <strong>7–15 gg</strong>
                <small>Medio</small>
              </button>
              <button type="button" className={`choice-card ${budget === 'alto' ? 'active' : ''}`} onClick={() => setBudget('alto')}>
                <strong>15+ gg</strong>
                <small>Top / Custom</small>
              </button>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#ffffff', lineHeight: 1.5 }}>
              {nordicaRecs[terrain][level][budget]}
            </p>
          </div>
        </div>
      )}

      {tab === 'quiz' && <QuizModule questions={quiz} />}

      <LabFooter
        sources={[
          { label: 'Nordica Skis', url: 'https://www.nordica.com' },
          { label: 'HEAD EMC', url: 'https://www.head.com' },
          { label: 'ORIGINAL+ Custom', url: 'https://www.original.plus' }
        ]}
      />
    </div>
  );
}

/* ============================================================================
   3. LABORATORIO SCARPONI: "DENTRO LO SCARPONE"
   ============================================================================ */
function BootLab() {
  const [tab, setTab] = useState('anatomy');
  const [bootPart, setBootPart] = useState('scafo');
  const [footZone, setFootZone] = useState('avampiede');

  const bootParts = {
    scafo: {
      title: 'Scafo inferiore (Shell)',
      copy: 'Avvolge il piede e costituisce la base rigida che trasmette gli impulsi laterali direttamente alla piastra e allo sci.'
    },
    gambetto: {
      title: 'Gambetto (Cuff)',
      copy: 'Incernierato allo scafo ai malleoli, sostiene la parte bassa della gamba e guida il piegamento anteriore (forward lean).'
    },
    scarpetta: {
      title: 'Scarpetta interna (Liner)',
      copy: 'Elemento imbottito e termoformabile che isola termicamente il piede e riempie gli spazi tra anatomia e plastica.'
    },
    linguetta: {
      title: 'Linguetta',
      copy: 'Distribuisce in modo uniforme la pressione della tibia durante l’appoggio anteriore, evitando punti dolorosi sullo stinco.'
    },
    plantare: {
      title: 'Plantare (Footbed)',
      copy: 'Sostiene l’arco plantare, stabilizza il tallone nella sua sede e migliora la sensibilità propriocettiva sotto la pianta.'
    },
    chiusure: {
      title: 'Chiusure (Ganci micrometrici / BOA)',
      copy: 'Regolano la tensione di chiusura durante la giornata. Il sistema BOA avvolge lo scafo inferiore con un cavo uniforme.'
    },
    suola: {
      title: 'Suola (ISO 5355 / GripWalk / Touring)',
      copy: 'Interfaccia meccanica con puntale e talloniera dell’attacco: deve essere certificata compatibile con il sistema di sgancio.'
    }
  };

  const techItems = [
    {
      badge: 'Misura',
      title: 'Mondopoint (MP)',
      subtitle: 'Lunghezza reale del piede in cm/mm.',
      body: 'Corrisponde alla lunghezza interna dello scafo (es. 26.5 = 26,5 cm). È il punto di partenza reale prima di valutare qualsiasi imbottitura.'
    },
    {
      badge: 'Larghezza',
      title: 'Last (Pianta dell’avampiede)',
      subtitle: 'Larghezza interna in millimetri (92–104 mm).',
      body: 'Indica lo spazio trasversale sull’avampiede (riferito alla misura campione 26.5 e proporzionato sulle altre taglie).'
    },
    {
      badge: 'Rigidità',
      title: 'Indice di Flex',
      subtitle: 'Resistenza al piegamento anteriore.',
      body: 'Esprime quanto il gambetto oppone resistenza alla flessione. Non esiste uno standard unico tra marchi: un 110 di un brand può differire da un 110 di un altro.'
    },
    {
      badge: 'Chiusura vs Modellazione',
      title: 'BOA Fit vs Termoformatura',
      subtitle: 'Due funzioni complementari ma distinte.',
      body: 'La chiusura BOA regola la tensione esterna di avvolgimento; la termoformatura (Infrared, Custom Shell, Memory Fit) modella a caldo scarpetta e scafo sull’anatomia.'
    }
  ];

  const footZones = {
    avampiede: {
      title: 'Avampiede e testa dei metatarsi',
      copy: 'Con un bootfitter si valuta se la larghezza interna (last) consente alle dita di distendersi senza compressione laterale né intorpidimento, mantenendo comunque controllo.'
    },
    collo: {
      title: 'Collo del piede (Instep)',
      copy: 'Un collo del piede alto può subire compressione sotto lo scafo inferiore o la linguetta, riducendo la circolazione. Si valuta il volume verticale dello scafo e il posizionamento delle chiusure.'
    },
    tallone: {
      title: 'Tallone e retropiede',
      copy: 'Il tallone deve restare bloccato nella tasca posteriore quando si piega la caviglia in avanti: se si solleva, si perde precisione nella trasmissione dello spigolo.'
    },
    malleoli: {
      title: 'Malleoli (interno ed esterno)',
      copy: 'Sono le sporgenze ossee più esposte al contatto con lo scafo. In laboratorio si valuta l’allineamento rispetto alle sedi preformate o la necessità di termoformatura mirata.'
    }
  };

  const quiz = [
    {
      question: 'Il sistema BOA permette di compensare qualsiasi errore di taglia dello scarpone?',
      answers: [
        'Sì, basta stringere di più la rotella per colmare due misure in eccesso.',
        'No, regola l’avvolgimento della chiusura ma non sostituisce una taglia e un volume corretti.',
        'Sì, perché accorcia fisicamente la lunghezza dello scafo.'
      ],
      correct: 1,
      explanation: 'BOA migliora l’uniformità della chiusura, ma lo scarpone deve prima corrispondere a lunghezza (Mondopoint) e volumi del piede.'
    },
    {
      question: 'Due scarponi di marchi diversi con lo stesso flex dichiarato (es. 110) si comportano in modo identico?',
      answers: [
        'No, il flex non è uno standard universale e varia per geometria, plastiche e temperatura.',
        'Sì, è un valore certificato identico per tutti i produttori.',
        'Sì, ma solo se hanno lo stesso colore.'
      ],
      correct: 0,
      explanation: 'Ogni azienda misura la resistenza alla flessione con criteri propri: il flex serve per confrontare modelli della stessa linea.'
    },
    {
      question: 'Termoformatura e serraggio delle chiusure sono la stessa operazione?',
      answers: [
        'Sì, stringere i ganci a freddo equivale a termoformare.',
        'No: la termoformatura modella a caldo i materiali sull’anatomia, mentre le chiusure regolano la tensione d’uso.',
        'La termoformatura riguarda solo i bastoni.'
      ],
      correct: 1,
      explanation: 'Sono operazioni distinte: la modellazione termica adatta i volumi interni, le chiusure mantengono il piede in sede.'
    }
  ];

  return (
    <div className="lab-shell">
      <div className="lab-header">
        <div>
          <span className="lab-eyebrow">Laboratorio interattivo</span>
          <h4 className="lab-title">Dentro lo scarpone</h4>
        </div>
      </div>

      <LabTabs activeTab={tab} onChange={setTab} />

      {tab === 'anatomy' && (
        <div>
          <div className="diagram-stage">
            <svg viewBox="0 0 560 290" role="img" aria-label="Schema anatomico di uno scarpone da sci">
              {/* Gambetto */}
              <path
                d="M210 35 L310 35 L335 165 L195 165 Z"
                fill={bootPart === 'gambetto' ? 'rgba(0,229,255,0.42)' : 'rgba(51,65,85,0.55)'}
                stroke={bootPart === 'gambetto' ? '#00e5ff' : 'rgba(255,255,255,0.25)'}
                strokeWidth="2"
              />
              {/* Scarpetta */}
              <path
                d="M222 20 L298 20 L318 175 L410 198 L405 225 L205 225 Z"
                fill={bootPart === 'scarpetta' ? 'rgba(255,204,0,0.38)' : 'rgba(148,163,184,0.2)'}
                stroke={bootPart === 'scarpetta' ? '#ffcc00' : 'rgba(255,255,255,0.2)'}
                strokeWidth="1.8"
              />
              {/* Linguetta */}
              <path
                d="M296 32 Q325 100 326 168"
                stroke={bootPart === 'linguetta' ? '#00e5ff' : '#94a3b8'}
                strokeWidth={bootPart === 'linguetta' ? '9' : '5'}
                strokeLinecap="round"
                fill="none"
              />
              {/* Scafo */}
              <path
                d="M192 162 L336 162 L442 196 Q455 212 445 235 L182 235 Q172 200 192 162 Z"
                fill={bootPart === 'scafo' ? 'rgba(0,229,255,0.42)' : 'rgba(30,41,59,0.75)'}
                stroke={bootPart === 'scafo' ? '#ffffff' : 'rgba(255,255,255,0.3)'}
                strokeWidth="2"
              />
              {/* Plantare */}
              <line
                x1="205"
                y1="224"
                x2="425"
                y2="224"
                stroke={bootPart === 'plantare' ? '#ffcc00' : 'rgba(255,255,255,0.35)'}
                strokeWidth={bootPart === 'plantare' ? '6' : '3'}
              />
              {/* Chiusure / BOA */}
              <circle
                cx="358"
                cy="176"
                r="11"
                fill={bootPart === 'chiusure' ? '#00e5ff' : '#0f172a'}
                stroke="#00e5ff"
                strokeWidth="2"
              />
              <line x1="315" y1="168" x2="395" y2="192" stroke="#00e5ff" strokeWidth="2" strokeDasharray="4 3" />
              {/* Suola */}
              <rect
                x="178"
                y="237"
                width="270"
                height="14"
                rx="4"
                fill={bootPart === 'suola' ? '#ffcc00' : 'rgba(255,255,255,0.28)'}
              />
              <text x="115" y="75" fill="#cbd5e1" fontSize="12">Gambetto</text>
              <text x="335" y="45" fill="#ffcc00" fontSize="12">Scarpetta</text>
              <text x="355" y="105" fill="#00e5ff" fontSize="12">Linguetta</text>
              <text x="105" y="195" fill="#ffffff" fontSize="12">Scafo</text>
              <text x="395" y="158" fill="#00e5ff" fontSize="12">BOA / Chiusure</text>
              <text x="275" y="272" fill="#ffcc00" fontSize="12">Suola &amp; Plantare</text>
            </svg>
          </div>

          <div className="part-pills">
            {[
              { id: 'scafo', label: 'Scafo', color: '#00e5ff' },
              { id: 'gambetto', label: 'Gambetto', color: '#38bdf8' },
              { id: 'scarpetta', label: 'Scarpetta', color: '#ffcc00' },
              { id: 'linguetta', label: 'Linguetta', color: '#00e5ff' },
              { id: 'plantare', label: 'Plantare', color: '#ffcc00' },
              { id: 'chiusure', label: 'Chiusure', color: '#00e5ff' },
              { id: 'suola', label: 'Suola', color: '#ffcc00' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`part-pill ${bootPart === p.id ? 'active' : ''}`}
                onClick={() => setBootPart(p.id)}
              >
                <span className="part-dot" style={{ background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>

          <div className="lab-card">
            <h5>{bootParts[bootPart].title}</h5>
            <p>{bootParts[bootPart].copy}</p>
          </div>
        </div>
      )}

      {tab === 'tech' && (
        <div>
          <TechAccordionList items={techItems} />
          <div className="boot-brand-grid">
            {[
              { name: 'Nordica', tech: 'Infrared + BOA', desc: 'Termoformatura mirata a infrarossi e avvolgimento BOA Speedmachine.', url: 'https://www.nordica.com' },
              { name: 'Salomon', tech: 'Custom Shell HD', desc: 'Scafo in Kaprolene modellabile in ~10 minuti.', url: 'https://www.salomon.com' },
              { name: 'Atomic', tech: 'Memory Fit + Mimic', desc: 'Adattamento termico di scafo, gambetto e scarpetta.', url: 'https://www.atomic.com' },
              { name: 'Tecnica', tech: 'C.A.S. System', desc: 'Custom Adaptive Shape su scarpetta e scafo anatomico.', url: 'https://www.blizzard-tecnica.com' }
            ].map((b) => (
              <a key={b.name} href={b.url} target="_blank" rel="noreferrer" className="boot-brand-card">
                <div>
                  <div className="boot-brand-top">
                    <strong>{b.name}</strong>
                    <span style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>↗</span>
                  </div>
                  <div className="boot-brand-tech">{b.tech}</div>
                  <p>{b.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {tab === 'try' && (
        <div>
          <div className="diagram-stage">
            <svg viewBox="0 0 540 200" role="img" aria-label="Piede schematico con zone di valutazione bootfitting">
              {/* Profilo piede stilizzato */}
              <path
                d="M120 145 Q115 95 145 75 Q175 65 210 92 Q265 112 365 118 Q425 122 435 145 Q432 165 375 166 L145 166 Q122 162 120 145 Z"
                fill="rgba(255,255,255,0.06)"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
              />
              {/* Zone cliccabili */}
              <circle
                cx="148"
                cy="132"
                r="22"
                fill={footZone === 'tallone' ? 'rgba(0,229,255,0.45)' : 'rgba(255,255,255,0.08)'}
                stroke={footZone === 'tallone' ? '#00e5ff' : 'rgba(255,255,255,0.25)'}
                strokeWidth="2"
              />
              <circle
                cx="192"
                cy="96"
                r="17"
                fill={footZone === 'malleoli' ? 'rgba(255,204,0,0.45)' : 'rgba(255,255,255,0.08)'}
                stroke={footZone === 'malleoli' ? '#ffcc00' : 'rgba(255,255,255,0.25)'}
                strokeWidth="2"
              />
              <ellipse
                cx="275"
                cy="118"
                rx="32"
                ry="16"
                fill={footZone === 'collo' ? 'rgba(0,229,255,0.45)' : 'rgba(255,255,255,0.08)'}
                stroke={footZone === 'collo' ? '#00e5ff' : 'rgba(255,255,255,0.25)'}
                strokeWidth="2"
              />
              <ellipse
                cx="385"
                cy="142"
                rx="38"
                ry="18"
                fill={footZone === 'avampiede' ? 'rgba(255,204,0,0.45)' : 'rgba(255,255,255,0.08)'}
                stroke={footZone === 'avampiede' ? '#ffcc00' : 'rgba(255,255,255,0.25)'}
                strokeWidth="2"
              />
              <text x="122" y="185" fill="#00e5ff" fontSize="11">Tallone</text>
              <text x="168" y="65" fill="#ffcc00" fontSize="11">Malleoli</text>
              <text x="242" y="92" fill="#00e5ff" fontSize="11">Collo del piede</text>
              <text x="355" y="185" fill="#ffcc00" fontSize="11">Avampiede</text>
            </svg>
            <p className="diagram-caption">
              Mappa didattica per la prova in negozio: non sostituisce una valutazione individuale da parte di un bootfitter.
            </p>
          </div>

          <div className="part-pills">
            {[
              { id: 'avampiede', label: 'Avampiede', color: '#ffcc00' },
              { id: 'collo', label: 'Collo del piede', color: '#00e5ff' },
              { id: 'tallone', label: 'Tallone', color: '#00e5ff' },
              { id: 'malleoli', label: 'Malleoli', color: '#ffcc00' }
            ].map((z) => (
              <button
                key={z.id}
                type="button"
                className={`part-pill ${footZone === z.id ? 'active' : ''}`}
                onClick={() => setFootZone(z.id)}
              >
                <span className="part-dot" style={{ background: z.color }} />
                {z.label}
              </button>
            ))}
          </div>

          <div className="lab-card gold">
            <h5>{footZones[footZone].title}</h5>
            <p>{footZones[footZone].copy}</p>
          </div>
        </div>
      )}

      {tab === 'quiz' && <QuizModule questions={quiz} />}

      <LabFooter
        sources={[
          { label: 'BOA Fit System', url: 'https://www.boafit.com' },
          { label: 'Nordica Boots', url: 'https://www.nordica.com' },
          { label: 'Atomic Memory Fit', url: 'https://www.atomic.com' }
        ]}
      />
    </div>
  );
}

/* ============================================================================
   4. LABORATORIO ATTACCHI: "COME FUNZIONA UN ATTACCO"
   ============================================================================ */
function BindingLab() {
  const [tab, setTab] = useState('anatomy');
  const [part, setPart] = useState('talloniera');
  const [scenario, setScenario] = useState('elastic');
  const [animStep, setAnimStep] = useState(0);
  const [soleNorm, setSoleNorm] = useState('gw');
  const [bindingNorm, setBindingNorm] = useState('alpine');

  const parts = {
    puntale: {
      title: 'Puntale (Toe piece)',
      copy: 'Trattiene la punta dello scarpone e gestisce lo sgancio laterale anteriore mediante alette molleggiate con ritorno elastico.'
    },
    talloniera: {
      title: 'Talloniera (Heel piece)',
      copy: 'Blocca il tallone, applica la spinta longitudinale contro il puntale e gestisce lo sgancio verticale (e laterale nei sistemi come Tyrolia Protector).'
    },
    skistopper: {
      title: 'Skistopper (Freno sci)',
      copy: 'Bracci metallici tenuti sollevati dalla pressione della suola: appena lo scarpone si sgancia, scendono nella neve frenando lo sci.'
    },
    scarpone: {
      title: 'Scarpone inserito (Precarico)',
      copy: 'Lo scarpone lavora compresso tra puntale e talloniera entro una finestra di spinta precisa per garantire sia trasmissione sia sgancio regolare.'
    },
    contatto: {
      title: 'Zone di contatto & Piastra AFD',
      copy: 'La piastra antifrizione (AFD) sotto l’avampiede riduce l’attrito tra suola e puntale per consentire lo scorrimento laterale anche sotto carico.'
    }
  };

  const techItems = [
    {
      badge: 'Principio meccanico',
      title: 'Ritenzione, Elasticità e Sgancio',
      subtitle: 'L’equilibrio centrale della sicurezza.',
      body: 'L’elasticità permette allo scarpone di muoversi di qualche millimetro durante gli urti e rientrare in sede senza sganci involontari; lo sgancio interviene quando la forza supera la taratura.'
    },
    {
      badge: 'Confronto direzioni di sgancio',
      title: 'Attacco Tradizionale vs Tyrolia Protector',
      subtitle: 'Sgancio laterale anche al tallone.',
      body: 'Un attacco alpino tradizionale sgancia lateralmente al puntale e verticalmente alla talloniera. Tyrolia Protector introduce una talloniera capace di ruotare anche lateralmente nelle cadute torsionali all’indietro.'
    },
    {
      badge: 'Norme ISO',
      title: 'Compatibilità Suola–Attacco',
      subtitle: 'ISO 5355 · GripWalk (ISO 23223) · Touring (ISO 9523).',
      body: 'Le suole hanno geometrie e attriti diversi: un attacco solo ISO 5355 non è compatibile con suole GripWalk o Touring, che richiedono attacchi marcati GripWalk o Multi-Norm (MNC).'
    }
  ];

  const triggerAnimation = (nextScenario) => {
    setScenario(nextScenario);
    setAnimStep(0);
    setTimeout(() => setAnimStep(1), 80);
  };

  const compatibilityResult = () => {
    if (soleNorm === 'alpine') {
      return {
        ok: true,
        text: 'Compatibile: la suola alpina piatta ISO 5355 è accettata da attacchi alpini standard, GripWalk e Multi-Norm (MNC), previa regolazione altezza puntale/spinta.'
      };
    }
    if (soleNorm === 'gw') {
      if (bindingNorm === 'alpine') {
        return {
          ok: false,
          text: 'Non compatibile: anche se lo scarpone può entrare fisicamente, una suola GripWalk (ISO 23223) su attacco solo ISO 5355 altera altezza e attrito sull’AFD.'
        };
      }
      return {
        ok: true,
        text: 'Compatibile: attacchi marcati GripWalk o Multi-Norm (MNC) sono progettati per il profilo rocker e i pad della suola ISO 23223.'
      };
    }
    if (bindingNorm === 'mnc') {
      return {
        ok: true,
        text: 'Compatibile (con verifica): gli attacchi Multi-Norm (MNC) accettano suole ISO 9523 Touring regolando l’altezza della piastra AFD.'
      };
    }
    return {
      ok: false,
      text: 'Non compatibile: le suole Touring ISO 9523 richiedono attacchi certificati MNC o specifici da scialpinismo.'
    };
  };

  const compRes = compatibilityResult();

  const quiz = [
    {
      question: 'Quale compromesso deve gestire un attacco da sci?',
      answers: [
        'Bloccare per sempre lo scarpone senza mai aprirsi.',
        'Bilanciare ritenzione elastica durante la sciata e sgancio controllato in caso di sovraccarico.',
        'Sganciarsi ad ogni cambio di spigolo.'
      ],
      correct: 1,
      explanation: 'L’attacco deve assorbire le sollecitazioni sciistiche tramite ritorno elastico e liberare lo scarpone solo oltre soglia.'
    },
    {
      question: 'Se uno scarpone entra fisicamente nell’attacco, significa che è automaticamente compatibile?',
      answers: [
        'No, occorre verificare la compatibilità certificata tra norma della suola (es. GripWalk, Touring) e puntale/AFD.',
        'Sì, se si sente il clic della talloniera è sempre sicuro.',
        'Sì, tutte le suole hanno identica altezza e attrito.'
      ],
      correct: 0,
      explanation: 'Altezza del puntale e coefficiente di attrito dell’AFD cambiano tra ISO 5355, GripWalk e ISO 9523.'
    },
    {
      question: 'Un’animazione didattica del meccanismo può prevedere l’esito di una caduta reale?',
      answers: [
        'Sì, garantisce al 100% lo sgancio in ogni situazione.',
        'No, illustra le direzioni di funzionamento del sistema ma non può prevedere tutte le variabili di una caduta reale.',
        'Sì, sostituisce la taratura in laboratorio.'
      ],
      correct: 1,
      explanation: 'Le animazioni mostrano la cinematica del meccanismo, mentre in pista intervengono velocità, angoli e forze imprevedibili.'
    }
  ];

  const bootOffsetX = animStep === 1 ? (scenario === 'front' ? -14 : scenario === 'backtwist' ? 12 : -4) : 0;
  const bootRot = animStep === 1 ? (scenario === 'front' ? -14 : scenario === 'backtwist' ? 10 : -2) : 0;
  const heelRot = animStep === 1 && scenario === 'backtwist' ? 22 : 0;

  return (
    <div className="lab-shell">
      <div className="lab-header">
        <div>
          <span className="lab-eyebrow">Laboratorio interattivo</span>
          <h4 className="lab-title">Come funziona un attacco</h4>
        </div>
      </div>

      <LabTabs activeTab={tab} onChange={setTab} />

      {tab === 'anatomy' && (
        <div>
          <div className="diagram-stage">
            <svg viewBox="0 0 560 220" role="img" aria-label="Schema dei componenti principali di un attacco da sci">
              {/* Sci */}
              <rect x="40" y="166" width="480" height="12" rx="4" fill="rgba(148,163,184,0.3)" />
              {/* Piastra AFD */}
              <rect
                x="145"
                y="156"
                width="55"
                height="9"
                rx="2"
                fill={part === 'contatto' ? '#ffcc00' : 'rgba(255,255,255,0.3)'}
              />
              {/* Puntale */}
              <path
                d="M115 165 L165 165 L155 122 L120 132 Z"
                fill={part === 'puntale' ? 'rgba(0,229,255,0.55)' : 'rgba(51,65,85,0.85)'}
                stroke={part === 'puntale' ? '#ffffff' : '#00e5ff'}
                strokeWidth="2"
              />
              {/* Talloniera */}
              <path
                d="M365 165 L435 165 L425 106 L372 118 Z"
                fill={part === 'talloniera' ? 'rgba(0,229,255,0.55)' : 'rgba(51,65,85,0.85)'}
                stroke={part === 'talloniera' ? '#ffffff' : '#00e5ff'}
                strokeWidth="2"
              />
              {/* Skistopper */}
              <path
                d="M352 162 L305 148"
                stroke={part === 'skistopper' ? '#ffcc00' : '#94a3b8'}
                strokeWidth={part === 'skistopper' ? '5' : '3'}
                strokeLinecap="round"
              />
              {/* Scarpone inserito */}
              <path
                d="M162 154 L368 154 L362 72 L285 72 L272 116 L166 130 Z"
                fill={part === 'scarpone' ? 'rgba(255,204,0,0.35)' : 'rgba(255,255,255,0.08)'}
                stroke={part === 'scarpone' ? '#ffcc00' : 'rgba(255,255,255,0.3)'}
                strokeWidth="2"
              />
              <text x="105" y="114" fill="#00e5ff" fontSize="12">Puntale</text>
              <text x="235" y="60" fill="#ffcc00" fontSize="12">Scarpone inserito</text>
              <text x="380" y="96" fill="#00e5ff" fontSize="12">Talloniera</text>
              <text x="275" y="140" fill="#cbd5e1" fontSize="11">Skistopper</text>
              <text x="135" y="198" fill="#ffcc00" fontSize="11">Zone contatto &amp; AFD</text>
            </svg>
          </div>

          <div className="part-pills">
            {[
              { id: 'puntale', label: 'Puntale', color: '#00e5ff' },
              { id: 'talloniera', label: 'Talloniera', color: '#00e5ff' },
              { id: 'skistopper', label: 'Skistopper', color: '#94a3b8' },
              { id: 'scarpone', label: 'Scarpone inserito', color: '#ffcc00' },
              { id: 'contatto', label: 'Contatto suola / AFD', color: '#ffcc00' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`part-pill ${part === p.id ? 'active' : ''}`}
                onClick={() => setPart(p.id)}
              >
                <span className="part-dot" style={{ background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>

          <div className="lab-card">
            <h5>{parts[part].title}</h5>
            <p>{parts[part].copy}</p>
          </div>
        </div>
      )}

      {tab === 'tech' && <TechAccordionList items={techItems} />}

      {tab === 'try' && (
        <div>
          <div className="sim-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
                Scenario di sollecitazione
              </span>
              <button type="button" className="action-btn secondary" onClick={() => triggerAnimation(scenario)}>
                ↻ Riavvia animazione
              </button>
            </div>

            <div className="choice-grid-3" style={{ marginBottom: '14px' }}>
              <button
                type="button"
                className={`choice-card ${scenario === 'elastic' ? 'active' : ''}`}
                onClick={() => triggerAnimation('elastic')}
              >
                <strong>Urto lieve</strong>
                <small>Ritorno elastico</small>
              </button>
              <button
                type="button"
                className={`choice-card ${scenario === 'front' ? 'active' : ''}`}
                onClick={() => triggerAnimation('front')}
              >
                <strong>Caduta frontale</strong>
                <small>Sgancio verticale</small>
              </button>
              <button
                type="button"
                className={`choice-card ${scenario === 'backtwist' ? 'active' : ''}`}
                onClick={() => triggerAnimation('backtwist')}
              >
                <strong>Torsione indietro</strong>
                <small>Protector laterale</small>
              </button>
            </div>

            <div className="diagram-stage" style={{ marginBottom: '10px' }}>
              <svg viewBox="0 0 540 190" role="img" aria-label="Animazione didattica del comportamento puntale e talloniera">
                <rect x="40" y="146" width="460" height="10" rx="3" fill="rgba(148,163,184,0.3)" />
                {/* Puntale */}
                <path d="M115 145 L160 145 L150 108 L120 116 Z" fill="rgba(0,229,255,0.45)" stroke="#00e5ff" strokeWidth="2" />
                {/* Talloniera con eventuale rotazione Protector */}
                <g style={{ transform: `rotate(${heelRot}deg)`, transformOrigin: '390px 145px', transition: 'transform 0.9s ease' }}>
                  <path d="M360 145 L425 145 L415 92 L368 102 Z" fill="rgba(255,204,0,0.45)" stroke="#ffcc00" strokeWidth="2" />
                </g>
                {/* Scarpone animato */}
                <g
                  style={{
                    transform: `translate(${bootOffsetX}px, ${animStep === 1 && scenario !== 'elastic' ? -14 : 0}px) rotate(${bootRot}deg)`,
                    transformOrigin: '260px 135px',
                    transition: 'transform 0.9s ease'
                  }}
                >
                  <path
                    d="M158 136 L362 136 L356 62 L285 62 L272 102 L162 114 Z"
                    fill="rgba(255,255,255,0.12)"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
                <text x="115" y="34" fill="#00e5ff" fontSize="11">
                  {scenario === 'elastic'
                    ? 'Elasticità: micro-spostamento e rientro in sede senza sgancio'
                    : scenario === 'front'
                    ? 'Caduta in avanti: la talloniera si apre verso l’alto'
                    : 'Tyrolia Protector: la talloniera ruota anche lateralmente nelle torsioni'}
                </text>
              </svg>
              <p className="diagram-caption">
                Lo schema descrive il principio meccanico del sistema e non prevede l’esito di una caduta reale.
              </p>
            </div>
          </div>

          {/* Percorso compatibilità suola / attacco */}
          <div className="sim-box" style={{ marginBottom: 0 }}>
            <h5 style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.96rem', color: 'var(--accent-gold)', marginBottom: '10px' }}>
              Verifica compatibilità suola ↔ attacco
            </h5>
            <div className="choice-grid-3" style={{ marginBottom: '10px' }}>
              <button type="button" className={`choice-card ${soleNorm === 'alpine' ? 'active' : ''}`} onClick={() => setSoleNorm('alpine')}>
                <strong>ISO 5355</strong>
                <small>Suola Alpina</small>
              </button>
              <button type="button" className={`choice-card ${soleNorm === 'gw' ? 'active' : ''}`} onClick={() => setSoleNorm('gw')}>
                <strong>GripWalk</strong>
                <small>ISO 23223</small>
              </button>
              <button type="button" className={`choice-card ${soleNorm === 'tour' ? 'active' : ''}`} onClick={() => setSoleNorm('tour')}>
                <strong>Touring</strong>
                <small>ISO 9523</small>
              </button>
            </div>
            <div className="choice-grid-3" style={{ marginBottom: '12px' }}>
              <button type="button" className={`choice-card ${bindingNorm === 'alpine' ? 'active' : ''}`} onClick={() => setBindingNorm('alpine')}>
                <strong>Solo Alpino</strong>
                <small>ISO 5355</small>
              </button>
              <button type="button" className={`choice-card ${bindingNorm === 'gw' ? 'active' : ''}`} onClick={() => setBindingNorm('gw')}>
                <strong>GripWalk</strong>
                <small>GW Ready</small>
              </button>
              <button type="button" className={`choice-card ${bindingNorm === 'mnc' ? 'active' : ''}`} onClick={() => setBindingNorm('mnc')}>
                <strong>Multi-Norm</strong>
                <small>MNC</small>
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: compRes.ok ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {compRes.text}
            </p>
          </div>
        </div>
      )}

      {tab === 'quiz' && <QuizModule questions={quiz} />}

      <LabFooter
        sources={[
          { label: 'Tyrolia Protector', url: 'https://www.tyrolia.com' },
          { label: 'Marker GripWalk / MNC', url: 'https://www.marker.net' }
        ]}
      />
    </div>
  );
}

/* ============================================================================
   5. LABORATORIO BASTONI: "DAL BASTONE ALLA MANO"
   ============================================================================ */
function PoleLab() {
  const [tab, setTab] = useState('anatomy');
  const [part, setPart] = useState('impugnatura');
  const [triggerMode, setTriggerMode] = useState('attached');
  const [discipline, setDiscipline] = useState('pista');
  const [height, setHeight] = useState(176);
  const [skierLvl, setSkierLvl] = useState('l1');

  const parts = {
    impugnatura: {
      title: 'Impugnatura (Grip)',
      copy: 'Guida l’angolazione del polso e trasmette la spinta nell’appoggio. Nei modelli tecnici presenta profili ergonomici per le dita.'
    },
    lacciolo: {
      title: 'Lacciolo / Collegamento sganciabile',
      copy: 'Collega la mano al bastone: può essere una fettuccia chiusa tradizionale oppure un sistema sganciabile integrato tra guanto e impugnatura.'
    },
    asta: {
      title: 'Asta (Tubo)',
      copy: 'Determina inerzia, bilanciamento e resistenza meccanica. Un bilanciamento spostato verso l’alto rende il movimento del polso più rapido.'
    },
    rondella: {
      title: 'Rondella (Basket)',
      copy: 'Impedisce al bastone di affondare eccessivamente nella neve: compatta per pista battuta, più larga per neve fresca.'
    },
    puntale: {
      title: 'Puntale in acciaio / carburo',
      copy: 'Assicura l’ancoraggio anche su neve ghiacciata o compatta durante la puntatura.'
    }
  };

  const techItems = [
    {
      badge: 'Materiali asta',
      title: 'Alluminio vs Carbonio vs Misti',
      subtitle: 'Resistenza agli urti contro leggerezza e bilanciamento.',
      body: 'L’alluminio (es. 7075) resiste bene agli urti laterali piegandosi senza spezzarsi; il carbonio riduce peso e inerzia in punta; i tubi misti combinano leggerezza superiore e robustezza inferiore.'
    },
    {
      badge: 'Collegamento mano-bastone',
      title: 'Lacciolo tradizionale vs LEKI Trigger',
      subtitle: 'Serraggio continuo contro aggancio dedicato.',
      body: 'Il lacciolo classico avvolge il polso restando chiuso; sistemi come LEKI Trigger collegano un anello del guanto direttamente all’impugnatura con sgancio rapido superiore.'
    },
    {
      badge: 'Consigliatore per disciplina',
      title: 'Pista vs Gara vs Neve Fresca',
      subtitle: 'Come cambiano asta, impugnatura e rondella.',
      body: 'Pista: asta dritta, rondella media (50–55 mm). Gara SL/GS: tubo sagomato aerodinamico, paramani in slalom, rondella conica piccola. Neve fresca: impugnatura prolungata per prese variabili e rondella larga (85–95 mm).'
    }
  ];

  const discNotes = {
    pista: 'Pista: asta dritta in alluminio o composito, impugnatura ergonomica standard e rondella media (50–55 mm) per neve compatta.',
    gara: 'Gara (SL / GS): asta curvata per aerodinamica in posizione a uovo, paramani chiusi in slalom e rondella aerodinamica piccola.',
    freeride: 'Neve fresca: impugnatura allungata in schiuma per impugnare più in basso nei traversi e rondella larga (85–95 mm) per non affondare.'
  };

  const quiz = [
    {
      question: 'Qual è la funzione pratica della rondella sul bastone da sci?',
      answers: [
        'Serve solo come decorazione colorata.',
        'Impedisce al bastone di affondare eccessivamente nella neve, adattandosi alla consistenza del manto.',
        'Aumenta la velocità massima in discesa libera.'
      ],
      correct: 1,
      explanation: 'La superficie della rondella distribuisce il carico dell’appoggio evitando che l’asta sprofondi.'
    },
    {
      question: 'Tutti i laccioli dei bastoni prevedono uno sgancio automatico?',
      answers: [
        'Sì, per legge ogni lacciolo si apre da solo.',
        'No, i laccioli tradizionali restano chiusi sul polso e non hanno meccanismi di sgancio.',
        'Sì, tutti i bastoni usano magneti.'
      ],
      correct: 1,
      explanation: 'Solo specifici sistemi integrati prevedono meccanismi di sgancio; le fettucce classiche vanno sfilate manualmente.'
    },
    {
      question: 'Sgancio manuale e rilascio sotto sollecitazione sono la stessa cosa?',
      answers: [
        'No: lo sgancio manuale è azionato volontariamente dall’utente, mentre il rilascio sotto sollecitazione avviene solo in determinate condizioni di carico.',
        'Sì, indicano entrambi il pulsante superiore.',
        'Sì, garantiscono lo sgancio istantaneo in ogni caduta.'
      ],
      correct: 0,
      explanation: 'È importante distinguere l’apertura volontaria (es. in seggiovia) dal rilascio meccanico che può intervenire solo sotto specifiche direzioni e intensità di carico.'
    }
  ];

  const exactPole = Math.round(height / (skierLvl === 'l1' ? 1.5 : 1.53));
  const commPole = Math.round(exactPole / 5) * 5;

  return (
    <div className="lab-shell">
      <div className="lab-header">
        <div>
          <span className="lab-eyebrow">Laboratorio interattivo</span>
          <h4 className="lab-title">Dal bastone alla mano</h4>
        </div>
      </div>

      <LabTabs activeTab={tab} onChange={setTab} />

      {tab === 'anatomy' && (
        <div>
          <div className="diagram-stage">
            <svg viewBox="0 0 560 220" role="img" aria-label="Componenti di un bastone da sci">
              {/* Asta */}
              <rect
                x="110"
                y="104"
                width="330"
                height="10"
                rx="4"
                fill={part === 'asta' ? '#00e5ff' : 'rgba(148,163,184,0.45)'}
              />
              {/* Impugnatura */}
              <rect
                x="62"
                y="97"
                width="54"
                height="24"
                rx="7"
                fill={part === 'impugnatura' ? '#00e5ff' : '#334155'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {/* Lacciolo */}
              <path
                d="M84 97 Q60 55 112 68 Q130 82 105 97"
                fill="none"
                stroke={part === 'lacciolo' ? '#ffcc00' : '#94a3b8'}
                strokeWidth={part === 'lacciolo' ? '5' : '3'}
              />
              {/* Rondella */}
              <ellipse
                cx="435"
                cy="109"
                rx="8"
                ry="28"
                fill={part === 'rondella' ? 'rgba(255,204,0,0.6)' : 'rgba(255,255,255,0.2)'}
                stroke={part === 'rondella' ? '#ffcc00' : 'rgba(255,255,255,0.4)'}
                strokeWidth="2"
              />
              {/* Puntale */}
              <polygon
                points="443,105 492,109 443,113"
                fill={part === 'puntale' ? '#00e5ff' : '#cbd5e1'}
              />
              <text x="54" y="145" fill="#00e5ff" fontSize="11">Impugnatura</text>
              <text x="72" y="46" fill="#ffcc00" fontSize="11">Lacciolo</text>
              <text x="255" y="92" fill="#ffffff" fontSize="11">Asta</text>
              <text x="405" y="154" fill="#ffcc00" fontSize="11">Rondella</text>
              <text x="462" y="94" fill="#00e5ff" fontSize="11">Puntale</text>
            </svg>
          </div>

          <div className="part-pills">
            {[
              { id: 'impugnatura', label: 'Impugnatura', color: '#00e5ff' },
              { id: 'lacciolo', label: 'Lacciolo', color: '#ffcc00' },
              { id: 'asta', label: 'Asta', color: '#94a3b8' },
              { id: 'rondella', label: 'Rondella', color: '#ffcc00' },
              { id: 'puntale', label: 'Puntale', color: '#00e5ff' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`part-pill ${part === p.id ? 'active' : ''}`}
                onClick={() => setPart(p.id)}
              >
                <span className="part-dot" style={{ background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>

          <div className="lab-card">
            <h5>{parts[part].title}</h5>
            <p>{parts[part].copy}</p>
          </div>
        </div>
      )}

      {tab === 'tech' && <TechAccordionList items={techItems} />}

      {tab === 'try' && (
        <div>
          {/* Dimostrazione LEKI Trigger */}
          <div className="sim-box">
            <h5 style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.96rem', color: 'var(--accent-cyan)', marginBottom: '10px' }}>
              Esempio sistema sganciabile: LEKI Trigger
            </h5>
            <div className="choice-grid-3" style={{ marginBottom: '12px' }}>
              <button
                type="button"
                className={`choice-card ${triggerMode === 'attached' ? 'active' : ''}`}
                onClick={() => setTriggerMode('attached')}
              >
                <strong>1. Aggancio</strong>
                <small>In uso</small>
              </button>
              <button
                type="button"
                className={`choice-card ${triggerMode === 'manual' ? 'active' : ''}`}
                onClick={() => setTriggerMode('manual')}
              >
                <strong>2. Manuale</strong>
                <small>Pulsante top</small>
              </button>
              <button
                type="button"
                className={`choice-card ${triggerMode === 'load' ? 'active' : ''}`}
                onClick={() => setTriggerMode('load')}
              >
                <strong>3. Sollecitazione</strong>
                <small>Rilascio molla</small>
              </button>
            </div>

            <div className="diagram-stage" style={{ marginBottom: '8px' }}>
              <svg viewBox="0 0 520 140" role="img" aria-label="Dimostrazione funzionamento LEKI Trigger">
                <rect x="210" y="34" width="44" height="92" rx="10" fill="#1e293b" stroke="#00e5ff" strokeWidth="2" />
                <rect x="220" y="22" width="24" height="12" rx="4" fill={triggerMode === 'manual' ? '#ffcc00' : '#64748b'} />
                <circle
                  cx={triggerMode === 'attached' ? 202 : 162}
                  cy={triggerMode === 'load' ? 48 : 66}
                  r="11"
                  fill="none"
                  stroke="#ffcc00"
                  strokeWidth="3"
                  style={{ transition: 'all 0.45s ease' }}
                />
                <text x="275" y="65" fill="#ffffff" fontSize="12">
                  {triggerMode === 'attached'
                    ? 'Anello del guanto agganciato al perno interno.'
                    : triggerMode === 'manual'
                    ? 'Pressione volontaria del pulsante superiore (es. seggiovia).'
                    : 'Possibile rilascio della molla sotto specifiche trazioni verso l’alto.'}
                </text>
              </svg>
              <p className="diagram-caption">
                Nota didattica: il rilascio dipende da direzione e intensità del carico; non garantisce uno sgancio automatico in ogni caduta.
              </p>
            </div>
          </div>

          {/* Consigliatore disciplina + Calcolatore altezza */}
          <div className="sim-box" style={{ marginBottom: 0 }}>
            <div className="choice-grid-3" style={{ marginBottom: '10px' }}>
              <button type="button" className={`choice-card ${discipline === 'pista' ? 'active' : ''}`} onClick={() => setDiscipline('pista')}>
                <strong>Pista</strong>
                <small>All-round</small>
              </button>
              <button type="button" className={`choice-card ${discipline === 'gara' ? 'active' : ''}`} onClick={() => setDiscipline('gara')}>
                <strong>Gara</strong>
                <small>SL / GS</small>
              </button>
              <button type="button" className={`choice-card ${discipline === 'freeride' ? 'active' : ''}`} onClick={() => setDiscipline('freeride')}>
                <strong>Fresca</strong>
                <small>Freeride</small>
              </button>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.84)', lineHeight: 1.5, marginBottom: '14px' }}>
              {discNotes[discipline]}
            </p>

            <div className="sim-row">
              <div className="sim-row-head">
                <label>Altezza sciatore (cm)</label>
                <span>{height} cm</span>
              </div>
              <input type="range" min="145" max="205" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
            </div>
            <div className="choice-grid-2">
              <button type="button" className={`choice-card ${skierLvl === 'l1' ? 'active' : ''}`} onClick={() => setSkierLvl('l1')}>
                <strong>Fino a L5</strong>
                <small>Altezza / 1,50</small>
              </button>
              <button type="button" className={`choice-card ${skierLvl === 'l6' ? 'active' : ''}`} onClick={() => setSkierLvl('l6')}>
                <strong>L6 – Pro</strong>
                <small>Altezza / 1,53</small>
              </button>
            </div>
            <p style={{ marginTop: '12px', textAlign: 'center', fontFamily: 'Syne, sans-serif', fontSize: '1.35rem', color: 'var(--accent-gold)' }}>
              Misura indicativa: {exactPole} cm (taglio {commPole} cm)
            </p>
          </div>
        </div>
      )}

      {tab === 'quiz' && <QuizModule questions={quiz} />}

      <LabFooter
        sources={[
          { label: 'LEKI Trigger System', url: 'https://www.leki.com' },
          { label: 'Komperdell Poles', url: 'https://www.komperdell.com' }
        ]}
      />
    </div>
  );
}

/* ============================================================================
   6. LABORATORIO TERMOREGOLAZIONE: "VESTIRSI PER SCIARE"
   ============================================================================ */
function ThermoLab() {
  const [tab, setTab] = useState('anatomy');
  const [selectedLayer, setSelectedLayer] = useState('outer');
  const [showBase, setShowBase] = useState(true);
  const [showMid, setShowMid] = useState(true);
  const [showOuter, setShowOuter] = useState(true);

  // Simulatore condizioni
  const [tempCat, setTempCat] = useState('fredda');
  const [windCat, setWindCat] = useState('moderato');
  const [precipCat, setPrecipCat] = useState('asciutta');
  const [activityCat, setActivityCat] = useState('lezione');
  const [manualOverride, setManualOverride] = useState({ base: true, mid: true, outer: true });

  const layerDetails = {
    base: {
      title: '1° Strato — Intimo traspirante (Base Layer)',
      copy: 'A contatto con la pelle, allontana il sudore liquido verso l’esterno (lana Merino o fibre sintetiche idrofobe), evitando che il raffreddamento da evaporazione geli il corpo.'
    },
    mid: {
      title: '2° Strato — Isolamento termico (Mid Layer)',
      copy: 'Trattiene aria ferma intorno al corpo (pile, piuma, ovatte tecniche o Aerogel) oppure fornisce calore attivo tramite resistenze elettriche (es. Heat Sphere).'
    },
    outer: {
      title: '3° Strato — Protezione esterna (Shell / Giacca)',
      copy: 'Blocca vento, neve e acqua grazie alla membrana impermeabile-traspirante, alle cuciture nastrate e al trattamento idrorepellente DWR.'
    }
  };

  const techItems = [
    {
      badge: 'Isolamento passivo vs attivo',
      title: 'Aerogel vs Riscaldamento Elettrico (Heat Sphere)',
      subtitle: 'Trattenere il calore contro generarlo.',
      body: 'L’isolamento passivo (Aerogel, fibra cava) rallenta la dispersione del calore corporeo senza batterie. Il riscaldamento attivo integra resistenze alimentate da batteria per compensare fasi statiche prolungate.'
    },
    {
      badge: 'Impermeabilità',
      title: 'Membrana & Colonna d’Acqua (10.000 vs 20.000+ mm)',
      subtitle: 'Resistenza alla pressione dell’acqua.',
      body: '10.000 mm proteggono da neve asciutta e brevi precipitazioni; oltre 20.000 mm assicurano tenuta sotto neve bagnata, pioggia mista o contatto prolungato con seggiovie umide.'
    },
    {
      badge: 'Superficie & Assemblaggio',
      title: 'Trattamento DWR & Cuciture Nastrate',
      subtitle: 'Due barriere indispensabili.',
      body: 'Il DWR (Durable Water Repellent) fa scivolare le gocce sul tessuto esterno evitando che si inzuppi; le cuciture termonastrate sigillano i micro-fori dell’ago.'
    },
    {
      badge: 'Gestione umidità interna',
      title: 'Traspirabilità (g/m²/24h)',
      subtitle: 'Evacuazione del vapore corporeo.',
      body: 'Misura quanto vapore acqueo attraversa il tessuto in 24 ore. Un’alta traspirabilità evita la condensa interna durante le discese intense.'
    }
  ];

  const applyRecommended = (t, w, p, a) => {
    setTempCat(t);
    setWindCat(w);
    setPrecipCat(p);
    setActivityCat(a);
    const needMid = t !== 'mite' || a === 'attesa';
    const needOuter = w !== 'calmo' || p !== 'assenti' || t === 'rigida';
    setManualOverride({ base: true, mid: needMid, outer: needOuter || true });
  };

  const getSimAdvice = () => {
    const activeCount = [manualOverride.base, manualOverride.mid, manualOverride.outer].filter(Boolean).length;
    if (activeCount === 1) {
      return 'Configurazione molto leggera: ottimo smaltimento del calore durante sforzi intensi, ma protezione ridotta da vento e sbalzi termici.';
    }
    if (activeCount === 2) {
      return 'Equilibrio intermedio: buona libertà di movimento e dispersione del sudore; adatto a giornate miti o sciata dinamica continua.';
    }
    return 'Sistema completo a 3 strati: massima barriera contro vento, umidità e dispersione termica durante soste o freddo intenso; apri le zip ascellari se aumenta lo sforzo.';
  };

  const quiz = [
    {
      question: 'Trattamento DWR e membrana impermeabile svolgono la stessa funzione?',
      answers: [
        'Sì, sono due nomi commerciali per la cerniera lampo.',
        'No: il DWR fa scivolare l’acqua sulla superficie esterna, mentre la membrana blocca l’acqua lasciando uscire il vapore.',
        'Sì, entrambi servono solo a scaldare.'
      ],
      correct: 1,
      explanation: 'Il DWR evita l’inzuppamento del tessuto esterno, mentre la membrana garantisce la tenuta idrostatica.'
    },
    {
      question: 'Un guscio molto impermeabile (es. 20.000 mm) è automaticamente anche molto caldo?',
      answers: [
        'Sì, più millimetri significa automaticamente più imbottitura.',
        'No: impermeabilità (barriera da acqua/vento) e isolamento termico (trattenimento del calore) sono proprietà distinte.',
        'Sì, elimina la necessità dello strato intermedio a -20°C.'
      ],
      correct: 1,
      explanation: 'Un guscio 3 strati può essere completamente impermeabile ma privo di imbottitura termica.'
    },
    {
      question: 'La scelta degli strati dipende solo dalla temperatura dell’aria?',
      answers: [
        'No, dipende anche da vento, precipitazioni e livello di attività (attesa vs sciata intensa).',
        'Sì, a parità di gradi ci si veste sempre allo stesso modo.',
        'Dipende solo dal colore della giacca.'
      ],
      correct: 0,
      explanation: 'Durante una sciata intensa il corpo produce molto più calore e sudore rispetto a una fase statica di attesa.'
    }
  ];

  return (
    <div className="lab-shell">
      <div className="lab-header">
        <div>
          <span className="lab-eyebrow">Laboratorio interattivo</span>
          <h4 className="lab-title">Vestirsi per sciare</h4>
        </div>
      </div>

      <LabTabs activeTab={tab} onChange={setTab} />

      {tab === 'anatomy' && (
        <div>
          <div className="diagram-stage">
            <svg viewBox="0 0 560 245" role="img" aria-label="Figura schematica con tre strati di abbigliamento e flussi termici">
              {/* Busto base */}
              <path d="M235 45 L325 45 L345 195 L215 195 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" />
              {/* 1° Strato: Intimo */}
              {showBase && (
                <path
                  d="M240 50 L320 50 L336 190 L224 190 Z"
                  fill={selectedLayer === 'base' ? 'rgba(0,229,255,0.45)' : 'rgba(56,189,248,0.22)'}
                  stroke="#00e5ff"
                  strokeWidth="2"
                />
              )}
              {/* 2° Strato: Isolamento */}
              {showMid && (
                <path
                  d="M230 44 L330 44 L348 194 L212 194 Z"
                  fill={selectedLayer === 'mid' ? 'rgba(255,204,0,0.4)' : 'rgba(255,204,0,0.14)'}
                  stroke="#ffcc00"
                  strokeWidth="2"
                />
              )}
              {/* 3° Strato: Guscio esterno */}
              {showOuter && (
                <path
                  d="M220 38 L340 38 L360 198 L200 198 Z"
                  fill={selectedLayer === 'outer' ? 'rgba(148,163,184,0.42)' : 'rgba(148,163,184,0.16)'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}

              {/* Frecce Vento & Acqua (sinistra) */}
              <path className="anim-pulse" d="M60 85 L185 85" stroke="#00e5ff" strokeWidth="2.5" strokeDasharray="6 4" />
              <text x="58" y="75" fill="#00e5ff" fontSize="11">Vento &amp; Neve / Acqua</text>
              <path className="anim-pulse" d="M60 135 L185 135" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6 4" />

              {/* Frecce Sudore & Dispersione (destra) */}
              <path className="anim-pulse" d="M350 90 L485 90" stroke="#ffcc00" strokeWidth="2.5" strokeDasharray="5 4" />
              <text x="368" y="78" fill="#ffcc00" fontSize="11">Vapore sudore</text>
              <path className="anim-pulse" d="M350 145 L485 145" stroke="#f87171" strokeWidth="2.5" strokeDasharray="5 4" />
              <text x="368" y="133" fill="#f87171" fontSize="11">Dispersione calore</text>
            </svg>
          </div>

          <div className="part-pills">
            {[
              { id: 'base', label: '1° Intimo', active: showBase, toggle: () => setShowBase((v) => !v), color: '#00e5ff' },
              { id: 'mid', label: '2° Isolamento', active: showMid, toggle: () => setShowMid((v) => !v), color: '#ffcc00' },
              { id: 'outer', label: '3° Guscio', active: showOuter, toggle: () => setShowOuter((v) => !v), color: '#ffffff' }
            ].map((l) => (
              <button
                key={l.id}
                type="button"
                className={`part-pill ${selectedLayer === l.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedLayer(l.id);
                  if (!l.active) l.toggle();
                }}
              >
                <span className="part-dot" style={{ background: l.color }} />
                {l.label}
              </button>
            ))}
          </div>

          <div className="lab-card">
            <h5>{layerDetails[selectedLayer].title}</h5>
            <p>{layerDetails[selectedLayer].copy}</p>
          </div>
        </div>
      )}

      {tab === 'tech' && <TechAccordionList items={techItems} />}

      {tab === 'try' && (
        <div>
          <div className="sim-box">
            <label style={{ fontSize: '0.66rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Temperatura</label>
            <div className="choice-grid-3" style={{ marginBottom: '10px' }}>
              <button type="button" className={`choice-card ${tempCat === 'mite' ? 'active' : ''}`} onClick={() => applyRecommended('mite', windCat, precipCat, activityCat)}>
                <strong>Mite</strong>
                <small>&gt; 0°C</small>
              </button>
              <button type="button" className={`choice-card ${tempCat === 'fredda' ? 'active' : ''}`} onClick={() => applyRecommended('fredda', windCat, precipCat, activityCat)}>
                <strong>Fredda</strong>
                <small>-10° / 0°C</small>
              </button>
              <button type="button" className={`choice-card ${tempCat === 'rigida' ? 'active' : ''}`} onClick={() => applyRecommended('rigida', windCat, precipCat, activityCat)}>
                <strong>Rigida</strong>
                <small>&lt; -10°C</small>
              </button>
            </div>

            <label style={{ fontSize: '0.66rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Vento &amp; Precipitazioni</label>
            <div className="choice-grid-3" style={{ marginBottom: '10px' }}>
              <button type="button" className={`choice-card ${windCat === 'calmo' ? 'active' : ''}`} onClick={() => applyRecommended(tempCat, 'calmo', 'assenti', activityCat)}>
                <strong>Sereno</strong>
                <small>Poco vento</small>
              </button>
              <button type="button" className={`choice-card ${windCat === 'moderato' ? 'active' : ''}`} onClick={() => applyRecommended(tempCat, 'moderato', 'asciutta', activityCat)}>
                <strong>Variabile</strong>
                <small>Vento / Neve</small>
              </button>
              <button type="button" className={`choice-card ${windCat === 'forte' ? 'active' : ''}`} onClick={() => applyRecommended(tempCat, 'forte', 'umida', activityCat)}>
                <strong>Bufera</strong>
                <small>Neve umida</small>
              </button>
            </div>

            <label style={{ fontSize: '0.66rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Attività prevalente</label>
            <div className="choice-grid-3" style={{ marginBottom: '14px' }}>
              <button type="button" className={`choice-card ${activityCat === 'attesa' ? 'active' : ''}`} onClick={() => applyRecommended(tempCat, windCat, precipCat, 'attesa')}>
                <strong>Attesa</strong>
                <small>Fermo / Impianti</small>
              </button>
              <button type="button" className={`choice-card ${activityCat === 'lezione' ? 'active' : ''}`} onClick={() => applyRecommended(tempCat, windCat, precipCat, 'lezione')}>
                <strong>Lezione</strong>
                <small>Ritmo misto</small>
              </button>
              <button type="button" className={`choice-card ${activityCat === 'intensa' ? 'active' : ''}`} onClick={() => applyRecommended(tempCat, windCat, precipCat, 'intensa')}>
                <strong>Intensa</strong>
                <small>Sciata continua</small>
              </button>
            </div>

            <label style={{ fontSize: '0.66rem', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
              Aggiungi / togli strati per testare l’equilibrio
            </label>
            <div className="choice-grid-3">
              <button
                type="button"
                className={`choice-card ${manualOverride.base ? 'active' : ''}`}
                onClick={() => setManualOverride((m) => ({ ...m, base: !m.base }))}
              >
                <strong>Intimo</strong>
                <small>{manualOverride.base ? 'Attivo' : 'Rimosso'}</small>
              </button>
              <button
                type="button"
                className={`choice-card ${manualOverride.mid ? 'active' : ''}`}
                onClick={() => setManualOverride((m) => ({ ...m, mid: !m.mid }))}
              >
                <strong>Isolamento</strong>
                <small>{manualOverride.mid ? 'Attivo' : 'Rimosso'}</small>
              </button>
              <button
                type="button"
                className={`choice-card ${manualOverride.outer ? 'active' : ''}`}
                onClick={() => setManualOverride((m) => ({ ...m, outer: !m.outer }))}
              >
                <strong>Guscio 20k</strong>
                <small>{manualOverride.outer ? 'Attivo' : 'Rimosso'}</small>
              </button>
            </div>
          </div>

          <div className="lab-card gold" style={{ marginBottom: 0 }}>
            <h5>Equilibrio protezione / smaltimento</h5>
            <p>{getSimAdvice()}</p>
          </div>
        </div>
      )}

      {tab === 'quiz' && <QuizModule questions={quiz} />}

      <LabFooter
        sources={[
          { label: 'ISPO Material Innovations', url: 'https://www.ispo.com' },
          { label: 'Gore-Tex Membrane Guide', url: 'https://www.gore-tex.com' }
        ]}
      />
    </div>
  );
}

/* ============================================================================
   7. LABORATORIO GUANTI: "DENTRO UN GUANTO TECNICO"
   ============================================================================ */
function GloveLab() {
  const [tab, setTab] = useState('anatomy');
  const [part, setPart] = useState('isolamento');
  const [heatedVariant, setHeatedVariant] = useState(true);
  const [priority, setPriority] = useState('compromise');

  const parts = {
    esterno: {
      title: 'Rivestimento esterno (Shell)',
      copy: 'Pelle trattata o tessuti tecnici anti-abrasione con finitura idrorepellente per resistere a sfregamenti su lamine e neve.'
    },
    membrana: {
      title: 'Membrana impermeabile-traspirante',
      copy: 'Inserto interno sigillato che impedisce all’acqua di neve sciolta di raggiungere l’isolamento, lasciando evaporare l’umidità.'
    },
    isolamento: {
      title: 'Isolamento termico (PrimaLoft / Piuma / Aerogel)',
      copy: 'Trattiene l’aria calda intorno alle dita, spesso differenziato con maggiore spessore sul dorso rispetto al palmo.'
    },
    fodera: {
      title: 'Fodera interna (Lining)',
      copy: 'Morbida e traspirante (micropile o lana), facilita la calzata anche con mano umida.'
    },
    palmo: {
      title: 'Rinforzi del palmo & Grip',
      copy: 'Inserti in pelle di capra o materiali antiscivolo per garantire presa salda sul bastone e resistenza all’usura.'
    },
    polsino: {
      title: 'Polsino di chiusura',
      copy: 'Impedisce l’ingresso di neve fresca e dispersioni di calore al polso (versione corta sotto giacca o lunga sopra).'
    },
    resistenze: {
      title: 'Elementi riscaldanti (Variante riscaldata)',
      copy: 'Fili conduttivi flessibili distribuiti lungo il dorso e il contorno delle dita per contrastare la vasocostrizione periferica.'
    },
    batteria: {
      title: 'Pacco batteria nel polsino (Variante riscaldata)',
      copy: 'Alloggiato in una tasca dedicata del polsino, alimenta le resistenze su più livelli di intensità.'
    }
  };

  const techItems = [
    {
      badge: 'Prestazione 1',
      title: 'Impermeabilità vs Isolamento',
      subtitle: 'Due funzioni separate.',
      body: 'L’impermeabilità impedisce alla neve bagnata di penetrare; l’isolamento trattiene il calore della mano. Un guanto bagnato all’interno perde rapidamente capacità isolante.'
    },
    {
      badge: 'Prestazione 2',
      title: 'Destrezza & Presa (Grip / Trigger)',
      subtitle: 'Sensibilità sul bastone e sulle chiusure.',
      body: 'Un palmo più sottile e articolato aumenta la destrezza su ganci degli scarponi e zip, ma riduce la massa isolante rispetto al dorso.'
    },
    {
      badge: 'Prestazione 3',
      title: 'Riscaldamento attivo: intensità e autonomia',
      subtitle: 'Bilanciamento energetico.',
      body: 'Aumentare la potenza termica accelera il consumo della batteria: nelle giornate molto fredde è utile alternare livelli medi in movimento e livelli alti solo durante la risalita in seggiovia.'
    }
  ];

  const gloveFormats = {
    dexterity: {
      type: 'Guanto a 5 dita',
      pros: 'Massima destrezza individuale delle dita per regolare ganci, chiusure BOA, maschera e cerniere senza sfilare il guanto.',
      limits: 'Maggiore superficie esposta al freddo rispetto alla muffola: ogni dito disperde calore separatamente.'
    },
    warmth: {
      type: 'Muffola (Mitten)',
      pros: 'Massima protezione termica: le quattro dita condividono lo stesso volume d’aria calda riducendo la dispersione.',
      limits: 'Manipolazione di piccoli oggetti e ganci molto ridotta.'
    },
    compromise: {
      type: 'Soluzione a 3 dita (Lobster)',
      pros: 'Indice libero per presa precisa e regolazioni rapide, mentre medio, anulare e mignolo restano uniti per conservare calore.',
      limits: 'Compromesso intermedio: leggermente meno calda di una muffola integrale e meno agile di un 5 dita puro.'
    }
  };

  const quiz = [
    {
      question: 'Impermeabilità e isolamento termico in un guanto indicano la stessa prestazione?',
      answers: [
        'No: l’impermeabilità protegge dall’acqua esterna, mentre l’isolamento trattiene il calore.',
        'Sì, sono sinonimi esatti.',
        'Sì, entrambi dipendono solo dal polsino.'
      ],
      correct: 0,
      explanation: 'Membrana impermeabile e strato isolante svolgono compiti diversi e complementari.'
    },
    {
      question: 'Cosa succede all’autonomia della batteria aumentando l’intensità di un guanto riscaldato?',
      answers: [
        'L’autonomia aumenta automaticamente.',
        'Una potenza più elevata comporta un consumo maggiore e riduce la durata della carica.',
        'Non cambia nulla.'
      ],
      correct: 1,
      explanation: 'Maggiore potenza erogata alle resistenze riduce il tempo di funzionamento disponibile.'
    },
    {
      question: 'Un guanto molto spesso garantisce automaticamente una migliore destrezza?',
      answers: [
        'No, maggiore spessore aumenta l’isolamento ma riduce sensibilità e manipolazione fine.',
        'Sì, più imbottitura rende più facile aprire le zip.',
        'Sì, sempre.'
      ],
      correct: 0,
      explanation: 'Esiste sempre un compromesso diretto tra spessore dell’isolamento e sensibilità tattile.'
    }
  ];

  return (
    <div className="lab-shell">
      <div className="lab-header">
        <div>
          <span className="lab-eyebrow">Laboratorio interattivo</span>
          <h4 className="lab-title">Dentro un guanto tecnico</h4>
        </div>
        <button
          type="button"
          className={`part-pill ${heatedVariant ? 'active' : ''}`}
          onClick={() => setHeatedVariant((v) => !v)}
        >
          {heatedVariant ? '✓ Variante riscaldata' : '+ Variante riscaldata'}
        </button>
      </div>

      <LabTabs activeTab={tab} onChange={setTab} />

      {tab === 'anatomy' && (
        <div>
          <div className="diagram-stage">
            <svg viewBox="0 0 540 230" role="img" aria-label="Strati interni ed esterni di un guanto tecnico da sci">
              {/* Sagoma guanto */}
              <path
                d="M195 190 L195 110 Q195 75 220 75 Q235 75 235 105 L235 55 Q235 35 252 35 Q268 35 268 55 L268 45 Q268 25 285 25 Q302 25 302 45 L302 58 Q302 38 318 38 Q334 38 334 62 L334 145 L350 190 Z"
                fill={part === 'esterno' ? 'rgba(0,229,255,0.4)' : 'rgba(51,65,85,0.6)'}
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* Membrana + Isolamento */}
              <path
                d="M206 180 L206 112 Q206 86 225 86 L242 60 L274 50 L308 62 L322 145 L336 180 Z"
                fill={part === 'isolamento' || part === 'membrana' ? 'rgba(255,204,0,0.38)' : 'rgba(255,204,0,0.12)'}
                stroke="#ffcc00"
                strokeWidth="1.5"
              />
              {/* Rinforzo palmo */}
              <ellipse
                cx="272"
                cy="128"
                rx="34"
                ry="26"
                fill={part === 'palmo' ? 'rgba(0,229,255,0.55)' : 'rgba(148,163,184,0.28)'}
              />
              {/* Polsino */}
              <rect
                x="192"
                y="186"
                width="160"
                height="24"
                rx="6"
                fill={part === 'polsino' ? '#00e5ff' : '#1e293b'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {/* Elementi riscaldanti & batteria */}
              {heatedVariant && (
                <>
                  <path
                    d="M225 140 L248 64 M272 140 L285 52 M302 140 L316 66"
                    stroke={part === 'resistenze' ? '#ffcc00' : '#f87171'}
                    strokeWidth={part === 'resistenze' ? '4' : '2'}
                    strokeDasharray="4 3"
                  />
                  <rect
                    x="306"
                    y="190"
                    width="36"
                    height="16"
                    rx="4"
                    fill={part === 'batteria' ? '#ffcc00' : '#f97316'}
                  />
                </>
              )}
              <text x="85" y="75" fill="#00e5ff" fontSize="11">Esterno &amp; Membrana</text>
              <text x="85" y="130" fill="#ffcc00" fontSize="11">Isolamento &amp; Fodera</text>
              <text x="368" y="128" fill="#cbd5e1" fontSize="11">Rinforzi palmo</text>
              <text x="368" y="198" fill="#00e5ff" fontSize="11">Polsino {heatedVariant ? '+ Batteria' : ''}</text>
            </svg>
          </div>

          <div className="part-pills">
            {[
              { id: 'esterno', label: 'Esterno', color: '#00e5ff' },
              { id: 'membrana', label: 'Membrana', color: '#38bdf8' },
              { id: 'isolamento', label: 'Isolamento', color: '#ffcc00' },
              { id: 'fodera', label: 'Fodera', color: '#94a3b8' },
              { id: 'palmo', label: 'Palmo', color: '#00e5ff' },
              { id: 'polsino', label: 'Polsino', color: '#ffffff' },
              ...(heatedVariant
                ? [
                    { id: 'resistenze', label: 'Elementi riscaldanti', color: '#f87171' },
                    { id: 'batteria', label: 'Batteria', color: '#ffcc00' }
                  ]
                : [])
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`part-pill ${part === p.id ? 'active' : ''}`}
                onClick={() => setPart(p.id)}
              >
                <span className="part-dot" style={{ background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>

          <div className="lab-card">
            <h5>{parts[part]?.title}</h5>
            <p>{parts[part]?.copy}</p>
          </div>
        </div>
      )}

      {tab === 'tech' && <TechAccordionList items={techItems} />}

      {tab === 'try' && (
        <div>
          <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Scegli la tua priorità principale
          </label>
          <div className="choice-grid-3" style={{ marginBottom: '14px' }}>
            <button type="button" className={`choice-card ${priority === 'dexterity' ? 'active' : ''}`} onClick={() => setPriority('dexterity')}>
              <strong>Destrezza</strong>
              <small>Piccoli oggetti</small>
            </button>
            <button type="button" className={`choice-card ${priority === 'compromise' ? 'active' : ''}`} onClick={() => setPriority('compromise')}>
              <strong>Equilibrio</strong>
              <small>Compromesso</small>
            </button>
            <button type="button" className={`choice-card ${priority === 'warmth' ? 'active' : ''}`} onClick={() => setPriority('warmth')}>
              <strong>Calore</strong>
              <small>Freddo intenso</small>
            </button>
          </div>

          <div className="lab-card gold" style={{ marginBottom: 0 }}>
            <h5>{gloveFormats[priority].type}</h5>
            <p style={{ marginBottom: '8px' }}>
              <strong style={{ color: 'var(--accent-green)' }}>Vantaggi:</strong> {gloveFormats[priority].pros}
            </p>
            <p>
              <strong style={{ color: 'var(--accent-gold)' }}>Limiti:</strong> {gloveFormats[priority].limits}
            </p>
          </div>
        </div>
      )}

      {tab === 'quiz' && <QuizModule questions={quiz} />}

      <LabFooter
        sources={[
          { label: 'Leki Gloves & Trigger', url: 'https://www.leki.com' },
          { label: 'Hestra Ski Gloves', url: 'https://www.hestragloves.com' }
        ]}
      />
    </div>
  );
}

/* ============================================================================
   8. LABORATORIO OUT OF: "LA LENTE CHE SI ADATTA ALLA LUCE"
   ============================================================================ */
function OutOfLab() {
  const [tab, setTab] = useState('anatomy');
  const [part, setPart] = useState('lente');
  const [sunLevel, setSunLevel] = useState(50);

  const parts = {
    lente: {
      title: 'Doppia lente cilindrica / torica',
      copy: 'Crea una camera d’aria isolante tra esterno e interno, protegge al 100% dai raggi UV e ospita lo strato elettro-ottico.'
    },
    solare: {
      title: 'Sistema fotovoltaico integrato',
      copy: 'Una piccola cella solare integrata nella maschera alimenta direttamente il circuito: nessuna batteria da ricaricare e nessun pulsante.'
    },
    chip: {
      title: 'Componente elettronica (Chip IRID)',
      copy: 'Misura istantaneamente la luce ambientale e modula la tensione applicata alla pellicola a cristalli liquidi.'
    },
    lcd: {
      title: 'Strato a trasmissione luminosa variabile',
      copy: 'Pellicola a cristalli liquidi che varia continuamente la propria oscurità tra categoria S1 e S3 in meno di 1 secondo.'
    }
  };

  const techItems = [
    {
      badge: 'Ottica',
      title: 'VLT & Categorie di filtro (S0 – S4)',
      subtitle: 'Visible Light Transmission.',
      body: 'La VLT indica la percentuale di luce visibile che attraversa la lente: S1 (43–80% VLT, nuvoloso/nebbia), S2 (18–43%, variabile), S3 (8–18%, pieno sole).'
    },
    {
      badge: 'Confronto tecnologie',
      title: 'Lente Fissa vs Fotocromatica vs Elettronica (Out Of IRID)',
      subtitle: 'Velocità e autonomia di adattamento.',
      body: 'La lente fissa mantiene una sola VLT; la fotocromatica reagisce ai raggi UV ma impiega decine di secondi e rallenta al freddo; la lente elettronica IRID cambia tinta in meno di 1 secondo.'
    },
    {
      badge: 'Protezione & Condensa',
      title: 'Protezione UV & Trattamento antiappannamento',
      subtitle: 'Funzioni distinte dal controllo della luminosità.',
      body: 'Il filtro UV protegge dai raggi ultravioletti indipendentemente dal colore della lente; l’antiappannamento dipende dalla doppia lente ventilata e dal rivestimento interno.'
    }
  ];

  const quiz = [
    {
      question: 'Che cosa indica la sigla VLT sulle lenti da sci?',
      answers: [
        'La velocità massima consentita in pista.',
        'La percentuale di luce visibile trasmessa attraverso la lente fino all’occhio.',
        'La resistenza ai graffi della montatura.'
      ],
      correct: 1,
      explanation: 'VLT significa Visible Light Transmission: valori alti indicano lenti chiare, valori bassi lenti scure.'
    },
    {
      question: 'Una lente più scura è sempre la scelta migliore per sciare?',
      answers: [
        'Sì, protegge meglio anche nella nebbia.',
        'No: in condizioni di ombra, bosco o nuvole una lente troppo scura riduce eccessivamente la percezione dei rilievi.',
        'Sì, perché aumenta la temperatura del viso.'
      ],
      correct: 1,
      explanation: 'Ogni condizione di luce richiede una trasmittanza adeguata per leggere le irregolarità della neve.'
    },
    {
      question: 'Adattamento alla luce e antiappannamento sono la stessa funzione?',
      answers: [
        'No: riguardano rispettivamente la regolazione della luminosità e la prevenzione della condensa interna.',
        'Sì, una lente scura non si appanna mai.',
        'Sì, dipendono entrambe dalla cella solare.'
      ],
      correct: 0,
      explanation: 'L’antiappannamento deriva da doppia lente, ventilazione e trattamento idrofilo interno.'
    }
  ];

  // Simulazione qualitativa luminosità trasmessa
  const fixedOpacity = 0.45;
  const iridOpacity = 0.16 + (sunLevel / 100) * 0.62;

  return (
    <div className="lab-shell">
      <div className="lab-header">
        <div>
          <span className="lab-eyebrow">Laboratorio interattivo</span>
          <h4 className="lab-title">La lente che si adatta alla luce</h4>
        </div>
      </div>

      <LabTabs activeTab={tab} onChange={setTab} />

      {tab === 'anatomy' && (
        <div>
          <div className="diagram-stage">
            <svg viewBox="0 0 540 200" role="img" aria-label="Componenti della maschera elettronica Out Of">
              {/* Montatura maschera */}
              <path
                d="M95 55 Q270 30 445 55 Q465 110 435 155 Q335 170 270 135 Q205 170 105 155 Q75 110 95 55 Z"
                fill="rgba(30,41,59,0.85)"
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* Lente + Strato LCD */}
              <path
                d="M112 65 Q270 44 428 65 Q442 108 418 142 Q330 154 270 124 Q210 154 122 142 Q98 108 112 65 Z"
                fill={part === 'lcd' ? 'rgba(0,229,255,0.45)' : 'rgba(2,132,199,0.28)'}
                stroke={part === 'lente' || part === 'lcd' ? '#00e5ff' : 'rgba(255,255,255,0.3)'}
                strokeWidth="2"
              />
              {/* Cella solare */}
              <rect
                x="220"
                y="43"
                width="100"
                height="12"
                rx="3"
                fill={part === 'solare' ? '#ffcc00' : 'rgba(255,204,0,0.35)'}
              />
              {/* Chip elettronico */}
              <rect
                x="256"
                y="58"
                width="28"
                height="14"
                rx="3"
                fill={part === 'chip' ? '#00e5ff' : '#0f172a'}
                stroke="#00e5ff"
                strokeWidth="1.5"
              />
              <text x="195" y="34" fill="#ffcc00" fontSize="11">Cella fotovoltaica</text>
              <text x="292" y="70" fill="#00e5ff" fontSize="11">Chip IRID</text>
              <text x="135" y="112" fill="#ffffff" fontSize="11">Lente + Strato LCD</text>
            </svg>
          </div>

          <div className="part-pills">
            {[
              { id: 'lente', label: 'Lente', color: '#00e5ff' },
              { id: 'solare', label: 'Sistema fotovoltaico', color: '#ffcc00' },
              { id: 'chip', label: 'Elettronica IRID', color: '#00e5ff' },
              { id: 'lcd', label: 'Strato trasmissione', color: '#38bdf8' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`part-pill ${part === p.id ? 'active' : ''}`}
                onClick={() => setPart(p.id)}
              >
                <span className="part-dot" style={{ background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>

          <div className="lab-card">
            <h5>{parts[part].title}</h5>
            <p>{parts[part].copy}</p>
          </div>
        </div>
      )}

      {tab === 'tech' && <TechAccordionList items={techItems} />}

      {tab === 'try' && (
        <div>
          <div className="sim-box">
            <div className="sim-row">
              <div className="sim-row-head">
                <label>Condizione ambientale: Ombra ↔ Pieno Sole</label>
                <span>{sunLevel < 35 ? 'Ombra / Bosco' : sunLevel > 70 ? 'Pieno Sole' : 'Variabile'}</span>
              </div>
              <input type="range" min="0" max="100" value={sunLevel} onChange={(e) => setSunLevel(Number(e.target.value))} />
            </div>

            <div className="choice-grid-2">
              <div className="diagram-stage" style={{ marginBottom: 0 }}>
                <svg viewBox="0 0 220 120" role="img" aria-label="Simulazione lente fissa S2">
                  <polygon points="20,105 95,35 160,105" fill="#cbd5e1" />
                  <polygon points="95,105 155,48 205,105" fill="#94a3b8" />
                  <rect x="0" y="0" width="220" height="120" fill={`rgba(2, 6, 15, ${fixedOpacity})`} />
                  <text x="12" y="20" fill="#ffffff" fontSize="11">Lente fissa (S2)</text>
                </svg>
                <p className="diagram-caption">
                  {sunLevel > 70 ? 'Abbagliamento al sole pieno' : sunLevel < 35 ? 'Un po’ scura nel bosco' : 'Resa bilanciata'}
                </p>
              </div>

              <div className="diagram-stage" style={{ marginBottom: 0 }}>
                <svg viewBox="0 0 220 120" role="img" aria-label="Simulazione lente elettronica IRID">
                  <polygon points="20,105 95,35 160,105" fill="#cbd5e1" />
                  <polygon points="95,105 155,48 205,105" fill="#94a3b8" />
                  <rect x="0" y="0" width="220" height="120" fill={`rgba(2, 6, 15, ${iridOpacity})`} />
                  <text x="12" y="20" fill="#00e5ff" fontSize="11">Elettronica (S1–S3)</text>
                </svg>
                <p className="diagram-caption">
                  {sunLevel > 70 ? 'Si oscura istantaneamente' : sunLevel < 35 ? 'Si schiarisce nel bosco' : 'Adattamento continuo'}
                </p>
              </div>
            </div>
            <p className="diagram-caption" style={{ marginTop: '10px' }}>
              Dimostrazione illustrativa: il monitor non riproduce fedelmente le prestazioni ottiche reali del prodotto.
            </p>
          </div>
        </div>
      )}

      {tab === 'quiz' && <QuizModule questions={quiz} />}

      <LabFooter sources={[{ label: 'Out Of Optics · IRID', url: 'https://out-of.com' }]} />
    </div>
  );
}

/* ============================================================================
   9. LABORATORIO SOUNDBRKR: "COMUNICARE ATTRAVERSO LA MASCHERA"
   ============================================================================ */
function SoundBrkrLab() {
  const [tab, setTab] = useState('anatomy');
  const [part, setPart] = useState('trasduttori');
  const [skiers, setSkiers] = useState(3);
  const [linkState, setLinkState] = useState('active');

  const parts = {
    maschera: {
      title: 'Struttura della maschera',
      copy: 'Integra l’elettronica senza richiedere auricolari separati all’interno del casco.'
    },
    trasduttori: {
      title: 'Trasduttori a conduzione ossea',
      copy: 'Appoggiano sugli zigomi e trasmettono micro-vibrazioni sonore all’orecchio interno, lasciando liberi i padiglioni auricolari.'
    },
    microfono: {
      title: 'Microfono integrato',
      copy: 'Posizionato per ridurre il rumore del vento e captare la voce durante la comunicazione con il gruppo o al telefono.'
    },
    comandi: {
      title: 'Comandi fisici accessibili',
      copy: 'Pulsanti progettati per essere azionati anche indossando i guanti da sci.'
    },
    alimentazione: {
      title: 'Batteria interna ricaricabile',
      copy: 'Alimenta i trasduttori e il modulo Bluetooth; l’autonomia varia in base al volume e al tempo di conversazione.'
    }
  };

  const techItems = [
    {
      badge: 'Acustica',
      title: 'Trasmissione mediante vibrazioni (Conduzione ossea)',
      subtitle: 'Orecchie libere per percepire l’ambiente.',
      body: 'Le vibrazioni attraversano le ossa zigomatiche evitando il timpano: lo sciatore continua a sentire il rumore delle lamine e gli altri sciatori.'
    },
    {
      badge: 'Tre modalità d’uso',
      title: 'Gruppo Intercom vs Smartphone vs Indicazioni Audio',
      subtitle: 'Flussi distinti e complementari.',
      body: '1. Comunicazione diretta tra dispositivi abbinati nel gruppo; 2. Collegamento Bluetooth allo smartphone per chiamate; 3. Ascolto di indicazioni audio da app (es. navigazione o coaching).'
    }
  ];

  const quiz = [
    {
      question: 'Bluetooth e localizzazione satellitare GPS sono la stessa funzione?',
      answers: [
        'No: Bluetooth gestisce il collegamento audio/dati a corto raggio, mentre il GPS serve per il posizionamento satellitare.',
        'Sì, il Bluetooth traccia automaticamente le piste su mappa.',
        'Sì, sono identici.'
      ],
      correct: 0,
      explanation: 'Sono due tecnologie radio completamente diverse per portata e funzione.'
    },
    {
      question: 'Lasciare libero il canale uditivo elimina automaticamente qualsiasi distrazione?',
      answers: [
        'Sì, chi usa la conduzione ossea non si distrae mai.',
        'No: permette di percepire i suoni esterni, ma l’ascolto richiede comunque attenzione cognitiva.',
        'Sì, perché blocca ogni pensiero.'
      ],
      correct: 1,
      explanation: 'Sentire l’ambiente è un vantaggio di sicurezza, ma conversazioni o audio possono comunque ridurre l’attenzione.'
    },
    {
      question: 'Dossi, alberi e ostacoli fisici possono influenzare il collegamento tra dispositivi?',
      answers: [
        'Sì, il rilievo del terreno e gli ostacoli possono attenuare o interrompere temporaneamente il segnale.',
        'No, il segnale attraversa qualsiasi montagna senza limiti.',
        'Solo se nevica.'
      ],
      correct: 0,
      explanation: 'La portata radio reale dipende sempre da orografia, ostacoli e condizioni operative.'
    }
  ];

  return (
    <div className="lab-shell">
      <div className="lab-header">
        <div>
          <span className="lab-eyebrow">Laboratorio interattivo</span>
          <h4 className="lab-title">Comunicare attraverso la maschera</h4>
        </div>
      </div>

      <LabTabs activeTab={tab} onChange={setTab} />

      {tab === 'anatomy' && (
        <div>
          <div className="diagram-stage">
            <svg viewBox="0 0 540 200" role="img" aria-label="Componenti audio a conduzione ossea integrati nella maschera">
              <path
                d="M110 55 Q270 35 430 55 Q448 105 420 148 Q330 162 270 130 Q210 162 120 148 Q92 105 110 55 Z"
                fill={part === 'maschera' ? 'rgba(0,229,255,0.32)' : 'rgba(30,41,59,0.8)'}
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* Trasduttori sugli zigomi */}
              <circle cx="145" cy="144" r="13" fill={part === 'trasduttori' ? '#ffcc00' : '#00e5ff'} />
              <circle cx="395" cy="144" r="13" fill={part === 'trasduttori' ? '#ffcc00' : '#00e5ff'} />
              {/* Microfono */}
              <rect x="260" y="128" width="20" height="10" rx="3" fill={part === 'microfono' ? '#ffcc00' : '#94a3b8'} />
              {/* Comandi */}
              <rect x="96" y="84" width="12" height="28" rx="3" fill={part === 'comandi' ? '#00e5ff' : '#64748b'} />
              {/* Batteria */}
              <rect x="432" y="84" width="12" height="28" rx="3" fill={part === 'alimentazione' ? '#ffcc00' : '#64748b'} />
              <text x="122" y="176" fill="#ffcc00" fontSize="11">Trasduttori ossei</text>
              <text x="242" y="162" fill="#cbd5e1" fontSize="11">Microfono</text>
              <text x="25" y="102" fill="#00e5ff" fontSize="11">Comandi</text>
              <text x="452" y="102" fill="#ffcc00" fontSize="11">Batteria</text>
            </svg>
          </div>

          <div className="part-pills">
            {[
              { id: 'maschera', label: 'Maschera', color: '#ffffff' },
              { id: 'trasduttori', label: 'Trasduttori', color: '#ffcc00' },
              { id: 'microfono', label: 'Microfono', color: '#94a3b8' },
              { id: 'comandi', label: 'Comandi', color: '#00e5ff' },
              { id: 'alimentazione', label: 'Alimentazione', color: '#ffcc00' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`part-pill ${part === p.id ? 'active' : ''}`}
                onClick={() => setPart(p.id)}
              >
                <span className="part-dot" style={{ background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>

          <div className="lab-card">
            <h5>{parts[part].title}</h5>
            <p>{parts[part].copy}</p>
          </div>
        </div>
      )}

      {tab === 'tech' && <TechAccordionList items={techItems} />}

      {tab === 'try' && (
        <div>
          <div className="sim-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Sciatori nel gruppo: {skiers}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="button" className="action-btn secondary" disabled={skiers <= 2} onClick={() => setSkiers((s) => s - 1)}>
                  − Sciatore
                </button>
                <button type="button" className="action-btn secondary" disabled={skiers >= 5} onClick={() => setSkiers((s) => s + 1)}>
                  + Sciatore
                </button>
              </div>
            </div>

            <div className="choice-grid-3" style={{ marginBottom: '12px' }}>
              <button type="button" className={`choice-card ${linkState === 'active' ? 'active' : ''}`} onClick={() => setLinkState('active')}>
                <strong>Attivo</strong>
                <small>Segnale stabile</small>
              </button>
              <button type="button" className={`choice-card ${linkState === 'lost' ? 'active' : ''}`} onClick={() => setLinkState('lost')}>
                <strong>Perso</strong>
                <small>Ostacolo / Dosso</small>
              </button>
              <button type="button" className={`choice-card ${linkState === 'reconnecting' ? 'active' : ''}`} onClick={() => setLinkState('reconnecting')}>
                <strong>Riconnessione</strong>
                <small>Aggancio auto</small>
              </button>
            </div>

            <div className="diagram-stage" style={{ marginBottom: 0 }}>
              <svg viewBox="0 0 520 150" role="img" aria-label="Rete dimostrativa di comunicazione tra sciatori">
                {Array.from({ length: skiers }).map((_, idx) => {
                  const x = 70 + idx * (380 / Math.max(1, skiers - 1));
                  const y = idx % 2 === 0 ? 55 : 105;
                  const nextX = 70 + ((idx + 1) % skiers) * (380 / Math.max(1, skiers - 1));
                  const nextY = ((idx + 1) % skiers) % 2 === 0 ? 55 : 105;
                  const strokeCol =
                    linkState === 'active' ? '#00e5ff' : linkState === 'reconnecting' ? '#ffcc00' : '#f87171';
                  return (
                    <g key={idx}>
                      {idx < skiers - 1 && (
                        <line
                          x1={x}
                          y1={y}
                          x2={nextX}
                          y2={nextY}
                          stroke={strokeCol}
                          strokeWidth="2"
                          strokeDasharray={linkState === 'active' ? 'none' : '5 5'}
                        />
                      )}
                      <circle cx={x} cy={y} r="16" fill="#0f172a" stroke={strokeCol} strokeWidth="2.5" />
                      <text x={x - 14} y={y + 4} fill="#ffffff" fontSize="10">
                        {idx === 0 ? 'Maest' : `Sci ${idx}`}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <p className="diagram-caption">
                Dimostrazione qualitativa: il comportamento reale dipende da modello, ostacoli e condizioni del terreno, non dalla distanza grafica.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'quiz' && <QuizModule questions={quiz} />}

      <LabFooter sources={[{ label: 'BoneTech · IceBRKR', url: 'https://www.bonetech.it' }]} />
    </div>
  );
}

/* ============================================================================
   10. LABORATORIO TELEMETRIA: "LEGGERE UNA SCIATA ATTRAVERSO I DATI"
   ============================================================================ */
function TelemetryLab() {
  const [tab, setTab] = useState('anatomy');
  const [node, setNode] = useState('sensori');
  const [selectedTurn, setSelectedTurn] = useState(0);

  const nodes = {
    sensori: {
      title: 'Sensori inerziali (IMU) & Solette',
      copy: 'Misurano direttamente accelerazioni lineari, velocità angolari e pressione plantare sotto il piede (es. Carv 2, Moticon OpenGo).'
    },
    smartphone: {
      title: 'Smartphone (Elaborazione & Coaching)',
      copy: 'Riceve i dati dai sensori via Bluetooth, calcola le metriche durante la discesa e fornisce feedback vocali o grafici.'
    },
    gps: {
      title: 'GPS (Traiettoria & Velocità)',
      copy: 'Calcola posizione, dislivello, linea percorsa e velocità tramite segnale satellitare (es. Lympic, Protern Live, pettorine GPS per scuole sci).'
    },
    video: {
      title: 'Video sincronizzato',
      copy: 'Permette di confrontare il dato numerico con l’immagine reale della postura (es. Dartfish, EDGIN).'
    }
  };

  const techItems = [
    {
      badge: 'Sensori inerziali',
      title: 'Accelerometro & Giroscopio (IMU)',
      subtitle: 'Misure fisiche dirette.',
      body: 'L’accelerometro misura le accelerazioni lungo tre assi; il giroscopio misura la velocità di rotazione dello scarpone o dello sci.'
    },
    {
      badge: 'Metodo scientifico',
      title: 'Misurato direttamente vs Calcolato vs Stimato',
      subtitle: 'Distinguere la natura di ogni dato.',
      body: 'Misurato direttamente: accelerazione, velocità angolare, pressione plantare. Calcolato: posizione e velocità da segnale GPS. Stimato algoritmicamente: angolo di spigolo, simmetria e punteggi sintetici (es. Ski:IQ).'
    },
    {
      badge: 'Prodotti commerciali',
      title: 'Carv 2 · Moticon OpenGo · Lympic · Pettorine GPS',
      subtitle: 'Dalla didattica all’agonismo.',
      body: 'Carv 2 offre coaching audio in pista; Moticon OpenGo analizza le pressioni plantari; Lympic traccia linee e tempi atleti; le pettorine GPS localizzano i bambini nei corsi.'
    },
    {
      badge: 'Progetto di ricerca · Non commerciale',
      isResearch: true,
      title: 'SoleCoach (Augmented Humans 2026)',
      subtitle: 'Traduzione dei dati plantari in linguaggio naturale.',
      body: 'Sistema sperimentale presentato in ambito accademico che elabora dati di solette e sensori inerziali per generare consigli tecnici testuali. È ricerca, non un pacchetto commerciale completo.'
    }
  ];

  const turns = [
    { name: 'Curva 1 · Sx', edge: 68, symmetry: 92, flow: 84, question: 'Questa buona simmetria iniziale si mantiene anche sul cambio di pendenza successivo?' },
    { name: 'Curva 2 · Dx', edge: 54, symmetry: 76, flow: 72, question: 'Questa differenza tra destra e sinistra è visibile anche nel video?' },
    { name: 'Curva 3 · Sx', edge: 71, symmetry: 88, flow: 86, question: 'L’inclinazione maggiore a sinistra nasce da una presa di spigolo graduale o da un’inclinazione del busto?' },
    { name: 'Curva 4 · Dx', edge: 58, symmetry: 79, flow: 75, question: 'Sul lato destro lo sciatore carica lo sci esterno con lo stesso tempismo del lato sinistro?' }
  ];

  const quiz = [
    {
      question: 'Un ricevitore GPS misura direttamente la pressione esercitata sotto la pianta del piede?',
      answers: [
        'Sì, i satelliti rilevano i grammi su ciascun tallone.',
        'No: il GPS calcola posizione e velocità; la pressione richiede solette o sensori plantari dedicati.',
        'Sì, se abbinato a un casco MIPS.'
      ],
      correct: 1,
      explanation: 'Il GPS lavora sulla posizione geografica e non può rilevare cosa accade dentro lo scarpone.'
    },
    {
      question: 'Una metrica stimata da un algoritmo equivale a una misura fisica diretta?',
      answers: [
        'No: una stima combina segnali tramite un modello matematico e comporta margini di approssimazione.',
        'Sì, è sempre identica a uno strumento di laboratorio.',
        'Sì, non dipende mai dal posizionamento del sensore.'
      ],
      correct: 0,
      explanation: 'Distinguere misura diretta e stima algoritmica aiuta a interpretare i dati con spirito critico.'
    },
    {
      question: 'Il punteggio numerico di un’app coincide automaticamente con un livello tecnico federale?',
      answers: [
        'Sì, sostituisce la valutazione del maestro di sci.',
        'No: i punteggi delle app sono indicatori proprietari utili al confronto personale, non valutazioni ufficiali.',
        'Sì, vale come diploma FISI.'
      ],
      correct: 1,
      explanation: 'Un singolo numero non può valutare postura, adattamento al terreno e sicurezza complessiva.'
    }
  ];

  const activeT = turns[selectedTurn];

  return (
    <div className="lab-shell">
      <div className="lab-header">
        <div>
          <span className="lab-eyebrow">Laboratorio interattivo</span>
          <h4 className="lab-title">Leggere una sciata attraverso i dati</h4>
        </div>
      </div>

      <LabTabs activeTab={tab} onChange={setTab} />

      {tab === 'anatomy' && (
        <div>
          <div className="diagram-stage">
            <svg viewBox="0 0 540 200" role="img" aria-label="Ecosistema sensori, GPS, smartphone e video">
              <line x1="130" y1="100" x2="250" y2="100" stroke="#00e5ff" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="290" y1="100" x2="410" y2="60" stroke="#ffcc00" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="290" y1="100" x2="410" y2="140" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />

              <circle cx="105" cy="100" r="30" fill={node === 'sensori' ? 'rgba(0,229,255,0.4)' : '#0f172a'} stroke="#00e5ff" strokeWidth="2" />
              <text x="82" y="104" fill="#ffffff" fontSize="11">Sensori</text>

              <rect x="235" y="70" width="70" height="60" rx="10" fill={node === 'smartphone' ? 'rgba(255,204,0,0.4)' : '#0f172a'} stroke="#ffcc00" strokeWidth="2" />
              <text x="247" y="104" fill="#ffffff" fontSize="11">App / IA</text>

              <circle cx="430" cy="58" r="26" fill={node === 'gps' ? 'rgba(255,204,0,0.4)' : '#0f172a'} stroke="#ffcc00" strokeWidth="2" />
              <text x="417" y="62" fill="#ffffff" fontSize="11">GPS</text>

              <circle cx="430" cy="142" r="26" fill={node === 'video' ? 'rgba(0,229,255,0.4)' : '#0f172a'} stroke="#00e5ff" strokeWidth="2" />
              <text x="413" y="146" fill="#ffffff" fontSize="11">Video</text>
            </svg>
          </div>

          <div className="part-pills">
            {[
              { id: 'sensori', label: 'Sensori IMU / Solette', color: '#00e5ff' },
              { id: 'smartphone', label: 'Smartphone', color: '#ffcc00' },
              { id: 'gps', label: 'GPS / Pettorine', color: '#ffcc00' },
              { id: 'video', label: 'Video', color: '#38bdf8' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`part-pill ${node === p.id ? 'active' : ''}`}
                onClick={() => setNode(p.id)}
              >
                <span className="part-dot" style={{ background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>

          <div className="lab-card">
            <h5>{nodes[node].title}</h5>
            <p>{nodes[node].copy}</p>
          </div>
        </div>
      )}

      {tab === 'tech' && <TechAccordionList items={techItems} />}

      {tab === 'try' && (
        <div>
          <div className="sim-box">
            <span style={{ display: 'block', fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-gold)', marginBottom: '8px' }}>
              Discesa dimostrativa (Dati simulati a scopo didattico)
            </span>
            <div className="subtabs-row">
              {turns.map((t, idx) => (
                <button
                  key={t.name}
                  type="button"
                  className={`subtab-btn ${selectedTurn === idx ? 'active' : ''}`}
                  onClick={() => setSelectedTurn(idx)}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <div className="diagram-stage" style={{ marginBottom: '10px' }}>
              <svg viewBox="0 0 520 145" role="img" aria-label="Sequenza curve e metriche sincronizzate">
                <path
                  d="M 40 72 Q 100 20 160 72 T 280 72 T 400 72 T 490 72"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="3"
                />
                {turns.map((t, idx) => {
                  const cx = 100 + idx * 110;
                  const cy = idx % 2 === 0 ? 46 : 98;
                  const active = idx === selectedTurn;
                  return (
                    <g key={t.name} onClick={() => setSelectedTurn(idx)} style={{ cursor: 'pointer' }}>
                      <circle cx={cx} cy={cy} r={active ? 14 : 9} fill={active ? '#ffcc00' : '#00e5ff'} />
                      <text x={cx - 12} y={cy + (idx % 2 === 0 ? -18 : 24)} fill="#ffffff" fontSize="10">
                        C{idx + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div style={{ display: 'grid', gap: '8px', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Inclinazione stimata:</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>{activeT.edge}% (stima algoritmica)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Simmetria sx / dx:</span>
                <strong style={{ color: 'var(--accent-gold)' }}>{activeT.symmetry}% (calcolata)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Fluidità transizione:</span>
                <strong style={{ color: '#ffffff' }}>{activeT.flow}% (stima)</strong>
              </div>
            </div>
          </div>

          <div className="lab-card gold" style={{ marginBottom: 0 }}>
            <h5>Domanda guida per il maestro</h5>
            <p>{activeT.question}</p>
          </div>
        </div>
      )}

      {tab === 'quiz' && <QuizModule questions={quiz} />}

      <LabFooter
        sources={[
          { label: 'Carv Digital Ski Coach', url: 'https://getcarv.com' },
          { label: 'Moticon OpenGo', url: 'https://moticon.com' },
          { label: 'Protern Live', url: 'https://protern.io' }
        ]}
      />
    </div>
  );
}

/* ============================================================================
   EXPORT PRINCIPALE
   ============================================================================ */
export default function InteractiveLab({ itemId }) {
  switch (itemId) {
    case 'casco':
      return <HelmetLab />;
    case 'sci':
      return <SkiLab />;
    case 'scarpone':
      return <BootLab />;
    case 'attacchi':
      return <BindingLab />;
    case 'bastoni':
      return <PoleLab />;
    case 'termoregolazione':
      return <ThermoLab />;
    case 'guanti':
      return <GloveLab />;
    case 'maschera_outof':
      return <OutOfLab />;
    case 'maschera_audio':
      return <SoundBrkrLab />;
    case 'telemetria':
      return <TelemetryLab />;
    default:
      return null;
  }
}