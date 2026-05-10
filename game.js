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
let lineAutoAdvanceTimer = null;
let establishingPauseTimer = null;
const DEV_HISTORY_LIMIT = 100;
let devHistory = [];

const characters = {
  player: { name: () => state.playerName, sprite: "", color: "#7b2f24" },
  narrator: { name: "Narrator", sprite: "", color: "#5f3a19" },
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
  dakota: { name: "Dakota", shortName: "Dakota", park: "Sequoia", location: "sequoia", sprites: characterSprites("dakota"), color: "#704719" },
  natai: { name: "Natai", shortName: "Natai", park: "Zion", location: "zion", sprites: characterSprites("natai"), color: "#245f76" }
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
  jackCabinNight: "bg-smoky",
  jackCabinDay: "bg-smoky",
  sequoia: "bg-smoky",
  zion: "bg-zion"
};

const musicThemes = {
  introspection: { src: "assets/audio/music/Almost Bliss.mp3", loopStart: 11.2, loopEnd: 303.4, volume: 0.34 },
  lodge: { src: "assets/audio/music/Clear Air.mp3", loopStart: 8.2, loopEnd: 176.8, volume: 0.52 },
  checkIn: { src: "assets/audio/music/Evening.mp3", loopStart: 7.4, loopEnd: 176.8, volume: 0.46 },
  jack: { src: "assets/audio/music/Windswept.mp3", loopStart: 9.6, loopEnd: 199.8, volume: 0.5 },
  caleb: { src: "assets/audio/music/On My Way.mp3", loopStart: 11.2, loopEnd: 243.8, volume: 0.5 },
  sierra: { src: "assets/audio/music/Morning.mp3", loopStart: 6.0, loopEnd: 146.0, volume: 0.54 },
  dakota: { src: "assets/audio/music/Fireflies and Stardust.mp3", loopStart: 9.0, loopEnd: 244.5, volume: 0.5 },
  natai: { src: "assets/audio/music/Crowd Hammer.mp3", loopStart: 7.5, loopEnd: 198.5, volume: 0.45 }
};

const locationMusic = {
  black: "introspection",
  lodge: "lodge",
  checkIn: "checkIn",
  olympic: "jack",
  yellowstone: "caleb",
  yellowstoneMisty: "caleb",
  yosemite: "sierra",
  sequoia: "dakota",
  zion: "natai"
};

const sfxTracks = {
  advance: { src: "assets/audio/sfx/qubodup-click/qubodup-click/qubodup-click2.wav", volume: 0.26 },
  choice: { src: "assets/audio/sfx/snd_close_map.wav", volume: 0.18 },
  type: { src: "assets/audio/sfx/qubodup-click/qubodup-click/qubodup-hover2.wav", volume: 0.12 },
  scene: { src: "assets/audio/sfx/snd_use_map.wav", volume: 0.16, startAt: 0.06 },
  character: { src: "assets/audio/sfx/qubodup-click/qubodup-click/qubodup-click1.wav", volume: 0.2 },
  save: { src: "assets/audio/sfx/chimey/Chime_Save.mp3", volume: 0.58 },
  door: { src: "assets/audio/sfx/creaky_door_hinge.wav", volume: 0.68 },
  thunderFlash: { src: "assets/audio/sfx/ambient/thunder_flash.wav", volume: 0.76 },
  busApproachStop: { src: "assets/audio/sfx/bus/bus_approach_stop.mp3", volume: 0.62, channel: "bus" },
  busIdle: { src: "assets/audio/sfx/bus/bus_idle.mp3", volume: 0.45, channel: "bus" },
  busDeparture: { src: "assets/audio/sfx/bus/bus_departure.mp3", volume: 0.62, channel: "bus" }
};

const ambientTracks = {
  bus: { src: "assets/audio/sfx/bus/school_bus_country_road_loop.ogg", volume: 0.32, delayMs: 1400, fadeMs: 2600 },
  rainForest: { src: "assets/audio/sfx/ambient/rain_forest_loop.ogg", volume: 0.34, fadeMs: 1800, stopFadeMs: 1600 },
  rainRoof: { src: "assets/audio/sfx/ambient/rain_roof_loop.mp3", volume: 0.42, fadeMs: 1800, stopFadeMs: 3600 },
  morningBirds: { src: "assets/audio/sfx/ambient/morning_birds_loop.wav", volume: 0.34, fadeMs: 2200, stopFadeMs: 1800 }
};

const cgLibrary = {
  jackCabin: { title: "Rain-Soaked Cabin", image: "assets/backgrounds/special/jack/cabin_interior_night.png" },
  jackFullLoveGood: { title: "Rain On The Roof", image: "assets/backgrounds/special/jack/cabin_interior_daytime.png" },
  calebSteam: { title: "Boardwalk Boundaries", image: "assets/backgrounds/time_variants/yellowstone/daytime.png" },
  calebFullLoveGood: { title: "Steam, Sparks, and Footnotes", image: "assets/backgrounds/special/yellowstone_night_misty.png" },
  sierraWaterfall: { title: "No Filter Needed", image: "assets/backgrounds/time_variants/yosemite/sunset.png" },
  sierraFullLoveGood: { title: "Where The Quiet Lands", image: "assets/backgrounds/special/yosemite_meadow_night.png" },
  dakotaGrove: { title: "Forest Protector", image: "assets/backgrounds/time_variants/sequoia/daytime.png" },
  nataiCanyon: { title: "Permit Approved", image: "assets/backgrounds/time_variants/zion/night.png" }
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
  }
};

const parkFlavor = {
  jack: {
    place: "the rain cabin",
    visit: {
      daytime: {
        low: ["Jack walks beside you like he has since the old volunteer trail days: broad shoulders, gentle voice, and one boot ready to block any terrible idea.", "The rainforest is silver-green and dripping. He points out nurse logs, elk tracks, and a mushroom he confidently calls a 'forest pancake.'"],
        neutral: ["Jack walks you through Olympic rain with the easy warmth of an old friend, explaining which boards are slick and which puddles are secretly lakes with ambition.", "He makes the forest feel familiar without making it smaller."],
        high: ["Jack meets you under the cedar eaves with two coffees, remembers exactly how you take yours, and nearly walks into a post while smiling at you.", "The old-growth trail smells like moss, coffee, and feelings that have apparently been waiting years to become inconvenient."]
      },
      sunset: {
        low: ["At sunset, Jack's cabin windows glow warm, and even when he is disappointed, he still saves you the dry side of the porch.", "He corrects your footing twice, then apologizes to the mud for blaming it out loud."],
        neutral: ["Gold light catches the rain in thin bright threads while Jack checks the trail markers and forgets whether east is left if he is facing south.", "He laughs at himself, then admits Olympic is best when the weather looks dramatic enough to need a hug."],
        high: ["Sunset turns the wet cedar trunks copper. Jack watches you watch them with the same open, baffled tenderness he used to save for stray dogs and broken camp chairs.", "He says the forest only gets this pretty for people who listen, then blushes because he clearly meant you."]
      },
      night: {
        low: ["Night folds around the cabin. Jack gives you the brighter lantern because he still cannot stop taking care of you, even when his feelings look bruised.", "Somewhere in the trees, water moves over stone like it has better secrets."],
        neutral: ["Jack leads a short lantern walk through the rain-dark forest, voice low, hand hovering near your elbow whenever the boardwalk shines wet.", "He points out how the trail changes after dark, then admits he once got turned around for ten minutes because two cedars looked 'emotionally identical.'"],
        high: ["By lantern light, Jack's grin is all rain and helpless honesty. He walks close enough that your sleeves brush and then looks amazed by sleeves as a concept.", "Olympic at night feels less like a park and more like a friendship finally saying the quiet part out loud."]
      }
    },
    surprise: {
      low: ["Jack is at check-in, frowning at a damp stack of maps like they personally betrayed him. He notices you and says, 'Hey. Please do not make me worry in three directions at once.'"],
      neutral: ["Jack is taping down a rain-smudged route card. 'The kiosk works better if you do not insult it where it can hear you. I think. I have never proved ears are not involved.'"],
      high: ["Jack leans against the check-in kiosk, rain in his hair and affection all over his face. 'I was going to say be careful, but then I saw you and forgot the other half of the sentence.'"]
    }
  },
  caleb: {
    place: "the Yellowstone boardwalk",
    visit: {
      daytime: {
        low: ["Caleb waits beside the Yellowstone boardwalk with three maps, two laminated diagrams, and the brittle calm of a man trying not to explain a caldera to someone who may not listen.", "Steam rolls over the thermal pools. He still points out the microbial mats, because being hurt has not cured him of wanting the place understood."],
        neutral: ["Caleb walks you past turquoise pools and hissing vents, narrating the route like Yellowstone is a beloved fantasy saga with footnotes.", "He starts with safety, detours into supervolcano history, and somehow makes both sound like flirting."],
        high: ["Caleb saves you the best view of the boardwalk, where the steam curls around him and his whole face lights up before he says the words 'hydrothermal plumbing.'", "He says your name softly, then blushes because he has written three mental fun facts about this exact moment and none of them are socially normal."]
      },
      sunset: {
        low: ["Sunset stains the geyser steam orange. Caleb's patience is present, but currently organized into bullet points.", "He asks whether you know why the colors around hot springs change by temperature, then looks wounded when he realizes he made it sound like a quiz."],
        neutral: ["Yellowstone glows at sunset, all mineral color and long shadows. Caleb relaxes when you stay behind the rail without being asked.", "He tells you the park has more than half the world's active geysers, then admits he was saving that fact for someone he wanted to impress."]
      ,
        high: ["At sunset, Caleb's smile appears through the steam like a rare thermal feature with a safety railing and excellent timing.", "He admits he likes showing you the park because you ask the kind of questions that make his whole brain sit up straighter."]
      },
      night: {
        low: ["The boardwalk is quiet at night. Caleb gives you a flashlight and a very exact history of why people should not underestimate quiet ground.", "A distant geyser exhales. He does not soften much, but when a coyote calls far off, he still whispers the fact he thinks you would like."],
        neutral: ["Night settles over Yellowstone in cool blue layers. Caleb points out the stars between columns of steam, then the steam, then the old eruption records he has memorized by season.", "His voice gets gentler when the crowds disappear, like trivia is the path he trusts toward tenderness."],
        high: ["Under the night sky, Caleb stands close while the hot springs breathe around you.", "He says Yellowstone is dangerous, gorgeous, full of patterns, and the first thing in years that has made him brave enough to be this obvious about liking someone."]
      }
    },
    surprise: {
      low: ["Caleb is correcting a tiny typo on a Yellowstone fact card. 'If you are about to visit someone, please try not to call geysers hot-spring fountains where I can hear you.'"],
      neutral: ["Caleb is refilling the emergency sunscreen basket while explaining that Yellowstone was established in 1872. He gives you one and says, 'Prepared is romantic in several climates.'"],
      high: ["Caleb catches you at check-in and presses a trail snack into your hand. 'For later. Also, did you know Old Faithful is not the largest geyser, only the most punctual celebrity? I am pretending both statements are logistics.'"]
    }
  },
  sierra: {
    place: "the Yosemite waterfall trail",
    visit: {
      daytime: {
        low: ["Sierra bounds ahead on the Yosemite trail, then stops to make sure you are actually looking at the overlook.", "Granite cliffs rise clean and enormous behind her. She says they are hard to impress, but you are welcome to keep trying on both of them."],
        neutral: ["Sierra leads you toward a waterfall throwing mist into the sun. She moves like the trail is a dance floor with consequences.", "She teases you into looking up from the obvious view to the better one, then adds that your focusing face is trouble."],
        high: ["Sierra waits at the waterfall overlook, bright-eyed and wind-tossed, like Yosemite personally gave her good lighting.", "She grins when mist catches in your hair and says Yosemite is showing off for you. Then she says it has excellent taste."]
      },
      sunset: {
        low: ["Sunset paints the granite pink. Sierra loves the view too much to stay annoyed, but she gives you no free points.", "She asks whether you can appreciate a cliff without making it about yourself, then smiles like she might grade the answer on charm."],
        neutral: ["The Yosemite cliffs warm to gold as Sierra slows down for once.", "She says sunset is when the park stops showing off and starts telling the truth, which is also her favorite time to make people blush."],
        high: ["Sierra pulls you to a viewpoint just as the granite catches fire with sunset.", "For a second she is quiet. Then she ruins the solemnity beautifully by saying the view is almost as distracting as you."]
      },
      night: {
        low: ["The waterfall is a pale line in the dark. Sierra keeps the pace brisk and the conversation sharper.", "She is still impossible to ignore, even when every smile arrives with a point on it."],
        neutral: ["At night, Yosemite turns spare and echoing. Sierra points out the sound of water before you can see it.", "She likes that you listen, and she tells you so in a voice designed to make listening difficult."],
        high: ["Moonlight turns the waterfall silver. Sierra takes your hand for one tricky step and does not immediately let go.", "She says some views work better when nobody is trying to caption them, then almost mentions another place before deciding you have not earned that secret yet."]
      }
    },
    surprise: {
      low: ["Sierra is perched near check-in, lacing her boots. 'Going somewhere? Try not to make the landscape carry the conversation. I have high standards for trail banter.'"],
      neutral: ["Sierra jogs past check-in, then doubles back. 'Hydrate. Also, if you see a dramatic cliff, say hello for me. If it tries to impress you, I taught it everything.'"],
      high: ["Sierra appears at check-in with waterfall mist still in her hair. 'I was not waiting for you. I just happened to choose the most obvious place to be found.'"]
    }
  },
  dakota: {
    place: "the Sequoia grove",
    visit: {
      daytime: {
        low: ["Dakota stands among the giant trees with a rake over one shoulder and a very measured expression.", "The sequoias make even awkward silence feel ancient."],
        neutral: ["Dakota shows you the grove slowly, giving each giant tree the kind of respect most people reserve for grandparents.", "He talks about shade, patience, and not leaving snacks where chaos can smell them."],
        high: ["Dakota beams when you arrive, huge and warm under the sequoias.", "He has saved you a quiet spot where the grove feels like a cathedral that prefers flannel."]
      },
      sunset: {
        low: ["Sunset filters through the trees. Dakota keeps the conversation gentle, but he does not hand you trust like a souvenir.", "He checks an old fire ring with careful, practiced hands."],
        neutral: ["The grove deepens to amber while Dakota talks about keeping old things alive without smothering them.", "It should sound heavy. From him, it sounds kind."],
        high: ["Sunset makes the sequoias glow, and Dakota looks at you like you are part of the warm light.", "He admits he likes when you visit because the grove feels less quiet after."]
      },
      night: {
        low: ["At night, Dakota's lantern swings low between the tree trunks. He is polite, watchful, and hard to fool.", "The grove absorbs your footsteps like it is considering you."],
        neutral: ["Dakota leads you through the night grove, where the giant trunks vanish upward into stars.", "He tells a soft joke about trees being excellent listeners and terrible texters."],
        high: ["The sequoias stand black against the stars. Dakota offers his hand without fanfare, steady as a railing.", "With him, the dark feels less empty and more held."]
      }
    },
    surprise: {
      low: ["Dakota is at check-in replacing a lantern wick. 'Even small fires need attention,' he says, not quite looking at you."],
      neutral: ["Dakota is arranging trail snacks by allergy label. 'Take one. Caring is easier when nobody is hungry.'"],
      high: ["Dakota brightens when he sees you at check-in and offers a warm biscuit wrapped in a napkin. 'Road fuel. Strictly professional biscuiting.'"]
    }
  },
  natai: {
    place: "the Zion canyon route",
    visit: {
      daytime: {
        low: ["Natai waits beneath red canyon walls, checking the permit board with surgical calm.", "The desert light is sharp. So are they."],
        neutral: ["Natai guides you through Zion's sandstone corridor, naming hazards like old rivals.", "They are dry, exact, and quietly pleased when you keep up."],
        high: ["Natai stands in desert light bright enough to turn every edge honest.", "They glance at you and say, 'Good. You made the canyon less smug.'"]
      },
      sunset: {
        low: ["Sunset sets the sandstone burning. Natai lets the view do the heavy lifting and keeps their answers spare.", "You get the sense they are waiting to see what you do with beauty when nobody grades you."],
        neutral: ["Zion at sunset is all copper walls and cooling air. Natai slows beside you without announcing it.", "They say the canyon has excellent taste in dramatic timing."],
        high: ["The canyon glows red around Natai, and their usual reserve thins into something almost tender.", "They tell you the desert keeps what matters and burns off the rest."]
      },
      night: {
        low: ["At night, Natai's route becomes shadow, stars, and firm boundaries.", "They do not dislike the silence. They may currently prefer it to you."],
        neutral: ["Natai takes you to a night-sky overlook where Zion becomes shape and hush.", "They point out constellations with the same precision they use for permits."],
        high: ["Under the dark Zion sky, Natai lets the silence stretch until it feels chosen.", "They stand close enough for warmth and say, 'Do not make me say this is nice.'"]
      }
    },
    surprise: {
      low: ["Natai is at check-in arguing with the kiosk in a voice too calm to be safe. 'It has more routing confidence than judgment.'"],
      neutral: ["Natai studies the check-in map, then taps your destination. 'Efficient. Emotionally suspicious, but efficient.'"],
      high: ["Natai catches you at check-in and silently adjusts your route card. 'There. Better odds of surviving your own charm.'"]
    }
  }
};

const checkInFlavor = {
  daytime: [
    ["narrator", "The check-in kiosk chirps, prints nothing, then proudly displays a tiny loading icon shaped like a pinecone."],
    ["player", "I am choosing to respect whatever this is."]
  ],
  sunset: [
    ["narrator", "A lizard pauses on the warm stone by the kiosk, judges your itinerary, and darts away."],
    ["player", "Honestly, fair."]
  ],
  night: [
    ["narrator", "The kiosk glows softly in the dark like it knows too much about geography and refuses to apologize."],
    ["player", "I am not asking follow-up questions after bedtime."]
  ]
};

const arrivalFlavor = {
  jack: {
    daytime: [
      ["narrator", "Olympic opens in layers of wet green: ferns slick with rain, cedar trunks vanishing upward, a cabin roof ticking softly under the weather."],
      ["player", "The air smells like moss, coffee, and Jack pretending he did not plan this reunion down to the mug."],
      ["narrator", "A porch board creaks. Jack steps out from under the eaves, broad-shouldered and bright-eyed, like the forest has been hiding your oldest friend for dramatic timing.", "jack"]
    ],
    sunset: [
      ["narrator", "Sunset catches in the Olympic rain until every drop looks briefly lit from inside."],
      ["player", "This is unfairly pretty. Even the puddles have emotional range. Jack is going to call one of them majestic."],
      ["narrator", "Jack waits beside the cabin steps, sleeves rolled, watching the trail with the loyal focus of someone who has always looked for you first.", "jack"]
    ],
    night: [
      ["narrator", "At night, the Olympic route narrows to lantern glow, black cedar shapes, and rain whispering in the dark."],
      ["player", "This is either romantic or how a cautionary tale gets excellent production design. With Jack, honestly, it could be both by accident."],
      ["narrator", "Jack lifts a lantern from the porch rail, his smile soft and immediate when he sees you.", "jack"]
    ]
  },
  caleb: {
    daytime: [
      ["narrator", "Yellowstone arrives in steam and mineral color, the boardwalk cutting a careful line through beautiful danger."],
      ["player", "Everything here looks like it could kill me and then be photogenic about it."],
      ["narrator", "Caleb appears at the rail with a clipboard, a pocket field guide, and the bright, helpless focus of a man one question away from explaining the whole park.", "caleb"]
    ],
    sunset: [
      ["narrator", "Sunset turns the geyser steam peach and gold, softening everything except the warning signs."],
      ["player", "The park is glowing. The signs are still yelling. Somewhere Caleb is probably delighted by both."],
      ["narrator", "Caleb checks the boardwalk gate, then looks up from a notebook labeled 'Things Yellowstone Is Doing Today' like he knew exactly when you would arrive.", "caleb"]
    ],
    night: [
      ["narrator", "Yellowstone after dark is blue steam, low boardwalk lights, and distant thermal breaths in the cold."],
      ["player", "The hot springs sound alive. That is gorgeous and deeply not reassuring."],
      ["narrator", "Caleb steps into the light with a flashlight, a star chart folded into his pocket, and a very serious expression doing a poor job hiding relief.", "caleb"]
    ]
  },
  sierra: {
    daytime: [
      ["narrator", "Yosemite rises around you in granite, pine, and waterfall mist that catches the sun in a thousand small flashes."],
      ["player", "Okay. I understand why people write poems and then pretend they did not. Also why Sierra would absolutely catch me doing it."],
      ["narrator", "Sierra jogs down from the overlook, bright as the spray behind her and already smiling like she has decided you are the fun part of the trail.", "sierra"]
    ],
    sunset: [
      ["narrator", "Sunset slides across Yosemite's granite faces, turning the cliffs warm enough to look impossible."],
      ["player", "The whole valley is showing off. Honestly, respect. Sierra is going to make that competitive somehow."],
      ["narrator", "Sierra leans against a trail sign, wind in her hair and a slow, dangerous grin aimed directly at you.", "sierra"]
    ],
    night: [
      ["narrator", "At night, Yosemite becomes a shape of cliffs and water sounds, huge and close in the dark."],
      ["player", "The waterfall is louder when I cannot see all of it. Sierra is probably going to tell me that was the point."],
      ["narrator", "Sierra's flashlight bobs along the trail before she appears, already moving like the dark is another path she knows by heart.", "sierra"]
    ]
  },
  dakota: {
    daytime: [
      ["narrator", "The Sequoia grove receives you in shade and quiet, each giant trunk making the world feel slower and older."],
      ["player", "I am suddenly aware that I have never been patient enough for a tree to approve of me."],
      ["narrator", "Dakota steps from behind a massive trunk carrying a coil of rope and a smile too warm for the cool air.", "dakota"]
    ],
    sunset: [
      ["narrator", "Sunset filters through the Sequoia canopy in long amber shafts, turning dust motes into tiny sparks."],
      ["player", "This place makes ordinary breathing feel like a respectful activity."],
      ["narrator", "Dakota kneels by an old fire ring, checking it with gentle seriousness before he notices you.", "dakota"]
    ],
    night: [
      ["narrator", "The night grove is quiet enough to make every footstep ask permission."],
      ["player", "The trees disappear upward into the stars. I feel very small, but not in a bad way."],
      ["narrator", "A lantern glow rounds one trunk, and Dakota follows it, steady as a promise.", "dakota"]
    ]
  },
  natai: {
    daytime: [
      ["narrator", "Zion's canyon walls rise red and clean around the trail, the desert light sharpening every edge."],
      ["player", "The whole place looks like it was carved by someone with excellent taste and no interest in subtlety."],
      ["narrator", "Natai stands by the permit board, marking a route with the precision of a person who has opinions about shortcuts.", "natai"]
    ],
    sunset: [
      ["narrator", "Sunset sets Zion's sandstone glowing copper, cooling the air while the canyon keeps the heat of the day."],
      ["player", "This view is extremely rude. It knows exactly what it is doing."],
      ["narrator", "Natai waits at the trail split, arms folded, watching the light change like it owes them an answer.", "natai"]
    ],
    night: [
      ["narrator", "At night, Zion becomes dark stone, pale trail dust, and a sky crowded with stars."],
      ["player", "The canyon is quieter now. Or maybe it is just making me listen harder."],
      ["narrator", "Natai's silhouette appears against the starlit route sign, still enough to seem carved there.", "natai"]
    ]
  }
};

const visitBeats = {
  jack: [
    {
      prompt: {
        low: ["jack", "Before we go anywhere, best-friend question with ranger muscles attached: are you going to treat the trail like a trail today?", "jack:grumpy"],
        neutral: ["jack", "First rule out here: the forest gets a vote. Second rule: I am still bad at pretending I am normal around you.", "jack"],
        high: ["jack", "I was hoping you would show up. I practiced saying that casually and then forgot what casual means.", "jack:blushing"]
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
        warm: [["jack", "Good. I like our adventures best when nobody has to carry anybody unless it is romantic or you twist an ankle. Wait. Not hoping for the ankle part.", "jack:laughing"], ["narrator", "He laughs at himself, warm and embarrassed, then offers his hand over the slick first step.", "jack"]],
        flirt: [["jack", "Careful. That is dangerously close to making me forget all my trail facts except 'wow.'", "jack:blushing"], ["narrator", "He holds your gaze for one rain-bright second before pointing at a fern like it just saved him.", "jack:blushing"]],
        bad: [["jack", "Stories are better when everyone gets home to tell them. Also when my chest does not do the scary drum thing.", "jack:grumpy"], ["narrator", "He is not trying to scold you. That somehow makes it worse.", "jack:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["narrator", "The trail bends through sword ferns and dripping cedar. Jack stops beside a mossy side path, blocking it with one boot and the worried patience you know too well.", "jack:grumpy"],
        neutral: ["narrator", "Rain beads on the cedar rail while Jack points out elk tracks, then briefly loses the word for hoof and calls them 'moose fingerprints.'", "jack"],
        high: ["narrator", "Jack slows where the old-growth canopy turns the rain into a soft, private percussion, his hand close enough to yours to make years of friendship feel suddenly delicate.", "jack:blushing"]
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
        flirt: [["jack", "I contain multitudes. Some of them know how to read a trail closure. Some of them are currently thinking about your face and cannot be trusted with navigation.", "jack:laughing"], ["player", "A devastating combination.", "jack:laughing"]],
        bad: [["jack", "Nope. Nope with love. A strong, respectful nope.", "jack:grumpy"], ["narrator", "He says it gently and still somehow becomes an entire locked gate.", "jack:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["jack", "We are heading back before the weather decides to make a point. Weather points are wet and I do not know how to argue with clouds.", "jack:grumpy"],
        neutral: ["jack", "There is a viewpoint ahead, then I should get you back before the route changes mood. Routes have moods. I learned that after losing to one.", "jack"],
        high: ["jack", "One more overlook. Then I return you to the impossible kiosk like a responsible adult, which I am approximately seventy percent of the time around you.", "jack:blushing"]
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
        warm: [["jack", "I did promise. I also promised I would learn the banjo, but this one worked out better for everybody.", "jack:laughing"], ["narrator", "He walks you back slowly, happy and bashful in a way friendship alone never used to explain.", "jack:laughing"]],
        flirt: [["jack", "To me. Right. I heard that. My brain is waving a tiny flag and falling down.", "jack:blushing"], ["narrator", "His smile follows you all the way back to the route marker, helpless and shining.", "jack:blushing"]],
        bad: [["jack", "The rain is the aesthetic. Also it worked really hard today. Probably.", "jack:grumpy"], ["narrator", "He turns toward the return trail, still kind, but quieter than before.", "jack:grumpy"]]
      }
    }
  ],
  caleb: [
    {
      prompt: {
        low: ["caleb", "Before we start, I need verbal confirmation that you understand the boardwalk is not decorative, and also that Yellowstone is not a volcano joke with scenery attached.", "caleb:grumpy"],
        neutral: ["caleb", "Boardwalk rule first. Beautiful things can still be dangerous. Second rule: if I say 'quick fact,' nobody in staff believes me, but I mean it with hope.", "caleb"],
        high: ["caleb", "I am glad you came. I prepared one safety reminder, one charming fact about microbial mats, and zero normal ways to arrange my face around you.", "caleb:blushing"]
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
        warm: [["caleb", "Excellent. Quick fact: those orange edges are heat-loving microbes, not mineral paint, which means the pretty colors are basically a living temperature chart. Sorry. That was... almost quick.", "caleb:laughing"], ["narrator", "He gestures you forward, visibly pleased that you asked for the part of him that keeps spilling over.", "caleb"]],
        flirt: [["caleb", "No. Sometimes I make it sound terrifying. Depends who is listening. You listening is statistically damaging to my composure.", "caleb:blushing"], ["player", "I am listening very respectfully.", "caleb:blushing"]],
        bad: [["caleb", "Then the mood can file a complaint with hydrothermal reality.", "caleb:grumpy"], ["narrator", "The steam hisses behind him like Yellowstone has prepared a peer-reviewed rebuttal.", "caleb:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["narrator", "Caleb stops near a milky blue pool, leaving enough space between you and the rail to imply he has measured it and resented the need.", "caleb:grumpy"],
        neutral: ["narrator", "Steam drifts across the boardwalk. Caleb names each pool with careful affection, like introducing complicated friends who have published several papers.", "caleb"],
        high: ["narrator", "At the overlook, Caleb lowers his voice so the steam, the hot spring, and the two of you share the same small world of facts he trusts enough to make intimate.", "caleb:blushing"]
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
        warm: [["caleb", "The first geyser I saw. It looked chaotic, but it was following a pattern older than me. I think I fell for the idea that wonder could have mechanics.", "caleb"], ["narrator", "He sounds almost shy about the sincerity of it, like he has just handed you the annotated edition of his heart.", "caleb:blushing"]],
        flirt: [["caleb", "Castle Geyser. Obviously. It has a cone that looks like a ruined fortress, eruptions that can last half an hour, and absolutely no idea how attractive commitment to structure can be.", "caleb:laughing"], ["narrator", "He realizes halfway through that he may not be talking only about geysers, and the blush is immediate.", "caleb:blushing"]],
        bad: [["caleb", "Back. Now. Curiosity does not require trespassing.", "caleb:grumpy"], ["narrator", "His hand catches your sleeve, firm and frightened under the anger.", "caleb:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["caleb", "I am walking you back before my emotional regulation becomes a ranger program called So You Dismissed A Man's Special Interest.", "caleb:grumpy"],
        neutral: ["caleb", "Last stop. Then I should get you back before the light changes the route markers. Also before I explain the entire 1988 fire season unprompted.", "caleb"],
        high: ["caleb", "One more view. Then I release you back into the wild, reluctantly, with snacks, and with only the top five Yellowstone facts I have restrained myself from saying.", "caleb:blushing"]
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
        warm: [["caleb", "That is... exactly why I do this. Not the romance part. I mean, possibly the romance part. Statistically emerging.", "caleb:blushing"], ["narrator", "For once, Caleb has no clean citation ready. Just a smile he cannot file away.", "caleb:blushing"]],
        flirt: [["caleb", "It can. The top five list has subcategories, but I can make eye contact through at least forty percent of it.", "caleb:laughing"], ["narrator", "He hands you the snack like it is evidence and looks absurdly pleased when your fingers brush.", "caleb:laughing"]],
        bad: [["caleb", "Then I have not explained them well enough, or you have decided not to hear me. I can only fix one of those.", "caleb:grumpy"], ["narrator", "He guides you back with professional precision and personal disappointment.", "caleb:grumpy"]]
      }
    }
  ],
  sierra: [
    {
      prompt: {
        low: ["sierra", "Tell me you came here to actually see Yosemite, not just use it as proof you went somewhere. Lie prettily if you must; I will still know.", "sierra:sly"],
        neutral: ["sierra", "Rule one: look up. Yosemite hates being treated like wallpaper, and I hate competing with wallpaper for your eyes.", "sierra:sly"],
        high: ["sierra", "You made it. Good. The waterfall was getting impatient, and so was I. Mine is cuter. Do not let either of us catch you only looking at the loud part.", "sierra:sly"]
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
        warm: [["sierra", "There. That pause? That is the good stuff.", "sierra"], ["sierra", "See, I knew you could let the place get to you if you stopped arguing with it.", "sierra:sly"], ["narrator", "She smiles like you found a trail marker hidden in plain sight, then looks away before the smile can tell on her.", "sierra"]],
        flirt: [["sierra", "Oh, that was smooth.", "sierra:blushing"], ["sierra", "Complicated is my best angle. Keep looking up, though. I want Yosemite to think it still has a chance.", "sierra:sly"], ["player", "I respect the terrain.", "sierra:blushing"]],
        bad: [["sierra", "Oh, we are doing this the hard way. Fine. I look incredible when I am right.", "sierra:sly"], ["narrator", "She steps between you and the shot with athletic precision.", "sierra:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["narrator", "Sierra leads you up the trail at a pace that suggests forgiveness has cardio requirements and you are currently behind on both.", "sierra:grumpy"],
        neutral: ["narrator", "The waterfall throws cool mist across the trail. Sierra slows just enough for you to catch the rainbow in it, and maybe the way she checks your reaction.", "sierra"],
        high: ["narrator", "Sierra takes the steep steps two at a time, then waits at the top pretending she did not check whether you followed, whether you enjoyed the view, or whether you noticed the quiet after her laugh.", "sierra:blushing"]
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
        warm: [["sierra", "The sound. Everyone photographs the water. Fewer people listen to it arrive.", "sierra"], ["sierra", "I like people who notice before the proof shows up. Very inconvenient for my whole mysterious act.", "sierra:blushing"], ["sierra", "Fewer still look that good doing it.", "sierra:sly"], ["narrator", "For a moment, she lets the trail go quiet around you.", "sierra"]],
        flirt: [["sierra", "A mountain?", "sierra:laughing"], ["sierra", "Please. Mountains are subtle compared to me.", "sierra:sly"], ["narrator", "She laughs and darts ahead, daring you to keep up.", "sierra:laughing"]],
        bad: [["sierra", "The view is not a vending machine. You do have to move toward it. Same rule applies to me, inconveniently.", "sierra:sly"], ["narrator", "Her expression could cut switchbacks.", "sierra:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["sierra", "We are almost done. Try to leave with one genuine memory. Bonus points if it involves me being unfairly memorable.", "sierra:sly"],
        neutral: ["sierra", "Last overlook. Then I return you before the trail decides we are part of it. Though I do like the sound of being difficult to leave.", "sierra:sly"],
        high: ["sierra", "One more overlook. No captions. Just us, an unreasonable amount of granite, and me behaving with almost heroic restraint. If I ever show you my favorite quiet place, act natural.", "sierra:sly"]
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
        flirt: [["sierra", "Careful.", "sierra:blushing"], ["sierra", "Talk like that and I will start believing you have taste.", "sierra:sly"], ["narrator", "She bumps your shoulder with hers before starting down, slow enough that it feels intentional.", "sierra"]],
        bad: [["sierra", "That is a sad little sentence, and I reject it on behalf of the cliff. Also on behalf of my cheekbones.", "sierra:sly"], ["narrator", "She heads back with the pace of someone outrunning disappointment.", "sierra:grumpy"]]
      }
    }
  ],
  dakota: [
    {
      prompt: {
        low: ["dakota", "The grove is quiet today. I would like to keep it that way.", "dakota:grumpy"],
        neutral: ["dakota", "Walk slow here. The trees have been patient longer than any of us.", "dakota"],
        high: ["dakota", "I saved you the shaded path. It is the one that makes people whisper without being asked.", "dakota:blushing"]
      },
      choices: [
        { label: "Lower your voice and match his pace.", feelings: { dakota: 2 }, tone: "warm" },
        { label: "Ask if there is a faster way through.", feelings: { dakota: -2 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Lower your voice and ask where he wants you to walk.", feelings: { dakota: 1 }, tone: "warm", reaction: [["dakota", "Thank you. Quiet is easier to share when nobody has to wrestle it into place.", "dakota"], ["narrator", "His expression softens, slow and cautious.", "dakota"]] },
          { label: "Ask if the trees can really tell the difference.", feelings: { dakota: -3 }, tone: "bad", reaction: [["dakota", "I can.", "dakota:grumpy"], ["narrator", "The two words land softly and somehow sink deep.", "dakota:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["dakota", "Thank you. Some places ask gently, but they still ask.", "dakota"], ["narrator", "His smile comes slow and real.", "dakota"]],
        flirt: [["dakota", "That may be the nicest height joke I have ever received.", "dakota:laughing"], ["player", "I am a respectful innovator.", "dakota:laughing"]],
        bad: [["dakota", "Through, yes. With, no.", "dakota:grumpy"], ["narrator", "He does not sound angry. Somehow that makes it land harder.", "dakota:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["narrator", "Dakota stops by an old fire ring and checks the stones with careful hands.", "dakota:grumpy"],
        neutral: ["narrator", "The trail opens around a sequoia so wide it makes the air feel ceremonial.", "dakota"],
        high: ["narrator", "Dakota pauses beside a giant trunk, resting one hand against the bark like greeting an old friend.", "dakota:blushing"]
      },
      choices: [
        { label: "Ask him to teach you the fire-safety check.", feelings: { dakota: 2 }, tone: "warm" },
        { label: "Joke that one tiny ember cannot matter much.", feelings: { dakota: -2 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Ask before touching the fire ring stones.", feelings: { dakota: 1 }, tone: "warm", reaction: [["dakota", "Yes. Here, feel for warmth with the back of your hand first.", "dakota"], ["narrator", "He teaches you carefully, pleased by the asking more than he says.", "dakota"]] },
          { label: "Kick ash aside to see if anything is still hot.", feelings: { dakota: -3 }, tone: "bad", reaction: [["dakota", "Stop.", "dakota:grumpy"], ["narrator", "His gentleness disappears just long enough to show you the line.", "dakota:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["dakota", "Gladly. Caring is easier when your hands know what to do.", "dakota:laughing"], ["narrator", "He guides you through the check with patient pride.", "dakota:laughing"]],
        flirt: [["dakota", "Oh. That is... I am going to inspect this perfectly safe bark now.", "dakota:blushing"], ["narrator", "He turns pink enough that even the sunset would be jealous.", "dakota:blushing"]],
        bad: [["dakota", "Every big fire starts by being small enough to ignore.", "dakota:grumpy"], ["narrator", "His voice stays gentle, but the grove seems to hold its breath.", "dakota:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["dakota", "I should walk you back. The grove has had enough noise for one visit.", "dakota:grumpy"],
        neutral: ["dakota", "We should head back while the route is easy to read.", "dakota"],
        high: ["dakota", "One last quiet minute, then I will stop selfishly keeping you under my favorite trees.", "dakota:blushing"]
      },
      choices: [
        { label: "Tell him the grove feels safer because he cares for it.", feelings: { dakota: 2 }, tone: "warm" },
        { label: "Ask if favorite trees count as date witnesses.", feelings: { dakota: 2 }, tone: "flirt" },
        { label: "Say you are ready to go because it all looks the same.", feelings: { dakota: -2 }, tone: "bad" }
      ],
      choicesByMood: {
        low: [
          { label: "Thank him for trusting you with even a little of the grove.", feelings: { dakota: 1 }, tone: "warm", reaction: [["dakota", "A little trust is still trust. It matters.", "dakota"], ["narrator", "He lets the words rest between you like a lantern set down carefully.", "dakota"]] },
          { label: "Ask if everyone gets this disappointed-tree speech.", feelings: { dakota: -3 }, tone: "bad", reaction: [["dakota", "No. I usually save my disappointment for people I hoped would understand.", "dakota:grumpy"], ["narrator", "The walk back feels longer after that.", "dakota:grumpy"]] }
        ]
      },
      reactions: {
        warm: [["dakota", "That means more than you know.", "dakota:blushing"], ["narrator", "He walks you back with a shy smile and the steady glow of the lantern.", "dakota:blushing"]],
        flirt: [["dakota", "They are very discreet. Terrible at gossip.", "dakota:laughing"], ["narrator", "His laugh rolls through the grove, warm and low.", "dakota:laughing"]],
        bad: [["dakota", "Then I hope one day it does not.", "dakota:grumpy"], ["narrator", "He leads the way back, quiet settling between you like fallen needles.", "dakota:grumpy"]]
      }
    }
  ],
  natai: [
    {
      prompt: {
        low: ["natai", "Before we begin, are you here to follow the route or argue with geology?", "natai:grumpy"],
        neutral: ["natai", "The canyon is simple if you respect it. People complicate things.", "natai"],
        high: ["natai", "You came. Good. The canyon was becoming insufferable without competition.", "natai:blushing"]
      },
      choices: [
        { label: "Tell them you will respect the route without requiring applause.", feelings: { natai: 1 }, tone: "warm" },
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
        flirt: [["natai", "It cannot. But it has seniority, which you lack.", "natai:laughing"], ["player", "A formidable opponent.", "natai:laughing"]],
        bad: [["natai", "Strict enough that I become unpleasant in defense of them.", "natai:grumpy"], ["narrator", "Their calm is somehow sharper than yelling, and twice as hard to recover from.", "natai:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["narrator", "Natai stops where the canyon narrows, letting the silence make its own argument.", "natai:grumpy"],
        neutral: ["narrator", "The sandstone walls hold the day's warmth while Natai traces the route with one precise finger.", "natai"],
        high: ["narrator", "Natai slows at a bend where the canyon light turns deep red and private.", "natai:blushing"]
      },
      choices: [
        { label: "Ask what the desert taught them to notice first.", feelings: { natai: 1 }, tone: "warm" },
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
        flirt: [["natai", "That is the most tolerable thing anyone has said about paperwork.", "natai:laughing"], ["narrator", "Their smile is quick, rare, and gone before it can be used against them.", "natai:laughing"]],
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
        flirt: [["natai", "Wise. I know where all the difficult switchbacks are.", "natai:blushing"], ["narrator", "Their shoulder almost brushes yours, then does not. Natai makes even restraint feel deliberate.", "natai:blushing"]],
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
      ["player", "The bus is dark enough that the window only gives me my own face back."],
      ["player", "Somewhere beyond the glass, a country road keeps unspooling under the tires. Fence posts. Pines. The occasional mailbox leaning like it has survived gossip."],
      ["player", "Two weeks ago, I was editing a sunrise video at three in the morning and arguing with strangers about whether a cliff looked better in vertical or horizontal."],
      ["player", "Then one of my posts went viral for all the wrong reasons: one careless shortcut, one badly framed apology, and one comment section that turned into a controlled burn."],
      ["player", "That is when Jack called. My Jack, technically. Old friend, Olympic route lead, human campfire with biceps, once asked me whether email needed stamps."],
      ["player", "He said the retreat had one open spot, that I needed somewhere kinder than the internet to learn from the mistake, and that he would be there if I wanted a familiar face."],
      ["player", "He did not say he missed me. Jack is good-hearted enough to carry three coolers at once and bad enough at subtext to trip over a feeling in broad daylight."],
      ["player", "So now I am on a bus to Viral Vista Lodge, where five national park route leads are apparently going to teach me how to look at a place without turning it into a backdrop."],
      ["player", "A creator retreat. A second chance. A very scenic consequence. And Jack, waiting somewhere ahead, which is somehow the comforting part and the terrifying part."]
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
      ["narrator", "Behind you, the engine rises again. The bus pulls away, fading down the road until the quiet has room to move back in.", null, { audio: "busDeparture" }],
      ["player", "No easy ride back now. Maybe that is the point."],
      ["player", "Okay, Jack. Please let this be one of your good ideas. Statistically, you are due."]
    ],
    next: "intro_checkin_arrival"
  },
  intro_checkin_arrival: {
    label: "Check-In",
    background: () => ({ location: "checkIn", time: "daytime" }),
    lines: [
      ["narrator", "Daylight spills across the outdoor check-in desk, all pine shadows, fresh coffee, and a kiosk humming with suspicious confidence."],
      ["player", "Hello? Retreat person? Person who knows where retreat people go?"],
      ["narrator", "No one answers. The lodge beyond the trees looks awake, but the check-in desk has been left to fend for itself."],
      ["player", "Cool. Love a welcome experience with abandonment as a design principle."],
      ["narrator", "A neat card waits on the table beside a stack of blank badges: Please fill out your name badge before proceeding to the lodge lobby."],
      ["player", "A badge. Right. If I am going to be emotionally reforested, I should probably label myself first."]
    ],
    nextAction: showNameEntry
  },
  intro_natai_checkin: {
    label: "Check-In",
    background: () => ({ location: "checkIn", time: "daytime" }),
    character: "natai",
    lines: [
      ["narrator", "The badge printer spits out your name with a tiny mechanical cough."],
      ["narrator", "Before you can pin it on straight, someone steps out from the shade beside the route map, arms folded, expression already disappointed in several things.", "natai:grumpy"],
      ["natai", "{playerName}. That is either your name or the kiosk has begun inventing evidence. Neither outcome comforts me.", "natai:grumpy"],
      ["player", "Nice to meet you too. I usually wait until the third sentence before accusing office supplies of crimes.", "natai:grumpy"],
      ["natai", "That was not an accusation. That was pattern recognition.", "natai:grumpy"],
      ["player", "Ah. A data-driven grudge. Very professional.", "natai:grumpy"],
      ["natai", "Hah.", "natai:laughing"],
      ["narrator", "It escapes them before they can stop it: one short laugh, sharp and unwillingly real.", "natai:laughing"],
      ["natai", "No. Do not look pleased. I am not encouraging this.", "natai:grumpy"],
      ["player", "Too late. I have been encouraged at a dangerously low threshold.", "natai:grumpy"],
      ["natai", "Natai. Zion route lead. Sandstone, permits, heat, flash floods, and the part where charm does not improve your odds.", "natai:grumpy"],
      ["player", "Noted. Charm filed under non-essential survival gear.", "natai"],
      ["natai", "File it under litter if it gets in the way.", "natai:grumpy"],
      ["narrator", "They adjust one corner of the route map by half an inch, glare at the kiosk like it personally lowered standards, and walk off toward the canyon trail.", "natai:grumpy"]
    ],
    next: "intro_after_natai_checkin"
  },
  intro_after_natai_checkin: {
    label: "Check-In",
    background: () => ({ location: "checkIn", time: "daytime" }),
    lines: [
      ["player", "That was weird."],
      ["player", "Informative. Hostile. Weird."],
      ["player", "Jack once said Natai was 'friendly like a locked shed with snacks inside.' I thought that was Jack being Jack. Apparently, no. Field note confirmed."],
      ["player", "I guess I better head over to the lodge lobby next, before the badge printer tells someone I have been loitering."]
    ],
    next: "intro_lodge_walk"
  },
  intro_lodge_walk: {
    label: "The Path",
    background: () => ({ location: "black", time: "daytime" }),
    lines: [
      ["narrator", "The path from check-in slips under the trees and keeps going longer than you expect."],
      ["narrator", "Gravel gives way to packed earth, then to wide stone steps softened by moss at the edges."],
      ["player", "For a place built around first impressions, this retreat is really making me earn the front door."],
      ["narrator", "At last, the trees open around a broad timber lodge with cedar siding, a deep wraparound porch, and tall windows glowing warm behind green-painted trim."],
      ["narrator", "A stone chimney climbs one side of the building, big enough to explain the fireplace you can already smell in the air."],
      ["player", "Okay. That looks like the kind of building where someone either hands you cocoa or a quest."],
      ["player", "Jack would absolutely try to do both and spill the cocoa while explaining the quest."],
      ["narrator", "You look around for a welcome committee. The porch is empty. The rocking chairs are still. Even the hanging ferns seem sworn to secrecy."],
      ["player", "Right. Cool. More mysterious hospitality."],
      ["narrator", "You climb the porch steps, take the heavy brass handle, and open the lodge door.", null, { audio: "door" }]
    ],
    next: "intro_lodge_lobby"
  },
  intro_lodge_lobby: {
    label: "Lodge Lobby",
    background: () => ({ location: "lodge", time: "daytime" }),
    character: "jack",
    lines: [
      ["narrator", "Inside the lodge lobby, cedar beams glow over a stone fireplace and a wall map crowded with impossible route pins."],
      ["narrator", "The whole place feels like summer camp if summer camp had better lighting and one unresolved friendship standing near the check-in table."],
      ["narrator", "Jack looks up from a welcome packet, red flannel stretched across shoulders that once moved an entire fallen log because a kid lost a hat under it.", "jack"],
      ["jack", "{playerName}. Hey. You made it. I mean, obviously you made it, you are standing there. Unless I am hallucinating, which would be rude of my brain.", "jack:blushing"],
      ["player", "Still you, then.", "jack"],
      ["jack", "Still me. Bigger beard, same amount of map confidence, which Caleb says is 'less reliable than an unsourced geyser prediction.' I do not know what that means, but he looked proud.", "jack:laughing"],
      ["narrator", "He pulls you into a hug before either of you can overthink it. Jack hugs like shelter: warm, solid, and completely unaware of subtlety.", "jack"],
      ["player", "Thanks for inviting me. I was not sure I deserved a soft landing.", "jack"],
      ["jack", "Everybody deserves somewhere to do better. Also I missed you, which is not professional retreat language but is true language.", "jack:blushing"],
      ["player", "Before I cry in the lobby, is Natai always like that?", "jack"],
      ["jack", "Like a storm cloud learned policy enforcement? Yeah. Natai's heart is in the right place; they just keep it behind three locked gates and a permit form. A nice permit form. Probably laminated.", "jack:laughing"],
      ["player", "They laughed at one joke and then looked furious about the paperwork of enjoying it.", "jack"],
      ["jack", "That means it went well. Natai laughing is like seeing a comet with cheekbones.", "jack:laughing"],
      ["player", "Comforting. I think.", "jack"],
      ["jack", "You'll get used to them. Or you will develop better posture from bracing yourself. Either way, growth. I learned that word in a staff meeting and I am using it responsibly.", "jack"],
      ["player", "I thought there would be a check-in packet.", "jack"],
      ["jack", "There is. It says welcome, hydrate, do not wander off trail, and if a sign says no, take it personally because signs are boundaries with tiny hats.", "jack:laughing"],
      ["player", "Signs do not have hats.", "jack"],
      ["jack", "Some of them do in spirit. Which brings us to your first important choice of the retreat.", "jack"]
    ],
    choices: [
      { label: "Tell him no means no, even from a trail sign in an invisible hat.", next: "intro_lodge_jack_two", feelings: { jack: 2 }, reaction: [["jack", "That is the kind of sentence that makes my whole chest do a high five.", "jack:laughing"], ["narrator", "He taps your welcome packet against his palm, smiling at you with years of affection and absolutely no poker face.", "jack:laughing"]] },
      { label: "Say rules are flexible if the shot is good enough.", next: "intro_lodge_jack_two", feelings: { jack: -2 }, reaction: [["jack", "No shot is good enough to make a rescue team hate your name. I like your name. I would like it absent from incident reports.", "jack:grumpy"], ["narrator", "The warmth in his face stays, but worry steps in front of it.", "jack:grumpy"]] }
    ]
  },
  intro_lodge_jack_two: {
    label: "Lodge Lobby",
    background: () => ({ location: "lodge", time: "daytime" }),
    lines: [
      ["narrator", "Jack walks you past the lobby map, where pins mark parks that should not fit on the same afternoon.", "jack"],
      ["jack", "Each route lead gets protective of their place. Occupational hazard of loving something visitors keep trying to simplify. I practiced that sentence three times and only said occupational wrong twice.", "jack"],
      ["player", "And you? Protective or hazard?", "jack"],
      ["jack", "Both, on a good day. Also strong enough to move the snack crates, which is why they keep me.", "jack:laughing"],
      ["player", "They keep you because you are kind.", "jack"],
      ["jack", "That too. I forget that one because it is not a muscle group.", "jack:blushing"]
    ],
    choices: [
      { label: "Ask what Olympic means to him after all these years.", next: "intro_lodge_jack_three", feelings: { jack: 2 }, reaction: [["jack", "Rain, mostly. Then trees old enough to make your problems feel badly scheduled. And the place I kept wanting to show you properly.", "jack"], ["narrator", "He says it like a joke, but there is devotion under the weather report and your name tucked inside it.", "jack:blushing"]] },
      { label: "Joke that visitors keep parks relevant.", next: "intro_lodge_jack_three", feelings: { jack: -2 }, reaction: [["jack", "Parks were relevant before any of us learned to point a camera at them. Sorry. That came out stern. My brain put on Caleb's debate cardigan.", "jack:grumpy"], ["narrator", "He looks apologetic immediately, but the correction still lands.", "jack:grumpy"]] }
    ]
  },
  intro_lodge_jack_three: {
    label: "Lodge Lobby",
    background: () => ({ location: "lodge", time: "daytime" }),
    lines: [
      ["narrator", "The lobby settles around you: low fire, old beams, route cards fanned across the desk like invitations with consequences.", "jack"],
      ["jack", "Before I hand you to the kiosk, one more thing. What are you actually hoping to get from this retreat?", "jack"],
      ["player", "Besides surviving the welcome packet and your sign theology?", "jack"],
      ["jack", "Ambitious. I like it. I also like you. As a person. Historically. Currently. Wow, this sentence has too many branches.", "jack:laughing"]
    ],
    choices: [
      { label: "Say you want to learn how to make people care without flattening the place.", next: "intro_lodge_jack_wrap", feelings: { jack: 2 }, reaction: [["jack", "That is... yeah. That is you when you let yourself be brave instead of loud.", "jack:blushing"], ["narrator", "He looks at you like he knows the old version of you and is already rooting for the next one.", "jack:blushing"]] },
      { label: "Say you mostly want better numbers and better views.", next: "intro_lodge_jack_wrap", feelings: { jack: -2 }, reaction: [["jack", "Then I hope the views do some work on you before the numbers do. I mean that kindly. The sentence is wearing work boots, but kindly.", "jack:grumpy"], ["narrator", "He gathers the route cards carefully, trying not to look as worried as he is.", "jack:grumpy"]] }
    ]
  },
  intro_lodge_jack_wrap: {
    label: "Lodge Lobby",
    background: () => ({ location: "lodge", time: "daytime" }),
    lines: [
      ["narrator", "Jack slides a route card into your welcome packet, then nods toward the lobby doors.", "jack"],
      ["jack", "Come on. The real check-in desk is outside, and if I leave the kiosk alone too long, it gets theatrical.", "jack"],
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
      ["narrator", "Outside again, the check-in kiosk waits under the trees, cheerful and unbothered by normal geography."],
      ["narrator", "Jack taps the route map with the corner of his clipboard.", "jack"],
      ["jack", "This desk is the center point between all the park routes. You come here, pick a direction, and the kiosk handles the rest.", "jack"],
      ["jack", "There is also the part where it bends space and time so you can jump between parks that are thousands of miles apart almost instantly. I asked how. They gave me a binder. I chose peace.", "jack:laughing"],
      ["player", "Wait, what?", "jack"],
      ["jack", "Anyway. Caleb is waiting at Yellowstone. Boardwalk rules, geothermal hazards, very handsome encyclopedia energy. Ask him one question and he starts glowing like a ranger station with Wi-Fi.", "jack"],
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
      ["narrator", "Yellowstone opens around you in steam, boardwalk rails, and blue pools that look too pretty to be allowed near human foolishness."],
      ["player", "The air smells like minerals, heat, and a warning label someone made scenic."],
      ["narrator", "A ranger at the rail turns as you approach, one hand on the nearest safety sign and the other holding a notebook bristling with color-coded tabs.", "caleb"],
      ["caleb", "Welcome to the boardwalk. It exists because the crust here can be thin, hot, and wildly uninterested in human confidence. Also because hydrothermal areas are basically Yellowstone's dramatic circulatory system.", "caleb"],
      ["player", "That was two warnings and a metaphor before hello.", "caleb"],
      ["caleb", "Hello. Sorry. I start in the middle when I am excited.", "caleb:blushing"],
      ["caleb", "Jack asked me to be nice to you. His exact words were, 'Be normal nice, not Yellowstone TED Talk nice.' I chose to interpret that as a challenge.", "caleb"],
      ["player", "That sounds painfully Jack and dangerously you.", "caleb"]
    ],
    choices: [
      { label: "Promise Caleb both feet are staying on the boardwalk and ask for a fact.", next: "intro_yellowstone_caleb_two", feelings: { caleb: 2 }, reaction: [["caleb", "Good. Fact: Yellowstone has more geysers than the rest of the world combined. Also, I like you already for asking, which is premature data but compelling.", "caleb:laughing"], ["narrator", "His smile is quick, bright, and almost immediately embarrassed by itself.", "caleb:laughing"]] },
      { label: "Joke that you came for views, not a science lecture.", next: "intro_yellowstone_caleb_two", feelings: { caleb: -2 }, reaction: [["caleb", "Then I will make the lecture scenic and tragically concise.", "caleb:grumpy"], ["narrator", "The look he gives you could laminate a safety poster and annotate it in the margins.", "caleb:grumpy"]] }
    ]
  },
  intro_yellowstone_caleb_two: {
    label: "Yellowstone",
    background: () => ({ location: "yellowstone", time: "daytime" }),
    lines: [
      ["narrator", "Caleb leads you a few careful steps down the boardwalk, where steam curls over the rail and vanishes into the sun.", "caleb"],
      ["caleb", "People think Yellowstone is trying to impress them. It is not. It is busy being itself, which includes sitting on one of the largest active volcanic systems on Earth like that is a reasonable personality trait.", "caleb"],
      ["player", "You admire it for being dramatic and well-documented.", "caleb"]
    ],
    choices: [
      { label: "Ask what first made him love the park.", next: "intro_yellowstone_caleb_three", feelings: { caleb: 2 }, reaction: [["caleb", "A geyser eruption when I was twelve. It scared me half to death, then made everything else feel too small. I went home and memorized the map instead of admitting I had feelings.", "caleb:blushing"], ["narrator", "He looks embarrassed by how honest that was, which makes it worse in the best way.", "caleb:blushing"]] },
      { label: "Ask whether he has always been this nerdy about Yellowstone.", next: "intro_yellowstone_caleb_three", feelings: { caleb: 2 }, reaction: [["caleb", "No. As a child I was worse. I made my family observe Old Faithful predictions during dinner. Indoors. In Ohio.", "caleb:laughing"], ["narrator", "He laughs like he has chosen to find himself endearing and is only slightly surprised you seem to agree.", "caleb:laughing"]] },
      { label: "Ask whether every rule really matters.", next: "intro_yellowstone_caleb_three", feelings: { caleb: -2 }, reaction: [["caleb", "Here? Yes. Also I can provide a short historical appendix titled People Who Learned This Incorrectly.", "caleb:grumpy"], ["narrator", "The answer is short enough to leave steam hissing into the silence after it. The appendix, somehow, is implied.", "caleb:grumpy"]] }
    ]
  },
  intro_yellowstone_caleb_three: {
    label: "Yellowstone",
    background: () => ({ location: "yellowstone", time: "daytime" }),
    lines: [
      ["narrator", "The boardwalk opens to one last pool, blue at the center and ringed with impossible color.", "caleb"],
      ["caleb", "This is usually where people stop talking. I support quiet, but I also need you to know the blue means it is absorbing every color except blue because of depth and clarity, not because nature owns a drama department.", "caleb"],
      ["player", "You are physically incapable of leaving wonder unexplained.", "caleb"]
    ],
    choices: [
      { label: "Tell him the explanation makes the wonder better.", next: "intro_yellowstone_wrap", feelings: { caleb: 2 }, reaction: [["caleb", "That is a very unfair thing to say to a man trying to remain professionally composed.", "caleb:blushing"], ["narrator", "He says it softly, like you just found the main trail into him.", "caleb:blushing"]] },
      { label: "Ask him to stand quietly with you anyway.", next: "intro_yellowstone_wrap", feelings: { caleb: 1 }, reaction: [["caleb", "I can do quiet. I may think loudly, but I can do quiet.", "caleb"], ["narrator", "For a few breaths, he lets the pool be itself beside you, and the restraint feels like trust.", "caleb:blushing"]] },
      { label: "Admit you still want one closer picture.", next: "intro_yellowstone_wrap", feelings: { caleb: -2 }, reaction: [["caleb", "Then I am walking you back before wanting becomes doing.", "caleb:grumpy"], ["narrator", "He is not cruel about it. Somehow that makes disappointing him worse.", "caleb:grumpy"]] }
    ]
  },
  intro_yellowstone_wrap: {
    label: "Yellowstone",
    background: () => ({ location: "yellowstone", time: "daytime" }),
    lines: [
      ["narrator", "Caleb checks the route card, then tucks his notebook under one arm like he is trying to look casual about the tabs.", "caleb"],
      ["caleb", "That is your Yellowstone introduction. Short enough to keep you safe, long enough that I hope you remember the microbes, the caldera, and at least one emotionally significant geyser.", "caleb"],
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
      ["narrator", "When the kiosk returns you to check-in, sunset has poured itself over the roofline in apricot and rose."],
      ["player", "Okay. That is ridiculously pretty. Also getting late, which feels like the universe politely tapping its watch."],
      ["player", "Move quickly. Admire efficiently."]
    ],
    next: "intro_yosemite_sierra"
  },
  intro_yosemite_sierra: {
    label: "Yosemite",
    background: () => ({ location: "yosemite", time: "sunset" }),
    lines: [
      ["narrator", "Yosemite greets you with waterfall mist, huge granite walls, and sunset light doing absolutely nothing subtle."],
      ["player", "The whole valley looks like it knows it is the main character."],
      ["narrator", "A woman jogs down from the overlook as if gravity signed a waiver for her, then slows with a grin that feels personally illegal.", "sierra"],
      ["sierra", "You made it. Good. The cliff was starting to think you were intimidated. I told it to wait until you saw me.", "sierra:sly"],
      ["player", "I am intimidated. I am just being stylish about it.", "sierra:laughing"],
      ["sierra", "Excellent. Brave enough to admit it, stylish enough to survive it. Keep up, pretty thing.", "sierra:sly"],
      ["sierra", "Also, Jack told me not to let you undersell yourself. He said it with his whole face, which is how Jack says everything. Cute, but exhausting.", "sierra:sly"],
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
      ["narrator", "Sierra leads you toward a small overlook where waterfall mist turns gold at the edges, checking over her shoulder like she knows exactly what that does to you.", "sierra"],
      ["sierra", "Most people aim at the biggest thing in front of them. Yosemite rewards peripheral vision. I reward eye contact.", "sierra:sly"],
      ["player", "That sounds suspiciously like life advice.", "sierra:laughing"]
    ],
    choices: [
      { label: "Ask what most people miss here.", next: "intro_yosemite_sierra_three", feelings: { sierra: 2 }, reaction: [["sierra", "The sound before the view. The water announces itself, and everyone still waits for proof.", "sierra"], ["sierra", "Same mistake people make with chemistry. Same mistake they make with people who joke too fast.", "sierra:blushing"], ["narrator", "She says it lightly, but the answer has roots and a wink at the end.", "sierra"]] },
      { label: "Tell her she notices things like someone in love with the place.", next: "intro_yosemite_sierra_three", feelings: { sierra: 1 }, reaction: [["sierra", "Obviously. Have you seen it?", "sierra:laughing"], ["sierra", "I am loyal to beauty. Present company included, if you keep behaving.", "sierra:sly"], ["narrator", "She laughs, but there is a blush tucked into the edge of it, quick enough that she hopes you missed it.", "sierra:blushing"]] },
      { label: "Tell her eye contact sounds like a dangerous reward.", next: "intro_yosemite_sierra_three", feelings: { sierra: 2 }, reaction: [["sierra", "Mm.", "sierra:blushing"], ["sierra", "It is. Yosemite has cliffs; I have follow-through.", "sierra:sly"], ["narrator", "She says it without missing a step, devastatingly casual.", "sierra"]] },
      { label: "Say the biggest thing is usually the best shot.", next: "intro_yosemite_sierra_three", feelings: { sierra: -2 }, reaction: [["sierra", "That is how people come home with twelve identical photos and no memory.", "sierra:grumpy"], ["sierra", "Tragic, especially when I am standing right here making your day more interesting.", "sierra:sly"], ["player", "Point taken.", "sierra:grumpy"]] }
    ]
  },
  intro_yosemite_sierra_three: {
    label: "Yosemite",
    background: () => ({ location: "yosemite", time: "sunset" }),
    lines: [
      ["narrator", "The trail steepens for one last push. Sierra stops at the top and waits, pretending not to check whether you are winded or flustered.", "sierra"],
      ["sierra", "Final test. What do you do when a place is bigger than your ability to describe it? Careful. I am judging the answer and the delivery.", "sierra:sly"],
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
      ["narrator", "Sierra walks you back down as sunset thins along the trail, her pace finally easy enough to feel companionable and still deliberately hard to ignore.", "sierra"],
      ["sierra", "That is the Yosemite sampler. Cliffs, water, humility, and one charming guide making heroic sacrifices for your character development.", "sierra:sly"],
      ["player", "And cardio.", "sierra:laughing"],
      ["sierra", "Cardio is how the park knows you meant it. Blushing is how I know you were listening.", "sierra:sly"]
    ],
    next: "intro_return_sunset_two"
  },
  intro_return_sunset_two: {
    label: "Check-In",
    background: () => ({ location: "checkIn", time: "sunset" }),
    lines: [
      ["narrator", "The kiosk brings you back to the check-in desk again. The last of sunset clings to the sign like it is reluctant to leave."],
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
      ["player", "It is officially late. If this kiosk starts glowing any harder, I am charging it rent for living in my nerves."],
      ["player", "Last visit, then sleep. That is a responsible sentence, probably."]
    ],
    next: "intro_zion_natai"
  },
  intro_zion_natai: {
    label: "Red Rock",
    background: () => ({ location: "zion", time: "night" }),
    lines: [
      ["narrator", "The red rock route waits under a sky packed with stars. Canyon walls rise around you like the dark has architecture."],
      ["player", "The desert is quieter than I expected. Not empty. Just extremely selective."],
      ["narrator", "Someone stands beside the route sign, still as sandstone until they turn their head.", "natai:grumpy"],
      ["natai", "You are late.", "natai:grumpy"],
      ["player", "By... the amount of time it took the kiosk to bend space?", "natai:grumpy"],
      ["natai", "I do not grade excuses on a curve.", "natai:grumpy"],
      ["player", "Is this your welcome speech?", "natai:grumpy"],
      ["natai", "No. That was me deciding whether to have one.", "natai:grumpy"],
      ["natai", "Jack vouched for you. He used the phrase 'good person, temporarily on fire.' I assume he meant metaphorically, because even Jack understands some nouns.", "natai:grumpy"],
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
      ["narrator", "Natai leads you along a pale ribbon of trail where the canyon walls hold the day's heat like a memory.", "natai"],
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
      ["narrator", "The route reaches a night-sky overlook. Above the canyon, stars crowd the dark until the silence feels deliberate.", "natai"],
      ["natai", "Last stop. After this, you go back to the lodge before exhaustion makes you poetic in a legally concerning way.", "natai:grumpy"],
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
      ["narrator", "Natai walks you back through the dark with the quiet confidence of someone who knows every stone by reputation.", "natai"],
      ["natai", "That is enough canyon for a first night. Any more and you will start assigning symbolism to boulders.", "natai:grumpy"],
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
        low: ["jack", "You will. I am still going to show you the good moss. I am just... worried at you right now, which is different from mad. I think.", "jack:grumpy"],
        neutral: ["jack", "You will. Olympic is not going anywhere, and neither is the rain. I am also not going anywhere, unless I trip over that rug again.", "jack"],
        high: ["jack", "You will see it later. I have been saving my favorite trail for you for years, which sounds normal until I hear it outside my head.", "jack:blushing"]
      }[mood];
      return [
        ["narrator", "The lodge lobby is quiet when you return, fireplace low, windows dark, the whole building smelling like cedar and sleep."],
        ["narrator", "Jack is by the fireplace, stacking route cards into a tidy pile that immediately leans sideways. He frowns at it with heroic commitment.", "jack"],
        ["player", "I am a little sad I did not get to see your park tonight.", "jack"],
        jackReply,
        ["player", "I did meet Natai.", "jack"],
        ["jack", "Ah. Zion's most scenic locked gate.", "jack:laughing"],
        ["player", "So it is not just me?", "jack:laughing"],
        ["jack", "Natai thinks warm welcomes are how people get complacent. Do not take the first frost personally. Do take the route rules personally. I am very pro-rule when rules keep you intact.", "jack"],
        ["player", "You sound like you rehearsed that.", "jack"],
        ["jack", "I did. Into a spoon because it looked reflective enough to be eye contact.", "jack:laughing"],
        ["jack", "Go sleep, {playerName}. Tomorrow gives you three chances to make something happen. Maybe four, if one of the things is breakfast.", "jack"],
        ["narrator", "You climb the lodge stairs with park dust on your shoes and too many voices still bright in your head."]
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
      ["narrator", "Somewhere below, the lodge settles. Somewhere outside, the impossible kiosk keeps its secrets."]
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
      ["narrator", `${TIME_LABELS[state.timeOfDay]} settles over the check-in desk. The kiosk waits with cheerful, physics-violating patience.`],
      ["player", state.timeOfDay === "sunset" ? "One more visit before night, unless I cash out early." : "It is night now. One more visit, or I can call it and sleep."]
    ],
    choices: () => [
      ...loveInterestChoices("Choose another route"),
      { label: "Return to the lodge lobby early.", action: returnToLodgeEarly }
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
      ["narrator", "The heart on Jack's route card warms under your thumb. The kiosk hums, thinks about being normal, and declines."],
      ["narrator", "Olympic opens around you in the usual night-dark hush: cedar silhouettes, wet ferns silvered by lantern light, Jack's cabin tucked beyond the trail like a secret the forest has been keeping."],
      ["player", "Jack?"],
      ["narrator", "The porch lantern lifts. Jack steps into view with his familiar grin already arriving before the rest of him.", "jack"],
      ["jack", "{playerName}. Hey. You made it. I was going to say something smooth, but then I saw you and all my sentences put on hiking boots and ran away.", "jack:blushing"],
      ["player", "That is pretty normal for us.", "jack:blushing"],
      ["jack", "Yeah. Good normal, though. The kind where I know where to stand, and you know I will pretend not to worry while absolutely worrying.", "jack"],
      ["narrator", "He offers the lantern handle. Your fingers brush around the warm metal, and the tiny contact rearranges the night more than it has any right to.", "jack:blushing"],
      ["jack", "I thought we could take the short loop. Nothing heroic. Just trees, rain smell, and maybe me finally saying one sincere thing without tripping over a fern.", "jack:blushing"],
      ["narrator", "White light cracks across the forest. For one instant every cedar branch turns sharp and silver.", null, { screenFlash: true, audio: "thunderFlash" }],
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
      ["jack", "Very official. Ranger-adjacent. Also I promised myself I would not let you get soaked on the night I finally worked up courage, so... please take cover in my cabin?", "jack:blushing"],
      ["player", "Lead the way, Jack.", "jack:blushing"],
      ["narrator", "He shields the lantern with one big hand and keeps the other near your elbow as you cross the slick porch boards. The rain follows you right up to the door."]
    ],
    next: "full_love_jack_cabin"
  },
  full_love_jack_cabin: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinNight", time: "night" }),
    ambient: "rainRoof",
    lines: [
      ["narrator", "Inside, Jack's cabin glows with lantern light and stove warmth. Rain drums against the roof in a steady, intimate rhythm."],
      ["narrator", "Jack shuts the door behind you, then immediately looks apologetic, like the weather is a guest he invited by mistake.", "jack:grumpy"],
      ["jack", "I am sorry. This was supposed to be romantic in a competent way, not romantic in a weather-emergency way.", "jack:grumpy"],
      ["player", "Jack. This is very you.", "jack"],
      ["jack", "That is either reassuring or a full performance review.", "jack:laughing"],
      ["narrator", "He laughs, then softens. The rain on the roof fills the pause so neither of you has to run from it.", "jack:blushing"],
      ["jack", "We were friends before any of this got complicated. Before the retreat, before the route cards, before I started looking at you and forgetting useful nouns.", "jack:blushing"],
      ["jack", "I keep thinking friendship should feel smaller than this. Familiar, safe, easy to carry. But with you it feels like it grew rooms while I was not looking.", "jack:blushing"],
      ["player", "Rooms?", "jack:blushing"],
      ["jack", "Yeah. Places I want to stay. Places I did not know I was allowed to want.", "jack:blushing"],
      ["narrator", "A wet chill finally catches up with you. You shiver before you can hide it, and Jack notices like noticing you is the oldest habit he has.", "jack:grumpy"],
      ["jack", "You're cold. Hold on. I have dry blankets, but my clean flannel is warmer than it has any right to be.", "jack:grumpy"],
      ["player", "You do not have to give me your shirt.", "jack:grumpy"],
      ["jack", "I know. That is why I want to.", "jack:blushing"]
    ],
    next: "full_love_jack_shirt"
  },
  full_love_jack_shirt: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinNight", time: "night" }),
    ambient: "rainRoof",
    lines: [
      ["narrator", "Jack turns away just enough to be polite and unbuttons the red flannel. When he faces you again, he is blushing, bare-chested, and holding the shirt out with both hands like it matters.", "jack:offeringShirt"],
      ["jack", "Here. It is dry. It smells like cedar smoke and probably me being nervous, but it will keep you warm.", "jack:offeringShirt"],
      ["player", "Jack...", "jack:offeringShirt"],
      ["jack", "I know this is a lot. I know we have been friends long enough that changing the shape of it feels like stepping off a trail we both memorized.", "jack:offeringShirt"],
      ["jack", "But I do not want to pretend the old trail is all there is. Not when being near you feels like coming home and getting lost at the same time.", "jack:offeringShirt"],
      ["narrator", "The shirt is warm from him. The rain keeps tapping overhead, patient as a heartbeat.", "jack:offeringShirt"]
    ],
    next: "full_love_jack_prompt"
  },
  full_love_jack_prompt: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinNight", time: "night" }),
    ambient: "rainRoof",
    lines: [
      ["jack", "If you take it, I need you to know what I mean. Not pressure. Not a joke. Just... me choosing to be brave with someone who already knows where all my clumsiest parts live.", "jack:offeringShirt"],
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
    ambient: "rainRoof",
    lines: [
      ["narrator", "You take the flannel. Jack watches your hands close around it like he is trying very hard to remember how breathing works.", "jack:offeringShirt"],
      ["player", "I want this. The friendship. The history. The part where it turns into more and we get to learn that slowly, messily, together.", "jack:offeringShirt"],
      ["jack", "Together is my favorite plan. I did not know plans could have favorites until right now.", "jack:offeringShirt"],
      ["narrator", "You slip into his shirt. It is too big in the sleeves, warm at the collar, and unfairly full of him.", "jack:offeringShirt"],
      ["jack", "Oh.", "jack:offeringShirt"],
      ["player", "Good oh?", "jack:offeringShirt"],
      ["jack", "Historically good. Possibly ranger-report good, except I would set the report on fire before letting Caleb edit it.", "jack:offeringShirt"],
      ["narrator", "He steps closer. Slowly. Carefully. Giving you every chance to stop him and hoping with his whole face that you will not need to.", "jack:offeringShirt"],
      ["player", "Jack."],
      ["narrator", "The kiss starts as a question and becomes an answer both of you already knew by heart. His hands settle at your waist over the borrowed flannel, reverent and shaking a little, and the cabin seems to draw warm around you.", "jack:offeringShirt"],
      ["jack", "I have wanted to do that for a very long time.", "jack:offeringShirt"],
      ["player", "How long?", "jack:offeringShirt"],
      ["jack", "Long enough that the honest answer needs its own trail map.", "jack:offeringShirt"],
      ["narrator", "The rest of the night unfolds in rain-soft pieces: another kiss by the stove, laughter against his shoulder, his shirt slipping from one shared warmth into another, Jack murmuring your name like he is still amazed he is allowed to.", "jack:offeringShirt"],
      ["narrator", "There is heat, and tenderness, and the deep relief of wanting someone who wants you back without making either of you smaller.", "jack:offeringShirt"],
      ["narrator", "At some point the storm refuses to let up. Jack pulls a blanket over both of you on the narrow cabin bed and promises, sleepily, to get you back to the lodge at first light.", "jack:offeringShirt"],
      ["jack", "For the record, I am still your friend.", "jack:offeringShirt"],
      ["player", "Good.", "jack:offeringShirt"],
      ["jack", "And also wildly, inconveniently, cabin-roof-rain-level in love with you.", "jack:offeringShirt"],
      ["narrator", "You answer him softly. The rain keeps its rhythm overhead until words become breathing, and breathing becomes sleep."]
    ],
    nextAction: completeJackFullLoveNight
  },
  full_love_jack_bad: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinNight", time: "night" }),
    ambient: "rainRoof",
    lines: [
      ["narrator", "Jack listens all the way through. The shirt stays offered between you, but his face does not close. If anything, it gets gentler.", "jack:offeringShirt"],
      ["player", "I love you, Jack. I do. But I think tonight I need that love to stay friendship-shaped.", "jack:offeringShirt"],
      ["jack", "Okay.", "jack:offeringShirt"],
      ["player", "Okay?", "jack:offeringShirt"],
      ["jack", "Yeah. Okay. Thank you for trusting me with the real answer.", "jack:offeringShirt"],
      ["narrator", "There is a flicker of disappointment, because Jack is honest enough to feel things when they happen. But he folds it carefully into kindness instead of making it your job.", "jack:offeringShirt"],
      ["jack", "Friendship-shaped is not a consolation prize. It is us. It is years of bad jokes and trail snacks and you knowing I say 'left' when I mean 'the other left.'", "jack:offeringShirt"],
      ["jack", "Also, I should probably put this back on before I try to be emotionally mature and catch a cold at the same time.", "jack:laughing"],
      ["narrator", "He pulls the flannel back on, cheeks pink, smile real. The cabin feels a little less charged and a lot more familiar.", "jack"],
      ["jack", "Since the rain has us trapped, do you want to play a board game? I have one about identifying mushrooms. Caleb says it is not a game because there is no scoring system. Caleb has clearly never experienced the thrill of correctly naming a fungus.", "jack:laughing"]
    ],
    next: "full_love_jack_friend_cabin"
  },
  full_love_jack_friend_cabin: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinNight", time: "night" }),
    ambient: "rainRoof",
    lines: [
      ["narrator", "So you sit at Jack's little table while rain drums over the cabin roof and he deals a stack of illustrated mushroom cards with the solemnity of a wilderness judge.", "jack"],
      ["player", "This mushroom looks fake.", "jack"],
      ["jack", "That is exactly what the mushroom wants you to think.", "jack:laughing"],
      ["narrator", "The game is ridiculous. Jack is delighted. You lose three rounds in a row to a man who keeps apologizing to the cards when he shuffles too aggressively.", "jack:laughing"],
      ["jack", "For the record, I am really glad you are here.", "jack:blushing"],
      ["player", "Even like this?", "jack:blushing"],
      ["jack", "Especially like this. Safe is not boring with you. Safe is... the place where I get to keep knowing you.", "jack:blushing"],
      ["narrator", "The night relaxes around that. No performance, no hard feelings, no pretending the friendship was ever small. Just the stove, the rain, and Jack laughing when you accuse a mushroom of emotional fraud.", "jack:laughing"]
    ],
    next: "full_love_jack_friend_rain_stop"
  },
  full_love_jack_friend_rain_stop: {
    label: "Jack's Cabin",
    background: () => ({ location: "jackCabinNight", time: "night" }),
    lines: [
      ["narrator", "Eventually the rain on the roof thins from a steady rush to a soft patter, then to a few last taps that fade into the cabin quiet."],
      ["jack", "Hear that? The storm is letting up.", "jack"],
      ["player", "So the mushroom tournament ends in a draw?", "jack"],
      ["jack", "A dignified pause. The mushrooms and I are both very secure about it.", "jack:laughing"],
      ["narrator", "He checks the porch, then comes back with your jacket and that practical Jack warmth that has always known how to get you home.", "jack"],
      ["jack", "Path's safe now. I will walk you out to the trail light.", "jack"]
    ],
    next: "full_love_jack_friend_goodbye"
  },
  full_love_jack_friend_goodbye: {
    label: "Olympic After Dark",
    background: () => ({ location: "olympic", time: "night" }),
    lines: [
      ["narrator", "Outside, Olympic is wet and shining under the night sky. The cabin glows behind Jack, warm in the trees, while the forest exhales after the storm."],
      ["narrator", "Jack stands with you by the porch steps, hands tucked into his flannel pockets, smile soft and steady.", "jack"],
      ["jack", "Tonight was still good, right?", "jack"],
      ["player", "Really good.", "jack"],
      ["jack", "Good. Because I am counting mushroom night as a success. Possibly my finest work as a host and amateur fungus referee.", "jack:laughing"],
      ["player", "Thank you for being you about it.", "jack:blushing"],
      ["jack", "Always. I mean, I will still be awkward in new and surprising ways, but the important parts are steady.", "jack:blushing"],
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
    ambient: "morningBirds",
    onEnter: () => { state.timeOfDay = "daytime"; },
    lines: [
      ["narrator", "Morning finds Jack's cabin washed in quiet gray light. The rain has stopped. Somewhere outside, birds test the day with small, bright notes."],
      ["narrator", "Jack is awake beside you, hair impossible, expression impossibly soft.", "jack:blushing"],
      ["jack", "Hi.", "jack:blushing"],
      ["player", "Hi.", "jack:blushing"],
      ["jack", "I was going to make breakfast sound casual, but I am too happy and I think the eggs would know.", "jack:laughing"],
      ["narrator", "He walks you back to the lodge through clean morning air, hand warm around yours until the lobby doors come into view."],
      ["narrator", "By the time you step inside Viral Vista Lodge, the normal morning rhythm is waiting, though nothing in your chest feels normal at all."]
    ],
    nextAction: completeJackFullLoveMorning
  },
  full_love_caleb_start: {
    label: "Yellowstone After Dark",
    background: () => ({ location: "yellowstoneMisty", time: "night" }),
    onEnter: () => { state.visitTime = "night"; state.pendingDestination = "caleb"; state.pendingFullLoveScene = "caleb"; },
    lines: [
      ["narrator", "The heart on Caleb's route card glows warm under your thumb, and the kiosk responds by printing a ticket that simply reads: AFTER DARK. VERY SCIENTIFIC."],
      ["narrator", "Yellowstone opens around you in blue-black mist. The boardwalk shines with dew, steam sliding low over the rails like the park is trying to keep a secret."],
      ["player", "Caleb?"],
      ["narrator", "A shape moves through the steam. Caleb steps into the boardwalk light shirtless, soaked, scuffed with ash, and smiling like he has just survived a peer-reviewed miracle.", "caleb:fullLoveRomantic"],
      ["player", "What happened to you?"],
      ["caleb", "Short version: geyser. Heroic version: I rescued a tourist's engagement ring from a very bad boardwalk bounce, redirected a rolling backpack away from a thermal runoff channel, and then Castle Geyser expressed an opinion about my timing.", "caleb:fullLoveRomantic"],
      ["player", "You got hit by a geyser while saving romance jewelry and defeating luggage?"],
      ["caleb", "Recovering romance jewelry. Stabilizing luggage. I am choosing precise verbs because my shirt is gone and I need structure.", "caleb:fullLoveRomantic"],
      ["player", "I am trying very hard to be sympathetic, but you are wet, shirtless, a little bit on fire, and the story has a backpack villain."],
      ["caleb", "Tiny controlled hair flame. Mostly symbolic.", "caleb:fullLoveRomantic"]
    ],
    next: "full_love_caleb_two"
  },
  full_love_caleb_two: {
    label: "Yellowstone After Dark",
    background: () => ({ location: "yellowstoneMisty", time: "night" }),
    lines: [
      ["narrator", "He pats at the little flame in his hair. It refuses to surrender with theatrical dignity."],
      ["caleb", "I should be embarrassed. I planned a careful walk. A clean shirt. One, maybe two, facts delivered with emotional restraint.", "caleb:fullLoveRomantic"],
      ["player", "Instead you arrived like Yellowstone wrote a romance novel and forgot workplace safety."],
      ["caleb", "Yellowstone would never forget workplace safety. It would include an appendix.", "caleb:fullLoveRomantic"],
      ["narrator", "You laugh, and Caleb's expression changes. The brilliant, frantic part of him softens into something quieter than steam."],
      ["caleb", "I wanted tonight to matter. Not because you got the score high enough, although I noticed, statistically and personally.", "caleb:fullLoveRomantic"],
      ["caleb", "Because you kept listening. You made room for the facts, and somehow that made room for me.", "caleb:fullLoveRomantic"],
      ["player", "Caleb."],
      ["caleb", "I am damp, lightly singed, and having a sincere moment on a boardwalk. Please do not say my name like that unless you intend to damage me further.", "caleb:fullLoveRomantic"],
      ["player", "What if I do?"],
      ["narrator", "The mist curls around his shoulders. His eyes drop to your mouth, then back up, careful and wanting all at once."],
      ["caleb", "Then I would like to be damaged responsibly. Behind the rail. With enthusiastic consent. And possibly after confirming you remember one extremely important Yellowstone fact.", "caleb:fullLoveRomantic"]
    ],
    next: "full_love_caleb_prompt"
  },
  full_love_caleb_prompt: {
    label: "Yellowstone After Dark",
    background: () => ({ location: "yellowstoneMisty", time: "night" }),
    lines: [
      ["player", "There is a quiz right now."],
      ["caleb", "A small one. Emotionally load-bearing. Old Faithful has celebrity status, but what have I told you about Yellowstone's geysers?", "caleb:fullLoveRomantic"]
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
    lines: [
      ["narrator", "Caleb goes very still. For one suspended second, even the steam seems to behave."],
      ["caleb", "More than half. Yes.", "caleb:fullLoveRomantic"],
      ["player", "Old Faithful is famous, not the biggest. A punctual celebrity, if I remember the exact Caleb phrasing."],
      ["caleb", "You remembered the phrasing.", "caleb:fullLoveRomantic"],
      ["narrator", "His smile breaks open, warm enough to make the night feel less cold. He steps closer, every movement careful, asking without making you carry all the words."],
      ["player", "I remembered because it was you saying it."],
      ["caleb", "That is unfairly effective.", "caleb:fullLoveRomantic"],
      ["narrator", "He kisses you like he is still astonished that wonder can have mechanics and still become magic. The boardwalk, the mist, the little stubborn flame in his hair: all of it narrows to warmth, laughter, and the sweet pressure of being chosen."],
      ["caleb", "For the record, this is not how I expected tonight to go.", "caleb:fullLoveRomantic"],
      ["player", "Too much geyser?"],
      ["caleb", "An irresponsible amount. But the result is... compelling.", "caleb:fullLoveRomantic"],
      ["narrator", "The rest of the night stays private in the way good things sometimes deserve: hands linked behind the rail, soft jokes against damp skin, Caleb's facts turning tender whenever his courage needs somewhere to stand."],
      ["player", "You leave Yellowstone with steam in your hair, Caleb's smile burned bright in your chest, and the powerful knowledge that correct trivia can be extremely romantic."]
    ],
    nextAction: completeFullLoveScene
  },
  full_love_caleb_bad: {
    label: "Yellowstone After Dark",
    background: () => ({ location: "yellowstoneMisty", time: "night" }),
    lines: [
      ["narrator", "Caleb's face changes so fast it should come with a weather advisory."],
      ["caleb", "Old Faithful is WHAT.", "caleb:fullLoveRage"],
      ["player", "The largest geyser in Yellowstone?"],
      ["caleb", "NO. No. Absolutely not. I am shirtless, emotionally available, damp in a narratively significant way, and you choose this moment to slander Steamboat Geyser?", "caleb:fullLoveRage"],
      ["player", "I am sorry, did you say slander?"],
      ["caleb", "Steamboat is the tallest active geyser in the world. Old Faithful is famous because it is regular, not because it is the biggest. We have covered this. My heart made flashcards.", "caleb:fullLoveRage"],
      ["narrator", "The tiny flame in his hair flares as if it, too, has strong feelings about hydrothermal accuracy."],
      ["caleb", "I had a sentimental speech. There was going to be hand-holding. Possibly a respectful amount of shirt-related escalation. Now I have to go stare into the dark and recover as a scientist and as a man.", "caleb:fullLoveRage"],
      ["player", "That feels a little dramatic."],
      ["caleb", "Yellowstone is dramatic. I am being locally appropriate.", "caleb:fullLoveRage"],
      ["narrator", "He marches you back toward the route marker with wet, furious dignity, still staying between you and every unsafe edge because even betrayed Caleb is professionally incapable of letting you wander into boiling ground."],
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
      ["narrator", "The heart on Sierra's route card warms under your thumb, and the kiosk prints a ticket with one handwritten-looking note at the bottom: NO CAPTIONS AFTER MIDNIGHT."],
      ["narrator", "Yosemite opens around you in night-blue granite and the distant voice of falling water. The familiar trail feels quieter now, like it has saved its best answer for last."],
      ["player", "Sierra?"],
      ["narrator", "A flashlight beam cuts softly across the trail, then lowers. Sierra steps out of the dark with wind in her hair, cheeks bright from cold, and a small smile waiting for you.", "sierra:laughing"],
      ["sierra", "You came.", "sierra:blushing"],
      ["player", "Of course I did.", "sierra:blushing"],
      ["narrator", "She looks down at the trail for half a breath, pleased enough that she has to let the feeling pass before she can move.", "sierra:blushing"],
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
    lines: [
      ["narrator", "The trail opens into a high meadow washed in moonlight. Wildflowers silver at the edges. Grass bends softly under the night air. Far across the valley, cliffs rise huge and quiet, and the waterfall glows pale against the dark."],
      ["player", "Oh."],
      ["player", "This is beautiful."],
      ["narrator", "The meadow seems to make room around you: grass, stars, cold stone, warm breath, and the impossible feeling of being somewhere meant to be kept quiet."],
      ["sierra", "I know.", "sierra"],
      ["narrator", "Sierra sits in the grass and tips her face toward the sky.", "sierra:stargazingStep2"],
      ["sierra", "That bright one over the ridge? I used to pretend it was watching the trail for me when I closed alone.", "sierra:stargazingStep2"],
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
    lines: [
      ["narrator", "You lower yourself into the grass beside her. The cold comes through your jacket. Sierra's shoulder nearly touches yours, close enough that the space between you starts to feel deliberate.", "sierra:stargazingStep3"],
      ["sierra", "When I first found this place, I thought I would bring people here all the time.", "sierra:stargazingStep3"],
      ["player", "But you did not.", "sierra:stargazingStep3"],
      ["sierra", "No. Turns out I am generous with trail advice and extremely selfish with silence.", "sierra:stargazingStep3"],
      ["narrator", "She smiles at that, a small smile, gone almost as soon as it appears.", "sierra:stargazingStep3"],
      ["sierra", "Most people want the waterfall. The big view. The story they can tell later.", "sierra:stargazingStep3"],
      ["player", "And you?", "sierra:stargazingStep3"],
      ["sierra", "I wanted someone who would notice this part too. The cold. The little flowers. How loud your own breathing gets when nobody is filling the space for you.", "sierra:stargazingStep3"],
      ["narrator", "The meadow holds the words gently. Even the waterfall feels farther away.", "sierra:stargazingStep3"],
      ["sierra", "I did not know I was waiting for you until you kept showing up like the quiet parts mattered.", "sierra:stargazingStep3"]
    ],
    next: "full_love_sierra_three"
  },
  full_love_sierra_three: {
    label: "Yosemite Meadow",
    background: () => ({ location: "yosemiteMeadowNight", time: "night" }),
    lines: [
      ["narrator", "Sierra turns toward you. In the moonlight, her eyes are bright and a little afraid, but she does not look away.", "sierra:stargazingStep3"],
      ["sierra", "I have been trying to think of something clever to say since the kiosk printed that ticket.", "sierra:stargazingStep3"],
      ["player", "Any luck?", "sierra:stargazingStep3"],
      ["sierra", "Terrible luck. Very humbling evening for my pride.", "sierra:stargazingStep3"],
      ["narrator", "The joke lands softly, then gives way to the sound of her breathing. She reaches for your hand in the grass, and her fingers fit between yours with a careful certainty.", "sierra:stargazingStep4"],
      ["sierra", "So I am going to say the true thing instead.", "sierra:stargazingStep4"],
      ["player", "Okay.", "sierra:stargazingStep4"],
      ["sierra", "I wanted you here. Not because the view is good, even though obviously I have taste.", "sierra:stargazingStep4"],
      ["sierra", "Because when something beautiful happens, I keep wondering what your face would do if you saw it too.", "sierra:stargazingStep4"]
    ],
    next: "full_love_sierra_prompt"
  },
  full_love_sierra_prompt: {
    label: "Yosemite Meadow",
    background: () => ({ location: "yosemiteMeadowNight", time: "night" }),
    lines: [
      ["narrator", "She stays close, and the whole meadow seems to tilt toward her. Her thumb moves once over your knuckles, almost too lightly to count.", "sierra:stargazingStep4"],
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
        label: "Say, 'So this is your meadow situationship era.'",
        next: "full_love_sierra_bad_pause",
        feelings: { sierra: -6 },
        fadeOutMusicUntilScene: { sceneId: "day_wake", fadeOutMs: 2400, resumeFadeMs: 5600 }
      }
    ]
  },
  full_love_sierra_good: {
    label: "Yosemite Meadow",
    background: () => ({ location: "yosemiteMeadowNight", time: "night" }),
    lines: [
      ["narrator", "Sierra's expression changes so gently it almost hurts. Hope arrives first, then relief, then a warmth that makes the cold meadow feel suddenly survivable.", "sierra:stargazingStep4"],
      ["player", "I want that too.", "sierra:stargazingStep4"],
      ["player", "I want to stay. I want the quiet part, and the impossible view, and you beside me when the sky does something worth remembering.", "sierra:stargazingStep4"],
      ["sierra", "You are very hard to act normal around.", "sierra:stargazingStep4"],
      ["player", "Good.", "sierra:stargazingStep4"],
      ["narrator", "She laughs once, breathless and bright, then closes the distance. The kiss starts careful, a question asked against your mouth, and turns warmer when you answer with your hand at her waist.", "sierra:stargazingStep4"],
      ["sierra", "Still here?", "sierra:stargazingStep4"],
      ["player", "Right here.", "sierra:stargazingStep4"],
      ["narrator", "Her hand curls in your jacket. The stars blur at the edge of your vision as she kisses you again, slow enough that the whole night narrows to how close you can be and still want closer.", "sierra:stargazingStep4"],
      ["narrator", "The meadow keeps the rest private. There is grass cool under your palms, Sierra warm against you, the soft shock of her laughter at your ear, and the clear, mutual decision to let the world get very small for a while.", "sierra:stargazingStep4"],
      ["player", "Later, you will remember the stars in fragments: one over her shoulder, one above the ridge, one disappearing when she leans down to kiss you again.", "sierra:stargazingStep4"],
      ["narrator", "Hours pass in pieces: constellations, whispered trail stories, your fingers in her hair, her cheek against your chest, the two of you forgetting to keep track of anything except each other.", "sierra:stargazingStep4"],
      ["narrator", "At some point, the talking thins into silence. The silence becomes breathing. The breathing becomes sleep.", "sierra:stargazingStep4", { fadeOutSprite: true }]
    ],
    next: "full_love_sierra_morning_return"
  },
  full_love_sierra_morning_return: {
    label: "Morning",
    background: () => ({ location: "black", time: "daytime" }),
    character: null,
    lines: [
      ["narrator", "Morning comes softly, and the meadow stays behind the dark a little longer."],
      ["narrator", "Sierra is still asleep beside you, one hand tucked in your sleeve, peaceful in a way that makes your chest go quiet."],
      ["player", "You do not wake her. You brush the grass from her hair, kiss her forehead, and leave her resting under the first warm light of Yosemite."],
      ["narrator", "By the time you reach the lodge lobby, morning has fully arrived, and something tender has followed you back with it."]
    ],
    nextAction: completeSierraFullLoveMorning
  },
  full_love_sierra_bad_pause: {
    label: "Yosemite Meadow",
    background: () => ({ location: "yosemiteMeadowNight", time: "night" }),
    lines: [
      ["narrator", "", "sierra:stargazingStep4", { dialogueHidden: true, autoAdvanceMs: 3000 }],
      ["narrator", "...", "sierra:stargazingStep4", { dialogueSlowFade: true, autoAdvanceMs: 2600 }]
    ],
    next: "full_love_sierra_bad_departure"
  },
  full_love_sierra_bad_departure: {
    label: "Yosemite Meadow",
    background: () => ({ location: "yosemiteMeadowNight", time: "night" }),
    lines: [
      ["narrator", "", "sierra:stargazingStep4", { dialogueHidden: true, spriteDriftUp: true, autoAdvanceMs: 4300 }],
      ["narrator", "Sierra goes still. Not angry, not theatrical, just suddenly farther away than the few inches of grass between you should allow."],
      ["sierra", "Right.", "sierra:stargazingStep4"],
      ["player", "Sierra, wait. I did not mean to make it sound small.", "sierra:stargazingStep4"],
      ["sierra", "I know.", "sierra:stargazingStep4"],
      ["narrator", "She stands and brushes grass from her sleeves with careful hands. The meadow remains beautiful, which somehow makes it worse."],
      ["sierra", "That is the problem, I think. You did not mean to.", "sierra:stargazingStep4"],
      ["narrator", "She walks you back to the main trail in silence. At the route marker, her flashlight pauses on the path toward the lodge."],
      ["sierra", "You can find your way from here.", "sierra:grumpy"],
      ["player", "I can.", "sierra:grumpy"],
      ["narrator", "She nods once and leaves before either of you can make the night kinder than it was."],
      ["player", "The walk back feels longer than it should."]
    ],
    nextAction: completeFullLoveScene
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
      ["narrator", "By the time you return to check-in, sunset has warmed the desk, the route cards, and your questionable decision-making."],
      ["player", "Still enough day left to make one more choice."]
    ],
    choices: () => scenes.checkin_hub.choices()
  },
  after_sunset_visit: {
    label: "Night Check-In",
    background: () => ({ location: "checkIn", time: "night" }),
    onEnter: () => { state.timeOfDay = "night"; state.pendingDestination = null; },
    lines: [
      ["narrator", "Night meets you at check-in. The kiosk glow looks softer now, or maybe you are just tired enough to forgive it."],
      ["player", "One more route if I have it in me. Then the lodge. Then unconsciousness as a lifestyle."]
    ],
    choices: () => scenes.checkin_hub.choices()
  },
  night_lodge_return: {
    label: "Lodge Lobby",
    background: () => ({ location: "lodge", time: "night" }),
    onEnter: () => { state.pendingDestination = null; },
    lines: [
      ["narrator", "After the night visit, you return directly to the lodge. No check-in detour, no extra encounter, no pretending you are not tired."],
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
      ["narrator", `You return to the lodge lobby in the ${state.timeOfDay === "sunset" ? "last light" : "night quiet"}. The fireplace looks like it has been waiting without making a big deal about it.`],
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
      ["player", "By morning, the feelings are still there. Less organized, maybe, but definitely awake before I am."]
    ],
    nextAction: startNewDay
  }
};

const els = {
  startScreen: document.getElementById("startScreen"),
  setupScreen: document.getElementById("setupScreen"),
  gameScreen: document.getElementById("gameScreen"),
  backdrop: document.getElementById("backdrop"),
  backdropNext: document.getElementById("backdropNext"),
  sprite: document.getElementById("sprite"),
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
  devPanel: document.getElementById("devPanel"),
  devScores: document.getElementById("devScores"),
  devChoicePreview: document.getElementById("devChoicePreview"),
  devEasyCopy: document.getElementById("devEasyCopy"),
  devBackButton: document.getElementById("devBackButton"),
  devSkipButton: document.getElementById("devSkipButton"),
  dialogueCopyBtn: document.getElementById("dialogueCopyBtn"),
  dayTransition: document.getElementById("dayTransition"),
  dayTransitionButton: document.getElementById("dayTransitionButton")
};

const audioEngine = {
  locationKey: "checkIn",
  characterKey: null,
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
  justPlayedDoorSfx: false,
  ambientKey: null,
  ambientPlayer: null,
  ambientTimerId: null,
  ambientFadeTimerId: null,
  ambientToken: 0,
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
    const button = event.target.closest("[data-dev-full-love-key]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
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
  els.backBtn.addEventListener("click", event => {
    event.stopPropagation();
    goBackOneStep();
  });
  els.dayTransitionButton.addEventListener("click", startDayFromTransition);
  document.getElementById("gameScreen").addEventListener("click", event => {
    if (els.dayTransition.classList.contains("active")) return;
    if (event.target.closest("button, input, select, textarea, a, .dev-panel")) return;
    if (els.galleryOverlay.classList.contains("active")) return;
    showNextDialogueLine();
  });
  document.addEventListener("pointerdown", () => { if (audioEngine.enabled) ensureAudio(); });
  window.addEventListener("keydown", event => {
    if (els.dayTransition.classList.contains("active")) {
      if (event.key === " " || event.key === "Enter") startDayFromTransition();
      return;
    }
    if (event.key === " " || event.key === "Enter") showNextDialogueLine();
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
  return /(_two|_three|_wrap|_wrapup|_reaction|_prompt|_pause|_departure|_rain|_cabin|_shirt|_good|_bad)$/.test(sceneId) || sceneId === "choice_reaction";
}

function startGame() {
  state = clone(defaultState);
  clearDevHistory();
  audioEngine.enabled = state.audioEnabled;
  ensureAudio();
  showScreen("gameScreen");
  renderScene("intro_bus_ride", { suppressSceneSfx: true });
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
  showScreen("gameScreen");
  renderScene("intro_natai_checkin");
}

function showNameEntry() {
  const input = document.getElementById("playerName");
  input.value = state.playerName === defaultState.playerName ? "" : state.playerName;
  updateBeginButton();
  showScreen("setupScreen");
  window.setTimeout(() => input.focus(), 30);
}

function renderScene(sceneId, options = {}) {
  const scene = scenes[sceneId];
  if (!scene) throw new Error("Missing scene: " + sceneId);
  window.clearTimeout(lineAutoAdvanceTimer);
  window.clearTimeout(establishingPauseTimer);
  els.gameScreen.classList.remove("establishing-pause");
  state.sceneId = sceneId;
  state.lineIndex = options.keepLine ? state.lineIndex : 0;
  if (!options.keepLine) state.lineAudioCueKey = null;
  if (scene.onEnter && !options.keepLine) scene.onEnter();
  const background = resolveValue(scene.background) || { location: "lodge", time: state.timeOfDay };
  const backgroundChanged = updateBackdrop(background);
  updateAmbient(scene.ambient || null);
  updateAudioTheme(background.location, null, { suppressSfx: options.suppressSceneSfx });
  updateDevPanel();
  if (backgroundChanged && !options.keepLine && !options.skipEstablishingPause) {
    els.gameScreen.classList.add("establishing-pause");
  }
  renderCurrentLine();
  if (backgroundChanged && !options.keepLine && !options.skipEstablishingPause) {
    establishingPauseTimer = window.setTimeout(() => {
      els.gameScreen.classList.remove("establishing-pause");
    }, 1080);
  }
}

function renderCurrentLine() {
  window.clearTimeout(lineAutoAdvanceTimer);
  const scene = scenes[state.sceneId];
  const lines = resolveValue(scene.lines) || [];
  const line = lines[state.lineIndex] || ["narrator", ""];
  const lineOptions = line[3] || {};
  const speakerKey = line[0] || "narrator";
  const speaker = characters[speakerKey] || characters.narrator;
  // Establishing shots are a hard story rule: a character sprite only appears
  // when the current dialogue line explicitly provides a character cue.
  // Do not fall back to scene.character here, or new locations will feel like
  // the player teleported directly into someone's face.
  const characterCue = line.length > 2 ? line[2] : null;
  updateSprite(characterCue);
  els.speakerName.textContent = resolveName(speaker);
  els.speakerName.style.color = speaker.color || "#f3b85b";
  els.sceneLabel.textContent = resolveValue(scene.label) || state.sceneId;
  els.lineText.textContent = formatText(line[1] || "");
  applyLinePresentation(lineOptions);
  playLineAudioCue(lineOptions);
  updateCopyControls();
  els.choices.innerHTML = "";
  els.choices.classList.remove("has-choices");
  els.choices.style.removeProperty("--choices-bottom");
  els.gameScreen.classList.remove("choices-active");
  if (state.lineIndex >= lines.length - 1) renderChoices(resolveValue(scene.choices) || []);
  if (lineOptions.autoAdvanceMs) {
    lineAutoAdvanceTimer = window.setTimeout(() => showNextDialogueLine(), lineOptions.autoAdvanceMs);
  }
}

function showNextDialogueLine() {
  if (els.gameScreen.classList.contains("establishing-pause")) return;
  window.clearTimeout(lineAutoAdvanceTimer);
  const scene = scenes[state.sceneId];
  if (!scene) return;
  const lines = resolveValue(scene.lines) || [];
  if (state.lineIndex >= lines.length - 1) {
    if (scene.nextAction) {
      pushDevHistory();
      playSfx("advance");
      scene.nextAction();
    } else if (scene.next) {
      pushDevHistory();
      playSfx("advance");
      renderScene(scene.next);
    }
    return;
  }
  pushDevHistory();
  state.lineIndex += 1;
  playSfx("advance");
  renderCurrentLine();
}

function applyLinePresentation(options = {}) {
  els.gameScreen.classList.toggle("dialogue-hidden", Boolean(options.dialogueHidden));
  els.gameScreen.classList.toggle("dialogue-slow-fade", Boolean(options.dialogueSlowFade));
  els.gameScreen.classList.toggle("sprite-drift-up", Boolean(options.spriteDriftUp));
  if (options.fadeOutSprite) {
    requestAnimationFrame(() => els.sprite.classList.add("hidden"));
  }
  els.gameScreen.classList.remove("screen-flash");
  if (options.screenFlash) {
    void els.gameScreen.offsetWidth;
    els.gameScreen.classList.add("screen-flash");
  }
}

function renderChoices(choices) {
  els.choices.innerHTML = "";
  els.choices.classList.toggle("has-choices", choices.length > 0);
  els.gameScreen.classList.toggle("choices-active", choices.length > 0);
  if (choices.length > 0) {
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
    button.innerHTML = `${icon}<span class="choice-label">${escapeHtml(choice.label)}</span>${preview}`;
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

function startNewDay() {
  state.timeOfDay = "daytime";
  state.pendingDestination = null;
  state.pendingEncounter = null;
  els.gameScreen.classList.add("day-transitioning");
  showDayTransition(state.day, {
    onStart: () => renderScene("day_wake", { suppressSceneSfx: true })
  });
}

function copyCurrentDialogueLine() {
  const scene = scenes[state.sceneId];
  const lines = resolveValue(scene?.lines) || [];
  const line = lines[state.lineIndex] || ["narrator", ""];
  const speaker = characters[line[0]] || characters.narrator;
  copyText(`${resolveName(speaker)}: ${formatText(line[1] || "")}`);
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
  window.clearTimeout(establishingPauseTimer);
  if (els.dayTransition) {
    els.dayTransition.classList.remove("active", "leaving");
    els.dayTransition.setAttribute("aria-hidden", "true");
  }
  els.gameScreen.classList.remove("day-transitioning", "establishing-pause");
  state = previousState;
  renderScene(normalizeSceneId(state.sceneId || "intro_bus_ride"), {
    keepLine: true,
    skipEstablishingPause: true,
    suppressSceneSfx: true
  });
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
  if (els.gameScreen.classList.contains("establishing-pause")) return;
  const startingBackground = currentBackgroundKey();
  pushDevHistory();
  playSfx("advance");

  for (let step = 0; step < 80; step += 1) {
    if (!skipOneStep()) {
      toast("No next setting found.");
      return;
    }
    if (currentBackgroundKey() !== startingBackground) return;
  }

  toast("Skip stopped before finding a new setting.");
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

function completeJackFullLoveNight() {
  state.day += 1;
  renderScene("full_love_jack_morning_wake");
  showDayTransition(state.day, {
    kicker: "Morning in Jack's Cabin",
    caption: "The storm has passed, the cabin is brightening, and the lodge morning is waiting just down the trail."
  });
}

function completeJackFullLoveMorning() {
  state.pendingFullLoveScene = null;
  state.pendingDestination = null;
  state.visitTime = null;
  state.visitBeat = 0;
  state.visitStartMood = null;
  state.visitLastChoice = null;
  state.visitLastReaction = null;
  renderScene("day_wake");
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
  void els.dayTransition.offsetWidth;
  els.dayTransition.classList.add("active");
  if (els.dayTransitionButton) els.dayTransitionButton.focus({ preventScroll: true });
}

function startDayFromTransition() {
  if (!els.dayTransition || !els.dayTransition.classList.contains("active") || els.dayTransition.classList.contains("leaving")) return;
  pushDevHistory();
  const onStart = showDayTransition.onStart;
  showDayTransition.onStart = null;
  if (onStart) onStart();
  els.dayTransition.classList.add("leaving");
  window.clearTimeout(startDayFromTransition.timer);
  startDayFromTransition.timer = window.setTimeout(() => {
    els.dayTransition.classList.remove("active", "leaving");
    els.dayTransition.setAttribute("aria-hidden", "true");
    els.gameScreen.classList.remove("day-transitioning");
  }, onStart ? 920 : 680);
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
  return [prompt];
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
  if (state.visitLastReaction) return state.visitLastReaction;
  return beat.reactions[tone] || beat.reactions.warm;
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
      neutral: "Jack walks beside you with that familiar, shoulder-bumping warmth, only now the quiet keeps catching on things neither of you has named yet.",
      high: "Jack lingers at the route marker like goodbye is a log he could lift if he just found the right grip. For once, even he knows this is not only friendship."
    }[mood];
    return [
      ["narrator", timeExit, characterExpression(character, mood)],
      ["narrator", jackMoodLine, characterExpression(character, mood)],
      ["player", `You leave ${place} with Olympic rain on your sleeves and years of knowing Jack rearranging themselves into something brighter.`]
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
    ["narrator", moodLine, characterExpression(character, mood)],
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
  els.backBtn.hidden = !state.devBackButton;
  els.backBtn.disabled = devHistory.length === 0;
  els.skipBtn.hidden = !state.devSkipButton;
  updateCopyControls();
  els.devScores.innerHTML = LOVE_INTEREST_KEYS.map(key => {
    const score = state.feelings[key] ?? 5;
    const name = escapeHtml(characters[key].shortName);
    const fullLoveButton = hasImplementedFullLoveScene(key)
      ? `<button class="dev-full-love-btn" type="button" data-dev-full-love-key="${escapeHtml(key)}" aria-label="Go to ${name}'s full love scene">Full scene</button>`
      : "";
    return `
      <div class="dev-score">
        <span class="dev-score-name">
          <span>${name}</span>
          ${fullLoveButton}
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
}

function updateCopyControls() {
  if (!els.dialogueCopyBtn) return;
  els.dialogueCopyBtn.hidden = !state.devEasyCopy;
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

function updateSprite(characterCue) {
  const { key: characterKey, expression } = parseCharacterCue(characterCue);
  const character = characters[characterKey];
  const sprite = character && resolveSprite(character, expression);
  if (!character || !sprite) {
    const hideToken = spriteLoadToken + 1;
    spriteLoadToken = hideToken;
    els.sprite.classList.add("hidden");
    els.placeholderSprite.classList.remove("visible");
    window.setTimeout(() => {
      if (hideToken !== spriteLoadToken) return;
      els.sprite.removeAttribute("src");
      els.sprite.alt = "";
      els.sprite.dataset.spriteUrl = "";
      els.sprite.classList.remove("sierra-stargazing-sprite", "sierra-stargazing-close");
    }, 620);
    return;
  }
  els.sprite.classList.toggle("sierra-stargazing-sprite", characterKey === "sierra" && String(expression || "").startsWith("stargazingStep"));
  els.sprite.classList.toggle("sierra-stargazing-close", characterKey === "sierra" && expression === "stargazingStep4");
  const spriteUrl = new URL(sprite, window.location.href).href;
  const characterName = resolveName(character);
  if (els.sprite.dataset.spriteUrl === spriteUrl && !els.sprite.classList.contains("hidden")) {
    els.sprite.alt = characterName;
    return;
  }
  const loadToken = spriteLoadToken + 1;
  spriteLoadToken = loadToken;
  const hadVisibleSprite = Boolean(els.sprite.dataset.spriteUrl) && !els.sprite.classList.contains("hidden");
  els.sprite.classList.add("hidden");
  els.sprite.alt = characterName;
  els.sprite.decoding = "async";
  els.sprite.loading = "eager";
  els.placeholderSprite.classList.remove("visible");
  els.placeholderSprite.querySelector("strong").textContent = characterName;
  const revealSprite = () => {
    if (loadToken !== spriteLoadToken) return;
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
    const saved = migrateLegacyCharacterKeys(JSON.parse(raw));
    state = Object.assign(clone(defaultState), saved);
    state.playerName = String(state.playerName || "").trim() || defaultState.playerName;
    state.feelings = sanitizeFeelings(saved.feelings);
    state.flags = state.flags || {};
    state.unlockedCG = state.unlockedCG || [];
    state.audioEnabled = state.audioEnabled !== false;
    state.devChoicePreview = saved.devChoicePreview !== false;
    state.devEasyCopy = saved.devEasyCopy !== false;
    state.devBackButton = saved.devBackButton !== false;
    state.devSkipButton = saved.devSkipButton !== false;
    state.timeOfDay = TIMES.includes(state.timeOfDay) ? state.timeOfDay : "daytime";
    state.day = Math.max(1, Number(state.day) || 1);
    audioEngine.enabled = state.audioEnabled;
    clearDevHistory();
    ensureAudio();
    showScreen("gameScreen");
    renderScene(normalizeSceneId(state.sceneId || "intro_bus_ride"), { keepLine: true });
    toast("Save loaded.");
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
  ensureAudio();
  if (id === "setupScreen" || id === "startScreen") {
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
    player.play().then(() => {
      if (config.fadeMs) fadeAmbient(player, config.volume, config.fadeMs, ambientToken);
    }).catch(() => {});
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
    fadePlayer(player, 0, config.stopFadeMs, () => {
      player.pause();
      player.currentTime = 0;
    });
    return;
  }
  player.pause();
  player.currentTime = 0;
}

function stopSfxChannel(channel) {
  const player = audioEngine.sfxChannels[channel];
  if (!player) return;
  player.pause();
  player.currentTime = 0;
  delete audioEngine.sfxChannels[channel];
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
  if (audioEngine.musicPlayers.length) return;
  audioEngine.musicPlayers = [new Audio(), new Audio()];
  audioEngine.musicPlayers.forEach(player => {
    player.preload = "auto";
    player.loop = false;
    player.volume = 0;
  });
  if (!audioEngine.musicSuppressedLocationKey) restartMusicLoop();
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
  if (!audioEngine.enabled) return;
  ensureAudio();
  if (!audioEngine.musicSuppressedLocationKey) restartMusicLoop();
  if (options.suppressSfx) return;
  playSfx(characterCue ? "character" : "scene");
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
  Object.keys(audioEngine.sfxChannels).forEach(stopSfxChannel);
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
  if (!players.length) return;
  players.forEach(player => {
    fadePlayer(player, 0, duration, () => {
      player.pause();
    });
  });
}

function playSfx(type) {
  if (!audioEngine.enabled) return;
  const config = sfxTracks[type];
  if (!config) return;
  if (config.channel && audioEngine.sfxChannels[config.channel]) {
    audioEngine.sfxChannels[config.channel].pause();
    audioEngine.sfxChannels[config.channel].currentTime = 0;
  }
  const effect = new Audio(config.src);
  effect.volume = config.volume;
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
    effect.play().catch(() => {});
  };
  if (config.startAt) {
    if (effect.readyState >= 1) startPlayback();
    else effect.addEventListener("loadedmetadata", startPlayback, { once: true });
    effect.load();
    return;
  }
  effect.play().catch(() => {});
}

function resolveMusicKey() {
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
    fadePlayer(incoming, theme.volume, incomingFadeMs);
    if (outgoing) fadePlayer(outgoing, 0, 1800, () => {
      outgoing.pause();
      outgoing.currentTime = theme.loopStart;
    });
    audioEngine.currentTheme = theme;
    audioEngine.musicKey = musicKey;
    audioEngine.activeMusicIndex = incomingIndex;
    audioEngine.transitioning = false;
    audioEngine.loopTimerId = window.setInterval(checkMusicLoop, 120);
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
