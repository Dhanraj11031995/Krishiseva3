// ============================================================
//  KrishiSeva v3 – In-Memory Data Store
// ============================================================
const bcrypt = require("bcryptjs");

const db = {
  // ── USERS ─────────────────────────────────────────────────
  users: [
    {
      id: "admin1", username: "admin",
      password: bcrypt.hashSync("admin123", 10),
      role: "admin", name: "Admin User",
      email: "admin@krishiseva.in", phone: "9000000000",
      assignedPlaces: [],
      subscription: { active: true, plan: "admin", expiresAt: null, accessModules: ["all"] },
      profile: { district: "Khordha", state: "Odisha", language: "or" },
    },
    {
      id: "user1", username: "farmer1",
      password: bcrypt.hashSync("farmer123", 10),
      role: "user", name: "Ramesh Patra",
      email: "ramesh@farm.com", phone: "9876543210",
      assignedPlaces: ["place1", "place2"],
      subscription: {
        active: true, plan: "monthly",
        expiresAt: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        accessModules: ["crop_cycle","nutrients","protection","ecommerce","costing"],
      },
      profile: { district: "Khordha", state: "Odisha", language: "or", farmSize: 12.5 },
      uploadedPhotos: [],
    },
    {
      id: "user2", username: "farmer2",
      password: bcrypt.hashSync("farmer123", 10),
      role: "user", name: "Sita Devi",
      email: "sita@farm.com", phone: "9876543211",
      assignedPlaces: ["place2"],
      subscription: { active: false, plan: null, expiresAt: null, accessModules: [] },
      profile: { district: "Cuttack", state: "Odisha", language: "or" },
      uploadedPhotos: [],
    },
  ],

  // ── SUBSCRIPTION PLANS ─────────────────────────────────────
  subscriptionPlans: [
    {
      id: "monthly", name: "Monthly Plan", nameOr: "ମାସିକ ଯୋଜନା",
      price: 499, duration: 30,
      features: ["Crop Cycle","Nutrient Mgmt","Plant Protection","E-Commerce","Costing Tool","Data Entry","Print Reports"],
      popular: false,
    },
    {
      id: "quarterly", name: "Quarterly Plan", nameOr: "ତ୍ରୈମାସିକ ଯୋଜନା",
      price: 1299, duration: 90,
      features: ["All Monthly Features","Priority Support","Photo Storage","AI Fallback (ChatGPT)","Analytics"],
      popular: true,
    },
    {
      id: "yearly", name: "Yearly Plan", nameOr: "ବାର୍ଷିକ ଯୋଜନା",
      price: 3999, duration: 365,
      features: ["All Features","Unlimited Photos","Cloud Storage","Custom Reports","Agronomist Access"],
      popular: false,
    },
  ],

  // ── PLACES & PLOTS ─────────────────────────────────────────
  places: [
    {
      id: "place1", name: "Bhubaneswar North Farm",
      district: "Khordha", state: "Odisha",
      totalArea: 25.5, lat: 20.2961, lng: 85.8245,
      plots: [
        { id:"plot1", name:"Plot A1", area:5.2, assignedUser:"user1", crop:"rice",   cropCategory:"cereals",   season:"Kharif", lat:20.2961, lng:85.8245 },
        { id:"plot2", name:"Plot A2", area:6.8, assignedUser:"user1", crop:"mustard",cropCategory:"oilseeds",  season:"Rabi",   lat:20.2981, lng:85.8265 },
        { id:"plot3", name:"Plot B1", area:7.5, assignedUser:"user2", crop:"tomato", cropCategory:"vegetables",season:"Rabi",   lat:20.2941, lng:85.8225 },
      ],
    },
    {
      id: "place2", name: "Cuttack East Fields",
      district: "Cuttack", state: "Odisha",
      totalArea: 18.3, lat: 20.4625, lng: 85.883,
      plots: [
        { id:"plot4", name:"Field C1", area:9.1, assignedUser:"user1", crop:"rice",   cropCategory:"cereals",   season:"Kharif", lat:20.4625, lng:85.883  },
        { id:"plot5", name:"Field C2", area:9.2, assignedUser:"user2", crop:"chilli", cropCategory:"spices",    season:"Rabi",   lat:20.4645, lng:85.885  },
      ],
    },
  ],

  // ── ADMIN-MANAGED CULTIVATION DATA ────────────────────────
  // Admin adds crop-wise cultivation practice data here
  cultivationData: [],   // { id, cropId, cropCategory, season, stages, adminNotes, createdAt }

  // ── ADMIN-MANAGED NUTRIENT RECOMMENDATIONS ─────────────────
  nutrientData: [],      // { id, cropId, cropCategory, type(chemical/organic), stage, nutrient, dose, product, timing, method, cost, adminNotes }

  // ── ADMIN-MANAGED PLANT PROTECTION DATA ───────────────────
  protectionData: [],    // { id, cropId, cropCategory, pestCategory, pestName, pestNameOr, type(chemical/organic), pesticide, dose, method, timing, cost, adminNotes }

  // ── ADMIN-MANAGED COSTING DATA ────────────────────────────
  costingData: [],       // { id, cropId, cropCategory, costCategory, item, itemOr, unit, rateMin, rateMax, remarks, adminNotes }

  // ── FORM QUERIES (field data collection) ──────────────────
  formQueries: [
    { id:"q1",  field:"soilPH",             label:"Soil pH",                           labelOr:"ମାଟି pH",                      type:"number",  unit:"",       placeholder:"e.g. 6.5",   category:"soil"    },
    { id:"q2",  field:"residualN",          label:"Residual Nitrogen (kg/ha)",         labelOr:"ଅବଶିଷ୍ଟ ଯବକ୍ଷାରଜାନ",         type:"number",  unit:"kg/ha",  placeholder:"e.g. 120",   category:"soil"    },
    { id:"q3",  field:"residualP",          label:"Residual Phosphorus (kg/ha)",       labelOr:"ଅବଶିଷ୍ଟ ଫସ୍ଫରସ",             type:"number",  unit:"kg/ha",  placeholder:"e.g. 35",    category:"soil"    },
    { id:"q4",  field:"residualK",          label:"Residual Potassium (kg/ha)",        labelOr:"ଅବଶିଷ୍ଟ ପୋଟାସ",              type:"number",  unit:"kg/ha",  placeholder:"e.g. 180",   category:"soil"    },
    { id:"q5",  field:"residualS",          label:"Residual Sulphur (kg/ha)",          labelOr:"ଅବଶିଷ୍ଟ ଗନ୍ଧକ",              type:"number",  unit:"kg/ha",  placeholder:"e.g. 12",    category:"soil"    },
    { id:"q6",  field:"ec",                 label:"EC – Electrical Conductivity",      labelOr:"ବିଦ୍ୟୁତ ଚାଳକତା",             type:"number",  unit:"dS/m",   placeholder:"e.g. 0.4",   category:"soil"    },
    { id:"q7",  field:"organicCarbon",      label:"Organic Carbon (%)",                labelOr:"ଜୈବ କାର୍ବନ (%)",              type:"number",  unit:"%",      placeholder:"e.g. 0.65",  category:"soil"    },
    { id:"q8",  field:"soilTexture",        label:"Soil Texture",                      labelOr:"ମାଟିର ପ୍ରକୃତି",               type:"select",  options:["Sandy","Loamy","Clay","Sandy Loam","Clay Loam","Silt Loam"], category:"soil" },
    { id:"q9",  field:"nutritionType",      label:"Nutrition Type Used",               labelOr:"ସାର ପ୍ରକାର",                  type:"select",  options:["Chemical","Organic","Integrated"], category:"inputs"  },
    { id:"q10", field:"nutrientsUsed",      label:"Nutrient Materials Used",           labelOr:"ଦିଆ ଯାଇଥିବା ସାର ତାଲିକା",    type:"text",    unit:"",       placeholder:"e.g. Urea 40 kg, DAP 25 kg", category:"inputs" },
    { id:"q11", field:"nutritionCost",      label:"Total Nutrition Cost (₹)",          labelOr:"ମୋଟ ସାର ଖର୍ଚ (₹)",           type:"number",  unit:"₹",      placeholder:"e.g. 3500",  category:"costs"   },
    { id:"q12", field:"protectionType",     label:"Plant Protection Type Used",        labelOr:"କୀଟ ସୁରକ୍ଷା ପ୍ରକାର",         type:"select",  options:["Chemical","Organic","IPM"], category:"inputs"  },
    { id:"q13", field:"protectionMaterials",label:"Plant Protection Materials Used",   labelOr:"ଦିଆ ଯାଇଥିବା ଔଷଧ ତାଲିକା",   type:"text",    unit:"",       placeholder:"e.g. Chlorpyrifos 500mL", category:"inputs" },
    { id:"q14", field:"protectionCost",     label:"Plant Protection Cost (₹)",         labelOr:"କୀଟ ସୁରକ୍ଷା ଖର୍ଚ (₹)",       type:"number",  unit:"₹",      placeholder:"e.g. 1200",  category:"costs"   },
    { id:"q15", field:"labourCost",         label:"Labour Cost (₹)",                   labelOr:"ଶ୍ରମ ଖର୍ଚ (₹)",              type:"number",  unit:"₹",      placeholder:"e.g. 5000",  category:"costs"   },
    { id:"q16", field:"machineryCost",      label:"Machinery Cost (₹)",                labelOr:"ଯନ୍ତ୍ରପାତି ଖର୍ଚ (₹)",       type:"number",  unit:"₹",      placeholder:"e.g. 2000",  category:"costs"   },
    { id:"q17", field:"irrigationCost",     label:"Irrigation Cost (₹)",               labelOr:"ଜଳସେଚନ ଖର୍ଚ (₹)",           type:"number",  unit:"₹",      placeholder:"e.g. 800",   category:"costs"   },
    { id:"q18", field:"seedCost",           label:"Seed / Planting Material Cost (₹)", labelOr:"ବୀଜ ଖର୍ଚ (₹)",              type:"number",  unit:"₹",      placeholder:"e.g. 1500",  category:"costs"   },
    { id:"q19", field:"landRevenue",        label:"Land Revenue / Lease (₹)",          labelOr:"ଭୂ ରାଜସ୍ୱ / ଲିଜ (₹)",       type:"number",  unit:"₹",      placeholder:"e.g. 3000",  category:"costs"   },
    { id:"q20", field:"produceType",        label:"Type of Produce",                   labelOr:"ଉତ୍ପାଦ ପ୍ରକାର",              type:"select",  options:["Grain","Vegetable","Fruit","Flower","Spice","Oil","Medicinal","Seed","Other"], category:"output" },
    { id:"q21", field:"harvestAmount",      label:"Harvest Amount (qtl/acre)",         labelOr:"ଅମଳ ପରିମାଣ (qtl/acre)",     type:"number",  unit:"qtl",    placeholder:"e.g. 28",    category:"output"  },
    { id:"q22", field:"marketPrice",        label:"Market Price Received (₹/qtl)",     labelOr:"ବଜାର ଦର (₹/qtl)",           type:"number",  unit:"₹/qtl",  placeholder:"e.g. 2100",  category:"output"  },
    { id:"q23", field:"totalRevenue",       label:"Total Revenue Generated (₹)",       labelOr:"ମୋଟ ଆୟ (₹)",                type:"number",  unit:"₹",      placeholder:"e.g. 58800", category:"output"  },
    { id:"q24", field:"pestObserved",       label:"Pests / Diseases Observed",         labelOr:"ଦେଖାଯାଇଥିବା ରୋଗ / ପୋକ",    type:"text",    unit:"",       placeholder:"e.g. Stem borer, Blast",  category:"observation" },
    { id:"q25", field:"weatherCondition",   label:"Weather Condition During Season",   labelOr:"ଋତୁ ସମୟ ପାଣିପାଗ",           type:"select",  options:["Normal","Drought","Excess Rain","Hailstorm","Cyclone","Fog/Cold"], category:"observation" },
    { id:"q26", field:"remarks",            label:"Additional Remarks / Observations", labelOr:"ଅତିରିକ୍ତ ମନ୍ତବ୍ୟ",           type:"textarea",unit:"",       placeholder:"Any issues, observations or extra notes", category:"notes" },
  ],

  // Google Form config
  googleFormConfig: { url: "", embedUrl: "", description: "Field data collection form" },

  // Runtime collections
  adminFormQueries: [],
  fieldDataEntries: [],
  orders: [],
  payments: [],
  uploadedPhotos: [],   // { id, userId, plotId, cropId, tags, filename, uploadedAt, aiAnalysis }
  chatgptFallbackLog: [],
};

module.exports = db;
