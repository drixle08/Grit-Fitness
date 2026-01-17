const DB_NAME = "grit-fitness";
const DB_VERSION = 5;

const STORES = {
  profiles: { keyPath: "id" },
  settings: { keyPath: "id" },
  steps: { keyPath: "id", indexes: ["date", "source", "dedupeKey"] },
  fastingSessions: { keyPath: "id", indexes: ["status", "startAt"] },
  fastingModes: { keyPath: "id", indexes: ["type"] },
  weightEntries: { keyPath: "id", indexes: ["at"] },
  nutritionEntries: { keyPath: "id", indexes: ["date", "meal"] },
  foodItems: { keyPath: "id", indexes: ["name", "brand", "category", "isFavorite", "lastUsedAt"] },
  recipes: { keyPath: "id", indexes: ["name"] },
  foodLogs: {
    keyPath: "id",
    indexes: ["dateLocal", { name: "dateMeal", keyPath: ["dateLocal", "mealType"] }]
  },
  nutritionGoals: { keyPath: "id", indexes: ["updatedAt"] },
  intervalPrograms: { keyPath: "id", indexes: ["category", "isBuiltIn", "isFavorite", "updatedAt"] },
  intervalSessions: { keyPath: "id", indexes: ["programId", "startedAt"] },
  exercises: { keyPath: "id", indexes: ["category"] },
  workoutTemplates: { keyPath: "id", indexes: ["name"] },
  workouts: { keyPath: "id", indexes: ["startedAt"] },
  workoutSets: { keyPath: "id", indexes: ["workoutId", "exerciseId"] },
  progressions: { keyPath: "id" },
  progressionLevels: { keyPath: "id", indexes: ["progressionId"] },
  progressionStatus: { keyPath: "id", indexes: ["progressionId"] }
};

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      const tx = request.transaction;
      Object.entries(STORES).forEach(([name, config]) => {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: config.keyPath });
          (config.indexes || []).forEach((index) => {
            const indexName = typeof index === "string" ? index : index.name;
            const keyPath = typeof index === "string" ? index : index.keyPath;
            const options = typeof index === "string" ? undefined : index.options;
            store.createIndex(indexName, keyPath, options);
          });
          return;
        }
        const store = tx.objectStore(name);
        (config.indexes || []).forEach((index) => {
          const indexName = typeof index === "string" ? index : index.name;
          const keyPath = typeof index === "string" ? index : index.keyPath;
          const options = typeof index === "string" ? undefined : index.options;
          if (!store.indexNames.contains(indexName)) {
            store.createIndex(indexName, keyPath, options);
          }
        });
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function withStore(storeName, mode, callback) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let result;
    try {
      result = callback(store);
    } catch (error) {
      reject(error);
    }
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
  });
}

function toResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function toArray(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export function uuid() {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const seed = Math.random().toString(16).slice(2);
  return `local-${Date.now()}-${seed}`;
}

export async function get(storeName, key) {
  return withStore(storeName, "readonly", (store) => toResult(store.get(key)));
}

export async function getAll(storeName) {
  return withStore(storeName, "readonly", (store) => toArray(store.getAll()));
}

export async function getAllByIndex(storeName, indexName, value) {
  return withStore(storeName, "readonly", (store) => {
    const index = store.index(indexName);
    const request = index.getAll(value);
    return toArray(request);
  });
}

export async function put(storeName, value) {
  return withStore(storeName, "readwrite", (store) => store.put(value));
}

export async function bulkPut(storeName, values) {
  return withStore(storeName, "readwrite", (store) => {
    values.forEach((value) => store.put(value));
  });
}

export async function remove(storeName, key) {
  return withStore(storeName, "readwrite", (store) => store.delete(key));
}

export async function clearStore(storeName) {
  return withStore(storeName, "readwrite", (store) => store.clear());
}

export async function clearAll() {
  const db = await openDB();
  const storeNames = Array.from(db.objectStoreNames);
  for (const name of storeNames) {
    await clearStore(name);
  }
}

export const stores = Object.keys(STORES);
