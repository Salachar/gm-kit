const {
    generateStandardButton,
    randomFromList
} = require('../helpers');

const random_store_names = {
    title: 'Stores (Random)',
    type: "stores_random",

    init: function (container) {
        generateStandardButton(this, container);
    },

    generate: function () {
        return randomFromList(this.names);
    },

    names: [
        "Lock and Key - A locksmith run by Jodeni, a female dwarf. /u/AtemAndrew",
        "Gerard's Gin - A combination pub and distillery run by the dwarf Gerard and his family. /u/redkat85",
        "Quiggly's Quicklime - A plaster business run by the gnome Quiggly, who has become very wealthy from supplying the city after every disaster. /u/redkat85",
        "The Sturdy Sheath - A weapons shop run by Smiling Welby, who can make a custom sheath for some extra gold. /u/Butler2102",
        "A Tough Climb - A climbing gear shop (rope, picks, etc) with a practice rock wall, run by an enthusiastic elf named Theodas. /u/Butler2102",
        "The Wetstone - A tavern/inn run by the dwarven blacksmith Venin, who will sharpen your weapons if you stay overnight. /u/jsgunn",
        "Harriet's Hindsight - A fortune teller named Harriet who can only tell you your past, and will explain mistakes you have made in perfect detail. /u/jsgunn",
        "The Broken Mast - An inn run by an old sea captain, Grimsby, who ran his ship aground many years ago. That ship has been repurposed into this inn. /u/Imic_",
        "Arcanedy - A shop that sells candy made to look like magic items (gummy amulets, chocolate holy symbols, fruit punch health potions etc.) Run by two silly gnomes, Willy and Wonky. /u/fentanyllionaire",
        "You Didn't Know You Needed It - A store filled with items that seem useless to an adventurer, but the tiefling Tenabal who runs it can explain clever uses for them (glitter for fighting invisible mosnters, small mirrors for looking around corners, metal rods for testing questionable liquids, etc) /u/HatTrick730",
        "Which Witch is Wich? - A sandwich shop run by a witch name Mar-Geret. Waiters are Unseen Servant spells. /u/HatTrick730",
        "Armen's Arms For Men - A weapons shop run by a not unattractive Armen, who is particularly intersted in male customers, and offers weapon training for them for free. /u/Quote_Poop",
        "Heck's Hack 'n Slash - Weapons store run by the orc Heck, who enthusiastically describes how he's personally used each weapon on other people. /u/Quote_Poop",
        "Aunties Groceries - A small grocery run by an even smaller sweet elderly halfling named Beatrice. However, Beatrice is proficient in under-the-table deals, and there's always a shopper who's actually her personal body guard. /u/realpudding",
        "The Mourning Wood - A Inn/tavern whose logo is a weeping willow. The old elf Numian who runs the place is woefully unaware of the connotation of his store's name. /u/Adaptingfate",
        "Bloodbath and Beyond - A weapons shop run by an enthusiastic ogre Wakurg, who also has a small shelf dedicated to toiletries. /u/GrooveCereal",
        "Travis' Trinkets - A store run by a sleazy half-elf named Travis, that only sells completely useless trinkets, that Travis tries to convince you they work. /u/Argonov",
        "The Ten-Foot Touch - A store run by an entrepreneuring half-elf named Craril who sells 10-foot poles in all sorts of materials. /u/prouce",
        "Lots O' Knots - Just sells rope. Run by a gnome nicknamed Gnott. /u/fentanyllionaire",
        "The Bait and Switch - An inn that looks promising, but the service is slow and sub-par. Run by an intelligible dwarf who slurs and mumbles. /u/The HeadlessOne",
        "Gronk's Ogre Suppositories - Gross. Also sells suppositories for humans and dwarves. Run by Gronk the ogre. /u/Dracomax",
        "The Last Repose - Mortuary that sells headstones and embalming tools. Run by Morty, who is totally not a necromancer. /u/Dracomax",
        "Messijo's - A family style restaurant run by the gregarious dwarf Messijo. /u/MrDave2176",
        "Obscuro's Emporium - A store that has what you need, but you have to be able to describe it in every detail, down to the inch of the blade length, or the precise shade of the potion. Usually not worth the effort. Yes, Obscuro is a stage name. /u/MrDave2176",
        "Erwin's Amazing Arcanum - Sells strong but overpriced amulets. Erwin the gnome has no idea how to haggle, and usually just yells random numbers much higher than the customer suggests. /u/blazinrainbo",
        "Herbert's Unique Herbs - Sells basic utility plants. Believes any herb is rare. /u/blazinrainbo",
        "IHOP - Restaurant that serves potatoes with every meal. Mashed or baked. Run by the halfling Lanlas. /u/rayoman 67",
        "Botanist Bob's Big Boutique of Bouquets - A flower store run by a romantic devil (literally) named Bob. May attempt to use magic to convince you to buy flowers. /u/Gerbillcage",
        "The Boastful Bard - Sells instruments at a price slightly higher than it should be. The gnome bard Zilver tries to use his charms (and his high CHA) to convince you that they are fair prices. /u/fentanyllionaire",
        "Old Man Jensen's Jam - Jensen is a masterwork jamsmith, and proud of it. He can smith a jam out of any fruit or vegetable, maybe even anything if he tried hard enough. /u/Gerbillcage",
        "Goblins R' Us: Run by several low-IQ goblins who don't understand how stores work. They simply are advertising that they are indeed goblins. /u/Gerbillcage",
        "The Whistling Hammer - A kiosk that sells accessories for your weapons and armor. Flashing lights, charms that play sound effects, and many other obnoxious things. /u/floatzilla",
        "A Good Knight's Rest - An inn whose logo is an image of a paladin sleeping in pajama armor. The portrayed paladin owns the inn, and his name is Gregory. /u/shogungari",
        "The Jade Dragon - An expensive teahouse, where the waiters' gloves are enchanted to continually burn to keep the teapots warm while serving. Run by a green female dragonborn named Shalerth. /u/Slayerwolf",
        "Barrelstave Outfitters - For all adventuring needs. Run by a fat halfing that takes himself too seriously, named Mr. Kipling. He is a hard bargainer, who is hard to budge on prices.",
        "Critters, Crawlers, and Creepers - A pet store that sells small creatures. Some animals are trained but very expensive. Run by a kooky gnome, Progs. /u/Neon-Nightingale",
        "The Warf: Sells fishing gear, boat supplies, anything to do with the water really. Run by a grumpy gruff halfling with an eyepatch who calls himself Grits. /u/Neon-Nightingale",
        "Gnomenclature - Scroll and Spell shop. Owned by Priak the gnome, run by several gnomes. /u/Folsomdsf",
        "The Hoard - Store that sells small trinkets and jewelry, run by an elderly lady dragonborn named Iraneth. She is actually very reluctant to sell anything. She will buy things from you however.",
        "Paladjinn's Punishers - A weapons store run by a djinn, Amon, who insists he is a paladin. /u/Folsomdsf",
        "Mixmasters - A half potion shop run by a gnome named Bangalter, and half music shop run by a halfling bard named Christo. /u/KungFuPanzer",
        "One, Two, Tree - A gardening store run by a dwarf, named Bolril, who's accent makes it hard to tell whether he says 'tree' or 'three'. /u/KungFuPanzer",
        "The Brawling Box - Tavern with nightly fistfights. Fights are run by a human named Sam. /u/KingNothing87",
        "Hugh's Huge Halberds - A half-orc that sells halberds that feels just slightly too large to wield comfortably. /u/KingNothing87",
        "Cambion-N-Out - A burger joint run by a tiefling named Beimuhr. /u/wondercheck",
        "General Goode's General Goods - A retired veteran named Goode saw an opportunity for a store and took it. /u/Aardvark_Man",
        "The Cod Father - A fishmonger with a strong Italian accent, named Branlon. /u/Euphorbus11",
        "The Curious Courtier - A clothing shop run by an intelligent, impatient, consummate professional goblin named Martin. Clothes are expensive but very high quality and fitted. /u/Corpsman913",
        "De Bears Diamonds - An expensive diamond jewelry store run by an Awakened bear that calls himself Cecil. /u/SpartiGaz",
        "Cobblers At Dawn - A pair of shoemakers, Timothy and Tom. /u/AtemAndrew",
        "The High Inquisitor - An elf named Erqen who is good at appraising items, but seems to interrogate the value out of them. /u/AtemAndrew",
        "Ardilev's Amazing Antiquities - A store filled with (albiet well done) fraud reproductions of well-known old magic artifacts run by the tiefling Ardilev. /u/redkat85",
        "The Dowager Hotel - An expensive hotel (at least 10x a normal inn). Residents and staff alike should look down on adventurers who come in their bloodstained gear. The main counter is usually staffed by the human Jaques. /u/redkat85",
        "Jermaine's Jerked Meats - Jermaine sells dried meat from your basic beef jerky up to exotic and rare jerkies. Does not sell unicorn meat. Does NOT sell unicorn meat. /u/redkat85",
        "Lamont's Laminates - Lamont the Half-Elf is able to laminate anything, messages, bedspreads, and other goods. He can even laminate your armor, but he finds that distasteful. u/redkat85",
        "Red Things - Sells red things. Entire store is the same shade of cardinal red. It is actually very hard to see anything in the store due to the lack of definition of color. Run by a (red) dragonborn named Jura. /u/AtemAndrew",
        "Sword and Board - An inn that sponsors a knightly fighting ring. /u/Butler2102",
        "The Wizard's Tower - A gimmicky magic store, that sells cheap illusion kits and tricks rather than anything actually magical. Run by a slightly overweight man named Tenn. /u/Butler2102",
        "Cheese for EVERYONE! - A large grocery that is always sold out of cheese. /u/AtemAndrew",
        "The Broken Compass - An inn that seems to always be found when not looking for it. Has great service, but good luck finding it again! /u/Butler2102",
        "The Seven Leaf Clover - A store dealing in excessive superstition objects. Seven leaf clovers, shooting star firework kits, black cat repellant, mirror insta-fix gel. Run by an incredibly paranoid gnome named Riley, who is covered in charms and believes the universe, karma, luck, and other intangible world forces are out to get him. /u/Butler2102",
        "Sundial N' Such - A store that sells non mechanical timekeepers, like sundials, hourglasses, and measured candles. Run by an Elf named Keri. /u/jsgunn",
        "Deluge - Sells magic umbrellas that are enchanted to protect from different liquids. Run by a sorcerer named Vrochi. /u/HatTrick730",
        "Swatches - A paint store. Has a service where you can BYO herbs to make custom paints. Run by Patch the dwarf. /u/HatTrick730",
        "Fletcher's Fletchery - An exclusive arrow shop. Bring your own materials to make special arrows. The elf who owns the store believes this was his destiny ever since his parents named him. /u/HatTrick730",
        "Numismatics - Appraiser and currency exchange. Run by an intelligent goblin who always wears glasses that make his beady eyes huge. /u/HatTrick730",
        "Open Range - A large restaurant where the table picks the animal they want to eat, and it gets killed and prepared right there. If a table is able to eat an entire cow, then everyone at the table wins prize belts! Very pricey, as you are essentially buying a whole animal. /u/HatTrick730",
        "Mephibosheth's Magical Maladies - A dark and shady store run by a tiefling who looks less trustworthy than his storefront. However, all his potions work perfectly as advertised, perhaps even better. Just give him one chance? /u/HatTrick730",
        "Consolidate - A group of proficient wizards who will shrink any item down to a manageable size for you, then give you a one-time use wand which restores the item back to its original size. Due to the popularity of this service, it's quite expensive. /u/HatTrick730",
        "Roland's Royal Rapiers - A condescending human named Roland, who used to be a high ranked military official, now sells specifically rapiers. He believes all other weapons are inferior, and looks down on anyone who uses anything else. /u/Quote_Poop",
        "Taboos and Voodoos - Run by a half-elf named Madame Mystique, a clearly minimum wage teen who is not at all into her role, a store with almost cringeworthy and silly magic items like a bong that is enchanted to make the booze flow faster, or shirts with dumb sayings on them, which they will occasionally actually say out loud. /u/Quote_Poop",
        "Drew's Booze and Stews - A pub who's special is always a kind of soup. Not known for its soup. /u/supergamer422",
        "Illyria's Illuminaces - A store that sells incredibly fancy and ostentatious lights and lamps. Very expensive. Run by an elf named Illyria who believes she is doing the world a favor by introducing her lamps to it. /u/redkat85",
        "Oscar's Ordnance - A man missing several bits, fingers, an eye, some hair, and with soot on his face, trying to sell homemade explosives out of a kiosk. (\"If I was a bad demoman…\") /u/redkat85",
        "Filch's Pawn - A pawn shop with surprisingly low priced items. Willing to buy most things from adventurers. Most things in the shop are actually stolen, and if the PCs lost something, it might turn up here. /u/redkat85",
        "Pops' Pachyderms - A mount store, that sells horses and beasts of burden, but no elephants. Is owned by a young female elf named Alanis, who may not have a full grasp on Common, after seeing her store's name. /u/redkat85",
        "Kilt Lifters - A tacky and gimmicky tavern based around busty women wearing plaid skirts. Actual highlanders avoid the place like the plague. Food is sub-par. /u/redkat85",
        "Zibblethorpe! - A human 'wizard' who charges a large amount of money to give magic lessons to the 'less thaumatically privileged.' Typically throws out his students after a short period because 'they just can't get it.' /u/redkat85",
        "Roberts and Roberts - Human professional saddlemakers. One of them pronounces his name \"roh-BEAR\" and has a huge chip on his shoulder about it. /u/redkat85",
        "The Best Defense - A store that exclusively sells weapons. No armor or shields to speak of. If asked, employees explain that it's \"…a good offense.\" /u/Butler2102",
        "The Stumbling Statue - A proficient dwarven golemmancer named Tavish made a tavern run by animated stone statues. The statues are well crafted, and somewhat recognizable. If properly convinced, Tavish will reveal that he doesn't make his own golems, and in fact just enchants and leads away statues built by cities in honor of famous people. /u/Butler2102",
        "The Outpost - After a tough winter, a fort received notice that it would lose its king's support, the men completely cleared the entire fort out of all supplies and made a break for it. Now they resell the weapons, armor, and other military surplus until they have enough money to restart their lives. /u/Butler2102",
        "Boots and Barding - An armor/clothing store that sells everything up to mount armor. Run by a half-elf named Petther. /u/Butler2102",
        "Agatha's Antidote - For Agatha, a cynical halfling, existence is poison, and booze is the only antidote. A fine enough tavern, just don't engage the proprietor while she is sober. /u/Butler2102",
        "Nimble Fingers - A halfling named Chitz is a great locksmith, but for enough money, he might be able to 'smith' his way past a lock that isn't yours. He doesn't ask questions either. /u/Butler2102",
        "Wizard's Walking Sticks - Ornate and custom staves for wizards. They do not come enchanted. /u/HatTrick730",
        "Dis-enchanted - The place to go to have magical items disenchanted into their basic components. A disclaimer hangs in the window that magical effects from living creatures cannot be removed. /u/HatTrick730",
        "Azkabang - A store that sells a mixture of actual magic items and faux magic/illusion kits, as well as simple pranks like 'snakes in a can'…of course there's always the possibility of literal snakes in a can. /u/Imic_",
        "GURTS BIGEST SOWRDS AN STUF - A wood shack with the sign crudely painted in white above the door. Run by a half-orc ex adventurer. Sells excessively large hammers, swords, axes, etc. If asked for a shield, strongly 'suggests' an even larger weapon instead. /u/fentanyllionaire",
        "Creature Couture - Sells fashionable and unique clothing specifically for animal companions, familiars, and other pets. Run by a very eccentric elf named Torcique (Tor-Chi-Chi, NOT Tor-cee-kay). /u/fentanyllionaire",
        "The Goodly Wood Surplus Warehouse - If you needed wood for anything, you can get it here. It just has a special premium on it because of druidic origins. It's just better than regular wood, you wouldn't understand. /u/fentanyllionaire",
        "Granite's Flint - Dwarven arrow makers that additionally sell most throwing and projectile weapons. They do not sell or use melee weapons. The dwarves talk vaguely about their past clan and why they stay away from axes, but they have to be coerced (maybe with a nice pint) to talk about the whole story. /u/Dracomax",
        "The Seraph's Steins - Extremely well crafted, ornate, detailed steins and tankards made out of gold, fine silver, and inlaid gems. Everything seems to reflect a somewhat heavenly glow, and the result is a storefront that is almost uncomfortable to look directly at. Its sole proprietor is a dwarf named Tharg, who is a stark contrast to his beautiful art. /u/faikwansuen",
        "Dale's Daring Didgeridoos - It's not doing too well. /u/King0fWhales",
        "Gunter's Gesticulating Gourds - Gunter the Tiefling carves realistic faces into hollowed out gourds. If you stare at them long enough they seem to move! (You might also hear sounds coming from them if you listen hard enough). /u/KingNothing87",
        "The Emperor's New Clothier - Sells clothes that appear invisible to anyone who is poor at their job, or just plain stupid. Some the best made clothes, for those who can see them. /u/jthewolfmanm",
        "Carl's Insane Discounts - A general store led by an old god, a many-eyed tentacle monster who has since reformed his apocalypse cult leading days, and now simply wants to run his store. He calls himself Carl out of courtesy, seeing as how his true name turns mortals to insanity. He speaks directly into the minds of customers, but he means well.",
        "Creatures of Comfort - A store that sells clothes and armor made for non-human races with unusual shapes or skin, such as dragonborn, warforged, shardminds, etc.",
        "The Fourth Wall - A bookstore run by an elderly human named Gary. Sells rulebooks for some game called \"ADND\". Oddly enough, the second time players visit it, the building, despite being a sound brick structure, is reduced to rubble. /u/HatTrick730",
    ]
};

module.exports = random_store_names;
