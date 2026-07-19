import { useState, useRef, useEffect } from "react";
import {
  Heart, ShoppingBag, User, Search, Check, X,
  Camera, Upload, Sparkles, Home, Gem, Star,
  Bot, Users, Send, Link2, Copy, Monitor, UserPlus, MessageSquare,
  Shirt, Zap, RefreshCw, CalendarDays, BookOpen,
  ChevronLeft, ChevronRight, Plus, Trash2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = "All" | "Tops" | "Bottoms" | "Outerwear" | "Shoes" | "Accessories";
type WearableCategory = "Tops" | "Bottoms" | "Outerwear" | "Shoes";
type AvatarSlot = "top" | "bottom" | "outerwear" | "shoes";
type Tab = "home" | "calendar" | "closet" | "favorites" | "styling" | "stylist" | "lookbook";
type StylistMode = "ai" | "friend";
type ViewSide = "front" | "back";
type HairStyle = "none" | "bob" | "long" | "bun" | "pixie" | "curly" | "waves" | "ponytail";
type TimeSlot = "morning" | "afternoon" | "evening";

type ClosetItem = {
  id: number; name: string; brand: string;
  category: Exclude<Category, "All">;
  color: string; price: string; image: string; tags: string[];
};

type AvatarOutfit = Record<AvatarSlot, ClosetItem | null>;
type BodyParams = { bust: number; waist: number; leg: number; height: number };

type CalendarEntry = {
  label: string;       // event name
  itemIds: number[];   // closet item ids assigned to this slot
};

type WeekPlan = Record<string, CalendarEntry>; // key: "${dayIdx}-${timeSlot}"

type TrendingLook = {
  id: number; name: string; stylist: string;
  rating: number; votes: number; image: string; tag: string;
};

type TopStylist = {
  id: number; name: string; handle: string; score: number;
  outfits: number; diamonds: number; avatar: string; location: string; vip: boolean;
};

type OutfitRec = {
  id: number; name: string; description: string; reason: string;
  mood: string; season: string; slots: Partial<Record<AvatarSlot, number>>;
};

// ─── Data ────────────────────────────────────────────────────────────────────

const closetItems: ClosetItem[] = [
  { id: 1,  name: "Structured Wool Blazer",  brand: "COS",            category: "Outerwear",  color: "#4A3728", price: "$320", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop&auto=format", tags: ["wool","formal","autumn"] },
  { id: 2,  name: "Wide-Leg Linen Trousers", brand: "Arket",          category: "Bottoms",    color: "#C8B89A", price: "$140", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop&auto=format", tags: ["linen","casual","summer"] },
  { id: 3,  name: "Merino Turtleneck",       brand: "Uniqlo",         category: "Tops",       color: "#2C3E50", price: "$80",  image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=500&fit=crop&auto=format", tags: ["merino","winter","smart"] },
  { id: 4,  name: "Chelsea Boots",           brand: "Dr. Martens",    category: "Shoes",      color: "#1C1209", price: "$190", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop&auto=format", tags: ["leather","autumn","everyday"] },
  { id: 5,  name: "Silk Midi Dress",         brand: "& Other Stories", category: "Tops",      color: "#C4A882", price: "$220", image: "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=400&h=500&fit=crop&auto=format", tags: ["silk","occasion","summer"] },
  { id: 6,  name: "Slim Straight Jeans",     brand: "Acne Studios",   category: "Bottoms",    color: "#2B4A6F", price: "$260", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=500&fit=crop&auto=format", tags: ["denim","everyday","all-season"] },
  { id: 7,  name: "Cashmere Cardigan",       brand: "Everlane",       category: "Tops",       color: "#8B7355", price: "$180", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop&auto=format", tags: ["cashmere","cozy","autumn"] },
  { id: 8,  name: "Leather Tote Bag",        brand: "Mansur Gavriel", category: "Accessories",color: "#5C3D2E", price: "$490", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop&auto=format", tags: ["leather","everyday","minimal"] },
  { id: 9,  name: "Chunky Knit Sweater",     brand: "Mango",          category: "Tops",       color: "#D4C4A8", price: "$95",  image: "https://images.unsplash.com/photo-1610041321420-a596dd14ebc9?w=400&h=500&fit=crop&auto=format", tags: ["knit","winter","cozy"] },
  { id: 10, name: "Tapered Trousers",        brand: "Theory",         category: "Bottoms",    color: "#2F2F2F", price: "$295", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop&auto=format", tags: ["tailored","formal","all-season"] },
  { id: 11, name: "Ballet Flats",            brand: "Reformation",    category: "Shoes",      color: "#C4957A", price: "$148", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop&auto=format", tags: ["leather","everyday","spring"] },
  { id: 12, name: "Trench Coat",             brand: "Totème",         category: "Outerwear",  color: "#C8A96E", price: "$680", image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop&auto=format", tags: ["cotton","classic","autumn"] },
];

const TRENDING_LOOKS: TrendingLook[] = [
  { id: 1, name: "Midnight in Milan",  stylist: "@velvet.noir",  rating: 9.8, votes: 4231, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=320&h=420&fit=crop&auto=format", tag: "Evening" },
  { id: 2, name: "Golden Afternoon",   stylist: "@laurel.lux",   rating: 9.7, votes: 3812, image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=320&h=420&fit=crop&auto=format", tag: "Casual Luxe" },
  { id: 3, name: "Crimson Coast",      stylist: "@maison.mio",   rating: 9.6, votes: 3405, image: "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=320&h=420&fit=crop&auto=format", tag: "Summer" },
  { id: 4, name: "Urban Silk",         stylist: "@edit.studio",  rating: 9.5, votes: 2994, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=320&h=420&fit=crop&auto=format", tag: "Street" },
  { id: 5, name: "Blush & Bone",       stylist: "@ines.minimal", rating: 9.4, votes: 2650, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=320&h=420&fit=crop&auto=format", tag: "Minimal" },
  { id: 6, name: "Dusk Velvet",        stylist: "@chloe.wraith", rating: 9.3, votes: 2210, image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=320&h=420&fit=crop&auto=format", tag: "Autumn" },
];

const TOP_STYLISTS: TopStylist[] = [
  { id: 1, name: "Isabella Kaine",   handle: "@velvet.noir",  score: 98.7, outfits: 142, diamonds: 284500, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&auto=format", location: "Milan, IT",      vip: true },
  { id: 2, name: "Laurel Chen",      handle: "@laurel.lux",   score: 97.9, outfits: 118, diamonds: 231200, avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&auto=format", location: "Paris, FR",      vip: true },
  { id: 3, name: "Mia Sorenson",     handle: "@maison.mio",   score: 97.2, outfits: 96,  diamonds: 178400, avatar: "https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=120&h=120&fit=crop&auto=format", location: "Copenhagen, DK", vip: true },
  { id: 4, name: "Yuki Tanaka",      handle: "@edit.studio",  score: 96.8, outfits: 211, diamonds: 156800, avatar: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=120&h=120&fit=crop&auto=format", location: "Tokyo, JP",      vip: false },
  { id: 5, name: "Inés Villanueva",  handle: "@ines.minimal", score: 96.1, outfits: 87,  diamonds: 134200, avatar: "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=120&h=120&fit=crop&auto=format", location: "Madrid, ES",     vip: false },
];

const OUTFIT_RECS: OutfitRec[] = [
  { id: 1, name: "Sharp Monday",   description: "Office-ready tailoring",    reason: "The turtleneck and charcoal trousers form a sleek column. Chelsea boots add edge without breaking formality.", mood: "Professional", season: "Autumn", slots: { top: 3, bottom: 10, shoes: 4, outerwear: 1 } },
  { id: 2, name: "Linen Weekend",  description: "Effortless warm-weather ease", reason: "Pale linen and chunky knit balance relaxed and considered. Ballet flats ground it without effort.", mood: "Casual", season: "Summer", slots: { top: 9, bottom: 2, shoes: 11 } },
  { id: 3, name: "Golden Hour",    description: "Warm amber autumn evening", reason: "The cardigan and trench share the same amber register. Linen trousers keep the warmth light.", mood: "Evening", season: "Autumn", slots: { top: 7, bottom: 2, shoes: 11, outerwear: 12 } },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const SLOT_CATEGORIES: Record<AvatarSlot, WearableCategory> = { top: "Tops", bottom: "Bottoms", outerwear: "Outerwear", shoes: "Shoes" };
const CATEGORIES: Category[] = ["All", "Tops", "Bottoms", "Outerwear", "Shoes", "Accessories"];
const DEFAULT_BODY: BodyParams = { bust: 50, waist: 50, leg: 50, height: 50 };
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS: { key: TimeSlot; label: string; sub: string }[] = [
  { key: "morning",   label: "Morning",   sub: "AM" },
  { key: "afternoon", label: "Afternoon", sub: "PM" },
  { key: "evening",   label: "Evening",   sub: "Eve" },
];
const WEEK_START = new Date(2026, 6, 13); // Mon 13 Jul 2026

function weekDayDate(dayIdx: number) {
  const d = new Date(WEEK_START);
  d.setDate(d.getDate() + dayIdx);
  return d.getDate();
}

const INITIAL_WEEK: WeekPlan = {
  "0-morning":   { label: "Team standup", itemIds: [3, 10, 4] },
  "0-afternoon": { label: "Client lunch", itemIds: [1, 10, 4] },
  "2-morning":   { label: "Work from home", itemIds: [9, 6, 11] },
  "3-evening":   { label: "Gallery opening", itemIds: [5, 11] },
  "4-morning":   { label: "Friday office", itemIds: [7, 2, 11] },
  "5-afternoon": { label: "Brunch with Anya", itemIds: [9, 6, 4] },
  "5-evening":   { label: "Dinner date", itemIds: [5, 11] },
  "6-afternoon": { label: "Sunday market", itemIds: [7, 2, 11] },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shade(hex: string, pct: number): string {
  if (!hex?.startsWith("#")) return hex ?? "#888";
  const n = parseInt(hex.slice(1), 16);
  if (isNaN(n)) return hex;
  const a = Math.round(2.55 * pct);
  const R = Math.min(255, Math.max(0, (n >> 16) + a));
  const G = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + a));
  const B = Math.min(255, Math.max(0, (n & 0xff) + a));
  return "#" + ((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1);
}

function getItem(id: number) { return closetItems.find(i => i.id === id) ?? null; }

// ─── Mannequin geometry ───────────────────────────────────────────────────────

function getMannequin(p: BodyParams) {
  const bN = (p.bust - 50) / 50, wN = (p.waist - 50) / 50, lN = (p.leg - 50) / 50, hN = (p.height - 50) / 50;
  const cx = 100;
  // Head — refined oval, slightly narrower
  const headCY = 29, headRX = 18, headRY = 24;
  // Neck — longer, more elegant
  const neckTopY = headCY + headRY - 5, neckBotY = neckTopY + 26, neckHW = 7;
  // Shoulders
  const shoulderY = neckBotY + 1, shoulderHW = 58;
  // Bust
  const bustY = shoulderY + 48 + hN * 8, bustHW = 46 + bN * 12;
  // Waist — narrow hourglass (matching ~25 cm real)
  const waistY = bustY + 58 + hN * 8, waistHW = 25 + wN * 8;
  // Hips — pronounced
  const hipY = waistY + 42 + hN * 6, hipHW = 56 + bN * 3;
  // Legs — much wider, realistic proportions
  const crotchY = hipY + 18;
  const legLen = 240 + hN * 28 + lN * 88;
  const kneeY = hipY + legLen * 0.46, ankleY = hipY + legLen, baseY = ankleY + 20;
  const thighHW = 44 + lN * 10, kneeHW = 22 + lN * 4, ankleHW = 12, legG = 1.5;
  const armTopY = shoulderY - 2, armBotY = hipY + 16 + hN * 5, vbH = baseY + 28;
  return { cx, headCY, headRX, headRY, neckTopY, neckBotY, neckHW, shoulderY, shoulderHW, bustY, bustHW, waistY, waistHW, hipY, hipHW, crotchY, kneeY, ankleY, baseY, thighHW, kneeHW, ankleHW, legG, armTopY, armBotY, vbH };
}
type M = ReturnType<typeof getMannequin>;

function torsoD(m: M, endY: number, xPad = 0) {
  const { cx: x, neckHW, neckBotY, shoulderHW, shoulderY, bustHW, bustY, waistHW, waistY, hipHW } = m;
  // Natural shoulder sweep, pronounced waist, hip flare
  return [
    `M ${x - neckHW} ${neckBotY}`,
    `C ${x - shoulderHW - xPad} ${shoulderY - 4} ${x - shoulderHW - xPad + 5} ${shoulderY + 14} ${x - bustHW - xPad} ${bustY}`,
    `C ${x - bustHW - xPad} ${bustY + 24} ${x - waistHW - xPad} ${waistY - 16} ${x - waistHW - xPad} ${waistY}`,
    `C ${x - waistHW - xPad} ${waistY + 18} ${x - hipHW - xPad} ${endY - 18} ${x - hipHW - xPad} ${endY}`,
    `L ${x + hipHW + xPad} ${endY}`,
    `C ${x + hipHW + xPad} ${endY - 18} ${x + waistHW + xPad} ${waistY + 18} ${x + waistHW + xPad} ${waistY}`,
    `C ${x + waistHW + xPad} ${waistY - 16} ${x + bustHW + xPad} ${bustY + 24} ${x + bustHW + xPad} ${bustY}`,
    `C ${x + shoulderHW + xPad - 5} ${shoulderY + 14} ${x + shoulderHW + xPad} ${shoulderY - 4} ${x + neckHW} ${neckBotY}`,
    `Z`,
  ].join(" ");
}

function leftLegD(m: M, topY: number) {
  const { cx: x, hipHW, thighHW, kneeHW, ankleHW, legG, crotchY, kneeY, ankleY, baseY } = m;
  const ot = x - thighHW - legG, ok = x - kneeHW - legG, oa = x - ankleHW - legG, it = x - legG;
  const midY = (crotchY + kneeY) / 2;
  return [
    `M ${x - hipHW} ${topY}`,
    // Outer: hip → thigh flows smoothly downward (no outward bump — thighHW is close to hipHW)
    `C ${x - hipHW} ${topY + 28} ${ot - 3} ${crotchY - 10} ${ot} ${crotchY}`,
    // Outer thigh curves in gently to knee
    `C ${ot - 1} ${midY + 8} ${ok - 2} ${kneeY - 18} ${ok} ${kneeY}`,
    // Knee to ankle
    `C ${ok} ${kneeY + 16} ${oa} ${ankleY - 16} ${oa} ${ankleY}`,
    `L ${oa} ${baseY} L ${it} ${baseY} L ${it} ${ankleY}`,
    // Inner: slight inner curve up the leg
    `C ${it} ${ankleY - 16} ${it + 2} ${kneeY + 16} ${it} ${kneeY}`,
    `C ${it + 1} ${midY} ${it + 2} ${crotchY + 12} ${it} ${crotchY}`,
    // Groin arc back to hip — smooth close
    `C ${it} ${crotchY - 12} ${x - hipHW + 14} ${topY + 6} ${x - hipHW} ${topY}`,
    `Z`,
  ].join(" ");
}

function rightLegD(m: M, topY: number) {
  const { cx: x, hipHW, thighHW, kneeHW, ankleHW, legG, crotchY, kneeY, ankleY, baseY } = m;
  const ot = x + thighHW + legG, ok = x + kneeHW + legG, oa = x + ankleHW + legG, it = x + legG;
  const midY = (crotchY + kneeY) / 2;
  return [
    `M ${x + hipHW} ${topY}`,
    `C ${x + hipHW} ${topY + 28} ${ot + 3} ${crotchY - 10} ${ot} ${crotchY}`,
    `C ${ot + 1} ${midY + 8} ${ok + 2} ${kneeY - 18} ${ok} ${kneeY}`,
    `C ${ok} ${kneeY + 16} ${oa} ${ankleY - 16} ${oa} ${ankleY}`,
    `L ${oa} ${baseY} L ${it} ${baseY} L ${it} ${ankleY}`,
    `C ${it} ${ankleY - 16} ${it - 2} ${kneeY + 16} ${it} ${kneeY}`,
    `C ${it - 1} ${midY} ${it - 2} ${crotchY + 12} ${it} ${crotchY}`,
    `C ${it} ${crotchY - 12} ${x + hipHW - 14} ${topY + 6} ${x + hipHW} ${topY}`,
    `Z`,
  ].join(" ");
}

function armD(m: M, side: "left" | "right") {
  const { armTopY, armBotY, shoulderHW, cx: x } = m;
  const d = side === "left" ? -1 : 1;
  const elbowY = armTopY + (armBotY - armTopY) * 0.50;

  // Inner edge tucks 10px INSIDE the torso so the torso covers the join — no gap
  // Outer edge defines visible arm width: 13 at shoulder tapering to 8 at wrist
  const iTop   = x + d * (shoulderHW + 10);    // deeply under torso at shoulder
  const iElbow = x + d * (shoulderHW + 4);     // tracks torso inward at elbow
  const iBot   = x + d * (shoulderHW + 2);     // near hip
  const oTop   = x + d * (shoulderHW + 13);    // outer at shoulder
  const oElbow = x + d * (shoulderHW + 11);    // outer at elbow
  const oBot   = x + d * (shoulderHW + 8);     // outer at wrist (taper)

  return [
    `M ${iTop} ${armTopY}`,
    `C ${iTop} ${armTopY + 32} ${iElbow} ${elbowY - 18} ${iElbow} ${elbowY}`,
    `C ${iElbow} ${elbowY + 22} ${iBot} ${armBotY - 20} ${iBot} ${armBotY}`,
    `L ${oBot} ${armBotY}`,
    `C ${oBot} ${armBotY - 20} ${oElbow} ${elbowY + 22} ${oElbow} ${elbowY}`,
    `C ${oElbow} ${elbowY - 18} ${oTop} ${armTopY + 32} ${oTop} ${armTopY}`,
    `Z`,
  ].join(" ");
}

// ─── Hair styles ─────────────────────────────────────────────────────────────

const HAIR_STYLES: { id: HairStyle; label: string; emoji: string }[] = [
  { id: "none",     label: "Bald",      emoji: "○" },
  { id: "pixie",    label: "Pixie",     emoji: "◠" },
  { id: "bob",      label: "Bob",       emoji: "⌒" },
  { id: "bun",      label: "Bun",       emoji: "●" },
  { id: "ponytail", label: "Ponytail",  emoji: "↑" },
  { id: "waves",    label: "Waves",     emoji: "∿" },
  { id: "long",     label: "Long",      emoji: "↓" },
  { id: "curly",    label: "Curly",     emoji: "ꩧ" },
];

// Returns SVG elements for front-view hair given mannequin geometry
function HairFront({ m, style, color }: { m: M; style: HairStyle; color: string }) {
  const { cx, headCY, headRX, headRY } = m;
  const top = headCY - headRY;       // crown
  const bot = headCY + headRY;       // chin level
  const mid = headCY;
  const dark = shade(color, -28);
  const light = shade(color, 18);

  if (style === "none") return null;

  if (style === "pixie") return (
    <g>
      {/* Tight cap covering crown and temples */}
      <path d={`M ${cx - headRX + 2} ${mid + 4} Q ${cx - headRX - 4} ${top + 6} ${cx - 6} ${top - 5} Q ${cx} ${top - 9} ${cx + 6} ${top - 5} Q ${cx + headRX + 4} ${top + 6} ${cx + headRX - 2} ${mid + 4} Q ${cx + headRX + 8} ${mid - 8} ${cx} ${top - 8} Q ${cx - headRX - 8} ${mid - 8} ${cx - headRX + 2} ${mid + 4} Z`} fill={color} />
      {/* Side texture lines */}
      <path d={`M ${cx - headRX - 2} ${mid - 4} Q ${cx - 10} ${top + 4} ${cx - 4} ${top - 6}`} stroke={dark} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d={`M ${cx + headRX + 2} ${mid - 4} Q ${cx + 10} ${top + 4} ${cx + 4} ${top - 6}`} stroke={dark} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
    </g>
  );

  if (style === "bob") return (
    <g>
      {/* Bob — falls to jaw level */}
      <path d={`M ${cx - headRX - 6} ${mid + 8} C ${cx - headRX - 9} ${top + 2} ${cx - 8} ${top - 10} ${cx} ${top - 11} C ${cx + 8} ${top - 10} ${cx + headRX + 9} ${top + 2} ${cx + headRX + 6} ${mid + 8} C ${cx + headRX + 8} ${bot - 8} ${cx + 12} ${bot + 4} ${cx} ${bot + 5} C ${cx - 12} ${bot + 4} ${cx - headRX - 8} ${bot - 8} ${cx - headRX - 6} ${mid + 8} Z`} fill={color} />
      {/* Highlight streak */}
      <path d={`M ${cx - 6} ${top - 10} Q ${cx - 4} ${mid} ${cx - 8} ${bot + 2}`} stroke={light} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.35" />
      {/* Part line */}
      <line x1={cx} y1={top - 11} x2={cx} y2={top + 5} stroke={dark} strokeWidth="0.8" opacity="0.4" />
    </g>
  );

  if (style === "bun") return (
    <g>
      {/* Hair pulled back — tight sides */}
      <path d={`M ${cx - headRX - 4} ${mid + 2} C ${cx - headRX - 6} ${top + 8} ${cx - 6} ${top - 8} ${cx} ${top - 9} C ${cx + 6} ${top - 8} ${cx + headRX + 6} ${top + 8} ${cx + headRX + 4} ${mid + 2}`} fill={color} stroke={color} strokeWidth="1" />
      {/* Bun circle on top */}
      <ellipse cx={cx} cy={top - 14} rx={12} ry={10} fill={color} />
      <ellipse cx={cx - 2} cy={top - 16} rx={5} ry={4} fill={light} opacity="0.3" />
      {/* Bun wrap stroke */}
      <ellipse cx={cx} cy={top - 14} rx={12} ry={10} fill="none" stroke={dark} strokeWidth="0.8" opacity="0.3" />
      <path d={`M ${cx - 8} ${top - 14} Q ${cx} ${top - 18} ${cx + 8} ${top - 14}`} stroke={dark} strokeWidth="0.8" fill="none" opacity="0.4" />
    </g>
  );

  if (style === "ponytail") return (
    <g>
      {/* Sides swept back */}
      <path d={`M ${cx - headRX - 4} ${mid + 2} C ${cx - headRX - 6} ${top + 8} ${cx - 6} ${top - 8} ${cx} ${top - 9} C ${cx + 6} ${top - 8} ${cx + headRX + 6} ${top + 8} ${cx + headRX + 4} ${mid + 2}`} fill={color} />
      {/* Ponytail up from crown */}
      <path d={`M ${cx - 7} ${top - 4} C ${cx - 10} ${top - 22} ${cx - 6} ${top - 38} ${cx} ${top - 46} C ${cx + 6} ${top - 38} ${cx + 10} ${top - 22} ${cx + 7} ${top - 4}`} fill={color} />
      {/* Hair tie */}
      <ellipse cx={cx} cy={top - 4} rx={7} ry={3} fill={dark} opacity="0.6" />
      {/* Highlight on tail */}
      <path d={`M ${cx - 2} ${top - 8} Q ${cx} ${top - 30} ${cx + 2} ${top - 44}`} stroke={light} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.35" />
    </g>
  );

  if (style === "waves") return (
    <g>
      {/* Wavy medium-length hair */}
      <path d={`M ${cx - headRX - 7} ${mid + 4} C ${cx - headRX - 9} ${top + 2} ${cx - 6} ${top - 11} ${cx} ${top - 12} C ${cx + 6} ${top - 11} ${cx + headRX + 9} ${top + 2} ${cx + headRX + 7} ${mid + 4} C ${cx + headRX + 10} ${mid + 28} ${cx + headRX + 4} ${bot + 12} ${cx + headRX - 2} ${bot + 22} C ${cx + headRX - 10} ${bot + 30} ${cx + 8} ${bot + 18} ${cx} ${bot + 24} C ${cx - 8} ${bot + 18} ${cx - headRX + 10} ${bot + 30} ${cx - headRX + 2} ${bot + 22} C ${cx - headRX - 4} ${bot + 12} ${cx - headRX - 10} ${mid + 28} ${cx - headRX - 7} ${mid + 4} Z`} fill={color} />
      {/* Wave strokes for texture */}
      <path d={`M ${cx - headRX - 4} ${mid + 20} Q ${cx - headRX + 2} ${mid + 32} ${cx - headRX - 6} ${mid + 44}`} stroke={dark} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.3" />
      <path d={`M ${cx + headRX + 4} ${mid + 20} Q ${cx + headRX - 2} ${mid + 32} ${cx + headRX + 6} ${mid + 44}`} stroke={dark} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.3" />
      {/* Highlight */}
      <path d={`M ${cx - 5} ${top - 11} Q ${cx - 3} ${mid} ${cx - 6} ${bot + 10}`} stroke={light} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.28" />
      {/* Center part */}
      <line x1={cx} y1={top - 12} x2={cx} y2={top + 8} stroke={dark} strokeWidth="0.8" opacity="0.35" />
    </g>
  );

  if (style === "long") return (
    <g>
      {/* Long straight hair — extends well past shoulders */}
      <path d={`M ${cx - headRX - 7} ${mid + 4} C ${cx - headRX - 9} ${top + 2} ${cx - 6} ${top - 12} ${cx} ${top - 13} C ${cx + 6} ${top - 12} ${cx + headRX + 9} ${top + 2} ${cx + headRX + 7} ${mid + 4} C ${cx + headRX + 12} ${mid + 40} ${cx + headRX + 8} ${bot + 40} ${cx + headRX + 4} ${bot + 70} C ${cx + headRX} ${bot + 90} ${cx + 8} ${bot + 80} ${cx} ${bot + 84} C ${cx - 8} ${bot + 80} ${cx - headRX} ${bot + 90} ${cx - headRX - 4} ${bot + 70} C ${cx - headRX - 8} ${bot + 40} ${cx - headRX - 12} ${mid + 40} ${cx - headRX - 7} ${mid + 4} Z`} fill={color} />
      {/* Highlight streaks */}
      <path d={`M ${cx - 5} ${top - 12} L ${cx - 7} ${bot + 80}`} stroke={light} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.25" />
      <path d={`M ${cx + 8} ${top - 8} L ${cx + 6} ${bot + 60}`} stroke={light} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.18" />
      {/* Center part */}
      <line x1={cx} y1={top - 13} x2={cx} y2={top + 10} stroke={dark} strokeWidth="0.9" opacity="0.35" />
    </g>
  );

  if (style === "curly") return (
    <g>
      {/* Big curly/afro volume */}
      <ellipse cx={cx} cy={headCY - 6} rx={headRX + 16} ry={headRY + 14} fill={color} />
      <ellipse cx={cx - headRX - 8} cy={headCY + 4} rx={12} ry={16} fill={color} />
      <ellipse cx={cx + headRX + 8} cy={headCY + 4} rx={12} ry={16} fill={color} />
      {/* Curl texture — small arcs */}
      {([[-18,-14],[-6,-20],[8,-18],[20,-12],[-22,0],[22,2],[-16,14],[16,12],[-8,20]] as [number,number][]).map(([dx, dy], i) => (
        <path key={i} d={`M ${cx + dx - 4} ${headCY + dy} Q ${cx + dx} ${headCY + dy - 5} ${cx + dx + 4} ${headCY + dy}`} stroke={dark} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.35" />
      ))}
      {/* Shine */}
      <ellipse cx={cx - 8} cy={headCY - 14} rx={8} ry={7} fill={light} opacity="0.22" />
    </g>
  );

  return null;
}

// Back-view hair (simplified silhouette)
function HairBack({ m, style, color }: { m: M; style: HairStyle; color: string }) {
  const { cx, headCY, headRX, headRY } = m;
  const top = headCY - headRY;
  const bot = headCY + headRY;
  const dark = shade(color, -24);
  const light = shade(color, 16);

  if (style === "none") return null;

  if (style === "pixie") return (
    <path d={`M ${cx - headRX - 4} ${headCY + 2} C ${cx - headRX - 6} ${top + 6} ${cx - 6} ${top - 7} ${cx} ${top - 8} C ${cx + 6} ${top - 7} ${cx + headRX + 6} ${top + 6} ${cx + headRX + 4} ${headCY + 2} Q ${cx + headRX + 8} ${headCY - 6} ${cx} ${top - 7} Q ${cx - headRX - 8} ${headCY - 6} ${cx - headRX - 4} ${headCY + 2} Z`} fill={color} />
  );

  if (style === "bob") return (
    <g>
      <path d={`M ${cx - headRX - 7} ${headCY + 6} C ${cx - headRX - 9} ${top + 2} ${cx - 6} ${top - 10} ${cx} ${top - 11} C ${cx + 6} ${top - 10} ${cx + headRX + 9} ${top + 2} ${cx + headRX + 7} ${headCY + 6} C ${cx + headRX + 9} ${bot - 4} ${cx + 12} ${bot + 6} ${cx} ${bot + 6} C ${cx - 12} ${bot + 6} ${cx - headRX - 9} ${bot - 4} ${cx - headRX - 7} ${headCY + 6} Z`} fill={color} />
      <path d={`M ${cx - 4} ${top - 10} Q ${cx - 3} ${headCY} ${cx - 5} ${bot + 4}`} stroke={light} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.28" />
    </g>
  );

  if (style === "bun") return (
    <g>
      <path d={`M ${cx - headRX - 5} ${headCY + 2} C ${cx - headRX - 7} ${top + 6} ${cx - 6} ${top - 8} ${cx} ${top - 9} C ${cx + 6} ${top - 8} ${cx + headRX + 7} ${top + 6} ${cx + headRX + 5} ${headCY + 2}`} fill={color} />
      <ellipse cx={cx} cy={top - 14} rx={12} ry={10} fill={color} />
      <ellipse cx={cx - 2} cy={top - 16} rx={5} ry={4} fill={light} opacity="0.28" />
    </g>
  );

  if (style === "ponytail") return (
    <g>
      <path d={`M ${cx - headRX - 5} ${headCY + 2} C ${cx - headRX - 7} ${top + 6} ${cx - 6} ${top - 8} ${cx} ${top - 9} C ${cx + 6} ${top - 8} ${cx + headRX + 7} ${top + 6} ${cx + headRX + 5} ${headCY + 2}`} fill={color} />
      {/* Ponytail flowing down the back */}
      <path d={`M ${cx - 8} ${top - 2} C ${cx - 12} ${bot + 20} ${cx - 10} ${bot + 50} ${cx - 6} ${bot + 80} L ${cx + 6} ${bot + 80} C ${cx + 10} ${bot + 50} ${cx + 12} ${bot + 20} ${cx + 8} ${top - 2}`} fill={color} />
      <ellipse cx={cx} cy={top - 1} rx={7} ry={3} fill={dark} opacity="0.55" />
      <path d={`M ${cx - 2} ${top + 4} Q ${cx} ${bot + 40} ${cx + 3} ${bot + 76}`} stroke={light} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
    </g>
  );

  if (style === "waves" || style === "long") {
    const ext = style === "long" ? 84 : 26;
    return (
      <g>
        <path d={`M ${cx - headRX - 8} ${headCY + 4} C ${cx - headRX - 10} ${top + 2} ${cx - 6} ${top - 12} ${cx} ${top - 13} C ${cx + 6} ${top - 12} ${cx + headRX + 10} ${top + 2} ${cx + headRX + 8} ${headCY + 4} C ${cx + headRX + 12} ${headCY + 30} ${cx + headRX + 6} ${bot + 20} ${cx + headRX} ${bot + ext} C ${cx + 8} ${bot + ext + 10} ${cx - 8} ${bot + ext + 10} ${cx - headRX} ${bot + ext} C ${cx - headRX - 6} ${bot + 20} ${cx - headRX - 12} ${headCY + 30} ${cx - headRX - 8} ${headCY + 4} Z`} fill={color} />
        <path d={`M ${cx - 5} ${top - 12} L ${cx - 7} ${bot + ext - 4}`} stroke={light} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.25" />
        {style === "waves" && (<>
          <path d={`M ${cx - headRX - 4} ${headCY + 22} Q ${cx - headRX + 2} ${headCY + 34} ${cx - headRX - 6} ${headCY + 46}`} stroke={dark} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.28" />
          <path d={`M ${cx + headRX + 4} ${headCY + 22} Q ${cx + headRX - 2} ${headCY + 34} ${cx + headRX + 6} ${headCY + 46}`} stroke={dark} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.28" />
        </>)}
      </g>
    );
  }

  if (style === "curly") return (
    <g>
      <ellipse cx={cx} cy={headCY - 6} rx={headRX + 16} ry={headRY + 14} fill={color} />
      <ellipse cx={cx - headRX - 8} cy={headCY + 4} rx={12} ry={16} fill={color} />
      <ellipse cx={cx + headRX + 8} cy={headCY + 4} rx={12} ry={16} fill={color} />
      {([[-16,-10],[6,-18],[20,-8],[-20,4],[22,6],[-12,16],[14,14]] as [number,number][]).map(([dx, dy], i) => (
        <path key={i} d={`M ${cx+dx-4} ${headCY+dy} Q ${cx+dx} ${headCY+dy-5} ${cx+dx+4} ${headCY+dy}`} stroke={dark} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.33" />
      ))}
    </g>
  );

  return null;
}

// ─── Mannequin components ─────────────────────────────────────────────────────

function MannequinFront({ body, outfit, facePhoto, hair = "none", hairColor = "#2C1810" }: { body: BodyParams; outfit: AvatarOutfit; facePhoto: string | null; hair?: HairStyle; hairColor?: string }) {
  const uid = useRef(`mf${Math.random().toString(36).slice(2, 6)}`).current;
  const m = getMannequin(body);
  const MC = "#C8A898"; // warm rose-beige skin — reads on light grey bg
  const MCS = shade(MC, -10);
  const { top, bottom, shoes, outerwear } = outfit;
  const tc = top?.color, btc = bottom?.color, sc = shoes?.color, oc = outerwear?.color;
  const topEnd = m.hipY + 9, botStart = m.hipY - 6;
  return (
    <svg viewBox={`0 0 200 ${Math.ceil(m.vbH)}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        {facePhoto && <clipPath id={`${uid}-fc`}><ellipse cx={m.cx} cy={m.headCY + 1} rx={m.headRX - 4} ry={m.headRY - 4} /></clipPath>}
        {/* Body left-light gradient */}
        <linearGradient id={`${uid}-bl`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="38%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.11)" />
        </linearGradient>
        <linearGradient id={`${uid}-ll`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
        </linearGradient>
      </defs>

      {/* ── Base body (draw arms behind torso) ── */}
      <path d={armD(m, "left")}  fill={MCS} />
      <path d={armD(m, "right")} fill={MCS} />
      <path d={leftLegD(m, m.hipY)}  fill={MC} />
      <path d={rightLegD(m, m.hipY)} fill={MC} />
      <path d={torsoD(m, m.hipY)} fill={MC} />
      {/* Neck — subtle taper */}
      <path d={`M ${m.cx - m.neckHW} ${m.neckTopY} Q ${m.cx - m.neckHW - 1} ${(m.neckTopY+m.neckBotY)/2} ${m.cx - m.neckHW} ${m.neckBotY} L ${m.cx + m.neckHW} ${m.neckBotY} Q ${m.cx + m.neckHW + 1} ${(m.neckTopY+m.neckBotY)/2} ${m.cx + m.neckHW} ${m.neckTopY} Z`} fill={MC} />
      {/* Head — smooth oval with chin taper */}
      <ellipse cx={m.cx} cy={m.headCY} rx={m.headRX} ry={m.headRY} fill={MC} />
      {/* Chin narrowing */}
      <ellipse cx={m.cx} cy={m.headCY + m.headRY - 5} rx={m.headRX - 5} ry={7} fill={shade(MC, -4)} />

      {/* ── Body shading ── */}
      <path d={torsoD(m, m.hipY)} fill={`url(#${uid}-bl)`} />
      <path d={leftLegD(m, m.hipY)}  fill={`url(#${uid}-ll)`} />
      <path d={rightLegD(m, m.hipY)} fill={`url(#${uid}-ll)`} />
      {/* Head highlight */}
      <ellipse cx={m.cx - 5} cy={m.headCY - 7} rx={9} ry={12} fill="rgba(255,255,255,0.20)" />
      {/* Collarbone */}
      <path d={`M ${m.cx - 20} ${m.neckBotY + 5} Q ${m.cx} ${m.neckBotY + 10} ${m.cx + 20} ${m.neckBotY + 5}`} stroke="rgba(0,0,0,0.06)" strokeWidth="1" fill="none" />

      {/* ── Hair (behind face features) ── */}
      <HairFront m={m} style={hair} color={hairColor} />

      {/* ── Face features ── */}
      {facePhoto
        ? <image href={facePhoto} x={m.cx - m.headRX} y={m.headCY - m.headRY} width={m.headRX * 2} height={m.headRY * 2} clipPath={`url(#${uid}-fc)`} preserveAspectRatio="xMidYMid slice" />
        : <>
            {/* Eyebrows — arched */}
            <path d={`M ${m.cx-12} ${m.headCY-9} Q ${m.cx-7} ${m.headCY-13} ${m.cx-2} ${m.headCY-9}`} stroke="rgba(60,20,30,0.28)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <path d={`M ${m.cx+2}  ${m.headCY-9} Q ${m.cx+7}  ${m.headCY-13} ${m.cx+12} ${m.headCY-9}`} stroke="rgba(60,20,30,0.28)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            {/* Eyes — almond */}
            <path d={`M ${m.cx-12} ${m.headCY-3} Q ${m.cx-7} ${m.headCY-7} ${m.cx-2} ${m.headCY-3} Q ${m.cx-7} ${m.headCY} ${m.cx-12} ${m.headCY-3} Z`} fill="rgba(40,15,20,0.30)" />
            <path d={`M ${m.cx+2}  ${m.headCY-3} Q ${m.cx+7}  ${m.headCY-7} ${m.cx+12} ${m.headCY-3} Q ${m.cx+7}  ${m.headCY} ${m.cx+2}  ${m.headCY-3} Z`} fill="rgba(40,15,20,0.30)" />
            {/* Eye shine */}
            <circle cx={m.cx - 9} cy={m.headCY - 4} r="1" fill="rgba(255,255,255,0.55)" />
            <circle cx={m.cx + 9} cy={m.headCY - 4} r="1" fill="rgba(255,255,255,0.55)" />
            {/* Nose — subtle */}
            <path d={`M ${m.cx-2} ${m.headCY+5} Q ${m.cx} ${m.headCY+9} ${m.cx+2} ${m.headCY+5}`} stroke="rgba(0,0,0,0.10)" strokeWidth="1" fill="none" strokeLinecap="round" />
            {/* Upper lip */}
            <path d={`M ${m.cx-7} ${m.headCY+12} Q ${m.cx-3} ${m.headCY+10} ${m.cx} ${m.headCY+11} Q ${m.cx+3} ${m.headCY+10} ${m.cx+7} ${m.headCY+12}`} stroke="rgba(170,70,90,0.45)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Lower lip */}
            <path d={`M ${m.cx-7} ${m.headCY+12} Q ${m.cx} ${m.headCY+16} ${m.cx+7} ${m.headCY+12}`} stroke="rgba(170,70,90,0.30)" strokeWidth="1.1" fill="rgba(200,110,130,0.09)" strokeLinecap="round" />
          </>
      }

      {/* ── Clothing ── */}
      {btc && (<>
        <path d={leftLegD(m, botStart)}  fill={btc} />
        <path d={rightLegD(m, botStart)} fill={btc} />
        <rect x={m.cx - m.hipHW} y={botStart} width={m.hipHW * 2} height={7} rx="2" fill={shade(btc, -18)} />
        <line x1={m.cx - m.hipHW + 4} y1={botStart + 3} x2={m.cx + m.hipHW - 4} y2={botStart + 3} stroke={shade(btc, 10)} strokeWidth="0.6" opacity="0.4" />
      </>)}
      {tc && (<>
        <path d={torsoD(m, topEnd)} fill={tc} />
        <path d={armD(m, "left")}  fill={shade(tc, -8)} />
        <path d={armD(m, "right")} fill={shade(tc, -8)} />
        <path d={`M ${m.cx-11} ${m.neckBotY+2} L ${m.cx} ${m.neckBotY+19} L ${m.cx+11} ${m.neckBotY+2}`} fill={tc} stroke={shade(tc, -22)} strokeWidth="1.2" strokeLinejoin="round" />
        <line x1={m.cx - m.hipHW + 6} y1={topEnd} x2={m.cx + m.hipHW - 6} y2={topEnd} stroke={shade(tc, -18)} strokeWidth="0.7" opacity="0.5" />
      </>)}
      {oc && (<>
        <path d={torsoD(m, topEnd + 22, 10)} fill={oc} />
        <path d={armD(m, "left")}  fill={shade(oc, -5)} />
        <path d={armD(m, "right")} fill={shade(oc, -5)} />
        <path d={`M ${m.cx-11} ${m.neckBotY} L ${m.cx - m.bustHW - 8} ${m.shoulderY+24} L ${m.cx-15} ${m.bustY+36} L ${m.cx-4} ${m.bustY+9} Z`} fill={shade(oc, 15)} />
        <path d={`M ${m.cx+11} ${m.neckBotY} L ${m.cx + m.bustHW + 8} ${m.shoulderY+24} L ${m.cx+15} ${m.bustY+36} L ${m.cx+4} ${m.bustY+9} Z`} fill={shade(oc, 15)} />
        <line x1={m.cx} y1={m.bustY+9} x2={m.cx} y2={topEnd+20} stroke={shade(oc, -20)} strokeWidth="0.8" opacity="0.6" />
        {[m.bustY+32, m.bustY+54, m.bustY+74].map(y => <circle key={y} cx={m.cx} cy={y} r="2" fill={shade(oc, -26)} opacity="0.75" />)}
      </>)}
      {sc && (<>
        {/* Shoe — pointed toe silhouette */}
        <path d={`M ${m.cx - m.ankleHW - m.legG} ${m.baseY - 10} C ${m.cx - m.ankleHW - m.legG - 12} ${m.baseY + 6} ${m.cx - m.legG - 20} ${m.baseY + 18} ${m.cx - m.legG - 8} ${m.baseY + 18} L ${m.cx - m.legG} ${m.baseY + 18} L ${m.cx - m.legG} ${m.baseY - 10} Z`} fill={sc} />
        <path d={`M ${m.cx + m.ankleHW + m.legG} ${m.baseY - 10} C ${m.cx + m.ankleHW + m.legG + 12} ${m.baseY + 6} ${m.cx + m.legG + 20} ${m.baseY + 18} ${m.cx + m.legG + 8} ${m.baseY + 18} L ${m.cx + m.legG} ${m.baseY + 18} L ${m.cx + m.legG} ${m.baseY - 10} Z`} fill={sc} />
        <line x1={m.cx - m.legG - 20} y1={m.baseY + 18} x2={m.cx - m.legG} y2={m.baseY + 18} stroke={shade(sc, -22)} strokeWidth="1.5" strokeLinecap="round" />
        <line x1={m.cx + m.legG} y1={m.baseY + 18} x2={m.cx + m.legG + 20} y2={m.baseY + 18} stroke={shade(sc, -22)} strokeWidth="1.5" strokeLinecap="round" />
      </>)}
    </svg>
  );
}

function MannequinBack({ body, outfit, hair = "none", hairColor = "#2C1810" }: { body: BodyParams; outfit: AvatarOutfit; hair?: HairStyle; hairColor?: string }) {
  const m = getMannequin(body);
  const MC = "#C8A898";
  const MCS = shade(MC, -10);
  const tc = outfit.top?.color, btc = outfit.bottom?.color, sc = outfit.shoes?.color, oc = outfit.outerwear?.color;
  const topEnd = m.hipY + 9, botStart = m.hipY - 6;
  return (
    <svg viewBox={`0 0 200 ${Math.ceil(m.vbH)}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Arms behind torso */}
      <path d={armD(m, "left")}  fill={MCS} />
      <path d={armD(m, "right")} fill={MCS} />
      <path d={leftLegD(m, m.hipY)}  fill={MC} />
      <path d={rightLegD(m, m.hipY)} fill={MC} />
      <path d={torsoD(m, m.hipY)} fill={MC} />
      <path d={`M ${m.cx - m.neckHW} ${m.neckTopY} Q ${m.cx - m.neckHW - 1} ${(m.neckTopY+m.neckBotY)/2} ${m.cx - m.neckHW} ${m.neckBotY} L ${m.cx + m.neckHW} ${m.neckBotY} Q ${m.cx + m.neckHW + 1} ${(m.neckTopY+m.neckBotY)/2} ${m.cx + m.neckHW} ${m.neckTopY} Z`} fill={MC} />
      <ellipse cx={m.cx} cy={m.headCY} rx={m.headRX} ry={m.headRY} fill={MC} />
      {/* Hair back view */}
      <HairBack m={m} style={hair} color={hairColor} />

      {/* Back body details */}
      {/* Spine line */}
      <line x1={m.cx} y1={m.neckBotY + 4} x2={m.cx} y2={m.hipY - 4} stroke="rgba(0,0,0,0.08)" strokeWidth="1.2" />
      {/* Shoulder blade left */}
      <path d={`M ${m.cx - 24} ${m.bustY - 22} Q ${m.cx - 14} ${m.bustY - 6} ${m.cx - 22} ${m.bustY + 4}`} stroke="rgba(0,0,0,0.07)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Shoulder blade right */}
      <path d={`M ${m.cx + 24} ${m.bustY - 22} Q ${m.cx + 14} ${m.bustY - 6} ${m.cx + 22} ${m.bustY + 4}`} stroke="rgba(0,0,0,0.07)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Lower back dimples */}
      <circle cx={m.cx - 8} cy={m.hipY - 10} r="2" fill="rgba(0,0,0,0.06)" />
      <circle cx={m.cx + 8} cy={m.hipY - 10} r="2" fill="rgba(0,0,0,0.06)" />
      {/* Back highlight */}
      <ellipse cx={m.cx} cy={m.bustY - 8} rx={9} ry={22} fill="rgba(255,255,255,0.13)" />

      {/* Clothing */}
      {btc && (<>
        <path d={leftLegD(m, botStart)}  fill={btc} />
        <path d={rightLegD(m, botStart)} fill={btc} />
        <rect x={m.cx - m.hipHW} y={botStart} width={m.hipHW * 2} height={7} rx="2" fill={shade(btc, -18)} />
      </>)}
      {tc && (<>
        <path d={torsoD(m, topEnd)} fill={tc} />
        <path d={armD(m, "left")}  fill={shade(tc, -8)} />
        <path d={armD(m, "right")} fill={shade(tc, -8)} />
        {/* Back neckline */}
        <path d={`M ${m.cx - m.neckHW - 2} ${m.neckBotY + 2} Q ${m.cx} ${m.neckBotY + 10} ${m.cx + m.neckHW + 2} ${m.neckBotY + 2}`} stroke={shade(tc, -20)} strokeWidth="1" fill={tc} />
      </>)}
      {oc && (<>
        <path d={torsoD(m, topEnd + 22, 10)} fill={oc} />
        <path d={armD(m, "left")}  fill={shade(oc, -5)} />
        <path d={armD(m, "right")} fill={shade(oc, -5)} />
        <path d={`M ${m.cx - 16} ${m.neckBotY} Q ${m.cx} ${m.neckBotY - 10} ${m.cx + 16} ${m.neckBotY}`} fill="none" stroke={shade(oc, -8)} strokeWidth="3" strokeLinecap="round" />
      </>)}
      {sc && (<>
        <path d={`M ${m.cx - m.ankleHW - m.legG} ${m.baseY - 10} C ${m.cx - m.ankleHW - m.legG - 12} ${m.baseY + 6} ${m.cx - m.legG - 20} ${m.baseY + 18} ${m.cx - m.legG - 8} ${m.baseY + 18} L ${m.cx - m.legG} ${m.baseY + 18} L ${m.cx - m.legG} ${m.baseY - 10} Z`} fill={sc} />
        <path d={`M ${m.cx + m.ankleHW + m.legG} ${m.baseY - 10} C ${m.cx + m.ankleHW + m.legG + 12} ${m.baseY + 6} ${m.cx + m.legG + 20} ${m.baseY + 18} ${m.cx + m.legG + 8} ${m.baseY + 18} L ${m.cx + m.legG} ${m.baseY + 18} L ${m.cx + m.legG} ${m.baseY - 10} Z`} fill={sc} />
      </>)}
    </svg>
  );
}

function buildOutfitFromItems(items: ClosetItem[]): AvatarOutfit {
  const out: AvatarOutfit = { top: null, bottom: null, outerwear: null, shoes: null };
  for (const item of items) {
    if (item.category === "Tops" && !out.top) out.top = item;
    else if (item.category === "Bottoms" && !out.bottom) out.bottom = item;
    else if (item.category === "Outerwear" && !out.outerwear) out.outerwear = item;
    else if (item.category === "Shoes" && !out.shoes) out.shoes = item;
  }
  return out;
}

// ─── Camera Modal ─────────────────────────────────────────────────────────────

function CameraModal({ onCapture, onClose }: { onCapture: (url: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  useEffect(() => {
    (async () => { try { const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }); streamRef.current = ms; if (videoRef.current) videoRef.current.srcObject = ms; } catch { setCameraError("Camera unavailable — upload a photo instead."); } })();
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);
  const capture = () => {
    const v = videoRef.current, c = canvasRef.current; if (!v || !c) return;
    c.width = 400; c.height = 400;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.translate(400, 0); ctx.scale(-1, 1); ctx.drawImage(v, 0, 0, 400, 400);
    setCaptured(c.toDataURL("image/jpeg", 0.88)); streamRef.current?.getTracks().forEach(t => t.stop());
  };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => { if (ev.target?.result) setCaptured(ev.target.result as string); }; r.readAsDataURL(f);
  };
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-xs" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-display font-semibold">Face Scan</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"><X size={15} /></button>
        </div>
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-muted mb-4">
          {captured ? <img src={captured} alt="Captured" className="w-full h-full object-cover" /> : cameraError ? <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground px-6 text-center"><Camera size={32} className="opacity-25" /><p className="text-xs">{cameraError}</p></div> : <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />}
          {!captured && !cameraError && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-40 h-52 border-2 border-primary/70 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" /></div>}
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-2">
          {captured ? (<><button onClick={() => setCaptured(null)} className="flex-1 py-2.5 text-xs font-mono border border-border rounded-xl hover:bg-muted transition-colors">Retake</button><button onClick={() => onCapture(captured)} className="flex-1 py-2.5 text-xs font-mono bg-primary text-primary-foreground rounded-xl">Use This</button></>) : cameraError ? <button onClick={() => fileRef.current?.click()} className="flex-1 py-2.5 text-xs font-mono bg-primary text-primary-foreground rounded-xl flex items-center justify-center gap-2"><Upload size={13} /> Upload</button> : (<><button onClick={() => fileRef.current?.click()} className="py-2.5 px-4 text-xs font-mono border border-border rounded-xl hover:bg-muted transition-colors"><Upload size={14} /></button><button onClick={capture} className="flex-1 py-2.5 text-xs font-mono bg-primary text-primary-foreground rounded-xl">Capture</button></>)}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

// ─── Outfit Calendar ──────────────────────────────────────────────────────────

type DetailEntry = { key: string; label: string; items: ClosetItem[]; timeLabel: string; dayLabel: string } | null;

function OutfitCalendar({ weekPlan, setWeekPlan }: {
  weekPlan: WeekPlan;
  setWeekPlan: React.Dispatch<React.SetStateAction<WeekPlan>>;
}) {
  // drag state
  const dragItemId = useRef<number | null>(null);
  const dragRecIds = useRef<number[] | null>(null);
  // editing label
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  // active drop target highlight
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  // detail modal
  const [detail, setDetail] = useState<DetailEntry>(null);

  function slotKey(day: number, time: TimeSlot) { return `${day}-${time}`; }

  function onDragStartItem(e: React.DragEvent, itemId: number) {
    dragItemId.current = itemId;
    dragRecIds.current = null;
    e.dataTransfer.effectAllowed = "copy";
  }

  function onDragStartRec(e: React.DragEvent, ids: number[]) {
    dragRecIds.current = ids;
    dragItemId.current = null;
    e.dataTransfer.effectAllowed = "copy";
  }

  function onDragOver(e: React.DragEvent, key: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDropTarget(key);
  }

  function onDrop(e: React.DragEvent, day: number, time: TimeSlot) {
    e.preventDefault();
    setDropTarget(null);
    const key = slotKey(day, time);
    setWeekPlan(prev => {
      const existing = prev[key] ?? { label: "", itemIds: [] };
      let newIds = [...existing.itemIds];
      if (dragRecIds.current) {
        newIds = dragRecIds.current;
      } else if (dragItemId.current !== null) {
        if (!newIds.includes(dragItemId.current)) newIds = [...newIds, dragItemId.current];
      }
      return { ...prev, [key]: { ...existing, itemIds: newIds } };
    });
    dragItemId.current = null;
    dragRecIds.current = null;
  }

  function removeItem(key: string, itemId: number) {
    setWeekPlan(prev => {
      const entry = prev[key]; if (!entry) return prev;
      const itemIds = entry.itemIds.filter(id => id !== itemId);
      if (itemIds.length === 0 && !entry.label) {
        const next = { ...prev }; delete next[key]; return next;
      }
      return { ...prev, [key]: { ...entry, itemIds } };
    });
  }

  function clearSlot(key: string) {
    setWeekPlan(prev => { const next = { ...prev }; delete next[key]; return next; });
  }

  function startEditLabel(key: string) {
    setEditingKey(key);
    setEditLabel(weekPlan[key]?.label ?? "");
  }

  function commitLabel(key: string) {
    const label = editLabel.trim();
    setWeekPlan(prev => {
      const existing = prev[key] ?? { label: "", itemIds: [] };
      if (!label && existing.itemIds.length === 0) { const next = { ...prev }; delete next[key]; return next; }
      return { ...prev, [key]: { ...existing, label } };
    });
    setEditingKey(null);
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Calendar grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-border shrink-0">
          <p className="text-[9px] tracking-[0.4em] font-mono uppercase text-primary mb-0.5">Week of July 13 — 19, 2026</p>
          <h2 className="text-xl font-display font-bold">Outfit Calendar</h2>
          <p className="text-[10px] font-mono text-muted-foreground mt-1">Drag outfits or items from the sidebar onto any day · click a slot to name the event</p>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Day header row */}
          <div className="grid grid-cols-[72px_repeat(7,1fr)] border-b border-border sticky top-0 bg-background z-10 shrink-0">
            <div className="border-r border-border" />
            {DAYS_SHORT.map((d, i) => {
              const date = weekDayDate(i);
              const isToday = i === 6; // Sunday Jul 19 = today
              return (
                <div key={d} className={`px-3 py-3 border-r border-border last:border-r-0 text-center ${isToday ? "bg-primary/8" : ""}`}>
                  <p className={`text-[10px] font-mono uppercase tracking-wider ${isToday ? "text-primary" : "text-muted-foreground"}`}>{d}</p>
                  <p className={`text-lg font-display font-bold mt-0.5 ${isToday ? "text-primary" : ""}`}>{date}</p>
                </div>
              );
            })}
          </div>

          {/* Time slot rows */}
          {TIME_SLOTS.map(({ key: time, label: timeLabel, sub }) => (
            <div key={time} className="grid grid-cols-[72px_repeat(7,1fr)] border-b border-border last:border-b-0 min-h-[160px]">
              {/* Time label */}
              <div className="border-r border-border flex flex-col items-center justify-start pt-3 gap-0.5">
                <p className="text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">{sub}</p>
                <p className="text-[8px] font-mono text-muted-foreground/50">{timeLabel}</p>
              </div>
              {/* Day cells */}
              {DAYS_SHORT.map((_, dayIdx) => {
                const key = slotKey(dayIdx, time);
                const entry = weekPlan[key];
                const isToday = dayIdx === 6;
                const isDrop = dropTarget === key;
                const items = (entry?.itemIds ?? []).map(id => getItem(id)).filter(Boolean) as ClosetItem[];
                return (
                  <div
                    key={dayIdx}
                    className={`relative border-r border-border last:border-r-0 p-2 transition-colors ${isToday ? "bg-primary/5" : ""} ${isDrop ? "bg-primary/15 ring-1 ring-inset ring-primary/60" : ""}`}
                    onDragOver={e => onDragOver(e, key)}
                    onDragLeave={() => setDropTarget(null)}
                    onDrop={e => onDrop(e, dayIdx, time)}
                  >
                    {entry ? (
                      <div className="h-full flex flex-col gap-1 group">
                        {/* Event name row */}
                        <div className="flex items-start justify-between gap-1">
                          {editingKey === key ? (
                            <input autoFocus value={editLabel} onChange={e => setEditLabel(e.target.value)} onBlur={() => commitLabel(key)} onKeyDown={e => e.key === "Enter" && commitLabel(key)} className="flex-1 text-[9px] font-mono bg-transparent border-b border-primary outline-none text-foreground min-w-0" />
                          ) : (
                            <button onClick={() => startEditLabel(key)} className="flex-1 text-left">
                              <p className="text-[9px] font-mono font-semibold text-foreground/80 leading-snug truncate hover:text-primary transition-colors">
                                {entry.label || <span className="text-muted-foreground italic">Add event…</span>}
                              </p>
                            </button>
                          )}
                          <button onClick={() => clearSlot(key)} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                            <Trash2 size={9} className="text-muted-foreground hover:text-destructive transition-colors" />
                          </button>
                        </div>

                        {/* Mannequin polaroid */}
                        {items.length > 0 && (
                          <button
                            onClick={() => setDetail({ key, label: entry.label, items, timeLabel: sub, dayLabel: `${DAYS_SHORT[dayIdx]}, Jul ${weekDayDate(dayIdx)}` })}
                            className="flex-1 flex items-center justify-center group/pol"
                          >
                            <div className="bg-[#F5F0E8] rounded-sm shadow-lg shadow-black/12 p-1.5 pb-6 relative w-full max-w-[84px] transition-transform duration-200 group-hover/pol:scale-105 group-hover/pol:shadow-xl">
                              <div className="aspect-[2/3] overflow-hidden rounded-sm bg-secondary/30">
                                <MannequinFront body={DEFAULT_BODY} outfit={buildOutfitFromItems(items)} facePhoto={null} />
                              </div>
                              <p className="absolute bottom-1 left-1 right-1 text-[6px] font-mono text-center text-foreground/50 truncate">{entry.label || sub}</p>
                              <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary/80 rounded-full flex items-center justify-center">
                                <span className="text-[5px] text-white font-bold">{items.length}</span>
                              </div>
                            </div>
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Empty slot — drop zone */
                      <button
                        onClick={() => startEditLabel(key)}
                        className={`w-full h-full min-h-[130px] flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed transition-all ${isDrop ? "border-primary text-primary" : "border-border/40 text-border hover:border-muted-foreground/30 hover:text-muted-foreground/40"}`}
                      >
                        <Plus size={14} />
                        {editingKey === key && (
                          <input
                            autoFocus
                            value={editLabel}
                            onChange={e => setEditLabel(e.target.value)}
                            onBlur={() => commitLabel(key)}
                            onKeyDown={e => e.key === "Enter" && commitLabel(key)}
                            placeholder="Event name…"
                            className="text-[9px] font-mono bg-transparent border-b border-primary outline-none text-foreground text-center w-20 placeholder:text-muted-foreground"
                            onClick={e => e.stopPropagation()}
                          />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Right sidebar — draggable outfits & items */}
      <div className="w-64 border-l border-border bg-card flex flex-col shrink-0 overflow-hidden">
        <div className="px-4 py-4 border-b border-border shrink-0">
          <p className="text-[8px] tracking-[0.3em] font-mono uppercase text-primary mb-0.5">Drag to calendar</p>
          <h3 className="text-sm font-display font-semibold">Outfits & Items</h3>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {/* Outfit bundles */}
          <div>
            <p className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Saved Looks</p>
            <div className="space-y-2">
              {OUTFIT_RECS.map(rec => {
                const recIds = Object.values(rec.slots) as number[];
                const recItems = recIds.map(id => getItem(id)).filter(Boolean) as ClosetItem[];
                return (
                  <div
                    key={rec.id}
                    draggable
                    onDragStart={e => onDragStartRec(e, recIds)}
                    className="flex gap-2 bg-muted/60 border border-border rounded-xl p-2.5 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors select-none"
                  >
                    <div className="flex gap-1 shrink-0">
                      {recItems.slice(0, 3).map(it => (
                        <div key={it.id} className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                          <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold truncate">{rec.name}</p>
                      <p className="text-[8px] font-mono text-muted-foreground">{rec.mood} · {recItems.length} pieces</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual items by category */}
          {(["Tops", "Bottoms", "Outerwear", "Shoes"] as WearableCategory[]).map(cat => {
            const items = closetItems.filter(i => i.category === cat);
            return (
              <div key={cat}>
                <p className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{cat}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={e => onDragStartItem(e, item.id)}
                      title={item.name}
                      className="w-14 h-14 rounded-xl overflow-hidden bg-muted border border-border cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors select-none shrink-0"
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setDetail(null)}>
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border">
              <div>
                <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-primary">{detail.dayLabel} · {detail.timeLabel}</p>
                <h3 className="text-xl font-display font-bold mt-0.5">{detail.label || "Outfit"}</h3>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{detail.items.length} pieces</p>
              </div>
              <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"><X size={14} /></button>
            </div>

            <div className="flex gap-5 p-6">
              {/* Polaroid */}
              <div className="shrink-0">
                <div className="bg-[#F5F0E8] rounded-sm shadow-xl p-2 pb-8 w-[110px] relative">
                  <div className="aspect-[2/3] overflow-hidden rounded-sm bg-secondary/30">
                    <MannequinFront body={DEFAULT_BODY} outfit={buildOutfitFromItems(detail.items)} facePhoto={null} />
                  </div>
                  <p className="absolute bottom-1.5 left-1 right-1 text-[7px] font-mono text-center text-foreground/50 truncate">{detail.label || detail.timeLabel}</p>
                </div>
              </div>

              {/* Pieces list */}
              <div className="flex-1 min-w-0 space-y-2.5 overflow-y-auto max-h-72">
                {detail.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-muted/50 rounded-xl p-2.5">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-mono text-muted-foreground">{item.brand} · {item.category}</p>
                      <p className="text-xs font-semibold truncate">{item.name}</p>
                      <p className="text-[9px] font-mono text-primary">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Lookbook Journal ─────────────────────────────────────────────────────────

const JOURNAL_QUOTES = [
  "Style is a way to say who you are without having to speak.",
  "Fashion is the armor to survive the reality of everyday life.",
  "Elegance is not about being noticed, it is about being remembered.",
  "Dress shabbily and they remember the dress; dress impeccably and they remember the woman.",
  "The joy of dressing is an art.",
  "In order to be irreplaceable, one must always be different.",
  "I don't do fashion. I am fashion.",
];

// Ruled line background for binder pages
function RuledLines({ count = 18, color = "rgba(0,0,0,0.05)" }: { count?: number; color?: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-full border-b" style={{ height: `${100 / count}%`, borderColor: color }} />
      ))}
    </div>
  );
}

function LookbookJournal({ weekPlan, body }: { weekPlan: WeekPlan; body: BodyParams }) {
  const [currentDay, setCurrentDay] = useState(0);
  const [currentEntry, setCurrentEntry] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const daysWithPlans = DAYS.map((name, i) => {
    const entries = TIME_SLOTS.map(({ key: t }) => {
      const k = `${i}-${t}`;
      const entry = weekPlan[k];
      return entry ? { time: t, ...entry } : null;
    }).filter(Boolean) as (CalendarEntry & { time: TimeSlot })[];
    return { name, shortName: DAYS_SHORT[i], date: weekDayDate(i), dayIdx: i, entries };
  });

  function goDay(dir: "left" | "right") {
    const next = dir === "right" ? Math.min(6, currentDay + 1) : Math.max(0, currentDay - 1);
    if (next === currentDay) return;
    setDirection(dir);
    setFlipping(true);
    setTimeout(() => { setCurrentDay(next); setCurrentEntry(0); setFlipping(false); }, 260);
  }

  function jumpDay(idx: number) {
    if (idx === currentDay) return;
    setDirection(idx > currentDay ? "right" : "left");
    setFlipping(true);
    setTimeout(() => { setCurrentDay(idx); setCurrentEntry(0); setFlipping(false); }, 260);
  }

  const day = daysWithPlans[currentDay];
  const isToday = currentDay === 6;
  const quote = JOURNAL_QUOTES[currentDay % JOURNAL_QUOTES.length];
  const allEntries = day.entries.filter(e => e.itemIds.length > 0);
  const entry = allEntries[currentEntry] ?? null;
  const entryItems = (entry?.itemIds ?? []).map(id => getItem(id)).filter(Boolean) as ClosetItem[];

  // Build outfit for the mannequin from the entry's items
  const mannequinOutfit: AvatarOutfit = { top: null, bottom: null, outerwear: null, shoes: null };
  entryItems.forEach(item => {
    const slotMap: Record<string, AvatarSlot> = { Tops: "top", Bottoms: "bottom", Outerwear: "outerwear", Shoes: "shoes" };
    const slot = slotMap[item.category];
    if (slot && !mannequinOutfit[slot]) mannequinOutfit[slot] = item;
  });

  const timeLabel = TIME_SLOTS.find(t => t.key === entry?.time)?.label ?? "";

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">

      {/* Day tabs */}
      <div className="px-6 py-3 border-b border-border flex items-center gap-2 shrink-0 overflow-x-auto scrollbar-hide bg-card/60">
        <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground mr-1 shrink-0">Week of July 13</span>
        <div className="w-px h-4 bg-border mx-1 shrink-0" />
        {daysWithPlans.map(({ shortName, date, dayIdx, entries }) => {
          const hasItems = entries.some(e => e.itemIds.length > 0);
          const active = dayIdx === currentDay;
          return (
            <button key={dayIdx} onClick={() => jumpDay(dayIdx)}
              className={`flex-none flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-xl transition-all duration-200 ${active ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "hover:bg-muted text-muted-foreground"}`}>
              <span className="text-[8px] font-mono uppercase tracking-wider">{shortName}</span>
              <span className="text-sm font-display font-bold leading-none">{date}</span>
              {hasItems && <span className={`w-1 h-1 rounded-full mt-0.5 ${active ? "bg-primary-foreground/50" : "bg-primary"}`} />}
            </button>
          );
        })}
      </div>

      {/* Binder spread */}
      <div className={`flex-1 overflow-hidden flex transition-all duration-[260ms] ${flipping ? (direction === "right" ? "-translate-x-6 opacity-0" : "translate-x-6 opacity-0") : "translate-x-0 opacity-100"}`}>

        {/* ── LEFT PAGE — mannequin sketch ── */}
        <div className="relative flex-none w-[42%] flex flex-col overflow-hidden border-r-4 border-border/60"
          style={{ background: "linear-gradient(to right, #FAFAFA 0%, #F5F5F7 85%, #EFEFF4 100%)" }}>
          {/* Spiral binding holes decoration */}
          <div className="absolute right-0 top-0 bottom-0 w-6 flex flex-col items-center justify-around pointer-events-none z-10">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full border-2 border-border/50 bg-background/80" />
            ))}
          </div>

          <RuledLines count={22} color="rgba(184,150,106,0.12)" />

          {/* Page corner label */}
          <div className="absolute top-5 left-6 z-10">
            <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-primary/60">Drop Loop</p>
            <p className="text-[10px] font-mono text-muted-foreground/40">Week 29 · 2026</p>
          </div>

          {/* Mannequin — full height, centered */}
          <div className="flex-1 flex items-center justify-center px-10 pt-14 pb-6">
            {entry ? (
              <div className="w-full max-w-[220px] h-full">
                <MannequinFront body={body} outfit={mannequinOutfit} facePhoto={null} />
              </div>
            ) : (
              /* Empty state — faint sketch figure outline */
              <div className="flex flex-col items-center gap-4 text-center opacity-20">
                <svg viewBox="0 0 200 520" className="w-36 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3">
                  <ellipse cx="100" cy="38" rx="22" ry="27" />
                  <line x1="100" y1="65" x2="100" y2="110" />
                  <line x1="60" y1="80" x2="140" y2="80" />
                  <line x1="100" y1="110" x2="70" y2="200" />
                  <line x1="100" y1="110" x2="130" y2="200" />
                  <line x1="70" y1="200" x2="65" y2="320" />
                  <line x1="130" y1="200" x2="135" y2="320" />
                </svg>
                <p className="text-xs font-mono text-muted-foreground">No outfit planned</p>
              </div>
            )}
          </div>

          {/* Day label at bottom left */}
          <div className="absolute bottom-6 left-6 z-10">
            <p className="text-4xl font-display font-bold text-foreground/10 leading-none uppercase tracking-widest">{day.shortName}</p>
            <p className="text-[9px] font-mono text-muted-foreground/40 mt-1">July {day.date}</p>
          </div>
        </div>

        {/* ── RIGHT PAGE — binder detail sheet ── */}
        <div className="flex-1 relative overflow-y-auto"
          style={{ background: "linear-gradient(to left, #FAFAFA 0%, #F5F5F7 85%, #EFEFF4 100%)" }}>
          <RuledLines count={22} color="rgba(92,130,176,0.12)" />

          {/* Champagne left margin line */}
          <div className="absolute top-0 bottom-0 left-16 w-px bg-primary/15 pointer-events-none" />

          <div className="relative z-10 px-8 pl-20 py-8 min-h-full flex flex-col">
            {entry ? (<>
              {/* Header — handwritten-feel */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <span className="text-[8px] font-mono uppercase tracking-[0.45em] text-primary/70">{isToday ? "Today · " : ""}{DAYS[currentDay]}, July {day.date}</span>
                    {allEntries.length > 1 && (
                      <div className="flex gap-1 mt-1.5">
                        {allEntries.map((_, i) => (
                          <button key={i} onClick={() => setCurrentEntry(i)} className={`text-[8px] font-mono px-2 py-0.5 rounded-full transition-all ${i === currentEntry ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                            {TIME_SLOTS.find(t => t.key === allEntries[i].time)?.sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right opacity-40">
                    <p className="text-[8px] font-mono text-muted-foreground">{currentEntry + 1} / {allEntries.length || 1}</p>
                  </div>
                </div>

                {/* Event name — big, airy */}
                <h2 className="text-3xl font-display font-bold leading-tight mt-3 mb-0.5">{entry.label || day.name}</h2>
                <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">{timeLabel} look · {entryItems.length} pieces</p>

                {/* Divider rule */}
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex-1 h-px bg-border/60" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  <div className="flex-1 h-px bg-border/60" />
                </div>
              </div>

              {/* Item polaroids */}
              <div className="flex flex-wrap gap-3 mb-6">
                {entryItems.map((item, i) => (
                  <div key={item.id} className="flex flex-col" style={{ transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (0.8 + i * 0.3)}deg)` }}>
                    {/* Polaroid card */}
                    <div className="bg-[#F5F0E8] border border-[rgba(0,0,0,0.06)] rounded-sm p-1.5 pb-7 shadow-md shadow-black/12 w-24">
                      <div className="aspect-[3/4] overflow-hidden rounded-sm bg-muted">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[7px] font-mono text-muted-foreground/70 text-center mt-1.5 leading-tight truncate px-0.5">{item.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Colour swatches row */}
              <div className="mb-5">
                <p className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-2">Palette</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {entryItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full border-2 border-border shadow-md" style={{ background: item.color }} />
                      <div>
                        <p className="text-[8px] font-mono text-muted-foreground/50">{item.brand}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outfit item list — like written notes */}
              <div className="flex-1 mb-6">
                <p className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-3">Outfit Notes</p>
                <div className="space-y-3">
                  {entryItems.map((item, i) => (
                    <div key={item.id} className="flex items-start gap-3">
                      {/* Bullet */}
                      <div className="w-4 h-4 rounded-full border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[7px] font-mono text-primary/60">{i + 1}</span>
                      </div>
                      <div className="flex-1 pb-3 border-b border-border/25 last:border-b-0">
                        <div className="flex items-baseline justify-between">
                          <p className="text-sm font-semibold leading-snug">{item.name}</p>
                          <p className="text-[9px] font-mono text-primary ml-3 shrink-0">{item.price}</p>
                        </div>
                        <p className="text-[9px] font-mono text-muted-foreground mt-0.5">{item.brand} · {item.category}</p>
                        <div className="flex gap-1 mt-1.5">
                          {item.tags.map(tag => (
                            <span key={tag} className="text-[7px] font-mono uppercase tracking-widest px-1.5 py-0.5 bg-muted/60 text-muted-foreground/60 rounded-full">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quote at bottom */}
              <div className="mt-auto pt-4 border-t border-border/30">
                <p className="text-[10px] italic text-muted-foreground/35 leading-relaxed">"{quote}"</p>
              </div>

            </>) : (
              /* Empty day right page */
              <div className="flex-1 flex flex-col items-start justify-center gap-4 py-16">
                <div className="w-12 h-px bg-primary/25" />
                <p className="text-2xl font-display font-light text-muted-foreground/25">{day.name}</p>
                <p className="text-[9px] font-mono text-muted-foreground/20 uppercase tracking-widest">No outfit planned for this day</p>
                <p className="text-xs italic text-muted-foreground/20 leading-relaxed max-w-xs mt-4">"{quote}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="px-8 py-3.5 border-t border-border flex items-center justify-between shrink-0 bg-card/40">
        <button onClick={() => goDay("left")} disabled={currentDay === 0}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-full text-xs font-mono hover:bg-muted transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
          <ChevronLeft size={12} /> {currentDay > 0 ? DAYS_SHORT[currentDay - 1] : ""}
        </button>
        <div className="flex gap-1.5 items-center">
          {DAYS.map((_, i) => (
            <button key={i} onClick={() => jumpDay(i)} className={`rounded-full transition-all duration-200 ${i === currentDay ? "w-5 h-2 bg-primary" : "w-2 h-2 bg-border hover:bg-muted-foreground"}`} />
          ))}
        </div>
        <button onClick={() => goDay("right")} disabled={currentDay === 6}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-full text-xs font-mono hover:bg-muted transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
          {currentDay < 6 ? DAYS_SHORT[currentDay + 1] : ""} <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Add Item Modal ───────────────────────────────────────────────────────────

type UserItem = {
  id: number; name: string; brand: string;
  category: Exclude<Category, "All">;
  color: string; price: string; image: string; tags: string[];
  userPhoto: true;
};

function AddItemModal({ onAdd, onClose }: {
  onAdd: (item: UserItem) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [step, setStep] = useState<"photo" | "details">("photo");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<Exclude<Category, "All">>("Tops");
  const [price, setPrice] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    if (step !== "photo" || photoUrl) return;
    (async () => {
      try {
        const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = ms;
        if (videoRef.current) videoRef.current.srcObject = ms;
      } catch { setCameraError("Camera unavailable — upload a photo instead."); }
    })();
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [step, photoUrl]);

  const capture = () => {
    const v = videoRef.current, c = canvasRef.current; if (!v || !c) return;
    c.width = v.videoWidth || 600; c.height = v.videoHeight || 800;
    c.getContext("2d")?.drawImage(v, 0, 0);
    setPhotoUrl(c.toDataURL("image/jpeg", 0.88));
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => { if (ev.target?.result) setPhotoUrl(ev.target.result as string); };
    r.readAsDataURL(f);
  };

  const submit = () => {
    if (!photoUrl || !name.trim()) return;
    const dominantColor = "#8B7355"; // placeholder — real apps would sample from image
    onAdd({
      id: Date.now(),
      name: name.trim(),
      brand: brand.trim() || "My Wardrobe",
      category,
      color: dominantColor,
      price: price.trim() || "—",
      image: photoUrl,
      tags: tag.trim() ? tag.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) : ["personal"],
      userPhoto: true,
    });
  };

  const CATS: Exclude<Category, "All">[] = ["Tops", "Bottoms", "Outerwear", "Shoes", "Accessories"];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-[8px] tracking-[0.35em] font-mono uppercase text-primary">Add to Closet</p>
            <h3 className="text-base font-display font-semibold mt-0.5">{step === "photo" ? "Take or Upload Photo" : "Item Details"}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"><X size={14} /></button>
        </div>

        {step === "photo" ? (
          <div className="p-5">
            {/* Camera / preview area */}
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-muted mb-4 border border-border">
              {photoUrl ? (
                <img src={photoUrl} alt="Captured" className="w-full h-full object-cover" />
              ) : cameraError ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground text-center px-6">
                  <Camera size={28} className="opacity-20" />
                  <p className="text-xs">{cameraError}</p>
                </div>
              ) : (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              )}

              {/* Capture frame overlay */}
              {!photoUrl && !cameraError && (
                <div className="absolute inset-4 border border-dashed border-white/25 rounded-xl pointer-events-none" />
              )}

              {/* Retake badge */}
              {photoUrl && (
                <button onClick={() => setPhotoUrl(null)} className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[9px] font-mono px-2.5 py-1.5 rounded-full hover:bg-black/80 transition-colors">
                  Retake
                </button>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-2">
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-4 py-2.5 border border-border rounded-full text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Upload size={12} /> Upload
              </button>
              {!photoUrl && !cameraError && (
                <button onClick={capture} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-full text-xs font-mono font-semibold hover:opacity-90 transition-opacity">
                  Capture
                </button>
              )}
              {(photoUrl || cameraError) && (
                <button
                  onClick={() => photoUrl && setStep("details")}
                  disabled={!photoUrl}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-full text-xs font-mono font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  Next →
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {/* Thumbnail */}
            <div className="flex gap-4 items-start mb-4">
              {photoUrl && <div className="w-20 h-24 rounded-xl overflow-hidden bg-muted border border-border shrink-0"><img src={photoUrl} alt="" className="w-full h-full object-cover" /></div>}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Item Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Linen Shirt" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Brand</label>
                  <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Zara" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">Category</label>
              <div className="flex gap-1.5 flex-wrap">
                {CATS.map(c => (
                  <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 text-[9px] font-mono rounded-full transition-all ${category === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground border border-border"}`}>{c}</button>
                ))}
              </div>
            </div>

            {/* Price & Tags */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Price paid</label>
                <input value={price} onChange={e => setPrice(e.target.value)} placeholder="$0" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">Tags</label>
                <input value={tag} onChange={e => setTag(e.target.value)} placeholder="casual, summer" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setStep("photo")} className="px-4 py-2.5 border border-border rounded-full text-xs font-mono text-muted-foreground hover:bg-muted transition-colors">← Back</button>
              <button onClick={submit} disabled={!name.trim()} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-full text-xs font-mono font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity">
                Add to Closet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Closet Card ──────────────────────────────────────────────────────────────

function ClosetCard({ item, isFavorite, onToggleFavorite }: { item: ClosetItem | UserItem; isFavorite: boolean; onToggleFavorite: (id: number) => void }) {
  const isShoe = item.category === "Shoes";

  if (isShoe) {
    return (
      /* Shoe cubby — flat shelf style, no hanger */
      <div className="group relative bg-card border border-border rounded-2xl overflow-hidden shadow-sm shadow-primary/6 hover:shadow-md hover:shadow-primary/12 hover:border-primary/30 transition-all duration-300">
        {/* Shelf ledge top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-secondary via-muted to-secondary" />
        {/* Shoe photo — landscape aspect, like a cubby */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-muted/30 to-secondary/50 flex items-end justify-center px-4 pt-3">
          <img src={item.image} alt={item.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md" />
          <button onClick={() => onToggleFavorite(item.id)} className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm ${isFavorite ? "bg-primary text-primary-foreground shadow-primary/30" : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground border border-border"}`}>
            <Heart size={11} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
        {/* Shelf ledge bottom */}
        <div className="h-px w-full bg-border/60" />
        <div className="px-3 py-2.5">
          <p className="text-[9px] text-muted-foreground font-mono truncate">{item.brand}</p>
          <div className="flex items-center justify-between gap-1 mt-0.5">
            <p className="text-xs font-semibold leading-snug truncate">{item.name}</p>
            <p className="text-[10px] font-mono text-primary shrink-0 font-semibold">{item.price}</p>
          </div>
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {item.tags.slice(0, 2).map(tag => <span key={tag} className="text-[7px] font-mono uppercase tracking-widest px-1.5 py-0.5 bg-secondary text-muted-foreground rounded-full">{tag}</span>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col items-center">
      {/* Hanger SVG */}
      <svg viewBox="0 0 120 48" className="w-full max-w-[140px] -mb-px" fill="none">
        <path d="M60 4 C60 4 64 4 66 8 C68 12 65 16 60 16" stroke="#B8966A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M60 16 C50 16 30 22 10 38" stroke="#7A6040" strokeWidth="2" strokeLinecap="round" />
        <path d="M60 16 C70 16 90 22 110 38" stroke="#7A6040" strokeWidth="2" strokeLinecap="round" />
        <circle cx="10" cy="38" r="3" fill="#B8966A" opacity="0.55" />
        <circle cx="110" cy="38" r="3" fill="#B8966A" opacity="0.55" />
      </svg>

      {/* Clothing item card hanging below hanger */}
      <div className="relative w-full bg-card border border-border rounded-b-2xl rounded-t-sm shadow-md shadow-primary/8 group-hover:shadow-lg group-hover:shadow-primary/15 transition-all duration-300 overflow-hidden">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary/40">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-2 left-2">
            <span className="text-[7px] tracking-[0.25em] font-mono uppercase bg-card/80 backdrop-blur-sm text-primary px-2 py-0.5 rounded-full border border-primary/15">{item.category}</span>
          </div>
          <button onClick={() => onToggleFavorite(item.id)} className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm ${isFavorite ? "bg-primary text-primary-foreground shadow-primary/30" : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground border border-border"}`}>
            <Heart size={11} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[9px] text-muted-foreground font-mono truncate">{item.brand}</p>
          <div className="flex items-center justify-between gap-1 mt-0.5">
            <p className="text-xs font-semibold leading-snug truncate">{item.name}</p>
            <p className="text-[10px] font-mono text-primary shrink-0 font-semibold">{item.price}</p>
          </div>
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {item.tags.slice(0, 2).map(tag => <span key={tag} className="text-[7px] font-mono uppercase tracking-widest px-1.5 py-0.5 bg-secondary text-muted-foreground rounded-full">{tag}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Body Sliders ─────────────────────────────────────────────────────────────

function BodySliders({ params, onChange }: { params: BodyParams; onChange: (p: BodyParams) => void }) {
  const sliders: { key: keyof BodyParams; label: string }[] = [
    { key: "bust", label: "Bust" }, { key: "waist", label: "Waist" }, { key: "leg", label: "Leg" }, { key: "height", label: "Height" },
  ];
  return (
    <div className="px-5 py-4 border-t border-border">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[8px] tracking-[0.3em] font-mono uppercase text-muted-foreground">Body Shape</p>
        <button onClick={() => onChange(DEFAULT_BODY)} className="text-[8px] font-mono text-primary hover:opacity-70 transition-opacity">Reset</button>
      </div>
      <div className="space-y-3">
        {sliders.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-muted-foreground w-11 shrink-0 uppercase tracking-wide">{label}</span>
            <div className="flex-1 flex items-center gap-2">
              <input type="range" min={0} max={100} value={params[key]} onChange={e => onChange({ ...params, [key]: parseInt(e.target.value) })} />
              <span className="text-[9px] font-mono text-muted-foreground w-6 text-right shrink-0">{params[key]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Styling Room ─────────────────────────────────────────────────────────────

const HAIR_COLORS = [
  { label: "Espresso", value: "#2C1810" },
  { label: "Brunette", value: "#4A2E1A" },
  { label: "Auburn",   value: "#7B3F1E" },
  { label: "Caramel",  value: "#A0522D" },
  { label: "Golden",   value: "#C8922A" },
  { label: "Blonde",   value: "#E8C97A" },
  { label: "Platinum", value: "#F0E8D0" },
  { label: "Silver",   value: "#A8A8B0" },
  { label: "Black",    value: "#0F0A0A" },
  { label: "Red",      value: "#9B2015" },
  { label: "Rose",     value: "#C8627A" },
  { label: "Lavender", value: "#8B7EC8" },
  { label: "Teal",     value: "#2A8B7A" },
];

function StylingRoom({ outfit, onWearItem, body, onBodyChange, hair, onHairChange, hairColor, onHairColorChange }: {
  outfit: AvatarOutfit; onWearItem: (item: ClosetItem) => void;
  body: BodyParams; onBodyChange: (p: BodyParams) => void;
  hair: HairStyle; onHairChange: (h: HairStyle) => void;
  hairColor: string; onHairColorChange: (c: string) => void;
}) {
  const [activeSlot, setActiveSlot] = useState<AvatarSlot>("top");
  const [viewSide, setViewSide] = useState<ViewSide>("front");
  const [facePhoto, setFacePhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const slotItems = closetItems.filter(i => i.category === SLOT_CATEGORIES[activeSlot]);
  const wornCount = Object.values(outfit).filter(Boolean).length;

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-80 border-r border-border flex flex-col shrink-0 bg-card">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <p className="text-[8px] tracking-[0.3em] font-mono uppercase text-primary">Styling Room</p>
            <h2 className="text-sm font-display font-semibold">Mannequin Preview</h2>
          </div>
          <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
            {(["front", "back"] as ViewSide[]).map(side => (
              <button key={side} onClick={() => setViewSide(side)} className={`px-3 py-1.5 text-[9px] font-mono capitalize rounded-md transition-all ${viewSide === side ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{side}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-3 gap-2 min-h-0">
          <div className="flex-1 w-full max-w-[160px] min-h-0">
            {viewSide === "front" ? <MannequinFront body={body} outfit={outfit} facePhoto={facePhoto} hair={hair} hairColor={hairColor} /> : <MannequinBack body={body} outfit={outfit} hair={hair} hairColor={hairColor} />}
          </div>
          <div className="text-center shrink-0">
            <p className="text-xs font-display font-semibold">My Look</p>
            <p className="text-[10px] font-mono text-muted-foreground">{wornCount} / 4 pieces</p>
          </div>
          {viewSide === "front" && (
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setShowCamera(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono bg-muted hover:bg-secondary text-muted-foreground hover:text-foreground rounded-full transition-colors border border-border">
                <Camera size={10} /> {facePhoto ? "Rescan" : "Scan Face"}
              </button>
              {facePhoto && <button onClick={() => setFacePhoto(null)} className="px-3 py-1.5 text-[9px] font-mono bg-muted rounded-full border border-border"><X size={10} /></button>}
            </div>
          )}
        </div>
        <BodySliders params={body} onChange={onBodyChange} />

        {/* ── Hair Picker ── */}
        <div className="px-5 py-4 border-t border-border shrink-0">
          <p className="text-[8px] tracking-[0.3em] font-mono uppercase text-muted-foreground mb-3">Hair Style</p>
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {HAIR_STYLES.map(h => (
              <button
                key={h.id}
                onClick={() => onHairChange(h.id)}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-center transition-all border ${hair === h.id ? "bg-primary/10 border-primary/40 text-primary" : "bg-muted/50 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                <span className="text-base leading-none">{h.emoji}</span>
                <span className="text-[7px] font-mono uppercase tracking-wide leading-none">{h.label}</span>
              </button>
            ))}
          </div>
          {hair !== "none" && (<>
            <p className="text-[8px] tracking-[0.3em] font-mono uppercase text-muted-foreground mb-2">Hair Color</p>
            <div className="flex flex-wrap gap-1.5">
              {HAIR_COLORS.map(hc => (
                <button
                  key={hc.value}
                  onClick={() => onHairColorChange(hc.value)}
                  title={hc.label}
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${hairColor === hc.value ? "border-primary shadow-md shadow-primary/30 scale-110" : "border-black/10 shadow-sm"}`}
                  style={{ background: hc.value }}
                />
              ))}
            </div>
          </>)}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider mr-1">Dress:</span>
          {(["outerwear", "top", "bottom", "shoes"] as AvatarSlot[]).map(slot => (
            <button key={slot} onClick={() => setActiveSlot(slot)} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full transition-all ${activeSlot === slot ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {slot}{outfit[slot] && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Curated Looks</p>
              <div className="grid grid-cols-3 gap-3">
                {OUTFIT_RECS.map(rec => {
                  const items = (Object.values(rec.slots) as number[]).map(id => getItem(id)).filter(Boolean) as ClosetItem[];
                  return (
                    <div key={rec.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/35 transition-all group cursor-pointer"
                      onClick={() => Object.entries(rec.slots).forEach(([s, id]) => { const it = getItem(id as number); if (it) onWearItem(it); })}>
                      <div className="flex h-20">{items.slice(0, 3).map((it, i) => <div key={i} className="flex-1 overflow-hidden bg-muted"><img src={it.image} alt={it.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>)}</div>
                      <div className="p-2.5"><p className="text-xs font-display font-semibold">{rec.name}</p><p className="text-[9px] text-muted-foreground">{rec.mood} · {rec.season}</p></div>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3 capitalize">{activeSlot} Items</p>
            <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {slotItems.map(item => {
                const isWorn = outfit[activeSlot]?.id === item.id;
                return (
                  <button key={item.id} onClick={() => onWearItem(item)} className={`relative group text-left rounded-xl overflow-hidden border transition-all ${isWorn ? "border-primary ring-1 ring-primary/50" : "border-border hover:border-primary/40"}`}>
                    <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {isWorn && <div className="absolute inset-0 bg-primary/25 flex items-center justify-center"><div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center"><Check size={16} className="text-primary-foreground" strokeWidth={2.5} /></div></div>}
                      <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full border border-white/20" style={{ background: item.color }} />
                    </div>
                    <div className="p-2.5 bg-card">
                      <p className="text-[9px] text-muted-foreground font-mono">{item.brand}</p>
                      <p className="text-xs font-semibold mt-0.5 truncate">{item.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {showCamera && <CameraModal onCapture={url => { setFacePhoto(url); setShowCamera(false); }} onClose={() => setShowCamera(false)} />}
    </div>
  );
}

// ─── AI Stylist ───────────────────────────────────────────────────────────────

type ChatMsg = { role: "ai" | "user"; text: string; items?: ClosetItem[] };
const AI_PERSONA = { name: "Madeleine", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&auto=format" };

function buildAIReply(userMsg: string, outfit: AvatarOutfit, favorites: Set<number>): { text: string; items?: ClosetItem[] } {
  const q = userMsg.toLowerCase();
  const wornItems = Object.values(outfit).filter(Boolean) as ClosetItem[];
  const favItems = closetItems.filter(i => favorites.has(i.id));
  if (q.includes("outfit") || q.includes("wear") || q.includes("today")) {
    const rec = OUTFIT_RECS[Math.floor(Math.random() * OUTFIT_RECS.length)];
    const items = (Object.values(rec.slots) as number[]).map(id => getItem(id)).filter(Boolean) as ClosetItem[];
    return { text: `For a ${rec.mood.toLowerCase()} look, I love this **${rec.name}** combination from your closet. ${rec.reason}`, items };
  }
  if (q.includes("favorite") || q.includes("save")) {
    if (!favItems.length) return { text: "You haven't saved any favorites yet. Heart items in your closet and I'll build looks around them." };
    const pick = favItems.slice(0, 2);
    return { text: `Your saved pieces have a beautiful through-line — ${pick.map(i => i.name).join(" and ")} are excellent anchors. Want me to build a look around them?`, items: pick };
  }
  if (q.includes("summer") || q.includes("warm")) { const items = closetItems.filter(i => i.tags.includes("summer")).slice(0, 3); return { text: "For warm weather, breathable fabrics and relaxed silhouettes. Here's what you already own:", items }; }
  if (q.includes("winter") || q.includes("cold") || q.includes("cozy")) { const items = closetItems.filter(i => i.tags.includes("winter") || i.tags.includes("cozy")).slice(0, 3); return { text: "Cold weather dressing is about layering with intention. These are your best winter pieces:", items }; }
  if (q.includes("work") || q.includes("office") || q.includes("formal")) { const items = closetItems.filter(i => i.tags.includes("formal") || i.tags.includes("tailored")).slice(0, 3); return { text: "For the office, structured pieces carry the most weight. You own some excellent workwear:", items }; }
  if (wornItems.length > 0) { const piece = wornItems[Math.floor(Math.random() * wornItems.length)]; return { text: `I see you have the **${piece.name}** by ${piece.brand} on your mannequin. Great choice — it works well with pieces in the ${piece.tags[0]} family. Want pairings?` }; }
  const starters = ["Tell me about your occasion, mood, or season and I'll curate looks from your actual wardrobe.", "Style is about context. Are you dressing for a specific event, or looking for an everyday uniform?", "Think of me as your closet editor. I can find combinations you haven't tried yet.", "Let's start with your mood — polished and sharp, relaxed and effortless, or a bit of both?"];
  return { text: starters[Math.floor(Math.random() * starters.length)] };
}

function AIStylistTab({ outfit, favorites }: { outfit: AvatarOutfit; favorites: Set<number> }) {
  const [messages, setMessages] = useState<ChatMsg[]>([{ role: "ai", text: "Hi, I'm **Madeleine** — your AI stylist. I know your closet inside out. Ask me what to wear today, how to style a piece, or how to dress for any occasion." }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);
  const send = () => {
    const text = input.trim(); if (!text) return;
    setMessages(prev => [...prev, { role: "user", text }]); setInput(""); setTyping(true);
    setTimeout(() => { const reply = buildAIReply(text, outfit, favorites); setMessages(prev => [...prev, { role: "ai", ...reply }]); setTyping(false); }, 900 + Math.random() * 600);
  };
  const PROMPTS = ["What should I wear today?", "Build an outfit around my favorites", "What works for the office?", "Summer looks from my closet", "Explain my colour palette", "Tips for cold weather"];
  function renderText(text: string) { return text.split(/\*\*(.*?)\*\*/).map((p, i) => i % 2 === 1 ? <strong key={i} className="text-foreground font-semibold">{p}</strong> : <span key={i}>{p}</span>); }
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-72 border-r border-border bg-card flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative"><img src={AI_PERSONA.avatar} alt={AI_PERSONA.name} className="w-14 h-14 rounded-full object-cover border-2 border-primary/40" /><div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-card" /></div>
            <div><p className="font-display font-semibold text-sm">{AI_PERSONA.name}</p><p className="text-[10px] font-mono text-primary uppercase tracking-wider">AI Stylist</p><p className="text-[9px] text-muted-foreground mt-0.5">Always available</p></div>
          </div>
          <div className="bg-muted/60 rounded-xl px-3 py-2.5 border border-border">
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Knows your closet</p>
            <div className="flex items-center gap-3">
              <div className="text-center"><p className="text-base font-display font-bold">{closetItems.length}</p><p className="text-[8px] font-mono text-muted-foreground">Items</p></div>
              <div className="h-6 w-px bg-border" />
              <div className="text-center"><p className="text-base font-display font-bold">{favorites.size}</p><p className="text-[8px] font-mono text-muted-foreground">Saved</p></div>
            </div>
          </div>
        </div>
        <div className="flex-1 px-5 py-4">
          <p className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground mb-3">What I can do</p>
          <div className="space-y-2.5">
            {[{ icon: Shirt, label: "Build outfits from your closet" }, { icon: Zap, label: "Style advice for any occasion" }, { icon: Star, label: "Elevate your current look" }, { icon: RefreshCw, label: "Find underused pieces" }, { icon: Sparkles, label: "Seasonal wardrobe edits" }].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-xs text-muted-foreground"><div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Icon size={11} className="text-primary" /></div>{label}</div>
            ))}
          </div>
        </div>
        <div className="px-5 py-4 border-t border-border">
          <p className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground mb-2.5">Quick prompts</p>
          <div className="flex flex-col gap-1.5">
            {PROMPTS.slice(0, 4).map(p => <button key={p} onClick={() => { setInput(p); inputRef.current?.focus(); }} className="text-left px-3 py-2 text-[10px] font-mono bg-muted hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition-colors border border-transparent hover:border-border truncate">{p}</button>)}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "ai" && <img src={AI_PERSONA.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-border shrink-0 mt-0.5" />}
              <div className={`max-w-lg flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "ai" ? "bg-card border border-border rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm"}`}>{renderText(msg.text)}</div>
                {msg.items && <div className="flex gap-2 flex-wrap">{msg.items.map(item => <div key={item.id} className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2"><div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div><div><p className="text-[10px] font-mono text-muted-foreground">{item.brand}</p><p className="text-xs font-semibold">{item.name}</p><p className="text-[9px] font-mono text-primary">{item.price}</p></div></div>)}</div>}
              </div>
              {msg.role === "user" && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 mt-0.5"><User size={13} className="text-white" /></div>}
            </div>
          ))}
          {typing && <div className="flex gap-3"><img src={AI_PERSONA.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-border shrink-0" /><div className="bg-card border border-border px-4 py-3 rounded-2xl flex items-center gap-1.5">{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</div></div>}
          <div ref={bottomRef} />
        </div>
        <div className="px-8 py-4 border-t border-border shrink-0">
          <div className="flex gap-2 mb-3 flex-wrap">{PROMPTS.slice(4).map(p => <button key={p} onClick={() => { setInput(p); inputRef.current?.focus(); }} className="px-3 py-1.5 text-[9px] font-mono bg-muted hover:bg-secondary text-muted-foreground hover:text-foreground rounded-full transition-colors border border-border">{p}</button>)}</div>
          <div className="flex gap-3">
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Ask Madeleine anything about your style…" className="flex-1 bg-muted border border-border rounded-full px-5 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            <button onClick={send} disabled={!input.trim() || typing} className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-35 shadow-lg shadow-primary/25 shrink-0"><Send size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Friend Connect ────────────────────────────────────────────────────────────

type Friend = { id: number; name: string; handle: string; avatar: string; location: string; online: boolean; connected: boolean; outfits: number };
const SUGGESTED_FRIENDS: Friend[] = [
  { id: 1, name: "Sofia Laurent", handle: "@sofia.l", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&auto=format", location: "Paris, FR",    online: true,  connected: true,  outfits: 47 },
  { id: 2, name: "Anya Kim",      handle: "@anya.k",  avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&auto=format", location: "Seoul, KR",   online: true,  connected: false, outfits: 32 },
  { id: 3, name: "Priya Mehta",   handle: "@priya.m", avatar: "https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=120&h=120&fit=crop&auto=format", location: "Mumbai, IN",  online: false, connected: true,  outfits: 88 },
  { id: 4, name: "Clara Voss",    handle: "@clara.v", avatar: "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=120&h=120&fit=crop&auto=format", location: "Berlin, DE",  online: false, connected: false, outfits: 19 },
];
type FriendMsg = { from: "me" | "friend"; text: string; ts: string };
type SessionState = "idle" | "requesting" | "active";

function FriendConnectTab({ outfit, body }: { outfit: AvatarOutfit; body: BodyParams }) {
  const [friends, setFriends] = useState<Friend[]>(SUGGESTED_FRIENDS);
  const [activeFriend, setActiveFriend] = useState<Friend | null>(SUGGESTED_FRIENDS[0]);
  const [session, setSession] = useState<SessionState>("idle");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<FriendMsg[]>([
    { from: "friend", text: "Omg your new closet additions are so good 😍 the trench coat is everything", ts: "2m ago" },
    { from: "me", text: "Right?! I've been looking for that for ages. What do you think with the wide-leg linens?", ts: "1m ago" },
    { from: "friend", text: "YES. Do it. Add the chelsea boots too, the contrast is chef's kiss 👌", ts: "just now" },
  ]);
  const [inviteInput, setInviteInput] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const sendMsg = () => {
    const text = chatInput.trim(); if (!text) return;
    setMessages(prev => [...prev, { from: "me", text, ts: "just now" }]); setChatInput("");
    if (activeFriend) setTimeout(() => { const rs = ["That combination looks amazing!", "Love it — have you tried it with the cashmere cardigan?", "Honestly obsessed with your wardrobe right now 💕", "Okay yes, submit it!", "Perfect silhouette for the Parisian challenge."]; setMessages(prev => [...prev, { from: "friend", text: rs[Math.floor(Math.random() * rs.length)], ts: "just now" }]); }, 1200 + Math.random() * 800);
  };
  const friendOutfit: AvatarOutfit = { top: closetItems[2], bottom: closetItems[1], outerwear: null, shoes: closetItems[10] };
  const friendBody: BodyParams = { bust: 45, waist: 42, leg: 55, height: 55 };
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-72 border-r border-border bg-card flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-border">
          <p className="text-[8px] tracking-[0.35em] font-mono uppercase text-primary mb-1">Style Network</p>
          <h2 className="text-sm font-display font-semibold">Closet Connect</h2>
        </div>
        <div className="px-5 py-4 border-b border-border">
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-2.5">Invite a friend</p>
          {inviteSent ? <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-3 text-center"><Check size={16} className="text-emerald-500 mx-auto mb-1" /><p className="text-xs font-mono text-emerald-400">Invite sent!</p></div> : (
            <div className="space-y-2">
              <div className="flex gap-2"><input value={inviteInput} onChange={e => setInviteInput(e.target.value)} placeholder="Email or @handle" className="flex-1 min-w-0 bg-muted border border-border rounded-lg px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" /><button onClick={() => inviteInput.trim() && setInviteSent(true)} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs shrink-0"><UserPlus size={12} /></button></div>
              <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="w-full flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <Check size={11} className="text-emerald-400 shrink-0" /> : <Copy size={11} className="shrink-0" />}<span className="truncate">covet.style/share/abc123</span>
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-3">
            <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Your network</p>
            <div className="space-y-1">
              {friends.map(f => (
                <div key={f.id} onClick={() => setActiveFriend(f)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${activeFriend?.id === f.id ? "bg-primary/10 border border-primary/25" : "hover:bg-muted border border-transparent"}`}>
                  <div className="relative shrink-0"><img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-full object-cover border border-border" /><div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${f.online ? "bg-emerald-500" : "bg-muted-foreground/40"}`} /></div>
                  <div className="flex-1 min-w-0"><p className="text-xs font-semibold truncate">{f.name}</p><p className="text-[9px] font-mono text-muted-foreground">{f.handle}</p></div>
                  {!f.connected && <button onClick={e => { e.stopPropagation(); setFriends(prev => prev.map(ff => ff.id === f.id ? { ...ff, connected: true } : ff)); }} className="flex items-center gap-1 px-2 py-1 bg-primary/15 text-primary rounded-full text-[8px] font-mono hover:bg-primary hover:text-primary-foreground transition-all"><Link2 size={8} /> Add</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeFriend && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative"><img src={activeFriend.avatar} alt={activeFriend.name} className="w-10 h-10 rounded-full object-cover border border-border" /><div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${activeFriend.online ? "bg-emerald-500" : "bg-muted-foreground/40"}`} /></div>
              <div><p className="font-semibold text-sm">{activeFriend.name}</p><p className="text-[9px] font-mono text-muted-foreground">{activeFriend.handle} · {activeFriend.location}</p></div>
            </div>
            <div className="flex items-center gap-2">
              {session === "idle" && <button onClick={() => setSession("requesting")} className="flex items-center gap-1.5 px-4 py-2 bg-primary/15 text-primary border border-primary/30 rounded-full text-xs font-mono hover:bg-primary hover:text-primary-foreground transition-all"><Monitor size={12} /> Share Closet</button>}
              {session === "requesting" && <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full"><span className="w-2 h-2 bg-accent rounded-full animate-pulse" /><span className="text-xs font-mono text-accent">Waiting…</span><button onClick={() => setSession("idle")}><X size={12} /></button></div>}
              {session === "active" && <div className="flex items-center gap-2"><div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /><span className="text-[10px] font-mono text-emerald-400">Live Session</span></div><button onClick={() => setSession("idle")} className="px-3 py-1.5 bg-muted border border-border rounded-full text-[10px] font-mono text-muted-foreground">End</button></div>}
              {session !== "active" && <button onClick={() => setSession(s => s === "requesting" ? "active" : "requesting")} className="flex items-center gap-1.5 px-4 py-2 bg-muted border border-border rounded-full text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"><MessageSquare size={12} /> Chat</button>}
            </div>
          </div>

          {session === "active" && (
            <div className="px-6 py-4 border-b border-border bg-card/50 shrink-0">
              <p className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2"><Monitor size={11} /> Shared Closet Session</p>
              <div className="flex gap-4">
                {[{ label: "Your Look", mq: outfit, mb: body, dot: "bg-primary" }, { label: `${activeFriend.name.split(" ")[0]}'s Look`, mq: friendOutfit, mb: friendBody, dot: "bg-accent animate-pulse" }].map(({ label, mq, mb, dot }) => (
                  <div key={label} className="flex-1 bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border"><div className={`w-2 h-2 rounded-full ${dot}`} /><p className="text-[10px] font-mono font-semibold">{label}</p></div>
                    <div className="h-44 flex items-center justify-center p-4"><MannequinFront body={mb} outfit={mq} facePhoto={null} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                {msg.from === "friend" && <img src={activeFriend.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-border shrink-0 mt-0.5" />}
                <div className={`max-w-sm flex flex-col gap-0.5 ${msg.from === "me" ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.from === "me" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border rounded-tl-sm"}`}>{msg.text}</div>
                  <p className="text-[8px] font-mono text-muted-foreground">{msg.ts}</p>
                </div>
                {msg.from === "me" && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 mt-0.5"><User size={13} className="text-white" /></div>}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {activeFriend.connected && (
            <div className="px-6 py-3 border-t border-border bg-card/40 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{activeFriend.name.split(" ")[0]}'s closet</p>
                <button onClick={() => setSession(s => s === "active" ? "idle" : "active")} className="text-[9px] font-mono text-primary hover:opacity-70 flex items-center gap-1"><Monitor size={9} /> {session === "active" ? "End share" : "Compare looks"}</button>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {closetItems.slice(3, 10).map(item => <div key={item.id} className="flex-none w-14 h-14 rounded-lg overflow-hidden bg-muted border border-border cursor-pointer hover:border-primary/35 transition-colors"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>)}
              </div>
            </div>
          )}

          <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMsg()} placeholder={`Message ${activeFriend.name.split(" ")[0]}…`} className="flex-1 bg-muted border border-border rounded-full px-5 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            <button onClick={sendMsg} disabled={!chatInput.trim()} className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-35 shadow-lg shadow-primary/25 shrink-0"><Send size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stylist Hub ──────────────────────────────────────────────────────────────

function StylistHub({ outfit, body, favorites }: { outfit: AvatarOutfit; body: BodyParams; favorites: Set<number> }) {
  const [mode, setMode] = useState<StylistMode>("ai");
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="px-8 py-4 border-b border-border flex items-center gap-6 shrink-0">
        <div><p className="text-[9px] tracking-[0.4em] font-mono uppercase text-primary mb-0.5">Personal Styling</p><h2 className="text-xl font-display font-bold">Stylist</h2></div>
        <div className="flex bg-muted rounded-xl p-1 gap-1 ml-4">
          <button onClick={() => setMode("ai")} className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-mono transition-all ${mode === "ai" ? "bg-card border border-border shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Bot size={13} className={mode === "ai" ? "text-primary" : ""} /> AI Stylist</button>
          <button onClick={() => setMode("friend")} className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-mono transition-all ${mode === "friend" ? "bg-card border border-border shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Users size={13} className={mode === "friend" ? "text-primary" : ""} /> Friend Stylist</button>
        </div>
        {mode === "ai" && <div className="ml-auto flex items-center gap-2 text-[9px] font-mono text-muted-foreground"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Madeleine is online</div>}
        {mode === "friend" && <div className="ml-auto flex items-center gap-2 text-[9px] font-mono text-muted-foreground"><Users size={10} /> {SUGGESTED_FRIENDS.filter(f => f.connected).length} friends connected</div>}
      </header>
      <div className="flex-1 flex overflow-hidden">
        {mode === "ai" && <AIStylistTab outfit={outfit} favorites={favorites} />}
        {mode === "friend" && <FriendConnectTab outfit={outfit} body={body} />}
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({ onNavigate, body, favorites, profilePhoto, onProfilePhoto, weekPlan }: {
  onNavigate: (tab: Tab) => void;
  body: BodyParams;
  favorites: Set<number>;
  profilePhoto: string | null;
  onProfilePhoto: (url: string) => void;
  weekPlan: WeekPlan;
}) {
  const profileFileRef = useRef<HTMLInputElement>(null);
  const favItems = closetItems.filter(i => favorites.has(i.id)).slice(0, 3);
  const POLAROID_TILTS = ["-2deg", "1.5deg", "-1deg"];

  const handleProfileFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => { if (ev.target?.result) onProfilePhoto(ev.target.result as string); }; r.readAsDataURL(f);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Profile header band ── */}
      <div className="relative bg-card border-b border-border px-10 py-8">
        {/* Subtle stripe texture */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, #B8966A 0px, #B8966A 1px, transparent 1px, transparent 28px)" }} />

        <div className="relative flex items-start gap-8">
          {/* Profile photo — click to upload */}
          <button
            onClick={() => profileFileRef.current?.click()}
            className="shrink-0 group relative w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-secondary to-muted border-2 border-border hover:border-primary/50 transition-all shadow-md"
          >
            {profilePhoto
              ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                  <User size={28} className="opacity-30" />
                  <span className="text-[7px] font-mono uppercase tracking-wider opacity-50">Add Photo</span>
                </div>
            }
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={18} className="text-white" />
            </div>
          </button>
          <input ref={profileFileRef} type="file" accept="image/*" className="hidden" onChange={handleProfileFile} />

          {/* Name + stats */}
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-primary mb-1">My Profile</p>
            <h1 className="text-3xl font-display font-bold leading-none">Drop Loop</h1>
            <p className="text-sm text-muted-foreground font-mono mt-1.5">Your personal fashion journal</p>

            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <p className="text-xl font-display font-bold text-foreground">{closetItems.length}</p>
                <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">Pieces</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-xl font-display font-bold text-foreground">{favorites.size}</p>
                <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">Favorites</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-xl font-display font-bold text-foreground">{Object.keys(INITIAL_WEEK).length}</p>
                <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">Outfits Planned</p>
              </div>
            </div>
          </div>

          {/* Quick nav buttons */}
          <div className="flex flex-col gap-2 shrink-0 pt-1">
            <button onClick={() => onNavigate("calendar")} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-mono hover:opacity-90 transition-opacity shadow-md shadow-primary/25 whitespace-nowrap">
              <CalendarDays size={11} /> Plan Week
            </button>
            <button onClick={() => onNavigate("lookbook")} className="flex items-center gap-2 px-4 py-2 border border-border rounded-full text-xs font-mono hover:bg-muted transition-colors whitespace-nowrap">
              <BookOpen size={11} /> Lookbook
            </button>
          </div>
        </div>
      </div>

      <div className="px-10 py-8 space-y-10">
        {/* ── My Top Looks ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-primary mb-0.5">Pinned</p>
              <h2 className="text-lg font-display font-semibold">My Top Looks</h2>
            </div>
            <button onClick={() => onNavigate("favorites")} className="text-[10px] font-mono text-primary hover:opacity-70 transition-opacity flex items-center gap-1">
              See all <ChevronRight size={10} />
            </button>
          </div>

          {favItems.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <Heart size={32} className="opacity-15" />
              <p className="text-xs font-mono">Heart items in your closet to pin your top looks here</p>
              <button onClick={() => onNavigate("closet")} className="text-[10px] font-mono text-primary hover:opacity-70">Go to Closet →</button>
            </div>
          ) : (
            <div className="flex gap-10 justify-start">
              {favItems.map((item, idx) => {
                const slotKey = item.category === "Tops" ? "top" : item.category === "Bottoms" ? "bottom" : item.category === "Outerwear" ? "outerwear" : item.category === "Shoes" ? "shoes" : null;
                const singleOutfit: AvatarOutfit = { top: null, bottom: null, outerwear: null, shoes: null };
                if (slotKey) singleOutfit[slotKey] = item;
                return (
                  <button key={item.id} onClick={() => onNavigate("favorites")} className="flex flex-col items-center group" style={{ transform: `rotate(${POLAROID_TILTS[idx]})` }}>
                    {/* Ranking badge */}
                    <div className="mb-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/25">
                      <span className="text-[10px] font-display font-bold">#{idx + 1}</span>
                    </div>
                    {/* Polaroid */}
                    <div className="bg-[#F5F0E8] rounded-sm shadow-2xl shadow-black/12 p-3 pb-10 w-[140px] relative transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-1">
                      <div className="aspect-[2/3] overflow-hidden rounded-sm bg-gradient-to-b from-secondary to-muted">
                        {slotKey
                          ? <MannequinFront body={body} outfit={singleOutfit} facePhoto={null} />
                          : <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        }
                      </div>
                      {/* Caption strip */}
                      <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 pt-1.5 text-center">
                        <p className="text-[8px] font-mono text-foreground/70 truncate leading-tight">{item.name}</p>
                        <p className="text-[7px] font-mono text-muted-foreground truncate">{item.brand}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ── This Week at a glance ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-primary mb-0.5">July 13 – 19</p>
              <h2 className="text-lg font-display font-semibold">This Week</h2>
            </div>
            <button onClick={() => onNavigate("calendar")} className="text-[10px] font-mono text-primary hover:opacity-70 flex items-center gap-1">Edit <ChevronRight size={10} /></button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {DAYS_SHORT.map((d, i) => {
              const slots = TIME_SLOTS.map(({ key: t }) => INITIAL_WEEK[`${i}-${t}`]).filter(Boolean);
              const allIds = slots.flatMap(s => s!.itemIds);
              const items = allIds.map(id => getItem(id)).filter(Boolean) as ClosetItem[];
              const previewOutfit = buildOutfitFromItems(items);
              const hasOutfit = items.length > 0;
              const isToday = i === 6;
              const eventLabel = slots.find(s => s?.label)?.label;
              return (
                <button key={d} onClick={() => onNavigate("calendar")} className={`group flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all hover:border-primary/40 ${isToday ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
                  <p className={`text-[8px] font-mono uppercase tracking-wider ${isToday ? "text-primary" : "text-muted-foreground"}`}>{d}</p>
                  <p className={`text-base font-display font-bold ${isToday ? "text-primary" : ""}`}>{weekDayDate(i)}</p>
                  {/* Mini mannequin or empty */}
                  <div className="w-full aspect-[2/3] bg-muted/40 rounded-lg overflow-hidden relative">
                    {hasOutfit
                      ? <MannequinFront body={body} outfit={previewOutfit} facePhoto={null} />
                      : <div className="w-full h-full flex items-center justify-center text-border/50"><Plus size={14} /></div>
                    }
                  </div>
                  {eventLabel && <p className="text-[7px] font-mono text-muted-foreground truncate w-full text-center">{eventLabel}</p>}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Outfit Diary ── */}
        <section className="pb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-primary mb-0.5">History</p>
              <h2 className="text-lg font-display font-semibold">Outfit Diary</h2>
            </div>
            <button onClick={() => onNavigate("calendar")} className="text-[10px] font-mono text-primary hover:opacity-70 flex items-center gap-1">
              Add entry <ChevronRight size={10} />
            </button>
          </div>

          {Object.keys(weekPlan).length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
              <BookOpen size={28} className="opacity-15" />
              <p className="text-xs font-mono">No diary entries yet — plan outfits in the Calendar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(weekPlan)
                .sort(([a], [b]) => {
                  const [ad, at] = a.split("-"); const [bd, bt] = b.split("-");
                  const tOrd = { morning: 0, afternoon: 1, evening: 2 };
                  return (+ad - +bd) || (tOrd[at as TimeSlot] - tOrd[bt as TimeSlot]);
                })
                .map(([key, entry]) => {
                  const [dayIdx, timeSlot] = key.split("-");
                  const items = entry.itemIds.map(id => getItem(id)).filter(Boolean) as ClosetItem[];
                  const previewOutfit = buildOutfitFromItems(items);
                  const dayName = DAYS[+dayIdx] ?? "";
                  const date = weekDayDate(+dayIdx);
                  const timeLabel = TIME_SLOTS.find(t => t.key === timeSlot)?.label ?? "";
                  const timeDot = timeSlot === "morning" ? "bg-accent/60" : timeSlot === "afternoon" ? "bg-primary/50" : "bg-purple-400/60";
                  return (
                    <button key={key} onClick={() => onNavigate("calendar")} className="w-full group flex items-center gap-4 bg-card border border-border hover:border-primary/30 rounded-2xl p-3.5 text-left transition-all hover:shadow-sm">
                      {/* Date column */}
                      <div className="shrink-0 w-11 text-center border-r border-border/60 pr-4">
                        <p className="text-[7px] font-mono text-muted-foreground uppercase tracking-wider">Jul</p>
                        <p className="text-xl font-display font-bold leading-none mt-0.5">{date}</p>
                      </div>

                      {/* Event + items */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${timeDot}`} />
                          <p className="text-[8px] font-mono text-muted-foreground">{dayName} · {timeLabel}</p>
                        </div>
                        <p className="text-sm font-semibold truncate">{entry.label || "Untitled outfit"}</p>
                        <div className="flex gap-1 mt-2">
                          {items.slice(0, 4).map(item => (
                            <div key={item.id} className="w-7 h-7 rounded-md overflow-hidden bg-muted border border-border/60">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {items.length > 4 && <div className="w-7 h-7 rounded-md bg-muted border border-border/60 flex items-center justify-center"><span className="text-[7px] font-mono text-muted-foreground">+{items.length - 4}</span></div>}
                        </div>
                      </div>

                      {/* Mini mannequin polaroid */}
                      <div className="shrink-0 w-12 h-[68px] bg-[#F5F0E8] rounded shadow-md shadow-black/20 p-1 overflow-hidden">
                        <MannequinFront body={body} outfit={previewOutfit} facePhoto={null} />
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [favorites, setFavorites] = useState<Set<number>>(new Set([1, 3, 7]));
  const [search, setSearch] = useState("");
  const [outfit, setOutfit] = useState<AvatarOutfit>({ top: null, bottom: null, outerwear: null, shoes: null });
  const [body, setBody] = useState<BodyParams>(DEFAULT_BODY);
  const [hair, setHair] = useState<HairStyle>("none");
  const [hairColor, setHairColor] = useState("#2C1810");
  const [weekPlan, setWeekPlan] = useState<WeekPlan>(INITIAL_WEEK);
  const [diamonds] = useState(12450);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const profileFileRef2 = useRef<HTMLInputElement>(null);
  const handleHeaderProfileFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => { if (ev.target?.result) setProfilePhoto(ev.target.result as string); }; r.readAsDataURL(f);
  };

  const toggleFavorite = (id: number) => setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const wearItem = (item: ClosetItem) => {
    const map: Partial<Record<string, AvatarSlot>> = { Tops: "top", Bottoms: "bottom", Outerwear: "outerwear", Shoes: "shoes" };
    const slot = map[item.category]; if (!slot) return;
    setOutfit(prev => ({ ...prev, [slot]: prev[slot]?.id === item.id ? null : item }));
  };

  const allItems = [...closetItems, ...userItems];
  const filtered = allItems.filter(item => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const q = search.toLowerCase();
    return matchCat && (!q || item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q) || item.tags.some(t => t.includes(q)));
  });

  const NAV: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "home",     label: "Home",        icon: Home },
    { id: "calendar", label: "Calendar",    icon: CalendarDays },
    { id: "lookbook", label: "Lookbook",    icon: BookOpen },
    { id: "closet",   label: "Closet",      icon: ShoppingBag },
    { id: "favorites",label: "Favorites",   icon: Heart },
    { id: "styling",  label: "Styling Room",icon: Sparkles },
    { id: "stylist",  label: "Stylist",     icon: Bot },
  ];

  // count planned events this week
  const plannedCount = Object.keys(weekPlan).length;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="shrink-0 border-b border-border bg-card/80 backdrop-blur-md z-10">
        <div className="flex items-center h-14 px-6 gap-4">
          <div className="flex items-center gap-1 shrink-0 mr-3">
            <span className="text-xl font-display font-bold text-primary tracking-wider">DROP</span>
            <span className="text-xl font-display font-light text-foreground/80 tracking-wider">LOOP</span>
          </div>
          <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-hide">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${activeTab === id ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                <Icon size={13} />
                <span className="hidden lg:block">{label}</span>
                {id === "calendar" && plannedCount > 0 && activeTab !== "calendar" && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[8px] font-bold rounded-full flex items-center justify-center">{plannedCount}</span>
                )}
                {id === "stylist" && activeTab !== "stylist" && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5 border border-border">
              <Gem size={11} className="text-accent" />
              <span className="text-xs font-mono font-semibold text-accent">{diamonds.toLocaleString()}</span>
            </div>
            <button onClick={() => profileFileRef2.current?.click()} className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent border-2 border-border hover:border-primary/60 transition-all shadow-md shadow-primary/20 flex items-center justify-center" title="Upload profile photo">
              {profilePhoto ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : <User size={14} className="text-white" />}
            </button>
            <input ref={profileFileRef2} type="file" accept="image/*" className="hidden" onChange={handleHeaderProfileFile} />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        {activeTab === "home"     && <HomePage onNavigate={setActiveTab} body={body} favorites={favorites} profilePhoto={profilePhoto} onProfilePhoto={setProfilePhoto} weekPlan={weekPlan} />}
        {activeTab === "calendar" && <OutfitCalendar weekPlan={weekPlan} setWeekPlan={setWeekPlan} />}
        {activeTab === "lookbook" && <LookbookJournal weekPlan={weekPlan} body={body} />}

        {activeTab === "closet" && (<>
          <header className="px-8 py-4 border-b border-border flex items-center gap-4 shrink-0 flex-wrap gap-y-2">
            <div className="relative flex-1 min-w-44 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-muted border border-border rounded-full placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded-full transition-all ${activeCategory === cat ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{cat}</button>)}
            </div>
            <button
              onClick={() => setShowAddItem(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-mono font-semibold hover:opacity-90 transition-opacity shadow-md shadow-primary/25 shrink-0"
            >
              <Camera size={13} /> Add Item
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-8">
            {filtered.length === 0 ? (
              <div className="text-center py-24 text-muted-foreground flex flex-col items-center gap-4">
                <ShoppingBag size={40} className="opacity-10" />
                <p className="text-sm font-mono">No items found</p>
                <button onClick={() => setShowAddItem(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-xs font-mono hover:opacity-90 transition-opacity">
                  <Camera size={12} /> Add your first item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filtered.map(item => <ClosetCard key={item.id} item={item} isFavorite={favorites.has(item.id)} onToggleFavorite={toggleFavorite} />)}
              </div>
            )}
          </div>
          {showAddItem && (
            <AddItemModal
              onAdd={item => { setUserItems(prev => [...prev, item]); setShowAddItem(false); }}
              onClose={() => setShowAddItem(false)}
            />
          )}
        </>)}

        {activeTab === "favorites" && (<>
          <header className="px-8 py-5 border-b border-border shrink-0">
            <p className="text-[9px] tracking-[0.4em] font-mono uppercase text-primary mb-1">Saved</p>
            <h2 className="text-2xl font-display font-bold">Favorites</h2>
          </header>
          <div className="flex-1 overflow-y-auto p-8">
            {closetItems.filter(i => favorites.has(i.id)).length === 0 ? (
              <div className="text-center py-24 flex flex-col items-center gap-3 text-muted-foreground"><Heart size={40} className="opacity-15" /><p className="text-sm font-mono">Heart items in your closet to save them here</p></div>
            ) : (
              <div className="flex flex-wrap gap-6 justify-start">
                {closetItems.filter(i => favorites.has(i.id)).map((item, idx) => {
                  const slotKey = item.category === "Tops" ? "top" : item.category === "Bottoms" ? "bottom" : item.category === "Outerwear" ? "outerwear" : item.category === "Shoes" ? "shoes" : null;
                  const singleOutfit: AvatarOutfit = { top: null, bottom: null, outerwear: null, shoes: null };
                  if (slotKey) singleOutfit[slotKey] = item;
                  const rotation = (idx % 2 === 0 ? 1 : -1) * (1.2 + (idx % 3) * 0.7);
                  return (
                    <div key={item.id} className="flex flex-col items-center group cursor-pointer" style={{ transform: `rotate(${rotation}deg)` }} onClick={() => toggleFavorite(item.id)}>
                      {/* Polaroid frame */}
                      <div className="bg-[#F5F0E8] rounded-sm shadow-xl shadow-black/12 p-2.5 pb-10 w-[130px] relative transition-transform duration-200 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/40">
                        {/* Photo area — mannequin */}
                        <div className="w-full aspect-[2/3] bg-gradient-to-b from-secondary to-muted rounded-sm overflow-hidden relative">
                          {slotKey ? (
                            <MannequinFront body={body} outfit={singleOutfit} facePhoto={null} />
                          ) : (
                            /* Accessories — show item image instead */
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          )}
                          {/* Subtle vignette */}
                          <div className="absolute inset-0 shadow-[inset_0_0_14px_rgba(0,0,0,0.12)] pointer-events-none rounded-sm" />
                        </div>
                        {/* Polaroid caption strip */}
                        <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2 pt-1.5 text-center">
                          <p className="text-[8px] font-mono text-foreground/70 truncate leading-tight">{item.name}</p>
                          <p className="text-[7px] font-mono text-muted-foreground truncate">{item.brand}</p>
                        </div>
                        {/* Heart badge */}
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                          <Heart size={9} fill="white" className="text-white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>)}

        {activeTab === "styling" && <StylingRoom outfit={outfit} onWearItem={wearItem} body={body} onBodyChange={setBody} hair={hair} onHairChange={setHair} hairColor={hairColor} onHairColorChange={setHairColor} />}
        {activeTab === "stylist" && <StylistHub outfit={outfit} body={body} favorites={favorites} />}
      </div>
    </div>
  );
}
