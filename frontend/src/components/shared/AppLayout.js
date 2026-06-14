import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { VoiceBtn, LanguageSelector, T } from './UIKit';
import { VOICE_MSGS } from '../../utils/translation';

const USER_NAV = [
  { section: 'ପ‌ରାମ‌ର‌୍ଶ / Consultancy', items: [
    { path:'/cultivation',  icon:'🌾', label:'Cultivation',       labelOr:'ଚ‌ାଷ ପ‌୍ର‌ଣ‌ାଳ‌ୀ',   sub:true },
    { path:'/nutrients',    icon:'🧪', label:'Nutrients',          labelOr:'ପ‌ୋଷ‌କ ତ‌ତ‌୍ତ‌ୱ',    sub:true },
    { path:'/protection',   icon:'🛡️', label:'Plant Protection',  labelOr:'ଉଦ‌୍ଭ‌ିଦ ସ‌ୁର‌କ‌୍ଷ‌ା', sub:true },
    { path:'/costing',      icon:'💰', label:'Costing',           labelOr:'ଖ‌ର‌୍ଚ ହ‌ିସ‌ାବ',     sub:true },
    { path:'/ecommerce',    icon:'🛒', label:'E-Commerce',        labelOr:'ଇ-ବ‌ାଣ‌ିଜ‌୍ୟ',        sub:true },
  ]},
  { section: 'ମ‌ୋ ଡ‌େଟ‌ା / My Data', items: [
    { path:'/data-entry',   icon:'📋', label:'Data Entry',        labelOr:'ତ‌ଥ‌୍ୟ ପ‌୍ର‌ବ‌େଶ',    sub:false },
    { path:'/my-data',      icon:'📊', label:'Field Data',        labelOr:'ମ‌ାଠ ତ‌ଥ‌୍ୟ',        sub:false },
    { path:'/photos',       icon:'📷', label:'Photo Gallery',     labelOr:'ଫ‌ଟ‌ୋ ଗ‌୍ୟ‌ାଲ‌େର‌ି',   sub:false },
    { path:'/weather',      icon:'⛅', label:'Weather',           labelOr:'ପ‌ାଣ‌ିପ‌ାଗ',         sub:false },
    { path:'/ask-ai',       icon:'🤖', label:'Ask AI',            labelOr:'AI ସ‌ହ‌ାୟ‌',         sub:false },
    { path:'/orders',       icon:'📦', label:'My Orders',         labelOr:'ମ‌ୋ ଅ‌ର‌୍ଡ‌ର',        sub:false },
  ]},
];

const ADMIN_NAV = [
  { section: 'Overview', items: [
    { path:'/admin',                icon:'📊', label:'Dashboard',         labelOr:'ଡ‌୍ୟ‌ାଶ‌ବ‌ୋ‌ର‌୍ଡ' },
    { path:'/admin/users',          icon:'👨‍🌾', label:'Manage Users',      labelOr:'ଚ‌ାଷ‌କ' },
  ]},
  { section: 'Farm Data', items: [
    { path:'/admin/places',         icon:'🗺️', label:'Places & Plots',    labelOr:'ସ‌୍ଥ‌ାନ ଓ ଜ‌ମ‌ି' },
    { path:'/admin/cultivation',    icon:'🌾', label:'Cultivation Data',  labelOr:'ଚ‌ାଷ ତ‌ଥ‌୍ୟ' },
    { path:'/admin/nutrients',      icon:'🧪', label:'Nutrient Data',     labelOr:'ସ‌ାର ତ‌ଥ‌୍ୟ' },
    { path:'/admin/protection',     icon:'🛡️', label:'Protection Data',  labelOr:'ସ‌ୁର‌କ‌୍ଷ‌ା ତ‌ଥ‌୍ୟ' },
    { path:'/admin/costing',        icon:'💰', label:'Costing Data',      labelOr:'ଖ‌ର‌୍ଚ ତ‌ଥ‌୍ୟ' },
  ]},
  { section: 'Reports', items: [
    { path:'/admin/field-data',     icon:'🌿', label:'Field Data',        labelOr:'ମ‌ାଠ ତ‌ଥ‌୍ୟ' },
    { path:'/admin/photos',         icon:'📷', label:'All Photos',        labelOr:'ସ‌ମ‌ସ‌୍ତ ଫ‌ଟ‌ୋ' },
    { path:'/admin/orders',         icon:'📦', label:'All Orders',        labelOr:'ସ‌ମ‌ସ‌୍ତ ଅ‌ର‌୍ଡ‌ର' },
    { path:'/admin/form-queries',   icon:'📝', label:'Form Queries',      labelOr:'ଫ‌ର‌୍ମ ପ‌୍ର‌ଶ‌୍ନ' },
    { path:'/admin/ai-log',         icon:'🤖', label:'AI Queries Log',    labelOr:'AI ଲ‌ଗ' },
  ]},
];

export default function AppLayout({ children, title, voiceMsg }) {
  const { user, logout, language, isSubscribed, daysLeft } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const nav       = user?.role === 'admin' ? ADMIN_NAV : USER_NAV;
  const subOk     = isSubscribed();
  const days      = daysLeft();

  const getVoice = () => {
    if (voiceMsg) return voiceMsg;
    const p = location.pathname;
    if (p.includes('cultivation')) return VOICE_MSGS.cultivation;
    if (p.includes('nutrient'))    return VOICE_MSGS.nutrients;
    if (p.includes('protection'))  return VOICE_MSGS.protection;
    if (p.includes('costing'))     return VOICE_MSGS.costing;
    if (p.includes('ecommerce'))   return VOICE_MSGS.ecommerce;
    if (p.includes('data-entry'))  return VOICE_MSGS.dataEntry;
    if (p.includes('weather'))     return VOICE_MSGS.weather;
    if (p.includes('photo'))       return VOICE_MSGS.photos;
    if (p.includes('ask-ai'))      return VOICE_MSGS.ai;
    return VOICE_MSGS.dashboard;
  };

  return (
    <div className="app-layout">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">🌾 KrishiSeva</div>
          <div className="logo-odia">କୃଷ‌ି ସ‌େବ‌ା ପ‌୍ଲ‌ାଟ‌ଫ‌ର‌୍ମ</div>
          <div className="logo-sub">Odisha · v3.0</div>
        </div>

        <div className="sidebar-user">
          <div className="uname">👤 {user?.name}</div>
          <div className="urole">{user?.role === 'admin' ? '🛡️ Administrator' : '👨‍🌾 Farmer'}</div>
          {user?.role !== 'admin' && (
            <div className={`sub-badge ${subOk ? 'active' : 'none'}`}>
              {subOk
                ? (language === 'or' ? `✅ ${days} ଦ‌ିନ ବ‌ାକ‌ି` : `✅ ${days}d left`)
                : (language === 'or' ? '⚠️ ସ‌ଦ‌ସ‌୍ୟ ନ‌ୁହ‌ନ‌ୁ' : '⚠️ Not subscribed')}
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {nav.map(section => (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map(item => {
                const locked = item.sub && !subOk && user?.role !== 'admin';
                const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path + '/'));
                return (
                  <button
                    key={item.path}
                    className={`nav-item ${active ? 'active' : ''} ${locked ? 'locked' : ''}`}
                    onClick={() => locked ? navigate('/subscribe') : navigate(item.path)}
                    title={locked ? (language === 'or' ? 'ସ‌ଦ‌ସ‌୍ୟ ହ‌ୁଅ‌ନ‌ୁ' : 'Subscribe to unlock') : ''}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span>{language === 'or' && item.labelOr ? item.labelOr : item.label}</span>
                    {locked && <span className="nav-lock">🔒</span>}
                  </button>
                );
              })}
            </div>
          ))}
          {user?.role !== 'admin' && !subOk && (
            <button className="nav-item" style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', color:'white', marginTop:8 }} onClick={() => navigate('/subscribe')}>
              <span className="nav-icon">⭐</span>
              {language === 'or' ? 'ସ‌ଦ‌ସ‌୍ୟ ହ‌ୁଅ‌ନ‌ୁ' : 'Subscribe Now'}
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <LanguageSelector />
          <button className="nav-item" style={{ marginTop: 8 }} onClick={logout}>
            <span className="nav-icon">🚪</span>
            <T>Logout</T>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main-content">
        <header className="topbar no-print">
          <h1 className="topbar-title">{title}</h1>
          <div className="topbar-right">
            <VoiceBtn message={getVoice} />
          </div>
        </header>
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
}
