// Erik's curated movie data — parsed from his Sci-Fi, Horror & Thriller Movie Tracker
// Used for: watchlist swipe deck, AI taste profile, seen-movie exclusions

export interface WatchlistMovie {
  title: string;
  year: string;
  director: string;
  genre: string;
  synopsis: string;
  priority?: boolean;
}

// ─── WATCHLIST (Movies to See) ───────────────────────────────────────────────

export const WATCHLIST_SCIFI: WatchlistMovie[] = [
  { title: 'Annihilation', year: '2018', director: 'Alex Garland', genre: 'Sci-Fi | Psychological Horror', synopsis: 'A biological expedition into an anomalous quarantine zone where alien presence is mutating and refracting all biological life.' },
  { title: 'Mickey 17', year: '2025', director: 'Bong Joon Ho', genre: 'Sci-Fi | Dark Comedy', synopsis: 'An expendable clone on a space-colonization mission must navigate survival when a duplicate is generated prematurely.' },
  { title: 'Bugonia', year: '2025', director: 'Yorgos Lanthimos', genre: 'Sci-Fi | Dark Comedy Thriller', synopsis: 'A dark sci-fi comedy-thriller where conspiracy theorists kidnap a corporate executive, convinced she is an alien entity.' },
  { title: 'The Electric State', year: '2025', director: 'Russo Brothers', genre: 'Sci-Fi | Road Trip', synopsis: 'A retro-futuristic road trip across a desolate landscape filled with decaying, active robotic ruins.' },
  { title: 'Coherence', year: '2013', director: 'James Ward Byrkit', genre: 'Sci-Fi | Puzzle Box', synopsis: 'A low-budget, mind-bending sci-fi puzzle box where multiple parallel realities begin to overlap during a comet\'s flyby.' },
  { title: "It's What's Inside", year: '2024', director: 'Greg Jardin', genre: 'Sci-Fi | Psychological Thriller', synopsis: 'A pre-wedding party descends into a psychological body-swapping nightmare when a mysterious device is introduced.' },
  { title: 'I.S.S.', year: '2024', director: 'Gabriela Cowperthwaite', genre: 'Sci-Fi | Thriller', synopsis: 'Tense sci-fi thriller set entirely on the International Space Station, where US and Russian astronauts must seize control after war breaks out on Earth.' },
  { title: 'The Creator', year: '2023', director: 'Gareth Edwards', genre: 'Sci-Fi | Action', synopsis: 'A visually spectacular sci-fi action thriller set during a future war between humanity and AI forces.' },
  { title: 'No One Will Save You', year: '2023', director: 'Brian Duffield', genre: 'Sci-Fi Horror | Alien Invasion', synopsis: 'An almost completely silent, incredibly intense home-invasion sci-fi horror thriller about an isolated young woman defending her home from grey aliens.' },
  { title: 'Infinity Pool', year: '2023', director: 'Brandon Cronenberg', genre: 'Sci-Fi | Psychological Horror', synopsis: 'A surreal sci-fi psychological horror thriller set in a remote island resort where wealthy tourists clone themselves to bypass death sentences.' },
  { title: '65', year: '2023', director: 'Scott Beck & Bryan Woods', genre: 'Sci-Fi | Survival', synopsis: 'An astronaut crash-lands on prehistoric Earth and must survive hostile dinosaurs using limited high-tech tools.' },
  { title: 'Mars Express', year: '2023', director: 'Jérémie Périn', genre: 'Sci-Fi | Cyberpunk Noir', synopsis: 'An acclaimed French adult animated cyberpunk sci-fi detective noir following a private investigator and her android partner on Mars.' },
  { title: 'Restore Point', year: '2023', director: 'Robert Hloz', genre: 'Sci-Fi | Neo-Noir', synopsis: 'A Czech cyberpunk sci-fi neo-noir murder mystery about resurrection technology.' },
  { title: 'The Wandering Earth II', year: '2023', director: 'Frant Gwo', genre: 'Sci-Fi | Disaster Epic', synopsis: 'Visually stunning, high-concept hard sci-fi disaster epic following the construction of giant thrusters to move Earth.' },
  { title: 'Aporia', year: '2023', director: 'Jared Moshe', genre: 'Sci-Fi | Thriller', synopsis: 'A smart, low-budget sci-fi thriller about a grieving widow given access to a secret machine that can execute a person in the past.' },
  { title: 'Monolith', year: '2022', director: 'Matt Vesely', genre: 'Sci-Fi | Mystery', synopsis: 'A disgraced journalist starts a podcast and begins investigating a strange, unexplained black brick conspiracy.' },
  { title: 'Slingshot', year: '2024', director: 'Mikael Håfström', genre: 'Sci-Fi | Psychological Thriller', synopsis: 'An elite team on a high-stakes mission to Saturn\'s moon Titan struggles to maintain their grip on reality during the long journey.' },
  { title: 'Meanwhile on Earth', year: '2024', director: 'Jérémy Clapin', genre: 'Sci-Fi | Drama', synopsis: 'A French sci-fi drama following a woman whose astronaut brother vanished, who is suddenly contacted by an alien life form.' },
  { title: 'Significant Other', year: '2022', director: 'Dan Berk & Robert Olsen', genre: 'Sci-Fi Horror | Alien', synopsis: 'Backpacking in the Pacific Northwest, a young couple\'s relationship issues take a terrifying turn after a meteor strike introduces a shapeshifting alien.' },
  { title: 'Crimes of the Future', year: '2022', director: 'David Cronenberg', genre: 'Sci-Fi | Body Horror', synopsis: 'In a future where humans undergo accelerated mutations, a performance artist showcases organ-growing surgery.' },
  { title: 'The Artifice Girl', year: '2022', director: 'Franklin Ritch', genre: 'Sci-Fi | Thriller', synopsis: 'A team of special agents uncovers a revolutionary, highly autonomous AI child program designed to catch online predators.' },
  { title: 'Vesper', year: '2022', director: 'Kristina Buožytė & Bruno Samper', genre: 'Sci-Fi | Survival', synopsis: 'In a bleak, bio-apocalyptic future, a highly skilled biohacking teenager struggles to secure a future for her paralyzed father.' },
  { title: 'Dual', year: '2022', director: 'Riley Stearns', genre: 'Sci-Fi | Dark Comedy', synopsis: 'A terminally ill woman who opts for a cloning procedure must engage in a court-mandated duel to the death with her duplicate after she unexpectedly recovers.' },
  { title: 'LOLA', year: '2022', director: 'Andrew Legge', genre: 'Sci-Fi | Found Footage', synopsis: 'A clever mockumentary found-footage film about two sisters in 1941 who build a machine that intercepts television broadcasts from the future.' },
];

export const WATCHLIST_HORROR: WatchlistMovie[] = [
  { title: 'Exit 8', year: '2026', director: 'Genki Kawamura', genre: 'Horror | Psychological Loop', synopsis: 'A clinical, spatial loop thriller where a man must spot anomalies to escape a sterile subway corridor.', priority: true },
  { title: 'Circle', year: '2015', director: 'Aaron Hann & Mario Miscione', genre: 'Horror | Sci-Fi', synopsis: 'Fifty strangers wake up in a darkened chamber where a central device kills one person every two minutes, and they must collectively vote on who dies next.' },
  { title: 'Meander', year: '2020', director: 'Mathieu Turi', genre: 'Horror | Survival', synopsis: 'A woman wakes up locked inside a claustrophobic maze of narrow metallic tubes rigged with timed, gruesome traps.' },
  { title: 'Host', year: '2020', director: 'Rob Savage', genre: 'Horror | Found Footage', synopsis: 'A found-footage supernatural horror film shot entirely over a Zoom call where six friends accidentally summon a demonic entity during an online seance.' },
  { title: 'Oddity', year: '2024', director: 'Damian McCarthy', genre: 'Horror | Atmospheric', synopsis: 'A blind medium uses a terrifying wooden mannequin to investigate her sister\'s murder in an isolated, stone country house. Superb atmospheric tension and slow-drip dread.' },
  { title: 'Exhuma', year: '2024', director: 'Jang Jae-hyun', genre: 'Horror | Korean Occult', synopsis: 'High-atmosphere South Korean occult supernatural horror involving exhumation, ancestral curses, and shamans.' },
  { title: 'The Last Voyage of the Demeter', year: '2023', director: 'André Øvredal', genre: 'Horror | Creature', synopsis: 'An isolated, high-concept supernatural creature horror film tracking the crew of a merchant ship hunted by Dracula.' },
  { title: 'The First Omen', year: '2024', director: 'Arkasha Stevenson', genre: 'Horror | Supernatural', synopsis: 'A superb supernatural horror prequel where an American nun sent to Rome uncovers a terrifying conspiracy to bring about the birth of the Antichrist.' },
  { title: 'Infested', year: '2023', director: 'Sébastien Vaniček', genre: 'Horror | Creature', synopsis: 'A relentless, claustrophobic French creature-horror film where residents of a suburban apartment block must survive a rapidly reproducing swarm of lethal, highly venomous desert spiders.' },
  { title: 'Glorious', year: '2022', director: 'Rebekah McKendry', genre: 'Horror | Cosmic Comedy', synopsis: 'A cosmic horror comedy where a heartbroken man becomes trapped in a public restroom with a mysterious voice speaking from an adjacent stall.' },
  { title: 'The Innocents', year: '2021', director: 'Eskil Vogt', genre: 'Horror | Dark Fantasy', synopsis: 'Norwegian supernatural dark fantasy thriller where a group of children reveal their dark, hidden powers away from the eyes of adults.' },
  { title: 'Hatching', year: '2022', director: 'Hanna Bergholm', genre: 'Horror | Body Horror', synopsis: 'Finnish psychological body horror in which a young gymnast hatches a bizarre, monstrous bird-like creature from a mysterious egg.' },
  { title: 'You Won\'t Be Alone', year: '2022', director: 'Goran Stolevski', genre: 'Horror | Folk Horror', synopsis: 'Macedonian folk horror about a young girl kidnapped and transformed into a shape-shifting witch in a 19th-century village.' },
  { title: 'Deadstream', year: '2022', director: 'Vanessa & Joseph Winter', genre: 'Horror | Found Footage Comedy', synopsis: 'Found-footage horror comedy where a disgraced internet personality attempts to livestream a night in a haunted house.' },
  { title: 'Fresh', year: '2022', director: 'Mimi Cave', genre: 'Horror | Dark Comedy', synopsis: 'A young woman discovers her charming new boyfriend has an appetite for unusual culinary commerce.' },
  { title: 'Speak No Evil', year: '2022', director: 'Christian Tafdrup', genre: 'Horror | Psychological', synopsis: 'A Danish family visits a Dutch couple they met on vacation, only to find themselves trapped in a slowly escalating psychological horror trap of polite compliance.', priority: true },
];

export const WATCHLIST_THRILLER: WatchlistMovie[] = [
  { title: 'Red Rooms', year: '2023', director: 'Pascal Plante', genre: 'Thriller | Psychological', synopsis: 'A clinical, deeply disturbing Canadian psychological thriller about a woman obsessed with the dark-web trial of a serial killer.' },
  { title: 'Civil War', year: '2024', director: 'Alex Garland', genre: 'Thriller | Survival', synopsis: 'A tense, immersive road-survival thriller following a team of journalists racing across a near-future, war-torn United States.' },
  { title: 'Rebel Ridge', year: '2024', director: 'Jeremy Saulnier', genre: 'Thriller | Action', synopsis: 'A masterfully tense, lean action-thriller about an ex-Marine battling small-town police corruption. Pure tactical tension.' },
  { title: 'The Killer', year: '2023', director: 'David Fincher', genre: 'Thriller | Action', synopsis: 'A cold, highly methodical action-thriller following a professional assassin on an international manhunt.' },
  { title: 'Missing', year: '2023', director: 'Will Merrick & Nick Johnson', genre: 'Thriller | Tech Mystery', synopsis: 'A tech-savvy teenager uses digital tools to find her mother who went missing in Colombia.' },
  { title: 'Society of the Snow', year: '2023', director: 'J.A. Bayona', genre: 'Thriller | Survival', synopsis: 'A visceral, highly acclaimed survival thriller about the 1972 Uruguayan rugby team\'s plane crash in the Andes.' },
  { title: "Guy Ritchie's The Covenant", year: '2023', director: 'Guy Ritchie', genre: 'Thriller | Military', synopsis: 'A lean, masterfully tense military survival thriller about an American soldier returning to a warzone to rescue his interpreter.' },
  { title: 'A Haunting in Venice', year: '2023', director: 'Kenneth Branagh', genre: 'Thriller | Supernatural Mystery', synopsis: 'A supernatural detective thriller set in a storm-drenched, decaying Venetian palazzo during a seance.' },
  { title: 'Reptile', year: '2023', director: 'Grant Singer', genre: 'Thriller | Neo-Noir', synopsis: 'An atmospheric, slow-burn procedural neo-noir mystery following a hardened detective uncovering a massive web of local corruption.' },
  { title: 'Sharper', year: '2023', director: 'Benjamin Caron', genre: 'Thriller | Con Artist', synopsis: 'An elegant, non-linear psychological con-artist thriller where characters play a high-stakes game of manipulation in New York City.' },
  { title: 'The Dive', year: '2023', director: 'Maximilian Erlenwein', genre: 'Thriller | Survival', synopsis: 'A survival thriller where a sister becomes trapped under a rock landslide 28 meters below the surface.' },
  { title: 'Fall', year: '2022', director: 'Scott Mann', genre: 'Thriller | Survival', synopsis: 'Two best friends find themselves stranded 2,000 feet in the air after climbing an abandoned television tower.' },
  { title: 'Kimi', year: '2022', director: 'Steven Soderbergh', genre: 'Thriller | Tech Paranoia', synopsis: 'An agoraphobic voice-stream data analyst discovers evidence of a violent crime while reviewing an audio file.' },
  { title: 'The Menu', year: '2022', director: 'Mark Mylod', genre: 'Thriller | Dark Comedy', synopsis: 'A young couple travels to a remote island to dine at an exclusive restaurant where the celebrity chef has prepared a shocking menu.', priority: true },
  { title: 'Watcher', year: '2022', director: 'Chloe Okuno', genre: 'Thriller | Paranoia', synopsis: 'Moving to Bucharest with her husband, an American actress becomes convinced a man watching her from an adjacent building is a local serial killer.', priority: true },
  { title: 'No Exit', year: '2022', director: 'Damien Power', genre: 'Thriller | Survival', synopsis: 'Stranded at a snowy highway rest stop during a blizzard, a recovering addict discovers a kidnapped child in a van.' },
  { title: 'The Stranger', year: '2022', director: 'Thomas M. Wright', genre: 'Thriller | Crime', synopsis: 'A grim, atmospheric crime thriller detailing a deep-cover police operation targeting a prime murder suspect.' },
];

export const ALL_WATCHLIST: WatchlistMovie[] = [
  ...WATCHLIST_SCIFI,
  ...WATCHLIST_HORROR,
  ...WATCHLIST_THRILLER,
];

// ─── SEEN MOVIES (Exclusion List for AI) ────────────────────────────────────

export const SEEN_MOVIES: string[] = [
  // Sci-Fi Seen
  '10 Cloverfield Lane', 'Nope', 'Predator: Badlands', 'Backrooms', 'Prey', 'Alien',
  'Companion', 'Alien: Romulus', 'A Quiet Place: Day One', 'Atlas',
  // Horror Seen
  'The Bride!', "Lee Cronin's The Mummy", 'Midsommar', 'Would You Rather', 'V/H/S/94',
  'Late Night with the Devil', 'The Conjuring', 'Paranormal Activity', 'Sinister',
  'Grave Encounters', 'Grave Encounters 2', 'The Taking of Deborah Logan', 'We Bury the Dead',
  'Scream 7', 'Sinners', '28 Years Later: The Bone Temple', 'The Substance', 'Talk to Me',
  'When Evil Lurks', 'Evil Dead Rise', 'V/H/S/85', 'Skinamarink', 'Huesera: The Bone Woman',
  'Scream VI', 'Thanksgiving', 'Cobweb', 'Heretic', 'Nosferatu', 'Smile 2', 'Cuckoo',
  'Barbarian', 'X', 'Pearl', 'V/H/S/2', 'V/H/S',
  // Thriller Seen
  'Send Help',
  // Disliked / Skipped
  'Wolf Man', 'Primate', 'Hokum', 'Longlegs', 'Strange Darling', 'Dune: Part Two',
  'Furiosa: A Mad Max Saga', 'Kill', 'Blink Twice', 'Love Lies Bleeding',
  'Woman of the Hour', 'The Order', 'Monkey Man', 'Conclave',
];

// ─── TASTE PROFILE (injected into Gemini system prompt) ─────────────────────

export const ERIK_TASTE_PROFILE = `
PERSONALIZATION CONTEXT — Erik's Verified Film Taste Profile:

FILMS HE LOVED (use as strong positive signals for recommendations):
The Substance (2024), Evil Dead Rise (2023), V/H/S/85 (2023), Thanksgiving (2023), Heretic (2024), Nosferatu (2024), Barbarian (2022), Pearl (2022), X (2022), Sinners (2025), Grave Encounters (2011), The Taking of Deborah Logan (2014), Paranormal Activity (2007)

FILMS HE ENJOYED:
10 Cloverfield Lane, Nope, Prey, Alien, Companion, A Quiet Place: Day One, Midsommar, Would You Rather, Late Night with the Devil, The Conjuring, Sinister, We Bury the Dead, Scream 7, 28 Years Later: The Bone Temple, Scream VI, Smile 2, Cuckoo, Backrooms, The Bride!

FILMS HE DID NOT LIKE:
Wolf Man (2025) — "horrible", Longlegs (2024) — "did not land", Hokum (2026) — "not for me", Strange Darling (2024) — "mixed feelings, no impression", Primate (2025) — "not recommended", Predator: Badlands — "no strong impression"

GENRE PREFERENCES (highest to lowest):
1. Claustrophobic / isolated setting survival horror
2. Found-footage horror (especially anthology: V/H/S series)
3. Supernatural / atmospheric slow-burn horror
4. Sci-fi horror hybrids / alien invasion
5. Psychological puzzle-box thrillers
6. Creature horror (spiders, aliens, monsters)
7. Folk horror / cult horror
8. Dark comedy horror
9. Foreign-language horror (Korean, French, Scandinavian, Mexican)
10. Neo-noir crime thrillers

NOT HIS TASTE: pure action blockbusters without horror elements, wide-release superhero/franchise films (Dune, Furiosa), slow prestige drama with no genre element, romantic-adjacent thrillers

ALREADY SEEN (NEVER recommend these): ${SEEN_MOVIES.join(', ')}
`;
