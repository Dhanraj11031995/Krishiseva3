import React, { useState } from 'react';
import { speakText, tr, LANGUAGES } from '../../utils/translation';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/* Translate inline text */
export const T = ({ children, fallback }) => {
  const { language } = useAuth();
  return <>{tr(String(children), language) || fallback || children}</>;
};

/* Dual label: English + Odia */
export const DualLabel = ({ en, or: orLabel }) => {
  const { language } = useAuth();
  return (
    <span>
      {language === 'or' ? orLabel : en}
      {language === 'en' && orLabel && <span className="odia" style={{ marginLeft: 6 }}>({orLabel})</span>}
    </span>
  );
};

/* 🎙️ Voice button */
export const VoiceBtn = ({ message, label }) => {
  const [speaking, setSpeaking] = useState(false);
  const speak = () => {
    setSpeaking(true);
    speakText(typeof message === 'function' ? message() : (message || ''));
    setTimeout(() => setSpeaking(false), 5000);
  };
  return (
    <div className="flex-center gap-6">
      {label && <span style={{ fontSize: '.72rem', color: 'var(--earth)' }}>{label}</span>}
      <button className={`voice-btn ${speaking ? 'speaking' : ''}`} onClick={speak} title="Odia Voice Assistant">
        {speaking ? '📢' : '🎙️'}
      </button>
    </div>
  );
};

/* Language dropdown */
export const LanguageSelector = () => {
  const { language, setLanguage } = useAuth();
  return (
    <div style={{ paddingBottom: 4 }}>
      <div style={{ fontSize: '.6rem', color: 'var(--clay)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
        ଭାଷା / Language
      </div>
      <select className="lang-select" value={language} onChange={e => setLanguage(e.target.value)}>
        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </div>
  );
};

/* 🖨️ Print button */
export const PrintBtn = ({ title }) => {
  const { language } = useAuth();
  const handlePrint = () => {
    if (title) document.title = title;
    window.print();
  };
  return (
    <button className="btn btn-print btn-sm no-print" onClick={handlePrint}>
      🖨️ {language === 'or' ? 'ମୁଦ୍ରଣ' : language === 'hi' ? 'प्रिंट' : 'Print'}
    </button>
  );
};

/* Print header (shown only on print) */
export const PrintHeader = ({ title, subtitle, userName }) => (
  <div className="print-header">
    <div>
      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>🌾 KrishiSeva – କୃଷି ସେବା ପ୍ଲାଟଫର୍ମ</div>
      <div style={{ fontWeight: 700, fontSize: '.95rem', marginTop: 3 }}>{title}</div>
      {subtitle && <div style={{ fontSize: '.82rem', color: '#666' }}>{subtitle}</div>}
    </div>
    <div style={{ textAlign: 'right', fontSize: '.78rem', color: '#666' }}>
      <div>Farmer: {userName}</div>
      <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
      <div>Time: {new Date().toLocaleTimeString('en-IN')}</div>
    </div>
    <div className="print-watermark">KrishiSeva v3 – krishiseva.in</div>
  </div>
);

/* 🔒 Subscription wall */
export const SubWall = ({ feature }) => {
  const { language } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="sub-wall">
      <div className="sub-wall-icon">🔒</div>
      <h3>{language === 'or' ? 'ସଦସ୍ୟପଦ ଆବଶ୍ୟକ' : 'Subscription Required'}</h3>
      <p>
        {language === 'or'
          ? `${feature || 'ଏହି ସୁବ‌ିଧ‌ା'} ଦ‌େଖ‌ିବ‌ା ପ‌ାଇ‌ଁ ଦ‌ୟ‌ାକ‌ର‌ି ସ‌ଦ‌ସ‌୍ୟ ହ‌ୁଅ‌ନ‌ୁ।`
          : `Please subscribe to access ${feature || 'this feature'}.`}
      </p>
      <button className="btn btn-gold btn-lg" onClick={() => navigate('/subscribe')}>
        ⭐ {language === 'or' ? 'ଏବ‌େ ସ‌ଦ‌ସ‌୍ୟ ହ‌ୁଅ‌ନ‌ୁ' : 'Subscribe Now'}
      </button>
    </div>
  );
};

/* Loading spinner */
export const Spinner = () => <div className="spinner" />;

/* Empty state */
export const EmptyState = ({ icon = '📋', text, textOr }) => {
  const { language } = useAuth();
  return (
    <div className="empty-state">
      <div className="ei">{icon}</div>
      <div>{language === 'or' && textOr ? textOr : text}</div>
    </div>
  );
};
