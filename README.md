# 🌾 KrishiSeva v3 – Agricultural Management Platform

**Full-Stack Platform for Odisha Farmers**
React.js + Node.js/Express | Trilingual: English / ଓଡ଼ିଆ / हिन्दी

---

## 🚀 Quick Start

### Terminal 1 — Backend
```bash
cd backend
npm install
node server.js
# Runs on http://krishiseva-backend-mvlv.onrender.com
```

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

---

## 🔐 Demo Credentials

| Role    | Username  | Password   |
|---------|-----------|------------|
| Admin   | admin     | admin123   |
| Farmer  | farmer1   | farmer123  |
| Farmer  | farmer2   | farmer123  |

---

## 👤 User Self-Registration
Visit: `http://localhost:3000/register`

**2-step registration:**
1. **Step 1 — Personal Info:** First name, Last name, Email (with live uniqueness check), Mobile (with country code selector)
2. **Step 2 — Login Details:** Username (with live availability check + suggested names), Password (strength meter), Confirm password

Auto-login after registration.

---

## 🛡️ Admin Setup (First Time)
Visit: `http://localhost:3000/admin-setup`

Enter the **ADMIN_SETUP_KEY** from your `.env` file:
```
ADMIN_SETUP_KEY=krishiseva-admin-setup-2024
```
Set your own admin username and password (min 8 characters).

**Authenticated Admin Changes** (after login):
- `/admin-setup` → Change Password tab
- `/admin-setup` → Change Username tab

---

## 📋 Platform Features

### For Farmers (requires subscription for starred items)
| Feature | Description | Subscription |
|---------|-------------|-------------|
| 🌾 Cultivation | Crop-wise practices — all 9 categories | ⭐ Required |
| 🧪 Nutrients | Organic & chemical by growth stage | ⭐ Required |
| 🛡️ Plant Protection | Pests, fungi, bacteria, weeds, rodents | ⭐ Required |
| 💰 Costing | Full investment analysis per crop | ⭐ Required |
| 🛒 E-Commerce | Order farm inputs & implements | ⭐ Required |
| 📋 Field Data | Record soil health, inputs, harvest | Free |
| ⛅ Weather | 5-day forecast & farm advisory | Free |
| 🤖 Ask AI | ChatGPT when admin data unavailable | Free |
| 📷 Photos | Upload & tag field photos | Free |

### For Admin
- Manage farmers & assign plots
- Add cultivation, nutrient, protection, costing data per crop
- View all field data + CSV download
- Configure data entry form queries
- View all photos & AI query log
- E-commerce order management

---

## 🌾 Crop Categories (9)
Cereals | Pulses | Vegetables | Fruits | Oilseeds | Spices | Medicinal Plants | Flowers | Condiments

Each with full Odia translations (ଧାନ, ଗହମ, ଟମାଟ, ଆମ୍ବ…)

---

## 🔑 API Keys to Add (backend/.env)

```env
# Razorpay — razorpay.com (free test account)
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx

# OpenWeather — openweathermap.org (free tier)
WEATHER_API_KEY=xxxx

# OpenAI — platform.openai.com
OPENAI_API_KEY=sk-xxxx
```

---

## 📦 Project Structure
```
krishiseva3/
├── backend/
│   ├── server.js          # All API routes + Registration + Admin setup
│   ├── dataStore.js       # In-memory DB (swap to MongoDB/PostgreSQL)
│   ├── data/cropMaster.js # 9 crop categories, pests, costs — full Odia
│   └── .env               # API keys
└── frontend/
    └── src/
        ├── App.js                    # Router + guards
        ├── context/AuthContext.js    # Auth + register() + language
        ├── utils/translation.js      # EN/OR/HI + voice assistant
        ├── components/shared/        # UIKit, AppLayout, PrintBtn…
        └── pages/
            ├── RegisterPages.js      # User registration + Admin setup
            ├── AuthPages.js          # Login + Subscribe
            ├── UserPages.js          # Dashboard, Weather, Ask AI
            ├── ConsultancyPages.js   # Cultivation, Nutrients, Protection, Costing, Photos
            ├── DataPages.js          # Data Entry, My Data, E-Commerce, Orders
            └── AdminPages.js         # All 12 admin panels
```

---

## 🎙️ Odia Voice Assistant
Tap the 🎙️ mic button on any page for Odia TTS narration of that page's content.
Uses Web Speech API — works in Chrome/Edge with Odia/Hindi voice.

---

## 🖨️ Print Support
Every data page has a **Print** button. Print styles hide the sidebar,
add a header with farmer name, date & platform logo.

---

## 🔮 Next Steps
- [ ] Add API keys to `.env`
- [ ] Migrate `dataStore.js` → MongoDB/PostgreSQL
- [ ] Cloud storage for photos (AWS S3 / GCP / Cloudflare R2)
- [ ] Build Android/iOS app (React Native or PWA)
- [ ] Add Google Maps for plot mapping
- [ ] Deploy: Backend → Railway/Render, Frontend → Vercel/Netlify
import SubWall from '../components/SubWall';