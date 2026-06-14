import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext';
import { LANGUAGES } from '../utils/translation';

// ============================================================
//  LOGIN PAGE
// ============================================================
export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login, language, setLanguage } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const u = await login(username, password);
      navigate(u.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch(err) {
      setError(err?.response?.data?.error || 'Invalid username or password');
    } finally { setLoading(false); }
  };

  const fill = type => {
    if (type === 'admin')  { setUsername('admin');   setPassword('admin123'); }
    else                   { setUsername('farmer1'); setPassword('farmer123'); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="text-center mb-24">
          <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>🌾</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2.1rem', color:'var(--leaf)', lineHeight:1.1 }}>
            KrishiSeva
          </h1>
          <p style={{ fontSize:'.78rem', color:'var(--earth)', letterSpacing:'1.2px', textTransform:'uppercase', marginTop:4 }}>
            Agricultural Management Platform
          </p>
          <p style={{ fontSize:'1rem', color:'var(--clay)', marginTop:6 }}>
            କୃଷି ସେବା ପ୍ଲାଟଫର୍ମ · ଓଡ଼ିଶା
          </p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-16">
            <label className="form-label">
              {language==='or'?'ଉପଯୋଗକର୍ତ୍ତା ନାମ':language==='hi'?'उपयोगकर्ता नाम':'Username'}
            </label>
            <input className="form-input" type="text" autoComplete="username"
              value={username} onChange={e=>setUsername(e.target.value)} placeholder="Enter username" required />
          </div>
          <div className="form-group mb-24">
            <label className="form-label">
              {language==='or'?'ପାସୱାର୍ଡ':language==='hi'?'पासवर्ड':'Password'}
            </label>
            <input className="form-input" type="password" autoComplete="current-password"
              value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? '⏳ Logging in…' : '🌿 Login to Platform'}
          </button>
        </form>
        <div style={{
  textAlign:'center',
  marginTop:16,
  fontSize:'.9rem'
}}>
  New user?{' '}
  <Link
    to="/register"
    style={{
      color:'var(--leaf)',
      fontWeight:600,
      textDecoration:'none'
    }}
  >
    Create Account
  </Link>
</div>

        <div className="divider" />
        <div className="grid-2" style={{ gap:10 }}>
          <button className="btn btn-secondary btn-sm" onClick={()=>fill('user')}>👨‍🌾 Demo Farmer</button>
          <button className="btn btn-secondary btn-sm" onClick={()=>fill('admin')}>🛡️ Demo Admin</button>
        </div>

        <div style={{ marginTop:18 }}>
          <div style={{ fontSize:'.72rem', color:'var(--earth)', marginBottom:6, textTransform:'uppercase', letterSpacing:'.8px' }}>
            ଭାଷା ଚୟନ / Select Language
          </div>
          <div className="chip-group">
            {LANGUAGES.map(l => (
              <button key={l.code} className={`chip ${language===l.code?'active':''}`}
                onClick={()=>setLanguage(l.code)} style={{ flex:1 }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign:'center', fontSize:'.7rem', color:'var(--clay)', marginTop:18, lineHeight:1.7 }}>
          Farmer: <strong>farmer1 / farmer123</strong><br/>
          Admin: <strong>admin / admin123</strong>
        </p>
      </div>
    </div>
  );
}

// ============================================================
//  SUBSCRIBE PAGE
// ============================================================
export function SubscribePage() {
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');
  const { user, refreshUser, language } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/plans').then(r => setPlans(r.data)).catch(() => {});
  }, []);

  const handleSubscribe = async (planId) => {
    setLoading(true); setError('');
    try {
      const orderRes = await API.post('/payment/create-order', { planId });
      const order = orderRes.data;

      if (order.isMock) {
        // Mock payment – activate directly
        await API.post('/payment/verify', {
          planId,
          isMock: true,
          razorpay_order_id: order.id,
          razorpay_payment_id: 'mock_pay_' + Date.now(),
          razorpay_signature: 'mock_sig',
        });
        await refreshUser();
        setSuccess(language==='or' ? 'ସଦସ୍ୟପଦ ସଫଳ ହୋଇଛି!' : 'Subscription activated successfully!');
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      // Real Razorpay checkout
      const options = {
        key: order.key_id,
        amount:      order.amount,
        currency:    'INR',
        name:        'KrishiSeva',
        description: order.planName,
        order_id:    order.id,
        handler: async (response) => {
          try {
            await API.post('/payment/verify', {
              planId,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            await refreshUser();
            setSuccess(language==='or' ? 'ସଦସ୍ୟପଦ ସଫଳ!' : 'Subscription activated!');
            setTimeout(() => navigate('/dashboard'), 1500);
          } catch(e) { setError('Payment verification failed'); }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme:   { color: '#2D6A2D' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch(e) {
      setError(e?.response?.data?.error || 'Payment failed');
    } finally { setLoading(false); }
  };

  const planColors = { monthly:'var(--leaf)', quarterly:'var(--sky)', yearly:'var(--harvest)' };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,var(--soil),#3D2408,var(--leaf))', padding:'40px 20px', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ maxWidth:900, width:'100%' }}>
        <div className="text-center mb-28" style={{ color:'white' }}>
          <div style={{ fontSize:'3rem', marginBottom:10 }}>⭐</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2.2rem', color:'var(--sprout)', marginBottom:6 }}>
            {language==='or' ? 'ସଦସ୍ୟ ଯୋଜନା' : 'Subscription Plans'}
          </h1>
          <p style={{ color:'rgba(255,255,255,.7)', fontSize:'.9rem' }}>
            {language==='or' ? 'ଆପଣଙ୍କ ଉପଯୁକ୍ତ ଯୋଜନା ଚୟନ କରନ୍ତୁ' : 'Choose the plan that fits your farming needs'}
          </p>
        </div>

        {success && <div className="alert alert-success mb-20" style={{ maxWidth:500, margin:'0 auto 20px' }}>✅ {success}</div>}
        {error   && <div className="alert alert-error mb-20"   style={{ maxWidth:500, margin:'0 auto 20px' }}>⚠️ {error}</div>}

        <div className="grid-3" style={{ gap:20 }}>
          {plans.map(plan => (
            <div key={plan.id} className={`pricing-card ${plan.popular?'popular':''}`}>
              {plan.popular && <div className="popular-badge">{language==='or'?'ସ‌ର‌୍ବ‌ ଲ‌ୋ‌କ‌ପ‌୍ର‌ିୟ':'Most Popular'}</div>}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:'1.5rem', marginBottom:6 }}>
                  {plan.id==='monthly'?'🌱':plan.id==='quarterly'?'🌿':'🌳'}
                </div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', color:'var(--soil)' }}>
                  {language==='or' ? plan.nameOr : plan.name}
                </h3>
                <div style={{ marginTop:10 }}>
                  <span className="price-amount">₹{plan.price}</span>
                  <span className="price-period"> / {plan.duration} {language==='or'?'ଦ‌ିନ':'days'}</span>
                </div>
              </div>
              <div style={{ marginBottom:20 }}>
                {plan.features.map(f => (
                  <div key={f} className="price-feature">
                    <span style={{ color:'var(--leaf)', fontWeight:700 }}>✓</span>
                    <span style={{ fontSize:'.84rem' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                className="btn btn-lg w-full"
                style={{ background: planColors[plan.id] || 'var(--leaf)', color:'white' }}
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
              >
                {loading ? '⏳…' : (language==='or' ? 'ଏ‌ବ‌େ ଚ‌ୟ‌ନ ହ‌ୁ' : 'Select Plan')}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-24">
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')} style={{ background:'rgba(255,255,255,.15)', color:'white', borderColor:'rgba(255,255,255,.3)' }}>
            ← {language==='or'?'ଡ‌୍ୟ‌ାଶ‌ବ‌ୋ‌ର‌୍ଡ‌କ‌ୁ ଫ‌ିର‌ନ‌ୁ':'Back to Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
