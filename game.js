const SAVE_KEY = "parkAfterDarkSaveV4";
const TIMES = ["daytime", "sunset", "night"];
const TIME_LABELS = { daytime: "Daytime", sunset: "Sunset", night: "Night" };
const LOVE_INTEREST_KEYS = ["jack", "caleb", "sierra", "dakota", "natai"];

const defaultState = {
  playerName: "You",
  sceneId: "intro_bus_ride",
  lineIndex: 0,
  selectedRoute: null,
  day: 1,
  timeOfDay: "daytime",
  returnTime: null,
  pendingDestination: null,
  pendingEncounter: null,
  pendingFullLoveScene: null,
  visitTime: null,
  visitBeat: 0,
  visitStartMood: null,
  visitLastChoice: null,
  visitLastReaction: null,
  choiceReactionLines: null,
  choiceReactionNext: null,
  choiceReactionBackground: null,
  choiceReactionLabel: null,
  lineAudioCueKey: null,
  introReturnScene: null,
  devPanelOpen: false,
  devChoicePreview: true,
  devEasyCopy: true,
  devBackButton: true,
  devSkipButton: true,
  devQuickRestoreInputs: true,
  devDisableTypewriter: false,
  feelings: {
    jack: 5,
    caleb: 5,
    sierra: 5,
    dakota: 5,
    natai: 2
  },
  flags: {},
  unlockedCG: [],
  audioEnabled: true
};

let state = clone(defaultState);
let spriteLoadToken = 0;
let propLoadToken = 0;
let lineAutoAdvanceTimer = null;
let lineAmbientTimer = null;
let choiceAutoSelectTimer = null;
let choiceCountdownTimer = null;
const DEV_HISTORY_LIMIT = 100;
let devHistory = [];
let quickRestoreInputTimer = null;
let dialogueTypewriterTimer = null;
let dialogueTypewriterState = null;
let activeLineTransition = null;
let shouldAnimateNextDialogueEntry = false;
let nextDialogueEntryDelayMs = 0;
let nextDialogueRevealDelayMs = 0;
let startGameTransitionTimer = null;
let dialogueEntryTimer = null;

const DIALOGUE_TYPEWRITER = {
  startDelayMs: 110,
  baseDelayMs: 38,
  longLineBaseDelayMs: 30,
  spaceDelayMs: 13,
  commaPauseMs: 125,
  semicolonPauseMs: 170,
  sentencePauseMs: 270,
  questionPauseMs: 295,
  dashPauseMs: 160,
  ellipsisStepMs: 58,
  ellipsisPauseMs: 430,
  newlinePauseMs: 270
};
const DAY_TRANSITION_EXIT_MS = 980;
const DAY_TRANSITION_EXIT_WITH_SCENE_MS = 1250;

const QUICK_RESTORE_PREFIX = "NPAD1:";
const QUICK_RESTORE_STATE_KEYS = [
  "playerName",
  "sceneId",
  "lineIndex",
  "selectedRoute",
  "day",
  "timeOfDay",
  "returnTime",
  "pendingDestination",
  "pendingEncounter",
  "pendingFullLoveScene",
  "visitTime",
  "visitBeat",
  "visitStartMood",
  "visitLastChoice",
  "visitLastReaction",
  "choiceReactionLines",
  "choiceReactionNext",
  "choiceReactionBackground",
  "choiceReactionLabel",
  "introReturnScene",
  "feelings",
  "flags",
  "unlockedCG"
];

const characters = {
  player: { name: () => state.playerName, sprite: "", color: "#7b2f24" },
  narrator: { name: "Narrator", sprite: "", color: "#5f3a19" },
  dakotaNatai: {
    name: "Dakota & Natai",
    shortName: "Dakota & Natai",
    sprite: "assets/charactures/shared/dakota_natai_reconciliation_full_body.png",
    sprites: { neutral: "assets/charactures/shared/dakota_natai_reconciliation_full_body.png" },
    color: "#5f3a19"
  },
  jack: {
    name: "Jack",
    shortName: "Jack",
    park: "Olympic",
    location: "olympic",
    sprites: {
      ...characterSprites("jack"),
      offeringShirt: "assets/charactures/jack/full_love/offering_shirt.png"
    },
    color: "#8f3f24"
  },
  caleb: {
    name: "Caleb",
    shortName: "Caleb",
    park: "Yellowstone",
    location: "yellowstone",
    sprites: {
      ...characterSprites("caleb"),
      fullLoveRomantic: "assets/charactures/caleb/full_love_romantic.png",
      fullLoveRage: "assets/charactures/caleb/full_love_rage.png"
    },
    color: "#276345"
  },
  sierra: {
    name: "Sierra",
    shortName: "Sierra",
    park: "Yosemite",
    location: "yosemite",
    sprites: {
      ...characterSprites("sierra"),
      sly: "assets/charactures/sierra/sly.png",
      stargazingStep2: "assets/charactures/sierra/full_love/stargazing_step_2.png",
      stargazingStep3: "assets/charactures/sierra/full_love/stargazing_step_3.png",
      stargazingStep4: "assets/charactures/sierra/full_love/stargazing_step_4.png"
    },
    color: "#8b3f63"
  },
  dakota: {
    name: "Dakota",
    shortName: "Dakota",
    park: "Sequoia",
    location: "sequoia",
    sprites: {
      ...characterSprites("dakota"),
      sadExplaining: "assets/charactures/dakota/sad_explaining.png",
      flattered: "assets/charactures/dakota/flattered.png",
      transformationSequence: "assets/charactures/dakota/full_love/transformation_sequence.png",
      humanHappyShock: "assets/charactures/dakota/full_love/human_happy_shock.png",
      humanConfidentFlex: "assets/charactures/dakota/full_love/human_confident_flex.png",
      bearTouchedFlex: "assets/charactures/dakota/full_love/bear_touched_flex.png",
      bearFlexSmolderBlush: "assets/charactures/dakota/full_love/bear_flex_smolder_blush.png",
      walkingCloserSmolder: "assets/charactures/dakota/full_love/walking_closer_smolder.png"
    },
    color: "#704719"
  },
  natai: {
    name: "Natai",
    shortName: "Natai",
    park: "Zion",
    location: "zion",
    sprites: {
      ...characterSprites("natai"),
      angryExplaining: "assets/charactures/natai/story/angry_explaining.png",
      sleepingBagRomantic: "assets/charactures/natai/full_love/sleeping_bag_romantic.png",
      emptySleepingBag: "assets/charactures/natai/full_love/empty_sleeping_bag.png"
    },
    color: "#245f76"
  }
};

const backgroundCatalog = {
  checkIn: {
    daytime: "assets/backgrounds/time_variants/checkIn/daytime.png",
    sunset: "assets/backgrounds/time_variants/checkIn/sunset.png",
    night: "assets/backgrounds/time_variants/checkIn/night.png"
  },
  lodge: {
    daytime: "assets/backgrounds/time_variants/lodge/daytime.png",
    sunset: "assets/backgrounds/time_variants/lodge/sunset.png",
    night: "assets/backgrounds/time_variants/lodge/night.png"
  },
  olympic: {
    daytime: "assets/backgrounds/time_variants/olympic/daytime.png",
    sunset: "assets/backgrounds/time_variants/olympic/sunset.png",
    night: "assets/backgrounds/time_variants/olympic/night.png"
  },
  yellowstone: {
    daytime: "assets/backgrounds/time_variants/yellowstone/daytime.png",
    sunset: "assets/backgrounds/time_variants/yellowstone/sunset.png",
    night: "assets/backgrounds/time_variants/yellowstone/night.png"
  },
  yellowstoneMisty: {
    daytime: "assets/backgrounds/special/yellowstone_night_misty.png",
    sunset: "assets/backgrounds/special/yellowstone_night_misty.png",
    night: "assets/backgrounds/special/yellowstone_night_misty.png"
  },
  yosemite: {
    daytime: "assets/backgrounds/time_variants/yosemite/daytime.png",
    sunset: "assets/backgrounds/time_variants/yosemite/sunset.png",
    night: "assets/backgrounds/time_variants/yosemite/night.png"
  },
  yosemiteMeadowNight: {
    daytime: "assets/backgrounds/special/yosemite_meadow_night.png",
    sunset: "assets/backgrounds/special/yosemite_meadow_night.png",
    night: "assets/backgrounds/special/yosemite_meadow_night.png"
  },
  zionClearingNight: {
    daytime: "assets/backgrounds/special/natai/zion_clearing_night.png",
    sunset: "assets/backgrounds/special/natai/zion_clearing_night.png",
    night: "assets/backgrounds/special/natai/zion_clearing_night.png"
  },
  jackCabinNight: {
    daytime: "assets/backgrounds/special/jack/cabin_interior_night.png",
    sunset: "assets/backgrounds/special/jack/cabin_interior_night.png",
    night: "assets/backgrounds/special/jack/cabin_interior_night.png"
  },
  jackCabinDay: {
    daytime: "assets/backgrounds/special/jack/cabin_interior_daytime.png",
    sunset: "assets/backgrounds/special/jack/cabin_interior_daytime.png",
    night: "assets/backgrounds/special/jack/cabin_interior_daytime.png"
  },
  sequoia: {
    daytime: "assets/backgrounds/time_variants/sequoia/daytime.png",
    sunset: "assets/backgrounds/time_variants/sequoia/sunset.png",
    night: "assets/backgrounds/time_variants/sequoia/night.png"
  },
  zion: {
    daytime: "assets/backgrounds/time_variants/zion/daytime.png",
    sunset: "assets/backgrounds/time_variants/zion/sunset.png",
    night: "assets/backgrounds/time_variants/zion/night.png"
  },
  black: { daytime: "", sunset: "", night: "" }
};

const backgroundClasses = {
  black: "bg-black",
  lodge: "bg-lodge",
  checkIn: "bg-lodge",
  olympic: "bg-smoky",
  yellowstone: "bg-yellowstone",
  yellowstoneMisty: "bg-yellowstone",
  yosemite: "bg-yosemite",
  yosemiteMeadowNight: "bg-yosemite",
  zionClearingNight: "bg-zion",
  jackCabinNight: "bg-smoky",
  jackCabinDay: "bg-smoky",
  sequoia: "bg-smoky",
  zion: "bg-zion"
};

const SKIP_TO_LOCATION_LABELS = {
  checkIn: "Check-In",
  lodge: "Lodge Lobby",
  olympic: "Olympic",
  yellowstone: "Yellowstone",
  yellowstoneMisty: "Yellowstone Mist",
  yosemite: "Yosemite",
  yosemiteMeadowNight: "Yosemite Meadow",
  zionClearingNight: "Zion Clearing",
  jackCabinNight: "Jack's Cabin",
  jackCabinDay: "Jack's Cabin Morning",
  sequoia: "Sequoia",
  zion: "Zion"
};

const SKIP_TO_VISIT_DESTINATIONS = {
  olympic: "jack",
  yellowstone: "caleb",
  yosemite: "sierra",
  sequoia: "dakota",
  zion: "natai"
};

const SKIP_TO_SCENE_TARGETS = {
  yellowstoneMisty: "full_love_caleb_start",
  yosemiteMeadowNight: "full_love_sierra_meadow",
  zionClearingNight: "full_love_natai_camp",
  jackCabinNight: "full_love_jack_cabin",
  jackCabinDay: "full_love_jack_morning_wake",
  sequoia: "full_love_dakota_start"
};

const musicThemes = {
  introspection: { src: "assets/audio/music/Almost Bliss.mp3", loopStart: 11.2, loopEnd: 303.4, volume: 0.34 },
  lodge: { src: "assets/audio/music/Clear Air.mp3", loopStart: 8.2, loopEnd: 176.8, volume: 0.52 },
  checkIn: { src: "assets/audio/music/Evening.mp3", loopStart: 7.4, loopEnd: 176.8, volume: 0.46 },
  jack: { src: "assets/audio/music/Windswept.mp3", loopStart: 9.6, loopEnd: 199.8, volume: 0.5 },
  caleb: { src: "assets/audio/music/On My Way.mp3", loopStart: 11.2, loopEnd: 243.8, volume: 0.5 },
  sierra: { src: "assets/audio/music/Morning.mp3", loopStart: 6.0, loopEnd: 146.0, volume: 0.54 },
  jackFullLoveCabin: { src: "assets/audio/music/Anamalie.mp3", loopStart: 3.0, loopEnd: 203.0, volume: 0.44 },
  jackFullLoveGood: { src: "assets/audio/music/Slow Burn.mp3", loopStart: 4.0, loopEnd: 224.0, volume: 0.42 },
  calebFullLoveRomantic: { src: "assets/audio/music/Heartwarming.mp3", loopStart: 1.2, loopEnd: 69.0, volume: 0.46 },
  calebFullLoveGood: { src: "assets/audio/music/Your Call.mp3", loopStart: 4.0, loopEnd: 219.0, volume: 0.42 },
  calebFullLoveBad: { src: "assets/audio/music/Volatile Reaction.mp3", loopStart: 1.6, loopEnd: 161.0, volume: 0.42 },
  sierraFullLoveMeadow: { src: "assets/audio/music/There is Romance.mp3", loopStart: 2.0, loopEnd: 193.0, volume: 0.42 },
  sierraFullLoveGood: { src: "assets/audio/music/Sardana.mp3", loopStart: 2.0, loopEnd: 187.0, volume: 0.4 },
  dakota: { src: "assets/audio/music/Fireflies and Stardust.mp3", loopStart: 9.0, loopEnd: 244.5, volume: 0.5 },
  dakotaFullLoveTender: { src: "assets/audio/music/Promises to Keep.mp3", loopStart: 4.0, loopEnd: 178.0, volume: 0.36 },
  dakotaFullLoveDesire: { src: "assets/audio/music/Slow Burn.mp3", loopStart: 4.0, loopEnd: 224.0, volume: 0.4 },
  brothersReconcile: { src: "assets/audio/music/Heartwarming.mp3", loopStart: 1.2, loopEnd: 69.0, volume: 0.48 },
  nataiFullLoveCanyon: { src: "assets/audio/music/Native American Spirit Ritual.mp3", loopStart: 0.0, loopEnd: 278.0, volume: 0.52 },
  nataiFullLoveGood: { src: "assets/audio/music/Firesong.mp3", loopStart: 8.0, loopEnd: 210.0, volume: 0.38 },
  natai: { src: "assets/audio/music/Crowd Hammer.mp3", loopStart: 7.5, loopEnd: 198.5, volume: 0.45 }
};

const locationMusic = {
  black: "introspection",
  lodge: "lodge",
  checkIn: "checkIn",
  olympic: "jack",
  jackCabinNight: "jack",
  jackCabinDay: "jack",
  yellowstone: "caleb",
  yellowstoneMisty: "caleb",
  yosemite: "sierra",
  yosemiteMeadowNight: "sierra",
  sequoia: "dakota",
  zion: "natai",
  zionClearingNight: "natai"
};

const sfxTracks = {
  advance: { src: "assets/audio/sfx/qubodup-click/qubodup-click/qubodup-click2.wav", volume: 0.26 },
  choice: { src: "assets/audio/sfx/snd_close_map.wav", volume: 0.18 },
  type: { src: "assets/audio/sfx/qubodup-click/qubodup-click/qubodup-hover2.wav", volume: 0.12 },
  scene: { src: "assets/audio/sfx/snd_use_map.wav", volume: 0.16, startAt: 0.06 },
  character: { src: "assets/audio/sfx/qubodup-click/qubodup-click/qubodup-click1.wav", volume: 0.2 },
  save: { src: "assets/audio/sfx/chimey/Chime_Save.mp3", volume: 0.58 },
  door: { src: "assets/audio/sfx/creaky_door_hinge.wav", volume: 0.68 },
  dakotaRoar: { src: "assets/audio/sfx/animals/bear_roar.mp3", volume: 0.62 },
  thunderFlash: { src: "assets/audio/sfx/ambient/thunder_flash.wav", volume: 0.76 },
  magicTransform: { src: "assets/audio/sfx/chimey/Chime_LevelUp.mp3", volume: 0.74 },
  busApproachStop: { src: "assets/audio/sfx/bus/bus_approach_stop.mp3", volume: 0.24, channel: "bus" },
  busIdle: { src: "assets/audio/sfx/bus/bus_idle.mp3", volume: 0.18, channel: "bus" },
  busDeparture: { src: "assets/audio/sfx/bus/bus_departure.mp3", volume: 0.24, channel: "bus" }
};

const ambientTracks = {
  bus: { src: "assets/audio/sfx/bus/school_bus_country_road_loop.ogg", volume: 0.12, delayMs: 1400, fadeMs: 2600 },
  rainForest: { src: "assets/audio/sfx/ambient/rain_forest_loop.ogg", volume: 0.34, fadeMs: 1800, stopFadeMs: 1600 },
  rainRoof: { src: "assets/audio/sfx/ambient/rain_roof_loop.mp3", volume: 0.42, fadeMs: 1800, stopFadeMs: 3600 },
  morningBirds: { src: "assets/audio/sfx/ambient/subtle_morning_birds.wav", volume: 0.3, fadeMs: 2200, stopFadeMs: 1800 },
  nataiMorning: { src: "assets/audio/sfx/ambient/subtle_morning_birds.wav", volume: 0.3, fadeMs: 1800, stopFadeMs: 2400 },
  dakotaMorning: { src: "assets/audio/sfx/ambient/subtle_morning_birds.wav", volume: 0.3, fadeMs: 1800, stopFadeMs: 2400 },
  dryGrassWalk: { src: "assets/audio/sfx/ambient/dry_grass_walking_late_night.mp3", volume: 0.26, fadeMs: 1600, stopFadeMs: 1600 }
};

function walkingAmbient(options = {}) {
  return {
    ...options,
    startOverlayAmbient: "dryGrassWalk",
    startOverlayAmbientAfterMs: options.startOverlayAmbientAfterMs ?? 250,
    stopOverlayAmbientOnAdvance: true
  };
}

function shouldUseDryGrassWalk(character) {
  return ["sierra", "dakota", "natai"].includes(character);
}

function lineSuggestsWalking(line) {
  const text = Array.isArray(line) ? line[1] || "" : "";
  return /\b(walks?|walking|leads?|trail|path|pace|steps?)\b/i.test(text);
}

function addWalkingAmbientToLine(line) {
  if (!Array.isArray(line)) return line;
  return [line[0], line[1], line[2], walkingAmbient(line[3] || {})];
}

function addWalkingAmbientForCharacter(character, line) {
  const background = resolveBackground(resolveValue(scenes[state.sceneId]?.background));
  return background.location === "black" && shouldUseDryGrassWalk(character) && lineSuggestsWalking(line)
    ? addWalkingAmbientToLine(line)
    : line;
}

const cgLibrary = {
  jackCabin: { title: "Rain-Soaked Cabin", image: "assets/backgrounds/special/jack/cabin_interior_night.png" },
  jackFullLoveGood: { title: "Rain On The Roof", image: "assets/backgrounds/special/jack/cabin_interior_daytime.png" },
  calebSteam: { title: "Boardwalk Boundaries", image: "assets/backgrounds/time_variants/yellowstone/daytime.png" },
  calebFullLoveGood: { title: "Steam, Sparks, and Footnotes", image: "assets/backgrounds/special/yellowstone_night_misty.png" },
  sierraWaterfall: { title: "No Filter Needed", image: "assets/backgrounds/time_variants/yosemite/sunset.png" },
  sierraFullLoveGood: { title: "Where The Quiet Lands", image: "assets/backgrounds/special/yosemite_meadow_night.png" },
  dakotaGrove: { title: "Forest Protector", image: "assets/backgrounds/time_variants/sequoia/daytime.png" },
  dakotaFullLoveGood: { title: "True Form", image: "assets/charactures/dakota/full_love/bear_touched_flex.png" },
  brothersReconciled: { title: "Brothers Again", image: "assets/charactures/shared/dakota_natai_reconciliation_full_body.png" },
  nataiCanyon: { title: "Permit Approved", image: "assets/backgrounds/time_variants/zion/night.png" },
  nataiFullLoveGood: { title: "Only One Sleeping Bag", image: "assets/charactures/natai/full_love/sleeping_bag_romantic.png" }
};

const fullLoveScenes = {
  jack: {
    character: "jack",
    requiredFeeling: 10,
    times: ["night"],
    entryScene: "full_love_jack_start",
    completedFlag: "jackFullLoveGood"
  },
  caleb: {
    character: "caleb",
    requiredFeeling: 10,
    times: ["night"],
    entryScene: "full_love_caleb_start",
    completedFlag: "calebFullLoveGood"
  },
  sierra: {
    character: "sierra",
    requiredFeeling: 10,
    times: ["night"],
    entryScene: "full_love_sierra_start",
    completedFlag: "sierraFullLoveGood"
  },
  natai: {
    character: "natai",
    requiredFeeling: 10,
    times: ["night"],
    entryScene: "full_love_natai_start",
    completedFlag: "nataiFullLoveGood"
  },
  dakota: {
    character: "dakota",
    requiredFeeling: 10,
    times: ["sunset"],
    entryScene: "full_love_dakota_start",
    completedFlag: "dakotaFullLoveGood"
  }
};

const parkFlavor = {
  jack: {
    place: "the rain cabin",
    visit: {
      daytime: {
        low: ["Jack walks beside you like old volunteer days: gentle voice, broad shoulders, ready boot.", "The rainforest drips green. He points out nurse logs, elk tracks, and a forest pancake."],
        neutral: ["Jack guides you through Olympic rain with old-friend warmth and a list of slick boards.", "He makes the forest feel familiar without making it smaller."],
        high: ["Jack meets you under the cedar eaves with two coffees and a smile that ruins his balance.", "The trail smells like moss, coffee, and feelings that waited years to become inconvenient."]
      },
      sunset: {
        low: ["Jack's cabin windows glow warm. Even disappointed, he still saves you the dry side.", "He corrects your footing twice, then apologizes to the mud."],
        neutral: ["Gold light threads through the rain while Jack checks trail markers and forgets directions.", "He says Olympic looks best when the weather seems dramatic enough to need a hug."],
        high: ["Sunset turns the wet cedars copper. Jack watches you watch them with helpless tenderness.", "He says the forest gets pretty for people who listen, then blushes because he means you."]
      },
      night: {
        low: ["Night folds around the cabin. Jack hands you the brighter lantern before you can ask.", "Somewhere in the trees, water moves over stone like it has better secrets."],
        neutral: ["Jack leads a short lantern walk, voice low, hand hovering near your elbow on slick boards.", "He admits he once got lost because two cedars looked 'emotionally identical.'"],
        high: ["By lantern light, Jack grins like rain and honesty learned the same face.", "Olympic at night feels like friendship finally saying the quiet part out loud."]
      }
    },
    surprise: {
      low: ["Jack frowns at a damp stack of maps. 'Hey. Please do not make me worry in three directions.'"],
      neutral: ["Jack smooths a rain-smudged route card. 'The kiosk works better if you do not insult it.'"],
      high: ["Jack leans on the kiosk, rain in his hair. 'I had a warning ready. You ruined it.'"]
    }
  },
  caleb: {
    place: "the Yellowstone boardwalk",
    visit: {
      daytime: {
        low: ["Caleb waits by the boardwalk with maps, laminated diagrams, and visible restraint.", "Steam rolls over the pools. Hurt or not, he still wants the place understood."],
        neutral: ["Caleb walks you past turquoise pools and hissing vents like Yellowstone has footnotes.", "He starts with safety, detours into supervolcano history, and somehow makes both flirt."],
        high: ["Caleb saves you the best boardwalk view, steam curling around him before he speaks.", "He says your name softly, then blushes like he prepared notes for this exact moment."]
      },
      sunset: {
        low: ["Sunset stains the geyser steam orange. Caleb's patience is present, but sorted into bullets.", "He asks about hot spring colors, then looks wounded that it sounded like a quiz."],
        neutral: ["Yellowstone glows at sunset, all mineral color and long shadows.", "Caleb relaxes when you stay behind the rail without being asked.", "He says the park holds more than half the world's active geysers.", "Then he admits he saved that fact for someone he wanted to impress."]
      ,
        high: ["At sunset, Caleb's smile appears through the steam with impeccable timing.", "He likes showing you the park because your questions make his whole brain sit up straighter."]
      },
      night: {
        low: ["The boardwalk is quiet at night. Caleb gives you a flashlight and exact warnings.", "A distant geyser exhales. He still whispers the one fact he thinks you would like."],
        neutral: ["Night settles over Yellowstone in cool blue layers.", "Caleb points out stars, steam, and eruption records he memorized by season.", "His voice gentles when the crowds disappear, like trivia is his safest road to tenderness."],
        high: ["Under the night sky, Caleb stands close while the hot springs breathe around you.", "He calls Yellowstone dangerous, gorgeous, patterned, and the reason he risks being obvious."]
      }
    },
    surprise: {
      low: ["Caleb fixes a typo on a fact card. 'Do not call geysers hot-spring fountains near me.'"],
      neutral: ["Caleb refills the sunscreen basket. 'Prepared is romantic in several climates.'"],
      high: ["Caleb presses a trail snack into your hand. 'Old Faithful is punctual, not the biggest.'"]
    }
  },
  sierra: {
    place: "the Yosemite waterfall trail",
    visit: {
      daytime: {
        low: ["Sierra bounds ahead, then checks that you are actually looking at the overlook.", "Granite cliffs rise behind her. She says both of them are hard to impress."],
        neutral: ["Sierra leads you toward a waterfall turning mist into sunlight.", "She moves like the trail is a dance floor with consequences.", "She teases you past the obvious view, then says your focused face is trouble."],
        high: ["Sierra waits at the overlook, bright-eyed and wind-tossed, like Yosemite gave her lighting.", "Mist catches in your hair. She says Yosemite is showing off for you.", "Then she adds that the park has excellent taste."]
      },
      sunset: {
        low: ["Sunset paints the granite pink. Sierra loves the view too much to stay annoyed.", "She still gives you no free points.", "She asks if you can admire a cliff without making it about yourself.", "Then she smiles like charm might still salvage the answer."],
        neutral: ["The Yosemite cliffs warm to gold as Sierra slows down for once.", "She says sunset is when the park stops showing off and starts telling the truth.", "Apparently it is also her favorite time to make people blush."],
        high: ["Sierra pulls you to a viewpoint just as the granite catches fire with sunset.", "She goes quiet for one precious second.", "Then she says the view is almost as distracting as you."]
      },
      night: {
        low: ["The waterfall is a pale line in the dark. Sierra keeps the pace brisk and sharp.", "She is still impossible to ignore, even when every smile arrives with a point on it."],
        neutral: ["At night, Yosemite turns spare and echoing.", "Sierra points out the water before you can see it.", "She likes that you listen, and says so in a voice built to ruin concentration."],
        high: ["Moonlight turns the waterfall silver. Sierra takes your hand for one tricky step.", "She does not let go immediately.", "She says some views work better when nobody is trying to caption them.", "Then she swallows another secret."]
      }
    },
    surprise: {
      low: ["Sierra laces her boots by check-in. 'Going somewhere? Bring better trail banter this time.'"],
      neutral: ["Sierra jogs past, then points at your bottle. 'Hydrate. Cliffs need alert witnesses.'"],
      high: ["Sierra arrives with mist in her hair. 'I was not waiting. I was simply easy to find.'"]
    }
  },
  dakota: {
    place: "the Sequoia grove",
    visit: {
      daytime: {
        low: ["Dakota stands among the giant trees with a rake and a careful, distant expression.", "The sequoias make even awkward silence feel ancient."],
        neutral: ["Dakota shows you the grove slowly, choosing each word like one wrong one could start a fire.", "He talks about shade, patience, and how some mistakes keep following after the smoke."],
        high: ["Dakota waits under the giant trees with a soft, guarded smile.", "He saved you a quiet path through the grove, but even happy he keeps part of himself back."]
      },
      sunset: {
        low: ["Sunset filters through the trees. Dakota stays gentle, but he does not hand you trust.", "He checks an old fire ring with practiced hands and a sadness too worn to be only work."],
        neutral: ["The grove deepens to amber while Dakota talks about keeping old things alive.", "He never pretends damage did not happen.", "From him, even the heavy parts sound like a bid for a gentler future."],
        high: ["Sunset makes the sequoias glow, and Dakota looks ready to step closer.", "Then old shame pulls him back.", "He admits the grove feels less quiet after your visits.", "Then he pretends the bark needs inspection."]
      },
      night: {
        low: ["At night, Dakota's lantern swings low between the trunks. He is polite and hard to fool.", "The grove swallows your footsteps while he glances into the dark like it once knew his name."],
        neutral: ["Dakota leads you through the night grove, where the trunks vanish upward into stars.", "He jokes that trees are excellent listeners.", "Then the wind says something old, and he goes quiet."],
        high: ["The sequoias stand black against the stars. Dakota offers his hand without fanfare.", "It is steady as a railing.", "With him, the dark feels less empty and more held, though he still lets go first."]
      }
    },
    surprise: {
      low: ["Dakota replaces a lantern wick. 'Even small fires need attention,' he says softly."],
      neutral: ["Dakota arranges snacks by allergy label. 'Take one. Caring works better fed.'"],
      high: ["Dakota offers you a warm biscuit. 'Road fuel.' Then he spots a Zion card and goes quiet."]
    }
  },
  natai: {
    place: "the Zion canyon route",
    visit: {
      daytime: {
        low: ["Natai waits beneath red canyon walls, checking the permit board with surgical calm.", "The desert light is sharp. So are they.", "The anger underneath looks older than the morning."],
        neutral: ["Natai guides you through Zion's sandstone corridor, naming hazards like old rivals.", "They are dry and exact, and any mention of brothers makes them go quiet."],
        high: ["Natai stands in desert light bright enough to turn every edge honest.", "They say, 'Good. You made the canyon less smug.'", "Then they pretend they said nothing vulnerable."]
      },
      sunset: {
        low: ["Sunset sets the sandstone burning. Natai lets the view do the heavy lifting.", "Their answers stay spare.", "You get the sense they are listening for an apology years late."],
        neutral: ["Zion at sunset is all copper walls and cooling air.", "Natai slows beside you without announcing it.", "They say the canyon has excellent taste in dramatic timing.", "Then they look furious for sounding wistful."],
        high: ["The canyon glows red around Natai, and their reserve thins into something almost tender.", "They say the desert keeps what matters and burns off the rest.", "Some things, apparently, refuse to burn."]
      },
      night: {
        low: ["At night, Natai's route becomes shadow, stars, and firm boundaries.", "They may currently prefer silence to anything that sounds like forgiveness."],
        neutral: ["Natai takes you to a night-sky overlook where Zion becomes shape and hush.", "They point out constellations with permit-level precision.", "Then they admit someone once named them all wrong on purpose."],
        high: ["Under the dark Zion sky, Natai lets the silence stretch until it feels chosen.", "They stand close enough for warmth and mutter, 'Do not make me say this is nice.'", "From Natai, that is basically a campfire."]
      }
    },
    surprise: {
      low: ["Natai argues with the kiosk too calmly. 'It has confidence, not judgment.'"],
      neutral: ["Natai taps your route on the map. 'Efficient. Emotionally suspicious, but efficient.'"],
      high: ["Natai adjusts your route card. 'There. Better odds of surviving your own charm.'"]
    }
  }
};

const checkInFlavor = {
  daytime: [
    ["narrator", "The check-in kiosk chirps, prints nothing, then shows a tiny pinecone loading icon."],
    ["player", "I am choosing to respect whatever this is."]
  ],
  sunset: [
    ["narrator", "A lizard pauses on the warm stone by the kiosk, judges your itinerary, and darts away."],
    ["player", "Honestly, fair."]
  ],
  night: [
    ["narrator", "The kiosk glows softly in the dark, like it knows too much about geography."],
    ["player", "I am not asking follow-up questions after bedtime."]
  ]
};

const arrivalFlavor = {
  jack: {
    daytime: [
      ["narrator", "Olympic opens in wet green layers: ferns, cedars, and a cabin roof ticking in rain."],
      ["player", "The air smells like moss, coffee, and Jack pretending this reunion was not planned."],
      ["narrator", "A porch board creaks.", "jack"],
      ["narrator", "Jack steps out from the eaves, bright-eyed and impossible to miss.", "jack"]
    ],
    sunset: [
      ["narrator", "Sunset catches in the Olympic rain until every drop looks briefly lit from inside."],
      ["player", "This is unfairly pretty. Even the puddles have emotional range."],
      ["player", "Jack is absolutely going to call one of them majestic."],
      ["narrator", "Jack waits by the cabin steps, sleeves rolled, already watching for you.", "jack"]
    ],
    night: [
      ["narrator", "At night, the Olympic route narrows to lantern glow, black cedars, and rain in the dark."],
      ["player", "This is either romantic or a cautionary tale with excellent production design."],
      ["player", "With Jack, honestly, it could be both by accident."],
      ["narrator", "Jack lifts a lantern from the porch rail, his smile soft and immediate when he sees you.", "jack"]
    ]
  },
  caleb: {
    daytime: [
      ["narrator", "Yellowstone arrives in steam and mineral color, with the boardwalk cutting through danger."],
      ["player", "Everything here looks like it could kill me and then be photogenic about it."],
      ["narrator", "Caleb appears at the rail with a clipboard and a pocket field guide.", "caleb"],
      ["narrator", "He looks one question away from explaining the whole park.", "caleb"]
    ],
    sunset: [
      ["narrator", "Sunset turns the geyser steam peach and gold, softening everything except the warning signs."],
      ["player", "The park is glowing. The signs are still yelling. Caleb is probably delighted."],
      ["narrator", "Caleb checks the boardwalk gate, then looks up from a notebook.", "caleb"],
      ["narrator", "It is labeled 'Things Yellowstone Is Doing Today.'", "caleb"]
    ],
    night: [
      ["narrator", "Yellowstone after dark is blue steam, boardwalk lights, and distant thermal breaths."],
      ["player", "The hot springs sound alive. That is gorgeous and deeply not reassuring."],
      ["narrator", "Caleb steps into the light with a flashlight and a star chart in his pocket.", "caleb"],
      ["narrator", "His serious expression does a poor job hiding relief.", "caleb"]
    ]
  },
  sierra: {
    daytime: [
      ["narrator", "Yosemite rises in granite, pine, and waterfall mist that catches the sun in quick flashes."],
      ["player", "Okay. I understand why people write poems and then pretend they did not."],
      ["player", "I also understand why Sierra would catch me doing it.", "sierra"],
      ["narrator", "Sierra jogs down from the overlook, already smiling like you are the fun part.", "sierra"]
    ],
    sunset: [
      ["narrator", "Sunset slides across Yosemite's granite faces, warming the cliffs into impossibility."],
      ["player", "The whole valley is showing off. Honestly, respect."],
      ["player", "Sierra is going to make that competitive somehow."],
      ["narrator", "Sierra leans against a trail sign, wind in her hair and a slow grin aimed right at you.", "sierra"]
    ],
    night: [
      ["narrator", "At night, Yosemite becomes a shape of cliffs and water sounds, huge and close in the dark."],
      ["player", "The waterfall is louder when I cannot see all of it."],
      ["player", "Sierra is probably going to tell me that is the point."],
      ["narrator", "Sierra's flashlight bobs along the trail before she appears.", "sierra"],
      ["narrator", "She moves like the dark is another path she knows by heart.", "sierra"]
    ]
  },
  dakota: {
    daytime: [
      ["narrator", "The Sequoia grove receives you in shade and quiet, making the world feel slower."],
      ["player", "I am suddenly aware that I have never been patient enough for a tree to approve of me."],
      ["narrator", "Dakota steps from behind a massive trunk carrying a coil of rope.", "dakota"],
      ["narrator", "His smile arrives carefully, like it asked permission first.", "dakota"]
    ],
    sunset: [
      ["narrator", "Sunset filters through the Sequoia canopy in amber shafts, turning dust into sparks."],
      ["player", "This place makes ordinary breathing feel like a respectful activity."],
      ["narrator", "Dakota kneels by an old fire ring, checking it with gentle seriousness.", "dakota"],
      ["narrator", "Then he notices you and hides something sad behind a polite nod.", "dakota"]
    ],
    night: [
      ["narrator", "The night grove is quiet enough to make every footstep ask permission."],
      ["player", "The trees disappear upward into the stars. I feel very small, but not in a bad way."],
      ["narrator", "A lantern glow rounds one trunk, and Dakota follows it.", "dakota"],
      ["narrator", "He is steady as a promise he still does not think he deserves to make.", "dakota"]
    ]
  },
  natai: {
    daytime: [
      ["narrator", "Zion's canyon walls rise red and clean, the desert light sharpening every edge."],
      ["player", "The whole place looks carved by someone with excellent taste and no patience for subtlety."],
      ["narrator", "Natai stands by the permit board, marking a route with exacting precision.", "natai"],
      ["narrator", "They look like they have opinions about shortcuts and old wars with them.", "natai"]
    ],
    sunset: [
      ["narrator", "Sunset turns Zion's sandstone copper, cooling the air while the canyon keeps the day's heat."],
      ["player", "This view is extremely rude. It knows exactly what it is doing."],
      ["narrator", "Natai waits at the trail split, arms folded, watching the light change.", "natai"],
      ["narrator", "It looks like the canyon owes them an answer and still has not paid.", "natai"]
    ],
    night: [
      ["narrator", "At night, Zion becomes dark stone, pale trail dust, and a sky crowded with stars."],
      ["player", "The canyon is quieter now. Or maybe it is just making me listen harder."],
      ["narrator", "Natai's silhouette stands against the starlit sign, still enough to seem carved there.", "natai"]
    ]
  }
};

const visitBeats = {
  jack: [
    {
      prompt: {
        low: ["jack", "Before we go, ranger question: trail today or terrible decision today?", "jack:grumpy"],
        neutral: ["jack", "First rule: the forest gets a vote. Second: I am still bad at normal near you.", "jack"],
        high: ["jack", "I hoped you'd show up. I practiced casual, then lost my cool.", "jack:blushing"]
      },
      choices: [
        { label: "Promise him you will follow the marked trail like old times.", feelings: { jack: 1 }, tone: "warm" },
        { label: "Tease that a little risk always made your adventures better.", feelings: { jack: -2 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Promise to stay on the marked trail because worrying him is unfair.", feelings: { jack: 1 }, tone: "warm", reaction: [["jack", "Thank you. My heart is large, hardworking, and only has maybe four brain cells supervising it.", "jack:grumpy"], ["narrator", "He starts walking, still guarded, but the old softness finds its way back into his shoulders.", "jack:grumpy"]] },
          { label: "Ask whether every rule is really necessary.", feelings: { jack: -3 }, tone: "bad", reaction: [["jack", "Yes. I checked with Caleb, Natai, and a sign. Caleb had citations. The sign was the most polite about it.", "jack:grumpy"], ["narrator", "He tries to smile, but worry keeps winning.", "jack:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["jack", "Good. I like our adventures best when nobody has to carry anybody.", "jack:laughing"], ["jack", "Unless it is romantic or somebody twists an ankle. Ignore that second part.", "jack:laughing"], ["narrator", "He laughs at himself, warm and embarrassed, then offers his hand over the slick first step.", "jack"]],
        flirt: [["jack", "Careful. That is dangerously close to making me forget all my trail facts except 'wow.'", "jack:blushing"], ["narrator", "He holds your gaze one rain-bright second before pointing at a fern like it saved him.", "jack:blushing"]],
        bad: [["jack", "Stories are better when everyone gets home to tell them.", "jack:grumpy"], ["jack", "Also when my chest does not do the scary drum thing.", "jack:grumpy"], ["narrator", "He is not trying to scold you. That somehow makes it worse.", "jack:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["narrator", "Jack blocks a mossy side path with one boot and a worried look.", "jack:grumpy"],
        neutral: ["narrator", "Rain beads on the rail while Jack points out elk tracks, then guesses moose.", "jack"],
        high: ["narrator", "Under the old-growth canopy, Jack slows until your sleeves brush.", "jack:blushing"]
      },
      choices: [
        { label: "Notice the tiny seedlings because he taught you to look for them.", feelings: { jack: 2 }, tone: "warm" },
        { label: "Step toward the side path just to make him fuss over you.", feelings: { jack: -2 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Point out the nurse log and ask before stepping closer.", feelings: { jack: 1 }, tone: "warm", reaction: [["jack", "Asking first. Look at us. Growth. Emotional fertilizer. That sounded better before I said it.", "jack"], ["narrator", "The smallest smile breaks through, familiar as an old trail song.", "jack"]] },
          { label: "Say the closed path would make a better shot.", feelings: { jack: -3 }, tone: "bad", reaction: [["jack", "Then take a worse shot and a better hint. I can lift a fallen branch. I cannot lift you out of bad judgment every time.", "jack:grumpy"], ["narrator", "He plants himself between you and the side path, gentle but immovable.", "jack:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["jack", "You remembered. I mean, of course you remembered. You remember the good stuff.", "jack:blushing"], ["narrator", "His voice softens with pride so plain it makes the rain feel like privacy.", "jack:blushing"]],
        flirt: [["jack", "I contain multitudes. Some of them can read a trail closure.", "jack:laughing"], ["jack", "Some are thinking about your face and cannot be trusted with navigation.", "jack:laughing"], ["player", "A devastating combination.", "jack:laughing"]],
        bad: [["jack", "Nope. Nope with love. A strong, respectful nope.", "jack:grumpy"], ["narrator", "He says it gently and still somehow becomes an entire locked gate.", "jack:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["jack", "We are heading back before the weather proves a point. Its points are wet.", "jack:grumpy"],
        neutral: ["jack", "One viewpoint ahead, then I get you back before the trail changes mood.", "jack"],
        high: ["jack", "One more overlook, then I return you to the kiosk like an adult for once.", "jack:blushing"]
      },
      choices: [
        { label: "Thank him for showing you the park the way he always promised.", feelings: { jack: 2 }, tone: "warm" },
        { label: "Say you are already looking for an excuse to come back to him.", feelings: { jack: 2 }, tone: "flirt" },
        { label: "Say the rain is kind of ruining the aesthetic.", feelings: { jack: -2 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Thank him for keeping you safe even while hurt.", feelings: { jack: 1 }, tone: "warm", reaction: [["jack", "I can be hurt and still care about you. I have a lot of room in here. Not a lot of shelving, but room.", "jack"], ["narrator", "His expression eases by a fraction, and with Jack a fraction is already honest.", "jack"]] },
          { label: "Complain that this visit was mostly rules.", feelings: { jack: -3 }, tone: "bad", reaction: [["jack", "Because you kept auditioning for consequences, and I am trying not to clap.", "jack:grumpy"], ["narrator", "The walk back becomes very scenic and very quiet.", "jack:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["jack", "I did promise. I also promised I'd learn banjo, but this worked out better for everyone.", "jack:laughing"], ["narrator", "He walks you back slowly, happy and bashful in a way friendship alone never used to explain.", "jack:laughing"]],
        flirt: [["jack", "To me. Right. I heard that. My brain is waving a tiny flag and falling down.", "jack:blushing"], ["narrator", "His smile follows you all the way back to the route marker, helpless and shining.", "jack:blushing"]],
        bad: [["jack", "The rain is the aesthetic. Also it worked really hard today. Probably.", "jack:grumpy"], ["narrator", "He turns toward the return trail, still kind, but quieter than before.", "jack:grumpy"]]
      }
    }
  ],
  caleb: [
    {
      prompt: {
        low: ["caleb", "Before we start, remember the boardwalk matters and the park is serious.", "caleb:grumpy"],
        neutral: ["caleb", "Boardwalk rule first: beauty can still be dangerous. 'Quick fact' means well.", "caleb"],
        high: ["caleb", "Glad you came. I brought one safety note, one microbe fact, and nerves.", "caleb:blushing"]
      },
      choices: [
        { label: "Promise both feet stay on the boardwalk and ask for the quick fact.", feelings: { caleb: 2 }, tone: "warm" },
        { label: "Tell him Yellowstone trivia is killing the mood.", feelings: { caleb: -2 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Repeat the boardwalk rule and ask him to explain the caldera properly.", feelings: { caleb: 1 }, tone: "warm", reaction: [["caleb", "Properly? That is a dangerous word to say to me. Yellowstone's caldera is roughly thirty by forty-five miles, and I am showing restraint by not drawing it in the dust.", "caleb:grumpy"], ["narrator", "His shoulders lower a little, which feels like earning both a permit and a lecture hall seat.", "caleb:grumpy"]] },
          { label: "Say you already skimmed the signs, so he can relax.", feelings: { caleb: -3 }, tone: "bad", reaction: [["caleb", "Skimming is for grant reports and diner menus, not boiling ground.", "caleb:grumpy"], ["narrator", "His disappointment lands sharper because it is tangled up with how much he wanted to show you everything.", "caleb:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["caleb", "Excellent. Quick fact: those orange edges are heat-loving microbes, not mineral paint.", "caleb:laughing"], ["caleb", "So the colors are basically a living temperature chart.", "caleb:laughing"], ["caleb", "Sorry. That was almost quick.", "caleb:laughing"], ["narrator", "He gestures you forward, pleased you asked for the part of him that keeps spilling over.", "caleb"]],
        flirt: [["caleb", "No. Sometimes I make it sound terrifying.", "caleb:blushing"], ["caleb", "You listening is statistically damaging to my composure.", "caleb:blushing"], ["player", "I am listening very respectfully.", "caleb:blushing"]],
        bad: [["caleb", "Then the mood can file a complaint with hydrothermal reality.", "caleb:grumpy"], ["narrator", "The steam hisses behind him like Yellowstone has prepared a peer-reviewed rebuttal.", "caleb:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["narrator", "Caleb stops by a milky pool, keeping space between you and the rail.", "caleb:grumpy"],
        neutral: ["narrator", "Steam drifts across the boardwalk while Caleb names pools like stern friends.", "caleb"],
        high: ["narrator", "At the overlook, Caleb lowers his voice as steam closes around you.", "caleb:blushing"]
      },
      choices: [
        { label: "Ask what first made him fall for Yellowstone.", feelings: { caleb: 2 }, tone: "warm" },
        { label: "Ask if he has a favorite geyser and why.", feelings: { caleb: 2 }, tone: "flirt" },
        { label: "Lean over the rail for a better look.", feelings: { caleb: -2 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Ask him what the pool is doing under the surface.", feelings: { caleb: 1 }, tone: "warm", reaction: [["caleb", "Circulating heat, minerals, pressure. Water sinks, heats, rises, and carries dissolved silica like the world's least relaxing elevator.", "caleb"], ["narrator", "He hears himself getting excited and lets the excitement stay, wary but grateful.", "caleb"]] },
          { label: "Say the steam would look better from past the rope.", feelings: { caleb: -3 }, tone: "bad", reaction: [["caleb", "Then the photo can remain hypothetical, which is also the safest kind of bad idea.", "caleb:grumpy"], ["narrator", "He moves between you and the rope with ranger-final authority and wounded nerd dignity.", "caleb:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["caleb", "The first geyser I saw looked chaotic, but it followed a pattern older than me.", "caleb"], ["caleb", "I think I fell for the idea that wonder could have mechanics.", "caleb"], ["narrator", "He sounds almost shy about it, like he just handed you the annotated edition of his heart.", "caleb:blushing"]],
        flirt: [["caleb", "Castle Geyser. Obviously.", "caleb:laughing"], ["caleb", "It lasts half an hour and makes commitment look attractive.", "caleb:laughing"], ["narrator", "He realizes halfway through he may not be talking only about geysers, and blushes at once.", "caleb:blushing"]],
        bad: [["caleb", "Back. Now. Curiosity does not require trespassing.", "caleb:grumpy"], ["narrator", "His hand catches your sleeve, firm and frightened under the anger.", "caleb:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["caleb", "I am walking you back before this becomes a ranger talk called Ignore Me.", "caleb:grumpy"],
        neutral: ["caleb", "Last stop. Then I get you back before the light shifts and I mention 1988.", "caleb"],
        high: ["caleb", "One more view, then snacks and two restrained facts.", "caleb:blushing"]
      },
      choices: [
        { label: "Tell him his facts make the park easier to love.", feelings: { caleb: 2 }, tone: "warm" },
        { label: "Ask if the snack comes with another date and another top five list.", feelings: { caleb: 2 }, tone: "flirt" },
        { label: "Say you still think the warnings and lectures are overkill.", feelings: { caleb: -2 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Thank him for still sharing the park with you.", feelings: { caleb: 1 }, tone: "warm", reaction: [["caleb", "I appreciate you saying that. I know I can be a lot. Yellowstone is also a lot, and I have made peace with being thematically consistent.", "caleb"], ["narrator", "The warmth returns carefully, like steam thinning after a gust.", "caleb"]] },
          { label: "Ask if you can skip the facts next time.", feelings: { caleb: -3 }, tone: "bad", reaction: [["caleb", "No. But you may skip me, if that is what you actually want.", "caleb:grumpy"], ["narrator", "Whatever softness had gathered between you vents away into the dark.", "caleb:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["caleb", "That is exactly why I do this.", "caleb:blushing"], ["caleb", "Not the romance part.", "caleb:blushing"], ["caleb", "Possibly the romance part. Statistically emerging.", "caleb:blushing"], ["narrator", "For once, Caleb has no clean citation ready. Just a smile he cannot file away.", "caleb:blushing"]],
        flirt: [["caleb", "It can. The top five list has subcategories.", "caleb:laughing"], ["caleb", "I can also make eye contact through forty percent of it.", "caleb:laughing"], ["narrator", "He hands you the snack like evidence and looks absurdly pleased when your fingers brush.", "caleb:laughing"]],
        bad: [["caleb", "Then I have not explained them well enough, or you decided not to hear me.", "caleb:grumpy"], ["caleb", "I can only fix one of those.", "caleb:grumpy"], ["narrator", "He guides you back with professional precision and personal disappointment.", "caleb:grumpy"]]
      }
    }
  ],
  sierra: [
    {
      prompt: {
        low: ["sierra", "Tell me you came for Yosemite, not just proof. Lie nicely if needed.", "sierra:sly"],
        neutral: ["sierra", "Rule one: look up. Yosemite hates wallpaper, and I hate competing with it.", "sierra:sly"],
        high: ["sierra", "You made it. Good. Mine is cuter. Do not stare only at the cliff.", "sierra:sly"]
      },
      choices: [
        { label: "Look up before answering and let the view land.", feelings: { sierra: 2 }, tone: "warm" },
        { label: "Tell her your eyes are up, but she is making it complicated.", feelings: { sierra: 2 }, tone: "flirt" },
        { label: "Start framing a perfect post instead.", feelings: { sierra: -2 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Put the camera away and look before you speak.", feelings: { sierra: 1 }, tone: "warm", reaction: [["sierra", "Okay. That was almost suspiciously growth-oriented.", "sierra"], ["sierra", "Careful, that look is annoyingly good on you.", "sierra:sly"], ["narrator", "She still looks guarded, but the grin stops hiding quite so hard.", "sierra"]] },
          { label: "Tell her even her judgment has unfair charisma.", feelings: { sierra: 1 }, tone: "flirt", reaction: [["sierra", "Oh.", "sierra:blushing"], ["sierra", "Flattery during probation? Risky. Unfortunately, I respect dangerous trail behavior only when it is verbal.", "sierra:sly"], ["narrator", "Her eyes narrow, but the corner of her mouth gives her away.", "sierra"]] },
          { label: "Say the view will still be there after you get the shot.", feelings: { sierra: -3 }, tone: "bad", reaction: [["sierra", "And I will still be here judging you accurately. Do not worry, I make disappointment look fantastic.", "sierra:sly"], ["narrator", "Her disappointment moves faster than the waterfall mist, even when she tries to keep the smile in place.", "sierra:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["sierra", "There. That pause? That is the good stuff.", "sierra"], ["sierra", "See, I knew you could let the place get to you if you stopped arguing with it.", "sierra:sly"], ["narrator", "She smiles like you found a trail marker, then looks away before it tells on her.", "sierra"]],
        flirt: [["sierra", "Oh, that was smooth.", "sierra:blushing"], ["sierra", "Complicated is my best angle. Keep looking up. I want Yosemite to think it still has a shot.", "sierra:sly"], ["player", "I respect the terrain.", "sierra:blushing"]],
        bad: [["sierra", "Oh, we are doing this the hard way. Fine. I look incredible when I am right.", "sierra:sly"], ["narrator", "She steps between you and the shot with athletic precision.", "sierra:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["narrator", "Sierra leads uphill at a pace that suggests forgiveness has cardio.", "sierra:grumpy"],
        neutral: ["narrator", "Cool mist crosses the trail while Sierra slows so you can catch the rainbow.", "sierra"],
        high: ["narrator", "Sierra bounds up the steps, then waits at the top, smug and fine.", "sierra:blushing"]
      },
      choices: [
        { label: "Ask her what part of the trail most people miss.", feelings: { sierra: 2 }, tone: "warm" },
        { label: "Ask if keeping up with her always feels like being personally challenged by a mountain.", feelings: { sierra: 2 }, tone: "flirt" },
        { label: "Complain that the climb is too much work.", feelings: { sierra: -2 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Ask what you should notice before the obvious overlook.", feelings: { sierra: 1 }, tone: "warm", reaction: [["sierra", "The mist on the leaves. The sound bouncing off granite. Your own breathing, if you can stand being sincere.", "sierra"], ["sierra", "Yours is cute when you forget to be clever.", "sierra:sly"], ["narrator", "She says it sharply, but she slows so you can see it.", "sierra"]] },
          { label: "Ask whether she always scolds people this attractively.", feelings: { sierra: 1 }, tone: "flirt", reaction: [["sierra", "Wow. Starting there?", "sierra:blushing"], ["sierra", "Only the ones with survival potential and terrible timing.", "sierra:sly"], ["narrator", "She turns uphill before you can answer, but her laugh stays behind long enough to count.", "sierra:laughing"]] },
          { label: "Lag behind to film her walking ahead.", feelings: { sierra: -3 }, tone: "bad", reaction: [["sierra", "Do not turn me into scenery because you forgot to keep up. I am much more interesting when you are present for it.", "sierra:sly"], ["narrator", "The waterfall suddenly feels much louder.", "sierra:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["sierra", "The sound. Everyone photographs the water. Fewer people listen to it arrive.", "sierra"], ["sierra", "I like people who notice before the proof shows up. Bad for my mysterious act.", "sierra:blushing"], ["sierra", "Fewer still look that good doing it.", "sierra:sly"], ["narrator", "For a moment, she lets the trail go quiet around you.", "sierra"]],
        flirt: [["sierra", "A mountain?", "sierra:laughing"], ["sierra", "Please. Mountains are subtle compared to me.", "sierra:sly"], ["narrator", "She laughs and darts ahead, daring you to keep up.", "sierra:laughing"]],
        bad: [["sierra", "The view is not a vending machine.", "sierra:sly"], ["sierra", "You do have to move toward it. Same rule applies to me.", "sierra:sly"], ["narrator", "Her expression could cut switchbacks.", "sierra:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["sierra", "We are almost done. Leave with one real memory. Bonus if I am in it.", "sierra:sly"],
        neutral: ["sierra", "Last overlook. Then I return you before the trail decides we belong to it.", "sierra:sly"],
        high: ["sierra", "One more overlook. No captions. Just us, too much granite, and restraint.", "sierra:sly"]
      },
      choices: [
        { label: "Thank her for making you slow down.", feelings: { sierra: 2 }, tone: "warm" },
        { label: "Tell her she is the harder view to walk away from.", feelings: { sierra: 2 }, tone: "flirt" },
        { label: "Say the photos will be the best part.", feelings: { sierra: -2 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Tell her one real memory beat one perfect post today.", feelings: { sierra: 1 }, tone: "warm", reaction: [["sierra", "Finally. Was that so painful?", "sierra"], ["sierra", "You survived sincerity and still look pretty. Inspiring.", "sierra:sly"], ["player", "A little. Worth it.", "sierra:blushing"]] },
          { label: "Admit she is making it difficult to look at anything else.", feelings: { sierra: 1 }, tone: "flirt", reaction: [["sierra", "...Oh.", "sierra:blushing"], ["sierra", "That is the first bad trail decision today that I might reward.", "sierra:sly"], ["narrator", "The waterfall mist catches in her grin like the park itself is encouraging bad ideas.", "sierra"]] },
          { label: "Ask her to move so you can get a cleaner shot.", feelings: { sierra: -3 }, tone: "bad", reaction: [["sierra", "Wow. You really found the trapdoor under the floor. And here I was, looking gorgeous near your chance to be better.", "sierra:sly"], ["narrator", "She steps aside, but the space she leaves feels colder than shade.", "sierra:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["sierra", "Do not make it weird, but... you are welcome.", "sierra:blushing"], ["sierra", "Actually, make it a little weird. I enjoy evidence of impact.", "sierra:sly"], ["narrator", "She looks away at the waterfall, smiling where you can still see it.", "sierra:blushing"]],
        flirt: [["sierra", "Careful.", "sierra:blushing"], ["sierra", "Talk like that and I will start believing you have taste.", "sierra:sly"], ["narrator", "She bumps your shoulder before starting down, slow enough to feel intentional.", "sierra"]],
        bad: [["sierra", "That is a sad little sentence, and I reject it for the cliff and for my cheekbones.", "sierra:sly"], ["narrator", "She heads back with the pace of someone outrunning disappointment.", "sierra:grumpy"]]
      }
    }
  ],
  dakota: [
    {
      prompt: {
        low: ["dakota", "The grove is quiet today. I would like to keep it that way.", "dakota:grumpy"],
        neutral: ["dakota", "Walk slow here. The trees have been patient longer than any of us.", "dakota"],
        high: ["dakota", "I saved you the shaded path. It is the one that makes people hush.", "dakota:flattered"]
      },
      choices: [
        { label: "Lower your voice and match his pace.", feelings: { dakota: 1 }, tone: "warm" },
        { label: "Ask whether he always walks like he is apologizing to the ground.", feelings: { dakota: 0 }, tone: "flirt" },
        { label: "Ask if there is a faster way through.", feelings: { dakota: -1 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Lower your voice and ask where he wants you to walk.", feelings: { dakota: 1 }, tone: "warm", reaction: [["dakota", "Thank you. Quiet is easier to share when nobody has to wrestle it into place.", "dakota"], ["narrator", "His expression softens, slow and cautious.", "dakota"]] },
          { label: "Ask if the trees can really tell the difference.", feelings: { dakota: -2 }, tone: "bad", reaction: [["dakota", "I can.", "dakota:grumpy"], ["narrator", "The two words land softly and somehow sink deep.", "dakota:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["dakota", "Thank you. Some places ask gently, but they still ask.", "dakota"], ["narrator", "His smile comes slow and real, then retreats before it can become too visible.", "dakota"]],
        flirt: [["dakota", "I suppose I do. Old habit.", "dakota:flattered"], ["player", "It is a little charming.", "dakota:flattered"], ["dakota", "That is dangerous feedback. I will file it where I cannot accidentally enjoy it.", "dakota:flattered"]],
        bad: [["dakota", "Through, yes. With, no.", "dakota:grumpy"], ["narrator", "He does not sound angry. Somehow that makes it land harder.", "dakota:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["narrator", "Dakota stops by an old fire ring, checking stones with calm hands.", "dakota:grumpy"],
        neutral: ["narrator", "The trail opens around a sequoia. Dakota rests a paw near a scorch mark.", "dakota"],
        high: ["narrator", "Dakota pauses by a trunk, one hand on bark like greeting a friend.", "dakota:flattered"]
      },
      choices: [
        { label: "Ask him to teach you the fire-safety check.", feelings: { dakota: 1 }, tone: "warm" },
        { label: "Ask gently if he has seen a fire get out of control.", feelings: { dakota: 0 }, tone: "flirt" },
        { label: "Joke that one tiny ember cannot matter much.", feelings: { dakota: -2 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Ask before touching the fire ring stones.", feelings: { dakota: 1 }, tone: "warm", reaction: [["dakota", "Yes. Here, feel for warmth with the back of your hand first.", "dakota"], ["narrator", "He teaches you carefully, pleased by the asking more than he says.", "dakota"]] },
          { label: "Kick ash aside to see if anything is still hot.", feelings: { dakota: -3 }, tone: "bad", reaction: [["dakota", "Stop.", "dakota:grumpy"], ["narrator", "His gentleness disappears just long enough to show you the line.", "dakota:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["dakota", "Gladly. Caring is easier when your hands know what to do.", "dakota:laughing"], ["narrator", "He guides you through the check with patient pride, glancing at the blackened stones.", "dakota:laughing"]],
        flirt: [["dakota", "Yes.", "dakota:sadExplaining"], ["narrator", "The answer is so quiet it feels pulled out of him by the trees.", "dakota:sadExplaining"], ["dakota", "A long time ago. Someone younger than me thought anger could solve danger. It did not.", "dakota:sadExplaining"], ["player", "Someone you knew?", "dakota:sadExplaining"], ["dakota", "Someone I was responsible for remembering honestly.", "dakota:sadExplaining"]],
        bad: [["dakota", "Every big fire starts by being small enough to ignore.", "dakota:grumpy"], ["narrator", "His voice stays gentle, but the grove seems to hold its breath.", "dakota:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["dakota", "I should walk you back. The grove has had enough noise for one visit.", "dakota:grumpy"],
        neutral: ["dakota", "We should head back while the route is easy to read.", "dakota"],
        high: ["dakota", "One last quiet minute, then I stop keeping you here by dear trees.", "dakota:flattered"]
      },
      choices: [
        { label: "Tell him the grove feels safer because he cares for it.", feelings: { dakota: 1 }, tone: "warm" },
        { label: "Ask if favorite trees count as date witnesses.", feelings: { dakota: 1 }, tone: "flirt" },
        { label: "Say you are ready to go because it all looks the same.", feelings: { dakota: -2 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Thank him for trusting you with even a little of the grove.", feelings: { dakota: 1 }, tone: "warm", reaction: [["dakota", "A little trust is still trust. It matters.", "dakota"], ["narrator", "He lets the words rest between you like a lantern set down carefully.", "dakota"]] },
          { label: "Ask if everyone gets this disappointed-tree speech.", feelings: { dakota: -3 }, tone: "bad", reaction: [["dakota", "No. I usually save my disappointment for people I hoped would understand.", "dakota:grumpy"], ["narrator", "The walk back feels longer after that.", "dakota:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["dakota", "That means more than you know.", "dakota:flattered"], ["narrator", "He walks you back with a shy smile and lantern glow, careful not to let the moment go easy.", "dakota:flattered"]],
        flirt: [["dakota", "They are very discreet. Terrible at gossip.", "dakota:flattered"], ["narrator", "His laugh rolls through the grove, warm and low, then retreats like joy asked too much.", "dakota:flattered"]],
        bad: [["dakota", "Then I hope one day it does not.", "dakota:grumpy"], ["narrator", "He leads the way back, quiet settling between you like fallen needles.", "dakota:grumpy"]]
      }
    }
  ],
  natai: [
    {
      prompt: {
        low: ["natai", "Before we begin, are you here to follow the route or argue with geology?", "natai:grumpy"],
        neutral: ["natai", "The canyon is simple if you respect it. People complicate things.", "natai"],
        high: ["natai", "You came. Good. The canyon was getting smug without competition.", "natai:blushing"]
      },
      choices: [
        { label: "Tell them you will respect the route without requiring applause.", feelings: { natai: 1 }, tone: "warm" },
        { label: "Ask whether they trust the canyon more than people.", feelings: { natai: 1 }, tone: "flirt" },
        { label: "Ask how strict the permit rules really are.", feelings: { natai: -3 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "State the route rules back and ask what you missed.", feelings: { natai: 1 }, tone: "warm", reaction: [["natai", "You missed that I dislike being impressed. Continue anyway.", "natai:grumpy"], ["narrator", "They turn toward the trail, still sharp, but no longer dismissing you outright.", "natai:grumpy"]] },
          { label: "Ask if they are always this hostile to guests.", feelings: { natai: -3 }, tone: "bad", reaction: [["natai", "Only the ones who confuse boundaries with hostility.", "natai:grumpy"], ["narrator", "The canyon seems to remove several degrees from the air.", "natai:grumpy"]] },
          { label: "Suggest skipping the permit board and improvising.", feelings: { natai: -4 }, tone: "bad", reaction: [["natai", "Absolutely not. I am now revising my estimate of your survival instincts downward.", "natai:grumpy"], ["narrator", "They mark the route with enough force to make the pencil sound offended.", "natai:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["natai", "Adequate. I am choosing to treat adequate as promising, against precedent.", "natai"], ["narrator", "They turn before the compliment can become recognizable.", "natai"]],
        flirt: [["natai", "Yes.", "natai"], ["player", "That was fast.", "natai"], ["natai", "The canyon has never abandoned me with a mess it helped make.", "natai:angryExplaining"], ["narrator", "The anger flashes hot and personal before Natai locks it away.", "natai:angryExplaining"]],
        bad: [["natai", "Strict enough that I become unpleasant in defense of them.", "natai:grumpy"], ["narrator", "Their calm is somehow sharper than yelling, and twice as hard to recover from.", "natai:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["narrator", "Natai stops where the canyon narrows and lets silence speak for them.", "natai:grumpy"],
        neutral: ["narrator", "Warm sandstone walls hold the day while Natai traces the route with a finger.", "natai"],
        high: ["narrator", "Natai slows at a bend where the canyon light turns red and private.", "natai:blushing"]
      },
      choices: [
        { label: "Ask what the desert taught them to notice first.", feelings: { natai: 1 }, tone: "warm" },
        { label: "Ask if they ever miss someone they are still angry at.", feelings: { natai: 1 }, tone: "flirt" },
        { label: "Kick a loose stone down the trail.", feelings: { natai: -4 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Ask what the canyon needs from you right now.", feelings: { natai: 1 }, tone: "warm", reaction: [["natai", "Attention. Foot placement. Less ornamental confidence.", "natai:grumpy"], ["narrator", "It is not warmth, exactly, but it is instruction instead of dismissal.", "natai:grumpy"]] },
          { label: "Tell them they make silence feel like a punishment.", feelings: { natai: -3 }, tone: "bad", reaction: [["natai", "No. Your discomfort is doing that independently.", "natai:grumpy"], ["narrator", "The words land clean and leave no handles.", "natai:grumpy"]] },
          { label: "Say this would be more fun with music.", feelings: { natai: -4 }, tone: "bad", reaction: [["natai", "Then go find a place shallow enough to need a soundtrack.", "natai:grumpy"], ["narrator", "They do not raise their voice. They do not have to.", "natai:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["natai", "Water. Even when it is absent, it explains the shape of everything.", "natai"], ["narrator", "They say it softly, then look annoyed that softness escaped.", "natai"]],
        flirt: [["natai", "That question has teeth.", "natai:angryExplaining"], ["player", "You do not have to answer.", "natai:angryExplaining"], ["natai", "I had two brothers.", "natai:angryExplaining"], ["natai", "One was brave. One was young enough to confuse pride with courage.", "natai:angryExplaining"], ["natai", "I am still deciding who I became after they left.", "natai:angryExplaining"]],
        bad: [["natai", "Do not make gravity responsible for your boredom.", "natai:grumpy"], ["narrator", "The stone clicks into silence. Natai waits until you feel every click.", "natai:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["natai", "We are turning back. I prefer ending visits before they become reports.", "natai:grumpy"],
        neutral: ["natai", "One final overlook. Then I return you to civilization, such as it is.", "natai"],
        high: ["natai", "One last overlook. Do not make me admit I chose the romantic one.", "natai:blushing"]
      },
      choices: [
        { label: "Thank them for showing you the desert's quiet side.", feelings: { natai: 1 }, tone: "warm" },
        { label: "Promise not to tell anyone they chose the romantic route.", feelings: { natai: 1 }, tone: "flirt" },
        { label: "Say the canyon is mostly just rocks.", feelings: { natai: -4 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Thank them for not giving up on the visit.", feelings: { natai: 1 }, tone: "warm", reaction: [["natai", "Do not romanticize endurance. But... noted.", "natai"], ["narrator", "They look at the canyon instead of you, which from Natai feels almost merciful.", "natai"]] },
          { label: "Ask why they make affection feel like a final exam.", feelings: { natai: -3 }, tone: "bad", reaction: [["natai", "Affection is not on the syllabus.", "natai:grumpy"], ["narrator", "The overlook suddenly has plenty of room and none of it feels close.", "natai:grumpy"]] },
          { label: "Suggest they would be happier if they relaxed.", feelings: { natai: -4 }, tone: "bad", reaction: [["natai", "I would be happier if people stopped mistaking control for damage.", "natai:grumpy"], ["narrator", "For once, the anger is not cold. It is worse.", "natai:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["natai", "Good. The loud side gets enough attention.", "natai"], ["narrator", "They walk you back slowly, as if you have earned one unhurried thing.", "natai"]],
        flirt: [["natai", "Wise. I know where all the difficult switchbacks are.", "natai:blushing"], ["narrator", "Their shoulder almost brushes yours, then doesn't. Even restraint feels deliberate.", "natai:blushing"], ["natai", "For what it is worth, I do miss him.", "natai:angryExplaining"], ["natai", "That changes nothing. Feelings are poor administrators.", "natai:angryExplaining"]],
        bad: [["natai", "And people are mostly water. Reduction is a boring hobby.", "natai:grumpy"], ["narrator", "They turn toward the return route with magnificent restraint.", "natai:grumpy"]]
      }
    }
  ]
};

const scenes = {
  intro_bus_ride: {
    label: "On the Road",
    background: () => ({ location: "black", time: "daytime" }),
    ambient: "bus",
    lines: [
      ["player", "The bus is dark enough that the window mostly gives me my own face back."],
      ["player", "Beyond the glass, the road keeps unspooling under the tires."],
      ["player", "Fence posts flick past."],
      ["player", "Pines smear into shadow."],
      ["player", "One mailbox leans like it survived years of neighborhood gossip."],
      ["player", "Two weeks ago, I was editing a sunrise video at three in the morning."],
      ["player", "I was also arguing online about whether a cliff looked better vertical or horizontal."],
      ["player", "Then one post went viral for all the wrong reasons."],
      ["player", "One careless shortcut did it."],
      ["player", "So did one bad apology and a comment section that turned into a brush fire."],
      ["player", "That is when Jack called."],
      ["player", "My Jack, technically."],
      ["player", "Old friend. Olympic route lead. Human campfire with biceps."],
      ["player", "He once asked whether email needed stamps."],
      ["player", "He said the retreat had one open spot."],
      ["player", "He said I needed somewhere kinder than the internet to learn from the mistake."],
      ["player", "He said he would be there if I wanted one familiar face."],
      ["player", "He never said he missed me."],
      ["player", "Jack is kind enough to carry three coolers at once."],
      ["player", "He is also bad enough at subtext to trip over a feeling in broad daylight."],
      ["player", "So now I am on a bus to Viral Vista Lodge."],
      ["player", "Five route leads are going to teach me how to see a place without using it as a backdrop."],
      ["player", "A creator retreat."],
      ["player", "A second chance."],
      ["player", "A very scenic consequence."],
      ["player", "And Jack is waiting somewhere ahead."],
      ["player", "That is somehow the comforting part and the terrifying part."]
    ],
    next: "intro_bus_arrival"
  },
  intro_bus_arrival: {
    label: "Arrival",
    background: () => ({ location: "black", time: "daytime" }),
    ambient: "bus",
    lines: [
      ["narrator", "The engine dips lower. Gravel crunches under the tires as the bus slows.", null, { audio: "busApproachStop" }],
      ["narrator", "For a moment, everything is brakes, gravel, and the low idle of the engine.", null, { audio: "busIdle" }],
      ["player", "It seems we've arrived."],
      ["narrator", "The bus door folds open. You step down into cool mountain air."],
      ["narrator", "Behind you, the engine rises again.", null, { audio: "busDeparture" }],
      ["narrator", "The bus pulls away."],
      ["narrator", "By the time it fades down the road, the quiet has room to move back in."],
      ["player", "No easy ride back now. Maybe that is the point."],
      ["player", "Okay, Jack. Please let this be one of your good ideas. Statistically, you are due."]
    ],
    next: "intro_checkin_arrival"
  },
  intro_checkin_arrival: {
    label: "Check-In",
    background: () => ({ location: "checkIn", time: "daytime" }),
    suppressSceneSfx: true,
    lines: [
      ["narrator", "Daylight spills across the outdoor check-in desk."],
      ["narrator", "Pine shadows stretch over fresh coffee and a kiosk humming with suspicious confidence."],
      ["player", "Hello? Retreat person? Person who knows where retreat people go?"],
      ["narrator", "No one answers."],
      ["narrator", "The lodge beyond the trees looks awake."],
      ["narrator", "The check-in desk has been left to fend for itself."],
      ["player", "Cool. Love a welcome experience with abandonment as a design principle."],
      ["narrator", "A neat card waits beside a stack of blank badges."],
      ["narrator", "Please fill out your name badge before proceeding to the lodge lobby."],
      ["player", "A badge. Right."],
      ["player", "If I am going to be emotionally reforested, I should probably label myself first."]
    ],
    nextAction: showNameEntry
  },
  intro_natai_checkin: {
    label: "Check-In",
    background: () => ({ location: "checkIn", time: "daytime" }),
    character: "natai",
    lines: [
      ["narrator", "The badge printer spits out your name with a tiny mechanical cough."],
      ["narrator", "Before you can pin it on straight, someone steps from the shade by the route map.", "natai:grumpy"],
      ["narrator", "Their arms are folded, and their expression is disappointed in several things.", "natai:grumpy"],
      ["natai", "{playerName}. That is either your name or the kiosk has started inventing evidence.", "natai:grumpy"],
      ["natai", "Neither option comforts me.", "natai:grumpy"],
      ["player", "Nice to meet you too. I usually wait three sentences before accusing supplies of crimes.", "natai:grumpy"],
      ["natai", "That was not an accusation. That was pattern recognition.", "natai:grumpy"],
      ["player", "Ah. A data-driven grudge. Very professional.", "natai:grumpy"],
      ["natai", "Hah.", "natai:laughing"],
      ["narrator", "It escapes them before they can stop it: one short laugh, sharp and unwillingly real.", "natai:laughing"],
      ["natai", "No. Do not look pleased. I am not encouraging this.", "natai:grumpy"],
      ["player", "Too late. I have been encouraged at a dangerously low threshold.", "natai:grumpy"],
      ["natai", "Natai. Zion route lead.", "natai:grumpy"],
      ["natai", "Sandstone, permits, heat, flash floods, and no faith in charm as survival gear.", "natai:grumpy"],
      ["player", "Noted. Charm filed under non-essential survival gear.", "natai"],
      ["natai", "File it under litter if it gets in the way.", "natai:grumpy"],
      ["narrator", "They square one corner of the route map by half an inch.", "natai:grumpy"],
      ["narrator", "Then they glare at the kiosk and head toward the canyon trail.", "natai:grumpy"]
    ],
    next: "intro_after_natai_checkin"
  },
  intro_after_natai_checkin: {
    label: "Check-In",
    background: () => ({ location: "checkIn", time: "daytime" }),
    lines: [
      ["player", "That was weird."],
      ["player", "Informative. Hostile. Weird."],
      ["player", "Jack once said Natai was friendly like a locked shed with snacks inside."],
      ["player", "I thought that was Jack being Jack."],
      ["player", "Apparently not. Field note confirmed."],
      ["player", "I should head to the lodge lobby before the badge printer reports me for loitering."]
    ],
    next: "intro_lodge_walk"
  },
  intro_lodge_walk: {
    label: "The Path",
    background: () => ({ location: "black", time: "daytime" }),
    lines: [
      ["narrator", "The path from check-in slips under the trees and keeps going longer than you expect.", null, walkingAmbient()],
      ["narrator", "Gravel gives way to packed earth."],
      ["narrator", "Then it becomes wide stone steps softened by moss."],
      ["player", "For a place built around first impressions, this retreat is making me earn the front door."],
      ["narrator", "At last the trees open around a broad timber lodge."],
      ["narrator", "Cedar siding. Deep porch. Tall windows glowing behind green trim."],
      ["narrator", "A stone chimney climbs one side, and you can already smell the fireplace."],
      ["player", "Okay. That looks like the kind of building where someone either hands you cocoa or a quest."],
      ["player", "Jack would absolutely try to do both."],
      ["player", "He would also spill the cocoa while explaining the quest."],
      ["narrator", "You look around for a welcome committee."],
      ["narrator", "The porch is empty."],
      ["narrator", "The rocking chairs are still."],
      ["narrator", "Even the hanging ferns seem sworn to secrecy."],
      ["player", "Right. Cool. More mysterious hospitality."],
      ["narrator", "You climb the porch steps and pull the heavy brass door.", null, { audio: "door" }]
    ],
    next: "intro_lodge_lobby"
  },
  intro_lodge_lobby: {
    label: "Lodge Lobby",
    background: () => ({ location: "lodge", time: "daytime" }),
    character: "jack",
    lines: [
      ["narrator", "Inside the lodge lobby, cedar beams glow over a stone fireplace and a wall of route pins."],
      ["narrator", "The place feels like summer camp with better lighting."],
      ["narrator", "It also has one unresolved friendship near the check-in table."],
      ["narrator", "Jack looks up from a welcome packet.", "jack"],
      ["narrator", "Red flannel, broad shoulders, same impossible sincerity.", "jack"],
      ["jack", "{playerName}. Hey. You made it.", "jack:blushing"],
      ["jack", "I mean, obviously. You are standing there.", "jack:blushing"],
      ["jack", "Unless I am hallucinating, which would be rude of my brain.", "jack:blushing"],
      ["player", "Still you, then.", "jack"],
      ["jack", "Still me. Bigger beard. Same amount of map confidence.", "jack:laughing"],
      ["jack", "Caleb says my instincts are less reliable than an unsourced geyser prediction.", "jack:laughing"],
      ["jack", "I still do not know what that means, but he looked proud.", "jack:laughing"],
      ["narrator", "He pulls you into a hug before either of you can overthink it.", "jack"],
      ["narrator", "Jack hugs like shelter: warm, solid, and oblivious to subtlety.", "jack"],
      ["player", "Thanks for inviting me. I was not sure I deserved a soft landing.", "jack"],
      ["jack", "Everybody deserves somewhere to do better.", "jack:blushing"],
      ["jack", "Also I missed you.", "jack:blushing"],
      ["jack", "That is not professional retreat language, but it is true.", "jack:blushing"],
      ["player", "Before I cry in the lobby, is Natai always like that?", "jack"],
      ["jack", "Like a storm cloud learned policy enforcement? Yeah.", "jack:laughing"],
      ["jack", "Natai's heart is in the right place.", "jack:laughing"],
      ["jack", "They just keep it behind three locked gates and a permit form.", "jack:laughing"],
      ["jack", "Probably laminated.", "jack:laughing"],
      ["player", "They laughed at one joke and then looked furious about the paperwork of enjoying it.", "jack"],
      ["jack", "That means it went well. Natai laughing is like seeing a comet with cheekbones.", "jack:laughing"],
      ["player", "Comforting. I think.", "jack"],
      ["jack", "You'll get used to them.", "jack"],
      ["jack", "Or you will develop better posture from bracing yourself.", "jack"],
      ["jack", "Either way, growth.", "jack"],
      ["jack", "I learned that word in a staff meeting, and I am using it responsibly.", "jack"],
      ["player", "I thought there would be a check-in packet.", "jack"],
      ["jack", "There is.", "jack:laughing"],
      ["jack", "It says welcome, hydrate, do not wander off trail, and take signs personally.", "jack:laughing"],
      ["jack", "Signs are boundaries with tiny hats.", "jack:laughing"],
      ["player", "Signs do not have hats.", "jack"],
      ["jack", "Some of them do in spirit. Which brings us to your first important choice of the retreat.", "jack"]
    ],
    choices: [
      { label: "Tell him no means no, even from a trail sign in an invisible hat.", next: "intro_lodge_jack_two", feelings: { jack: 2 }, reaction: [["jack", "That is the kind of sentence that makes my whole chest do a high five.", "jack:laughing"], ["narrator", "He taps your packet against his palm, smiling with years of affection and no poker face.", "jack:laughing"]] },
      { label: "Say rules are flexible if the shot is good enough.", next: "intro_lodge_jack_two", feelings: { jack: -2 }, reaction: [["jack", "No shot is worth a rescue team cursing your name. I like your name off incident reports.", "jack:grumpy"], ["narrator", "The warmth in his face stays, but worry steps in front of it.", "jack:grumpy"]] }
    ]
  },
  intro_lodge_jack_two: {
    label: "Lodge Lobby",
    background: () => ({ location: "lodge", time: "daytime" }),
    lines: [
      ["narrator", "Jack walks you past the lobby map, where pins mark parks that should not fit one afternoon.", "jack"],
      ["jack", "Each route lead gets protective of their place.", "jack"],
      ["jack", "It is an occupational hazard of loving something people keep trying to simplify.", "jack"],
      ["jack", "I practiced that sentence three times and only said occupational wrong twice.", "jack"],
      ["player", "And you? Protective or hazard?", "jack"],
      ["jack", "Both, on a good day. Also strong enough to move the snack crates, which is why they keep me.", "jack:laughing"],
      ["player", "They keep you because you are kind.", "jack"],
      ["jack", "That too. I forget that one because it is not a muscle group.", "jack:blushing"]
    ],
    choices: [
      { label: "Ask what Olympic means to him after all these years.", next: "intro_lodge_jack_three", feelings: { jack: 2 }, reaction: [["jack", "Rain, mostly. Then trees old enough to humble your problems. And the place I saved for you.", "jack"], ["narrator", "He says it like a joke, but devotion sits under the forecast and your name.", "jack:blushing"]] },
      { label: "Joke that visitors keep parks relevant.", next: "intro_lodge_jack_three", feelings: { jack: -2 }, reaction: [["jack", "Parks mattered before cameras did. Sorry. My brain borrowed Caleb's debate cardigan.", "jack:grumpy"], ["narrator", "He looks apologetic immediately, but the correction still lands.", "jack:grumpy"]] }
    ]
  },
  intro_lodge_jack_three: {
    label: "Lodge Lobby",
    background: () => ({ location: "lodge", time: "daytime" }),
    lines: [
      ["narrator", "The lobby settles around you." , "jack"],
      ["narrator", "Low fire. Old beams. Route cards fanned across the desk like invitations with consequences.", "jack"],
      ["jack", "Before I hand you to the kiosk, what are you actually hoping to get from this retreat?", "jack"],
      ["player", "Besides surviving the welcome packet and your sign theology?", "jack"],
      ["jack", "Ambitious. I like it.", "jack:laughing"],
      ["jack", "I also like you.", "jack:laughing"],
      ["jack", "As a person. Historically. Currently.", "jack:laughing"],
      ["jack", "Wow. This sentence has too many branches.", "jack:laughing"]
    ],
    choices: [
      { label: "Say you want to learn how to make people care without flattening the place.", next: "intro_lodge_jack_wrap", feelings: { jack: 2 }, reaction: [["jack", "That is... yeah. That is you when you let yourself be brave instead of loud.", "jack:blushing"], ["narrator", "He looks at you like he knows the old you and is already rooting for the next one.", "jack:blushing"]] },
      { label: "Say you mostly want better numbers and better views.", next: "intro_lodge_jack_wrap", feelings: { jack: -2 }, reaction: [["jack", "I hope the views work on you before the numbers do. Kindly. It sounded better in my head.", "jack:grumpy"], ["narrator", "He gathers the route cards carefully, trying not to look as worried as he is.", "jack:grumpy"]] }
    ]
  },
  intro_lodge_jack_wrap: {
    label: "Lodge Lobby",
    background: () => ({ location: "lodge", time: "daytime" }),
    lines: [
      ["narrator", "Jack slides a route card into your welcome packet, then nods toward the lobby doors.", "jack"],
      ["jack", "Come on. The real check-in desk is outside, and the kiosk gets theatrical if I neglect it.", "jack"],
      ["player", "That sounds like a joke I am going to understand too late.", "jack"],
      ["jack", "Almost definitely. I only understand it halfway and I work here.", "jack:laughing"]
    ],
    next: "intro_jack_checkin"
  },
  intro_jack_checkin: {
    label: "Check-In",
    background: () => ({ location: "checkIn", time: "daytime" }),
    character: "jack",
    lines: [
      ["narrator", "Outside again, the check-in kiosk waits under the trees, cheerful and immune to geography."],
      ["narrator", "Jack taps the route map with the corner of his clipboard.", "jack"],
      ["jack", "This desk is the center point between all the park routes.", "jack"],
      ["jack", "You come here, pick a direction, and the kiosk handles the rest.", "jack"],
      ["jack", "It also bends space and time so you can jump between parks almost instantly.", "jack:laughing"],
      ["jack", "I asked how. They gave me a binder. I chose peace.", "jack:laughing"],
      ["player", "Wait, what?", "jack"],
      ["jack", "Anyway. Caleb is waiting at Yellowstone.", "jack"],
      ["jack", "Boardwalk rules, geothermal hazards, very handsome encyclopedia energy.", "jack"],
      ["jack", "Ask him one question and he glows like a ranger station with Wi-Fi.", "jack"],
      ["player", "We are just moving on from the space-time thing?", "jack"],
      ["jack", "Already did. One foot in front of the other. That is how I survive both hiking and concepts.", "jack:laughing"]
    ],
    choices: [
      { label: "Tell Jack you respect a man who knows his limits.", next: "intro_yellowstone_caleb", feelings: { jack: 2 }, reaction: [["jack", "Thank you. My limits are clearly labeled and sometimes decorated with caution tape.", "jack:laughing"], ["narrator", "He looks extremely pleased to be appreciated for explaining nothing.", "jack:laughing"]] },
      { label: "Demand a full scientific explanation right now.", next: "intro_yellowstone_caleb", feelings: { jack: -2 }, reaction: [["jack", "I would love to, but then the kiosk gets smug and I have to respect enemies I understand.", "jack"], ["narrator", "He turns the route card over before you can object, committing fully to cheerful evasion.", "jack"]] }
    ]
  },
  intro_yellowstone_caleb: {
    label: "Yellowstone",
    background: () => ({ location: "yellowstone", time: "daytime" }),
    lines: [
      ["narrator", "Yellowstone opens in steam, boardwalk rails, and blue pools too pretty for foolishness."],
      ["player", "The air smells like minerals, heat, and a warning label someone made scenic."],
      ["narrator", "A ranger turns at the rail, one hand on a safety sign and one on a tabbed notebook.", "caleb"],
      ["caleb", "Welcome to the boardwalk.", "caleb"],
      ["caleb", "The crust here can be thin, hot, and deeply unimpressed by human confidence.", "caleb"],
      ["caleb", "Also, hydrothermal areas are Yellowstone's dramatic circulatory system.", "caleb"],
      ["player", "That was two warnings and a metaphor before hello.", "caleb"],
      ["caleb", "Hello. Sorry. I start in the middle when I am excited.", "caleb:blushing"],
      ["caleb", "Jack asked me to be nice to you.", "caleb"],
      ["caleb", "He said, 'Be normal nice, not Yellowstone TED Talk nice.'", "caleb"],
      ["caleb", "I chose to hear that as a challenge.", "caleb"],
      ["player", "That sounds painfully Jack and dangerously you.", "caleb"]
    ],
    choices: [
      { label: "Promise Caleb both feet are staying on the boardwalk and ask for a fact.", next: "intro_yellowstone_caleb_two", feelings: { caleb: 2 }, reaction: [["caleb", "Good. Yellowstone has more geysers than anywhere else. I liked that question.", "caleb:laughing"], ["narrator", "His smile is quick, bright, and almost immediately embarrassed by itself.", "caleb:laughing"]] },
      { label: "Joke that you came for views, not a science lecture.", next: "intro_yellowstone_caleb_two", feelings: { caleb: -2 }, reaction: [["caleb", "Then I will make the lecture scenic and tragically concise.", "caleb:grumpy"], ["narrator", "The look he gives you could laminate a safety poster and annotate it in the margins.", "caleb:grumpy"]] }
    ]
  },
  intro_yellowstone_caleb_two: {
    label: "Yellowstone",
    background: () => ({ location: "yellowstone", time: "daytime" }),
    lines: [
      ["narrator", "Caleb leads you a few careful steps down the boardwalk.", "caleb"],
      ["narrator", "Steam curls over the rail and vanishes into the sun.", "caleb"],
      ["caleb", "People think Yellowstone is trying to impress them.", "caleb"],
      ["caleb", "It is not.", "caleb"],
      ["caleb", "It is busy being itself.", "caleb"],
      ["caleb", "That includes sitting on a huge active volcanic system like that is a normal trait.", "caleb"],
      ["player", "You admire it for being dramatic and well-documented.", "caleb"]
    ],
    choices: [
      { label: "Ask what first made him love the park.", next: "intro_yellowstone_caleb_three", feelings: { caleb: 2 }, reaction: [["caleb", "A geyser erupted when I was twelve. It terrified me. I went home and memorized the map.", "caleb:blushing"], ["narrator", "He looks embarrassed by how honest that was, which makes it worse in the best way.", "caleb:blushing"]] },
      { label: "Ask whether he has always been this nerdy about Yellowstone.", next: "intro_yellowstone_caleb_three", feelings: { caleb: 2 }, reaction: [["caleb", "No. As a child I was worse. I made my family track Old Faithful at dinner. In Ohio.", "caleb:laughing"], ["narrator", "He laughs like he has decided to find himself endearing and is mildly shocked you agree.", "caleb:laughing"]] },
      { label: "Ask whether every rule really matters.", next: "intro_yellowstone_caleb_three", feelings: { caleb: -2 }, reaction: [["caleb", "Here? Yes. Also I can provide a short appendix called People Who Learned This Incorrectly.", "caleb:grumpy"], ["narrator", "The answer is short enough to leave steam hissing after it. The appendix is implied.", "caleb:grumpy"]] }
    ]
  },
  intro_yellowstone_caleb_three: {
    label: "Yellowstone",
    background: () => ({ location: "yellowstone", time: "daytime" }),
    lines: [
      ["narrator", "The boardwalk opens to one last pool, blue at the center and ringed with impossible color.", "caleb"],
      ["caleb", "This is usually where people stop talking.", "caleb"],
      ["caleb", "I support quiet.", "caleb"],
      ["caleb", "But I need you to know the blue comes from depth and clarity, not a drama department.", "caleb"],
      ["player", "You are physically incapable of leaving wonder unexplained.", "caleb"]
    ],
    choices: [
      { label: "Tell him the explanation makes the wonder better.", next: "intro_yellowstone_wrap", feelings: { caleb: 2 }, reaction: [["caleb", "That is a very unfair thing to say to a man trying to remain professionally composed.", "caleb:blushing"], ["narrator", "He says it softly, like you just found the main trail into him.", "caleb:blushing"]] },
      { label: "Ask him to stand quietly with you anyway.", next: "intro_yellowstone_wrap", feelings: { caleb: 1 }, reaction: [["caleb", "I can do quiet. I may think loudly, but I can do quiet.", "caleb"], ["narrator", "For a few breaths, he lets the pool be itself beside you, and it feels like trust.", "caleb:blushing"]] },
      { label: "Admit you still want one closer picture.", next: "intro_yellowstone_wrap", feelings: { caleb: -2 }, reaction: [["caleb", "Then I am walking you back before wanting becomes doing.", "caleb:grumpy"], ["narrator", "He is not cruel about it. Somehow that makes disappointing him worse.", "caleb:grumpy"]] }
    ]
  },
  intro_yellowstone_wrap: {
    label: "Yellowstone",
    background: () => ({ location: "yellowstone", time: "daytime" }),
    lines: [
      ["narrator", "Caleb checks the route card and tucks his notebook under one arm.", "caleb"],
      ["narrator", "He is trying very hard to look casual about the tabs.", "caleb"],
      ["caleb", "That is your Yellowstone introduction.", "caleb"],
      ["caleb", "Short enough to keep you safe.", "caleb"],
      ["caleb", "Long enough that you remember microbes, the caldera, and one emotional geyser.", "caleb"],
      ["player", "I will. The facts had excellent cheekbones.", "caleb"],
      ["narrator", "He laughs despite himself, and the sound follows you back through the steam."]
    ],
    next: "intro_to_sunset_return"
  },
  intro_to_sunset_return: {
    label: "On The Route",
    background: () => ({ location: "black", time: "sunset" }),
    onEnter: () => { state.timeOfDay = "sunset"; },
    lines: [
      ["narrator", "The route folds around you, all steam and sun-glare dissolving into a blink of shadow."],
      ["player", "When the world steadies again, the day has tilted toward evening."]
    ],
    next: "intro_return_sunset_one"
  },
  intro_return_sunset_one: {
    label: "Check-In",
    background: () => ({ location: "checkIn", time: "sunset" }),
    lines: [
      ["narrator", "When the kiosk returns you to check-in, sunset has painted the roofline apricot and rose."],
      ["player", "Okay. That is ridiculously pretty."],
      ["player", "It is also getting late, which feels like the universe tapping its watch."],
      ["player", "Move quickly. Admire efficiently."]
    ],
    next: "intro_yosemite_sierra"
  },
  intro_yosemite_sierra: {
    label: "Yosemite",
    background: () => ({ location: "yosemite", time: "sunset" }),
    lines: [
      ["narrator", "Yosemite greets you with waterfall mist, huge granite walls, and sunset with no subtlety."],
      ["player", "The whole valley looks like it knows it is the main character."],
      ["narrator", "A woman jogs down from the overlook as if gravity signed a waiver for her.", "sierra"],
      ["narrator", "Then she slows with a grin that feels personally illegal.", "sierra"],
      ["sierra", "You made it. Good.", "sierra:sly"],
      ["sierra", "The cliff was starting to think you were intimidated.", "sierra:sly"],
      ["sierra", "I told it to wait until you saw me.", "sierra:sly"],
      ["player", "I am intimidated. I am just being stylish about it.", "sierra:laughing"],
      ["sierra", "Excellent. Brave enough to admit it, stylish enough to survive it. Keep up, pretty thing.", "sierra:sly"],
      ["sierra", "Also, Jack told me not to let you undersell yourself.", "sierra:sly"],
      ["sierra", "He said it with his whole face.", "sierra:sly"],
      ["sierra", "That is how Jack says everything. Cute, but exhausting.", "sierra:sly"],
      ["player", "He has never owned a subtle expression in his life.", "sierra:laughing"]
    ],
    choices: [
      { label: "Match Sierra's pace and compliment the view without overselling it.", next: "intro_yosemite_sierra_two", feelings: { sierra: 2 }, reaction: [["sierra", "Look at you, having a genuine experience.", "sierra"], ["sierra", "Dangerous. Attractive. Try not to make me proud this early.", "sierra:sly"], ["narrator", "She grins and lets the trail open toward the waterfall.", "sierra"]] },
      { label: "Tell Sierra the view has competition.", next: "intro_yosemite_sierra_two", feelings: { sierra: 2 }, reaction: [["sierra", "Oh.", "sierra:blushing"], ["sierra", "Finally, someone respecting Yosemite by bringing ambition.", "sierra:sly"], ["narrator", "She points up the trail, but her smile stays on you another second.", "sierra:blushing"]] },
      { label: "Try to turn the waterfall into content immediately.", next: "intro_yosemite_sierra_two", feelings: { sierra: -2 }, reaction: [["sierra", "The waterfall is not your unpaid intern.", "sierra:grumpy"], ["sierra", "Neither am I, sweetheart, even when I am clearly the best thing in frame.", "sierra:sly"], ["player", "That is... fair.", "sierra:grumpy"]] }
    ]
  },
  intro_yosemite_sierra_two: {
    label: "Yosemite",
    background: () => ({ location: "yosemite", time: "sunset" }),
    lines: [
      ["narrator", "Sierra leads you toward a small overlook.", "sierra"],
      ["narrator", "Waterfall mist turns gold at the edges.", "sierra"],
      ["narrator", "She checks over her shoulder like she knows exactly what that does to you.", "sierra"],
      ["sierra", "Most people aim at the biggest thing in front of them.", "sierra:sly"],
      ["sierra", "Yosemite rewards peripheral vision.", "sierra:sly"],
      ["sierra", "I reward eye contact.", "sierra:sly"],
      ["player", "That sounds suspiciously like life advice.", "sierra:laughing"]
    ],
    choices: [
      { label: "Ask what most people miss here.", next: "intro_yosemite_sierra_three", feelings: { sierra: 2 }, reaction: [["sierra", "The sound before the view. The water announces itself, and everyone still waits for proof.", "sierra"], ["sierra", "Same mistake people make with chemistry. Same mistake they make with people who joke fast.", "sierra:blushing"], ["narrator", "She says it lightly, but the answer has roots and a wink at the end.", "sierra"]] },
      { label: "Tell her she notices things like someone in love with the place.", next: "intro_yosemite_sierra_three", feelings: { sierra: 1 }, reaction: [["sierra", "Obviously. Have you seen it?", "sierra:laughing"], ["sierra", "I am loyal to beauty. Present company included, if you keep behaving.", "sierra:sly"], ["narrator", "She laughs, but a blush catches at the edge of it before she can hide it.", "sierra:blushing"]] },
      { label: "Tell her eye contact sounds like a dangerous reward.", next: "intro_yosemite_sierra_three", feelings: { sierra: 2 }, reaction: [["sierra", "Mm.", "sierra:blushing"], ["sierra", "It is. Yosemite has cliffs; I have follow-through.", "sierra:sly"], ["narrator", "She says it without missing a step, devastatingly casual.", "sierra"]] },
      { label: "Say the biggest thing is usually the best shot.", next: "intro_yosemite_sierra_three", feelings: { sierra: -2 }, reaction: [["sierra", "That is how people come home with twelve identical photos and no memory.", "sierra:grumpy"], ["sierra", "Tragic, especially when I am standing right here making your day more interesting.", "sierra:sly"], ["player", "Point taken.", "sierra:grumpy"]] }
    ]
  },
  intro_yosemite_sierra_three: {
    label: "Yosemite",
    background: () => ({ location: "yosemite", time: "sunset" }),
    lines: [
      ["narrator", "The trail steepens for one last push.", "sierra"],
      ["narrator", "Sierra stops at the top and waits.", "sierra"],
      ["narrator", "She pretends not to check whether you are winded or flustered.", "sierra"],
      ["sierra", "Final test.", "sierra:sly"],
      ["sierra", "What do you do when a place is bigger than your words?", "sierra:sly"],
      ["sierra", "Careful. I am grading the answer and the delivery.", "sierra:sly"],
      ["player", "That feels like a trap with excellent scenery.", "sierra:laughing"]
    ],
    choices: [
      { label: "Admit you shut up and let it be bigger.", next: "intro_yosemite_wrap", feelings: { sierra: 2 }, reaction: [["sierra", "Good. There may be hope for you yet.", "sierra:blushing"], ["sierra", "Unfortunately for my composure, hope looks good on you.", "sierra:sly"], ["narrator", "She looks at the granite instead of you, but her smile gives her away.", "sierra:blushing"]] },
      { label: "Say you would describe Sierra first and fail just as badly.", next: "intro_yosemite_wrap", feelings: { sierra: 2 }, reaction: [["sierra", "Ridiculous answer.", "sierra:blushing"], ["sierra", "Ten out of ten. Yosemite and I accept your surrender.", "sierra:sly"], ["narrator", "She laughs, and the sunset seems to take credit.", "sierra:laughing"]] },
      { label: "Say you make the caption work anyway.", next: "intro_yosemite_wrap", feelings: { sierra: -2 }, reaction: [["sierra", "The cliff is disappointed, and so am I.", "sierra:grumpy"], ["sierra", "I am hotter when disappointed, but that does not make you correct.", "sierra:sly"], ["narrator", "She says it like a joke, but only half of it is joking.", "sierra:grumpy"]] }
    ]
  },
  intro_yosemite_wrap: {
    label: "Yosemite",
    background: () => ({ location: "yosemite", time: "sunset" }),
    lines: [
      ["narrator", "Sierra walks you back as sunset thins along the trail.", "sierra"],
      ["narrator", "Her pace finally eases into something companionable.", "sierra"],
      ["narrator", "It is still very hard to ignore.", "sierra"],
      ["sierra", "That is the Yosemite sampler.", "sierra:sly"],
      ["sierra", "Cliffs, water, humility, and one heroic guide shaping your character.", "sierra:sly"],
      ["player", "And cardio.", "sierra:laughing"],
      ["sierra", "Cardio is how the park knows you meant it. Blushing is how I know you were listening.", "sierra:sly"]
    ],
    next: "intro_return_sunset_two"
  },
  intro_return_sunset_two: {
    label: "Check-In",
    background: () => ({ location: "checkIn", time: "sunset" }),
    lines: [
      ["narrator", "The kiosk brings you back to the check-in desk again."],
      ["narrator", "The last of sunset clings to the sign like it does not want to leave."],
      ["player", "Two parks down. One more before I become a person who says 'big day' and means it."]
    ],
    next: "intro_to_night_return"
  },
  intro_to_night_return: {
    label: "On The Route",
    background: () => ({ location: "black", time: "night" }),
    onEnter: () => { state.timeOfDay = "night"; },
    lines: [
      ["narrator", "The route hums under your feet. Sunset slips out of the world while you are between places."],
      ["player", "By the time the path settles, night has arrived without asking permission."]
    ],
    next: "intro_return_night"
  },
  intro_return_night: {
    label: "Check-In",
    background: () => ({ location: "checkIn", time: "night" }),
    lines: [
      ["narrator", "By the next blink of impossible kiosk travel, night has settled over check-in."],
      ["player", "It is officially late."],
      ["player", "If this kiosk glows any harder, I am charging it rent for living in my nerves."],
      ["player", "Last visit, then sleep. That is a responsible sentence, probably."]
    ],
    next: "intro_zion_natai"
  },
  intro_zion_natai: {
    label: "Red Rock",
    background: () => ({ location: "zion", time: "night" }),
    lines: [
      ["narrator", "The red rock route waits under a sky packed with stars."],
      ["narrator", "Canyon walls rise around you like the dark has architecture."],
      ["player", "The desert is quieter than I expected. Not empty. Just extremely selective."],
      ["narrator", "Someone stands beside the route sign, still as sandstone until they turn their head.", "natai:grumpy"],
      ["natai", "You are late.", "natai:grumpy"],
      ["player", "By... the amount of time it took the kiosk to bend space?", "natai:grumpy"],
      ["natai", "I do not grade excuses on a curve.", "natai:grumpy"],
      ["player", "Is this your welcome speech?", "natai:grumpy"],
      ["natai", "No. That was me deciding whether to have one.", "natai:grumpy"],
      ["natai", "Jack vouched for you.", "natai:grumpy"],
      ["natai", "He called you 'a good person, temporarily on fire.'", "natai:grumpy"],
      ["natai", "I assume he meant metaphorically. Even Jack understands some nouns.", "natai:grumpy"],
      ["player", "Some nouns is generous.", "natai"]
    ],
    choices: [
      { label: "Apologize once, then ask for the route rules.", next: "intro_zion_natai_two", feelings: { natai: 1 }, reaction: [["natai", "Efficient recovery. Do not make me regret acknowledging it.", "natai:grumpy"], ["narrator", "They hand you the route card like trust is a very small, very breakable object.", "natai:grumpy"]] },
      { label: "Ask if they are always this charming with guests.", next: "intro_zion_natai_two", feelings: { natai: -3 }, reaction: [["natai", "No. Sometimes guests earn charming.", "natai:grumpy"], ["narrator", "The canyon holds the silence with impressive commitment.", "natai:grumpy"]] },
      { label: "Joke that permits are just paperwork cosplay.", next: "intro_zion_natai_two", feelings: { natai: -4 }, reaction: [["natai", "Paperwork is what keeps rescue from becoming archaeology.", "natai:grumpy"], ["narrator", "Their voice goes so flat the desert seems to flinch on your behalf.", "natai:grumpy"]] }
    ]
  },
  intro_zion_natai_two: {
    label: "Red Rock",
    background: () => ({ location: "zion", time: "night" }),
    lines: [
      ["narrator", "Natai leads you along a pale trail where the canyon walls keep the day's heat like memory.", "natai"],
      ["natai", "People call deserts empty when they do not know how to read quiet.", "natai:grumpy"],
      ["player", "And you read it fluently?", "natai"]
    ],
    choices: [
      { label: "Ask what the quiet is saying tonight.", next: "intro_zion_natai_three", feelings: { natai: 1 }, reaction: [["natai", "That the air is cooling, the trail is stable, and you are trying harder than expected.", "natai"], ["player", "The desert said all that?", "natai"], ["natai", "I paraphrased. Generously.", "natai"]] },
      { label: "Ask if all this silence is supposed to be impressive.", next: "intro_zion_natai_three", feelings: { natai: -4 }, reaction: [["natai", "No. It is supposed to be left alone by people who need constant applause.", "natai:grumpy"], ["narrator", "The route keeps going. The conversation does not recover quickly.", "natai:grumpy"]] }
    ]
  },
  intro_zion_natai_three: {
    label: "Red Rock",
    background: () => ({ location: "zion", time: "night" }),
    lines: [
      ["narrator", "The route reaches a night-sky overlook.", "natai"],
      ["narrator", "Above the canyon, stars crowd the dark until the silence feels deliberate.", "natai"],
      ["natai", "Last stop.", "natai:grumpy"],
      ["natai", "After this, you go back to the lodge before exhaustion makes you legally poetic.", "natai:grumpy"],
      ["player", "Too late, probably.", "natai"]
    ],
    choices: [
      { label: "Thank them for showing you the desert instead of explaining it.", next: "intro_zion_wrap", feelings: { natai: 1 }, reaction: [["natai", "Good. Explanations are where people start lying to sound complete.", "natai"], ["narrator", "They look up at the stars, and for once their stillness almost lets you stand beside it.", "natai"]] },
      { label: "Say the overlook is pretty, but not worth the attitude.", next: "intro_zion_wrap", feelings: { natai: -4 }, reaction: [["natai", "Then admire it quickly.", "natai:grumpy"], ["narrator", "The stars remain spectacular. Natai gives you none of them.", "natai:grumpy"]] }
    ]
  },
  intro_zion_wrap: {
    label: "Red Rock",
    background: () => ({ location: "zion", time: "night" }),
    lines: [
      ["narrator", "Natai walks you back through the dark with the confidence of someone who knows every stone.", "natai"],
      ["natai", "That is enough canyon for a first night. Any more and you will give boulders motives.", "natai:grumpy"],
      ["player", "This one does look judgmental.", "natai"],
      ["natai", "It is. It also has better timing than most people.", "natai:grumpy"]
    ],
    next: "intro_first_night_lodge"
  },
  intro_first_night_lodge: {
    label: "Lodge Lobby",
    background: () => ({ location: "lodge", time: "night" }),
    character: "jack",
    lines: () => {
      const mood = relationshipState("jack");
      const jackReply = {
        low: [
          ["jack", "You will.", "jack:grumpy"],
          ["jack", "I still want to show you the good moss.", "jack:grumpy"],
          ["jack", "I am just worried at you right now. That is different from mad. I think.", "jack:grumpy"]
        ],
        neutral: [
          ["jack", "You will.", "jack"],
          ["jack", "Olympic is not going anywhere, and neither is the rain.", "jack"],
          ["jack", "I am also not going anywhere, unless I trip over that rug again.", "jack"]
        ],
        high: [
          ["jack", "You will see it later.", "jack:blushing"],
          ["jack", "I have been saving my favorite trail for you for years.", "jack:blushing"],
          ["jack", "That sounds normal until I hear it out loud.", "jack:blushing"]
        ]
      }[mood];
      return [
        ["narrator", "The lodge lobby is quiet when you return."],
        ["narrator", "The fireplace is low, the windows are dark, and the whole building smells like cedar."],
        ["narrator", "Jack is by the fire, stacking route cards into a tidy pile.", "jack"],
        ["narrator", "The pile immediately leans sideways.", "jack"],
        ["narrator", "He frowns at it with heroic commitment.", "jack"],
        ["player", "I am a little sad I did not get to see your park tonight.", "jack"],
        ...jackReply,
        ["player", "I did meet Natai.", "jack"],
        ["jack", "Ah. Zion's most scenic locked gate.", "jack:laughing"],
        ["player", "So it is not just me?", "jack:laughing"],
        ["jack", "Natai thinks warm welcomes are how people get complacent.", "jack"],
        ["jack", "Do not take the first frost personally.", "jack"],
        ["jack", "Do take the route rules personally.", "jack"],
        ["jack", "I am very pro-rule when rules keep you intact.", "jack"],
        ["player", "You sound like you rehearsed that.", "jack"],
        ["jack", "I did. Into a spoon because it looked reflective enough to be eye contact.", "jack:laughing"],
        ["jack", "Go sleep, {playerName}.", "jack"],
        ["jack", "Tomorrow gives you three chances to make something happen.", "jack"],
        ["jack", "Maybe four, if one of them is breakfast.", "jack"],
        ["narrator", "You climb the lodge stairs with park dust on your shoes and bright voices in your head."]
      ];
    },
    next: "sleep_to_day"
  },
  sleep_to_day: {
    label: "Night",
    background: () => ({ location: "black", time: "night" }),
    character: null,
    onEnter: () => { state.day = 2; },
    lines: [
      ["narrator", "Sleep takes you fast."],
      ["narrator", "Somewhere below, the lodge settles. Outside, the impossible kiosk keeps its secrets."]
    ],
    nextAction: startNewDay
  },
  day_wake: {
    label: () => `Day ${state.day}`,
    background: () => ({ location: "lodge", time: "daytime" }),
    onEnter: () => { state.timeOfDay = "daytime"; state.pendingDestination = null; state.pendingEncounter = null; state.pendingFullLoveScene = null; state.visitTime = null; state.visitBeat = 0; state.visitStartMood = null; state.visitLastChoice = null; state.visitLastReaction = null; },
    lines: () => {
      return [
        ["narrator", "Morning fills the lodge lobby with clean light and the low murmur of maps being unfolded."],
        ["player", state.day === 1 ? "A new day. Three chances to make something happen." : `Day ${state.day}. Same impossible kiosk. New chances.`]
      ];
    },
    choices: () => loveInterestChoices("Who do you want to visit first?")
  },
  checkin_hub: {
    label: () => `${TIME_LABELS[state.timeOfDay]} Check-In`,
    background: () => ({ location: "checkIn", time: state.timeOfDay }),
    lines: () => [
      ["narrator", `${TIME_LABELS[state.timeOfDay]} settles over the check-in desk. The kiosk waits with cheerful impossible patience.`],
      ["player", state.timeOfDay === "sunset" ? "One more visit before night, unless I cash out early." : "It is night now. One more visit, or I can call it and sleep."]
    ],
    choices: () => [
      ...loveInterestChoices("Choose another route"),
      { label: "Return to the lodge lobby early.", action: returnToLodgeEarly }
    ]
  },
  dev_skip_to_picker: {
    label: "Skip To",
    background: () => state.choiceReactionBackground || { location: "lodge", time: state.timeOfDay },
    lines: [
      ["narrator", "Choose a setting and time of day. The route marker will drop you into the normal scene flow."]
    ],
    choices: () => buildDevSkipToChoices()
  },
  dev_skip_to_checkin: {
    label: () => `${TIME_LABELS[state.timeOfDay]} Check-In`,
    background: () => ({ location: "checkIn", time: state.timeOfDay }),
    lines: () => [
      ["narrator", `${TIME_LABELS[state.timeOfDay]} settles over the check-in desk. The kiosk waits with cheerful impossible patience.`],
      ["player", state.timeOfDay === "daytime" ? "Okay. Normal check-in desk. Normal route cards. Extremely normal impossible choices." : "One more route, unless I cash out early."]
    ],
    choices: () => [
      ...loveInterestChoices(),
      { label: "Return to the lodge lobby early.", action: returnToLodgeEarly }
    ]
  },
  dev_skip_to_lodge: {
    label: () => `${TIME_LABELS[state.timeOfDay]} Lodge Lobby`,
    background: () => ({ location: "lodge", time: state.timeOfDay }),
    lines: () => [
      ["narrator", `${TIME_LABELS[state.timeOfDay]} fills the lodge lobby. The route cards wait by the desk like they know too much.`],
      ["player", "All right. Where are we going from here?"]
    ],
    choices: () => [
      ...loveInterestChoices(),
      { label: "Go to the check-in desk.", next: "dev_skip_to_checkin" }
    ]
  },
  checkin_travel_event: {
    label: () => state.flags.returningEarly ? `${TIME_LABELS[state.timeOfDay]} Lodge Lobby` : `${TIME_LABELS[state.timeOfDay]} Check-In`,
    background: () => ({ location: state.flags.returningEarly ? "lodge" : "checkIn", time: state.timeOfDay }),
    character: () => state.flags.returningEarly ? null : state.pendingEncounter?.character || null,
    lines: () => buildCheckInEventLines(),
    nextAction: () => {
      if (state.flags.returningEarly) {
        state.flags.returningEarly = false;
        state.pendingEncounter = null;
        renderScene("early_lodge_return");
        return;
      }
      continueToPendingDestination();
    }
  },
  choice_reaction: {
    label: () => state.choiceReactionLabel || "Response",
    background: () => state.choiceReactionBackground || { location: "lodge", time: state.timeOfDay },
    character: () => {
      const lines = state.choiceReactionLines || [];
      const lastLine = lines[lines.length - 1];
      return lastLine && lastLine.length > 2 ? lastLine[2] : null;
    },
    lines: () => state.choiceReactionLines || [["narrator", "The moment settles."]],
    nextAction: () => {
      const next = state.choiceReactionNext;
      state.choiceReactionLines = null;
      state.choiceReactionNext = null;
      state.choiceReactionBackground = null;
      state.choiceReactionLabel = null;
      renderScene(next);
    }
  },
  brothers_reconciliation_start: {
    label: "Check-In",
    background: () => ({ location: "checkIn", time: "daytime" }),
    music: "brothersReconcile",
    character: null,
    lines: () => {
      const first = state.flags.brotherGoodFirst || (state.flags.dakotaFullLoveGood ? "dakota" : "natai");
      const dakotaFirst = first === "dakota";
      return [
        ["narrator", "Morning light settles across the check-in desk as the day-transition card clears."],
        ["player", "Okay. New day. Normal kiosk. Please let normal be available in the drop-down menu."],
        ["narrator", "Two route cards print at once: Sequoia and Zion. The kiosk chirps like it expects applause."],
        ["narrator", "Dakota steps in from the lodge path at the same moment Natai arrives from the canyon route.", "dakota"],
        ["natai", "No.", "natai:grumpy"],
        ["dakota", "Natai.", "dakota:sadExplaining"],
        ["natai", "Do not say my name like you are testing whether it still belongs to me.", "natai:angryExplaining"],
        ["narrator", "Dakota lowers his head. Natai looks ready to split the morning open before showing hurt.", "dakota:sadExplaining"],
        ...(dakotaFirst ? [
          ["dakota", "{playerName} helped me understand that shame was not responsibility. It was just another way to keep running.", "dakota:sadExplaining"],
          ["dakota", "I am done running from you. I am sorry I left you alone with the ashes, with our brother's absence, with all the anger I was too cowardly to face.", "dakota:sadExplaining"],
          ["natai", "I wanted to hate you forever.", "natai:angryExplaining"],
          ["natai", "It was efficient. It gave the grief a job.", "natai:angryExplaining"]
        ] : [
          ["natai", "{playerName} helped me see that anger was not loyalty. It was grief with its fists up.", "natai:angryExplaining"],
          ["natai", "I am still furious you ran. I am tired of acting like fury is the only proof I loved him.", "natai:angryExplaining"],
          ["dakota", "I deserved your anger.", "dakota:sadExplaining"],
          ["natai", "Yes. And I deserved more than being left alone with it.", "natai:angryExplaining"]
        ]),
        ["dakota", "You did.", "dakota:sadExplaining"],
        ["dakota", "I cannot give back what the fire took. I can tell the truth. I can still be your brother.", "dakota:sadExplaining"],
        ["narrator", "Natai's face changes by inches. The anger stays, but love becomes visible behind it.", "natai:angryExplaining"],
        ["natai", "Do not make me regret this by becoming sentimental in public.", "natai:grumpy"],
        ["dakota", "I will be tastefully sentimental.", "dakota:flattered"],
        ["natai", "Impossible standard. Proceed anyway.", "natai:blushing"],
        ["narrator", "Dakota reaches out. Natai stares at his hand like it is both a bridge and an accusation."],
        ["narrator", "Then Natai takes it.", "dakotaNatai"],
        ["narrator", "The handshake is fierce and trembling. Two brothers, years late and somehow still on time.", "dakotaNatai"],
        ["player", "The kiosk prints RECONCILIATION PROCESSED. I hate that office equipment moved me.", "dakotaNatai"],
        ["narrator", "Something opens in the morning. Dakota and Natai are not healed, but they face the same way.", "dakotaNatai"]
      ];
    },
    nextAction: completeBrotherReconciliation
  },
  main_visit_arrival: {
    label: () => `${characters[state.pendingDestination]?.park || "Park"} Visit`,
    background: () => ({ location: characters[state.pendingDestination].location, time: state.visitTime || state.timeOfDay }),
    character: null,
    lines: () => buildArrivalLines(state.pendingDestination, state.visitTime || state.timeOfDay),
    next: "main_visit_prompt"
  },
  main_visit_prompt: {
    label: () => `${characters[state.pendingDestination]?.park || "Park"} Visit`,
    background: () => ({ location: characters[state.pendingDestination].location, time: state.visitTime || state.timeOfDay }),
    character: () => state.pendingDestination,
    lines: () => buildVisitPromptLines(state.pendingDestination),
    choices: () => buildVisitChoices(state.pendingDestination)
  },
  main_visit_reaction: {
    label: () => `${characters[state.pendingDestination]?.park || "Park"} Visit`,
    background: () => ({ location: characters[state.pendingDestination].location, time: state.visitTime || state.timeOfDay }),
    character: () => state.pendingDestination,
    lines: () => buildVisitReactionLines(state.pendingDestination),
    nextAction: advanceVisitBeat
  },
  main_visit_wrapup: {
    label: () => `${characters[state.pendingDestination]?.park || "Park"} Visit`,
    background: () => ({ location: characters[state.pendingDestination].location, time: state.visitTime || state.timeOfDay }),
    character: () => state.pendingDestination,
    lines: () => buildVisitWrapupLines(state.pendingDestination),
    nextAction: completeVisit
  },
  full_love_jack_start: {
    label: "Olympic After Dark",
    background: () => ({ location: "olympic", time: "night" }),
    onEnter: () => { state.visitTime = "night"; state.pendingDestination = "jack"; state.pendingFullLoveScene = "jack"; },
    lines: [
      ["narrator", "Jack's route card warms under your thumb. The kiosk hums, considers normal, and declines."],
      ["narrator", "Olympic opens in night hush: cedar silhouettes, wet ferns, and Jack's cabin past the trail."],
      ["player", "Jack?"],
      ["narrator", "The porch lantern lifts. Jack steps out with his grin arriving before the rest of him.", "jack"],
      ["jack", "{playerName}. Hey. You made it. I had something smooth prepared, then saw you and lost it.", "jack:blushing"],
      ["player", "That is pretty normal for us.", "jack:blushing"],
      ["jack", "Yeah. Good normal, though. The kind where I pretend not to worry while absolutely worrying.", "jack"],
      ["narrator", "He offers the lantern handle. Your fingers brush, and the tiny contact rearranges the night.", "jack:blushing"],
      ["jack", "I thought we could take the short loop. Nothing heroic. Just trees and one sincere sentence.", "jack:blushing"],
      ["narrator", "Lightning cracks across the forest. Every cedar branch turns sharp and silver.", null, { screenFlash: true, audio: "thunderFlash" }],
      ["player", "That was new."],
      ["narrator", "Rain arrives hard enough to sound like applause with an agenda."]
    ],
    next: "full_love_jack_rain"
  },
  full_love_jack_rain: {
    label: "Olympic After Dark",
    background: () => ({ location: "olympic", time: "night" }),
    ambient: "rainForest",
    lines: [
      ["jack", "Oh no. Okay. That is not short-loop rain. That is cabin-now rain.", "jack:grumpy"],
      ["player", "Cabin-now rain sounds official.", "jack:grumpy"],
      ["jack", "Very official. Ranger-adjacent. I found courage, so please take cover in my cabin?", "jack:blushing"],
      ["player", "Lead the way, Jack.", "jack:blushing"],
      ["narrator", "He shields the lantern with one hand and keeps the other near your elbow on the slick porch."]
    ],
    next: "full_love_jack_cabin"
  },
  full_love_jack_cabin: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinNight", time: "night" }),
    music: "jackFullLoveCabin",
    ambient: "rainRoof",
    lines: [
      ["narrator", "Inside, Jack's cabin glows with lantern light and stove warmth. Rain drums on the roof."],
      ["narrator", "Jack shuts the door, then looks apologetic, like the weather is a guest he invited.", "jack:grumpy"],
      ["jack", "I am sorry. This was meant to be romantic, not a weather emergency with feelings.", "jack:grumpy"],
      ["player", "Jack. This is very you.", "jack"],
      ["jack", "That is either reassuring or a full performance review.", "jack:laughing"],
      ["narrator", "He laughs, then softens. Rain fills the pause so neither of you has to run from it.", "jack:blushing"],
      ["jack", "We were friends before this got complicated. Then I started looking at you and going blank.", "jack:blushing"],
      ["jack", "I keep thinking friendship should feel smaller. With you it just grew rooms.", "jack:blushing"],
      ["player", "Rooms?", "jack:blushing"],
      ["jack", "Yeah. Places I want to stay. Places I did not know I was allowed to want.", "jack:blushing"],
      ["narrator", "A wet chill catches up with you. Jack notices like noticing you is muscle memory.", "jack:grumpy"],
      ["jack", "You're cold. Hold on. I have dry blankets, but my clean flannel is warmer than it should be.", "jack:grumpy"],
      ["player", "You do not have to give me your shirt.", "jack:grumpy"],
      ["jack", "I know. That is why I want to.", "jack:blushing"]
    ],
    next: "full_love_jack_shirt"
  },
  full_love_jack_shirt: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinNight", time: "night" }),
    music: "jackFullLoveCabin",
    ambient: "rainRoof",
    lines: [
      ["narrator", "Jack turns just enough to be polite and unbuttons the flannel. He offers it back, blushing.", "jack:offeringShirt"],
      ["jack", "Here. It is dry. It smells like cedar smoke and nerves, but it will keep you warm.", "jack:offeringShirt"],
      ["player", "Jack...", "jack:offeringShirt"],
      ["jack", "I know this is a lot. Changing this feels like stepping off a trail we both memorized.", "jack:offeringShirt"],
      ["jack", "But I do not want to pretend that old trail is all there is. Not with you.", "jack:offeringShirt"],
      ["narrator", "The shirt is warm from him. The rain keeps tapping overhead, patient as a heartbeat.", "jack:offeringShirt"]
    ],
    next: "full_love_jack_prompt"
  },
  full_love_jack_prompt: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinNight", time: "night" }),
    music: "jackFullLoveCabin",
    ambient: "rainRoof",
    lines: [
      ["jack", "If you take it, know what I mean. Not pressure. Just me trying to be brave with you.", "jack:offeringShirt"],
      ["jack", "Is this okay?", "jack:offeringShirt"]
    ],
    choices: [
      {
        label: "Take his shirt and tell him you want the friendship and everything it is becoming.",
        next: "full_love_jack_good",
        unlockCG: "jackFullLoveGood",
        flags: { jackFullLoveGood: true }
      },
      {
        label: "Tell him you love him as your friend, and you want to keep that safe tonight.",
        next: "full_love_jack_bad",
        feelings: { jack: -3 }
      }
    ]
  },
  full_love_jack_good: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinNight", time: "night" }),
    music: "jackFullLoveGood",
    ambient: "rainRoof",
    lines: [
      ["narrator", "You take the flannel. Jack watches like he is trying to remember how breathing works.", "jack:offeringShirt"],
      ["player", "I want this. The friendship, the history, and whatever more becomes.", "jack:offeringShirt"],
      ["jack", "Together is my favorite plan. I did not know plans could have favorites until right now.", "jack:offeringShirt"],
      ["narrator", "You slip into his shirt. It is too big in the sleeves, warm at the collar, and full of him.", "jack:offeringShirt"],
      ["jack", "Oh.", "jack:offeringShirt"],
      ["player", "Good oh?", "jack:offeringShirt"],
      ["jack", "Historically good. Report good, except I would burn that report before Caleb edited it.", "jack:offeringShirt"],
      ["narrator", "He steps closer, careful, giving you every chance to stop him and hoping you will not.", "jack:offeringShirt"],
      ["player", "Jack."],
      ["narrator", "The kiss starts as a question and becomes an answer you both already knew.", "jack:offeringShirt"],
      ["jack", "I have wanted to do that for a very long time.", "jack:offeringShirt"],
      ["player", "How long?", "jack:offeringShirt"],
      ["jack", "Long enough that the honest answer needs its own trail map.", "jack:offeringShirt"],
      ["narrator", "The rest of the night unfolds in rain-soft pieces: stove warmth, laughter, and your name.", "jack:offeringShirt"],
      ["narrator", "There is heat, tenderness, and the relief of wanting someone who wants you back.", "jack:offeringShirt"],
      ["narrator", "The storm never lets up. Jack pulls a blanket over both of you and promises first light.", "jack:offeringShirt"],
      ["jack", "For the record, I am still your friend.", "jack:offeringShirt"],
      ["player", "Good.", "jack:offeringShirt"],
      ["jack", "And also wildly, inconveniently, cabin-roof-rain-level in love with you.", "jack:offeringShirt"],
      ["narrator", "You answer softly. Rain keeps time until words become breathing, then sleep."]
    ],
    nextAction: completeJackFullLoveNight
  },
  full_love_jack_sleep_line_fade: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinNight", time: "night" }),
    music: "jackFullLoveGood",
    ambient: "rainRoof",
    suppressSceneSfx: true,
    lines: [
      ["narrator", "You answer softly. Rain keeps time until words become breathing, then sleep.", null, { dialogueFadeOut: true, fadeOutMusicUntilScene: { sceneId: "full_love_jack_morning_black", fadeOutMs: 2800, resumeFadeMs: 5600 }, autoAdvanceMs: 1250, suppressAdvanceSfx: true }]
    ],
    next: "full_love_jack_morning_black"
  },
  full_love_jack_morning_black: {
    label: "Morning",
    background: () => ({ location: "black", time: "daytime" }),
    silenceMusic: true,
    suppressSceneSfx: true,
    character: null,
    lines: [
      ["narrator", "", null, { dialogueHidden: true, autoAdvanceMs: 2100, suppressAdvanceSfx: true }]
    ],
    next: "full_love_jack_morning_wake"
  },
  full_love_jack_bad: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinNight", time: "night" }),
    music: "jack",
    ambient: "rainRoof",
    lines: [
      ["narrator", "Jack listens all the way through. The shirt stays offered, but his face only grows gentler.", "jack:offeringShirt"],
      ["player", "I love you, Jack. I do. But I think tonight I need that love to stay friendship-shaped.", "jack:offeringShirt"],
      ["jack", "Okay.", "jack:offeringShirt"],
      ["player", "Okay?", "jack:offeringShirt"],
      ["jack", "Yeah. Okay. Thank you for trusting me with the real answer.", "jack:offeringShirt"],
      ["narrator", "Disappointment flickers, but he folds it into kindness instead of making it your job.", "jack:offeringShirt"],
      ["jack", "Friendship-shaped is not a consolation prize. It is us, bad jokes, and trail snacks.", "jack:offeringShirt"],
      ["jack", "Also, I should put this back on before I try maturity and catch a cold.", "jack:laughing"],
      ["narrator", "He pulls the flannel back on, cheeks pink, smile real. The cabin feels familiar again.", "jack"],
      ["jack", "Since the rain trapped us, want to play a mushroom game? Caleb disputes the word game.", "jack:laughing"]
    ],
    next: "full_love_jack_friend_cabin"
  },
  full_love_jack_friend_cabin: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinNight", time: "night" }),
    music: "jack",
    ambient: "rainRoof",
    lines: [
      ["narrator", "You sit at Jack's little table while rain drums overhead and he deals mushroom cards.", "jack"],
      ["player", "This mushroom looks fake.", "jack"],
      ["jack", "That is exactly what the mushroom wants you to think.", "jack:laughing"],
      ["narrator", "The game is ridiculous. Jack is delighted. You lose three rounds to a man who apologizes.", "jack:laughing"],
      ["jack", "For the record, I am really glad you are here.", "jack:blushing"],
      ["player", "Even like this?", "jack:blushing"],
      ["jack", "Especially like this. Safe is not boring with you. Safe is where I get to keep knowing you.", "jack:blushing"],
      ["narrator", "The night relaxes: no hard feelings, just the stove, the rain, and Jack laughing.", "jack:laughing"]
    ],
    next: "full_love_jack_friend_rain_stop"
  },
  full_love_jack_friend_rain_stop: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinNight", time: "night" }),
    music: "jack",
    lines: [
      ["narrator", "Eventually the rain thins from a rush to a patter, then fades into cabin quiet."],
      ["jack", "Hear that? The storm is letting up.", "jack"],
      ["player", "So the mushroom tournament ends in a draw?", "jack"],
      ["jack", "A dignified pause. The mushrooms and I are both very secure about it.", "jack:laughing"],
      ["narrator", "He checks the porch, then returns with your jacket and Jack's practical warmth.", "jack"],
      ["jack", "Path's safe now. I will walk you out to the trail light.", "jack"]
    ],
    next: "full_love_jack_friend_goodbye"
  },
  full_love_jack_friend_goodbye: {
    label: "Olympic After Dark",
    background: () => ({ location: "olympic", time: "night" }),
    lines: [
      ["narrator", "Outside, Olympic shines under the night sky. The cabin glows behind Jack in the trees."],
      ["narrator", "Jack stands by the porch steps, hands in his flannel pockets, smile soft and steady.", "jack"],
      ["jack", "Tonight was still good, right?", "jack"],
      ["player", "Really good.", "jack"],
      ["jack", "Good. I am counting mushroom night as a success. Possibly my finest hosting.", "jack:laughing"],
      ["player", "Thank you for being you about it.", "jack:blushing"],
      ["jack", "Always. I will still be awkward in new ways, but the important parts are steady.", "jack:blushing"],
      ["narrator", "He hugs you before you go. It is warm, familiar, and easy to trust.", "jack"],
      ["jack", "Get back safe, {playerName}. I will see you at the lodge tomorrow.", "jack"],
      ["player", "Goodnight, Jack.", "jack"],
      ["jack", "Goodnight.", "jack:blushing"]
    ],
    nextAction: completeFullLoveScene
  },
  full_love_jack_morning_wake: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinDay", time: "daytime" }),
    silenceMusic: true,
    onEnter: () => { state.timeOfDay = "daytime"; },
    lines: [
      ["narrator", "Morning finds Jack's cabin washed in quiet gray light. Outside, the day takes its time.", null, { dialogueSlowFade: true, startAmbient: "morningBirds" }],
      ["narrator", "Jack is awake beside you, hair impossible, expression impossibly soft.", "jack:blushing"],
      ["jack", "Hi.", "jack:blushing"],
      ["player", "Hi.", "jack:blushing"],
      ["jack", "I was going to make breakfast sound casual, but I am too happy and the eggs would know.", "jack:laughing"],
      ["player", "The eggs are very perceptive.", "jack:laughing"],
      ["jack", "Right? Terrifying breakfast instincts.", "jack:laughing"],
      ["narrator", "He gets up carefully, like one wrong move could wake the part still calling this impossible.", "jack:blushing"],
      ["narrator", "At the stove, Jack makes breakfast with comic seriousness: coffee, toast, and soft eggs.", "jack:laughing"],
      ["jack", "I wanted pancakes, but the pantry contains flour, salt, and one mysterious jar.", "jack:grumpy"],
      ["player", "Eggs are perfect.", "jack:blushing"],
      ["narrator", "You eat while sunlight gathers on the floorboards. Jack keeps brushing your knee by mistake.", "jack:blushing"],
      ["jack", "I promised I would get you back at first light.", "jack:blushing"],
      ["player", "This is technically light.", "jack:blushing"],
      ["jack", "Technically is Caleb's department. Mine is walking you back before the lodge invents forms.", "jack:laughing"],
      ["narrator", "The morning lingers: one more sip, one more look, one more quiet moment of being loved.", "jack:blushing"]
    ],
    next: "full_love_jack_morning_goodbye"
  },
  full_love_jack_morning_goodbye: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinDay", time: "daytime" }),
    ambient: "morningBirds",
    silenceMusic: true,
    lines: [
      ["narrator", "Jack walks you to the cabin door, hand warm at your back like he is guiding treasure.", "jack:blushing"],
      ["jack", "I know I said first light. Apparently I meant first light plus breakfast plus denial.", "jack:blushing"],
      ["player", "That is a very specific wilderness skill gap.", "jack:blushing"],
      ["jack", "I contain multitudes. Most are standing in this doorway hoping you do not leave yet.", "jack:blushing"],
      ["narrator", "Sunlight spills across the porch boards. Jack's fingers catch yours, reluctant and earnest.", "jack:blushing"],
      ["jack", "If I walk you to the lodge, I will look at you like I invented mornings.", "jack:laughing"],
      ["player", "Then say goodbye here.", "jack:blushing"],
      ["narrator", "You catch his flannel and kiss him at the door. He gives up on behaving at once.", "jack:blushing"],
      ["narrator", "When you part, he is pink-cheeked, smiling, and one breeze from forgetting his name.", "jack:blushing"],
      ["jack", "Okay. I can work with that. Not immediately. Immediately I am going to recover heroically.", "jack:laughing"],
      ["player", "Meet me at the lodge when your face remembers how to be normal.", "jack:laughing"],
      ["jack", "Bold of you to assume that has ever happened, but yes. Give me a minute.", "jack:blushing"],
      ["narrator", "You steal one last quick kiss anyway, because he is right there and morning feels generous.", "jack:blushing"]
    ],
    next: "full_love_jack_morning_line_fade"
  },
  full_love_jack_morning_line_fade: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinDay", time: "daytime" }),
    ambient: "morningBirds",
    silenceMusic: true,
    suppressSceneSfx: true,
    lines: [
      ["narrator", "You head down the path alone a minute later, still smiling hard enough to feel it.", null, { dialogueFadeOut: true, autoAdvanceMs: 1150, suppressAdvanceSfx: true }]
    ],
    next: "full_love_jack_walk_fade_to_black"
  },
  full_love_jack_walk_fade_to_black: {
    label: "Trail Back",
    background: () => ({ location: "black", time: "daytime" }),
    ambient: "morningBirds",
    silenceMusic: true,
    suppressSceneSfx: true,
    character: null,
    lines: [
      ["narrator", "", null, { dialogueHidden: true, autoAdvanceMs: 1250, suppressAdvanceSfx: true }]
    ],
    next: "full_love_jack_walk_back"
  },
  full_love_jack_walk_back: {
    label: "Trail Back",
    background: () => ({ location: "black", time: "daytime" }),
    ambient: "morningBirds",
    silenceMusic: true,
    suppressSceneSfx: true,
    character: null,
    lines: [
      ["narrator", "You head back through the clean morning woods alone, mouth still warm from kissing Jack.", null, { dialogueSlowFade: true, startOverlayAmbient: "dryGrassWalk", startOverlayAmbientAfterMs: 1700 }],
      ["player", "Okay. I can absolutely be normal about that for the next five minutes."],
      ["narrator", "The forest smells like wet cedar and coffee. Somewhere behind you, Jack is still smiling.", null, { stopOverlayAmbientOnAdvance: true }],
      ["narrator", "By the time the lodge comes into view, morning has settled in bright and gold-edged."],
      ["narrator", "You take a breath, square your shoulders, and reach for the lodge door."]
    ],
    next: "full_love_jack_door_line_fade"
  },
  full_love_jack_door_line_fade: {
    label: "Lodge Door",
    background: () => ({ location: "black", time: "daytime" }),
    silenceMusic: true,
    suppressSceneSfx: true,
    character: null,
    lines: [
      ["narrator", "You take one last steadying breath, still smiling, and open the lodge door.", null, { dialogueFadeOut: true, autoAdvanceMs: 1150, suppressAdvanceSfx: true }]
    ],
    next: "full_love_jack_open_lodge_door"
  },
  full_love_jack_open_lodge_door: {
    label: "Lodge Door",
    background: () => ({ location: "black", time: "daytime" }),
    silenceMusic: true,
    suppressSceneSfx: true,
    character: null,
    lines: [
      ["narrator", "", null, { dialogueHidden: true, audio: "door", autoAdvanceMs: 850, suppressAdvanceSfx: true }]
    ],
    next: "full_love_jack_lodge_fade_in"
  },
  full_love_jack_lodge_fade_in: {
    label: "Lodge Door",
    background: () => ({ location: "black", time: "daytime" }),
    silenceMusic: true,
    suppressSceneSfx: true,
    character: null,
    lines: [
      ["narrator", "", null, { dialogueHidden: true, autoAdvanceMs: 1900, suppressAdvanceSfx: true }]
    ],
    nextAction: completeJackFullLoveMorning
  },
  full_love_caleb_start: {
    label: "Yellowstone After Dark",
    background: () => ({ location: "yellowstoneMisty", time: "night" }),
    music: "calebFullLoveRomantic",
    onEnter: () => { state.visitTime = "night"; state.pendingDestination = "caleb"; state.pendingFullLoveScene = "caleb"; },
    lines: [
      ["narrator", "Caleb's route card glows under your thumb. The kiosk prints: AFTER DARK. VERY SCIENTIFIC."],
      ["narrator", "Yellowstone opens in blue-black mist. The boardwalk gleams with dew and low steam."],
      ["player", "Caleb?"],
      ["narrator", "A shape moves through the steam. Caleb steps into the light shirtless, soaked, and smiling.", "caleb:fullLoveRomantic"],
      ["player", "What happened to you?"],
      ["caleb", "Short version: geyser. Heroic version: I rescued a ring, saved a pack, and lost to steam.", "caleb:fullLoveRomantic"],
      ["player", "You got hit by a geyser while saving romance jewelry and defeating luggage?"],
      ["caleb", "Recovering romance jewelry. Stabilizing luggage. I need precise verbs. My shirt is gone.", "caleb:fullLoveRomantic"],
      ["player", "I am trying to be sympathetic, but you are wet, shirtless, singed, and beaten by a backpack."],
      ["caleb", "Tiny controlled hair flame. Mostly symbolic.", "caleb:fullLoveRomantic"]
    ],
    next: "full_love_caleb_two"
  },
  full_love_caleb_two: {
    label: "Yellowstone After Dark",
    background: () => ({ location: "yellowstoneMisty", time: "night" }),
    music: "calebFullLoveRomantic",
    lines: [
      ["narrator", "He pats at the little flame in his hair. It refuses to surrender with theatrical dignity."],
      ["caleb", "I should be embarrassed. I planned a clean shirt, a careful walk, and restrained facts.", "caleb:fullLoveRomantic"],
      ["player", "Instead you arrived like Yellowstone wrote a romance novel and forgot workplace safety."],
      ["caleb", "Yellowstone would never forget workplace safety. It would include an appendix.", "caleb:fullLoveRomantic"],
      ["narrator", "You laugh, and Caleb softens. The frantic brilliance eases into something gentler."],
      ["caleb", "I wanted tonight to matter. Not because of the score. Though I noticed the score.", "caleb:fullLoveRomantic"],
      ["caleb", "Because you kept listening. You made room for the facts, and somehow that made room for me.", "caleb:fullLoveRomantic"],
      ["player", "Caleb."],
      ["caleb", "I am damp, singed, and sincere on a boardwalk. Do not say my name unless you mean damage.", "caleb:fullLoveRomantic"],
      ["player", "What if I do?"],
      ["narrator", "Mist curls around his shoulders. His eyes drop to your mouth, then back up."],
      ["caleb", "Then damage me responsibly. Behind the rail. With consent. After one key Yellowstone fact.", "caleb:fullLoveRomantic"]
    ],
    next: "full_love_caleb_prompt"
  },
  full_love_caleb_prompt: {
    label: "Yellowstone After Dark",
    background: () => ({ location: "yellowstoneMisty", time: "night" }),
    music: "calebFullLoveRomantic",
    lines: [
      ["player", "There is a quiz right now."],
      ["caleb", "A small one. Emotionally important. Old Faithful is famous, but what did I tell you?", "caleb:fullLoveRomantic"]
    ],
    choices: [
      {
        label: "Say Yellowstone has more than half of the world's active geysers.",
        next: "full_love_caleb_good",
        unlockCG: "calebFullLoveGood",
        flags: { calebFullLoveGood: true }
      },
      {
        label: "Say Old Faithful is the largest geyser in Yellowstone.",
        next: "full_love_caleb_bad",
        feelings: { caleb: -3 }
      }
    ]
  },
  full_love_caleb_good: {
    label: "Yellowstone After Dark",
    background: () => ({ location: "yellowstoneMisty", time: "night" }),
    music: "calebFullLoveGood",
    lines: [
      ["narrator", "Caleb goes very still. For one suspended second, even the steam seems to behave."],
      ["caleb", "More than half. Yes.", "caleb:fullLoveRomantic"],
      ["player", "Old Faithful is famous, not the biggest. A punctual celebrity, in exact Caleb terms."],
      ["caleb", "You remembered the phrasing.", "caleb:fullLoveRomantic"],
      ["narrator", "His smile opens warm enough to blunt the cold. He steps closer, careful and quietly hopeful."],
      ["player", "I remembered because it was you saying it."],
      ["caleb", "That is unfairly effective.", "caleb:fullLoveRomantic"],
      ["narrator", "He kisses you like wonder learned structure and still became magic. The mist narrows."],
      ["caleb", "For the record, this is not how I expected tonight to go.", "caleb:fullLoveRomantic"],
      ["player", "Too much geyser?"],
      ["caleb", "An irresponsible amount. But the result is... compelling.", "caleb:fullLoveRomantic"],
      ["narrator", "The rest of the night stays private: linked hands, soft jokes, and Caleb making facts sweet."],
      ["player", "You leave Yellowstone with steam in your hair, Caleb's smile in your chest, and soft facts."]
    ],
    nextAction: completeFullLoveScene
  },
  full_love_caleb_bad: {
    label: "Yellowstone After Dark",
    background: () => ({ location: "yellowstoneMisty", time: "night" }),
    music: "calebFullLoveBad",
    lines: [
      ["narrator", "Caleb's face changes so fast it should come with a weather advisory."],
      ["caleb", "Old Faithful is WHAT.", "caleb:fullLoveRage"],
      ["player", "The largest geyser in Yellowstone?"],
      ["caleb", "No. Absolutely not. I am shirtless, damp, vulnerable, and you slander Steamboat now?", "caleb:fullLoveRage"],
      ["player", "I am sorry, did you say slander?"],
      ["caleb", "Steamboat is the tallest active geyser. Old Faithful is only the famous one.", "caleb:fullLoveRage"],
      ["narrator", "The tiny flame in his hair flares like it also has strong feelings about geyser accuracy."],
      ["caleb", "I had a speech. There was hand-holding. Now I must recover as a scientist and a man.", "caleb:fullLoveRage"],
      ["player", "That feels a little dramatic."],
      ["caleb", "Yellowstone is dramatic. I am being locally appropriate.", "caleb:fullLoveRage"],
      ["narrator", "He marches you back to the route marker, furious and wet, still steering you from danger."],
      ["player", "I really thought something steamy was going to happen."],
      ["narrator", "A geyser coughs in the distance."],
      ["player", "Not like that."]
    ],
    nextAction: completeFullLoveScene
  },
  full_love_sierra_start: {
    label: "Yosemite After Dark",
    background: () => ({ location: "yosemite", time: "night" }),
    onEnter: () => { state.visitTime = "night"; state.pendingDestination = "sierra"; state.pendingFullLoveScene = "sierra"; },
    lines: [
      ["narrator", "Sierra's route card warms under your thumb. The kiosk adds: NO CAPTIONS AFTER MIDNIGHT."],
      ["narrator", "Yosemite opens in night-blue granite and falling water. The familiar trail feels hushed now."],
      ["player", "Sierra?"],
      ["narrator", "A flashlight beam lowers. Sierra steps from the dark with windblown hair and a waiting grin.", "sierra:laughing"],
      ["sierra", "You came.", "sierra:blushing"],
      ["player", "Of course I did.", "sierra:blushing"],
      ["narrator", "She looks down for half a breath, too pleased to move right away.", "sierra:blushing"],
      ["sierra", "Good. I was hoping you would say it like that.", "sierra:blushing"],
      ["player", "Like what?", "sierra:blushing"],
      ["sierra", "Like it was easy.", "sierra:blushing"],
      ["narrator", "She turns her flashlight toward a narrow side trail and offers you her hand.", "sierra"],
      ["sierra", "Come on. I want to show you the place I go when Yosemite gets too big to explain.", "sierra"]
    ],
    next: "full_love_sierra_meadow"
  },
  full_love_sierra_meadow: {
    label: "Yosemite Meadow",
    background: () => ({ location: "yosemiteMeadowNight", time: "night" }),
    music: "sierraFullLoveMeadow",
    lines: [
      ["narrator", "The trail opens into a moonlit meadow. Wildflowers silver while the waterfall glows far off."],
      ["player", "Oh."],
      ["player", "This is beautiful."],
      ["narrator", "The meadow makes room around you: grass, stars, cold stone, warm breath, and hush."],
      ["sierra", "I know.", "sierra"],
      ["narrator", "Sierra sits in the grass and tips her face toward the sky.", "sierra:stargazingStep2"],
      ["sierra", "That bright one over the ridge? I used to pretend it watched the trail when I closed alone.", "sierra:stargazingStep2"],
      ["player", "You came here by yourself?", "sierra:stargazingStep2"],
      ["sierra", "Sometimes. It made the walk back feel shorter, knowing this was waiting up here.", "sierra:stargazingStep2"],
      ["narrator", "She pats the grass beside her, then leaves her hand there a moment longer than necessary.", "sierra:stargazingStep3"],
      ["sierra", "Lie down. The stars are better when you stop trying to win the staring contest.", "sierra:stargazingStep3"]
    ],
    next: "full_love_sierra_two"
  },
  full_love_sierra_two: {
    label: "Yosemite Meadow",
    background: () => ({ location: "yosemiteMeadowNight", time: "night" }),
    music: "sierraFullLoveMeadow",
    lines: [
      ["narrator", "You lower into the grass beside her. Sierra's shoulder nears yours, and the gap sparks.", "sierra:stargazingStep3"],
      ["sierra", "When I first found this place, I thought I would bring people here all the time.", "sierra:stargazingStep3"],
      ["player", "But you did not.", "sierra:stargazingStep3"],
      ["sierra", "No. Turns out I am generous with trail advice and extremely selfish with silence.", "sierra:stargazingStep3"],
      ["narrator", "She smiles at that, a small smile, gone almost as soon as it appears.", "sierra:stargazingStep3"],
      ["sierra", "Most people want the waterfall. The big view. The story they can tell later.", "sierra:stargazingStep3"],
      ["player", "And you?", "sierra:stargazingStep3"],
      ["sierra", "I wanted someone who would notice this part too. The cold. The flowers. Your own breathing.", "sierra:stargazingStep3"],
      ["narrator", "The meadow holds the words gently. Even the waterfall feels farther away.", "sierra:stargazingStep3"],
      ["sierra", "I did not know I was waiting for you until you kept showing up like quiet mattered.", "sierra:stargazingStep3"]
    ],
    next: "full_love_sierra_three"
  },
  full_love_sierra_three: {
    label: "Yosemite Meadow",
    background: () => ({ location: "yosemiteMeadowNight", time: "night" }),
    music: "sierraFullLoveMeadow",
    lines: [
      ["narrator", "Sierra turns toward you. In the moonlight, her eyes are bright and a little afraid.", "sierra:stargazingStep3"],
      ["sierra", "I have been trying to think of something clever to say since the kiosk printed that ticket.", "sierra:stargazingStep3"],
      ["player", "Any luck?", "sierra:stargazingStep3"],
      ["sierra", "Terrible luck. Very humbling evening for my pride.", "sierra:stargazingStep3"],
      ["narrator", "The joke lands softly. Then she reaches for your hand, fingers fitting with calm certainty.", "sierra:stargazingStep4"],
      ["sierra", "So I am going to say the true thing instead.", "sierra:stargazingStep4"],
      ["player", "Okay.", "sierra:stargazingStep4"],
      ["sierra", "I wanted you here. Not because the view is good, even though obviously I have taste.", "sierra:stargazingStep4"],
      ["sierra", "Because when something beautiful happens, I wonder what your face would do beside it.", "sierra:stargazingStep4"]
    ],
    next: "full_love_sierra_prompt"
  },
  full_love_sierra_prompt: {
    label: "Yosemite Meadow",
    background: () => ({ location: "yosemiteMeadowNight", time: "night" }),
    music: "sierraFullLoveMeadow",
    lines: [
      ["narrator", "She stays close, and the whole meadow seems to tilt toward her. Her thumb strokes your hand.", "sierra:stargazingStep4"],
      ["sierra", "I don't want this to end. I want to stay here a while and find out what happens next.", "sierra:stargazingStep4"]
    ],
    choices: [
      {
        label: "Tell her you want that too.",
        next: "full_love_sierra_good",
        unlockCG: "sierraFullLoveGood",
        flags: { sierraFullLoveGood: true }
      },
      {
        label: "Say, 'Wow, the vulnerable rizz is crazy. Big content moment.'",
        next: "full_love_sierra_bad_pause",
        feelings: { sierra: -6 },
        fadeOutMusicUntilScene: { sceneId: "day_wake", fadeOutMs: 2400, resumeFadeMs: 5600 }
      }
    ]
  },
  full_love_sierra_good: {
    label: "Yosemite Meadow",
    background: () => ({ location: "yosemiteMeadowNight", time: "night" }),
    music: "sierraFullLoveGood",
    lines: [
      ["narrator", "Sierra's expression shifts gently: hope, then relief, then warmth against the cold meadow.", "sierra:stargazingStep4"],
      ["player", "I want that too.", "sierra:stargazingStep4"],
      ["player", "I want to stay. I want the quiet part, the impossible view, and you beside me.", "sierra:stargazingStep4"],
      ["sierra", "You are very hard to act normal around.", "sierra:stargazingStep4"],
      ["player", "Good.", "sierra:stargazingStep4"],
      ["narrator", "She laughs once, breathless, then closes the distance. The kiss warms as you answer.", "sierra:stargazingStep4"],
      ["sierra", "Still here?", "sierra:stargazingStep4"],
      ["player", "Right here.", "sierra:stargazingStep4"],
      ["narrator", "Her hand curls in your jacket. The stars blur as she kisses you again, slow and close.", "sierra:stargazingStep4"],
      ["narrator", "The meadow keeps the rest private: cool grass, Sierra warm against you, and the world kind.", "sierra:stargazingStep4"],
      ["player", "Later you remember the stars in fragments, each one lost when she leans in again.", "sierra:stargazingStep4"],
      ["narrator", "Hours pass in pieces: whispered stories, her cheek on your chest, and no reason for time.", "sierra:stargazingStep4"],
      ["narrator", "At some point, talking thins into silence, then breathing, then sleep.", "sierra:stargazingStep4", { fadeOutSprite: true }]
    ],
    next: "full_love_sierra_morning_return"
  },
  full_love_sierra_morning_return: {
    label: "Morning",
    background: () => ({ location: "black", time: "daytime" }),
    music: "sierraFullLoveGood",
    character: null,
    lines: [
      ["narrator", "Morning comes softly, and the meadow stays behind the dark a little longer."],
      ["narrator", "Sierra still sleeps beside you, one hand tucked in your sleeve, peaceful enough to calm you."],
      ["player", "You do not wake her. You brush grass from her hair, kiss her forehead, and leave."],
      ["narrator", "By the time you reach the lodge, morning is fully here, and something tender came with you."]
    ],
    nextAction: completeSierraFullLoveMorning
  },
  full_love_sierra_bad_pause: {
    label: "Yosemite Meadow",
    background: () => ({ location: "yosemiteMeadowNight", time: "night" }),
    music: "sierraFullLoveMeadow",
    lines: [
      ["narrator", "", "sierra:stargazingStep4", { dialogueHidden: true, autoAdvanceMs: 3000 }],
      ["narrator", "...", "sierra:stargazingStep4", { dialogueSlowFade: true, autoAdvanceMs: 2600 }]
    ],
    next: "full_love_sierra_bad_departure"
  },
  full_love_sierra_bad_departure: {
    label: "Yosemite Meadow",
    background: () => ({ location: "yosemiteMeadowNight", time: "night" }),
    music: "sierraFullLoveMeadow",
    lines: [
      ["narrator", "", "sierra:stargazingStep4", { dialogueHidden: true, spriteDriftUp: true, autoAdvanceMs: 4300 }],
      ["narrator", "Sierra says nothing. That is worse than anger. It feels like the meadow filing you away."],
      ["narrator", "She stands with haunted precision and walks away without looking back."],
      ["player", "Oh no."],
      ["narrator", "Your words stay in the grass behind you, radioactive enough that wildflowers seem offended."],
      ["player", "I said 'vulnerable rizz' to a woman trusting me under the stars."],
      ["narrator", "You have never felt more embarrassed. Not publicly. Not privately. Maybe not metaphysically."],
      ["narrator", "You sit in the meadow and wonder what this says about you. None of the answers help."],
      ["narrator", "Yosemite offers no answer. It has cliffs to be and dignity to preserve."],
      ["player", "I should go back to the lodge before the stars start unfollowing me."]
    ],
    next: "full_love_sierra_bad_departure_line_fade"
  },
  full_love_sierra_bad_departure_line_fade: {
    label: "Yosemite Meadow",
    background: () => ({ location: "yosemiteMeadowNight", time: "night" }),
    music: "sierraFullLoveMeadow",
    lines: [
      ["player", "I should go back to the lodge before the stars start unfollowing me.", null, { dialogueFadeOut: true, autoAdvanceMs: 1150, suppressAdvanceSfx: true }]
    ],
    next: "full_love_sierra_bad_meadow_fade_to_black"
  },
  full_love_sierra_bad_meadow_fade_to_black: {
    label: "Trail Back",
    background: () => ({ location: "black", time: "night" }),
    music: "sierraFullLoveMeadow",
    character: null,
    suppressSceneSfx: true,
    lines: [
      ["narrator", "", null, { dialogueHidden: true, autoAdvanceMs: 1350, suppressAdvanceSfx: true }]
    ],
    next: "full_love_sierra_bad_walk_back"
  },
  full_love_sierra_bad_walk_back: {
    label: "Trail Back",
    background: () => ({ location: "black", time: "night" }),
    music: "sierraFullLoveMeadow",
    character: null,
    suppressSceneSfx: true,
    lines: [
      ["narrator", "You start walking back through the dark, each step crunching like the earth is subtweeting.", null, { dialogueSlowFade: true, startOverlayAmbient: "dryGrassWalk", startOverlayAmbientAfterMs: 1700 }],
      ["player", "I should apologize. With words from before the internet found a blender and climbed inside."],
      ["narrator", "The trail is mercifully empty, which helps, because your aura reads drafted apology."],
      ["player", "Tomorrow I will be normal. Quiet. Mysterious, even. A person with no catchphrases at all."],
      ["narrator", "The lodge door appears at last, warm light around the frame like civilization relenting.", null, { stopOverlayAmbientOnAdvance: true }]
    ],
    next: "full_love_sierra_bad_door_line_fade"
  },
  full_love_sierra_bad_door_line_fade: {
    label: "Lodge Door",
    background: () => ({ location: "black", time: "night" }),
    music: "sierraFullLoveMeadow",
    character: null,
    suppressSceneSfx: true,
    lines: [
      ["narrator", "You put one hand on the handle and prepare to re-enter society as a cautionary screenshot.", null, { dialogueFadeOut: true, autoAdvanceMs: 1150, suppressAdvanceSfx: true }]
    ],
    next: "full_love_sierra_bad_open_lodge_door"
  },
  full_love_sierra_bad_open_lodge_door: {
    label: "Lodge Door",
    background: () => ({ location: "black", time: "night" }),
    music: "sierraFullLoveMeadow",
    character: null,
    suppressSceneSfx: true,
    lines: [
      ["narrator", "", null, { dialogueHidden: true, audio: "door", autoAdvanceMs: 850, suppressAdvanceSfx: true }]
    ],
    next: "full_love_sierra_bad_lodge_fade_in"
  },
  full_love_sierra_bad_lodge_fade_in: {
    label: "Lodge Lobby",
    background: () => ({ location: "lodge", time: "night" }),
    music: "sierraFullLoveMeadow",
    character: null,
    suppressSceneSfx: true,
    lines: [
      ["narrator", "", null, { dialogueHidden: true, autoAdvanceMs: 950, suppressAdvanceSfx: true }]
    ],
    nextAction: completeFullLoveScene
  },
  full_love_natai_start: {
    label: "Zion After Dark",
    background: () => ({ location: "zion", time: "night" }),
    music: "nataiFullLoveCanyon",
    onEnter: () => { state.visitTime = "night"; state.pendingDestination = "natai"; state.pendingFullLoveScene = "natai"; },
    lines: [
      ["narrator", "Natai's route card warms under your thumb. The kiosk adds: NIGHT PERMIT APPROVED. BE NORMAL."],
      ["narrator", "Zion opens in moonlit sandstone and black sky. The canyon still holds the day's last warmth."],
      ["player", "Natai?"],
      ["narrator", "Natai steps out beside the route sign with a lantern and a look already judging the kiosk.", "natai"],
      ["natai", "You are on time.", "natai"],
      ["player", "That sounded almost pleased.", "natai"],
      ["natai", "Do not become reckless with one data point.", "natai:blushing"],
      ["narrator", "Their mouth almost gives them away. Lantern light catches the warm edge of their smile.", "natai:blushing"],
      ["natai", "I found a quieter place above the wash. Better stars. Flat ground. A miracle of planning.", "natai"],
      ["player", "So this is a rescue mission for the stars.", "natai"],
      ["natai", "For the stars. For my patience. Possibly for you.", "natai:blushing"]
    ],
    next: "full_love_natai_camp"
  },
  full_love_natai_camp: {
    label: "Zion Backcountry",
    background: () => ({ location: "zionClearingNight", time: "night" }),
    music: "nataiFullLoveCanyon",
    lines: [
      ["narrator", "Natai leads you off the main route through a narrow turn into a sheltered shelf of canyon."],
      ["narrator", "The clearing waits under moonlight: flat ground, warm lanterns, two enamel cups, wide sky."],
      ["player", "Did you make a romantic checklist?", "natai"],
      ["natai", "No.", "natai"],
      ["natai", "It is a romantic-adjacent risk assessment.", "natai:blushing"],
      ["player", "That is somehow better.", "natai:blushing"],
      ["narrator", "Natai pours tea. Steam curls silver while you sit shoulder to shoulder and watch stars.", "natai"],
      ["natai", "The desert is honest at night. No glare. No performance. Just stone, air, distance.", "natai"],
      ["player", "And us?", "natai"],
      ["natai", "Us is more complicated.", "natai:blushing"],
      ["player", "I can handle complicated.", "natai:blushing"],
      ["natai", "Do not say heroic things. I will be forced to respect them.", "natai:blushing"],
      ["narrator", "They stare into the tea as if it might provide a less humiliating route through honesty.", "natai"],
      ["natai", "I had brothers. One made safety look effortless. One thought danger was applause.", "natai:angryExplaining"],
      ["natai", "There was a bear. A food cache. A fire set by pride. Our oldest died getting us out.", "natai:angryExplaining"],
      ["player", "Natai...", "natai:angryExplaining"],
      ["natai", "The youngest blamed the bear. I tried to stop him. He went after it anyway.", "natai:angryExplaining"],
      ["natai", "Something happened in the woods. He looked at me like I had seen too much, and then he ran.", "natai:angryExplaining"],
      ["natai", "Everyone wants anger to be ugly. Mine was practical. It kept me standing.", "natai:angryExplaining"],
      ["player", "And now?", "natai:angryExplaining"],
      ["natai", "Now it is tired.", "natai:angryExplaining"],
      ["narrator", "They look at you, still sharp, but warm enough now to trust.", "natai:blushing"]
    ],
    next: "full_love_natai_sleeping_bag"
  },
  full_love_natai_sleeping_bag: {
    label: "Zion Backcountry",
    background: () => ({ location: "zionClearingNight", time: "night" }),
    music: "nataiFullLoveCanyon",
    lines: [
      ["narrator", "A cold wind moves over the stone. Natai checks the camp bundle beside the lantern."],
      ["natai", "Hm.", "natai:grumpy"],
      ["player", "That was an ominous hm.", "natai:grumpy"],
      ["natai", "It was a precise hm.", "natai:grumpy"],
      ["narrator", "They unroll one sleeping bag. One. Singular. The canyon offers no comment. Rude of it.", "natai:sleepingBagRomantic"],
      ["natai", "Oh no.", "natai:sleepingBagRomantic"],
      ["player", "Natai.", "natai:sleepingBagRomantic"],
      ["natai", "There is only one sleeping bag.", "natai:sleepingBagRomantic"],
      ["player", "You sound suspiciously calm about that.", "natai:sleepingBagRomantic"],
      ["natai", "Panic wastes heat.", "natai:sleepingBagRomantic"],
      ["narrator", "They settle half inside the bag, hair loose, trying and failing to make this look normal.", "natai:sleepingBagRomantic"],
      ["natai", "For warmth, proximity is the rational solution.", "natai:sleepingBagRomantic"],
      ["player", "Rational.", "natai:sleepingBagRomantic"],
      ["natai", "Do not make me say it twice. I am already using more eye contact than recommended.", "natai:sleepingBagRomantic"]
    ],
    next: "full_love_natai_prompt"
  },
  full_love_natai_prompt: {
    label: "Zion Backcountry",
    background: () => ({ location: "zionClearingNight", time: "night" }),
    music: "nataiFullLoveCanyon",
    lines: [
      ["narrator", "The open sleeping bag waits in the lantern light. Natai holds your gaze without retreating.", "natai:sleepingBagRomantic"],
      ["natai", "If you want to stay close, say it plainly. I will understand plainly.", "natai:sleepingBagRomantic"]
    ],
    choices: [
      {
        label: "Tell them you want to stay, and you want them, clearly.",
        next: "full_love_natai_good",
        unlockCG: "nataiFullLoveGood",
        flags: { nataiFullLoveGood: true }
      },
      {
        label: "Ask whether the safety checklist has a section for fake camping emergencies.",
        next: "full_love_natai_bad_pause",
        feelings: { natai: -6 },
        fadeOutMusicUntilScene: { sceneId: "day_wake", fadeOutMs: 2400, resumeFadeMs: 5600 }
      }
    ]
  },
  full_love_natai_good: {
    label: "Zion Backcountry",
    background: () => ({ location: "zionClearingNight", time: "night" }),
    music: "nataiFullLoveGood",
    onEnter: () => {
      if (!state.flags.brotherGoodFirst) state.flags.brotherGoodFirst = "natai";
    },
    lines: [
      ["narrator", "Natai exhales like the canyon has finally stopped asking them to be composed.", "natai:sleepingBagRomantic"],
      ["player", "I want to stay. I want you. Clearly.", "natai:sleepingBagRomantic"],
      ["natai", "Good.", "natai:sleepingBagRomantic"],
      ["player", "That is all?", "natai:sleepingBagRomantic"],
      ["natai", "No. That is the part I can say without embarrassing both of us and possibly the moon.", "natai:sleepingBagRomantic"],
      ["narrator", "Their hand finds yours at the bag's edge. Warm. Certain. Less steady than they would admit.", "natai:sleepingBagRomantic"],
      ["natai", "For years I thought letting anyone close meant giving up the anger that kept me alive.", "natai:sleepingBagRomantic"],
      ["player", "You do not have to give it up all at once.", "natai:sleepingBagRomantic"],
      ["natai", "No. But I can stop letting it choose every route.", "natai:sleepingBagRomantic"],
      ["natai", "Come here. Slowly.", "natai:sleepingBagRomantic"],
      ["narrator", "The first kiss is careful. The second is not. Natai draws you closer and lets control slip.", "natai:sleepingBagRomantic"],
      ["narrator", "The sleeping bag rustles around you both. The joke dies when their hand finds your back.", "natai:sleepingBagRomantic"],
      ["player", "Still calling this proximity?", "natai:sleepingBagRomantic"],
      ["natai", "No.", "natai:sleepingBagRomantic"],
      ["natai", "Now I am calling it wanting you so badly I am grateful the canyon is too polite to comment.", "natai:sleepingBagRomantic"],
      ["narrator", "They kiss you again, slower now, each touch less restraint than promise.", "natai:sleepingBagRomantic"],
      ["player", "You are very quiet.", "natai:sleepingBagRomantic"],
      ["natai", "I am concentrating.", "natai:sleepingBagRomantic"],
      ["player", "On survival?", "natai:sleepingBagRomantic"],
      ["natai", "On not making a sound the canyon will remember.", "natai:sleepingBagRomantic"],
      ["narrator", "The sleeping bag turns cold night warm: hair at your cheek, breath, their mouth on yours.", "natai:sleepingBagRomantic"],
      ["narrator", "Outside the lantern light, Zion stays vast. Inside it, everything is close and warm.", "natai:sleepingBagRomantic"],
      ["natai", "Tell me if you want me to stop.", "natai:sleepingBagRomantic"],
      ["player", "I do not want you to stop.", "natai:sleepingBagRomantic"],
      ["natai", "Good.", "natai:sleepingBagRomantic"],
      ["narrator", "That one word lands rougher than it should. Their composure flickers, then they kiss you.", "natai:sleepingBagRomantic"],
      ["narrator", "Everything narrows to heat and trust: hands learning permission, laughter turning quiet.", "natai:sleepingBagRomantic"],
      ["narrator", "For a while there is no route or checklist. Only breath, warmth, and Natai close.", "natai:sleepingBagRomantic"],
      ["natai", "For the record, this remains an excellent survival decision.", "natai:sleepingBagRomantic"],
      ["player", "Extremely practical.", "natai:sleepingBagRomantic"],
      ["natai", "There really is only one sleeping bag.", "natai:sleepingBagRomantic"]
    ],
    next: "full_love_natai_good_sleep_fade"
  },
  full_love_natai_good_sleep_fade: {
    label: "Zion Backcountry",
    background: () => ({ location: "zionClearingNight", time: "night" }),
    music: "nataiFullLoveGood",
    lines: [
      ["narrator", "", "natai:sleepingBagRomantic", { dialogueHidden: true, autoAdvanceMs: 850 }],
      ["narrator", "", "natai:sleepingBagRomantic", { dialogueHidden: true, fadeOutSprite: true, autoAdvanceMs: 1400 }]
    ],
    next: "full_love_natai_sleep_line"
  },
  full_love_natai_sleep_line: {
    label: "Zion Backcountry",
    background: () => ({ location: "zionClearingNight", time: "night" }),
    music: "nataiFullLoveGood",
    lines: [
      ["narrator", "You fall asleep there because there is only one sleeping bag, and Natai's arm feels safest.", null, { dialogueSlowFade: true }]
    ],
    next: "full_love_natai_sleep_fade"
  },
  full_love_natai_sleep_fade: {
    label: "Zion Backcountry",
    background: () => ({ location: "zionClearingNight", time: "night" }),
    music: "nataiFullLoveGood",
    lines: [
      ["narrator", "", null, { dialogueHidden: true, fadeOutMusicUntilScene: { sceneId: "day_wake", fadeOutMs: 2800, resumeFadeMs: 5200 }, autoAdvanceMs: 2800 }]
    ],
    next: "full_love_natai_morning_return"
  },
  full_love_natai_morning_return: {
    label: "Morning",
    background: () => ({ location: "black", time: "daytime" }),
    ambient: "nataiMorning",
    character: null,
    lines: [
      ["narrator", "Morning comes pale over Zion, but the sleeping bag keeps the last of the night close.", null, { dialogueSlowFade: true }],
      ["narrator", "Natai still sleeps beside you, hair loose and face unguarded enough to count as a breach."],
      ["player", "You let them sleep. You leave the checklist under the thermos with one note: Route approved."],
      ["narrator", "By the time you reach the lodge, morning is fully here, and the desert sent warmth with you."]
    ],
    nextAction: completeNataiFullLoveMorning
  },
  full_love_natai_bad_pause: {
    label: "Zion Backcountry",
    background: () => ({ location: "zionClearingNight", time: "night" }),
    music: "nataiFullLoveCanyon",
    lines: [
      ["narrator", "", "natai:sleepingBagRomantic", { dialogueHidden: true, autoAdvanceMs: 3000 }],
      ["narrator", "...", "natai:sleepingBagRomantic", { dialogueSlowFade: true, autoAdvanceMs: 2600 }]
    ],
    next: "full_love_natai_bad_sleeping_bag"
  },
  full_love_natai_bad_sleeping_bag: {
    label: "Zion Backcountry",
    background: () => ({ location: "zionClearingNight", time: "night" }),
    music: "nataiFullLoveCanyon",
    lines: [
      ["narrator", "The canyon holds very, very still.", "natai:sleepingBagRomantic"],
      ["narrator", "", "natai:sleepingBagRomantic", { propCue: "natai:emptySleepingBag", dialogueHidden: true, sleepingBagRise: true, autoAdvanceMs: 4600 }],
      ["natai", "I have discovered a second sleeping bag after all.", "natai:sleepingBagRomantic", { propCue: "natai:emptySleepingBag", dialogueSlowFade: true }],
      ["natai", "It was resting under the first one. A compact storage decision. Unremarkable, apparently.", "natai:sleepingBagRomantic", { propCue: "natai:emptySleepingBag" }],
      ["player", "Oh my god.", "natai:sleepingBagRomantic", { propCue: "natai:emptySleepingBag" }],
      ["natai", "The problem is solved. No one has to share anything they would rather interrogate.", "natai:sleepingBagRomantic", { propCue: "natai:emptySleepingBag" }],
      ["player", "I cannot believe I got stared down by an emergency backup sleeping bag.", "natai:sleepingBagRomantic", { propCue: "natai:emptySleepingBag" }],
      ["narrator", "Natai does not get up. They watch you process the second bag with painful composure.", "natai:sleepingBagRomantic", { propCue: "natai:emptySleepingBag" }],
      ["natai", "The route marker is downhill. The path is lit.", "natai:sleepingBagRomantic", { propCue: "natai:emptySleepingBag" }],
      ["player", "Great. Perfect. Love a well-lit retreat.", "natai:sleepingBagRomantic", { propCue: "natai:emptySleepingBag" }],
      ["narrator", "You go back to the lodge embarrassed, irritated, and wary of rolled camping gear.", "natai:sleepingBagRomantic", { propCue: "natai:emptySleepingBag" }]
    ],
    next: "full_love_natai_bad_exit"
  },
  full_love_natai_bad_exit: {
    label: "Zion Backcountry",
    background: () => ({ location: "zionClearingNight", time: "night" }),
    music: "nataiFullLoveCanyon",
    lines: [
      ["narrator", "", "natai:sleepingBagRomantic", { propCue: "natai:emptySleepingBag", dialogueHidden: true, fadeOutSprite: true, fadeOutProp: true, autoAdvanceMs: 1400 }]
    ],
    nextAction: completeFullLoveScene
  },
  full_love_dakota_start: {
    label: "Sequoia Sunset",
    background: () => ({ location: "sequoia", time: "sunset" }),
    music: "dakotaFullLoveTender",
    onEnter: () => { state.visitTime = "sunset"; state.pendingDestination = "dakota"; state.pendingFullLoveScene = "dakota"; },
    lines: [
      ["narrator", "Dakota's route card warms under your thumb. The kiosk prints: SUNSET GROVE ACCESS."],
      ["narrator", "Sequoia opens in amber light. The trunks rise like towers while the day cools into evening."],
      ["player", "Dakota?"],
      ["narrator", "Dakota waits by the old fire ring, hat in hand, glad you came and scared of what that asks.", "dakota:sadExplaining"],
      ["dakota", "I was hoping you would come. That is already more honest than I planned to be.", "dakota:sadExplaining"],
      ["player", "I like honest. Even when it arrives looking nervous.", "dakota:sadExplaining"],
      ["dakota", "Then I should tell you why I keep stopping at this fire ring like it can sentence me again.", "dakota:sadExplaining"]
    ],
    next: "full_love_dakota_confession"
  },
  full_love_dakota_confession: {
    label: "Sequoia Sunset",
    background: () => ({ location: "sequoia", time: "sunset" }),
    music: "dakotaFullLoveTender",
    lines: [
      ["narrator", "The fire ring waits between you, all old stone and older memory."],
      ["dakota", "There were three brothers once.", "dakota:sadExplaining"],
      ["dakota", "The oldest was wise and protective. You only saw how much he carried after he was gone.", "dakota:sadExplaining"],
      ["dakota", "The middle one was sharp and impossible to fool. He could make you feel stupid and safe.", "dakota:sadExplaining"],
      ["player", "Natai.", "dakota:sadExplaining"],
      ["narrator", "Dakota closes his eyes. The name lands like a hand on a bruise.", "dakota:sadExplaining"],
      ["dakota", "Yes.", "dakota:sadExplaining"],
      ["dakota", "The youngest was proud and reckless. He heard every warning as an insult.", "dakota:sadExplaining"],
      ["player", "You.", "dakota:sadExplaining"],
      ["dakota", "Me.", "dakota:sadExplaining"],
      ["dakota", "A bear came near our food. I was angry before afraid, which is a terrible order for a heart.", "dakota:sadExplaining"],
      ["dakota", "I started a fire to kill it. The fire spread. Our oldest brother died getting us out.", "dakota:sadExplaining"],
      ["narrator", "The grove seems to darken around the confession, not judging, only listening.", "dakota:sadExplaining"],
      ["dakota", "I blamed the bear because blaming myself felt like drowning. Revenge felt easier than truth.", "dakota:sadExplaining"],
      ["dakota", "The spirits saw hatred where responsibility should have been. They made my outside match it.", "dakota:sadExplaining"],
      ["dakota", "Natai saw it happen. I looked at him. He knew. I knew he knew. And I ran.", "dakota:sadExplaining"],
      ["player", "Dakota...", "dakota:sadExplaining"],
      ["dakota", "Years passed. I learned to live like this. I never learned to forgive the one who caused it.", "dakota:sadExplaining"],
      ["dakota", "Then I saw Natai here. We locked eyes like the first time. I ran again, just slower.", "dakota:sadExplaining"],
      ["player", "You were ashamed.", "dakota:sadExplaining"],
      ["dakota", "I still am.", "dakota:sadExplaining"]
    ],
    next: "full_love_dakota_forgiveness"
  },
  full_love_dakota_forgiveness: {
    label: "Sequoia Sunset",
    background: () => ({ location: "sequoia", time: "sunset" }),
    music: "dakotaFullLoveTender",
    lines: [
      ["narrator", "Sunset lowers through the branches, softening the grove around Dakota's confession."],
      ["player", "Shame kept you alive, maybe. It does not get to keep owning you.", "dakota:sadExplaining"],
      ["dakota", "I do not know how to put it down.", "dakota:sadExplaining"],
      ["player", "Start smaller. Tell the truth without making it a cage.", "dakota:sadExplaining"],
      ["dakota", "I was reckless. I was grieving. I vanished, and kept punishing everyone for it.", "dakota:sadExplaining"],
      ["dakota", "But I loved my brothers. I spent years pretending that love died with my worth.", "dakota:sadExplaining"],
      ["player", "It did not die.", "dakota:sadExplaining"],
      ["dakota", "No.", "dakota:sadExplaining"],
      ["narrator", "Dakota breathes in. The first breath shakes. The second steadies. The third opens a lock.", "dakota:sadExplaining"],
      ["dakota", "I forgive the scared, angry boy who started the fire.", "dakota:sadExplaining"],
      ["dakota", "I will still carry what happened. But not as proof I should never be loved.", "dakota:sadExplaining"],
      ["narrator", "The grove answers with sudden gold.", "dakota:transformationSequence", { screenFlash: true, audio: "magicTransform", fadeOutMusicUntilScene: { sceneId: "full_love_dakota_timed_prompt", fadeOutMs: 900, resumeFadeMs: 900 } }]
    ],
    next: "full_love_dakota_human"
  },
  full_love_dakota_human: {
    label: "Sequoia Sunset",
    background: () => ({ location: "sequoia", time: "sunset" }),
    lines: [
      ["narrator", "The light clears in gold, leaving Dakota staring at himself with disbelieving eyes.", "dakota:humanHappyShock", { screenFlash: true }],
      ["dakota", "I... have hands.", "dakota:humanHappyShock"],
      ["dakota", "Human hands. Human face. Human everything.", "dakota:humanHappyShock"],
      ["player", "Mostly everything. The magic seems to have made a bold shirt-related decision.", "dakota:humanHappyShock"],
      ["dakota", "My shirt is gone.", "dakota:humanHappyShock"],
      ["player", "Tragic. Devastating. A great loss for fabric.", "dakota:humanHappyShock"],
      ["dakota", "You sound only mildly disappointed it stopped there.", "dakota:humanHappyShock"],
      ["player", "I am processing with dignity.", "dakota:humanHappyShock"],
      ["dakota", "I feel... good. Not because I look human again. Because I can breathe around myself.", "dakota:humanHappyShock"],
      ["dakota", "Also, for the record, I look good.", "dakota:humanConfidentFlex"],
      ["player", "You were always beautiful. Inside and out.", "dakota:humanConfidentFlex"],
      ["narrator", "The confidence falters into astonishment. Dakota looks at you like you found his last door.", "dakota:humanConfidentFlex"],
      ["dakota", "You mean that.", "dakota:humanConfidentFlex"],
      ["player", "I do.", "dakota:humanConfidentFlex"],
      ["narrator", "Another flash rolls through the grove, warmer now, less verdict than welcome home.", "dakota:bearTouchedFlex", { screenFlash: true, audio: "magicTransform" }],
      ["dakota", "Oh.", "dakota:bearTouchedFlex"],
      ["dakota", "I am still me.", "dakota:bearTouchedFlex"],
      ["player", "You are.", "dakota:bearTouchedFlex"],
      ["dakota", "And this is me too.", "dakota:bearTouchedFlex"],
      ["narrator", "He blushes, surprised and victorious, holding the flex like a joke that became a blessing.", "dakota:bearTouchedFlex"],
      ["narrator", "Then the joke changes. He keeps the pose, smiling like confidence found honest ground.", "dakota:bearFlexSmolderBlush"],
      ["dakota", "You keep looking at me like that and I might believe I am allowed to want things.", "dakota:bearFlexSmolderBlush"],
      ["player", "Good. Belief looks very good on you.", "dakota:bearFlexSmolderBlush"]
    ],
    next: "full_love_dakota_timed_prompt"
  },
  full_love_dakota_timed_prompt: {
    label: "Sequoia Sunset",
    background: () => ({ location: "sequoia", time: "sunset" }),
    music: "dakotaFullLoveDesire",
    lines: [
      ["narrator", "Dakota meets your eyes without hiding. What rushes in is tender, hungry, and certain.", "dakota:bearFlexSmolderBlush"],
      ["dakota", "I spent years running from what I wanted. I am done running.", "dakota:walkingCloserSmolder"],
      ["narrator", "He starts toward you, slow enough to be a question and direct enough to answer one.", "dakota:walkingCloserSmolder"]
    ],
    choices: [
      {
        label: "Let it happen.",
        next: "full_love_dakota_good",
        className: "timed-default",
        timedDefault: true,
        timeoutMs: 5000,
        unlockCG: "dakotaFullLoveGood",
        flags: { dakotaFullLoveGood: true }
      },
      {
        label: "Make a very brave excuse about staying friends.",
        next: "full_love_dakota_bad",
        flags: { dakotaFullLoveFriend: true }
      }
    ]
  },
  full_love_dakota_good: {
    label: "Sequoia Sunset",
    background: () => ({ location: "black", time: "night" }),
    music: "dakotaFullLoveDesire",
    onEnter: () => {
      state.flags.dakotaFullLoveGood = true;
      if (!state.flags.brotherGoodFirst) state.flags.brotherGoodFirst = "dakota";
    },
    lines: [
      ["narrator", "You do not move away."],
      ["narrator", "Dakota reaches you, warm and trembling with the relief of not being refused."],
      ["narrator", "The kiss starts soft, almost stunned. Then his arms close around you and the grove exhales."],
      ["narrator", "After that, the night turns private: laughter, heat, fur, and wanting that stays gentle."],
      ["narrator", "He keeps pausing as if shame will return. Each time, you pull him close until it doesn't."],
      ["dakota", "Tell me if I get too intense.", null],
      ["player", "Dakota, if anything, you have been holding back.", null],
      ["narrator", "That breaks something open in him. A rough laugh deepens into a roar that shakes the dark.", null, { audio: "dakotaRoar" }],
      ["dakota", "Sorry. That was... new.", null],
      ["player", "Do not apologize. I liked knowing the forest was impressed.", null],
      ["narrator", "He laughs again, softer, then gathers you close with careful strength."],
      ["narrator", "The rest of the night finds its rhythm: warm breath, low murmurs, and gentle check-ins."]
    ],
    next: "full_love_dakota_rest_line_fade"
  },
  full_love_dakota_rest_line_fade: {
    label: "Sequoia Sunset",
    background: () => ({ location: "black", time: "night" }),
    music: "dakotaFullLoveDesire",
    suppressSceneSfx: true,
    lines: [
      ["narrator", "The rest of the night finds its rhythm: warm breath, low murmurs, and gentle check-ins.", null, { dialogueFadeOut: true, autoAdvanceMs: 1100, suppressAdvanceSfx: true }]
    ],
    next: "full_love_dakota_sleep_line_fade_in"
  },
  full_love_dakota_sleep_line_fade_in: {
    label: "Sequoia Sunset",
    background: () => ({ location: "black", time: "night" }),
    music: "dakotaFullLoveDesire",
    suppressSceneSfx: true,
    lines: [
      ["narrator", "His low voice, the bark smell, and the comfort of being held pull you under.", null, { dialogueSlowFade: true, fadeOutMusicUntilScene: { sceneId: "day_wake", fadeOutMs: 2600, resumeFadeMs: 5600 } }]
    ],
    next: "full_love_dakota_sleep_line_fade"
  },
  full_love_dakota_sleep_line_fade: {
    label: "Sequoia Sunset",
    background: () => ({ location: "black", time: "night" }),
    music: "dakotaFullLoveDesire",
    suppressSceneSfx: true,
    lines: [
      ["narrator", "His low voice, the bark smell, and the comfort of being held pull you under.", null, { dialogueFadeOut: true, autoAdvanceMs: 1200, suppressAdvanceSfx: true }]
    ],
    next: "full_love_dakota_morning_fade_in"
  },
  full_love_dakota_morning_fade_in: {
    label: "Sequoia Morning",
    background: () => ({ location: "sequoia", time: "daytime" }),
    silenceMusic: true,
    suppressSceneSfx: true,
    character: null,
    lines: [
      ["narrator", "", null, { dialogueHidden: true, autoAdvanceMs: 1200, suppressAdvanceSfx: true }]
    ],
    next: "full_love_dakota_morning_birds_start"
  },
  full_love_dakota_morning_birds_start: {
    label: "Sequoia Morning",
    background: () => ({ location: "sequoia", time: "daytime" }),
    ambient: "dakotaMorning",
    silenceMusic: true,
    suppressSceneSfx: true,
    character: null,
    lines: [
      ["narrator", "", null, { dialogueHidden: true, autoAdvanceMs: 900, suppressAdvanceSfx: true }]
    ],
    next: "full_love_dakota_morning_return"
  },
  full_love_dakota_bad: {
    label: "Sequoia Sunset",
    background: () => ({ location: "sequoia", time: "sunset" }),
    lines: [
      ["player", "Dakota, I care about you. I really do. But I think tonight I need us to stay friends.", "dakota"],
      ["narrator", "He stops at once. Desire stays in his eyes, but so does respect, steady and unmistakable.", "dakota:walkingCloserSmolder"],
      ["dakota", "Friends is not a punishment.", "dakota"],
      ["dakota", "Especially not tonight.", "dakota:flattered"],
      ["player", "You are not disappointed?", "dakota:flattered"],
      ["dakota", "I am human enough to be a little disappointed and bear enough to survive it with dignity.", "dakota:flattered"],
      ["player", "You found your shirt again.", "dakota"],
      ["dakota", "A miracle almost as impressive as emotional maturity.", "dakota:laughing"],
      ["narrator", "He walks you back laughing softly, free in a way that does not depend on your answer.", "dakota:laughing"]
    ],
    nextAction: completeFullLoveScene
  },
  full_love_dakota_morning_return: {
    label: "Sequoia Morning",
    background: () => ({ location: "sequoia", time: "daytime" }),
    ambient: "dakotaMorning",
    silenceMusic: true,
    suppressSceneSfx: true,
    character: null,
    lines: [
      ["narrator", "Morning comes green and gold through the grove. No kiosk, no thunder. Just bark and birds.", null, { dialogueSlowFade: true }],
      ["player", "Did I just get mauled by a bear? Should I feel honored or file a baffling incident report?"],
      ["narrator", "Dakota still sleeps nearby, enormous and peaceful, one paw tucked under his cheek."],
      ["player", "You do not wake him. Anyone who spent the night forgiving himself gets to sleep in."]
    ],
    next: "full_love_dakota_wake_line_fade"
  },
  full_love_dakota_wake_line_fade: {
    label: "Sequoia Morning",
    background: () => ({ location: "sequoia", time: "daytime" }),
    ambient: "dakotaMorning",
    silenceMusic: true,
    suppressSceneSfx: true,
    character: null,
    lines: [
      ["player", "You do not wake him. Anyone who spent the night forgiving himself gets to sleep in.", null, { dialogueFadeOut: true, autoAdvanceMs: 1150, suppressAdvanceSfx: true }]
    ],
    next: "full_love_dakota_departure_fade_to_black"
  },
  full_love_dakota_departure_fade_to_black: {
    label: "Sequoia Morning",
    background: () => ({ location: "black", time: "daytime" }),
    ambient: "dakotaMorning",
    silenceMusic: true,
    suppressSceneSfx: true,
    character: null,
    lines: [
      ["narrator", "", null, { dialogueHidden: true, autoAdvanceMs: 1250, suppressAdvanceSfx: true }]
    ],
    next: "full_love_dakota_morning_departure"
  },
  full_love_dakota_morning_departure: {
    label: "Sequoia Morning",
    background: () => ({ location: "black", time: "daytime" }),
    ambient: "dakotaMorning",
    silenceMusic: true,
    suppressSceneSfx: true,
    character: null,
    lines: [
      ["narrator", "You head back toward the lodge alone, careful as the grove gives way to the path.", null, { dialogueSlowFade: true, startOverlayAmbient: "dryGrassWalk", startOverlayAmbientAfterMs: 1700 }],
      ["narrator", "By the time the lodge comes into view, morning is fully here, and soft fur still clings.", null, { stopOverlayAmbientOnAdvance: true }],
      ["narrator", "You take a deep breath and open the door, ready to take on the day."]
    ],
    next: "full_love_dakota_door_line_fade"
  },
  full_love_dakota_door_line_fade: {
    label: "Sequoia Morning",
    background: () => ({ location: "black", time: "daytime" }),
    ambient: "dakotaMorning",
    silenceMusic: true,
    suppressSceneSfx: true,
    character: null,
    lines: [
      ["narrator", "You take a deep breath and open the door, ready to take on the day.", null, { dialogueFadeOut: true, autoAdvanceMs: 1150, suppressAdvanceSfx: true }]
    ],
    next: "full_love_dakota_open_lodge_door"
  },
  full_love_dakota_open_lodge_door: {
    label: "Lodge Door",
    background: () => ({ location: "black", time: "daytime" }),
    ambient: "dakotaMorning",
    silenceMusic: true,
    suppressSceneSfx: true,
    character: null,
    lines: [
      ["narrator", "", null, { dialogueHidden: true, audio: "door", autoAdvanceMs: 850, suppressAdvanceSfx: true }]
    ],
    next: "full_love_dakota_birds_fade"
  },
  full_love_dakota_birds_fade: {
    label: "Lodge Door",
    background: () => ({ location: "black", time: "daytime" }),
    silenceMusic: true,
    suppressSceneSfx: true,
    character: null,
    lines: [
      ["narrator", "", null, { dialogueHidden: true, autoAdvanceMs: 1900, suppressAdvanceSfx: true }]
    ],
    nextAction: completeDakotaFullLoveMorning
  },
  transition_to_sunset_checkin: {
    label: "On The Route",
    background: () => ({ location: "black", time: "sunset" }),
    character: null,
    onEnter: () => { state.timeOfDay = "sunset"; },
    lines: [
      ["narrator", "The return route takes the long edge of the afternoon and folds it out of sight."],
      ["player", "When the path opens again, the light has changed. Sunset. One less chance left in the day."]
    ],
    next: "after_daytime_visit"
  },
  transition_to_night_checkin: {
    label: "On The Route",
    background: () => ({ location: "black", time: "night" }),
    character: null,
    onEnter: () => { state.timeOfDay = "night"; },
    lines: [
      ["narrator", "The route carries you through a brief pocket of darkness where the day's color drops away."],
      ["player", "By the time check-in comes back into view, night has arrived for real."]
    ],
    next: "after_sunset_visit"
  },
  after_daytime_visit: {
    label: "Sunset Check-In",
    background: () => ({ location: "checkIn", time: "sunset" }),
    onEnter: () => { state.timeOfDay = "sunset"; state.pendingDestination = null; },
    lines: [
      ["narrator", "By the time you return to check-in, sunset has warmed the desk, the route cards, and you."],
      ["player", "Still enough day left to make one more choice."]
    ],
    choices: () => scenes.checkin_hub.choices()
  },
  after_sunset_visit: {
    label: "Night Check-In",
    background: () => ({ location: "checkIn", time: "night" }),
    onEnter: () => { state.timeOfDay = "night"; state.pendingDestination = null; },
    lines: [
      ["narrator", "Night meets you at check-in. The kiosk glow looks softer now, or maybe you are tired."],
      ["player", "One more route if I have it in me. Then the lodge. Then unconsciousness as a lifestyle."]
    ],
    choices: () => scenes.checkin_hub.choices()
  },
  night_lodge_return: {
    label: "Lodge Lobby",
    background: () => ({ location: "lodge", time: "night" }),
    onEnter: () => { state.pendingDestination = null; },
    lines: [
      ["narrator", "After the night visit, you return straight to the lodge. No detour. No pretending now."],
      ["player", "Bed. Beautiful concept. Possibly humanity's finest invention."],
      ["narrator", "The lodge lights blur warm and low as you head upstairs."]
    ],
    nextAction: () => {
      state.day += 1;
      renderScene("sleep_between_days");
    }
  },
  early_lodge_return: {
    label: () => `${TIME_LABELS[state.timeOfDay]} Lodge Lobby`,
    background: () => ({ location: "lodge", time: state.timeOfDay }),
    lines: () => [
      ["narrator", `You return to the lodge lobby in the ${state.timeOfDay === "sunset" ? "last light" : "night quiet"}. The fireplace waits quietly.`],
      ["player", "Today gets to end here."]
    ],
    choices: [
      { label: "Go to sleep.", action: () => { state.day += 1; renderScene("sleep_between_days"); } }
    ]
  },
  sleep_between_days: {
    label: "Night",
    background: () => ({ location: "black", time: "night" }),
    character: null,
    lines: [
      ["player", "Sleep takes me before I can turn the day into a story with clean edges."],
      ["player", "By morning, the feelings are still there. Less organized, maybe, but awake before I am."]
    ],
    nextAction: startNewDay
  }
};

const els = {
  startScreen: document.getElementById("startScreen"),
  setupScreen: document.getElementById("setupScreen"),
  gameScreen: document.getElementById("gameScreen"),
  startGameTransition: document.getElementById("startGameTransition"),
  backdrop: document.getElementById("backdrop"),
  backdropNext: document.getElementById("backdropNext"),
  sprite: document.getElementById("sprite"),
  propSprite: document.getElementById("propSprite"),
  placeholderSprite: document.getElementById("placeholderSprite"),
  speakerName: document.getElementById("speakerName"),
  sceneLabel: document.getElementById("sceneLabel"),
  dialogueBox: document.getElementById("dialogueBox"),
  lineText: document.getElementById("lineText"),
  choices: document.getElementById("choices"),
  toast: document.getElementById("toast"),
  galleryOverlay: document.getElementById("galleryOverlay"),
  galleryGrid: document.getElementById("galleryGrid"),
  devBtn: document.getElementById("devBtn"),
  backBtn: document.getElementById("backBtn"),
  skipBtn: document.getElementById("skipBtn"),
  skipToBtn: document.getElementById("skipToBtn"),
  devPanel: document.getElementById("devPanel"),
  devScores: document.getElementById("devScores"),
  devAudioStatus: document.getElementById("devAudioStatus"),
  devChoicePreview: document.getElementById("devChoicePreview"),
  devEasyCopy: document.getElementById("devEasyCopy"),
  devBackButton: document.getElementById("devBackButton"),
  devSkipButton: document.getElementById("devSkipButton"),
  devQuickRestoreInputs: document.getElementById("devQuickRestoreInputs"),
  devDisableTypewriter: document.getElementById("devDisableTypewriter"),
  quickRestorePanel: document.getElementById("quickRestorePanel"),
  quickRestoreCopyBtn: document.getElementById("quickRestoreCopyBtn"),
  quickRestoreInput: document.getElementById("quickRestoreInput"),
  dialogueCopyBtn: document.getElementById("dialogueCopyBtn"),
  dayTransition: document.getElementById("dayTransition"),
  dayTransitionButton: document.getElementById("dayTransitionButton")
};

const audioEngine = {
  locationKey: "checkIn",
  characterKey: null,
  musicOverrideKey: null,
  musicKey: null,
  activeMusicIndex: 0,
  musicPlayers: [],
  loopTimerId: null,
  fadeTimerIds: [],
  transitioning: false,
  currentTheme: null,
  trackChangeToken: 0,
  musicSuppressedLocationKey: null,
  musicSuppressedUntilSceneId: null,
  musicResumeFadeMs: null,
  pendingMusicStartSfx: null,
  justPlayedDoorSfx: false,
  ambientKey: null,
  ambientPlayer: null,
  ambientTimerId: null,
  ambientFadeTimerId: null,
  ambientToken: 0,
  overlayAmbientKey: null,
  overlayAmbientPlayer: null,
  overlayAmbientFadeTimerId: null,
  overlayAmbientToken: 0,
  sfxContext: null,
  advanceBuffer: null,
  advanceBufferPromise: null,
  advancePlayer: null,
  activeSfxPlayers: [],
  sfxChannels: {},
  enabled: true
};

bindEvents();
updateBeginButton();
validateSceneEstablishingRules();

function bindEvents() {
  document.getElementById("newGameBtn").addEventListener("click", () => {
    startGame();
  });
  document.getElementById("continueBtn").addEventListener("click", loadGame);
  document.getElementById("beginBtn").addEventListener("click", completeLegacySetup);
  document.getElementById("playerName").addEventListener("input", event => {
    updateBeginButton();
    if (event.inputType && !["insertReplacementText", "historyUndo", "historyRedo"].includes(event.inputType)) playSfx("type");
  });
  document.getElementById("saveBtn").addEventListener("click", saveGame);
  document.getElementById("loadBtn").addEventListener("click", loadGame);
  document.getElementById("resetBtn").addEventListener("click", resetGame);
  document.getElementById("galleryBtn").addEventListener("click", showGallery);
  document.getElementById("audioBtn").addEventListener("click", toggleAudio);
  document.getElementById("closeGalleryBtn").addEventListener("click", () => els.galleryOverlay.classList.remove("active"));
  document.getElementById("unlockPreviewBtn").addEventListener("click", () => {
    Object.keys(cgLibrary).forEach(unlockCG);
    renderGallery();
    toast("Gallery preview unlocked.");
  });
  els.devBtn.addEventListener("click", () => {
    state.devPanelOpen = !state.devPanelOpen;
    updateDevPanel();
  });
  els.devChoicePreview.addEventListener("change", () => {
    state.devChoicePreview = els.devChoicePreview.checked;
    updateDevPanel();
    renderCurrentLine();
  });
  els.devEasyCopy.addEventListener("change", () => {
    state.devEasyCopy = els.devEasyCopy.checked;
    updateDevPanel();
    renderCurrentLine();
  });
  els.devBackButton.addEventListener("change", () => {
    state.devBackButton = els.devBackButton.checked;
    updateDevPanel();
  });
  els.devSkipButton.addEventListener("change", () => {
    state.devSkipButton = els.devSkipButton.checked;
    updateDevPanel();
  });
  els.devQuickRestoreInputs.addEventListener("change", () => {
    state.devQuickRestoreInputs = els.devQuickRestoreInputs.checked;
    updateDevPanel();
  });
  els.devDisableTypewriter.addEventListener("change", () => {
    state.devDisableTypewriter = els.devDisableTypewriter.checked;
    renderCurrentLine();
    updateDevPanel();
  });
  els.quickRestoreCopyBtn.addEventListener("click", event => {
    event.stopPropagation();
    copyQuickRestoreString();
  });
  els.quickRestoreInput.addEventListener("paste", () => {
    window.clearTimeout(quickRestoreInputTimer);
    quickRestoreInputTimer = window.setTimeout(() => restoreQuickRestoreInput({ showInvalidToast: true }), 0);
  });
  els.quickRestoreInput.addEventListener("input", () => {
    window.clearTimeout(quickRestoreInputTimer);
    quickRestoreInputTimer = window.setTimeout(() => restoreQuickRestoreInput(), 160);
  });
  els.devScores.addEventListener("input", event => {
    const input = event.target.closest("[data-dev-feeling-key]");
    if (!input || input.value === "") return;
    setFeelingScore(input.dataset.devFeelingKey, input.value);
  });
  els.devScores.addEventListener("change", event => {
    const input = event.target.closest("[data-dev-feeling-key]");
    if (!input) return;
    const score = setFeelingScore(input.dataset.devFeelingKey, input.value);
    input.value = score;
  });
  els.devScores.addEventListener("click", event => {
    const brosButton = event.target.closest("[data-dev-bros-key]");
    if (brosButton) {
      event.preventDefault();
      event.stopPropagation();
      els.devPanel.classList.remove("open");
      state.devPanelOpen = false;
      startDevBrothersReconciliation(brosButton.dataset.devBrosKey);
      return;
    }
    const button = event.target.closest("[data-dev-full-love-key]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    els.devPanel.classList.remove("open");
    state.devPanelOpen = false;
    startDevFullLoveScene(button.dataset.devFullLoveKey);
  });
  els.dialogueCopyBtn.addEventListener("click", event => {
    event.stopPropagation();
    copyCurrentDialogueLine();
  });
  els.skipBtn.addEventListener("click", event => {
    event.stopPropagation();
    skipCurrentInteraction();
  });
  els.skipToBtn.addEventListener("click", event => {
    event.stopPropagation();
    showDevSkipToPicker();
  });
  els.backBtn.addEventListener("click", event => {
    event.stopPropagation();
    goBackOneStep();
  });
  els.dayTransitionButton.addEventListener("click", startDayFromTransition);
  document.getElementById("gameScreen").addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    if (els.dayTransition.classList.contains("active")) return;
    if (event.target.closest("button, input, select, textarea, a, .dev-panel")) return;
    if (els.galleryOverlay.classList.contains("active")) return;
    if (completeDialogueTypewriter()) return;
    showNextDialogueLine();
  });
  document.addEventListener("pointerdown", () => { if (audioEngine.enabled) ensureAudio(); });
  window.addEventListener("keydown", event => {
    if (els.dayTransition.classList.contains("active")) {
      if (event.key === " " || event.key === "Enter") startDayFromTransition();
      return;
    }
    if (event.key === " " || event.key === "Enter") {
      if (!completeDialogueTypewriter()) showNextDialogueLine();
    }
    if (event.key === "Escape") els.galleryOverlay.classList.remove("active");
  });
}

function validateSceneEstablishingRules() {
  // Story guardrail for future edits:
  // every new location/background should start with at least one background-only
  // line. Character sprites should appear later via an explicit third tuple item.
  Object.entries(scenes).forEach(([sceneId, scene]) => {
    if (isContinuationScene(sceneId)) return;
    let lines;
    try {
      lines = resolveValue(scene.lines);
    } catch (error) {
      return;
    }
    if (!Array.isArray(lines) || !lines.length) return;
    if (lines[0] && lines[0].length > 2) {
      console.warn(`Scene ${sceneId} starts with a character cue; add an establishing line first.`);
    }
  });
}

function isContinuationScene(sceneId) {
  // These are follow-up beats inside the same setting, not fresh arrivals.
  return /(_two|_three|_wrap|_wrapup|_reaction|_prompt|_pause|_departure|_rain|_cabin|_shirt|_good|_bad|_fade|_return|_sleeping_bag|_line|_exit)$/.test(sceneId) || sceneId === "choice_reaction";
}

function startGame() {
  if (els.startGameTransition?.classList.contains("active")) return;
  els.startGameTransition.classList.remove("leaving");
  els.startGameTransition.classList.add("active");
  window.clearTimeout(startGameTransitionTimer);
  startGameTransitionTimer = window.setTimeout(() => {
    beginNewGameAfterStartFade();
  }, 760);
}

function beginNewGameAfterStartFade() {
  state = clone(defaultState);
  clearDevHistory();
  audioEngine.enabled = state.audioEnabled;
  ensureAudio();
  shouldAnimateNextDialogueEntry = true;
  nextDialogueEntryDelayMs = 720;
  nextDialogueRevealDelayMs = 1540;
  showScreen("gameScreen");
  renderScene("intro_bus_ride", { skipEstablishingPause: true, suppressSceneSfx: true });
  els.startGameTransition.classList.add("leaving");
  startGameTransitionTimer = window.setTimeout(() => {
    els.startGameTransition.classList.remove("active", "leaving");
  }, 720);
}

function completeLegacySetup() {
  const name = document.getElementById("playerName").value.trim();
  if (!name) {
    document.getElementById("playerName").focus();
    toast("Enter your name to begin.");
    return;
  }
  state.playerName = name;
  audioEngine.enabled = state.audioEnabled;
  ensureAudio();
  shouldAnimateNextDialogueEntry = true;
  nextDialogueEntryDelayMs = 0;
  nextDialogueRevealDelayMs = 820;
  showScreen("gameScreen");
  renderScene("intro_natai_checkin");
}

function showNameEntry() {
  const input = document.getElementById("playerName");
  input.value = state.playerName === defaultState.playerName ? "" : state.playerName;
  updateBeginButton();
  showScreen("setupScreen");
  window.setTimeout(() => input.focus(), 980);
}

function getSceneLine(sceneId, lineIndex = 0) {
  const scene = scenes[sceneId];
  if (!scene) return ["narrator", ""];
  const lines = resolveValue(scene.lines) || [];
  return lines[lineIndex] || ["narrator", ""];
}

function getLineVisualState(line) {
  const lineOptions = line[3] || {};
  return {
    characterCue: line.length > 2 ? line[2] : null,
    propCue: lineOptions.propCue || null,
    lineOptions
  };
}

function getCueSpriteIdentity(cue) {
  const { key, expression } = parseCharacterCue(cue);
  const character = characters[key];
  const sprite = character && resolveSprite(character, expression);
  if (!character || !sprite) return null;
  return new URL(sprite, window.location.href).href;
}

function shouldPreserveVisualAcrossSceneChange(currentCue, nextCue, lineOptions, element, fadeOutOptionKey) {
  if (!element || element.classList.contains("hidden")) return false;
  if (lineOptions?.[fadeOutOptionKey]) return false;
  const currentIdentity = getCueSpriteIdentity(currentCue);
  if (!currentIdentity) return false;
  return currentIdentity === getCueSpriteIdentity(nextCue);
}

function getSceneVisualContinuity(previousSceneId, previousLineIndex, nextSceneId) {
  const previousLine = getSceneLine(previousSceneId, previousLineIndex);
  const nextLine = getSceneLine(nextSceneId, 0);
  const previousVisualState = getLineVisualState(previousLine);
  const nextVisualState = getLineVisualState(nextLine);
  return {
    preserveSprite: shouldPreserveVisualAcrossSceneChange(
      previousVisualState.characterCue,
      nextVisualState.characterCue,
      previousVisualState.lineOptions,
      els.sprite,
      "fadeOutSprite"
    ),
    preserveProp: shouldPreserveVisualAcrossSceneChange(
      previousVisualState.propCue,
      nextVisualState.propCue,
      previousVisualState.lineOptions,
      els.propSprite,
      "fadeOutProp"
    )
  };
}

function renderScene(sceneId, options = {}) {
  const scene = scenes[sceneId];
  if (!scene) throw new Error("Missing scene: " + sceneId);
  window.clearTimeout(lineAutoAdvanceTimer);
  window.clearTimeout(lineAmbientTimer);
  window.clearTimeout(startGameTransitionTimer);
  window.clearTimeout(dialogueEntryTimer);
  clearDialogueTypewriter();
  clearChoiceTimers();
  els.gameScreen.classList.remove("dev-skip-picker-active");
  const previousSceneId = state.sceneId;
  const previousLineIndex = state.lineIndex;
  state.sceneId = sceneId;
  state.lineIndex = options.keepLine ? state.lineIndex : 0;
  if (!options.keepLine) state.lineAudioCueKey = null;
  if (scene.onEnter && !options.keepLine) scene.onEnter();
  if (!options.keepLine) {
    const continuity = getSceneVisualContinuity(previousSceneId, previousLineIndex, sceneId);
    if (!continuity.preserveSprite) updateSprite(null);
    if (!continuity.preserveProp) updatePropSprite(null);
  }
  const background = resolveValue(scene.background) || { location: "lodge", time: state.timeOfDay };
  updateBackdrop(background);
  updateAmbient(scene.ambient || null);
  updateAudioTheme(background.location, null, {
    musicKey: resolveValue(scene.music) || null,
    silenceMusic: Boolean(scene.silenceMusic)
  });
  updateDevPanel();
  renderCurrentLine();
}

function renderCurrentLine() {
  window.clearTimeout(lineAutoAdvanceTimer);
  window.clearTimeout(lineAmbientTimer);
  clearDialogueTypewriter();
  clearLineTransition();
  clearChoiceTimers();
  const scene = scenes[state.sceneId];
  const lines = resolveValue(scene.lines) || [];
  const line = lines[state.lineIndex] || ["narrator", ""];
  const lineOptions = line[3] || {};
  const deferRevealEffects = shouldDeferLineRevealEffects(lineOptions);
  const deferTransitionPresentation = shouldDeferLineTransitionPresentation(lineOptions);
  const waitForAdvanceToStartTransition = shouldWaitForAdvanceToStartLineTransition(lineOptions);
  const speakerKey = line[0] || "narrator";
  const speaker = characters[speakerKey] || characters.narrator;
  // Establishing shots are a hard story rule: a character sprite only appears
  // when the current dialogue line explicitly provides a character cue.
  // Do not fall back to scene.character here, or new locations will feel like
  // the player teleported directly into someone's face.
  const characterCue = line.length > 2 ? line[2] : null;
  updatePropSprite(lineOptions.propCue || null);
  updateSprite(characterCue);
  els.speakerName.textContent = resolveName(speaker);
  els.speakerName.style.color = speaker.color || "#f3b85b";
  els.sceneLabel.textContent = resolveValue(scene.label) || state.sceneId;
  applyLinePresentation(lineOptions, {
    deferTransitionEffects: deferTransitionPresentation,
    deferRevealEffects
  });
  applyDialogueEntryAnimation(lineOptions);
  scheduleLineAmbientCue(lineOptions);
  if (!deferRevealEffects) startLineRevealEffects(lineOptions);
  updateCopyControls();
  els.choices.innerHTML = "";
  els.choices.classList.remove("has-choices");
  els.choices.style.removeProperty("--choices-bottom");
  els.gameScreen.classList.remove("choices-active");
  revealDialogueLine(formatText(line[1] || ""), lineOptions, {
    speakerKey,
    onComplete: () => {
      if (deferRevealEffects) startLineRevealEffects(lineOptions);
      if (deferTransitionPresentation && !waitForAdvanceToStartTransition) {
        startLineTransitionPresentation(lineOptions);
      }
      if (waitForAdvanceToStartTransition) {
        queueLineTransition(lineOptions);
        return;
      }
      if (state.lineIndex >= lines.length - 1) renderChoices(resolveValue(scene.choices) || []);
      if (lineOptions.autoAdvanceMs) {
        lineAutoAdvanceTimer = window.setTimeout(() => showNextDialogueLine({ suppressSfx: Boolean(lineOptions.suppressAdvanceSfx) }), lineOptions.autoAdvanceMs);
      }
    }
  });
}

function applyDialogueEntryAnimation(lineOptions = {}) {
  window.clearTimeout(dialogueEntryTimer);
  els.dialogueBox.classList.remove("dialogue-first-enter", "dialogue-entry-pending");
  if (!shouldAnimateNextDialogueEntry) return;
  shouldAnimateNextDialogueEntry = false;
  if (lineOptions.dialogueHidden) return;
  const entryDelay = nextDialogueEntryDelayMs;
  nextDialogueEntryDelayMs = 0;
  if (entryDelay > 0) {
    els.dialogueBox.classList.add("dialogue-entry-pending");
    dialogueEntryTimer = window.setTimeout(() => {
      els.dialogueBox.classList.remove("dialogue-entry-pending");
      void els.dialogueBox.offsetWidth;
      els.dialogueBox.classList.add("dialogue-first-enter");
    }, entryDelay);
    return;
  }
  void els.dialogueBox.offsetWidth;
  els.dialogueBox.classList.add("dialogue-first-enter");
}

function revealDialogueLine(text, lineOptions = {}, options = {}) {
  const fullText = String(text || "");
  reserveDialogueLineHeight(fullText, lineOptions);
  const shouldType = !state.devDisableTypewriter && !lineOptions.dialogueHidden && fullText.length > 0;
  if (!shouldType) {
    els.lineText.textContent = fullText;
    finishDialogueReveal(options.onComplete, lineOptions);
    return;
  }

  const glyphs = Array.from(fullText);
  dialogueTypewriterState = {
    characters: glyphs,
    glyphNodes: renderPendingDialogueGlyphs(glyphs),
    fullText,
    index: 0,
    complete: false,
    speakerKey: options.speakerKey || "narrator",
    lineOptions,
    onComplete: options.onComplete
  };
  const revealDelay = nextDialogueRevealDelayMs;
  nextDialogueRevealDelayMs = 0;
  dialogueTypewriterTimer = window.setTimeout(tickDialogueTypewriter, revealDelay + DIALOGUE_TYPEWRITER.startDelayMs);
}

function renderPendingDialogueGlyphs(glyphs) {
  els.lineText.replaceChildren();
  return glyphs.map(glyph => {
    const span = document.createElement("span");
    span.className = "dialogue-glyph pending";
    span.textContent = glyph;
    els.lineText.appendChild(span);
    return span;
  });
}

function reserveDialogueLineHeight(fullText, lineOptions = {}) {
  if (lineOptions.dialogueHidden || !fullText) {
    els.lineText.style.removeProperty("min-height");
    return;
  }

  const previousText = els.lineText.textContent;
  const previousVisibility = els.lineText.style.visibility;
  els.lineText.style.visibility = "hidden";
  els.lineText.textContent = fullText;
  const finalHeight = Math.ceil(els.lineText.scrollHeight);
  els.lineText.style.minHeight = `${Math.max(82, finalHeight)}px`;
  els.lineText.textContent = previousText;
  els.lineText.style.visibility = previousVisibility;
}

function tickDialogueTypewriter() {
  const typewriter = dialogueTypewriterState;
  if (!typewriter || typewriter.complete) return;
  if (typewriter.index >= typewriter.characters.length) {
    finishDialogueReveal(typewriter.onComplete, typewriter.lineOptions);
    return;
  }

  const character = typewriter.characters[typewriter.index];
  const glyphNode = typewriter.glyphNodes[typewriter.index];
  typewriter.index += 1;
  if (glyphNode) glyphNode.classList.remove("pending");
  dialogueTypewriterTimer = window.setTimeout(tickDialogueTypewriter, dialogueCharacterDelay(typewriter, character));
}

function dialogueCharacterDelay(typewriter, character) {
  const previousCharacter = typewriter.characters[typewriter.index - 2] || "";
  const nextCharacter = typewriter.characters[typewriter.index] || "";
  if (character === "\n") return DIALOGUE_TYPEWRITER.newlinePauseMs;
  if (character === " ") return DIALOGUE_TYPEWRITER.spaceDelayMs;
  if (character === "." && (previousCharacter === "." || nextCharacter === ".")) {
    return nextCharacter === "." ? DIALOGUE_TYPEWRITER.ellipsisStepMs : DIALOGUE_TYPEWRITER.ellipsisPauseMs;
  }
  if (character === ",") return DIALOGUE_TYPEWRITER.commaPauseMs;
  if (character === ";" || character === ":") return DIALOGUE_TYPEWRITER.semicolonPauseMs;
  if (character === "-" || character === "–" || character === "—") return DIALOGUE_TYPEWRITER.dashPauseMs;
  if (character === "?" || character === "!") return DIALOGUE_TYPEWRITER.questionPauseMs;
  if (character === ".") return DIALOGUE_TYPEWRITER.sentencePauseMs;
  if (character === ")" || character === "]" || character === "}" || character === "\"" || character === "'") return 16;
  return dialogueLetterDelay(typewriter);
}

function dialogueLetterDelay(typewriter) {
  const longLineAdjustment = typewriter.characters.length > 130 ? DIALOGUE_TYPEWRITER.longLineBaseDelayMs : DIALOGUE_TYPEWRITER.baseDelayMs;
  const speakerAdjustment = typewriter.speakerKey === "narrator" ? -2 : typewriter.speakerKey === "player" ? 1 : 0;
  const cadence = ((typewriter.index * 7) + typewriter.characters.length) % 9;
  const jitter = cadence < 2 ? -4 : cadence > 6 ? 5 : 0;
  return Math.max(12, longLineAdjustment + speakerAdjustment + jitter);
}

function completeDialogueTypewriter() {
  const typewriter = dialogueTypewriterState;
  if (!typewriter || typewriter.complete) return false;
  window.clearTimeout(dialogueTypewriterTimer);
  revealAllDialogueGlyphs(typewriter);
  typewriter.index = typewriter.characters.length;
  finishDialogueReveal(typewriter.onComplete, typewriter.lineOptions);
  return true;
}

function revealAllDialogueGlyphs(typewriter) {
  typewriter.glyphNodes.forEach(glyphNode => glyphNode.classList.remove("pending"));
}

function finishDialogueReveal(onComplete, lineOptions = {}) {
  const typewriter = dialogueTypewriterState;
  if (typewriter) typewriter.complete = true;
  window.clearTimeout(dialogueTypewriterTimer);
  dialogueTypewriterTimer = null;
  if (onComplete) onComplete();
  setDialogueReadyMarker(shouldShowDialogueAdvanceMarker(lineOptions));
}

function clearDialogueTypewriter() {
  window.clearTimeout(dialogueTypewriterTimer);
  dialogueTypewriterTimer = null;
  dialogueTypewriterState = null;
  setDialogueReadyMarker(false);
}

function hasLineTransitionPresentation(options = {}) {
  return Boolean(
    options.dialogueFadeOut ||
    options.fadeOutSprite ||
    options.fadeOutProp ||
    options.fadeOutMusicUntilScene
  );
}

function hasLineRevealEffects(options = {}) {
  return Boolean(
    options.screenFlash ||
    options.audio
  );
}

function shouldDeferLineRevealEffects(options = {}) {
  return !options.dialogueHidden && hasLineRevealEffects(options);
}

function shouldDeferLineTransitionPresentation(options = {}) {
  return !options.dialogueHidden && hasLineTransitionPresentation(options);
}

function shouldWaitForAdvanceToStartLineTransition(options = {}) {
  return shouldDeferLineTransitionPresentation(options) && Boolean(options.autoAdvanceMs);
}

function queueLineTransition(lineOptions = {}) {
  activeLineTransition = {
    sceneId: state.sceneId,
    lineIndex: state.lineIndex,
    lineOptions,
    started: false
  };
}

function clearLineTransition() {
  activeLineTransition = null;
}

function startQueuedLineTransition(options = {}) {
  const transition = activeLineTransition;
  if (!transition) return false;
  if (transition.sceneId !== state.sceneId || transition.lineIndex !== state.lineIndex) {
    clearLineTransition();
    return false;
  }
  if (transition.started) return !options.transitionAutoAdvance;

  transition.started = true;
  setDialogueReadyMarker(false);
  startLineTransitionPresentation(transition.lineOptions);

  const autoAdvanceMs = Number(transition.lineOptions.autoAdvanceMs) || 0;
  if (autoAdvanceMs > 0) {
    lineAutoAdvanceTimer = window.setTimeout(() => {
      clearLineTransition();
      showNextDialogueLine({
        forceAdvance: true,
        transitionAutoAdvance: true,
        suppressSfx: Boolean(transition.lineOptions.suppressAdvanceSfx)
      });
    }, autoAdvanceMs);
    return true;
  }

  clearLineTransition();
  return false;
}

function setDialogueReadyMarker(isReady) {
  els.dialogueBox.classList.toggle("ready-to-advance", Boolean(isReady));
}

function shouldShowDialogueAdvanceMarker(lineOptions = {}) {
  if (lineOptions.dialogueHidden) return false;
  if (shouldWaitForAdvanceToStartLineTransition(lineOptions)) return true;
  if (lineOptions.autoAdvanceMs) return false;
  const scene = scenes[state.sceneId];
  if (!scene) return false;
  const lines = resolveValue(scene.lines) || [];
  if ((lines[state.lineIndex] || [])[1] === "") return false;
  if (state.lineIndex < lines.length - 1) return true;
  const choices = resolveValue(scene.choices) || [];
  return choices.length === 0 && Boolean(scene.nextAction || scene.next);
}

function showNextDialogueLine(options = {}) {
  if (!options.forceAdvance && completeDialogueTypewriter()) return;
  if (!options.transitionAutoAdvance && startQueuedLineTransition(options)) return;
  window.clearTimeout(lineAutoAdvanceTimer);
  window.clearTimeout(lineAmbientTimer);
  clearDialogueTypewriter();
  clearLineTransition();
  const scene = scenes[state.sceneId];
  if (!scene) return;
  const lines = resolveValue(scene.lines) || [];
  const currentLine = lines[state.lineIndex] || [];
  const currentLineOptions = currentLine[3] || {};
  if (currentLineOptions.stopOverlayAmbientOnAdvance) stopOverlayAmbient();
  if (state.lineIndex >= lines.length - 1) {
    if (scene.nextAction) {
      pushDevHistory();
      if (!options.suppressSfx) playSfx("advance");
      scene.nextAction();
    } else if (scene.next) {
      pushDevHistory();
      if (!options.suppressSfx) playSfx("advance");
      renderScene(scene.next);
    }
    return;
  }
  pushDevHistory();
  state.lineIndex += 1;
  if (!options.suppressSfx) playSfx("advance");
  renderCurrentLine();
}

function applyLinePresentation(options = {}, config = {}) {
  els.gameScreen.classList.toggle("dialogue-hidden", Boolean(options.dialogueHidden));
  els.gameScreen.classList.remove("dialogue-slow-fade", "dialogue-fade-out", "sprite-drift-up", "sleeping-bag-rise");
  els.gameScreen.classList.toggle("dialogue-slow-fade", Boolean(options.dialogueSlowFade));
  if (!config.deferTransitionEffects) startLineTransitionPresentation(options);
  els.gameScreen.classList.remove("screen-flash");
  if (!config.deferRevealEffects && options.screenFlash) {
    void els.gameScreen.offsetWidth;
    els.gameScreen.classList.add("screen-flash");
  }
}

function startLineRevealEffects(options = {}) {
  if (options.screenFlash) {
    void els.gameScreen.offsetWidth;
    els.gameScreen.classList.add("screen-flash");
  }
  playLineAudioCue(options);
}

function startLineTransitionPresentation(options = {}) {
  els.gameScreen.classList.toggle("dialogue-fade-out", Boolean(options.dialogueFadeOut));
  els.gameScreen.classList.toggle("sprite-drift-up", Boolean(options.spriteDriftUp));
  els.gameScreen.classList.toggle("sleeping-bag-rise", Boolean(options.sleepingBagRise));
  if (options.fadeOutSprite) {
    requestAnimationFrame(() => els.sprite.classList.add("hidden"));
  }
  if (options.fadeOutProp) {
    requestAnimationFrame(() => els.propSprite.classList.add("hidden"));
  }
  if (options.fadeOutMusicUntilScene) fadeOutMusicUntilScene(options.fadeOutMusicUntilScene);
}

function scheduleLineAmbientCue(options = {}) {
  if (options.startAmbient) {
    const delay = Number(options.startAmbientAfterMs) || 0;
    lineAmbientTimer = window.setTimeout(() => {
      updateAmbient(options.startAmbient);
    }, delay);
    return;
  }
  if (!options.startOverlayAmbient) return;
  const delay = Number(options.startOverlayAmbientAfterMs) || 0;
  lineAmbientTimer = window.setTimeout(() => {
    startOverlayAmbient(options.startOverlayAmbient);
  }, delay);
}

function renderChoices(choices) {
  clearChoiceTimers();
  els.choices.innerHTML = "";
  els.choices.classList.toggle("has-choices", choices.length > 0);
  els.gameScreen.classList.toggle("choices-active", choices.length > 0);
  if (choices.length > 0) {
    updatePropSprite(null);
    const dialogueHeight = els.dialogueBox.getBoundingClientRect().height;
    els.choices.style.setProperty("--choices-bottom", `${Math.ceil(dialogueHeight + 28)}px`);
  }
  choices.forEach(choice => {
    const wrap = document.createElement("div");
    wrap.className = "choice-wrap";
    const button = document.createElement("button");
    button.className = `choice${choice.className ? ` ${choice.className}` : ""}`;
    const preview = state.devChoicePreview ? choiceImpactHtml(choice) : "";
    const icon = choice.icon ? `<span class="choice-icon" aria-hidden="true">${escapeHtml(choice.icon)}</span>` : "";
    const timer = choice.timedDefault ? `<span class="choice-timer" data-choice-timer></span>` : "";
    button.innerHTML = `${icon}<span class="choice-label">${escapeHtml(choice.label)}</span>${timer}${preview}`;
    button.addEventListener("click", event => {
      event.stopPropagation();
      applyChoiceEffects(choice);
    });
    wrap.appendChild(button);
    if (state.devEasyCopy) {
      const copyButton = createCopyButton(choice.label, "Copy choice");
      wrap.appendChild(copyButton);
    }
    els.choices.appendChild(wrap);
  });
  const defaultChoice = choices.find(choice => choice.timedDefault);
  if (defaultChoice) startTimedChoice(defaultChoice);
}

function clearChoiceTimers() {
  window.clearTimeout(choiceAutoSelectTimer);
  window.clearInterval(choiceCountdownTimer);
  choiceAutoSelectTimer = null;
  choiceCountdownTimer = null;
}

function startTimedChoice(choice) {
  const duration = Number(choice.timeoutMs) || 5000;
  const startedAt = Date.now();
  const update = () => {
    const remainingMs = Math.max(0, duration - (Date.now() - startedAt));
    const seconds = Math.ceil(remainingMs / 1000);
    els.choices.querySelectorAll("[data-choice-timer]").forEach(timer => {
      timer.textContent = `Auto-selecting in ${seconds}`;
    });
    els.choices.querySelectorAll(".timed-default").forEach(button => {
      button.style.setProperty("--timer-progress", `${(remainingMs / duration) * 100}%`);
    });
  };
  update();
  choiceCountdownTimer = window.setInterval(update, 180);
  choiceAutoSelectTimer = window.setTimeout(() => {
    if (!els.choices.classList.contains("has-choices")) return;
    applyChoiceEffects(choice);
  }, duration);
}

function createCopyButton(text, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "copy-btn";
  button.title = label;
  button.setAttribute("aria-label", label);
  button.innerHTML = copyIconSvg();
  button.addEventListener("click", event => {
    event.stopPropagation();
    copyText(text);
  });
  return button;
}

function copyIconSvg() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
}

function applyChoiceEffects(choice) {
  clearChoiceTimers();
  pushDevHistory();
  playSfx("choice");
  if (choice.feelings) addFeelings(choice.feelings);
  if (choice.flags) Object.assign(state.flags, choice.flags);
  if (choice.setRoute) state.selectedRoute = choice.setRoute;
  if (choice.unlockCG) unlockCG(choice.unlockCG);
  if (choice.fadeOutMusicUntilLocationChange) fadeOutMusicUntilLocationChange(choice.fadeOutMusicUntilLocationChange);
  if (choice.fadeOutMusicUntilScene) fadeOutMusicUntilScene(choice.fadeOutMusicUntilScene);
  if (choice.save) saveGame();
  updateDevPanel();
  if (choice.reaction && choice.next) {
    const currentScene = scenes[state.sceneId];
    state.choiceReactionLines = choice.reaction;
    state.choiceReactionNext = choice.next;
    state.choiceReactionBackground = resolveValue(currentScene.background);
    state.choiceReactionLabel = resolveValue(currentScene.label) || "Response";
    renderScene("choice_reaction");
    return;
  }
  if (choice.action) {
    choice.action(choice);
    return;
  }
  if (choice.next) renderScene(choice.next);
}

function startNewDay(options = {}) {
  state.timeOfDay = "daytime";
  state.pendingDestination = null;
  state.pendingEncounter = null;
  els.gameScreen.classList.add("day-transitioning");
  showDayTransition(state.day, {
    onStart: () => {
      setBackdropInstant({ location: "lodge", time: "daytime" });
      renderScene("day_wake", { suppressSceneSfx: true });
    }
  });
}

function copyCurrentDialogueLine() {
  const scene = scenes[state.sceneId];
  const lines = resolveValue(scene?.lines) || [];
  const line = lines[state.lineIndex] || ["narrator", ""];
  const speaker = characters[line[0]] || characters.narrator;
  copyText(`${resolveName(speaker)}: ${formatText(line[1] || "")}`);
}

function copyQuickRestoreString() {
  copyText(buildQuickRestoreString());
}

function buildQuickRestoreString() {
  const quickState = {};
  QUICK_RESTORE_STATE_KEYS.forEach(key => {
    quickState[key] = state[key] === undefined ? null : clone(state[key]);
  });
  quickState.sceneId = normalizeSceneId(quickState.sceneId || defaultState.sceneId);
  quickState.lineIndex = Math.max(0, Number(quickState.lineIndex) || 0);
  return `${QUICK_RESTORE_PREFIX}${base64UrlEncode(JSON.stringify({
    version: 1,
    state: quickState
  }))}`;
}

function restoreQuickRestoreInput(options = {}) {
  const value = els.quickRestoreInput.value.trim();
  if (!value) return;
  if (!value.startsWith(QUICK_RESTORE_PREFIX)) {
    if (options.showInvalidToast) toast("Quick restore string not recognized.");
    return;
  }
  if (restoreQuickRestoreString(value)) {
    els.quickRestoreInput.value = "";
  } else if (options.showInvalidToast) {
    toast("Quick restore string could not be restored.");
  }
}

function restoreQuickRestoreString(value) {
  try {
    const raw = String(value || "").trim();
    if (!raw.startsWith(QUICK_RESTORE_PREFIX)) return false;
    const decoded = JSON.parse(base64UrlDecode(raw.slice(QUICK_RESTORE_PREFIX.length)));
    const quickState = decoded?.state && typeof decoded.state === "object" ? decoded.state : decoded;
    restoreStateSnapshot(quickState, {
      successToast: "Quick restore loaded.",
      failureToast: "Quick restore string could not be restored.",
      preserveDevSettings: true
    });
    return true;
  } catch (error) {
    return false;
  }
}

function copyText(text) {
  const cleanText = String(text || "").trim();
  if (!cleanText) return;
  const copied = navigator.clipboard?.writeText
    ? navigator.clipboard.writeText(cleanText)
    : fallbackCopyText(cleanText);
  Promise.resolve(copied)
    .then(() => toast("Copied."))
    .catch(() => {
      fallbackCopyText(cleanText);
      toast("Copied.");
    });
}

function pushDevHistory() {
  devHistory.push(clone(state));
  if (devHistory.length > DEV_HISTORY_LIMIT) devHistory.shift();
  updateDevPanel();
}

function clearDevHistory() {
  devHistory = [];
  updateDevPanel();
}

function goBackOneStep() {
  const previousState = devHistory.pop();
  if (!previousState) {
    toast("No previous step to go back to.");
    updateDevPanel();
    return;
  }

  window.clearTimeout(lineAutoAdvanceTimer);
  window.clearTimeout(startDayFromTransition.timer);
  window.clearTimeout(startGameTransitionTimer);
  window.clearTimeout(dialogueEntryTimer);
  clearDialogueTypewriter();
  clearChoiceTimers();
  showDayTransition.onStart = null;
  stopMusicLoop();
  if (els.dayTransition) {
    els.dayTransition.classList.remove("active", "leaving");
    els.dayTransition.setAttribute("aria-hidden", "true");
  }
  els.gameScreen.classList.remove("day-transitioning");
  state = previousState;
  renderScene(normalizeSceneId(state.sceneId || "intro_bus_ride"), { keepLine: true });
  playSfx("advance");
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function skipCurrentInteraction() {
  if (els.dayTransition.classList.contains("active")) {
    startDayFromTransition();
    return;
  }
  clearDialogueTypewriter();
  const startingBackground = currentBackgroundKey();
  pushDevHistory();
  playSfx("advance");

  for (let step = 0; step < 80; step += 1) {
    if (!skipOneStep()) {
      toast("No next setting found.");
      return;
    }
    if (els.dayTransition.classList.contains("active")) return;
    if (currentBackgroundKey() !== startingBackground) return;
  }

  toast("Skip stopped before finding a new setting.");
}

function showDevSkipToPicker() {
  if (els.dayTransition.classList.contains("active")) {
    startDayFromTransition();
    return;
  }
  pushDevHistory();
  state.choiceReactionBackground = resolveValue(scenes[state.sceneId]?.background) || { location: "lodge", time: state.timeOfDay };
  playSfx("advance");
  renderDevSkipToPicker();
}

function renderDevSkipToPicker() {
  const scene = scenes.dev_skip_to_picker;
  const background = resolveValue(scene.background);
  window.clearTimeout(lineAutoAdvanceTimer);
  window.clearTimeout(lineAmbientTimer);
  window.clearTimeout(dialogueEntryTimer);
  clearDialogueTypewriter();
  clearChoiceTimers();
  state.sceneId = "dev_skip_to_picker";
  state.lineIndex = 0;
  updateBackdrop(background);
  updateAmbient(scene.ambient || null);
  updateAudioTheme(background?.location || "lodge", null);
  updateSprite(null);
  updatePropSprite(null);
  els.gameScreen.classList.remove("dialogue-slow-fade", "dialogue-fade-out", "sprite-drift-up", "sleeping-bag-rise");
  els.gameScreen.classList.add("dev-skip-picker-active");
  els.dialogueBox.classList.remove("dialogue-first-enter", "dialogue-entry-pending", "ready-to-advance");
  els.lineText.textContent = "";
  els.lineText.style.removeProperty("min-height");
  els.sceneLabel.textContent = resolveValue(scene.label);
  updateCopyControls();
  updateDevPanel();
  renderChoices(resolveValue(scene.choices) || []);
}

function buildDevSkipToChoices() {
  const storyTargets = [
    { label: "Player Name Enter", action: startDevSkipToPlayerNameEntry },
    { label: "Sleep", action: startDevSkipToSleep }
  ];
  const locationTargets = Object.keys(backgroundCatalog)
    .filter(location => location !== "black")
    .flatMap(location => TIMES.map(time => ({
      label: `${SKIP_TO_LOCATION_LABELS[location] || location} - ${TIME_LABELS[time]}`,
      action: () => startDevSkipToSetting(location, time)
    })));
  return [...storyTargets, ...locationTargets];
}

function startDevSkipToPlayerNameEntry() {
  resetDevSkipToTransientState("daytime");
  state.day = 1;
  state.playerName = defaultState.playerName;
  state.sceneId = "intro_checkin_arrival";
  state.lineIndex = Math.max(0, (resolveValue(scenes.intro_checkin_arrival.lines) || []).length - 1);
  showScreen("gameScreen");
  renderScene("intro_checkin_arrival", { keepLine: true, skipEstablishingPause: true, suppressSceneSfx: true });
  toast("Skipped to player name entry.");
}

function startDevSkipToSleep() {
  resetDevSkipToTransientState("night");
  state.day = Math.max(1, Number(state.day) || 1);
  state.sceneId = "intro_first_night_lodge";
  state.lineIndex = Math.max(0, (resolveValue(scenes.intro_first_night_lodge.lines) || []).length - 1);
  showScreen("gameScreen");
  renderScene("intro_first_night_lodge", { keepLine: true, skipEstablishingPause: true, suppressSceneSfx: true });
  toast("Skipped to sleep.");
}

function startDevSkipToSetting(location, time) {
  resetDevSkipToTransientState(time);
  const destination = SKIP_TO_VISIT_DESTINATIONS[location];
  const sceneTarget = SKIP_TO_SCENE_TARGETS[location];

  if (destination) {
    state.pendingDestination = destination;
    state.selectedRoute = destination;
    state.visitTime = time;
    state.visitStartMood = relationshipState(destination);
    renderScene("main_visit_arrival");
    toast(`Skipped to ${SKIP_TO_LOCATION_LABELS[location]} at ${TIME_LABELS[time].toLowerCase()}.`);
    return;
  }

  if (location === "checkIn") {
    renderScene("dev_skip_to_checkin");
    toast(`Skipped to check-in at ${TIME_LABELS[time].toLowerCase()}.`);
    return;
  }

  if (location === "lodge") {
    renderScene("dev_skip_to_lodge");
    toast(`Skipped to the lodge at ${TIME_LABELS[time].toLowerCase()}.`);
    return;
  }

  if (sceneTarget) {
    const character = fullLoveSceneCharacterFor(sceneTarget);
    if (character) {
      state.pendingDestination = character;
      state.selectedRoute = character;
      state.pendingFullLoveScene = character;
      state.visitTime = time;
      state.visitStartMood = "high";
    }
    renderScene(sceneTarget);
    toast(`Skipped to ${SKIP_TO_LOCATION_LABELS[location] || location}.`);
    return;
  }

  state.choiceReactionBackground = { location, time };
  renderDevSkipToPicker();
}

function resetDevSkipToTransientState(time) {
  state.timeOfDay = time;
  state.pendingDestination = null;
  state.pendingEncounter = null;
  state.pendingFullLoveScene = null;
  state.visitTime = null;
  state.visitBeat = 0;
  state.visitStartMood = null;
  state.visitLastChoice = null;
  state.visitLastReaction = null;
  state.choiceReactionLines = null;
  state.choiceReactionNext = null;
  state.choiceReactionBackground = null;
  state.choiceReactionLabel = null;
}

function fullLoveSceneCharacterFor(sceneId) {
  const entry = Object.entries(fullLoveScenes).find(([, config]) => config.entryScene === sceneId);
  if (entry) return entry[0];
  if (sceneId.includes("_jack_")) return "jack";
  if (sceneId.includes("_caleb_")) return "caleb";
  if (sceneId.includes("_sierra_")) return "sierra";
  if (sceneId.includes("_natai_")) return "natai";
  if (sceneId.includes("_dakota_")) return "dakota";
  return null;
}

function skipOneStep() {
  const scene = scenes[state.sceneId];
  if (!scene) return false;
  const lines = resolveValue(scene.lines) || [];
  if (state.lineIndex < lines.length - 1) {
    state.lineIndex = lines.length - 1;
    renderCurrentLine();
    return true;
  }

  if (state.sceneId === "choice_reaction" || state.sceneId === "checkin_travel_event") {
    scene.nextAction();
    return true;
  }
  if (state.sceneId === "main_visit_arrival" || state.sceneId === "main_visit_prompt" || state.sceneId === "main_visit_reaction") {
    completeVisit();
    return true;
  }
  if (state.sceneId === "main_visit_wrapup") {
    completeVisit();
    return true;
  }
  if (scene.nextAction) {
    scene.nextAction();
    return true;
  }
  if (scene.next) {
    renderScene(scene.next);
    return true;
  }

  const choices = resolveValue(scene.choices) || [];
  const nextTargets = [...new Set(choices.map(choice => choice.next).filter(Boolean))];
  if (nextTargets.length === 1) {
    renderScene(nextTargets[0]);
    return true;
  }
  const firstActionChoice = choices.find(choice => choice.action && !choice.feelings);
  if (firstActionChoice) {
    firstActionChoice.action(firstActionChoice);
    return true;
  }

  return false;
}

function currentBackgroundKey() {
  const scene = scenes[state.sceneId];
  const background = resolveBackground(resolveValue(scene?.background));
  return `${background.location || "lodge"}.${background.time || state.timeOfDay || "daytime"}`;
}

function loveInterestChoices() {
  return LOVE_INTEREST_KEYS.map(key => {
    const fullLoveAvailable = isFullLoveSceneAvailable(key);
    return {
      label: `Visit ${characters[key].shortName} at ${characters[key].park}.`,
      icon: fullLoveAvailable ? "♥" : "",
      className: fullLoveAvailable ? "full-love-choice" : "",
      action: () => startTravel(key)
    };
  });
}

function startTravel(destination) {
  state.pendingDestination = destination;
  state.selectedRoute = destination;
  if (shouldStartBrotherReconciliation()) {
    state.pendingEncounter = null;
    renderScene("brothers_reconciliation_start");
    return;
  }
  if (isFullLoveSceneAvailable(destination)) {
    startFullLoveScene(destination);
    return;
  }
  if (state.timeOfDay !== "night" && Math.random() < 0.5) {
    state.pendingEncounter = rollCheckInEvent(destination);
    renderScene("checkin_travel_event");
    return;
  }
  continueToPendingDestination();
}

function continueToPendingDestination() {
  state.visitTime = state.timeOfDay;
  state.visitBeat = 0;
  state.visitStartMood = relationshipState(state.pendingDestination);
  state.visitLastChoice = null;
  state.visitLastReaction = null;
  renderScene("main_visit_arrival");
}

function startFullLoveScene(character) {
  const config = fullLoveScenes[character];
  state.pendingFullLoveScene = character;
  state.pendingEncounter = null;
  state.visitTime = state.timeOfDay;
  state.visitBeat = 0;
  state.visitStartMood = "high";
  state.visitLastChoice = null;
  state.visitLastReaction = null;
  renderScene(config.entryScene);
}

function startDevFullLoveScene(character) {
  const config = fullLoveScenes[character];
  if (!config) return;
  state.pendingDestination = character;
  state.selectedRoute = character;
  state.pendingFullLoveScene = character;
  state.pendingEncounter = null;
  state.timeOfDay = config.times?.[0] || state.timeOfDay || "night";
  state.visitTime = state.timeOfDay;
  state.visitBeat = 0;
  state.visitStartMood = "high";
  state.visitLastChoice = null;
  state.visitLastReaction = null;
  state.choiceReactionLines = null;
  state.choiceReactionNext = null;
  state.choiceReactionBackground = null;
  state.choiceReactionLabel = null;
  renderScene(config.entryScene);
  toast(`${characters[character].shortName}'s full love scene loaded.`);
}

function startDevBrothersReconciliation(firstCharacter) {
  if (!["dakota", "natai"].includes(firstCharacter)) return;
  state.pendingDestination = null;
  state.selectedRoute = null;
  state.pendingFullLoveScene = null;
  state.pendingEncounter = null;
  state.timeOfDay = "daytime";
  state.visitTime = null;
  state.visitBeat = 0;
  state.visitStartMood = null;
  state.visitLastChoice = null;
  state.visitLastReaction = null;
  state.choiceReactionLines = null;
  state.choiceReactionNext = null;
  state.choiceReactionBackground = null;
  state.choiceReactionLabel = null;
  state.flags.brothersReconciled = false;
  state.flags.brotherGoodFirst = firstCharacter;
  state.flags.dakotaFullLoveGood = firstCharacter === "dakota";
  state.flags.nataiFullLoveGood = firstCharacter === "natai";
  renderScene("brothers_reconciliation_start");
  toast(`${characters[firstCharacter].shortName}'s reconciliation variant loaded.`);
}

function completeFullLoveScene() {
  const completedTime = state.visitTime || state.timeOfDay;
  state.pendingFullLoveScene = null;
  state.pendingDestination = null;
  state.visitTime = null;
  state.visitBeat = 0;
  state.visitStartMood = null;
  state.visitLastChoice = null;
  state.visitLastReaction = null;
  if (completedTime === "daytime") {
    renderScene("transition_to_sunset_checkin");
  } else if (completedTime === "sunset") {
    renderScene("transition_to_night_checkin");
  } else {
    renderScene("night_lodge_return");
  }
}

function completeSierraFullLoveMorning() {
  state.pendingFullLoveScene = null;
  state.pendingDestination = null;
  state.visitTime = null;
  state.visitBeat = 0;
  state.visitStartMood = null;
  state.visitLastChoice = null;
  state.visitLastReaction = null;
  state.day += 1;
  startNewDay();
}

function completeNataiFullLoveMorning() {
  state.pendingFullLoveScene = null;
  state.pendingDestination = null;
  state.visitTime = null;
  state.visitBeat = 0;
  state.visitStartMood = null;
  state.visitLastChoice = null;
  state.visitLastReaction = null;
  state.day += 1;
  startNewDay();
}

function completeDakotaFullLoveMorning() {
  state.pendingFullLoveScene = null;
  state.pendingDestination = null;
  state.visitTime = null;
  state.visitBeat = 0;
  state.visitStartMood = null;
  state.visitLastChoice = null;
  state.visitLastReaction = null;
  state.day += 1;
  startNewDay({ fadeBackdropFromCurrent: true });
}

function shouldStartBrotherReconciliation() {
  if (state.flags?.brothersReconciled) return false;
  return Boolean(state.flags?.dakotaFullLoveGood || state.flags?.nataiFullLoveGood);
}

function completeBrotherReconciliation() {
  state.flags.brothersReconciled = true;
  addFeelings({ dakota: 3, natai: 3 });
  unlockCG("brothersReconciled");
  if (state.pendingDestination) {
    if (isFullLoveSceneAvailable(state.pendingDestination)) {
      startFullLoveScene(state.pendingDestination);
      return;
    }
    continueToPendingDestination();
    return;
  }
  renderScene("day_wake");
}

function completeJackFullLoveNight() {
  state.day += 1;
  renderScene("full_love_jack_sleep_line_fade", { suppressSceneSfx: true });
}

function completeJackFullLoveMorning() {
  state.pendingFullLoveScene = null;
  state.pendingDestination = null;
  state.visitTime = null;
  state.visitBeat = 0;
  state.visitStartMood = null;
  state.visitLastChoice = null;
  state.visitLastReaction = null;
  startNewDay();
}

function completeVisit() {
  const completedTime = state.visitTime || state.timeOfDay;
  state.visitTime = null;
  state.visitBeat = 0;
  state.visitStartMood = null;
  state.visitLastChoice = null;
  state.visitLastReaction = null;
  if (completedTime === "daytime") {
    renderScene("transition_to_sunset_checkin");
  } else if (completedTime === "sunset") {
    renderScene("transition_to_night_checkin");
  } else {
    renderScene("night_lodge_return");
  }
}

function isFullLoveSceneAvailable(character) {
  const config = fullLoveScenes[character];
  if (!config) return false;
  if (state.flags?.[config.completedFlag]) return false;
  if ((state.feelings[character] ?? 0) < config.requiredFeeling) return false;
  return config.times.includes(state.timeOfDay);
}

function hasImplementedFullLoveScene(character) {
  const config = fullLoveScenes[character];
  return Boolean(config && config.entryScene && scenes[config.entryScene]);
}

function returnToLodgeEarly() {
  state.pendingDestination = null;
  state.pendingEncounter = null;
  state.flags.returningEarly = false;
  renderScene("early_lodge_return");
}

function rollCheckInEvent(destination) {
  if (Math.random() < 0.2) return { type: "flavor" };
  const candidates = LOVE_INTEREST_KEYS.filter(key => key !== destination);
  return { type: "surprise", character: randomItem(candidates) };
}

function buildCheckInEventLines() {
  const event = state.pendingEncounter || { type: "flavor" };
  const returningEarly = Boolean(state.flags.returningEarly);
  if (returningEarly) {
    return [
      ["narrator", `The lodge lobby gathers the ${state.timeOfDay === "sunset" ? "last light" : "night quiet"} in warm panes of glass and polished wood.`],
      ["player", "Okay. Good. A normal room with normal doors and no route marker trying to make plans for me."]
    ];
  }
  if (event.type === "surprise") {
    const character = event.character;
    const mood = relationshipState(character);
    return [
      ["narrator", "The route should be simple. Naturally, the check-in kiosk chooses this moment to become socially complicated."],
      ["narrator", `${characters[character].shortName} is already near the desk when you arrive, turning a quick stop into a small collision of plans.`, character],
      ...parkFlavor[character].surprise[mood].map((text, index) => [index === 0 ? character : "narrator", text, character === "sierra" && index === 0 ? "sierra:sly" : characterExpression(character, mood)])
    ];
  }
  return checkInFlavor[state.timeOfDay] || checkInFlavor.daytime;
}

function showDayTransition(day, options = {}) {
  if (!els.dayTransition) return;
  const title = els.dayTransition.querySelector(".day-transition-title");
  const kicker = els.dayTransition.querySelector(".day-transition-kicker");
  const caption = els.dayTransition.querySelector(".day-transition-caption");
  if (title) title.textContent = `Day ${day}`;
  if (kicker) kicker.textContent = options.kicker || "Morning at Viral Vista Lodge";
  if (caption) caption.textContent = options.caption || "The lobby is warming up, the maps are waiting, and the kiosk has already decided to be a problem.";
  showDayTransition.onStart = typeof options.onStart === "function" ? options.onStart : null;
  els.gameScreen.classList.add("day-transitioning");
  els.dayTransition.classList.remove("active", "leaving");
  els.dayTransition.setAttribute("aria-hidden", "false");
  els.dayTransition.classList.add("active");
  if (els.dayTransitionButton) els.dayTransitionButton.focus({ preventScroll: true });
}

function startDayFromTransition() {
  if (!els.dayTransition || !els.dayTransition.classList.contains("active") || els.dayTransition.classList.contains("leaving")) return;
  pushDevHistory();
  const onStart = showDayTransition.onStart;
  showDayTransition.onStart = null;
  stopAmbient();
  if (onStart) onStart();
  els.dayTransition.classList.add("leaving");
  window.clearTimeout(startDayFromTransition.timer);
  startDayFromTransition.timer = window.setTimeout(() => {
    els.dayTransition.classList.remove("active", "leaving");
    els.dayTransition.setAttribute("aria-hidden", "true");
    els.gameScreen.classList.remove("day-transitioning");
  }, onStart ? DAY_TRANSITION_EXIT_WITH_SCENE_MS : DAY_TRANSITION_EXIT_MS);
}

function buildArrivalLines(character, time) {
  const mood = relationshipState(character);
  const lines = arrivalFlavor[character]?.[time] || [
    ["narrator", "The route opens into a different kind of quiet."],
    ["player", "New place. New chance not to be weird about it."],
    ["narrator", `${characters[character].shortName} appears at the edge of the trail.`, character]
  ];
  return lines.map(line => {
    const cue = line[2];
    if (cue !== character) return line;
    return [line[0], line[1], characterExpression(character, mood)];
  });
}

function currentVisitBeat(character) {
  const beats = visitBeats[character] || [];
  return beats[Math.min(state.visitBeat || 0, beats.length - 1)];
}

function buildVisitPromptLines(character) {
  const beat = currentVisitBeat(character);
  const mood = state.visitStartMood || relationshipState(character);
  const prompt = beat.prompt[mood] || beat.prompt.neutral;
  return [addWalkingAmbientForCharacter(character, prompt)];
}

function buildVisitChoices(character) {
  const beat = currentVisitBeat(character);
  const mood = state.visitStartMood || relationshipState(character);
  const choices = beat.choicesByMood?.[mood] || beat.choices;
  return choices.map(choice => ({
    label: choice.label,
    feelings: choice.feelings,
    action: () => {
      state.visitLastChoice = choice.tone;
      state.visitLastReaction = choice.reaction || null;
      renderScene("main_visit_reaction");
    }
  }));
}

function buildVisitReactionLines(character) {
  const beat = currentVisitBeat(character);
  const tone = state.visitLastChoice || "warm";
  const lines = state.visitLastReaction || beat.reactions[tone] || beat.reactions.warm;
  return lines.map(line => addWalkingAmbientForCharacter(character, line));
}

function advanceVisitBeat() {
  state.visitBeat = (state.visitBeat || 0) + 1;
  state.visitLastChoice = null;
  state.visitLastReaction = null;
  if (state.visitBeat >= (visitBeats[state.pendingDestination] || []).length) {
    renderScene("main_visit_wrapup");
    return;
  }
  renderScene("main_visit_prompt");
}

function buildVisitWrapupLines(character) {
  const mood = relationshipState(character);
  const time = state.visitTime || state.timeOfDay;
  const place = parkFlavor[character].place;
  const timeExit = {
    daytime: "The day is still bright when the route marker comes back into view.",
    sunset: "The last light thins along the trail, turning the route marker into a dark shape against the sky.",
    night: "The night has settled fully by the time the return path finds the edge of the route."
  }[time];
  if (character === "jack") {
    const jackMoodLine = {
      low: "Jack walks you back with care, but the old ease between you has mud on its boots. He still watches every slick board before you step on it.",
      neutral: "Jack walks beside you with familiar warmth while the quiet catches on unnamed things.",
      high: "Jack lingers at the route marker like goodbye is a log he could lift if he just found the right grip. For once, even he knows this is not only friendship."
    }[mood];
    return [
      ["narrator", timeExit, characterExpression(character, mood)],
      ["narrator", jackMoodLine, characterExpression(character, mood)],
      ["player", `You leave ${place} with Olympic rain on your sleeves and Jack bright in your mind.`]
    ];
  }
  if (character === "caleb") {
    const calebMoodLine = {
      low: "Caleb walks you back carefully, notebook tucked tight against his side. He still answers one question about the steam, but the answer is shorter than his affection wants to be.",
      neutral: "Caleb walks beside you, visibly restraining at least four facts until you ask for one. The quiet between you has footnotes now.",
      high: "Caleb lingers at the route marker like goodbye is a field study he has not finished. He gives you one last Yellowstone fact and somehow makes it sound like wanting you to stay."
    }[mood];
    return [
      ["narrator", timeExit, characterExpression(character, mood)],
      ["narrator", calebMoodLine, characterExpression(character, mood)],
      ["player", `You leave ${place} with steam in your hair, Yellowstone facts rearranging the view, and Caleb's earnest attention following closer than expected.`]
    ];
  }
  if (character === "sierra") {
    const sierraMoodLine = {
      low: "Sierra walks you back with care and a smile sharp enough to prove she is still annoyed. Even mad, she knows exactly how long to let the silence stretch before it turns dangerous.",
      neutral: "Sierra walks beside you, Yosemite quiet around her and mischief bright in her eyes. She points out one star, then says it is trying too hard because you already looked up.",
      high: "Sierra lingers at the route marker like goodbye is a game she fully intends to win. She tells you the waterfall can have the scenery, because she is keeping your attention, and because the best view in Yosemite is not on the daytime route."
    }[mood];
    const sierraExitLine = {
      low: "For the record, I am still annoyed. Unfortunately for both of us, annoyed is a very good look on me.",
      neutral: "Come back later. Yosemite likes repeat visitors, and I like watching you pretend that sentence was only about the park.",
      high: "Go on. Leave before I start making the waterfall jealous on purpose. Come back after dark if you want to see where I go when the trail gets quiet."
    }[mood];
    return [
      ["narrator", timeExit, characterExpression(character, mood)],
      ["narrator", sierraMoodLine, characterExpression(character, mood)],
      ["sierra", sierraExitLine, "sierra:sly"],
      ["player", `You leave ${place} with mist on your skin, Yosemite still enormous behind you, and Sierra's grin following closer than expected.`, mood === "low" ? "sierra:grumpy" : "sierra:blushing"]
    ];
  }
  const moodLine = {
    low: `${characters[character].shortName} walks you back with care, but not much softness. The visit ends because the trail does, not because either of you found an easy answer.`,
    neutral: `${characters[character].shortName} walks beside you, the quiet comfortable enough to count as progress.`,
    high: `${characters[character].shortName} lingers at the route marker like goodbye needs a permit and neither of you filed one.`
  }[mood];
  return [
    ["narrator", timeExit, characterExpression(character, mood)],
    addWalkingAmbientForCharacter(character, ["narrator", moodLine, characterExpression(character, mood)]),
    ["player", `You leave ${place} with the place still bright in your mind, and with ${characters[character].shortName}'s reaction following closer than expected.`]
  ];
}

function characterExpression(character, mood) {
  if (mood === "low") return `${character}:grumpy`;
  if (mood === "high") return `${character}:blushing`;
  return character;
}

function relationshipState(character) {
  const score = state.feelings[character] ?? 5;
  if (score < 5) return "low";
  if (score >= 7) return "high";
  return "neutral";
}

function addFeelings(changes) {
  Object.entries(changes).forEach(([key, value]) => {
    if (!LOVE_INTEREST_KEYS.includes(key)) return;
    state.feelings[key] = clamp((state.feelings[key] ?? 5) + value, 0, 10);
  });
}

function setFeelingScore(key, value) {
  if (!LOVE_INTEREST_KEYS.includes(key)) return state.feelings[key] ?? 5;
  const fallback = state.feelings[key] ?? defaultState.feelings[key] ?? 5;
  const parsed = Number(value);
  const score = Number.isFinite(parsed) ? Math.round(parsed) : fallback;
  state.feelings[key] = clamp(score, 0, 10);
  return state.feelings[key];
}

function sanitizeFeelings(savedFeelings) {
  const clean = clone(defaultState.feelings);
  Object.keys(clean).forEach(key => {
    if (savedFeelings && savedFeelings[key] !== undefined) {
      const savedScore = Number(savedFeelings[key]);
      clean[key] = Number.isFinite(savedScore) ? clamp(Math.round(savedScore), 0, 10) : clean[key];
    }
  });
  return clean;
}

function migrateLegacyCharacterKeys(saved) {
  if (!saved || typeof saved !== "object") return {};
  const migrated = clone(saved);
  const legacyDakotaKey = ["b", "runo"].join("");
  const legacyNataiKey = ["r", "iver"].join("");
  const remapKey = value => {
    if (value === legacyDakotaKey) return "dakota";
    if (value === legacyNataiKey) return "natai";
    return value;
  };
  const remapId = value => typeof value === "string"
    ? value.replaceAll(legacyDakotaKey, "dakota").replaceAll(legacyNataiKey, "natai")
    : value;

  migrated.selectedRoute = remapKey(migrated.selectedRoute);
  migrated.pendingDestination = remapKey(migrated.pendingDestination);
  migrated.pendingEncounter = remapKey(migrated.pendingEncounter);
  migrated.sceneId = remapId(migrated.sceneId);
  migrated.choiceReactionNext = remapId(migrated.choiceReactionNext);
  migrated.introReturnScene = remapId(migrated.introReturnScene);
  migrated.choiceReactionBackground = remapKey(migrated.choiceReactionBackground);
  migrated.choiceReactionLabel = remapId(migrated.choiceReactionLabel);

  if (migrated.feelings) {
    migrated.feelings = Object.assign({}, migrated.feelings);
    if (migrated.feelings[legacyDakotaKey] !== undefined && migrated.feelings.dakota === undefined) {
      migrated.feelings.dakota = migrated.feelings[legacyDakotaKey];
    }
    if (migrated.feelings[legacyNataiKey] !== undefined && migrated.feelings.natai === undefined) {
      migrated.feelings.natai = migrated.feelings[legacyNataiKey];
    }
    delete migrated.feelings[legacyDakotaKey];
    delete migrated.feelings[legacyNataiKey];
  }

  if (Array.isArray(migrated.unlockedCG)) {
    migrated.unlockedCG = migrated.unlockedCG.map(remapId);
  }

  return migrated;
}

function choiceImpactHtml(choice) {
  if (!choice.feelings) return "";
  const bits = Object.entries(choice.feelings)
    .filter(([, value]) => value)
    .map(([key, value]) => {
      const sign = value > 0 ? "+" : "";
      const cls = value > 0 ? "positive" : "negative";
      return `<span class="impact ${cls}">${sign}${value} ${escapeHtml(characters[key].shortName)}</span>`;
    });
  return bits.length ? `<span class="choice-impacts">${bits.join("")}</span>` : "";
}

function updateDevPanel() {
  if (!els.devPanel) return;
  els.devPanel.classList.toggle("active", Boolean(state.devPanelOpen));
  els.devChoicePreview.checked = Boolean(state.devChoicePreview);
  els.devEasyCopy.checked = Boolean(state.devEasyCopy);
  els.devBackButton.checked = Boolean(state.devBackButton);
  els.devSkipButton.checked = Boolean(state.devSkipButton);
  els.devQuickRestoreInputs.checked = Boolean(state.devQuickRestoreInputs);
  els.devDisableTypewriter.checked = Boolean(state.devDisableTypewriter);
  els.quickRestorePanel.classList.toggle("active", Boolean(state.devQuickRestoreInputs));
  els.backBtn.hidden = !state.devBackButton;
  els.backBtn.disabled = devHistory.length === 0;
  els.skipBtn.hidden = !state.devSkipButton;
  els.skipToBtn.hidden = !state.devSkipButton;
  updateCopyControls();
  els.devScores.innerHTML = LOVE_INTEREST_KEYS.map(key => {
    const score = state.feelings[key] ?? 5;
    const name = escapeHtml(characters[key].shortName);
    const fullLoveButton = hasImplementedFullLoveScene(key)
      ? `<button class="dev-full-love-btn" type="button" data-dev-full-love-key="${escapeHtml(key)}" aria-label="Go to ${name}'s full love scene">Full scene</button>`
      : "";
    const brosButton = key === "dakota" || key === "natai"
      ? `<button class="dev-bros-btn" type="button" data-dev-bros-key="${escapeHtml(key)}" aria-label="Go to ${name}'s brothers reconciliation variant">Bros</button>`
      : "";
    return `
      <div class="dev-score">
        <span class="dev-score-name">
          <span>${name}</span>
          ${fullLoveButton}
          ${brosButton}
        </span>
        <label class="dev-score-control" for="devFeeling-${escapeHtml(key)}">
          <input
            id="devFeeling-${escapeHtml(key)}"
            type="number"
            min="0"
            max="10"
            step="1"
            inputmode="numeric"
            data-dev-feeling-key="${escapeHtml(key)}"
            value="${score}"
            aria-label="${name} feeling score"
          >
          <span>/10</span>
        </label>
      </div>`;
  }).join("");
  if (els.devAudioStatus) {
    const { music, sfx } = currentAudioDebugLines();
    els.devAudioStatus.innerHTML = `
      <div>Music: ${escapeHtml(music)}</div>
      <div>SFX: ${escapeHtml(sfx)}</div>`;
  }
}

function updateCopyControls() {
  if (!els.dialogueCopyBtn) return;
  els.dialogueCopyBtn.hidden = !state.devEasyCopy;
}

function currentAudioDebugLines() {
  const currentMusic = unique(
    audioEngine.enabled
      ? audioEngine.musicPlayers
        .filter(player => player && player.src && !player.paused && !player.ended)
        .map(player => audioFileName(player.src))
        .filter(Boolean)
      : []
  );
  const currentSfx = unique(
    audioEngine.activeSfxPlayers
      .filter(entry => entry.player && !entry.player.paused && !entry.player.ended)
      .map(entry => audioFileName(entry.src))
      .filter(Boolean)
  );
  return {
    music: currentMusic.length ? currentMusic.join(", ") : "None",
    sfx: currentSfx.length ? currentSfx.join(", ") : "None"
  };
}

function trackSfxPlayer(player, src, kind = "sfx") {
  audioEngine.activeSfxPlayers = audioEngine.activeSfxPlayers.filter(entry => entry.player !== player);
  audioEngine.activeSfxPlayers.push({ player, src, kind });
  const cleanup = () => {
    untrackSfxPlayer(player);
  };
  player.addEventListener("ended", cleanup, { once: true });
  player.addEventListener("error", cleanup, { once: true });
}

function untrackSfxPlayer(player) {
  const nextPlayers = audioEngine.activeSfxPlayers.filter(entry => entry.player !== player);
  if (nextPlayers.length === audioEngine.activeSfxPlayers.length) return;
  audioEngine.activeSfxPlayers = nextPlayers;
  updateDevPanel();
}

function stopTrackedSfxPlayers() {
  const players = audioEngine.activeSfxPlayers.map(entry => entry.player).filter(Boolean);
  audioEngine.activeSfxPlayers = [];
  players.forEach(player => {
    player.pause();
    player.currentTime = 0;
  });
}

function audioFileName(src) {
  if (!src) return "";
  const path = String(src).split(/[?#]/)[0].replaceAll("\\", "/");
  const fileName = path.split("/").pop() || path;
  try {
    return decodeURIComponent(fileName);
  } catch (error) {
    return fileName;
  }
}

function unique(items) {
  return [...new Set(items)];
}

function resolveBackground(input) {
  if (typeof input === "string") return { location: input, time: state.timeOfDay || "daytime" };
  return input || { location: "lodge", time: state.timeOfDay || "daytime" };
}

function updateBackdrop(backgroundInput) {
  const background = resolveBackground(backgroundInput);
  const location = background.location || "lodge";
  const time = background.time || state.timeOfDay || "daytime";
  const key = `${location}.${time}`;
  const src = backgroundCatalog[location]?.[time] || "";
  const cssClass = backgroundClasses[location] || "bg-lodge";
  const image = src ? `url("${src}")` : "none";
  if (els.backdrop.dataset.key === key) return false;
  audioEngine.justPlayedDoorSfx = false;
  const previousLocation = (els.backdrop.dataset.key || "").split(".")[0];
  if (shouldPlayDoorSfx(previousLocation, location, time)) {
    audioEngine.justPlayedDoorSfx = true;
    window.setTimeout(() => playSfx("door"), 120);
  }
  if (!els.backdrop.dataset.key) {
    els.backdrop.className = `backdrop ${cssClass}`;
    els.backdrop.style.backgroundImage = image;
    els.backdrop.dataset.key = key;
    return true;
  }
  els.backdropNext.className = `backdrop next ${cssClass}`;
  els.backdropNext.style.backgroundImage = image;
  els.backdropNext.dataset.key = key;
  requestAnimationFrame(() => {
    els.backdropNext.classList.add("visible");
    window.setTimeout(() => {
      els.backdrop.className = `backdrop ${cssClass}`;
      els.backdrop.style.backgroundImage = image;
      els.backdrop.dataset.key = key;
      els.backdropNext.className = `backdrop next ${cssClass}`;
      els.backdropNext.style.backgroundImage = image;
      els.backdropNext.dataset.key = key;
    }, 900);
  });
  return true;
}

function setBackdropInstant(backgroundInput) {
  const background = resolveBackground(backgroundInput);
  const location = background.location || "lodge";
  const time = background.time || state.timeOfDay || "daytime";
  const key = `${location}.${time}`;
  const src = backgroundCatalog[location]?.[time] || "";
  const cssClass = backgroundClasses[location] || "bg-lodge";
  const image = src ? `url("${src}")` : "none";
  els.backdrop.className = `backdrop ${cssClass}`;
  els.backdrop.style.backgroundImage = image;
  els.backdrop.dataset.key = key;
  els.backdropNext.className = `backdrop next ${cssClass}`;
  els.backdropNext.style.backgroundImage = image;
  els.backdropNext.dataset.key = key;
}

function applyMainSpriteVariantClasses(characterKey, expression) {
  els.sprite.classList.toggle("sierra-stargazing-sprite", characterKey === "sierra" && String(expression || "").startsWith("stargazingStep"));
  els.sprite.classList.toggle("sierra-stargazing-close", characterKey === "sierra" && expression === "stargazingStep4");
  els.sprite.classList.toggle("natai-sleeping-bag-romantic", characterKey === "natai" && expression === "sleepingBagRomantic");
  els.sprite.classList.toggle("natai-empty-sleeping-bag", characterKey === "natai" && expression === "emptySleepingBag");
  els.sprite.classList.toggle("dakota-natai-reconciliation", characterKey === "dakotaNatai");
}

function updateSprite(characterCue) {
  const { key: characterKey, expression } = parseCharacterCue(characterCue);
  const character = characters[characterKey];
  const sprite = character && resolveSprite(character, expression);
  if (!character || !sprite) {
    const hideToken = spriteLoadToken + 1;
    spriteLoadToken = hideToken;
    const hadVisibleSprite = Boolean(els.sprite.dataset.spriteUrl) && !els.sprite.classList.contains("hidden");
    if (hadVisibleSprite) {
      els.sprite.dataset.pendingFadeSwap = "true";
    } else {
      delete els.sprite.dataset.pendingFadeSwap;
    }
    els.sprite.classList.add("hidden");
    els.placeholderSprite.classList.remove("visible");
    window.setTimeout(() => {
      if (hideToken !== spriteLoadToken) return;
      els.sprite.removeAttribute("src");
      els.sprite.alt = "";
      els.sprite.dataset.spriteUrl = "";
      delete els.sprite.dataset.pendingFadeSwap;
      applyMainSpriteVariantClasses(null, null);
    }, 620);
    return;
  }
  const spriteUrl = new URL(sprite, window.location.href).href;
  const characterName = resolveName(character);
  if (els.sprite.dataset.spriteUrl === spriteUrl && !els.sprite.classList.contains("hidden")) {
    delete els.sprite.dataset.pendingFadeSwap;
    applyMainSpriteVariantClasses(characterKey, expression);
    els.sprite.alt = characterName;
    return;
  }
  const loadToken = spriteLoadToken + 1;
  spriteLoadToken = loadToken;
  const hadVisibleSprite = (Boolean(els.sprite.dataset.spriteUrl) && !els.sprite.classList.contains("hidden")) || els.sprite.dataset.pendingFadeSwap === "true";
  els.sprite.classList.add("hidden");
  els.sprite.alt = characterName;
  els.sprite.decoding = "async";
  els.sprite.loading = "eager";
  els.placeholderSprite.classList.remove("visible");
  els.placeholderSprite.querySelector("strong").textContent = characterName;
  const revealSprite = () => {
    if (loadToken !== spriteLoadToken) return;
    delete els.sprite.dataset.pendingFadeSwap;
    applyMainSpriteVariantClasses(characterKey, expression);
    els.sprite.dataset.spriteUrl = spriteUrl;
    els.sprite.src = spriteUrl;
    void els.sprite.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (loadToken === spriteLoadToken) els.sprite.classList.remove("hidden");
    }));
    els.placeholderSprite.classList.remove("visible");
  };
  const showMissingSprite = () => {
    if (loadToken !== spriteLoadToken) return;
    delete els.sprite.dataset.pendingFadeSwap;
    els.sprite.classList.add("hidden");
    els.placeholderSprite.classList.add("visible");
  };
  if (els.sprite.src === spriteUrl) {
    window.setTimeout(revealSprite, hadVisibleSprite ? 180 : 0);
    return;
  }
  const preload = new Image();
  preload.decoding = "async";
  preload.onload = () => window.setTimeout(revealSprite, hadVisibleSprite ? 180 : 0);
  preload.onerror = showMissingSprite;
  preload.src = spriteUrl;
}

function updatePropSprite(propCue) {
  const { key: characterKey, expression } = parseCharacterCue(propCue);
  const character = characters[characterKey];
  const sprite = character && resolveSprite(character, expression);
  if (!sprite) {
    const hideToken = propLoadToken + 1;
    propLoadToken = hideToken;
    const hadVisibleProp = Boolean(els.propSprite.dataset.spriteUrl) && !els.propSprite.classList.contains("hidden");
    if (hadVisibleProp) {
      els.propSprite.dataset.pendingFadeSwap = "true";
      requestAnimationFrame(() => {
        if (hideToken === propLoadToken) els.gameScreen.classList.remove("prop-visible");
      });
    } else {
      delete els.propSprite.dataset.pendingFadeSwap;
      els.gameScreen.classList.remove("prop-visible");
    }
    els.propSprite.classList.add("hidden");
    window.setTimeout(() => {
      if (hideToken !== propLoadToken) return;
      if (els.gameScreen.classList.contains("prop-visible")) return;
      els.propSprite.removeAttribute("src");
      els.propSprite.alt = "";
      els.propSprite.dataset.spriteUrl = "";
      delete els.propSprite.dataset.pendingFadeSwap;
      els.propSprite.className = "prop-sprite hidden";
    }, 520);
    return;
  }

  els.propSprite.classList.toggle("natai-empty-sleeping-bag", characterKey === "natai" && expression === "emptySleepingBag");
  const spriteUrl = new URL(sprite, window.location.href).href;
  const characterName = resolveName(character);
  if (els.propSprite.dataset.spriteUrl === spriteUrl && !els.propSprite.classList.contains("hidden")) {
    delete els.propSprite.dataset.pendingFadeSwap;
    els.gameScreen.classList.add("prop-visible");
    els.propSprite.alt = characterName;
    return;
  }

  const loadToken = propLoadToken + 1;
  propLoadToken = loadToken;
  const hadVisibleProp = (Boolean(els.propSprite.dataset.spriteUrl) && !els.propSprite.classList.contains("hidden")) || els.propSprite.dataset.pendingFadeSwap === "true";
  els.propSprite.classList.add("hidden");
  if (hadVisibleProp) {
    requestAnimationFrame(() => {
      if (loadToken === propLoadToken) els.gameScreen.classList.remove("prop-visible");
    });
  } else {
    els.gameScreen.classList.remove("prop-visible");
  }
  els.propSprite.alt = characterName;
  els.propSprite.decoding = "async";
  els.propSprite.loading = "eager";
  const revealProp = () => {
    if (loadToken !== propLoadToken) return;
    delete els.propSprite.dataset.pendingFadeSwap;
    els.propSprite.dataset.spriteUrl = spriteUrl;
    els.propSprite.src = spriteUrl;
    void els.propSprite.offsetWidth;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (loadToken !== propLoadToken) return;
      els.gameScreen.classList.add("prop-visible");
      els.propSprite.classList.remove("hidden");
    }));
  };
  if (els.propSprite.src === spriteUrl) {
    window.setTimeout(revealProp, 120);
    return;
  }
  const preload = new Image();
  preload.decoding = "async";
  preload.onload = () => window.setTimeout(revealProp, 120);
  preload.onerror = () => {
    if (loadToken !== propLoadToken) return;
    delete els.propSprite.dataset.pendingFadeSwap;
    els.gameScreen.classList.remove("prop-visible");
    els.propSprite.classList.add("hidden");
  };
  preload.src = spriteUrl;
}

function parseCharacterCue(characterCue) {
  const cue = resolveValue(characterCue);
  if (!cue) return { key: null, expression: "neutral" };
  if (typeof cue === "object") return { key: cue.key || cue.character || null, expression: cue.expression || "neutral" };
  const [key, expression = "neutral"] = String(cue).split(":");
  return { key, expression };
}

function showGallery() {
  renderGallery();
  els.galleryOverlay.classList.add("active");
}

function renderGallery() {
  els.galleryGrid.innerHTML = "";
  Object.entries(cgLibrary).forEach(([id, cg]) => {
    const unlocked = state.unlockedCG.includes(id);
    const card = document.createElement("div");
    card.className = "cg-card" + (unlocked ? "" : " locked");
    card.style.backgroundImage = unlocked ? `url("${cg.image}")` : "";
    card.innerHTML = `<span>${escapeHtml(unlocked ? cg.title : "Locked CG")}</span>`;
    els.galleryGrid.appendChild(card);
  });
}

function unlockCG(id) {
  if (!state.unlockedCG.includes(id)) state.unlockedCG.push(id);
}

function updateBeginButton() {
  const input = document.getElementById("playerName");
  const button = document.getElementById("beginBtn");
  button.disabled = input.value.trim().length === 0;
}

function normalizeStateSnapshot(saved, options = {}) {
  const migrated = migrateLegacyCharacterKeys(saved);
  const previousDevSettings = options.preserveDevSettings ? {
    devPanelOpen: state.devPanelOpen,
    devChoicePreview: state.devChoicePreview,
    devEasyCopy: state.devEasyCopy,
    devBackButton: state.devBackButton,
    devSkipButton: state.devSkipButton,
    devQuickRestoreInputs: state.devQuickRestoreInputs,
    devDisableTypewriter: state.devDisableTypewriter
  } : null;

  const nextState = Object.assign(clone(defaultState), migrated);
  nextState.playerName = String(nextState.playerName || "").trim() || defaultState.playerName;
  nextState.sceneId = normalizeSceneId(nextState.sceneId || defaultState.sceneId);
  nextState.lineIndex = Math.max(0, Number(nextState.lineIndex) || 0);
  nextState.feelings = sanitizeFeelings(migrated.feelings);
  nextState.flags = nextState.flags && typeof nextState.flags === "object" ? nextState.flags : {};
  nextState.unlockedCG = Array.isArray(nextState.unlockedCG) ? nextState.unlockedCG : [];
  nextState.audioEnabled = nextState.audioEnabled !== false;
  nextState.devChoicePreview = migrated.devChoicePreview !== false;
  nextState.devEasyCopy = migrated.devEasyCopy !== false;
  nextState.devBackButton = migrated.devBackButton !== false;
  nextState.devSkipButton = migrated.devSkipButton !== false;
  nextState.devQuickRestoreInputs = migrated.devQuickRestoreInputs !== false;
  nextState.devDisableTypewriter = migrated.devDisableTypewriter === true;
  nextState.timeOfDay = TIMES.includes(nextState.timeOfDay) ? nextState.timeOfDay : "daytime";
  nextState.day = Math.max(1, Number(nextState.day) || 1);

  if (previousDevSettings) {
    Object.assign(nextState, previousDevSettings);
  }

  return nextState;
}

function restoreStateSnapshot(saved, options = {}) {
  state = normalizeStateSnapshot(saved, options);
  audioEngine.enabled = state.audioEnabled;
  clearDevHistory();
  window.clearTimeout(lineAutoAdvanceTimer);
  window.clearTimeout(lineAmbientTimer);
  window.clearTimeout(startDayFromTransition.timer);
  window.clearTimeout(startGameTransitionTimer);
  window.clearTimeout(dialogueEntryTimer);
  clearDialogueTypewriter();
  clearChoiceTimers();
  showDayTransition.onStart = null;
  stopMusicLoop();
  if (els.dayTransition) {
    els.dayTransition.classList.remove("active", "leaving");
    els.dayTransition.setAttribute("aria-hidden", "true");
  }
  els.startGameTransition.classList.remove("active", "leaving");
  els.gameScreen.classList.remove("day-transitioning");
  els.dialogueBox.classList.remove("dialogue-first-enter", "dialogue-entry-pending");
  ensureAudio();
  showScreen("gameScreen");
  renderScene(state.sceneId, { keepLine: true });
  if (options.successToast) toast(options.successToast);
}

function saveGame() {
  state.audioEnabled = audioEngine.enabled;
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  playSfx("save");
  toast("Saved at Viral Vista Lodge.");
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    toast("No save found yet.");
    return;
  }
  try {
    restoreStateSnapshot(JSON.parse(raw), { successToast: "Save loaded." });
  } catch (error) {
    toast("Save could not be loaded.");
  }
}

function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem("parkAfterDarkSaveV2");
  localStorage.removeItem("parkAfterDarkSaveV1");
  state = clone(defaultState);
  clearDevHistory();
  clearDialogueTypewriter();
  window.clearTimeout(startGameTransitionTimer);
  window.clearTimeout(dialogueEntryTimer);
  els.startGameTransition.classList.remove("active", "leaving");
  els.dialogueBox.classList.remove("dialogue-first-enter", "dialogue-entry-pending");
  audioEngine.enabled = state.audioEnabled;
  els.galleryOverlay.classList.remove("active");
  updateAmbient(null);
  showScreen("startScreen");
  toast("Progress reset.");
}

function showScreen(id) {
  [els.startScreen, els.setupScreen, els.gameScreen].forEach(screen => screen.classList.remove("active"));
  els[id].classList.add("active");
  if (id !== "gameScreen") {
    updateAmbient(null);
  }
  if (!audioEngine.enabled) return;
  if (id === "startScreen") {
    stopMusicLoop();
    return;
  }
  ensureAudio();
  if (id === "setupScreen") {
    audioEngine.locationKey = "checkIn";
    audioEngine.characterKey = null;
    restartMusicLoop();
  }
}

function normalizeSceneId(sceneId) {
  return scenes[sceneId] ? sceneId : "intro_bus_ride";
}

function toggleAudio() {
  audioEngine.enabled = !audioEngine.enabled;
  state.audioEnabled = audioEngine.enabled;
  ensureAudio();
  updateAudioButton();
  if (audioEngine.enabled) {
    const scene = scenes[state.sceneId];
    if (scene) updateAmbient(scene.ambient || null);
    restartMusicLoop();
    toast("Sound on.");
  } else {
    stopMusicLoop();
    toast("Sound muted.");
  }
}

function updateAudioButton() {
  const button = document.getElementById("audioBtn");
  button.title = audioEngine.enabled ? "Sound on" : "Sound muted";
  button.setAttribute("aria-label", button.title);
  button.classList.toggle("muted", !audioEngine.enabled);
}

function updateAmbient(key) {
  if (!audioEngine.enabled || !key) {
    stopAmbient();
    stopSfxChannel("bus");
    return;
  }
  if (audioEngine.ambientKey === key && audioEngine.ambientPlayer) return;
  stopAmbient();
  const config = ambientTracks[key];
  if (!config) return;
  const ambientToken = audioEngine.ambientToken + 1;
  audioEngine.ambientToken = ambientToken;
  audioEngine.ambientKey = key;
  const startAmbient = () => {
    if (!audioEngine.enabled || audioEngine.ambientToken !== ambientToken) return;
    const player = new Audio(config.src);
    player.loop = true;
    player.volume = config.fadeMs ? 0 : config.volume;
    audioEngine.ambientPlayer = player;
    trackSfxPlayer(player, config.src, "ambient");
    player.play().then(() => {
      if (config.fadeMs) fadeAmbient(player, config.volume, config.fadeMs, ambientToken);
      updateDevPanel();
    }).catch(() => untrackSfxPlayer(player));
  };
  if (config.delayMs) {
    audioEngine.ambientTimerId = window.setTimeout(startAmbient, config.delayMs);
    return;
  }
  startAmbient();
}

function fadeAmbient(player, targetVolume, duration, ambientToken) {
  window.clearInterval(audioEngine.ambientFadeTimerId);
  const startVolume = player.volume;
  const startTime = performance.now();
  audioEngine.ambientFadeTimerId = window.setInterval(() => {
    if (audioEngine.ambientToken !== ambientToken || audioEngine.ambientPlayer !== player) {
      window.clearInterval(audioEngine.ambientFadeTimerId);
      audioEngine.ambientFadeTimerId = null;
      return;
    }
    const progress = Math.min(1, (performance.now() - startTime) / duration);
    player.volume = startVolume + (targetVolume - startVolume) * progress;
    if (progress >= 1) {
      window.clearInterval(audioEngine.ambientFadeTimerId);
      audioEngine.ambientFadeTimerId = null;
    }
  }, 16);
}

function stopAmbient(immediate = false) {
  audioEngine.ambientToken += 1;
  window.clearTimeout(audioEngine.ambientTimerId);
  window.clearInterval(audioEngine.ambientFadeTimerId);
  audioEngine.ambientTimerId = null;
  audioEngine.ambientFadeTimerId = null;
  if (!audioEngine.ambientPlayer) {
    audioEngine.ambientKey = null;
    return;
  }
  const player = audioEngine.ambientPlayer;
  const config = ambientTracks[audioEngine.ambientKey];
  audioEngine.ambientKey = null;
  audioEngine.ambientPlayer = null;
  if (!immediate && config?.stopFadeMs && audioEngine.enabled) {
    fadeDetachedPlayer(player, 0, config.stopFadeMs, () => {
      player.pause();
      player.currentTime = 0;
      untrackSfxPlayer(player);
    });
    updateDevPanel();
    return;
  }
  player.pause();
  player.currentTime = 0;
  untrackSfxPlayer(player);
  updateDevPanel();
}

function startOverlayAmbient(key) {
  if (!audioEngine.enabled || !key) {
    stopOverlayAmbient(true);
    return;
  }
  if (audioEngine.overlayAmbientKey === key && audioEngine.overlayAmbientPlayer) return;
  stopOverlayAmbient(true);
  const config = ambientTracks[key];
  if (!config) return;
  const overlayToken = audioEngine.overlayAmbientToken + 1;
  audioEngine.overlayAmbientToken = overlayToken;
  audioEngine.overlayAmbientKey = key;
  const player = new Audio(config.src);
  player.loop = true;
  player.volume = config.fadeMs ? 0 : config.volume;
  audioEngine.overlayAmbientPlayer = player;
  trackSfxPlayer(player, config.src, "ambient");
  player.play().then(() => {
    if (config.fadeMs) fadeOverlayAmbient(player, config.volume, config.fadeMs, overlayToken);
    updateDevPanel();
  }).catch(() => untrackSfxPlayer(player));
}

function fadeOverlayAmbient(player, targetVolume, duration, overlayToken) {
  window.clearInterval(audioEngine.overlayAmbientFadeTimerId);
  const startVolume = player.volume;
  const startTime = performance.now();
  audioEngine.overlayAmbientFadeTimerId = window.setInterval(() => {
    if (audioEngine.overlayAmbientToken !== overlayToken || audioEngine.overlayAmbientPlayer !== player) {
      window.clearInterval(audioEngine.overlayAmbientFadeTimerId);
      audioEngine.overlayAmbientFadeTimerId = null;
      return;
    }
    const progress = Math.min(1, (performance.now() - startTime) / duration);
    player.volume = startVolume + (targetVolume - startVolume) * progress;
    if (progress >= 1) {
      window.clearInterval(audioEngine.overlayAmbientFadeTimerId);
      audioEngine.overlayAmbientFadeTimerId = null;
    }
  }, 16);
}

function stopOverlayAmbient(immediate = false) {
  audioEngine.overlayAmbientToken += 1;
  window.clearInterval(audioEngine.overlayAmbientFadeTimerId);
  audioEngine.overlayAmbientFadeTimerId = null;
  if (!audioEngine.overlayAmbientPlayer) {
    audioEngine.overlayAmbientKey = null;
    return;
  }
  const player = audioEngine.overlayAmbientPlayer;
  const config = ambientTracks[audioEngine.overlayAmbientKey];
  audioEngine.overlayAmbientKey = null;
  audioEngine.overlayAmbientPlayer = null;
  if (!immediate && config?.stopFadeMs && audioEngine.enabled) {
    fadeDetachedPlayer(player, 0, config.stopFadeMs, () => {
      player.pause();
      player.currentTime = 0;
      untrackSfxPlayer(player);
    });
    updateDevPanel();
    return;
  }
  player.pause();
  player.currentTime = 0;
  untrackSfxPlayer(player);
  updateDevPanel();
}

function stopSfxChannel(channel) {
  const player = audioEngine.sfxChannels[channel];
  if (!player) return;
  player.pause();
  player.currentTime = 0;
  delete audioEngine.sfxChannels[channel];
  untrackSfxPlayer(player);
  updateDevPanel();
}

function playLineAudioCue(cue) {
  const audioCue = cue && cue.audio;
  if (!audioCue || !audioEngine.enabled) return;
  const cueKey = `${state.sceneId}:${state.lineIndex}:${audioCue}`;
  if (state.lineAudioCueKey === cueKey) return;
  state.lineAudioCueKey = cueKey;
  playSfx(audioCue);
}

function ensureAudio() {
  updateAudioButton();
  if (!audioEngine.enabled) return;
  if (!audioEngine.sfxContext) {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (AudioContextCtor) audioEngine.sfxContext = new AudioContextCtor();
  }
  if (audioEngine.sfxContext?.state === "suspended") {
    audioEngine.sfxContext.resume().catch(() => {});
  }
  if (audioEngine.sfxContext && !audioEngine.advanceBuffer && !audioEngine.advanceBufferPromise) {
    audioEngine.advanceBufferPromise = fetch(sfxTracks.advance.src)
      .then(response => response.arrayBuffer())
      .then(buffer => audioEngine.sfxContext.decodeAudioData(buffer))
      .then(decodedBuffer => {
        audioEngine.advanceBuffer = decodedBuffer;
        return decodedBuffer;
      })
      .catch(() => null)
      .finally(() => {
        audioEngine.advanceBufferPromise = null;
      });
  }
  if (!audioEngine.advancePlayer) {
    const advancePlayer = new Audio(sfxTracks.advance.src);
    advancePlayer.preload = "auto";
    advancePlayer.volume = sfxTracks.advance.volume;
    advancePlayer.load();
    audioEngine.advancePlayer = advancePlayer;
  }
  if (!audioEngine.musicPlayers.length) {
    audioEngine.musicPlayers = [new Audio(), new Audio()];
    audioEngine.musicPlayers.forEach(player => {
      player.preload = "auto";
      player.loop = false;
      player.volume = 0;
    });
  }
  if (!els.startScreen.classList.contains("active") && !audioEngine.musicSuppressedLocationKey) restartMusicLoop();
}

function updateAudioTheme(locationKey, characterCue, options = {}) {
  const nextLocationKey = locationKey || "lodge";
  if (audioEngine.musicSuppressedUntilSceneId) {
    if (state.sceneId === audioEngine.musicSuppressedUntilSceneId) {
      audioEngine.musicSuppressedUntilSceneId = null;
      audioEngine.musicSuppressedLocationKey = null;
    }
  } else if (audioEngine.musicSuppressedLocationKey && audioEngine.musicSuppressedLocationKey !== nextLocationKey) {
    audioEngine.musicSuppressedLocationKey = null;
    audioEngine.musicResumeFadeMs = 3400;
  }
  audioEngine.locationKey = nextLocationKey;
  audioEngine.characterKey = parseCharacterCue(characterCue).key || null;
  audioEngine.musicOverrideKey = options.musicKey || null;
  if (!audioEngine.enabled) return;
  if (options.silenceMusic) {
    audioEngine.musicSuppressedLocationKey = nextLocationKey;
    audioEngine.musicSuppressedUntilSceneId = null;
    ensureAudio();
    fadeOutCurrentMusic(900);
    return;
  }
  ensureAudio();
  if (!audioEngine.musicSuppressedLocationKey) restartMusicLoop();
}

function restartMusicLoop() {
  if (!audioEngine.enabled) return;
  const nextMusicKey = resolveMusicKey();
  if (!nextMusicKey) return;
  if (audioEngine.musicKey === nextMusicKey && audioEngine.currentTheme) return;
  playMusicTrack(nextMusicKey);
}

function stopMusicLoop() {
  audioEngine.musicSuppressedLocationKey = null;
  audioEngine.musicSuppressedUntilSceneId = null;
  audioEngine.musicResumeFadeMs = null;
  stopAmbient(true);
  stopOverlayAmbient(true);
  Object.keys(audioEngine.sfxChannels).forEach(stopSfxChannel);
  stopTrackedSfxPlayers();
  audioEngine.trackChangeToken += 1;
  window.clearInterval(audioEngine.loopTimerId);
  audioEngine.fadeTimerIds.forEach(id => window.clearInterval(id));
  audioEngine.loopTimerId = null;
  audioEngine.fadeTimerIds = [];
  audioEngine.transitioning = false;
  audioEngine.musicPlayers.forEach(player => {
    player.pause();
    player.currentTime = 0;
    player.volume = 0;
  });
  audioEngine.currentTheme = null;
  audioEngine.musicKey = null;
  audioEngine.musicOverrideKey = null;
  audioEngine.pendingMusicStartSfx = null;
  updateDevPanel();
}

function fadeOutMusicUntilLocationChange(duration = 2200) {
  audioEngine.musicSuppressedLocationKey = audioEngine.locationKey || currentBackgroundKey().split(".")[0] || "lodge";
  audioEngine.musicSuppressedUntilSceneId = null;
  fadeOutCurrentMusic(duration);
}

function fadeOutMusicUntilScene(config) {
  const settings = typeof config === "object" ? config : { sceneId: String(config || "") };
  audioEngine.musicSuppressedLocationKey = audioEngine.locationKey || currentBackgroundKey().split(".")[0] || "lodge";
  audioEngine.musicSuppressedUntilSceneId = settings.sceneId || null;
  audioEngine.musicResumeFadeMs = settings.resumeFadeMs || 5600;
  fadeOutCurrentMusic(settings.fadeOutMs || 2200);
}

function fadeOutCurrentMusic(duration = 2200) {
  if (!audioEngine.enabled) return;
  ensureAudio();
  audioEngine.trackChangeToken += 1;
  window.clearInterval(audioEngine.loopTimerId);
  audioEngine.loopTimerId = null;
  audioEngine.transitioning = false;
  audioEngine.fadeTimerIds.forEach(id => window.clearInterval(id));
  audioEngine.fadeTimerIds = [];
  const players = audioEngine.musicPlayers.filter(player => player && !player.paused && player.volume > 0);
  audioEngine.currentTheme = null;
  audioEngine.musicKey = null;
  updateDevPanel();
  if (!players.length) return;
  players.forEach(player => {
    fadePlayer(player, 0, duration, () => {
      player.pause();
      updateDevPanel();
    });
  });
}

function playSfx(type) {
  if (!audioEngine.enabled) return;
  const config = sfxTracks[type];
  if (!config) return;
  if (type === "advance" && audioEngine.sfxContext && audioEngine.advanceBuffer) {
    const source = audioEngine.sfxContext.createBufferSource();
    const gainNode = audioEngine.sfxContext.createGain();
    gainNode.gain.value = config.volume;
    source.buffer = audioEngine.advanceBuffer;
    source.connect(gainNode);
    gainNode.connect(audioEngine.sfxContext.destination);
    source.addEventListener("ended", () => {
      source.disconnect();
      gainNode.disconnect();
    }, { once: true });
    source.start(0);
    updateDevPanel();
    return;
  }
  if (type === "advance" && audioEngine.advancePlayer) {
    const effect = audioEngine.advancePlayer;
    effect.pause();
    try { effect.currentTime = 0; } catch (error) {}
    effect.volume = config.volume;
    effect.play().then(updateDevPanel).catch(() => {});
    return;
  }
  if (config.channel && audioEngine.sfxChannels[config.channel]) {
    stopSfxChannel(config.channel);
  }
  const effect = new Audio(config.src);
  effect.volume = config.volume;
  trackSfxPlayer(effect, config.src, "sfx");
  if (config.channel) {
    audioEngine.sfxChannels[config.channel] = effect;
    effect.addEventListener("ended", () => {
      if (audioEngine.sfxChannels[config.channel] === effect) delete audioEngine.sfxChannels[config.channel];
    }, { once: true });
  }
  const startPlayback = () => {
    if (config.startAt) {
      try { effect.currentTime = config.startAt; } catch (error) {}
    }
    effect.play().then(updateDevPanel).catch(() => untrackSfxPlayer(effect));
  };
  if (config.startAt) {
    if (effect.readyState >= 1) startPlayback();
    else effect.addEventListener("loadedmetadata", startPlayback, { once: true });
    effect.load();
    return;
  }
  effect.play().then(updateDevPanel).catch(() => untrackSfxPlayer(effect));
}

function resolveMusicKey() {
  if (audioEngine.musicOverrideKey && musicThemes[audioEngine.musicOverrideKey]) {
    return audioEngine.musicOverrideKey;
  }
  if (["black", "lodge", "checkIn"].includes(audioEngine.locationKey)) {
    return locationMusic[audioEngine.locationKey] || "lodge";
  }
  const characterMusic = audioEngine.characterKey && LOVE_INTEREST_KEYS.includes(audioEngine.characterKey) ? audioEngine.characterKey : null;
  return characterMusic || locationMusic[audioEngine.locationKey] || "lodge";
}

function playMusicTrack(musicKey) {
  if (!audioEngine.enabled || !musicThemes[musicKey]) return;
  const transitionToken = audioEngine.trackChangeToken + 1;
  audioEngine.trackChangeToken = transitionToken;
  const theme = musicThemes[musicKey];
  window.clearInterval(audioEngine.loopTimerId);
  audioEngine.loopTimerId = null;
  audioEngine.fadeTimerIds.forEach(id => window.clearInterval(id));
  audioEngine.fadeTimerIds = [];
  const outgoing = audioEngine.currentTheme ? audioEngine.musicPlayers[audioEngine.activeMusicIndex] : null;
  const incomingFadeMs = audioEngine.musicResumeFadeMs || (outgoing ? 1800 : 900);
  audioEngine.musicResumeFadeMs = null;
  const incomingIndex = outgoing ? (audioEngine.activeMusicIndex === 0 ? 1 : 0) : 0;
  const incoming = audioEngine.musicPlayers[incomingIndex];
  incoming.pause();
  incoming.src = theme.src;
  incoming.load();
  const startPlayback = () => {
    if (!audioEngine.enabled || audioEngine.trackChangeToken !== transitionToken) return;
    incoming.currentTime = theme.loopStart;
    incoming.volume = 0;
    incoming.play().catch(() => {});
    if (audioEngine.pendingMusicStartSfx) {
      playSfx(audioEngine.pendingMusicStartSfx);
      audioEngine.pendingMusicStartSfx = null;
    }
    fadePlayer(incoming, theme.volume, incomingFadeMs);
    if (outgoing) fadePlayer(outgoing, 0, 1800, () => {
      outgoing.pause();
      outgoing.currentTime = theme.loopStart;
      updateDevPanel();
    });
    audioEngine.currentTheme = theme;
    audioEngine.musicKey = musicKey;
    audioEngine.activeMusicIndex = incomingIndex;
    audioEngine.transitioning = false;
    audioEngine.loopTimerId = window.setInterval(checkMusicLoop, 120);
    updateDevPanel();
  };
  audioEngine.transitioning = Boolean(outgoing);
  if (incoming.readyState >= 2) startPlayback();
  else incoming.addEventListener("canplay", startPlayback, { once: true });
}

function checkMusicLoop() {
  if (!audioEngine.enabled || !audioEngine.currentTheme || audioEngine.transitioning) return;
  const current = audioEngine.musicPlayers[audioEngine.activeMusicIndex];
  if (!current || current.readyState < 2) return;
  if (current.currentTime >= audioEngine.currentTheme.loopEnd - 0.08) {
    const overflow = Math.max(0, current.currentTime - audioEngine.currentTheme.loopEnd);
    current.currentTime = Math.min(audioEngine.currentTheme.loopStart + overflow, audioEngine.currentTheme.loopEnd - 0.12);
  }
}

function fadePlayer(player, targetVolume, duration, onComplete) {
  const startVolume = player.volume;
  const startTime = performance.now();
  const timerId = window.setInterval(() => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / duration);
    player.volume = startVolume + (targetVolume - startVolume) * progress;
    if (progress >= 1) {
      window.clearInterval(timerId);
      audioEngine.fadeTimerIds = audioEngine.fadeTimerIds.filter(id => id !== timerId);
      if (onComplete) onComplete();
    }
  }, 16);
  audioEngine.fadeTimerIds.push(timerId);
}

function fadeDetachedPlayer(player, targetVolume, duration, onComplete) {
  const startVolume = player.volume;
  const startTime = performance.now();
  const timerId = window.setInterval(() => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / duration);
    player.volume = startVolume + (targetVolume - startVolume) * progress;
    if (progress >= 1) {
      window.clearInterval(timerId);
      if (onComplete) onComplete();
    }
  }, 16);
}

function resolveValue(value) {
  return typeof value === "function" ? value() : value;
}

function resolveSprite(character, expression) {
  if (character.sprites) return character.sprites[expression] || character.sprites.neutral;
  return character.sprite || "";
}

function characterSprites(slug) {
  return {
    neutral: `assets/charactures/${slug}/neutral.png`,
    blushing: `assets/charactures/${slug}/blushing.png`,
    grumpy: `assets/charactures/${slug}/grumpy.png`,
    laughing: `assets/charactures/${slug}/laughing.png`
  };
}

function shouldPlayDoorSfx(previousLocation, nextLocation, nextTime) {
  if (!previousLocation || previousLocation === nextLocation) return false;
  if (previousLocation === "black" || nextLocation === "black") return false;
  if (nextLocation === "lodge") return true;
  return previousLocation === "lodge" && nextTime === "daytime";
}

function formatText(text) {
  return String(text).replaceAll("{playerName}", state.playerName);
}

function resolveName(character) {
  return typeof character.name === "function" ? character.name() : character.name;
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("active");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => els.toast.classList.remove("active"), 2200);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function base64UrlEncode(text) {
  let binary = "";
  if (window.TextEncoder) {
    const bytes = new TextEncoder().encode(text);
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  } else {
    binary = unescape(encodeURIComponent(text));
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function base64UrlDecode(text) {
  const normalized = String(text || "").replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  if (window.TextDecoder) {
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  return decodeURIComponent(escape(binary));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
