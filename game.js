const SAVE_KEY = "parkAfterDarkSaveV3";
const TIMES = ["daytime", "sunset", "night"];
const TIME_LABELS = { daytime: "Daytime", sunset: "Sunset", night: "Night" };
const LOVE_INTEREST_KEYS = ["jack", "caleb", "sierra", "bruno", "river"];

const defaultState = {
  playerName: "Creator",
  sceneId: "intro_checkin_arrival",
  lineIndex: 0,
  selectedRoute: null,
  day: 1,
  timeOfDay: "daytime",
  returnTime: null,
  pendingDestination: null,
  pendingEncounter: null,
  visitTime: null,
  visitBeat: 0,
  visitLastChoice: null,
  choiceReactionLines: null,
  choiceReactionNext: null,
  choiceReactionBackground: null,
  choiceReactionLabel: null,
  introReturnScene: null,
  devPanelOpen: false,
  devChoicePreview: true,
  feelings: {
    jack: 5,
    caleb: 5,
    sierra: 5,
    bruno: 5,
    river: 5
  },
  flags: {},
  unlockedCG: [],
  audioEnabled: true
};

let state = clone(defaultState);
let spriteLoadToken = 0;

const characters = {
  player: { name: () => state.playerName, sprite: "", color: "#7b2f24" },
  narrator: { name: "Narrator", sprite: "", color: "#5f3a19" },
  jack: { name: "Jack Everett", shortName: "Jack", park: "Olympic", location: "olympic", sprites: characterSprites("jack_everett"), color: "#8f3f24" },
  caleb: { name: "Caleb Ranger", shortName: "Caleb", park: "Yellowstone", location: "yellowstone", sprites: characterSprites("caleb_ranger"), color: "#276345" },
  sierra: { name: "Sierra", shortName: "Sierra", park: "Yosemite", location: "yosemite", sprites: characterSprites("sierra"), color: "#8b3f63" },
  bruno: { name: "Bruno Bear", shortName: "Bruno", park: "Sequoia", location: "sequoia", sprites: characterSprites("bruno_bear"), color: "#704719" },
  river: { name: "River Hawk", shortName: "River", park: "Zion", location: "zion", sprites: characterSprites("river_hawk"), color: "#245f76" }
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
  yosemite: {
    daytime: "assets/backgrounds/time_variants/yosemite/daytime.png",
    sunset: "assets/backgrounds/time_variants/yosemite/sunset.png",
    night: "assets/backgrounds/time_variants/yosemite/night.png"
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
  yosemite: "bg-yosemite",
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
  bruno: { src: "assets/audio/music/Fireflies and Stardust.mp3", loopStart: 9.0, loopEnd: 244.5, volume: 0.5 },
  river: { src: "assets/audio/music/Crowd Hammer.mp3", loopStart: 7.5, loopEnd: 198.5, volume: 0.45 }
};

const locationMusic = {
  black: "introspection",
  lodge: "lodge",
  checkIn: "checkIn",
  olympic: "jack",
  yellowstone: "caleb",
  yosemite: "sierra",
  sequoia: "bruno",
  zion: "river"
};

const sfxTracks = {
  advance: { src: "assets/audio/sfx/qubodup-click/qubodup-click/qubodup-click2.wav", volume: 0.26 },
  choice: { src: "assets/audio/sfx/snd_close_map.wav", volume: 0.18 },
  type: { src: "assets/audio/sfx/qubodup-click/qubodup-click/qubodup-hover2.wav", volume: 0.12 },
  scene: { src: "assets/audio/sfx/snd_use_map.wav", volume: 0.16, startAt: 0.06 },
  character: { src: "assets/audio/sfx/qubodup-click/qubodup-click/qubodup-click1.wav", volume: 0.2 },
  save: { src: "assets/audio/sfx/chimey/Chime_Save.mp3", volume: 0.58 },
  door: { src: "assets/audio/sfx/creaky_door_hinge.wav", volume: 0.68 }
};

const cgLibrary = {
  jackCabin: { title: "Rain-Soaked Cabin", image: "assets/backgrounds/time_variants/olympic/daytime.png" },
  calebSteam: { title: "Boardwalk Boundaries", image: "assets/backgrounds/time_variants/yellowstone/daytime.png" },
  sierraWaterfall: { title: "No Filter Needed", image: "assets/backgrounds/time_variants/yosemite/sunset.png" },
  brunoGrove: { title: "Forest Protector", image: "assets/backgrounds/time_variants/sequoia/daytime.png" },
  riverCanyon: { title: "Permit Approved", image: "assets/backgrounds/time_variants/zion/night.png" }
};

const parkFlavor = {
  jack: {
    place: "the rain cabin",
    visit: {
      daytime: {
        low: ["Jack keeps one shoulder between you and a mossy social trail like he expects you to start a bad idea at any second.", "The rainforest is silver-green and dripping. He points out nurse logs, elk tracks, and exactly zero shortcuts."],
        neutral: ["Jack walks you through a curtain of Olympic rain, explaining which boards are slick and which puddles are deeper than they look.", "He makes the forest feel private without making it small."],
        high: ["Jack meets you under the cedar eaves with two coffees and a smile that makes the rain seem rehearsed.", "The old-growth trail smells like moss, cedar, and the kind of trouble that knows the rules by heart."]
      },
      sunset: {
        low: ["At sunset, Jack's cabin windows glow warm, but his welcome stays carefully weatherproof.", "He corrects your footing twice and lets the rain do most of the talking."],
        neutral: ["Gold light catches the rain in thin bright threads while Jack checks the trail markers.", "He admits Olympic is best when the weather looks dramatic enough to have an agenda."],
        high: ["Sunset turns the wet cedar trunks copper. Jack watches you watch them and forgets to pretend he is unaffected.", "He says the forest only gets this pretty for people who listen."]
      },
      night: {
        low: ["Night folds around the cabin. Jack gives you a lantern and a professional amount of space.", "Somewhere in the trees, water moves over stone like it has better secrets."],
        neutral: ["Jack leads a short lantern walk through the rain-dark forest and keeps his voice low enough for the frogs to stay in charge.", "He points out how the trail changes after dark: familiar, but not forgiving."],
        high: ["By lantern light, Jack's grin is all rain and dare. He walks close enough that your sleeves brush.", "Olympic at night feels less like a park and more like a confession with good drainage."]
      }
    },
    surprise: {
      low: ["Jack is at check-in, scowling at a damp stack of maps. He notices you and says, 'Try not to make the kiosk file an incident report.'"],
      neutral: ["Jack is taping down a rain-smudged route card. 'The kiosk works better if you do not insult it where it can hear you.'"],
      high: ["Jack leans against the check-in kiosk, rain in his hair. 'I was going to say be careful, but you make careful sound less fun.'"]
    }
  },
  caleb: {
    place: "the Yellowstone boardwalk",
    visit: {
      daytime: {
        low: ["Caleb waits beside the Yellowstone boardwalk with arms folded and eyes on your shoes.", "Steam rolls over the thermal pools, beautiful enough to make bad decisions look cinematic. Caleb is immune."],
        neutral: ["Caleb walks you past turquoise pools and hissing vents, narrating danger with the calm of someone who has seen tourists test fate and lose.", "He is strict, but the strictness has warmth under it."],
        high: ["Caleb saves you the best view of the boardwalk, where the steam curls around him like he negotiated with it.", "He says your name softly, then ruins the moment by reminding you not to become soup."]
      },
      sunset: {
        low: ["Sunset stains the geyser steam orange. Caleb's patience is present, but wearing a hard hat.", "He asks you to repeat the boardwalk rule before he lets the conversation go anywhere personal."],
        neutral: ["Yellowstone glows at sunset, all mineral color and long shadows. Caleb relaxes when you stay behind the rail without being asked.", "He tells you the park is dramatic enough without visitors improvising."]
      ,
        high: ["At sunset, Caleb's smile appears through the steam like a rare thermal feature with a safety railing.", "He admits he likes showing you the park because you make him want to explain less and feel more."]
      },
      night: {
        low: ["The boardwalk is quiet at night. Caleb gives you a flashlight and a look that says this is not the hour for stunts.", "A distant geyser exhales. Caleb does not soften much, but he keeps you safe."],
        neutral: ["Night settles over Yellowstone in cool blue layers. Caleb points out the stars between columns of steam.", "His voice gets gentler when the crowds disappear."],
        high: ["Under the night sky, Caleb stands close while the hot springs breathe around you.", "He says the park is dangerous, gorgeous, and not half as hard to read as you are."]
      }
    },
    surprise: {
      low: ["Caleb is sanitizing the check-in pen with unsettling focus. 'If you are about to visit someone, please do not make them draft paperwork.'"],
      neutral: ["Caleb is refilling the emergency sunscreen basket. He gives you one and says, 'Prepared is romantic in several climates.'"],
      high: ["Caleb catches you at check-in and presses a trail snack into your hand. 'For later. I am pretending this is logistics.'"]
    }
  },
  sierra: {
    place: "the Yosemite waterfall trail",
    visit: {
      daytime: {
        low: ["Sierra bounds ahead on the Yosemite trail, then stops to make sure you are not turning the overlook into a performance piece.", "Granite cliffs rise clean and enormous behind her. She looks unimpressed on their behalf."],
        neutral: ["Sierra leads you toward a waterfall throwing mist into the sun. She moves like the trail is a dance floor with consequences.", "She teases you into looking up from the obvious view to the better one."],
        high: ["Sierra waits at the waterfall overlook, bright-eyed and wind-tossed, like Yosemite personally gave her good lighting.", "She grins when mist catches in your hair and says it suits you."]
      },
      sunset: {
        low: ["Sunset paints the granite pink. Sierra loves the view too much to stay annoyed, but she gives you no free points.", "She asks whether you can appreciate a cliff without making it about yourself."],
        neutral: ["The Yosemite cliffs warm to gold as Sierra slows down for once.", "She says sunset is when the park stops showing off and starts telling the truth."],
        high: ["Sierra pulls you to a viewpoint just as the granite catches fire with sunset.", "For a second she is quiet, and the quiet feels like a gift she does not hand out often."]
      },
      night: {
        low: ["The waterfall is a pale line in the dark. Sierra keeps the pace brisk and the conversation sharper.", "She is still dazzling, just currently using it as a weapon."],
        neutral: ["At night, Yosemite turns spare and echoing. Sierra points out the sound of water before you can see it.", "She likes that you listen."],
        high: ["Moonlight turns the waterfall silver. Sierra takes your hand for one tricky step and does not immediately let go.", "She says some views work better when nobody is trying to caption them."]
      }
    },
    surprise: {
      low: ["Sierra is perched near check-in, lacing her boots. 'Going somewhere? Try not to make the landscape carry the conversation.'"],
      neutral: ["Sierra jogs past check-in, then doubles back. 'Hydrate. Also, if you see a dramatic cliff, say hello for me.'"],
      high: ["Sierra appears at check-in with waterfall mist still in her hair. 'I was not waiting for you. I was waiting dramatically near your path.'"]
    }
  },
  bruno: {
    place: "the Sequoia grove",
    visit: {
      daytime: {
        low: ["Bruno stands among the giant trees with a rake over one shoulder and a very measured expression.", "The sequoias make even awkward silence feel ancient."],
        neutral: ["Bruno shows you the grove slowly, giving each giant tree the kind of respect most people reserve for grandparents.", "He talks about shade, patience, and not leaving snacks where chaos can smell them."],
        high: ["Bruno beams when you arrive, huge and warm under the sequoias.", "He has saved you a quiet spot where the grove feels like a cathedral that prefers flannel."]
      },
      sunset: {
        low: ["Sunset filters through the trees. Bruno keeps the conversation gentle, but he does not hand you trust like a souvenir.", "He checks an old fire ring with careful, practiced hands."],
        neutral: ["The grove deepens to amber while Bruno talks about keeping old things alive without smothering them.", "It should sound heavy. From him, it sounds kind."],
        high: ["Sunset makes the sequoias glow, and Bruno looks at you like you are part of the warm light.", "He admits he likes when you visit because the grove feels less quiet after."]
      },
      night: {
        low: ["At night, Bruno's lantern swings low between the tree trunks. He is polite, watchful, and hard to fool.", "The grove absorbs your footsteps like it is considering you."],
        neutral: ["Bruno leads you through the night grove, where the giant trunks vanish upward into stars.", "He tells a soft joke about trees being excellent listeners and terrible texters."],
        high: ["The sequoias stand black against the stars. Bruno offers his hand without fanfare, steady as a railing.", "With him, the dark feels less empty and more held."]
      }
    },
    surprise: {
      low: ["Bruno is at check-in replacing a lantern wick. 'Even small fires need attention,' he says, not quite looking at you."],
      neutral: ["Bruno is arranging trail snacks by allergy label. 'Take one. Caring is easier when nobody is hungry.'"],
      high: ["Bruno brightens when he sees you at check-in and offers a warm biscuit wrapped in a napkin. 'Road fuel. Strictly professional biscuiting.'"]
    }
  },
  river: {
    place: "the Zion canyon route",
    visit: {
      daytime: {
        low: ["River waits beneath red canyon walls, checking the permit board with surgical calm.", "The desert light is sharp. So are they."],
        neutral: ["River guides you through Zion's sandstone corridor, naming hazards like old rivals.", "They are dry, exact, and quietly pleased when you keep up."],
        high: ["River stands in desert light bright enough to turn every edge honest.", "They glance at you and say, 'Good. You made the canyon less smug.'"]
      },
      sunset: {
        low: ["Sunset sets the sandstone burning. River lets the view do the heavy lifting and keeps their answers spare.", "You get the sense they are waiting to see what you do with beauty when nobody grades you."],
        neutral: ["Zion at sunset is all copper walls and cooling air. River slows beside you without announcing it.", "They say the canyon has excellent taste in dramatic timing."],
        high: ["The canyon glows red around River, and their usual reserve thins into something almost tender.", "They tell you the desert keeps what matters and burns off the rest."]
      },
      night: {
        low: ["At night, River's route becomes shadow, stars, and firm boundaries.", "They do not dislike the silence. They may currently prefer it to you."],
        neutral: ["River takes you to a night-sky overlook where Zion becomes shape and hush.", "They point out constellations with the same precision they use for permits."],
        high: ["Under the dark Zion sky, River lets the silence stretch until it feels chosen.", "They stand close enough for warmth and say, 'Do not make me say this is nice.'"]
      }
    },
    surprise: {
      low: ["River is at check-in arguing with the kiosk in a voice too calm to be safe. 'It has more routing confidence than judgment.'"],
      neutral: ["River studies the check-in map, then taps your destination. 'Efficient. Emotionally suspicious, but efficient.'"],
      high: ["River catches you at check-in and silently adjusts your route card. 'There. Better odds of surviving your own charm.'"]
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
      ["player", "The air smells like moss, coffee, and consequences that own a good jacket."],
      ["narrator", "A porch board creaks. Jack steps out from under the eaves like the forest has been keeping him for dramatic timing.", "jack"]
    ],
    sunset: [
      ["narrator", "Sunset catches in the Olympic rain until every drop looks briefly lit from inside."],
      ["player", "This is unfairly pretty. Even the puddles have emotional range."],
      ["narrator", "Jack waits beside the cabin steps, sleeves rolled, watching the trail more carefully than he needs to.", "jack"]
    ],
    night: [
      ["narrator", "At night, the Olympic route narrows to lantern glow, black cedar shapes, and rain whispering in the dark."],
      ["player", "This is either romantic or how a cautionary tale gets excellent production design."],
      ["narrator", "Jack lifts a lantern from the porch rail, his smile barely visible under the brim of shadow.", "jack"]
    ]
  },
  caleb: {
    daytime: [
      ["narrator", "Yellowstone arrives in steam and mineral color, the boardwalk cutting a careful line through beautiful danger."],
      ["player", "Everything here looks like it could kill me and then be photogenic about it."],
      ["narrator", "Caleb appears at the rail with a clipboard tucked under one arm and the posture of a man prepared to save lives through scolding.", "caleb"]
    ],
    sunset: [
      ["narrator", "Sunset turns the geyser steam peach and gold, softening everything except the warning signs."],
      ["player", "The park is glowing. The signs are still yelling. Balance."],
      ["narrator", "Caleb checks the boardwalk gate, then looks up like he knew exactly when you would arrive.", "caleb"]
    ],
    night: [
      ["narrator", "Yellowstone after dark is blue steam, low boardwalk lights, and distant thermal breaths in the cold."],
      ["player", "The hot springs sound alive. That is gorgeous and deeply not reassuring."],
      ["narrator", "Caleb steps into the light with a flashlight and a very serious expression doing a poor job hiding relief.", "caleb"]
    ]
  },
  sierra: {
    daytime: [
      ["narrator", "Yosemite rises around you in granite, pine, and waterfall mist that catches the sun in a thousand small flashes."],
      ["player", "Okay. I understand why people write poems and then pretend they did not."],
      ["narrator", "Sierra jogs down from the overlook, bright as the spray behind her.", "sierra"]
    ],
    sunset: [
      ["narrator", "Sunset slides across Yosemite's granite faces, turning the cliffs warm enough to look impossible."],
      ["player", "The whole valley is showing off. Honestly, respect."],
      ["narrator", "Sierra leans against a trail sign, wind in her hair and challenge in her grin.", "sierra"]
    ],
    night: [
      ["narrator", "At night, Yosemite becomes a shape of cliffs and water sounds, huge and close in the dark."],
      ["player", "The waterfall is louder when I cannot see all of it. That feels like a metaphor with hiking boots."],
      ["narrator", "Sierra's flashlight bobs along the trail before she appears, already moving like stillness owes her money.", "sierra"]
    ]
  },
  bruno: {
    daytime: [
      ["narrator", "The Sequoia grove receives you in shade and quiet, each giant trunk making the world feel slower and older."],
      ["player", "I am suddenly aware that I have never been patient enough for a tree to approve of me."],
      ["narrator", "Bruno steps from behind a massive trunk carrying a coil of rope and a smile too warm for the cool air.", "bruno"]
    ],
    sunset: [
      ["narrator", "Sunset filters through the Sequoia canopy in long amber shafts, turning dust motes into tiny sparks."],
      ["player", "This place makes ordinary breathing feel like a respectful activity."],
      ["narrator", "Bruno kneels by an old fire ring, checking it with gentle seriousness before he notices you.", "bruno"]
    ],
    night: [
      ["narrator", "The night grove is quiet enough to make every footstep ask permission."],
      ["player", "The trees disappear upward into the stars. I feel very small, but not in a bad way."],
      ["narrator", "A lantern glow rounds one trunk, and Bruno follows it, steady as a promise.", "bruno"]
    ]
  },
  river: {
    daytime: [
      ["narrator", "Zion's canyon walls rise red and clean around the trail, the desert light sharpening every edge."],
      ["player", "The whole place looks like it was carved by someone with excellent taste and no interest in subtlety."],
      ["narrator", "River stands by the permit board, marking a route with the precision of a person who has opinions about shortcuts.", "river"]
    ],
    sunset: [
      ["narrator", "Sunset sets Zion's sandstone glowing copper, cooling the air while the canyon keeps the heat of the day."],
      ["player", "This view is extremely rude. It knows exactly what it is doing."],
      ["narrator", "River waits at the trail split, arms folded, watching the light change like it owes them an answer.", "river"]
    ],
    night: [
      ["narrator", "At night, Zion becomes dark stone, pale trail dust, and a sky crowded with stars."],
      ["player", "The canyon is quieter now. Or maybe it is just making me listen harder."],
      ["narrator", "River's silhouette appears against the starlit route sign, still enough to seem carved there.", "river"]
    ]
  }
};

const visitBeats = {
  jack: [
    {
      prompt: {
        low: ["jack", "Before we go anywhere, are you planning to treat the trail like a trail today?", "jack:grumpy"],
        neutral: ["jack", "First rule out here: the forest gets a vote. You willing to listen?", "jack"],
        high: ["jack", "I was hoping you would show up. Try not to make me too obvious about it.", "jack:blushing"]
      },
      choices: [
        { label: "Tell him you will follow the marked trail and his lead.", feelings: { jack: 1 }, tone: "warm" },
        { label: "Ask what the forest sounds like when it gets a vote.", feelings: { jack: 2 }, tone: "flirt" },
        { label: "Say a little risk makes better stories.", feelings: { jack: -2 }, tone: "bad" }
      ],
      reactions: {
        warm: [["jack", "Good. I like not rescuing people from problems they introduced themselves to.", "jack:laughing"], ["narrator", "He says it dryly, but his shoulders loosen as he starts down the slick boardwalk.", "jack"]],
        flirt: [["jack", "Careful. That is dangerously close to an excellent question.", "jack:blushing"], ["narrator", "He holds your gaze for one rain-bright second before pretending to inspect the trail.", "jack:blushing"]],
        bad: [["jack", "Stories are better when everyone gets home to tell them.", "jack:grumpy"], ["narrator", "The rain seems to get colder around the edge of his voice.", "jack:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["narrator", "The trail bends through sword ferns and dripping cedar. Jack stops beside a mossy side path, blocking it with one boot.", "jack:grumpy"],
        neutral: ["narrator", "Rain beads on the cedar rail while Jack points out elk tracks pressed into the mud.", "jack"],
        high: ["narrator", "Jack slows where the old-growth canopy turns the rain into a soft, private percussion.", "jack:blushing"]
      },
      choices: [
        { label: "Notice the tiny seedlings growing from a nurse log.", feelings: { jack: 2 }, tone: "warm" },
        { label: "Tease him about looking romantic while giving safety tips.", feelings: { jack: 1 }, tone: "flirt" },
        { label: "Step toward the side path just to see his reaction.", feelings: { jack: -2 }, tone: "bad" }
      ],
      reactions: {
        warm: [["jack", "Most people miss those. The forest is very good at starting over quietly.", "jack"], ["narrator", "His voice softens, almost proud, like you passed a test he did not admit he was giving.", "jack"]],
        flirt: [["jack", "I contain multitudes. Some of them know how to read a trail closure.", "jack:laughing"], ["player", "A devastating combination.", "jack:laughing"]],
        bad: [["jack", "No.", "jack:grumpy"], ["narrator", "One word. Not loud. Completely immovable.", "jack:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["jack", "We are heading back before the weather decides to make a point.", "jack:grumpy"],
        neutral: ["jack", "There is a viewpoint ahead, then I should get you back before the route changes mood.", "jack"],
        high: ["jack", "One more overlook. Then I return you to the impossible kiosk like a responsible adult, tragically.", "jack:blushing"]
      },
      choices: [
        { label: "Thank him for showing you the park instead of just the danger.", feelings: { jack: 2 }, tone: "warm" },
        { label: "Say you are already looking for an excuse to come back.", feelings: { jack: 2 }, tone: "flirt" },
        { label: "Say the rain is kind of ruining the aesthetic.", feelings: { jack: -2 }, tone: "bad" }
      ],
      reactions: {
        warm: [["jack", "That is the trick. Respect the danger, then you get to notice everything else.", "jack"], ["narrator", "He walks you back slowly, letting the forest have the last word.", "jack"]],
        flirt: [["jack", "I can probably manufacture one. I am resourceful in weather-related emergencies.", "jack:blushing"], ["narrator", "His smile follows you all the way back to the route marker.", "jack:blushing"]],
        bad: [["jack", "The rain is the aesthetic.", "jack:grumpy"], ["narrator", "He turns toward the return trail before the conversation can get any wetter.", "jack:grumpy"]]
      }
    }
  ],
  caleb: [
    {
      prompt: {
        low: ["caleb", "Before we start, I need verbal confirmation that you understand the boardwalk is not decorative.", "caleb:grumpy"],
        neutral: ["caleb", "Boardwalk rule first. Beautiful things can still be dangerous.", "caleb"],
        high: ["caleb", "I am glad you came. I am also legally obligated to keep you from becoming a cautionary plaque.", "caleb:blushing"]
      },
      choices: [
        { label: "Promise both feet stay on the boardwalk.", feelings: { caleb: 2 }, tone: "warm" },
        { label: "Ask if he always makes safety sound attractive.", feelings: { caleb: 1 }, tone: "flirt" },
        { label: "Say rules ruin the mood.", feelings: { caleb: -2 }, tone: "bad" }
      ],
      reactions: {
        warm: [["caleb", "Excellent. That sentence just improved my blood pressure.", "caleb:laughing"], ["narrator", "He gestures you forward, visibly pleased despite the professional face he is attempting.", "caleb"]],
        flirt: [["caleb", "No. Sometimes I make it sound terrifying. Depends who is listening.", "caleb:blushing"], ["player", "I am listening very respectfully.", "caleb:blushing"]],
        bad: [["caleb", "Thermal burns also ruin the mood.", "caleb:grumpy"], ["narrator", "The steam hisses behind him like Yellowstone agrees.", "caleb:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["narrator", "Caleb stops near a milky blue pool, leaving enough space between you and the rail to imply he has measured it.", "caleb:grumpy"],
        neutral: ["narrator", "Steam drifts across the boardwalk. Caleb names each pool with careful affection, like introducing complicated friends.", "caleb"],
        high: ["narrator", "At the overlook, Caleb lowers his voice so the steam and the two of you share the same small world.", "caleb:blushing"]
      },
      choices: [
        { label: "Ask what first made him fall for Yellowstone.", feelings: { caleb: 2 }, tone: "warm" },
        { label: "Tell him the steam is doing excellent romantic lighting work.", feelings: { caleb: 1 }, tone: "flirt" },
        { label: "Lean over the rail for a better look.", feelings: { caleb: -2 }, tone: "bad" }
      ],
      reactions: {
        warm: [["caleb", "The first geyser I saw. It looked chaotic, but it was following a pattern older than me.", "caleb"], ["narrator", "He sounds almost shy about the sincerity of it.", "caleb:blushing"]],
        flirt: [["caleb", "The steam is not a licensed assistant, but I will pass along the compliment.", "caleb:laughing"], ["narrator", "He laughs before he can stop himself.", "caleb:laughing"]],
        bad: [["caleb", "Back. Now.", "caleb:grumpy"], ["narrator", "His hand catches your sleeve, firm and frightened under the anger.", "caleb:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["caleb", "I am walking you back before you discover another way to age me.", "caleb:grumpy"],
        neutral: ["caleb", "Last stop. Then I should get you back before the light changes the route markers.", "caleb"],
        high: ["caleb", "One more view. Then I release you back into the wild, reluctantly and with snacks.", "caleb:blushing"]
      },
      choices: [
        { label: "Tell him careful people make beautiful places easier to love.", feelings: { caleb: 2 }, tone: "warm" },
        { label: "Ask if the snack comes with another date.", feelings: { caleb: 2 }, tone: "flirt" },
        { label: "Say you still think the warnings are overkill.", feelings: { caleb: -2 }, tone: "bad" }
      ],
      reactions: {
        warm: [["caleb", "That is... exactly why I do this.", "caleb:blushing"], ["narrator", "For once, Caleb has no statistic ready. Just a smile he cannot file away.", "caleb:blushing"]],
        flirt: [["caleb", "It can. For safety reasons, obviously.", "caleb:laughing"], ["narrator", "He hands you the snack like it is evidence.", "caleb:laughing"]],
        bad: [["caleb", "Then I have not explained them well enough, and that is on me to fix later.", "caleb:grumpy"], ["narrator", "He guides you back with professional precision and personal disappointment.", "caleb:grumpy"]]
      }
    }
  ],
  sierra: [
    {
      prompt: {
        low: ["sierra", "Tell me you came here to actually see Yosemite, not just use it as proof you went somewhere.", "sierra:grumpy"],
        neutral: ["sierra", "Rule one: look up. Yosemite hates being treated like wallpaper.", "sierra"],
        high: ["sierra", "You made it. Good. The waterfall was getting impatient, and so was I.", "sierra:blushing"]
      },
      choices: [
        { label: "Look up before answering and let the view land.", feelings: { sierra: 2 }, tone: "warm" },
        { label: "Tell her the view is dramatic, but she is worse.", feelings: { sierra: 1 }, tone: "flirt" },
        { label: "Start framing a perfect post instead.", feelings: { sierra: -2 }, tone: "bad" }
      ],
      reactions: {
        warm: [["sierra", "There. That pause? That is the good stuff.", "sierra"], ["narrator", "She smiles like you found a trail marker hidden in plain sight.", "sierra:laughing"]],
        flirt: [["sierra", "Correct answer. Reckless, but correct.", "sierra:blushing"], ["player", "I respect the terrain.", "sierra:blushing"]],
        bad: [["sierra", "Oh, we are doing this the hard way.", "sierra:grumpy"], ["narrator", "She steps between you and the shot with athletic precision.", "sierra:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["narrator", "Sierra leads you up the trail at a pace that suggests forgiveness has cardio requirements.", "sierra:grumpy"],
        neutral: ["narrator", "The waterfall throws cool mist across the trail. Sierra slows just enough for you to catch the rainbow in it.", "sierra"],
        high: ["narrator", "Sierra takes the steep steps two at a time, then waits at the top pretending she did not check whether you followed.", "sierra:blushing"]
      },
      choices: [
        { label: "Ask her what part of the trail most people miss.", feelings: { sierra: 2 }, tone: "warm" },
        { label: "Challenge her to point out the best view before you do.", feelings: { sierra: 1 }, tone: "flirt" },
        { label: "Complain that the climb is too much work.", feelings: { sierra: -2 }, tone: "bad" }
      ],
      reactions: {
        warm: [["sierra", "The sound. Everyone photographs the water. Fewer people listen to it arrive.", "sierra"], ["narrator", "For a moment, she lets the trail go quiet around you.", "sierra"]],
        flirt: [["sierra", "Bold. Wrong, probably, but bold.", "sierra:laughing"], ["narrator", "She laughs and darts ahead, daring you to keep up.", "sierra:laughing"]],
        bad: [["sierra", "The view is not a vending machine. You do have to move toward it.", "sierra:grumpy"], ["narrator", "Her expression could cut switchbacks.", "sierra:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["sierra", "We are almost done. Try to leave with one genuine memory.", "sierra:grumpy"],
        neutral: ["sierra", "Last overlook. Then I return you before the trail decides we are part of it.", "sierra"],
        high: ["sierra", "One more overlook. No captions. Just us and an unreasonable amount of granite.", "sierra:blushing"]
      },
      choices: [
        { label: "Thank her for making you slow down.", feelings: { sierra: 2 }, tone: "warm" },
        { label: "Say you would follow her to a worse view too.", feelings: { sierra: 2 }, tone: "flirt" },
        { label: "Say the photos will be the best part.", feelings: { sierra: -2 }, tone: "bad" }
      ],
      reactions: {
        warm: [["sierra", "Do not make it weird, but... you are welcome.", "sierra:blushing"], ["narrator", "She looks away at the waterfall, smiling where you can still see it.", "sierra:blushing"]],
        flirt: [["sierra", "Impossible. I do not do worse views.", "sierra:laughing"], ["narrator", "She bumps your shoulder with hers before starting down.", "sierra:laughing"]],
        bad: [["sierra", "That is a sad little sentence, and I reject it on behalf of the cliff.", "sierra:grumpy"], ["narrator", "She heads back with the pace of someone outrunning disappointment.", "sierra:grumpy"]]
      }
    }
  ],
  bruno: [
    {
      prompt: {
        low: ["bruno", "The grove is quiet today. I would like to keep it that way.", "bruno:grumpy"],
        neutral: ["bruno", "Walk slow here. The trees have been patient longer than any of us.", "bruno"],
        high: ["bruno", "I saved you the shaded path. It is the one that makes people whisper without being asked.", "bruno:blushing"]
      },
      choices: [
        { label: "Lower your voice and match his pace.", feelings: { bruno: 2 }, tone: "warm" },
        { label: "Tell him he looks at home among giants.", feelings: { bruno: 1 }, tone: "flirt" },
        { label: "Ask if there is a faster way through.", feelings: { bruno: -2 }, tone: "bad" }
      ],
      reactions: {
        warm: [["bruno", "Thank you. Some places ask gently, but they still ask.", "bruno"], ["narrator", "His smile comes slow and real.", "bruno"]],
        flirt: [["bruno", "That may be the nicest height joke I have ever received.", "bruno:laughing"], ["player", "I am a respectful innovator.", "bruno:laughing"]],
        bad: [["bruno", "Through, yes. With, no.", "bruno:grumpy"], ["narrator", "He does not sound angry. Somehow that makes it land harder.", "bruno:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["narrator", "Bruno stops by an old fire ring and checks the stones with careful hands.", "bruno:grumpy"],
        neutral: ["narrator", "The trail opens around a sequoia so wide it makes the air feel ceremonial.", "bruno"],
        high: ["narrator", "Bruno pauses beside a giant trunk, resting one hand against the bark like greeting an old friend.", "bruno:blushing"]
      },
      choices: [
        { label: "Ask him to teach you the fire-safety check.", feelings: { bruno: 2 }, tone: "warm" },
        { label: "Say his gentleness is kind of devastating.", feelings: { bruno: 1 }, tone: "flirt" },
        { label: "Joke that one tiny ember cannot matter much.", feelings: { bruno: -2 }, tone: "bad" }
      ],
      reactions: {
        warm: [["bruno", "Gladly. Caring is easier when your hands know what to do.", "bruno:laughing"], ["narrator", "He guides you through the check with patient pride.", "bruno:laughing"]],
        flirt: [["bruno", "Oh. That is... I am going to inspect this perfectly safe bark now.", "bruno:blushing"], ["narrator", "He turns pink enough that even the sunset would be jealous.", "bruno:blushing"]],
        bad: [["bruno", "Every big fire starts by being small enough to ignore.", "bruno:grumpy"], ["narrator", "His voice stays gentle, but the grove seems to hold its breath.", "bruno:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["bruno", "I should walk you back. The grove has had enough noise for one visit.", "bruno:grumpy"],
        neutral: ["bruno", "We should head back while the route is easy to read.", "bruno"],
        high: ["bruno", "One last quiet minute, then I will stop selfishly keeping you under my favorite trees.", "bruno:blushing"]
      },
      choices: [
        { label: "Tell him the grove feels safer because he cares for it.", feelings: { bruno: 2 }, tone: "warm" },
        { label: "Ask if favorite trees count as date witnesses.", feelings: { bruno: 2 }, tone: "flirt" },
        { label: "Say you are ready to go because it all looks the same.", feelings: { bruno: -2 }, tone: "bad" }
      ],
      reactions: {
        warm: [["bruno", "That means more than you know.", "bruno:blushing"], ["narrator", "He walks you back with a shy smile and the steady glow of the lantern.", "bruno:blushing"]],
        flirt: [["bruno", "They are very discreet. Terrible at gossip.", "bruno:laughing"], ["narrator", "His laugh rolls through the grove, warm and low.", "bruno:laughing"]],
        bad: [["bruno", "Then I hope one day it does not.", "bruno:grumpy"], ["narrator", "He leads the way back, quiet settling between you like fallen needles.", "bruno:grumpy"]]
      }
    }
  ],
  river: [
    {
      prompt: {
        low: ["river", "Before we begin, are you here to follow the route or argue with geology?", "river:grumpy"],
        neutral: ["river", "The canyon is simple if you respect it. People complicate things.", "river"],
        high: ["river", "You came. Good. The canyon was becoming insufferable without competition.", "river:blushing"]
      },
      choices: [
        { label: "Tell them you will respect the route.", feelings: { river: 2 }, tone: "warm" },
        { label: "Say you came to see if the canyon could compete with them.", feelings: { river: 1 }, tone: "flirt" },
        { label: "Ask how strict the permit rules really are.", feelings: { river: -2 }, tone: "bad" }
      ],
      reactions: {
        warm: [["river", "Efficient answer. Suspiciously attractive.", "river:blushing"], ["narrator", "They turn before you can enjoy the compliment too obviously.", "river:blushing"]],
        flirt: [["river", "It cannot. But it has seniority.", "river:laughing"], ["player", "A formidable opponent.", "river:laughing"]],
        bad: [["river", "Strict enough that I become unpleasant in defense of them.", "river:grumpy"], ["narrator", "Their calm is somehow sharper than yelling.", "river:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["narrator", "River stops where the canyon narrows, letting the silence make its own argument.", "river:grumpy"],
        neutral: ["narrator", "The sandstone walls hold the day's warmth while River traces the route with one precise finger.", "river"],
        high: ["narrator", "River slows at a bend where the canyon light turns deep red and private.", "river:blushing"]
      },
      choices: [
        { label: "Ask what the desert taught them to notice first.", feelings: { river: 2 }, tone: "warm" },
        { label: "Tell them their route notes sound like poetry with liability coverage.", feelings: { river: 1 }, tone: "flirt" },
        { label: "Kick a loose stone down the trail.", feelings: { river: -2 }, tone: "bad" }
      ],
      reactions: {
        warm: [["river", "Water. Even when it is absent, it explains the shape of everything.", "river"], ["narrator", "They say it softly, like sharing a password.", "river"]],
        flirt: [["river", "That is the most tolerable thing anyone has said about paperwork.", "river:laughing"], ["narrator", "Their smile is quick, rare, and absolutely worth catching.", "river:laughing"]],
        bad: [["river", "Do not make gravity responsible for your boredom.", "river:grumpy"], ["narrator", "The stone clicks into silence. River waits until you feel every click.", "river:grumpy"]]
      }
    },
    {
      prompt: {
        low: ["river", "We are turning back. I prefer ending visits before they become reports.", "river:grumpy"],
        neutral: ["river", "One final overlook. Then I return you to civilization, such as it is.", "river"],
        high: ["river", "One last overlook. Do not make me admit I chose the romantic one.", "river:blushing"]
      },
      choices: [
        { label: "Thank them for showing you the desert's quiet side.", feelings: { river: 2 }, tone: "warm" },
        { label: "Promise not to tell anyone they chose the romantic route.", feelings: { river: 2 }, tone: "flirt" },
        { label: "Say the canyon is mostly just rocks.", feelings: { river: -2 }, tone: "bad" }
      ],
      reactions: {
        warm: [["river", "Good. The loud side gets enough attention.", "river"], ["narrator", "They walk you back slowly, letting the canyon keep its dignity.", "river"]],
        flirt: [["river", "Wise. I know where all the difficult switchbacks are.", "river:blushing"], ["narrator", "Their shoulder brushes yours, plausibly by accident and not plausibly at all.", "river:blushing"]],
        bad: [["river", "And people are mostly water. Reduction is a boring hobby.", "river:grumpy"], ["narrator", "They turn toward the return route with magnificent restraint.", "river:grumpy"]]
      }
    }
  ]
};

const scenes = {
  intro_checkin_arrival: {
    label: "Check-In",
    background: () => ({ location: "checkIn", time: "daytime" }),
    lines: [
      ["player", "My name is {playerName}, and I make a living turning beautiful places into tiny videos people watch while pretending they are not procrastinating."],
      ["player", "The parks invited me to a creator retreat at Viral Vista Lodge: five route leads, five iconic landscapes, one very official promise that I would learn to make better choices."],
      ["player", "I assumed that meant content choices. Lighting. Angles. Maybe not flirting with park staff on day one."],
      ["narrator", "Daylight spills across the outdoor check-in desk, all pine shadows, fresh coffee, and a kiosk humming with suspicious confidence."],
      ["narrator", "Your badge prints with your name on it: {playerName}."],
      ["player", "Okay. Cute. A little official. A little ominous."]
    ],
    next: "intro_lodge_lobby"
  },
  intro_lodge_lobby: {
    label: "Lodge Lobby",
    background: () => ({ location: "lodge", time: "daytime" }),
    character: "jack",
    lines: [
      ["narrator", "Inside the lodge lobby, cedar beams glow over a stone fireplace and a wall map crowded with impossible route pins."],
      ["narrator", "The whole place feels like summer camp if summer camp had better lighting and significantly more romantic tension."],
      ["narrator", "A broad-shouldered man in a red flannel leans over the check-in table, sleeves rolled, one hand braced beside your name badge.", "jack"],
      ["jack", "You must be {playerName}. I'm Jack Everett, the Olympic route lead. Think old-growth forest, a mossy cabin, and rain that makes everyone honest eventually.", "jack"],
      ["player", "I thought there would be a check-in packet.", "jack"],
      ["jack", "There is. It says welcome, hydrate, do not wander off trail, and if a sign says no, take it personally.", "jack:laughing"],
      ["player", "That is a lot of emotional labor from signage.", "jack"],
      ["jack", "Signs care because I care. Which brings us to your first important choice of the retreat.", "jack"]
    ],
    choices: [
      { label: "Tell him no means no, even from a trail sign.", detail: "Start with respect for boundaries.", next: "intro_lodge_jack_two", feelings: { jack: 2 }, reaction: [["jack", "That is the kind of sentence that keeps my blood pressure scenic.", "jack:laughing"], ["narrator", "He taps your welcome packet against his palm, smiling like you just passed the first trail marker.", "jack:laughing"]] },
      { label: "Ask what the forest sounds like when it says yes.", detail: "Curious and a little flirty.", next: "intro_lodge_jack_two", feelings: { jack: 1 }, reaction: [["jack", "Usually rain, frogs, and me pretending that question did not work on me.", "jack:blushing"], ["player", "I will take pretending as a provisional win.", "jack:blushing"]] },
      { label: "Say rules are flexible if the shot is good enough.", detail: "Bad first instinct.", next: "intro_lodge_jack_two", feelings: { jack: -2 }, reaction: [["jack", "No shot is good enough to make a rescue team hate your name.", "jack:grumpy"], ["narrator", "The warmth in his face does not vanish, but it does step back.", "jack:grumpy"]] }
    ]
  },
  intro_lodge_jack_two: {
    label: "Lodge Lobby",
    background: () => ({ location: "lodge", time: "daytime" }),
    lines: [
      ["narrator", "Jack walks you past the lobby map, where pins mark parks that should not fit on the same afternoon.", "jack"],
      ["jack", "Each route lead gets protective of their place. Occupational hazard of loving something that visitors keep trying to simplify.", "jack"],
      ["player", "And you? Protective or hazard?", "jack"],
      ["jack", "Both, on a good day.", "jack:laughing"]
    ],
    choices: [
      { label: "Ask what Olympic means to him.", detail: "Invite sincerity.", next: "intro_lodge_jack_three", feelings: { jack: 2 }, reaction: [["jack", "Rain, mostly. Then trees old enough to make your problems feel badly scheduled.", "jack"], ["narrator", "He says it like a joke, but there is devotion under the weather report.", "jack:blushing"]] },
      { label: "Say he makes protective sound unfairly charming.", detail: "Flirt with the ranger energy.", next: "intro_lodge_jack_three", feelings: { jack: 1 }, reaction: [["jack", "Dangerous thing to say to a man holding emergency whistles.", "jack:blushing"], ["player", "I accept the risk.", "jack:blushing"]] },
      { label: "Joke that visitors keep parks relevant.", detail: "This lands badly.", next: "intro_lodge_jack_three", feelings: { jack: -2 }, reaction: [["jack", "Parks were relevant before any of us learned to point a camera at them.", "jack:grumpy"], ["narrator", "His voice stays calm, which somehow makes the correction sharper.", "jack:grumpy"]] }
    ]
  },
  intro_lodge_jack_three: {
    label: "Lodge Lobby",
    background: () => ({ location: "lodge", time: "daytime" }),
    lines: [
      ["narrator", "The lobby settles around you: low fire, old beams, route cards fanned across the desk like invitations with consequences.", "jack"],
      ["jack", "Before I hand you to the kiosk, one more thing. What are you actually hoping to get from this retreat?", "jack"],
      ["player", "Besides surviving the welcome packet?", "jack"],
      ["jack", "Ambitious. I like it.", "jack:laughing"]
    ],
    choices: [
      { label: "Say you want to learn how to make people care without flattening the place.", detail: "A thoughtful answer.", next: "intro_lodge_jack_wrap", feelings: { jack: 2 }, reaction: [["jack", "That is... a better answer than I expected this early.", "jack:blushing"], ["narrator", "For a moment, he looks at you like the retreat might have brought him a good surprise.", "jack:blushing"]] },
      { label: "Say you are open to being changed by a few beautiful places.", detail: "Earnest, maybe dangerous.", next: "intro_lodge_jack_wrap", feelings: { jack: 1 }, reaction: [["jack", "Careful. Places are very good at taking people up on that.", "jack"], ["player", "That sounded like a warning and an invitation.", "jack"], ["jack", "Efficient, right?", "jack:laughing"]] },
      { label: "Say you mostly want better numbers and better views.", detail: "Honest, but not graceful.", next: "intro_lodge_jack_wrap", feelings: { jack: -2 }, reaction: [["jack", "Then I hope the views do some work on you before the numbers do.", "jack:grumpy"], ["narrator", "He gathers the route cards with a little more force than necessary.", "jack:grumpy"]] }
    ]
  },
  intro_lodge_jack_wrap: {
    label: "Lodge Lobby",
    background: () => ({ location: "lodge", time: "daytime" }),
    lines: [
      ["narrator", "Jack slides a route card into your welcome packet, then nods toward the lobby doors.", "jack"],
      ["jack", "Come on. The real check-in desk is outside, and if I leave the kiosk alone too long, it gets theatrical.", "jack"],
      ["player", "That sounds like a joke I am going to understand too late.", "jack"],
      ["jack", "Almost definitely.", "jack:laughing"]
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
      ["jack", "There is also the part where it bends space and time so you can jump between parks that are thousands of miles apart almost instantly.", "jack:laughing"],
      ["player", "Wait, what?", "jack"],
      ["jack", "Anyway. Caleb is waiting at Yellowstone. Boardwalk rules, geothermal hazards, very handsome scolding. You will love it.", "jack"],
      ["player", "We are just moving on from the space-time thing?", "jack"],
      ["jack", "Already did.", "jack:laughing"]
    ],
    choices: [
      { label: "Tell Jack you respect a man who refuses to explain the plot device.", detail: "Jack enjoys that more than he admits.", next: "intro_yellowstone_caleb", feelings: { jack: 2 }, reaction: [["jack", "That is the healthiest possible relationship with this kiosk.", "jack:laughing"], ["narrator", "He looks extremely pleased to have explained nothing.", "jack:laughing"]] },
      { label: "Say the kiosk seems legally questionable.", detail: "Jack calls that an advanced observation.", next: "intro_yellowstone_caleb", reaction: [["jack", "Probably. But it has never asked for a lawyer, and I respect confidence.", "jack:laughing"], ["player", "That did not reassure me.", "jack:laughing"]] },
      { label: "Demand a full scientific explanation right now.", detail: "Jack expertly does not provide one.", next: "intro_yellowstone_caleb", feelings: { jack: -2 }, reaction: [["jack", "I would love to, but then the kiosk gets smug.", "jack"], ["narrator", "He turns the route card over before you can object, committing fully to evasion.", "jack"]] }
    ]
  },
  intro_yellowstone_caleb: {
    label: "Yellowstone",
    background: () => ({ location: "yellowstone", time: "daytime" }),
    lines: [
      ["narrator", "Yellowstone opens around you in steam, boardwalk rails, and blue pools that look too pretty to be allowed near human foolishness."],
      ["player", "The air smells like minerals, heat, and a warning label someone made scenic."],
      ["narrator", "A ranger at the rail turns as you approach, one hand already hovering near the nearest safety sign.", "caleb"],
      ["caleb", "Welcome to the boardwalk. It is here because the ground is fragile, hot, and not interested in influencer culture.", "caleb"],
      ["player", "Noted. The beautiful danger has boundaries.", "caleb"],
      ["caleb", "Exactly. Stay on the path and I become much more charming.", "caleb:blushing"]
    ],
    choices: [
      { label: "Promise Caleb both feet are staying on the boardwalk.", detail: "Safety rizz lands cleanly.", next: "intro_yellowstone_caleb_two", feelings: { caleb: 2 }, reaction: [["caleb", "Good. I like my visitors alive and my paperwork boring.", "caleb:laughing"], ["narrator", "His smile is quick, but it cuts cleanly through the steam.", "caleb:laughing"]] },
      { label: "Ask if the steam always makes him look this dramatic.", detail: "He recovers eventually.", next: "intro_yellowstone_caleb_two", feelings: { caleb: 1 }, reaction: [["caleb", "The steam is not doing this on purpose. Probably.", "caleb:blushing"], ["player", "Probably is a strong romantic foundation.", "caleb:blushing"]] },
      { label: "Joke about stepping off for a better angle.", detail: "Caleb does not laugh.", next: "intro_yellowstone_caleb_two", feelings: { caleb: -2 }, reaction: [["caleb", "Please do not make me tackle you in front of a thermal feature.", "caleb:grumpy"], ["narrator", "The look he gives you could laminate a safety poster.", "caleb:grumpy"]] }
    ]
  },
  intro_yellowstone_caleb_two: {
    label: "Yellowstone",
    background: () => ({ location: "yellowstone", time: "daytime" }),
    lines: [
      ["narrator", "Caleb leads you a few careful steps down the boardwalk, where steam curls over the rail and vanishes into the sun.", "caleb"],
      ["caleb", "People think Yellowstone is trying to impress them. It is not. It is busy being itself.", "caleb"],
      ["player", "That sounds like something you admire.", "caleb"]
    ],
    choices: [
      { label: "Ask what first made him love the park.", detail: "Give him room to be sincere.", next: "intro_yellowstone_caleb_three", feelings: { caleb: 2 }, reaction: [["caleb", "A geyser eruption when I was twelve. It scared me half to death, then made everything else feel too small.", "caleb:blushing"], ["narrator", "He looks embarrassed by how honest that was, which makes it worse in the best way.", "caleb:blushing"]] },
      { label: "Say you like how serious he gets about beautiful things.", detail: "A direct compliment.", next: "intro_yellowstone_caleb_three", feelings: { caleb: 1 }, reaction: [["caleb", "Beautiful things deserve competence.", "caleb"], ["player", "That was not a denial.", "caleb"], ["caleb", "It was not meant to be.", "caleb:blushing"]] },
      { label: "Ask whether every rule really matters.", detail: "He has thoughts.", next: "intro_yellowstone_caleb_three", feelings: { caleb: -2 }, reaction: [["caleb", "Here? Yes.", "caleb:grumpy"], ["narrator", "The answer is short enough to leave steam hissing into the silence after it.", "caleb:grumpy"]] }
    ]
  },
  intro_yellowstone_caleb_three: {
    label: "Yellowstone",
    background: () => ({ location: "yellowstone", time: "daytime" }),
    lines: [
      ["narrator", "The boardwalk opens to one last pool, blue at the center and ringed with impossible color.", "caleb"],
      ["caleb", "This is usually where people stop talking.", "caleb"],
      ["player", "I can see why.", "caleb"]
    ],
    choices: [
      { label: "Stand quietly with him and let the place be enough.", detail: "Respect the moment.", next: "intro_yellowstone_wrap", feelings: { caleb: 2 }, reaction: [["caleb", "Thank you.", "caleb"], ["narrator", "He says it softly, like quiet is something you did together.", "caleb:blushing"]] },
      { label: "Tell him this was a surprisingly good first date with danger.", detail: "Flirt through the safety briefing.", next: "intro_yellowstone_wrap", feelings: { caleb: 1 }, reaction: [["caleb", "I am choosing to hear 'good first date' and not 'with danger.'", "caleb:laughing"], ["player", "Selective hearing. Very romantic.", "caleb:laughing"]] },
      { label: "Admit you still want one closer picture.", detail: "Bad instinct.", next: "intro_yellowstone_wrap", feelings: { caleb: -2 }, reaction: [["caleb", "Then I am walking you back before wanting becomes doing.", "caleb:grumpy"], ["narrator", "He is not cruel about it. Somehow that makes disappointing him worse.", "caleb:grumpy"]] }
    ]
  },
  intro_yellowstone_wrap: {
    label: "Yellowstone",
    background: () => ({ location: "yellowstone", time: "daytime" }),
    lines: [
      ["narrator", "Caleb checks the route card, then nods toward the boardwalk entrance where the impossible path back waits.", "caleb"],
      ["caleb", "That is your Yellowstone introduction. Short enough to keep you safe, long enough that I hope you remember more than the warnings.", "caleb"],
      ["player", "I will. The warnings had excellent cheekbones.", "caleb"],
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
      ["narrator", "A woman jogs down from the overlook as if gravity signed a waiver for her.", "sierra"],
      ["sierra", "You made it. Good. The cliff was starting to think you were intimidated.", "sierra:laughing"],
      ["player", "I am intimidated. I am just being stylish about it.", "sierra"],
      ["sierra", "Acceptable. Keep up.", "sierra"]
    ],
    choices: [
      { label: "Match Sierra's pace and compliment the view without making it a bit.", next: "intro_yosemite_sierra_two", feelings: { sierra: 2 }, reaction: [["sierra", "Look at you, having a genuine experience. Dangerous. Attractive.", "sierra:laughing"], ["narrator", "She grins and lets the trail open toward the waterfall.", "sierra:laughing"]] },
      { label: "Ask her favorite place to watch the light move on the granite.", next: "intro_yosemite_sierra_two", feelings: { sierra: 1 }, reaction: [["sierra", "Now that is a question with legs. Come on.", "sierra:blushing"], ["narrator", "She points you toward a small overlook glowing gold at the edges.", "sierra:blushing"]] },
      { label: "Try to turn the waterfall into content immediately.", next: "intro_yosemite_sierra_two", feelings: { sierra: -2 }, reaction: [["sierra", "The waterfall is not your unpaid intern.", "sierra:grumpy"], ["player", "That is... fair.", "sierra:grumpy"]] }
    ]
  },
  intro_yosemite_sierra_two: {
    label: "Yosemite",
    background: () => ({ location: "yosemite", time: "sunset" }),
    lines: [
      ["narrator", "Sierra leads you toward a small overlook where waterfall mist turns gold at the edges.", "sierra"],
      ["sierra", "Most people aim at the biggest thing in front of them. Yosemite rewards peripheral vision.", "sierra"],
      ["player", "That sounds suspiciously like life advice.", "sierra"]
    ],
    choices: [
      { label: "Ask what most people miss here.", detail: "Let her teach without making it a lecture.", next: "intro_yosemite_sierra_three", feelings: { sierra: 2 }, reaction: [["sierra", "The sound before the view. The water announces itself, and everyone still waits for proof.", "sierra"], ["narrator", "She says it lightly, but the answer has roots.", "sierra"]] },
      { label: "Tell her she notices things like someone in love with the place.", detail: "Sincere and a little bold.", next: "intro_yosemite_sierra_three", feelings: { sierra: 1 }, reaction: [["sierra", "Obviously. Have you seen it?", "sierra:laughing"], ["narrator", "She laughs, but there is a blush tucked behind the bravado.", "sierra:blushing"]] },
      { label: "Say the biggest thing is usually the best shot.", detail: "She disagrees intensely.", next: "intro_yosemite_sierra_three", feelings: { sierra: -2 }, reaction: [["sierra", "That is how people come home with twelve identical photos and no memory.", "sierra:grumpy"], ["player", "Point taken.", "sierra:grumpy"]] }
    ]
  },
  intro_yosemite_sierra_three: {
    label: "Yosemite",
    background: () => ({ location: "yosemite", time: "sunset" }),
    lines: [
      ["narrator", "The trail steepens for one last push. Sierra stops at the top and waits, pretending not to check whether you are winded.", "sierra"],
      ["sierra", "Final test. What do you do when a place is bigger than your ability to describe it?", "sierra"],
      ["player", "That feels like a trap with excellent scenery.", "sierra"]
    ],
    choices: [
      { label: "Admit you shut up and let it be bigger.", detail: "The rare correct answer.", next: "intro_yosemite_wrap", feelings: { sierra: 2 }, reaction: [["sierra", "Good. There may be hope for you yet.", "sierra:blushing"], ["narrator", "She looks at the granite instead of you, but her smile gives her away.", "sierra:blushing"]] },
      { label: "Say you ask the person beside you what she sees.", detail: "Share the moment.", next: "intro_yosemite_wrap", feelings: { sierra: 1 }, reaction: [["sierra", "Sneaky. Making me do emotional labor with a view.", "sierra:laughing"], ["player", "Only because you are good at it.", "sierra:laughing"]] },
      { label: "Say you make the caption work anyway.", detail: "Old habits.", next: "intro_yosemite_wrap", feelings: { sierra: -2 }, reaction: [["sierra", "The cliff is disappointed, and so am I.", "sierra:grumpy"], ["narrator", "She says it like a joke, but only half of it is joking.", "sierra:grumpy"]] }
    ]
  },
  intro_yosemite_wrap: {
    label: "Yosemite",
    background: () => ({ location: "yosemite", time: "sunset" }),
    lines: [
      ["narrator", "Sierra walks you back down as sunset thins along the trail, her pace finally easy enough to feel companionable.", "sierra"],
      ["sierra", "That is the Yosemite sampler. Cliffs, water, humility. Very balanced program.", "sierra:laughing"],
      ["player", "And cardio.", "sierra"],
      ["sierra", "Cardio is how the park knows you meant it.", "sierra:laughing"]
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
    next: "intro_zion_river"
  },
  intro_zion_river: {
    label: "Red Rock",
    background: () => ({ location: "zion", time: "night" }),
    lines: [
      ["narrator", "The red rock route waits under a sky packed with stars. Canyon walls rise around you like the dark has architecture."],
      ["player", "The desert is quieter than I expected. Not empty. Just extremely selective."],
      ["narrator", "Someone stands beside the route sign, still as sandstone until they turn their head.", "river"],
      ["river", "You are late, but the desert is dramatic enough to pretend that was intentional.", "river"],
      ["player", "Is that approval?", "river"],
      ["river", "That was meteorology with judgment.", "river:laughing"]
    ],
    choices: [
      { label: "Respect River's route rules and let the night be quiet.", next: "intro_zion_river_two", feelings: { river: 2 }, reaction: [["river", "Excellent. Silence improves most people by at least thirty percent.", "river:laughing"], ["narrator", "They start down the route, and the canyon seems to approve of the restraint.", "river:laughing"]] },
      { label: "Ask what the canyon sounds like when nobody is performing.", next: "intro_zion_river_two", feelings: { river: 1 }, reaction: [["river", "Like water that left a long time ago and still expects credit.", "river:blushing"], ["narrator", "Their answer is dry, but their voice is softer than before.", "river:blushing"]] },
      { label: "Say deserts are basically empty content backdrops.", next: "intro_zion_river_two", feelings: { river: -2 }, reaction: [["river", "That is the kind of sentence a canyon remembers.", "river:grumpy"], ["narrator", "The silence after it feels less peaceful and more earned.", "river:grumpy"]] }
    ]
  },
  intro_zion_river_two: {
    label: "Red Rock",
    background: () => ({ location: "zion", time: "night" }),
    lines: [
      ["narrator", "River leads you along a pale ribbon of trail where the canyon walls hold the day's heat like a memory.", "river"],
      ["river", "People call deserts empty when they do not know how to read quiet.", "river"],
      ["player", "And you read it fluently?", "river"]
    ],
    choices: [
      { label: "Ask what the quiet is saying tonight.", detail: "Meet them on their terms.", next: "intro_zion_river_three", feelings: { river: 2 }, reaction: [["river", "That the air is cooling, the trail is stable, and you are trying harder than expected.", "river:blushing"], ["player", "The desert said all that?", "river:blushing"], ["river", "I paraphrased.", "river:blushing"]] },
      { label: "Tell them their desert translation is unfairly attractive.", detail: "Dry flirting.", next: "intro_zion_river_three", feelings: { river: 1 }, reaction: [["river", "Flattery is not a navigation tool.", "river:laughing"], ["player", "But noted on the map?", "river:laughing"], ["river", "Annoyingly, yes.", "river:laughing"]] },
      { label: "Say quiet usually means nothing is happening.", detail: "Wrong audience.", next: "intro_zion_river_three", feelings: { river: -2 }, reaction: [["river", "That is a loud-person interpretation.", "river:grumpy"], ["narrator", "Their disappointment is calm enough to echo.", "river:grumpy"]] }
    ]
  },
  intro_zion_river_three: {
    label: "Red Rock",
    background: () => ({ location: "zion", time: "night" }),
    lines: [
      ["narrator", "The route reaches a night-sky overlook. Above the canyon, stars crowd the dark until the silence feels deliberate.", "river"],
      ["river", "Last stop. After this, you go back to the lodge before exhaustion makes you poetic in a legally concerning way.", "river"],
      ["player", "Too late, probably.", "river"]
    ],
    choices: [
      { label: "Thank them for showing you the desert instead of explaining it.", detail: "Respect the restraint.", next: "intro_zion_wrap", feelings: { river: 2 }, reaction: [["river", "Good. Explanations are where people start lying to sound complete.", "river"], ["narrator", "They look up at the stars, and for once their stillness feels openly gentle.", "river:blushing"]] },
      { label: "Promise not to tell anyone they picked the romantic overlook.", detail: "A dangerous observation.", next: "intro_zion_wrap", feelings: { river: 1 }, reaction: [["river", "Wise. I control the return route.", "river:blushing"], ["player", "Threat or flirtation?", "river:blushing"], ["river", "Efficient ambiguity.", "river:blushing"]] },
      { label: "Say you are mostly thinking about sleep.", detail: "Honest but clumsy.", next: "intro_zion_wrap", feelings: { river: -1 }, reaction: [["river", "Finally, an honest survival instinct.", "river"], ["narrator", "They sound amused, but the moment closes a little sooner than it might have.", "river"]] }
    ]
  },
  intro_zion_wrap: {
    label: "Red Rock",
    background: () => ({ location: "zion", time: "night" }),
    lines: [
      ["narrator", "River walks you back through the dark with the quiet confidence of someone who knows every stone by reputation.", "river"],
      ["river", "That is enough canyon for a first night. Any more and you will start assigning symbolism to boulders.", "river"],
      ["player", "This one does look judgmental.", "river"],
      ["river", "It is. Come on.", "river:laughing"]
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
        low: ["jack", "Probably for the best tonight. Olympic rewards patience, and I am fresh out of spare patience.", "jack:grumpy"],
        neutral: ["jack", "You will. Olympic is not going anywhere, and neither is the rain. Get some sleep first.", "jack"],
        high: ["jack", "You will see it later. I prefer showing off my park when I can pretend I am not showing off for you.", "jack:blushing"]
      }[mood];
      return [
        ["narrator", "The lodge lobby is quiet when you return, fireplace low, windows dark, the whole building smelling like cedar and sleep."],
        ["narrator", "Jack is by the fireplace, stacking route cards into a tidy pile that immediately leans sideways.", "jack"],
        ["player", "I am a little sad I did not get to see your park tonight.", "jack"],
        jackReply,
        ["jack", "Go sleep, {playerName}. Tomorrow gives you three chances to make something happen.", "jack"],
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
    onEnter: () => { state.timeOfDay = "daytime"; state.pendingDestination = null; state.pendingEncounter = null; state.visitTime = null; state.visitBeat = 0; state.visitLastChoice = null; },
    lines: () => [
      ["narrator", "Morning fills the lodge lobby with clean light and the low murmur of maps being unfolded."],
      ["player", state.day === 1 ? "A new day. Three chances to make something happen." : `Day ${state.day}. Same impossible kiosk. New chances.`]
    ],
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
      { label: "Return to the lodge lobby early.", detail: "Head back and sleep.", action: returnToLodgeEarly }
    ]
  },
  checkin_travel_event: {
    label: () => state.flags.returningEarly ? `${TIME_LABELS[state.timeOfDay]} Lodge Lobby` : `${TIME_LABELS[state.timeOfDay]} Check-In`,
    background: () => ({ location: state.flags.returningEarly ? "lodge" : "checkIn", time: state.timeOfDay }),
    character: () => state.pendingEncounter?.character || null,
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
  devPanel: document.getElementById("devPanel"),
  devScores: document.getElementById("devScores"),
  devChoicePreview: document.getElementById("devChoicePreview"),
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
  justPlayedDoorSfx: false,
  enabled: true
};

bindEvents();
updateBeginButton();
validateSceneEstablishingRules();

function bindEvents() {
  document.getElementById("newGameBtn").addEventListener("click", () => {
    document.getElementById("playerName").value = "";
    updateBeginButton();
    showScreen("setupScreen");
  });
  document.getElementById("continueBtn").addEventListener("click", loadGame);
  document.getElementById("beginBtn").addEventListener("click", startGame);
  document.getElementById("playerName").addEventListener("input", event => {
    updateBeginButton();
    if (event.inputType && !["insertReplacementText", "historyUndo", "historyRedo"].includes(event.inputType)) playSfx("type");
  });
  document.getElementById("backStartBtn").addEventListener("click", () => showScreen("startScreen"));
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
  return /(_two|_three|_wrap|_wrapup|_reaction|_prompt)$/.test(sceneId) || sceneId === "choice_reaction";
}

function startGame() {
  state = clone(defaultState);
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
  renderScene("intro_checkin_arrival");
}

function renderScene(sceneId, options = {}) {
  const scene = scenes[sceneId];
  if (!scene) throw new Error("Missing scene: " + sceneId);
  state.sceneId = sceneId;
  state.lineIndex = options.keepLine ? state.lineIndex : 0;
  if (scene.onEnter && !options.keepLine) scene.onEnter();
  const background = resolveValue(scene.background) || { location: "lodge", time: state.timeOfDay };
  updateBackdrop(background);
  updateAudioTheme(background.location, null);
  updateDevPanel();
  renderCurrentLine();
}

function renderCurrentLine() {
  const scene = scenes[state.sceneId];
  const lines = resolveValue(scene.lines) || [];
  const line = lines[state.lineIndex] || ["narrator", ""];
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
  els.choices.innerHTML = "";
  els.choices.classList.remove("has-choices");
  els.choices.style.removeProperty("--choices-bottom");
  els.gameScreen.classList.remove("choices-active");
  if (state.lineIndex >= lines.length - 1) renderChoices(resolveValue(scene.choices) || []);
}

function showNextDialogueLine() {
  const scene = scenes[state.sceneId];
  if (!scene) return;
  const lines = resolveValue(scene.lines) || [];
  if (state.lineIndex >= lines.length - 1) {
    playSfx("advance");
    if (scene.nextAction) {
      scene.nextAction();
    } else if (scene.next) {
      renderScene(scene.next);
    }
    return;
  }
  state.lineIndex += 1;
  playSfx("advance");
  renderCurrentLine();
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
    const button = document.createElement("button");
    button.className = "choice";
    const preview = state.devChoicePreview ? choiceImpactHtml(choice) : "";
    button.innerHTML = `${escapeHtml(choice.label)}${preview}${choice.detail ? `<small>${escapeHtml(choice.detail)}</small>` : ""}`;
    button.addEventListener("click", event => {
      event.stopPropagation();
      applyChoiceEffects(choice);
    });
    els.choices.appendChild(button);
  });
}

function applyChoiceEffects(choice) {
  playSfx("choice");
  if (choice.feelings) addFeelings(choice.feelings);
  if (choice.flags) Object.assign(state.flags, choice.flags);
  if (choice.setRoute) state.selectedRoute = choice.setRoute;
  if (choice.unlockCG) unlockCG(choice.unlockCG);
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
  renderScene("day_wake");
  showDayTransition(state.day);
}

function loveInterestChoices() {
  return LOVE_INTEREST_KEYS.map(key => ({
    label: `Visit ${characters[key].shortName} at ${characters[key].park}.`,
    detail: `${TIME_LABELS[state.timeOfDay]} route`,
    action: () => startTravel(key)
  }));
}

function startTravel(destination) {
  state.pendingDestination = destination;
  state.selectedRoute = destination;
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
  state.visitLastChoice = null;
  renderScene("main_visit_arrival");
}

function completeVisit() {
  const completedTime = state.visitTime || state.timeOfDay;
  state.visitTime = null;
  state.visitBeat = 0;
  state.visitLastChoice = null;
  if (completedTime === "daytime") {
    renderScene("transition_to_sunset_checkin");
  } else if (completedTime === "sunset") {
    renderScene("transition_to_night_checkin");
  } else {
    renderScene("night_lodge_return");
  }
}

function returnToLodgeEarly() {
  if (state.timeOfDay !== "night" && Math.random() < 0.5) {
    const candidates = LOVE_INTEREST_KEYS;
    state.pendingDestination = null;
    state.flags.returningEarly = true;
    state.pendingEncounter = Math.random() < 0.8
      ? { type: "surprise", character: randomItem(candidates) }
      : { type: "flavor" };
    renderScene("checkin_travel_event");
    return;
  }
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
  if (event.type === "surprise") {
    const character = event.character;
    const mood = relationshipState(character);
    return [
      ["narrator", returningEarly
        ? "The walk back should be simple. Naturally, the lodge lobby chooses this moment to become socially complicated."
        : "The route should be simple. Naturally, the check-in kiosk chooses this moment to become socially complicated."],
      ["narrator", `${characters[character].shortName} is already near the desk when you arrive, turning a quick stop into a small collision of plans.`, character],
      ...parkFlavor[character].surprise[mood].map((text, index) => [index === 0 ? character : "narrator", text, characterExpression(character, mood)])
    ];
  }
  if (returningEarly) {
    return [
      ["narrator", `The lodge lobby gathers the ${state.timeOfDay === "sunset" ? "last light" : "night quiet"} in warm panes of glass and polished wood.`],
      ["player", "Okay. Good. A normal room with normal doors and no route marker trying to make plans for me."]
    ];
  }
  return checkInFlavor[state.timeOfDay] || checkInFlavor.daytime;
}

function showDayTransition(day) {
  if (!els.dayTransition) return;
  const title = els.dayTransition.querySelector(".day-transition-title");
  const kicker = els.dayTransition.querySelector(".day-transition-kicker");
  const caption = els.dayTransition.querySelector(".day-transition-caption");
  if (title) title.textContent = `Day ${day}`;
  if (kicker) kicker.textContent = "Morning at Viral Vista Lodge";
  if (caption) caption.textContent = "The lobby is warming up, the maps are waiting, and the kiosk has already decided to be a problem.";
  els.dayTransition.classList.remove("active", "leaving");
  els.dayTransition.setAttribute("aria-hidden", "false");
  void els.dayTransition.offsetWidth;
  els.dayTransition.classList.add("active");
  if (els.dayTransitionButton) els.dayTransitionButton.focus({ preventScroll: true });
}

function startDayFromTransition() {
  if (!els.dayTransition || !els.dayTransition.classList.contains("active") || els.dayTransition.classList.contains("leaving")) return;
  els.dayTransition.classList.add("leaving");
  window.clearTimeout(startDayFromTransition.timer);
  startDayFromTransition.timer = window.setTimeout(() => {
    els.dayTransition.classList.remove("active", "leaving");
    els.dayTransition.setAttribute("aria-hidden", "true");
  }, 680);
}

function buildArrivalLines(character, time) {
  return arrivalFlavor[character]?.[time] || [
    ["narrator", "The route opens into a different kind of quiet."],
    ["player", "New place. New chance not to be weird about it."],
    ["narrator", `${characters[character].shortName} appears at the edge of the trail.`, character]
  ];
}

function currentVisitBeat(character) {
  const beats = visitBeats[character] || [];
  return beats[Math.min(state.visitBeat || 0, beats.length - 1)];
}

function buildVisitPromptLines(character) {
  const beat = currentVisitBeat(character);
  const mood = relationshipState(character);
  const prompt = beat.prompt[mood] || beat.prompt.neutral;
  return [prompt];
}

function buildVisitChoices(character) {
  const beat = currentVisitBeat(character);
  return beat.choices.map(choice => ({
    label: choice.label,
    detail: choice.detail || reactionDetail(choice.tone),
    feelings: choice.feelings,
    action: () => {
      state.visitLastChoice = choice.tone;
      renderScene("main_visit_reaction");
    }
  }));
}

function buildVisitReactionLines(character) {
  const beat = currentVisitBeat(character);
  const tone = state.visitLastChoice || "warm";
  return beat.reactions[tone] || beat.reactions.warm;
}

function advanceVisitBeat() {
  state.visitBeat = (state.visitBeat || 0) + 1;
  state.visitLastChoice = null;
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

function reactionDetail(tone) {
  if (tone === "flirt") return "Flirty or vulnerable.";
  if (tone === "bad") return "This may land badly.";
  return "Respectful and attentive.";
}

function characterExpression(character, mood) {
  if (mood === "low") return `${character}:grumpy`;
  if (mood === "high") return `${character}:blushing`;
  return character;
}

function relationshipState(character) {
  const score = state.feelings[character] ?? 5;
  if (score <= 3) return "low";
  if (score >= 7) return "high";
  return "neutral";
}

function addFeelings(changes) {
  Object.entries(changes).forEach(([key, value]) => {
    if (!LOVE_INTEREST_KEYS.includes(key)) return;
    state.feelings[key] = clamp((state.feelings[key] ?? 5) + value, 0, 10);
  });
}

function sanitizeFeelings(savedFeelings) {
  const clean = clone(defaultState.feelings);
  Object.keys(clean).forEach(key => {
    if (savedFeelings && savedFeelings[key] !== undefined) {
      clean[key] = clamp(Number(savedFeelings[key]) || 5, 0, 10);
    }
  });
  return clean;
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
  els.devScores.innerHTML = LOVE_INTEREST_KEYS.map(key => {
    const score = state.feelings[key] ?? 5;
    return `<div class="dev-score"><span>${escapeHtml(characters[key].shortName)}</span><strong>${score}/10</strong></div>`;
  }).join("");
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
  if (els.backdrop.dataset.key === key) return;
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
    return;
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
}

function updateSprite(characterCue) {
  const { key: characterKey, expression } = parseCharacterCue(characterCue);
  const character = characters[characterKey];
  const sprite = character && resolveSprite(character, expression);
  if (!character || !sprite) {
    spriteLoadToken += 1;
    els.sprite.classList.add("hidden");
    els.sprite.removeAttribute("src");
    els.sprite.alt = "";
    els.sprite.dataset.spriteUrl = "";
    els.placeholderSprite.classList.remove("visible");
    return;
  }
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
  const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem("parkAfterDarkSaveV2") || localStorage.getItem("parkAfterDarkSaveV1");
  if (!raw) {
    toast("No save found yet.");
    return;
  }
  try {
    const saved = JSON.parse(raw);
    state = Object.assign(clone(defaultState), saved);
    state.playerName = String(state.playerName || "").trim() || defaultState.playerName;
    state.feelings = sanitizeFeelings(saved.feelings);
    state.flags = state.flags || {};
    state.unlockedCG = state.unlockedCG || [];
    state.audioEnabled = state.audioEnabled !== false;
    state.devChoicePreview = true;
    state.timeOfDay = TIMES.includes(state.timeOfDay) ? state.timeOfDay : "daytime";
    state.day = Math.max(1, Number(state.day) || 1);
    audioEngine.enabled = state.audioEnabled;
    ensureAudio();
    showScreen("gameScreen");
    renderScene(normalizeSceneId(state.sceneId || "intro_checkin_arrival"), { keepLine: true });
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
  audioEngine.enabled = state.audioEnabled;
  els.galleryOverlay.classList.remove("active");
  showScreen("startScreen");
  toast("Progress reset.");
}

function showScreen(id) {
  [els.startScreen, els.setupScreen, els.gameScreen].forEach(screen => screen.classList.remove("active"));
  els[id].classList.add("active");
  if (!audioEngine.enabled) return;
  ensureAudio();
  if (id === "setupScreen" || id === "startScreen") {
    audioEngine.locationKey = "checkIn";
    audioEngine.characterKey = null;
    restartMusicLoop();
  }
}

function normalizeSceneId(sceneId) {
  return scenes[sceneId] ? sceneId : "intro_checkin_arrival";
}

function toggleAudio() {
  audioEngine.enabled = !audioEngine.enabled;
  state.audioEnabled = audioEngine.enabled;
  ensureAudio();
  updateAudioButton();
  if (audioEngine.enabled) {
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
  restartMusicLoop();
}

function updateAudioTheme(locationKey, characterCue) {
  audioEngine.locationKey = locationKey || "lodge";
  audioEngine.characterKey = parseCharacterCue(characterCue).key || null;
  if (!audioEngine.enabled) return;
  ensureAudio();
  restartMusicLoop();
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

function playSfx(type) {
  if (!audioEngine.enabled) return;
  const config = sfxTracks[type];
  if (!config) return;
  const effect = new Audio(config.src);
  effect.volume = config.volume;
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
    fadePlayer(incoming, theme.volume, outgoing ? 1800 : 900);
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
