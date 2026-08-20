import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StoreSettings {
  storeName:        string;
  phone:            string;
  email:            string;
  location:         string;
  facebookUrl:      string;
  tiktokUrl:        string;
  deliveryFee:      number;
  deliveryNote:     string;  // e.g. "Free island-wide delivery via courier"
  responseTime:     string;  // e.g. "We respond within 24 hours"
}

export interface ContentSettings {
  heroHeading:    string;   // e.g. "Timeless Style, Sri Lankan Made"
  heroSubtext:    string;   // tagline below heading
  ctaText:        string;   // text on the CTA strip (bottom of home page)
  featuredProductIds: string[]; // product IDs to pin to "New Arrivals"
}

const SETTINGS_COL = "settings";

// ── Store Settings ────────────────────────────────────────────────────────────

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName:    "NK Fashion Store",
  phone:        "071 017 9823",
  email:        "nimzkp@gmail.com",
  location:     "Tangalle, Sri Lanka",
  facebookUrl:  "https://www.facebook.com/share/1cNJSsvhvH/",
  tiktokUrl:    "https://www.tiktok.com/@nimzkp?_r=1&_t=ZS-98qJIUVgBrp",
  deliveryFee:  350,
  deliveryNote: "Free island-wide delivery via courier — Cash on Delivery available",
  responseTime: "We respond to all messages within 24 hours",
};

export const DEFAULT_CONTENT_SETTINGS: ContentSettings = {
  heroHeading:        "Timeless Style,\nSri Lankan Made",
  heroSubtext:        "Curated fashion for women, men & kids — from everyday elegance to festive ethnic wear.",
  ctaText:            "Free island-wide delivery via courier — Cash on Delivery available",
  featuredProductIds: [],
};

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const snap = await getDoc(doc(db, SETTINGS_COL, "general"));
    if (!snap.exists()) return DEFAULT_STORE_SETTINGS;
    return { ...DEFAULT_STORE_SETTINGS, ...snap.data() } as StoreSettings;
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}

export async function saveStoreSettings(data: StoreSettings): Promise<void> {
  await setDoc(doc(db, SETTINGS_COL, "general"), data);
}

// ── Content Settings ──────────────────────────────────────────────────────────

export async function getContentSettings(): Promise<ContentSettings> {
  try {
    const snap = await getDoc(doc(db, SETTINGS_COL, "content"));
    if (!snap.exists()) return DEFAULT_CONTENT_SETTINGS;
    return { ...DEFAULT_CONTENT_SETTINGS, ...snap.data() } as ContentSettings;
  } catch {
    return DEFAULT_CONTENT_SETTINGS;
  }
}

export async function saveContentSettings(data: ContentSettings): Promise<void> {
  await setDoc(doc(db, SETTINGS_COL, "content"), data);
}
