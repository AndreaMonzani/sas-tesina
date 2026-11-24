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
      title: 'Protezione negli impatti obliqui',
      copy: 'Sistemi come Mips permettono un micro-scorrimento interno (10–15 mm) progettato per ridurre le forze rotazionali trasmesse al cervello durante gli impatti obliqui.'
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
        subtitle: 'Obbligatorio per gare FIS.',
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
      title: 'Gara',
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
      question: 'Per una gara agonistica ufficiale, quale etichetta cerchi?',
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
          { label: 'RECCO', url: 'https://recco.com' }
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
      badge: 'Costruzione · Rinforzi Strutturali',
      title: 'Titanal, Carbonio e Double Core',
      subtitle: 'Bilanciare stabilità e peso.',
      body: 'L\'inserimento di fogli in Titanal (lega di alluminio) stabilizza lo sci ad alta velocità. Nuove costruzioni ibride o "Double Core" usano inserti in elastomero tra due anime in legno per filtrare le vibrazioni mantenendo un flex rotondo e meno faticoso.'
    },
    {
      badge: 'Smorzamento attivo delle vibrazioni',
      title: 'Sistemi di dissipazione energetica (es. HEAD EMC)',
      subtitle: 'Riduzione delle oscillazioni parassite.',
      body: 'Alcuni sci moderni usano circuiti piezoelettrici o polimeri non newtoniani. Con l\'aumentare della velocità e delle vibrazioni sul ghiaccio, questi materiali dissipano l\'energia cinetica per stabilizzare rapidamente la spatola.'
    },
    {
      badge: 'Geometrie Multi-Raggio',
      title: 'Rocker, Camber e Multi-Radius',
      subtitle: 'Versatilità in curva.',
      body: 'Le sciancrature moderne fondono raggi corti in spatola (per un ingresso curva fulmineo) e raggi medi in coda (per stabilità). Il Rocker in spatola facilita l\'inversione e il galleggiamento in fresca, senza agganciare bruscamente lo spigolo.'
    }
  ];

  const generalRecs = {
    pista: {
      principiante: {
        basso: 'Entry Level (Raggio 11-13 m): flex molto morbido e geometria tollerante (cap) per facilitare lo spazzaneve e le prime curve a sci paralleli.',
        medio: 'All-Round Base (Raggio 12-14 m): nucleo leggero (spesso senza inserti in metallo), spatola morbida che perdona gli arretramenti.',
        alto: 'All-Round Evolution: costruzione sandwich leggera in legno/carbonio. Stabile ma non faticoso, per accompagnare il progresso senza stressare le articolazioni.'
      },
      intermedio: {
        basso: 'Sport Carve leggero (Centro 72-74 mm): reattivo ma tollerante, permette di sviluppare la conduzione senza richiedere fisicità eccessiva.',
        medio: 'Sport Carve rinforzato (Raggio 14-15 m): rinforzi singoli in Titanal per mantenere stabilità a velocità di crociera su neve compatta.',
        alto: 'Performance Multi-Raggio: struttura robusta ma spatola gestibile. Ideale per l\'amatore evoluto (L5) che cerca precisione ma scia tutto il giorno.'
      },
      esperto: {
        basso: 'Race Carve Commerciale (SL/GS): derivati dai modelli da gara, richiedono tecnica solida (L6) e preparazione atletica per essere sfruttati sul ghiaccio.',
        medio: 'Race Carve Master (Doppio Titanal, Piastra Rigida): sci pesanti e ultra-strutturati, ideali solo per sciatori potenti (L7) su pendenze importanti.',
        alto: 'Custom Biometrico o Workshop: costruzione artigianale o algoritmica calibrata esattamente su peso, altezza e biomeccanica dello sciatore (es. ORIGINAL+ o laboratori specializzati).'
      }
    },
    allmountain: {
      principiante: {
        basso: 'All-Mountain Easy (Centro 76-80 mm): largo sotto il piede per dare stabilità extra su nevi mosse o cumuli primaverili.',
        medio: 'All-Mountain Base: profilo rocker accentuato in punta per galleggiare meglio e non agganciare lo spigolo per errore.',
        alto: 'Crossover Leggero (80-84 mm): sci estremamente manovrabile che unisce la facilità in pista alla sicurezza a bordo pista.'
      },
      intermedio: {
        basso: 'All-Mountain Resort (84-86 mm): 70% pista, 30% fuoripista. Attutisce le vibrazioni sulla neve rotta tipica del pomeriggio.',
        medio: 'All-Mountain Strutturato (86-90 mm): spesso con rinforzi sotto l\'attacco. Conduce in pista ma non teme brevi uscite in neve fresca.',
        alto: 'All-Mountain High Performance: anima in legno e leghe leggere, unisce tenuta su pista battuta a spiccate doti di galleggiamento.'
      },
      esperto: {
        basso: 'All-Mountain Charger (90-95 mm): sci rigido, richiede velocità per deformarsi. Perfetto per carvare sulla neve smossa o trasformata.',
        medio: 'Freeride-Carve (95-100 mm): lo sci totale per l\'esperto. Doppia anima in metallo, distrugge il traffico in pista e vola nella polvere.',
        alto: 'Custom All-Mountain: costruzione personalizzata per il professionista che alterna boschi ripidi a veloci rientri su pista.'
      }
    },
    fuoripista: {
      principiante: {
        basso: 'Freeride Entry (90-95 mm): twin-tip leggero e giocoso. Perfetto per i primissimi approcci nei boschetti a bordo pista.',
        medio: 'Freeride Soft (95-100 mm): costruzione senza metallo. Flessibile e permissivo, perdona gli errori di bilanciamento in neve profonda.',
        alto: 'Freetouring Leggero (95-100 mm): sci agile e leggero, adatto anche a brevi risalite con le pelli per chi vuole allontanarsi dagli impianti.'
      },
      intermedio: {
        basso: 'Freeride Playful (100-105 mm): grande galleggiabilità, ottimo per sciare in fresca con uno stile saltellante e creativo nei boschi.',
        medio: 'Freeride All-Conditions (105-110 mm): il compromesso ideale per le grandi nevicate, mantenendo una struttura sufficiente per la neve crostosa.',
        alto: 'Freeride Carbon Tech: inserti in carbonio per avere massima reattività sotto il piede senza aggiungere il peso del Titanal.'
      },
      esperto: {
        basso: 'Big Mountain (108-112 mm): sci direzionale per alte velocità su pendii aperti e incontaminati.',
        medio: 'Deep Powder Charger (115+ mm): largo e rigido. La scelta per le giornate epiche, richiede gambe forti e spazi ampi.',
        alto: 'Pro Freeride Custom: lo strumento definitivo per atleti e maestri che affrontano canali estremi o l\'heliskiing, calibrato su misura.'
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
      question: 'Come si comportano generalmente gli sci della categoria "All-Mountain" (80-95mm al centro)?',
      answers: [
        'Sono sci esclusivamente da gara per le discipline veloci (Discesa Libera).',
        'Offrono un compromesso: galleggiano meglio nella neve smossa/fresca ma sono leggermente più lenti nei cambi di spigolo in pista.',
        'Hanno le lamine solo su un lato.'
      ],
      correct: 1,
      explanation: 'La maggiore larghezza al centro aumenta la superficie d\'appoggio (galleggiamento) a discapito della rapidità d\'inversione (edge-to-edge) su pista battuta.'
    }
  ];

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
              <polygon
                points="110,45 490,45 530,72 70,72"
                fill={part === 'rinforzi' ? 'rgba(0, 229, 255, 0.45)' : 'rgba(148, 163, 184, 0.25)'}
                stroke={part === 'rinforzi' ? '#00e5ff' : 'rgba(255,255,255,0.25)'}
                strokeWidth="2"
              />
              <polygon
                points="110,84 490,84 530,111 70,111"
                fill={part === 'smorzamento' ? 'rgba(255, 204, 0, 0.45)' : 'rgba(255, 204, 0, 0.14)'}
                stroke={part === 'smorzamento' ? '#ffcc00' : 'rgba(255,204,0,0.35)'}
                strokeWidth="2"
              />
              <polygon
                points="100,124 500,124 542,155 58,155"
                fill={part === 'anima' ? 'rgba(0, 229, 255, 0.55)' : 'rgba(56, 189, 248, 0.22)'}
                stroke={part === 'anima' ? '#ffffff' : 'rgba(255,255,255,0.3)'}
                strokeWidth="2"
              />
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
              Esempio illustrativo di sezione esplosa: materiali e disposizione cambiano in base alla casa costruttrice e alla destinazione d'uso.
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
                <path
                  d={`M 40 50 Q 280 ${50 + arcDepth} 520 50`}
                  stroke="#00e5ff"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
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
            <h5>Compromesso dinamico in pista</h5>
            <p>
              {flexLong > 70
                ? 'Una flessione rigida offre sostegno ad alta velocità, ma richiede più forza e centralità per deformare lo sci a basse andature (ideale per esperti L6+). '
                : 'Una flessione più morbida facilita l’ingresso curva a velocità moderata, ma tende a cedere se spinta al limite sul ripido (ideale per livelli L3-L5). '}
              {torsion > 70
                ? 'L’alta rigidità torsionale massimizza la presa di spigolo sul ghiaccio, riducendo però la tolleranza agli errori. '
                : 'Una torsione più docile perdona le sbavature, ma perde precisione sul terreno ghiacciato. '}
              {damping > 70
                ? 'Un forte smorzamento rende la sciata silenziosa e fluida, ideale sulle piste rovinate di fine giornata.'
                : 'Uno smorzamento contenuto mantiene lo sci reattivo e rapido nei cambi, trasmettendo vibrazioni dirette.'}
            </p>
          </div>

          <div className="sim-box" style={{ marginBottom: 0 }}>
            <h5 style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.98rem', color: 'var(--accent-gold)', marginBottom: '10px' }}>
              Consigliatore: Trova la categoria adatta
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
              {generalRecs[terrain][level][budget]}
            </p>
          </div>
        </div>
      )}

      {tab === 'quiz' && <QuizModule questions={quiz} />}

      <LabFooter
        sources={[
          { label: 'HEAD Ski Technology', url: 'https://www.head.com' },
          { label: 'Salomon Alpine Tech', url: 'https://www.salomon.com' },
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
      copy: 'Avvolge il piede e costituisce la base rigida che trasmette gli impulsi laterali direttamente alla piastra e allo sci. Determina i volumi interni (Last).'
    },
    gambetto: {
      title: 'Gambetto (Cuff)',
      copy: 'Incernierato allo scafo ai malleoli, sostiene la parte bassa della gamba e guida il piegamento anteriore (forward lean).'
    },
    scarpetta: {
      title: 'Scarpetta interna (Liner)',
      copy: 'Elemento imbottito e termoformabile. Isola termicamente il piede e riempie in modo personalizzato gli spazi tra anatomia e plastica.'
    },
    linguetta: {
      title: 'Linguetta',
      copy: 'Distribuisce in modo uniforme la pressione della tibia durante l’appoggio anteriore, evitando punti dolorosi sullo stinco.'
    },
    plantare: {
      title: 'Plantare (Footbed)',
      copy: 'Sostiene l’arco plantare, stabilizza il tallone nella sua sede per non farlo sollevare e migliora la sensibilità propriocettiva.'
    },
    chiusure: {
      title: 'Chiusure (Ganci micrometrici / BOA)',
      copy: 'Regolano la tensione di chiusura durante la giornata. I ganci tirano in punti specifici, il BOA avvolge lo scafo inferiore uniformemente.'
    },
    suola: {
      title: 'Suola (ISO 5355 / GripWalk / Touring)',
      copy: 'Interfaccia meccanica con puntale e talloniera dell’attacco: deve essere certificata compatibile con il sistema di sgancio (es. pad GripWalk in gomma).'
    }
  };

  const techItems = [
    {
      badge: 'Misura (Lunghezza)',
      title: 'Mondopoint (MP)',
      subtitle: 'Lunghezza reale del piede in cm/mm.',
      body: 'Corrisponde alla lunghezza interna dello scafo (es. 26.5 = 26,5 cm). È il punto di partenza reale: un principiante non dovrebbe mai prendere "una taglia in più" per stare comodo, ma scegliere un volume corretto.'
    },
    {
      badge: 'Larghezza',
      title: 'Last (Pianta dell’avampiede)',
      subtitle: 'Larghezza interna in millimetri (92–104 mm).',
      body: 'Indica lo spazio trasversale sull’avampiede (riferito alla misura campione 26.5 e proporzionato sulle altre taglie). 96mm è stretto (Low Volume), 100mm medio (Mid Volume), 102+mm largo (High Volume).'
    },
    {
      badge: 'Rigidità',
      title: 'Indice di Flex',
      subtitle: 'Resistenza al piegamento anteriore.',
      body: 'Esprime quanto il gambetto oppone resistenza alla flessione. Non esiste uno standard unico tra marchi: un 110 di un brand può differire da un 110 di un altro. Inoltre, il flex varia molto in base alla temperatura esterna (le plastiche si irrigidiscono al gelo).'
    },
    {
      badge: 'Personalizzazione Estrema',
      title: 'BOA Fit vs Termoformatura (Scansione 3D)',
      subtitle: 'Due funzioni complementari ma distinte.',
      body: 'La chiusura BOA regola l’avvolgimento temporaneo. La termoformatura (Infrared, Custom Shell, Memory Fit) avviene invece in laboratorio, spesso preceduta da una scansione 3D del piede (es. Wintersteiger ER_WIN), per dilatare a caldo in modo permanente le plastiche nei punti di attrito anatomici (malleoli, osso navicolare).'
    }
  ];

  const footZones = {
    avampiede: {
      title: 'Avampiede e testa dei metatarsi',
      copy: 'Con un bootfitter si valuta se la larghezza interna (Last) consente alle dita di distendersi senza compressione laterale né intorpidimento. Se i metatarsi sono larghi (es. alluce valgo), si termoforma o fresa la plastica in quel punto specifico.'
    },
    collo: {
      title: 'Collo del piede (Instep)',
      copy: 'Un collo del piede alto può subire compressione sotto lo scafo inferiore o la linguetta, addormentando il piede per blocco circolatorio. Si valuta il volume verticale dello scafo.'
    },
    tallone: {
      title: 'Tallone e retropiede',
      copy: 'Il tallone deve restare perfettamente bloccato nella tasca posteriore quando si piega la caviglia in avanti. Se si solleva (heel lift), si perde gran parte della precisione nella trasmissione dello spigolo.'
    },
    malleoli: {
      title: 'Malleoli (interno ed esterno)',
      copy: 'Sono le sporgenze ossee più esposte al contatto con lo scafo rigido. In laboratorio si valuta l’allineamento rispetto alle sedi preformate; se causano dolore (borsite), la termoformatura crea una "bolla" di spazio extra nella plastica.'
    }
  };

  const quiz = [
    {
      question: 'Il sistema BOA o stringere forte i ganci permette di compensare l\'acquisto di uno scarpone di 2 taglie più grande?',
      answers: [
        'Sì, basta stringere molto forte per bloccare il piede.',
        'No: le chiusure regolano la tensione, ma non sostituiscono una lunghezza (Mondopoint) e un volume (Last) corretti.',
        'Sì, perché il cavo in acciaio accorcia fisicamente la lunghezza dello scafo.'
      ],
      correct: 1,
      explanation: 'Comprare scarponi grandi "per stare comodi" costringe a stringerli troppo, bloccando la circolazione sanguigna (i piedi si gelano) senza comunque avere precisione sugli sci.'
    },
    {
      question: 'Due scarponi di marchi diversi con lo stesso flex dichiarato (es. Flex 110) si comportano in modo identico?',
      answers: [
        'No, il flex non è uno standard universale e varia per geometrie, miscele di plastiche e temperatura esterna.',
        'Sì, è un valore ISO certificato uguale per tutti i produttori al mondo.',
        'Sì, ma solo se usati su piste nere.'
      ],
      correct: 0,
      explanation: 'Ogni azienda ha i propri parametri di misurazione. Il Flex è utile per confrontare scarponi all\'interno dello stesso catalogo aziendale.'
    },
    {
      question: 'La termoformatura e il serraggio dei ganci sulla neve sono la stessa operazione?',
      answers: [
        'Sì, stringere i ganci a freddo in pista equivale a termoformare.',
        'No: la termoformatura modella permanentemente a caldo le plastiche in laboratorio per adattarle alle ossa (bootfitting); i ganci regolano solo la tensione giornaliera.',
        'La termoformatura riguarda solo le lamine.'
      ],
      correct: 1,
      explanation: 'La personalizzazione estrema richiede forni, lampade a infrarossi e dime per modificare fisicamente la forma (Shell) o la scarpetta (Liner).'
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
              <path
                d="M210 35 L310 35 L335 165 L195 165 Z"
                fill={bootPart === 'gambetto' ? 'rgba(0,229,255,0.42)' : 'rgba(51,65,85,0.55)'}
                stroke={bootPart === 'gambetto' ? '#00e5ff' : 'rgba(255,255,255,0.25)'}
                strokeWidth="2"
              />
              <path
                d="M222 20 L298 20 L318 175 L410 198 L405 225 L205 225 Z"
                fill={bootPart === 'scarpetta' ? 'rgba(255,204,0,0.38)' : 'rgba(148,163,184,0.2)'}
                stroke={bootPart === 'scarpetta' ? '#ffcc00' : 'rgba(255,255,255,0.2)'}
                strokeWidth="1.8"
              />
              <path
                d="M296 32 Q325 100 326 168"
                stroke={bootPart === 'linguetta' ? '#00e5ff' : '#94a3b8'}
                strokeWidth={bootPart === 'linguetta' ? '9' : '5'}
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M192 162 L336 162 L442 196 Q455 212 445 235 L182 235 Q172 200 192 162 Z"
                fill={bootPart === 'scafo' ? 'rgba(0,229,255,0.42)' : 'rgba(30,41,59,0.75)'}
                stroke={bootPart === 'scafo' ? '#ffffff' : 'rgba(255,255,255,0.3)'}
                strokeWidth="2"
              />
              <line
                x1="205"
                y1="224"
                x2="425"
                y2="224"
                stroke={bootPart === 'plantare' ? '#ffcc00' : 'rgba(255,255,255,0.35)'}
                strokeWidth={bootPart === 'plantare' ? '6' : '3'}
              />
              <circle
                cx="358"
                cy="176"
                r="11"
                fill={bootPart === 'chiusure' ? '#00e5ff' : '#0f172a'}
                stroke="#00e5ff"
                strokeWidth="2"
              />
              <line x1="315" y1="168" x2="395" y2="192" stroke="#00e5ff" strokeWidth="2" strokeDasharray="4 3" />
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
              { name: 'Scansione 3D', tech: 'Wintersteiger ER_WIN', desc: 'Acquisizione biomeccanica 3D del piede in negozio prima della scelta.', url: 'https://www.wintersteiger.com' },
              { name: 'Nordica', tech: 'Infrared Technology', desc: 'Riscaldamento mirato e preciso a lampada a infrarossi per creare spazio vitale.', url: 'https://www.nordica.com' },
              { name: 'Salomon', tech: 'Custom Shell HD', desc: 'Scafo in Kaprolene (PU) interamente modellabile in forno in 10 minuti.', url: 'https://www.salomon.com' },
              { name: 'Tecnica', tech: 'C.A.S. System', desc: 'Custom Adaptive Shape: plastiche e scarpette preformate per essere termoformate e fresate.', url: 'https://www.blizzard-tecnica.com' }
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
              <path
                d="M120 145 Q115 95 145 75 Q175 65 210 92 Q265 112 365 118 Q425 122 435 145 Q432 165 375 166 L145 166 Q122 162 120 145 Z"
                fill="rgba(255,255,255,0.06)"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
              />
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
              Mappa didattica: evidenzia le zone sensibili da analizzare durante la fase di acquisto e bootfitting specializzato. Non è uno strumento medico.
            </p>
          </div>

          <div className="part-pills">
            {[
              { id: 'avampiede', label: 'Avampiede (Last)', color: '#ffcc00' },
              { id: 'collo', label: 'Collo (Instep)', color: '#00e5ff' },
              { id: 'tallone', label: 'Tallone (Heel)', color: '#00e5ff' },
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
          { label: 'Wintersteiger Bootfitting', url: 'https://www.wintersteiger.com' },
          { label: 'BOA Fit System', url: 'https://www.boafit.com' }
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
      title: 'Puntale (Toe peice)',
      copy: 'Trattiene la punta dello scarpone e gestisce lo sgancio laterale anteriore (tipico nelle cadute in torsione avanti) mediante alette con ritorno elastico.'
    },
    talloniera: {
      title: 'Talloniera (Heel piece)',
      copy: 'Blocca il tallone verso il basso, applica la spinta longitudinale contro il puntale (precarico) e gestisce lo sgancio verticale nelle classiche cadute in avanti.'
    },
    skistopper: {
      title: 'Skistopper (Freno sci)',
      copy: 'Bracci metallici tenuti sollevati dalla pressione della suola: appena lo scarpone si sgancia, la molla li fa scendere nella neve per frenare lo sci ed evitare infortuni a terzi.'
    },
    scarpone: {
      title: 'Scarpone inserito (Precarico longitudinale)',
      copy: 'Lo scarpone lavora "compresso" tra puntale e talloniera. La finestra di spinta deve essere tarata al millimetro dal tecnico per garantire flessione dello sci e sgancio puntuale.'
    },
    contatto: {
      title: 'Piastra Antifrizione (AFD)',
      copy: 'Teflon o rullo mobile posto sotto l’avampiede. Riduce drasticamente l’attrito meccanico tra la suola (soprattutto in gomma) e l\'attacco, garantendo uno scivolamento laterale pulito in fase di sgancio.'
    }
  };

  const techItems = [
    {
      badge: 'Principio meccanico base',
      title: 'Ritenzione elastica vs Sgancio',
      subtitle: 'Il vero equilibrio di un attacco da sci.',
      body: 'L’attacco non deve "aprirsi sempre". L’elasticità (elastic travel) permette allo scarpone di assorbire i colpi violenti della sciata (vibrazioni, impatti sul ghiaccio) spostandosi di 1-2 cm e rientrando in sede senza aprirsi. Lo sgancio avviene SOLO quando la forza torsionale/verticale prolungata minaccia le ossa o i legamenti.'
    },
    {
      badge: 'Confronto direzioni di sgancio',
      title: 'Attacco Tradizionale vs Tyrolia Protector',
      subtitle: 'Sgancio laterale posteriore a protezione dell\'LCA.',
      body: 'Un attacco alpino classico sgancia lateralmente davanti (Puntale) e verticalmente dietro (Talloniera). In una caduta torsionale all\'indietro, il tallone resta incastrato ruotando il ginocchio. Il sistema Tyrolia Protector introduce una talloniera posta su una piastra capace di ruotare di 30° anche lateralmente, scaricando il legamento crociato anteriore.'
    },
    {
      badge: 'Norme ISO Compatibilità',
      title: 'Suole Alpina (ISO 5355) vs GripWalk (ISO 23223)',
      subtitle: 'La giungla delle suole moderne.',
      body: 'La classica suola in plastica liscia (Alpina ISO 5355) scivola perfettamente su ogni attacco. La nuova suola GripWalk ha pad in gomma curvi per camminare meglio, ma genera un enorme attrito in fase di sgancio e ha un’altezza diversa. Una suola GripWalk DEVE essere abbinata a un attacco che riporta il logo "GripWalk" (o MNC) e ha una piastra AFD adatta.'
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
        text: 'COMPATIBILITÀ OK: La suola alpina piatta e liscia (ISO 5355) è lo standard storico accettato da tutti gli attacchi alpini, GripWalk e Multi-Norm (MNC), previa normale regolazione della spinta.'
      };
    }
    if (soleNorm === 'gw') {
      if (bindingNorm === 'alpine') {
        return {
          ok: false,
          text: 'PERICOLO: Incastrare uno scarpone GripWalk (gomma spessa curva) in un vecchio attacco (solo Alpino) altera l\'altezza del puntale e causa un attrito bloccante sulla piastra. L\'attacco non sgancerà lateralmente!'
        };
      }
      return {
        ok: true,
        text: 'COMPATIBILITÀ OK: Gli attacchi marcati "GripWalk" o "Multi-Norm (MNC)" possiedono altezze e piastre AFD scorrevoli appositamente progettate per la gomma ISO 23223.'
      };
    }
    if (bindingNorm === 'mnc') {
      return {
        ok: true,
        text: 'COMPATIBILITÀ OK: L\'attacco Multi-Norm (MNC/Sole.ID) ha una piastra AFD regolabile manualmente in altezza per accettare le altissime suole da scialpinismo (ISO 9523 Touring).'
      };
    }
    return {
      ok: false,
      text: 'PERICOLO: Le spesse suole in gomma sagomata da Touring (ISO 9523) restano incastrate nei normali attacchi da discesa. Richiedono attacchi tecnici a pin o MNC.'
    };
  };

  const compRes = compatibilityResult();

  const quiz = [
    {
      question: 'Qual è il compromesso meccanico principale che deve gestire un attacco da sci?',
      answers: [
        'Bloccare per sempre lo scarpone, indipendentemente dalle forze applicate.',
        'Bilanciare la ritenzione elastica (per sciare e assorbire i colpi) con lo sgancio tempestivo (quando le forze minacciano l\'articolazione).',
        'Sganciarsi preventivamente a ogni cambio di spigolo rapido.'
      ],
      correct: 1,
      explanation: 'Senza ritenzione elastica perderemmo gli sci alla prima vibrazione sul ghiaccio. L\'attacco deve essere "sospensione" e "sicura" allo stesso tempo.'
    },
    {
      question: 'Se uno scarpone moderno con suola in gomma GripWalk entra fisicamente a "scatto" dentro a un attacco tradizionale di 10 anni fa, significa che è sicuro?',
      answers: [
        'No: il clic non prova la sicurezza. Il maggior spessore e la gomma bloccheranno lo scivolamento laterale sulla piastra AFD durante una caduta, rischiando infortuni gravi al ginocchio.',
        'Sì, la molla si occupa di tutto da sola.',
        'Sì, le suole degli scarponi sono tutte universali dal 1990.'
      ],
      correct: 0,
      explanation: 'Compatibilità geometrica non significa compatibilità dinamica. Suola GripWalk (ISO 23223) richiede un attacco GripWalk compatibile.'
    },
    {
      question: 'Un’animazione didattica del meccanismo di un attacco (come quella in questa app) garantisce che in pista lo sci si sgancerà sempre?',
      answers: [
        'Sì, assicura il 100% di protezione da qualsiasi infortunio.',
        'No, le illustrazioni mostrano il principio di progettazione (cinematica ideale). In pista, neve, velocità e forze vettoriali complesse rendono l\'esito di una caduta imprevedibile.',
        'Sì, sostituisce le macchine taratrici dei laboratori specializzati.'
      ],
      correct: 1,
      explanation: 'I simulatori spiegano il concetto, ma la taratura ISO sul macchinario (con i veri parametri di peso, età, e misura scafo) in negozio è l\'unica procedura di sicurezza valida.'
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
              <rect x="40" y="166" width="480" height="12" rx="4" fill="rgba(148,163,184,0.3)" />
              <rect
                x="145"
                y="156"
                width="55"
                height="9"
                rx="2"
                fill={part === 'contatto' ? '#ffcc00' : 'rgba(255,255,255,0.3)'}
              />
              <path
                d="M115 165 L165 165 L155 122 L120 132 Z"
                fill={part === 'puntale' ? 'rgba(0,229,255,0.55)' : 'rgba(51,65,85,0.85)'}
                stroke={part === 'puntale' ? '#ffffff' : '#00e5ff'}
                strokeWidth="2"
              />
              <path
                d="M365 165 L435 165 L425 106 L372 118 Z"
                fill={part === 'talloniera' ? 'rgba(0,229,255,0.55)' : 'rgba(51,65,85,0.85)'}
                stroke={part === 'talloniera' ? '#ffffff' : '#00e5ff'}
                strokeWidth="2"
              />
              <path
                d="M352 162 L305 148"
                stroke={part === 'skistopper' ? '#ffcc00' : '#94a3b8'}
                strokeWidth={part === 'skistopper' ? '5' : '3'}
                strokeLinecap="round"
              />
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
              <text x="135" y="198" fill="#ffcc00" fontSize="11">Zone contatto (AFD)</text>
            </svg>
          </div>

          <div className="part-pills">
            {[
              { id: 'puntale', label: 'Puntale', color: '#00e5ff' },
              { id: 'talloniera', label: 'Talloniera', color: '#00e5ff' },
              { id: 'skistopper', label: 'Skistopper', color: '#94a3b8' },
              { id: 'scarpone', label: 'Scarpone / Precarico', color: '#ffcc00' },
              { id: 'contatto', label: 'Piastra (AFD)', color: '#ffcc00' }
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
                Simulatore Didattico di Sgancio (A Rallentatore)
              </span>
              <button type="button" className="action-btn secondary" onClick={() => triggerAnimation(scenario)}>
                ↻ Riavvia Animazione
              </button>
            </div>

            <div className="choice-grid-3" style={{ marginBottom: '14px' }}>
              <button
                type="button"
                className={`choice-card ${scenario === 'elastic' ? 'active' : ''}`}
                onClick={() => triggerAnimation('elastic')}
              >
                <strong>Sciata Aggressiva</strong>
                <small>Assorbimento Elastico</small>
              </button>
              <button
                type="button"
                className={`choice-card ${scenario === 'front' ? 'active' : ''}`}
                onClick={() => triggerAnimation('front')}
              >
                <strong>Caduta Frontale</strong>
                <small>Sgancio Verticale</small>
              </button>
              <button
                type="button"
                className={`choice-card ${scenario === 'backtwist' ? 'active' : ''}`}
                onClick={() => triggerAnimation('backtwist')}
              >
                <strong>Torsione Indietro</strong>
                <small>Sistema Protector</small>
              </button>
            </div>

            <div className="diagram-stage" style={{ marginBottom: '10px' }}>
              <svg viewBox="0 0 540 190" role="img" aria-label="Animazione didattica del comportamento puntale e talloniera">
                <rect x="40" y="146" width="460" height="10" rx="3" fill="rgba(148,163,184,0.3)" />
                <path d="M115 145 L160 145 L150 108 L120 116 Z" fill="rgba(0,229,255,0.45)" stroke="#00e5ff" strokeWidth="2" />
                <g style={{ transform: `rotate(${heelRot}deg)`, transformOrigin: '390px 145px', transition: 'transform 1.2s ease' }}>
                  <path d="M360 145 L425 145 L415 92 L368 102 Z" fill="rgba(255,204,0,0.45)" stroke="#ffcc00" strokeWidth="2" />
                </g>
                <g
                  style={{
                    transform: `translate(${bootOffsetX}px, ${animStep === 1 && scenario !== 'elastic' ? -16 : 0}px) rotate(${bootRot}deg)`,
                    transformOrigin: '260px 135px',
                    transition: 'transform 1.2s ease'
                  }}
                >
                  <path
                    d="M158 136 L362 136 L356 62 L285 62 L272 102 L162 114 Z"
                    fill="rgba(255,255,255,0.12)"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
                <text x="65" y="34" fill="#00e5ff" fontSize="11" fontWeight="600">
                  {scenario === 'elastic'
                    ? 'Fase 1: Urti duri sulla pista. La molla arretra leggermente e riposiziona lo scarpone, zero sgancio.'
                    : scenario === 'front'
                    ? 'Fase 2: Volo in avanti (Forza in Z). La talloniera cede in verticale e sputa lo scarpone.'
                    : 'Fase 3: Sedere a terra e torsione. La base Protector ruota laterlmente salvando i legamenti.'}
                </text>
              </svg>
              <p className="diagram-caption">
                <strong>Attenzione Maestro:</strong> Questo schema vettoriale serve per spiegare la meccanica in aula. Non prevede in alcun modo la cinematica complessa di una caduta reale su pista!
              </p>
            </div>
          </div>

          <div className="sim-box" style={{ marginBottom: 0 }}>
            <h5 style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.96rem', color: 'var(--accent-gold)', marginBottom: '10px' }}>
              Test Interattivo: Compatibilità Suola ↔ Attacco
            </h5>
            <div className="choice-grid-3" style={{ marginBottom: '10px' }}>
              <button type="button" className={`choice-card ${soleNorm === 'alpine' ? 'active' : ''}`} onClick={() => setSoleNorm('alpine')}>
                <strong>Plastica Piatta</strong>
                <small>ISO 5355 Alpina</small>
              </button>
              <button type="button" className={`choice-card ${soleNorm === 'gw' ? 'active' : ''}`} onClick={() => setSoleNorm('gw')}>
                <strong>Gomma Curva</strong>
                <small>ISO 23223 (GripWalk)</small>
              </button>
              <button type="button" className={`choice-card ${soleNorm === 'tour' ? 'active' : ''}`} onClick={() => setSoleNorm('tour')}>
                <strong>Gomma Vibram Alta</strong>
                <small>ISO 9523 (Touring)</small>
              </button>
            </div>
            <div className="choice-grid-3" style={{ marginBottom: '12px' }}>
              <button type="button" className={`choice-card ${bindingNorm === 'alpine' ? 'active' : ''}`} onClick={() => setBindingNorm('alpine')}>
                <strong>Vecchio Attacco</strong>
                <small>Solo ISO 5355</small>
              </button>
              <button type="button" className={`choice-card ${bindingNorm === 'gw' ? 'active' : ''}`} onClick={() => setBindingNorm('gw')}>
                <strong>Attacco Moderno</strong>
                <small>Logo GripWalk (GW)</small>
              </button>
              <button type="button" className={`choice-card ${bindingNorm === 'mnc' ? 'active' : ''}`} onClick={() => setBindingNorm('mnc')}>
                <strong>Attacco Regolabile</strong>
                <small>Multi-Norm (MNC)</small>
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
          { label: 'Tecnologia Tyrolia Protector', url: 'https://www.tyrolia.com/protector' },
          { label: 'Compatibilità Suole Marker (GripWalk/MNC)', url: 'https://www.marker.net' }
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
  const [discipline, setDiscipline] = useState('pista'); // 'pista' | 'sl' | 'gs' | 'freeride'
  const [height, setHeight] = useState(176);
  const [skierLvl, setSkierLvl] = useState('l1');

  const parts = {
    impugnatura: {
      title: 'Impugnatura (Grip)',
      copy: 'Guida l’angolazione del polso e trasmette la spinta nell’appoggio. Nei modelli tecnici (es. Leki Trigger 3D) è progettata ergonomicamente per favorire l\'angolo naturale d\'appoggio.'
    },
    lacciolo: {
      title: 'Lacciolo tradizionale / Loop Sganciabile',
      copy: 'La fettuccia chiusa tradizionale lega la mano (ma non si apre da sola in caduta!). I moderni sistemi di ritenzione (Trigger) spostano il lacciolo direttamente sul guanto per agganciarsi a un perno meccanico.'
    },
    asta: {
      title: 'Asta (Tubo in Alu o Carbonio)',
      copy: 'Determina l\'inerzia ("Swing weight"). Un bastone leggero in punta, ben bilanciato, si lascia muovere di polso molto più velocemente durante una sciata a cortoraggio.'
    },
    rondella: {
      title: 'Rondella (Basket)',
      copy: 'Ha una funzione pratica essenziale: impedisce al bastone di affondare per intero nella neve, rovinando l\'appoggio.'
    },
    puntale: {
      title: 'Puntale (Acciaio / Carburo di Tungsteno)',
      copy: 'Incide la crosta o il ghiaccio vivo, fornendo trazione meccanica.'
    }
  };

  const techItems = [
    {
      badge: 'Materiali asta',
      title: 'Alluminio vs Carbonio Alto Modulo',
      subtitle: 'Resistenza agli urti da taglio contro leggerezza assoluta.',
      body: 'L’alluminio (lega 7075) è più resistente ai colpi netti contro le lamine (si piega ma non si spezza di colpo). Il carbonio è rigidissimo e leggerissimo in punta, garantendo uno swing weight imbattibile per i maestri.'
    },
    {
      badge: 'Sistema di connessione e rilascio',
      title: 'Fettuccia standard vs Meccanismo LEKI Trigger',
      subtitle: 'Nessun lacciolo tradizionale si apre in automatico.',
      body: 'Molti incidenti al pollice o alla spalla dello sciatore (Skier\'s thumb) sono causati dal bastone che resta impigliato. Il lacciolo cucito NON cede. Sistemi come il LEKI Trigger utilizzano una molla tarata: sotto carichi violenti verso l\'alto sganciano l\'anello del guanto per liberare la mano.'
    },
    {
      badge: 'Geometrie specialistiche',
      title: 'Campo libero vs Gara SL vs Gara GS vs Freeride',
      subtitle: 'La forma e la lunghezza seguono la funzione.',
      body: 'Campo libero (Pista): asta dritta, rondella media (50 mm), taglio ogni 5 cm. Gara SL: asta dritta con paramano, più corto di ~5 cm (step 2,5 cm) per rapidità nei pali snodati. Gara GS: asta curvata aerodinamica più lunga di 5–10 cm rispetto allo SL per spinta al cancelletto e posizione a uovo. Freeride: impugnatura prolungata in foam e rondella larga (90+ mm).'
    }
  ];

  const discNotes = {
    pista: 'Campo libero (All-round): asta dritta e rigida in Alluminio 7075 o Carbonio, impugnatura ergonomica standard in gomma bimateriale e rondella media (50–55 mm).',
    sl: 'Gara SL (Slalom Speciale): asta dritta rinforzata con paramano chiuso e rondella conica compatta. Più corto di ~5 cm rispetto al campo libero per velocizzare l’appoggio e non impigliare i pali snodati.',
    gs: 'Gara GS (Slalom Gigante): asta curvata per seguire l’aerodinamica del corpo in posizione a uovo e rondella conica. Più lungo di 5–10 cm rispetto allo SL per compensare la curvatura e massimizzare la spinta al cancelletto.',
    freeride: 'Fresca / Powder: impugnatura molto lunga (Touring grip) in schiuma isolante per cambiare presa sui pendii inclinati, e rondella molto larga (85–100 mm) stile racchetta da neve.'
  };

  const quiz = [
    {
      question: 'Qual è l’utilità meccanica concreta della rondella alla fine del bastone?',
      answers: [
        'Serve solo a determinare il colore e la sponsorizzazione.',
        'Impedisce che la forza spinga il bastone completamente dentro il manto nevoso morbido, garantendo il rimbalzo d\'appoggio.',
        'Aumenta la precisione dei salti freestyle.'
      ],
      correct: 1,
      explanation: 'Senza rondella, appoggiando il bastone nella neve non battuta, l\'asta sprofonderebbe di decine di centimetri facendoti sbilanciare.'
    },
    {
      question: 'Se compro un bastoncino con un normale lacciolo cucito (fettuccia in nylon), posso stare tranquillo che si aprirà sempre da solo in caso di caduta?',
      answers: [
        'Sì, le normative impongono sganci automatici su ogni prodotto.',
        'Assolutamente No. I laccioli tradizionali restano ancorati saldamente al polso. Se la rotella si impiglia, il bastone torce la spalla o il pollice.',
        'Sì, tutti i bastoni sono tenuti insieme con lo strappo in velcro.'
      ],
      correct: 1,
      explanation: 'Solo i sistemi di bloccaggio integrati (come Trigger, o altri brevetti meccanici a molla) possiedono una via di fuga di sicurezza certificata. La fettuccia va sempre infilata correttamente dal basso verso l\'alto.'
    },
    {
      question: 'A parità di altezza dello sciatore, perché i bastoni da Gigante (GS) sono più lunghi rispetto a quelli da Slalom (SL)?',
      answers: [
        'Non è vero: SL e GS usano esattamente la stessa misura.',
        'Perché l’asta curva del GS accorcia la distanza effettiva impugnatura-puntale e serve maggiore leva nella spinta al cancelletto e in posizione a uovo, mentre nello SL un bastone più corto velocizza il ritmo.',
        'Perché in Slalom non si usano mai i bastoni.'
      ],
      correct: 1,
      explanation: 'In gara si usano tagli ogni 2,5 cm: lo SL resta più corto (~H × 0,65) per agilità tra i pali snodati, mentre il GS (~H × 0,71) è più lungo e curvo per aerodinamica e spinta.'
    }
  ];

  const roundTo = (val, step) => Math.round(val / step) * step;

  const pistaCoeff = skierLvl === 'l1' ? 0.685 : 0.675;
  const previewSizes = {
    pista: roundTo(height * pistaCoeff, 5),
    sl: roundTo(height * 0.65, 2.5),
    gs: roundTo(height * 0.71, 2.5),
    freeride: roundTo(height * 0.67, 5)
  };

  const exactPole =
    discipline === 'sl'
      ? Math.round(height * 0.65)
      : discipline === 'gs'
      ? Math.round(height * 0.71)
      : discipline === 'freeride'
      ? Math.round(height * 0.67)
      : Math.round(height * pistaCoeff);

  const commPole = previewSizes[discipline];

  const formulaCaption =
    discipline === 'sl'
      ? 'Formula Gara SL: H × 0,65 (Taglio race ogni 2,5 cm)'
      : discipline === 'gs'
      ? 'Formula Gara GS: H × 0,71 (Taglio race ogni 2,5 cm)'
      : discipline === 'freeride'
      ? 'Formula Freeride: H × 0,67 (Taglio ogni 5 cm)'
      : skierLvl === 'l1'
      ? 'Campo libero L1–L5: H × 0,685 (Taglio commerciale ogni 5 cm)'
      : 'Campo libero L6–L7+: H × 0,675 (Taglio commerciale ogni 5 cm)';

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
              <rect
                x="110"
                y="104"
                width="330"
                height="10"
                rx="4"
                fill={part === 'asta' ? '#00e5ff' : 'rgba(148,163,184,0.45)'}
              />
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
              <path
                d="M84 97 Q60 55 112 68 Q130 82 105 97"
                fill="none"
                stroke={part === 'lacciolo' ? '#ffcc00' : '#94a3b8'}
                strokeWidth={part === 'lacciolo' ? '5' : '3'}
              />
              <ellipse
                cx="435"
                cy="109"
                rx="8"
                ry="28"
                fill={part === 'rondella' ? 'rgba(255,204,0,0.6)' : 'rgba(255,255,255,0.2)'}
                stroke={part === 'rondella' ? '#ffcc00' : 'rgba(255,255,255,0.4)'}
                strokeWidth="2"
              />
              <polygon
                points="443,105 492,109 443,113"
                fill={part === 'puntale' ? '#00e5ff' : '#cbd5e1'}
              />
              <text x="54" y="145" fill="#00e5ff" fontSize="11">Impugnatura</text>
              <text x="72" y="46" fill="#ffcc00" fontSize="11">Lacciolo / Trigger</text>
              <text x="255" y="92" fill="#ffffff" fontSize="11">Asta (Swing weight)</text>
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
          <div className="sim-box">
            <h5 style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.96rem', color: 'var(--accent-cyan)', marginBottom: '10px' }}>
              Rilascio meccanico (Es. LEKI Trigger)
            </h5>
            <div className="choice-grid-3" style={{ marginBottom: '12px' }}>
              <button
                type="button"
                className={`choice-card ${triggerMode === 'attached' ? 'active' : ''}`}
                onClick={() => setTriggerMode('attached')}
              >
                <strong>1. Fissato</strong>
                <small>In pista</small>
              </button>
              <button
                type="button"
                className={`choice-card ${triggerMode === 'manual' ? 'active' : ''}`}
                onClick={() => setTriggerMode('manual')}
              >
                <strong>2. Manuale</strong>
                <small>Uso Seggiovia</small>
              </button>
              <button
                type="button"
                className={`choice-card ${triggerMode === 'load' ? 'active' : ''}`}
                onClick={() => setTriggerMode('load')}
              >
                <strong>3. Sgancio d'Urto</strong>
                <small>Molla di sicurezza</small>
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
                <text x="275" y="65" fill="#ffffff" fontSize="11" fontWeight="500">
                  {triggerMode === 'attached'
                    ? 'Normale utilizzo: il cordino del guanto è bloccato per tirare a valle.'
                    : triggerMode === 'manual'
                    ? 'Bottone premuto col pollice: sgancio per prendere impianti, skilift o telefono.'
                    : 'Carico eccessivo verso l\'alto: la molla cede e sputa il loop. La mano è libera!'}
                </text>
              </svg>
              <p className="diagram-caption">
                <strong>Attenzione:</strong> Le soglie di forza non sono personalizzabili come per gli attacchi da sci. Serve a mitigare danni grossolani.
              </p>
            </div>
          </div>

          <div className="sim-box" style={{ marginBottom: 0 }}>
            <h5 style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.96rem', color: 'var(--accent-gold)', marginBottom: '10px' }}>
              Consigliatore: Specialità &amp; Taglio
            </h5>
            <div className="choice-grid-2" style={{ marginBottom: '10px' }}>
              <button type="button" className={`choice-card ${discipline === 'pista' ? 'active' : ''}`} onClick={() => setDiscipline('pista')}>
                <strong>Campo libero</strong>
                <small>Pista · {previewSizes.pista} cm</small>
              </button>
              <button type="button" className={`choice-card ${discipline === 'sl' ? 'active' : ''}`} onClick={() => setDiscipline('sl')}>
                <strong>Gara SL</strong>
                <small>Slalom · {previewSizes.sl} cm</small>
              </button>
              <button type="button" className={`choice-card ${discipline === 'gs' ? 'active' : ''}`} onClick={() => setDiscipline('gs')}>
                <strong>Gara GS</strong>
                <small>Gigante · {previewSizes.gs} cm</small>
              </button>
              <button type="button" className={`choice-card ${discipline === 'freeride' ? 'active' : ''}`} onClick={() => setDiscipline('freeride')}>
                <strong>Fresca</strong>
                <small>Powder · {previewSizes.freeride} cm</small>
              </button>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.84)', lineHeight: 1.5, marginBottom: '14px' }}>
              {discNotes[discipline]}
            </p>

            <div className="sim-row">
              <div className="sim-row-head">
                <label>Altezza Sciatore (Statura in cm)</label>
                <span>{height} cm</span>
              </div>
              <input type="range" min="145" max="205" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
            </div>

            {discipline === 'pista' && (
              <div className="choice-grid-2" style={{ marginBottom: '6px' }}>
                <button type="button" className={`choice-card ${skierLvl === 'l1' ? 'active' : ''}`} onClick={() => setSkierLvl('l1')}>
                  <strong>Sciata Tradizionale</strong>
                  <small>Livelli 1–5 (H × 0,685)</small>
                </button>
                <button type="button" className={`choice-card ${skierLvl === 'l6' ? 'active' : ''}`} onClick={() => setSkierLvl('l6')}>
                  <strong>Assetto &quot;Moderno&quot;</strong>
                  <small>Livelli 6–7+ (H × 0,675)</small>
                </button>
              </div>
            )}

            <p style={{ marginTop: '12px', textAlign: 'center', fontFamily: 'Syne, sans-serif', fontSize: '1.35rem', color: 'var(--accent-gold)' }}>
              Misura Matematica: {exactPole} cm <br />
              <small style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Taglio Acquisto: {commPole} cm
              </small>
              <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                {formulaCaption}
              </span>
            </p>
          </div>
        </div>
      )}

      {tab === 'quiz' && <QuizModule questions={quiz} />}

      <LabFooter
        sources={[
          { label: 'Sistemi Sgancio LEKI (Trigger)', url: 'https://www.leki.com' },
          { label: 'Scuola Sci Italiana', url: 'https://www.amsi.it' }
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
  const [selectedLayer, setSelectedLayer] = useState('mid');
  const [fabricType, setFabricType] = useState('heatsphere');
  const [showBase, setShowBase] = useState(true);
  const [showMid, setShowMid] = useState(true);
  const [showOuter, setShowOuter] = useState(true);

  const [userRole, setUserRole] = useState('maestro');
  const [tempCat, setTempCat] = useState('fredda');
  const [windCat, setWindCat] = useState('moderato');
  const [precipCat, setPrecipCat] = useState('asciutta');
  const [activityCat, setActivityCat] = useState('lezione');
  const [manualOverride, setManualOverride] = useState({ base: true, mid: true, outer: true });

  const layerDetails = {
    base: {
      title: '1° Strato — Intimo Traspirante (Base Layer)',
      copy: 'Messo a contatto diretto con la pelle (lana Merino per la termica o microfibre sintetiche forate). Non serve a scaldare, ma a ciucciare via il sudore liquido: se la schiena resta bagnata, durante la sosta in seggiovia l’evaporazione gelerà il corpo.'
    },
    mid: {
      title: '2° Strato — Isolamento Termico',
      copy: 'Il suo lavoro è intrappolare un cuscino d\'aria calda. Tecnologie passive come PrimaLoft o piumino bloccano il calore per l\'uso statico estremo. Tecnologie "Active" come Polartec Alpha usano maglie a griglia larga per buttare fuori il vapore (ideale nei continui stop&go o risalite con le pelli).'
    },
    outer: {
      title: '3° Strato — Protezione Esterna (Shell / Guscio 20.000+ mm)',
      copy: 'La barriera vera e propria. Usa una Membrana microporosa (es. Gore-Tex) supportata da nastri termosaldati e trattamento chimico superficiale (DWR). Non produce calore, ma ferma il vento gelido e le bufere umide.'
    }
  };

  const fabricSpecs = {
    heatsphere: {
      title: 'Isolamento Passivo: PrimaLoft® Heat Sphere (Termo-Riflettente)',
      copy: 'Struttura a sandwich per il freddo fermo: due strati di ovatta sintetica (che non collassano con acqua come la piuma animale) racchiudono una barriera metallizzata flessibile. Oltre a trattenere l’aria, lo strato centrale specchia le radiazioni di calore corporeo verso l\'interno.'
    },
    polartec: {
      title: 'Isolamento Attivo: Polartec® Alpha® (Maglia aperta)',
      copy: 'Struttura a "Open Mesh Grid". Invece di rinchiudere l\'imbottitura in due tessuti cuciti, i ciuffi di pelo isolante sono ancorati a una retina larga nuda. Sotto sforzo, il sudore in vapore attraversa la rete istantaneamente, ma, se ci infili un antivento sopra da fermo, i ciuffi continuano a scaldare l\'aria intrappolata.'
    }
  };

  const techItems = [
    {
      badge: 'Protezione Acqua e Vento',
      title: 'Colonna d’Acqua (mm) vs Cuciture Nastrate (Taped Seams)',
      subtitle: 'Come leggere davvero l\'impermeabilità.',
      body: 'La Colonna d\'acqua (es. 20.000 mm) misura quanta pressione atmosferica regge il tessuto prima che la goccia passi. 10k bastano per neve farinosa. MA ATTENZIONE: se compri un giubbotto da 30.000 mm in cui l\'ago da cucito ha fatto mille buchi per assemblarlo e questi buchi non sono sigillati a caldo con i nastri termici (fully taped), l\'acqua piovana o della seggiovia colerà dai tagli entro 5 minuti!'
    },
    {
      badge: 'Isolamento Attivo (Traspirante)',
      title: 'Polartec® Alpha® / Alpha Direct',
      subtitle: 'Non spogliarsi in salita.',
      body: 'Inventato per le forze speciali. Anziché svestirsi per non sudare e rimettere la giacca per non gelare, il vapore esce costantemente.'
    },
    {
      badge: 'Respingere le gocce',
      title: 'Il trattamento esterno DWR (Durable Water Repellent)',
      subtitle: 'Il vero responsabile del "Water Beading".',
      body: 'Avete presente le palline d\'acqua che scivolano via dalle giacche nuove? Non è merito della membrana interna (Gore-Tex), ma del trattamento chimico spalmatore DWR sul nylon. Se si consuma per sfregamento o sporco, il tessuto esterno "beve" l\'acqua (Wetting out), diventa freddo, pesante, e blocca la traspirabilità della membrana interna.'
    },
    {
      badge: 'Calore Attivo',
      title: 'Sistemi Elettrici a Batteria',
      subtitle: 'Calzini o gilet cablati.',
      body: 'Quando stai fermo 3 ore a -15° (es. maestro sul campetto), il corpo va in ibernazione e chiude il sangue ai piedi e mani per salvare gli organi vitali. Le resistenze a batteria forzano il calore periferico dove il corpo non ce la fa più da solo.'
    }
  ];

  const roleGuidance = {
    maestro: {
      title: 'Armatura da Lavoro per Maestro (6–8 ore in pista fisse)',
      copy: 'L\'ibridazione è tutto. Polartec Alpha o Microfleece come intimo (non sudi mentre mostri serpentina), abbinato a PrimaLoft Heat Sphere (nella giacca di Divisa Scuola) + Calzini Riscaldati a batteria. Il Maestro sta tantissimo fermo a prendere vento in seggiovia, serve il MASSIMO del calore statico ma che asciughi in 10 minuti in baita se nevica a vento.'
    },
    direttore: {
      title: 'Scelte per Direttori di Scuola Sci (Fornitura Divise Triennali)',
      copy: 'Eliminare il piumino d\'oca animale per le divise dei dipendenti! I maestri si scambiano calore/freddo ogni minuto, e lavano la giacca in lavatrice continuamente. Le nuove imbottiture termiche a Cluster (sfere sintetiche) non si afflosciano (zero clumping) da bagnate e non servono asciugatrici speciali con palline da tennis.'
    },
    cliente: {
      title: 'Come consigliare l\'Allievo/Turista Normale',
      copy: 'L\'allievo Principiante / Intermedio scia piano, a bassa intensità cardiaca, sta in coda molto e cade sulla neve sedendosi. Serve Calore Passivo pesante e colonna d\'acqua di 10k-15k per le cadute. L\'allievo Esperto / Freerider fatica in conduzione muscolare: deve alleggerire! Per lui Guscio 3L puro 20.000mm con isolamento attivo (zero ovatta chiusa!).'
    }
  };

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
      return 'ALLARME TERMICO: Perfetto solo per salire con le pelli da scialpinismo in pieno sole. Altrimenti, primo colpo di vento in discesa e muori di freddo (Ipotermia).';
    }
    if (activeCount === 2) {
      return 'EQUILIBRIO AEROBICO SPORTIVO: Buona termica ma manca lo strato o barriera antivento/20k. Perfetto per "Spring Skiing" di Marzo col sole o allenamenti dinamici dove non smetti di muoverti.';
    }
    return 'SCUDO INVERNALE 3 STRATI: Intimo (tira via sudore) + Isolante Passivo o Attivo (ti scalda) + Guscio DWR 20k mm nastrato (ferma bufera). In questa modalità sei protetto anche a Gennaio fermo sulla neve.';
  };

  const quiz = [
    {
      question: 'Trattamento idrorepellente esterno (DWR - le gocce che scivolano via) e Membrana microporosa interna (impermeabilità in mm) sono esattamente la stessa cosa?',
      answers: [
        'Sì, indicano l\'etichetta Gore-Tex.',
        'Assolutamente NO: il DWR scivola le gocce sul tessuto. Se si consuma per sporco o graffi, il tessuto esterno "beve" l\'acqua, diventa gelido e pesante, anche se la membrana interna fa il suo lavoro e ti tiene asciutto.',
        'Sì, basta usare uno spray magico per riparare i buchi enormi nei pantaloni.'
      ],
      correct: 1,
      explanation: 'Una giacca eccellente ha SEMPRE bisogno che il suo tessuto di nylon esterno venga trattato per far rimbalzare l\'acqua (Water beading).'
    },
    {
      question: 'Ho acquistato un "Guscio tecnico da Alpinismo 3L (3 Layers)" estremo da 700€, certificato 28.000 mm di impermeabilità totale. Ci andrò a sciare a Cortina a Dicembre con -15°: starò caldissimo?',
      answers: [
        'Sì, più costa e più mm ha, più è un forno caldo automatico.',
        'No, prenderai una polmonite. Un Guscio (Shell) puro è solo una barriera "kway" di lusso per vento e acqua. NON HA un grammo di imbottitura termica (pile o piumino). L\'isolamento ce lo devi mettere tu sotto (Midlayer).',
        'Sì, se lo chiudi bene non serve niente sotto.'
      ],
      correct: 1,
      explanation: 'Impermeabilità = Protezione dagli elementi fisici (Neve/Vento). Isolamento (G/m2 di Imbottitura) = Protezione del tuo calore. Sono due concetti indipendenti.'
    },
    {
      question: 'Come sceglierà un Direttore Scuola Sci le divise da comprare per i suoi 60 Maestri quest\'anno?',
      answers: [
        'Guarderà le microstrutture resistenti all\'umidità (sintetici a cluster come PrimaLoft o Polartec) che tengono caldo anche se sporche, sudate e lavate ogni venerdì in lavatrici brutali.',
        'Sceglierà solo per il colore fluo imposto dalle leggi.',
        'Comprerà solo piuma d\'oca vera di altissima qualità da spedizione Himalayana perché è il più caldo in assoluto.'
      ],
      correct: 0,
      explanation: 'La piuma d\'oca collassa se la sudi dopo una curva e costa una follia da gestire nei lavaggi per 60 persone in un locale tecnico. Il sintetico tecnico "Cipolla" vince nel noleggio e divise.'
    }
  ];

  return (
    <div className="lab-shell">
      <div className="lab-header">
        <div>
          <span className="lab-eyebrow">Laboratorio interattivo (Approfondimento Didattico)</span>
          <h4 className="lab-title">Vestirsi per sciare (Layering)</h4>
        </div>
      </div>

      <LabTabs activeTab={tab} onChange={setTab} />

      {tab === 'anatomy' && (
        <div>
          <div className="diagram-stage">
            <svg viewBox="0 0 560 220" role="img" aria-label="Figura schematica con tre strati di abbigliamento e flussi termici">
              <path d="M235 38 L325 38 L345 182 L215 182 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" />
              {showBase && (
                <path
                  d="M240 43 L320 43 L336 177 L224 177 Z"
                  fill={selectedLayer === 'base' ? 'rgba(0,229,255,0.45)' : 'rgba(56,189,248,0.22)'}
                  stroke="#00e5ff"
                  strokeWidth="2"
                />
              )}
              {showMid && (
                <path
                  d="M230 37 L330 37 L348 181 L212 181 Z"
                  fill={selectedLayer === 'mid' ? 'rgba(255,204,0,0.4)' : 'rgba(255,204,0,0.14)'}
                  stroke="#ffcc00"
                  strokeWidth="2"
                />
              )}
              {showOuter && (
                <path
                  d="M220 31 L340 31 L360 185 L200 185 Z"
                  fill={selectedLayer === 'outer' ? 'rgba(148,163,184,0.42)' : 'rgba(148,163,184,0.16)'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}

              <path className="anim-pulse" d="M55 78 L185 78" stroke="#00e5ff" strokeWidth="2.5" strokeDasharray="6 4" />
              <text x="54" y="68" fill="#00e5ff" fontSize="11" fontWeight="600">Vento Ghiacciato &amp; Neve (20k mm)</text>
              <path className="anim-pulse" d="M55 128 L185 128" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6 4" />

              <path className="anim-pulse" d="M350 82 L490 82" stroke="#ffcc00" strokeWidth="2.5" strokeDasharray="5 4" />
              <text x="368" y="70" fill="#ffcc00" fontSize="11">Vapore del sudore (Da evacuare)</text>
              <path className="anim-pulse" d="M350 136 L490 136" stroke="#f87171" strokeWidth="2.5" strokeDasharray="5 4" />
              <text x="368" y="124" fill="#f87171" fontSize="11" fontWeight="600">Fuga Calore Corporeo (Da Bloccare!)</text>
            </svg>
          </div>

          <div className="part-pills">
            {[
              { id: 'base', label: '1° Intimo (Traspirante)', active: showBase, toggle: () => setShowBase((v) => !v), color: '#00e5ff' },
              { id: 'mid', label: '2° Isolamento Termico', active: showMid, toggle: () => setShowMid((v) => !v), color: '#ffcc00' },
              { id: 'outer', label: '3° Guscio Barriera/Membrana', active: showOuter, toggle: () => setShowOuter((v) => !v), color: '#ffffff' }
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

          <div className="sim-box" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-gold)', fontWeight: 600 }}>
                Analisi di Sezione Microscopica (Strato 2 Isolante)
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className={`part-pill ${fabricType === 'heatsphere' ? 'active' : ''}`}
                  onClick={() => setFabricType('heatsphere')}
                >
                  PrimaLoft / Riflettente (Fermo)
                </button>
                <button
                  type="button"
                  className={`part-pill ${fabricType === 'polartec' ? 'active' : ''}`}
                  onClick={() => setFabricType('polartec')}
                >
                  Polartec® Alpha® (Dinamico)
                </button>
              </div>
            </div>

            <div className="diagram-stage" style={{ marginBottom: '10px' }}>
              {fabricType === 'heatsphere' ? (
                <svg viewBox="0 0 540 165" role="img" aria-label="Struttura PrimaLoft Heat Sphere a tre strati">
                  <path d="M 35 30 L 505 30 L 505 70 L 35 70 Z" fill="rgba(255, 204, 0, 0.15)" stroke="#ffcc00" strokeWidth="2" strokeDasharray="4 2" />
                  <path d="M 45 40 Q 60 65 75 40 T 105 40 T 135 40 T 165 40 T 195 40 T 225 40 T 255 40 T 285 40 T 315 40 T 345 40 T 375 40 T 405 40 T 435 40 T 465 40 T 495 40" stroke="#ffcc00" strokeWidth="1.5" fill="none" opacity="0.6" />

                  <line x1="35" y1="82" x2="505" y2="82" stroke="#00e5ff" strokeWidth="4" />
                  <line x1="35" y1="82" x2="505" y2="82" stroke="#ffffff" strokeWidth="1.5" />

                  <path className="anim-pulse" d="M 120 145 L 120 95 L 105 110 M 120 95 L 135 110" stroke="#f87171" strokeWidth="2" fill="none" />
                  <path className="anim-pulse" d="M 270 145 L 270 95 L 255 110 M 270 95 L 285 110" stroke="#f87171" strokeWidth="2" fill="none" />
                  <path className="anim-pulse" d="M 420 145 L 420 95 L 405 110 M 420 95 L 435 110" stroke="#f87171" strokeWidth="2" fill="none" />

                  <path d="M 35 94 L 505 94 L 505 134 L 35 134 Z" fill="rgba(255, 204, 0, 0.15)" stroke="#ffcc00" strokeWidth="2" strokeDasharray="4 2" />
                  <path d="M 45 104 Q 60 129 75 104 T 105 104 T 135 104 T 165 104 T 195 104 T 225 104 T 255 104 T 285 104 T 315 104 T 345 104 T 375 104 T 405 104 T 435 104 T 465 104 T 495 104" stroke="#ffcc00" strokeWidth="1.5" fill="none" opacity="0.6" />

                  <text x="42" y="18" fill="#ffcc00" fontSize="11">1. Isolante sintetico passivo (Blocca il freddo esterno, non teme l'acqua)</text>
                  <text x="42" y="77" fill="#00e5ff" fontSize="11">2. Core Termo-Riflettente a Film (Specchio Termico Ultra-Leggero)</text>
                  <text x="42" y="155" fill="#f87171" fontSize="11">3. Le Frecce rosse del tuo calore emesso "rimbalzano" indietro verso il tuo corpo</text>
                </svg>
              ) : (
                <svg viewBox="0 0 540 165" role="img" aria-label="Struttura microscopica Polartec Alpha a maglia aperta">
                  <line x1="40" y1="118" x2="500" y2="118" stroke="#00e5ff" strokeWidth="3" strokeDasharray="14 8" />
                  <line x1="40" y1="126" x2="500" y2="126" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 16" />
                  {[70, 115, 160, 205, 250, 295, 340, 385, 430, 475].map((x, i) => (
                    <g key={i}>
                      <path
                        d={`M ${x} 118 Q ${x - 10} 82 ${x - 4} 52 M ${x} 118 Q ${x + 2} 78 ${x + 6} 48 M ${x} 118 Q ${x + 12} 84 ${x + 14} 56`}
                        stroke="#00e5ff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </g>
                  ))}
                  {[92, 182, 272, 362, 452].map((vx, i) => (
                    <path
                      key={i}
                      className="anim-pulse"
                      d={`M ${vx} 135 L ${vx} 26`}
                      stroke="#ffcc00"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  ))}
                  <text x="42" y="18" fill="#00e5ff" fontSize="11">Maglia "Open Grid": Fili ancorati (Trama scoperta e permeabile all'aria)</text>
                  <text x="42" y="155" fill="#ffcc00" fontSize="10.5">Frecce Gialle: Non c'è un tessuto di chiusura, il vapore surriscaldato EVADE subito in conduzione</text>
                </svg>
              )}
            </div>

            <div className="lab-card gold" style={{ marginBottom: 0 }}>
              <h5>{fabricSpecs[fabricType].title}</h5>
              <p>{fabricSpecs[fabricType].copy}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'tech' && <TechAccordionList items={techItems} />}

      {tab === 'try' && (
        <div>
          <div className="sim-box">
            <label style={{ fontSize: '0.66rem', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 600 }}>
              Profili di Vestizione
            </label>
            <div className="choice-grid-3" style={{ marginBottom: '12px' }}>
              <button type="button" className={`choice-card ${userRole === 'maestro' ? 'active' : ''}`} onClick={() => setUserRole('maestro')}>
                <strong>Il Maestro</strong>
                <small>Stagione Completa</small>
              </button>
              <button type="button" className={`choice-card ${userRole === 'direttore' ? 'active' : ''}`} onClick={() => setUserRole('direttore')}>
                <strong>Il Direttore</strong>
                <small>Gestione Forniture</small>
              </button>
              <button type="button" className={`choice-card ${userRole === 'cliente' ? 'active' : ''}`} onClick={() => setUserRole('cliente')}>
                <strong>Sciatore Cliente</strong>
                <small>Dal base al pro</small>
              </button>
            </div>
            <div className="lab-card" style={{ marginBottom: 0 }}>
              <h5>{roleGuidance[userRole].title}</h5>
              <p>{roleGuidance[userRole].copy}</p>
            </div>
          </div>

          <div className="sim-box">
            <h5 style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.98rem', color: 'var(--accent-cyan)', marginBottom: '10px' }}>
              Simulatore Clinico di Stratificazione
            </h5>
            <label style={{ fontSize: '0.66rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Termometro Pista (Gradi Centigradi)</label>
            <div className="choice-grid-3" style={{ marginBottom: '10px' }}>
              <button type="button" className={`choice-card ${tempCat === 'mite' ? 'active' : ''}`} onClick={() => applyRecommended('mite', windCat, precipCat, activityCat)}>
                <strong>Ghiacciaio Sole</strong>
                <small>&gt; 2°C / Marzo</small>
              </button>
              <button type="button" className={`choice-card ${tempCat === 'fredda' ? 'active' : ''}`} onClick={() => applyRecommended('fredda', windCat, precipCat, activityCat)}>
                <strong>Alta Stagione</strong>
                <small>-10° / 0°C</small>
              </button>
              <button type="button" className={`choice-card ${tempCat === 'rigida' ? 'active' : ''}`} onClick={() => applyRecommended('rigida', windCat, precipCat, activityCat)}>
                <strong>Siberia</strong>
                <small>&lt; -15°C Muro</small>
              </button>
            </div>

            <label style={{ fontSize: '0.66rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Velocità Vento &amp; Bufere D'Acqua</label>
            <div className="choice-grid-3" style={{ marginBottom: '10px' }}>
              <button type="button" className={`choice-card ${windCat === 'calmo' ? 'active' : ''}`} onClick={() => applyRecommended(tempCat, 'calmo', 'assenti', activityCat)}>
                <strong>Visibilità Ok</strong>
                <small>Neve compatta</small>
              </button>
              <button type="button" className={`choice-card ${windCat === 'moderato' ? 'active' : ''}`} onClick={() => applyRecommended(tempCat, 'moderato', 'asciutta', activityCat)}>
                <strong>Nuvole/Polvere</strong>
                <small>Raffiche Leggere</small>
              </button>
              <button type="button" className={`choice-card ${windCat === 'forte' ? 'active' : ''}`} onClick={() => applyRecommended(tempCat, 'forte', 'umida', activityCat)}>
                <strong>Neve Bagnata</strong>
                <small>Umidità / Vento %</small>
              </button>
            </div>

            <label style={{ fontSize: '0.66rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Biometria: Il tuo Sforzo Fisico</label>
            <div className="choice-grid-3" style={{ marginBottom: '14px' }}>
              <button type="button" className={`choice-card ${activityCat === 'attesa' ? 'active' : ''}`} onClick={() => applyRecommended(tempCat, windCat, precipCat, 'attesa')}>
                <strong>Fermo (Statica)</strong>
                <small>Seggiovia / Spiegazioni</small>
              </button>
              <button type="button" className={`choice-card ${activityCat === 'lezione' ? 'active' : ''}`} onClick={() => applyRecommended(tempCat, windCat, precipCat, 'lezione')}>
                <strong>Ritmo Turistico</strong>
                <small>Misto Stop / Vai</small>
              </button>
              <button type="button" className={`choice-card ${activityCat === 'intensa' ? 'active' : ''}`} onClick={() => applyRecommended(tempCat, windCat, precipCat, 'intensa')}>
                <strong>Aerobica Pura</strong>
                <small>Gara / Pelli Salita</small>
              </button>
            </div>

            <label style={{ fontSize: '0.66rem', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>
              Accendi / Spengi i 3 Livelli Base
            </label>
            <div className="choice-grid-3">
              <button
                type="button"
                className={`choice-card ${manualOverride.base ? 'active' : ''}`}
                onClick={() => setManualOverride((m) => ({ ...m, base: !m.base }))}
              >
                <strong>Intimo Forato</strong>
                <small>{manualOverride.base ? 'Attivato' : 'Rimoss'}</small>
              </button>
              <button
                type="button"
                className={`choice-card ${manualOverride.mid ? 'active' : ''}`}
                onClick={() => setManualOverride((m) => ({ ...m, mid: !m.mid }))}
              >
                <strong>Polartec / PrimaLoft</strong>
                <small>{manualOverride.mid ? 'Attivato' : 'Rimoss'}</small>
              </button>
              <button
                type="button"
                className={`choice-card ${manualOverride.outer ? 'active' : ''}`}
                onClick={() => setManualOverride((m) => ({ ...m, outer: !m.outer }))}
              >
                <strong>Scudo H2O (Guscio)</strong>
                <small>{manualOverride.outer ? 'Attivato' : 'Rimoss'}</small>
              </button>
            </div>
          </div>

          <div className="lab-card gold" style={{ marginBottom: 0 }}>
            <h5>Feedback: Il tuo equilibrio termico vitale</h5>
            <p>{getSimAdvice()}</p>
          </div>
        </div>
      )}

      {tab === 'quiz' && <QuizModule questions={quiz} />}

      <LabFooter
        sources={[
          { label: 'PrimaLoft (Heat Sphere Tech)', url: 'https://www.primaloft.com' },
          { label: 'Polartec Alpha (Isolamento Dinamico)', url: 'https://www.polartec.com/fabrics/insulation/alpha' },
          { label: 'Tecnologie Impermeabilizzazione VAUDE', url: 'https://www.vaude.com' }
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
              <path
                d="M195 190 L195 110 Q195 75 220 75 Q235 75 235 105 L235 55 Q235 35 252 35 Q268 35 268 55 L268 45 Q268 25 285 25 Q302 25 302 45 L302 58 Q302 38 318 38 Q334 38 334 62 L334 145 L350 190 Z"
                fill={part === 'esterno' ? 'rgba(0,229,255,0.4)' : 'rgba(51,65,85,0.6)'}
                stroke="#ffffff"
                strokeWidth="2"
              />
              <path
                d="M206 180 L206 112 Q206 86 225 86 L242 60 L274 50 L308 62 L322 145 L336 180 Z"
                fill={part === 'isolamento' || part === 'membrana' ? 'rgba(255,204,0,0.38)' : 'rgba(255,204,0,0.12)'}
                stroke="#ffcc00"
                strokeWidth="1.5"
              />
              <ellipse
                cx="272"
                cy="128"
                rx="34"
                ry="26"
                fill={part === 'palmo' ? 'rgba(0,229,255,0.55)' : 'rgba(148,163,184,0.28)'}
              />
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
              <path
                d="M95 55 Q270 30 445 55 Q465 110 435 155 Q335 170 270 135 Q205 170 105 155 Q75 110 95 55 Z"
                fill="rgba(30,41,59,0.85)"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <path
                d="M112 65 Q270 44 428 65 Q442 108 418 142 Q330 154 270 124 Q210 154 122 142 Q98 108 112 65 Z"
                fill={part === 'lcd' ? 'rgba(0,229,255,0.45)' : 'rgba(2,132,199,0.28)'}
                stroke={part === 'lente' || part === 'lcd' ? '#00e5ff' : 'rgba(255,255,255,0.3)'}
                strokeWidth="2"
              />
              <rect
                x="220"
                y="43"
                width="100"
                height="12"
                rx="3"
                fill={part === 'solare' ? '#ffcc00' : 'rgba(255,204,0,0.35)'}
              />
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
              <circle cx="145" cy="144" r="13" fill={part === 'trasduttori' ? '#ffcc00' : '#00e5ff'} />
              <circle cx="395" cy="144" r="13" fill={part === 'trasduttori' ? '#ffcc00' : '#00e5ff'} />
              <rect x="260" y="128" width="20" height="10" rx="3" fill={part === 'microfono' ? '#ffcc00' : '#94a3b8'} />
              <rect x="96" y="84" width="12" height="28" rx="3" fill={part === 'comandi' ? '#00e5ff' : '#64748b'} />
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
      copy: 'Misurano fisicamente accelerazioni (G-Force), velocità angolari e, tramite solette, la pressione reale sotto il piede (es. Carv 2, Moticon OpenGo).'
    },
    smartphone: {
      title: 'Smartphone (Elaborazione & Coaching)',
      copy: 'Riceve i dati grezzi via Bluetooth. Utilizza algoritmi per trasformare numeri complessi (es. accelerazione laterale) in metriche semplificate (Ski:IQ) e offre feedback audio in tempo reale.'
    },
    gps: {
      title: 'GPS (Traiettoria & Velocità)',
      copy: 'Non misura la tecnica del corpo! Calcola la posizione, il dislivello, la linea percorsa e la velocità assoluta (es. sistemi per atleti come Lympic o pettorine GPS per i bambini dei maestri).'
    },
    video: {
      title: 'Video sincronizzato',
      copy: 'Registrazione ottica standard che, abbinata ai numeri (es. Dartfish), aiuta l\'occhio del maestro a correlare il "dato" (es. pressione asimmetrica) al "gesto" (es. spalla cadente).'
    }
  };

  const techItems = [
    {
      badge: 'Sensori inerziali',
      title: 'Accelerometro & Giroscopio (IMU)',
      subtitle: 'Misure fisiche dirette.',
      body: 'L’accelerometro misura l\'accelerazione fisica su 3 assi, tradotta ad esempio nella "G-Force" che senti spingendo in curva. Il giroscopio misura la rotazione.'
    },
    {
      badge: 'Metodo scientifico didattico',
      title: 'Misura Diretta vs Stima Algoritmica',
      subtitle: 'Capire l\'origine del numero.',
      body: 'La pressione sotto l\'avampiede (se usi solette Moticon) o la tua velocità (se usi GPS Lympic) sono MISURATE direttamente dallo strumento. Invece, la "simmetria", l\'angolo di spigolo (edge angle) o il punteggio Ski:IQ di un\'App sullo smartphone sono STIMATI da un algoritmo informatico.'
    },
    {
      badge: 'Soluzioni Pratiche',
      title: 'Atleti, Appassionati, e Bambini in Sicurezza',
      subtitle: 'Strumenti diversi per obiettivi diversi.',
      body: 'L\'Amatore evoluto usa Carv 2 (coach vocale in cuffia). Il Maestro usa il video per l\'analisi fine in baita. L\'Allenatore traccia centesimi e traiettorie degli atleti FIS con i GPS (Lympic). I genitori e le scuole usano le pettorine GPS per geo-localizzare e non perdere nessun bambino durante le lezioni.'
    }
  ];

  const turns = [
    { name: 'Curva 1 · Sx', edge: 68, symmetry: 92, flow: 84, question: 'Questa buona simmetria iniziale tra gamba interna ed esterna si manterrà anche sul cambio di pendenza?' },
    { name: 'Curva 2 · Dx', edge: 54, symmetry: 76, flow: 72, question: 'Noti la differenza nei numeri? Questa debolezza sul lato destro (76%) corrisponde a ciò che vedi nel video (spalla destra cadente)?' },
    { name: 'Curva 3 · Sx', edge: 71, symmetry: 88, flow: 86, question: 'L’angolo di spigolo estremo (71°) nasce da una forte conduzione di ginocchio (corretta) o il cliente sta solo piegando eccessivamente il bacino verso l\'interno (sbagliata)?' },
    { name: 'Curva 4 · Dx', edge: 58, symmetry: 79, flow: 75, question: 'Il sensore di pressione indica che sta caricando lo sci esterno troppo tardi. Come possiamo anticipare il movimento?' }
  ];

  const quiz = [
    {
      question: 'L\'antenna GPS nel tuo telefono misura direttamente quanta pressione stai applicando allo sci esterno in curva?',
      answers: [
        'Sì, i satelliti spaziali riescono a pesare i chili spinti sullo scarpone.',
        'No: il GPS calcola solo la posizione e la velocità nello spazio. La pressione meccanica sotto la pianta si misura SOLO con una soletta fisica sensibile (es. Moticon).',
        'Sì, se accendo il 5G.'
      ],
      correct: 1,
      explanation: 'Il GPS non legge la dinamica del corpo. Serve solo per sapere DOVE sei e a CHE VELOCITÀ vai (tracking).'
    },
    {
      question: 'Il numerino dell\'Angolo di Spigolo o il punteggio "Ski:IQ" calcolato dal tuo smartphone è un dato fisico assoluto come la temperatura o un algoritmo di stima?',
      answers: [
        'È una Stima Algoritmica: il telefono interpreta matematicamente i tremolii dei sensori e costruisce un numero di riferimento, non una foto perfetta della realtà.',
        'È una misurazione fisica infallibile al millimetro scattata dal telefono.',
        'Dipende da quanto costa l\'abbonamento all\'app.'
      ],
      correct: 0,
      explanation: 'Comprendere che molte App offrono "stime matematiche" (algoritmi) aiuta il Maestro e l\'allievo a usare il dato come stimolo, senza diventarne schiavi in modo dogmatico.'
    },
    {
      question: 'Se un\'app per smartphone ti assegna un "Punteggio Livello 7", questo sostituisce l\'esame del Maestro di Sci FISI?',
      answers: [
        'Sì, vale come brevetto federale ufficiale.',
        'No: i punteggi (gamification) servono a motivare e sfidare sé stessi rispetto alla discesa precedente. Nessun singolo numero di app può giudicare la totale sicurezza, indipendenza, armonia e tattica del gesto sciistico.',
        'Sì, posso anche dare lezioni con quel punteggio.'
      ],
      correct: 1,
      explanation: 'Le App valutano frammenti numerici del gesto (angoli, accelerazioni). L\'occhio critico del maestro valuta l\'equilibrio globale.'
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
              <text x="82" y="104" fill="#ffffff" fontSize="11">Sensori (Sci)</text>

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
              { id: 'sensori', label: 'Sensori Fisici', color: '#00e5ff' },
              { id: 'smartphone', label: 'IA (Stime Algoritmo)', color: '#ffcc00' },
              { id: 'gps', label: 'GPS & Pettorine Bimbi', color: '#ffcc00' },
              { id: 'video', label: 'Video (Analisi Maestro)', color: '#38bdf8' }
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
              Telemetria di Discesa (Esempio Didattico)
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
                <span style={{ color: 'var(--text-secondary)' }}>Angolo Edge/Spigolo:</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>{activeT.edge}° (Stima App)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Simmetria Pressione Sx/Dx:</span>
                <strong style={{ color: 'var(--accent-gold)' }}>{activeT.symmetry}% (Calcolata)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Fluidità di Transizione:</span>
                <strong style={{ color: '#ffffff' }}>{activeT.flow}% (Stima)</strong>
              </div>
            </div>
          </div>

          <div className="lab-card gold" style={{ marginBottom: 0 }}>
            <h5>La Lettura Critica del Maestro</h5>
            <p>{activeT.question}</p>
          </div>
        </div>
      )}

      {tab === 'quiz' && <QuizModule questions={quiz} />}

      <LabFooter
        sources={[
          { label: 'Carv Digital Ski Coach', url: 'https://getcarv.com' },
          { label: 'Lympic (Atleti FIS)', url: 'https://lympic.com' },
          { label: 'Moticon OpenGo', url: 'https://moticon.com' }
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