// ─── Firebase Leaderboard ─────────────────────────────────────────────────────
//
// Setup (one-time):
//   1. Go to https://console.firebase.google.com/ → create a project
//   2. Build → Realtime Database → Create database → Start in test mode
//   3. Project Settings → Your apps → Add web app → copy the config below
//   4. In the Realtime Database "Rules" tab, paste:
//      {
//        "rules": {
//          "allowList": { ".read": true, ".write": false },
//          "leaderboard": {
//            ".read": true,
//            "$user": { ".write": "root.child('allowList').child($user).exists()" }
//          }
//        }
//      }
//   5. Add allowed names under allowList/ in the Database (key = display name, value = true).
//
// Then fill in your config values below and share the file with your team.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBBNOP6urLAl-_7wJoa-1n0nRnKpW2SjCE",
  authDomain: "worflow-counter.firebaseapp.com",
  databaseURL: "https://worflow-counter-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "worflow-counter",
  storageBucket: "worflow-counter.firebasestorage.app",
  messagingSenderId: "465573472148",
  appId: "1:465573472148:web:a461431a7a7b03709cd181",
};

let _db = null;
// undefined = not yet fetched, null = no allowList (allow all), Set = allowed keys
let _allowListCache;

function isConfigured() {
  return FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY";
}

function getDb() {
  if (!_db) {
    const app = initializeApp(FIREBASE_CONFIG);
    _db = getDatabase(app);
  }
  return _db;
}

// Sanitize a display name for use as a Firebase key
// Firebase keys cannot contain: . # $ [ ] /
function sanitizeKey(name) {
  return name
    .trim()
    .replace(/[.#$[\]/]/g, "_")
    .slice(0, 40);
}

// Fetch allowList once and cache it. Returns a Set of allowed keys, or null if no list exists.
async function getOrFetchAllowList() {
  if (_allowListCache !== undefined) return _allowListCache;
  try {
    const db = getDb();
    const snapshot = await get(ref(db, "allowList"));
    // Works whether allowList entries are { name: true } or { name: { since: "..." } }
    _allowListCache = snapshot.exists() ? new Set(Object.keys(snapshot.val())) : null;
  } catch {
    _allowListCache = null; // on error, don't block anyone
  }
  return _allowListCache;
}

/**
 * Push today's score for a user.
 * Silently skips if the user's name is not in the allowList.
 * @param {string} name - Display name
 * @param {string} dateKey - YYYY-MM-DD
 * @param {number|object} payload - Either a plain total number (legacy) or an
 *   object like { _total: 145, CID: 36, SINGLES: 89, ICM: 20 }
 */
export async function pushScore(name, dateKey, payload) {
  if (!isConfigured()) return;
  try {
    const db = getDb();
    const key = sanitizeKey(name);
    const allowList = await getOrFetchAllowList();
    if (allowList && !allowList.has(key)) return; // not on the list — silently ignore
    await set(ref(db, `leaderboard/${key}/${dateKey}`), payload);
  } catch (err) {
    console.warn("[Leaderboard] sync failed:", err.message);
  }
}

/**
 * Fetch the full leaderboard data, filtered to allowList if one exists.
 * Returns an object like: { "Alice": { "2026-03-17": 42, ... }, ... }
 * Returns null if Firebase is not configured or fetch fails.
 */
export async function fetchLeaderboard() {
  if (!isConfigured()) return null;
  try {
    const db = getDb();
    const [leaderSnapshot, allowList] = await Promise.all([
      get(ref(db, "leaderboard")),
      getOrFetchAllowList(),
    ]);
    if (!leaderSnapshot.exists()) return {};
    const data = leaderSnapshot.val();
    if (!allowList) return data; // no allowList = show everyone
    return Object.fromEntries(
      Object.entries(data).filter(([key]) => allowList.has(key))
    );
  } catch (err) {
    console.warn("[Leaderboard] fetch failed:", err.message);
    return null;
  }
}

/**
 * Fetch the allowlist of approved display name keys.
 * Returns an object like { "Alice": true, "Bob": true } or null if not set up.
 */
export async function fetchAllowlist() {
  if (!isConfigured()) return null;
  try {
    const db = getDb();
    const snapshot = await get(ref(db, "allowlist"));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (err) {
    console.warn("[Leaderboard] allowlist fetch failed:", err.message);
    return null;
  }
}

export { isConfigured };
