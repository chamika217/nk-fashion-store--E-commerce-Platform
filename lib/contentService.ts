import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ContentSettings {
  featuredProductIds: string[]; // up to 8 product IDs shown in "New Arrivals"
  heroHeading:        string;   // main hero heading text
  heroSubheading:     string;   // hero subheading text
  heroCtaLabel:       string;   // "Shop Now" button text
}

export const DEFAULT_CONTENT: ContentSettings = {
  featuredProductIds: [],
  heroHeading:        "Timeless Style,\nSri Lankan Made",
  heroSubheading:     "Curated fashion for women, men & kids — from everyday elegance to festive ethnic wear.",
  heroCtaLabel:       "Shop Now",
};

const CONTENT_DOC = "settings/content";

export async function getContent(): Promise<ContentSettings> {
  try {
    const snap = await getDoc(doc(db, CONTENT_DOC));
    if (snap.exists()) {
      return { ...DEFAULT_CONTENT, ...(snap.data() as Partial<ContentSettings>) };
    }
  } catch {
    // Return defaults on error
  }
  return DEFAULT_CONTENT;
}

export async function saveContent(data: Partial<ContentSettings>): Promise<void> {
  await setDoc(doc(db, CONTENT_DOC), data, { merge: true });
}
