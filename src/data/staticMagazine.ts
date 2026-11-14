export interface MagazinePage {
  pageNumber: number; // 1 to 46
  folio: string; // e.g. "Cover", "001", "02", "06", ... "Back Cover"
  title: string;
  department: string;
  subtitle?: string;
  imageSrc: string;
  videoSrc?: string;
  videoAutoplay?: boolean;
  videoLoop?: boolean;
  videoMuted?: boolean;
  videoTitle?: string;
  isCover?: boolean;
  articleSlug?: string;
  author?: string;
  readTime?: string;
  summary: string;
  pullQuote?: string;
  content: string[];
  tags: string[];
  keyFigures?: { label: string; value: string }[];
}

export interface ArticleNav {
  title: string;
  department: string;
  pageNumber: number;
  folio: string;
  tag: string;
}

export const ARTICLES_NAV: ArticleNav[] = [
  { title: "Say It Louder", department: "Editor's Letter", pageNumber: 3, folio: "02", tag: "Letter" },
  { title: "Glitch Is a Love Language", department: "3D / Motion", pageNumber: 4, folio: "06", tag: "Feature" },
  { title: "Stand On Business", department: "Cover Story", pageNumber: 6, folio: "19", tag: "Interview" },
  { title: "Grid Therapy", department: "Graphic Design", pageNumber: 8, folio: "24", tag: "Typography" },
  { title: "Street Logic", department: "Branding", pageNumber: 9, folio: "31", tag: "Identity" },
  { title: "Cut Fast, Cry Later", department: "Video Editing", pageNumber: 10, folio: "38", tag: "Film" },
  { title: "Polygons With Feelings", department: "3D Design", pageNumber: 12, folio: "44", tag: "3D Render" },
  { title: "URL Street", department: "Web Design", pageNumber: 13, folio: "51", tag: "Web" },
  { title: "Objects of Desire", department: "Product", pageNumber: 14, folio: "58", tag: "Product" },
  { title: "The Merch Table", department: "Merch", pageNumber: 15, folio: "59", tag: "Merch" },
  { title: "American Dream, Idling", department: "Photo Essay", pageNumber: 16, folio: "64", tag: "Photo" },
  { title: "Everything Cool Is Somebody's Second Try", department: "Essay", pageNumber: 17, folio: "65", tag: "Essay" },
  { title: "Notes From The Group Chat", department: "Off The Record", pageNumber: 18, folio: "70", tag: "Behind-The-Scenes" },
  { title: "Part Two: The Portfolio", department: "Portfolio", pageNumber: 20, folio: "74", tag: "Showcase" },
  { title: "Type You Can Wear", department: "Type & Image", pageNumber: 21, folio: "76", tag: "Editorial" },
  { title: "One Colour, No Mercy", department: "Colour", pageNumber: 23, folio: "80", tag: "Campaign" },
  { title: "Scale Is a Joke", department: "Compositing", pageNumber: 25, folio: "84", tag: "VFX" },
  { title: "Write Your Own Story", department: "Authorship", pageNumber: 27, folio: "88", tag: "Writing" },
  { title: "Spot The Fake", department: "Truth / AI", pageNumber: 29, folio: "92", tag: "AI vs Reality" },
  { title: "Desks of the Industry", department: "Studio Kit", pageNumber: 31, folio: "96", tag: "Hardware" },
  { title: "UI That Stands Up", department: "3D + UI", pageNumber: 33, folio: "100", tag: "Spatial UI" },
  { title: "Random Tutorials", department: "Motion Archive", pageNumber: 35, folio: "104", tag: "Tutorials" },
  { title: "Cover It In Cartoons", department: "Product Livery", pageNumber: 37, folio: "108", tag: "Itasha" },
  { title: "Sweetcore / Lollipop 5.1", department: "3D Packaging", pageNumber: 39, folio: "112", tag: "Packaging" },
  { title: "A Page That Moves", department: "Motion", pageNumber: 41, folio: "120", tag: "Motion" },
  { title: "Ctrl+Alt+Refresh", department: "Product Advert", pageNumber: 43, folio: "128", tag: "Commercial" },
  { title: "Outside", department: "Outro", pageNumber: 45, folio: "132", tag: "Closing" },
];

export const MAGAZINE_SOUNDTRACK = [
  { track: "01", title: "Loud on a Tuesday", duration: "03:41", mood: "Heavy 808s & Crisp Hi-Hats" },
  { track: "02", title: "Kerning Blind", duration: "02:58", mood: "Glitch Micro-Beats" },
  { track: "03", title: "Render Farm Blues", duration: "04:12", mood: "Deep Ambient Fan Drone & Rhodes" },
  { track: "04", title: "Invoice (Interlude)", duration: "01:07", mood: "Mechanical Keyboard & Coffee Pour" },
  { track: "05", title: "Screen Share", duration: "03:22", mood: "Late-night Braamfontein Synth Wave" },
];

export const MAGAZINE_PAGES: MagazinePage[] = [
  {
    pageNumber: 1,
    folio: "Cover",
    title: "STATIC° — Issue 03",
    subtitle: "A Magazine About Making Loud Things",
    department: "Cover",
    imageSrc: "./assets/pages/page-01.png",
    isCover: true,
    summary: "STATIC° Issue 03 / Fall 2026. The Loud Issue: Design that won't sit still. Six departments, one obsession: Type, Film, Render, Code, Object, Brand.",
    content: [
      "STATIC° — A MAGAZINE ABOUT MAKING LOUD THINGS",
      "Issue 03 / Fall 2026 — PK · JHB · LGS · LDN",
      "THE LOUD ISSUE: DESIGN THAT WON'T SIT STILL",
      "Inside: P. 19 — Stand on Business | P. 38 — Cut Fast, Cry Later",
      "Price: R0.00 / FREE / TAKE ONE",
      "Web: staticmag.cc | @static.mag"
    ],
    tags: ["Cover", "The Loud Issue", "Fall 2026"]
  },
  {
    pageNumber: 2,
    folio: "001",
    title: "Table of Contents",
    subtitle: "Everything in here was made by someone who cared too much",
    department: "Contents",
    imageSrc: "./assets/pages/page-02.png",
    summary: "Index of Vol. 03 Inside. Featuring 10 Department Features and 12 Portfolio Stories in Part Two.",
    pullQuote: "Clean is a Tuesday. I want the file that fought back.",
    content: [
      "02 SAY IT LOUDER — Editor's Letter",
      "06 GLITCH IS A LOVE LANGUAGE — 3D / Motion",
      "19 STAND ON BUSINESS — Cover Story",
      "24 GRID THERAPY — Graphic Design",
      "31 STREET LOGIC — Branding",
      "38 CUT FAST, CRY LATER — Video Editing",
      "44 POLYGONS WITH FEELINGS — 3D Design",
      "51 URL STREET — Web Design",
      "58 OBJECTS OF DESIRE — Product",
      "64 AMERICAN DREAM, IDLING — Photo Essay",
      "74 PART TWO — THE PORTFOLIO (26 PP · 12 STORIES)"
    ],
    tags: ["Contents", "Index", "Overview"]
  },
  {
    pageNumber: 3,
    folio: "02",
    title: "Say It Louder",
    department: "Editor's Letter",
    author: "Naledi Mokoena",
    readTime: "4 Min Read",
    imageSrc: "./assets/pages/page-03.png",
    summary: "There is a particular kind of silence that happens in a studio at 2am, right before somebody says 'what if we just…' and ruins a perfectly good layout.",
    pullQuote: "If it makes you slightly uncomfortable, good — that's the sound of a page with a pulse. Turn it up.",
    content: [
      "There is a particular kind of silence that happens in a studio at 2am, right before somebody says 'what if we just…' and ruins a perfectly good layout. This issue is about that moment. The one where the safe version is finished, exported, and sitting there — and you send it back anyway.",
      "We spent three months in rooms with designers, editors, render monkeys and brand strategists who all share one flaw: they cannot leave a thing alone. Every page in here is a working file that never got flattened.",
      "So the layout is the argument. Margins get broken on purpose. Type goes where the grid said it couldn't. The folios don't match because they aren't supposed to. If it makes you slightly uncomfortable, good — that's the sound of a page with a pulse.",
      "Turn it up. — Naledi M., Editor-in-Chief"
    ],
    tags: ["Editor's Letter", "Manifesto", "Naledi Mokoena"]
  },
  {
    pageNumber: 4,
    folio: "06",
    title: "Glitch Is a Love Language",
    subtitle: "Motion artists who break their own renders on purpose — and the studios paying them to do it",
    department: "Dept. 01 — 3D / Motion",
    author: "T. Adesanya",
    imageSrc: "./assets/pages/page-04.png",
    summary: "Feature spread exploring intentional render corruption and glitch art in cutting-edge commercial studios.",
    content: [
      "DEPT. 01 — 3D / MOTION | PAGE 06 | FILE: FDC:8753-62",
      "GLITCH STUDY_04.OBJ",
      "FEATURE / 06 — THE LOUD ISSUE",
      "GLITCH IS A LOVE LANGUAGE",
      "Motion artists who break their own renders on purpose — and the studios paying them to do it. Words: T. Adesanya."
    ],
    tags: ["3D", "Motion", "Glitch Art"]
  },
  {
    pageNumber: 5,
    folio: "07",
    title: "Clean Is a Tuesday",
    subtitle: "Soft Error studio speaking in a rented Braamfontein studio",
    department: "Dept. 01 — Feature Continued",
    author: "T. Adesanya / Daisy Okafor",
    imageSrc: "./assets/pages/page-05.png",
    summary: "Daisy Okafor of Soft Error on why clients pay for corruption and broken renders.",
    pullQuote: "Clean is a Tuesday. I want the file that fought back.",
    content: [
      "The first rule of a good glitch is that it has to look like an accident you could never repeat. That's the whole trick. Daisy Okafor — one half of the Lagos–Berlin studio Soft Error — builds her renders in Cinema 4D, then runs them through a chain of deliberate failures: a corrupted displacement map, a scan of a 2004 plasma TV, a phone video of a phone video.",
      "“Everyone can make something clean,” she says. “Clean is a Tuesday. I want the thing that looks like the file fought back.”",
      "The commercial world has noticed. Soft Error's client list now reads like a sneaker wall: two sportswear giants, a soda brand, a streaming platform that asked for 'a corruption but premium.' The briefs get stranger every quarter. One asked for a render of a sneaker that was '92% accurate and 8% possessed.' They delivered it in nine days.",
      "The economics are simple. A clean hero image takes a week and three rounds of notes. A broken one takes four days, one round, and a client who trusts you. The mess is faster because nobody knows what it's supposed to look like — which means nobody can be wrong.",
      "FIG. 1 — THREE WAYS TO BREAK THE SAME FRAME: A / Scan, B / Shift, C / Invert."
    ],
    tags: ["Soft Error", "Daisy Okafor", "Braamfontein", "C4D"]
  },
  {
    pageNumber: 6,
    folio: "19",
    title: "Stand On Business",
    subtitle: "Thabo 'T-Bone' Mahlangu, Creative Director, 31, Soweto",
    department: "Cover Story",
    author: "Ph. K. Molefe",
    imageSrc: "./assets/pages/page-06.png",
    summary: "Shot at 06:40 in a warehouse in City Deep. The yellow type is hand-kerning, not a font effect. He brought his own speakers. We kept them.",
    pullQuote: "No Days Off. Doing the work even when nobody is watching, especially then.",
    content: [
      "COVER STORY / 19 | PHOTOGRAPHY: K. MOLEFE",
      "THABO 'T-BONE' MAHLANGU, CREATIVE DIRECTOR, 31, SOWETO",
      "Sticky Notes:",
      "• Doing the work even when nobody is watching, especially then",
      "• Showing up with consistency, not excuses, and letting results speak",
      "• Moving with intention, clarity, and respect for the process",
      "• Being accountable to your goals, not your mood or timing",
      "Shot at 06:40 in a warehouse in City Deep. The yellow type is hand-kerning, not a font effect. He brought his own speakers. We kept them."
    ],
    tags: ["Cover Story", "T-Bone", "Soweto", "City Deep"]
  },
  {
    pageNumber: 7,
    folio: "19",
    title: "Taste Is the Service. The Files Are Free.",
    subtitle: "The Static Interview with T-Bone Mahlangu",
    department: "The Static Interview",
    author: "Static Staff",
    readTime: "11 Min Interview",
    imageSrc: "./assets/pages/page-07.png",
    summary: "T-Bone on turning down a global rebrand, charging for decisions, and why the internet made everyone a designer but not a director.",
    pullQuote: "Taste is the service. The files are free.",
    content: [
      "STATIC: You turned down a global rebrand last year. Everybody thought you were insane.",
      "T-BONE: I turned down a global rebrand because it was already done. They wanted me to sign it, not make it. There's a difference and it costs the same.",
      "STATIC: So what does a client actually buy from you?",
      "T-BONE: A decision. They're paying for someone in the room who will say 'this one' and then defend it at 2am when the CFO gets involved. Taste is the service. The files are free.",
      "He talks with his hands and keeps checking the door like the room is late. Six years ago he was retouching catalogue shoes in a back office in Kempton Park. Now he runs a five-person studio that turns down more work than it takes, on purpose, and posts the rejections as a carousel.",
      "“The internet made everyone a designer,” he says. “Fine. But it didn't make everyone a director. That's the job now — pointing.”"
    ],
    tags: ["Interview", "Creative Direction", "Braamfontein", "Strategy"]
  },
  {
    pageNumber: 8,
    folio: "24",
    title: "Grid Therapy",
    subtitle: "Layout is not the box the content sits in. Layout is the content.",
    department: "Dept. 02 — Graphic Design",
    imageSrc: "./assets/pages/page-08.png",
    summary: "Everything measured, nothing accidental. Anton Display, Archivo Text, and Space Mono typography specimen.",
    pullQuote: "Kern me tighter. Type that fills the box vs perfectly reasonable type sitting politely in the middle of nothing.",
    content: [
      "Layout is not the box the content sits in. Layout is the content — the order you read things in, the size you give them, the air you leave around them. A poster that shouts and a menu that whispers can be the same words.",
      "This page is a working file. Guides on. Everything measured, nothing accidental. The accident is the point, so it has to be repeatable.",
      "TYPE STACK: Anton Display | Archivo Text / 400·700 | Space Mono — Data",
      "PALETTE / ISSUE 03: #0B0B0B, #EDE9E0, #FF6A00, #FF2E85, #1B4DFF",
      "DO: Type that fills the box. DON'T: Perfectly reasonable type, sitting politely in the middle of nothing.",
      "SCREEN RULING: 65 LPI / DOT GAIN SIMULATED DIGITALLY"
    ],
    tags: ["Typography", "Grid System", "Graphic Design", "Anton"]
  },
  {
    pageNumber: 9,
    folio: "31",
    title: "Street Logic",
    subtitle: "Case 014: PHASE™ Skate Supply Identity / 2026",
    department: "Dept. 03 — Branding",
    imageSrc: "./assets/pages/page-09.png",
    summary: "If it can't be stickered onto a deck in under four seconds, it doesn't ship.",
    pullQuote: "A brand is a promise you can break in one Instagram post.",
    content: [
      "A brand is a promise you can break in one Instagram post. PHASE had the product — decks, shorts, zero patience — but their logo was doing all the talking in the wrong accent.",
      "The fix wasn't a new logo. It was a system: one spike, one grid, one rule — if it can't be sticker-ed onto a deck in under four seconds, it doesn't ship.",
      "Everything is drawn on a 12-unit baseline so the type and the mark fight at the same weight.",
      "WORDMARK: 4 Variants | DECK GRAPHICS | SPIKE DEVICE | VOICE: LOUD"
    ],
    tags: ["Branding", "Skate Supply", "Street Culture", "Identity"]
  },
  {
    pageNumber: 10,
    folio: "38",
    title: "Cut Fast, Cry Later",
    subtitle: "A 90-second spot, 46 cuts and one nervous director",
    department: "Dept. 04 — Video Editing",
    author: "Sipho Radebe",
    imageSrc: "./assets/pages/page-10.png",
    summary: "The average shot in this cut lasts 1.9 seconds. 40 minutes of footage went in, 92 seconds came out.",
    pullQuote: "If it works muted, it's a slideshow.",
    content: [
      "The average shot in this cut lasts 1.9 seconds. Nothing is precious: 40 minutes of footage went in, 92 seconds came out, and the best frame in the film is the one that's technically a mistake.",
      "Editor Sipho Radebe cuts to music first, story second. “If it works muted, it's a slideshow.”",
      "FIG 2 — TIMELINE, REEL 03 (00:01:04:12):",
      "V3: Title | V2: Grade, FX, B-Roll 04, Warp | V1: CU Hands, WS Car, Insert Cut, Master Shot",
      "A1: VO Take 6, VO Take 9 (Gold) | A2: 808 Loop, Riser, Plate Hit"
    ],
    tags: ["Video Editing", "Pacing", "NLE Timeline", "Post-Production"]
  },
  {
    pageNumber: 11,
    folio: "39",
    title: "Frames We Couldn't Kill",
    subtitle: "Contact Sheet / Reel 03 — Arri Alexa ISO 800",
    department: "Video Editing Contact Sheet",
    imageSrc: "./assets/pages/page-11.png",
    summary: "Grade notes: crush the blacks, protect the skin, never warm the smoke.",
    pullQuote: "The burning car is real, the money is real, the Spider-Man menu is real.",
    content: [
      "Grade notes: crush the blacks, protect the skin, never warm the smoke. The burning car is real, the money is real, the Spider-Man menu is real — we just had to keep the controller cables out of frame.",
      "Frame 03 was shot on a public bus in Yeoville with a 35mm and zero permits. It's the only shot in the film with no plan attached, and it's the one on the poster.",
      "01 / MASTER (00:00:14:04) | 02 / SMOKE (00:01:02:19)",
      "03 / WAITING (00:02:41:08) | 04 / TITLE CARD: 'THE END IS A LIE'"
    ],
    tags: ["Cinematography", "Grading", "Arri Alexa", "Yeoville"]
  },
  {
    pageNumber: 12,
    folio: "44",
    title: "Polygons With Feelings",
    subtitle: "A render is an argument about light",
    department: "Dept. 05 — 3D Design",
    imageSrc: "./assets/pages/page-12.png",
    summary: "Anyone can make a chrome sphere; the work is deciding what the object is made of emotionally.",
    pullQuote: "Anyone can make a chrome sphere; the work is deciding what the object is made of emotionally.",
    content: [
      "A render is an argument about light. Anyone can make a chrome sphere; the work is deciding what the object is made of emotionally — is it new, is it scratched, did somebody love it?",
      "The studio behind this study scanned a real clay model, wrapped it in 4K scuffs, then lit it with a single warm window. No HDRI. No magic.",
      "TECHNICAL SPECS: Verts: 18 442 | Tris: 36 880 | Materials: 04 | Render: REDSHIFT | Time: 6H 12M",
      "FIG 3 — POLY BUDGET PER ASSET: Hero, Prop, Loop, Icon"
    ],
    tags: ["3D Design", "Redshift", "Geometry", "Lighting"]
  },
  {
    pageNumber: 13,
    folio: "51",
    title: "URL Street",
    subtitle: "The web used to be a brochure. Now it's a street corner.",
    department: "Dept. 06 — Web Design",
    imageSrc: "./assets/pages/page-13.png",
    summary: "Design for the glance, not the scroll. Rule one: if the first screen needs explaining, it's a poster taped inside a lift.",
    pullQuote: "Rule one: if the first screen needs explaining, it's a poster taped inside a lift.",
    content: [
      "The web used to be a brochure. Now it's a street corner: people walk past, stop, look at their phone, leave. Design for the glance, not the scroll.",
      "Rule one: if the first screen needs explaining, it's a poster taped inside a lift.",
      "LIGHTHOUSE / OURS: PERF: 98 | A11Y: 100 | SEO: 92 | VIBE: ???",
      "BENCHMARKS: 0.8s Load 4G | 0.00 Layout Shift | -15 Tracking",
      "The grid is public. The messy layer isn't. urlstreet.cc/issue-03/grid",
      "COOKIES: NONE"
    ],
    tags: ["Web Design", "Performance", "Lighthouse", "Typography"]
  },
  {
    pageNumber: 14,
    folio: "58",
    title: "Objects of Desire",
    subtitle: "Product photography is branding with the volume down",
    department: "Dept. 07 — Product",
    imageSrc: "./assets/pages/page-14.png",
    summary: "You don't describe the shoe. You light it like it owes you money. Off-White × Nike Air study.",
    pullQuote: "You don't describe the shoe. You light it like it owes you money.",
    content: [
      "DEPT. 07 — PRODUCT | PAGE 58 | OBJECT STUDY 011",
      "01 — Stay-Stitch: 2.4mm waxed",
      "02 — Tape Tag: unsigned, on purpose",
      "03 — Ridged Sole: moulded in one pour",
      "PRODUCT PHOTOGRAPHY IS BRANDING WITH THE VOLUME DOWN. YOU DON'T DESCRIBE THE SHOE. YOU LIGHT IT LIKE IT OWES YOU MONEY."
    ],
    tags: ["Product Design", "Sneakers", "Off-White", "Nike Air"]
  },
  {
    pageNumber: 15,
    folio: "59",
    title: "The Merch Table",
    subtitle: "A brand is what's left when the logo is on a tote bag at 3am",
    department: "Back of Book — Merch",
    imageSrc: "./assets/pages/page-15.png",
    summary: "The sticker always wins. It's the cheapest way to let people vandalise your identity — and the only brand asset that gets better when it's destroyed.",
    pullQuote: "If your merch needs a caption to be funny, it isn't merch. It's a brochure with a logo on it.",
    content: [
      "Every brand eventually makes a candle. The good ones make something you'd actually steal. We asked six studios what their best-selling object is and got: a mug, a deck, a skate tool, a set of stickers, a hoodie, and a single earring.",
      "The sticker always wins. It's the cheapest way to let people vandalise your identity — and the only brand asset that gets better when it's destroyed.",
      "If your merch needs a caption to be funny, it isn't merch. It's a brochure with a logo on it.",
      "ITEMS: Game Mess Mascot Mark | Pink Zebra Socks (R280, sold out in 11m) | The Issue 03 Lighter (R90) | Sticker Pack (R60) | Deck 7.75\" (R1 200) | Skate Tool (R310) | Single Earring (R140)",
      "COMING IN ISSUE 04: THE BORING ISSUE (Grids, Invoices, and the Art of Finishing on Time)"
    ],
    tags: ["Merch", "Apparel", "Stickers", "Studio Commerce"]
  },
  {
    pageNumber: 16,
    folio: "64",
    title: "American Dream, Idling",
    subtitle: "Shot on a residential street outside Pretoria at 17:52",
    department: "Photo Essay",
    author: "Ph. L. Dube",
    imageSrc: "./assets/pages/page-16.png",
    summary: "Nothing was on fire. Everything was on fire. Visual centerpiece featuring a burning muscle car, fur coat, couch, and two Dobermans.",
    pullQuote: "Nothing was on fire. Everything was on fire.",
    content: [
      "PHOTO ESSAY / 64 | PHOTOGRAPHY: L. DUBE",
      "AMERICAN DREAM, IDLING",
      "Shot on a residential street outside Pretoria at 17:52.",
      "Nothing was on fire. Everything was on fire."
    ],
    tags: ["Photo Essay", "Pretoria", "Cinema", "Dube"]
  },
  {
    pageNumber: 17,
    folio: "65",
    title: "Everything Cool Is Somebody's Second Try",
    subtitle: "The most expensive-looking work in this issue was made with nothing",
    department: "Photo Essay Continued",
    author: "L. Dube",
    imageSrc: "./assets/pages/page-17.png",
    summary: "The couch was R450 from a marketplace listing that said 'must collect.' The car belonged to a friend of a friend who wanted it out of his yard.",
    pullQuote: "Money buys polish. Polish is not the same as point of view.",
    content: [
      "The couch was R450 from a marketplace listing that said 'must collect.' The car belonged to a friend of a friend who wanted it out of his yard. The dogs are real, the fire is real, and the whole scene cost less than one hour of studio time.",
      "That's the essay: the most expensive-looking work in this issue was made with nothing. Money buys polish. Polish is not the same as point of view.",
      "We keep asking young designers what equipment they need. The honest answer is always the same — a favour from somebody with a bigger garage than you.",
      "FIG A — DOGS, UNBOTHERED | FIG B — THE FIRE, UNLICENSED",
      "CREDITS: Photography: L. Dube, K. Molefe | Styling: A. Nkosi (Own Wardrobe) | Retouch: Studio Soft Error | Location: Someone's Actual Street"
    ],
    tags: ["Essay", "Production", "DIY", "Viewpoint"]
  },
  {
    pageNumber: 18,
    folio: "70",
    title: "Notes From The Group Chat",
    subtitle: "Off the record agency messages & soundtrack",
    department: "Off The Record",
    imageSrc: "./assets/pages/page-18.png",
    summary: "Real studio confessions, client revision humor, hiring notice, and the soundtrack that powered the issue.",
    pullQuote: "Print is not dead, it's just loud.",
    content: [
      "SIPHO (09:14): client said 'make it pop but keep it minimal' so i made it minimal and popped",
      "GROUP: they'll ask for the logo bigger. they always ask for the logo bigger.",
      "NALEDI (09:16): sent two options. one is good, one is what they asked for. that's the service.",
      "DAISY (09:31): rendered for 9 hours. exported the wrong frame. shipped it. it's on a billboard in rosebank now.",
      "THE SOUNDTRACK TO THIS ISSUE:",
      "01 — Loud on a Tuesday (03:41)",
      "02 — Kerning Blind (02:58)",
      "03 — Render Farm Blues (04:12)",
      "04 — Invoice (Interlude) (01:07)",
      "05 — Screen Share (03:22)",
      "WE'RE HIRING: One designer. One intern. Zero meetings before 10am."
    ],
    tags: ["Group Chat", "Soundtrack", "Studio Life", "Culture"]
  },
  {
    pageNumber: 19,
    folio: "73",
    title: "Colophon",
    subtitle: "Issue 03: Printed Nowhere, Read Everywhere",
    department: "Colophon",
    imageSrc: "./assets/pages/page-19.png",
    summary: "STATIC° is an independent magazine about the people who make loud things for a living — designers, editors, renderers, coders, brand people and the interns who fixed it at 3am.",
    content: [
      "EDITORIAL: Editor-in-Chief: N. Mokoena | Deputy: T. Adesanya | Photo: K. Molefe, L. Dube | Words: S. Radebe, A. Nkosi | Design: Studio Soft Error | Cover: T-Bone Mahlangu",
      "TYPE: Display: Anton | Text: Archivo | Data: Space Mono",
      "PRINT: 4/4 Offset, 120gsm uncoated, deliberately",
      "FIND US: @static.mag | staticmag.cc | Polokwane · Joburg · Lagos",
      "WITH THANKS: Everyone who answered a 9pm voice note · The people who lent us a garage · The intern who re-rendered frame 0841 four times · The client who said 'no notes'",
      "CORRECTIONS: Issue 02 printed the wrong name on page 41. We're still sorry, Sipho.",
      "FIG 4 — PAGES BY DEPARTMENT: Type · Film · Render · Code · Object · Brand"
    ],
    tags: ["Colophon", "Masthead", "Credits", "Specs"]
  },
  {
    pageNumber: 20,
    folio: "74",
    title: "Part Two — The Portfolio",
    subtitle: "Part one was the departments. This is the work.",
    department: "Part Two",
    imageSrc: "./assets/pages/page-20.png",
    summary: "Ten pictures, ten arguments, two things that move — type, colour, scale, authorship, truth, desks, depth, tutorials, a wrap, a lollipop and a can of energy drink.",
    pullQuote: "Everything here started as somebody's 11pm idea.",
    content: [
      "PART ONE WAS THE DEPARTMENTS. THIS IS THE WORK.",
      "TEN PICTURES, TEN ARGUMENTS, TWO THINGS THAT MOVE — TYPE, COLOUR, SCALE, AUTHORSHIP, TRUTH, DESKS, DEPTH, TUTORIALS, A WRAP, A LOLLIPOP AND A CAN OF ENERGY DRINK.",
      "76 — Type you can wear (TYPE)",
      "80 — One colour, no mercy (COLOUR)",
      "84 — Scale is a joke (COMP)",
      "88 — Write your own story (ESSAY)",
      "92 — Spot the fake (TRUTH)",
      "96 — Desks of the industry (KIT)",
      "100 — UI that stands up (3D)",
      "104 — Random tutorials (MOTION)",
      "108 — Cover it in cartoons (PRODUCT)",
      "112 — Sweetcore (PACKAGING)",
      "120 — A page that moves (VIDEO)",
      "128 — Ctrl+Alt+Refresh (ADVERT)",
      "132 — Outside (OUTRO)"
    ],
    tags: ["Portfolio", "Part Two", "Directory"]
  },
  {
    pageNumber: 21,
    folio: "76",
    title: "Type You Can Wear",
    subtitle: "A letterform the size of a torso, and a face doing the rest",
    department: "Portfolio 01 — Type & Image",
    imageSrc: "./assets/pages/page-21.png",
    summary: "The Sei Series: Campaign for Midnight Odyssey. Shot 2026, one lens, one light. Not a serif in sight.",
    pullQuote: "A letterform the size of a torso, and a face doing the rest.",
    content: [
      "PART TWO / 76 | TYPE & IMAGE | THE SEI SERIES",
      "TYPE YOU CAN WEAR",
      "A letterform the size of a torso, and a face doing the rest.",
      "Campaign for Midnight Odyssey / Shot 2026 / One lens, one light.",
      "NOT A SERIF IN SIGHT"
    ],
    tags: ["Editorial", "Fashion", "Eyewear", "Typography"]
  },
  {
    pageNumber: 22,
    folio: "77",
    title: "Letters As a Logo",
    subtitle: "The type is the wardrobe. Three letters, set 480 points tall.",
    department: "Portfolio 01 — Type",
    author: "A. Nkosi, L. Dube",
    imageSrc: "./assets/pages/page-22.png",
    summary: "Cropped so hard that the woman has to fit around them — and somehow she still wins the frame.",
    pullQuote: "If the type can be cropped, it can be worn.",
    content: [
      "The trick in this campaign is that nothing is dressed. The type is the wardrobe. Three letters, set 480 points tall, cropped so hard that the woman has to fit around them — and somehow she still wins the frame.",
      "Type used to sit beside the picture, politely, in the caption. Now it walks in front of the camera. That only works if the crop is ruthless and the letterforms are flat enough to read as objects.",
      "Note what's missing: no gradient, no drop shadow, no 'designed' effect. A single orange, one weight, and the confidence to let the edge of the frame amputate the last letter.",
      "FIG 1 — THE THREE LETTERS: Cap Height 480pt, Tracking -3",
      "THE PALETTE: #FF6A00, #E55700, #FF8A33 (Lens yellows picked up the same heat as the type)",
      "CREDITS: Art Direction: A. Nkosi | Photography: L. Dube | Type: Anton, 480pt, cropped | Retouch: Studio Soft Error | Client: Midnight Odyssey"
    ],
    tags: ["Typography", "Anton", "Art Direction", "Palette"]
  },
  {
    pageNumber: 23,
    folio: "80",
    title: "One Colour, No Mercy",
    subtitle: "Walls, floor, steps, a 1989 Citi Golf and one very calm model",
    department: "Portfolio 02 — Colour",
    imageSrc: "./assets/pages/page-23.png",
    summary: "When the brief says 'own a colour', this is what owning looks like. Puma × Midnight.",
    pullQuote: "When the brief says 'own a colour', this is what owning looks like.",
    content: [
      "PORTFOLIO 02 / 80 | COLOUR | PUMA × MIDNIGHT",
      "ONE COLOUR, NO MERCY",
      "Walls, floor, steps, a 1989 Citi Golf and one very calm model.",
      "When the brief says 'own a colour', this is what owning looks like."
    ],
    tags: ["Colour", "Monochrome", "Citi Golf", "Puma"]
  },
  {
    pageNumber: 24,
    folio: "81",
    title: "The Forty-Shade Problem",
    subtitle: "Anyone can paint a room one colour. The work is forty oranges.",
    department: "Portfolio 02 — Colour Continued",
    imageSrc: "./assets/pages/page-24.png",
    summary: "Matt plaster, glossy paint, suede, leather, the car's faded plastic bumper, the model's skin in warm bounce.",
    pullQuote: "If the car looks new, we've failed.",
    content: [
      "Anyone can paint a room one colour. The work is that there are forty oranges in this frame and each one is a different material: matt plaster, glossy paint, suede, leather, the car's faded plastic bumper, the model's skin in warm bounce.",
      "The art director's note taped to the wall said “if the Golf looks new, we've failed.” They shot it at 2pm so the sun would drag one long shadow across the floor and prove the room had a ceiling.",
      "BUILD: Set: Four flats, one platform, one step — all painted on site | Props: A car with a story | Casting: One model, no shoes change",
      "NUMBERS: 1 Colour · 7 Materials | 3 Shooting Days | 140 Litres of Paint | 0 of it wasted",
      "ONE DAY, THREE LIGHTS: 09:00 Paint still tacky · 13:40 Sun hits the stairwell, the car finally looks old · 15:10 Shadow crosses the floor. Shoot it. Stop talking."
    ],
    tags: ["Set Design", "Colour Theory", "Materials", "Lighting"]
  },
  {
    pageNumber: 25,
    folio: "84",
    title: "Scale Is a Joke",
    subtitle: "A man, a red coat, and the Union Buildings pretending not to notice",
    department: "Portfolio 03 — Comp",
    imageSrc: "./assets/pages/page-25.png",
    summary: "Pretoria, 1:1. Shot at 11am — so the shadow had to be invented, not observed. Do not scale this up.",
    pullQuote: "The shadow had to be invented, not observed.",
    content: [
      "PORTFOLIO 03 / 84 | COMP | PRETORIA, 1:1",
      "SCALE IS A JOKE",
      "A man, a red coat, and the Union Buildings pretending not to notice.",
      "Shot at 11am — so the shadow had to be invented, not observed.",
      "DO NOT SCALE THIS UP"
    ],
    tags: ["Compositing", "Pretoria", "Union Buildings", "Scale"]
  },
  {
    pageNumber: 26,
    folio: "85",
    title: "How to Put a Man on a Building",
    subtitle: "Five passes. The shadow is the whole trick.",
    department: "Portfolio 03 — Compositing",
    imageSrc: "./assets/pages/page-26.png",
    summary: "Anyone who says compositing is one click has never tried to invent a shadow that matches eleven o'clock sun on a sandstone facade.",
    pullQuote: "The shadow is the whole trick. 14 layers · 1 invented shadow · 0 giants.",
    content: [
      "Five passes. Anyone who says compositing is one click has never tried to invent a shadow that matches eleven o'clock sun on a sandstone facade.",
      "01 Plate, clean: Drone + ground-level. Same hour, same weather, no people in the way.",
      "02 Cut her out, keep the curl: Every edge of that hair had to survive the mask. Three hours, one jacket.",
      "03 Invent the shadow: A 190-metre figure at 11am would throw a shadow across two blocks. Drawn by hand, then blurred by distance.",
      "04 Match the air: Highveld haze: 8% warm lift on the background, 3% on him, or he floats.",
      "05 Grain, last: One grain layer over everything. It is the only thing that makes a comp look photographed.",
      "STATS: 14 Layers · 1 Invented Shadow · 0 Giants"
    ],
    tags: ["VFX", "Compositing", "Photoshop", "Matte Painting"]
  },
  {
    pageNumber: 27,
    folio: "88",
    title: "Write Your Own Story",
    subtitle: "Every brief arrives with a story already half-written",
    department: "Portfolio 04 — Authorship",
    imageSrc: "./assets/pages/page-27.png",
    summary: "The job is deciding which half you're willing to redraft. Vintage typewriter with glitch chromatic aberration.",
    pullQuote: "Every brief arrives with a story already half-written. The job is deciding which half you're willing to redraft.",
    content: [
      "PORTFOLIO 04 / 88 | ESSAY | 4 MIN",
      "SUBJECT: .....",
      "WRITE YOUR OWN STORY.",
      "Every brief arrives with a story already half-written. The job is deciding which half you're willing to redraft."
    ],
    tags: ["Authorship", "Writing", "Typewriter", "Creative Control"]
  },
  {
    pageNumber: 28,
    folio: "89",
    title: "Who's Holding the Pen?",
    subtitle: "How a portfolio stops being a résumé and starts being an argument",
    department: "Portfolio 04 — Essay",
    imageSrc: "./assets/pages/page-28.png",
    summary: "Three exercises if you're stuck, and the honest Pen Test checklist.",
    pullQuote: "The pen is not a metaphor. Somebody in the room decides what this thing means. Make sure it's the person who cares most.",
    content: [
      "There is a version of this job where you are handed a sentence and asked to make it look expensive. There is another where you are handed a blank page and told to be brave. Most weeks are the first version, and that's fine — invoices are real.",
      "But the studios that last keep one project a year in the second category. Unpaid, unasked-for, usually ugly for the first two weeks. It's how a portfolio stops being a résumé and starts being an argument.",
      "So: pick a subject nobody briefed you on. Give it a typeface, a colour, one photograph and a sentence you actually believe. Put it where clients can see it. That's the whole exercise — the rest is admin.",
      "THREE EXERCISES IF YOU'RE STUCK:",
      "01 Redraft the brief. Take a real job, throw away the client's opening line, and write the one you wish they'd sent. Design that.",
      "02 One image, one word. No layout tricks. If it doesn't work at that size, the idea was never there.",
      "03 Show the mess. Post the rejected version next to the chosen one. People trust the studio that can explain a no.",
      "THE PEN TEST — ANSWER HONESTLY: Can you name the decision that was only yours? Would you show the rejected version in a room? Does your name survive the caption?"
    ],
    tags: ["Essay", "Career", "Creative Agency", "Portfolio Strategy"]
  },
  {
    pageNumber: 29,
    folio: "92",
    title: "Spot the Fake",
    subtitle: "100% real pixels, 0% real — 8 tell-tales",
    department: "Portfolio 05 — Truth",
    imageSrc: "./assets/pages/page-29.png",
    summary: "A neon-soaked gas station encounter with luxury bags and cash. 8 clues to determine synthetic image generation.",
    pullQuote: "100% real pixels, 0% real.",
    content: [
      "PORTFOLIO 05 / 92 | TRUTH | 8 TELL-TALES",
      "100% REAL PIXELS, 0% REAL",
      "SPOT THE FAKE — ANSWERS OVERLEAF, DON'T PEEK:",
      "01 · The hands, always the hands",
      "02 · One logo crisp, the next one smeared",
      "03 · Money that folds like paper",
      "04 · Reflections that don't agree",
      "05 · A foreground too clean for a wet forecourt"
    ],
    tags: ["AI", "Synthetic Media", "Deepfake", "Verification"]
  },
  {
    pageNumber: 30,
    folio: "93",
    title: "The Uncanny Business",
    subtitle: "Two years ago this page would have been a novelty. Now it's a Tuesday.",
    department: "Portfolio 05 — Answers",
    imageSrc: "./assets/pages/page-030.png".replace('030', '30'),
    summary: "Half the reference decks we get show images nobody shot. They're paying for the idea, not the pixels.",
    pullQuote: "Taste is the job. It always was — the tools just got louder.",
    content: [
      "HOW WE DID:",
      "01 Hands: ✕ WRONG — They got the rings right",
      "02 Logos: ✓ THE PYLON SIGN GIVES IT AWAY",
      "03 Folded money: ✓ NOTE THE NOTES ON THE FLOOR",
      "04 Reflections: ✕ WRONG — The wet floor is perfect",
      "THE UNCANNY BUSINESS: Two years ago this page would have been a novelty. Now it's a Tuesday. Half the reference decks we get show images nobody shot, and the client is not confused about that — they're paying for the idea, not the pixels.",
      "Which puts retouchers in a strange place. The craft hasn't disappeared; it moved. Someone still has to decide that the shadow is wrong, that the label should be one degree off, that the bag on the roof needs a strap that actually works.",
      "Taste is the job. It always was — the tools just got louder.",
      "HOUSE RULE: Every image in this issue that wasn't photographed is captioned as such. No exceptions, no small print. [82% score]",
      "THE 60-SECOND CHECK BEFORE YOU REPOST: 1. Zoom the hands. Then zoom them again. 2. Follow every reflection back to a source. 3. Pick one shadow and check its logic. 4. Read the logo out loud, letter by letter."
    ],
    tags: ["Truth", "Fact Check", "AI Detection", "Craft"]
  },
  {
    pageNumber: 31,
    folio: "96",
    title: "Desks of the Industry",
    subtitle: "Three posts, one campaign and a clock that hasn't moved since lunch",
    department: "Portfolio 06 — Kit",
    imageSrc: "./assets/pages/page-31.png",
    summary: "15:59 Studio monitor setup. The blue light is doing nothing for the colour accuracy. Nobody cares.",
    pullQuote: "Colour-managed? Sort of.",
    content: [
      "PORTFOLIO 06 / 96 | KIT | 15:59",
      "COLOUR-MANAGED? SORT OF.",
      "DESKS OF THE INDUSTRY",
      "Three posts, one campaign and a clock that hasn't moved since lunch. The blue light is doing nothing for the colour accuracy. Nobody cares."
    ],
    tags: ["Workstation", "Studio", "Hardware", "Workflow"]
  },
  {
    pageNumber: 32,
    folio: "97",
    title: "What's Actually on the Desk",
    subtitle: "The answer tells you how the work actually gets made",
    department: "Portfolio 06 — Kit Continued",
    imageSrc: "./assets/pages/page-32.png",
    summary: "A mic for the client call, a stream deck for the export, a lamp bought for the webcam and used for the retouch.",
    pullQuote: "The desk is a self-portrait. A second monitor changes your speed. A calibrated one changes your reputation.",
    content: [
      "Nobody asks the useful question, which is not 'what camera' but 'what do you keep within reach'. The answer tells you how the work actually gets made: a mic for the client call, a stream deck for the export, a lamp bought for the webcam and used for the retouch.",
      "1 — BenQ 32\" + bias light: R11 400",
      "2 — Stream deck, 15 keys: R2 900",
      "3 — Condenser mic + boom: R3 250",
      "4 — The cheap RGB lamp: R420",
      "5 — Two-thirds of a desk mat: R180",
      "6 — Notes app, 340 unread: FREE",
      "THE ONE UPGRADE: A second monitor changes your speed. A calibrated one changes your reputation.",
      "THE ONE REGRET: Every ring light ever bought. All of them. Without exception.",
      "FIG. 6 — THE SAME DESK, 15:59. Three posts open, forty-one unread."
    ],
    tags: ["Desk Setup", "Tools", "Monitors", "Hardware"]
  },
  {
    pageNumber: 33,
    folio: "100",
    title: "Turn It Into a Room",
    subtitle: "Make the app feel physical. Glassmorphism, but earned.",
    department: "Portfolio 07 — 3D + UI",
    imageSrc: "./assets/pages/page-33.png",
    summary: "A keyboard you could trip over. A calendar you could walk into. A character with better posture than the entire team.",
    pullQuote: "A keyboard you could trip over. A calendar you could walk into.",
    content: [
      "PORTFOLIO 07 / 100 | 3D + UI | LAUNCH ASSET",
      "GLASSMORPHISM, BUT EARNED",
      "THE BRIEF: 'Make the app feel physical.'",
      "A keyboard you could trip over. A calendar you could walk into. A character with better posture than the entire team.",
      "TURN IT INTO A ROOM. BUILT IN BLENDER · COMPED IN AE"
    ],
    tags: ["3D UI", "Blender", "After Effects", "Launch Asset"]
  },
  {
    pageNumber: 34,
    folio: "101",
    title: "Build the Set, Then Light It",
    subtitle: "Every icon in the shot is a real object before it is a symbol",
    department: "Portfolio 07 — Interface",
    author: "T. Mokoena, N. Dlamini, K. April",
    imageSrc: "./assets/pages/page-34.png",
    summary: "Model it once at human scale, light it like a room, then shoot it at icon distance. Glass is cheap. Depth is the expensive part.",
    pullQuote: "Glass is cheap. Depth is the expensive part.",
    content: [
      "Every icon in the shot is a real object before it is a symbol. Model it once at human scale, light it like a room, then shoot it at icon distance. The moment you draw a bell instead of building one, the app looks like everyone else's app.",
      "PASS 01: Block the set | PASS 02: Light the room | PASS 03: Shoot at icon size",
      "48 HOURS: of render for the keyframe. Eleven seconds of scroll. Zero complaints from the client, which is the real anomaly.",
      "CREDITS: Art direction: T. Mokoena | 3D + render: N. Dlamini | Motion: K. April",
      "FIG. 7 — MASTER FRAME. The calendar, the badges and that bloom are all physical objects."
    ],
    tags: ["Interface", "Lighting", "Rendering", "Icons"]
  },
  {
    pageNumber: 35,
    folio: "104",
    title: "Random Tutorials",
    subtitle: "The poster that taught a room to animate",
    department: "Portfolio 08 — Motion Archive",
    imageSrc: "./assets/pages/page-35.png",
    summary: "A talk with no syllabus, illustrated with screenshots of somebody's desktop. Every folder is misspelled. Every folder works.",
    pullQuote: "Every folder is misspelled. Every folder works.",
    content: [
      "PORTFOLIO 08 / 104 | MOTION ARCHIVE",
      "FILED UNDER: HEW DOWNLOADS",
      "RANDOM TUTORIALS: Random Tutorial from Your Top Telegram Questions!?",
      "THE POSTER THAT TAUGHT A ROOM TO ANIMATE",
      "A talk with no syllabus, illustrated with screenshots of somebody's desktop. Every folder is misspelled. Every folder works."
    ],
    tags: ["Tutorial", "Archive", "Motion Graphics", "Desktop"]
  },
  {
    pageNumber: 36,
    folio: "105",
    title: "Anatomy of a 2AM Tutorial",
    subtitle: "A dancer, a desktop, and a timestamp",
    department: "Portfolio 08 — Motion Continued",
    imageSrc: "./assets/pages/page-36.png",
    summary: "Nobody learns motion design in a lecture theatre. If it can't be explained in 40 seconds, screen-record it.",
    pullQuote: "Nobody teaches you the good stuff. If it can't be explained in 40 seconds, screen-record it.",
    content: [
      "Nobody learns motion design in a lecture theatre. Somebody sends a 40-second screen recording at 01:40 with three arrows drawn on it and no audio, and that is the curriculum. This poster is the whole pedagogy: a dancer, a desktop, and a timestamp.",
      "01 The title is a font that arrived free on a CD in 1998.",
      "02 Arrows drawn by hand, never straight, always pointing at the obvious bit.",
      "03 Folders from an operating system nobody has used since 2001.",
      "04 One circled file, spelled wrong, and it is the one that renders.",
      "05 A date, a venue, a name — proof it happened, not a moodboard.",
      "06 A person mid-move, so the screen never has to explain itself.",
      "THE FORTY-SECOND RULE: 01:40 The question gets asked · 01:52 The answer, with arrows · 09:00 It ships in the deck.",
      "FIG. 8 — DETAIL: 28.09.25 | MODERN ART PAVILION | Spike Jonze"
    ],
    tags: ["Pedagogy", "Screen Recording", "Spike Jonze", "Tutorial"]
  },
  {
    pageNumber: 37,
    folio: "108",
    title: "Cover It In Cartoons",
    subtitle: "The car is the mannequin",
    department: "Portfolio 09 — Product Livery",
    imageSrc: "./assets/pages/page-37.png",
    summary: "Not one panel was painted. Two thousand rand of vinyl and a very serious conversation about which character goes on the door.",
    pullQuote: "The car is the mannequin. Two thousand rand of vinyl and a very serious conversation.",
    content: [
      "PORTFOLIO 09 / 108 | PRODUCT LIVERY",
      "THE CAR IS THE MANNEQUIN",
      "COVER IT IN CARTOONS",
      "Not one panel was painted. Two thousand rand of vinyl and a very serious conversation about which character goes on the door.",
      "SHOOT 04 — TOP-DOWN: 23H20 · 24MM · F8"
    ],
    tags: ["Itasha", "Automotive", "Vinyl Wrap", "Anime"]
  },
  {
    pageNumber: 38,
    folio: "109",
    title: "One Car, Two Colour Temperatures",
    subtitle: "Itasha — 'painful car' — is the Japanese word for exactly this",
    department: "Portfolio 09 — Livery Breakdown",
    imageSrc: "./assets/pages/page-38.png",
    summary: "A supercar wearing a cartoon. Same vehicle, same wrap, four setups in one night, and it changes temperature every time the lighting does.",
    pullQuote: "The wrap is the product. The car is the mannequin.",
    content: [
      "Itasha — 'painful car' — is the Japanese word for exactly this: a supercar wearing a cartoon. Half the internet calls it a crime and the other half photographs it, which is the entire business case. Same vehicle, same wrap, four setups in one night, and it changes temperature every time the lighting does.",
      "BUILD: 41 Printed Panels · 6 sq m cast vinyl | 19 Hours, two people | 1 blade spent on the arches | Doors and sills done off-car",
      "NUMBERS: R18 400 — Print + Install | 5 Years vinyl life | 0 panels repainted · 3 days to go viral | ∞ opinions, unbilled",
      "SHOT KELVIN TABLE:",
      "• 18h40 Concourse (5600K): Reads as colour — The one the client posts",
      "• 22h10 Forecourt (7000K): Reads as warning — The one the internet shares",
      "• 23h20 Top-Down (6500K): Reads as a target — The one we put on p.108"
    ],
    tags: ["Automotive Wrap", "Lighting Temperature", "Kelvin", "Itasha"]
  },
  {
    pageNumber: 39,
    folio: "112",
    title: "Lollipop Android 5.1 / Sweetcore",
    subtitle: "Cognition, encoded in candy",
    department: "Portfolio 10 — 3D / Packaging",
    imageSrc: "./assets/pages/page-39.png",
    summary: "A phone operating system, rendered as confectionery. The brain is licensed stock; everything else was modelled after a 3am sugar run.",
    pullQuote: "When sweetness meets consciousness, memory becomes edible. Consume with care.",
    content: [
      "PORTFOLIO 10 / 112 | 3D / PACKAGING",
      "CONSUME WITH CARE",
      "LOLLIPOP Android 5.1",
      "SPEC: Version 5.1 · API 22 | Build 2015.03.12 | Kernel 3.10.61 | Memory 2GB LPDDR3 | Storage 16GB Flash | State: DREAMING",
      "“COGNITION, ENCODED IN CANDY.” When sweetness meets consciousness, memory becomes edible.",
      "PROTOTYPE // SERIES SWEETCORE v5.1 · CONSUME WITH CARE // NEURAL CANDY LAB",
      "PRIMARY // NEURAL NODE"
    ],
    tags: ["Sweetcore", "Packaging", "Android", "C4D Render"]
  },
  {
    pageNumber: 40,
    folio: "113",
    title: "Anatomy of a Sweetcore Render",
    subtitle: "The brief was three words long: 'make the OS edible'",
    department: "Portfolio 10 — Packaging Continued",
    imageSrc: "./assets/pages/page-40.png",
    summary: "Sugar shell for the gloss, a real brain for the horror, chrome clamps for the engineering credibility.",
    pullQuote: "Sweetness meets consciousness. Memory goes edible.",
    content: [
      "The brief was three words long — 'make the OS edible' — and the answer was a spec sheet you can suck. Sugar shell for the gloss, a real brain for the horror, chrome clamps for the engineering credibility. The joke only lands because every material is lit correctly.",
      "SIX PASSES:",
      "01 Sugar shell first — three litres of red refractor, no brain yet.",
      "02 The brain, scanned and re-meshed until the folds stopped looking polite.",
      "03 Chrome clamps and the stick — the only objects in the frame with a warranty.",
      "04 Dotted navigation lines and crosshairs — the diagram on top of the picture.",
      "05 Two defocused lollipops, front-left, so the frame has depth and a witness.",
      "06 Spec type last. If the numbers aren't true, the picture is just a sweet.",
      "FIG. 9 — DETAIL. Refraction does the rest: one shell, nine internal bounces.",
      "DO NOT LICK THE RENDER."
    ],
    tags: ["Refraction", "Packaging Design", "Sweetcore", "3D Modeling"]
  },
  {
    pageNumber: 41,
    folio: "120",
    title: "A Page That Moves",
    subtitle: "Five seconds, 600 pixels wide, 118 kilobytes",
    department: "Portfolio 11 — Motion Test 01",
    imageSrc: "./assets/pages/page-41.png",
    summary: "A wordmark sliding through frame, embedded in the file. It plays on a plane with no wifi.",
    pullQuote: "Not a GIF. Embedded in the file. It plays on a plane with no wifi.",
    content: [
      "PORTFOLIO 11 / 120 | MOTION TEST 01",
      "PLAYING · 00:05 LOOP · MUTED",
      "NOT A GIF",
      "STATIC ON MOTION",
      "A PAGE THAT MOVES",
      "Five seconds, 600 pixels wide, 118 kilobytes — a wordmark sliding through frame, embedded in the file. It plays on a plane with no wifi.",
      "00:00 · INLINE LOOP · TAP TO PAUSE · 01 / 01"
    ],
    tags: ["Motion Design", "Micro-Video", "Inline Loop", "Kinetic Type"]
  },
  {
    pageNumber: 42,
    folio: "121",
    title: "How Long Is a Loop?",
    subtitle: "Four to six seconds is a sentence; twenty is a hostage situation",
    department: "Portfolio 11 — Motion Continued",
    imageSrc: "./assets/pages/page-42.png",
    summary: "Every clip in this issue is silent, muted and looping, because a magazine that makes noise in a client meeting gets closed.",
    pullQuote: "A four-second loop is a paragraph.",
    content: [
      "Long enough to notice, short enough that nobody waits for it to end. Four to six seconds is a sentence; twenty is a hostage situation. Every clip in this issue is silent, muted and looping, because a magazine that makes noise in a client meeting gets closed.",
      "HOUSE RULES:",
      "01 Muted, always. Sound is an opt-in, never a default.",
      "02 The first frame has to work as a still, because sometimes it is one.",
      "03 Loop on a movement that resolves, or the seam becomes the story.",
      "04 Under 300 KB, or the whole issue gets slow to open.",
      "WEIGHT IN FILE: Motion Test 01 (5.0s, 118 KB raw) | Push Test 02 (4.0s, 56 KB raw) | Whole issue: 6.2 MB still one file.",
      "GIF vs AUTOPLAY vs PRINT comparison.",
      "H.264 · YUV420P · FASTSTART · NO AUDIO TRACK"
    ],
    tags: ["Looping", "Compression", "Video Specs", "House Rules"]
  },
  {
    pageNumber: 43,
    folio: "128",
    title: "Ctrl+Alt+Refresh",
    subtitle: "A 420ml can of mint, lemon and apple that tells you to reload",
    department: "Portfolio 12 — Product Advert",
    author: "Studio Soft Error / K. April",
    imageSrc: "./assets/pages/page-43.png",
    summary: "The whole campaign is one instruction and one spinner. No athlete, no desert, no helicopter. Just fruit arriving on a wet surface at 24 frames a second until the logo lands and the screen goes black.",
    pullQuote: "Reboot your vibe. F5.",
    content: [
      "PORTFOLIO 12 / 128 | PRODUCT",
      "REBOOT YOUR VIBE — F5",
      "CTRL + ALT + REFRESH",
      "A 420ml can of mint, lemon and apple that tells you to reload.",
      "The whole campaign is one instruction and one spinner. No athlete, no desert, no helicopter. Just fruit arriving on a wet surface at 24 frames a second until the logo lands and the screen goes black.",
      "THE ONLY GREEN IN THE ISSUE: Can #17503C, Mint #2F8A5E, Lemon #E8D23C, Silver #C9CCC9",
      "DELIVERED AS: 1 × 6.0s Vertical Master (720×1280) | 1 × Cutdown for feed (4s) | 1 × Silent loop for in-store screens | 3 × Stills: Lineup, Carrier, Hero",
      "CREDITS: Client: CTRL+ALT+REFRESH | Direction · 3D: Studio Soft Error | Product design: K. April | Format: 9:16 Master, 6.0 sec"
    ],
    tags: ["Product Advert", "Energy Drink", "3D Commercial", "Brand Design"]
  },
  {
    pageNumber: 44,
    folio: "129",
    title: "Six Seconds, One Can",
    subtitle: "The can loads, like everything else in your life at 3pm",
    department: "Portfolio 12 — Breakdown",
    imageSrc: "./assets/pages/page-44.png",
    summary: "Five beats, no dialogue, one idea — and three stills that have to work without any of it.",
    pullQuote: "The can loads, like everything else.",
    content: [
      "Five beats, no dialogue, one idea — and three stills that have to work without any of it. The edit lands the logo exactly when the spinner would have finished: the can loads, like everything else in your life at 3pm.",
      "THE STILLS THAT SELL IT:",
      "Still 01: Three finishes (matte mint, gloss forest, anodised silver)",
      "Still 02: The Carrier (one lockup, one spinner, facet geometry)",
      "Still 03: The Hero (reboot your vibe, one key)",
      "BEAT SHEET:",
      "00.00 Mint, in freefall — Macro leaves, out of focus, no product yet. Establishes 'fresh' without saying it.",
      "02.00 The can lands — Soft drop, single bounce. Wet body. 'Loading...' already spinning on the label.",
      "03.60 Fruit enters, water argues — Lemon, apple and a splash rig at 240fps, retimed to 24.",
      "04.80 Push to label — One move, no cut. The spinner fills the frame — it is the product's only logo.",
      "05.10 Black card — CTRL+ALT+REFRESH in white. Half a second, which is all a name gets."
    ],
    tags: ["Beat Sheet", "Commercial Breakdown", "Packaging", "Editing"]
  },
  {
    pageNumber: 45,
    folio: "132",
    title: "Outside",
    subtitle: "Everything in this part was made indoors: three screens, one lamp, a chair that has opinions",
    department: "Part Two — End",
    imageSrc: "./assets/pages/page-45.png",
    summary: "Then it goes outside, onto a wall, a feed, a phone in a queue at the taxi rank — and either it holds or it doesn't.",
    pullQuote: "See you on the street. Next Issue: STATIC° 04 — The Quiet Issue.",
    content: [
      "PART TWO — END 132 | OUTSIDE",
      "SEE YOU ON THE STREET",
      "Everything in this part was made indoors: three screens, one lamp, a chair that has opinions. Then it goes outside, onto a wall, a feed, a phone in a queue at the taxi rank — and either it holds or it doesn't. Nobody in the studio gets to vote after that.",
      "BY THE NUMBERS:",
      "• 12 Stories in this part",
      "• 238 Assets made for twelve pages",
      "• 0 Stock images in the folio",
      "• 11PM Average start of the good idea",
      "HOLDS: One idea, no committee. A face with a witness. A colour you can name from across the road.",
      "DOESN'T: Nine typefaces, four CTAs, and a stock photo of a handshake. All of those exist. All of them are still being made.",
      "NEXT ISSUE: STATIC° 04 — The Quiet Issue | hey@staticmag.cc | @static.mag"
    ],
    tags: ["Outro", "The Quiet Issue", "Manifesto", "Closing"]
  },
  {
    pageNumber: 46,
    folio: "Back Cover",
    title: "Turn It Up",
    subtitle: "Get Issue 04 Before the Intern Does",
    department: "End / Back Cover",
    imageSrc: "./assets/pages/page-46.png",
    isCover: true,
    summary: "If a page in here made you want to open a file, then it worked. Send us what you make: hey@staticmag.cc.",
    pullQuote: "This magazine is 100% recyclable. So is your logo.",
    content: [
      "ISSUE 03 | END / BACK COVER",
      "TURN IT UP.",
      "If a page in here made you want to open a file, then it worked. Send us what you make.",
      "hey@staticmag.cc",
      "STATIC° — A MAGAZINE ABOUT MAKING LOUD THINGS",
      "GET ISSUE 04 BEFORE THE INTERN DOES (Scan / Subscribe ↗)",
      "Free, forever, obviously.",
      "THIS MAGAZINE IS 100% RECYCLABLE. SO IS YOUR LOGO.",
      "NO COOKIES WERE HARMED. WE DON'T EVEN HAVE A WEBSITE THAT WORKS.",
      "BARCODE: 0 335 00001 55444 | NEXT: THE BORING ISSUE"
    ],
    tags: ["Back Cover", "Subscribe", "Recyclable", "Issue 04"]
  }
];
