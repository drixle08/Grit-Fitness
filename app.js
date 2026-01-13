import {
  get,
  getAll,
  getAllByIndex,
  put,
  bulkPut,
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
  exercises: [],
  templates: [],
  workouts: [],
  workoutSets: [],
  progressions: [],
  progressionLevels: [],
  progressionStatus: []
};

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  athlete: 1.9
};

const DEFAULT_SETTINGS = {
  id: "default",
  profileId: "primary",
  units: "metric",
  stepsGoal: 8000,
  fastTarget: 16,
  workoutGoal: 3,
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

const routes = ["today", "train", "exercise", "steps", "fasting", "weight", "trends", "settings"];

const routeParents = {
  fasting: "today",
  weight: "today",
  exercise: "train"
};

const routeTitles = {
  today: "Today",
  train: "Train",
  exercise: "Exercise",
  steps: "Steps",
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

function formatDuration(ms) {
  if (ms == null) return "--";
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
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
  if (savedSettings?.autoplayDemos == null && prefersReduced?.matches) {
    state.settings.autoplayDemos = false;
  }
  await put("settings", state.settings);

  state.steps = await getAll("steps");
  state.fastingSessions = await getAll("fastingSessions");
  state.fastingModes = await getAll("fastingModes");
  state.weightEntries = await getAll("weightEntries");
  state.exercises = await getAll("exercises");
  state.templates = await getAll("workoutTemplates");
  state.workouts = await getAll("workouts");
  state.workoutSets = await getAll("workoutSets");
  state.progressions = await getAll("progressions");
  state.progressionLevels = await getAll("progressionLevels");
  state.progressionStatus = await getAll("progressionStatus");
}

function render() {
  applyAppearanceSettings();
  renderDashboard();
  renderSteps();
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

  qs("#analytics-summary").innerHTML = [
    `<div class="metric"><p>Steps</p><h3>${weekStats.total.toLocaleString()}</h3><span>${weekStats.average.toLocaleString()} avg/day | ${weekStats.compliance}% goal compliance | ${weekStats.streak} day streak</span></div>`,
    `<div class="metric"><p>Fasting</p><h3>${fastingStats.adherence}%</h3><span>${fastingStats.average}h avg | ${fastingStats.streak} day streak</span></div>`,
    `<div class="metric"><p>Workouts</p><h3>${workoutStats.sessions}</h3><span>${workoutStats.perWeek} per week | ${workoutStats.volume} sets | ${workoutStats.prs} PRs | ${workoutStats.streak} day streak</span></div>`,
    `<div class="metric"><p>Weight</p><h3>${weightStats.latest}</h3><span>${weightStats.trend} | Avg ${weightStats.average} | Goal ${weightStats.progress}</span></div>`
  ].join("");

  qs("#report-card").innerHTML = `
    <p><strong>Weekly report</strong></p>
    <p>Steps: ${weekStats.total.toLocaleString()} | Fasting adherence: ${fastingStats.adherence}%</p>
    <p>Workouts: ${workoutStats.sessions} | Volume: ${workoutStats.volume} sets | Milestones: ${workoutStats.milestones}</p>
  `;
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
    profile: "settings"
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
    button.addEventListener("click", () => setRoute(button.dataset.routeJump));
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

async function exportDataset(dataset) {
  const exporter = {
    steps: { data: state.steps, headers: ["date", "count", "source"] },
    fasting: { data: state.fastingSessions, headers: ["startAt", "endAt", "elapsedMs", "modeId", "status"] },
    weight: { data: state.weightEntries, headers: ["at", "weightKg", "notes"] },
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
  await exportDataset("workouts");
}

function exportReport() {
  const weekStats = getWeekStepStats();
  const fastingStats = getFastingStats();
  const workoutStats = getWorkoutStats();
  const weightStats = getWeightStats();
  const rows = [
    {
      steps_total: weekStats.total,
      steps_avg: weekStats.average,
      fasting_adherence: fastingStats.adherence,
      fasting_avg_hours: fastingStats.average,
      workouts: workoutStats.sessions,
      weight_trend: weightStats.trend
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
      startReminderLoop();
    });
}

window.addEventListener("DOMContentLoaded", init);




