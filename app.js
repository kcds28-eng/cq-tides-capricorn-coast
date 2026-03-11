/* ============================================================
   CQ TIDES — Rockhampton & Capricorn Coast
   app.js — All data, logic, rendering
   ============================================================ */
'use strict';

// ── Config ───────────────────────────────────────────────────
const REFRESH_MS    = 5 * 60 * 1000;  // 5 minutes
const RADAR_STEP_MS = 8000;            // 8 s per radar frame

// ── Locations ────────────────────────────────────────────────
const LOCATIONS = {
  rosslyn_bay:  { name: 'Rosslyn Bay Harbour', short: 'Rosslyn Bay',  lat: -23.16, lng: 150.78, tideOff: 0,   windBase: 11 },
  yeppoon:      { name: 'Yeppoon Beach',        short: 'Yeppoon',      lat: -23.13, lng: 150.74, tideOff: 0.2, windBase: 12 },
  emu_park:     { name: 'Emu Park',             short: 'Emu Park',     lat: -23.25, lng: 150.82, tideOff: 0.1, windBase: 10 },
  keppel_bay:   { name: 'Keppel Bay',           short: 'Keppel Bay',   lat: -23.20, lng: 150.85, tideOff: 0.3, windBase: 13 },
  great_keppel: { name: 'Great Keppel Island',  short: 'GKI',          lat: -23.18, lng: 150.94, tideOff: 0.4, windBase: 14 },
  rockhampton:  { name: 'Rockhampton River',    short: 'Rocky River',  lat: -23.38, lng: 150.51, tideOff: 1.5, windBase: 9  },
  byfield:      { name: 'Byfield / Waterpark Creek', short: 'Byfield', lat: -22.86, lng: 150.67, tideOff: 0.8, windBase: 8  },
  tanby:        { name: 'Tanby Point',          short: 'Tanby',        lat: -23.30, lng: 150.80, tideOff: 0.2, windBase: 10 },
};

// ── Fish species per location ─────────────────────────────────
const SPECIES = {
  rosslyn_bay:  [
    { name: 'Coral Trout',   rating: 'prime', tip: 'Best on incoming tide over reef' },
    { name: 'Snapper',       rating: 'prime', tip: 'Deep ledges, 30–50m' },
    { name: 'Mackerel',      rating: 'good',  tip: 'Trolling near channel' },
    { name: 'Cobia',         rating: 'good',  tip: 'Near channel markers' },
    { name: 'Flathead',      rating: 'good',  tip: 'Sandy bottoms at entrance' },
  ],
  yeppoon: [
    { name: 'Whiting',       rating: 'prime', tip: 'Sandy beach at low tide' },
    { name: 'Bream',         rating: 'prime', tip: 'Rocks and structure' },
    { name: 'Flathead',      rating: 'good',  tip: 'Gutters on outgoing tide' },
    { name: 'Dart',          rating: 'good',  tip: 'Beachfront in the wash' },
  ],
  emu_park: [
    { name: 'Bream',         rating: 'prime', tip: 'Jetty pylons dawn and dusk' },
    { name: 'Whiting',       rating: 'prime', tip: 'Shallow sand flats' },
    { name: 'Snapper',       rating: 'good',  tip: 'Deep water near headland' },
    { name: 'Trevally',      rating: 'good',  tip: 'Surface in evening' },
  ],
  keppel_bay: [
    { name: 'Coral Trout',   rating: 'prime', tip: 'Bombies on incoming tide' },
    { name: 'Red Emperor',   rating: 'prime', tip: 'Deep reef, 40–60m' },
    { name: 'Sweetlip',      rating: 'good',  tip: 'Mid-water reef structure' },
    { name: 'Mackerel',      rating: 'good',  tip: 'Surface trolling channels' },
    { name: 'Cobia',         rating: 'good',  tip: 'Near buoys and structure' },
  ],
  great_keppel: [
    { name: 'Coral Trout',   rating: 'prime', tip: 'Reef edges at first light' },
    { name: 'Red Emperor',   rating: 'prime', tip: 'Drop-offs, 50–80m' },
    { name: 'Spanish Mackerel', rating: 'prime', tip: 'Fast troll in blue water' },
    { name: 'Wahoo',         rating: 'good',  tip: 'Offshore in summer' },
    { name: 'Tuna',          rating: 'good',  tip: 'Schooling near surface' },
  ],
  rockhampton: [
    { name: 'Barramundi',    rating: 'prime', tip: 'Fitzroy River at dusk on run-out tide' },
    { name: 'Mangrove Jack', rating: 'prime', tip: 'Under mangroves incoming tide' },
    { name: 'Flathead',      rating: 'good',  tip: 'River mouth sandy banks' },
    { name: 'Catfish',       rating: 'good',  tip: 'Deep holes in main channel' },
    { name: 'Bream',         rating: 'good',  tip: 'Rocky structure mid-river' },
  ],
  byfield: [
    { name: 'Barramundi',    rating: 'prime', tip: 'Waterpark Creek on high tide' },
    { name: 'Mangrove Jack', rating: 'prime', tip: 'Snag-filled creeks' },
    { name: 'Mud Crab',      rating: 'prime', tip: 'Set pots in mangrove channels' },
    { name: 'Flathead',      rating: 'good',  tip: 'Sandflats on outgoing tide' },
  ],
  tanby: [
    { name: 'Whiting',       rating: 'prime', tip: 'Sand flats at low tide' },
    { name: 'Flathead',      rating: 'prime', tip: 'Muddy channels outgoing tide' },
    { name: 'Bream',         rating: 'good',  tip: 'Rocky outcrops' },
    { name: 'Mud Crab',      rating: 'good',  tip: 'Nearby mangrove channels' },
  ],
};

// ── Fishing spots data ────────────────────────────────────────
let SPOTS = [
  { name: 'Rosslyn Bay Harbour', type: 'Boat Ramp / Offshore Base', species: ['Coral Trout','Snapper','Cobia'], tip: 'Main launching point for reef trips', stars: 5 },
  { name: 'Fitzroy River (Rocky)', type: 'River — Estuarine', species: ['Barramundi','Mangrove Jack','Bream'], tip: 'Best barra on run-out tide at night', stars: 5 },
  { name: 'Great Keppel Island', type: 'Offshore Reef', species: ['Red Emperor','Coral Trout','Mackerel'], tip: 'Full-day trip, multiple reef spots', stars: 5 },
  { name: 'Waterpark Creek (Byfield)', type: 'Creek / Estuary', species: ['Barramundi','Mangrove Jack','Mud Crab'], tip: 'Remote creek — 4WD access recommended', stars: 4 },
  { name: 'Emu Park Jetty', type: 'Shore / Jetty', species: ['Bream','Whiting','Trevally'], tip: 'Great for kids, lights attract bait at night', stars: 4 },
  { name: 'Causeway Lake', type: 'Lake / Estuary', species: ['Flathead','Bream','Whiting'], tip: 'Sheltered; good on windy days', stars: 4 },
  { name: 'Yeppoon Beach Gutters', type: 'Beach', species: ['Whiting','Dart','Flathead'], tip: 'Fish the gutters on incoming tide', stars: 3 },
  { name: 'Cawarral Creek', type: 'Creek', species: ['Barramundi','Mangrove Jack','Flathead'], tip: 'Low-pressure spot away from crowds', stars: 3 },
];

// ── Bait & Lures per location ─────────────────────────────────
let BAIT_LURES = {
  rosslyn_bay: {
    bait: [
      { icon: '🦐', name: 'Live Prawns',      target: 'Coral Trout, Snapper, Flathead',  use: 'Free-line or float rig on incoming tide over reef structure.', tip: 'Keep alive in a bait bucket — fresh is best.', stars: 5 },
      { icon: '🦑', name: 'Whole Squid',       target: 'Snapper, Coral Trout, Cobia',    use: 'Rigged whole or strips on paternoster rig, bottom 25–40m.', tip: 'Squid strips also work as jig trailer.', stars: 5 },
      { icon: '🐟', name: 'Pilchards (whole)', target: 'Mackerel, Tuna, Cobia',          use: 'Ganged hooks under float or cast into burley trail.', tip: 'Freeze-bait works for Mackerel; live best for Cobia.', stars: 4 },
      { icon: '🪱', name: 'Bloodworms',        target: 'Bream, Whiting',                 use: 'Small hook on light line close to rocky structure.', tip: 'Buy fresh from bait shop morning of your trip.', stars: 3 },
    ],
    lures: [
      { icon: '🎣', name: 'Vibe/Blade (40–80g)', target: 'Snapper, Coral Trout, Trevally', use: 'Drop to bottom, hop and wind retrieve. Deadly on reef edges.', tip: 'Gold or pink in clear water, chartreuse in dirty water.', stars: 5 },
      { icon: '🎣', name: 'Skirt Trolling Lure', target: 'Spanish Mackerel, Wahoo, Tuna',  use: 'Troll at 6–8 knots in open water channels.', tip: 'Use 80lb wire trace for Mackerel.', stars: 5 },
      { icon: '🎣', name: 'Soft Plastic (5"–7")', target: 'Snapper, Coral Trout, Flathead', use: 'Jig head 1/2–1oz, hop along bottom of reef.', tip: 'Squid/prawn patterns in natural colours.', stars: 4 },
      { icon: '🎣', name: 'Popper / Walker',      target: 'Trevally, Mackerel, GT',        use: 'Cast to structure and work surface aggressively at dawn.', tip: 'Best in calm conditions early morning.', stars: 3 },
    ],
    rigs: [
      { icon: '⚙️', name: 'Paternoster Rig',   target: 'Snapper, Reef Fish (bottom)',   use: '50–80lb mono main line, 2 x 6/0–8/0 circle hooks, 1–2oz sinker.', tip: 'Use fluorocarbon leader 40–60lb for clarity.', stars: 5 },
      { icon: '⚙️', name: 'Running Sinker Rig', target: 'Flathead, Bream, Whiting',      use: 'Running ball sinker to swivel, 30–40cm trace, 2/0–4/0 hook.', tip: 'Allows fish to run with bait before setting hook.', stars: 4 },
      { icon: '⚙️', name: 'Gang Hook Rig',      target: 'Mackerel, Tuna (live bait)',    use: '3–4 ganged 3/0–5/0 hooks on 60lb trace, whole pilchard.', tip: 'Attach to wire trace for Mackerel teeth.', stars: 4 },
      { icon: '⚙️', name: 'Jig Head (1/2–1oz)', target: 'Reef fish, Flathead',           use: 'Straight shank or 45° head with 5"–7" soft plastic tail.', tip: 'Heavier jig needed in deep reef 30m+.', stars: 5 },
    ],
    seasonalTip: 'Summer (Dec–Feb): Target Spanish Mackerel trolling in the Keppel Channel early morning. Winter (Jun–Aug): Snapper bite fires up on bottom. Dawn and dusk are always the best windows for this area.',
  },
  yeppoon: {
    bait: [
      { icon: '🪱', name: 'Beach Worms',       target: 'Whiting, Bream, Dart',           use: 'Small #4–#6 hook on light 2–4kg line, cast to gutters.', tip: 'Dig in wet sand at low tide or buy from local bait shops.', stars: 5 },
      { icon: '🦐', name: 'Yabby (Nipper)',    target: 'Whiting, Flathead, Bream',       use: 'Pump from sand flats on low tide. Hook through tail.', tip: 'Best bait for Whiting — nothing beats it on the flats.', stars: 5 },
      { icon: '🦀', name: 'Peeled Prawn',      target: 'Bream, Dart, Flathead',          use: 'Small piece on #4 hook, fish the gutters and wash.', tip: 'Use just enough to cover hook for smaller Bream.', stars: 4 },
      { icon: '🐟', name: 'Pilchard Pieces',   target: 'Dart, Trevally, Tailor',         use: 'Ganged hooks, toss into wash and let current take it.', tip: 'Tailor run along beach March–June after dark.', stars: 3 },
    ],
    lures: [
      { icon: '🎣', name: 'Metal Slugs (15–30g)', target: 'Trevally, Dart, Tailor',     use: 'Cast into wash from beach, fast retrieve.', tip: 'Chrome/silver best in morning, gold in afternoon.', stars: 4 },
      { icon: '🎣', name: 'Soft Plastic (3"–4")', target: 'Flathead, Whiting',           use: 'Light jig 1/8oz, bounce along sandy gutters.', tip: 'White, pink or prawn colours.', stars: 4 },
      { icon: '🎣', name: 'Bubble Fly/Float Rig', target: 'Whiting, Bream',             use: 'Fly behind bubble float, drift across sand flats.', tip: 'Works best at first light.', stars: 3 },
      { icon: '🎣', name: 'Spinner (Size 1–2)',   target: 'Trevally, Bream',             use: 'Cast parallel to beach along rock edges.', tip: 'Great for kids — hard to go wrong.', stars: 3 },
    ],
    rigs: [
      { icon: '⚙️', name: 'Whiting Rig',       target: 'Whiting, Bream (beach/flats)',  use: '#4–#6 long shank hook, 1–2 ball sinker, 4–6lb fluorocarbon trace.', tip: 'Use yabby or beach worm for best results.', stars: 5 },
      { icon: '⚙️', name: 'Surf Rig',          target: 'Dart, Tailor (beach surfing)',  use: '2/0 hook, 2–3oz star sinker, 20lb trace for surf casting.', tip: 'Heavier sinker to hold in surf/wash.', stars: 4 },
      { icon: '⚙️', name: 'Float Rig',         target: 'Bream, Dart (inshore)',         use: 'Small foam float 1m above #4 hook, drifts through gutters.', tip: 'Adjust depth to keep bait just above sand.', stars: 4 },
      { icon: '⚙️', name: 'Dropshot Rig',      target: 'Flathead',                      use: '3–5" soft plastic on nose-hooked 1/0, sinker at bottom 4".', tip: 'Deadly for flathead in sandy gutters.', stars: 3 },
    ],
    seasonalTip: 'Autumn (Mar–May): Tailor and Dart schooling along the beach — use metal slugs at dawn. Summer: Whiting feed hard on the sand flats on the run-out tide using yabbies.',
  },
  emu_park: {
    bait: [
      { icon: '🦐', name: 'Live Prawns',       target: 'Bream, Whiting, Flathead',       use: 'Under float off the jetty, or free-line around pylons.', tip: 'Best bait for jetty bream — run light 4lb trace.', stars: 5 },
      { icon: '🪱', name: 'Bloodworms',        target: 'Bream, Whiting',                 use: 'Small hook #4–#6, fish close to jetty structure.', tip: 'Night fishing under jetty lights is deadly for bream.', stars: 5 },
      { icon: '🦐', name: 'Yabby (Nipper)',    target: 'Whiting, Flathead',              use: 'Pump from sand flats near town. Fish the shallows.', tip: 'Pump an hour before fishing — use immediately.', stars: 4 },
      { icon: '🐟', name: 'Mullet Fillet',     target: 'Snapper, Flathead, Trevally',    use: 'Small strips on 2/0–4/0 hook near deep water at headland.', tip: 'Cast into the deep channel off the point at dawn.', stars: 3 },
    ],
    lures: [
      { icon: '🎣', name: 'Soft Plastic (3"–5")', target: 'Flathead, Bream, Trevally',  use: '1/4–1/2oz jig head, hop along sandy bottom near structure.', tip: 'Paddle tail in olive/white great for flathead.', stars: 5 },
      { icon: '🎣', name: 'Hardbody Minnow (50–70mm)', target: 'Bream, Trevally',       use: 'Cast along rock walls and retrieve with erratic twitches.', tip: 'Natural colours during day, dark at night.', stars: 4 },
      { icon: '🎣', name: 'Metal Slug (20g)',    target: 'Trevally, Dart',               use: 'Cast from rocks and fast-wind retrieve.', tip: 'Best on incoming tide around headland.', stars: 3 },
      { icon: '🎣', name: 'Surface Walker',      target: 'Trevally',                     use: 'Dusk surface walk-the-dog retrieve off headland.', tip: 'Trevally go crazy on surface lures at last light.', stars: 3 },
    ],
    rigs: [
      { icon: '⚙️', name: 'Jetty Bream Rig',   target: 'Bream, Whiting (jetty)',        use: '#4–#6 hook, 4lb fluorocarbon trace, 1 ball sinker, live prawn.', tip: 'Let bait drift with current between pylons.', stars: 5 },
      { icon: '⚙️', name: 'Running Sinker',     target: 'Flathead, Whiting (flats)',     use: 'Running sinker to swivel, 30cm trace, #4 long shank.', tip: 'No float — let it run along bottom.', stars: 4 },
      { icon: '⚙️', name: 'Unweighted SP Rig',  target: 'Bream, Trevally (structure)',   use: '1/8oz jig head with 3" soft plastic, no sinker on light line.', tip: 'Slow sink triggers bream strikes around pylons.', stars: 4 },
      { icon: '⚙️', name: 'Paternoster (light)', target: 'Snapper (headland)',           use: '30lb trace, two 3/0 hooks, 1oz sinker from headland rocks.', tip: 'Cast into the deep channel on the run-in tide.', stars: 3 },
    ],
    seasonalTip: 'Year-round bream from the jetty with live prawns. Winter: Snapper show up near the headland at dusk. Summer: whiting on the sand flats and trevally surface feeding at last light.',
  },
  keppel_bay: {
    bait: [
      { icon: '🦑', name: 'Whole Squid',        target: 'Coral Trout, Red Emperor, Snapper', use: 'Rigged on paternoster rig, bottom fished 35–60m on reef.', tip: 'Pre-rig a dozen squid before heading offshore.', stars: 5 },
      { icon: '🦐', name: 'Live Prawns',         target: 'Coral Trout, Sweetlip',          use: 'Free-line over reef bombie on incoming tide.', tip: 'Use a livewell — they stay fresher longer.', stars: 5 },
      { icon: '🐟', name: 'Bonito/Mackerel Fillet', target: 'Cobia, Large Snapper',       use: 'Cut bait chunk on 5/0–7/0 circle hook, bottom reef.', tip: 'Burley with minced bonito to attract Cobia.', stars: 4 },
      { icon: '🐙', name: 'Octopus Tentacle',    target: 'Snapper, Red Emperor',           use: 'Tough bait — stays on hook well in current. Bottom fish.', tip: 'Tenderise before using for better scent release.', stars: 3 },
    ],
    lures: [
      { icon: '🎣', name: 'Jig (60–120g metal)', target: 'Snapper, Trevally, Mackerel',   use: 'Speed jig from bottom to mid-water column. Deadly offshore.', tip: 'Slow pitch jigging on the drop — let lure flutter down.', stars: 5 },
      { icon: '🎣', name: 'Skirt Trolling Lure', target: 'Spanish Mackerel, Wahoo',        use: 'Troll 5–8 knots across Keppel Bay channels.', tip: '80lb coated wire trace essential.', stars: 5 },
      { icon: '🎣', name: 'Soft Plastic (6"–8")', target: 'Coral Trout, Red Emperor',      use: 'Heavy jig head 1–2oz, bounce along reef bottom in 30–50m.', tip: 'Purple/pink on cloudy days, natural on clear.', stars: 4 },
      { icon: '🎣', name: 'Popper (100mm+)',      target: 'GT, Trevally, Mackerel',        use: 'Cast to reef edges at dawn and work aggressively.', tip: 'Bombies and headlands early morning.', stars: 4 },
    ],
    rigs: [
      { icon: '⚙️', name: 'Heavy Paternoster',  target: 'Red Emperor, Snapper (deep reef)', use: '80–100lb mono, 2 x 7/0–9/0 circle hooks, 4–6oz sinker.', tip: 'Use a long trace — red emps are leaders shy.', stars: 5 },
      { icon: '⚙️', name: 'Slow Pitch Jig Rig', target: 'Snapper, Trevally, Kings',       use: 'Long fall jig 80–120g, 6/0 assist hook, 60–80lb braid.', tip: 'Let it sink on a controlled fall — strikes happen on the drop.', stars: 5 },
      { icon: '⚙️', name: 'Livebait Float Rig',  target: 'Cobia, Mackerel',               use: 'Large pencil float, live bream or garfish on 6/0 hook.', tip: 'Float near channel markers and structure.', stars: 4 },
      { icon: '⚙️', name: 'Strayline Rig',       target: 'Coral Trout (reef edge)',        use: 'No sinker, 50–60lb fluoro, 4/0–5/0 hook — let bait drift with current into reef.', tip: 'Only effective in light current; use slow flow periods.', stars: 4 },
    ],
    seasonalTip: 'Oct–Mar: Offshore reef fishing at its best — Coral Trout and Red Emperor smashing squid. May–Sep: Snapper and Sweetlip more active in cooler water. Year-round Mackerel trolling.',
  },
  great_keppel: {
    bait: [
      { icon: '🦑', name: 'Whole Squid (rigged)', target: 'Red Emperor, Coral Trout',    use: 'Bottom fish 50–80m on sharp-drop reef edges.', tip: 'Anchor upcurrent and drift bait to the edge.', stars: 5 },
      { icon: '🐟', name: 'Livebait (Yakka/Slimy)', target: 'Spanish Mackerel, Wahoo',   use: 'Livebait cast 20m from boat in blue water.', tip: 'Balloon float keeps bait at surface — spectacular strikes.', stars: 5 },
      { icon: '🦐', name: 'Live Prawns (large)',  target: 'Coral Trout, Trevally, GT',   use: 'Free-line over coral bombie on incoming tide.', tip: 'GKI bombies legendary for Coral Trout in summer.', stars: 4 },
      { icon: '🪱', name: 'Beachworm/Strip',      target: 'Trevally, Whiting (beach)',   use: 'Beach fishing on the eastern side of island.', tip: 'Protected beaches on GKI — ideal after a big offshore trip.', stars: 3 },
    ],
    lures: [
      { icon: '🎣', name: 'Popper (120–150mm)',   target: 'GT, Trevally, Mackerel',       use: 'Aggressive casting to reef edges and bombies at first light.', tip: 'Match popper size to bait fish in the area.', stars: 5 },
      { icon: '🎣', name: 'Skirt Troll (Large)',  target: 'Spanish Mackerel, Wahoo, Tuna', use: 'Troll 6–10 knots in blue water on offshore side of GKI.', tip: 'Run 2 lures — one short, one long.', stars: 5 },
      { icon: '🎣', name: 'Heavy Metal Jig (80–150g)', target: 'Kings, Amberjack, Trevally', use: 'Vertical jig over reef in 50–80m.', tip: 'Kings (Samson Fish) hit hard on the way down.', stars: 4 },
      { icon: '🎣', name: 'Stickbait (90–120mm)', target: 'Mackerel, Tuna, GT',           use: 'Cast with heavy spin gear to schooling surface fish.', tip: 'Look for bird activity and dive-bomb fish.', stars: 4 },
    ],
    rigs: [
      { icon: '⚙️', name: 'Deep Reef Bottom Rig', target: 'Red Emperor, Coral Trout',    use: '100–130lb mono, 2 x 8/0–10/0 circle, 8–12oz sinker in 60–90m.', tip: 'Fluorocarbon 80lb 3m trace a must for GKI reef.', stars: 5 },
      { icon: '⚙️', name: 'Livebait Balloon Rig', target: 'Spanish Mackerel, Wahoo',     use: 'Small balloon 1–2m above 6/0 hook with 80lb wire trace.', tip: 'Keep bait at the surface — Mackerel will smash it.', stars: 5 },
      { icon: '⚙️', name: 'Popper/Stickbait Leader', target: 'GT, Mackerel (surface)',   use: '100–130lb fluorocarbon 1m leader on 65–80lb PE braid.', tip: 'Use strong split rings and quality VMC trebles.', stars: 4 },
      { icon: '⚙️', name: 'Slow Jig Rig',         target: 'Amberjack, Kings (mid water)', use: 'Slim 100–150g jig, twin assist hooks, slow pitch retrieval.', tip: 'Target the 40–60m mark for Kings around GKI.', stars: 4 },
    ],
    seasonalTip: 'Sep–Mar: Spanish Mackerel season — trolling and live-baiting in the blue water on the offshore side. Summer: Coral Trout over bombies on surface lures. Winter: Deep reef for Red Emperor and big Snapper.',
  },
  rockhampton: {
    bait: [
      { icon: '🦐', name: 'Live Prawns (large)',  target: 'Barramundi, Mangrove Jack',    use: 'Free-line under mangroves or jetty structure on run-out tide.', tip: 'Fish the last 2 hours of the run-out and first of run-in for Barra.', stars: 5 },
      { icon: '🐛', name: 'Live Mullet (finger)', target: 'Barramundi, Jack',             use: 'Hook through the back, free-line near structure at dusk.', tip: 'Size 3–5 inch finger mullet. Catch from the river\'s edge.', stars: 5 },
      { icon: '🦀', name: 'Fresh Mud Crab (Pieces)', target: 'Mangrove Jack, Flathead',  use: 'Chunk of raw crab on 3/0–5/0 hook near mangrove edges.', tip: 'Strong scent trail draws Jack from heavy structure.', stars: 4 },
      { icon: '🪱', name: 'Bloodworms/Worms',     target: 'Bream, Catfish, Yellowbelly', use: 'Small hook, fish deep holes in main channel.', tip: 'Catfish are good eating — don\'t throw them back.', stars: 3 },
    ],
    lures: [
      { icon: '🎣', name: 'Hardbody (50–80mm SP)', target: 'Barramundi',                 use: 'Cast tight to structure, slow retrieval with pauses.', tip: 'Chartreuse, orange and gold in the Fitzroy — big barra love it.', stars: 5 },
      { icon: '🎣', name: 'Soft Plastic (4"–5")',  target: 'Barramundi, Mangrove Jack',  use: '3/8–1/2oz jig head, hop near mangrove roots and submerged snags.', tip: 'Weedless hook rig to avoid snags in heavy timber.', stars: 5 },
      { icon: '🎣', name: 'Spinnerbait (3/8–1/2oz)', target: 'Barramundi, Jack',         use: 'Slow roll along submerged timber and rock bars.', tip: 'White or chartreuse skirt in the murky Fitzroy.', stars: 4 },
      { icon: '🎣', name: 'Vibe/Blade (20–40g)',   target: 'Flathead, Bream, Trevally',  use: 'Drop and hop at river mouth near rocky bars.', tip: 'Silver or gold blades for estuary species.', stars: 3 },
    ],
    rigs: [
      { icon: '⚙️', name: 'Barra Strayline Rig',  target: 'Barramundi (Fitzroy River)',  use: 'No sinker, 60–80lb fluorocarbon leader, 4/0–6/0 circle hook, live prawn.', tip: 'Work the tide — run-out dusk is the magic window.', stars: 5 },
      { icon: '⚙️', name: 'Weedless SP Rig',      target: 'Jack, Barra (snags)',         use: 'Weedless offset 4/0 hook in 4–5" SP, target heavy structure.', tip: 'Accept some losses — that\'s where the fish live.', stars: 5 },
      { icon: '⚙️', name: 'Running Sinker (river)', target: 'Flathead, Catfish, Bream',  use: '1–2oz running sinker, 30cm 20–30lb fluoro trace, 3/0–4/0 hook.', tip: 'Fish the deep holes on the inside bends of the river.', stars: 4 },
      { icon: '⚙️', name: 'Bobber/Float Rig',     target: 'Barramundi, Jack (dusk)',     use: 'Large pencil float, live finger mullet, cast to structure.', tip: 'Nail the float at 1–1.5m depth in shallow mangrove flats.', stars: 4 },
    ],
    seasonalTip: 'Nov–Apr: Barramundi season peaks! Run-out tide at dusk on the Fitzroy is unmissable. Jun–Aug: Mangrove Jack and Flathead during cooler months. Mud crab season runs all year.',
  },
  byfield: {
    bait: [
      { icon: '🦐', name: 'Live Prawns',          target: 'Barramundi, Mangrove Jack',   use: 'Free-line under mangroves on high or run-in tide in Waterpark Creek.', tip: 'Byfield\'s Waterpark Creek is prime Barra territory — go at dusk.', stars: 5 },
      { icon: '🦀', name: 'Mud Crab (live whole)', target: 'Barramundi',                 use: 'Hook through carapace, free-line to snag or structure.', tip: 'Few tricks beat a live mud crab for trophy barra.', stars: 5 },
      { icon: '🐟', name: 'Live Mullet (3"–5")',   target: 'Mangrove Jack, Barramundi',  use: 'Hook through lips, 5/0 hook, free-line near fallen timber.', tip: 'Catch from the shallow edges before dark.', stars: 4 },
      { icon: '🦐', name: 'Yabby (Nipper)',        target: 'Flathead, Whiting (flats)',  use: 'Sand flats at mouth of creek on run-out.', tip: 'Pump on exposed flats at low tide.', stars: 3 },
    ],
    lures: [
      { icon: '🎣', name: 'Hardbody SP (60–80mm)', target: 'Barramundi',                 use: 'Cast tight to mangrove roots, slow dive and pause.', tip: 'Gold/orange in tannin-stained Byfield waters.', stars: 5 },
      { icon: '🎣', name: 'Weedless Frog/Toad',    target: 'Barramundi (surface)',       use: 'Cast onto mangrove roots and pop back across the surface.', tip: 'Heart-stopping surface strikes at last light.', stars: 5 },
      { icon: '🎣', name: 'Chatterbait/Bladed Jig', target: 'Jack, Barramundi',          use: 'Slow roll through submerged root systems.', tip: 'White or chartreuse with a trailer.', stars: 4 },
      { icon: '🎣', name: 'Soft Plastic (4")',      target: 'Flathead, Whiting (flats)', use: '1/8oz jig head, hop along sandy flats on run-out.', tip: 'Natural prawn/olive colours.', stars: 3 },
    ],
    rigs: [
      { icon: '⚙️', name: 'Creek Barra Rig',      target: 'Barramundi (Waterpark Creek)', use: '60–80lb fluoro leader, 5/0–7/0 circle hook, no sinker — free-line live mullet.', tip: 'Work the tide — fish 2h either side of the turn.', stars: 5 },
      { icon: '⚙️', name: 'Weedless Rig',         target: 'Jack, Barra (mangroves)',    use: '4/0–5/0 weedless offset hook, 5" soft plastic, 60lb fluoro.', tip: 'You WILL snag. Lose some to win some in Byfield.', stars: 5 },
      { icon: '⚙️', name: 'Crab Pot Setup',       target: 'Mud Crab',                   use: '3–4 pots in mangrove channels, bait with chicken frames.', tip: 'Pull pots every 2–4 hours. Check local regulations.', stars: 4 },
      { icon: '⚙️', name: 'Running Sinker (flats)', target: 'Flathead (sand flats)',     use: '1/2oz running sinker, #4–#6 long shank, yabby bait.', tip: 'Drag slowly along the bottom on the run-out.', stars: 3 },
    ],
    seasonalTip: 'Oct–Mar: Barramundi season at Waterpark Creek is PRIME. High tides pushing into the mangroves bring big fish to the edges. Always carry a detailed tide chart for Byfield — 4WD access essential.',
  },
  tanby: {
    bait: [
      { icon: '🦐', name: 'Yabby (Nipper)',       target: 'Whiting, Flathead',           use: 'Pump from exposed sand flats on low tide. Fish on run-in.', tip: 'Tanby sandflats are one of the best yabby grounds in the region.', stars: 5 },
      { icon: '🦐', name: 'Live Prawns',           target: 'Flathead, Bream',             use: 'Free-line along muddy channel edges on the run-out.', tip: 'Use a small float to keep bait off the bottom.', stars: 4 },
      { icon: '🪱', name: 'Bloodworms',            target: 'Bream, Whiting',              use: '#4 hook, light line, fish rock edges and structure.', tip: 'Buy local — fresh makes a big difference.', stars: 4 },
      { icon: '🦀', name: 'Fresh Crab Pieces',     target: 'Bream, Flathead (deep holes)', use: 'Small crab chunk on 2/0 hook, fish the deeper mudholes.', tip: 'Morning session on outgoing tide for best results.', stars: 3 },
    ],
    lures: [
      { icon: '🎣', name: 'Soft Plastic (3"–4")', target: 'Flathead, Bream',             use: '1/8–1/4oz jig head, hop and drag along muddy bottom.', tip: 'Olive/prawn soft plastics on the flats at Tanby.', stars: 5 },
      { icon: '🎣', name: 'Small Hardbody (40–60mm)', target: 'Bream, Trevally',         use: 'Twitch along rocky edges near the point.', tip: 'Ghost shrimp patterns early morning.', stars: 4 },
      { icon: '🎣', name: 'Jig Spinner (1/8oz)',   target: 'Bream, Trevally',             use: 'Slow roll along rock edges and oyster leases.', tip: 'White/yellow blade colours around Tanby structure.', stars: 3 },
      { icon: '🎣', name: 'Bladed Vibe (15g)',     target: 'Flathead, Trevally',          use: 'Drop and hop at channel edges on run-out tide.', tip: 'Gold works well in the stained tidal water.', stars: 3 },
    ],
    rigs: [
      { icon: '⚙️', name: 'Flathead Flats Rig',   target: 'Flathead, Whiting (Tanby flats)', use: 'Running 1/2oz sinker, 20lb fluoro trace, #4–2/0 hook, yabby or SP.', tip: 'Drag slowly across the flat on run-out for flathead.', stars: 5 },
      { icon: '⚙️', name: 'Light Bream Rig',      target: 'Bream (structure)',           use: '#4 hook, 4–6lb fluorocarbon, 1 small ball sinker, bloodworm.', tip: 'Ultra-light line gets far more bites from Tanby bream.', stars: 5 },
      { icon: '⚙️', name: 'Crab Pot (Mangrove)', target: 'Mud Crab',                    use: 'Set in nearby mangrove channels, bait with chicken carcass.', tip: 'Rich mud crab territory — check local season dates.', stars: 4 },
      { icon: '⚙️', name: 'Float Rig (tidal)',    target: 'Bream, Dart (moving tide)',   use: 'Pencil float, #4 long shank hook, let drift with tidal run.', tip: 'Set at 60–80cm depth across the incoming flat.', stars: 3 },
    ],
    seasonalTip: 'Year-round Whiting on the sand flats with yabbies. Summer: Flathead active on run-out tides in the channels. Mud crab season in the nearby mangroves is excellent in spring.',
  },
};

// ── Retailers ─────────────────────────────────────────────────
let RETAILERS = {
  local: [
    {
      logo: '🎣', name: 'BCF Rockhampton',
      addr: '24 Musgrave St, North Rockhampton QLD 4701',
      phone: '(07) 4927 3800',
      specialties: ['Rods & Reels', 'Live Bait', 'Kayaks', 'Camping'],
      url: 'https://www.bcf.com.au',
      mapsUrl: 'https://maps.google.com/?q=BCF+Rockhampton',
      recommended: true,
      note: 'Largest fishing & camping store in the region. Great local knowledge.',
    },
    {
      logo: '🏪', name: 'Tackle World Rocky',
      addr: 'Rockhampton QLD 4700',
      phone: 'Call in-store',
      specialties: ['Fishing Tackle', 'Bait & Lures', 'Rigs & Leaders'],
      url: 'https://www.tackleworld.com.au',
      mapsUrl: 'https://maps.google.com/?q=Tackle+World+Rockhampton',
      recommended: true,
      note: 'Specialist tackle store — staff know the local spots intimately.',
    },
    {
      logo: '🏕️', name: 'Anaconda Rockhampton',
      addr: 'Rockhampton QLD 4700',
      phone: 'See website',
      specialties: ['Outdoor Gear', 'Fishing', 'Footwear', 'Clothing'],
      url: 'https://www.anacondastores.com',
      mapsUrl: 'https://maps.google.com/?q=Anaconda+Rockhampton',
      recommended: false,
      note: 'Great for rods, reels, clothing and outdoor gear.',
    },
    {
      logo: '🛒', name: 'BCF Yeppoon',
      addr: 'Yeppoon QLD 4703',
      phone: 'See website',
      specialties: ['Fishing', 'Marine', 'Camping', 'Bait'],
      url: 'https://www.bcf.com.au',
      mapsUrl: 'https://maps.google.com/?q=BCF+Yeppoon',
      recommended: false,
      note: 'Convenient for Capricorn Coast fishos — closer to the boat ramps.',
    },
  ],
  online: [
    {
      logo: '🛒', name: 'BCF Online',
      addr: 'bcf.com.au — Free click & collect',
      phone: '',
      specialties: ['Rods', 'Reels', 'Kayaks', 'Camping', 'Clothing'],
      url: 'https://www.bcf.com.au',
      mapsUrl: '',
      recommended: true,
      note: 'Australia\'s largest fishing & camping retailer. Free store pickup in Rocky.',
    },
    {
      logo: '🎣', name: 'TackleRoo',
      addr: 'tackleroo.com.au — Free shipping $99+',
      phone: '',
      specialties: ['Lures', 'Jigs', 'Soft Plastics', 'Leaders'],
      url: 'https://www.tackleroo.com.au',
      mapsUrl: '',
      recommended: true,
      note: 'Huge range of offshore and estuary lures. Fast Australian postage.',
    },
    {
      logo: '🌐', name: 'MyFishingTackle',
      addr: 'myfishingtackle.com.au',
      phone: '',
      specialties: ['Hooks', 'Jigs', 'Terminal Tackle', 'Braid'],
      url: 'https://www.myfishingtackle.com.au',
      mapsUrl: '',
      recommended: false,
      note: 'Great prices on hooks, jig heads and terminal tackle in bulk.',
    },
    {
      logo: '⚙️', name: 'Shimano Australia',
      addr: 'shimano.com.au — Official AU store',
      phone: '',
      specialties: ['Reels', 'Rods', 'Line', 'Accessories'],
      url: 'https://www.shimano.com.au',
      mapsUrl: '',
      recommended: false,
      note: 'Premium reels and rods direct from the manufacturer.',
    },
  ],
};

// ── State ─────────────────────────────────────────────────────
let currentLoc    = 'rosslyn_bay';
let tideChartInst = null;
let windChartInst = null;
let radarPlaying  = true;
let radarFrameIdx = 0;
let radarFrames   = [];
let radarTimer    = null;
let refreshTimer  = null;
let biteReports   = [];
let warnDismissed = false;
let isVIP         = false;
let currentBaitTab     = 'bait';
let currentRetailerTab = 'local';

// ── Seeded RNG ────────────────────────────────────────────────
function seededRng(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

// ── Tide model ────────────────────────────────────────────────
// Capricorn Coast has a semi-diurnal tide pattern (~2 high/2 low per day)
// with a mixed inequality. We approximate with two sinusoids.
function tideAtHour(h, off) {
  const t = (h + off) / 24;
  const primary   = Math.sin(t * 4 * Math.PI + 0.4) * 0.75;
  const secondary = Math.sin(t * 2 * Math.PI + 1.0) * 0.38;
  const shallow   = Math.sin(t * 6 * Math.PI) * 0.07;
  return +((primary + secondary + shallow + 1.45).toFixed(2));
}

function buildTideData(locKey) {
  const off = LOCATIONS[locKey].tideOff;
  const hours   = Array.from({ length: 25 }, (_, i) => i);
  const heights = hours.map(h => tideAtHour(h, off));
  return { hours, heights };
}

function findTideEvents(heights) {
  const events = [];
  for (let i = 1; i < heights.length - 1; i++) {
    const p = heights[i-1], c = heights[i], n = heights[i+1];
    if (c > p && c > n) events.push({ type: 'high', hour: i, h: c });
    if (c < p && c < n) events.push({ type: 'low',  hour: i, h: c });
  }
  return events.slice(0, 4);
}

// ── Wind model ────────────────────────────────────────────────
// Capricorn Coast: prevailing SE trade winds, sea-breezes afternoon
const DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
function buildWindData(locKey) {
  const base = LOCATIONS[locKey].windBase;
  const hour = new Date().getHours();
  const speeds = Array.from({ length: 25 }, (_, i) => {
    // Sea breeze peaks ~14:00 local time
    const seaBreeze = Math.max(0, Math.sin(((i - 8) / 16) * Math.PI)) * 8;
    const variation = Math.sin(i / 4.2) * 3 + Math.cos(i / 2.8) * 2;
    return Math.max(2, Math.round(base + seaBreeze + variation));
  });
  const gusts = speeds.map(s => s + Math.round(4 + Math.random() * 7));
  // SE trades: dirIdx 7 = SSE, varies slightly
  const baseDir = 7;
  const dirs = speeds.map((_, i) => DIRS[(baseDir + Math.round(Math.sin(i / 6) * 2) + 16) % 16]);
  return { speeds, gusts, dirs };
}

// ── Wave model ────────────────────────────────────────────────
function getWaveHeight(windSpeed) {
  const base = 0.2 + windSpeed / 22;
  return parseFloat((base + Math.random() * 0.3).toFixed(1));
}

// ── Water temperature ─────────────────────────────────────────
// Capricorn Coast: ~22–28°C depending on season (tropical)
function getWaterTemp() {
  const month = new Date().getMonth(); // 0=Jan
  // Warmer Nov–Mar, cooler Jun–Aug
  const seasonal = [27, 28, 28, 27, 25, 23, 22, 22, 23, 25, 26, 27];
  const base = seasonal[month];
  return (base + (Math.random() * 1.5 - 0.75)).toFixed(1);
}

// ── UV Index ──────────────────────────────────────────────────
// CQ gets very high UV being sub-tropical
function getUVIndex() {
  const h = new Date().getHours();
  if (h < 7 || h > 18) return 0;
  const peak = Math.max(0, Math.sin(((h - 6) / 13) * Math.PI));
  const month = new Date().getMonth();
  const maxUV = [12, 13, 12, 10, 7, 5, 5, 6, 8, 10, 12, 13][month];
  return Math.round(peak * maxUV);
}

function uvCategory(idx) {
  if (idx <= 2) return { label: 'Low',      cls: 'good'   };
  if (idx <= 5) return { label: 'Moderate', cls: 'info'   };
  if (idx <= 7) return { label: 'High',     cls: 'warn'   };
  if (idx <= 10) return { label: 'Very High', cls: 'danger' };
  return { label: 'Extreme', cls: 'danger' };
}

// ── Bite score ────────────────────────────────────────────────
function calcBiteScore(tideH, windSpeed, waveH) {
  let score = 5;
  // Tide: mid-range moving best
  if (tideH >= 0.9 && tideH <= 1.8) score += 2;
  else if (tideH < 0.5 || tideH > 2.3) score -= 1;
  // Wind: SE trades under 18kn ideal
  if (windSpeed <= 10) score += 2;
  else if (windSpeed <= 18) score += 1;
  else if (windSpeed >= 25) score -= 2;
  else if (windSpeed >= 20) score -= 1;
  // Wave
  if (waveH >= 0.3 && waveH <= 1.2) score += 1;
  else if (waveH >= 2.0) score -= 2;
  // Dawn/dusk bonus
  const h = new Date().getHours();
  if ((h >= 5 && h <= 8) || (h >= 16 && h <= 19)) score += 1;
  return Math.max(1, Math.min(10, score));
}

const BITE_LABELS = ['','Very Poor','Poor','Below Avg','Below Avg','Average','Average','Good','Good','Excellent','Prime'];
const BITE_COLORS = ['','#ef4444','#ef4444','#f97316','#f97316','#f59e0b','#f59e0b','#22c55e','#22c55e','#22c55e','#22c55e'];

// ── Warnings ──────────────────────────────────────────────────
function checkWarnings(windSpeed, waveH, uvIdx) {
  if (windSpeed >= 33) return { level: 'danger', msg: `⚠️ GALE WARNING — ${windSpeed} knots. Dangerous for all vessels. Do not leave harbour.` };
  if (windSpeed >= 26) return { level: 'danger', msg: `⚠️ STRONG WIND WARNING — ${windSpeed} knots. Hazardous offshore conditions.` };
  if (windSpeed >= 20) return { level: 'warn',   msg: `⚠️ Wind Advisory — ${windSpeed} kn SE trades. Exercise caution offshore.` };
  if (waveH >= 2.5)    return { level: 'danger', msg: `⚠️ HIGH SWELL WARNING — ${waveH}m. Dangerous shore breaks and small vessels.` };
  if (waveH >= 1.8)    return { level: 'warn',   msg: `⚠️ Elevated Swell — ${waveH}m. Take care near exposed headlands.` };
  if (uvIdx >= 11)     return { level: 'danger', msg: `☀️ EXTREME UV WARNING — UV Index ${uvIdx}. Seek shade; cover up outside.` };
  if (uvIdx >= 8)      return { level: 'warn',   msg: `☀️ Very High UV — Index ${uvIdx}. Apply SPF50+ and wear a hat.` };
  return null;
}

// ── Radar frames ──────────────────────────────────────────────
function buildRadarFrames(windSpeed) {
  const intensity = windSpeed >= 25 ? 'heavy' : windSpeed >= 14 ? 'moderate' : 'light';
  const now = Date.now();
  radarFrames = Array.from({ length: 6 }, (_, f) => ({
    label: f === 5 ? 'Now' : `-${(5 - f) * 10}m`,
    intensity,
    seed: 314 + f * 179 + Math.round(now / 60000) * 7,
    time: new Date(now - (5 - f) * 10 * 60000),
  }));
}

function drawRadar(frame) {
  const canvas = document.getElementById('radarCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Deep ocean background
  const bg = ctx.createRadialGradient(W/2, H/2, 20, W/2, H/2, W * 0.7);
  bg.addColorStop(0, '#031424');
  bg.addColorStop(1, '#010c18');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  if (!frame) return;

  // Terrain hint (rough Queensland coast shape)
  ctx.fillStyle = 'rgba(20,45,30,0.35)';
  ctx.beginPath();
  ctx.moveTo(W * 0.62, 0);
  ctx.lineTo(W * 0.7, H * 0.3);
  ctx.lineTo(W * 0.65, H * 0.55);
  ctx.lineTo(W * 0.72, H * 0.8);
  ctx.lineTo(W * 0.9, H);
  ctx.lineTo(W, H);
  ctx.lineTo(W, 0);
  ctx.closePath();
  ctx.fill();

  // Rain cells
  const rng = seededRng(frame.seed);
  const cellCounts = { light: 2, moderate: 6, heavy: 11 };
  const n = cellCounts[frame.intensity] || 4;

  const palettes = {
    light:    [['rgba(96,165,250,0.40)',50],['rgba(147,197,253,0.25)',70]],
    moderate: [['rgba(34,197,94,0.50)',45],['rgba(96,165,250,0.40)',60],['rgba(234,179,8,0.25)',30]],
    heavy:    [['rgba(239,68,68,0.55)',40],['rgba(249,115,22,0.50)',50],['rgba(234,179,8,0.45)',55],['rgba(34,197,94,0.38)',60]],
  };
  const pal = palettes[frame.intensity];

  for (let c = 0; c < n; c++) {
    const cx = rng() * W;
    const cy = rng() * H;
    const rx = 25 + rng() * 90;
    const ry = 18 + rng() * 65;
    const rot = rng() * Math.PI;
    const [col] = pal[Math.floor(rng() * pal.length)];
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry));
    g.addColorStop(0, col); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry));
    ctx.beginPath(); ctx.arc(0, 0, Math.max(rx, ry), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

function renderRadarTimeline() {
  const el = document.getElementById('radarTimeline');
  el.innerHTML = '';
  radarFrames.forEach((f, i) => {
    const btn = document.createElement('button');
    btn.className = 'rtl-btn' + (i === radarFrameIdx ? ' active' : '');
    btn.textContent = f.label;
    btn.onclick = () => { radarFrameIdx = i; jumpRadarFrame(i); };
    el.appendChild(btn);
  });
}

function jumpRadarFrame(idx) {
  radarFrameIdx = idx;
  drawRadar(radarFrames[idx]);
  const f = radarFrames[idx];
  document.getElementById('radarTime').textContent = f
    ? f.time.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
    : 'Now';
  renderRadarTimeline();
}

function toggleRadar() {
  radarPlaying = !radarPlaying;
  document.getElementById('radarPlayBtn').textContent = radarPlaying ? '⏸ Pause' : '▶ Play';
  if (radarPlaying) startRadarLoop(); else clearTimeout(radarTimer);
}

function startRadarLoop() {
  clearTimeout(radarTimer);
  if (!radarPlaying) return;
  radarTimer = setTimeout(() => {
    radarFrameIdx = (radarFrameIdx + 1) % radarFrames.length;
    jumpRadarFrame(radarFrameIdx);
    startRadarLoop();
  }, RADAR_STEP_MS);
}

// ── Charts ────────────────────────────────────────────────────
const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0b1d34',
      borderColor: '#1a3a5c',
      borderWidth: 1,
      titleColor: '#7da8cc',
      bodyColor: '#e2eef8',
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(26,58,92,0.5)', drawBorder: false },
      ticks: { color: '#4a7096', maxTicksLimit: 8, font: { size: 10 } },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(26,58,92,0.5)', drawBorder: false },
      ticks: { color: '#4a7096', font: { size: 10 } },
      border: { display: false },
    },
  },
};

function buildTideChart(hours, heights) {
  const el = document.getElementById('tideChart');
  if (tideChartInst) tideChartInst.destroy();
  const labels = hours.map(h => {
    const d = new Date(); d.setHours(h, 0, 0, 0);
    return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  });
  const ctx = el.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 175);
  grad.addColorStop(0, 'rgba(14,165,233,0.45)');
  grad.addColorStop(1, 'rgba(14,165,233,0.02)');

  tideChartInst = new Chart(el, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: heights,
        fill: true,
        backgroundColor: grad,
        borderColor: '#0ea5e9',
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#0ea5e9',
        tension: 0.42,
      }],
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        tooltip: {
          ...CHART_DEFAULTS.plugins.tooltip,
          callbacks: { label: c => ` ${c.parsed.y.toFixed(2)} m` },
        },
      },
      scales: {
        ...CHART_DEFAULTS.scales,
        y: { ...CHART_DEFAULTS.scales.y, min: 0, ticks: { ...CHART_DEFAULTS.scales.y.ticks, callback: v => v.toFixed(1) + 'm' } },
      },
    },
  });
}

function buildWindChart(speeds, gusts) {
  const el = document.getElementById('windChart');
  if (windChartInst) windChartInst.destroy();
  const labels = Array.from({ length: 25 }, (_, i) => {
    const d = new Date(); d.setHours(i, 0, 0, 0);
    return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  });
  windChartInst = new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Wind (kn)',
          data: speeds,
          backgroundColor: 'rgba(167,139,250,0.6)',
          borderColor: '#a78bfa',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Gusts (kn)',
          data: gusts,
          type: 'line',
          fill: false,
          borderColor: '#ec4899',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.4,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        legend: {
          display: true,
          labels: { color: '#7da8cc', font: { size: 10 }, boxWidth: 10 },
        },
      },
      scales: {
        ...CHART_DEFAULTS.scales,
        y: { ...CHART_DEFAULTS.scales.y, min: 0, ticks: { ...CHART_DEFAULTS.scales.y.ticks, callback: v => v + 'kn' } },
      },
    },
  });
}

// ── Weather icon ──────────────────────────────────────────────
function wxIcon(speed, hour) {
  if (hour < 6 || hour > 19) return '🌙';
  if (speed >= 25) return '🌩️';
  if (speed >= 18) return '⛈️';
  if (speed >= 12) return '🌬️';
  return hour < 10 || hour > 16 ? '🌤️' : '☀️';
}

function rainChance(speed, hour) {
  const base = speed > 22 ? 65 : speed > 14 ? 30 : 8;
  return Math.min(95, base + Math.round(Math.sin(hour / 5) * 12));
}

// ── Render: stat cards ────────────────────────────────────────
function renderStats(tideH, tideEvents, windData, waveH, temp, uvIdx, biteScore) {
  const now = new Date().getHours();
  const speed = windData.speeds[now];
  const gust  = windData.gusts[now];
  const dir   = windData.dirs[now];

  // Tide
  document.getElementById('tideHeight').textContent = tideH.toFixed(2) + ' m';
  const nextHigh = tideEvents.find(e => e.type === 'high' && e.hour > now);
  const nextLow  = tideEvents.find(e => e.type === 'low'  && e.hour > now);
  if (nextHigh) {
    const t = new Date(); t.setHours(nextHigh.hour, 0, 0, 0);
    document.getElementById('tideStatus').textContent =
      `↑ High ${nextHigh.h.toFixed(2)}m at ${t.toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit'})}`;
  } else if (nextLow) {
    const t = new Date(); t.setHours(nextLow.hour, 0, 0, 0);
    document.getElementById('tideStatus').textContent =
      `↓ Low ${nextLow.h.toFixed(2)}m at ${t.toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit'})}`;
  }
  // Determine rising/falling
  const prevH = tideEvents.length ? tideAtHour(now - 0.5, LOCATIONS[currentLoc].tideOff) : tideH;
  const rising = tideH >= prevH;
  setBadge('tideBadge', rising ? '↑ Rising' : '↓ Falling', rising ? 'info' : 'info');
  const pct = Math.min(100, Math.max(0, (tideH / 2.5) * 100));
  document.getElementById('tideFill').style.width = pct + '%';

  // Wind
  document.getElementById('windSpeed').textContent = speed + ' kn';
  document.getElementById('windDir').textContent   = `${dir} · Gusts ${gust} kn`;
  if (speed >= 26) setBadge('windBadge', '⚠ Strong', 'danger');
  else if (speed >= 18) setBadge('windBadge', 'Moderate', 'warn');
  else setBadge('windBadge', 'Light', 'good');
  // Compass needle
  const dirDeg = DIRS.indexOf(dir) * 22.5;
  const needle = document.getElementById('compassNeedle');
  if (needle) needle.style.transform = `translate(-50%, -100%) rotate(${dirDeg}deg)`;

  // Wave
  document.getElementById('waveHeight').textContent = waveH.toFixed(1) + ' m';
  document.getElementById('wavePeriod').textContent  = `Period ~${Math.round(5 + waveH * 2.5)}s`;
  if (waveH >= 2.0) setBadge('waveBadge', 'Rough', 'danger');
  else if (waveH >= 1.2) setBadge('waveBadge', 'Choppy', 'warn');
  else setBadge('waveBadge', 'Slight', 'good');

  // Temp
  document.getElementById('waterTemp').textContent = temp + '°C';
  document.getElementById('tempSub').textContent   = parseFloat(temp) >= 26 ? 'Warm — ideal' : parseFloat(temp) >= 22 ? 'Comfortable' : 'Cool';
  setBadge('tempBadge', temp + '°C', parseFloat(temp) >= 24 ? 'good' : 'info');

  // UV
  const uv = uvCategory(uvIdx);
  document.getElementById('uvIndex').textContent = uvIdx;
  document.getElementById('uvSub').textContent   = uv.label + (uvIdx > 0 ? ' — wear SPF50+' : '');
  setBadge('uvBadge', uv.label, uv.cls);

  // Bite
  document.getElementById('biteRating').textContent = biteScore + '/10';
  document.getElementById('biteRating').style.color  = BITE_COLORS[biteScore];
  document.getElementById('biteSub').textContent    = BITE_LABELS[biteScore];
  setBadge('biteBadge', BITE_LABELS[biteScore], biteScore >= 7 ? 'good' : biteScore >= 5 ? 'info' : 'warn');
}

function setBadge(id, text, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'card-badge' + (cls ? ' ' + cls : '');
}

// ── Render: tide events ───────────────────────────────────────
function renderTideEvents(events) {
  const el = document.getElementById('tideEvents');
  el.innerHTML = '';
  events.forEach(e => {
    const d = new Date(); d.setHours(e.hour, 0, 0, 0);
    const span = document.createElement('div');
    span.className = `tide-event ${e.type}`;
    span.textContent = `${e.type === 'high' ? '⬆' : '⬇'} ${e.type.toUpperCase()} ${e.h.toFixed(2)}m @ ${d.toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit'})}`;
    el.appendChild(span);
  });
}

// ── Render: alerts strip ──────────────────────────────────────
function renderAlerts(windSpeed, waveH, biteScore, uvIdx) {
  const el = document.getElementById('alertsRow');
  el.innerHTML = '';
  const add = (type, text) => {
    const p = document.createElement('div');
    p.className = `alert-pill ${type}`;
    p.textContent = text;
    el.appendChild(p);
  };

  if (windSpeed >= 26)     add('danger', `💨 Strong Wind ${windSpeed} kn`);
  else if (windSpeed >= 18) add('warn',   `💨 Moderate Wind ${windSpeed} kn`);
  else                      add('good',   `💨 Light Wind ${windSpeed} kn`);

  if (waveH >= 2.0) add('danger', `🌊 High Swell ${waveH.toFixed(1)}m`);
  else if (waveH >= 1.2) add('warn', `🌊 Moderate Swell ${waveH.toFixed(1)}m`);
  else add('good', `🌊 Calm Swell ${waveH.toFixed(1)}m`);

  if (biteScore >= 8) add('good',   `🎣 Prime Fishing Conditions`);
  else if (biteScore >= 6) add('good', `🎣 Good Bite Activity`);
  else if (biteScore <= 4)  add('warn', `🎣 Poor Bite Conditions`);

  if (uvIdx >= 11) add('danger', `☀️ Extreme UV — Index ${uvIdx}`);
  else if (uvIdx >= 8) add('warn', `☀️ Very High UV — ${uvIdx}`);

  const h = new Date().getHours();
  if (h >= 5 && h <= 8)   add('good', `🌅 Dawn Feeding Window`);
  if (h >= 16 && h <= 19) add('good', `🌇 Dusk Feeding Window`);
}

// ── Render: fishing conditions panel ─────────────────────────
function renderFishingPanel(tideH, windSpeed, waveH, biteScore) {
  // Ring
  const circ = 327;
  const offset = circ * (1 - biteScore / 10);
  const ring = document.getElementById('biteRingCircle');
  ring.style.strokeDashoffset = offset;
  ring.style.stroke = BITE_COLORS[biteScore] || '#22c55e';
  document.getElementById('biteRingValue').textContent = biteScore;
  document.getElementById('scoreLabel').textContent    = BITE_LABELS[biteScore];
  document.getElementById('scoreLabel').style.color    = BITE_COLORS[biteScore];

  // Factors
  const factors = [
    { label: '🌊 Tide',  pct: Math.round(Math.min(tideH / 2.4, 1) * 100),              val: tideH.toFixed(2)+'m', color: '#0ea5e9' },
    { label: '💨 Wind',  pct: Math.max(0, 100 - Math.round(windSpeed / 33 * 100)),      val: windSpeed+'kn',       color: '#a78bfa' },
    { label: '🌀 Swell', pct: Math.round(Math.max(0, 1 - waveH / 2.5) * 100),          val: waveH.toFixed(1)+'m', color: '#06b6d4' },
  ];
  const sf = document.getElementById('scoreFactors');
  sf.innerHTML = factors.map(f => `
    <div class="factor-row">
      <span class="factor-label">${f.label}</span>
      <div class="factor-bg"><div class="factor-fill" style="width:${f.pct}%;background:${f.color}"></div></div>
      <span class="factor-val" style="color:${f.color}">${f.val}</span>
    </div>`).join('');

  // Species chips
  const chips = document.getElementById('speciesChips');
  chips.innerHTML = '';
  const locSpecies = SPECIES[currentLoc] || [];
  locSpecies.forEach(sp => {
    const c = document.createElement('div');
    c.className = `species-chip ${sp.rating}`;
    c.textContent = sp.name;
    c.title = sp.tip;
    chips.appendChild(c);
  });

  renderBiteReports();
}

function renderBiteReports() {
  const list = document.getElementById('biteReportsList');
  list.innerHTML = '';
  if (!biteReports.length) {
    list.innerHTML = '<div style="font-size:11px;color:var(--text3);padding:6px 0">No reports yet — be the first!</div>';
    return;
  }
  biteReports.slice().reverse().forEach(r => {
    const el = document.createElement('div');
    el.className = 'report-item';
    el.innerHTML = `
      <div class="report-top">
        <span class="report-loc">📍 ${r.location}</span>
        <span class="report-score">${r.score}/10</span>
      </div>
      <span class="report-species">🐟 ${r.species}</span>
      ${r.bait  ? `<span class="report-bait">🎣 ${r.bait}</span>` : ''}
      ${r.notes ? `<span class="report-notes">${r.notes}</span>` : ''}
      <span class="report-time">${timeAgo(r.time)}</span>`;
    list.appendChild(el);
  });
}

// ── Render: hourly strip ──────────────────────────────────────
function renderHourly(heights, windData) {
  const el = document.getElementById('hourlyScroll');
  el.innerHTML = '';
  const nowH = new Date().getHours();
  for (let h = 0; h < 24; h++) {
    const isNow = h === nowH;
    const card = document.createElement('div');
    card.className = 'hourly-card' + (isNow ? ' now' : '');
    const d = new Date(); d.setHours(h, 0, 0, 0);
    const label = isNow ? 'Now' : d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
    card.innerHTML = `
      <span class="h-time ${isNow ? 'now' : ''}">${label}</span>
      <span class="h-icon">${wxIcon(windData.speeds[h], h)}</span>
      <span class="h-tide">${heights[h].toFixed(2)}m</span>
      <span class="h-wind">${windData.speeds[h]}kn ${windData.dirs[h]}</span>
      <span class="h-rain">💧${rainChance(windData.speeds[h], h)}%</span>`;
    el.appendChild(card);
  }
  const cards = el.querySelectorAll('.hourly-card');
  if (cards[nowH]) setTimeout(() => cards[nowH].scrollIntoView({ inline: 'center', behavior: 'smooth' }), 100);
}

// ── Render: spots grid ────────────────────────────────────────
function renderSpots() {
  const grid = document.getElementById('spotsGrid');
  grid.innerHTML = '';
  SPOTS.forEach(s => {
    const card = document.createElement('div');
    card.className = 'spot-card';
    const stars = '★'.repeat(s.stars) + '☆'.repeat(5 - s.stars);
    card.innerHTML = `
      <div class="spot-name">${s.name}</div>
      <div class="spot-type">${s.type}</div>
      <div class="spot-species">${s.species.map(x => `<span class="spot-tag">${x}</span>`).join('')}</div>
      <div class="spot-tip">${s.tip}</div>
      <div class="spot-rating"><span class="spot-stars" style="color:#f59e0b">${stars}</span></div>`;
    grid.appendChild(card);
  });
}

// ── Seed bite reports ─────────────────────────────────────────
function seedBiteReports(locKey) {
  const loc = LOCATIONS[locKey].name;
  const sp  = SPECIES[locKey] || [];
  biteReports = [
    { location: loc, species: sp[0]?.name || 'Coral Trout', score: 8, bait: 'Live prawns',    notes: 'Active bite on incoming tide, early morning.', time: Date.now() - 3600000 },
    { location: loc, species: sp[1]?.name || 'Snapper',     score: 7, bait: 'Soft plastics',  notes: 'Good numbers on the reef edge.',                time: Date.now() - 7200000 },
    { location: loc, species: sp[2]?.name || 'Flathead',    score: 6, bait: 'Mullet strips',  notes: 'Slow but consistent.',                          time: Date.now() - 14400000 },
  ];
}

// ── Helpers ───────────────────────────────────────────────────
function timeAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Warning banner ────────────────────────────────────────────
function showWarning(w) {
  if (!w || warnDismissed) return;
  document.getElementById('warningText').textContent = w.msg;
  document.getElementById('warningBanner').classList.remove('hidden');
  if (Notification.permission === 'granted') {
    new Notification('CQ Tides Warning', { body: w.msg, icon: '🦈' });
  }
}
function dismissWarning() {
  document.getElementById('warningBanner').classList.add('hidden');
  warnDismissed = true;
  setTimeout(() => { warnDismissed = false; }, 20 * 60000);
}

// ── Modal ─────────────────────────────────────────────────────
function openBiteModal()  { document.getElementById('biteModal').classList.remove('hidden'); }
function closeBiteModal() { document.getElementById('biteModal').classList.add('hidden'); }
function modalBgClick(e)  { if (e.target === document.getElementById('biteModal')) closeBiteModal(); }
function submitBiteReport() {
  const loc     = document.getElementById('biteLocation').value;
  const species = document.getElementById('biteSpecies').value.trim() || 'Unknown';
  const score   = parseInt(document.getElementById('biteScore').value);
  const bait    = document.getElementById('biteBait').value.trim();
  const notes   = document.getElementById('biteNotes').value.trim();
  biteReports.push({ location: loc, species, score, bait, notes, time: Date.now() });
  closeBiteModal();
  renderBiteReports();
  // Reset form
  document.getElementById('biteSpecies').value = '';
  document.getElementById('biteBait').value    = '';
  document.getElementById('biteNotes').value   = '';
  document.getElementById('biteScore').value   = '7';
  document.getElementById('biteScoreVal').textContent = '7';
}

// ── Remote Data Fetch ────────────────────────────────────────
async function fetchRemoteData() {
  const cfg = window.APP_CONFIG;
  if (!cfg?.supabase_url || !cfg?.supabase_anon_key) return;
  try {
    const res = await fetch(
      `${cfg.supabase_url}/rest/v1/app_config?select=key,value`,
      { headers: { 'apikey': cfg.supabase_anon_key, 'Authorization': `Bearer ${cfg.supabase_anon_key}` } }
    );
    if (!res.ok) return;
    const rows = await res.json();
    rows.forEach(({ key, value }) => {
      if (key === 'spots')      SPOTS      = value;
      if (key === 'bait_lures') BAIT_LURES = value;
      if (key === 'retailers')  RETAILERS  = value;
    });
  } catch (_) { /* silently fall back to hardcoded defaults */ }
}

// ── Ocean Background Animation ────────────────────────────────
function initBgAnimation() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const rng = Math.random.bind(Math);

  // ── Mouse tracking ─────────────────────────────────────────
  let mx = -2000, my = -2000, pmx = -2000, pmy = -2000;
  const ripples = [];

  window.addEventListener('mousemove', e => {
    pmx = mx; pmy = my;
    mx = e.clientX; my = e.clientY;
    const moved = Math.hypot(mx - pmx, my - pmy);
    if (moved > 18 && rng() < 0.25) {
      ripples.push({ x: mx, y: my, r: 0, maxR: 70, alpha: 0.18, spd: 2.2 });
    }
  });
  window.addEventListener('click', e => {
    for (let i = 0; i < 3; i++) {
      ripples.push({ x: e.clientX, y: e.clientY, r: i * 18, maxR: 160 + i * 30, alpha: 0.45 - i * 0.1, spd: 3.5 });
    }
  });

  // ── Caustic light seeds ────────────────────────────────────
  const caustics = Array.from({ length: 10 }, () => ({
    x: rng() * 1400, y: rng() * 600,
    vx: (rng() - 0.5) * 0.35, vy: (rng() - 0.5) * 0.18,
    r: rng() * 90 + 45,
  }));

  // ── Seaweed ────────────────────────────────────────────────
  const seaweed = Array.from({ length: 16 }, () => ({
    x:     rng() * 1600,
    segs:  Math.floor(rng() * 5) + 6,
    segH:  rng() * 14 + 9,
    amp:   rng() * 14 + 5,
    phase: rng() * Math.PI * 2,
    spd:   rng() * 0.007 + 0.003,
    hue:   148 + rng() * 28,
    width: rng() * 2 + 1.5,
  }));

  // ── Bubbles ────────────────────────────────────────────────
  const bubbles = Array.from({ length: 32 }, () => ({
    x: rng() * 1600, y: rng() * 900,
    r: rng() * 2.8 + 0.6,
    spd: rng() * 0.38 + 0.08,
    alpha: rng() * 0.18 + 0.04,
    wx: rng() * Math.PI * 2, wxS: (rng() - 0.5) * 0.03,
  }));

  // ── Fish (boids with mouse avoidance) ─────────────────────
  const FCOLORS = ['#38bdf8','#06b6d4','#0ea5e9','#7dd3fc','#bae6fd','#22d3ee'];
  const fishes = Array.from({ length: 22 }, () => ({
    x: rng() * 1600, y: rng() * 700 + 80,
    vx: (rng() - 0.5) * 1.4, vy: (rng() - 0.5) * 0.4,
    size: rng() * 11 + 5,
    maxSpd: rng() * 1.4 + 0.7,
    color: FCOLORS[Math.floor(rng() * FCOLORS.length)],
    alpha: rng() * 0.11 + 0.04,
    tp: rng() * Math.PI * 2,
    ts: rng() * 0.07 + 0.03,
  }));

  // ── Waves ─────────────────────────────────────────────────
  const waves = [
    { off: 0, spd: 0.0020, amp: 26, yF: 0.80, alpha: 0.055, col: '#0c4a6e' },
    { off: 1, spd: 0.0032, amp: 16, yF: 0.86, alpha: 0.070, col: '#0369a1' },
    { off: 2, spd: 0.0052, amp: 9,  yF: 0.92, alpha: 0.090, col: '#0284c7' },
  ];

  let t = 0, shimOff = 0;

  // ── Draw one fish ──────────────────────────────────────────
  function drawFish(f) {
    const angle = Math.atan2(f.vy, f.vx);
    const tw    = Math.sin(f.tp) * 0.28;
    const s     = f.size;
    ctx.save();
    ctx.globalAlpha = f.alpha;
    ctx.translate(f.x, f.y);
    ctx.rotate(angle);

    // Body gradient
    const bg = ctx.createRadialGradient(-s * 0.15, -s * 0.1, 0, 0, 0, s);
    bg.addColorStop(0,   'rgba(220,245,255,0.9)');
    bg.addColorStop(0.5, f.color);
    bg.addColorStop(1,   f.color + 'aa');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.78, 0);
    ctx.lineTo(-s * 1.55, -s * 0.48 + tw * s * 0.4);
    ctx.lineTo(-s * 1.55,  s * 0.48 + tw * s * 0.4);
    ctx.closePath();
    ctx.fill();

    // Dorsal fin
    ctx.beginPath();
    ctx.moveTo(s * 0.08, -s * 0.38);
    ctx.quadraticCurveTo(s * 0.35, -s * 0.82, s * 0.58, -s * 0.38);
    ctx.fill();

    // Pectoral fin
    ctx.globalAlpha = f.alpha * 0.55;
    ctx.beginPath();
    ctx.moveTo(-s * 0.05, 0);
    ctx.quadraticCurveTo(-s * 0.1, s * 0.58, s * 0.22, s * 0.44);
    ctx.quadraticCurveTo(s * 0.32, s * 0.22, -s * 0.05, 0);
    ctx.fill();

    // Scale lines
    ctx.globalAlpha = f.alpha * 0.28;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth   = 0.4;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(i * s * 0.17, 0, s * 0.34, -Math.PI * 0.55, Math.PI * 0.55);
      ctx.stroke();
    }

    // Eye
    ctx.globalAlpha = f.alpha;
    ctx.fillStyle = 'rgba(2,6,20,0.85)';
    ctx.beginPath();
    ctx.arc(s * 0.54, -s * 0.07, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.arc(s * 0.57, -s * 0.10, s * 0.045, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ── Update fish (boids + mouse flee) ──────────────────────
  function updateFish(f) {
    f.tp += f.ts;
    const FLEE_R  = 130, FISH_R = 65;
    let ax = 0, ay = 0;

    // Mouse flee
    const dm = Math.hypot(f.x - mx, f.y - my);
    if (dm < FLEE_R && dm > 0) {
      const force = ((FLEE_R - dm) / FLEE_R) * 2.8;
      ax += (f.x - mx) / dm * force;
      ay += (f.y - my) / dm * force;
    }

    // Boids
    let sepX=0,sepY=0, aliVx=0,aliVy=0, cohX=0,cohY=0, n=0;
    for (const o of fishes) {
      if (o === f) continue;
      const d = Math.hypot(f.x-o.x, f.y-o.y);
      if (d < FISH_R && d > 0) {
        sepX += (f.x-o.x)/d; sepY += (f.y-o.y)/d;
        aliVx += o.vx; aliVy += o.vy;
        cohX += o.x;  cohY += o.y;
        n++;
      }
    }
    if (n > 0) {
      ax += sepX * 0.035 + (aliVx/n - f.vx) * 0.012 + ((cohX/n) - f.x) * 0.0006;
      ay += sepY * 0.035 + (aliVy/n - f.vy) * 0.012 + ((cohY/n) - f.y) * 0.0006;
    }

    // Gentle wander
    ax += (rng() - 0.5) * 0.09;
    ay += (rng() - 0.5) * 0.025;

    f.vx += ax; f.vy += ay;
    const spd = Math.hypot(f.vx, f.vy);
    if (spd > f.maxSpd) { f.vx = f.vx/spd*f.maxSpd; f.vy = f.vy/spd*f.maxSpd; }
    if (spd < 0.12) { f.vx += (rng()-0.5)*0.3; }

    f.x += f.vx; f.y += f.vy;
    if (f.x >  W+70) f.x = -70;
    if (f.x < -70)   f.x =  W+70;
    if (f.y > H*0.95) f.vy -= 0.06;
    if (f.y < H*0.06) f.vy += 0.06;
  }

  // ── Draw seaweed ───────────────────────────────────────────
  function drawSeaweed(sw) {
    let cx = sw.x, cy = H;
    ctx.save();
    ctx.lineWidth = sw.width;
    ctx.lineCap   = 'round';
    ctx.lineJoin  = 'round';
    for (let i = 0; i < sw.segs; i++) {
      const prog  = i / sw.segs;
      const wave  = Math.sin(t * sw.spd * 60 + sw.phase + prog * 2.8) * sw.amp * Math.sqrt(prog);
      const nx    = cx + wave;
      const ny    = cy - sw.segH;
      ctx.globalAlpha = 0.22 + prog * 0.18;
      ctx.strokeStyle = `hsl(${sw.hue}, ${52 + prog*14}%, ${11 + prog*9}%)`;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cx + wave * 0.4, cy - sw.segH * 0.5, nx, ny);
      ctx.stroke();
      cx = nx; cy = ny;
    }
    ctx.restore();
  }

  // ── Main frame ────────────────────────────────────────────
  function frame() {
    if (document.hidden) return;
    W = canvas.width; H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    t += 0.016; shimOff += 0.006;

    // 1. Deep ocean gradient
    const ocean = ctx.createLinearGradient(0, 0, 0, H);
    ocean.addColorStop(0,    '#010a16');
    ocean.addColorStop(0.35, '#021626');
    ocean.addColorStop(0.75, '#031e38');
    ocean.addColorStop(1,    '#062544');
    ctx.globalAlpha = 1;
    ctx.fillStyle   = ocean;
    ctx.fillRect(0, 0, W, H);

    // 2. Caustic light blobs (screen blend)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    caustics.forEach(c => {
      c.x += c.vx; c.y += c.vy;
      if (c.x < 0 || c.x > W) c.vx *= -1;
      if (c.y < 0 || c.y > H*0.65) c.vy *= -1;
      const cg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
      cg.addColorStop(0,   'rgba(14,165,233,0.028)');
      cg.addColorStop(0.5, 'rgba(6,182,212,0.014)');
      cg.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, W, H);
    });
    ctx.restore();

    // 3. Water surface shimmer columns (top edge)
    ctx.save();
    for (let x = 0; x < W; x += 4) {
      const yBot = 18 + Math.sin(x * 0.038 + shimOff) * 9
                      + Math.sin(x * 0.019 + shimOff * 0.65) * 5;
      const lAlpha = 0.035 + Math.abs(Math.sin(x * 0.009 + shimOff)) * 0.055;
      ctx.globalAlpha = lAlpha;
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, yBot);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Bubbles
    bubbles.forEach(b => {
      b.y -= b.spd; b.wx += b.wxS; b.x += Math.sin(b.wx) * 0.3;
      if (b.y < -10) { b.y = H + 10; b.x = rng() * W; }
      const bg = ctx.createRadialGradient(b.x - b.r*0.3, b.y - b.r*0.3, 0, b.x, b.y, b.r);
      bg.addColorStop(0,   'rgba(190,235,255,0.55)');
      bg.addColorStop(0.6, 'rgba(100,180,255,0.1)');
      bg.addColorStop(1,   'rgba(100,180,255,0)');
      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.fillStyle   = bg;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 0.45;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    });

    // 5. Fish
    fishes.forEach(updateFish);
    fishes.forEach(drawFish);

    // 6. Seaweed
    seaweed.forEach(sw => {
      if (sw.x > W + 60) sw.x = -40;
      drawSeaweed(sw);
    });

    // 7. Wave layers
    waves.forEach(w => {
      w.off += w.spd;
      ctx.save();
      ctx.globalAlpha = w.alpha;
      ctx.fillStyle   = w.col;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W + 6; x += 5) {
        const y = H * w.yF
          + Math.sin((x/W)*Math.PI*5 + w.off) * w.amp
          + Math.sin((x/W)*Math.PI*2.3 + w.off*0.58) * w.amp * 0.42;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
      ctx.restore();
    });

    // 8. Mouse ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.r += rip.spd; rip.alpha -= 0.007;
      if (rip.alpha <= 0) { ripples.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = rip.alpha;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth   = 1.2;
      ctx.beginPath(); ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI*2); ctx.stroke();
      if (rip.r > 22) {
        ctx.globalAlpha = rip.alpha * 0.4;
        ctx.beginPath(); ctx.arc(rip.x, rip.y, rip.r - 14, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }

    // 9. Cursor glow (subtle underwater cursor highlight)
    if (mx > 0 && mx < W) {
      const cg = ctx.createRadialGradient(mx, my, 0, mx, my, 55);
      cg.addColorStop(0,   'rgba(14,165,233,0.06)');
      cg.addColorStop(1,   'rgba(14,165,233,0)');
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, W, H);
    }

    // 10. Depth vignette
    const vig = ctx.createRadialGradient(W*0.5, H*0.5, H*0.18, W*0.5, H*0.5, H*0.95);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(1,4,12,0.5)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) requestAnimationFrame(frame);
  });
}

// ── VIP Management ────────────────────────────────────────────
function initVIP() {
  isVIP = localStorage.getItem('cqtides_vip') === 'true';
  renderVIPState();
}

function renderVIPState() {
  const btn = document.getElementById('vipHeaderBtn');
  const ads = ['adBanner1', 'adBanner2'];
  if (isVIP) {
    if (btn) { btn.textContent = '⭐ VIP'; btn.classList.add('active'); }
    ads.forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); });
  } else {
    if (btn) { btn.textContent = '⭐ Go VIP'; btn.classList.remove('active'); }
    ads.forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); });
  }
}

function openVIPModal() {
  document.getElementById('vipSignupPanel').classList.toggle('hidden', isVIP);
  document.getElementById('vipActivePanel').classList.toggle('hidden', !isVIP);
  document.getElementById('vipModal').classList.remove('hidden');
}
function closeVIPModal() { document.getElementById('vipModal').classList.add('hidden'); }
function vipBgClick(e)   { if (e.target === document.getElementById('vipModal')) closeVIPModal(); }

function subscribeVIP() {
  const name  = document.getElementById('vipName').value.trim();
  const email = document.getElementById('vipEmail').value.trim();
  const card  = document.getElementById('vipCard').value.replace(/\s/g,'');
  const expiry= document.getElementById('vipExpiry').value.trim();
  const cvv   = document.getElementById('vipCVV').value.trim();
  if (!name || !email) { alert('Please enter your name and email.'); return; }
  if (card.length < 12) { alert('Please enter a valid card number.'); return; }
  if (!expiry || !cvv)  { alert('Please complete all payment fields.'); return; }
  isVIP = true;
  localStorage.setItem('cqtides_vip', 'true');
  localStorage.setItem('cqtides_vip_email', email);
  renderVIPState();
  document.getElementById('vipSignupPanel').classList.add('hidden');
  document.getElementById('vipActivePanel').classList.remove('hidden');
  if (Notification.permission === 'granted') {
    new Notification('Welcome to CQ Tides VIP! ⭐', { body: 'Ads removed. All features unlocked. Enjoy the fishing!', icon: '🦈' });
  }
}

function cancelVIP() {
  if (!confirm('Cancel your VIP subscription? Ads will return.')) return;
  isVIP = false;
  localStorage.removeItem('cqtides_vip');
  localStorage.removeItem('cqtides_vip_email');
  renderVIPState();
  closeVIPModal();
}

function formatCard(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
}

// ── Render: bait & lures ──────────────────────────────────────
function renderBaitLures() {
  const data = BAIT_LURES[currentLoc];
  if (!data) return;
  document.getElementById('baitLocLabel').textContent = LOCATIONS[currentLoc].name;

  const items = data[currentBaitTab] || [];
  const grid  = document.getElementById('baitGrid');
  grid.innerHTML = '';
  const typeClass = currentBaitTab === 'bait' ? 'bait' : currentBaitTab === 'lures' ? 'lure' : 'rig';

  items.forEach(item => {
    const stars = '★'.repeat(item.stars) + '☆'.repeat(5 - item.stars);
    const card  = document.createElement('div');
    card.className = `bait-card ${typeClass}`;
    card.innerHTML = `
      <div class="bait-card-top">
        <span class="bait-icon">${item.icon}</span>
        <span class="bait-stars">${stars}</span>
      </div>
      <div class="bait-name">${item.name}</div>
      <div class="bait-target">🎯 ${item.target}</div>
      <div class="bait-use">${item.use}</div>
      <div class="bait-tip">${item.tip}</div>`;
    grid.appendChild(card);
  });

  const tipEl = document.getElementById('seasonalTip');
  tipEl.textContent = data.seasonalTip || '';
}

function switchBaitTab(tab, btn) {
  currentBaitTab = tab;
  document.querySelectorAll('.btab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBaitLures();
}

// ── Render: retailers ─────────────────────────────────────────
function renderRetailers() {
  const list = RETAILERS[currentRetailerTab] || [];
  const grid = document.getElementById('retailersGrid');
  grid.innerHTML = '';
  list.forEach(r => {
    const card = document.createElement('div');
    card.className = 'retailer-card' + (r.recommended ? ' recommended' : '');
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => window.open(r.url, '_blank', 'noopener'));
    const mapBtn = r.mapsUrl
      ? `<a href="${r.mapsUrl}" target="_blank" rel="noopener" class="retailer-cta" onclick="event.stopPropagation()">📍 Maps</a>`
      : '';
    card.innerHTML = `
      <div class="retailer-logo">${r.logo}</div>
      <div class="retailer-name">${r.name}</div>
      <div class="retailer-addr">${r.addr}</div>
      ${r.phone ? `<div class="retailer-addr">📞 ${r.phone}</div>` : ''}
      <div class="retailer-spec">${r.specialties.map(s => `<span class="retailer-tag">${s}</span>`).join('')}</div>
      <div class="bait-tip" style="margin-top:4px">${r.note}</div>
      <div style="display:flex;gap:8px;margin-top:auto;padding-top:8px;flex-wrap:wrap">
        <span class="retailer-cta">🌐 Visit Website →</span>
        ${mapBtn}
      </div>`;
    grid.appendChild(card);
  });
}

function switchRetailerTab(tab, btn) {
  currentRetailerTab = tab;
  document.querySelectorAll('.rtab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderRetailers();
}

// ── Main refresh ──────────────────────────────────────────────
function refresh() {
  const loc       = LOCATIONS[currentLoc];
  const tideData  = buildTideData(currentLoc);
  const windData  = buildWindData(currentLoc);
  const now       = new Date().getHours();
  const tideH     = tideData.heights[now];
  const tideEvts  = findTideEvents(tideData.heights);
  const waveH     = getWaveHeight(windData.speeds[now]);
  const temp      = getWaterTemp();
  const uvIdx     = getUVIndex();
  const biteScore = calcBiteScore(tideH, windData.speeds[now], waveH);

  // Update location name labels
  document.getElementById('hourlyLocName').textContent = loc.short;

  renderStats(tideH, tideEvts, windData, waveH, temp, uvIdx, biteScore);
  renderTideEvents(tideEvts);
  renderAlerts(windData.speeds[now], waveH, biteScore, uvIdx);
  renderFishingPanel(tideH, windData.speeds[now], waveH, biteScore);
  buildTideChart(tideData.hours, tideData.heights);
  buildWindChart(windData.speeds, windData.gusts);
  renderHourly(tideData.heights, windData);

  buildRadarFrames(windData.speeds[now]);
  radarFrameIdx = radarFrames.length - 1;
  drawRadar(radarFrames[radarFrameIdx]);
  renderRadarTimeline();
  startRadarLoop();

  const warning = checkWarnings(windData.speeds[now], waveH, uvIdx);
  showWarning(warning);

  // Timestamp
  document.getElementById('lastUpdated').textContent =
    'Updated ' + new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function changeLocation() {
  currentLoc = document.getElementById('locationSelect').value;
  warnDismissed = false;
  seedBiteReports(currentLoc);
  currentBaitTab = 'bait';
  document.querySelectorAll('.btab').forEach((b, i) => b.classList.toggle('active', i === 0));
  renderBaitLures();
  refresh();
}

// ── Auto-refresh ──────────────────────────────────────────────
function startAutoRefresh() {
  clearInterval(refreshTimer);
  refreshTimer = setInterval(() => { warnDismissed = false; refresh(); }, REFRESH_MS);
}

// ── Notification permission ───────────────────────────────────
function requestNotifications() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initBgAnimation();
  await fetchRemoteData();
  initVIP();
  seedBiteReports(currentLoc);
  renderSpots();
  renderBaitLures();
  renderRetailers();
  requestNotifications();
  refresh();
  startAutoRefresh();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
});
