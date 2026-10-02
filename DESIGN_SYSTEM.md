# Minimalist Black & White Design System Specification

This document defines the complete UI and UX design system for the **Sentiment Analysis** application, redesigned with a high-contrast, minimalist aesthetic inspired by industry-leading interfaces: **YouTube, Instagram, ChatGPT, and Gemini**.

Design Philosophy:
- **Pure White Canvas (`#ffffff`)**: Clean, distraction-free background without wallpapers, image covers, or heavy color washes.
- **Deep Black Typography (`#000000`)**: Sharp, readable sans-serif text across all headers, inputs, and body copy.
- **Monochrome Action Hierarchy**: Primary actions styled in solid black with white text; secondary actions styled in crisp white with neutral borders.
- **Pill & Chip Controls**: Rounded-full buttons, chips, and pills reminiscent of YouTube search chips, Instagram action pills, and ChatGPT prompt bars.

---

## 1. Typography

The application prioritizes **Inter** (and **Satoshi**) for ultra-clean UI readability and **JetBrains Mono** for numerical values and analytics.

### Font Families & Imports

Typefaces loaded via **Google Fonts** in [`frontend/index.html`](frontend/index.html):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

Global CSS declaration in [`frontend/src/index.css`](frontend/src/index.css):

```css
:root {
  font-family:
    "Inter",
    "Satoshi",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
  color-scheme: light;
}

body {
  background-color: #ffffff;
  color: #000000;
}
```

### Font Weights

| Weight | Name | Primary Usage |
| :--- | :--- | :--- |
| `400` | Regular | Body copy, descriptions, user review textarea input, table cells |
| `500` | Medium | Secondary labels, subtext, character counters, tab buttons |
| `600` | Semibold | Action buttons, form labels, card headings, chip filters |
| `700` | Bold | Hero titles, primary section headers, KPI stats |
| `800` | Extra Bold | Major headlines, Net Sentiment Score highlight |

---

## 2. Big Tech Color Architecture (White Background & Black Text)

Leading technology platforms (**Google Gemini, YouTube Studio, Stripe, Linear, and OpenAI**) adhere to a disciplined color strategy when building on a pure white background with black typography. Color is never applied as random decorative wallpaper; it is applied strictly as **information, functional affordance, and brand trust**.

### The 90-8-2 Rule of Executive UI

```
┌────────────────────────────────────────────────────────┐
│  90% Neutral Canvas (White #ffffff + Black #000000)    │
│  ├─ Zero visual fatigue, maximum readability           │
│  └─ High-contrast black typography & 1px borders       │
├────────────────────────────────────────────────────────┤
│  8% Semantic Data Colors (Emerald, Rose, Amber, Slate) │
│  ├─ Immediate peripheral cognition without reading     │
│  └─ Tinted 10% pastels with dark saturated text        │
├────────────────────────────────────────────────────────┤
│  2% Interactive Brand Accent (Electric Blue #2563eb)   │
│  ├─ Focus rings, active dropzones, primary splines     │
│  └─ Gemini radiant aura & active chart scrubber        │
└────────────────────────────────────────────────────────┘
```

### Why Big Tech Uses This Architecture:
1. **High Signal-to-Noise Ratio**: When a screen has colored backgrounds everywhere, nothing stands out. When the entire canvas is clean white and the text is black, any element with color immediately draws the eye to high-value signals (e.g. sentiment classification, volume spikes, positive deltas, quota limits).
2. **Instant Peripheral Comprehension**: Users recognize green (`+12%`), red (`-8%`), and blue (Total searches) in &lt;150ms before even reading the number.
3. **Accessibility & Contrast (WCAG AAA)**: Saturated text on light tints (`text-emerald-700` on `bg-emerald-50`) guarantees high contrast ratios exceeding 7:1, eliminating eye strain.

### How & Where Big Tech Uses Specific Colors:

| Color Family | Big Tech Tone | Tailwind Token | Why Big Tech Uses It | Where in Our Application |
| :--- | :--- | :--- | :--- | :--- |
| **Brand & Focus Electric Blue** | `#2563eb` / `#3b82f6` | `blue-600` / `blue-500` | Google Gemini & YouTube default focus and interactive anchor; conveys AI intelligence, precision, and trust. | • Brand logo ambient aura (`bg-blue-500/15`)<br>• Chat box focus ring (`focus-within:border-blue-500/60`)<br>• Drag-and-drop file active state (`border-blue-600 bg-blue-50/20`)<br>• Analytics Total Searches & Net Sentiment spline curve<br>• Selected category row highlight (`bg-blue-50/50`) |
| **Emerald Growth / Positive** | `#059669` / `#10b981` | `emerald-600` / `emerald-500` | YouTube Studio & Stripe positive metric deltas and favorable sentiment. | • Positive sentiment result pill (`bg-emerald-50 text-emerald-700`)<br>• Single result icon box (`bg-emerald-50 text-emerald-600`)<br>• Positive confidence bar fill (`bg-emerald-500`)<br>• Positive Rate KPI card arrow, subtext & active underline<br>• Quota badge status dot when healthy (&gt; 3 free left) |
| **Crimson / Rose Critical** | `#dc2626` / `#e11d48` | `rose-600` / `rose-500` | YouTube Studio negative metrics and critical user friction. | • Negative sentiment result pill (`bg-rose-50 text-rose-700`)<br>• Single result icon box (`bg-rose-50 text-rose-600`)<br>• Negative confidence bar fill (`bg-rose-500`)<br>• Negative Rate KPI card arrow, subtext & active underline<br>• Quota badge status dot when exhausted (0 left) |
| **Amber Warning / Mixed** | `#d97706` / `#f59e0b` | `amber-600` / `amber-500` | Stripe & Linear cautionary states, close margins, and mixed sentiment. | • Mixed sentiment pill (`bg-amber-50 text-amber-700`)<br>• Close prediction warning dot (&lt;10% delta)<br>• Uncertain margin KPI card icon & subtext<br>• Quota badge status dot when low (1 to 3 left) |
| **Slate / Cool Neutral** | `#475569` / `#64748b` | `neutral-500` / `slate-500` | Balances sentiment distribution without triggering false alarms. | • Neutral sentiment pill (`bg-neutral-100 text-neutral-700`)<br>• Neutral distribution segment & legend dot<br>• Subtle chart gridlines & timeline baselines |
| **Violet AI Sparkle** | `#7c3aed` / `#8b5cf6` | `violet-600` / `violet-500` | OpenAI & Gemini AI model certainty indicators. | • Batch analysis "Avg Confidence" Sparkles icon & card highlight |

### A. Surfaces & Canvas

| Token | Class / Value | Description |
| :--- | :--- | :--- |
| **Canvas Background** | `bg-white` (`#ffffff`) | Pure white viewport background |
| **Card Surface** | `bg-white` (`#ffffff`) | Crisp white surface for cards, modals, and prompt boxes |
| **Header Surface** | `bg-white` with `border-b border-neutral-200` | Clean sticky navigation bar |
| **Muted Surface** | `bg-neutral-50` / `bg-neutral-100` | Input backgrounds, chip containers, table row highlights |
| **Text Selection** | `selection:bg-black selection:text-white` | High-contrast monochrome selection |

### B. Typography Hierarchy

| Token | Class / Value | Usage |
| :--- | :--- | :--- |
| **Pure Black** | `text-black` (`#000000`) | Main titles, hero headings, card titles, input text |
| **Neutral 900** | `text-neutral-900` (`#171717`) | Form labels, table headings, active icons |
| **Neutral 600** | `text-neutral-600` (`#525252`) | Body text, descriptions, secondary copy |
| **Neutral 500** | `text-neutral-500` (`#737373`) | Monospace metadata, helper captions, counter displays |
| **Neutral 400** | `text-neutral-400` (`#a3a3a3`) | Input placeholders, muted decorative icons |

### C. Actions & Buttons

| Role | Class / Styling | Usage |
| :--- | :--- | :--- |
| **Primary Button** | `bg-black text-white hover:bg-neutral-800 rounded-full` | Primary CTAs (Analyze, Upload, Submit, Sign In) |
| **Secondary Button** | `bg-white text-black border border-neutral-200 hover:bg-neutral-50 rounded-full` | Secondary CTAs (Cancel, Clear, Export, Log In) |
| **Active Nav Chip** | `bg-black text-white rounded-full` | Active view or category tab |
| **Inactive Nav Chip** | `bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200 rounded-full` | Inactive view or filter tab |
| **Focus Ring** | `focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15` | Input and interactive control focus states |

---

## 3. Borders & Radius

- **Borders**: Clean, subtle 1px dividers (`border-neutral-200` or `border-neutral-300`).
- **Cards & Modals**: `rounded-2xl` for main cards and dialogs.
- **Interactive Controls**: `rounded-full` for buttons, search chips, and status badges.
- **Inputs**: `rounded-2xl` for ChatGPT-style prompt boxes; `rounded-xl` for standard inputs.
- **Dropzone**: `border-2 border-dashed border-neutral-300 rounded-2xl`.

---

## 4. Components

### A. Header Navigation
- **Structure**: Solid white header (`bg-white border-b border-neutral-200 h-14`).
- **Brand Identity**: Features [`logo (2).png`](frontend/src/assets/logo%20(2).png) with calibrated sizing (`h-6.5 w-6.5` on mobile to `h-7.5 w-7.5` on desktop for full-bleed artwork), a Google Gemini-inspired ambient radiant blue glow (`bg-blue-500/15 blur-md scale-110 drop-shadow-[0_1px_6px_rgba(59,130,246,0.3)]`), and sharp black typography (`text-neutral-900 font-semibold tracking-tight text-sm sm:text-[15px]`).
- **Controls**: Pill-shaped status counters and black "Sign In" / "Sign Out" pill buttons.

### B. Unified Chatting Bar (Single Review & Batch File Upload)
- **Container**: ChatGPT / Gemini-style unified prompt card (`bg-white rounded-2xl border border-neutral-200 shadow-xs hover:border-neutral-300 focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/15 focus-within:shadow-[0_4px_24px_-4px_rgba(59,130,246,0.12)]`).
- **Gemini Centerpiece**: When idle, the center canvas features the glowing blue logo mark, a bold heading *"What would you like to analyze?"*, and a clean subheadline directly above the prompt box.
- **Drag & Drop**: Acts as a dropzone for `.csv` and `.xlsx` files with a visual drop overlay and dashed blue border.
- **Attachment Preview**: When a file is attached, displays an inline chip with spreadsheet icon, filename, file size, and remove button.
- **Textarea**: Clean black text with black caret, placeholder adapting based on whether a file is attached.
- **Bottom Toolbar**:
  - `Attach File` button (`Paperclip` icon) triggering hidden file selector.
  - `Try Sample` and `Template` buttons for rapid testing.
  - Character counter for text review length.
  - Dynamic Action Button: `Analyze Sentiment` when text is typed; `Analyze Batch` when a spreadsheet is attached.

### C. Sentiment Result Card
- **Surface**: Solid white card (`bg-white rounded-2xl border border-neutral-200 shadow-sm`).
- **Header**: High-contrast icon badge with black heading.
- **Metrics**: High-contrast confidence callout and sleek probability breakdown.

### D. Batch Analysis Dashboard
- **Location**: Renders directly below the unified chatting bar after processing a batch file.
- **KPI Metrics**: 4-card metric grid with bold black numbers and neutral borders.
- **Preview Table**: Clean white table with sticky header and neutral borders.

### E. YouTube Studio-Style Analytics Dashboard
- **Top Bar**: Minimalist header with segmented range pills (`7 days`, `28 days`, `90 days`, `Lifetime`), clean category select dropdown, and discreet refresh button.
- **Integrated Hero Card**: Cohesive container holding the 4-column interactive KPI selector row directly above the timeline chart:
  - **4-Column KPI Tab Selector**: Net Sentiment, Searches Analyzed, Positive Rate, Negative Rate. Clicking any KPI tab activates it and plots that metric on the chart with a solid black underline indicator.
  - **Smooth Spline & Area Chart**: Clean neutral grid lines (`#f5f5f5`), zero neutral baseline, interactive scrubber tracking the cursor with exact date snapping, and a floating dark YouTube Studio tooltip displaying key metrics and distribution breakdown.
  - **Volume Bar Mode**: Option to switch between smooth trajectory curve and stacked volume bars.
- **Category Breakdown Table**: Styled like YouTube Studio's content performance table with category tags, search counts, share %, inline horizontal distribution bars, and Net Sentiment badges. Clicking a row filters the entire dashboard.
- **Recent Activity Stream**: Styled like YouTube Studio's realtime activity stream with filter chips (All, Positive, Negative, Neutral), live query search, timestamp indicators, and confidence score badges.

---

## 5. Interaction States

| State | Treatment |
| :--- | :--- |
| **Default** | Pure white surface, subtle neutral-200 border, black typography |
| **Hover** | Neutral background lift (`hover:bg-neutral-50` or `hover:bg-neutral-100`) |
| **Active / Click** | Subtle micro-scale reduction (`active:scale-[0.98]`) |
| **Focus** | Black border with subtle ring (`focus:border-black focus:ring-1 focus:ring-black`) |
| **Loading** | Monochrome spinner (`animate-spin text-black` or `text-white` on black buttons) |
| **Disabled** | Reduced opacity (`opacity-40 cursor-not-allowed`) |

---

## 6. Layout & Alignment Architecture

- **Horizontal Symmetry**: Max-width is clamped to `max-w-6xl` for dashboard views (Analytics, Batch results) and `max-w-xl` for focused text input, keeping the line length readable and comfortable.
- **Header Alignment**: 3-point balance across `max-w-6xl` (Brand on the left, Segmented Navigation in the horizontal center, Auth and Quota on the right).
- **Responsive Navigation**: Desktop navigation is integrated directly into the Header center, completely eliminating fixed sidebars that overlap content on medium viewports (1024px–1280px). On mobile (`< 640px`), navigation anchors as a clean sticky sub-bar directly below the header.
- **Mathematical Vertical Centering**: The idle analyzer canvas uses flexbox vertical centering (`flex-1 justify-center`) rather than hardcoded pixel/viewport spacers, guaranteeing mathematical centering on all monitor heights without phantom scrollbars.
- **Toolbar Baseline Harmony**: Action buttons inside inputs and cards adhere to matching 32px heights (`h-8 w-8 rounded-full`), keeping attachment clips, character counters, and submit controls on the exact same baseline.
- **Card Grid Synchronization**: Multi-column grids (Analytics category breakdown and recent activity stream) utilize `h-full flex flex-col` and synced `max-h-[380px]` scroll zones to ensure bottom borders sit perfectly flush.
