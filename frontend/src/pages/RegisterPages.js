import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext';

const COUNTRY_CODES = [
  { code:'+91',  flag:'🇮🇳', name:'India'      },
  { code:'+1',   flag:'🇺🇸', name:'USA'        },
  { code:'+44',  flag:'🇬🇧', name:'UK'         },
  { code:'+61',  flag:'🇦🇺', name:'Australia'  },
  { code:'+971', flag:'🇦🇪', name:'UAE'        },
  { code:'+65',  flag:'🇸🇬', name:'Singapore'  },
  { code:'+880', flag:'🇧🇩', name:'Bangladesh' },
  { code:'+977', flag:'🇳🇵', name:'Nepal'      },
  { code:'+94',  flag:'🇱🇰', name:'Sri Lanka'  },
];

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { ok: password.length >= 6,      label:'Min 6 chars'  },
    { ok: /\d/.test(password),        label:'Has a number' },
    { ok: /[a-zA-Z]/.test(password),  label:'Has a letter' },
    { ok: !/\s/.test(password),       label:'No spaces'    },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['','#C62828','#E65100','#F9A825','#2E7D32'];
  const labels = ['','Weak','Fair','Good','Strong'];
  return (
    <div style={{ marginTop:6 }}>
      <div style={{ display:'flex', gap:4, marginBottom:4 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex:1, height:4, borderRadius:2,
            background: i<=score ? colors[score] : 'var(--straw)', transition:'background .3s' }} />
        ))}
      </div>
      <div style={{ fontSize:'.72rem', color:colors[score], fontWeight:600 }}>
        {labels[score]}
        {checks.filter(c=>!c.ok).map(c=>(
          <span key={c.label} style={{ color:'var(--earth)', fontWeight:400, marginLeft:8 }}>
            {'\u00b7'} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Field({ label, labelOr, children, error, ok, hint }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{labelOr && <span className="form-label-or"> {'\u00b7'} {labelOr}</span>}
      </label>
      {children}
      {error && <div style={{ fontSize:'.72rem', color:'var(--danger)', marginTop:3 }}>{'\u26a0\ufe0f'} {error}</div>}
      {ok    && <div style={{ fontSize:'.72rem', color:'var(--success)', marginTop:3 }}>{'\u2705'} {ok}</div>}
      {hint && !error && !ok && <div className="form-hint">{hint}</div>}
    </div>
  );
}

// ======================================================
//  USER REGISTRATION PAGE
// ======================================================
export function RegisterPage() {
  const { register, language } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState({
    firstName:'', lastName:'', email:'', phone:'', countryCode:'+91',
    username:'', password:'', confirmPass:'',
  });
  const [errors,   setErrors]   = useState({});
  const [avail,    setAvail]    = useState({ username:null, email:null });
  const [checking, setChecking] = useState({ username:false, email:false });
  const [loading,  setLoading]  = useState(false);
  const [srvError, setSrvError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const checkUsername = useCallback(async (u) => {
    if (u.length < 3) return;
    setChecking(p => ({ ...p, username:true }));
    try {
      const r = await API.get('/auth/check-username/' + encodeURIComponent(u));
      setAvail(p => ({ ...p, username: r.data.available }));
    } catch(e) {}
    finally { setChecking(p => ({ ...p, username:false })); }
  }, []);

  const checkEmail = useCallback(async (e) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return;
    setChecking(p => ({ ...p, email:true }));
    try {
      const r = await API.get('/auth/check-email/' + encodeURIComponent(e));
      setAvail(p => ({ ...p, email: r.data.available }));
    } catch(ex) {}
    finally { setChecking(p => ({ ...p, email:false })); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (form.username.length >= 3) checkUsername(form.username); }, 600);
    return () => clearTimeout(t);
  }, [form.username, checkUsername]);

  useEffect(() => {
    const t = setTimeout(() => { if (form.email.includes('@')) checkEmail(form.email); }, 800);
    return () => clearTimeout(t);
  }, [form.email, checkEmail]);

  const validateStep1 = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    else if (form.firstName.trim().length < 2) e.firstName = 'Min 2 characters';
    if (!form.lastName.trim()) e.lastName = 'Required';
    else if (form.lastName.trim().length < 2) e.lastName = 'Min 2 characters';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    else if (avail.email === false) e.email = 'Email already registered';
    if (!form.phone.trim()) e.phone = 'Required';
    else if (!/^\d{7,15}$/.test(form.phone.trim())) e.phone = 'Enter 7-15 digits only, no spaces';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Required';
    else if (form.username.trim().length < 3) e.username = 'Min 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Letters, numbers, underscore only';
    else if (avail.username === false) e.username = 'Username already taken';
    if (!form.password) e.password = 'Required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    if (!form.confirmPass) e.confirmPass = 'Required';
    else if (form.password !== form.confirmPass) e.confirmPass = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep1()) setStep(2); };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateStep2()) return;
    setLoading(true); setSrvError('');
    try {
      const u = await register({
        firstName:   form.firstName.trim(),
        lastName:    form.lastName.trim(),
        username:    form.username.trim().toLowerCase(),
        password:    form.password,
        email:       form.email.trim().toLowerCase(),
        phone:       form.phone.trim(),
        countryCode: form.countryCode,
      });
      navigate(u.role === 'admin' ? '/admin' : '/dashboard', { replace:true });
    } catch(err) {
      setSrvError(err?.response?.data?.error || 'Registration failed. Please try again.');
      setStep(1);
    } finally { setLoading(false); }
  };

  const suggestedNames = () => {
    const base = (form.firstName + form.lastName).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!base) return [];
    return [
      base,
      form.firstName.toLowerCase() + '_' + form.lastName.toLowerCase(),
      base + Math.floor(10 + Math.random() * 90),
      base + '_farm',
    ].slice(0, 4);
  };

  const L = language;
  const BOX  = { background:'white', borderRadius:22, padding:'40px 44px', width:'100%', maxWidth:520, boxShadow:'0 24px 64px rgba(0,0,0,.35)' };
  const WRAP = { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    background:'linear-gradient(145deg,#1B4332 0%,#2D6A2D 50%,#1565C0 100%)', padding:20 };

  return (
    <div style={WRAP}>
      <div style={BOX}>

        <div className="text-center mb-24">
  <div style={{ fontSize:'3rem', marginBottom:8 }}>{'🌱'}</div>

  <h1 style={{
    fontFamily:'var(--font-display)',
    fontSize:'1.9rem', color:'var(--leaf)' }}>
            {L === 'or' ? '\u0a28\u0b42\u0b06 \u0b16\u0b3e\u0b24\u0b3e \u0b16\u0b4b\u0b32\u0b28\u0b4d\u0b24\u0b41' : 'Create Your Account'}
          </h1>
          <p style={{ fontSize:'.78rem', color:'var(--earth)', marginTop:4 }}>
            {L === 'or' ? 'KrishiSeva \u0b2a\u0b4d\u0b32\u0b3e\u0b1f\u0b2b\u0b30\u0b4d\u0b2e\u0b30\u0b47 \u0b2f\u0b4b\u0b17 \u0b26\u0b3f\u0b05\u0b28\u0b4d\u0b24\u0b41' : 'Join KrishiSeva Agricultural Platform'}
          </p>
        </div>

        <div style={{ display:'flex', alignItems:'center', marginBottom:24 }}>
          {[
            { n:1, en:'Personal Info',  or:'\u0b2c\u0b4d\u0b2f\u0b15\u0b4d\u0b24\u0b3f\u0b17\u0b24 \u0b2c\u0b3f\u0b2c\u0b30\u0b23' },
            { n:2, en:'Login Details',  or:'\u0b32\u0b17\u0b07\u0b28 \u0b2c\u0b3f\u0b2c\u0b30\u0b23' },
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <div style={{
                  width:30, height:30, borderRadius:'50%', display:'flex',
                  alignItems:'center', justifyContent:'center',
                  background: step >= s.n ? 'var(--leaf)' : 'var(--straw)',
                  color: step >= s.n ? 'white' : 'var(--earth)',
                  fontWeight:700, fontSize:'.84rem', transition:'all .3s',
                }}>{step > s.n ? '\u2713' : s.n}</div>
                <span style={{ fontSize:'.78rem', fontWeight:step === s.n ? 700 : 400,
                  color: step >= s.n ? 'var(--leaf)' : 'var(--earth)' }}>
                  {L === 'or' ? s.or : s.en}
                </span>
              </div>
              {i < 1 && <div style={{ flex:1, height:2, background:'var(--straw)', margin:'0 10px' }} />}
            </React.Fragment>
          ))}
        </div>

        {srvError && <div className="alert alert-error">{srvError}</div>}

        <form onSubmit={handleSubmit}>

          {step === 1 && (
            <div>
              <div className="grid-2 mb-14" style={{ gap:14 }}>
                <Field label={L === 'or' ? '\u0b2a\u0b4d\u0b30\u0b25\u0b2e \u0b28\u0b3e\u0b2e' : 'First Name'} error={errors.firstName}>
                  <input className="form-input" placeholder={L === 'or' ? 'e.g. \u0b30\u0b3e\u0b2e\u0b47\u0b36' : 'e.g. Ramesh'}
                    value={form.firstName} onChange={e => set('firstName', e.target.value)}
                    style={{ borderColor: errors.firstName ? 'var(--danger)' : '' }} />
                </Field>
                <Field label={L === 'or' ? '\u0b36\u0b47\u0b37 \u0b28\u0b3e\u0b2e' : 'Last Name'} error={errors.lastName}>
                  <input className="form-input" placeholder={L === 'or' ? 'e.g. \u0b2a\u0b1f\u0b4d\u0b1f\u0b28\u0b3e\u0b2f\u0b15' : 'e.g. Pattanaik'}
                    value={form.lastName} onChange={e => set('lastName', e.target.value)}
                    style={{ borderColor: errors.lastName ? 'var(--danger)' : '' }} />
                </Field>
              </div>

              <Field
                label={L === 'or' ? '\u0b07-\u0b2e\u0b47\u0b32 \u0b20\u0b3f\u0b15\u0b23\u0b3e' : 'Email Address'}
                error={errors.email}
                ok={avail.email === true && !errors.email ? (L === 'or' ? '\u0b07-\u0b2e\u0b47\u0b32 \u0b09\u0b2a\u0b32\u0b2c\u0b4d\u0b27' : 'Email available') : ''}
                hint={checking.email ? 'Checking...' : ''}>
                <input className="form-input" type="email" placeholder="example@email.com"
                  value={form.email}
                  onChange={e => { set('email', e.target.value); setAvail(p => ({ ...p, email:null })); }}
                  style={{ borderColor: errors.email ? 'var(--danger)' : avail.email === true ? 'var(--leaf)' : '' }} />
              </Field>

              <div className="form-group mt-14">
                <label className="form-label">
                  {L === 'or' ? '\u0b2e\u0b4b\u0b2c\u0b3e\u0b07\u0b32 \u0b28\u0b2e\u0b4d\u0b2c\u0b30' : 'Mobile Number'}
                </label>
                <div style={{ display:'flex', gap:8 }}>
                  <select className="form-select" style={{ width:150, flexShrink:0 }}
                    value={form.countryCode} onChange={e => set('countryCode', e.target.value)}>
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code} {c.name}</option>
                    ))}
                  </select>
                  <input className="form-input" type="tel" placeholder="10-digit number"
                    value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, ''))}
                    maxLength={15} style={{ borderColor: errors.phone ? 'var(--danger)' : '' }} />
                </div>
                {errors.phone && <div style={{ fontSize:'.72rem', color:'var(--danger)', marginTop:3 }}>{errors.phone}</div>}
                <div className="form-hint">{L === 'or' ? '\u0b16\u0b3e\u0b32\u0b3f \u0b38\u0b02\u0b16\u0b4d\u0b2f\u0b3e \u0b32\u0b3f\u0b16' : 'Numbers only, no spaces or dashes'}</div>
              </div>

              <button type="button" className="btn btn-primary btn-lg w-full mt-20" onClick={handleNext}>
                {L === 'or' ? '\u0b05\u0b17\u0b4d\u0b30\u0b17\u0b3e\u0b2e\u0b40 \u2192' : 'Next \u2192'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <Field
                label={L === 'or' ? '\u0b09\u0b2a\u0b2f\u0b4b\u0b17\u0b15\u0b30\u0b4d\u0b24\u0b4d\u0b24\u0b3e \u0b28\u0b3e\u0b2e' : 'Username'}
                error={errors.username}
                ok={avail.username === true && !errors.username && form.username.length >= 3
                  ? (L === 'or' ? '\u0b09\u0b2a\u0b32\u0b2c\u0b4d\u0b27 \u2705' : 'Username available!') : ''}
                hint={checking.username ? 'Checking...' : 'Letters, numbers and _ only'}>
                <input className="form-input" placeholder="e.g. ramesh_patra123"
                  value={form.username}
                  onChange={e => { set('username', e.target.value.replace(/[^a-zA-Z0-9_]/g, '')); setAvail(p => ({ ...p, username:null })); }}
                  style={{ borderColor: errors.username ? 'var(--danger)' : avail.username === true ? 'var(--leaf)' : '' }} />
              </Field>

              {(form.firstName || form.lastName) && (
                <div style={{ marginTop:4, marginBottom:14 }}>
                  <div style={{ fontSize:'.72rem', color:'var(--earth)', marginBottom:5 }}>
                    {L === 'or' ? '\u0b38\u0b41\u0b1d\u0b3e\u0b0f \u0b28\u0b3e\u0b2e:' : 'Suggested usernames:'}
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {suggestedNames().map(s => (
                      <button key={s} type="button" onClick={() => set('username', s)}
                        style={{ padding:'3px 10px', borderRadius:99, border:'1px solid var(--straw)',
                          background:'var(--cream)', fontSize:'.75rem', cursor:'pointer', color:'var(--sky)' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Field label={L === 'or' ? '\u0b2a\u0b3e\u0b38\u0b5f\u0b3e\u0b30\u0b4d\u0b21' : 'Password'} error={errors.password}>
                <div style={{ position:'relative' }}>
                  <input
                    className="form-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={L === 'or' ? '********' : 'Enter password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    style={{
                      paddingRight: 40,
                      borderColor: errors.password ? 'var(--danger)' : ''
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </Field>

              <Field label={L === 'or' ? '\u0b30\u0b3f\u0b2a\u0b3e\u0b38\u0b5f\u0b3e\u0b30\u0b4d\u0b21' : 'Confirm Password'} error={errors.confirmPass}>
                <input
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={L === 'or' ? 'Re-enter password' : 'Re-enter password'}
                  value={form.confirmPass}
                  onChange={e => set('confirmPass', e.target.value)}
                  style={{ borderColor: errors.confirmPass ? 'var(--danger)' : '' }}
                />
              </Field>

              <div style={{ display:'flex', gap:10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button type="submit" className="btn btn-primary btn-lg" style={{ flex:1 }} disabled={loading}>
                  {loading ? (L === 'or' ? '\u0b38\u0b3e\u0b02\u0b1a\u0b3f\u0b2f\u0b15\u0b4d\u0b24\u0b3f...' : 'Registering...') : (L === 'or' ? '\u0b06\u0b2b\u0b3f\u0b15\u0b4d\u0b24 \u0b2a\u0b3f\u0b28\u0b3e' : 'Create Account')}
                </button>
              </div>
            </div>
          )}
        </form>

        <p style={{ textAlign:'center', fontSize:'.78rem', color:'var(--earth)', marginTop:20 }}>
          <Link to="/login" style={{ color:'var(--leaf)', fontWeight:600 }}>{'\u2190'} {L === 'or' ? '\u0b32\u0b4b\u0b17\u0b4d\u0b4f\u0b28\u0b4d' : 'Back to Login'}</Link>
        </p>
      </div>
    </div>
  );
}
