import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IconClose } from './components/KokonutPrimitives';

const STORAGE_KEY = 'sas_skitech_privacy_v2';

const OPEN_SOURCE_PACKAGES = [
  {
    name: 'React & React DOM',
    license: 'MIT License',
    author: 'Meta Platforms, Inc. and affiliates',
    url: 'https://react.dev'
  },
  {
    name: 'Three.js & R3F',
    license: 'MIT License',
    author: 'Mr.doob & Poimandres Collective',
    url: 'https://threejs.org'
  },
  {
    name: 'Motion (motion.dev)',
    license: 'MIT License',
    author: 'Matt Perry & Motion Contributors',
    url: 'https://motion.dev'
  },
  {
    name: 'Anime.js v4',
    license: 'MIT License',
    author: 'Julian Garnier',
    url: 'https://animejs.com'
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
  const [modalTab, setModalTab] = useState(null);

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ level, date: '2026-11-22' }));
    } catch {}
    setConsent(level);
  };

  return (
    <>
      <footer className={`legal-dock ${isPanelOpen ? 'hidden' : ''}`} aria-label="Informative legali e copyright">
        <a
          href="https://home.andreamonzani.com"
          target="_blank"
          rel="noreferrer"
          className="legal-owner-link"
        >
          © 2026 ANDREA MONZANI
        </a>
        <span aria-hidden="true">·</span>
        <button type="button" className="legal-link-btn" onClick={() => setModalTab('privacy')}>
          Privacy
        </button>
        <span aria-hidden="true">·</span>
        <button type="button" className="legal-link-btn" onClick={() => setModalTab('cookies')}>
          Cookie
        </button>
        <span aria-hidden="true">·</span>
        <button type="button" className="legal-link-btn" onClick={() => setModalTab('opensource')}>
          Licenze
        </button>
      </footer>

      <AnimatePresence>
        {!consent && (
          <motion.div
            className="cookie-banner"
            role="region"
            aria-label="Informativa privacy e cookie"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div className="cookie-banner-text">
              <strong>Zero Cookie di Tracciamento (100% GDPR):</strong> questo sito utilizza font locali self-hosted e nessun tracker di profilazione. Salviamo solo la tua conferma tecnica in memoria locale.{' '}
              <button type="button" className="cookie-inline-link" onClick={() => setModalTab('cookies')}>
                Dettagli Privacy &amp; Cookie
              </button>
              .
            </div>
            <div className="cookie-banner-actions">
              <button type="button" className="cookie-btn secondary" onClick={() => saveConsent('essential')}>
                Solo essenziali
              </button>
              <button type="button" className="cookie-btn primary" onClick={() => saveConsent('accepted')}>
                Conferma
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalTab && (
          <motion.div
            className="legal-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setModalTab(null)}
          >
            <motion.div
              className="legal-modal-card"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 360, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="legal-modal-header">
                <div>
                  <span className="kicker" style={{ marginBottom: '4px' }}>
                    skitech.andreamonzani.com — Conformità GDPR
                  </span>
                  <h2 id="legal-modal-title" style={{ fontSize: '1.5rem' }}>
                    Privacy, Cookie &amp; Proprietà Intellettuale
                  </h2>
                </div>
                <button type="button" className="close-btn" onClick={() => setModalTab(null)}>
                  <IconClose size={12} />
                  <span>Chiudi</span>
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
                  Copyright &amp; Licenze
                </button>
              </div>

              <div className="legal-modal-body">
                {modalTab === 'privacy' && (
                  <div>
                    <h4>1. Titolare del Trattamento</h4>
                    <p>
                      Il titolare del sito <strong>skitech.andreamonzani.com</strong> è{' '}
                      <a
                        href="https://home.andreamonzani.com"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--accent-cyan)' }}
                      >
                        Andrea Monzani
                      </a>
                      . Il progetto <em>Innovazione Sci 2026</em> nasce come piattaforma didattica realizzata nell’ambito di SAS Academy con Andrea, Marco, Gianluca ed Emma.
                    </p>

                    <h4>2. Architettura Privacy-by-Design (Zero Tracciamento)</h4>
                    <p>
                      Il sito è progettato secondo il principio di minimizzazione dei dati (Art. 5 GDPR): utilizza font self-hosted locali, non carica mappe HDRI da CDN esterni, non raccoglie form né dati personali identificativi e non impiega strumenti di profilazione. I soli log tecnici di connessione sono gestiti dall’infrastruttura di hosting <strong>Vercel Inc.</strong> per garantire sicurezza e continuità del servizio (Art. 6, par. 1, lett. f GDPR).
                    </p>

                    <h4>3. Diritti dell’Interessato</h4>
                    <p>
                      Ai sensi degli artt. 15–22 del Regolamento (UE) 2016/679, puoi cancellare in qualsiasi momento la preferenza tecnica salvata sul tuo dispositivo tramite il pulsante nella scheda Cookie Policy o dalle impostazioni del browser.
                    </p>
                  </div>
                )}

                {modalTab === 'cookies' && (
                  <div>
                    <h4>1. Assenza di Cookie di Profilazione</h4>
                    <p>
                      In conformità alle Linee guida del Garante per la Protezione dei Dati Personali, questo sito <strong>non installa cookie di profilazione, marketing o analitica</strong>.
                    </p>

                    <h4>2. Memoria Locale Tecnica</h4>
                    <ul className="legal-list">
                      <li>
                        <strong><code>{STORAGE_KEY}</code> (localStorage):</strong> memorizza esclusivamente l’avvenuta presa visione del banner informativo. Resta sul dispositivo dell’utente e non viene mai inviato a server esterni.
                      </li>
                    </ul>

                    <div style={{ marginTop: '16px' }}>
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
                    <h4>1. Diritti d’Autore e Proprietà Intellettuale</h4>
                    <p>
                      <strong>
                        © 2026{' '}
                        <a
                          href="https://home.andreamonzani.com"
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--accent-gold)' }}
                        >
                          Andrea Monzani
                        </a>{' '}
                        — Tutti i diritti riservati.
                      </strong>{' '}
                      L’architettura dell’interfaccia, il design interattivo, gli schemi grafici vettoriali e il codice originale sono di proprietà esclusiva di Andrea Monzani. I contenuti didattici sono stati sviluppati con la collaborazione di Marco, Gianluca ed Emma (SAS Academy).
                    </p>

                    <h4>2. Componenti Open Source Utilizzati (Licenza MIT)</h4>
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

                    <h4>3. Marchi Commerciali Citati</h4>
                    <p>
                      Tutti i marchi e le tecnologie citati nei laboratori (tra cui <em>Mips, Koroyd, WaveCel, RECCO, Out Of, BoneTech, PrimaLoft, Polartec, Leki, Tyrolia, Carv, Moticon, Lympic, HEAD, Salomon, Atomic, Tecnica, Fischer, BOA, Wintersteiger</em>) appartengono ai rispettivi titolari e sono riportati esclusivamente a scopo didattico e divulgativo.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}