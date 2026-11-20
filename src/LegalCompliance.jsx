import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'sas_privacy_consent_v1';

const OPEN_SOURCE_PACKAGES = [
  {
    name: 'React & React DOM',
    license: 'MIT License',
    author: 'Meta Platforms, Inc. and affiliates',
    url: 'https://react.dev'
  },
  {
    name: 'Three.js',
    license: 'MIT License',
    author: 'Mr.doob & Three.js Authors',
    url: 'https://threejs.org'
  },
  {
    name: '@react-three/fiber & @react-three/drei',
    license: 'MIT License',
    author: 'Poimandres Collective',
    url: 'https://github.com/pmndrs/react-three-fiber'
  },
  {
    name: 'Vite',
    license: 'MIT License',
    author: 'Evan You & Vite Contributors',
    url: 'https://vite.dev'
  }
];

export default function LegalCompliance({ isPanelOpen }) {
  const [consent, setConsent] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [modalTab, setModalTab] = useState(null); // 'privacy' | 'cookies' | 'opensource' | null

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && modalTab) {
        setModalTab(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalTab]);

  const saveConsent = (level) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ level, date: '2026-11-20' }));
    } catch {
      // Fallback silenzioso se localStorage è bloccato dal browser
    }
    setConsent(level);
  };

  return (
    <>
      {/* Barra discreta di accesso alle informative (sempre raggiungibile) */}
      <footer className={`legal-dock ${isPanelOpen ? 'hidden' : ''}`} aria-label="Informative legali e licenze">
        <button type="button" className="legal-link-btn" onClick={() => setModalTab('privacy')}>
          Privacy
        </button>
        <span aria-hidden="true">·</span>
        <button type="button" className="legal-link-btn" onClick={() => setModalTab('cookies')}>
          Cookie
        </button>
        <span aria-hidden="true">·</span>
        <button type="button" className="legal-link-btn" onClick={() => setModalTab('opensource')}>
          Open Source &amp; Marchi
        </button>
      </footer>

      {/* Banner informativo minimale alla prima visita */}
      {!consent && (
        <div className="cookie-banner" role="region" aria-label="Informativa cookie e privacy">
          <div className="cookie-banner-text">
            <strong>Trasparenza &amp; Privacy:</strong> questo progetto didattico utilizza solo memoria tecnica locale e risorse di rete essenziali (hosting Vercel, font e illuminazione 3D), senza cookie di profilazione o tracciamento pubblicitario.{' '}
            <button type="button" className="cookie-inline-link" onClick={() => setModalTab('cookies')}>
              Leggi l’informativa
            </button>
            .
          </div>
          <div className="cookie-banner-actions">
            <button type="button" className="cookie-btn secondary" onClick={() => saveConsent('essential')}>
              Solo essenziali
            </button>
            <button type="button" className="cookie-btn primary" onClick={() => saveConsent('accepted')}>
              Ho capito
            </button>
          </div>
        </div>
      )}

      {/* Modale completo Privacy, Cookie & Open Source */}
      {modalTab && (
        <div
          className="legal-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          onClick={() => setModalTab(null)}
        >
          <div className="legal-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="legal-modal-header">
              <div>
                <span className="kicker" style={{ marginBottom: '4px' }}>
                  Conformità &amp; Trasparenza — SAS Academy
                </span>
                <h2 id="legal-modal-title" style={{ fontSize: '1.5rem' }}>
                  Note Legali, Privacy &amp; Open Source
                </h2>
              </div>
              <button type="button" className="close-btn" style={{ marginBottom: 0 }} onClick={() => setModalTab(null)}>
                ✕ Chiudi
              </button>
            </div>

            <div className="legal-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={modalTab === 'privacy'}
                className={`legal-tab ${modalTab === 'privacy' ? 'active' : ''}`}
                onClick={() => setModalTab('privacy')}
              >
                Privacy (GDPR)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={modalTab === 'cookies'}
                className={`legal-tab ${modalTab === 'cookies' ? 'active' : ''}`}
                onClick={() => setModalTab('cookies')}
              >
                Cookie Policy
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={modalTab === 'opensource'}
                className={`legal-tab ${modalTab === 'opensource' ? 'active' : ''}`}
                onClick={() => setModalTab('opensource')}
              >
                Open Source &amp; Marchi
              </button>
            </div>

            <div className="legal-modal-body">
              {modalTab === 'privacy' && (
                <div>
                  <h4>1. Natura del progetto e Referenti</h4>
                  <p>
                    <strong>Innovazione Sci 2026</strong> è un elaborato didattico e divulgativo realizzato dal gruppo di lavoro <strong>Andrea, Marco, Gianluca ed Emma</strong> nell’ambito del percorso <strong>SAS Academy</strong>. Il sito non svolge attività commerciale né vendita diretta.
                  </p>

                  <h4>2. Dati trattati e Base Giuridica (Art. 6 GDPR)</h4>
                  <p>
                    Non vengono raccolti moduli di registrazione, nomi, email o dati personali identificativi. Durante la navigazione vengono trattati esclusivamente dati tecnici di connessione (indirizzo IP, user-agent, log di sicurezza) necessari all’erogazione del servizio web tramite l’infrastruttura <strong>Vercel Inc.</strong> e al caricamento dei font tipografici (Google Fonts) e delle mappe di illuminazione 3D.
                  </p>

                  <h4>3. Diritti dell’utente</h4>
                  <p>
                    Ai sensi degli artt. 15–22 del Regolamento (UE) 2016/679 (GDPR), l’utente può cancellare in ogni momento i dati tecnici salvati localmente tramite le impostazioni del proprio browser o reimpostando le preferenze nella scheda Cookie Policy.
                  </p>
                </div>
              )}

              {modalTab === 'cookies' && (
                <div>
                  <h4>1. Nessun cookie di profilazione</h4>
                  <p>
                    In conformità alle <em>Linee guida cookie e altri strumenti di tracciamento</em> del Garante per la Protezione dei Dati Personali, questo sito <strong>non utilizza cookie di profilazione, marketing o analitica di terze parti</strong>.
                  </p>

                  <h4>2. Strumenti tecnici utilizzati</h4>
                  <ul className="legal-list">
                    <li>
                      <strong>Memoria locale tecnica (localStorage — <code>{STORAGE_KEY}</code>):</strong> salva esclusivamente la conferma di lettura dell’informativa da parte dell’utente. Non trasmette dati a server esterni.
                    </li>
                    <li>
                      <strong>Risorse CDN tecniche:</strong> caricamento dei font web (Google Fonts) e dell’ambiente 3D HDRI per il rendering della scena WebGL.
                    </li>
                  </ul>

                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="cookie-btn secondary"
                      onClick={() => {
                        try {
                          localStorage.removeItem(STORAGE_KEY);
                        } catch {}
                        setConsent(null);
                        setModalTab(null);
                      }}
                    >
                      Reimposta preferenze banner
                    </button>
                  </div>
                </div>
              )}

              {modalTab === 'opensource' && (
                <div>
                  <h4>1. Licenza del Codice Sorgente</h4>
                  <p>
                    Il codice originale dell’applicazione è rilasciato sotto <strong>Licenza MIT</strong> (file <code>LICENSE</code> nel repository). È consentito il riutilizzo, la modifica e la distribuzione citando gli autori originali.
                  </p>

                  <h4>2. Librerie Open Source di Terze Parti</h4>
                  <div className="os-grid">
                    {OPEN_SOURCE_PACKAGES.map((pkg) => (
                      <a key={pkg.name} href={pkg.url} target="_blank" rel="noreferrer" className="os-card">
                        <div>
                          <strong>{pkg.name}</strong>
                          <span>{pkg.license}</span>
                        </div>
                        <small>{pkg.author} ↗</small>
                      </a>
                    ))}
                  </div>

                  <h4>3. Marchi e Fonti Tecniche</h4>
                  <p>
                    Tutti i marchi, i nomi di tecnologie e i brevetti citati nei laboratori (tra cui <em>Mips, Koroyd, WaveCel, RECCO, Out Of, BoneTech, PrimaLoft, Polartec, Leki, Tyrolia, Carv, Moticon, Lympic, HEAD, Salomon, Atomic, Tecnica, Fischer, BOA, Wintersteiger</em>) appartengono ai rispettivi proprietari e sono menzionati esclusivamente a fini didattici, informativi e comparativi.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}