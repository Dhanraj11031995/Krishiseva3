import React, { useState, useEffect } from 'react';
import AppLayout from '../components/shared/AppLayout';
import { PrintBtn, PrintHeader, VoiceBtn, Spinner, EmptyState } from '../components/shared/UIKit';
import { useAuth, API } from '../context/AuthContext';

/* ── Mini Calendar ──────────────────────────────────────── */
function MiniCalendar({ onSelect, entries = [] }) {
  const [month, setMonth] = useState(new Date());
  const today  = new Date();
  const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dim    = d => new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
  const fd     = d => new Date(d.getFullYear(), d.getMonth(), 1).getDay();

  const hasEntry = day => entries.some(e => {
    const d = new Date(e.date || e.submittedAt);
    return d.getDate()===day && d.getMonth()===month.getMonth() && d.getFullYear()===month.getFullYear();
  });

  return (
    <div className="card">
      <div className="card-header">
        <button className="btn btn-sm btn-secondary" onClick={() => setMonth(d => new Date(d.getFullYear(), d.getMonth()-1))}>‹</button>
        <span style={{ fontWeight:700, fontSize:'.875rem' }}>{MONTHS[month.getMonth()]} {month.getFullYear()}</span>
        <button className="btn btn-sm btn-secondary" onClick={() => setMonth(d => new Date(d.getFullYear(), d.getMonth()+1))}>›</button>
      </div>
      <div className="card-body">
        <div className="calendar-grid mb-6">
          {DAYS.map(d => <div key={d} className="cal-header">{d}</div>)}
        </div>
        <div className="calendar-grid">
          {Array(fd(month)).fill(null).map((_,i) => <div key={`e${i}`} />)}
          {Array(dim(month)).fill(null).map((_,i) => {
            const day = i+1;
            const isToday    = today.getDate()===day && today.getMonth()===month.getMonth() && today.getFullYear()===month.getFullYear();
            const isHasEntry = hasEntry(day);
            const ds = `${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            return (
              <div key={day}
                className={`cal-day ${isToday?'today':''} ${isHasEntry?'has-data':''}`}
                title={isHasEntry ? 'Data recorded' : 'Click to enter data'}
                onClick={() => onSelect(ds)}>
                {day}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop:10, fontSize:'.7rem', color:'var(--earth)', display:'flex', gap:12 }}>
          <span>🟩 Today</span>
          <span style={{ background:'var(--straw)', padding:'1px 6px', borderRadius:4 }}>■ Has data</span>
        </div>
      </div>
    </div>
  );
}

const CAT_LABELS = {
  soil:        { en:'🌱 Soil Health',          or:'🌱 ମାଟି ସ୍ୱାସ୍ଥ୍ୟ'       },
  inputs:      { en:'🧪 Inputs Used',           or:'🧪 ଦିଆ ସାର ଓ ଔଷଧ'      },
  costs:       { en:'💰 Cost Analysis',          or:'💰 ଖର୍ଚ ହିସାବ'           },
  output:      { en:'🌾 Harvest & Output',       or:'🌾 ଅମଳ ଓ ଆୟ'            },
  observation: { en:'🔍 Observations',           or:'🔍 ପର୍ଯ୍ୟବେକ୍ଷଣ'         },
  notes:       { en:'📝 Notes',                  or:'📝 ଟିପ୍ପଣୀ'              },
  custom:      { en:'✨ Additional Queries',      or:'✨ ଅତିରିକ୍ତ ପ୍ରଶ୍ନ'      },
};

/* ══════════════════════════════════════════════════════════
   DATA ENTRY PAGE
   ══════════════════════════════════════════════════════════ */
export function DataEntryPage() {
  const { language, user } = useAuth();
  const [places,    setPlaces]    = useState([]);
  const [queries,   setQueries]   = useState([]);
  const [entries,   setEntries]   = useState([]);
  const [selPlace,  setSelPlace]  = useState('');
  const [selPlot,   setSelPlot]   = useState('');
  const [selDate,   setSelDate]   = useState('');
  const [formData,  setFormData]  = useState({});
  const [showForm,  setShowForm]  = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [gFormCfg,  setGFormCfg]  = useState(null);

  useEffect(() => {
    API.get('/places').then(r => setPlaces(r.data)).catch(() => {});
    API.get('/form-queries').then(r => setQueries(r.data)).catch(() => {});
    API.get('/field-data').then(r => setEntries(r.data)).catch(() => {});
    API.get('/google-form').then(r => setGFormCfg(r.data)).catch(() => {});
  }, []);

  const plots        = places.find(p => p.id === selPlace)?.plots || [];
  const selPlotData  = plots.find(p => p.id === selPlot);
  const selPlaceData = places.find(p => p.id === selPlace);

  const handleDateSelect = date => {
    setSelDate(date);
    if (selPlot) { setShowForm(true); setFormData({}); setSubmitted(null); }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const r = await API.post('/field-data', {
        placeId: selPlace, placeName: selPlaceData?.name,
        plotId: selPlot, plotName: selPlotData?.name,
        crop: selPlotData?.crop, cropCategory: selPlotData?.cropCategory,
        date: selDate, ...formData,
      });
      setEntries(prev => [r.data, ...prev]);
      setSubmitted(r.data);
      setShowForm(false);
    } catch(e) { alert('Submission failed.'); }
    finally { setLoading(false); }
  };

  const grouped = queries.reduce((acc, q) => {
    const cat = q.category || 'custom';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(q);
    return acc;
  }, {});

  const setField = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));

  return (
    <AppLayout title={language === 'or' ? '📋 ତଥ୍ୟ ପ୍ରବେଶ' : '📋 Field Data Entry'}>
      <PrintHeader title="Field Data Entry" userName={user?.name} />
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">{language === 'or' ? 'ମାଠ ତଥ୍ୟ ଦର୍ଜ' : 'Record Field Observations'}</h2>
          <p className="section-sub">{language === 'or' ? 'ସ୍ଥାନ → ଜମି → ତାରିଖ ଚୟନ ଓ ଫର୍ମ ପୂରଣ' : 'Select place → plot → date, then fill the data form'}</p>
        </div>
        <VoiceBtn message={language === 'or' ? 'ଦୟାକରି ଆପଣଙ୍କ ମାଠ ତଥ୍ୟ ଭରନ୍ତୁ' : 'Please fill your field data form'} />
      </div>

      {submitted && (
        <div className="alert alert-success mb-20">
          ✅ {language === 'or' ? 'ତଥ୍ୟ ସଫଳତାର ସହ ଦଖଲ ହୋଇଛି!' : 'Data submitted successfully!'}
          <button className="btn btn-sm btn-primary" style={{ marginLeft:'auto' }}
            onClick={() => { setSubmitted(null); setShowForm(false); }}>
            + {language === 'or' ? 'ନୂଆ ଏଣ୍ଟ୍ରି' : 'New Entry'}
          </button>
        </div>
      )}

      {/* Step 1 */}
      <div className="card mb-20">
        <div className="card-header">
          <span className="card-title">Step 1 — {language === 'or' ? 'ସ୍ଥାନ ଓ ଜମି ଚୟନ' : 'Select Place & Plot'}</span>
        </div>
        <div className="card-body">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">📍 {language === 'or' ? 'ସ୍ଥାନ' : 'Place'}</label>
              <select className="form-select" value={selPlace}
                onChange={e => { setSelPlace(e.target.value); setSelPlot(''); setShowForm(false); setSubmitted(null); }}>
                <option value="">{language === 'or' ? '-- ସ୍ଥାନ ଚୟନ --' : '-- Select Place --'}</option>
                {places.map(p => <option key={p.id} value={p.id}>{p.name} ({p.district})</option>)}
              </select>
            </div>
            {selPlace && (
              <div className="form-group">
                <label className="form-label">🌾 {language === 'or' ? 'ଜମି / ଫସଲ' : 'Plot / Crop'}</label>
                <select className="form-select" value={selPlot}
                  onChange={e => { setSelPlot(e.target.value); setShowForm(false); setSubmitted(null); }}>
                  <option value="">{language === 'or' ? '-- ଜମି ଚୟନ --' : '-- Select Plot --'}</option>
                  {plots.map(pl => <option key={pl.id} value={pl.id}>{pl.name} – {pl.crop} ({pl.area} ac)</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Form option */}
      {gFormCfg?.url && selPlot && (
        <div className="alert alert-info mb-16">
          📋 {language === 'or' ? 'Google Form ମাধ୍ୟমରେ ମଧ୍ୟ ତଥ୍ୟ ଦଖଲ କରି ହେବ:' : 'You can also submit via Google Form:'}
          <a href={gFormCfg.url} target="_blank" rel="noopener noreferrer" className="btn btn-sky btn-sm" style={{ marginLeft: 12 }}>
            🔗 {language === 'or' ? 'Google Form ଖୋଲ' : 'Open Google Form'}
          </a>
        </div>
      )}

      {/* Step 2: Calendar + Form */}
      {selPlot && (
        <div className="grid-2 gap-24">
          <div>
            <div style={{ fontWeight:700, fontSize:'.78rem', textTransform:'uppercase', letterSpacing:'.5px', color:'var(--soil-mid)', marginBottom:10 }}>
              Step 2 — {language === 'or' ? 'ତାରିଖ ଚୟନ' : 'Select a Date'}
            </div>
            <MiniCalendar
              onSelect={handleDateSelect}
              entries={entries.filter(e => e.plotId === selPlot)}
            />
          </div>

          <div>
            {selDate && !showForm && !submitted && (
              <div className="card">
                <div className="card-body text-center" style={{ padding:'40px 24px' }}>
                  <div style={{ fontSize:'3rem', marginBottom:12 }}>📅</div>
                  <div style={{ fontWeight:700, fontSize:'1.05rem', marginBottom:6 }}>
                    {language === 'or' ? 'ଚୟନ ହୋଇଛି' : 'Selected'}: {selDate}
                  </div>
                  <div style={{ color:'var(--earth)', marginBottom:20, fontSize:'.855rem' }}>
                    {selPlaceData?.name} · {selPlotData?.name} · {selPlotData?.crop}
                  </div>
                  <button className="btn btn-primary btn-lg" onClick={() => setShowForm(true)}>
                    📝 {language === 'or' ? 'ଫର୍ମ ଖୋଲ' : 'Open Data Form'}
                  </button>
                </div>
              </div>
            )}

            {showForm && (
              <div className="card">
                <div className="card-header">
                  <span className="card-title">📝 {language === 'or' ? 'ଫସଲ ତଥ୍ୟ ଫର୍ମ' : 'Field Data Form'}</span>
                  <span style={{ fontSize:'.78rem', color:'var(--earth)' }}>📅 {selDate} · {selPlotData?.crop}</span>
                </div>
                <div className="card-body" style={{ maxHeight:520, overflowY:'auto' }}>
                  {Object.entries(grouped).map(([cat, qs]) => (
                    <div key={cat} className="mb-20">
                      <h4 style={{ fontWeight:700, fontSize:'.82rem', color:'var(--leaf)', marginBottom:12, paddingBottom:6, borderBottom:'1px solid var(--straw)' }}>
                        {language === 'or' ? CAT_LABELS[cat]?.or || cat : CAT_LABELS[cat]?.en || cat}
                      </h4>
                      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                        {qs.map(q => (
                          <div key={q.id} className="form-group">
                            <label className="form-label">
                              {language === 'or' && q.labelOr ? q.labelOr : q.label}
                              {q.unit && <span className="form-label-or">({q.unit})</span>}
                            </label>
                            {q.type === 'select' ? (
                              <select className="form-select" value={formData[q.field]||''}
                                onChange={e => setField(q.field, e.target.value)}>
                                <option value="">-- {language === 'or' ? 'ଚୟନ' : 'Select'} --</option>
                                {(q.options||[]).map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                            ) : q.type === 'textarea' ? (
                              <textarea className="form-textarea" placeholder={q.placeholder}
                                value={formData[q.field]||''} onChange={e => setField(q.field, e.target.value)} />
                            ) : (
                              <input className="form-input" type={q.type||'text'} placeholder={q.placeholder}
                                value={formData[q.field]||''} onChange={e => setField(q.field, e.target.value)} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:'14px 20px', display:'flex', gap:10, justifyContent:'flex-end', borderTop:'1px solid var(--straw)' }}>
                  <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
                    {language === 'or' ? 'ବାତିଲ' : 'Cancel'}
                  </button>
                  <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
                    {loading ? '⏳ Saving…' : `✅ ${language==='or'?'ଦଖଲ କରନ୍ତୁ':'Submit Data'}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

/* ══════════════════════════════════════════════════════════
   MY FIELD DATA
   ══════════════════════════════════════════════════════════ */
export function MyDataPage() {
  const { language, user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [filter,  setFilter]  = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/field-data').then(r => setEntries(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter(e =>
    !filter ||
    e.placeName?.toLowerCase().includes(filter.toLowerCase()) ||
    e.crop?.toLowerCase().includes(filter.toLowerCase())
  );

  const totalRevenue = filtered.reduce((s, e) => s + (Number(e.totalRevenue)||0), 0);

  return (
    <AppLayout title={language === 'or' ? '📊 ମୋ ଫିଲ୍ଡ ଡାଟା' : '📊 My Field Data'}>
      <PrintHeader title="My Field Data Records" userName={user?.name} />
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">{language === 'or' ? 'ଦଖଲ ତଥ୍ୟ ତାଲିକା' : 'Submitted Field Records'}</h2>
          <p className="section-sub">
            {entries.length} {language === 'or' ? 'ଏଣ୍ଟ୍ରି' : 'entries'} &nbsp;·&nbsp;
            {language === 'or' ? 'ମୋଟ ଆୟ' : 'Total revenue'}: ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex gap-8 no-print">
          <input className="form-input" style={{ width:200 }}
            placeholder={language === 'or' ? 'ଖୋଜ...' : 'Filter by place/crop…'}
            value={filter} onChange={e => setFilter(e.target.value)} />
          <PrintBtn title="My Field Data" />
        </div>
      </div>

      {loading ? <Spinner /> : (
        filtered.length ? (
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead><tr>
                  <th>{language==='or'?'ତାରିଖ':'Date'}</th>
                  <th>{language==='or'?'ସ୍ଥାନ':'Place'}</th>
                  <th>{language==='or'?'ଜମି':'Plot'}</th>
                  <th>{language==='or'?'ଫସଲ':'Crop'}</th>
                  <th>pH</th>
                  <th>{language==='or'?'ଅମଳ (qtl)':'Harvest'}</th>
                  <th>{language==='or'?'ଆୟ (₹)':'Revenue'}</th>
                  <th>{language==='or'?'ସାର ପ୍ରକାର':'Nutrition'}</th>
                </tr></thead>
                <tbody>
                  {filtered.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontSize:'.78rem' }}>{new Date(e.submittedAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontSize:'.82rem' }}>{e.placeName}</td>
                      <td style={{ fontSize:'.82rem' }}>{e.plotName}</td>
                      <td><span className="badge badge-green">{e.crop}</span></td>
                      <td>{e.soilPH||'–'}</td>
                      <td>{e.harvestAmount||'–'}</td>
                      <td style={{ fontWeight:700, color:'var(--leaf)' }}>
                        {e.totalRevenue ? `₹${Number(e.totalRevenue).toLocaleString('en-IN')}` : '–'}
                      </td>
                      <td>
                        <span className={`badge ${e.nutritionType==='Organic'?'badge-green':'badge-amber'}`}>
                          {e.nutritionType||'–'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState icon="📋" text="No field data recorded yet." textOr="ଏ ପର୍ଯ୍ୟନ୍ତ ତଥ୍ୟ ଦଖଲ ନାହିଁ।" />
        )
      )}
    </AppLayout>
  );
}

/* ══════════════════════════════════════════════════════════
   E-COMMERCE PAGE
   ══════════════════════════════════════════════════════════ */
const SECTIONS = [
  { key:'landPreparation', icon:'🚜', labelEn:'Land Preparation', labelOr:'ଭୂ ପ୍ରସ୍ତୁତି' },
  { key:'nutrients',       icon:'🌿', labelEn:'Nutrient Inputs',  labelOr:'ପୋଷକ ସାର'     },
  { key:'plantProtection', icon:'💊', labelEn:'Plant Protection', labelOr:'ଉଦ୍ଭିଦ ସୁରକ୍ଷା'},
  { key:'implements',      icon:'⚙️', labelEn:'Agri Implements',  labelOr:'କୃଷି ଉପକରଣ'   },
];
const PAY_METHODS = [
  { key:'cod',    label:'Cash on Delivery', icon:'💵' },
  { key:'upi',    label:'UPI',              icon:'📱' },
  { key:'credit', label:'Credit Card',      icon:'💳' },
  { key:'debit',  label:'Debit Card',       icon:'🏧' },
];
const BANKS = ['SBI','PNB','Bank of Baroda','Canara Bank','UCO Bank','HDFC Bank','ICICI Bank','Axis Bank'];

export function EcommercePage() {
  const { language, user, isSubscribed } = useAuth();
  const [products,    setProducts]    = useState({});
  const [activeTab,   setActiveTab]   = useState('landPreparation');
  const [cart,        setCart]        = useState([]);
  const [checkout,    setCheckout]    = useState(false);
  const [payment,     setPayment]     = useState('');
  const [bank,        setBank]        = useState('');
  const [upiId,       setUpiId]       = useState('');
  const [orderOk,     setOrderOk]     = useState(null);
  const [loading,     setLoading]     = useState(false);

  useEffect(() => {
    if (isSubscribed()) {
      API.get('/products').then(r => setProducts(r.data)).catch(() => {});
    }
  }, []); // eslint-disable-line

  if (!isSubscribed()) return (
  <AppLayout title={language==='or'?'🛒 ଇ-ବାଣିଜ୍ୟ':'🛒 E-Commerce'}>
    <div>Please subscribe to access this feature.</div>
  </AppLayout>
  );

  const addToCart = p => setCart(prev => {
    const ex = prev.find(i => i.id===p.id);
    return ex ? prev.map(i => i.id===p.id ? {...i,qty:i.qty+1} : i) : [...prev,{...p,qty:1}];
  });
  const removeFromCart = id => setCart(prev => prev.filter(i => i.id!==id));
  const updateQty = (id, qty) => qty<1 ? removeFromCart(id) : setCart(prev => prev.map(i => i.id===id?{...i,qty}:i));

  const total     = cart.reduce((s,i) => s+i.price*i.qty, 0);
  const cartCount = cart.reduce((s,i) => s+i.qty, 0);

  const placeOrder = async () => {
    setLoading(true);
    try {
      const r = await API.post('/orders', {
        items: cart, totalAmount: total,
        paymentMethod: PAY_METHODS.find(p=>p.key===payment)?.label || payment,
        bank: bank||undefined, upiId: upiId||undefined,
      });
      setOrderOk(r.data); setCart([]); setCheckout(false); setPayment('');
    } catch(e) { alert('Order failed'); }
    finally { setLoading(false); }
  };

  const canOrder = () => {
    if (!payment) return false;
    if (payment==='upi' && !upiId.trim()) return false;
    if ((payment==='credit'||payment==='debit') && !bank) return false;
    return true;
  };

  const items = products[activeTab] || [];

  return (
    <AppLayout title={language==='or'?'🛒 ଇ-ବାଣିଜ୍ୟ ପୋର୍ଟାଲ':'🛒 E-Commerce Portal'}>
      <PrintHeader title="E-Commerce Orders" userName={user?.name} />
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">{language==='or'?'କୃଷି ଉତ୍ପାଦ ଦୋକାନ':'Agricultural Products Store'}</h2>
          <p className="section-sub">{language==='or'?'ଫାର୍ମ ଇନ୍‌ପୁଟ, ଉପକରଣ ଓ ସେବା ଅର୍ଡର':'Order farm inputs, implements and services'}</p>
        </div>
        <div className="flex gap-10 no-print">
          <VoiceBtn message={language==='or'?'ଇ-ବାଣିଜ୍ୟ ପୋର୍ଟାଲରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ':'Welcome to agricultural e-commerce'} />
          {cart.length>0 && (
            <button className="btn btn-harvest" onClick={() => setCheckout(true)}>
              🛒 {language==='or'?'ଟୋକେଇ':'Cart'} ({cartCount}) · ₹{total.toLocaleString('en-IN')}
            </button>
          )}
        </div>
      </div>

      {orderOk && (
        <div className="alert alert-success mb-16">
          ✅ {language==='or'?'ଅର୍ଡର ସଫଳ!':'Order placed!'} ID: <strong>{orderOk.orderId}</strong>
          &nbsp;·&nbsp;{language==='or'?'2-5 ଦିନ ଡେଲିଭରି':'Delivery in 2-5 days'}
          <button style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem' }}
            onClick={() => setOrderOk(null)}>×</button>
        </div>
      )}

      <div className="platform-tabs">
        {SECTIONS.map(s => (
          <button key={s.key} className={`platform-tab ${activeTab===s.key?'active':''}`}
            onClick={() => setActiveTab(s.key)}>
            {s.icon} {language==='or'?s.labelOr:s.labelEn}
          </button>
        ))}
      </div>

      <div className="grid-4">
        {items.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-emoji">{product.image}</div>
            <div className="product-info">
              <div className="product-name">{product.name}</div>
              <div>
                <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
                <span style={{ fontSize:'.72rem', color:'var(--earth)' }}> / {product.unit}</span>
              </div>
              <div className="product-desc">{product.description}</div>
              <div className="product-delivery">🚚 {language==='or'?'ଡେଲିଭରି':'Delivery'}: {product.delivery}</div>
              <button className="btn btn-primary w-full mt-16 btn-sm" onClick={() => addToCart(product)}>
                + {language==='or'?'ଟୋକେଇରେ ଯୋଡ଼':'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
        {items.length===0 && (
          <div className="empty-state" style={{ gridColumn:'1/-1' }}>
            <div className="ei">🛒</div><div>Loading products…</div>
          </div>
        )}
      </div>

      {/* Checkout modal */}
      {checkout && (
        <div className="modal-overlay" onClick={() => setCheckout(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">🛒 {language==='or'?'ଚେକଆଉଟ':'Checkout'}</span>
              <button className="modal-close" onClick={() => setCheckout(false)}>×</button>
            </div>
            <div className="modal-body">
              <h4 style={{ marginBottom:12 }}>{language==='or'?'ଟୋକେଇ ସାମଗ୍ରୀ':'Cart Items'}</h4>
              {cart.map(item => (
                <div key={item.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0', borderBottom:'1px solid var(--straw)' }}>
                  <span style={{ fontSize:'1.5rem' }}>{item.image}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'.875rem' }}>{item.name}</div>
                    <div style={{ fontSize:'.78rem', color:'var(--earth)' }}>
                      ₹{item.price.toLocaleString('en-IN')} × {item.qty} = <strong>₹{(item.price*item.qty).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <button className="btn btn-sm btn-secondary" onClick={() => updateQty(item.id,item.qty-1)}>−</button>
                    <span style={{ padding:'4px 10px', fontWeight:700 }}>{item.qty}</span>
                    <button className="btn btn-sm btn-secondary" onClick={() => updateQty(item.id,item.qty+1)}>+</button>
                    <button className="btn btn-sm btn-danger" onClick={() => removeFromCart(item.id)}>🗑</button>
                  </div>
                </div>
              ))}
              <div style={{ textAlign:'right', fontFamily:'var(--font-display)', fontSize:'1.4rem', marginTop:12, color:'var(--harvest)' }}>
                {language==='or'?'ମୋଟ':'Total'}: ₹{total.toLocaleString('en-IN')}
              </div>
              <div className="divider" />
              <h4 style={{ marginBottom:12 }}>{language==='or'?'ଭୁଗତାନ ପ୍ରଣାଳୀ':'Payment Method'}</h4>
              <div className="chip-group mb-16">
                {PAY_METHODS.map(m => (
                  <button key={m.key} className={`chip ${payment===m.key?'active':''}`}
                    onClick={() => { setPayment(m.key); setBank(''); setUpiId(''); }}>
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
              {payment==='upi' && (
                <div className="form-group mb-14">
                  <label className="form-label">UPI ID</label>
                  <input className="form-input" placeholder="yourname@sbi" value={upiId} onChange={e=>setUpiId(e.target.value)} />
                </div>
              )}
              {(payment==='credit'||payment==='debit') && (
                <div className="form-group mb-14">
                  <label className="form-label">{language==='or'?'ବ୍ୟାଙ୍କ ଚୟନ':'Select Bank'}</label>
                  <select className="form-select" value={bank} onChange={e=>setBank(e.target.value)}>
                    <option value="">-- {language==='or'?'ବ୍ୟାଙ୍କ ଚୟନ':'Select Bank'} --</option>
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}
              {payment==='cod' && (
                <div className="alert alert-info">💵 {language==='or'?'ଡେଲିଭରି ସମୟ ଅର୍ଥ ଦିଅ':'Pay cash when delivered to your farm.'}</div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCheckout(false)}>
                {language==='or'?'ବାତିଲ':'Cancel'}
              </button>
              <button className="btn btn-harvest btn-lg" onClick={placeOrder} disabled={!canOrder()||loading}>
                {loading ? '⏳…' : `✅ ${language==='or'?'ଅର୍ଡର ଦିଅ':'Place Order'} — ₹${total.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

/* ══════════════════════════════════════════════════════════
   MY ORDERS
   ══════════════════════════════════════════════════════════ */
export function MyOrdersPage() {
  const { language, user } = useAuth();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders').then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalSpent = orders.reduce((s,o) => s+(Number(o.totalAmount)||0), 0);

  return (
    <AppLayout title={language==='or'?'📦 ମୋ ଅର୍ଡର':'📦 My Orders'}>
      <PrintHeader title="My Orders" userName={user?.name} />
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">{language==='or'?'ଅର୍ଡର ଇତିହାସ':'Order History'}</h2>
          <p className="section-sub">
            {orders.length} {language==='or'?'ଅର୍ଡର':'orders'} &nbsp;·&nbsp;
            {language==='or'?'ମୋଟ ଖର୍ଚ':'Total'}: ₹{totalSpent.toLocaleString('en-IN')}
          </p>
        </div>
        <PrintBtn title="My Orders" />
      </div>

      {loading ? <Spinner /> : (
        orders.length ? orders.map(order => (
          <div key={order.id} className="card mb-14">
            <div className="card-header">
              <div>
                <span style={{ fontFamily:'monospace', fontWeight:700 }}>{order.orderId}</span>
                <span style={{ marginLeft:12, fontSize:'.78rem', color:'var(--earth)' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex gap-8">
                <span className="badge badge-green">{order.status}</span>
                <span className="badge badge-blue">{order.paymentMethod}</span>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
                {order.items?.map(item => (
                  <div key={item.id} style={{ display:'flex', alignItems:'center', gap:8, background:'var(--cream)', padding:'6px 10px', borderRadius:'var(--radius-sm)', fontSize:'.82rem' }}>
                    <span>{item.image}</span>
                    <span>{item.name}</span>
                    <span style={{ color:'var(--earth)' }}>×{item.qty}</span>
                    <strong>₹{(item.price*item.qty).toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>
              <div className="flex-between">
                <span style={{ fontSize:'.78rem', color:'var(--earth)' }}>🚚 {language==='or'?'ଡେଲିଭରି 2-5 ଦିନ':'Delivery: 2-5 business days'}</span>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', color:'var(--harvest)' }}>
                  ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )) : (
          <EmptyState icon="📦" text="No orders yet. Visit E-Commerce to shop." textOr="ଅର୍ଡର ନାହିଁ। ଇ-ବାଣିଜ୍ୟ ପୋର୍ଟାଲ ଦେଖନ୍ତୁ।" />
        )
      )}
    </AppLayout>
  );
}
