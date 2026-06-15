// ============================================================
//  KrishiSeva v3 – Backend API Server
//  NEW: All crop categories, nutrients, protection, costing,
//       photo upload with tags, ChatGPT fallback, weather
// ============================================================
require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const jwt     = require("jsonwebtoken");
const bcrypt  = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const axios   = require("axios");
const db      = require("./dataStore");
const mongoose = require("mongoose");
const User = require("./models/user");
const { CROP_CATEGORIES, PEST_CATEGORIES, COST_CATEGORIES, GROWTH_STAGES, APP_METHODS } = require("./data/cropMaster");

const app  = express();
const PORT = process.env.PORT || 5000;
console.log("__dirname =", __dirname);
console.log("cwd =", process.cwd());
console.log("MONGO_URI =", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.error("MongoDB Error:", err));
const JWT  = process.env.JWT_SECRET || "ks-v3-secret";

// ── Multer (photo uploads) ──────────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => cb(null, `${Date.now()}_${uuidv4().slice(0,8)}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|heic/;
    cb(null, allowed.test(file.mimetype));
  },
});

// ── Razorpay ────────────────────────────────────────────────
let razorpay;
try {
  const Razorpay = require("razorpay");
  if (process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes("YOUR")) {
    razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  }
} catch {}

app.use(cors({
  origin: [
    "https://project-lqbxc-jbmabuv6v-dhanraj11031995s-projects.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static(uploadsDir));

// ── Middleware ──────────────────────────────────────────────
const auth = (req, res, next) => {
  const token = (req.headers.authorization || "").split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try { req.user = jwt.verify(token, JWT); next(); }
  catch { res.status(401).json({ error: "Invalid token" }); }
};
const adminOnly = (req, res, next) =>
  req.user.role === "admin" ? next() : res.status(403).json({ error: "Admin only" });

const requireSub = (mod) => (req, res, next) => {
  if (req.user.role === "admin") return next();
  const u = db.users.find(u => u.id === req.user.id);
  if (!u) {
  return res.status(404).json({ error: "User not found" });
}
  if (!u) return res.status(404).json({ error: "User not found" });
  const s = u.subscription;
  if (!s?.active) return res.status(402).json({ error: "subscription_required" });
  if (s.expiresAt && new Date(s.expiresAt) < new Date()) return res.status(402).json({ error: "subscription_expired" });
  next();
};

// ============================================================
//  MASTER DATA (open, no auth needed for catalogue)
// ============================================================
app.get("/api/health", (req, res) => res.json({ status: "OK", version: "3.0.0" }));
app.get("/api/master/crops",       (req, res) => res.json(CROP_CATEGORIES));
app.get("/api/master/pests",       (req, res) => res.json(PEST_CATEGORIES));
app.get("/api/master/costs",       (req, res) => res.json(COST_CATEGORIES));
app.get("/api/master/stages",      (req, res) => res.json(GROWTH_STAGES));
app.get("/api/master/methods",     (req, res) => res.json(APP_METHODS));

// ============================================================
//  AUTH
// ============================================================
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({
  username
});
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT, { expiresIn: "24h" });
  const { password: _, ...safe } = user;
  res.json({ token, user: safe });
});
app.get("/api/auth/me", auth, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  const { password: _, ...safe } = user;
  res.json(safe);
});

// ============================================================
//  SUBSCRIPTION & PAYMENT
// ============================================================
app.get("/api/plans", (req, res) => res.json(db.subscriptionPlans));

app.post("/api/payment/create-order", auth, async (req, res) => {
  const { planId } = req.body;
  const plan = db.subscriptionPlans.find(p => p.id === planId);
  if (!plan) return res.status(404).json({ error: "Plan not found" });
  if (!razorpay) {
    return res.json({ id: "mock_" + uuidv4().slice(0,8), amount: plan.price * 100, currency: "INR", planId, planName: plan.name, isMock: true });
  }
  try {
    const order = await razorpay.orders.create({ amount: plan.price * 100, currency: "INR", receipt: `ks_${req.user.id}_${Date.now()}`, notes: { userId: req.user.id, planId } });
    res.json({ ...order, planId, planName: plan.name });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/payment/verify", auth, (req, res) => {
  const { planId, isMock, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const plan = db.subscriptionPlans.find(p => p.id === planId);
  if (!plan) return res.status(404).json({ error: "Plan not found" });
  if (!isMock && razorpay) {
    const crypto = require("crypto");
    const sig = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex");
    if (sig !== razorpay_signature) return res.status(400).json({ error: "Verification failed" });
  }
  const idx = db.users.findIndex(u => u.id === req.user.id);
  const expiresAt = new Date(Date.now() + plan.duration * 86400000).toISOString();
  db.users[idx].subscription = { active: true, plan: planId, expiresAt, accessModules: ["crop_cycle","nutrients","protection","ecommerce","costing"], activatedAt: new Date().toISOString() };
  const payment = { id: uuidv4(), userId: req.user.id, userName: req.user.name, planId, planName: plan.name, amount: plan.price, orderId: razorpay_order_id, paymentId: razorpay_payment_id, status: "success", paidAt: new Date().toISOString(), expiresAt };
  db.payments.push(payment);
  const { password: _, ...safe } = db.users[idx];
  res.json({ success: true, user: safe, payment });
});

app.get("/api/payment/history", auth, (req, res) => {
  if (req.user.role === "admin") return res.json(db.payments);
  res.json(db.payments.filter(p => p.userId === req.user.id));
});

// ============================================================
//  PLACES & PLOTS
// ============================================================
app.get("/api/places", auth, (req, res) => {
  if (req.user_role === "admin") {
    return res.json(db.places);
  }

  const u = db.users.find(u => u.id === req.user.id);

  if (!u) {
    return res.status(404).json({
      error: "User not found"
    });
  }

  res.json(
    db.places
      .filter(p =>
        (u?.assignedPlaces || []).includes(p.id)
      )
      .map(pl => ({
        ...pl,
        plots: pl.plots.filter(
          pt => pt.assignedUser === req.user.id
        )
      }))
  );
});
app.post("/api/places", auth, adminOnly, (req, res) => {
  const p = { id: uuidv4(), plots: [], ...req.body }; db.places.push(p); res.status(201).json(p);
});
app.post("/api/places/:pid/plots", auth, adminOnly, (req, res) => {
  const pl = db.places.find(p => p.id === req.params.pid);
  if (!pl) return res.status(404).json({ error: "Place not found" });
  const plot = { id: uuidv4(), ...req.body }; pl.plots.push(plot); res.status(201).json(plot);
});
app.put("/api/places/:pid/plots/:plid", auth, adminOnly, (req, res) => {
  const pl = db.places.find(p => p.id === req.params.pid);
  if (!pl) return res.status(404).json({ error: "Not found" });
  const i = pl.plots.findIndex(p => p.id === req.params.plid);
  if (i === -1) return res.status(404).json({ error: "Plot not found" });
  pl.plots[i] = { ...pl.plots[i], ...req.body }; res.json(pl.plots[i]);
});

// ============================================================
//  CULTIVATION DATA (Admin manages, users read)
// ============================================================
app.get("/api/cultivation", auth, (req, res) => {
  const { cropId, cropCategory } = req.query;
  let data = db.cultivationData;
  if (cropId) data = data.filter(d => d.cropId === cropId);
  if (cropCategory) data = data.filter(d => d.cropCategory === cropCategory);
  res.json(data);
});

app.post("/api/cultivation", auth, adminOnly, (req, res) => {
  const entry = { id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...req.body };
  db.cultivationData.push(entry); res.status(201).json(entry);
});

app.put("/api/cultivation/:id", auth, adminOnly, (req, res) => {
  const i = db.cultivationData.findIndex(d => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  db.cultivationData[i] = { ...db.cultivationData[i], ...req.body, updatedAt: new Date().toISOString() };
  res.json(db.cultivationData[i]);
});

app.delete("/api/cultivation/:id", auth, adminOnly, (req, res) => {
  const i = db.cultivationData.findIndex(d => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  db.cultivationData.splice(i, 1); res.json({ success: true });
});

// ============================================================
//  NUTRIENT RECOMMENDATIONS (Admin manages)
// ============================================================
app.get("/api/nutrients", auth, requireSub("nutrients"), (req, res) => {
  const { cropId, cropCategory, type, stage } = req.query;
  let data = db.nutrientData;
  if (cropId)       data = data.filter(d => d.cropId === cropId);
  if (cropCategory) data = data.filter(d => d.cropCategory === cropCategory);
  if (type)         data = data.filter(d => d.type === type);
  if (stage)        data = data.filter(d => d.stage === stage);
  res.json(data);
});

app.post("/api/nutrients", auth, adminOnly, (req, res) => {
  const entry = { id: uuidv4(), createdAt: new Date().toISOString(), ...req.body };
  db.nutrientData.push(entry); res.status(201).json(entry);
});

app.put("/api/nutrients/:id", auth, adminOnly, (req, res) => {
  const i = db.nutrientData.findIndex(d => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  db.nutrientData[i] = { ...db.nutrientData[i], ...req.body }; res.json(db.nutrientData[i]);
});

app.delete("/api/nutrients/:id", auth, adminOnly, (req, res) => {
  const i = db.nutrientData.findIndex(d => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  db.nutrientData.splice(i, 1); res.json({ success: true });
});

// ============================================================
//  PLANT PROTECTION (Admin manages)
// ============================================================
app.get("/api/protection", auth, requireSub("protection"), (req, res) => {
  const { cropId, cropCategory, pestCategory, type } = req.query;
  let data = db.protectionData;
  if (cropId)       data = data.filter(d => d.cropId === cropId);
  if (cropCategory) data = data.filter(d => d.cropCategory === cropCategory);
  if (pestCategory) data = data.filter(d => d.pestCategory === pestCategory);
  if (type)         data = data.filter(d => d.type === type);
  res.json(data);
});

app.post("/api/protection", auth, adminOnly, (req, res) => {
  const entry = { id: uuidv4(), createdAt: new Date().toISOString(), ...req.body };
  db.protectionData.push(entry); res.status(201).json(entry);
});

app.put("/api/protection/:id", auth, adminOnly, (req, res) => {
  const i = db.protectionData.findIndex(d => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  db.protectionData[i] = { ...db.protectionData[i], ...req.body }; res.json(db.protectionData[i]);
});

app.delete("/api/protection/:id", auth, adminOnly, (req, res) => {
  const i = db.protectionData.findIndex(d => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  db.protectionData.splice(i, 1); res.json({ success: true });
});

// ============================================================
//  COSTING DATA (Admin manages)
// ============================================================
app.get("/api/costing", auth, requireSub("costing"), (req, res) => {
  const { cropId, cropCategory, costCategory } = req.query;
  let data = db.costingData;
  if (cropId)       data = data.filter(d => d.cropId === cropId);
  if (cropCategory) data = data.filter(d => d.cropCategory === cropCategory);
  if (costCategory) data = data.filter(d => d.costCategory === costCategory);
  res.json(data);
});

app.post("/api/costing", auth, adminOnly, (req, res) => {
  const entry = { id: uuidv4(), createdAt: new Date().toISOString(), ...req.body };
  db.costingData.push(entry); res.status(201).json(entry);
});

app.put("/api/costing/:id", auth, adminOnly, (req, res) => {
  const i = db.costingData.findIndex(d => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  db.costingData[i] = { ...db.costingData[i], ...req.body }; res.json(db.costingData[i]);
});

app.delete("/api/costing/:id", auth, adminOnly, (req, res) => {
  const i = db.costingData.findIndex(d => d.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  db.costingData.splice(i, 1); res.json({ success: true });
});

// ============================================================
//  PHOTO UPLOAD (with tags, stored in user profile)
// ============================================================
app.post("/api/photos/upload", auth, upload.array("photos", 10), (req, res) => {
  const { plotId, cropId, tags, notes } = req.body;
  const photos = (req.files || []).map(file => ({
    id:         uuidv4(),
    userId:     req.user.id,
    userName:   req.user.name,
    plotId:     plotId || null,
    cropId:     cropId || null,
    tags:       tags ? JSON.parse(tags) : [],
    notes:      notes || "",
    filename:   file.filename,
    originalName: file.originalname,
    size:       file.size,
    url:        `/uploads/${file.filename}`,
    uploadedAt: new Date().toISOString(),
    aiAnalysis: null,
  }));
  db.uploadedPhotos.push(...photos);
  // Also link to user profile
  const uIdx = db.users.findIndex(u => u.id === req.user.id);
  if (uIdx !== -1) {
    if (!db.users[uIdx].uploadedPhotos) db.users[uIdx].uploadedPhotos = [];
    db.users[uIdx].uploadedPhotos.push(...photos.map(p => p.id));
  }
  res.status(201).json({ success: true, photos });
});

app.get("/api/photos", auth, (req, res) => {
  if (req.user.role === "admin") return res.json(db.uploadedPhotos);
  res.json(db.uploadedPhotos.filter(p => p.userId === req.user.id));
});

app.put("/api/photos/:id/tags", auth, (req, res) => {
  const photo = db.uploadedPhotos.find(p => p.id === req.params.id && (p.userId === req.user.id || req.user.role === "admin"));
  if (!photo) return res.status(404).json({ error: "Not found" });
  photo.tags = req.body.tags || photo.tags;
  photo.notes = req.body.notes || photo.notes;
  res.json(photo);
});

app.delete("/api/photos/:id", auth, (req, res) => {
  const idx = db.uploadedPhotos.findIndex(p => p.id === req.params.id && (p.userId === req.user.id || req.user.role === "admin"));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const photo = db.uploadedPhotos[idx];
  const filePath = path.join(uploadsDir, photo.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  db.uploadedPhotos.splice(idx, 1);
  res.json({ success: true });
});

// ============================================================
//  CHATGPT FALLBACK (when admin data not available)
// ============================================================
app.post("/api/ai/ask", auth, async (req, res) => {
  const { question, cropId, cropName, context } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  const systemPrompt = `You are KrishiSeva, an expert agricultural advisor for Odisha, India. 
Answer questions about crop cultivation, plant protection, nutrient management, and farming practices.
Provide specific, actionable advice with doses, timings, and methods.
When relevant, mention both chemical and organic options.
Keep answers concise but complete. Include Odia crop names where helpful.
Context: Crop = ${cropName || "unknown"}, Region = Odisha, India.`;

  if (!apiKey || apiKey.includes("YOUR")) {
    // Intelligent mock response
    const mockAnswer = `ନମସ୍କାର! "${question}" ସମ୍ପର୍କରେ ଆପଣଙ୍କ ପ୍ରଶ୍ନ ପ୍ରାପ୍ତ ହୋଇଛି।\n\n**Advisory (Mock Mode):**\nFor ${cropName || "your crop"}, please consult your local Krishi Vigyan Kendra (KVK) or the Odisha University of Agriculture & Technology (OUAT) for specific recommendations.\n\n*To enable AI responses, add your OpenAI API key to the backend .env file.*`;
    db.chatgptFallbackLog.push({ id: uuidv4(), userId: req.user.id, question, cropId, answer: mockAnswer, isMock: true, askedAt: new Date().toISOString() });
    return res.json({ answer: mockAnswer, isMock: true });
  }

  try {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: question }
      ],
      max_tokens: 600,
      temperature: 0.7,
    }, { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } });

    const answer = response.data.choices[0].message.content;
    db.chatgptFallbackLog.push({ id: uuidv4(), userId: req.user.id, question, cropId, answer, isMock: false, askedAt: new Date().toISOString() });
    res.json({ answer, isMock: false });
  } catch (e) {
    res.status(500).json({ error: "AI service unavailable", details: e.message });
  }
});

// ============================================================
//  WEATHER
// ============================================================
app.get("/api/weather", auth, async (req, res) => {
  const { lat, lon, city } = req.query;
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey || apiKey.includes("YOUR")) {
    return res.json({
      isMock: true, city: city || "Bhubaneswar", temp: 32, feels_like: 36, humidity: 78,
      description: "Partly Cloudy", wind_speed: 12, icon: "04d",
      forecast: [
        { day:"Today",    temp_max:34, temp_min:26, description:"Partly Cloudy", rain_chance:20 },
        { day:"Tomorrow", temp_max:31, temp_min:25, description:"Light Rain",    rain_chance:70 },
        { day:"Day 3",    temp_max:29, temp_min:24, description:"Moderate Rain", rain_chance:80 },
        { day:"Day 4",    temp_max:33, temp_min:26, description:"Sunny",         rain_chance:10 },
        { day:"Day 5",    temp_max:35, temp_min:27, description:"Clear Sky",     rain_chance:5  },
      ],
      advisory: "ଆସନ୍ତାକାଲି ବୃଷ୍ଟି ଆଶା – ସ୍ପ୍ରେ ଅପରେସନ ବିଳମ୍ବ କରନ୍ତୁ",
      advisoryEn: "Rain expected tomorrow – delay spray operations",
    });
  }
  try {
    const q = lat && lon ? `lat=${lat}&lon=${lon}` : `q=${city||"Bhubaneswar"},IN`;
    const [cur, fore] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather?${q}&appid=${apiKey}&units=metric`),
      axios.get(`https://api.openweathermap.org/data/2.5/forecast?${q}&appid=${apiKey}&units=metric&cnt=40`),
    ]);
    const w = cur.data;
    const days = []; const seen = new Set();
    for (const item of fore.data.list) {
      const d = new Date(item.dt*1000).toLocaleDateString("en-IN",{weekday:"short"});
      if (!seen.has(d) && days.length < 5) { seen.add(d); days.push({ day:d, temp_max:Math.round(item.main.temp_max), temp_min:Math.round(item.main.temp_min), description:item.weather[0].description, rain_chance:Math.round((item.pop||0)*100) }); }
    }
    res.json({ city:w.name, temp:Math.round(w.main.temp), feels_like:Math.round(w.main.feels_like), humidity:w.main.humidity, description:w.weather[0].description, wind_speed:Math.round(w.wind.speed*3.6), icon:w.weather[0].icon, forecast:days, advisory:"Based on current data", advisoryEn:"Check forecast before field operations" });
  } catch(e) { res.status(500).json({ error: "Weather unavailable" }); }
});

// ============================================================
//  FIELD DATA (FREE – no sub needed)
// ============================================================
app.get("/api/form-queries", auth, (req, res) => res.json([...db.formQueries, ...db.adminFormQueries]));
app.post("/api/form-queries", auth, adminOnly, (req, res) => {
  const q = { id: uuidv4(), ...req.body }; db.adminFormQueries.push(q); res.status(201).json(q);
});
app.delete("/api/form-queries/:id", auth, adminOnly, (req, res) => {
  const i = db.adminFormQueries.findIndex(q => q.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "Not found" });
  db.adminFormQueries.splice(i, 1); res.json({ success: true });
});
app.get("/api/field-data", auth, (req, res) => {
  if (req.user.role === "admin") return res.json(db.fieldDataEntries);
  res.json(db.fieldDataEntries.filter(e => e.userId === req.user.id));
});
app.post("/api/field-data", auth, (req, res) => {
  const e = { id: uuidv4(), userId: req.user.id, userName: req.user.name, submittedAt: new Date().toISOString(), ...req.body };
  db.fieldDataEntries.push(e); res.status(201).json(e);
});
app.get("/api/field-data/download", auth, adminOnly, (req, res) => {
  const entries = db.fieldDataEntries;
  if (!entries.length) return res.status(404).json({ error: "No data" });
  const keys = Object.keys(entries[0]);
  const csv  = [keys.join(","), ...entries.map(e => keys.map(k => JSON.stringify(String(e[k]||""))).join(","))].join("\n");
  res.setHeader("Content-Type","text/csv");
  res.setHeader("Content-Disposition",'attachment; filename="field-data.csv"');
  res.send(csv);
});

// ============================================================
//  GOOGLE FORM
// ============================================================
app.get("/api/google-form", auth, (req, res) => res.json(db.googleFormConfig));
app.put("/api/google-form", auth, adminOnly, (req, res) => { db.googleFormConfig = { ...db.googleFormConfig, ...req.body }; res.json(db.googleFormConfig); });

// ============================================================
//  E-COMMERCE (inline products)
// ============================================================
const PRODUCTS = {
  landPreparation: [
    { id:"lp1",name:"Deep Ploughing Service",   price:1200, unit:"per acre", description:"Tractor MB plough, 2 rounds",         delivery:"2-3 days", image:"🚜" },
    { id:"lp2",name:"Rotavator Service",         price:800,  unit:"per acre", description:"Fine tilth seedbed preparation",      delivery:"1-2 days", image:"⚙️" },
    { id:"lp3",name:"Laser Land Levelling",      price:2000, unit:"per acre", description:"GPS-guided precision levelling",      delivery:"3-5 days", image:"📡" },
    { id:"lp4",name:"FYM / Compost (500 kg)",    price:650,  unit:"per load", description:"Well-decomposed farmyard manure",     delivery:"2-4 days", image:"🌿" },
  ],
  nutrients: [
    { id:"nu1",name:"DAP 50 kg bag",       price:1350,unit:"per bag", description:"Di-ammonium Phosphate 18:46:0",  delivery:"1-3 days", image:"💊" },
    { id:"nu2",name:"Urea 50 kg bag",       price:268, unit:"per bag", description:"Nitrogen 46%",                    delivery:"1-2 days", image:"🧪" },
    { id:"nu3",name:"MOP 50 kg bag",        price:950, unit:"per bag", description:"Muriate of Potash 60% K₂O",      delivery:"1-3 days", image:"🔬" },
    { id:"nu4",name:"Vermicompost 40 kg",   price:320, unit:"per bag", description:"Certified organic",               delivery:"2-4 days", image:"🪱" },
    { id:"nu5",name:"Neem Cake 25 kg",      price:280, unit:"per bag", description:"Organic neem cake",               delivery:"2-3 days", image:"🌱" },
  ],
  plantProtection: [
    { id:"pp1",name:"Chlorpyrifos 20 EC 500mL", price:185,unit:"per bottle",description:"Broad spectrum insecticide", delivery:"1-2 days",image:"🧴" },
    { id:"pp2",name:"Mancozeb 75 WP 1 kg",      price:195,unit:"per kg",   description:"Contact fungicide",           delivery:"1-2 days",image:"🔴" },
    { id:"pp3",name:"Neem Oil 10L can",          price:850,unit:"per can",  description:"Organic neem oil 10000 ppm", delivery:"2-3 days",image:"🫙" },
    { id:"pp4",name:"Beauveria bassiana 1 kg",   price:350,unit:"per pack", description:"Biopesticide",               delivery:"2-4 days",image:"🦠" },
  ],
  implements: [
    { id:"im1",name:"Power Weeder Rental",          price:450, unit:"per day",  description:"Walk-behind 2HP",           delivery:"Next day", image:"🔧" },
    { id:"im2",name:"Battery Knapsack Sprayer 16L", price:1800,unit:"per unit", description:"Electric boom sprayer",     delivery:"3-5 days", image:"🪣" },
    { id:"im3",name:"Soil Testing Kit",             price:850, unit:"per kit",  description:"Multi-param pH,N,P,K,OC",  delivery:"3-5 days", image:"🧰" },
  ],
};
app.get("/api/products",             auth, requireSub("ecommerce"), (req, res) => res.json(PRODUCTS));
app.get("/api/orders",               auth, (req, res) => { if (req.user.role==="admin") return res.json(db.orders); res.json(db.orders.filter(o=>o.userId===req.user.id)); });
app.post("/api/orders",              auth, requireSub("ecommerce"), (req, res) => {
  const order = { id:uuidv4(), orderId:"AGR"+Date.now().toString().slice(-8), userId:req.user.id, userName:req.user.name, status:"Confirmed", createdAt:new Date().toISOString(), ...req.body };
  db.orders.push(order); res.status(201).json(order);
});

// ============================================================
//  USERS (Admin)
// ============================================================
app.get("/api/users", auth, adminOnly, (req, res) =>
  res.json(db.users.filter(u=>u.role==="user").map(({password:_,...u})=>u))
);
app.post("/api/users", auth, adminOnly, async (req, res) => {
  if (db.users.find(u=>u.username===req.body.username)) return res.status(400).json({ error:"Username exists" });
  const user = { id:uuidv4(), ...req.body, password:bcrypt.hashSync(req.body.password,10), role:"user", subscription:{active:false,plan:null,expiresAt:null,accessModules:[]}, uploadedPhotos:[] };
  await User.create(user);
  const {password:_,...safe}=user; res.status(201).json(safe);
});
app.put("/api/users/:id", auth, adminOnly, (req, res) => {
  const i = db.users.findIndex(u=>u.id===req.params.id);
  if (i===-1) return res.status(404).json({ error:"Not found" });
  const {password,...upd} = req.body;
  if (password) upd.password = bcrypt.hashSync(password,10);
  db.users[i] = {...db.users[i],...upd};
  const {password:_,...safe}=db.users[i]; res.json(safe);
});

// Admin stats
app.get("/api/admin/stats", auth, adminOnly, (req, res) => res.json({
  totalUsers:        db.users.filter(u=>u.role==="user").length,
  activeSubscribers: db.users.filter(u=>u.role==="user"&&u.subscription?.active).length,
  totalPlaces:       db.places.length,
  totalPlots:        db.places.reduce((s,p)=>s+p.plots.length,0),
  totalEntries:      db.fieldDataEntries.length,
  totalOrders:       db.orders.length,
  totalRevenue:      db.payments.reduce((s,p)=>s+(p.amount||0),0),
  totalPhotos:       db.uploadedPhotos.length,
  cultivationRecords:db.cultivationData.length,
  nutrientRecords:   db.nutrientData.length,
  protectionRecords: db.protectionData.length,
  costingRecords:    db.costingData.length,
}));

// AI log (admin)
app.get("/api/admin/ai-log", auth, adminOnly, (req, res) => res.json(db.chatgptFallbackLog));

// ── Start ────────────────────────────────────────────────────
// --- Start
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);

  console.log("======================================");
  console.log(`🌾 KrishiSeva v3 Backend - port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log("🌱 Crops: All 9 categories loaded");
  console.log(`💳 Razorpay: ${razorpay ? "✅ Live" : "⚠️ Mock"}`);
  console.log(`🤖 AI: ${process.env.OPENAI_API_KEY ? "✅ Live" : "⚠️ Mock"}`);
  console.log("======================================");
});

// ============================================================
//  USER SELF-REGISTRATION
// ============================================================
app.post("/api/auth/register", async (req, res) => {
  const { firstName, lastName, username, password, email, phone, countryCode } = req.body;

  if (!firstName || !lastName || !username || !password || !email || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ error: "Username already taken. Please choose another." });
  }
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ error: "Email already registered." });
  }

  const user = {
    id:             uuidv4(),
    username:       username.trim().toLowerCase(),
    password:       bcrypt.hashSync(password, 10),
    role:           "user",
    name:           `${firstName.trim()} ${lastName.trim()}`,
    firstName:      firstName.trim(),
    lastName:       lastName.trim(),
    email:          email.trim().toLowerCase(),
    phone:          phone.trim(),
    countryCode:    countryCode || "+91",
    assignedPlaces: [],
    subscription:   { active: false, plan: null, expiresAt: null, accessModules: [] },
    uploadedPhotos: [],
    registeredAt:   new Date().toISOString(),
  };

  await User.create(user);
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT, { expiresIn: "24h" });
  const { password: _, ...safe } = user;
  res.status(201).json({ token, user: safe, message: "Registration successful!" });
});

// ── Check username availability ──────────────────────────────
app.get("/api/auth/check-username/:username", (req, res) => {
  const taken = db.users.some(u => u.username === req.params.username.toLowerCase());
  res.json({ available: !taken });
});

// ── Check email availability ─────────────────────────────────
app.get("/api/auth/check-email/:email", (req, res) => {
  const taken = db.users.some(u => u.email === req.params.email.toLowerCase());
  res.json({ available: !taken });
});

// ============================================================
//  ADMIN SELF-SETUP (first-time or change own credentials)
// ============================================================
app.post("/api/admin/setup", (req, res) => {
  const { setupKey, newUsername, newPassword, name, email, phone } = req.body;

  // Protect with a setup key (set in .env)
  const SETUP_KEY = process.env.ADMIN_SETUP_KEY || "krishiseva-admin-setup-2024";
  if (setupKey !== SETUP_KEY) {
    return res.status(403).json({ error: "Invalid setup key. Check your .env file for ADMIN_SETUP_KEY." });
  }
  if (!newUsername || !newPassword) {
    return res.status(400).json({ error: "New username and password are required." });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Admin password must be at least 8 characters." });
  }

  // Check if username taken by non-admin
  const conflict = db.users.find(u => u.username === newUsername && u.role !== "admin");
  if (conflict) {
    return res.status(400).json({ error: "Username already used by a farmer account." });
  }

  const adminIdx = db.users.findIndex(u => u.role === "admin");
  if (adminIdx === -1) {
    return res.status(404).json({ error: "No admin account found in the system." });
  }

  db.users[adminIdx].username = newUsername.trim().toLowerCase();
  db.users[adminIdx].password = bcrypt.hashSync(newPassword, 10);
  if (name)  db.users[adminIdx].name  = name.trim();
  if (email) db.users[adminIdx].email = email.trim().toLowerCase();
  if (phone) db.users[adminIdx].phone = phone.trim();
  db.users[adminIdx].updatedAt = new Date().toISOString();

  res.json({
    success: true,
    message: "Admin credentials updated successfully.",
    username: db.users[adminIdx].username,
  });
});

// ── Admin: change own password (authenticated) ───────────────
app.put("/api/admin/change-password", auth, adminOnly, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const adminIdx = db.users.findIndex(u => u.id === req.user.id);
  if (adminIdx === -1) return res.status(404).json({ error: "Admin not found" });

  if (!bcrypt.compareSync(currentPassword, db.users[adminIdx].password)) {
    return res.status(400).json({ error: "Current password is incorrect." });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters." });
  }

  db.users[adminIdx].password  = bcrypt.hashSync(newPassword, 10);
  db.users[adminIdx].updatedAt = new Date().toISOString();
  res.json({ success: true, message: "Password changed successfully." });
});

// ── Admin: change own username (authenticated) ───────────────
app.put("/api/admin/change-username", auth, adminOnly, (req, res) => {
  const { newUsername, password } = req.body;
  const adminIdx = db.users.findIndex(u => u.id === req.user.id);
  if (adminIdx === -1) return res.status(404).json({ error: "Admin not found" });

  if (!bcrypt.compareSync(password, db.users[adminIdx].password)) {
    return res.status(400).json({ error: "Password is incorrect." });
  }
  if (db.users.find(u => u.username === newUsername && u.id !== req.user.id)) {
    return res.status(400).json({ error: "Username already taken." });
  }

  db.users[adminIdx].username  = newUsername.trim().toLowerCase();
  db.users[adminIdx].updatedAt = new Date().toISOString();
  res.json({ success: true, message: "Username updated.", newUsername: db.users[adminIdx].username });
});
