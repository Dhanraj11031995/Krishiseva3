import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '../components/shared/AppLayout';
import { PrintBtn, PrintHeader, SubWall, VoiceBtn, Spinner, EmptyState } from '../components/shared/UIKit';
import { useAuth, API } from '../context/AuthContext';

// ── shared crop selector ────────────────────────────────────
function CropSelector({ onSelect }) {
  const { language } = useAuth();
  const [categories, setCategories] = useState({});
  const [selCat,  setSelCat]  = useState('');
  const [selCrop, setSelCrop] = useState('');

  useEffect(() => { API.get('/master/crops').then(r => setCategories(r.data)).catch(() => {}); }, []);

  const crops = selCat ? (categories[selCat]?.crops || []) : [];

  const handleCrop = (crop) => {
    setSelCrop(crop.id);
    onSelect(selCat, crop);
  };

  return (
    <div>
      <div className="mb-16">
        <p className="form-label mb-8">
          {language === 'or' ? '1. ଫସଲ ଶ୍ରେଣୀ ଚୟନ' : '1. Select Crop Category'}
        </p>
        <div className="grid-5" style={{ gap: 10 }}>
          {Object.entries(categories).map(([key, cat]) => (
            <div key={key} className={`cat-card ${selCat === key ? 'active' : ''}`}
              onClick={() => { setSelCat(key); setSelCrop(''); onSelect('', null); }}>
              <div className="cat-icon">{cat.icon}</div>
              <div className="cat-label">{language === 'or' ? cat.labelOr : cat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {selCat && (
        <div className="mb-20">
          <p className="form-label mb-8">
            {language === 'or' ? '2. ଫସଲ ଚୟନ' : '2. Select Crop'}
            <span style={{ color: 'var(--clay)', fontWeight: 400, marginLeft: 8 }}>
              ({language === 'or' ? categories[selCat]?.labelOr : categories[selCat]?.label})
            </span>
          </p>
          <div className="chip-group">
            {crops.map(crop => (
              <button key={crop.id}
                className={`crop-pill ${selCrop === crop.id ? 'active' : ''}`}
                onClick={() => handleCrop(crop)}>
                {language === 'or' ? crop.nameOr : crop.name}
                {language === 'en' && crop.nameOr && (
                  <span className="or-name">· {crop.nameOr}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── no data panel with AI fallback ─────────────────────────
function NoDataPanel({ cropName, section, language, navigate }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 24px', background: 'var(--cream)', borderRadius: 'var(--radius)', border: '2px dashed var(--straw)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
      <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>
        {language === 'or' ? 'ତଥ୍ୟ ଉପଲବ୍ଧ ନାହିଁ' : 'No Data Available'}
      </h4>
      <p style={{ color: 'var(--earth)', fontSize: '.855rem', marginBottom: 20 }}>
        {language === 'or'
          ? `Admin ଅଦ୍ୟାବଧି ${cropName} ପାଇଁ ${section} ତଥ୍ୟ ଯୋଗ କରି ନାହାନ୍ତି।`
          : `Admin has not added ${section} data for ${cropName} yet.`}
      </p>
      <div className="flex-center gap-12" style={{ justifyContent: 'center' }}>
        <button className="btn btn-ai" onClick={() => navigate('/ask-ai')}>
          🤖 {language === 'or' ? 'AI ଙ୍କୁ ପ୍ରଶ୍ନ କରନ୍ତୁ' : 'Ask AI Instead'}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  1. CULTIVATION PAGE
// ══════════════════════════════════════════════════════════
export function CultivationPage() {
  const { language, user } = useAuth();
  const { isSubscribed } = useAuth();
  const navigate = require('react-router-dom').useNavigate();
  const [selCat,  setSelCat]  = useState('');
  const [selCrop, setSelCrop] = useState(null);
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isSubscribed()) return (
    <AppLayout title={language === 'or' ? '🌾 ଚାଷ ପ୍ରଣାଳୀ' : '🌾 Cultivation'}>
      <SubWall feature={language === 'or' ? 'ଚାଷ ପ୍ରଣାଳୀ' : 'Cultivation Practices'} />
    </AppLayout>
  );

  const handleSelect = (cat, crop) => {
    setSelCat(cat); setSelCrop(crop);
    if (!crop) { setData([]); return; }
    setLoading(true);
    API.get(`/cultivation?cropId=${crop.id}&cropCategory=${cat}`)
      .then(r => setData(r.data)).catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  const catColor = c => ({ field_prep:'var(--earth)', sowing:'var(--leaf)', planting:'var(--leaf-bright)', nutrition:'var(--sky)', weed_mgmt:'var(--sun)', pest_mgmt:'var(--danger)', irrigation:'var(--sky-light)', harvest:'var(--harvest)' }[c] || 'var(--clay)');

  return (
    <AppLayout title={language === 'or' ? '🌾 ଚାଷ ପ୍ରଣାଳୀ' : '🌾 Cultivation Practices'}>
      <PrintHeader title={`Cultivation – ${selCrop ? (language === 'or' ? selCrop.nameOr : selCrop.name) : ''}`} userName={user?.name} />
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">{language === 'or' ? 'ଚାଷ ପ୍ରଣାଳୀ' : 'Cultivation Practices'}</h2>
          <p className="section-sub">{language === 'or' ? 'ଫସଲ ଶ୍ରେଣୀ ଓ ଫସଲ ଚୟନ କରନ୍ତୁ' : 'Select crop category and crop to view cultivation guide'}</p>
        </div>
        <div className="flex gap-8 no-print">
          {selCrop && <PrintBtn title={`Cultivation – ${selCrop.name}`} />}
          <VoiceBtn message={language === 'or' ? 'ଏଠାରେ ଆପଣ ଚାଷ ପ୍ରଣାଳୀ ଦେଖି ପାରିବେ' : 'View cultivation practices here'} />
        </div>
      </div>

      <CropSelector onSelect={handleSelect} />

      {loading && <Spinner />}

      {!loading && selCrop && data.length > 0 && data.map(entry => (
        <div key={entry.id} className="card mb-16">
          <div className="card-header">
            <span className="card-title">
              📋 {language === 'or' ? selCrop.nameOr : selCrop.name}
              {entry.season && <span className="badge badge-amber" style={{ marginLeft: 10 }}>{entry.season}</span>}
            </span>
          </div>
          <div className="card-body">
            {entry.adminNotes && (
              <div className="highlight-box mb-16">
                <strong>📝 {language === 'or' ? 'ଟିପ୍ପଣୀ' : 'Notes'}:</strong> {entry.adminNotes}
              </div>
            )}
            {entry.stages && Array.isArray(entry.stages) && (
              <div className="timeline">
                {entry.stages.map((stage, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" style={{ borderColor: catColor(stage.category), color: catColor(stage.category) }}>
                      {i + 1}
                    </div>
                    <div className="timeline-content">
                      <div style={{ fontWeight: 700, fontSize: '.875rem', color: catColor(stage.category) }}>
                        {language === 'or' && stage.activityOr ? stage.activityOr : stage.activity}
                        {stage.week && <span style={{ marginLeft: 8, fontSize: '.75rem', color: 'var(--earth)' }}>Week {stage.week}</span>}
                      </div>
                      <div style={{ fontSize: '.82rem', color: 'var(--earth)', marginTop: 4 }}>
                        {language === 'or' && stage.detailsOr ? stage.detailsOr : stage.details}
                      </div>
                      {stage.dose && <div style={{ fontSize: '.78rem', color: 'var(--sky)', marginTop: 3 }}>📊 {stage.dose}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {!loading && selCrop && data.length === 0 && (
        <NoDataPanel cropName={language === 'or' ? selCrop.nameOr : selCrop.name} section="cultivation" language={language} navigate={navigate} />
      )}
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════
//  2. NUTRIENT MANAGEMENT PAGE
// ══════════════════════════════════════════════════════════
export function NutrientsPage() {
  const { language, user, isSubscribed } = useAuth();
  const navigate = require('react-router-dom').useNavigate();
  const [selCat,  setSelCat]  = useState('');
  const [selCrop, setSelCrop] = useState(null);
  const [type,    setType]    = useState('');
  const [stage,   setStage]   = useState('');
  const [stages,  setStages]  = useState([]);
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { API.get('/master/stages').then(r => setStages(r.data)).catch(() => {}); }, []);

  if (!isSubscribed()) return (
    <AppLayout title={language === 'or' ? '🧪 ପୋଷକ ପ୍ରବନ୍ଧନ' : '🧪 Nutrients'}>
      <SubWall feature={language === 'or' ? 'ପୋଷକ ପ୍ରବନ୍ଧନ' : 'Nutrient Management'} />
    </AppLayout>
  );

  const handleSelect = (cat, crop) => { setSelCat(cat); setSelCrop(crop); setData([]); setType(''); };

  const loadData = (t, s) => {
    const tp = t || type;
    const st = s || stage;
    if (!selCrop || !tp) return;
    setLoading(true);
    const q = `/nutrients?cropId=${selCrop.id}&cropCategory=${selCat}&type=${tp}${st ? `&stage=${st}` : ''}`;
    API.get(q).then(r => setData(r.data)).catch(() => setData([])).finally(() => setLoading(false));
  };

  return (
    <AppLayout title={language === 'or' ? '🧪 ପୋଷକ ପ୍ରବନ୍ଧନ' : '🧪 Nutrient Management'}>
      <PrintHeader title={`Nutrients – ${selCrop ? (language === 'or' ? selCrop.nameOr : selCrop.name) : ''}`} userName={user?.name} />
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">{language === 'or' ? 'ପୋଷକ ସୁପାରିଶ' : 'Nutrient Recommendations'}</h2>
          <p className="section-sub">{language === 'or' ? 'ଜୈବ ଓ ରାସାୟନିକ ସୁପାରିଶ, ଅବସ୍ଥା ଅନୁଯାୟୀ' : 'Organic & chemical recommendations by crop growth stage'}</p>
        </div>
        <div className="flex gap-8 no-print">
          {data.length > 0 && <PrintBtn title={`Nutrients – ${selCrop?.name}`} />}
          <VoiceBtn message={language === 'or' ? 'ଏଠାରେ ପୋଷକ ସୁପାରିଶ ଦେଖନ୍ତୁ' : 'View nutrient recommendations'} />
        </div>
      </div>

      <CropSelector onSelect={handleSelect} />

      {selCrop && (
        <>
          <div className="grid-2 mb-16">
            <div>
              <p className="form-label mb-8">{language === 'or' ? 'ସାର ପ୍ରକାର' : 'Fertilizer Type'}</p>
              <div className="chip-group">
                {['chemical', 'organic'].map(t => (
                  <button key={t} className={`chip ${type === t ? 'active' : ''}`}
                    onClick={() => { setType(t); loadData(t, stage); }}>
                    {t === 'chemical' ? `🧪 ${language === 'or' ? 'ରାସାୟନିକ' : 'Chemical'}` : `🌿 ${language === 'or' ? 'ଜୈବ' : 'Organic'}`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="form-label mb-8">{language === 'or' ? 'ଅବସ୍ଥା (ଐଚ୍ଛିକ)' : 'Growth Stage (optional)'}</p>
              <select className="form-select" value={stage} onChange={e => { setStage(e.target.value); loadData(type, e.target.value); }}>
                <option value="">{language === 'or' ? '-- ସମସ୍ତ ଅବସ୍ଥା --' : '-- All Stages --'}</option>
                {stages.map(s => <option key={s.id} value={s.id}>{language === 'or' ? s.labelOr : s.label}</option>)}
              </select>
            </div>
          </div>

          {loading && <Spinner />}

          {!loading && data.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">
                  {type === 'chemical' ? '🧪' : '🌿'} {language === 'or' ? (selCrop.nameOr || selCrop.name) : selCrop.name}
                  {' – '}{type === 'chemical' ? (language === 'or' ? 'ରାସାୟନିକ' : 'Chemical') : (language === 'or' ? 'ଜୈବ' : 'Organic')}
                </span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr>
                    <th>{language === 'or' ? 'ପୋଷକ' : 'Nutrient'}</th>
                    <th>{language === 'or' ? 'ଉତ୍ପାଦ' : 'Product'}</th>
                    <th>{language === 'or' ? 'ମାତ୍ରା' : 'Dose'}</th>
                    <th>{language === 'or' ? 'ଅବସ୍ଥା' : 'Stage'}</th>
                    <th>{language === 'or' ? 'ସମୟ / ପ୍ରଣାଳୀ' : 'Timing / Method'}</th>
                    <th>{language === 'or' ? 'ଖର୍ଚ (₹)' : 'Cost (₹)'}</th>
                  </tr></thead>
                  <tbody>
                    {data.map((r, i) => (
                      <tr key={i}>
                        <td><strong>{language === 'or' && r.nutrientOr ? r.nutrientOr : r.nutrient}</strong></td>
                        <td style={{ fontSize: '.82rem' }}>{r.product}</td>
                        <td><span className="badge badge-green">{r.dose}</span></td>
                        <td><span className="badge badge-blue">{r.stage || '—'}</span></td>
                        <td style={{ fontSize: '.78rem' }}>{r.timing || r.method || '—'}</td>
                        <td>{r.cost ? `₹${r.cost}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!loading && type && data.length === 0 && (
            <NoDataPanel cropName={language === 'or' ? selCrop.nameOr : selCrop.name} section="nutrient" language={language} navigate={navigate} />
          )}
        </>
      )}
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════
//  3. PLANT PROTECTION PAGE
// ══════════════════════════════════════════════════════════
export function ProtectionPage() {
  const { language, user, isSubscribed } = useAuth();
  const navigate = require('react-router-dom').useNavigate();
  const [selCat,     setSelCat]     = useState('');
  const [selCrop,    setSelCrop]    = useState(null);
  const [type,       setType]       = useState('');
  const [pestCat,    setPestCat]    = useState('');
  const [pestCats,   setPestCats]   = useState({});
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => { API.get('/master/pests').then(r => setPestCats(r.data)).catch(() => {}); }, []);

  if (!isSubscribed()) return (
    <AppLayout title={language === 'or' ? '🛡️ ଉଦ୍ଭିଦ ସୁରକ୍ଷା' : '🛡️ Plant Protection'}>
      <SubWall feature={language === 'or' ? 'ଉଦ୍ଭିଦ ସୁରକ୍ଷା' : 'Plant Protection'} />
    </AppLayout>
  );

  const handleSelect = (cat, crop) => { setSelCat(cat); setSelCrop(crop); setData([]); };

  const loadData = (t, pc) => {
    const tp = t || type;
    const pcat = pc !== undefined ? pc : pestCat;
    if (!selCrop) return;
    setLoading(true);
    let q = `/protection?cropId=${selCrop.id}&cropCategory=${selCat}`;
    if (tp) q += `&type=${tp}`;
    if (pcat) q += `&pestCategory=${pcat}`;
    API.get(q).then(r => setData(r.data)).catch(() => setData([])).finally(() => setLoading(false));
  };

  return (
    <AppLayout title={language === 'or' ? '🛡️ ଉଦ୍ଭିଦ ସୁରକ୍ଷା' : '🛡️ Plant Protection'}>
      <PrintHeader title={`Plant Protection – ${selCrop ? (language === 'or' ? selCrop.nameOr : selCrop.name) : ''}`} userName={user?.name} />
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">{language === 'or' ? 'ଉଦ୍ଭିଦ ସୁରକ୍ଷା ସୁପାରିଶ' : 'Plant Protection Recommendations'}</h2>
          <p className="section-sub">{language === 'or' ? 'ପୋକ, ଫଙ୍ଗସ, ଜୀବାଣୁ, ଘାସ – ଜୈବ ଓ ରାସାୟନିକ ଉପଚାର' : 'Insects, fungi, bacteria, viruses, weeds, rodents – chemical & organic'}</p>
        </div>
        <div className="flex gap-8 no-print">
          {data.length > 0 && <PrintBtn title={`Protection – ${selCrop?.name}`} />}
          <VoiceBtn message={language === 'or' ? 'ଉଦ୍ଭିଦ ସୁରକ୍ଷା ସୁପାରିଶ ଏଠାରେ ଦେଖନ୍ତୁ' : 'View plant protection recommendations'} />
        </div>
      </div>

      <CropSelector onSelect={handleSelect} />

      {selCrop && (
        <>
          <div className="grid-2 mb-16">
            <div>
              <p className="form-label mb-8">{language === 'or' ? 'ଉପଚାର ପ୍ରକାର' : 'Treatment Type'}</p>
              <div className="chip-group">
                {['chemical', 'organic'].map(t => (
                  <button key={t} className={`chip ${type === t ? 'active' : ''}`}
                    onClick={() => { setType(t); loadData(t, pestCat); }}>
                    {t === 'chemical' ? `💊 ${language === 'or' ? 'ରାସାୟନିକ' : 'Chemical'}` : `🌿 ${language === 'or' ? 'ଜୈବ' : 'Organic'}`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="form-label mb-8">{language === 'or' ? 'ରୋଗ/ପୋକ ଶ୍ରେଣୀ' : 'Pest/Disease Category'}</p>
              <div className="chip-group" style={{ flexWrap: 'wrap' }}>
                <button className={`chip ${pestCat === '' ? 'active' : ''}`}
                  onClick={() => { setPestCat(''); loadData(type, ''); }}>
                  {language === 'or' ? 'ସବୁ' : 'All'}
                </button>
                {Object.entries(pestCats).map(([key, pc]) => (
                  <button key={key} className={`chip ${pestCat === key ? 'active' : ''}`}
                    onClick={() => { setPestCat(key); loadData(type, key); }}>
                    {pc.icon} {language === 'or' ? pc.labelOr : pc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading && <Spinner />}

          {!loading && data.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">
                  {type === 'chemical' ? '💊' : '🌿'} {language === 'or' ? selCrop.nameOr || selCrop.name : selCrop.name} – {language === 'or' ? (type === 'chemical' ? 'ରାସାୟନିକ' : 'ଜୈବ') : (type === 'chemical' ? 'Chemical' : 'Organic')}
                </span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr>
                    <th>{language === 'or' ? 'ରୋଗ / ପୋକ' : 'Pest / Disease'}</th>
                    <th>{language === 'or' ? 'ଶ୍ରେଣୀ' : 'Category'}</th>
                    <th>{language === 'or' ? 'ଔଷଧ' : 'Pesticide / Product'}</th>
                    <th>{language === 'or' ? 'ମାତ୍ରା' : 'Dose'}</th>
                    <th>{language === 'or' ? 'ସମୟ' : 'Timing'}</th>
                    <th>{language === 'or' ? 'ପ୍ରଣାଳୀ' : 'Method'}</th>
                    <th>{language === 'or' ? 'ଖର୍ଚ' : 'Cost'}</th>
                  </tr></thead>
                  <tbody>
                    {data.map((r, i) => (
                      <tr key={i}>
                        <td><strong>{language === 'or' && r.pestNameOr ? r.pestNameOr : r.pestName}</strong></td>
                        <td><span className="badge badge-purple">{r.pestCategory}</span></td>
                        <td style={{ fontSize: '.82rem' }}>{r.pesticide}</td>
                        <td><span className="badge badge-red">{r.dose}</span></td>
                        <td style={{ fontSize: '.78rem' }}>{r.timing || '—'}</td>
                        <td><span className="badge badge-blue">{r.method}</span></td>
                        <td>{r.cost ? `₹${r.cost}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!loading && data.length === 0 && type && (
            <NoDataPanel cropName={language === 'or' ? selCrop.nameOr : selCrop.name} section="protection" language={language} navigate={navigate} />
          )}
        </>
      )}
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════
//  4. COSTING PAGE
// ══════════════════════════════════════════════════════════
export function CostingPage() {
  const { language, user, isSubscribed } = useAuth();
  const navigate = require('react-router-dom').useNavigate();
  const [selCat,    setSelCat]    = useState('');
  const [selCrop,   setSelCrop]   = useState(null);
  const [costCats,  setCostCats]  = useState({});
  const [selCC,     setSelCC]     = useState('');
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => { API.get('/master/costs').then(r => setCostCats(r.data)).catch(() => {}); }, []);

  if (!isSubscribed()) return (
    <AppLayout title={language === 'or' ? '💰 ଫସଲ ଖର୍ଚ' : '💰 Crop Costing'}>
      <SubWall feature={language === 'or' ? 'ଫସଲ ଖର୍ଚ ହିସାବ' : 'Crop Costing'} />
    </AppLayout>
  );

  const handleSelect = (cat, crop) => { setSelCat(cat); setSelCrop(crop); setData([]); };

  const loadData = (cc) => {
    if (!selCrop) return;
    setLoading(true);
    let q = `/costing?cropId=${selCrop.id}&cropCategory=${selCat}`;
    if (cc) q += `&costCategory=${cc}`;
    API.get(q).then(r => setData(r.data)).catch(() => setData([])).finally(() => setLoading(false));
  };

  const totalMin = data.reduce((s, r) => s + (Number(r.rateMin) || 0), 0);
  const totalMax = data.reduce((s, r) => s + (Number(r.rateMax) || 0), 0);

  return (
    <AppLayout title={language === 'or' ? '💰 ଫସଲ ଖର୍ଚ' : '💰 Crop Costing'}>
      <PrintHeader title={`Crop Costing – ${selCrop ? (language === 'or' ? selCrop.nameOr : selCrop.name) : ''}`} userName={user?.name} />
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">{language === 'or' ? 'ଫସଲ ଖର୍ଚ ବିଶ୍ଲେଷଣ' : 'Crop Investment & Cost Analysis'}</h2>
          <p className="section-sub">{language === 'or' ? 'ବୀଜ, ସାର, ଶ୍ରମ, ଯନ୍ତ୍ରପାତି, ଭୂ ରାଜସ୍ୱ ଆଦି' : 'Seeds, fertilizers, labour, machinery, land revenue and more'}</p>
        </div>
        <div className="flex gap-8 no-print">
          {data.length > 0 && <PrintBtn title={`Costing – ${selCrop?.name}`} />}
          <VoiceBtn message={language === 'or' ? 'ଏଠାରେ ଫସଲ ଖର୍ଚ ହିସାବ ଦେଖନ୍ତୁ' : 'View crop cost analysis here'} />
        </div>
      </div>

      <CropSelector onSelect={handleSelect} />

      {selCrop && (
        <>
          <div className="mb-16">
            <p className="form-label mb-8">{language === 'or' ? 'ଖର୍ଚ ଶ୍ରେଣୀ' : 'Cost Category'}</p>
            <div className="chip-group">
              <button className={`chip ${selCC === '' ? 'active' : ''}`}
                onClick={() => { setSelCC(''); loadData(''); }}>
                {language === 'or' ? '📊 ସବୁ ଖର୍ଚ' : '📊 All Costs'}
              </button>
              {Object.entries(costCats).map(([key, cc]) => (
                <button key={key} className={`chip ${selCC === key ? 'active' : ''}`}
                  onClick={() => { setSelCC(key); loadData(key); }}>
                  {cc.icon} {language === 'or' ? cc.labelOr : cc.label}
                </button>
              ))}
            </div>
          </div>

          {loading && <Spinner />}

          {!loading && data.length > 0 && (
            <>
              <div className="grid-3 mb-16">
                <div className="stat-card green">
                  <div className="stat-number">₹{totalMin.toLocaleString('en-IN')}</div>
                  <div className="stat-label">{language === 'or' ? 'ন্যূনতম ଖର୍ଚ' : 'Min. Investment'}</div>
                  <div className="stat-icon">💰</div>
                </div>
                <div className="stat-card orange">
                  <div className="stat-number">₹{totalMax.toLocaleString('en-IN')}</div>
                  <div className="stat-label">{language === 'or' ? 'ସର୍ବାଧିକ ଖର୍ଚ' : 'Max. Investment'}</div>
                  <div className="stat-icon">💸</div>
                </div>
                <div className="stat-card blue">
                  <div className="stat-number">{data.length}</div>
                  <div className="stat-label">{language === 'or' ? 'ଖର୍ଚ ଆଇଟମ' : 'Cost Items'}</div>
                  <div className="stat-icon">📋</div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title">💰 {language === 'or' ? selCrop.nameOr || selCrop.name : selCrop.name} – {language === 'or' ? 'ଖର୍ଚ ବିବରଣ' : 'Cost Details'}</span>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead><tr>
                      <th>{language === 'or' ? 'ଖର୍ଚ ଶ୍ରେଣୀ' : 'Category'}</th>
                      <th>{language === 'or' ? 'ଆଇଟମ' : 'Item'}</th>
                      <th>{language === 'or' ? 'ଏକକ' : 'Unit'}</th>
                      <th>{language === 'or' ? 'ন্যূনতম (₹)' : 'Min (₹)'}</th>
                      <th>{language === 'or' ? 'ସର୍ବ (₹)' : 'Max (₹)'}</th>
                      <th>{language === 'or' ? 'ଟିପ୍ପଣୀ' : 'Remarks'}</th>
                    </tr></thead>
                    <tbody>
                      {data.map((r, i) => (
                        <tr key={i}>
                          <td>
                            <span className="badge badge-gold">
                              {costCats[r.costCategory]?.icon} {language === 'or' ? costCats[r.costCategory]?.labelOr : costCats[r.costCategory]?.label}
                            </span>
                          </td>
                          <td><strong>{language === 'or' && r.itemOr ? r.itemOr : r.item}</strong></td>
                          <td style={{ fontSize: '.82rem' }}>{r.unit}</td>
                          <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{Number(r.rateMin || 0).toLocaleString('en-IN')}</td>
                          <td style={{ color: 'var(--harvest)', fontWeight: 600 }}>₹{Number(r.rateMax || 0).toLocaleString('en-IN')}</td>
                          <td style={{ fontSize: '.78rem' }}>{r.remarks || r.adminNotes || '—'}</td>
                        </tr>
                      ))}
                      <tr style={{ background: 'var(--success-light)', fontWeight: 700 }}>
                        <td colSpan={3}><strong>{language === 'or' ? 'ମୋଟ ଖର୍ଚ' : 'TOTAL COST'}</strong></td>
                        <td style={{ color: 'var(--success)' }}>₹{totalMin.toLocaleString('en-IN')}</td>
                        <td style={{ color: 'var(--harvest)' }}>₹{totalMax.toLocaleString('en-IN')}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {!loading && data.length === 0 && selCC !== undefined && (
            <NoDataPanel cropName={language === 'or' ? selCrop.nameOr : selCrop.name} section="costing" language={language} navigate={navigate} />
          )}
        </>
      )}
    </AppLayout>
  );
}

// ══════════════════════════════════════════════════════════
//  5. PHOTO GALLERY PAGE
// ══════════════════════════════════════════════════════════
export function PhotoGalleryPage() {
  const { language, user } = useAuth();
  const [photos,   setPhotos]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [uploading,setUploading]= useState(false);
  const [selPhoto, setSelPhoto] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [filter,   setFilter]   = useState('');
  const fileRef  = useRef();

  useEffect(() => {
    setLoading(true);
    API.get('/photos').then(r => setPhotos(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUpload = async e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const fd = new FormData();
    files.forEach(f => fd.append('photos', f));
    const defaultTags = ['field', new Date().toISOString().slice(0, 10)];
    fd.append('tags', JSON.stringify(defaultTags));
    try {
      const r = await API.post('/photos/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPhotos(prev => [...r.data.photos, ...prev]);
    } catch(e) { alert('Upload failed. Check file size (<10MB) and type.'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const saveTag = async () => {
    if (!selPhoto) return;
    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    try {
      const r = await API.put(`/photos/${selPhoto.id}/tags`, { tags, notes: selPhoto.notes });
      setPhotos(prev => prev.map(p => p.id === r.data.id ? r.data : p));
      setSelPhoto(r.data);
    } catch(e) { alert('Save failed'); }
  };

  const deletePhoto = async id => {
    if (!window.confirm('Delete this photo?')) return;
    try { await API.delete(`/photos/${id}`); setPhotos(prev => prev.filter(p => p.id !== id)); setSelPhoto(null); }
    catch(e) { alert('Delete failed'); }
  };

  const filtered = photos.filter(p => !filter || (p.tags||[]).some(t => t.toLowerCase().includes(filter.toLowerCase())) || p.notes?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <AppLayout title={language === 'or' ? '📷 ଫଟୋ ଗ୍ୟାଲେରି' : '📷 Photo Gallery'}>
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">{language === 'or' ? 'ଫାର୍ମ ଫଟୋ ଗ୍ୟାଲେରି' : 'Farm Photo Gallery'}</h2>
          <p className="section-sub">{language === 'or' ? 'ଫଟୋ ଅପଲୋଡ ଓ ଟ୍ୟାଗ କରନ୍ତୁ' : 'Upload & tag field photos to build your agricultural dataset'}</p>
        </div>
        <div className="flex gap-8 no-print">
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleUpload} />
          <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? '⏳ Uploading…' : `📷 ${language === 'or' ? 'ଫଟୋ ଅପଲୋଡ' : 'Upload Photos'}`}
          </button>
        </div>
      </div>

      <div className="form-group mb-16 no-print">
        <input className="form-input" placeholder={language === 'or' ? 'ଟ୍ୟାଗ ଦ୍ୱାରା ଖୋଜ...' : 'Filter by tag or notes…'}
          value={filter} onChange={e => setFilter(e.target.value)} />
      </div>

      {loading ? <Spinner /> : (
        filtered.length > 0 ? (
          <div className="photo-grid">
            {filtered.map(photo => (
              <div key={photo.id} className="photo-card" onClick={() => { setSelPhoto(photo); setTagInput((photo.tags||[]).join(', ')); }}>
                <img src={`http://localhost:5000${photo.url}`} alt={photo.notes || 'Farm photo'}
                  onError={e => { e.target.style.display='none'; e.target.parentElement.style.background='var(--straw)'; }} />
                <div className="photo-card-info">
                  <div style={{ fontSize: '.72rem', color: 'var(--earth)', marginBottom: 3 }}>
                    {new Date(photo.uploadedAt).toLocaleDateString('en-IN')}
                  </div>
                  {(photo.tags||[]).map(t => <span key={t} className="photo-tag">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="📷" text="No photos yet. Click Upload Photos to add your field photos." textOr="ଏ ପର୍ଯ୍ୟନ୍ତ ଫଟୋ ନାହିଁ। ଅପଲୋଡ ବଟନ ଚାପ ଫଟୋ ଯୋଡ଼ନ୍ତୁ।" />
        )
      )}

      {selPhoto && (
        <div className="modal-overlay" onClick={() => setSelPhoto(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">📷 {language === 'or' ? 'ଫଟୋ ବିବରଣ' : 'Photo Details'}</span>
              <button className="modal-close" onClick={() => setSelPhoto(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid-2 gap-20">
                <img src={`http://localhost:5000${selPhoto.url}`} alt="Farm"
                  style={{ width:'100%', borderRadius:'var(--radius)', border:'1px solid var(--straw)', maxHeight:300, objectFit:'cover' }}
                  onError={e => { e.target.src=''; e.target.style.display='none'; }} />
                <div>
                  <div className="form-group mb-12">
                    <label className="form-label">{language === 'or' ? 'ଟ୍ୟାଗ ( କମା ଦ୍ୱାରା ଅଲଗା)' : 'Tags (comma separated)'}</label>
                    <input className="form-input" value={tagInput} onChange={e => setTagInput(e.target.value)}
                      placeholder="e.g. rice, stem-borer, kharif-2024" />
                  </div>
                  <div className="form-group mb-16">
                    <label className="form-label">{language === 'or' ? 'ଟିପ୍ପଣୀ' : 'Notes'}</label>
                    <textarea className="form-textarea" rows={3}
                      value={selPhoto.notes || ''} onChange={e => setSelPhoto(p => ({...p, notes: e.target.value}))}
                      placeholder={language === 'or' ? 'ଫଟୋ ସମ୍ପର୍କରେ ଟିପ୍ପଣୀ...' : 'Observation or notes about this photo…'} />
                  </div>
                  <div className="flex gap-10">
                    <button className="btn btn-primary" onClick={saveTag}>
                      ✅ {language === 'or' ? 'ସଞ୍ଚୟ' : 'Save Tags'}
                    </button>
                    <button className="btn btn-danger" onClick={() => deletePhoto(selPhoto.id)}>
                      🗑 {language === 'or' ? 'ମୁଛ' : 'Delete'}
                    </button>
                  </div>
                  <div style={{ marginTop: 12, fontSize: '.78rem', color: 'var(--earth)' }}>
                    📅 {new Date(selPhoto.uploadedAt).toLocaleString('en-IN')}<br />
                    📁 {selPhoto.originalName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
