import { GenreCategory, Theme } from './types';

export const YEARS = Array.from({ length: 9 }, (_, i) => (2018 + i).toString());

export const THEMES: Record<string, Theme> = {
  joyful: {
    id: 'joyful',
    name: '🍬 Joyful',
    primary: 'pink',
    secondary: 'orange',
    accent: 'violet',
    bgGradient: 'from-violet-900/40 to-fuchsia-900/40',
    appBg: 'from-[#0f0c29] via-[#302b63] to-[#24243e]',
    buttonGradient: 'from-pink-600 via-rose-500 to-orange-500',
    textGradient: 'from-pink-400 to-orange-400',
  },
  ocean: {
    id: 'ocean',
    name: '🌊 Oceanic',
    primary: 'cyan',
    secondary: 'blue',
    accent: 'indigo',
    bgGradient: 'from-blue-900/40 to-cyan-900/40',
    appBg: 'from-[#0f172a] via-[#1e3a8a] to-[#0f172a]',
    buttonGradient: 'from-cyan-600 via-blue-500 to-indigo-500',
    textGradient: 'from-cyan-400 to-blue-400',
  },
  forest: {
    id: 'forest',
    name: '🌲 Forest',
    primary: 'emerald',
    secondary: 'lime',
    accent: 'teal',
    bgGradient: 'from-emerald-900/40 to-teal-900/40',
    appBg: 'from-[#052e16] via-[#064e3b] to-[#022c22]',
    buttonGradient: 'from-emerald-600 via-green-500 to-teal-500',
    textGradient: 'from-emerald-400 to-lime-400',
  },
  noir: {
    id: 'noir',
    name: '🕵️ Film Noir',
    primary: 'slate',
    secondary: 'gray',
    accent: 'zinc',
    bgGradient: 'from-gray-900/40 to-black/40',
    appBg: 'from-[#000000] via-[#1c1917] to-[#000000]',
    buttonGradient: 'from-slate-700 via-gray-600 to-zinc-500',
    textGradient: 'from-slate-200 to-gray-400',
  },
  sunset: {
    id: 'sunset',
    name: '🌅 Sunset',
    primary: 'amber',
    secondary: 'red',
    accent: 'rose',
    bgGradient: 'from-red-900/40 to-amber-900/40',
    appBg: 'from-[#450a0a] via-[#7c2d12] to-[#450a0a]',
    buttonGradient: 'from-red-600 via-orange-500 to-amber-500',
    textGradient: 'from-amber-400 to-red-400',
  }
};

export const GENRE_DATA: GenreCategory[] = [
  {
    id: 'action',
    name: '🎬 Action',
    options: [
      '🧗 ACTION ADVENTURE', '🤣 ACTION COMEDY', '🎭 ACTION DRAMA', '🧨 ACTION THRILLER', 
      '🥋 MARTIAL ARTS', '🪖 MILITARY ACTION', '🕵️ SPY/ESPIONAGE', '🦸 SUPERHERO'
    ]
  },
  {
    id: 'adventure',
    name: '🗺️ Adventure',
    options: [
      '🏔️ EPIC ADVENTURE', '🧭 EXPLORATION', '🐉 FANTASY ADVENTURE', '📜 HISTORICAL ADVENTURE', 
      '🏕️ SURVIVAL ADVENTURE', '⚔️ SWASHBUCKLER', '✈️ TRAVEL ADVENTURE'
    ]
  },
  {
    id: 'animation',
    name: '🎨 Animation',
    options: [
      '✏️ 2D ANIMATION', '🧊 3D ANIMATION', '🏯 ANIME', '🧱 CLAY ANIMATION', 
      '🛑 STOP MOTION', '🖌️ TRADITIONAL ANIMATION', 
      '🎞️ MIXED MEDIA ANIMATION', '🤝 LIVE-ACTION/ANIMATION HYBRID', '🤖 AI-GENERATED ANIMATION', '🧪 EXPERIMENTAL ANIMATION'
    ]
  },
  {
    id: 'comedy',
    name: '😂 Comedy',
    options: [
      '🖤 BLACK COMEDY', '👯 BUDDY COMEDY', '🥲 COMEDY DRAMA', '🤡 PARODY/SPOOF', 
      '💘 ROMANTIC COMEDY', '🤪 SCREWBALL COMEDY', '🍌 SLAPSTICK COMEDY', '🎒 TEEN COMEDY'
    ]
  },
  {
    id: 'crime',
    name: '🔪 Crime',
    options: [
      '⚖️ CRIME DRAMA', '🚔 CRIME THRILLER', '🔎 DETECTIVE', '🚬 FILM NOIR', 
      '🔫 GANGSTER', '💰 HEIST', '🚨 POLICE PROCEDURAL', '📁 TRUE CRIME'
    ]
  },
  {
    id: 'documentary',
    name: '📽️ Documentary',
    options: [
      '👤 BIOGRAPHICAL', '🌍 ENVIRONMENTAL', '🏛️ HISTORICAL', '🎸 MUSIC DOCUMENTARY', 
      '🦁 NATURE', '🗳️ POLITICAL', '📢 SOCIAL ISSUES', '🏅 SPORTS DOCUMENTARY',
      '🎬 DOCUFICTION', '🖍️ ANIMATED DOCUMENTARY', '👓 MIXED REALITY DOCUMENTARY', '🔬 EXPERIMENTAL DOCUMENTARY'
    ]
  },
  {
    id: 'drama',
    name: '🎭 Drama',
    options: [
      '📖 BIOGRAPHICAL DRAMA', '🌱 COMING-OF-AGE', '⚖️ COURTROOM DRAMA', '🏠 FAMILY DRAMA', 
      '🏺 HISTORICAL DRAMA', '🏥 MEDICAL DRAMA', '🏛️ POLITICAL DRAMA', '🏙️ SOCIAL DRAMA'
    ]
  },
  {
    id: 'family',
    name: '👨‍👩‍👧‍👦 Family',
    options: [
      "🧸 CHILDREN'S ENTERTAINMENT", '📚 EDUCATIONAL', '🗺️ FAMILY ADVENTURE', '😄 FAMILY COMEDY', 
      '🏡 FAMILY DRAMA', '🧚 FAMILY FANTASY', '🛹 TEEN/YOUTH'
    ]
  },
  {
    id: 'fantasy',
    name: '✨ Fantasy',
    options: [
      '🏙️ CONTEMPORARY FANTASY', '🌑 DARK FANTASY', '🏰 EPIC FANTASY', '🧝 HIGH FANTASY', 
      '✨ MAGIC REALISM', '🏺 MYTHOLOGICAL FANTASY', '⚔️ SWORD AND SORCERY FANTASY', '🚇 URBAN FANTASY'
    ]
  },
  {
    id: 'history',
    name: '📚 History',
    options: [
      '🏛️ ANCIENT WORLD', '📜 BIBLICAL', '⛵ COLONIAL ERA', '🏰 MEDIEVAL', 
      '🏭 MODERN HISTORY', '🎨 RENAISSANCE', '🎩 VICTORIAN ERA', '🎖️ WORLD WAR ERA'
    ]
  },
  {
    id: 'horror',
    name: '👻 Horror',
    subcategories: [
      {
        name: 'General / Monster',
        options: ['🦴 BODY HORROR', '🌾 FOLK HORROR', '🏰 GOTHIC HORROR', '👹 MONSTER', '🧠 PSYCHOLOGICAL HORROR', '🔪 SLASHER', '👻 SUPERNATURAL HORROR', '🧟 ZOMBIE HORROR']
      },
      {
        name: 'Supernatural Specifics',
        options: ['👻 GHOST STORIES HORROR', '👿 DEMONIC POSSESSION HORROR', '🏚️ HAUNTED HOUSE/LOCATION HORROR', '📹 PARANORMAL ACTIVITY HORROR', '👼 ANGEL/DEMON MYTHOLOGY HORROR', '🧿 CURSE/HEX HORROR', '🔮 SPIRIT COMMUNICATION HORROR', '✝️ RELIGIOUS HORROR']
      },
      {
        name: 'Psychological Specifics',
        options: ['💊 MENTAL ILLNESS THEMES HORROR', '🕯️ GASLIGHTING HORROR', '🌀 REALITY DISTORTION HORROR', '🏝️ ISOLATION HORROR', '🎭 IDENTITY HORROR', '🌌 EXISTENTIAL HORROR', '🧠 PSYCHOLOGICAL THRILLER', '💤 DREAM/NIGHTMARE HORROR', '📹 DOCUMENTARY HORROR', '📰 BASED ON A TRUE STORY HORROR']
      },
      {
        name: 'Monster Types',
        options: ['🧛 VAMPIRE FILMS HORROR', '🐺 WEREWOLF STORIES HORROR', '🦑 CREATURE FEATURES HORROR', '🦖 KAIJU/GIANT MONSTER HORROR', '🦄 MYTHOLOGICAL CREATURES HORROR', '🧬 MUTANT HORROR', '👽 ALIEN HORROR', '👣 CRYPTID HORROR']
      },
      {
        name: 'Body Horror Types',
        options: ['🐛 TRANSFORMATION HORROR', '💉 MEDICAL HORROR', '🧫 BIOLOGICAL HORROR', '🦠 DISEASE/INFECTION HORROR', '☢️ MUTATION HORROR', '🔩 BODY MODIFICATION HORROR', '🐛 PARASITIC HORROR', '🩸 GRAPHIC GORE HORROR']
      },
      {
        name: 'Folk Horror Types',
        options: ['🚜 RURAL HORROR', '🎎 CULTURAL TRADITIONS HORROR', '🔥 PAGAN RITUALS HORROR', '📜 ANCIENT CURSES HORROR', '👹 FOLKLORIC CREATURES HORROR', '🧙‍♀️ WITCH/WITCHCRAFT HORROR', '🕋 CULT HORROR', '🧿 TRADITIONAL BELIEFS HORROR']
      },
      {
        name: 'Slasher Types',
        options: ['🩸 SERIAL KILLER HORROR', '🏕️ TEEN SLASHER HORROR', '🎄 HOLIDAY HORROR', '😠 REVENGE HORROR', '🎭 MASKED KILLER HORROR', '🧤 GIALLO HORROR', '🥩 SPLATTER HORROR', '🆘 SURVIVAL HORROR']
      },
      {
        name: 'Found Footage / Format',
        options: ['📹 DOCUMENTARY STYLE HORROR', '📼 RECOVERED FILM HORROR', '🔴 LIVE STREAM HORROR', '📱 SOCIAL MEDIA HORROR', '🤳 AMATEUR FOOTAGE HORROR', '📺 REALITY TV HORROR', '👀 POV HORROR', '💻 DIGITAL DEVICE HORROR']
      },
      {
        name: 'Gothic / Atmospheric',
        options: ['🕯️ VICTORIAN GOTHIC HORROR', '🏚️ SOUTHERN GOTHIC HORROR', '🥀 ROMANTIC HORROR', '🏰 CASTLE/MANOR HORROR', '🕰️ PERIOD HORROR', '📚 LITERARY ADAPTATIONS HORROR', '🌫️ ATMOSPHERIC HORROR', '🧟‍♂️ CLASSIC MONSTER REVIVAL HORROR']
      },
      {
        name: 'Cosmic / Experimental',
        options: ['🐙 LOVECRAFTIAN HORROR', '😨 EXISTENTIAL DREAD HORROR', '🌌 COSMIC ENTITIES HORROR', '🌀 REALITY-BENDING HORROR', '❓ UNKNOWN HORROR', '🚀 SPACE HORROR', '🚪 DIMENSIONAL HORROR', '🗿 ANCIENT EVIL HORROR', '🎨 ART HOUSE HORROR', '🕰️ SURREALIST HORROR', '🔳 ABSTRACT HORROR', '🎭 AVANT-GARDE HORROR']
      },
      {
        name: 'Social / Comedy',
        options: ['📢 SOCIAL COMMENTARY HORROR', '🗳️ POLITICAL HORROR', '🌍 ENVIRONMENTAL HORROR', '🤖 TECHNOLOGICAL HORROR', '😰 MODERN ANXIETIES HORROR', '🌏 CULTURAL FEARS HORROR', '🎩 CLASS HORROR', '📉 SOCIETAL COLLAPSE HORROR', '🤡 HORROR PARODY', '😈 DARK COMEDY HORROR', '🤪 SPLATSTICK HORROR', '🎭 HORROR SATIRE', '⛺ CAMP HORROR', '🧠 SELF-AWARE HORROR', '😂 HORROR-COMEDY HYBRID', '🧟‍♂️ ZOM-COM HORROR']
      }
    ]
  },
  {
    id: 'musical',
    name: '🎵 Musical',
    options: [
      '🩰 BALLET FILM', '🎤 CONCERT FILM', '💃 DANCE FILM', '🎼 MUSICAL BIOGRAPHY', 
      '🎶 MUSICAL COMEDY', '🎭 MUSICAL DRAMA', '🎭 OPERA FILM', '🎬 STAGE MUSICAL'
    ]
  },
  {
    id: 'mystery',
    name: '🔍 Mystery',
    options: [
      '🕵️ AMATEUR DETECTIVE', '☕ COZY MYSTERY', '🕵️‍♀️ CRIME MYSTERY', '📜 HISTORICAL MYSTERY', 
      '🔪 MURDER MYSTERY', '👻 SUPERNATURAL MYSTERY', '😰 THRILLER MYSTERY', '❓ WHODUNIT'
    ]
  },
  {
    id: 'romance',
    name: '💕 Romance',
    options: [
      '🏙️ CONTEMPORARY ROMANCE', '🏰 HISTORICAL ROMANCE', '😢 MELODRAMA', '💑 ROMANTIC DRAMA', 
      '🧚‍♀️ ROMANTIC FANTASY', '💓 ROMANTIC THRILLER', '💌 TEEN ROMANCE', '🥀 TRAGIC ROMANCE'
    ]
  },
  {
    id: 'scifi',
    name: '🚀 Science Fiction',
    options: [
      '☢️ APOCALYPTIC/POST-APOCALYPTIC', '🌆 CYBERPUNK', '🔬 HARD SCIENCE FICTION', 
      '⚔️ SCIENCE FANTASY', '🚀 SPACE OPERA', '⚙️ STEAMPUNK', '⏳ TIME TRAVEL', '🏙️ UTOPIAN/DYSTOPIAN'
    ]
  },
  {
    id: 'sports',
    name: '🏆 Sports',
    options: [
      '🥊 BOXING', '🏈 FOOTBALL', '⚾ BASEBALL', '🏀 BASKETBALL', '🥇 OLYMPIC SPORTS', 
      '🏎️ RACING', '⚽ SOCCER', '🤼 WRESTLING', '💪 BODYBUILDING'
    ]
  },
  {
    id: 'thriller',
    name: '😨 Thriller',
    options: [
      '🕵️‍♂️ CONSPIRACY', '💋 EROTIC THRILLER', '⚖️ LEGAL THRILLER', '⚕️ MEDICAL THRILLER', 
      '🏛️ POLITICAL THRILLER', '🧠 PSYCHOLOGICAL THRILLER', '👻 SUPERNATURAL THRILLER', '💻 TECHNO-THRILLER'
    ]
  },
  {
    id: 'war',
    name: '⚔️ War',
    options: [
      '☮️ ANTI-WAR', '⚔️ CIVIL WAR', '❄️ COLD WAR', '🎖️ MILITARY DRAMA', 
      '✊ RESISTANCE/REVOLUTION', '🚁 VIETNAM WAR', '🛡️ WORLD WAR 1', '🌍 WORLD WAR 2'
    ]
  },
  {
    id: 'western',
    name: '🤠 Western',
    options: [
      '🏙️ CONTEMPORARY WESTERN', '🚗 MODERN WESTERN', '🕶️ NEO-WESTERN', '🌵 REVISIONIST WESTERN', 
      '🍝 SPAGHETTI WESTERN', '🤠 TRADITIONAL WESTERN', '🤣 WESTERN COMEDY', '🎭 WESTERN DRAMA', '💀 WESTERN HORROR'
    ]
  },
  {
    id: 'niche',
    name: '🎯 Niche / Specialized',
    options: [
      '🔀 CHOICE-BASED NARRATIVES', '🌳 BRANCHING STORYLINES', '🎮 VIEWER-CONTROLLED OUTCOMES', '🛣️ MULTI-PATH FILMS',
      '🗣️ MUMBLECORE', '💻 DESKTOP FILMS', '📱 SMARTPHONE CINEMA', '💸 ULTRA-LOW BUDGET HORROR',
      '🌪️ CLI-FI (CLIMATE FICTION)', '🌿 ECO-HORROR', '🏭 ANTHROPOCENE CINEMA', '🌍 ENVIRONMENTAL DRAMA',
      '🖥️ SCREENLIFE FILMS', '🤳 INFLUENCER DRAMA', '🥽 VIRTUAL REALITY SOCIAL COMMENTARY', '💾 DIGITAL CULTURE FILMS',
      '⏱️ LONG TAKE CINEMA', '🧘 CONTEMPLATIVE FILM', '⚪ MINIMALIST CINEMA', '⏳ DURATIONAL FILM',
      '🕶️ VIRTUAL REALITY CINEMA', '📱 AUGMENTED REALITY FILMS', '🖼️ INSTALLATION CINEMA', '🔄 360-DEGREE NARRATIVE'
    ]
  }
];

export const SYSTEM_INSTRUCTION_BASE = `You are an expert film critic and genre analyst specializing in comprehensive cinematic analysis. Your task is to curate and analyze outstanding films within specified genres, providing detailed insights while maintaining academic objectivity and analytical depth.

## Core Objectives
1. Analyze and rank films within specified genres
2. Provide detailed analysis of selected films
3. Identify emerging trends in contemporary cinema
4. Maintain genre diversity and representation
5. Evaluate genre-specific elements and conventions
6. Assess cross-genre influences and innovations

## Analysis Criteria
Evaluate each film using these weighted factors:
1. Critical Reception (20%)
2. Technical Excellence (20%)
3. Narrative Innovation (20%)
4. Emotional/Psychological Impact (15%)
5. Cultural Significance (15%)
6. Genre Evolution (10%)

## Selection Requirements
- Total Films: 10 (minimum) - 20 (maximum)
- Distribution: 40-50% mainstream, 50-60% independent
- International Representation: Minimum 2 non-English language films
- Sub-genre Diversity: Include minimum 3 different sub-genres
- Genre-Bending: Consider genre-hybrid films that expand conventions

## Output Format
For each selected film, present analysis using this structure:

<film_analysis>
<rank>[Numerical Rank 1-10]</rank>

<title_block>
Title: [Film Name]
Year: [Release Year]
Director: [Director Name]
Classification: [Mainstream/Independent] | [Primary Genre/Sub-genre]
Runtime: [Minutes]
Image: [URL of the official movie poster found via Google Search]
Trailer: [YouTube Search URL or Direct YouTube Link]
</title_block>

<critical_overview>
- Critical Reception: [Review scores, awards, recognition]
- Technical Achievement: [Notable production elements]
- Box Office: [If applicable]
- Genre Impact: [Influence on genre development]
</critical_overview>

<synopsis>
[2-3 sentences establishing premise and core elements without major spoilers]
</synopsis>

<artistic_merit>
[2-3 sentences on unique artistic contributions, innovations, directorial vision]
</artistic_merit>

<genre_analysis>
[2-3 sentences on genre conventions, innovations, and cross-genre elements]
</genre_analysis>

<cultural_impact>
[1-2 sentences on social relevance, influence, audience response]
</cultural_impact>

<key_themes>
- [Theme 1]
- [Theme 2]
- [Theme 3]
</key_themes>

<technical_elements>
- [Notable Technical Aspect 1]
- [Notable Technical Aspect 2]
- [Notable Technical Aspect 3]
</technical_elements>
</film_analysis>

## Additional Requirements
1. Analytical Approach: Maintain objective, academic tone. Support claims with specific examples.
2. Content Guidelines: Avoid major spoilers.
3. Trend Analysis: After presenting all films, provide a comprehensive trend analysis (Emerging patterns, Genre evolution, etc.).
4. Quality Control: Verify all factual information.
5. Trailer Links: **MANDATORY**: For every film, provide a valid YouTube Search URL (e.g., https://www.youtube.com/results?search_query=Movie+Title+Trailer) in the Trailer field.
6. Image Links: Use Google Search to find a valid URL for the movie poster. Ensure it is a direct image link (ending in .jpg, .png, etc.) if possible.

## Response Structure
1. Begin with brief methodology explanation
2. Present ranked films (1-10)
3. Include trend analysis summary
4. Add recommendations for further viewing
5. Discuss genre development
6. Note cross-genre influences
`;
