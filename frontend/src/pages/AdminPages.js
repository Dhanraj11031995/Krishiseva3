import React, { useState, useEffect } from 'react';
import AppLayout from '../components/shared/AppLayout';
import { PrintBtn, PrintHeader, Spinner, EmptyState } from '../components/shared/UIKit';
import { useAuth, API } from '../context/AuthContext';

/* ══════════════════════════════════════════════════════════
   ADMIN DASHBOARD
   ══════════════════════════════════════════════════════════ */
export function AdminDashboard() {
  const [stats,   setStats]   = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const STAT_ROWS = [
    { label:'Registered Farmers',   value:stats.totalUsers,          icon:'👨‍🌾', color:'green'  },
    { label:'Active Subscribers',   value:stats.activeSubscribers,   icon:'⭐',  color:'amber'  },
    { label:'Farm Places',          value:stats.totalPlaces,         icon:'🗺️', color:'blue'   },
    { label:'Total Plots',          value:stats.totalPlots,          icon:'🌾', color:'green'  },
    { label:'Field Data Entries',   value:stats.totalEntries,        icon:'📋', color:'orange' },
    { label:'Cultivation Records',  value:stats.cultivationRecords,  icon:'🌱', color:'green'  },
    { label:'Nutrient Records',     value:stats.nutrientRecords,     icon:'🧪', color:'blue'   },
    { label:'Protection Records',   value:stats.protectionRecords,   icon:'🛡️', color:'amber'  },
    { label:'Costing Records',      value:stats.costingRecords,      icon:'💰', color:'orange' },
    { label:'E-Commerce Orders',    value:stats.totalOrders,         icon:'📦', color:'amber'  },
    { label:'Uploaded Photos',      value:stats.totalPhotos,         icon:'📷', color:'blue'   },
    { label:'Total Revenue (₹)',    value:`₹${(stats.totalRevenue||0).toLocaleString('en-IN')}`, icon:'💰', color:'green' },
  ];

  return (
    <AppLayout title="🛡️ Admin Dashboard">
      <h2 className="section-title mb-8">Platform Overview</h2>
      <p className="section-sub mb-20">Live statistics · KrishiSeva v3.0</p>

      {loading ? <Spinner /> : (
        <>
          <div className="grid-4 mb-24" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
            {STAT_ROWS.map(s => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className="stat-number">{s.value ?? '—'}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-icon">{s.icon}</div>
              </div>
            ))}
          </div>

          <div className="grid-2 gap-24">
            <div className="card">
              <div className="card-header"><span className="card-title">🚀 Quick Actions</span></div>
              <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  ['/admin/users',       '👨‍🌾', 'Manage Farmers & Assign Places'],
                  ['/admin/places',      '🗺️', 'Add / Edit Places & Plots'],
                  ['/admin/cultivation', '🌾', 'Add Cultivation Practice Data'],
                  ['/admin/nutrients',   '🧪', 'Add Nutrient Recommendations'],
                  ['/admin/protection',  '🛡️', 'Add Plant Protection Data'],
                  ['/admin/costing',     '💰', 'Add Crop Costing Data'],
                  ['/admin/field-data',  '📊', 'View & Download Field Data CSV'],
                  ['/admin/photos',      '📷', 'View All Farmer Photos'],
                  ['/admin/form-queries','📝', 'Configure Data Entry Form'],
                  ['/admin/ai-log',      '🤖', 'View AI Query Log'],
                ].map(([href, icon, label]) => (
                  <a key={href} href={href} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'var(--cream)', borderRadius:'var(--radius-sm)', textDecoration:'none', color:'var(--soil)', fontWeight:500, fontSize:'.845rem', border:'1px solid var(--straw)', transition:'all .15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='var(--leaf)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='var(--straw)'}>
                    <span style={{ fontSize:'1.1rem' }}>{icon}</span>{label}
                    <span style={{ marginLeft:'auto', color:'var(--clay)' }}>→</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><span className="card-title">⚙️ System Info</span></div>
              <div className="card-body">
                {[
                  ['Platform',     'KrishiSeva v3.0'],
                  ['Backend',      'Node.js + Express (port 5000)'],
                  ['Frontend',     'React.js (port 3000)'],
                  ['Languages',    'English / ଓଡ଼ିଆ / हिन्दी'],
                  ['Voice',        'Web Speech API – Odia TTS'],
                  ['AI Fallback',  'OpenAI GPT-3.5 (add key to .env)'],
                  ['Weather',      'OpenWeatherMap API (add key)'],
                  ['Payment',      'Razorpay (add keys to .env)'],
                  ['Photos',       'Local disk (migrate to cloud)'],
                  ['Storage',      'In-memory → swap to MongoDB/PostgreSQL'],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--straw)', fontSize:'.845rem' }}>
                    <span style={{ color:'var(--earth)' }}>{k}</span>
                    <span style={{ fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}

/* ══════════════════════════════════════════════════════════
   MANAGE USERS
   ══════════════════════════════════════════════════════════ */
export function AdminUsersPage() {
  const [users,   setUsers]   = useState([]);
  const [places,  setPlaces]  = useState([]);
  const [modal,   setModal]   = useState(false);
  const [editU,   setEditU]   = useState(null);
  const [form,    setForm]    = useState({ username:'', password:'', name:'', email:'', phone:'', assignedPlaces:[] });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    API.get('/users').then(r => setUsers(r.data)).catch(() => {});
    API.get('/places').then(r => setPlaces(r.data)).catch(() => {});
  }, []);

  const openAdd  = () => { setEditU(null); setForm({ username:'',password:'',name:'',email:'',phone:'',assignedPlaces:[] }); setModal(true); };
  const openEdit = u  => { setEditU(u); setForm({...u,password:''}); setModal(true); };

  const togglePlace = id => setForm(p => ({
    ...p, assignedPlaces: p.assignedPlaces.includes(id) ? p.assignedPlaces.filter(x=>x!==id) : [...p.assignedPlaces,id]
  }));

  const save = async () => {
    setLoading(true);
    try {
      if (editU) {
        const r = await API.put(`/users/${editU.id}`, form);
        setUsers(prev => prev.map(u => u.id===r.data.id ? r.data : u));
        setSuccess('User updated!');
      } else {
        const r = await API.post('/users', form);
        setUsers(prev => [...prev, r.data]);
        setSuccess('User created!');
      }
      setModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch(e) { alert(e?.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <AppLayout title="👨‍🌾 Manage Users">
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">Farmer Accounts</h2>
          <p className="section-sub">{users.length} registered farmers</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Farmer</button>
      </div>

      {success && <div className="alert alert-success mb-16">✅ {success}</div>}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr>
              <th>Name</th><th>Username</th><th>Email</th><th>Phone</th>
              <th>Subscription</th><th>Assigned Places</th><th>Action</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td><span className="badge badge-blue">{u.username}</span></td>
                  <td style={{ fontSize:'.82rem' }}>{u.email}</td>
                  <td style={{ fontSize:'.82rem' }}>{u.phone}</td>
                  <td>
                    {u.subscription?.active
                      ? <span className="badge badge-green">✅ {u.subscription.plan}</span>
                      : <span className="badge badge-red">Not subscribed</span>}
                  </td>
                  <td>
                    {(u.assignedPlaces||[]).map(pid => {
                      const pl = places.find(p=>p.id===pid);
                      return pl ? <span key={pid} className="badge badge-green" style={{ marginRight:4 }}>{pl.name}</span> : null;
                    })}
                    {!(u.assignedPlaces||[]).length && <span className="badge badge-grey">None</span>}
                  </td>
                  <td><button className="btn btn-sm btn-secondary" onClick={() => openEdit(u)}>✏️ Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editU ? '✏️ Edit Farmer' : '+ New Farmer'}</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid-2" style={{ gap:14 }}>
                {[['name','Full Name','Ramesh Patra'],['username','Username','farmer1'],['email','Email','farmer@email.com'],['phone','Phone','9876543210']].map(([k,l,pl]) => (
                  <div key={k} className="form-group">
                    <label className="form-label">{l}</label>
                    <input className="form-input" placeholder={pl} value={form[k]||''} onChange={e => setForm(p=>({...p,[k]:e.target.value}))} />
                  </div>
                ))}
              </div>
              <div className="form-group mt-12">
                <label className="form-label">{editU ? 'New Password (blank to keep)' : 'Password *'}</label>
                <input className="form-input" type="password" placeholder="••••••••" value={form.password||''} onChange={e => setForm(p=>({...p,password:e.target.value}))} />
              </div>
              <div className="form-group mt-12">
                <label className="form-label">Assign Places</label>
                <div className="chip-group">
                  {places.map(p => (
                    <button key={p.id} className={`chip ${(form.assignedPlaces||[]).includes(p.id)?'active':''}`}
                      onClick={() => togglePlace(p.id)}>
                      📍 {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={loading||!form.name||!form.username}>
                {loading ? '⏳ Saving…' : '✅ Save Farmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

/* ══════════════════════════════════════════════════════════
   PLACES & PLOTS
   ══════════════════════════════════════════════════════════ */
export function AdminPlacesPage() {
  const [places,    setPlaces]    = useState([]);
  const [users,     setUsers]     = useState([]);
  const [expanded,  setExpanded]  = useState(null);
  const [placeModal,setPlaceModal]= useState(false);
  const [plotModal, setPlotModal] = useState(false);
  const [activePid, setActivePid] = useState(null);
  const [pf,        setPf]        = useState({ name:'',district:'',state:'Odisha',totalArea:'',lat:'',lng:'' });
  const [plotF,     setPlotF]     = useState({ name:'',area:'',crop:'',cropCategory:'cereals',season:'Kharif',assignedUser:'' });
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState('');
  const [cropMaster,setCropMaster]= useState({});

  const SEASONS = ['Kharif','Rabi','Zaid','Perennial'];

  useEffect(() => {
    API.get('/places').then(r => setPlaces(r.data)).catch(() => {});
    API.get('/users').then(r => setUsers(r.data)).catch(() => {});
    API.get('/master/crops').then(r => setCropMaster(r.data)).catch(() => {});
  }, []);

  const savePlace = async () => {
    setLoading(true);
    try {
      const r = await API.post('/places', pf);
      setPlaces(prev => [...prev, r.data]);
      setPlaceModal(false);
      setSuccess('Place added!');
      setTimeout(() => setSuccess(''), 3000);
    } catch(e) { alert(e?.response?.data?.error||'Error'); }
    finally { setLoading(false); }
  };

  const savePlot = async () => {
    setLoading(true);
    try {
      const r = await API.post(`/places/${activePid}/plots`, plotF);
      setPlaces(prev => prev.map(p => p.id===activePid ? {...p,plots:[...p.plots,r.data]} : p));
      setPlotModal(false);
      setSuccess('Plot added!');
      setTimeout(() => setSuccess(''), 3000);
    } catch(e) { alert(e?.response?.data?.error||'Error'); }
    finally { setLoading(false); }
  };

  const allCrops = Object.entries(cropMaster).flatMap(([cat, data]) =>
    (data.crops||[]).map(c => ({ ...c, category: cat, categoryLabel: data.label }))
  );

  return (
    <AppLayout title="🗺️ Places & Plots">
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">Farm Places & Plot Management</h2>
          <p className="section-sub">{places.length} places · {places.reduce((s,p)=>s+p.plots.length,0)} total plots</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setPf({name:'',district:'',state:'Odisha',totalArea:'',lat:'',lng:''}); setPlaceModal(true); }}>
          + Add Place
        </button>
      </div>

      {success && <div className="alert alert-success mb-14">✅ {success}</div>}

      {places.map(place => (
        <div key={place.id} className="card mb-14">
          <div className="card-header" style={{ cursor:'pointer' }} onClick={() => setExpanded(expanded===place.id?null:place.id)}>
            <div>
              <span className="card-title">📍 {place.name}</span>
              <span style={{ marginLeft:12, fontSize:'.78rem', color:'var(--earth)' }}>
                {place.district}, {place.state} · {place.totalArea} ha
              </span>
            </div>
            <div className="flex gap-10">
              <span className="badge badge-green">{place.plots.length} plots</span>
              <button className="btn btn-sm btn-primary"
                onClick={e => { e.stopPropagation(); setActivePid(place.id); setPlotF({name:'',area:'',crop:'',cropCategory:'cereals',season:'Kharif',assignedUser:''}); setPlotModal(true); }}>
                + Plot
              </button>
              <span style={{ color:'var(--clay)' }}>{expanded===place.id?'▲':'▼'}</span>
            </div>
          </div>
          {expanded===place.id && (
            place.plots.length ? (
              <div className="table-wrapper">
                <table>
                  <thead><tr>
                    <th>Plot</th><th>Area (ac)</th><th>Crop</th><th>Category</th><th>Season</th><th>Assigned Farmer</th>
                  </tr></thead>
                  <tbody>
                    {place.plots.map(pt => {
                      const farmer = users.find(u => u.id===pt.assignedUser);
                      return (
                        <tr key={pt.id}>
                          <td><strong>{pt.name}</strong></td>
                          <td>{pt.area}</td>
                          <td><span className="badge badge-green">{pt.crop}</span></td>
                          <td><span className="badge badge-blue">{pt.cropCategory}</span></td>
                          <td><span className="badge badge-amber">{pt.season}</span></td>
                          <td>{farmer ? `👨‍🌾 ${farmer.name}` : <span className="badge badge-red">Unassigned</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding:28 }}>
                <div className="ei">🌾</div><div>No plots yet — click "+ Plot"</div>
              </div>
            )
          )}
        </div>
      ))}

      {/* Add Place Modal */}
      {placeModal && (
        <div className="modal-overlay" onClick={() => setPlaceModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">+ Add New Place</span>
              <button className="modal-close" onClick={() => setPlaceModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid-2" style={{ gap:14 }}>
                {[['name','Place Name','e.g. Bhubaneswar North Farm'],['district','District','e.g. Khordha'],['state','State','Odisha'],['totalArea','Total Area (ha)','e.g. 25.5'],['lat','Latitude','e.g. 20.2961'],['lng','Longitude','e.g. 85.8245']].map(([k,l,pl]) => (
                  <div key={k} className="form-group">
                    <label className="form-label">{l}</label>
                    <input className="form-input" placeholder={pl} value={pf[k]||''} onChange={e => setPf(p=>({...p,[k]:e.target.value}))} />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setPlaceModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={savePlace} disabled={loading||!pf.name}>
                {loading?'⏳…':'✅ Save Place'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Plot Modal */}
      {plotModal && (
        <div className="modal-overlay" onClick={() => setPlotModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">+ Add Plot to {places.find(p=>p.id===activePid)?.name}</span>
              <button className="modal-close" onClick={() => setPlotModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid-2" style={{ gap:14 }}>
                <div className="form-group">
                  <label className="form-label">Plot Name</label>
                  <input className="form-input" placeholder="e.g. Plot A1" value={plotF.name} onChange={e=>setPlotF(p=>({...p,name:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Area (acres)</label>
                  <input className="form-input" type="number" step="0.1" placeholder="e.g. 5.2" value={plotF.area} onChange={e=>setPlotF(p=>({...p,area:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Crop Category</label>
                  <select className="form-select" value={plotF.cropCategory} onChange={e=>setPlotF(p=>({...p,cropCategory:e.target.value,crop:''}))}>
                    {Object.entries(cropMaster).map(([key,cat]) => (
                      <option key={key} value={key}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Crop</label>
                  <select className="form-select" value={plotF.crop} onChange={e=>setPlotF(p=>({...p,crop:e.target.value}))}>
                    <option value="">-- Select Crop --</option>
                    {(cropMaster[plotF.cropCategory]?.crops||[]).map(c => (
                      <option key={c.id} value={c.name}>{c.name} · {c.nameOr}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Season</label>
                  <select className="form-select" value={plotF.season} onChange={e=>setPlotF(p=>({...p,season:e.target.value}))}>
                    {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Farmer</label>
                  <select className="form-select" value={plotF.assignedUser} onChange={e=>setPlotF(p=>({...p,assignedUser:e.target.value}))}>
                    <option value="">-- Select Farmer --</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.username})</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setPlotModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={savePlot} disabled={loading||!plotF.name||!plotF.crop}>
                {loading?'⏳…':'✅ Save Plot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

/* ══════════════════════════════════════════════════════════
   GENERIC ADMIN DATA MANAGER
   (reused for Cultivation, Nutrients, Protection, Costing)
   ══════════════════════════════════════════════════════════ */
function AdminDataManager({ title, endpoint, fields, tableColumns, renderRow }) {
  const [data,    setData]    = useState([]);
  const [cats,    setCats]    = useState({});
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({});
  const [editId,  setEditId]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter,  setFilter]  = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    API.get(`/${endpoint}`).then(r => setData(r.data)).catch(() => {});
    API.get('/master/crops').then(r => setCats(r.data)).catch(() => {});
  }, []); // eslint-disable-line

  const allCrops = Object.entries(cats).flatMap(([cat, catData]) =>
    (catData.crops||[]).map(c => ({ ...c, categoryKey: cat, categoryLabel: catData.label }))
  );

  const save = async () => {
    setLoading(true);
    try {
      if (editId) {
        const r = await API.put(`/${endpoint}/${editId}`, form);
        setData(prev => prev.map(d => d.id===r.data.id ? r.data : d));
        setSuccess('Updated!');
      } else {
        const r = await API.post(`/${endpoint}`, form);
        setData(prev => [...prev, r.data]);
        setSuccess('Added!');
      }
      setModal(false); setEditId(null); setForm({});
      setTimeout(() => setSuccess(''), 3000);
    } catch(e) { alert(e?.response?.data?.error||'Error saving'); }
    finally { setLoading(false); }
  };

  const del = async id => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await API.delete(`/${endpoint}/${id}`);
      setData(prev => prev.filter(d => d.id!==id));
    } catch(e) { alert('Delete failed'); }
  };

  const filtered = data.filter(d => !filter ||
    d.cropId?.toLowerCase().includes(filter.toLowerCase()) ||
    d.cropCategory?.toLowerCase().includes(filter.toLowerCase()) ||
    JSON.stringify(d).toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <AppLayout title={`📋 ${title}`}>
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="section-sub">{data.length} records · shown to farmers based on their crop</p>
        </div>
        <div className="flex gap-10">
          <input className="form-input" style={{ width:200 }} placeholder="Filter…" value={filter} onChange={e=>setFilter(e.target.value)} />
          <button className="btn btn-primary" onClick={() => { setForm({}); setEditId(null); setModal(true); }}>+ Add Record</button>
        </div>
      </div>

      {success && <div className="alert alert-success mb-14">✅ {success}</div>}

      {filtered.length ? (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Crop</th><th>Category</th>
                {tableColumns.map(c => <th key={c}>{c}</th>)}
                <th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.id}>
                    <td><strong>{row.cropId}</strong></td>
                    <td><span className="badge badge-blue">{row.cropCategory}</span></td>
                    {renderRow(row)}
                    <td>
                      <div className="flex gap-6">
                        <button className="btn btn-sm btn-secondary" onClick={() => { setForm(row); setEditId(row.id); setModal(true); }}>✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={() => del(row.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState icon="📋" text={`No ${title} records yet. Click "+ Add Record" to begin.`} />
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editId ? `✏️ Edit ${title}` : `+ Add ${title}`}</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid-2" style={{ gap:14 }}>
                {/* Crop selector */}
                <div className="form-group">
                  <label className="form-label">Crop Category</label>
                  <select className="form-select" value={form.cropCategory||''} onChange={e=>setForm(p=>({...p,cropCategory:e.target.value,cropId:''}))}>
                    <option value="">-- Select Category --</option>
                    {Object.entries(cats).map(([k,c]) => <option key={k} value={k}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Crop</label>
                  <select className="form-select" value={form.cropId||''} onChange={e=>setForm(p=>({...p,cropId:e.target.value}))}>
                    <option value="">-- Select Crop --</option>
                    {(cats[form.cropCategory]?.crops||[]).map(c => (
                      <option key={c.id} value={c.id}>{c.name} · {c.nameOr}</option>
                    ))}
                  </select>
                </div>

                {/* Dynamic fields */}
                {fields.map(f => (
                  <div key={f.key} className="form-group" style={f.fullWidth?{gridColumn:'1/-1'}:{}}>
                    <label className="form-label">{f.label}{f.labelOr && <span className="form-label-or"> ({f.labelOr})</span>}</label>
                    {f.type === 'select' ? (
                      <select className="form-select" value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}>
                        <option value="">-- Select --</option>
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea className="form-textarea" placeholder={f.placeholder||''} value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} />
                    ) : (
                      <input className="form-input" type={f.type||'text'} placeholder={f.placeholder||''} value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={loading||!form.cropId}>
                {loading?'⏳ Saving…':'✅ Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

/* ── Admin: Cultivation Data ──────────────────────────────── */
export function AdminCultivationPage() {
  const FIELDS = [
    { key:'season',     label:'Season',           type:'select', options:['Kharif','Rabi','Zaid','Perennial','All'] },
    { key:'adminNotes', label:'Admin Notes',       type:'textarea', placeholder:'Overall notes for this crop...', fullWidth:true },
    { key:'stages',     label:'Stages (JSON Array)',type:'textarea', placeholder:'[{"activity":"Land Prep","activityOr":"ଭୂ ପ୍ରସ୍ତୁତି","week":1,"details":"2-3 ploughings","detailsOr":"2-3 ଥର ଚାଷ","category":"field_prep"}]', fullWidth:true },
  ];
  return (
    <AdminDataManager
      title="Cultivation Practice Data"
      endpoint="cultivation"
      fields={FIELDS}
      tableColumns={['Season','Notes']}
      renderRow={row => [
        <td key="s"><span className="badge badge-amber">{row.season||'—'}</span></td>,
        <td key="n" style={{ fontSize:'.78rem', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{row.adminNotes||'—'}</td>,
      ]}
    />
  );
}

/* ── Admin: Nutrient Data ─────────────────────────────────── */
export function AdminNutrientsPage() {
  const FIELDS = [
    { key:'type',       label:'Type',             labelOr:'ପ୍ରକାର',   type:'select', options:['chemical','organic'] },
    { key:'stage',      label:'Growth Stage',     labelOr:'ଅବସ୍ଥା',   type:'select', options:['basal','seedling','tillering','vegetative','flowering','fruit_set','fruit_dev','maturity'] },
    { key:'nutrient',   label:'Nutrient',         labelOr:'ପୋଷକ',     type:'text',   placeholder:'e.g. Nitrogen (N)' },
    { key:'nutrientOr', label:'Nutrient (Odia)',  type:'text',   placeholder:'e.g. ଯବକ୍ଷାରଜାନ' },
    { key:'product',    label:'Product',          type:'text',   placeholder:'e.g. Urea 46% N' },
    { key:'dose',       label:'Dose',             type:'text',   placeholder:'e.g. 80 kg/ha' },
    { key:'timing',     label:'Timing',           type:'text',   placeholder:'e.g. 30 days after sowing' },
    { key:'method',     label:'Method',           type:'select', options:['Basal Application','Top Dressing','Foliar Spray','Fertigation (Drip)','Seed Treatment','Soil Drench','Granule Broadcasting'] },
    { key:'cost',       label:'Approx Cost (₹)',  type:'number', placeholder:'e.g. 850' },
    { key:'adminNotes', label:'Admin Notes',       type:'textarea', placeholder:'Optional remarks...', fullWidth:true },
  ];
  return (
    <AdminDataManager
      title="Nutrient Recommendation Data"
      endpoint="nutrients"
      fields={FIELDS}
      tableColumns={['Type','Nutrient','Dose','Stage']}
      renderRow={row => [
        <td key="t"><span className={`badge ${row.type==='organic'?'badge-green':'badge-amber'}`}>{row.type}</span></td>,
        <td key="n"><strong>{row.nutrient}</strong></td>,
        <td key="d"><span className="badge badge-green">{row.dose}</span></td>,
        <td key="s"><span className="badge badge-blue">{row.stage||'—'}</span></td>,
      ]}
    />
  );
}

/* ── Admin: Plant Protection Data ────────────────────────── */
export function AdminProtectionPage() {
  const FIELDS = [
    { key:'type',         label:'Treatment Type',   type:'select', options:['chemical','organic'] },
    { key:'pestCategory', label:'Pest Category',    type:'select', options:['insects','fungi','bacteria','virus','rodents','weeds','nematodes','algae','mites'] },
    { key:'pestName',     label:'Pest / Disease',   labelOr:'ରୋଗ/ପୋକ', type:'text', placeholder:'e.g. Yellow Stem Borer' },
    { key:'pestNameOr',   label:'Pest Name (Odia)', type:'text', placeholder:'e.g. ହଳଦିଆ ଡାଣ୍ଠ ପୋକ' },
    { key:'pesticide',    label:'Pesticide / Product', type:'text', placeholder:'e.g. Chlorpyrifos 20 EC' },
    { key:'dose',         label:'Dose',             type:'text', placeholder:'e.g. 1.25 L/ha' },
    { key:'timing',       label:'Timing',           type:'text', placeholder:'e.g. 30 & 55 DAS' },
    { key:'method',       label:'Application Method', type:'select', options:['Foliar Spray','Soil Drench','Granule Broadcasting','Seed Treatment','Fumigation','Trunk Injection'] },
    { key:'cost',         label:'Approx Cost (₹)',  type:'number', placeholder:'e.g. 250' },
    { key:'adminNotes',   label:'Admin Notes',       type:'textarea', placeholder:'Remarks...', fullWidth:true },
  ];
  return (
    <AdminDataManager
      title="Plant Protection Data"
      endpoint="protection"
      fields={FIELDS}
      tableColumns={['Type','Pest Cat.','Pest','Dose']}
      renderRow={row => [
        <td key="t"><span className={`badge ${row.type==='organic'?'badge-green':'badge-red'}`}>{row.type}</span></td>,
        <td key="pc"><span className="badge badge-purple">{row.pestCategory}</span></td>,
        <td key="p"><strong>{row.pestName}</strong></td>,
        <td key="d"><span className="badge badge-red">{row.dose}</span></td>,
      ]}
    />
  );
}

/* ── Admin: Costing Data ──────────────────────────────────── */
export function AdminCostingPage() {
  const FIELDS = [
    { key:'costCategory', label:'Cost Category', type:'select', options:['seeds','land','nutrients_ch','nutrients_or','protection_ch','protection_or','labour','machinery','irrigation','implements','land_revenue','post_harvest','misc'] },
    { key:'item',         label:'Item / Service', labelOr:'ଆଇଟମ', type:'text', placeholder:'e.g. Deep Ploughing' },
    { key:'itemOr',       label:'Item (Odia)',   type:'text', placeholder:'e.g. ଗଭୀର ଚାଷ' },
    { key:'unit',         label:'Unit',          type:'text', placeholder:'e.g. per acre, per day, per bag' },
    { key:'rateMin',      label:'Min Rate (₹)',  type:'number', placeholder:'e.g. 800' },
    { key:'rateMax',      label:'Max Rate (₹)',  type:'number', placeholder:'e.g. 1500' },
    { key:'remarks',      label:'Remarks',       type:'text', placeholder:'Optional remarks' },
    { key:'adminNotes',   label:'Admin Notes',    type:'textarea', placeholder:'Internal notes...', fullWidth:true },
  ];
  return (
    <AdminDataManager
      title="Crop Costing Data"
      endpoint="costing"
      fields={FIELDS}
      tableColumns={['Category','Item','Unit','Min (₹)','Max (₹)']}
      renderRow={row => [
        <td key="cc"><span className="badge badge-gold">{row.costCategory}</span></td>,
        <td key="it"><strong>{row.item}</strong></td>,
        <td key="u" style={{ fontSize:'.82rem' }}>{row.unit}</td>,
        <td key="mn" style={{ color:'var(--success)',fontWeight:600 }}>₹{Number(row.rateMin||0).toLocaleString('en-IN')}</td>,
        <td key="mx" style={{ color:'var(--harvest)',fontWeight:600 }}>₹{Number(row.rateMax||0).toLocaleString('en-IN')}</td>,
      ]}
    />
  );
}

/* ── Admin: Field Data ────────────────────────────────────── */
export function AdminFieldDataPage() {
  const [entries, setEntries] = useState([]);
  const [filter,  setFilter]  = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/field-data').then(r => setEntries(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const downloadCSV = async () => {
    try {
      const token = localStorage.getItem('ks_token');
      const res = await fetch('http://krishiseva-backend-mvlv.onrender.com/api/field-data/download', { headers:{ Authorization:`Bearer ${token}` } });
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a'); a.href=url; a.download='field-data.csv'; a.click();
      window.URL.revokeObjectURL(url);
    } catch(e) { alert('Download failed'); }
  };

  const filtered = entries.filter(e => !filter ||
    e.userName?.toLowerCase().includes(filter.toLowerCase()) ||
    e.placeName?.includes(filter) ||
    e.crop?.toLowerCase().includes(filter.toLowerCase())
  );

  const totalHarvest = filtered.reduce((s,e) => s+(Number(e.harvestAmount)||0), 0);
  const totalRevenue = filtered.reduce((s,e) => s+(Number(e.totalRevenue)||0), 0);

  return (
    <AppLayout title="🌿 All Field Data">
      <PrintHeader title="Field Data Report" userName="Admin" />
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">All Farmer Field Data</h2>
          <p className="section-sub">
            {entries.length} entries · Harvest: {totalHarvest.toFixed(1)} qtl · Revenue: ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex gap-10 no-print">
          <input className="form-input" style={{ width:200 }} placeholder="Filter…" value={filter} onChange={e=>setFilter(e.target.value)} />
          <PrintBtn title="Field Data Report" />
          <button className="btn btn-sky" onClick={downloadCSV}>⬇️ CSV</button>
        </div>
      </div>

      {loading ? <Spinner /> : (
        filtered.length ? (
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead><tr>
                  <th>Date</th><th>Farmer</th><th>Place</th><th>Crop</th>
                  <th>pH</th><th>N/P/K</th><th>Harvest</th><th>Revenue</th><th>Nutrition</th>
                </tr></thead>
                <tbody>
                  {filtered.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontSize:'.76rem' }}>{new Date(e.submittedAt).toLocaleDateString('en-IN')}</td>
                      <td><strong>{e.userName}</strong></td>
                      <td style={{ fontSize:'.8rem' }}>{e.placeName}</td>
                      <td><span className="badge badge-green">{e.crop}</span></td>
                      <td>{e.soilPH||'–'}</td>
                      <td style={{ fontSize:'.76rem' }}>{e.residualN||'–'}/{e.residualP||'–'}/{e.residualK||'–'}</td>
                      <td>{e.harvestAmount||'–'}</td>
                      <td style={{ fontWeight:700, color:'var(--leaf)' }}>{e.totalRevenue ? `₹${Number(e.totalRevenue).toLocaleString('en-IN')}` : '–'}</td>
                      <td><span className={`badge ${e.nutritionType==='Organic'?'badge-green':'badge-amber'}`}>{e.nutritionType||'–'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState icon="📊" text="No field data yet." />
        )
      )}
    </AppLayout>
  );
}

/* ── Admin: Photos ────────────────────────────────────────── */
export function AdminPhotosPage() {
  const [photos,  setPhotos]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('');

  useEffect(() => {
    API.get('/photos').then(r => setPhotos(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = photos.filter(p => !filter ||
    p.userName?.toLowerCase().includes(filter.toLowerCase()) ||
    (p.tags||[]).some(t => t.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <AppLayout title="📷 All Photos">
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">All Farmer Photos</h2>
          <p className="section-sub">{photos.length} photos uploaded · Used for AI dataset building</p>
        </div>
        <input className="form-input" style={{ width:220 }} placeholder="Filter by farmer/tag…" value={filter} onChange={e=>setFilter(e.target.value)} />
      </div>

      {loading ? <Spinner /> : (
        filtered.length ? (
          <div className="photo-grid">
            {filtered.map(photo => (
              <div key={photo.id} className="photo-card">
                <img src={`http://krishiseva-backend-mvlv.onrender.com${photo.url}`} alt={photo.notes||'Farm photo'}
                  onError={e => { e.target.style.display='none'; }}
                  style={{ width:'100%', height:130, objectFit:'cover', display:'block' }} />
                <div className="photo-card-info">
                  <div style={{ fontWeight:600, fontSize:'.72rem' }}>{photo.userName}</div>
                  <div style={{ fontSize:'.68rem', color:'var(--earth)', marginBottom:3 }}>
                    {new Date(photo.uploadedAt).toLocaleDateString('en-IN')}
                  </div>
                  {(photo.tags||[]).map(t => <span key={t} className="photo-tag">{t}</span>)}
                  {photo.notes && <div style={{ fontSize:'.68rem', color:'var(--earth)', marginTop:3 }}>{photo.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="📷" text="No photos uploaded yet." />
        )
      )}
    </AppLayout>
  );
}

/* ── Admin: Form Queries ─────────────────────────────────── */
export function AdminFormQueriesPage() {
  const DEFAULT_FIELDS = ['soilPH','residualN','residualP','residualK','residualS','ec','organicCarbon','soilTexture','nutritionType','nutrientsUsed','nutritionCost','protectionType','protectionMaterials','protectionCost','labourCost','machineryCost','irrigationCost','seedCost','landRevenue','produceType','harvestAmount','marketPrice','totalRevenue','pestObserved','weatherCondition','remarks'];
  const [allQ,    setAllQ]    = useState([]);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({ field:'', label:'', labelOr:'', type:'text', unit:'', placeholder:'', category:'custom', options:'' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => { API.get('/form-queries').then(r => setAllQ(r.data)).catch(() => {}); }, []);

  const defaultQ = allQ.filter(q => DEFAULT_FIELDS.includes(q.field));
  const adminQ   = allQ.filter(q => !DEFAULT_FIELDS.includes(q.field));

  const addQ = async () => {
    setLoading(true);
    try {
      const payload = { ...form, options: form.type==='select' ? form.options.split(',').map(s=>s.trim()).filter(Boolean) : undefined };
      const r = await API.post('/form-queries', payload);
      setAllQ(prev => [...prev, r.data]);
      setModal(false);
      setSuccess('Query added!');
      setTimeout(() => setSuccess(''), 3000);
    } catch(e) { alert(e?.response?.data?.error||'Error'); }
    finally { setLoading(false); }
  };

  const delQ = async id => {
    if (!window.confirm('Delete this query?')) return;
    try { await API.delete(`/form-queries/${id}`); setAllQ(prev => prev.filter(q => q.id!==id)); }
    catch(e) { alert('Delete failed'); }
  };

  return (
    <AppLayout title="📝 Form Queries">
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">Data Entry Form Configuration</h2>
          <p className="section-sub">{allQ.length} total queries shown to farmers</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ field:'',label:'',labelOr:'',type:'text',unit:'',placeholder:'',category:'custom',options:'' }); setModal(true); }}>
          + Custom Query
        </button>
      </div>

      {success && <div className="alert alert-success mb-14">✅ {success}</div>}

      <div className="grid-2 gap-24">
        <div>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', marginBottom:12 }}>
            📋 Default System Queries ({defaultQ.length})
          </h3>
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Label</th><th>Label (Odia)</th><th>Type</th><th>Category</th></tr></thead>
                <tbody>
                  {defaultQ.map(q => (
                    <tr key={q.id}>
                      <td style={{ fontWeight:600, fontSize:'.82rem' }}>{q.label}</td>
                      <td style={{ fontSize:'.78rem', color:'var(--clay)' }}>{q.labelOr||'—'}</td>
                      <td><span className="badge badge-blue">{q.type}</span></td>
                      <td><span className="badge badge-amber">{q.category}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', marginBottom:12 }}>
            ✨ Custom Admin Queries ({adminQ.length})
          </h3>
          {adminQ.length ? (
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Label</th><th>Type</th><th>Category</th><th>Del</th></tr></thead>
                  <tbody>
                    {adminQ.map(q => (
                      <tr key={q.id}>
                        <td style={{ fontWeight:600, fontSize:'.82rem' }}>{q.label}</td>
                        <td><span className="badge badge-blue">{q.type}</span></td>
                        <td><span className="badge badge-amber">{q.category}</span></td>
                        <td><button className="btn btn-sm btn-danger" onClick={() => delQ(q.id)}>🗑</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="empty-state" style={{ padding:36 }}>
                <div className="ei">📝</div>
                <div>No custom queries yet.</div>
                <button className="btn btn-primary mt-12" onClick={() => setModal(true)}>+ Add First</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">+ Add Custom Query</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid-2" style={{ gap:14 }}>
                {[
                  { k:'field',       l:'Field Key (camelCase)', pl:'e.g. waterUsage'     },
                  { k:'label',       l:'English Label',         pl:'e.g. Water Usage'    },
                  { k:'labelOr',     l:'Odia Label (ଓଡ଼ିଆ)',    pl:'e.g. ଜଳ ବ୍ୟବହାର'    },
                  { k:'unit',        l:'Unit',                  pl:'e.g. L/day, kg/ha'   },
                  { k:'placeholder', l:'Placeholder',           pl:'e.g. Enter value…'   },
                ].map(f => (
                  <div key={f.k} className="form-group">
                    <label className="form-label">{f.l}</label>
                    <input className="form-input" placeholder={f.pl} value={form[f.k]||''}
                      onChange={e => setForm(p => ({...p,[f.k]:e.target.value}))} />
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Input Type</label>
                  <select className="form-select" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                    {['text','number','select','textarea'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                    {['soil','inputs','costs','output','observation','notes','custom'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {form.type==='select' && (
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">Options (comma separated)</label>
                    <input className="form-input" placeholder="Option A, Option B, Option C" value={form.options}
                      onChange={e => setForm(p=>({...p,options:e.target.value}))} />
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addQ} disabled={loading||!form.field||!form.label}>
                {loading?'⏳…':'✅ Add Query'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

/* ── Admin: AI Log ────────────────────────────────────────── */
export function AdminAILogPage() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/ai-log').then(r => setLogs(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="🤖 AI Query Log">
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">AI Fallback Query Log</h2>
          <p className="section-sub">{logs.length} queries submitted by farmers</p>
        </div>
        <PrintBtn title="AI Query Log" />
      </div>

      {loading ? <Spinner /> : (
        logs.length ? (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {logs.map(log => (
              <div key={log.id} className="card">
                <div className="card-header">
                  <span style={{ fontWeight:600, fontSize:'.875rem' }}>👤 {log.userId} {log.isMock && <span className="badge badge-grey">Mock</span>}</span>
                  <span style={{ fontSize:'.76rem', color:'var(--earth)' }}>{new Date(log.askedAt).toLocaleString('en-IN')}</span>
                </div>
                <div className="card-body">
                  <div style={{ fontWeight:600, marginBottom:8 }}>Q: {log.question}</div>
                  <div style={{ color:'var(--earth)', fontSize:'.855rem', lineHeight:1.7 }}>{log.answer}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="🤖" text="No AI queries yet." />
        )
      )}
    </AppLayout>
  );
}

/* ── Admin: All Orders ────────────────────────────────────── */
export function AdminOrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders').then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalRev = orders.reduce((s,o) => s+(Number(o.totalAmount)||0), 0);

  return (
    <AppLayout title="📦 All Orders">
      <div className="flex-between mb-20">
        <div>
          <h2 className="section-title">E-Commerce Orders</h2>
          <p className="section-sub">{orders.length} orders · ₹{totalRev.toLocaleString('en-IN')} revenue</p>
        </div>
        <PrintBtn title="All Orders" />
      </div>

      <div className="grid-3 mb-24">
        <div className="stat-card orange"><div className="stat-number">{orders.length}</div><div className="stat-label">Total Orders</div><div className="stat-icon">📦</div></div>
        <div className="stat-card green"><div className="stat-number">₹{totalRev.toLocaleString('en-IN')}</div><div className="stat-label">Revenue</div><div className="stat-icon">💰</div></div>
        <div className="stat-card blue"><div className="stat-number">{orders.filter(o=>o.paymentMethod==='Cash on Delivery').length}</div><div className="stat-label">COD Orders</div><div className="stat-icon">💵</div></div>
      </div>

      {loading ? <Spinner /> : (
        orders.length ? (
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead><tr>
                  <th>Order ID</th><th>Farmer</th><th>Date</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th>
                </tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><strong style={{ fontFamily:'monospace', fontSize:'.78rem' }}>{o.orderId}</strong></td>
                      <td>{o.userName}</td>
                      <td style={{ fontSize:'.76rem' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontSize:'.76rem' }}>{o.items?.slice(0,2).map(i=>i.name).join(', ')}{o.items?.length>2?` +${o.items.length-2} more`:''}</td>
                      <td style={{ fontWeight:700, color:'var(--harvest)' }}>₹{Number(o.totalAmount).toLocaleString('en-IN')}</td>
                      <td><span className="badge badge-blue">{o.paymentMethod}</span></td>
                      <td><span className="badge badge-green">{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState icon="📦" text="No orders yet." />
        )
      )}
    </AppLayout>
  );
}
