// ============================================================
//  KrishiSeva v3 – Master Crop & Agricultural Database
//  Covers: Cereals, Pulses, Vegetables, Fruits, Oilseeds,
//          Spices, Medicinal, Flowers, Condiments
//  Full Odia translations included
// ============================================================

const CROP_CATEGORIES = {
  cereals: {
    label: "Cereals", labelOr: "ଶସ୍ୟ ଫସଲ", icon: "🌾",
    crops: [
      { id:"rice",    name:"Rice",    nameOr:"ଧାନ",      season:["Kharif"],        duration:"90-150 days" },
      { id:"wheat",   name:"Wheat",   nameOr:"ଗହମ",      season:["Rabi"],          duration:"100-120 days"},
      { id:"maize",   name:"Maize",   nameOr:"ମକା",      season:["Kharif","Rabi"], duration:"80-100 days" },
      { id:"sorghum", name:"Sorghum", nameOr:"ଜୁଆର",     season:["Kharif"],        duration:"90-120 days" },
      { id:"bajra",   name:"Bajra",   nameOr:"ବାଜ୍ରା",   season:["Kharif"],        duration:"75-90 days"  },
      { id:"barley",  name:"Barley",  nameOr:"ଯବ",       season:["Rabi"],          duration:"90-110 days" },
      { id:"ragi",    name:"Ragi",    nameOr:"ମଣ୍ଡିଆ",   season:["Kharif"],        duration:"90-120 days" },
      { id:"oats",    name:"Oats",    nameOr:"ଓଟ",       season:["Rabi"],          duration:"90-100 days" },
    ]
  },
  pulses: {
    label: "Pulses", labelOr: "ଡାଲି ଫସଲ", icon: "🫘",
    crops: [
      { id:"pigeonpea",   name:"Pigeonpea (Arhar)", nameOr:"ହରଡ",           season:["Kharif"],        duration:"120-180 days"},
      { id:"greengram",   name:"Green Gram (Moong)",nameOr:"ମୁଗ",           season:["Kharif","Rabi"], duration:"60-75 days"  },
      { id:"blackgram",   name:"Black Gram (Urad)", nameOr:"ବିରି",          season:["Kharif"],        duration:"65-80 days"  },
      { id:"chickpea",    name:"Chickpea (Chana)",  nameOr:"ଛୋଲା",          season:["Rabi"],          duration:"90-120 days" },
      { id:"lentil",      name:"Lentil (Masur)",    nameOr:"ମସୂର",          season:["Rabi"],          duration:"80-100 days" },
      { id:"cowpea",      name:"Cowpea",            nameOr:"ଚଉଳ ଡାଲି",      season:["Kharif"],        duration:"60-75 days"  },
      { id:"fieldpea",    name:"Field Pea (Matar)", nameOr:"ମଟର",           season:["Rabi"],          duration:"90-100 days" },
      { id:"horsegram",   name:"Horse Gram (Kulthi)",nameOr:"କୁଳଥ",         season:["Kharif"],        duration:"75-90 days"  },
    ]
  },
  vegetables: {
    label: "Vegetables", labelOr: "ପରିବା ଫସଲ", icon: "🥦",
    crops: [
      { id:"tomato",     name:"Tomato",       nameOr:"ଟମାଟ",      season:["Rabi","Zaid"], duration:"90-120 days" },
      { id:"potato",     name:"Potato",       nameOr:"ଆଳୁ",       season:["Rabi"],        duration:"75-100 days" },
      { id:"onion",      name:"Onion",        nameOr:"ପିଆଜ",      season:["Rabi"],        duration:"90-120 days" },
      { id:"brinjal",    name:"Brinjal",      nameOr:"ବାଇଗଣ",    season:["All"],         duration:"120-150 days"},
      { id:"cauliflower",name:"Cauliflower",  nameOr:"ଫୁଲ କୋବି", season:["Rabi"],        duration:"60-90 days"  },
      { id:"cabbage",    name:"Cabbage",      nameOr:"ବନ୍ଧ କୋବି",season:["Rabi"],        duration:"60-90 days"  },
      { id:"okra",       name:"Okra (Bhindi)",nameOr:"ଭେଣ୍ଡି",   season:["Kharif","Zaid"],duration:"55-65 days" },
      { id:"bittergourd",name:"Bitter Gourd", nameOr:"କରଲା",     season:["Kharif","Zaid"],duration:"60-75 days" },
      { id:"bottlegourd",name:"Bottle Gourd", nameOr:"ଲାଉ",      season:["Kharif","Zaid"],duration:"55-70 days" },
      { id:"pumpkin",    name:"Pumpkin",      nameOr:"କଖାରୁ",    season:["Kharif"],      duration:"90-120 days" },
      { id:"cucumber",   name:"Cucumber",     nameOr:"ଶଶା",      season:["Zaid","Kharif"],duration:"50-60 days" },
      { id:"spinach",    name:"Spinach",      nameOr:"ପାଳଙ୍ଗ ଶାଗ",season:["Rabi"],      duration:"35-45 days"  },
      { id:"carrot",     name:"Carrot",       nameOr:"ଗାଜର",     season:["Rabi"],        duration:"80-100 days" },
      { id:"radish",     name:"Radish",       nameOr:"ମୂଳା",     season:["Rabi"],        duration:"25-30 days"  },
      { id:"greenpepper",name:"Green Pepper", nameOr:"ସବୁଜ ଲଙ୍କା",season:["All"],       duration:"70-90 days"  },
    ]
  },
  fruits: {
    label: "Fruits", labelOr: "ଫଳ ଫସଲ", icon: "🍋",
    crops: [
      { id:"mango",      name:"Mango",       nameOr:"ଆମ୍ବ",      season:["Perennial"],  duration:"Perennial"   },
      { id:"banana",     name:"Banana",      nameOr:"କଦଳୀ",     season:["All"],        duration:"11-14 months"},
      { id:"papaya",     name:"Papaya",      nameOr:"ଅଁଳ",      season:["All"],        duration:"10-12 months"},
      { id:"guava",      name:"Guava",       nameOr:"ଅମୃତ ଭଣ୍ଡା",season:["Perennial"], duration:"Perennial"   },
      { id:"coconut",    name:"Coconut",     nameOr:"ନଡ଼ିଆ",    season:["Perennial"],  duration:"Perennial"   },
      { id:"pineapple",  name:"Pineapple",   nameOr:"ଆନାନାସ",   season:["All"],        duration:"18-24 months"},
      { id:"jackfruit",  name:"Jackfruit",   nameOr:"ଖଜୁରୀ",    season:["Perennial"],  duration:"Perennial"   },
      { id:"litchi",     name:"Litchi",      nameOr:"ଲିଚି",     season:["Perennial"],  duration:"Perennial"   },
      { id:"watermelon", name:"Watermelon",  nameOr:"ତରଭୁଜ",    season:["Zaid"],       duration:"75-90 days"  },
      { id:"muskmelon",  name:"Muskmelon",   nameOr:"ଖରବୁଜ",    season:["Zaid"],       duration:"75-90 days"  },
    ]
  },
  oilseeds: {
    label: "Oilseeds", labelOr: "ତୈଳ ଫସଲ", icon: "🌻",
    crops: [
      { id:"mustard",    name:"Mustard",     nameOr:"ସୋରିଷ",    season:["Rabi"],       duration:"110-140 days"},
      { id:"groundnut",  name:"Groundnut",   nameOr:"ବାଦାମ",    season:["Kharif"],     duration:"100-130 days"},
      { id:"sunflower",  name:"Sunflower",   nameOr:"ସୂର୍ଯ୍ୟମୁଖୀ",season:["Rabi","Kharif"],duration:"90-100 days"},
      { id:"soybean",    name:"Soybean",     nameOr:"ସୋୟାବିନ",  season:["Kharif"],     duration:"90-110 days" },
      { id:"sesame",     name:"Sesame (Til)",nameOr:"ତିଳ",      season:["Kharif"],     duration:"80-100 days" },
      { id:"castor",     name:"Castor",      nameOr:"ଏରଣ୍ଡ",   season:["Kharif"],     duration:"150-180 days"},
      { id:"linseed",    name:"Linseed",     nameOr:"ଅଳସି",     season:["Rabi"],       duration:"90-110 days" },
      { id:"coconutoil", name:"Coconut (Oil)",nameOr:"ନଡ଼ିଆ ତେଲ",season:["Perennial"], duration:"Perennial"   },
    ]
  },
  spices: {
    label: "Spices", labelOr: "ମସଲା ଫସଲ", icon: "🌶️",
    crops: [
      { id:"chilli",     name:"Chilli",      nameOr:"ଲଙ୍କା",    season:["Kharif","Rabi"],duration:"90-120 days"},
      { id:"turmeric",   name:"Turmeric",    nameOr:"ହଳଦୀ",    season:["Kharif"],     duration:"8-9 months"  },
      { id:"ginger",     name:"Ginger",      nameOr:"ଅଦା",      season:["Kharif"],     duration:"8-9 months"  },
      { id:"garlic",     name:"Garlic",      nameOr:"ରସୁଣ",    season:["Rabi"],       duration:"150-180 days"},
      { id:"coriander",  name:"Coriander",   nameOr:"ଧନିଆ",    season:["Rabi"],       duration:"45-60 days"  },
      { id:"cumin",      name:"Cumin",       nameOr:"ଜିରା",     season:["Rabi"],       duration:"90-110 days" },
      { id:"fenugreek",  name:"Fenugreek",   nameOr:"ମେଥି",    season:["Rabi"],       duration:"40-55 days"  },
      { id:"pepper",     name:"Black Pepper",nameOr:"କଳ ମରିଚ", season:["Perennial"],  duration:"Perennial"   },
      { id:"cardamom",   name:"Cardamom",    nameOr:"ଏଲଚି",    season:["Perennial"],  duration:"Perennial"   },
    ]
  },
  medicinal: {
    label: "Medicinal Plants", labelOr: "ଔଷଧୀୟ ଉଦ୍ଭିଦ", icon: "🌿",
    crops: [
      { id:"tulsi",      name:"Tulsi",       nameOr:"ତୁଳସୀ",   season:["All"],        duration:"Perennial"   },
      { id:"aloe",       name:"Aloe Vera",   nameOr:"ଘୃତକୁମାରୀ",season:["All"],      duration:"Perennial"   },
      { id:"neem",       name:"Neem",        nameOr:"ନିମ",      season:["Perennial"],  duration:"Perennial"   },
      { id:"ashwagandha",name:"Ashwagandha", nameOr:"ଅଶ୍ୱଗନ୍ଧା",season:["Kharif"],   duration:"150-180 days"},
      { id:"lemongrass", name:"Lemongrass",  nameOr:"ଲେମ୍ବୁ ଘାସ",season:["All"],     duration:"Perennial"   },
      { id:"stevia",     name:"Stevia",      nameOr:"ଷ୍ଟେଭିଆ",  season:["All"],      duration:"Perennial"   },
      { id:"isabgol",    name:"Isabgol",     nameOr:"ଇସ୍ଭଗୋଲ",  season:["Rabi"],     duration:"90-100 days" },
      { id:"brahmi",     name:"Brahmi",      nameOr:"ବ୍ରହ୍ମୀ",  season:["All"],      duration:"Perennial"   },
    ]
  },
  flowers: {
    label: "Flowers", labelOr: "ଫୁଲ ଚାଷ", icon: "🌸",
    crops: [
      { id:"marigold",   name:"Marigold",    nameOr:"ଗନ୍ଧ ଫୁଲ",season:["All"],       duration:"60-90 days"  },
      { id:"rose",       name:"Rose",        nameOr:"ଗୋଲାପ",   season:["Perennial"],  duration:"Perennial"   },
      { id:"jasmine",    name:"Jasmine",     nameOr:"ଜୁଇ",     season:["Perennial"],  duration:"Perennial"   },
      { id:"lotus",      name:"Lotus",       nameOr:"ପଦ୍ମ",    season:["All"],        duration:"Perennial"   },
      { id:"chrysanthemum",name:"Chrysanthemum",nameOr:"ସେଭନ୍ତି",season:["Rabi"],    duration:"90-120 days" },
      { id:"gladiolus",  name:"Gladiolus",   nameOr:"ଗ୍ଲାଡ଼ିଓଲସ",season:["Rabi"],   duration:"80-100 days" },
      { id:"tuberose",   name:"Tuberose",    nameOr:"ରଜନୀଗନ୍ଧ",season:["All"],       duration:"120-150 days"},
    ]
  },
  condiments: {
    label: "Condiments", labelOr: "ରସଦ ଫସଲ", icon: "🧂",
    crops: [
      { id:"tamarind",   name:"Tamarind",    nameOr:"ତେନ୍ତୁଳି",season:["Perennial"],  duration:"Perennial"   },
      { id:"curry_leaf", name:"Curry Leaf",  nameOr:"କରିପତ୍ର", season:["Perennial"],  duration:"Perennial"   },
      { id:"drumstick",  name:"Drumstick",   nameOr:"ସଜନା",    season:["Perennial"],  duration:"Perennial"   },
      { id:"betel",      name:"Betel Leaf",  nameOr:"ପାନ",     season:["Perennial"],  duration:"Perennial"   },
      { id:"bay_leaf",   name:"Bay Leaf",    nameOr:"ତେଜ ପତ୍ର",season:["Perennial"],  duration:"Perennial"   },
    ]
  },
};

// ── Pest / Disease categories ──────────────────────────────
const PEST_CATEGORIES = {
  insects:   { label:"Insects",      labelOr:"କୀଟ",            icon:"🐛" },
  fungi:     { label:"Fungi",        labelOr:"ଫଙ୍ଗସ",          icon:"🍄" },
  bacteria:  { label:"Bacteria",     labelOr:"ଜୀବାଣୁ",         icon:"🦠" },
  virus:     { label:"Virus",        labelOr:"ଭୂତାଣୁ",          icon:"🧬" },
  rodents:   { label:"Rodents",      labelOr:"ମୂଷା/ଇଲ",        icon:"🐀" },
  weeds:     { label:"Weeds",        labelOr:"ଘାସ/ଆଗ ଫସଲ",    icon:"🌱" },
  nematodes: { label:"Nematodes",    labelOr:"ଜଳ କ୍ଷୁଦ୍ର ପୋକ",icon:"🔬" },
  algae:     { label:"Algae",        labelOr:"ଶୈବାଳ",          icon:"🌊" },
  mites:     { label:"Mites",        labelOr:"ମାଇଟ",           icon:"🕷️" },
};

// ── Investment / Costing categories ───────────────────────
const COST_CATEGORIES = {
  seeds:        { label:"Seeds & Planting Material",  labelOr:"ବୀଜ ଓ ରୁଆ ସାମଗ୍ରୀ",    icon:"🌱" },
  land:         { label:"Land Preparation",           labelOr:"ଭୂ ପ୍ରସ୍ତୁତି",          icon:"🚜" },
  nutrients_ch: { label:"Chemical Fertilizers",       labelOr:"ରାସାୟନିକ ସାର",          icon:"🧪" },
  nutrients_or: { label:"Organic Manures",             labelOr:"ଜୈବ ସାର",               icon:"🌿" },
  protection_ch:{ label:"Chemical Pesticides",         labelOr:"ରାସାୟନିକ କୀଟନାଶକ",     icon:"💊" },
  protection_or:{ label:"Organic Pest Control",        labelOr:"ଜୈବ କୀଟ ନିୟନ୍ତ୍ରଣ",    icon:"🍃" },
  labour:       { label:"Labour (Human)",              labelOr:"ଶ୍ରମ ଖର୍ଚ",             icon:"👷" },
  machinery:    { label:"Machinery / Equipment",       labelOr:"ଯନ୍ତ୍ରପାତି",            icon:"⚙️" },
  irrigation:   { label:"Irrigation",                  labelOr:"ଜଳସେଚନ",               icon:"💧" },
  implements:   { label:"Implements",                  labelOr:"ଉପକରଣ",                icon:"🔧" },
  land_revenue: { label:"Land Revenue / Lease",        labelOr:"ଭୂ ରାଜସ୍ୱ / ଲିଜ",      icon:"📜" },
  post_harvest: { label:"Post-Harvest & Marketing",    labelOr:"ଅମଳ ପରବର୍ତୀ",          icon:"📦" },
  misc:         { label:"Miscellaneous",               labelOr:"ଅନ୍ୟାନ୍ୟ",              icon:"📋" },
};

// ── Nutrient application stages ───────────────────────────
const GROWTH_STAGES = [
  { id:"basal",        label:"Basal (Before/At Sowing)", labelOr:"ବୁଣିବା ଆଗ / ସମୟ"     },
  { id:"seedling",     label:"Seedling Stage",           labelOr:"ଚାରା ଅବସ୍ଥା"           },
  { id:"tillering",    label:"Tillering Stage",          labelOr:"ଗୋଛ ଅବସ୍ଥା"            },
  { id:"vegetative",   label:"Vegetative Growth",        labelOr:"ବୃଦ୍ଧି ଅବସ୍ଥା"          },
  { id:"flowering",    label:"Flowering Stage",          labelOr:"ଫୁଲ ଅବସ୍ଥା"             },
  { id:"fruit_set",    label:"Fruit Setting",            labelOr:"ଫଳ ଗଠନ ଅବସ୍ଥା"         },
  { id:"fruit_dev",    label:"Fruit Development",        labelOr:"ଫଳ ବିକାଶ ଅବସ୍ଥା"       },
  { id:"maturity",     label:"Maturity / Pre-Harvest",   labelOr:"ପ୍ରାୟ ଅମଳ ଅବସ୍ଥା"      },
];

// ── Application methods ────────────────────────────────────
const APP_METHODS = [
  { id:"foliar_spray", label:"Foliar Spray",       labelOr:"ପତ୍ର ଛିଞ୍ଚି ପ୍ରୟୋଗ"   },
  { id:"soil_drench",  label:"Soil Drench",         labelOr:"ମାଟି ଗୋଡ଼ ପ୍ରୟୋଗ"    },
  { id:"basal_app",    label:"Basal Application",   labelOr:"ବାଜ଼ ପ୍ରୟୋଗ"         },
  { id:"top_dress",    label:"Top Dressing",        labelOr:"ଉପରି ପ୍ରୟୋଗ"          },
  { id:"fertigation",  label:"Fertigation (Drip)",  labelOr:"ଡ୍ରିପ ସହ ସାର"       },
  { id:"seed_treat",   label:"Seed Treatment",      labelOr:"ବୀଜ ଶୋଧନ"            },
  { id:"seedling_dip", label:"Seedling Dip",        labelOr:"ଚାରା ବୁଡ଼ ପ୍ରୟୋଗ"   },
  { id:"granule",      label:"Granule Broadcasting",labelOr:"ଦାନା ଛଟା"            },
  { id:"fumigation",   label:"Fumigation",          labelOr:"ଧୁଆ ଛଟା"             },
  { id:"trunk_inject", label:"Trunk Injection",     labelOr:"ଗଛ ଗୁଣ୍ଡି ଇଞ୍ଜେକ୍ସନ"},
];

module.exports = { CROP_CATEGORIES, PEST_CATEGORIES, COST_CATEGORIES, GROWTH_STAGES, APP_METHODS };
