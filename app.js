import {
  get,
  getAll,
  getAllByIndex,
  put,
  bulkPut,
  remove,
  clearAll,
  uuid
} from "/db.js";

const state = {
  profile: null,
  settings: null,
  steps: [],
  fastingSessions: [],
  fastingModes: [],
  weightEntries: [],
  nutritionEntries: [],
  foodItems: [],
  recipes: [],
  foodLogs: [],
  nutritionGoals: null,
  intervalPrograms: [],
  intervalSessions: [],
  exercises: [],
  templates: [],
  workouts: [],
  workoutSets: [],
  progressions: [],
  progressionLevels: [],
  progressionStatus: [],
  foodSearch: {
    tab: "recents",
    query: "",
    category: "all",
    meal: "breakfast"
  },
  foodPortion: {
    sourceType: "food",
    sourceId: null,
    meal: "breakfast",
    mode: "grams",
    entryId: null
  },
  quickEditEntryId: null,
  recipeDraft: {
    ingredients: []
  },
  activeRecipeId: null,
  activeTimerId: null,
  timerQuick: {
    workSec: 40,
    restSec: 20,
    rounds: 10,
    warmupSec: 60,
    cooldownSec: 60,
    isInfinite: false
  },
  timerRun: null,
  timerLock: false
};

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  athlete: 1.9
};

const DEFAULT_CUT_DEFICIT = 500;
const DEFAULT_GAIN_SURPLUS = 250;

const DEFAULT_SETTINGS = {
  id: "default",
  profileId: "primary",
  units: "metric",
  stepsGoal: 8000,
  fastTarget: 16,
  workoutGoal: 3,
  calorieGoal: 2000,
  proteinGoal: 150,
  carbGoal: 220,
  fatGoal: 70,
  foodDisclaimerDismissed: false,
  macroPercentView: false,
  dayStartHour: 0,
  foodMigrationDone: false,
  theme: "system",
  density: "comfortable",
  accent: "amber",
  fontSize: "normal",
  weightRange: 7,
  autoplayDemos: true,
  activeFastingModeId: "fast-16-8",
  reminders: {
    fastStart: true,
    fastEnd: true,
    eatEnd: false,
    hydration: false
  },
  quietHours: {
    start: "22:00",
    end: "06:00"
  },
  lastNotification: {},
  lastHydrationAt: null,
  lastFastEndAt: null
};

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
  custom: "Custom"
};

const MACRO_VISUALS = [
  { key: "protein", label: "Protein", short: "P" },
  { key: "carbs", label: "Carbs", short: "C" },
  { key: "fat", label: "Fat", short: "F" },
  { key: "fiber", label: "Fiber", short: "Fi" }
];

const DEFAULT_TIMER_SETTINGS = {
  soundEnabled: true,
  vibrationEnabled: true,
  countdownEnabled: true,
  keepAwakeEnabled: true
};

const TIMER_PRESET_SEED = [
  {
    name: "HIIT 50/10 x 10",
    category: "HIIT",
    warmupSec: 60,
    workSec: 50,
    restSec: 10,
    rounds: 10,
    cooldownSec: 60,
    isInfinite: false
  },
  {
    name: "HIIT 40/20 x 12",
    category: "HIIT",
    warmupSec: 60,
    workSec: 40,
    restSec: 20,
    rounds: 12,
    cooldownSec: 60,
    isInfinite: false
  },
  {
    name: "HIIT 30/30 x 10",
    category: "HIIT",
    warmupSec: 60,
    workSec: 30,
    restSec: 30,
    rounds: 10,
    cooldownSec: 60,
    isInfinite: false
  },
  {
    name: "HIIT 45/15 x 10",
    category: "HIIT",
    warmupSec: 60,
    workSec: 45,
    restSec: 15,
    rounds: 10,
    cooldownSec: 60,
    isInfinite: false
  },
  {
    name: "Tabata 20/10 x 8",
    category: "Tabata",
    warmupSec: 60,
    workSec: 20,
    restSec: 10,
    rounds: 8,
    cooldownSec: 60,
    isInfinite: false
  },
  {
    name: "Tabata 20/10 x 16",
    category: "Tabata",
    warmupSec: 90,
    workSec: 20,
    restSec: 10,
    rounds: 16,
    cooldownSec: 90,
    isInfinite: false
  },
  {
    name: "Tabata 30/15 x 8",
    category: "Tabata",
    warmupSec: 90,
    workSec: 30,
    restSec: 15,
    rounds: 8,
    cooldownSec: 90,
    isInfinite: false
  },
  {
    name: "Starter 30/30 x 8",
    category: "Beginner",
    warmupSec: 60,
    workSec: 30,
    restSec: 30,
    rounds: 8,
    cooldownSec: 60,
    isInfinite: false
  },
  {
    name: "Starter 20/40 x 8",
    category: "Beginner",
    warmupSec: 60,
    workSec: 20,
    restSec: 40,
    rounds: 8,
    cooldownSec: 60,
    isInfinite: false
  },
  {
    name: "Conditioning 60/30 x 8",
    category: "Beginner",
    warmupSec: 90,
    workSec: 60,
    restSec: 30,
    rounds: 8,
    cooldownSec: 90,
    isInfinite: false
  },
  {
    name: "Strength 40/20 x 8",
    category: "Strength",
    warmupSec: 60,
    workSec: 40,
    restSec: 20,
    rounds: 8,
    cooldownSec: 60,
    isInfinite: false
  },
  {
    name: "Strength 60/60 x 6",
    category: "Strength",
    warmupSec: 90,
    workSec: 60,
    restSec: 60,
    rounds: 6,
    cooldownSec: 90,
    isInfinite: false
  },
  {
    name: "Core 30/10 x 12",
    category: "Core",
    warmupSec: 30,
    workSec: 30,
    restSec: 10,
    rounds: 12,
    cooldownSec: 30,
    isInfinite: false
  },
  {
    name: "Low Impact 45/15 x 12",
    category: "Core",
    warmupSec: 60,
    workSec: 45,
    restSec: 15,
    rounds: 12,
    cooldownSec: 60,
    isInfinite: false
  },
  {
    name: "Open HIIT 40/20 (∞)",
    category: "Open",
    warmupSec: 60,
    workSec: 40,
    restSec: 20,
    rounds: 0,
    cooldownSec: 0,
    isInfinite: true
  },
  {
    name: "Open Pace 60/30 (∞)",
    category: "Open",
    warmupSec: 60,
    workSec: 60,
    restSec: 30,
    rounds: 0,
    cooldownSec: 0,
    isInfinite: true
  }
];

const TIMER_CATEGORY_LABELS = {
  HIIT: "HIIT Classics",
  Tabata: "Tabata Variants",
  Beginner: "Beginner / Conditioning",
  Strength: "Strength-Endurance",
  Core: "Core / Low Impact",
  Open: "Open-Ended (∞)",
  Custom: "Custom"
};

const TIMER_PHASE_LABELS = {
  countdown: "Get ready",
  warmup: "Warm-up",
  work: "Work",
  rest: "Rest",
  cooldown: "Cool-down",
  complete: "Complete",
  idle: "Ready"
};

const DEFAULT_NUTRITION_GOALS = {
  id: "default",
  targetKcalMode: "auto",
  computedKcalTarget: null,
  manualKcalTarget: null,
  bmrEstimate: null,
  tdeeEstimate: null,
  goalAdjustmentKcal: null,
  weeklyRateKg: null,
  macroTargetMode: "manual",
  proteinTargetG: 150,
  carbsTargetG: 220,
  fatTargetG: 70,
  fiberTargetG: 25,
  proteinGoalG: 150,
  carbsGoalG: 220,
  fatGoalG: 70,
  fiberGoalG: 25,
  updatedAt: null
};

const FOOD_SEED = [
  {
    id: "food-chicken-breast",
    name: "Chicken breast, cooked",
    brand: "Generic",
    category: "protein",
    nutritionBasis: "per100g",
    per100g: { kcal: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 }
  },
  {
    id: "food-salmon",
    name: "Salmon, cooked",
    brand: "Generic",
    category: "protein",
    nutritionBasis: "per100g",
    per100g: { kcal: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 }
  },
  {
    id: "food-turkey-ground",
    name: "Turkey, ground 93% lean",
    brand: "Generic",
    category: "protein",
    nutritionBasis: "per100g",
    per100g: { kcal: 176, protein: 23, carbs: 0, fat: 9, fiber: 0 }
  },
  {
    id: "food-eggs",
    name: "Eggs, whole",
    brand: "Generic",
    category: "protein",
    nutritionBasis: "per100g",
    per100g: { kcal: 143, protein: 12.6, carbs: 0.7, fat: 9.5, fiber: 0 }
  },
  {
    id: "food-egg-whites",
    name: "Egg whites",
    brand: "Generic",
    category: "protein",
    nutritionBasis: "per100g",
    per100g: { kcal: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fiber: 0 }
  },
  {
    id: "food-greek-yogurt",
    name: "Greek yogurt, nonfat",
    brand: "Generic",
    category: "protein",
    nutritionBasis: "per100g",
    per100g: { kcal: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 }
  },
  {
    id: "food-cottage-cheese",
    name: "Cottage cheese, lowfat",
    brand: "Generic",
    category: "protein",
    nutritionBasis: "per100g",
    per100g: { kcal: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0 }
  },
  {
    id: "food-tofu-firm",
    name: "Tofu, firm",
    brand: "Generic",
    category: "protein",
    nutritionBasis: "per100g",
    per100g: { kcal: 144, protein: 17, carbs: 3.9, fat: 8.7, fiber: 2.3 }
  },
  {
    id: "food-lentils",
    name: "Lentils, cooked",
    brand: "Generic",
    category: "carb",
    nutritionBasis: "per100g",
    per100g: { kcal: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9 }
  },
  {
    id: "food-black-beans",
    name: "Black beans, cooked",
    brand: "Generic",
    category: "carb",
    nutritionBasis: "per100g",
    per100g: { kcal: 132, protein: 8.9, carbs: 23.7, fat: 0.5, fiber: 8.7 }
  },
  {
    id: "food-white-rice",
    name: "White rice, cooked",
    brand: "Generic",
    category: "carb",
    nutritionBasis: "per100g",
    per100g: { kcal: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 }
  },
  {
    id: "food-brown-rice",
    name: "Brown rice, cooked",
    brand: "Generic",
    category: "carb",
    nutritionBasis: "per100g",
    per100g: { kcal: 123, protein: 2.7, carbs: 25.6, fat: 1, fiber: 1.8 }
  },
  {
    id: "food-oats",
    name: "Oats, dry",
    brand: "Generic",
    category: "carb",
    nutritionBasis: "per100g",
    per100g: { kcal: 389, protein: 17, carbs: 66, fat: 6.9, fiber: 10.6 }
  },
  {
    id: "food-whole-wheat-bread",
    name: "Whole wheat bread",
    brand: "Generic",
    category: "carb",
    nutritionBasis: "per100g",
    per100g: { kcal: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 6 }
  },
  {
    id: "food-potato",
    name: "Potato, baked",
    brand: "Generic",
    category: "carb",
    nutritionBasis: "per100g",
    per100g: { kcal: 93, protein: 2.5, carbs: 21, fat: 0.1, fiber: 2.2 }
  },
  {
    id: "food-sweet-potato",
    name: "Sweet potato, baked",
    brand: "Generic",
    category: "carb",
    nutritionBasis: "per100g",
    per100g: { kcal: 90, protein: 2, carbs: 21, fat: 0.2, fiber: 3.3 }
  },
  {
    id: "food-banana",
    name: "Banana",
    brand: "Generic",
    category: "produce",
    nutritionBasis: "per100g",
    per100g: { kcal: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 }
  },
  {
    id: "food-apple",
    name: "Apple",
    brand: "Generic",
    category: "produce",
    nutritionBasis: "per100g",
    per100g: { kcal: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 }
  },
  {
    id: "food-blueberries",
    name: "Blueberries",
    brand: "Generic",
    category: "produce",
    nutritionBasis: "per100g",
    per100g: { kcal: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4 }
  },
  {
    id: "food-broccoli",
    name: "Broccoli",
    brand: "Generic",
    category: "produce",
    nutritionBasis: "per100g",
    per100g: { kcal: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3 }
  },
  {
    id: "food-spinach",
    name: "Spinach",
    brand: "Generic",
    category: "produce",
    nutritionBasis: "per100g",
    per100g: { kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 }
  },
  {
    id: "food-olive-oil",
    name: "Olive oil",
    brand: "Generic",
    category: "fat",
    nutritionBasis: "per100g",
    per100g: { kcal: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 }
  },
  {
    id: "food-peanut-butter",
    name: "Peanut butter",
    brand: "Generic",
    category: "fat",
    nutritionBasis: "per100g",
    per100g: { kcal: 588, protein: 25, carbs: 20, fat: 50, fiber: 6 }
  },
  {
    id: "food-almonds",
    name: "Almonds",
    brand: "Generic",
    category: "fat",
    nutritionBasis: "per100g",
    per100g: { kcal: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5 }
  },
  {
    id: "food-avocado",
    name: "Avocado",
    brand: "Generic",
    category: "fat",
    nutritionBasis: "per100g",
    per100g: { kcal: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7 }
  },
  {
    id: "food-cheddar",
    name: "Cheddar cheese",
    brand: "Generic",
    category: "fat",
    nutritionBasis: "per100g",
    per100g: { kcal: 403, protein: 25, carbs: 1.3, fat: 33, fiber: 0 }
  },
  {
    id: "food-milk-2p",
    name: "Milk 2%",
    brand: "Generic",
    category: "mixed",
    nutritionBasis: "per100g",
    per100g: { kcal: 50, protein: 3.4, carbs: 5, fat: 2, fiber: 0 }
  }
];

const MEDIA_BASE_PRIMARY = "/public/exercises";
const MEDIA_BASE_FALLBACK = "/exercises";
const MEDIA_BASES = [MEDIA_BASE_PRIMARY, MEDIA_BASE_FALLBACK];
const MEDIA_ASPECT_DEFAULT = 16 / 9;

function exerciseMedia(slug, aspectRatio = MEDIA_ASPECT_DEFAULT, base = MEDIA_BASE_PRIMARY) {
  return {
    poster: `${base}/${slug}/poster.webp`,
    webm: `${base}/${slug}/demo.webm`,
    mp4: `${base}/${slug}/demo.mp4`,
    aspectRatio
  };
}

const DEFAULT_FASTING_MODES = [
  { id: "fast-16-8", name: "16:8", fastHours: 16, eatHours: 8, type: "preset" },
  { id: "fast-18-6", name: "18:6", fastHours: 18, eatHours: 6, type: "preset" },
  { id: "fast-20-4", name: "20:4", fastHours: 20, eatHours: 4, type: "preset" },
  { id: "fast-omad", name: "OMAD", fastHours: 23, eatHours: 1, type: "preset" },
  { id: "fast-5-2", name: "5:2", fastHours: 24, eatHours: 24, type: "pattern" },
  { id: "fast-alt", name: "Alternate Day", fastHours: 24, eatHours: 24, type: "pattern" },
  { id: "fast-custom", name: "Custom", fastHours: 14, eatHours: 10, type: "custom" }
];

const EXERCISE_SEED = [
  {
    id: "ex-pushup",
    slug: "push-up",
    name: "Push-up",
    category: "push",
    description: "Classic horizontal push.",
    cues: ["Brace core", "Full range", "Elbows 30-45 deg"],
    faults: "Flaring elbows, sagging hips.",
    scaling: "Knee push-up, incline push-up.",
    equipment: ["none"],
    tags: ["Push", "Strength", "Beginner"],
    media: exerciseMedia("push-up")
  },
  {
    id: "ex-dip",
    slug: "dip",
    name: "Dip",
    category: "push",
    description: "Vertical push with shoulder depth control.",
    cues: ["Scapula down", "Chest proud", "Controlled depth"],
    faults: "Shrugging shoulders, partial ROM.",
    scaling: "Bench dip, band assist.",
    equipment: ["bars"],
    tags: ["Push", "Strength", "Intermediate"],
    media: exerciseMedia("dip")
  },
  {
    id: "ex-pullup",
    slug: "pull-up",
    name: "Pull-up",
    category: "pull",
    description: "Vertical pull to clear the bar.",
    cues: ["Lead with chest", "Control descent", "Full hang"],
    faults: "Kipping, half reps.",
    scaling: "Band assist, negative reps.",
    equipment: ["bar"],
    tags: ["Pull", "Strength", "Intermediate"],
    media: exerciseMedia("pull-up")
  },
  {
    id: "ex-row",
    slug: "inverted-row",
    name: "Inverted row",
    category: "pull",
    description: "Horizontal pull with bodyweight.",
    cues: ["Rigid body line", "Squeeze shoulder blades", "Control tempo"],
    faults: "Hips sag, neck craning.",
    scaling: "Raise bar height.",
    equipment: ["rings", "bar"],
    tags: ["Pull", "Strength", "Beginner"],
    media: exerciseMedia("inverted-row")
  },
  {
    id: "ex-squat",
    slug: "air-squat",
    name: "Air squat",
    category: "legs",
    description: "Foundational leg pattern.",
    cues: ["Knees track toes", "Chest up", "Heels planted"],
    faults: "Heels lift, knees cave.",
    scaling: "Box squat.",
    equipment: ["none"],
    tags: ["Legs", "Foundation", "Beginner"],
    media: exerciseMedia("air-squat")
  },
  {
    id: "ex-lunge",
    slug: "split-lunge",
    name: "Split lunge",
    category: "legs",
    description: "Single-leg strength builder.",
    cues: ["Tall torso", "Steady tempo", "Soft knee drive"],
    faults: "Front knee collapse.",
    scaling: "Assisted lunge.",
    equipment: ["none"],
    tags: ["Legs", "Strength", "Beginner"],
    media: exerciseMedia("split-lunge")
  },
  {
    id: "ex-plank",
    slug: "plank",
    name: "Plank",
    category: "core",
    description: "Isometric core hold.",
    cues: ["Glutes tight", "Neutral spine", "Breath steady"],
    faults: "Hips sagging.",
    scaling: "Knee plank.",
    equipment: ["none"],
    tags: ["Core", "Stability", "Beginner"],
    media: exerciseMedia("plank")
  },
  {
    id: "ex-hollow",
    slug: "hollow-hold",
    name: "Hollow hold",
    category: "core",
    description: "Gymnastics core position.",
    cues: ["Lower back glued", "Ribs down", "Long legs"],
    faults: "Rib flare.",
    scaling: "Tuck hold.",
    equipment: ["none"],
    tags: ["Core", "Skill", "Intermediate"],
    media: exerciseMedia("hollow-hold")
  },
  {
    id: "ex-handstand",
    slug: "handstand",
    name: "Handstand",
    category: "skill",
    description: "Balance and shoulder control.",
    cues: ["Stacked hips", "Active shoulders", "Straight line"],
    faults: "Over-arching.",
    scaling: "Wall walks.",
    equipment: ["wall"],
    tags: ["Skill", "Balance", "Advanced"],
    media: exerciseMedia("handstand")
  },
  {
    id: "ex-lsit",
    slug: "l-sit",
    name: "L-sit",
    category: "skill",
    description: "Compression strength hold.",
    cues: ["Lock elbows", "Lift hips", "Point toes"],
    faults: "Bent arms.",
    scaling: "Tuck sit.",
    equipment: ["parallettes"],
    tags: ["Skill", "Core", "Advanced"],
    media: exerciseMedia("l-sit")
  },
  {
    id: "ex-mobility",
    slug: "thoracic-opener",
    name: "Thoracic opener",
    category: "mobility",
    description: "Opens shoulders and upper back.",
    cues: ["Slow breathing", "Stay relaxed", "Control range"],
    faults: "Rushed reps.",
    scaling: "Reduce range.",
    equipment: ["none"],
    tags: ["Mobility", "Recovery", "Beginner"],
    media: exerciseMedia("thoracic-opener")
  }
];

const PROGRESSION_SEED = [
  {
    progression: {
      id: "prog-pullup",
      name: "Pull-up to Muscle-up",
      description: "Develop pulling strength into a bar muscle-up."
    },
    levels: [
      "Scapular pull",
      "Active hang 20s",
      "Band pull-up 5x",
      "Strict pull-up 3x",
      "Chest-to-bar",
      "Muscle-up"
    ]
  },
  {
    progression: {
      id: "prog-handstand",
      name: "Handstand journey",
      description: "Balance, line, and endurance progression."
    },
    levels: [
      "Wall hold 20s",
      "Wall taps",
      "Box handstand",
      "Freestanding kick-ups",
      "Freestanding 10s"
    ]
  }
];

const EXERCISE_VARIATIONS = {
  "push-up": { easier: ["plank"], harder: ["dip"] },
  "dip": { easier: ["push-up"], harder: [] },
  "pull-up": { easier: ["inverted-row"], harder: [] },
  "inverted-row": { easier: [], harder: ["pull-up"] },
  "air-squat": { easier: [], harder: ["split-lunge"] },
  "split-lunge": { easier: ["air-squat"], harder: [] },
  "plank": { easier: [], harder: ["hollow-hold"] },
  "hollow-hold": { easier: ["plank"], harder: ["l-sit"] },
  "handstand": { easier: ["plank"], harder: [] },
  "l-sit": { easier: ["hollow-hold"], harder: [] }
};

let deferredInstallPrompt = null;
let swRegistration = null;
let reminderTimer = null;
let fabHoldTimer = null;
let prefersLight = null;
let templateFilter = "recent";
let prefersReduced = null;
let activeExerciseId = null;
let captionTimer = null;
let toastTimer = null;
let donutRenderer = null;
let timerRafId = null;
let timerWakeLock = null;
let timerAudio = null;
const foodSwipeStart = new Map();

const routes = [
  "today",
  "train",
  "exercise",
  "steps",
  "timer",
  "timer-new",
  "timer-run",
  "food",
  "food-search",
  "food-portion",
  "food-quick",
  "food-library",
  "food-recipes",
  "food-recipe-new",
  "food-recipe",
  "food-goals",
  "fasting",
  "weight",
  "trends",
  "settings"
];

const routeParents = {
  fasting: "today",
  weight: "today",
  exercise: "train",
  "timer-new": "timer",
  "timer-run": "timer",
  "food-search": "food",
  "food-portion": "food",
  "food-quick": "food",
  "food-library": "food",
  "food-recipes": "food",
  "food-recipe-new": "food",
  "food-recipe": "food",
  "food-goals": "food"
};

const routeTitles = {
  today: "Today",
  train: "Train",
  exercise: "Exercise",
  steps: "Steps",
  timer: "Timer",
  "timer-new": "New timer",
  "timer-run": "Timer run",
  food: "Food",
  "food-search": "Add food",
  "food-portion": "Portion",
  "food-quick": "Quick add",
  "food-library": "Food library",
  "food-recipes": "Recipes",
  "food-recipe-new": "New recipe",
  "food-recipe": "Recipe",
  "food-goals": "Nutrition goals",
  fasting: "Fasting",
  weight: "Weight",
  trends: "Trends",
  settings: "Settings"
};

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));

function dateKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateShort(value) {
  const d = new Date(value);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDateTime(value) {
  const d = new Date(value);
  return d.toLocaleString();
}

function toKg(weight, units) {
  return units === "imperial" ? weight * 0.45359237 : weight;
}

function toLb(weightKg) {
  return weightKg / 0.45359237;
}

function toCm(height, units) {
  return units === "imperial" ? height * 2.54 : height;
}

function toIn(heightCm) {
  return heightCm / 2.54;
}

function formatWeight(weightKg, units) {
  if (weightKg == null) return "--";
  if (units === "imperial") {
    return `${toLb(weightKg).toFixed(1)} lb`;
  }
  return `${weightKg.toFixed(1)} kg`;
}

function formatHeight(heightCm, units) {
  if (heightCm == null) return "--";
  if (units === "imperial") {
    return `${toIn(heightCm).toFixed(1)} in`;
  }
  return `${heightCm.toFixed(1)} cm`;
}

function getAge(profile) {
  if (!profile) return null;
  if (profile.dob) {
    const dob = new Date(profile.dob);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }
  if (profile.age) return Number(profile.age);
  return null;
}

function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  if (!heightM) return null;
  return weightKg / (heightM * heightM);
}

function bmiCategory(bmi) {
  if (bmi == null) return "--";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function calculateBMR(profile) {
  if (!profile) return null;
  const age = getAge(profile);
  if (!age || !profile.heightCm || !profile.weightKg) return null;
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * age;
  if (profile.gender === "male") return base + 5;
  if (profile.gender === "female") return base - 161;
  return base - 78;
}

function calculateTDEE(profile) {
  const bmr = calculateBMR(profile);
  if (!bmr) return null;
  const factor = ACTIVITY_FACTORS[profile.activityLevel] || 1.2;
  return bmr * factor;
}

function roundToNearest(value, step = 10) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(numeric / step) * step;
}

function calculateGoalAdjustment(profile, weeklyRateKg) {
  if (!profile || !profile.goalType) return 0;
  if (profile.goalType === "maintain") return 0;
  const rate = Number(weeklyRateKg) || 0;
  if (rate > 0) {
    const daily = (7700 * rate) / 7;
    return profile.goalType === "cut" ? -daily : daily;
  }
  if (profile.goalType === "cut") return -DEFAULT_CUT_DEFICIT;
  if (profile.goalType === "gain") return DEFAULT_GAIN_SURPLUS;
  return 0;
}

function calculateAutoTarget(profile, goals = {}) {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(profile);
  if (!bmr || !tdee) {
    return {
      target: null,
      bmr: bmr ? Math.round(bmr) : null,
      tdee: tdee ? Math.round(tdee) : null,
      adjustment: null
    };
  }
  const adjustment = calculateGoalAdjustment(profile, goals.weeklyRateKg);
  const target = Math.max(0, roundToNearest(tdee + adjustment, 10));
  return {
    target,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    adjustment: Math.round(adjustment)
  };
}

function resolveTargetKcal(goals) {
  if (!goals) {
    return { target: 0, mode: "auto", manual: 0, computed: 0, hasTarget: false };
  }
  const mode = goals.targetKcalMode === "manual" ? "manual" : "auto";
  const manual = Number(goals.manualKcalTarget) || 0;
  const computed = Number(goals.computedKcalTarget) || 0;
  const target = mode === "manual" ? manual : computed;
  return { target, mode, manual, computed, hasTarget: Boolean(target) };
}

function getTargetWarning(target) {
  if (!target) return "";
  if (target < 1200 || target > 4500) return "Check profile settings";
  return "";
}

function formatDuration(ms) {
  if (ms == null) return "--";
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function formatTimerSeconds(totalSeconds) {
  const safe = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function macroProgress(value, goal) {
  if (!goal) return 0;
  return Math.min(100, Math.round((value / goal) * 100));
}

function roundMacro(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function formatMacro(value) {
  return roundMacro(value).toFixed(1);
}

function formatKcal(value) {
  return Math.round(Number(value) || 0).toLocaleString();
}

function emptyMacros() {
  return { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
}

function addMacros(target, macros) {
  target.kcal += Number(macros.kcal) || 0;
  target.protein += Number(macros.protein) || 0;
  target.carbs += Number(macros.carbs) || 0;
  target.fat += Number(macros.fat) || 0;
  target.fiber += Number(macros.fiber) || 0;
  return target;
}

function scaleMacros(macros, factor) {
  return {
    kcal: (Number(macros.kcal) || 0) * factor,
    protein: (Number(macros.protein) || 0) * factor,
    carbs: (Number(macros.carbs) || 0) * factor,
    fat: (Number(macros.fat) || 0) * factor,
    fiber: (Number(macros.fiber) || 0) * factor
  };
}

function getMacroGoals() {
  const goals = state.nutritionGoals || DEFAULT_NUTRITION_GOALS;
  const target = resolveTargetKcal(goals);
  return {
    calories: target.target,
    targetMode: target.mode,
    protein: Number(goals.proteinTargetG ?? goals.proteinGoalG) || 0,
    carbs: Number(goals.carbsTargetG ?? goals.carbsGoalG) || 0,
    fat: Number(goals.fatTargetG ?? goals.fatGoalG) || 0,
    fiber: Number(goals.fiberTargetG ?? goals.fiberGoalG) || 0
  };
}

function foodDateKey(value) {
  const offset = Number(state.settings?.dayStartHour) || 0;
  const adjusted = new Date(value);
  if (offset) {
    adjusted.setHours(adjusted.getHours() - offset);
  }
  return dateKey(adjusted);
}

function getFoodTotals(dayKey = foodDateKey(new Date())) {
  return state.foodLogs
    .filter((entry) => entry.dateLocal === dayKey)
    .reduce((totals, entry) => addMacros(totals, entry.computedMacros || {}), emptyMacros());
}

function getFoodTotalsByMeal(dayKey = foodDateKey(new Date())) {
  const totals = {};
  MEAL_TYPES.forEach((meal) => {
    totals[meal] = emptyMacros();
  });
  state.foodLogs
    .filter((entry) => entry.dateLocal === dayKey)
    .forEach((entry) => {
      const meal = entry.mealType || "snack";
      if (!totals[meal]) totals[meal] = emptyMacros();
      addMacros(totals[meal], entry.computedMacros || {});
    });
  return totals;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeEquipment(input) {
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }
  if (!input) return [];
  return String(input)
    .split(/[,/]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeMealType(value) {
  const normalized = String(value || "").toLowerCase();
  if (MEAL_TYPES.includes(normalized)) return normalized;
  if (normalized === "meal" || normalized === "other" || normalized === "custom") return "snack";
  return "snack";
}

function getFoodItemById(id) {
  return state.foodItems.find((item) => item.id === id);
}

function getRecipeById(id) {
  return state.recipes.find((item) => item.id === id);
}

function computeFoodMacros(food, { grams, servings } = {}) {
  if (!food) return emptyMacros();
  if (food.nutritionBasis === "per100g") {
    const amount = Number(grams) || 0;
    if (!amount) return emptyMacros();
    return scaleMacros(food.per100g || {}, amount / 100);
  }
  if (food.nutritionBasis === "perServing") {
    const servingMacros = food.perServing || {};
    const servingGrams = Number(servingMacros.servingGrams) || 0;
    if (servings != null && servings !== "") {
      return scaleMacros(servingMacros, Number(servings) || 0);
    }
    if (grams != null && grams !== "" && servingGrams) {
      return scaleMacros(servingMacros, (Number(grams) || 0) / servingGrams);
    }
  }
  return emptyMacros();
}

function computeRecipeTotals(recipe) {
  const total = emptyMacros();
  if (!recipe || !Array.isArray(recipe.ingredients)) return total;
  recipe.ingredients.forEach((ingredient) => {
    const food = getFoodItemById(ingredient.foodId);
    if (!food) return;
    addMacros(total, computeFoodMacros(food, { grams: ingredient.grams }));
  });
  return total;
}

function computeRecipePerServing(recipe, totalMacros) {
  const total = totalMacros || computeRecipeTotals(recipe);
  const yieldAmount = Number(recipe?.yieldAmount) || 0;
  if (!yieldAmount) return emptyMacros();
  return scaleMacros(total, 1 / yieldAmount);
}

function getMediaBaseFromPath(path) {
  if (!path) return MEDIA_BASE_PRIMARY;
  const match = MEDIA_BASES.find((base) => path.startsWith(`${base}/`));
  return match || MEDIA_BASE_PRIMARY;
}

function getExerciseMedia(exercise) {
  if (exercise.media && exercise.media.poster) return exercise.media;
  const slug = exercise.slug || slugify(exercise.name);
  return exerciseMedia(slug);
}

function getExerciseMediaCandidates(exercise) {
  const slug = exercise.slug || slugify(exercise.name);
  const aspectRatio = exercise.media?.aspectRatio || MEDIA_ASPECT_DEFAULT;
  const candidates = [];
  const seen = new Set();

  const addCandidate = (media) => {
    if (!media || !media.poster) return;
    if (seen.has(media.poster)) return;
    candidates.push({ ...media, aspectRatio });
    seen.add(media.poster);
  };

  if (exercise.media && exercise.media.poster) {
    addCandidate(exercise.media);
    const base = getMediaBaseFromPath(exercise.media.poster);
    addCandidate(exerciseMedia(slug, aspectRatio, base));
  }

  MEDIA_BASES.forEach((base) => {
    addCandidate(exerciseMedia(slug, aspectRatio, base));
  });

  return candidates.length ? candidates : [exerciseMedia(slug, aspectRatio)];
}

function formatTag(value) {
  if (!value) return "";
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function getExerciseTags(exercise) {
  const tags = Array.isArray(exercise.tags) ? exercise.tags.slice() : [];
  const tagSet = tags.map((tag) => tag.toLowerCase());
  const categoryTag = formatTag(exercise.category);
  if (categoryTag && !tagSet.includes(categoryTag.toLowerCase())) {
    tags.unshift(categoryTag);
  }
  return tags;
}

function getExerciseCues(exercise) {
  if (Array.isArray(exercise.cues)) return exercise.cues;
  const cues = String(exercise.cues || "")
    .split(/[.,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
  if (cues.length <= 1) {
    return String(exercise.cues || "")
      .split(/[,]/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return cues;
}

async function ensureExerciseSchema() {
  const updates = [];
  state.exercises.forEach((exercise) => {
    let changed = false;
    if (!exercise.slug) {
      exercise.slug = slugify(exercise.name);
      changed = true;
    }
    const slug = exercise.slug || slugify(exercise.name);
    const aspectRatio = exercise.media?.aspectRatio || MEDIA_ASPECT_DEFAULT;
    const mediaBase = getMediaBaseFromPath(exercise.media?.poster);
    const defaultMedia = exerciseMedia(slug, aspectRatio, mediaBase);
    if (!exercise.media || !exercise.media.poster) {
      exercise.media = defaultMedia;
      changed = true;
    } else {
      if (!exercise.media.webm) {
        exercise.media.webm = defaultMedia.webm;
        changed = true;
      }
      if (!exercise.media.mp4) {
        exercise.media.mp4 = defaultMedia.mp4;
        changed = true;
      }
      if (!exercise.media.aspectRatio) {
        exercise.media.aspectRatio = defaultMedia.aspectRatio;
        changed = true;
      }
    }
    if (!Array.isArray(exercise.tags)) {
      exercise.tags = getExerciseTags(exercise);
      changed = true;
    }
    if (!Array.isArray(exercise.equipment)) {
      exercise.equipment = normalizeEquipment(exercise.equipment);
      changed = true;
    }
    if (changed) updates.push(exercise);
  });
  if (updates.length) {
    await bulkPut("exercises", updates);
    state.exercises = await getAll("exercises");
  }
}

function getActiveFast() {
  return state.fastingSessions.find((session) => session.status === "active");
}

function withinQuietHours(now, quietStart, quietEnd) {
  if (!quietStart || !quietEnd) return false;
  const [startH, startM] = quietStart.split(":").map(Number);
  const [endH, endM] = quietEnd.split(":").map(Number);
  const start = new Date(now);
  start.setHours(startH, startM, 0, 0);
  const end = new Date(now);
  end.setHours(endH, endM, 0, 0);
  if (start <= end) {
    return now >= start && now <= end;
  }
  return now >= start || now <= end;
}

function applyAppearanceSettings() {
  const root = document.documentElement;
  const theme = state.settings.theme || "system";
  const density = state.settings.density || "comfortable";
  const accent = state.settings.accent || "amber";
  const fontSize = state.settings.fontSize || "normal";
  root.dataset.theme = theme;
  root.dataset.density = density;
  root.dataset.accent = accent;
  root.dataset.font = fontSize;
  syncThemeColor(theme);
}

function syncThemeColor(theme) {
  const meta = document.querySelector("meta[name=\"theme-color\"]");
  if (!meta) return;
  if (!theme) return;
  const isLight = theme === "light" || (theme === "system" && prefersLight?.matches);
  meta.setAttribute("content", isLight ? "#f6f4f0" : "#0b1316");
}

async function notify(type, title, body) {
  const now = new Date();
  if (withinQuietHours(now, state.settings.quietHours.start, state.settings.quietHours.end)) {
    return;
  }
  state.settings.lastNotification[type] = now.toISOString();
  await put("settings", state.settings);

  if ("Notification" in window && Notification.permission === "granted" && swRegistration) {
    swRegistration.showNotification(title, {
      body,
      icon: "/assets/icons/icon-192.png",
      badge: "/assets/icons/icon-192.png"
    });
  } else {
    alert(`${title}\n${body}`);
  }
}

async function seedData() {
  const exercises = await getAll("exercises");
  if (exercises.length === 0) {
    await bulkPut("exercises", EXERCISE_SEED);
  }
  const fastingModes = await getAll("fastingModes");
  if (fastingModes.length === 0) {
    await bulkPut("fastingModes", DEFAULT_FASTING_MODES);
  }
  const progressions = await getAll("progressions");
  if (progressions.length === 0) {
    for (const item of PROGRESSION_SEED) {
      await put("progressions", item.progression);
      const levels = item.levels.map((name, index) => ({
        id: uuid(),
        progressionId: item.progression.id,
        levelIndex: index + 1,
        name
      }));
      await bulkPut("progressionLevels", levels);
    }
  }
}

async function loadState() {
  state.profile = await get("profiles", "primary");
  const savedSettings = await get("settings", "default");
  state.settings = {
    ...DEFAULT_SETTINGS,
    ...(savedSettings || {}),
    reminders: { ...DEFAULT_SETTINGS.reminders, ...(savedSettings?.reminders || {}) },
    quietHours: { ...DEFAULT_SETTINGS.quietHours, ...(savedSettings?.quietHours || {}) }
  };
  const legacyCalorieGoal = savedSettings?.calorieGoal;
  const legacyProteinGoal = savedSettings?.proteinGoal;
  const legacyCarbGoal = savedSettings?.carbGoal;
  const legacyFatGoal = savedSettings?.fatGoal;
  if (savedSettings?.autoplayDemos == null && prefersReduced?.matches) {
    state.settings.autoplayDemos = false;
  }
  await put("settings", state.settings);

  state.steps = await getAll("steps");
  state.fastingSessions = await getAll("fastingSessions");
  state.fastingModes = await getAll("fastingModes");
  state.weightEntries = await getAll("weightEntries");
  state.nutritionEntries = await getAll("nutritionEntries");
  state.foodItems = await getAll("foodItems");
  state.recipes = await getAll("recipes");
  state.foodLogs = await getAll("foodLogs");
  state.nutritionGoals = await get("nutritionGoals", "default");
  state.intervalPrograms = await getAll("intervalPrograms");
  state.intervalSessions = await getAll("intervalSessions");
  state.exercises = await getAll("exercises");
  state.templates = await getAll("workoutTemplates");
  state.workouts = await getAll("workouts");
  state.workoutSets = await getAll("workoutSets");
  state.progressions = await getAll("progressions");
  state.progressionLevels = await getAll("progressionLevels");
  state.progressionStatus = await getAll("progressionStatus");

  if (!state.nutritionGoals) {
    const fallback = {
      ...DEFAULT_NUTRITION_GOALS,
      targetKcalMode: state.profile ? "auto" : "manual",
      manualKcalTarget: legacyCalorieGoal != null ? Number(legacyCalorieGoal) || null : null,
      macroTargetMode: "manual",
      proteinTargetG:
        legacyProteinGoal != null ? Number(legacyProteinGoal) || 0 : DEFAULT_NUTRITION_GOALS.proteinTargetG,
      carbsTargetG: legacyCarbGoal != null ? Number(legacyCarbGoal) || 0 : DEFAULT_NUTRITION_GOALS.carbsTargetG,
      fatTargetG: legacyFatGoal != null ? Number(legacyFatGoal) || 0 : DEFAULT_NUTRITION_GOALS.fatTargetG,
      fiberTargetG: DEFAULT_NUTRITION_GOALS.fiberTargetG,
      proteinGoalG:
        legacyProteinGoal != null ? Number(legacyProteinGoal) || 0 : DEFAULT_NUTRITION_GOALS.proteinGoalG,
      carbsGoalG: legacyCarbGoal != null ? Number(legacyCarbGoal) || 0 : DEFAULT_NUTRITION_GOALS.carbsGoalG,
      fatGoalG: legacyFatGoal != null ? Number(legacyFatGoal) || 0 : DEFAULT_NUTRITION_GOALS.fatGoalG,
      fiberGoalG: DEFAULT_NUTRITION_GOALS.fiberGoalG,
      updatedAt: new Date().toISOString()
    };
    const auto = calculateAutoTarget(state.profile, fallback);
    const merged = {
      ...fallback,
      computedKcalTarget: auto.target,
      bmrEstimate: auto.bmr,
      tdeeEstimate: auto.tdee,
      goalAdjustmentKcal: auto.adjustment
    };
    state.nutritionGoals = merged;
    await put("nutritionGoals", merged);
  } else {
    const normalized = {
      ...DEFAULT_NUTRITION_GOALS,
      ...state.nutritionGoals,
      updatedAt: state.nutritionGoals.updatedAt || new Date().toISOString()
    };
    if (!normalized.targetKcalMode) {
      normalized.targetKcalMode = "manual";
    }
    if (!normalized.macroTargetMode) {
      normalized.macroTargetMode = "manual";
    }
    if (normalized.manualKcalTarget == null && state.nutritionGoals.dailyKcalGoal != null) {
      normalized.manualKcalTarget = Number(state.nutritionGoals.dailyKcalGoal) || 0;
    }
    if (normalized.manualKcalTarget == null) {
      normalized.manualKcalTarget = legacyCalorieGoal != null ? Number(legacyCalorieGoal) || null : null;
    }
    if (normalized.proteinTargetG == null && normalized.proteinGoalG != null) {
      normalized.proteinTargetG = Number(normalized.proteinGoalG) || 0;
    }
    if (normalized.carbsTargetG == null && normalized.carbsGoalG != null) {
      normalized.carbsTargetG = Number(normalized.carbsGoalG) || 0;
    }
    if (normalized.fatTargetG == null && normalized.fatGoalG != null) {
      normalized.fatTargetG = Number(normalized.fatGoalG) || 0;
    }
    if (normalized.fiberTargetG == null && normalized.fiberGoalG != null) {
      normalized.fiberTargetG = Number(normalized.fiberGoalG) || 0;
    }
    if (normalized.proteinTargetG == null && legacyProteinGoal != null) {
      normalized.proteinTargetG = Number(legacyProteinGoal) || 0;
    }
    if (normalized.carbsTargetG == null && legacyCarbGoal != null) {
      normalized.carbsTargetG = Number(legacyCarbGoal) || 0;
    }
    if (normalized.fatTargetG == null && legacyFatGoal != null) {
      normalized.fatTargetG = Number(legacyFatGoal) || 0;
    }
    normalized.proteinGoalG = normalized.proteinTargetG;
    normalized.carbsGoalG = normalized.carbsTargetG;
    normalized.fatGoalG = normalized.fatTargetG;
    normalized.fiberGoalG = normalized.fiberTargetG;
    const auto = calculateAutoTarget(state.profile, normalized);
    normalized.computedKcalTarget = auto.target;
    normalized.bmrEstimate = auto.bmr;
    normalized.tdeeEstimate = auto.tdee;
    normalized.goalAdjustmentKcal = auto.adjustment;
    state.nutritionGoals = normalized;
    await put("nutritionGoals", normalized);
  }

  if (!state.settings.foodMigrationDone && state.foodLogs.length === 0 && state.nutritionEntries.length) {
    const migrated = state.nutritionEntries.map((entry) => ({
      id: entry.id || uuid(),
      dateLocal: entry.date || foodDateKey(entry.at || new Date()),
      datetime: entry.at || new Date().toISOString(),
      mealType: normalizeMealType(entry.meal),
      sourceType: "quick",
      sourceId: null,
      amountGrams: null,
      amountServings: null,
      computedMacros: {
        kcal: Number(entry.calories) || 0,
        protein: Number(entry.protein) || 0,
        carbs: Number(entry.carbs) || 0,
        fat: Number(entry.fat) || 0,
        fiber: Number(entry.fiber) || 0
      },
      notes: entry.notes || ""
    }));
    await bulkPut("foodLogs", migrated);
    state.foodLogs = await getAll("foodLogs");
    state.settings.foodMigrationDone = true;
    await put("settings", state.settings);
  }

  await seedIntervalPrograms();
}

async function seedFoodDatabase() {
  const existing = await getAll("foodItems");
  if (existing.length) return;
  const toast = qs("#seed-toast");
  const now = new Date().toISOString();
  const items = FOOD_SEED.map((item) => ({
    ...item,
    isUserCreated: false,
    isFavorite: false,
    lastUsedAt: null,
    createdAt: now,
    updatedAt: now
  }));
  const chunkSize = 6;
  for (let i = 0; i < items.length; i += chunkSize) {
    await bulkPut("foodItems", items.slice(i, i + chunkSize));
    if (toast) {
      toast.textContent = `Seeding food database ${Math.min(i + chunkSize, items.length)}/${items.length}`;
      toast.hidden = false;
    }
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
  state.foodItems = await getAll("foodItems");
  if (toast) {
    toast.textContent = "Food database ready";
    setTimeout(() => {
      toast.hidden = true;
    }, 1200);
  }
  renderFoodSearch();
  renderFoodLibrary();
}

async function seedIntervalPrograms() {
  const existing = await getAll("intervalPrograms");
  const existingIds = new Set(existing.map((program) => program.id));
  const now = new Date().toISOString();
  const builtIns = TIMER_PRESET_SEED.map((preset) => ({
    id: `timer-${slugify(preset.name)}`,
    name: preset.name,
    category: preset.category,
    type: "simple",
    workSec: preset.workSec,
    restSec: preset.restSec,
    rounds: preset.rounds,
    isInfinite: preset.isInfinite,
    warmupSec: preset.warmupSec,
    cooldownSec: preset.cooldownSec,
    settings: { ...DEFAULT_TIMER_SETTINGS },
    isBuiltIn: true,
    isFavorite: false,
    createdAt: now,
    updatedAt: now
  }));
  const missing = builtIns.filter((preset) => !existingIds.has(preset.id));
  if (missing.length) {
    await bulkPut("intervalPrograms", missing);
  }
  state.intervalPrograms = await getAll("intervalPrograms");
}

async function loadDonutRenderer() {
  if (donutRenderer) return donutRenderer;
  const module = await import("/food-chart.js");
  donutRenderer = module.renderDonutChart;
  return donutRenderer;
}

function render() {
  applyAppearanceSettings();
  renderDashboard();
  renderSteps();
  renderFood();
  renderFoodSearch();
  renderFoodPortion();
  renderFoodLibrary();
  renderRecipes();
  renderRecipeDraft();
  renderRecipeDetail();
  renderFoodGoals();
  renderFoodQuick();
  renderTimerHome();
  renderTimerForm();
  renderTimerRun();
  renderFasting();
  renderWeight();
  renderCalisthenics();
  renderExerciseDetail();
  renderAnalytics();
  renderProfile();
  updateFastControls(getActiveFast());
}

function renderDashboard() {
  const today = dateKey(new Date());
  const stepsToday = state.steps
    .filter((entry) => entry.date === today)
    .reduce((sum, entry) => sum + entry.count, 0);
  const stepsStreak = calculateStepsStreak();
  const stepsGoal = state.settings.stepsGoal || 0;
  qs("#today-steps").textContent = stepsToday.toLocaleString();
  qs("#today-steps-meta").textContent = `Goal ${stepsGoal.toLocaleString()} | Streak ${stepsStreak}`;
  const stepsProgress = stepsGoal ? Math.min(100, Math.round((stepsToday / stepsGoal) * 100)) : 0;
  qs("#today-steps-bar").style.width = `${stepsProgress}%`;

  const activeFast = getActiveFast();
  const mode = state.fastingModes.find((item) => item.id === state.settings.activeFastingModeId);
  qs("#today-fast-mode").textContent = mode ? mode.name : "Custom";
  if (activeFast) {
    const elapsed = Date.now() - new Date(activeFast.startAt).getTime();
    qs("#today-fast-status").textContent = "Fasting";
    qs("#today-fast-elapsed").textContent = formatDuration(elapsed);
    qs("#today-fast-next").textContent = `Ends in ${formatDuration(getFastRemaining(activeFast))}`;
  } else {
    qs("#today-fast-status").textContent = "Not fasting";
    qs("#today-fast-elapsed").textContent = "--";
    qs("#today-fast-next").textContent = "Next window: start when ready";
  }

  const lastWorkout = state.workouts
    .filter((workout) => workout.endedAt)
    .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))[0];
  qs("#today-workout").textContent = lastWorkout ? lastWorkout.name : "No session yet";
  qs("#today-workout-meta").textContent = lastWorkout
    ? `Last session ${formatDateShort(lastWorkout.endedAt)}`
    : "Last session --";

  const latestWeight = getLatestWeight();
  qs("#today-weight").textContent = latestWeight
    ? formatWeight(latestWeight.weightKg, state.settings.units)
    : "--";
  qs("#today-weight-meta").textContent = latestWeight ? weightTrendSummary() : "Trend --";

  const foodKey = foodDateKey(new Date());
  const foodTotals = getFoodTotals(foodKey);
  const goals = getMacroGoals();
  const targetInfo = resolveTargetKcal(state.nutritionGoals || DEFAULT_NUTRITION_GOALS);
  const foodMeta = qs("#today-food-meta");
  if (foodMeta) {
    foodMeta.textContent = targetInfo.hasTarget
      ? `${formatKcal(foodTotals.kcal)} / ${formatKcal(targetInfo.target)} kcal`
      : `${formatKcal(foodTotals.kcal)} kcal`;
  }
  const foodMacros = qs("#today-food-macros");
  if (foodMacros) {
    foodMacros.textContent = `P ${formatMacro(foodTotals.protein)}g C ${formatMacro(foodTotals.carbs)}g F ${formatMacro(
      foodTotals.fat
    )}g`;
  }
  const foodRemaining = qs("#today-food-remaining");
  if (foodRemaining) {
    if (!targetInfo.hasTarget) {
      foodRemaining.textContent = "Set a calorie target";
    } else {
      const remaining = Math.max(targetInfo.target - foodTotals.kcal, 0);
      foodRemaining.textContent = `${formatKcal(remaining)} kcal remaining`;
    }
  }
  const calorieBar = qs("#today-food-bar");
  if (calorieBar) {
    calorieBar.style.width = `${macroProgress(foodTotals.kcal, goals.calories)}%`;
  }

  qs("#today-focus").textContent = getGoalFocus();

  renderTodayNudges(stepsToday, stepsGoal);
  renderTodayHistory();
}

function renderTodayNudges(stepsToday, stepsGoal) {
  const container = qs("#today-nudges");
  const card = qs("#today-nudges-card");
  if (!container || !card) return;
  const nudges = [];
  const latestWeight = getLatestWeight();
  if (!latestWeight || Date.now() - new Date(latestWeight.at).getTime() > 3 * 86400000) {
    nudges.push({
      id: "log-weight",
      title: "No weight logged in 3 days",
      body: "Quickly log a new weigh-in to keep trends accurate.",
      cta: "Log weight"
    });
  }
  const foodKey = foodDateKey(new Date());
  const hasFood = state.foodLogs.some((entry) => entry.dateLocal === foodKey);
  if (!hasFood && new Date().getHours() >= 12) {
    nudges.push({
      id: "log-food",
      title: "No food logged today",
      body: "Log a meal to track calories and macros.",
      cta: "Log food"
    });
  }
  if (new Date().getHours() >= 14 && stepsGoal > 0 && stepsToday < stepsGoal * 0.5) {
    nudges.push({
      id: "log-steps",
      title: "Steps below goal by 2pm",
      body: "Add a manual entry or take a short walk to catch up.",
      cta: "Log steps"
    });
  }
  if ("Notification" in window && Notification.permission !== "granted") {
    nudges.push({
      id: "enable-notifications",
      title: "Fasting reminders are off",
      body: "Enable notifications for start/end nudges.",
      cta: "Enable"
    });
  }

  if (!nudges.length) {
    card.hidden = true;
    return;
  }
  card.hidden = false;
  container.innerHTML = nudges
    .map(
      (nudge) => `
        <div class="list-item">
          <strong>${nudge.title}</strong>
          <div class="muted">${nudge.body}</div>
          <button class="ghost" type="button" data-nudge="${nudge.id}">${nudge.cta}</button>
        </div>
      `
    )
    .join("");
}

function renderTodayHistory() {
  const container = qs("#today-history");
  if (!container) return;
  const items = [];
  const lastSteps = state.steps
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (lastSteps) {
    items.push({
      at: lastSteps.date,
      label: "Steps",
      detail: `${lastSteps.count.toLocaleString()} steps`
    });
  }

  const lastFast = state.fastingSessions
    .filter((session) => session.status === "complete")
    .sort((a, b) => new Date(b.endAt) - new Date(a.endAt))[0];
  if (lastFast) {
    const modeName = state.fastingModes.find((m) => m.id === lastFast.modeId)?.name || "Custom";
    items.push({
      at: lastFast.endAt,
      label: "Fast",
      detail: `${modeName} | ${formatDuration(lastFast.elapsedMs)}`
    });
  }

  const latestWeight = getLatestWeight();
  if (latestWeight) {
    items.push({
      at: latestWeight.at,
      label: "Weight",
      detail: formatWeight(latestWeight.weightKg, state.settings.units)
    });
  }

  const lastFood = state.foodLogs
    .slice()
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))[0];
  if (lastFood) {
    const detail = formatFoodLogSummary(lastFood);
    items.push({
      at: lastFood.datetime,
      label: "Food",
      detail
    });
  }

  const lastWorkout = state.workouts
    .filter((workout) => workout.endedAt)
    .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))[0];
  if (lastWorkout) {
    items.push({
      at: lastWorkout.endedAt,
      label: "Workout",
      detail: lastWorkout.name
    });
  }

  items.sort((a, b) => new Date(b.at) - new Date(a.at));
  const html = items
    .slice(0, 4)
    .map((item) => {
      return `<div class="list-item"><strong>${item.label}</strong><div>${item.detail}</div><div class="muted">${formatDateShort(item.at)}</div></div>`;
    })
    .join("");
  container.innerHTML = html || "<div class=\"list-item\">No activity logged yet.</div>";
}

function renderSteps() {
  qs("#steps-goal").textContent = `${state.settings.stepsGoal.toLocaleString()} steps`;
  const weekStats = getWeekStepStats();
  const monthStats = getMonthStepStats();
  qs("#steps-week").textContent = `${weekStats.average.toLocaleString()} avg/day | ${weekStats.streak} day streak | ${weekStats.distance} km est.`;
  qs("#steps-month").textContent = `Month: ${monthStats.total.toLocaleString()} total | ${monthStats.average.toLocaleString()} avg/day`;

  const todayKey = dateKey(new Date());
  const todaySteps = state.steps
    .filter((entry) => entry.date === todayKey)
    .reduce((sum, entry) => sum + entry.count, 0);
  const goal = state.settings.stepsGoal || 0;
  const progress = goal ? Math.min(100, Math.round((todaySteps / goal) * 100)) : 0;
  qs("#steps-goal-bar").style.width = `${progress}%`;

  const weekStrip = qs("#steps-week-strip");
  const days = [...Array(7).keys()].map((i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return { key: dateKey(date), label: date.toLocaleDateString(undefined, { weekday: "short" }) };
  });
  const dayTotals = days.map((day) =>
    state.steps.filter((entry) => entry.date === day.key).reduce((sum, entry) => sum + entry.count, 0)
  );
  weekStrip.innerHTML = days
    .map((day, index) => {
      const total = dayTotals[index] || 0;
      const height = goal ? Math.min(100, Math.round((total / goal) * 100)) : 0;
      const visibleHeight = total ? Math.max(12, height) : 0;
      return `<div><span style="height:${visibleHeight}%\"></span><small>${day.label}</small></div>`;
    })
    .join("");

  const history = state.steps
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)
    .reverse();
  const historyList = history
    .map((entry) => {
      const distance = ((entry.count || 0) * 0.0008).toFixed(2);
      const calories = Math.round(entry.count * 0.04);
      return `<div class="list-item"><strong>${entry.date}</strong><div>${entry.count.toLocaleString()} steps | ${distance} km est | ${calories} kcal est</div><div>Source: ${entry.source}</div></div>`;
    })
    .join("");
  qs("#steps-history").innerHTML = historyList || "<div class=\"list-item\">No steps logged yet.</div>";
}

function getFoodLogSourceName(entry) {
  if (!entry) return "Food";
  if (entry.sourceType === "food") {
    return getFoodItemById(entry.sourceId)?.name || "Food item";
  }
  if (entry.sourceType === "recipe") {
    return getRecipeById(entry.sourceId)?.name || "Recipe";
  }
  if (entry.sourceType === "quick") return "Quick add";
  return "Food";
}

function formatFoodPortion(entry) {
  if (!entry) return "";
  if (entry.sourceType === "quick") return "Quick add";
  if (entry.amountGrams) return `${formatMacro(entry.amountGrams)} g`;
  if (entry.amountServings) {
    const servings = formatMacro(entry.amountServings);
    return `${servings} serving${Number(entry.amountServings) === 1 ? "" : "s"}`;
  }
  return "Portion";
}

function formatFoodMacroLine(macros) {
  if (!macros) return "P 0.0g C 0.0g F 0.0g";
  const line = `P ${formatMacro(macros.protein)}g C ${formatMacro(macros.carbs)}g F ${formatMacro(macros.fat)}g`;
  if (Number(macros.fiber) > 0) {
    return `${line} Fi ${formatMacro(macros.fiber)}g`;
  }
  return line;
}

function renderMacroVisuals(totals, goals) {
  const grid = qs("#macro-donut-grid");
  if (!grid) return;
  const isCompact = state.settings.density === "compact";
  const foodRoute = qs(".route[data-route=\"food\"]");
  const foodVisible = foodRoute ? !foodRoute.hidden : true;

  const updateMacro = (renderDonut) => {
    MACRO_VISUALS.forEach((macro) => {
      const consumed = Number(totals[macro.key]) || 0;
      const target = Number(goals[macro.key]) || 0;
      const hasTarget = target > 0;
      const over = hasTarget ? Math.max(consumed - target, 0) : 0;

      const labelEl = qs(`#macro-label-${macro.key}`);
      if (labelEl) labelEl.textContent = isCompact ? macro.short : macro.label;

      const valueEl = qs(`#macro-value-${macro.key}`);
      if (valueEl) {
        valueEl.textContent = hasTarget
          ? `${formatMacro(consumed)} / ${formatMacro(target)} g`
          : `${formatMacro(consumed)} g`;
      }

      const overEl = qs(`#macro-over-${macro.key}`);
      if (overEl) {
        overEl.hidden = over <= 0;
        if (over > 0) overEl.textContent = `+${formatMacro(over)} g over`;
      }

      const emptyEl = qs(`#macro-empty-${macro.key}`);
      if (emptyEl) emptyEl.hidden = hasTarget;

      const donutEl = qs(`#macro-donut-${macro.key}`);
      if (donutEl) {
        donutEl.setAttribute("role", "img");
        donutEl.setAttribute(
          "aria-label",
          hasTarget
            ? `${macro.label}: ${formatMacro(consumed)} grams of ${formatMacro(target)} grams`
            : `${macro.label}: ${formatMacro(consumed)} grams, target not set`
        );
        if (renderDonut && foodVisible) {
          renderDonut(donutEl, { consumed, target });
        }
      }
    });
  };

  if (foodVisible) {
    loadDonutRenderer().then(updateMacro);
  } else {
    updateMacro(null);
  }
}

function formatFoodLogSummary(entry) {
  const name = getFoodLogSourceName(entry);
  const macros = entry?.computedMacros || emptyMacros();
  return `${name} | ${formatKcal(macros.kcal)} kcal | ${formatFoodMacroLine(macros)}`;
}

function getFoodBasisLabel(food) {
  if (!food) return "";
  if (food.nutritionBasis === "perServing") {
    const grams = food.perServing?.servingGrams;
    return grams ? `per serving (${grams} g)` : "per serving";
  }
  return "per 100g";
}

function getFoodBaseMacros(food) {
  if (!food) return emptyMacros();
  if (food.nutritionBasis === "perServing") return food.perServing || emptyMacros();
  return food.per100g || emptyMacros();
}

function renderFood() {
  const kcalEl = qs("#food-today-kcal");
  if (!kcalEl) return;
  const dayKey = foodDateKey(new Date());
  const totals = getFoodTotals(dayKey);
  const goals = getMacroGoals();
  const targetInfo = resolveTargetKcal(state.nutritionGoals || DEFAULT_NUTRITION_GOALS);
  const target = targetInfo.target;
  const hasTarget = targetInfo.hasTarget;
  const autoEstimate = calculateAutoTarget(state.profile, state.nutritionGoals || DEFAULT_NUTRITION_GOALS);
  const needsProfile = targetInfo.mode === "auto" && !autoEstimate.target;

  kcalEl.textContent = `${formatKcal(totals.kcal)} kcal`;
  const macroLineEl = qs("#food-today-macros");
  if (macroLineEl) {
    macroLineEl.textContent = `P ${formatMacro(totals.protein)}g C ${formatMacro(totals.carbs)}g F ${formatMacro(
      totals.fat
    )}g`;
  }
  const remainingEl = qs("#food-today-remaining");
  if (remainingEl) {
    if (!hasTarget) {
      remainingEl.textContent = needsProfile
        ? "Finish your profile to estimate a target."
        : "Set a calorie target.";
    } else {
      const remaining = Math.max(target - totals.kcal, 0);
      remainingEl.textContent = `Remaining ${formatKcal(remaining)} kcal`;
    }
  }
  const donutValue = qs("#food-donut-value");
  if (donutValue) {
    donutValue.textContent = hasTarget ? `${formatKcal(totals.kcal)} / ${formatKcal(target)}` : "-- / --";
  }
  const donutOver = qs("#food-donut-over");
  if (donutOver) {
    const over = hasTarget ? Math.max(totals.kcal - target, 0) : 0;
    donutOver.hidden = over <= 0;
    if (over > 0) donutOver.textContent = `+${formatKcal(over)} over`;
  }
  const donutEmpty = qs("#food-donut-empty");
  if (donutEmpty) {
    donutEmpty.hidden = hasTarget;
    if (!hasTarget) {
      donutEmpty.textContent = needsProfile
        ? "Finish your profile to estimate a target."
        : "Set a calorie target to see progress.";
    }
  }
  const targetNote = qs("#food-target-note");
  if (targetNote) {
    targetNote.textContent = targetInfo.mode === "auto" ? "Estimate" : "Manual target";
    targetNote.hidden = !hasTarget && targetInfo.mode !== "auto";
  }
  const targetNudge = qs("#food-target-nudge");
  if (targetNudge) {
    const warning = getTargetWarning(target);
    targetNudge.textContent = warning;
    targetNudge.hidden = !warning;
  }
  const donutWrap = qs("#food-donut");
  const foodRoute = qs(".route[data-route=\"food\"]");
  const foodVisible = foodRoute ? !foodRoute.hidden : true;
  if (donutWrap && foodVisible) {
    loadDonutRenderer().then((renderDonut) => {
      renderDonut(donutWrap, { consumed: totals.kcal, target });
    });
  }

  const disclaimer = qs("#food-disclaimer");
  if (disclaimer) {
    disclaimer.hidden = Boolean(state.settings.foodDisclaimerDismissed);
  }

  renderMacroVisuals(totals, goals);

  const proteinEl = qs("#food-macro-protein");
  const carbsEl = qs("#food-macro-carbs");
  const fatEl = qs("#food-macro-fat");
  const fiberEl = qs("#food-macro-fiber");
  if (proteinEl) proteinEl.textContent = `P ${formatMacro(totals.protein)}g`;
  if (carbsEl) carbsEl.textContent = `C ${formatMacro(totals.carbs)}g`;
  if (fatEl) fatEl.textContent = `F ${formatMacro(totals.fat)}g`;
  if (fiberEl) fiberEl.textContent = `Fi ${formatMacro(totals.fiber)}g`;

  const proteinGoal = Number(goals.protein) || 0;
  const carbsGoal = Number(goals.carbs) || 0;
  const fatGoal = Number(goals.fat) || 0;
  qs("#food-protein-bar").style.width = `${macroProgress(totals.protein, proteinGoal)}%`;
  qs("#food-carbs-bar").style.width = `${macroProgress(totals.carbs, carbsGoal)}%`;
  qs("#food-fat-bar").style.width = `${macroProgress(totals.fat, fatGoal)}%`;
  qs("#food-protein-meta").textContent = proteinGoal
    ? `${formatMacro(totals.protein)} / ${formatMacro(proteinGoal)} g`
    : "Set target";
  qs("#food-carbs-meta").textContent = carbsGoal
    ? `${formatMacro(totals.carbs)} / ${formatMacro(carbsGoal)} g`
    : "Set target";
  qs("#food-fat-meta").textContent = fatGoal
    ? `${formatMacro(totals.fat)} / ${formatMacro(fatGoal)} g`
    : "Set target";

  const fiberGoal = Number(goals.fiber) || 0;
  const showFiber = fiberGoal > 0 || Number(totals.fiber) > 0;
  const fiberWrap = qs("#food-fiber-wrap");
  if (fiberWrap) fiberWrap.hidden = !showFiber;
  if (fiberEl) fiberEl.hidden = !showFiber;
  if (showFiber) {
    qs("#food-fiber-bar").style.width = `${macroProgress(totals.fiber, fiberGoal)}%`;
    qs("#food-fiber-meta").textContent = fiberGoal
      ? `${formatMacro(totals.fiber)} / ${formatMacro(fiberGoal)} g`
      : "Set target";
  }

  const entries = state.foodLogs
    .filter((entry) => entry.dateLocal === dayKey)
    .slice()
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  const meals = MEAL_TYPES.reduce((acc, meal) => {
    acc[meal] = [];
    return acc;
  }, {});
  entries.forEach((entry) => {
    const meal = normalizeMealType(entry.mealType);
    meals[meal].push(entry);
  });

  const mealTotals = getFoodTotalsByMeal(dayKey);
  MEAL_TYPES.forEach((meal) => {
    const list = qs(`#meal-${meal}-list`);
    const meta = qs(`#meal-${meal}-meta`);
    if (meta) meta.textContent = `${formatKcal(mealTotals[meal]?.kcal || 0)} kcal`;
    if (!list) return;
    if (!meals[meal].length) {
      list.innerHTML = "<div class=\"list-item\">No entries yet.</div>";
      return;
    }
    list.innerHTML = meals[meal]
      .map((entry) => {
        const name = getFoodLogSourceName(entry);
        const portion = formatFoodPortion(entry);
        const macros = entry.computedMacros || emptyMacros();
        return `
          <div class=\"list-item food-entry\" data-food-entry-id=\"${entry.id}\">
            <div>
              <strong>${name}</strong>
              <div class=\"muted\">${portion}</div>
            </div>
            <div class=\"food-entry-meta\">
              <strong>${formatKcal(macros.kcal)} kcal</strong>
              <div class=\"muted\">${formatFoodMacroLine(macros)}</div>
            </div>
            <button class=\"ghost food-entry-delete\" type=\"button\" data-food-delete=\"${entry.id}\">Delete</button>
          </div>
        `;
      })
      .join("");
  });
}

function renderFoodSearch() {
  const list = qs("#food-search-results");
  if (!list) return;
  const input = qs("#food-search-input");
  const mealSelect = qs("#food-meal-select");
  const categorySelect = qs("#food-category-filter");
  if (input && input.value !== state.foodSearch.query) input.value = state.foodSearch.query;
  if (mealSelect) mealSelect.value = state.foodSearch.meal;
  if (categorySelect) categorySelect.value = state.foodSearch.category;

  qsa("#food-search-tabs button").forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.foodTab === state.foodSearch.tab);
  });

  const query = state.foodSearch.query.trim().toLowerCase();
  const category = state.foodSearch.category;
  const tab = state.foodSearch.tab;

  let items = state.foodItems.slice();
  if (category !== "all") {
    items = items.filter((item) => item.category === category);
  }
  if (query) {
    items = items.filter((item) => {
      const haystack = `${item.name} ${item.brand || ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  if (tab === "favorites") {
    items = items.filter((item) => item.isFavorite);
    items.sort((a, b) => a.name.localeCompare(b.name));
  } else if (tab === "recents") {
    items = items
      .filter((item) => item.lastUsedAt)
      .sort((a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt));
  } else {
    items.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (!items.length) {
    const message = tab === "recents"
      ? "No recent foods yet. Log a meal to build recents."
      : "No foods found. Try another search or category.";
    list.innerHTML = `<div class="list-item">${message}</div>`;
    return;
  }

  list.innerHTML = items
    .map((food) => {
      const macros = getFoodBaseMacros(food);
      const basisLabel = getFoodBasisLabel(food);
      return `
        <div class=\"list-item food-result\" data-food-id=\"${food.id}\">
          <div>
            <strong>${food.name}</strong>
            <div class=\"muted\">${food.brand || "Generic"} | ${formatTag(food.category)} | ${basisLabel}</div>
            <div class=\"muted\">${formatKcal(macros.kcal)} kcal | ${formatFoodMacroLine(macros)}</div>
          </div>
          <div class=\"food-entry-meta\">
            <button class=\"ghost\" type=\"button\" data-food-favorite=\"${food.id}\">${food.isFavorite ? "Unfavorite" : "Favorite"}</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderFoodPortion() {
  const nameEl = qs("#portion-food-name");
  if (!nameEl) return;
  const mealLabel = qs("#portion-meal-label");
  const metaEl = qs("#portion-food-meta");
  const modeButtons = qsa("#portion-mode button");
  const portionForm = qs("#portion-form");
  const selection = state.foodPortion;
  let supportsGrams = true;
  let supportsServings = true;
  let basisLabel = "";

  if (selection.sourceType === "recipe") {
    const recipe = getRecipeById(selection.sourceId);
    nameEl.textContent = recipe?.name || "Recipe";
    const yieldType = recipe?.yieldType || "servings";
    supportsGrams = yieldType === "grams";
    supportsServings = yieldType === "servings";
    basisLabel = yieldType === "grams" ? "per gram" : "per serving";
  } else {
    const food = getFoodItemById(selection.sourceId);
    nameEl.textContent = food?.name || "Food";
    if (!food || food.nutritionBasis === "per100g") {
      supportsServings = false;
      basisLabel = "per 100g";
    } else {
      const servingGrams = Number(food.perServing?.servingGrams) || 0;
      supportsGrams = Boolean(servingGrams);
      basisLabel = getFoodBasisLabel(food);
    }
  }

  if (!supportsGrams && selection.mode === "grams") selection.mode = "servings";
  if (!supportsServings && selection.mode === "servings") selection.mode = "grams";

  modeButtons.forEach((button) => {
    const mode = button.dataset.portionMode;
    const enabled = mode === "grams" ? supportsGrams : supportsServings;
    button.disabled = !enabled;
    button.setAttribute("aria-pressed", selection.mode === mode);
  });

  if (metaEl) metaEl.textContent = basisLabel;
  if (mealLabel) mealLabel.textContent = MEAL_LABELS[selection.meal] || "Meal";

  if (portionForm) {
    portionForm.dataset.entryId = selection.entryId || "";
  }

  updatePortionPreview();
}

function renderFoodLibrary() {
  const list = qs("#food-library-list");
  if (!list) return;
  const foods = state.foodItems.slice().sort((a, b) => a.name.localeCompare(b.name));
  if (!foods.length) {
    list.innerHTML = "<div class=\"list-item\">No foods yet. Create a custom item to get started.</div>";
    return;
  }
  list.innerHTML = foods
    .map((food) => {
      const macros = getFoodBaseMacros(food);
      const basisLabel = getFoodBasisLabel(food);
      const actions = [
        `<button class=\"ghost\" type=\"button\" data-food-favorite=\"${food.id}\">${food.isFavorite ? "Unfavorite" : "Favorite"}</button>`,
        `<button class=\"ghost\" type=\"button\" data-food-log=\"${food.id}\">Log</button>`
      ];
      if (food.isUserCreated) {
        actions.push(`<button class=\"ghost\" type=\"button\" data-food-edit=\"${food.id}\">Edit</button>`);
      } else {
        actions.push(`<button class=\"ghost\" type=\"button\" data-food-duplicate=\"${food.id}\">Duplicate</button>`);
      }
      return `
        <div class=\"list-item food-library-item\" data-food-id=\"${food.id}\">
          <div>
            <strong>${food.name}</strong>
            <div class=\"muted\">${food.brand || "Generic"} | ${formatTag(food.category)} | ${basisLabel}</div>
            <div class=\"muted\">${formatKcal(macros.kcal)} kcal | ${formatFoodMacroLine(macros)}</div>
          </div>
          <div class=\"actions\">${actions.join("")}</div>
        </div>
      `;
    })
    .join("");
}

function renderRecipes() {
  const list = qs("#recipe-list");
  if (!list) return;
  const recipes = state.recipes.slice().sort((a, b) => a.name.localeCompare(b.name));
  if (!recipes.length) {
    list.innerHTML = "<div class=\"list-item\">No recipes yet. Create one to save a repeat meal.</div>";
    return;
  }
  list.innerHTML = recipes
    .map((recipe) => {
      const cached = ensureRecipeCache(recipe);
      const perServing = cached.perServing;
      const yieldLabel = recipe.yieldType === "grams" ? `${recipe.yieldAmount} g` : `${recipe.yieldAmount} servings`;
      const macroLine = formatFoodMacroLine(perServing);
      return `
        <div class=\"list-item recipe-item\">
          <strong>${recipe.name}</strong>
          <div class=\"muted\">Yield ${yieldLabel} | ${formatKcal(perServing.kcal)} kcal ${recipe.yieldType === "grams" ? "per g" : "per serving"}</div>
          <div class=\"muted\">${macroLine}</div>
          <div class=\"actions\">
            <button class=\"ghost\" type=\"button\" data-recipe-view=\"${recipe.id}\">View</button>
            <button class=\"ghost\" type=\"button\" data-recipe-log=\"${recipe.id}\">Log</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderRecipeDetail() {
  const nameEl = qs("#recipe-detail-name");
  if (!nameEl) return;
  const logButton = qs("#recipe-log");
  const recipe = getRecipeById(state.activeRecipeId);
  if (!recipe) {
    nameEl.textContent = "Recipe";
    qs("#recipe-detail-meta").textContent = "Select a recipe to view details.";
    qs("#recipe-detail-ingredients").innerHTML = "<div class=\"list-item\">No recipe selected.</div>";
    if (logButton) logButton.disabled = true;
    return;
  }
  if (logButton) logButton.disabled = false;
  const cached = ensureRecipeCache(recipe);
  nameEl.textContent = recipe.name;
  const yieldLabel = recipe.yieldType === "grams" ? `${recipe.yieldAmount} g` : `${recipe.yieldAmount} servings`;
  const perLabel = recipe.yieldType === "grams" ? "per g" : "per serving";
  qs("#recipe-detail-meta").textContent = `Yield ${yieldLabel} | ${formatKcal(cached.perServing.kcal)} kcal ${perLabel}`;
  const ingredientList = recipe.ingredients
    .map((ingredient) => {
      const food = getFoodItemById(ingredient.foodId);
      const name = food?.name || "Unknown food";
      return `<div class=\"list-item\"><strong>${name}</strong><div>${formatMacro(ingredient.grams)} g</div></div>`;
    })
    .join("");
  qs("#recipe-detail-ingredients").innerHTML = ingredientList || "<div class=\"list-item\">No ingredients yet.</div>";
}

function getTimerProgramById(id) {
  return state.intervalPrograms.find((program) => program.id === id);
}

function formatTimerSummary(program) {
  if (!program) return "--";
  const warmup = Number(program.warmupSec) > 0 ? ` + ${program.warmupSec}s warm-up` : "";
  const cooldown = Number(program.cooldownSec) > 0 ? ` + ${program.cooldownSec}s cool-down` : "";
  const roundsLabel = program.isInfinite ? "∞" : `x${program.rounds}`;
  return `${program.workSec}s/${program.restSec}s ${roundsLabel}${warmup}${cooldown}`;
}

function timerPhaseDurationSec(timerState, phase) {
  if (!timerState) return 0;
  if (phase === "countdown") return timerState.countdownSec || 0;
  if (phase === "warmup") return timerState.warmupSec || 0;
  if (phase === "work") return timerState.workSec || 0;
  if (phase === "rest") return timerState.restSec || 0;
  if (phase === "cooldown") return timerState.cooldownSec || 0;
  return 0;
}

function timerNextPhase(timerState) {
  if (!timerState) return "complete";
  const { phase } = timerState;
  if (phase === "countdown") {
    return timerState.warmupSec > 0 ? "warmup" : "work";
  }
  if (phase === "warmup") return "work";
  if (phase === "work") {
    if (!timerState.isInfinite && timerState.roundsCompleted >= timerState.roundsTotal) {
      return timerState.cooldownSec > 0 ? "cooldown" : "complete";
    }
    return timerState.restSec > 0 ? "rest" : "work";
  }
  if (phase === "rest") return "work";
  if (phase === "cooldown") return "complete";
  return "complete";
}

function timerPhaseLabel(phase) {
  return TIMER_PHASE_LABELS[phase] || "Ready";
}

function timerRoundMeta(timerState) {
  if (!timerState) return "--";
  if (timerState.isInfinite) {
    const current = timerState.phase === "work" ? timerState.roundsCompleted + 1 : timerState.roundsCompleted;
    return `Round ${Math.max(current, 1)} of ∞`;
  }
  const total = timerState.roundsTotal || 0;
  const current = timerState.phase === "work" ? timerState.roundsCompleted + 1 : timerState.roundsCompleted;
  return `Round ${Math.min(current, total)} of ${total}`;
}

function timerNextPreview(timerState) {
  if (!timerState) return "--";
  const nextPhase = timerNextPhase(timerState);
  if (nextPhase === "complete") return "Completed";
  const duration = timerPhaseDurationSec(timerState, nextPhase);
  return `Next: ${timerPhaseLabel(nextPhase)} ${formatTimerSeconds(duration)}`;
}

function normalizeTimerSettings(settings) {
  return { ...DEFAULT_TIMER_SETTINGS, ...(settings || {}) };
}

function validateTimerValues(values) {
  if (!values.workSec || values.workSec <= 0) return "Work must be greater than 0.";
  if (values.restSec < 0) return "Rest must be 0 or more.";
  if (!values.isInfinite && (!values.rounds || values.rounds < 1)) return "Rounds must be 1 or more.";
  return "";
}

function renderTimerHome() {
  const quickForm = qs("#timer-quick-form");
  if (quickForm && !quickForm.contains(document.activeElement)) {
    quickForm.workSec.value = state.timerQuick.workSec;
    quickForm.restSec.value = state.timerQuick.restSec;
    quickForm.rounds.value = state.timerQuick.rounds;
    quickForm.isInfinite.checked = state.timerQuick.isInfinite;
    quickForm.warmupSec.value = state.timerQuick.warmupSec;
    quickForm.cooldownSec.value = state.timerQuick.cooldownSec;
    quickForm.rounds.disabled = state.timerQuick.isInfinite;
  }

  const presetWrap = qs("#timer-presets");
  if (presetWrap) {
    const categories = ["HIIT", "Tabata", "Beginner", "Strength", "Core", "Open"];
    const builtIns = state.intervalPrograms
      .filter((program) => program.isBuiltIn)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
    presetWrap.innerHTML = categories
      .map((category) => {
        const items = builtIns.filter((program) => program.category === category);
        if (!items.length) return "";
        const cards = items
          .map((program) => {
            const favoriteLabel = program.isFavorite ? "Unfavorite" : "Favorite";
            return `
              <div class="list-item timer-item">
                <div>
                  <strong>${program.name}</strong>
                  <div class="muted">${formatTimerSummary(program)}</div>
                </div>
                <div class="actions">
                  <button class="ghost" type="button" data-timer-start="${program.id}">Start</button>
                  <button class="ghost" type="button" data-timer-favorite="${program.id}">${favoriteLabel}</button>
                  <button class="ghost" type="button" data-timer-duplicate="${program.id}">Duplicate to edit</button>
                </div>
              </div>
            `;
          })
          .join("");
        return `
          <div class="timer-category">
            <h3>${TIMER_CATEGORY_LABELS[category] || category}</h3>
            <div class="list">${cards}</div>
          </div>
        `;
      })
      .join("");
  }

  const programWrap = qs("#timer-programs");
  if (programWrap) {
    const programs = state.intervalPrograms.filter((program) => !program.isBuiltIn);
    if (!programs.length) {
      programWrap.innerHTML = "<div class=\"list-item\">No programs yet. Duplicate a preset or create one.</div>";
    } else {
      programWrap.innerHTML = programs
        .map((program) => {
          const favoriteLabel = program.isFavorite ? "Unfavorite" : "Favorite";
          return `
            <div class="list-item timer-item">
              <div>
                <strong>${program.name}</strong>
                <div class="muted">${formatTimerSummary(program)}</div>
              </div>
              <div class="actions">
                <button class="ghost" type="button" data-timer-start="${program.id}">Start</button>
                <button class="ghost" type="button" data-timer-edit="${program.id}">Edit</button>
                <button class="ghost" type="button" data-timer-favorite="${program.id}">${favoriteLabel}</button>
              </div>
            </div>
          `;
        })
        .join("");
    }
  }
}

function renderTimerForm() {
  const form = qs("#timer-form");
  if (!form) return;
  const title = qs("#timer-form-title");
  const program = state.activeTimerId ? getTimerProgramById(state.activeTimerId) : null;
  if (program && program.isBuiltIn) {
    state.activeTimerId = null;
  }
  const edit = program && !program.isBuiltIn;
  if (title) title.textContent = edit ? "Edit program" : "New program";
  if (!form.contains(document.activeElement)) {
    form.name.value = edit ? program.name : "";
    form.category.value = edit ? program.category : "HIIT";
    form.workSec.value = edit ? program.workSec : 40;
    form.restSec.value = edit ? program.restSec : 20;
    form.rounds.value = edit ? program.rounds : 10;
    form.isInfinite.checked = edit ? Boolean(program.isInfinite) : false;
    form.warmupSec.value = edit ? program.warmupSec : 60;
    form.cooldownSec.value = edit ? program.cooldownSec : 60;
    const settings = edit ? normalizeTimerSettings(program.settings) : DEFAULT_TIMER_SETTINGS;
    form.soundEnabled.checked = settings.soundEnabled;
    form.vibrationEnabled.checked = settings.vibrationEnabled;
    form.countdownEnabled.checked = settings.countdownEnabled;
    form.keepAwakeEnabled.checked = settings.keepAwakeEnabled;
    form.rounds.disabled = form.isInfinite.checked;
  }
}

function updateTimerDisplay() {
  const timer = state.timerRun;
  const hero = qs("#timer-run-hero");
  const nameEl = qs("#timer-run-name");
  const phaseEl = qs("#timer-phase-label");
  const countdownEl = qs("#timer-countdown");
  const roundEl = qs("#timer-round-meta");
  const nextEl = qs("#timer-next-up");
  const keepEl = qs("#timer-keep-awake");
  const toggle = qs("#timer-toggle");
  if (!timer) {
    if (hero) hero.dataset.phase = "idle";
    if (nameEl) nameEl.textContent = "Quick start";
    if (phaseEl) phaseEl.textContent = "Ready";
    if (countdownEl) countdownEl.textContent = "00:00";
    if (roundEl) roundEl.textContent = "Round --";
    if (nextEl) nextEl.textContent = "Next up --";
    if (keepEl) keepEl.textContent = "Keep awake: --";
    if (toggle) toggle.textContent = "Start";
    return;
  }

  const now = Date.now();
  const elapsed = now - timer.phaseStartedAt;
  const remainingMs = Math.max(timer.phaseDurationMs - elapsed, 0);
  if (hero) hero.dataset.phase = timer.phase;
  if (nameEl) nameEl.textContent = timer.name;
  if (phaseEl) phaseEl.textContent = timerPhaseLabel(timer.phase);
  if (countdownEl) countdownEl.textContent = formatTimerSeconds(Math.ceil(remainingMs / 1000));
  if (roundEl) roundEl.textContent = timerRoundMeta(timer);
  if (nextEl) nextEl.textContent = timerNextPreview(timer);
  if (keepEl) keepEl.textContent = `Keep awake: ${timer.settings.keepAwakeEnabled ? "On" : "Off"}`;
  if (toggle) {
    if (timer.phase === "complete") {
      toggle.textContent = "Done";
    } else {
      toggle.textContent = timer.isPaused ? "Resume" : "Pause";
    }
  }
}

function renderTimerRun() {
  const overlay = qs("#timer-lock-overlay");
  if (overlay) overlay.hidden = !state.timerLock;
  updateTimerDisplay();
}

async function requestWakeLock() {
  if (!("wakeLock" in navigator)) return;
  try {
    timerWakeLock = await navigator.wakeLock.request("screen");
    if (timerWakeLock) {
      timerWakeLock.addEventListener("release", () => {
        timerWakeLock = null;
      });
    }
  } catch (error) {
    timerWakeLock = null;
  }
}

function releaseWakeLock() {
  if (timerWakeLock) {
    timerWakeLock.release().catch(() => {});
    timerWakeLock = null;
  }
}

function ensureAudioContext() {
  if (!timerAudio) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    timerAudio = new AudioContext();
  }
  if (timerAudio.state === "suspended") {
    timerAudio.resume().catch(() => {});
  }
  return timerAudio;
}

function playTone(frequency, duration = 0.12) {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.08;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

function playTimerCue(type, settings) {
  if (!settings?.soundEnabled) return;
  if (type === "work") {
    playTone(880, 0.12);
    setTimeout(() => playTone(880, 0.12), 180);
    return;
  }
  if (type === "rest") {
    playTone(520, 0.12);
    return;
  }
  if (type === "countdown") {
    playTone(720, 0.08);
    return;
  }
  playTone(640, 0.12);
}

function vibrateCue(type, settings) {
  if (!settings?.vibrationEnabled || !("vibrate" in navigator)) return;
  if (type === "work") {
    navigator.vibrate([100, 80, 100]);
    return;
  }
  if (type === "rest") {
    navigator.vibrate([140]);
    return;
  }
  if (type === "countdown") {
    navigator.vibrate([60]);
    return;
  }
  navigator.vibrate([80]);
}

function beginTimerLoop() {
  if (timerRafId) cancelAnimationFrame(timerRafId);
  const tick = () => {
    const timer = state.timerRun;
    if (!timer) return;
    const now = Date.now();
    if (timer.isPaused || timer.phase === "complete") {
      timer.lastTickAt = now;
      updateTimerDisplay();
      timerRafId = null;
      return;
    }
    const delta = now - timer.lastTickAt;
    timer.lastTickAt = now;
    if (timer.phase === "work") timer.elapsedWorkMs += delta;
    if (timer.phase === "rest") timer.elapsedRestMs += delta;
    if (timer.phase === "warmup") timer.elapsedWarmupMs += delta;
    if (timer.phase === "cooldown") timer.elapsedCooldownMs += delta;

    let elapsed = now - timer.phaseStartedAt;
    while (timer.phaseDurationMs > 0 && elapsed >= timer.phaseDurationMs) {
      const overshoot = elapsed - timer.phaseDurationMs;
      const nextStart = now - overshoot;
      advanceTimerPhase(timer, nextStart);
      if (!state.timerRun) return;
      elapsed = now - timer.phaseStartedAt;
    }

    const remainingMs = Math.max(timer.phaseDurationMs - elapsed, 0);
    if (timer.settings.countdownEnabled) {
      const remainingSec = Math.ceil(remainingMs / 1000);
      if (remainingSec > 0 && remainingSec <= 3 && remainingSec !== timer.lastCountdownMark) {
        timer.lastCountdownMark = remainingSec;
        playTimerCue("countdown", timer.settings);
        vibrateCue("countdown", timer.settings);
      }
    }

    updateTimerDisplay();
    const current = state.timerRun;
    if (!current || current.isPaused || current.phase === "complete") {
      timerRafId = null;
      return;
    }
    timerRafId = requestAnimationFrame(tick);
  };
  timerRafId = requestAnimationFrame(tick);
}

function advanceTimerPhase(timer, nextStartAt) {
  if (!timer) return;
  if (timer.phase === "work") {
    timer.roundsCompleted += 1;
  }
  const next = timerNextPhase(timer);
  if (next === "complete") {
    completeTimer();
    return;
  }
  timer.phase = next;
  timer.phaseDurationMs = timerPhaseDurationSec(timer, next) * 1000;
  timer.phaseStartedAt = nextStartAt;
  timer.lastCountdownMark = null;
  playTimerCue(next, timer.settings);
  vibrateCue(next, timer.settings);
  if (timer.phaseDurationMs === 0) {
    advanceTimerPhase(timer, nextStartAt);
  }
}

function startTimerRun(program, { programId, name } = {}) {
  const now = Date.now();
  const settings = normalizeTimerSettings(program.settings);
  const roundsTotal = program.isInfinite ? 0 : Number(program.rounds) || 0;
  const timer = {
    id: uuid(),
    programId: programId || null,
    name: name || program.name || "Quick start",
    phase: settings.countdownEnabled ? "countdown" : program.warmupSec > 0 ? "warmup" : "work",
    countdownSec: settings.countdownEnabled ? 3 : 0,
    workSec: Number(program.workSec) || 0,
    restSec: Number(program.restSec) || 0,
    warmupSec: Number(program.warmupSec) || 0,
    cooldownSec: Number(program.cooldownSec) || 0,
    roundsTotal,
    roundsCompleted: 0,
    isInfinite: Boolean(program.isInfinite),
    settings,
    startedAt: now,
    phaseStartedAt: now,
    phaseDurationMs: 0,
    lastTickAt: now,
    lastCountdownMark: null,
    elapsedWorkMs: 0,
    elapsedRestMs: 0,
    elapsedWarmupMs: 0,
    elapsedCooldownMs: 0,
    isPaused: false
  };
  timer.phaseDurationMs = timerPhaseDurationSec(timer, timer.phase) * 1000;
  state.timerRun = timer;
  state.timerLock = false;
  updateTimerDisplay();
  if (settings.keepAwakeEnabled) requestWakeLock();
  setRoute("timer-run");
  playTimerCue(timer.phase, settings);
  vibrateCue(timer.phase, settings);
  beginTimerLoop();
}

function pauseTimer() {
  if (!state.timerRun || state.timerRun.isPaused || state.timerRun.phase === "complete") return;
  state.timerRun.isPaused = true;
  state.timerRun.pausedAt = Date.now();
  releaseWakeLock();
  updateTimerDisplay();
}

function resumeTimer() {
  const timer = state.timerRun;
  if (!timer || !timer.isPaused || timer.phase === "complete") return;
  const now = Date.now();
  const pauseDuration = now - (timer.pausedAt || now);
  timer.phaseStartedAt += pauseDuration;
  timer.lastTickAt = now;
  timer.isPaused = false;
  timer.pausedAt = null;
  if (timer.settings.keepAwakeEnabled) requestWakeLock();
  beginTimerLoop();
}

function skipTimerPhase() {
  const timer = state.timerRun;
  if (!timer || timer.phase === "complete") return;
  const now = Date.now();
  timer.lastTickAt = now;
  advanceTimerPhase(timer, now);
  updateTimerDisplay();
}

function adjustTimer(seconds) {
  const timer = state.timerRun;
  if (!timer || timer.phaseDurationMs <= 0) return;
  timer.phaseDurationMs = Math.max(1000, timer.phaseDurationMs + seconds * 1000);
  updateTimerDisplay();
}

async function stopTimerRun() {
  const timer = state.timerRun;
  if (!timer) return;
  const confirmed = confirm("Stop the timer?");
  if (!confirmed) return;
  await finalizeTimer(true);
  setRoute("timer");
}

async function completeTimer() {
  await finalizeTimer(false);
}

async function finalizeTimer(stoppedEarly) {
  const timer = state.timerRun;
  if (!timer) return;
  releaseWakeLock();
  if (timerRafId) cancelAnimationFrame(timerRafId);
  timerRafId = null;
  const endedAt = new Date().toISOString();
  const session = {
    id: uuid(),
    programId: timer.programId,
    startedAt: new Date(timer.startedAt).toISOString(),
    endedAt,
    completedRounds: timer.roundsCompleted,
    stoppedEarly,
    totals: {
      workTimeSec: Math.round(timer.elapsedWorkMs / 1000),
      restTimeSec: Math.round(timer.elapsedRestMs / 1000)
    }
  };
  timer.phase = "complete";
  timer.isPaused = true;
  timer.phaseDurationMs = 0;
  state.timerRun = timer;
  updateTimerDisplay();
  await put("intervalSessions", session);
  state.intervalSessions = await getAll("intervalSessions");
}

function updateGoalPercentSummary() {
  const summary = qs("#food-goal-percent");
  const form = qs("#food-goals-form");
  if (!summary || !form) return;
  if (!form.showPercent.checked) {
    summary.textContent = "";
    return;
  }
  const modeButton = form.querySelector("[data-target-mode][aria-pressed=\"true\"]");
  const mode = modeButton?.dataset.targetMode || "auto";
  const manualTarget = Number(form.manualKcalTarget?.value) || 0;
  const weeklyRate = Number(form.weeklyRateKg?.value) || 0;
  const auto = calculateAutoTarget(state.profile, { weeklyRateKg: weeklyRate });
  const kcalGoal = mode === "manual" ? manualTarget : Number(auto.target) || 0;
  const protein = Number(form.proteinTargetG.value) || 0;
  const carbs = Number(form.carbsTargetG.value) || 0;
  const fat = Number(form.fatTargetG.value) || 0;
  const macroCalories = protein * 4 + carbs * 4 + fat * 9;
  const base = kcalGoal || macroCalories;
  if (!base) {
    summary.textContent = "Set calories or macros to view percentages.";
    return;
  }
  const pPct = Math.round(((protein * 4) / base) * 100);
  const cPct = Math.round(((carbs * 4) / base) * 100);
  const fPct = Math.round(((fat * 9) / base) * 100);
  summary.textContent = `Macro split: P ${pPct}% | C ${cPct}% | F ${fPct}%`;
}

function setFoodTargetMode(mode) {
  qsa("#food-target-mode button").forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.targetMode === mode);
  });
  const manualWrap = qs("#food-manual-target-wrap");
  if (manualWrap) manualWrap.hidden = mode !== "manual";
  const weeklyWrap = qs("#food-weekly-rate-wrap");
  if (weeklyWrap) weeklyWrap.hidden = mode !== "auto";
}

function updateFoodTargetPreview() {
  const form = qs("#food-goals-form");
  if (!form) return;
  const modeButton = form.querySelector("[data-target-mode][aria-pressed=\"true\"]");
  const mode = modeButton?.dataset.targetMode || "auto";
  const manualTarget = Number(form.manualKcalTarget?.value) || 0;
  const weeklyRate = Number(form.weeklyRateKg?.value) || 0;
  const estimate = calculateAutoTarget(state.profile, { weeklyRateKg: weeklyRate });
  const targetSummary = qs("#food-target-estimate");
  const detailSummary = qs("#food-target-details");
  const warning = qs("#food-target-warning");
  const emptyState = qs("#food-target-empty");

  if (!estimate.target) {
    if (targetSummary) targetSummary.textContent = "Estimate: --";
    if (detailSummary) detailSummary.textContent = "Complete your profile to calculate an estimate.";
    if (emptyState) emptyState.hidden = false;
  } else {
    if (targetSummary) targetSummary.textContent = `Estimate: ${formatKcal(estimate.target)} kcal`;
    if (detailSummary) {
      const adjustment = estimate.adjustment != null ? `${estimate.adjustment >= 0 ? "+" : ""}${formatKcal(estimate.adjustment)} kcal` : "--";
      detailSummary.textContent = `BMR ${formatKcal(estimate.bmr)} | TDEE ${formatKcal(estimate.tdee)} | Adjustment ${adjustment}`;
    }
    if (emptyState) emptyState.hidden = true;
  }
  if (warning) {
    const warningText = getTargetWarning(estimate.target);
    warning.textContent = warningText;
    warning.hidden = !warningText;
  }

  const manualHint = qs("#food-manual-target-hint");
  if (manualHint) {
    manualHint.textContent = mode === "manual" && manualTarget
      ? `Manual target: ${formatKcal(manualTarget)} kcal`
      : mode === "manual"
        ? "Enter a manual target to override the estimate."
        : "Auto target uses your profile metrics.";
  }
}

function renderFoodGoals() {
  const form = qs("#food-goals-form");
  if (!form || !state.nutritionGoals) return;
  const mode = state.nutritionGoals.targetKcalMode || "auto";
  setFoodTargetMode(mode);
  form.manualKcalTarget.value = state.nutritionGoals.manualKcalTarget ?? "";
  form.weeklyRateKg.value = state.nutritionGoals.weeklyRateKg ?? "";
  form.proteinTargetG.value = state.nutritionGoals.proteinTargetG ?? "";
  form.carbsTargetG.value = state.nutritionGoals.carbsTargetG ?? "";
  form.fatTargetG.value = state.nutritionGoals.fatTargetG ?? "";
  form.fiberTargetG.value = state.nutritionGoals.fiberTargetG ?? "";
  form.showPercent.checked = Boolean(state.settings.macroPercentView);
  updateFoodTargetPreview();
  updateGoalPercentSummary();
}

function renderFoodQuick() {
  const form = qs("#food-quick-form");
  if (!form) return;
  if (state.quickEditEntryId) return;
  form.meal.value = state.foodSearch.meal;
}

function renderFasting() {
  const activeFast = getActiveFast();
  const mode = state.fastingModes.find((item) => item.id === state.settings.activeFastingModeId);
  qs("#fasting-mode").textContent = mode ? mode.name : "Custom";

  if (activeFast) {
    const elapsed = Date.now() - new Date(activeFast.startAt).getTime();
    qs("#fasting-status").textContent = "Fasting";
    qs("#fasting-elapsed").textContent = formatDuration(elapsed);
    qs("#fasting-next").textContent = `Target ends in ${formatDuration(getFastRemaining(activeFast))}`;
  } else {
    qs("#fasting-status").textContent = "Not fasting";
    qs("#fasting-elapsed").textContent = "--";
    qs("#fasting-next").textContent = "Start a fast to see the next window.";
  }

  qs("#reminder-fast-start").checked = state.settings.reminders.fastStart;
  qs("#reminder-fast-end").checked = state.settings.reminders.fastEnd;
  qs("#reminder-eat-end").checked = state.settings.reminders.eatEnd;
  qs("#reminder-hydration").checked = state.settings.reminders.hydration;
  qs("#quiet-start").value = state.settings.quietHours.start;
  qs("#quiet-end").value = state.settings.quietHours.end;
  updateFastControls(activeFast);

  const permissionCard = qs("#notification-permission");
  if (permissionCard) {
    const supported = "Notification" in window;
    const enabled = supported && Notification.permission === "granted";
    permissionCard.hidden = !supported || enabled;
  }

  const history = state.fastingSessions
    .filter((session) => session.status === "complete")
    .sort((a, b) => new Date(b.endAt) - new Date(a.endAt))
    .slice(0, 10)
    .map((session) => {
      const modeName = state.fastingModes.find((m) => m.id === session.modeId)?.name || "Custom";
      const sessionMode = state.fastingModes.find((m) => m.id === session.modeId);
      const target = (sessionMode?.fastHours || state.settings.fastTarget || 16) * 60 * 60 * 1000;
      const metTarget = session.elapsedMs >= target;
      return `<div class="list-item"><strong>${modeName}</strong><div>${formatDateShort(session.endAt)} | ${formatDuration(session.elapsedMs)}</div><div class="muted"><span class="status-dot ${metTarget ? "success" : "muted"}"></span>${metTarget ? "On target" : "Short"}</div></div>`;
    })
    .join("");
  qs("#fasting-history").innerHTML = history || "<div class=\"list-item\">No fasting sessions yet.</div>";
}

function renderWeight() {
  const latest = getLatestWeight();
  qs("#weight-latest").textContent = latest
    ? `${formatWeight(latest.weightKg, state.settings.units)} | ${formatDateTime(latest.at)}`
    : "--";
  const range = state.settings.weightRange || 7;
  qsa("#weight-range button").forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.weightRange === String(range));
  });
  qs("#weight-trend").textContent = weightTrendSummary(range);
  qs("#weight-projection").textContent = weightGoalProjection();

  const history = state.weightEntries
    .slice()
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 8)
    .map((entry) => {
      return `<div class="list-item"><strong>${formatWeight(entry.weightKg, state.settings.units)}</strong><div>${formatDateTime(entry.at)}</div><div>${entry.notes || ""}</div></div>`;
    })
    .join("");
  qs("#weight-history").innerHTML = history || "<div class=\"list-item\">No weight entries yet.</div>";
}

function renderExerciseList() {
  const list = qs("#exercise-list");
  if (!list) return;
  const search = (qs("#exercise-search").value || "").trim().toLowerCase();
  const categoryFilter = qs("#exercise-filter").value || "all";
  const equipmentSelect = qs("#exercise-equipment-filter");
  let equipmentFilter = equipmentSelect ? equipmentSelect.value : "all";
  const levelFilter = qs("#exercise-level-filter").value || "all";

  const equipmentOptions = new Set();
  state.exercises.forEach((exercise) => {
    const equipment = normalizeEquipment(exercise.equipment);
    if (!equipment.length) {
      equipmentOptions.add("none");
      return;
    }
    equipment.forEach((item) => equipmentOptions.add(item.toLowerCase()));
  });
  const sortedEquipment = Array.from(equipmentOptions)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  if (equipmentSelect) {
    const current = equipmentSelect.value || "all";
    const options = ["all", ...sortedEquipment];
    equipmentSelect.innerHTML = options
      .map((value) => `<option value="${value}">${value === "all" ? "All" : formatTag(value)}</option>`)
      .join("");
    equipmentSelect.value = options.includes(current) ? current : "all";
    equipmentFilter = equipmentSelect.value;
  }

  const filtered = state.exercises.filter((exercise) => {
    if (categoryFilter !== "all" && exercise.category !== categoryFilter) return false;
    const equipment = normalizeEquipment(exercise.equipment);
    const equipmentList = (equipment.length ? equipment : ["none"]).map((item) => item.toLowerCase());
    const equipmentMatch = equipmentFilter === "all" || equipmentList.includes(equipmentFilter);
    if (!equipmentMatch) return false;

    const tags = getExerciseTags(exercise).map((tag) => tag.toLowerCase());
    const levelMatch = levelFilter === "all" || tags.includes(levelFilter);
    if (!levelMatch) return false;

    if (!search) return true;
    const cues = getExerciseCues(exercise).join(" ").toLowerCase();
    const haystack = [
      exercise.name,
      exercise.description,
      cues,
      tags.join(" ")
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(search);
  }).sort((a, b) => a.name.localeCompare(b.name));

  const html = filtered
    .map((exercise) => {
      const mediaCandidates = getExerciseMediaCandidates(exercise);
      const media = mediaCandidates[0];
      const fallbackPoster = mediaCandidates[1]?.poster || "";
      const tags = getExerciseTags(exercise).map(formatTag).slice(0, 3);
      const summary = exercise.description || "";
      const tagHtml = tags.length ? tags.map((tag) => `<span class="tag">${tag}</span>`).join("") : "";
      return `
        <button class="exercise-card" type="button" data-exercise-id="${exercise.id}" aria-label="View ${exercise.name} details">
          <div class="exercise-thumb">
            <img src="${media.poster}" alt="${exercise.name} demo poster" loading="lazy" decoding="async" data-fallback="${fallbackPoster}" />
          </div>
          <div>
            <h3 class="exercise-title">${exercise.name}</h3>
            ${tagHtml ? `<div class="tag-row">${tagHtml}</div>` : ""}
            <p class="muted">${summary}</p>
          </div>
        </button>
      `;
    })
    .join("");

  list.innerHTML = html || "<div class=\"list-item\">No exercises match those filters.</div>";

  list.querySelectorAll("img[data-fallback]").forEach((img) => {
    img.addEventListener("error", () => {
      const fallback = img.dataset.fallback;
      if (fallback && !img.dataset.fallbackUsed) {
        img.dataset.fallbackUsed = "true";
        img.src = fallback;
        return;
      }
      img.style.display = "none";
    });
  });
}

function renderCalisthenics() {
  renderExerciseList();
  qsa("#template-filters button").forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.templateFilter === templateFilter);
  });

  const sortedTemplates = state.templates.slice().sort((a, b) => {
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
  let templatesToShow = sortedTemplates;
  if (templateFilter === "favorites") {
    templatesToShow = sortedTemplates.filter((template) => template.favorite);
  } else if (templateFilter === "recent") {
    templatesToShow = sortedTemplates.slice(0, 4);
  }
  const templates = templatesToShow
    .map((template) => {
      const exercises = template.exerciseIds
        .map((id) => state.exercises.find((exercise) => exercise.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      return `<div class="list-item"><strong>${template.name}</strong><div>${exercises || "No exercises"}</div><button class="ghost" type="button" data-template-fav="${template.id}">${template.favorite ? "Unfavorite" : "Favorite"}</button></div>`;
    })
    .join("");
  qs("#template-list").innerHTML = templates || "<div class=\"list-item\">No templates yet.</div>";

  const workouts = state.workouts
    .slice()
    .sort((a, b) => new Date(b.endedAt || b.startedAt) - new Date(a.endedAt || a.startedAt))
    .slice(0, 6)
    .map((workout) => {
      return `<div class="list-item"><strong>${workout.name}</strong><div>${workout.notes || ""}</div><div>${formatDateShort(workout.startedAt)}</div></div>`;
    })
    .join("");
  qs("#workout-list").innerHTML = workouts || "<div class=\"list-item\">No sessions yet.</div>";

  const setsByExercise = new Map();
  const bestRepsByExercise = new Map();
  state.workoutSets.forEach((set) => {
    if (!set.exerciseId) return;
    const count = setsByExercise.get(set.exerciseId) || 0;
    setsByExercise.set(set.exerciseId, count + 1);
    const reps = parseInt(set.reps, 10);
    if (!Number.isNaN(reps)) {
      const currentBest = bestRepsByExercise.get(set.exerciseId) || 0;
      bestRepsByExercise.set(set.exerciseId, Math.max(currentBest, reps));
    }
  });
  const trends = state.exercises
    .map((exercise) => {
      const totalSets = setsByExercise.get(exercise.id) || 0;
      const best = bestRepsByExercise.get(exercise.id);
      if (!totalSets) return null;
      return `<div class="list-item"><strong>${exercise.name}</strong><div>${totalSets} sets logged${best ? ` | Best ${best} reps` : ""}</div></div>`;
    })
    .filter(Boolean)
    .join("");
  qs("#exercise-trends").innerHTML = trends || "<div class=\"list-item\">No trends yet.</div>";

  const progressionMap = new Map(state.progressionStatus.map((status) => [status.progressionId, status]));
  const progressions = state.progressions
    .map((progression) => {
      const status = progressionMap.get(progression.id);
      const level = status ? `Level ${status.currentLevel}` : "Not started";
      const best = status?.bestHoldSeconds ? `${status.bestHoldSeconds}s hold` : status?.bestReps ? `${status.bestReps} reps` : "";
      const milestone = status?.milestoneAt ? ` | ${formatDateShort(status.milestoneAt)}` : "";
      return `<div class="list-item"><strong>${progression.name}</strong><div>${progression.description}</div><div>${level} ${best}${milestone}</div><button class="ghost" data-progression="${progression.id}">Update</button></div>`;
    })
    .join("");
  qs("#progression-list").innerHTML = progressions || "<div class=\"list-item\">No progressions yet.</div>";
}

function getActiveExercise() {
  return state.exercises.find((exercise) => exercise.id === activeExerciseId) || null;
}

function shouldAutoplayDemos() {
  return Boolean(state.settings.autoplayDemos) && !(prefersReduced && prefersReduced.matches);
}

function showMediaCaption(text) {
  const caption = qs("#exercise-caption");
  if (!caption) return;
  caption.textContent = text;
  caption.classList.add("is-visible");
  if (captionTimer) clearTimeout(captionTimer);
  captionTimer = setTimeout(() => {
    caption.classList.remove("is-visible");
  }, 2200);
}

function scrollToTop() {
  const behavior = prefersReduced && prefersReduced.matches ? "auto" : "smooth";
  window.scrollTo({ top: 0, behavior });
}

function renderExerciseDetail() {
  const section = qs("[data-route=\"exercise\"]");
  if (!section) return;
  const exercise = getActiveExercise();
  const actions = qs("#exercise-actions");
  if (!exercise) {
    if (actions) actions.hidden = true;
    if (!section.hidden) {
      activeExerciseId = null;
      setRoute("train");
    }
    return;
  }

  const tags = getExerciseTags(exercise).map(formatTag);
  const equipment = normalizeEquipment(exercise.equipment);
  const cues = getExerciseCues(exercise).slice(0, 6);
  const mediaCandidates = getExerciseMediaCandidates(exercise);
  const media = mediaCandidates[0];
  const aspectRatio = media.aspectRatio || MEDIA_ASPECT_DEFAULT;

  qs("#exercise-title").textContent = exercise.name;
  qs("#exercise-purpose").textContent = exercise.description || "Good form demo.";
  const tagsContainer = qs("#exercise-tags");
  if (tagsContainer) {
    tagsContainer.innerHTML = tags.length ? tags.map((tag) => `<span class="tag">${tag}</span>`).join("") : "";
  }
  qs("#exercise-scaling").textContent = exercise.scaling || "No scaling guidance yet.";
  qs("#exercise-faults-list").textContent = exercise.faults || "No common faults yet.";
  qs("#exercise-equipment").innerHTML = (equipment.length ? equipment : ["none"])
    .map((item) => `<span class="tag">${formatTag(item)}</span>`)
    .join("");

  const cuesHtml = cues
    .map((cue) => `<button class="cue-chip" type="button" data-cue="${cue}" aria-pressed="false">${cue}</button>`)
    .join("");
  qs("#exercise-cues").innerHTML = cuesHtml || "<div class=\"muted\">No cues yet.</div>";

  renderExerciseVariations(exercise);
  renderExerciseMediaPlayer(exercise, mediaCandidates, aspectRatio);

  if (actions) {
    actions.hidden = false;
  }
}

function renderExerciseVariations(exercise) {
  const container = qs("#exercise-variations");
  if (!container) return;
  const slug = exercise.slug || slugify(exercise.name);
  const variations = EXERCISE_VARIATIONS[slug] || { easier: [], harder: [] };
  const cards = [];

  const addCards = (label, slugs) => {
    slugs.forEach((slug) => {
      const target = state.exercises.find((item) => item.slug === slug);
      if (!target) return;
      cards.push(`
        <button class="variation-card" type="button" data-exercise-id="${target.id}" aria-label="${label} variation: ${target.name}">
          <strong>${label}: ${target.name}</strong>
          <span class="muted">${target.description || ""}</span>
        </button>
      `);
    });
  };

  addCards("Easier", variations.easier || []);
  addCards("Harder", variations.harder || []);

  container.innerHTML = cards.length
    ? cards.join("")
    : "<div class=\"list-item\">No variations yet.</div>";
}

function renderExerciseMediaPlayer(exercise, mediaCandidates, aspectRatio) {
  const container = qs("#exercise-media");
  if (!container) return;
  const sources = Array.isArray(mediaCandidates) && mediaCandidates.length
    ? mediaCandidates
    : getExerciseMediaCandidates(exercise);
  let sourceIndex = 0;
  container.innerHTML = `
    <div class="media-frame" style="--media-ratio: ${aspectRatio}">
      <img class="media-poster" src="${sources[0].poster}" alt="${exercise.name} demo poster" decoding="async" />
      <video class="media-video" playsinline loop muted preload="none"></video>
      <div class="media-overlay" id="exercise-caption" aria-live="polite"></div>
      <button class="media-play" id="exercise-play" type="button" aria-label="Play demo">Play</button>
      <div class="media-fallback" id="exercise-fallback" hidden>Demo unavailable offline for this exercise.</div>
    </div>
  `;

  const video = container.querySelector(".media-video");
  const frame = container.querySelector(".media-frame");
  const poster = container.querySelector(".media-poster");
  const playOverlay = container.querySelector("#exercise-play");
  const fallback = container.querySelector("#exercise-fallback");

  if (video) {
    video.muted = true;
    video.loop = true;
  }

  const showFallback = () => {
    if (fallback) fallback.hidden = false;
    if (playOverlay) playOverlay.hidden = true;
    if (poster) poster.style.display = "none";
    setMediaControlsDisabled(true);
  };

  const applyMediaSources = (media) => {
    if (poster) {
      poster.src = media.poster;
      poster.style.display = "";
    }
    if (video) {
      delete video.dataset.loaded;
      video.pause();
      video.currentTime = 0;
    }
    attachVideoSources(video, media);
    if (fallback) fallback.hidden = true;
    if (playOverlay) playOverlay.hidden = shouldAutoplayDemos();
  };

  const useNextSource = () => {
    if (sourceIndex >= sources.length - 1) return false;
    sourceIndex += 1;
    applyMediaSources(sources[sourceIndex]);
    return true;
  };

  applyMediaSources(sources[0]);

  if (poster) {
    poster.addEventListener("error", () => {
      if (useNextSource()) {
        if (shouldAutoplayDemos()) {
          attemptVideoPlayback(video, frame, playOverlay, fallback);
        }
        return;
      }
      poster.style.display = "none";
    });
  }

  bindVideoEvents(video, frame, playOverlay, fallback, () => {
    if (useNextSource()) {
      attemptVideoPlayback(video, frame, playOverlay, fallback);
      return;
    }
    showFallback();
  });
  initExerciseMediaControls(video, frame, playOverlay, fallback);

  const hasVideo = sources.some((source) => source.webm || source.mp4);
  setMediaControlsDisabled(!hasVideo);
  if (!hasVideo) {
    showFallback();
    return;
  }

  if (playOverlay) {
    playOverlay.hidden = shouldAutoplayDemos();
  }

  if (shouldAutoplayDemos()) {
    attemptVideoPlayback(video, frame, playOverlay, fallback);
  }
}

function setMediaControlsDisabled(disabled) {
  ["#media-play-toggle", "#media-slow-toggle", "#media-restart"].forEach((selector) => {
    const button = qs(selector);
    if (button) button.disabled = disabled;
  });
}

function attachVideoSources(video, media) {
  if (!video) return;
  video.innerHTML = "";
  if (media.webm) {
    const source = document.createElement("source");
    source.dataset.src = media.webm;
    source.type = "video/webm";
    video.appendChild(source);
  }
  if (media.mp4) {
    const source = document.createElement("source");
    source.dataset.src = media.mp4;
    source.type = "video/mp4";
    video.appendChild(source);
  }
}

function loadVideoSources(video) {
  if (!video || video.dataset.loaded) return;
  const sources = Array.from(video.querySelectorAll("source[data-src]"));
  sources.forEach((source) => {
    source.src = source.dataset.src;
    source.removeAttribute("data-src");
  });
  video.dataset.loaded = "true";
  video.load();
}

function bindVideoEvents(video, frame, playOverlay, fallback, onError) {
  if (!video || video.dataset.bound) return;
  video.dataset.bound = "true";
  video.addEventListener("play", () => {
    if (frame) frame.classList.add("is-playing");
    const toggle = qs("#media-play-toggle");
    if (toggle) toggle.textContent = "Pause";
  });
  video.addEventListener("pause", () => {
    if (frame) frame.classList.remove("is-playing");
    const toggle = qs("#media-play-toggle");
    if (toggle) toggle.textContent = "Play";
    if (playOverlay) playOverlay.hidden = false;
  });
  video.addEventListener("error", () => {
    if (onError) {
      onError();
      return;
    }
    if (fallback) fallback.hidden = false;
    if (playOverlay) playOverlay.hidden = true;
    setMediaControlsDisabled(true);
  });
}

function attemptVideoPlayback(video, frame, playOverlay, fallback) {
  if (!video) return;
  loadVideoSources(video);
  video
    .play()
    .then(() => {
      if (playOverlay) playOverlay.hidden = true;
    })
    .catch(() => {
      if (playOverlay) playOverlay.hidden = false;
    });
}

function initExerciseMediaControls(video, frame, playOverlay, fallback) {
  if (!video) return;
  const playToggle = qs("#media-play-toggle");
  const slowToggle = qs("#media-slow-toggle");
  const restartButton = qs("#media-restart");

  const updateSlowState = (enabled) => {
    video.playbackRate = enabled ? 0.5 : 1;
    if (slowToggle) {
      slowToggle.textContent = enabled ? "1x" : "0.5x";
      slowToggle.setAttribute("aria-pressed", String(enabled));
    }
  };

  if (playToggle) {
    playToggle.textContent = "Play";
    playToggle.onclick = () => {
      if (video.paused) {
        attemptVideoPlayback(video, frame, playOverlay, fallback);
      } else {
        video.pause();
      }
    };
  }

  if (slowToggle) {
    slowToggle.setAttribute("aria-pressed", "false");
    slowToggle.onclick = () => {
      const enabled = video.playbackRate !== 0.5;
      updateSlowState(enabled);
    };
  }

  if (restartButton) {
    restartButton.onclick = () => {
      video.currentTime = 0;
      attemptVideoPlayback(video, frame, playOverlay, fallback);
    };
  }

  if (playOverlay) {
    playOverlay.onclick = () => {
      attemptVideoPlayback(video, frame, playOverlay, fallback);
    };
  }
}


function renderAnalytics() {
  const weekStats = getWeekStepStats();
  const fastingStats = getFastingStats();
  const workoutStats = getWorkoutStats();
  const weightStats = getWeightStats();
  const nutritionStats = getNutritionStats();

  qs("#analytics-summary").innerHTML = [
    `<div class="metric"><p>Steps</p><h3>${weekStats.total.toLocaleString()}</h3><span>${weekStats.average.toLocaleString()} avg/day | ${weekStats.compliance}% goal compliance | ${weekStats.streak} day streak</span></div>`,
    `<div class="metric"><p>Fasting</p><h3>${fastingStats.adherence}%</h3><span>${fastingStats.average}h avg | ${fastingStats.streak} day streak</span></div>`,
    `<div class="metric"><p>Workouts</p><h3>${workoutStats.sessions}</h3><span>${workoutStats.perWeek} per week | ${workoutStats.volume} sets | ${workoutStats.prs} PRs | ${workoutStats.streak} day streak</span></div>`,
    `<div class="metric"><p>Weight</p><h3>${weightStats.latest}</h3><span>${weightStats.trend} | Avg ${weightStats.average} | Goal ${weightStats.progress}</span></div>`,
    `<div class="metric"><p>Nutrition</p><h3>${nutritionStats.avgCalories != null ? `${nutritionStats.avgCalories.toLocaleString()} kcal` : "--"}</h3><span>${nutritionStats.proteinAvg != null ? `P ${nutritionStats.proteinAvg}g | C ${nutritionStats.carbsAvg}g | F ${nutritionStats.fatAvg}g` : "No macros logged"}${nutritionStats.compliance != null ? ` | ${nutritionStats.compliance}% goal` : ""}</span></div>`
  ].join("");

  qs("#report-card").innerHTML = `
    <p><strong>Weekly report</strong></p>
    <p>Steps: ${weekStats.total.toLocaleString()} | Fasting adherence: ${fastingStats.adherence}%</p>
    <p>Workouts: ${workoutStats.sessions} | Volume: ${workoutStats.volume} sets | Milestones: ${workoutStats.milestones}</p>
    <p>Nutrition: ${nutritionStats.avgCalories != null ? `${nutritionStats.avgCalories} kcal avg` : "No calories logged"}${nutritionStats.proteinAvg != null ? ` | P ${nutritionStats.proteinAvg}g C ${nutritionStats.carbsAvg}g F ${nutritionStats.fatAvg}g` : ""}</p>
  `;

  const trendsStrip = qs("#trends-steps-strip");
  const trendsSummary = qs("#trends-steps-summary");
  const trendsMeta = qs("#trends-steps-meta");
  if (trendsMeta) {
    trendsMeta.textContent = `Last 7 days | ${weekStats.compliance}% goal compliance`;
  }
  if (trendsStrip && trendsSummary) {
    const days = [...Array(7).keys()].map((i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return { key: dateKey(date), label: date.toLocaleDateString(undefined, { weekday: "short" }) };
    });
    const totals = days.map((day) =>
      state.steps.filter((entry) => entry.date === day.key).reduce((sum, entry) => sum + entry.count, 0)
    );
    const goal = state.settings.stepsGoal || 0;
    trendsStrip.innerHTML = days
      .map((day, index) => {
        const total = totals[index] || 0;
        const height = goal ? Math.min(100, Math.round((total / goal) * 100)) : 0;
        const visibleHeight = total ? Math.max(12, height) : 0;
        return `<div><span style="height:${visibleHeight}%"></span><small>${day.label}</small></div>`;
      })
      .join("");
    trendsSummary.textContent = `${weekStats.average.toLocaleString()} avg/day | ${weekStats.total.toLocaleString()} total`;
  }
}

function renderProfile() {
  const profile = state.profile;
  const settingsForm = qs("#settings-form");
  settingsForm.units.value = state.settings.units;
  settingsForm.stepsGoal.value = state.settings.stepsGoal;
  settingsForm.fastTarget.value = state.settings.fastTarget;
  settingsForm.workoutGoal.value = state.settings.workoutGoal;

  const appearanceForm = qs("#appearance-form");
  if (appearanceForm) {
    appearanceForm.theme.value = state.settings.theme;
    appearanceForm.density.value = state.settings.density;
    appearanceForm.fontSize.value = state.settings.fontSize;
    const accentInput = appearanceForm.querySelector(`input[name="accent"][value="${state.settings.accent}"]`);
    if (accentInput) accentInput.checked = true;
  }

  const autoplayToggle = qs("#autoplay-demos");
  if (autoplayToggle) {
    const reduced = prefersReduced && prefersReduced.matches;
    autoplayToggle.checked = state.settings.autoplayDemos && !reduced;
    autoplayToggle.disabled = Boolean(reduced);
  }

  if (!profile) {
    qs("#profile-summary").textContent = "No profile yet.";
    return;
  }
  const bmi = calculateBMI(profile.weightKg, profile.heightCm);
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(profile);
  const age = getAge(profile);

  qs("#profile-summary").innerHTML = `
    <div class="list-item">
      <strong>${profile.name}</strong>
      <div>${age ? `${age} yrs` : "Age --"} | ${profile.gender}</div>
      <div>Height ${formatHeight(profile.heightCm, state.settings.units)} | Weight ${formatWeight(profile.weightKg, state.settings.units)}</div>
      <div>Goal: ${profile.goalType} | Activity: ${profile.activityLevel}</div>
      <div>BMI: ${bmi ? bmi.toFixed(1) : "--"} (${bmiCategory(bmi)})</div>
      <div>BMR/TDEE: ${bmr ? Math.round(bmr) : "--"} / ${tdee ? Math.round(tdee) : "--"} kcal (Mifflin-St Jeor estimate)</div>
      <div>Notes: ${profile.notes || "--"}</div>
    </div>
  `;

}

function getLatestWeight() {
  return state.weightEntries
    .slice()
    .sort((a, b) => new Date(b.at) - new Date(a.at))[0];
}

function weightTrendSummary(rangeDays = 7) {
  const entries = state.weightEntries
    .slice()
    .sort((a, b) => new Date(a.at) - new Date(b.at));
  if (entries.length < 2) return "Trend --";
  const latest = entries[entries.length - 1];
  const cutoff = new Date(latest.at);
  cutoff.setDate(cutoff.getDate() - rangeDays);
  const start = entries.find((entry) => new Date(entry.at) >= cutoff) || entries[0];
  if (start === latest) return "Trend --";
  const diffKg = latest.weightKg - start.weightKg;
  const direction = diffKg > 0 ? "up" : diffKg < 0 ? "down" : "flat";
  const diff = state.settings.units === "imperial" ? toLb(diffKg) : diffKg;
  const unit = state.settings.units === "imperial" ? "lb" : "kg";
  return `${Math.abs(diff).toFixed(1)} ${unit} ${direction} (${rangeDays}-day est)`;
}

function weightGoalProjection() {
  const target = state.profile?.targetWeightKg;
  if (!target) return "Goal projection --";
  const entries = state.weightEntries
    .slice()
    .sort((a, b) => new Date(a.at) - new Date(b.at));
  if (entries.length < 2) return "Goal projection --";
  const latest = entries[entries.length - 1];
  const start = entries[Math.max(0, entries.length - 5)];
  const days = (new Date(latest.at) - new Date(start.at)) / 86400000;
  if (days <= 0) return "Goal projection --";
  const ratePerDay = (latest.weightKg - start.weightKg) / days;
  if (ratePerDay === 0) return "Goal projection --";
  const remaining = target - latest.weightKg;
  const daysToGoal = remaining / ratePerDay;
  if (daysToGoal <= 0) return "At current trend, moving away from goal";
  const weeks = Math.round(daysToGoal / 7);
  return `Goal projection: ~${weeks} weeks (estimate)`;
}

function getWeekStepStats() {
  const days = [...Array(7).keys()].map((i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return dateKey(date);
  });
  const totals = days.map((day) =>
    state.steps.filter((entry) => entry.date === day).reduce((sum, entry) => sum + entry.count, 0)
  );
  const total = totals.reduce((sum, val) => sum + val, 0);
  const average = Math.round(total / days.length);
  const distance = (total * 0.0008).toFixed(1);
  const compliance = Math.round((totals.filter((val) => val >= state.settings.stepsGoal).length / days.length) * 100);
  const streak = calculateStepsStreak();
  return { total, average, distance, streak, compliance };
}

function getMonthStepStats() {
  const days = [...Array(30).keys()].map((i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return dateKey(date);
  });
  const totals = days.map((day) =>
    state.steps.filter((entry) => entry.date === day).reduce((sum, entry) => sum + entry.count, 0)
  );
  const total = totals.reduce((sum, val) => sum + val, 0);
  const average = Math.round(total / days.length);
  return { total, average };
}

function calculateStepsStreak() {
  let streak = 0;
  for (let i = 0; i < 365; i += 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = dateKey(date);
    const total = state.steps
      .filter((entry) => entry.date === key)
      .reduce((sum, entry) => sum + entry.count, 0);
    if (total >= state.settings.stepsGoal) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

function getFastRemaining(activeFast) {
  const mode = state.fastingModes.find((m) => m.id === activeFast.modeId);
  const targetHours = mode?.fastHours || state.settings.fastTarget || 16;
  const endAt = new Date(activeFast.startAt).getTime() + targetHours * 60 * 60 * 1000;
  return Math.max(0, endAt - Date.now());
}

function getFastingStats() {
  const target = state.settings.fastTarget;
  const completed = state.fastingSessions.filter((session) => session.status === "complete");
  const weekSessions = completed.filter((session) => {
    const end = new Date(session.endAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    return end >= weekAgo;
  });
  const adherence = weekSessions.length
    ? Math.round(
        (weekSessions.filter((session) => session.elapsedMs >= target * 60 * 60 * 1000).length /
          weekSessions.length) *
          100
      )
    : 0;
  const avgHours = weekSessions.length
    ? (weekSessions.reduce((sum, session) => sum + session.elapsedMs, 0) / weekSessions.length / 3600000).toFixed(1)
    : "0.0";
  const streak = calculateFastingStreak(target);
  return { adherence, average: avgHours, streak };
}

function calculateFastingStreak(targetHours) {
  const targetMs = targetHours * 60 * 60 * 1000;
  const completed = state.fastingSessions.filter((session) => session.status === "complete");
  const daysWithFast = new Set(
    completed.filter((session) => session.elapsedMs >= targetMs).map((session) => dateKey(session.endAt))
  );
  let streak = 0;
  for (let i = 0; i < 365; i += 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = dateKey(date);
    if (daysWithFast.has(key)) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

function getWorkoutStats() {
  const completed = state.workouts.filter((workout) => workout.endedAt);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekSessions = completed.filter((workout) => new Date(workout.endedAt) >= weekAgo);
  const weekIds = new Set(weekSessions.map((workout) => workout.id));
  const weekSets = state.workoutSets.filter((set) => weekIds.has(set.workoutId));
  const prs = new Map();
  state.workoutSets.forEach((set) => {
    const reps = parseInt(set.reps, 10);
    if (Number.isNaN(reps)) return;
    const current = prs.get(set.exerciseId) || 0;
    prs.set(set.exerciseId, Math.max(current, reps));
  });
  const streak = calculateWorkoutStreak();
  return {
    sessions: weekSessions.length,
    perWeek: state.settings.workoutGoal,
    streak,
    volume: weekSets.length,
    prs: prs.size,
    milestones: state.progressionStatus.length
  };
}

function calculateWorkoutStreak() {
  const completed = state.workouts.filter((workout) => workout.endedAt);
  const daysWithWorkout = new Set(completed.map((workout) => dateKey(workout.endedAt)));
  let streak = 0;
  for (let i = 0; i < 365; i += 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = dateKey(date);
    if (daysWithWorkout.has(key)) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

function getWeightStats() {
  const entries = state.weightEntries
    .slice()
    .sort((a, b) => new Date(a.at) - new Date(b.at));
  const latest = entries[entries.length - 1];
  const recent = entries.slice(-30);
  const avgKg = recent.length
    ? recent.reduce((sum, entry) => sum + entry.weightKg, 0) / recent.length
    : null;
  const baseline = entries[0];
  let progress = "--";
  if (state.profile?.targetWeightKg && baseline && latest) {
    const totalChange = baseline.weightKg - state.profile.targetWeightKg;
    const currentChange = baseline.weightKg - latest.weightKg;
    if (totalChange !== 0) {
      progress = `${Math.min(100, Math.max(0, Math.round((currentChange / totalChange) * 100)))}%`;
    }
  }
  return {
    latest: latest ? formatWeight(latest.weightKg, state.settings.units) : "--",
    trend: weightTrendSummary(),
    average: avgKg ? formatWeight(avgKg, state.settings.units) : "--",
    progress
  };
}

function getNutritionStats() {
  if (!state.foodLogs.length) {
    return { avgCalories: null, proteinAvg: null, carbsAvg: null, fatAvg: null, compliance: null };
  }
  const days = [...Array(7).keys()].map((i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return foodDateKey(date);
  });
  const totalsByDay = days.map((day) => getFoodTotals(day));
  const sum = totalsByDay.reduce((totals, day) => {
    totals.kcal += day.kcal;
    totals.protein += day.protein;
    totals.carbs += day.carbs;
    totals.fat += day.fat;
    return totals;
  }, emptyMacros());
  const goals = getMacroGoals();
  const avgCalories = Math.round(sum.kcal / days.length);
  const proteinAvg = Math.round(sum.protein / days.length);
  const carbsAvg = Math.round(sum.carbs / days.length);
  const fatAvg = Math.round(sum.fat / days.length);
  const compliance = goals.calories
    ? Math.round(
        (totalsByDay.filter(
          (total) => total.kcal >= goals.calories * 0.9 && total.kcal <= goals.calories * 1.1
        ).length /
          days.length) *
          100
      )
    : null;
  return { avgCalories, proteinAvg, carbsAvg, fatAvg, compliance };
}

function getGoalFocus() {
  if (!state.profile) return "Set your focus in Settings to personalize daily guidance.";
  if (state.profile.goalType === "cut") {
    return "Focus: hit your step goal and keep fasting consistent.";
  }
  if (state.profile.goalType === "gain") {
    return "Focus: complete your workout and fuel recovery.";
  }
  return "Focus: balance steps, fasting, and training today.";
}

function updateFastControls(activeFast) {
  const label = activeFast ? "End fast" : "Start fast";
  qsa("[data-fast-toggle]").forEach((button) => {
    button.textContent = label;
  });
  const fabLabel = qs("#fab-label");
  const fab = qs("#fast-fab");
  if (fabLabel) fabLabel.textContent = label;
  if (fab) fab.setAttribute("aria-label", label);
}

function setRoute(route) {
  const legacyMap = {
    dashboard: "today",
    calisthenics: "train",
    analytics: "trends",
    profile: "settings",
    nutrition: "food"
  };
  const nextRoute = legacyMap[route] || route;
  if (nextRoute === "exercise" && !activeExerciseId) {
    return setRoute("train");
  }
  if (!routes.includes(nextRoute)) return;
  qsa(".route").forEach((section) => {
    section.hidden = section.dataset.route !== nextRoute;
  });
  const activeTab = routeParents[nextRoute] || nextRoute;
  qsa(".bottom-nav button").forEach((button) => {
    const isActive = button.dataset.route === activeTab;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive);
  });
  const pageTitle = qs("#page-title");
  if (pageTitle) {
    if (nextRoute === "exercise") {
      const exercise = getActiveExercise();
      pageTitle.textContent = exercise ? exercise.name : routeTitles[nextRoute];
    } else {
      pageTitle.textContent = routeTitles[nextRoute] || "Today";
    }
  }
  const backButton = qs("#header-back");
  if (backButton) {
    const parentRoute = routeParents[nextRoute];
    if (parentRoute) {
      backButton.hidden = false;
      backButton.dataset.backTarget = parentRoute;
    } else {
      backButton.hidden = true;
      backButton.dataset.backTarget = "";
    }
  }
  if (nextRoute === "exercise") {
    document.body.dataset.sticky = "exercise";
  } else {
    const video = qs("#exercise-media .media-video");
    if (video) video.pause();
    delete document.body.dataset.sticky;
  }
  if (nextRoute === "food") {
    renderFood();
  }
  localStorage.setItem("grit-route", nextRoute);
}

function initRouter() {
  qsa(".bottom-nav button").forEach((button) => {
    button.addEventListener("click", () => setRoute(button.dataset.route));
  });
  const saved = localStorage.getItem("grit-route") || "today";
  setRoute(saved);
}

function initActions() {
  qsa("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "log-steps") {
        setRoute("steps");
        qs("#steps-form input[name='count']").focus();
      }
      if (action === "toggle-fast") {
        handleFastToggle();
      }
      if (action === "log-weight") {
        setRoute("weight");
        qs("#weight-form input[name='weight']").focus();
      }
      if (action === "start-workout") {
        handleStartWorkout();
      }
      if (action === "edit-steps-goal") {
        handleEditStepsGoal();
      }
    });
  });

  qsa("[data-route-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.routeJump;
      if (target === "food-quick") {
        state.quickEditEntryId = null;
        const form = qs("#food-quick-form");
        if (form) {
          form.reset();
          form.meal.value = state.foodSearch.meal;
        }
      }
      if (target === "timer-new") {
        state.activeTimerId = null;
        renderTimerForm();
      }
      setRoute(target);
    });
  });

  const nudges = qs("#today-nudges");
  if (nudges) {
    nudges.addEventListener("click", (event) => {
      const target = event.target.closest("[data-nudge]");
      if (!target) return;
      const action = target.dataset.nudge;
      if (action === "log-weight") {
        setRoute("weight");
        qs("#weight-form input[name='weight']").focus();
      }
      if (action === "log-food") {
        setRoute("food-search");
        qs("#food-search-input").focus();
      }
      if (action === "log-steps") {
        setRoute("steps");
        qs("#steps-form input[name='count']").focus();
      }
      if (action === "enable-notifications") {
        requestNotificationPermission();
      }
    });
  }

  const filters = qs("#template-filters");
  if (filters) {
    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-template-filter]");
      if (!button) return;
      templateFilter = button.dataset.templateFilter;
      renderCalisthenics();
    });
  }

  const templateList = qs("#template-list");
  if (templateList) {
    templateList.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-template-fav]");
      if (!button) return;
      const template = state.templates.find((item) => item.id === button.dataset.templateFav);
      if (!template) return;
      template.favorite = !template.favorite;
      await put("workoutTemplates", template);
      state.templates = await getAll("workoutTemplates");
      renderCalisthenics();
    });
  }

  const weightRange = qs("#weight-range");
  if (weightRange) {
    weightRange.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-weight-range]");
      if (!button) return;
      state.settings.weightRange = Number(button.dataset.weightRange);
      await put("settings", state.settings);
      renderWeight();
    });
  }

  const backButton = qs("#header-back");
  if (backButton) {
    backButton.addEventListener("click", () => {
      const target = backButton.dataset.backTarget || "train";
      setRoute(target);
    });
  }

  const exerciseList = qs("#exercise-list");
  if (exerciseList) {
    exerciseList.addEventListener("click", (event) => {
      const card = event.target.closest("[data-exercise-id]");
      if (!card) return;
      activeExerciseId = card.dataset.exerciseId;
      setRoute("exercise");
      renderExerciseDetail();
      scrollToTop();
    });
  }

  const variations = qs("#exercise-variations");
  if (variations) {
    variations.addEventListener("click", (event) => {
      const card = event.target.closest("[data-exercise-id]");
      if (!card) return;
      activeExerciseId = card.dataset.exerciseId;
      setRoute("exercise");
      renderExerciseDetail();
      scrollToTop();
    });
  }

  const cues = qs("#exercise-cues");
  if (cues) {
    cues.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-cue]");
      if (!chip) return;
      qsa(".cue-chip").forEach((item) => {
        item.classList.remove("active");
        item.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("active");
      chip.setAttribute("aria-pressed", "true");
      showMediaCaption(chip.dataset.cue);
    });
  }

  const exerciseActions = qs("#exercise-actions");
  if (exerciseActions) {
    exerciseActions.addEventListener("click", (event) => {
      const button = event.target.closest("[data-exercise-action]");
      if (!button) return;
      if (!activeExerciseId) return;
      const label = button.dataset.exerciseAction === "add" ? "Add to workout" : "Start session";
      handleStartWorkout({ exerciseId: activeExerciseId, actionLabel: label });
    });
  }

  qsa("[data-add-meal]").forEach((button) => {
    button.addEventListener("click", () => {
      state.foodSearch.meal = normalizeMealType(button.dataset.addMeal);
      setRoute("food-search");
      renderFoodSearch();
      qs("#food-search-input").focus();
    });
  });

  const dismissFoodDisclaimer = qs("#dismiss-food-disclaimer");
  if (dismissFoodDisclaimer) {
    dismissFoodDisclaimer.addEventListener("click", async () => {
      state.settings.foodDisclaimerDismissed = true;
      await put("settings", state.settings);
      renderFood();
    });
  }

  const foodSearchTabs = qs("#food-search-tabs");
  if (foodSearchTabs) {
    foodSearchTabs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-food-tab]");
      if (!button) return;
      state.foodSearch.tab = button.dataset.foodTab;
      renderFoodSearch();
    });
  }

  const foodSearchInput = qs("#food-search-input");
  if (foodSearchInput) {
    foodSearchInput.addEventListener("input", () => {
      state.foodSearch.query = foodSearchInput.value;
      renderFoodSearch();
    });
  }

  const foodCategoryFilter = qs("#food-category-filter");
  if (foodCategoryFilter) {
    foodCategoryFilter.addEventListener("change", () => {
      state.foodSearch.category = foodCategoryFilter.value;
      renderFoodSearch();
    });
  }

  const foodMealSelect = qs("#food-meal-select");
  if (foodMealSelect) {
    foodMealSelect.addEventListener("change", () => {
      state.foodSearch.meal = normalizeMealType(foodMealSelect.value);
      renderFoodSearch();
    });
  }

  const foodSearchResults = qs("#food-search-results");
  if (foodSearchResults) {
    foodSearchResults.addEventListener("click", (event) => {
      const favorite = event.target.closest("[data-food-favorite]");
      if (favorite) {
        toggleFoodFavorite(favorite.dataset.foodFavorite);
        return;
      }
      const card = event.target.closest("[data-food-id]");
      if (!card) return;
      startFoodPortion("food", card.dataset.foodId, state.foodSearch.meal);
    });
  }

  const mealLists = ["#meal-breakfast-list", "#meal-lunch-list", "#meal-dinner-list", "#meal-snack-list"];
  mealLists.forEach((selector) => {
    const list = qs(selector);
    if (!list) return;
    list.addEventListener("click", (event) => {
      const deleteButton = event.target.closest("[data-food-delete]");
      if (deleteButton) {
        handleDeleteFoodLog(deleteButton.dataset.foodDelete);
        return;
      }
      const row = event.target.closest("[data-food-entry-id]");
      if (!row) return;
      handleEditFoodLog(row.dataset.foodEntryId);
    });
    list.addEventListener("pointerdown", handleFoodSwipeStart);
    list.addEventListener("pointerup", handleFoodSwipeEnd);
    list.addEventListener("pointercancel", handleFoodSwipeEnd);
  });

  const foodLibraryList = qs("#food-library-list");
  if (foodLibraryList) {
    foodLibraryList.addEventListener("click", (event) => {
      const favorite = event.target.closest("[data-food-favorite]");
      if (favorite) {
        toggleFoodFavorite(favorite.dataset.foodFavorite);
        return;
      }
      const edit = event.target.closest("[data-food-edit]");
      if (edit) {
        const food = getFoodItemById(edit.dataset.foodEdit);
        if (food) openFoodEditor(food);
        return;
      }
      const duplicate = event.target.closest("[data-food-duplicate]");
      if (duplicate) {
        const food = getFoodItemById(duplicate.dataset.foodDuplicate);
        if (food) duplicateFoodItem(food);
        return;
      }
      const log = event.target.closest("[data-food-log]");
      if (log) {
        startFoodPortion("food", log.dataset.foodLog, state.foodSearch.meal);
      }
    });
  }

  const foodCreate = qs("#food-create");
  if (foodCreate) {
    foodCreate.addEventListener("click", () => openFoodEditor());
  }

  const recipeCreate = qs("#recipe-create");
  if (recipeCreate) {
    recipeCreate.addEventListener("click", () => {
      startRecipeDraft();
      setRoute("food-recipe-new");
      renderRecipeDraft();
    });
  }

  const recipeList = qs("#recipe-list");
  if (recipeList) {
    recipeList.addEventListener("click", (event) => {
      const view = event.target.closest("[data-recipe-view]");
      if (view) {
        state.activeRecipeId = view.dataset.recipeView;
        setRoute("food-recipe");
        renderRecipeDetail();
        return;
      }
      const log = event.target.closest("[data-recipe-log]");
      if (log) {
        startFoodPortion("recipe", log.dataset.recipeLog, state.foodSearch.meal);
      }
    });
  }

  const recipeLog = qs("#recipe-log");
  if (recipeLog) {
    recipeLog.addEventListener("click", () => {
      if (!state.activeRecipeId) return;
      startFoodPortion("recipe", state.activeRecipeId, state.foodSearch.meal);
    });
  }

  const recipeAdd = qs("#recipe-add-ingredient");
  if (recipeAdd) {
    recipeAdd.addEventListener("click", () => {
      handleAddRecipeIngredient();
    });
  }

  const recipeIngredientList = qs("#recipe-ingredient-list");
  if (recipeIngredientList) {
    recipeIngredientList.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-ingredient]");
      if (!removeButton) return;
      const index = Number(removeButton.dataset.removeIngredient);
      state.recipeDraft.ingredients.splice(index, 1);
      renderRecipeDraft();
    });
  }

  const portionMode = qs("#portion-mode");
  if (portionMode) {
    portionMode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-portion-mode]");
      if (!button || button.disabled) return;
      state.foodPortion.mode = button.dataset.portionMode;
      renderFoodPortion();
    });
  }

  const foodGoalsForm = qs("#food-goals-form");
  if (foodGoalsForm) {
    foodGoalsForm.addEventListener("input", () => {
      updateFoodTargetPreview();
      updateGoalPercentSummary();
    });
  }

  const foodTargetMode = qs("#food-target-mode");
  if (foodTargetMode) {
    foodTargetMode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-target-mode]");
      if (!button) return;
      const mode = button.dataset.targetMode;
      if (state.nutritionGoals) state.nutritionGoals.targetKcalMode = mode;
      setFoodTargetMode(mode);
      updateFoodTargetPreview();
      updateGoalPercentSummary();
    });
  }

  const foodEditProfile = qs("#food-edit-profile");
  if (foodEditProfile) {
    foodEditProfile.addEventListener("click", () => openOnboarding(true));
  }
}

function initFab() {
  const fab = qs("#fast-fab");
  const toggle = qs("#fab-toggle");
  const menu = qs("#fab-menu");
  const backdrop = qs("#fab-backdrop");
  if (!fab || !toggle || !menu || !backdrop) return;
  let skipClick = false;

  const openMenu = () => {
    menu.hidden = false;
    backdrop.hidden = false;
    fab.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    menu.hidden = true;
    backdrop.hidden = true;
    fab.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    if (menu.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  fab.addEventListener("pointerdown", () => {
    fabHoldTimer = setTimeout(() => {
      skipClick = true;
      openMenu();
    }, 420);
  });

  const clearHold = () => {
    if (fabHoldTimer) clearTimeout(fabHoldTimer);
    fabHoldTimer = null;
  };

  fab.addEventListener("pointerup", clearHold);
  fab.addEventListener("pointerleave", clearHold);
  fab.addEventListener("click", () => {
    if (skipClick) {
      skipClick = false;
      return;
    }
    if (!menu.hidden) {
      closeMenu();
      return;
    }
    handleFastToggle();
  });

  menu.addEventListener("click", (event) => {
    const action = event.target.closest("[data-fab-action]");
    if (!action) return;
    if (action.dataset.fabAction === "quick-add-food") {
      setRoute("food-quick");
      state.quickEditEntryId = null;
      const form = qs("#food-quick-form");
      if (form) {
        form.reset();
        form.meal.value = state.foodSearch.meal;
      }
      qs("#food-quick-form input[name='kcal']").focus();
    }
    if (action.dataset.fabAction === "start-timer") {
      setRoute("timer");
    }
    if (action.dataset.fabAction === "log-weight") {
      setRoute("weight");
      qs("#weight-form input[name='weight']").focus();
    }
    if (action.dataset.fabAction === "log-steps") {
      setRoute("steps");
      qs("#steps-form input[name='count']").focus();
    }
    if (action.dataset.fabAction === "start-workout") {
      handleStartWorkout();
    }
    closeMenu();
  });

  backdrop.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

function initForms() {
  const stepsForm = qs("#steps-form");
  stepsForm.date.value = dateKey(new Date());
  stepsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(stepsForm);
    const date = form.get("date");
    const count = Number(form.get("count"));
    const source = form.get("source");
    const dedupeKey = `${state.settings.profileId}:${date}:${source}`;
    const existing = await getAllByIndex("steps", "dedupeKey", dedupeKey);
    const id = existing[0]?.id || uuid();
    await put("steps", {
      id,
      profileId: state.settings.profileId,
      date,
      count,
      source,
      dedupeKey
    });
    state.steps = await getAll("steps");
    stepsForm.reset();
    stepsForm.date.value = dateKey(new Date());
    render();
  });

  const weightForm = qs("#weight-form");
  const now = new Date();
  if (weightForm.at) {
    weightForm.at.value = `${now.toISOString().slice(0, 16)}`;
  }
  weightForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(weightForm);
    const at = form.get("at") || new Date().toISOString();
    const weightInput = Number(form.get("weight"));
    const notes = form.get("notes");
    const weightKg = toKg(weightInput, state.settings.units);
    await put("weightEntries", {
      id: uuid(),
      profileId: state.settings.profileId,
      at,
      weightKg,
      notes
    });
    state.weightEntries = await getAll("weightEntries");
    weightForm.reset();
    if (weightForm.at) {
      weightForm.at.value = `${new Date().toISOString().slice(0, 16)}`;
    }
    render();
  });

  const foodQuickForm = qs("#food-quick-form");
  if (foodQuickForm) {
    foodQuickForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(foodQuickForm);
      const now = new Date();
      const meal = normalizeMealType(form.get("meal"));
      const existing = state.quickEditEntryId
        ? state.foodLogs.find((entry) => entry.id === state.quickEditEntryId)
        : null;
      await put("foodLogs", {
        id: existing?.id || uuid(),
        dateLocal: existing?.dateLocal || foodDateKey(now),
        datetime: existing?.datetime || now.toISOString(),
        mealType: meal,
        sourceType: "quick",
        sourceId: null,
        amountGrams: null,
        amountServings: null,
        computedMacros: {
          kcal: Number(form.get("kcal")) || 0,
          protein: Number(form.get("protein")) || 0,
          carbs: Number(form.get("carbs")) || 0,
          fat: Number(form.get("fat")) || 0,
          fiber: Number(form.get("fiber")) || 0
        },
        notes: form.get("notes") || ""
      });
      state.foodLogs = await getAll("foodLogs");
      state.foodSearch.meal = meal;
      state.quickEditEntryId = null;
      foodQuickForm.reset();
      foodQuickForm.meal.value = meal;
      render();
      setRoute("food");
    });
  }

  const portionForm = qs("#portion-form");
  if (portionForm) {
    const amountInput = portionForm.querySelector("input[name=\"amount\"]");
    if (amountInput) {
      amountInput.addEventListener("input", updatePortionPreview);
    }
    portionForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(portionForm);
      const amount = Number(form.get("amount")) || 0;
      if (!amount) return;
      const selection = state.foodPortion;
      const now = new Date();
      const entryId = selection.entryId;
      const existing = entryId ? state.foodLogs.find((entry) => entry.id === entryId) : null;
      let computed = emptyMacros();
      if (selection.sourceType === "recipe") {
        const recipe = getRecipeById(selection.sourceId);
        const cached = ensureRecipeCache(recipe);
        computed = scaleMacros(cached.perServing, amount);
      } else {
        const food = getFoodItemById(selection.sourceId);
        if (food?.nutritionBasis === "perServing" && selection.mode === "grams" && !food.perServing?.servingGrams) {
          alert("This food needs a serving size to log grams.");
          return;
        }
        computed = computeFoodMacros(food, {
          grams: selection.mode === "grams" ? amount : null,
          servings: selection.mode === "servings" ? amount : null
        });
        if (food) {
          food.lastUsedAt = now.toISOString();
          await put("foodItems", food);
          state.foodItems = await getAll("foodItems");
        }
      }

      await put("foodLogs", {
        id: existing?.id || uuid(),
        dateLocal: existing?.dateLocal || foodDateKey(now),
        datetime: existing?.datetime || now.toISOString(),
        mealType: selection.meal,
        sourceType: selection.sourceType,
        sourceId: selection.sourceId,
        amountGrams: selection.mode === "grams" ? amount : null,
        amountServings: selection.mode === "servings" ? amount : null,
        computedMacros: computed,
        notes: existing?.notes || ""
      });
      state.foodLogs = await getAll("foodLogs");
      state.foodSearch.meal = selection.meal;
      state.foodPortion.entryId = null;
      portionForm.reset();
      render();
      setRoute("food");
    });
  }

  const foodGoalsForm = qs("#food-goals-form");
  if (foodGoalsForm) {
    foodGoalsForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(foodGoalsForm);
      const modeButton = foodGoalsForm.querySelector("[data-target-mode][aria-pressed=\"true\"]");
      const targetMode = modeButton?.dataset.targetMode || "auto";
      const goals = {
        id: "default",
        targetKcalMode: targetMode,
        manualKcalTarget: Number(form.get("manualKcalTarget")) || null,
        weeklyRateKg: Number(form.get("weeklyRateKg")) || null,
        macroTargetMode: "manual",
        proteinTargetG: Number(form.get("proteinTargetG")) || null,
        carbsTargetG: Number(form.get("carbsTargetG")) || null,
        fatTargetG: Number(form.get("fatTargetG")) || null,
        fiberTargetG: Number(form.get("fiberTargetG")) || null,
        proteinGoalG: Number(form.get("proteinTargetG")) || 0,
        carbsGoalG: Number(form.get("carbsTargetG")) || 0,
        fatGoalG: Number(form.get("fatTargetG")) || 0,
        fiberGoalG: Number(form.get("fiberTargetG")) || 0,
        updatedAt: new Date().toISOString()
      };
      const auto = calculateAutoTarget(state.profile, goals);
      goals.computedKcalTarget = auto.target;
      goals.bmrEstimate = auto.bmr;
      goals.tdeeEstimate = auto.tdee;
      goals.goalAdjustmentKcal = auto.adjustment;
      state.nutritionGoals = goals;
      await put("nutritionGoals", goals);
      state.settings.macroPercentView = form.get("showPercent") === "on";
      const resolvedTarget = resolveTargetKcal(goals);
      state.settings.calorieGoal = resolvedTarget.target;
      state.settings.proteinGoal = goals.proteinGoalG;
      state.settings.carbGoal = goals.carbsGoalG;
      state.settings.fatGoal = goals.fatGoalG;
      await put("settings", state.settings);
      render();
      setRoute("food");
    });
  }

  const recipeForm = qs("#recipe-form");
  if (recipeForm) {
    recipeForm.addEventListener("input", renderRecipeDraft);
    recipeForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(recipeForm);
      const name = String(form.get("name") || "").trim();
      const yieldType = form.get("yieldType");
      const yieldAmount = Number(form.get("yieldAmount")) || 0;
      if (!name) return;
      if (!state.recipeDraft.ingredients.length) {
        alert("Add at least one ingredient.");
        return;
      }
      if (!yieldAmount) {
        alert("Set a yield amount.");
        return;
      }
      const now = new Date().toISOString();
      const total = computeRecipeTotals({ ingredients: state.recipeDraft.ingredients });
      const perServing = computeRecipePerServing({ yieldAmount }, total);
      const recipe = {
        id: uuid(),
        name,
        ingredients: state.recipeDraft.ingredients.slice(),
        yieldType,
        yieldAmount,
        computedMacrosTotal: total,
        computedMacrosPerServing: perServing,
        createdAt: now,
        updatedAt: now
      };
      await put("recipes", recipe);
      state.recipes = await getAll("recipes");
      state.activeRecipeId = recipe.id;
      state.recipeDraft = { ingredients: [] };
      recipeForm.reset();
      renderRecipes();
      setRoute("food-recipe");
      renderRecipeDetail();
    });
  }

  const settingsForm = qs("#settings-form");
  settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(settingsForm);
    state.settings.units = form.get("units");
    state.settings.stepsGoal = Number(form.get("stepsGoal"));
    state.settings.fastTarget = Number(form.get("fastTarget"));
    state.settings.workoutGoal = Number(form.get("workoutGoal"));
    await put("settings", state.settings);
    render();
  });

  qs("#fasting-edit-mode").addEventListener("click", handleEditFastingMode);
  qs("#add-exercise").addEventListener("click", handleAddExercise);
  qs("#add-template").addEventListener("click", handleAddTemplate);
  qs("#add-progression").addEventListener("click", handleAddProgression);

  qs("#exercise-filter").addEventListener("change", renderCalisthenics);
  qs("#exercise-search").addEventListener("input", renderCalisthenics);
  qs("#exercise-equipment-filter").addEventListener("change", renderCalisthenics);
  qs("#exercise-level-filter").addEventListener("change", renderCalisthenics);

  qs("#edit-profile").addEventListener("click", () => openOnboarding(true));

  qs("#reminder-fast-start").addEventListener("change", handleReminderChange);
  qs("#reminder-fast-end").addEventListener("change", handleReminderChange);
  qs("#reminder-eat-end").addEventListener("change", handleReminderChange);
  qs("#reminder-hydration").addEventListener("change", handleReminderChange);
  qs("#quiet-start").addEventListener("change", handleReminderChange);
  qs("#quiet-end").addEventListener("change", handleReminderChange);
  qs("#enable-notifications").addEventListener("click", requestNotificationPermission);

  const appearanceForm = qs("#appearance-form");
  if (appearanceForm) {
    appearanceForm.addEventListener("change", async () => {
      const form = new FormData(appearanceForm);
      state.settings.theme = form.get("theme");
      state.settings.density = form.get("density");
      state.settings.fontSize = form.get("fontSize");
      const accent = form.get("accent");
      if (accent) state.settings.accent = accent;
      await put("settings", state.settings);
      applyAppearanceSettings();
    });
  }

  const autoplayToggle = qs("#autoplay-demos");
  if (autoplayToggle) {
    autoplayToggle.addEventListener("change", async () => {
      state.settings.autoplayDemos = autoplayToggle.checked;
      await put("settings", state.settings);
      renderExerciseDetail();
    });
  }

  qs("#export-all").addEventListener("click", async () => {
    await exportAll();
  });
  qs("#delete-data").addEventListener("click", async () => {
    if (!confirm("Delete all local data? This cannot be undone.")) return;
    await clearAll();
    window.location.reload();
  });

  qsa("[data-export]").forEach((button) => {
    button.addEventListener("click", () => exportDataset(button.dataset.export));
  });

  qs("#export-report").addEventListener("click", exportReport);

  const timerQuickForm = qs("#timer-quick-form");
  if (timerQuickForm) {
    timerQuickForm.addEventListener("input", () => {
      const form = new FormData(timerQuickForm);
      state.timerQuick = {
        workSec: Number(form.get("workSec")) || 0,
        restSec: Number(form.get("restSec")) || 0,
        rounds: Number(form.get("rounds")) || 0,
        warmupSec: Number(form.get("warmupSec")) || 0,
        cooldownSec: Number(form.get("cooldownSec")) || 0,
        isInfinite: form.get("isInfinite") === "on"
      };
      timerQuickForm.rounds.disabled = state.timerQuick.isInfinite;
    });
    timerQuickForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = { ...state.timerQuick };
      const error = validateTimerValues(values);
      if (error) {
        alert(error);
        return;
      }
      startTimerRun(
        {
          name: "Quick start",
          category: "Custom",
          type: "simple",
          workSec: values.workSec,
          restSec: values.restSec,
          rounds: values.rounds,
          isInfinite: values.isInfinite,
          warmupSec: values.warmupSec,
          cooldownSec: values.cooldownSec,
          settings: { ...DEFAULT_TIMER_SETTINGS }
        },
        { programId: null, name: "Quick start" }
      );
    });
  }

  const timerForm = qs("#timer-form");
  if (timerForm) {
    timerForm.addEventListener("input", () => {
      timerForm.rounds.disabled = timerForm.isInfinite.checked;
    });
    timerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(timerForm);
      const values = {
        name: String(form.get("name") || "").trim(),
        category: form.get("category"),
        workSec: Number(form.get("workSec")) || 0,
        restSec: Number(form.get("restSec")) || 0,
        rounds: Number(form.get("rounds")) || 0,
        isInfinite: form.get("isInfinite") === "on",
        warmupSec: Number(form.get("warmupSec")) || 0,
        cooldownSec: Number(form.get("cooldownSec")) || 0,
        settings: {
          soundEnabled: form.get("soundEnabled") === "on",
          vibrationEnabled: form.get("vibrationEnabled") === "on",
          countdownEnabled: form.get("countdownEnabled") === "on",
          keepAwakeEnabled: form.get("keepAwakeEnabled") === "on"
        }
      };
      if (!values.name) {
        alert("Name is required.");
        return;
      }
      const error = validateTimerValues(values);
      if (error) {
        alert(error);
        return;
      }
      const now = new Date().toISOString();
      const programId = state.activeTimerId || uuid();
      const program = {
        id: programId,
        name: values.name,
        category: values.category,
        type: "simple",
        workSec: values.workSec,
        restSec: values.restSec,
        rounds: values.rounds,
        isInfinite: values.isInfinite,
        warmupSec: values.warmupSec,
        cooldownSec: values.cooldownSec,
        settings: normalizeTimerSettings(values.settings),
        isBuiltIn: false,
        isFavorite: false,
        createdAt: state.activeTimerId ? state.intervalPrograms.find((p) => p.id === programId)?.createdAt : now,
        updatedAt: now
      };
      await put("intervalPrograms", program);
      state.intervalPrograms = await getAll("intervalPrograms");
      state.activeTimerId = programId;
      renderTimerHome();
      renderTimerForm();
      setRoute("timer");
    });
  }

  const timerPresetWrap = qs("#timer-presets");
  if (timerPresetWrap) {
    timerPresetWrap.addEventListener("click", async (event) => {
      const start = event.target.closest("[data-timer-start]");
      const favorite = event.target.closest("[data-timer-favorite]");
      const duplicate = event.target.closest("[data-timer-duplicate]");
      if (start) {
        const program = getTimerProgramById(start.dataset.timerStart);
        if (program) startTimerRun(program, { programId: program.id });
        return;
      }
      if (favorite) {
        const program = getTimerProgramById(favorite.dataset.timerFavorite);
        if (!program) return;
        program.isFavorite = !program.isFavorite;
        program.updatedAt = new Date().toISOString();
        await put("intervalPrograms", program);
        state.intervalPrograms = await getAll("intervalPrograms");
        renderTimerHome();
        return;
      }
      if (duplicate) {
        const program = getTimerProgramById(duplicate.dataset.timerDuplicate);
        if (!program) return;
        const now = new Date().toISOString();
        const copy = {
          ...program,
          id: uuid(),
          name: `${program.name} copy`,
          isBuiltIn: false,
          isFavorite: false,
          createdAt: now,
          updatedAt: now
        };
        await put("intervalPrograms", copy);
        state.intervalPrograms = await getAll("intervalPrograms");
        renderTimerHome();
      }
    });
  }

  const timerProgramWrap = qs("#timer-programs");
  if (timerProgramWrap) {
    timerProgramWrap.addEventListener("click", async (event) => {
      const start = event.target.closest("[data-timer-start]");
      const edit = event.target.closest("[data-timer-edit]");
      const favorite = event.target.closest("[data-timer-favorite]");
      if (start) {
        const program = getTimerProgramById(start.dataset.timerStart);
        if (program) startTimerRun(program, { programId: program.id });
        return;
      }
      if (edit) {
        state.activeTimerId = edit.dataset.timerEdit;
        renderTimerForm();
        setRoute("timer-new");
        return;
      }
      if (favorite) {
        const program = getTimerProgramById(favorite.dataset.timerFavorite);
        if (!program) return;
        program.isFavorite = !program.isFavorite;
        program.updatedAt = new Date().toISOString();
        await put("intervalPrograms", program);
        state.intervalPrograms = await getAll("intervalPrograms");
        renderTimerHome();
      }
    });
  }

  const timerToggle = qs("#timer-toggle");
  if (timerToggle) {
    timerToggle.addEventListener("click", () => {
      if (!state.timerRun || state.timerRun.phase === "complete") return;
      if (state.timerRun.isPaused) {
        resumeTimer();
      } else {
        pauseTimer();
      }
    });
  }
  const timerSkip = qs("#timer-skip");
  if (timerSkip) timerSkip.addEventListener("click", skipTimerPhase);
  const timerStop = qs("#timer-stop");
  if (timerStop) timerStop.addEventListener("click", stopTimerRun);
  const timerPlus = qs("#timer-plus");
  if (timerPlus) timerPlus.addEventListener("click", () => adjustTimer(10));
  const timerMinus = qs("#timer-minus");
  if (timerMinus) timerMinus.addEventListener("click", () => adjustTimer(-10));

  const timerLock = qs("#timer-lock");
  const timerUnlock = qs("#timer-unlock");
  const timerLockOverlay = qs("#timer-lock-overlay");
  if (timerLock) {
    timerLock.addEventListener("click", () => {
      state.timerLock = true;
      if (timerLockOverlay) timerLockOverlay.hidden = false;
    });
  }
  if (timerUnlock) {
    timerUnlock.addEventListener("click", () => {
      state.timerLock = false;
      if (timerLockOverlay) timerLockOverlay.hidden = true;
    });
  }
  if (timerLockOverlay) {
    timerLockOverlay.addEventListener("click", (event) => {
      if (event.target === timerLockOverlay) {
        state.timerLock = false;
        timerLockOverlay.hidden = true;
      }
    });
  }

  qs("#progression-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-progression]");
    if (!button) return;
    handleUpdateProgression(button.dataset.progression);
  });
}

function initOnboarding() {
  const onboarding = qs("#onboarding");
  const form = qs("#onboarding-form");
  const estimates = qs("#onboarding-estimates");

  const updateEstimates = () => {
    const formData = new FormData(form);
    const units = formData.get("units");
    const height = Number(formData.get("height"));
    const weight = Number(formData.get("weight"));
    const profile = {
      heightCm: toCm(height, units),
      weightKg: toKg(weight, units),
      gender: formData.get("gender"),
      activityLevel: formData.get("activity"),
      dob: formData.get("dob"),
      age: Number(formData.get("age")) || null
    };
    const bmi = calculateBMI(profile.weightKg, profile.heightCm);
    const bmr = calculateBMR(profile);
    const tdee = calculateTDEE(profile);
    estimates.innerHTML = `
      <strong>Estimates:</strong>
      <p>BMI: ${bmi ? bmi.toFixed(1) : "--"} (${bmiCategory(bmi)})</p>
      <p>BMR/TDEE: ${bmr ? Math.round(bmr) : "--"} / ${tdee ? Math.round(tdee) : "--"} kcal</p>
    `;
  };

  form.addEventListener("input", updateEstimates);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const units = formData.get("units");
    const height = Number(formData.get("height"));
    const weight = Number(formData.get("weight"));
    const target = formData.get("target");
    const profile = {
      id: "primary",
      name: formData.get("name"),
      dob: formData.get("dob") || null,
      age: formData.get("age") ? Number(formData.get("age")) : null,
      gender: formData.get("gender"),
      heightCm: toCm(height, units),
      weightKg: toKg(weight, units),
      targetWeightKg: target ? toKg(Number(target), units) : null,
      activityLevel: formData.get("activity"),
      goalType: formData.get("goal"),
      units,
      notes: formData.get("notes") || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await put("profiles", profile);
    state.profile = profile;

    state.settings.units = units;
    await put("settings", state.settings);

    if (state.nutritionGoals) {
      const updatedGoals = {
        ...state.nutritionGoals,
        targetKcalMode: state.nutritionGoals.targetKcalMode || "auto"
      };
      const auto = calculateAutoTarget(profile, updatedGoals);
      updatedGoals.computedKcalTarget = auto.target;
      updatedGoals.bmrEstimate = auto.bmr;
      updatedGoals.tdeeEstimate = auto.tdee;
      updatedGoals.goalAdjustmentKcal = auto.adjustment;
      updatedGoals.updatedAt = new Date().toISOString();
      state.nutritionGoals = updatedGoals;
      await put("nutritionGoals", updatedGoals);
    }

    await put("weightEntries", {
      id: uuid(),
      profileId: profile.id,
      at: new Date().toISOString(),
      weightKg: profile.weightKg,
      notes: "Baseline"
    });

    state.weightEntries = await getAll("weightEntries");
    onboarding.hidden = true;
    render();
  });

  if (!state.profile) {
    onboarding.hidden = false;
    updateEstimates();
  }
}

function openOnboarding(editMode) {
  const onboarding = qs("#onboarding");
  const form = qs("#onboarding-form");
  if (editMode && state.profile) {
    form.name.value = state.profile.name;
    form.dob.value = state.profile.dob || "";
    form.age.value = state.profile.age || "";
    form.gender.value = state.profile.gender;
    form.height.value = state.settings.units === "imperial" ? toIn(state.profile.heightCm).toFixed(1) : state.profile.heightCm.toFixed(1);
    form.weight.value = state.settings.units === "imperial" ? toLb(state.profile.weightKg).toFixed(1) : state.profile.weightKg.toFixed(1);
    form.target.value = state.profile.targetWeightKg
      ? state.settings.units === "imperial"
        ? toLb(state.profile.targetWeightKg).toFixed(1)
        : state.profile.targetWeightKg.toFixed(1)
      : "";
    form.activity.value = state.profile.activityLevel;
    form.goal.value = state.profile.goalType;
    form.units.value = state.settings.units;
    form.notes.value = state.profile.notes;
  }
  onboarding.hidden = false;
}

function handleReminderChange() {
  state.settings.reminders.fastStart = qs("#reminder-fast-start").checked;
  state.settings.reminders.fastEnd = qs("#reminder-fast-end").checked;
  state.settings.reminders.eatEnd = qs("#reminder-eat-end").checked;
  state.settings.reminders.hydration = qs("#reminder-hydration").checked;
  state.settings.quietHours.start = qs("#quiet-start").value;
  state.settings.quietHours.end = qs("#quiet-end").value;
  put("settings", state.settings);
  requestNotificationPermission();
}

function handleEditStepsGoal() {
  openModal({
    title: "Update steps goal",
    fields: [
      { label: "Daily goal", name: "goal", type: "number", value: state.settings.stepsGoal, min: 0 }
    ],
    submitLabel: "Save",
    onSubmit: async (values) => {
      state.settings.stepsGoal = Number(values.goal);
      await put("settings", state.settings);
      render();
    }
  });
}

function handleEditFastingMode() {
  const modeOptions = state.fastingModes
    .map((mode) => `<option value="${mode.id}">${mode.name} (${mode.fastHours}:${mode.eatHours})</option>`)
    .join("");
  const content = `
    <form id="modal-form" class="form-grid">
      <label>Mode<select name="mode">${modeOptions}</select></label>
      <button class="primary" type="submit">Use mode</button>
      <button class="ghost" type="button" data-close>Cancel</button>
      <button class="ghost" type="button" data-custom>Add custom</button>
    </form>
  `;
  const modal = showModal("Select fasting mode", content);
  modal.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(modal.form);
    state.settings.activeFastingModeId = form.get("mode");
    await put("settings", state.settings);
    closeModal();
    render();
  });
  modal.form.querySelector("[data-custom]").addEventListener("click", () => {
    closeModal();
    handleAddFastingMode();
  });
}

function handleAddFastingMode() {
  openModal({
    title: "Create fasting mode",
    fields: [
      { label: "Name", name: "name", type: "text", value: "" },
      { label: "Fast hours", name: "fastHours", type: "number", value: 16, min: 0, step: 0.5 },
      { label: "Eat hours", name: "eatHours", type: "number", value: 8, min: 0, step: 0.5 }
    ],
    submitLabel: "Save",
    onSubmit: async (values) => {
      const id = uuid();
      const mode = {
        id,
        name: values.name,
        fastHours: Number(values.fastHours),
        eatHours: Number(values.eatHours),
        type: "custom"
      };
      await put("fastingModes", mode);
      state.fastingModes = await getAll("fastingModes");
      state.settings.activeFastingModeId = id;
      await put("settings", state.settings);
      render();
    }
  });
}

async function handleFastToggle() {
  const activeFast = getActiveFast();
  const mode = state.fastingModes.find((item) => item.id === state.settings.activeFastingModeId);
  if (!activeFast) {
    const session = {
      id: uuid(),
      profileId: state.settings.profileId,
      modeId: mode?.id,
      startAt: new Date().toISOString(),
      status: "active"
    };
    state.settings.lastNotification.fastEnd = null;
    state.settings.lastNotification.eatEnd = null;
    state.settings.lastHydrationAt = null;
    await put("settings", state.settings);
    await put("fastingSessions", session);
    state.fastingSessions = await getAll("fastingSessions");
    if (state.settings.reminders.fastStart) {
      await notify("fastStart", "Fast started", `Mode ${mode?.name || "Custom"}`);
    }
    render();
    return;
  }
  activeFast.endAt = new Date().toISOString();
  activeFast.elapsedMs = new Date(activeFast.endAt) - new Date(activeFast.startAt);
  activeFast.status = "complete";
  await put("fastingSessions", activeFast);
  state.fastingSessions = await getAll("fastingSessions");
  state.settings.lastFastEndAt = activeFast.endAt;
  await put("settings", state.settings);
  render();
}

async function handleAddExercise() {
  openModal({
    title: "Add exercise",
    fields: [
      { label: "Name", name: "name", type: "text", value: "" },
      { label: "Category", name: "category", type: "select", options: ["push", "pull", "legs", "core", "skill", "mobility"] },
      { label: "Description", name: "description", type: "text", value: "" },
      { label: "Cues (comma separated)", name: "cues", type: "text", value: "" },
      { label: "Common faults", name: "faults", type: "text", value: "" },
      { label: "Scaling options", name: "scaling", type: "text", value: "" },
      { label: "Equipment (comma separated)", name: "equipment", type: "text", value: "" },
      { label: "Tags (comma separated)", name: "tags", type: "text", value: "" }
    ],
    submitLabel: "Save",
    onSubmit: async (values) => {
      const slug = slugify(values.name);
      const tags = values.tags
        ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];
      if (values.category && !tags.includes(values.category)) {
        tags.unshift(values.category);
      }
      const cues = values.cues
        ? values.cues.split(",").map((cue) => cue.trim()).filter(Boolean)
        : [];
      const equipment = normalizeEquipment(values.equipment);
        await put("exercises", {
          id: uuid(),
          slug,
          name: values.name,
          category: values.category,
          description: values.description,
          cues,
          faults: values.faults,
          scaling: values.scaling,
          equipment,
          tags,
          media: exerciseMedia(slug)
        });
      state.exercises = await getAll("exercises");
      renderCalisthenics();
    }
  });
}

async function handleAddTemplate() {
  const options = state.exercises
    .map(
      (exercise) => `<label class="checkbox"><input type="checkbox" name="exercise" value="${exercise.id}" /> ${exercise.name}</label>`
    )
    .join("");
  const content = `
    <form id="modal-form" class="form-grid">
      <label>Name<input type="text" name="name" required /></label>
      <div class="list-item">${options || "No exercises yet."}</div>
      <button class="primary" type="submit">Save template</button>
      <button class="ghost" type="button" data-close>Cancel</button>
    </form>
  `;
  const modal = showModal("Create template", content);
  modal.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(modal.form);
    const ids = Array.from(modal.form.querySelectorAll("input[name='exercise']:checked")).map(
      (input) => input.value
    );
    await put("workoutTemplates", {
      id: uuid(),
      profileId: state.settings.profileId,
      name: form.get("name"),
      exerciseIds: ids,
      favorite: false,
      createdAt: new Date().toISOString()
    });
    state.templates = await getAll("workoutTemplates");
    closeModal();
    renderCalisthenics();
  });
}

async function handleStartWorkout(options = {}) {
  const { exerciseId, actionLabel } = options;
  const templateOptions = state.templates
    .map((template) => `<option value="${template.id}">${template.name}</option>`)
    .join("");
  const exerciseOptions = state.exercises
    .map((exercise) => {
      const selected = exercise.id === exerciseId ? "selected" : "";
      return `<option value="${exercise.id}" ${selected}>${exercise.name}</option>`;
    })
    .join("");
  const submitLabel = actionLabel || "Log workout";
  const title = actionLabel || "Log workout";
  const content = `
    <form id="modal-form" class="form-grid">
      <label>Template<select name="template">${templateOptions}</select></label>
      <label>Exercise<select name="exercise">${exerciseOptions}</select></label>
      <label>Sets<input type="number" name="sets" min="1" step="1" value="3" /></label>
      <label>Reps/hold<input type="text" name="reps" placeholder="e.g., 8 reps or 20s" /></label>
      <label>Rest seconds<input type="number" name="rest" min="0" step="5" value="60" /></label>
      <label>RPE<input type="number" name="rpe" min="1" max="10" step="1" value="7" /></label>
      <label>Notes<input type="text" name="notes" /></label>
      <button class="primary" type="submit">${submitLabel}</button>
      <button class="ghost" type="button" data-close>Cancel</button>
    </form>
  `;
  const modal = showModal(title, content);
  modal.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(modal.form);
    const templateId = form.get("template");
    const exerciseId = form.get("exercise");
    const sets = Number(form.get("sets"));
    const workoutId = uuid();
    const template = state.templates.find((item) => item.id === templateId);
    const name = template ? template.name : "Workout";
    const startedAt = new Date().toISOString();
    const endedAt = new Date().toISOString();

    await put("workouts", {
      id: workoutId,
      profileId: state.settings.profileId,
      templateId,
      name,
      startedAt,
      endedAt,
      notes: form.get("notes") || ""
    });

    const setEntries = [];
    for (let i = 0; i < sets; i += 1) {
      setEntries.push({
        id: uuid(),
        workoutId,
        exerciseId,
        setIndex: i + 1,
        reps: form.get("reps"),
        restSeconds: Number(form.get("rest")),
        rpe: Number(form.get("rpe"))
      });
    }
    await bulkPut("workoutSets", setEntries);
    state.workouts = await getAll("workouts");
    state.workoutSets = await getAll("workoutSets");
    closeModal();
    render();
  });
}

async function handleAddProgression() {
  openModal({
    title: "Add progression",
    fields: [
      { label: "Name", name: "name", type: "text", value: "" },
      { label: "Description", name: "description", type: "text", value: "" },
      { label: "Levels (comma separated)", name: "levels", type: "text", value: "Level 1, Level 2" }
    ],
    submitLabel: "Save",
    onSubmit: async (values) => {
      const progressionId = uuid();
      await put("progressions", {
        id: progressionId,
        name: values.name,
        description: values.description
      });
      const levels = values.levels
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name, index) => ({
          id: uuid(),
          progressionId,
          levelIndex: index + 1,
          name
        }));
      await bulkPut("progressionLevels", levels);
      state.progressions = await getAll("progressions");
      state.progressionLevels = await getAll("progressionLevels");
      renderCalisthenics();
    }
  });
}

async function handleUpdateProgression(progressionId) {
  const status = state.progressionStatus.find((item) => item.progressionId === progressionId);
  openModal({
    title: "Update progression",
    fields: [
      { label: "Current level", name: "level", type: "number", value: status?.currentLevel || 1, min: 1 },
      { label: "Best hold (seconds)", name: "hold", type: "number", value: status?.bestHoldSeconds || 0, min: 0 },
      { label: "Best reps", name: "reps", type: "number", value: status?.bestReps || 0, min: 0 }
    ],
    submitLabel: "Save",
    onSubmit: async (values) => {
      const record = {
        id: status?.id || uuid(),
        progressionId,
        currentLevel: Number(values.level),
        bestHoldSeconds: Number(values.hold),
        bestReps: Number(values.reps),
        milestoneAt: new Date().toISOString()
      };
      await put("progressionStatus", record);
      state.progressionStatus = await getAll("progressionStatus");
      renderCalisthenics();
    }
  });
}

function showModal(title, content) {
  const overlay = qs("#modal-overlay");
  const container = qs("#modal-content");
  container.innerHTML = `<h2>${title}</h2>${content}`;
  overlay.hidden = false;
  const form = container.querySelector("form");
  container.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
  return { overlay, container, form };
}

function openModal({ title, fields, submitLabel, onSubmit }) {
  const fieldsHtml = fields
    .map((field) => {
      if (field.type === "select") {
        const options = field.options.map((opt) => `<option value="${opt}">${opt}</option>`).join("");
        return `<label>${field.label}<select name="${field.name}">${options}</select></label>`;
      }
      return `<label>${field.label}<input type="${field.type}" name="${field.name}" value="${field.value ?? ""}" ${field.min != null ? `min="${field.min}"` : ""} ${field.step != null ? `step="${field.step}"` : ""} /></label>`;
    })
    .join("");
  const content = `
    <form id="modal-form" class="form-grid">
      ${fieldsHtml}
      <button class="primary" type="submit">${submitLabel}</button>
      <button class="ghost" type="button" data-close>Cancel</button>
    </form>
  `;
  const modal = showModal(title, content);
  modal.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(modal.form);
    const values = Object.fromEntries(formData.entries());
    await onSubmit(values);
    closeModal();
  });
}

function closeModal() {
  qs("#modal-overlay").hidden = true;
  qs("#modal-content").innerHTML = "";
}

function showToast(message, options = {}) {
  const toast = qs("#app-toast");
  if (!toast) return;
  const { actionLabel, onAction } = options;
  toast.innerHTML = actionLabel
    ? `<span>${message}</span><button class="ghost" type="button" data-toast-action>${actionLabel}</button>`
    : `<span>${message}</span>`;
  toast.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
    toast.innerHTML = "";
  }, 4000);
  if (actionLabel && onAction) {
    const button = toast.querySelector("[data-toast-action]");
    if (button) {
      button.addEventListener("click", () => {
        onAction();
        toast.hidden = true;
        toast.innerHTML = "";
      });
    }
  }
}

async function handleDeleteFoodLog(entryId) {
  const entry = state.foodLogs.find((item) => item.id === entryId);
  if (!entry) return;
  await remove("foodLogs", entryId);
  state.foodLogs = state.foodLogs.filter((item) => item.id !== entryId);
  render();
  showToast("Entry deleted.", {
    actionLabel: "Undo",
    onAction: async () => {
      await put("foodLogs", entry);
      state.foodLogs = await getAll("foodLogs");
      render();
    }
  });
}

function startFoodPortion(sourceType, sourceId, meal, entry) {
  if (!sourceId) return;
  state.quickEditEntryId = null;
  const normalizedMeal = normalizeMealType(meal || "breakfast");
  let mode = "grams";
  if (entry?.amountServings) mode = "servings";
  if (!entry) {
    if (sourceType === "food") {
      const food = getFoodItemById(sourceId);
      if (food?.nutritionBasis === "perServing") mode = "servings";
    }
    if (sourceType === "recipe") {
      const recipe = getRecipeById(sourceId);
      if (recipe?.yieldType === "servings") mode = "servings";
      if (recipe?.yieldType === "grams") mode = "grams";
    }
  }
  state.foodPortion = {
    sourceType,
    sourceId,
    meal: normalizedMeal,
    mode,
    entryId: entry?.id || null
  };
  state.foodSearch.meal = normalizedMeal;
  const portionForm = qs("#portion-form");
  if (portionForm) {
    const amountInput = portionForm.querySelector("input[name=\"amount\"]");
    if (amountInput) {
      amountInput.value = entry?.amountGrams || entry?.amountServings || "";
    }
  }
  setRoute("food-portion");
  renderFoodPortion();
  const amountInput = qs("#portion-form input[name='amount']");
  if (amountInput) amountInput.focus();
}

function handleEditFoodLog(entryId) {
  const entry = state.foodLogs.find((item) => item.id === entryId);
  if (!entry) return;
  if (entry.sourceType === "quick") {
    state.quickEditEntryId = entry.id;
    state.foodSearch.meal = normalizeMealType(entry.mealType);
    const form = qs("#food-quick-form");
    if (form) {
      form.meal.value = normalizeMealType(entry.mealType);
      form.kcal.value = entry.computedMacros?.kcal ?? "";
      form.protein.value = entry.computedMacros?.protein ?? "";
      form.carbs.value = entry.computedMacros?.carbs ?? "";
      form.fat.value = entry.computedMacros?.fat ?? "";
      form.fiber.value = entry.computedMacros?.fiber ?? "";
      if (form.notes) form.notes.value = entry.notes || "";
    }
    setRoute("food-quick");
    return;
  }
  startFoodPortion(entry.sourceType, entry.sourceId, entry.mealType, entry);
}

async function toggleFoodFavorite(foodId) {
  const food = getFoodItemById(foodId);
  if (!food) return;
  food.isFavorite = !food.isFavorite;
  food.updatedAt = new Date().toISOString();
  await put("foodItems", food);
  state.foodItems = await getAll("foodItems");
  renderFoodSearch();
  renderFoodLibrary();
}

function openFoodEditor(existing, options = {}) {
  const forceCreate = Boolean(options.forceCreate);
  const isEditing = Boolean(existing?.id) && !forceCreate;
  const basis = existing?.nutritionBasis || "per100g";
  const per100g = existing?.per100g || {};
  const perServing = existing?.perServing || {};
  const content = `
    <form id="modal-form" class="form-grid">
      <label>Name<input type="text" name="name" value="${existing?.name || ""}" required /></label>
      <label>Brand<input type="text" name="brand" value="${existing?.brand || ""}" /></label>
      <label>Category
        <select name="category">
          <option value="protein">Protein</option>
          <option value="carb">Carb</option>
          <option value="fat">Fat</option>
          <option value="produce">Produce</option>
          <option value="mixed">Mixed</option>
        </select>
      </label>
      <label>Nutrition basis
        <select name="basis">
          <option value="per100g">Per 100g</option>
          <option value="perServing">Per serving</option>
        </select>
      </label>
      <p class="muted" id="food-basis-hint">Values per 100g.</p>
      <label>Serving grams (optional)<input type="number" name="servingGrams" min="0" step="1" value="${perServing.servingGrams ?? ""}" /></label>
      <label>Calories<input type="number" name="kcal" min="0" step="1" value="${per100g.kcal ?? perServing.kcal ?? ""}" required /></label>
      <label>Protein (g)<input type="number" name="protein" min="0" step="0.1" value="${per100g.protein ?? perServing.protein ?? ""}" /></label>
      <label>Carbs (g)<input type="number" name="carbs" min="0" step="0.1" value="${per100g.carbs ?? perServing.carbs ?? ""}" /></label>
      <label>Fat (g)<input type="number" name="fat" min="0" step="0.1" value="${per100g.fat ?? perServing.fat ?? ""}" /></label>
      <label>Fiber (g)<input type="number" name="fiber" min="0" step="0.1" value="${per100g.fiber ?? perServing.fiber ?? ""}" /></label>
      <button class="primary" type="submit">${isEditing ? "Save changes" : "Save food"}</button>
      <button class="ghost" type="button" data-close>Cancel</button>
    </form>
  `;
  const modal = showModal(isEditing ? "Edit food" : "Create food", content);
  const basisSelect = modal.form.querySelector("select[name='basis']");
  const categorySelect = modal.form.querySelector("select[name='category']");
  const hint = modal.form.querySelector("#food-basis-hint");
  if (basisSelect) basisSelect.value = basis;
  if (categorySelect) categorySelect.value = existing?.category || "mixed";

  const updateHint = () => {
    if (!hint || !basisSelect) return;
    hint.textContent = basisSelect.value === "per100g" ? "Values per 100g." : "Values per serving.";
  };
  updateHint();
  if (basisSelect) {
    basisSelect.addEventListener("change", updateHint);
  }

  modal.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(modal.form);
    const nutritionBasis = form.get("basis");
    const now = new Date().toISOString();
    const record = {
      id: isEditing ? existing.id : uuid(),
      name: String(form.get("name") || "").trim(),
      brand: String(form.get("brand") || "").trim(),
      category: form.get("category"),
      nutritionBasis,
      per100g: nutritionBasis === "per100g"
        ? {
            kcal: Number(form.get("kcal")) || 0,
            protein: Number(form.get("protein")) || 0,
            carbs: Number(form.get("carbs")) || 0,
            fat: Number(form.get("fat")) || 0,
            fiber: Number(form.get("fiber")) || 0
          }
        : existing?.per100g || {},
      perServing: nutritionBasis === "perServing"
        ? {
            servingGrams: Number(form.get("servingGrams")) || null,
            kcal: Number(form.get("kcal")) || 0,
            protein: Number(form.get("protein")) || 0,
            carbs: Number(form.get("carbs")) || 0,
            fat: Number(form.get("fat")) || 0,
            fiber: Number(form.get("fiber")) || 0
          }
        : existing?.perServing || {},
      isUserCreated: existing?.isUserCreated ?? true,
      isFavorite: existing?.isFavorite ?? false,
      lastUsedAt: existing?.lastUsedAt || null,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    if (!record.name) return;
    await put("foodItems", record);
    state.foodItems = await getAll("foodItems");
    closeModal();
    renderFoodSearch();
    renderFoodLibrary();
  });
}

function duplicateFoodItem(food) {
  if (!food) return;
  const copy = {
    ...food,
    id: null,
    name: `${food.name} copy`,
    isUserCreated: true,
    isFavorite: false
  };
  openFoodEditor(copy, { forceCreate: true });
}

function startRecipeDraft() {
  state.recipeDraft = { ingredients: [] };
  state.activeRecipeId = null;
  const form = qs("#recipe-form");
  if (form) {
    form.reset();
    form.yieldType.value = "servings";
    form.yieldAmount.value = 1;
  }
}

function renderRecipeDraft() {
  const list = qs("#recipe-ingredient-list");
  const preview = qs("#recipe-macro-preview");
  const select = qs("#recipe-food-select");
  const form = qs("#recipe-form");
  if (select) {
    const current = select.value;
    select.innerHTML = state.foodItems
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((food) => `<option value="${food.id}">${food.name}</option>`)
      .join("");
    if (current) {
      select.value = current;
    }
  }

  if (list) {
    if (!state.recipeDraft.ingredients.length) {
      list.innerHTML = "<div class=\"list-item\">No ingredients yet.</div>";
    } else {
      list.innerHTML = state.recipeDraft.ingredients
        .map((ingredient, index) => {
          const food = getFoodItemById(ingredient.foodId);
          const name = food?.name || "Unknown food";
          return `<div class="list-item"><strong>${name}</strong><div>${formatMacro(ingredient.grams)} g</div><button class="ghost" type="button" data-remove-ingredient="${index}">Remove</button></div>`;
        })
        .join("");
    }
  }

  if (preview && form) {
    const yieldAmount = Number(form.yieldAmount.value) || 0;
    const yieldType = form.yieldType.value || "servings";
    const total = computeRecipeTotals({ ingredients: state.recipeDraft.ingredients });
    const per = yieldAmount ? scaleMacros(total, 1 / yieldAmount) : emptyMacros();
    const perLabel = yieldType === "grams" ? "per g" : "per serving";
    preview.innerHTML = `
      <strong>Total ${formatKcal(total.kcal)} kcal</strong>
      <div class="muted">${formatFoodMacroLine(total)}</div>
      <div class="muted">Per ${perLabel}: ${formatKcal(per.kcal)} kcal | ${formatFoodMacroLine(per)}</div>
    `;
  }
}

function handleAddRecipeIngredient() {
  const form = qs("#recipe-form");
  if (!form) return;
  const foodField = form.querySelector("[name=\"food\"]");
  const gramsField = form.querySelector("[name=\"grams\"]");
  if (!foodField || !gramsField) return;
  const foodId = foodField.value;
  const grams = Number(gramsField.value) || 0;
  if (!foodId || !grams) return;
  const food = getFoodItemById(foodId);
  if (food?.nutritionBasis === "perServing" && !food.perServing?.servingGrams) {
    alert("Add serving grams to this food before using it in recipes.");
    return;
  }
  state.recipeDraft.ingredients.push({ foodId, grams });
  gramsField.value = "";
  renderRecipeDraft();
}

function ensureRecipeCache(recipe) {
  if (!recipe) return { total: emptyMacros(), perServing: emptyMacros() };
  if (!recipe.computedMacrosTotal || !recipe.computedMacrosPerServing) {
    const total = computeRecipeTotals(recipe);
    const perServing = computeRecipePerServing(recipe, total);
    recipe.computedMacrosTotal = total;
    recipe.computedMacrosPerServing = perServing;
    recipe.updatedAt = new Date().toISOString();
    put("recipes", recipe);
    return { total, perServing };
  }
  return { total: recipe.computedMacrosTotal, perServing: recipe.computedMacrosPerServing };
}

function updatePortionPreview() {
  const preview = qs("#portion-preview");
  const form = qs("#portion-form");
  if (!preview || !form) return;
  const amount = Number(form.querySelector("input[name=\"amount\"]")?.value) || 0;
  if (!amount) {
    preview.innerHTML = "<div class=\"muted\">Enter an amount to preview macros.</div>";
    return;
  }
  const selection = state.foodPortion;
  let macros = emptyMacros();
  if (selection.sourceType === "recipe") {
    const recipe = getRecipeById(selection.sourceId);
    const cached = ensureRecipeCache(recipe);
    macros = scaleMacros(cached.perServing, amount);
  } else {
    const food = getFoodItemById(selection.sourceId);
    if (food?.nutritionBasis === "perServing" && selection.mode === "grams" && !food.perServing?.servingGrams) {
      preview.innerHTML = "<div class=\"muted\">Set serving grams to use grams.</div>";
      return;
    }
    macros = computeFoodMacros(food, {
      grams: selection.mode === "grams" ? amount : null,
      servings: selection.mode === "servings" ? amount : null
    });
  }
  preview.innerHTML = `
    <strong>${formatKcal(macros.kcal)} kcal</strong>
    <div class="muted">${formatFoodMacroLine(macros)}</div>
  `;
}

function handleFoodSwipeStart(event) {
  const row = event.target.closest("[data-food-entry-id]");
  if (!row) return;
  foodSwipeStart.set(row.dataset.foodEntryId, { x: event.clientX, y: event.clientY });
}

function handleFoodSwipeEnd(event) {
  const row = event.target.closest("[data-food-entry-id]");
  if (!row) return;
  const start = foodSwipeStart.get(row.dataset.foodEntryId);
  if (!start) return;
  const dx = event.clientX - start.x;
  const dy = event.clientY - start.y;
  if (Math.abs(dx) > 80 && Math.abs(dy) < 40) {
    handleDeleteFoodLog(row.dataset.foodEntryId);
  }
  foodSwipeStart.delete(row.dataset.foodEntryId);
}

async function exportDataset(dataset) {
  const exporter = {
    steps: { data: state.steps, headers: ["date", "count", "source"] },
    fasting: { data: state.fastingSessions, headers: ["startAt", "endAt", "elapsedMs", "modeId", "status"] },
    weight: { data: state.weightEntries, headers: ["at", "weightKg", "notes"] },
    food: {
      data: state.foodLogs.map((entry) => ({
        dateLocal: entry.dateLocal,
        datetime: entry.datetime,
        mealType: entry.mealType,
        sourceType: entry.sourceType,
        sourceName: getFoodLogSourceName(entry),
        amountGrams: entry.amountGrams,
        amountServings: entry.amountServings,
        kcal: entry.computedMacros?.kcal ?? 0,
        protein: entry.computedMacros?.protein ?? 0,
        carbs: entry.computedMacros?.carbs ?? 0,
        fat: entry.computedMacros?.fat ?? 0,
        fiber: entry.computedMacros?.fiber ?? 0,
        notes: entry.notes || ""
      })),
      headers: [
        "dateLocal",
        "datetime",
        "mealType",
        "sourceType",
        "sourceName",
        "amountGrams",
        "amountServings",
        "kcal",
        "protein",
        "carbs",
        "fat",
        "fiber",
        "notes"
      ]
    },
    workouts: { data: state.workouts, headers: ["startedAt", "endedAt", "name", "notes"] }
  };
  const config = exporter[dataset];
  if (!config) return;
  downloadCSV(`${dataset}.csv`, config.data, config.headers);
}

async function exportAll() {
  await exportDataset("steps");
  await exportDataset("fasting");
  await exportDataset("weight");
  await exportDataset("food");
  await exportDataset("workouts");
}

function exportReport() {
  const weekStats = getWeekStepStats();
  const fastingStats = getFastingStats();
  const workoutStats = getWorkoutStats();
  const weightStats = getWeightStats();
  const nutritionStats = getNutritionStats();
  const rows = [
    {
      steps_total: weekStats.total,
      steps_avg: weekStats.average,
      fasting_adherence: fastingStats.adherence,
      fasting_avg_hours: fastingStats.average,
      workouts: workoutStats.sessions,
      weight_trend: weightStats.trend,
      calories_avg: nutritionStats.avgCalories,
      protein_avg: nutritionStats.proteinAvg,
      carbs_avg: nutritionStats.carbsAvg,
      fat_avg: nutritionStats.fatAvg
    }
  ];
  downloadCSV("weekly-report.csv", rows, Object.keys(rows[0]));
}

function csvEscape(value) {
  const string = value == null ? "" : String(value);
  if (string.includes(",") || string.includes("\n") || string.includes('"')) {
    return `"${string.replace(/"/g, '""')}"`;
  }
  return string;
}

function downloadCSV(filename, rows, headers) {
  const headerLine = headers.join(",");
  const lines = rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","));
  const csv = [headerLine, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function setupInstall() {
  const installButton = qs("#install-app");
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.hidden = false;
  });
  installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.hidden = true;
  });

  const instructions = `
    <div class="list-item">
      <strong>Install on Android</strong>
      <div>Tap Install when prompted, or use browser menu and choose Install app.</div>
    </div>
    <div class="list-item">
      <strong>Install on iOS</strong>
      <div>Open Share in Safari and select Add to Home Screen.</div>
    </div>
    <div class="list-item">
      <strong>FAQ</strong>
      <div>Notifications require permission and are most reliable when the app is open.</div>
    </div>
  `;
  qs("#install-instructions").innerHTML = instructions;
}

function setupShare() {
  const shareButton = qs("#share-app");
  shareButton.addEventListener("click", async () => {
    const shareData = {
      title: "Grit Fitness",
      text: "Offline-first fitness tracker",
      url: window.location.href
    };
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard.");
  });
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
    renderFasting();
    renderDashboard();
  }
}

function startReminderLoop() {
  if (reminderTimer) clearInterval(reminderTimer);
  reminderTimer = setInterval(checkReminders, 60000);
  checkReminders();
}

async function checkReminders() {
  const activeFast = getActiveFast();
  if (activeFast && state.settings.reminders.fastEnd) {
    const remaining = getFastRemaining(activeFast);
    if (remaining <= 0 && !state.settings.lastNotification.fastEnd) {
      await notify("fastEnd", "Fast complete", "Your fasting window is complete.");
    }
  }
  if (!activeFast && state.settings.reminders.eatEnd && state.settings.lastFastEndAt) {
    const mode = state.fastingModes.find((item) => item.id === state.settings.activeFastingModeId);
    const eatHours = mode?.eatHours || 8;
    const eatEndAt = new Date(state.settings.lastFastEndAt).getTime() + eatHours * 60 * 60 * 1000;
    if (Date.now() >= eatEndAt && !state.settings.lastNotification.eatEnd) {
      await notify("eatEnd", "Eating window ending", "Your eating window is closing.");
    }
  }

  if (activeFast && state.settings.reminders.hydration) {
    const lastHydration = state.settings.lastHydrationAt ? new Date(state.settings.lastHydrationAt).getTime() : 0;
    const intervalMs = 2 * 60 * 60 * 1000;
    if (Date.now() - lastHydration > intervalMs) {
      state.settings.lastHydrationAt = new Date().toISOString();
      await put("settings", state.settings);
      await notify("hydration", "Hydration check", "Sip water and listen to your body.");
    }
  }
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  swRegistration = await navigator.serviceWorker.register("/sw.js");
}

function init() {
  if (window.matchMedia) {
    prefersLight = window.matchMedia("(prefers-color-scheme: light)");
    if (prefersLight.addEventListener) {
      prefersLight.addEventListener("change", () => syncThemeColor(state.settings.theme));
    } else if (prefersLight.addListener) {
      prefersLight.addListener(() => syncThemeColor(state.settings.theme));
    }
    prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedListener = () => {
      renderExerciseDetail();
      renderProfile();
    };
    if (prefersReduced.addEventListener) {
      prefersReduced.addEventListener("change", reducedListener);
    } else if (prefersReduced.addListener) {
      prefersReduced.addListener(reducedListener);
    }
  }
  registerServiceWorker();
  initRouter();
  initActions();
  initFab();
  document.addEventListener("visibilitychange", () => {
    const timer = state.timerRun;
    if (!document.hidden && timer && !timer.isPaused && timer.settings.keepAwakeEnabled) {
      requestWakeLock();
    }
  });
  seedData()
    .then(loadState)
    .then(async () => {
      await ensureExerciseSchema();
    })
    .then(() => {
      applyAppearanceSettings();
      initForms();
      initOnboarding();
      setupInstall();
      setupShare();
      render();
      requestAnimationFrame(() => {
        seedFoodDatabase();
      });
      startReminderLoop();
    });
}

window.addEventListener("DOMContentLoaded", init);




