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
    name: "Push-up",
    category: "push",
    description: "Classic horizontal push.",
    cues: "Brace core, full range, elbows 30-45 deg.",
    faults: "Flaring elbows, sagging hips.",
    scaling: "Knee push-up, incline push-up.",
    equipment: "none"
  },
  {
    id: "ex-dip",
    name: "Dip",
    category: "push",
    description: "Vertical push with shoulder depth control.",
    cues: "Scapula down, chest proud.",
    faults: "Shrugging shoulders, partial ROM.",
    scaling: "Bench dip, band assist.",
    equipment: "bars"
  },
  {
    id: "ex-pullup",
    name: "Pull-up",
    category: "pull",
    description: "Vertical pull to clear the bar.",
    cues: "Lead with chest, control descent.",
    faults: "Kipping, half reps.",
    scaling: "Band assist, negative reps.",
    equipment: "bar"
  },
  {
    id: "ex-row",
    name: "Inverted row",
    category: "pull",
    description: "Horizontal pull with bodyweight.",
    cues: "Rigid body line, squeeze shoulder blades.",
    faults: "Hips sag, neck craning.",
    scaling: "Raise bar height.",
    equipment: "rings/bar"
  },
  {
    id: "ex-squat",
    name: "Air squat",
    category: "legs",
    description: "Foundational leg pattern.",
    cues: "Knees track toes, chest up.",
    faults: "Heels lift, knees cave.",
    scaling: "Box squat.",
    equipment: "none"
  },
  {
    id: "ex-lunge",
    name: "Split lunge",
    category: "legs",
    description: "Single-leg strength builder.",
    cues: "Tall torso, steady tempo.",
    faults: "Front knee collapse.",
    scaling: "Assisted lunge.",
    equipment: "none"
  },
  {
    id: "ex-plank",
    name: "Plank",
    category: "core",
    description: "Isometric core hold.",
    cues: "Glutes tight, neutral spine.",
    faults: "Hips sagging.",
    scaling: "Knee plank.",
    equipment: "none"
  },
  {
    id: "ex-hollow",
    name: "Hollow hold",
    category: "core",
    description: "Gymnastics core position.",
    cues: "Lower back glued to floor.",
    faults: "Rib flare.",
    scaling: "Tuck hold.",
    equipment: "none"
  },
  {
    id: "ex-handstand",
    name: "Handstand",
    category: "skill",
    description: "Balance and shoulder control.",
    cues: "Stacked hips, active shoulders.",
    faults: "Over-arching.",
    scaling: "Wall walks.",
    equipment: "wall"
  },
  {
    id: "ex-lsit",
    name: "L-sit",
    category: "skill",
    description: "Compression strength hold.",
    cues: "Lock elbows, lift hips.",
    faults: "Bent arms.",
    scaling: "Tuck sit.",
    equipment: "parallettes"
  },
  {
    id: "ex-mobility",
    name: "Thoracic opener",
    category: "mobility",
    description: "Opens shoulders and upper back.",
    cues: "Slow breathing.",
    faults: "Rushed reps.",
    scaling: "Reduce range.",
    equipment: "none"
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
];let deferredInstallPrompt = null;
let swRegistration = null;
let reminderTimer = null;

const routes = [
  "dashboard",
  "calisthenics",
  "steps",
  "fasting",
  "weight",
  "analytics",
  "profile"
];

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
  state.settings = (await get("settings", "default")) || { ...DEFAULT_SETTINGS };
  if (!state.settings.id) {
    state.settings = { ...DEFAULT_SETTINGS };
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
  renderDashboard();
  renderSteps();
  renderFasting();
  renderWeight();
  renderCalisthenics();
  renderAnalytics();
  renderProfile();
}

function renderDashboard() {
  const today = dateKey(new Date());
  const stepsToday = state.steps
    .filter((entry) => entry.date === today)
    .reduce((sum, entry) => sum + entry.count, 0);
  const stepsStreak = calculateStepsStreak();
  qs("#today-steps").textContent = stepsToday.toLocaleString();
  qs("#today-steps-meta").textContent = `Goal ${state.settings.stepsGoal} | Streak ${stepsStreak}`;

  const activeFast = getActiveFast();
  if (activeFast) {
    const elapsed = Date.now() - new Date(activeFast.startAt).getTime();
    qs("#today-fast").textContent = `Fasting ${formatDuration(elapsed)}`;
    qs("#today-fast-meta").textContent = `Ends in ${formatDuration(getFastRemaining(activeFast))}`;
  } else {
    qs("#today-fast").textContent = "Not fasting";
    qs("#today-fast-meta").textContent = "Next window: start when ready";
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
}

function renderSteps() {
  qs("#steps-goal").textContent = `${state.settings.stepsGoal.toLocaleString()} steps`;
  const weekStats = getWeekStepStats();
  const monthStats = getMonthStepStats();
  qs("#steps-week").textContent = `${weekStats.average.toLocaleString()} avg/day | ${weekStats.streak} day streak | ${weekStats.distance} km est.`;
  qs("#steps-month").textContent = `${monthStats.total.toLocaleString()} total | ${monthStats.average.toLocaleString()} avg/day`;

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
    qs("#fasting-toggle").textContent = "End fast";
    qs("#fasting-next").textContent = `Target ends in ${formatDuration(getFastRemaining(activeFast))}`;
  } else {
    qs("#fasting-status").textContent = "Not fasting";
    qs("#fasting-elapsed").textContent = "--";
    qs("#fasting-toggle").textContent = "Start fast";
    qs("#fasting-next").textContent = "Start a fast to see the next window.";
  }

  qs("#reminder-fast-start").checked = state.settings.reminders.fastStart;
  qs("#reminder-fast-end").checked = state.settings.reminders.fastEnd;
  qs("#reminder-eat-end").checked = state.settings.reminders.eatEnd;
  qs("#reminder-hydration").checked = state.settings.reminders.hydration;
  qs("#quiet-start").value = state.settings.quietHours.start;
  qs("#quiet-end").value = state.settings.quietHours.end;

  const history = state.fastingSessions
    .filter((session) => session.status === "complete")
    .sort((a, b) => new Date(b.endAt) - new Date(a.endAt))
    .slice(0, 10)
    .map((session) => {
      const modeName = state.fastingModes.find((m) => m.id === session.modeId)?.name || "Custom";
      return `<div class="list-item"><strong>${modeName}</strong><div>${formatDateShort(session.endAt)} | ${formatDuration(session.elapsedMs)}</div></div>`;
    })
    .join("");
  qs("#fasting-history").innerHTML = history || "<div class=\"list-item\">No fasting sessions yet.</div>";
}

function renderWeight() {
  const latest = getLatestWeight();
  qs("#weight-latest").textContent = latest
    ? `${formatWeight(latest.weightKg, state.settings.units)} | ${formatDateTime(latest.at)}`
    : "--";
  qs("#weight-trend").textContent = weightTrendSummary();
  qs("#weight-projection").textContent = weightGoalProjection();

  const history = state.weightEntries
    .slice()
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 10)
    .map((entry) => {
      return `<div class="list-item"><strong>${formatWeight(entry.weightKg, state.settings.units)}</strong><div>${formatDateTime(entry.at)}</div><div>${entry.notes || ""}</div></div>`;
    })
    .join("");
  qs("#weight-history").innerHTML = history || "<div class=\"list-item\">No weight entries yet.</div>";
}

function renderCalisthenics() {
  const filter = qs("#exercise-filter").value || "all";
  const list = state.exercises
    .filter((exercise) => filter === "all" || exercise.category === filter)
    .map((exercise) => {
      return `<div class="list-item"><strong>${exercise.name}</strong><div>${exercise.description}</div><div>Cues: ${exercise.cues}</div><div>Common faults: ${exercise.faults}</div><div>Scaling: ${exercise.scaling}</div><div>Equipment: ${exercise.equipment || "none"}</div></div>`;
    })
    .join("");
  qs("#exercise-list").innerHTML = list || "<div class=\"list-item\">No exercises yet.</div>";

  const templates = state.templates
    .map((template) => {
      const exercises = template.exerciseIds
        .map((id) => state.exercises.find((exercise) => exercise.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      return `<div class="list-item"><strong>${template.name}</strong><div>${exercises || "No exercises"}</div></div>`;
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

  const settingsForm = qs("#settings-form");
  settingsForm.units.value = state.settings.units;
  settingsForm.stepsGoal.value = state.settings.stepsGoal;
  settingsForm.fastTarget.value = state.settings.fastTarget;
  settingsForm.workoutGoal.value = state.settings.workoutGoal;
}

function getLatestWeight() {
  return state.weightEntries
    .slice()
    .sort((a, b) => new Date(b.at) - new Date(a.at))[0];
}

function weightTrendSummary() {
  const entries = state.weightEntries
    .slice()
    .sort((a, b) => new Date(a.at) - new Date(b.at));
  if (entries.length < 2) return "Trend --";
  const latest = entries[entries.length - 1];
  const start = entries[Math.max(0, entries.length - 7)];
  const diffKg = latest.weightKg - start.weightKg;
  const direction = diffKg > 0 ? "up" : diffKg < 0 ? "down" : "flat";
  const diff = state.settings.units === "imperial" ? toLb(diffKg) : diffKg;
  const unit = state.settings.units === "imperial" ? "lb" : "kg";
  return `${Math.abs(diff).toFixed(1)} ${unit} ${direction} (7-day est)`;
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
  if (!state.profile) return "Set your focus in Profile to personalize daily guidance.";
  if (state.profile.goalType === "cut") {
    return "Focus: hit your step goal and keep fasting consistent.";
  }
  if (state.profile.goalType === "gain") {
    return "Focus: complete your workout and fuel recovery.";
  }
  return "Focus: balance steps, fasting, and training today.";
}

function setRoute(route) {
  if (!routes.includes(route)) return;
  qsa(".route").forEach((section) => {
    section.hidden = section.dataset.route !== route;
  });
  qsa(".bottom-nav button").forEach((button) => {
    button.classList.toggle("active", button.dataset.route === route);
  });
  localStorage.setItem("grit-route", route);
}

function initRouter() {
  qsa(".bottom-nav button").forEach((button) => {
    button.addEventListener("click", () => setRoute(button.dataset.route));
  });
  const saved = localStorage.getItem("grit-route") || "dashboard";
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
  weightForm.at.value = `${now.toISOString().slice(0, 16)}`;
  weightForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(weightForm);
    const at = form.get("at");
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
    weightForm.at.value = `${new Date().toISOString().slice(0, 16)}`;
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

  qs("#fasting-toggle").addEventListener("click", handleFastToggle);
  qs("#fasting-edit-mode").addEventListener("click", handleEditFastingMode);
  qs("#add-exercise").addEventListener("click", handleAddExercise);
  qs("#add-template").addEventListener("click", handleAddTemplate);
  qs("#add-progression").addEventListener("click", handleAddProgression);

  qs("#exercise-filter").addEventListener("change", renderCalisthenics);

  qs("#edit-profile").addEventListener("click", () => openOnboarding(true));

  qs("#reminder-fast-start").addEventListener("change", handleReminderChange);
  qs("#reminder-fast-end").addEventListener("change", handleReminderChange);
  qs("#reminder-eat-end").addEventListener("change", handleReminderChange);
  qs("#reminder-hydration").addEventListener("change", handleReminderChange);
  qs("#quiet-start").addEventListener("change", handleReminderChange);
  qs("#quiet-end").addEventListener("change", handleReminderChange);

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
      { label: "Cues", name: "cues", type: "text", value: "" },
      { label: "Common faults", name: "faults", type: "text", value: "" },
      { label: "Scaling options", name: "scaling", type: "text", value: "" },
      { label: "Equipment", name: "equipment", type: "text", value: "" }
    ],
    submitLabel: "Save",
    onSubmit: async (values) => {
      await put("exercises", {
        id: uuid(),
        name: values.name,
        category: values.category,
        description: values.description,
        cues: values.cues,
        faults: values.faults,
        scaling: values.scaling,
        equipment: values.equipment
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
      exerciseIds: ids
    });
    state.templates = await getAll("workoutTemplates");
    closeModal();
    renderCalisthenics();
  });
}

async function handleStartWorkout() {
  const templateOptions = state.templates
    .map((template) => `<option value="${template.id}">${template.name}</option>`)
    .join("");
  const exerciseOptions = state.exercises
    .map((exercise) => `<option value="${exercise.id}">${exercise.name}</option>`)
    .join("");
  const content = `
    <form id="modal-form" class="form-grid">
      <label>Template<select name="template">${templateOptions}</select></label>
      <label>Exercise<select name="exercise">${exerciseOptions}</select></label>
      <label>Sets<input type="number" name="sets" min="1" step="1" value="3" /></label>
      <label>Reps/hold<input type="text" name="reps" placeholder="e.g., 8 reps or 20s" /></label>
      <label>Rest seconds<input type="number" name="rest" min="0" step="5" value="60" /></label>
      <label>RPE<input type="number" name="rpe" min="1" max="10" step="1" value="7" /></label>
      <label>Notes<input type="text" name="notes" /></label>
      <button class="primary" type="submit">Log workout</button>
      <button class="ghost" type="button" data-close>Cancel</button>
    </form>
  `;
  const modal = showModal("Log workout", content);
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
  registerServiceWorker();
  initRouter();
  initActions();
  seedData()
    .then(loadState)
    .then(() => {
      initForms();
      initOnboarding();
      setupInstall();
      setupShare();
      render();
      startReminderLoop();
    });
}

window.addEventListener("DOMContentLoaded", init);




