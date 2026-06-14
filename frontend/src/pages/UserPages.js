import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/shared/AppLayout';
import { PrintBtn, PrintHeader, VoiceBtn, Spinner } from '../components/shared/UIKit';
import { useAuth, API } from '../context/AuthContext';

// ── USER DASHBOARD ─────────────────────────────────────────
export function UserDashboard() {
  const { user, language, isSubscribed, daysLeft } = useAuth();
  const navigate = useNavigate();
  const [places,  setPlaces]  = useState([]);
  const [entries, setEntries] = useState([]);
  const [orders,  setOrders]  = useState([]);

  useEffect(() => {
    API.get('/places').then(r => setPlaces(r.data)).catch(() => {});
    API.get('/field-data').then(r => setEntries(r.data)).catch(() => {});
    API.get('/orders').then(r => setOrders(r.data)).catch(() => {});
  }, []);

  const sub  = isSubscribed();
  const days = daysLeft();

  const PLATFORMS = [
    { icon:'🌾', color:'var(--leaf)',    path:'/cultivation', titleEn:'Cultivation Practices', titleOr:'ଚାଷ ପ୍ରଣାଳୀ',    desc:'All 9 crop categories',         sub:true  },
    { icon:'🧪', color:'var(--sky)',     path:'/nutrients',   titleEn:'Nutrient Management',   titleOr:'ପୋଷକ ପ୍ରବନ୍ଧନ',  desc:'Organic & chemical by stage',   sub:true  },
    { icon:'🛡️', color:'var(--danger)', path:'/protection',  titleEn:'Plant Protection',      titleOr:'ଉଦ୍ଭିଦ ସୁରକ୍ଷା', desc:'Pests, fungi, weeds, viruses',  sub:true  },
    { icon:'💰', color:'var(--harvest)', path:'/costing',     titleEn:'Crop Costing',          titleOr:'ଫସଲ ଖର୍ଚ',       desc:'Full investment analysis',      sub:true  },
    { icon:'🛒', color:'#6D28D9',        path:'/ecommerce',   titleEn:'E-Commerce',            titleOr:'ଇ-ବାଣିଜ୍ୟ',       desc:'Order inputs & implements',     sub:true  },
    { icon:'📋', color:'var(--soil)',    path:'/data-entry',  titleEn:'Field Data Entry',      titleOr:'ମାଠ ତଥ୍ୟ ପ୍ରବେଶ', desc:'Record soil, inputs, harvest',  sub:false },
    { icon:'⛅', color:'var(--sky)',     path:'/weather',     titleEn:'Weather',               titleOr:'ପାଣିପାଗ',         desc:'5-day forecast & advisory',     sub:false },
    { icon:'🤖', color:'#7C3AED',        path:'/ask-ai',      titleEn:'Ask AI',                titleOr:'AI ସହାୟ',         desc:'ChatGPT when data unavailable', sub:false },
    { icon:'📷', color:'var(--earth)',   path:'/photos',      titleEn:'Photo Gallery',         titleOr:'ଫଟୋ ଗ୍ୟାଲେରି',    desc:'Upload & tag field photos',     sub:false },
  ];

  return (
    <AppLayout title={language === 'or' ? `ସ୍ୱାଗତ, ${user?.name}` : `Welcome, ${user?.name}`}>
      <PrintHeader title="Farm Dashboard" userName={user?.name} />

      {!sub && (
        <div className="alert alert-warning mb-20">
          ⚠️ {language === 'or' ? 'ସଦସ୍ୟ ନୁହନ୍ତି। ଚାଷ ପରାମର୍ଶ ପାଇଁ ସଦସ୍ୟ ହୁଅନ୍ତୁ।' : 'Not subscribed. Subscribe for cultivation, nutrients, protection & costing.'}
          <button className="btn btn-gold btn-sm" style={{ marginLeft:'auto' }} onClick={() => navigate('/subscribe')}>
            ⭐ {language === 'or' ? 'ସଦସ୍ୟ ହୁଅନ୍ତୁ' : 'Subscribe Now'}
          </button>
        </div>
      )}
      {sub && days <= 7 && (
        <div className="alert alert-warning mb-16">
          ⏳ {language === 'or' ? `ସଦସ୍ୟପଦ ${days} ଦିନ ଭିତରେ ଶେଷ।` : `Subscription expires in ${days} days.`}
          <button className="btn btn-gold btn-sm" style={{ marginLeft:'auto' }} onClick={() => navigate('/subscribe')}>Renew</button>
        </div>
      )}

      <div className="grid-5 mb-24">
        {[
          { label:language==='or'?'ଆପଣଙ୍କ ସ୍ଥାନ':'Places',   value:places.length,                                icon:'🗺️',color:'green'  },
          { label:language==='or'?'ଜମି ଭୂ-ଖଣ୍ଡ':'Plots',     value:places.reduce((s,p)=>s+p.plots.length,0),     icon:'🌾',color:'amber'  },
          { label:language==='or'?'ତଥ୍ୟ ଏଣ୍ଟ୍ରି':'Entries',  value:entries.length,                               icon:'📋',color:'blue'   },
          { label:language==='or'?'ଅର୍ଡର':'Orders',           value:orders.length,                                icon:'📦',color:'orange' },
          { label:language==='or'?'ସଦସ୍ୟ ଦିନ':'Days Left',   value:sub?days:'—',                                  icon:'⭐',color:'purple' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-number">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', marginBottom:14 }}>
        {language === 'or' ? 'ସୁବିଧା ଚୟନ ହୁଅନ୍ତୁ' : 'Select a Platform'}
      </h3>
      <div className="grid-3 mb-24">
        {PLATFORMS.map(p => (
          <div key={p.path} className="card"
            style={{ cursor:'pointer', transition:'all .2s', opacity:p.sub&&!sub?.75:1 }}
            onClick={() => (p.sub&&!sub) ? navigate('/subscribe') : navigate(p.path)}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='var(--shadow-md)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}
          >
            <div style={{ padding:'22px 18px', textAlign:'center' }}>
              <div style={{ fontSize:'2.6rem', marginBottom:8 }}>{p.icon}</div>
              <h4 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:p.color, marginBottom:4 }}>
                {language==='or'?p.titleOr:p.titleEn}
              </h4>
              <p style={{ color:'var(--earth)', fontSize:'.76rem', marginBottom:10 }}>{p.desc}</p>
              {p.sub&&!sub
                ? <span className="badge badge-amber">🔒 {language==='or'?'ସଦସ୍ୟ ଆବଶ୍ୟକ':'Subscribe'}</span>
                : <span className="badge badge-green">→ {language==='or'?'ଖୋଲନ୍ତୁ':'Open'}</span>}
            </div>
          </div>
        ))}
      </div>

      {places.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">🗺️ {language==='or'?'ଆପଣଙ୍କ ଜମି ଓ ଫସଲ':'Your Assigned Plots'}</span>
            <PrintBtn title="My Plots" />
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>{language==='or'?'ସ୍ଥାନ':'Place'}</th>
                <th>{language==='or'?'ଜମି':'Plot'}</th>
                <th>{language==='or'?'ଫସଲ':'Crop'}</th>
                <th>{language==='or'?'ଶ୍ରେଣୀ':'Category'}</th>
                <th>{language==='or'?'ଋତୁ':'Season'}</th>
                <th>{language==='or'?'ଏକର':'Acres'}</th>
              </tr></thead>
              <tbody>
                {places.flatMap(pl => pl.plots.map(pt => (
                  <tr key={pt.id}>
                    <td><strong>{pl.name}</strong><div style={{fontSize:'.72rem',color:'var(--earth)'}}>{pl.district}</div></td>
                    <td>{pt.name}</td>
                    <td><span className="badge badge-green">{pt.crop}</span></td>
                    <td><span className="badge badge-blue">{pt.cropCategory}</span></td>
                    <td><span className="badge badge-amber">{pt.season}</span></td>
                    <td>{pt.area}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// ── WEATHER PAGE ────────────────────────────────────────────
export function WeatherPage() {
  const { language, user } = useAuth();
  const [weather, setWeather] = useState(null);
  const [city,    setCity]    = useState('Bhubaneswar');
  const [loading, setLoading] = useState(false);

  const fetchWeather = async c => {
    setLoading(true);
    try { const r = await API.get(`/weather?city=${encodeURIComponent(c)}`); setWeather(r.data); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWeather(city); }, []); // eslint-disable-line

  const WI = { '01d':'☀️','02d':'⛅','03d':'☁️','04d':'☁️','09d':'🌧️','10d':'🌦️','11d':'⛈️','13d':'❄️','50d':'🌫️' };
  const CITIES = ['Bhubaneswar','Cuttack','Puri','Berhampur','Sambalpur','Rourkela','Koraput','Balasore'];

  return (
    <AppLayout title={language==='or'?'⛅ ପାଣିପାଗ':'⛅ Weather'}>
      <PrintHeader title="Weather Report" userName={user?.name} />
      <div className="flex-between mb-16">
        <div>
          <h2 className="section-title">{language==='or'?'ପାଣିପାଗ ଓ କୃଷି ପରାମର୍ଶ':'Weather & Farm Advisory'}</h2>
          <p className="section-sub">{language==='or'?'5 ଦିନ ପୂର୍ବ ଭବିଷ୍ୟ ଦେଖନ୍ତୁ':'5-day forecast with agricultural advisory'}</p>
        </div>
        <div className="flex gap-8 no-print">
          <PrintBtn title={`Weather – ${city}`} />
          <VoiceBtn message={weather ? `ଆଜି ${weather.city} ତାପମାନ ${weather.temp} ଡିଗ୍ରୀ। ${weather.advisory||''}` : ''} />
        </div>
      </div>

      <div className="flex gap-8 mb-16 no-print">
        <input className="form-input" value={city} onChange={e=>setCity(e.target.value)}
          placeholder="e.g. Bhubaneswar, Cuttack"
          onKeyDown={e => e.key==='Enter' && fetchWeather(city)} />
        <button className="btn btn-sky" onClick={()=>fetchWeather(city)} disabled={loading}>{loading?'⏳':'🔍'}</button>
      </div>
      <div className="chip-group mb-20 no-print">
        {CITIES.map(c => (
          <button key={c} className={`chip ${city===c?'active':''}`} onClick={()=>{setCity(c);fetchWeather(c);}}>{c}</button>
        ))}
      </div>

      {loading && <Spinner />}

      {!loading && weather && (
        <div className="grid-2 gap-20">
          <div className="weather-card">
            <div className="flex-between mb-10">
              <div>
                <div style={{fontSize:'.9rem',opacity:.8}}>{weather.city} · {new Date().toLocaleDateString('en-IN',{weekday:'long'})}</div>
                <div className="weather-temp">{weather.temp}°C</div>
                <div style={{fontSize:'.85rem',opacity:.85,marginTop:2}}>{weather.description}</div>
              </div>
              <div style={{fontSize:'3.5rem'}}>{WI[weather.icon]||'🌤️'}</div>
            </div>
            <div className="flex gap-16 mb-12" style={{fontSize:'.8rem',opacity:.85}}>
              <span>💧 {weather.humidity}%</span>
              <span>🌡️ Feels {weather.feels_like}°C</span>
              <span>💨 {weather.wind_speed} km/h</span>
            </div>
            <div style={{background:'rgba(255,255,255,.15)',borderRadius:'var(--radius-sm)',padding:'10px 14px',fontSize:'.82rem'}}>
              🌿 <strong>{language==='or'?'ପରାମର୍ଶ':'Advisory'}:</strong> {language==='or'?weather.advisory:weather.advisoryEn}
            </div>
            {weather.isMock&&<div style={{fontSize:'.68rem',opacity:.6,marginTop:8}}>*Mock data – add OpenWeather API key</div>}
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">📅 {language==='or'?'5 ଦିନ ଭବିଷ୍ୟ':'5-Day Forecast'}</span></div>
            <div className="card-body" style={{padding:14}}>
              {weather.forecast?.map((d,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:i<4?'1px solid var(--straw)':''}}>
                  <div style={{width:60,fontWeight:700,fontSize:'.82rem'}}>{d.day}</div>
                  <div style={{fontSize:'1.3rem'}}>{WI[d.icon]||'🌤️'}</div>
                  <div style={{fontSize:'.82rem'}}><strong>{d.temp_max}°</strong> / {d.temp_min}°C</div>
                  <div style={{fontSize:'.75rem',color:'var(--earth)',flex:1}}>{d.description}</div>
                  {d.rain_chance!==undefined&&<span style={{fontSize:'.72rem',color:'var(--sky)'}}>💧{d.rain_chance}%</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// ── ASK AI PAGE ──────────────────────────────────────────────
export function AskAIPage() {
  const { language, user } = useAuth();
  const [question, setQuestion] = useState('');
  const [cropName, setCropName] = useState('');
  const [answer,   setAnswer]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [history,  setHistory]  = useState([]);

  const QUICK = [
    'Best time to sow rice in Odisha?',
    'How to control stem borer organically in paddy?',
    'Symptoms of potassium deficiency in tomato?',
    'Urea dose per acre for mustard crop?',
    'Recommended spacing for maize cultivation?',
    'How to prepare jeevamrit at home?',
    'Organic treatment for late blight in tomato?',
    'How to manage aphids in mustard without chemicals?',
  ];

  const ask = async q => {
    const txt = q || question;
    if (!txt.trim()) return;
    setLoading(true); setAnswer('');
    try {
      const r = await API.post('/ai/ask', { question: txt, cropName });
      setAnswer(r.data.answer);
      setHistory(prev => [{ q:txt, a:r.data.answer, isMock:r.data.isMock, t:new Date() }, ...prev.slice(0,9)]);
    } catch(e) { setAnswer('AI service temporarily unavailable. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <AppLayout title={language==='or'?'🤖 AI ସହାୟ':'🤖 Ask AI'}>
      <PrintHeader title="AI Advisory Log" userName={user?.name} />
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">{language==='or'?'କୃଷି AI ସହାୟ':'Agricultural AI Assistant'}</h2>
          <p className="section-sub">{language==='or'?'ଯଦି ଡେଟା ନ ଥାଏ, AI ସାହায୍ୟ ମଗନ୍ତୁ':'Ask when admin data is unavailable – ChatGPT powered'}</p>
        </div>
        <PrintBtn title="AI Advisory" />
      </div>

      <div className="grid-2 gap-24">
        <div>
          <div className="card mb-16">
            <div className="card-header"><span className="card-title">🤖 {language==='or'?'ପ୍ରଶ୍ନ କରନ୍ତୁ':'Ask a Question'}</span></div>
            <div className="card-body">
              <div className="form-group mb-12">
                <label className="form-label">{language==='or'?'ଫସଲ ନାମ (ଐଚ୍ଛିକ)':'Crop Name (optional)'}</label>
                <input className="form-input" placeholder="e.g. Rice, Tomato, Mustard" value={cropName} onChange={e=>setCropName(e.target.value)} />
              </div>
              <div className="form-group mb-14">
                <label className="form-label">{language==='or'?'ଆପଣଙ୍କ ପ୍ରଶ୍ନ':'Your Question'}</label>
                <textarea className="form-textarea" rows={4}
                  placeholder={language==='or'?'ଚାଷ ସମ୍ବନ୍ଧୀୟ ପ୍ରଶ୍ନ ଲିଖନ୍ତୁ...':'Type your farming question here...'}
                  value={question} onChange={e=>setQuestion(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && e.ctrlKey && ask()} />
                <div className="form-hint">Ctrl+Enter to send</div>
              </div>
              <button className="btn btn-ai btn-lg w-full" onClick={()=>ask()} disabled={loading||!question.trim()}>
                {loading ? '⏳ Thinking…' : `🤖 ${language==='or'?'ପ୍ରଶ୍ନ ପଠାନ୍ତୁ':'Ask AI'}`}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">⚡ {language==='or'?'ଦ୍ରୁତ ପ୍ରଶ୍ନ':'Quick Questions'}</span></div>
            <div className="card-body" style={{display:'flex',flexDirection:'column',gap:6}}>
              {QUICK.map(q => (
                <button key={q} className="btn btn-secondary btn-sm" style={{textAlign:'left',justifyContent:'flex-start'}}
                  onClick={()=>{setQuestion(q);ask(q);}}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          {(answer||loading) && (
            <div className="card mb-16">
              <div className="card-header">
                <span className="card-title">💡 {language==='or'?'AI ଉତ୍ତର':'AI Answer'}</span>
                {answer && <PrintBtn title="AI Answer" />}
              </div>
              <div className="card-body">
                {loading
                  ? <div style={{textAlign:'center',padding:30,color:'var(--earth)'}}>⏳ {language==='or'?'AI ଭাবୁଛି...':'AI is thinking…'}</div>
                  : <div className="ai-response" style={{whiteSpace:'pre-wrap'}}>{answer}</div>}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="card">
              <div className="card-header"><span className="card-title">📜 {language==='or'?'ଇତିହାସ':'History'}</span></div>
              <div className="card-body" style={{maxHeight:380,overflowY:'auto',display:'flex',flexDirection:'column',gap:10}}>
                {history.map((h,i) => (
                  <div key={i} style={{background:'var(--cream)',borderRadius:'var(--radius-sm)',padding:'10px 12px',cursor:'pointer'}}
                    onClick={()=>{setQuestion(h.q);setAnswer(h.a);}}>
                    <div style={{fontWeight:600,fontSize:'.82rem',marginBottom:3}}>Q: {h.q}</div>
                    <div style={{fontSize:'.76rem',color:'var(--earth)',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{h.a}</div>
                    <div style={{fontSize:'.68rem',color:'var(--clay)',marginTop:3}}>{h.t.toLocaleTimeString('en-IN')} {h.isMock?'· Mock':'· AI'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
