/*
    Labels:

        G - General: Good for pretty much anywhere, searches for other types should also pull from these
        C - City: Best for when in a larger city/town
        T - Town: Best for smaller towns/villages
        R - Roadside: Anything kinda outside
        O - Other: Not really sure what to do with these
*/

const {
    createElement
} = require('../../../lib/helpers');

const {
    randomFromList
} = require('../helpers');

const quest_generator = {
    title: "Quests",
    type: "quest",

    init: function (container) {
        this.quests.forEach((quest) => {
            let label = quest.label;
            if (!label) {
                // console.warn('Quest found without label');
                this.quests_by_type.general.push(quest.quest);
                return;
            }

            Object.keys(this.quest_types).forEach((quest_type) => {
                let type_key = this.quest_types[quest_type];

                if (!this.quests_by_type[quest_type]) {
                    this.quests_by_type[quest_type] = [];
                }

                if (label.indexOf(type_key) > -1) {
                    this.quests_by_type[quest_type].push(quest.quest);
                }
            });
        });

        Object.keys(this.quests_by_type).forEach((quest_type) => {
            createElement('div', 'info_button button', {
                html: quest_type,
                events: {
                    click: (e) => {
                        for (var i = 0; i < container.amount_per_click; ++i) {
                            container.addResult({
                                type: '(' + this.title + ') ' + quest_type,
                                value: this.generate(quest_type)
                            });
                        }
                    }
                },
                addTo: container.el_buttons
            });
        });
    },

    generate: function (quest_type) {
        return randomFromList(this.quests_by_type[quest_type]);
    },

    quest_types: {
        general: "G", // undefined label also counts as general
        city: "C",
        town: "T",
        roadside: "R",
        other: "O"
    },

    quests_by_type: {
        general: []
    },

    quests: [
        {
            label: "T",
            quest: "Vistaru, Lord of the Mountain, is attacking small towns surrounded by his kingdom in hopes of expanding his army before his assault on the capital."
        },
        {
            label: "C|T",
            quest: "Your party is sent to kill an evil Duke/King/Emperor etc."
        },
        {
            label: "R",
            quest: "Your party is pursued by a murder of deadly crows with needle sharp beaks."
        },
        {
            label: "G",
            quest: "Drugged and put on a boat in the middle of the ocean and naked with no food or water."
        },
        {
            label: "O",
            quest: "Trapped on an island with monsters and little food or water."
        },
        {
            label: "G",
            quest: "Soldiers in an army marching into unholy land."
        },
        {
            label: "G",
            quest: "Spies for an army."
        },
        {
            label: "G",
            quest: "Part of an exploration team."
        },
        {
            label: "R",
            quest: "Plain old surviving - Bandits, highwaymen, monsters, etc."
        },
        {
            label: "G",
            quest: "Portal from one plane has been opened and elemental monsters are invading a peaceful land."
        },
        {
            label: "C|T",
            quest: "Priest is kidnapped by opposing clerics."
        },
        {
            label: "G",
            quest: "Cult becomes angry with rival gang and attacks them."
        },
        {
            label: "C|T",
            quest: "A mysterious mound threatens a military base."
        },
        {
            label: "C",
            quest: "A rival country threatens war, peace must be obtained."
        },
        {
            label: "C|T",
            quest: "A Wizard hires you to retrieve magical artifacts from the ruins of an ancient city."
        },
        {
            label: "C|T",
            quest: "Locals hear chants in the nearby ruins."
        },
        {
            label: "G",
            quest: "Undead threaten cities across the nation."
        },
        {
            label: "C|T",
            quest: "A queer lightning storm wipes out an entire city - the king orders you to investigate."
        },
        {
            label: "C|T",
            quest: "An encrypted stone tablet is discovered during an archaeological expedition."
        },
        {
            label: "C",
            quest: "Several major politicians have been assassinated."
        },
        {
            label: "C",
            quest: "A large gang/terrorist organization wages war against a local city."
        },
        {
            label: "C|T",
            quest: "Barbaric humanoid tribes threaten a supply post which boasts the majority of a country's natural resources."
        },
        {
            label: "G",
            quest: "The party comes across a gladiator stadium and is offered money in return for fighting."
        },
        {
            label: "G",
            quest: "Dragon blood is needed to cure a plague and your group is sent to collect some."
        },
        {
            label: "C",
            quest: "A powerful bard hires your party to retrieve a fabled magical instrument from a dead wizard's coffin."
        },
        {
            label: "C",
            quest: "A huge drought arises and you must travel to the Water Plane and battle elementals in order to direct a flow into the drying world."
        },
        {
            label: "C|T",
            quest: "Breaking into a dungeon/room/fortress etc. to rescue or capture a person or artifact."
        },
        {
            label: "C",
            quest: "The characters must escort a dignitary."
        },
        {
            label: "C",
            quest: "A nation's enemies have a secret base that must be found."
        },
        {
            label: "G",
            quest: "The characters are imprisoned and must escape."
        },
        {
            label: "O",
            quest: "The ship the party is traveling on is hijacked.",
        },
        {
            label: "G",
            quest: "Safari; characters must hunt down a creature."
        },
        {
            label: "C|T",
            quest: "Mysteriously, an entire city has lost its inhabitants overnight."
        },
        {
            label: "C",
            quest: "The characters must be counterspies and seek enemy agents."
        },
        {
            label: "G",
            quest: "The party competes in a sport/competition/game."
        },
        {
            label: "R",
            quest: "The characters must chase escaping bandits through the countryside/are chased by bandits through the countryside."
        },
        {
            label: "G",
            quest: "Discovering a portal to another plane leads to an exploration party."
        },
        {
            label: "C|T",
            quest: "A group of Doppelgangers have assassinated the town council and assumed their identities."
        },
        {
            label: "G",
            quest: "A medusa is constructing a garden of statues using townsfolk."
        },
        {
            label: "G",
            quest: "Statues in a large cemetery come to life at night."
        },
        {
            label: "C",
            quest: "A lich is raising a massive undead army."
        },
        {
            label: "C|T",
            quest: "A wizard has been kidnapped and his book of immortality/whatever is hidden in his tower, wanted by rival guilds."
        },
        {
            label: "G",
            quest: "A group of warriors has challenged the party to a match, to prove who is the strongest."
        },
        {
            label: "G",
            quest: "A thief has stolen one of the player's main pieces of equipment - spell book, sword, divine focus, etc."
        },
        {
            label: "G",
            quest: "Demons are appearing all over the kingdom. Why? A giant believes that all humans exist for his dining pleasure."
        },
        {
            label: "C|T",
            quest: "A man with one eye is being hanged for \"looking sinister.\""
        },
        {
            label: "C|T",
            quest: "A wizard has declared himself ruler of all he surveys - meaning most of everywhere."
        },
        {
            label: "C|T",
            quest: "The well has turned black."
        },
        {
            label: "O",
            quest: "Party members find a chained and punished god in an ancient, forgotten temple"
        },
        {
            label: "C|T",
            quest: "Catacombs have opened beneath the city, guarded by ancient undead who let no one pass."
        },
        {
            label: "C",
            quest: "The sacred spear of Lesh has gone missing."
        },
        {
            label: "C|T",
            quest: "There is a black cloaked man in a tavern, though he is dead. Everybody says they saw him walk in just fine."
        },
        {
            label: "R",
            quest: "An ogre regards a party member as \"The perfect mate.\""
        },
        {
            label: "G",
            quest: "A wandering rogue believes that one of the party is his long lost brother/sister."
        },
        {
            label: "O",
            quest: "A spirit begs for help from an evil party member."
        },
        {
            label: "G",
            quest: "A god's weapon has fallen to earth and now there is a race to obtain it."
        },
        {
            label: "G",
            quest: "Suddenly an entire country turns black."
        },
        {
            label: "G",
            quest: "A party member's armor comes to life and tries to leave."
        },
        {
            label: "G",
            quest: "A tribe of trolls is trying to make peace with a nearby village."
        },
        {
            label: "G",
            quest: "The party meets several groups of travelers headed in the same direction, claiming to be going to something called \"The Games.\""
        },
        {
            label: "G",
            quest: "A previously righteous and good god suddenly calls genocide on all that are not his followers."
        },
        {
            label: "G",
            quest: "A paladin is after a party member because of a case of mistaken identity."
        },
        {
            label: "G",
            quest: "An area has an uprising of twisted, demon-like animals. What has happened?"
        },
        {
            label: "C|T",
            quest: "Everybody who buys a charm from a certain vendor begins experiencing the effects of a curse that causes a physical aspect to change (odd skin color, longer legs, hair changing color or falling out, etc.) So far, the effects have not been particularly terrible, but how long will that keep up?"
        },
        {
            label: "G",
            quest: "A bestial race (Rat/Lizardmen, etc.) are killing everything from paladins to assassins. Whose side are they on?"
        },
        {
            label: "C|T",
            quest: "A shady character asks you to smuggle some barrels of moonshine into a city."
        },
        {
            label: "C|T",
            quest: "We need the Demon-slaying sword if we are to overcome the oncoming siege. Travel to that indifferent neighboring country and negotiate with their leader for a loan of the sword."
        },
        {
            label: "O",
            quest: "A member of a party of adventurers is on the run from the law but the Duke has asked to see the party. The adventurer is welcome but the guards do not know this and the character must be smuggled into the city."
        },
        {
            label: "R",
            quest: "Facing a pack of werewolves becomes a grueling all-nighter as they use hit-and-run tactics to lure characters away from the group so they may overpower them with their numbers. (Perhaps the party is trapped within a remote cabin or rundown fort or ruin) A group of guards/civilians are all the party have to aid them."
        },
        {
            label: "O",
            quest: "Book passage on a ghost ship; at night the crew turn into ghouls and kill each other - and anyone else unfortunate enough to be aboard - while below deck, it grows even worse."
        },
        {
            label: "G",
            quest: "A ring of regeneration is a great find - until a character realizes what it is turning them into... can the party do what it takes to remove the curse in time?"
        },
        {
            label: "C|T",
            quest: "All who come in contact with the waters of a holy fountain rot and eventually become zombies."
        },
        {
            label: "C|T",
            quest: "A mysterious Goblin raids the town at night, striking and seemingly vanishing without a trace."
        },
        {
            label: "C|T",
            quest: "A druid is accused of killing other druids."
        },
        {
            label: "G",
            quest: "A hidden pathway in an abandoned house leads to a lair of a terrible Demon. The Demon keeps \"slave girls\" where a friend of the party is, but the \"slave girls\" are secretly Demons in disguise."
        },
        {
            label: "O",
            quest: "One of the party members is offered a slave girl as a reward for a job well done. Another character - e.g. a Paladin - finds this outrageous and demands he let her go."
        },
        {
            label: "O",
            quest: "The party and some others are raiding a city when they are captured and forced to entertain the king in the gladiator's arena."
        },
        {
            label: "G",
            quest: "A large tribe of Orcs are planning a raid on an Imperial city."
        },
        {
            label: "G",
            quest: "A Mage summons a demon but is unable to control it and is possessed."
        },
        {
            label: "G",
            quest: "The world is hit by an asteroid that mutates anyone that touches it."
        },
        {
            label: "G",
            quest: "A large egg of some sort is discovered and the Orcs are coming for it. Will the characters try to hatch it?"
        },
        {
            label: "G",
            quest: "A thick plague-inducing fog is slowly covering the countryside. A Paladin (or any good character) goes mad, turning evil while still thinking he is good."
        },
        {
            label: "G",
            quest: "The characters are shrunk by an evil wizard and have to find a way to reverse the spell."
        },
        {
            label: "C|T",
            quest: "An illusion of peace and tranquility is projected over a town. The characters must escape and discover what is really happening."
        },
        {
            label: "G",
            quest: "The God of Time punishes a town/city/village for not worshiping him, making everything happen out of sequence."
        },
        {
            label: "G",
            quest: "All the local wild life is killing people; are the Druids to blame?"
        },
        {
            label: "T",
            quest: "A time warp descends upon an isolated village, setting everyone and everything back a century into the past."
        },
        {
            label: "C|T",
            quest: "Several of the king's tax collectors have disappeared after travelling to a particularly dangerous area."
        },
        {
            label: "C|T",
            quest: "Suspicion arises that the inhabitant of a town are gradually being replaced by impostors."
        },
        {
            label: "G",
            quest: "There are five shards of a legendary dagger hidden across the land and they are well hidden. If the party gathers them all they get a legendary prize."
        },
        {
            label: "G",
            quest: "News spreads that a dragon was slain while away from his cave, a search for its unguarded hoard is underway"
        },
        {
            label: "G",
            quest: "A thief has stolen a powerful item from a lich and then joins the party for protection"
        },
        {
            label: "G",
            quest: "A wizard/collector wants a live troll to study"
        },
        {
            label: "C|T",
            quest: "Rat catchers are going missing under the city and a plague is spreading in their absence"
        },
        {
            label: "G",
            quest: "A local caster has summoned a creature that they cannot contain and it is destroying the area"
        },
        {
            label: "G",
            quest: "A charismatic charlatan claims (and has proof) to be the cousin/brother/son of one of the PCs"
        },
        {
            label: "G",
            quest: "A wandering merchant trades a PC for their magic item for a fake he claims is more powerful"
        },
        {
            label: "C|T",
            quest: "Shipments from a nearby mine have stopped, when the PCs investigate they find the miners crazed and covered with red welts apparently from exposure to a new element they uncovered"
        },
        {
            label: "G",
            quest: "A white dragon is driving monsters from the north into the southern lands"
        },
        {
            label: "G",
            quest: "A planar rift has formed and outsiders are seeping through"
        },
        {
            label: "G",
            quest: "A powerful noble/wizard is hosting a masquerade ball where the guests are polymorphed into monster as their costume, but an actual monster attends to kill the noble/wizard"
        },
        {
            label: "G",
            quest: "A sorcerer has died of old age, strange things are creeping out of his tower as his spells, and dweomers break down"
        },
        {
            label: "G",
            quest: "A map has been found that leads to parts of an artifact that once reassembled, will summon a fiendish kraken"
        },
        {
            label: "G",
            quest: "The dead are rising as zombies one hour after their death"
        },
        {
            label: "G",
            quest: "Slavers are capturing peasants and merchants on the highway and selling them to mindflayers"
        },
        {
            label: "G",
            quest: "A shop/traveling merchant sells pets/familiars that are actually polymorphed people"
        },
        {
            label: "G",
            quest: "The PC’s are sent to find a hermit that lives on the \"moving island\", a zircon/dragon turtle"
        },
        {
            label: "C|T",
            quest: "A traveling circus/faire comes to town and completely vanishes in the morning with several children"
        },
        {
            label: "G",
            quest: "An Ur priest cult is killing all the divine casters in the area"
        },
        {
            label: "G",
            quest: "Water drawn from a certain well is animating into water elementals/mephits"
        },
        {
            label: "G",
            quest: "An evil druid has taken up residence in the sewers and is waging a guerilla war on civilization"
        },
        {
            label: "C|T",
            quest: "Anyone who reads a cursed book, brought into town by an adventuring party, dies after reading it"
        },
        {
            label: "C|T",
            quest: "A killer is leaving rare flowers in the mouths of his victims"
        },
        {
            label: "G",
            quest: "A member of a planar cartographical society offers the PCs membership into the elite group if they can complete a scavenger hunt that leads them across several planes in one day"
        },
        {
            label: "G",
            quest: "A mysterious helmed/hooded/masked figure has forged an impressive army by bringing tribes of kobolds, goblins, orcs, and hobgoblins under one banner. The leader is actually a cleric disheartened by the lack of faith and respect of his flock and means to increase belief and prayer for his deity by leading an army of wolves against his flock"
        },
        {
            label: "C|T",
            quest: "The owner of a failing inn claims to have the entrance to a mysterious dungeon in his cellar hoping that the ruse will draw business from adventurers"
        },
        {
            label: "R",
            quest: "A pack of displacer beasts/displacer beast lord are preying on farm animals and farmers alike"
        },
        {
            label: "C",
            quest: "Two rival gangs are actually devils and demons fighting a Blood War battle on the city streets"
        },
        {
            label: "G",
            quest: "The apprentice of a caster that polymorphed himself into a golden cup and placed himself in the hoard of a green dragon in an attempt to learn more about dragons, but it has been weeks and he has not come home contacts the PCs"
        },
        {
            label: "G",
            quest: "Reports that a gold dragon is ravaging the countryside turn out to be true. The dragon, sick with a rare disease, has gone mad and must be stopped"
        },
        {
            label: "C|T",
            quest: "Grave robbers working for a necromancer are running out of graves and start looking for easy prey"
        },
        {
            label: "T",
            quest: "A \"red\" dragon demanding tributes from a village is actually an especially greedy copper dragon"
        },
        {
            label: "G",
            quest: "A killer is released from prison and the father of one of his victims stages a similar murder in the hopes of framing him"
        },
        {
            label: "G",
            quest: "A traveling \"holy man\" is selling relics that disappear in the morning"
        },
        {
            label: "C|T",
            quest: "The new judge is in fact a devil hoping to harvest souls for not guilty verdicts"
        },
        {
            label: "R",
            quest: "A logging camp is being haunted by the ghost of a treant/forest haunt and his dryad followers"
        },
        {
            label: "T|R",
            quest: "A band of fey have been stealing wine from a rural tavern"
        },
        {
            label: "G",
            quest: "A good and helpful aranea has been captured and tried for murder while the true culprit is a drider that resides close by"
        },
        {
            label: "C",
            quest: "A college that teaches science over magic opens and arcane casters start going missing"
        },
        {
            label: "G",
            quest: "Drug related deaths lead the PCs to an evil alchemist"
        },
        {
            label: "G",
            quest: "The PCs are hired to retrieve a meteor, but find it is being worshipped by a tribe of goblins/orcs/lizardmen etc."
        },
        {
            label: "G",
            quest: "Several woman in the area are pregnant under strange circumstances, an incubus is to blame"
        },
        {
            quest: "An artifact is needed to avert a major catastrophe; its last known owner was Levistus the arch devil trapped within a glacier"
        },
        {
            quest: "The PCs must find a rare herb only known to grow within Gith monasteries"
        },
        {
            quest: "The PCs visit a strange village where all the people are simulacrums, an ancient wizards mark is seen everywhere"
        },
        {
            quest: "The PCs are sent to a distant land to find an NPC that it turns out has been dead for 20 years"
        },
        {
            quest: "The PCs must help a conflicted Erinyes to the Cradle of Creation (phb2) to be reborn into a non-evil body"
        },
        {
            quest: "A map leading to the legendary Shield of Praetor has been found, it states that the shield is in the cave of a dracolich. The map was sent by the dracolich’s minions in the hopes of freeing their master who is sealed magically into his cave"
        },
        {
            quest: "A local orphanage is actually run by a demonic cultist that sacrifices the weak children and raises the strong ones to be followers"
        },
        {
            quest: "A powerful artifact that will allow teleportation through the layers of the abyss/hells has been uncovered and a race to claim it has begun. The PCs must beat the groups of devils and demons that see the artifact as a powerful tool to end the Blood War"
        },
        {
            quest: "An overmatched Marut seeks assistance with a powerful lich/vampire/mummy"
        },
        {
            quest: "Rumors of “The most powerful sword” lead the PCs to an evil, intelligent, dancing sword that can animate other weapons to fight for it"
        },
        {
            quest: "The PCs are sent to a battlefield to retrieve a family heirloom from a missing soldier where a necromancer and his corpse collector golem are raising the fallen as undead"
        },
        {
            quest: "A cult of Tiamat have discovered a spell that ages living creatures and they are trying to use it on dragon eggs to raise powerful allies"
        },
        {
            quest: "The PCs are sent to deal with a raiding ogre that turns out to be a gnome illusionist"
        },
        {
            quest: "The PCs are looking for an arrow used to slay a dragon a hundred years earlier, but when they pull the arrow from the dragon’s skeleton, it animates and attacks"
        },
        {
            quest: "The PCs need the help/information of a treant that will only add them if they agree to be shrunk down to clear out an infestation of insects that invaded his roots"
        },
        {
            quest: "The PCs are invited to a Three Dragon Ante tourney, either as guards, VIPs, or to play"
        },
        {
            quest: "A lawful good lich (Monsters of Faerun) seeks the PCs to protect him from a zealous paladin on a quest to rid the world of undead"
        },
        {
            quest: "Thieves have plundered a tomb and until his golden burial mask is returned, a ghost/ghast/specter will continue to kill innocent people"
        },
        {
            quest: "A group of fire giants has taken up residence in an inactive volcano, their activity threatens to awaken the volcano and cause widespread devastation"
        },
        {
            quest: "A grandmotherly, if slightly senile, NPC asks the players to rid her attic of rats. The rats are in fact a group of thieves trying to open a magical doorway left by the wizard that previously owned the home"
        },
        {
            quest: "A monster seen roaming close to town is actually a cursed person and not evil"
        },
        {
            quest: "The PCs find a genie in a bottle, but the genie agrees to help/grant wishes/serve only after the players travel to the City of Brass and save someone the genie cares about"
        },
        {
            quest: "The PCs find a wounded angel that is being hunted by powerful outsiders"
        },
        {
            quest: "A newly discovered dungeon is actually a complex trap to harvest souls/magic/life energy"
        },
        {
            quest: "The PCs must break an innocent man from a complex magical prison"
        },
        {
            quest: "Murders attributed to a small girl are being done by her doll, a slaymate (libris motris)"
        },
        {
            quest: "An ancient beholder has gone mad and his destroying the Underdark, driving monsters to the surface"
        },
        {
            quest: "A gnome settlement has been overrun by Drow displacing hundreds of citizens"
        },
        {
            quest: "A mad wizard has been selling potions that have poisonous/odd effects"
        },
        {
            quest: "Mind flayers are draining people of their quintessence in hopes of using the substance to return to the far realm from which aberrations came"
        },
        {
            quest: "A spelljammer has crashed in a remote forest/jungle and the inhabitants seek materials to repair their helm"
        },
        {
            quest: "A foreign diplomat seeks the party’s monk to protect him on a mission to a country/city where magic and weapons are not allowed"
        },
        {
            quest: "The tarrasque is wreaking havoc on the countryside and the party (lvl 10ish) must slow it down until the champions (20th) can arrive, but the tarrasque is actually a simulacrum (cr 10) sent by an outsider/caster/etc. and not the real thing"
        },
        {
            quest: "Cultist seek a tablet that depicts a ritual that will summon a Fist of Spite (BoVD)"
        },
        {
            quest: "The party must save an NPC from the stomach demiplane of Dalmosh (MM5)"
        },
        {
            quest: "The guild master of the cooper’s guild wants to discredit the owner of a local winery with whom he has had an argument by poisoning his barrels"
        },
        {
            quest: "A local sage/astronomer is convinced that a massive meteor is going to strike the kingdom/city/town"
        },
        {
            quest: "The normally-inert gargoyles atop the temple/castle/mansion have animated and started attacking people who approach the building"
        },
        {
            quest: "A group of bulettes is keeping anyone from entering or leaving the city/town/inn"
        },
        {
            quest: "A doppelganger/changeling serial killer claims the identity of their most recent victim for one week before killing again"
        },
        {
            quest: "A gnome settlement has been overrun by fiendish duergar led by a demon"
        },
        {
            quest: "PCs seek out a powerful dwarven, smith that traded his soul to Asmodeus for unearthly crafting abilities. Before the smith will help the PCs, they must reclaim his soul from the arch devil"
        },
        {
            quest: "The players find/are sent to a city that reflects the entire multiverse scaled down with a neutral inn in the center run by a power caster"
        },
        {
            quest: "The PCs search for a legendary library that when found, has no books only the corpses of long-dead sages and librarian clerics that use speak with dead to obtain the knowledge"
        },
        {
            quest: "The PCs need a party member/NPC raised from the dead but the only cleric powerful enough to do so has recently been turned by a vampire he was hunting"
        },
        {
            quest: "The PCs find/buy/are given a strange bag of holding that has a small pocket dimension inside it where a frightened caster hides. He/she created the bag to hide in and saw that it ended up in the PCs hands to keep it safe"
        },
        {
            quest: "The PCs seek an answer/information from a forgotten bard. When they find him, he is a ghost and he will only help them if they give him peace by finishing his final poem/song/movement"
        },
        {
            quest: "A chaotic good horselord (CAd) has led all the horses in the region/city/town away into the hills to freedom"
        },
        {
            quest: "The huntsman of a local lord/mayor has kidnapped the NPC’s daughter, and only a highly trained tracker can follow the trail and find the girl"
        },
        {
            quest: "An aged and grizzled warrior is going town to town offering his magic sword/shield/armor to any fighter that can best him in honorable combat"
        },
        {
            quest: "After returning from a diplomatic journey, the noble/diplomat/prince/queen is acting strangely. The PCs are asked to look into it only to find that the NPC is a doppelganger/changeling/simulacrum/charmed/possessed"
        },
        {
            quest: "A pair of ethereal filchers are stealing all the curative magic in the area/city/town"
        },
        {
            quest: "The answer/riddle/name/code that the PCs require is etched onto the helm of a massive golem that paces a deadly dungeon"
        },
        {
            quest: "Monthly full moon attacks are blamed on a good lycan, and are actually being carried out by a pack of Moon Rats (MM2)"
        },
        {
            quest: "Summoned Thoqqua threaten to compromise the structural integrity of the city/town/inn/dungeon/ as they melt tunnels through the ground below"
        },
        {
            quest: "Centaur knights (phb2) are running any humanoid from their forest"
        },
        {
            quest: "The PCs are sought by the patrons of a desert land where a despotic temple of cleric charges impossibly high rates for fresh water to people not of their faith"
        },
        {
            quest: "A temple has hired a large number of bards for a festival where music is to be played from sun up until sundown, the only problem is that no one recalls the obscure holiday because it is a ruse to mask the sound of tomb robbers breaking into sealed vaults below the church"
        },
        {
            quest: "A xenophobic elvish lord has begun to arrest non-elves after his daughter eloped with a human"
        },
        {
            quest: "Refugees moving to a non-destroyed town where they might be able to do something other than get killed by soldiers or eaten by monsters."
        },
        {
            quest: "Recover an item of religious significance from the ruins of a church in a now-destroyed village."
        },
        {
            quest: "Deliver a message for a dying soldier, perhaps to his true love."
        },
        {
            quest: "Lay a ghost (or a bunch of them) to rest."
        },
        {
            quest: "Vistaru, Lord of the Mountain, is attacking small towns surrounded by his kingdom in hopes of expanding his army before his assault on the capital."
        },
        {
            quest: "Locals hear chants in the nearby ruins."
        },
        {
            quest: "Someone in the party is secretly a half-wolf"
        },
        {
            quest: "Undead threaten cities across the nation."
        },
        {
            quest: "The queen has been assassinated."
        },
        {
            quest: "A large gang/terrorist organization wages war against a local city."
        },
        {
            quest: "The party comes across a gladiator stadium and is offered money in return for fighting."
        },
        {
            quest: "Dragon blood is needed to cure a plague and your group is sent to collect some."
        },
        {
            quest: "A powerful bard hires your party to retrieve a fabled magical instrument from a dead wizard's coffin."
        },
        {
            quest: "Breaking into a dungeon/room/fortress etc. to rescue or capture a person or artifact."
        },
        {
            quest: "Safari; characters must hunt down a creature."
        },
        {
            quest: "Mysteriously, an entire city has lost its inhabitants overnight."
        },
        {
            quest: "The characters must chase escaping bandits through the countryside/are chased by bandits through the countryside."
        },
        {
            quest: "Discovering a portal to another plane leads to an exploration party."
        },
        {
            quest: "A medusa is constructing a garden of statues using townsfolk."
        },
        {
            quest: "Statues in a large cemetery come to life at night."
        },
        {
            quest: "A lich is raising a massive undead army."
        },
        {
            quest: "The party finds a small cursed object (marble, figurine, ball bearing) which keeps multiplying every day. They have to find a way to destroy it before its carrier gets crushed under the weight."
        },
        {
            quest: "A giant believes that all humans exist for his dining pleasure."
        },
        {
            quest: "A man with one eye is being hanged for \"looking sinister.\""
        },
        {
            quest: "Catacombs have opened beneath the city, guarded by ancient undead who let no one pass."
        },
        {
            quest: "The sacred spear of Lesh has gone missing."
        },
        {
            quest: "There is a black cloaked man in a tavern, though he is dead. Everybody says they saw him walk in just fine."
        },
        {
            quest: "An ogre regards a party member as \"The perfect mate.\""
        },
        {
            quest: "A god's weapon has fallen to earth and now there is a race to obtain it."
        },
        {
            quest: "Suddenly an entire country turns black."
        },
        {
            quest: "A party member discovers a great sword made of red metal that has the properties of adamantine, mithril, silver and cold iron, but can be wielded in one hand as if it were a long sword. What is it? (the godly weapon, perhaps?)"
        },
        {
            quest: "A party member's armor comes to life and tries to leave."
        },
        {
            quest: "A tribe of trolls is trying to make peace with a nearby village."
        },
        {
            quest: "A mountain village is plagued by unexplicable earthquakes. It's actually the wrath of a Greater Earth Elemental, who had an eye ripped out by a clueless miner who thought it was a normal gem."
        },
        {
            quest: "The party meets several groups of travelers headed in the same direction, claiming to be going to something called \"The Games.\""
        },
        {
            quest: "An earthquake that leaves magical glowing fissures in the ground shakes directly beneath a kingdom's capital."
        },
        {
            quest: "A previously righteous and good god suddenly calls genocide on all that are not his followers."
        },
        {
            quest: "A paladin is after a party member because of a case of mistaken identity."
        },
        {
            quest: "A member of a party of adventurers is on the run from the law but the Duke has asked to see the party. The adventurer is welcome but the guards do no know this and the character must be smuggled into the city."
        },
        {
            quest: "A druid is accused of killing other druids."
        },
        {
            quest: "A very superstitious village is holding a witch trial, and a party member is mistaken for a famous paladin and called to act as the judge."
        },
        {
            quest: "A hidden pathway in an abandoned house leads to a lair of a terrible Demon. The Demon keeps \"slave girls\" where a friend of the party is, but the \"slave girls\" are secretly Demons in disguise."
        },
        {
            quest: "One of the party members is offered a slave girl as a reward for a job well done. Another character - e.g. a Paladin - finds this outrageous and demands he let her go."
        },
        {
            quest: "The party and some others are raiding a city when they are captured and forced to entertain the king in the gladiator's arena."
        },
        {
            quest: "A large tribe of Orcs are planning a raid on an Imperial city."
        },
        {
            quest: "A Mage summons a demon but is unable to control it and is possessed."
        },
        {
            quest: "The world is hit by an asteroid that mutates anyone that touches it."
        },
        {
            quest: "A large egg of some sort is discovered and the Orcs are coming for it. Will the characters try to hatch it?"
        },
        {
            quest: "A thick plague-inducing fog is slowly covering the countryside."
        },
        {
            quest: "A Paladin goes mad, turning evil while still thinking he is good."
        },
        {
            quest: "The characters are shrunk by an evil wizard and have to find a way to reverse the spell."
        },
        {
            quest: "An illusion of peace and tranquility is projected over a town. The characters must escape and discover what is really happening."
        },
        {
            quest: "The God of Time punishes a town/city/village for not worshiping him, making everything happen out of sequence."
        },
        {
            quest: "All the local wild life is killing people; are the Druids to blame?"
        },
        {
            quest: "Everyone is turned into monsters and the characters are run out of town."
        },
        {
            quest: "The characters are framed for a genocide they didn't cause."
        },
        {
            quest: "While crossing a sea, the boat is sunk by a monster of some variety. The characters are saved by mer-folk but trapped on a deserted island miles from the mainland."
        },
        {
            quest: "A dragon captures the party and takes them to her mountain lair to feed to her wyrmlings."
        },
        {
            quest: "The characters complete a job but their employer doesn't want to pay them."
        },
        {
            quest: "Monsters are attacking a castle; the party must prevent the monsters from taking the castle."
        },
        {
            quest: "A large rock worm is attacking a large city. One of the characters must kill the rock worm before the city goes under."
        },
        {
            quest: "A time warp descends upon an isolated village, setting everyone and everything back a century into the past."
        },
        {
            quest: "Several of the king's tax collectors have disappeared after traveling to a particularly dangerous area."
        },
        {
            quest: "A good cleric tries to establish a temple to his god in a hostile city, hoping to gradually convert the populace."
        },
        {
            quest: "Suspicion arises that the inhabitants of a town are gradually being replaced by impostors."
        },
        {
            quest: "Animals within a particular area are becoming monstrous and mutated."
        },
        {
            quest: "Ships are disappearing within a five-mile radius of ocean."
        },
        {
            quest: "A phantom river barge sails past a small town once per month, leaving malevolent, supernatural occurrences in its wake."
        },
        {
            quest: "A local ruler is suspected of making a pact with a powerful devil or demon."
        },
        {
            quest: "The Assassin's Guild is planning to kill the mayor."
        },
        {
            quest: "A witch's curse is causing a farmer's crops and livestock to die."
        },
        {
            quest: "A mysterious curse is settling on town after town, rendering almost all forms of magic ineffective - e.g. ice and wind magic - while greatly empowering any who make use of Black or Demonic magic."
        },
        {
            quest: "A band of clerics is robbing the graves at a large cemetery, creating an army of undead creatures."
        },
        {
            quest: "A secret vigilante society is inflicting barbaric punishments on \"evil-doers.\""
        },
        {
            quest: "The daughter of a nobleman has run off with a seedy, disreputable commoner."
        },
        {
            quest: "A small community of neutrally-aligned Orcs tries to convince inhabitants of a nearby town that they mean them no harm."
        },
        {
            quest: "A formerly good cleric is suspected of secretly worshiping an evil god."
        },
        {
            quest: "About to be hanged for his crimes, a powerful bandit leader is sprung from his prison by his cohorts."
        },
        {
            quest: "Kobolds occupy an abandoned mine, using it as a base from which to launch raids on Human settlements."
        },
        {
            quest: "A Sorceress has lost her unique familiar and all efforts so far to reveal the creature's whereabouts have been fruitless."
        },
        {
            quest: "The party is sent to deliver the ransom for a woman, who is being held by a gang of brigands."
        },
        {
            quest: "The king's ambassador has disappeared while en route to a hostile country and is suspected of being a traitor."
        },
        {
            quest: "A megalomaniacal Duke has sent his minions in search of a weapon that would make him nearly invincible."
        },
        {
            quest: "The king, a just, good ruler, is somehow being manipulated by his new adviser."
        },
        {
            quest: "A series of murders are being committed with the MO of an executed killer."
        },
        {
            quest: "Clerics are stymied as to how to remove a bizarre desecration that has fallen upon their temple."
        },
        {
            quest: "Strange, glowing runes appear on the door of the town hall, forming a riddle."
        },
        {
            quest: "A local farmer is suspected of breeding hell hounds, after several of the beasts were spotted killing the cattle of other farmers."
        },
        {
            quest: "A Kraken is destroying any ships that try to enter or leave a city's port."
        },
        {
            quest: "During a break from traveling in a big city, the party wakes up to find all of the city's inhabitants missing and the gate locked..."
        },
        {
            quest: "A growing maelstrom near a rocky coast is sucking ships down beneath the waves."
        },
        {
            quest: "The party members are hired as marshals to escort a powerful Fallen Paladin back to the city, where he is to stand trial."
        },
        {
            quest: "Magical droughts are descending upon an increasing number of communities."
        },
        {
            quest: "The king sends the party to parlay with an adjacent kingdom contemplating war."
        },
        {
            quest: "Villagers are fed up with a group of troublesome mercenaries."
        },
        {
            quest: "Dryads fight to preserve their forest against an encroaching Human settlement."
        },
        {
            quest: "A cleric asks for your help to rehabilitate a recently caught gang of thieves."
        },
        {
            quest: "Messengers must travel through a haunted swamp to deliver a timely warning to the Queen."
        },
        {
            quest: "Members of a coven have infiltrated the city's populace and are working their black magic."
        },
        {
            quest: "A magical fire in town resists all efforts to extinguish it."
        },
        {
            quest: "An ancient artifact must be retrieved from the bottom of the sea."
        },
        {
            quest: "A druid is framing a werewolf by committing crimes while in the form of a wolf."
        },
        {
            quest: "Local bandits are far too well informed about trade caravans. A trade post keeper is suspected of being an informant."
        },
        {
            quest: "A small town is being raided every few weeks by an unusually well organized group of Goblins and Hobgoblins. It turns out that a group of Goblin Shaman ordered these raids in order to draw out the best soldiers and mercenaries in the region before unleashing a massive army of Goblins, Hobgoblins, Bugbears, Ogres and Trolls."
        },
        {
            quest: "A merchant comes to the characters to ask them to retrieve a chest that was stolen by furbolgs. When the group finds the furbolgs, they are told the merchant had been hiring mercenaries to hunt and kill them so he could trade their pelts."
        },
        {
            quest: "A cursed orb serves to reduce intelligent lifeforms into feral states and enraging any animals that come upon it."
        },
        {
            quest: "A young fey must prank the group to be accepted by or meet the dare of a peer group and the characters may not realize it is a classic scenario of peer pressure."
        },
        {
            quest: "A magic ring is found that offers complete immunity to an element, but any party member within a certain range experiences temporary random alterations in their own items."
        },
        {
            quest: "A water elemental demands the party drop a coin in the creek or river in order to be allowed to cross a bridge."
        },
        {
            quest: "A prideful orc is challenged by his friends to arm wrestle the strongest member of the group. From the looks of things they aren't giving you a choice, and they are forcing a wager."
        },
        {
            quest: "The party was once the elite task force for the King only to find out from a Duke they were sent to kill that the King is working for dark forces, gathering the shards of a crystal which his dark master is trapped in. They must now run as outlaws and try to stop this evil being from rising again."
        },
        {
            quest: "A wyvern has made the city gatehouse its home. A siege is on the horizon and the gatehouse must be operational as soon as possible!"
        },
        {
            quest: "A skilled warrior joins forces with the party, but a recurring memory disorder leads her to wake up one day believing she has been captured."
        },
        {
            quest: "Distinct armor recently looted by the party turns out to have once belonged to the father of a local hero, who identifies it and confronts the party."
        },
        {
            quest: "A powerful arachnomancer attempts to conquer the area with his spider minions; the party is sent to kill him."
        },
        {
            quest: "A cabal of powerful golem-builders has sent a messenger to a Kingdom with a threat; submit to their demands or they will unleash their colossi upon the Kingdom."
        },
        {
            quest: "Entering a flooded cave in a boat, the party members find themselves in the company of a paladin and a warlock. The situation soon begins to get out of hand."
        },
        {
            quest: "Each locked in a small cell with a single tiny window, fed the barest amounts of bread and water and deprived of their equipment, the party is held captive."
        },
        {
            quest: "A cursed, animated rope tied itself around the wrists of two men who hate each other, forcing them to stay close."
        },
        {
            quest: "The party must travel the globe searching for the pieces of an ancient set of armor."
        },
        {
            quest: "Soon after looking into an enchanted mirror, the characters meet shadowy copies of themselves."
        },
        {
            quest: "The person the group was sent to meet has been replaced by a doppelganger."
        },
        {
            quest: "A powerful Demon offers each of the party members their greatest wish. This is too good to be true."
        },
        {
            quest: "An Sorcerer seeks to uncover a massive ancient construct with world breaking power. The party is sent by the King to stop him. At the end the group must choose whether they should destroy the construction or hand it over to the King."
        },
        {
            quest: "The chosen Queen of (race or sub-type) has arrived! (May have protection and mind-control spells, etc.) She has more followers than one might expect for such a newly declared monarch. All her kin gather to serve her and reclaim their rightful place in the world."
        },
        {
            quest: "A Witch had turned the village children into scarecrows."
        },
        {
            quest: "While exploring an old rundown castle, the group accidentally releases an ancient evil and, in the process, each member is possessed by a Demon. While trying to find a way to stop the creature they released from destroying all they know, they must each wage their own personal and internal war with the Demon whom possessed them to prevent the loss of their soul."
        },
        {
            quest: "A new Outer Plane has been discovered, that of the bleak, dead wastes of Scriothia."
        },
        {
            quest: "The group is thrown into a game where they must find weapons and armor. They start with just the average clothing and no supplies. But they aren't the only ones in the game. Happy hunting!"
        },
        {
            quest: "The party is sent to a fort to help defend it from (monster of choice)."
        },
        {
            quest: "A terrible ogre has been treated with sedatives by the village shaman. But the drugs ran out and now the ogre is suffering from withdrawal. The party must provide him with counseling and find ways to treat his anxiety and dizziness before he smashes everyone in the village."
        },
        {
            quest: "The heroes seek rather fortune, fame, or power (depending on the characters or individuals). They discover a job that pays steadily and promises a big reward at the end, hired adventurers aboard a captain's ship (their boss) and is sent out to discover new lands with mysteries waiting against a rival explorer organization."
        },
        {
            quest: "The party arrives to new land in binds, ready to be delivered as slaves."
        },
        {
            quest: "The party is kidnapped by a great wyrm and tossed in the deepest layer of its dungeon."
        },
        {
            quest: "The party finds themselves facing an impossible foe (Minor God/Elder Dragon/etc) who serves an even greater power and is attempting to usher in the end of all they know by bringing his/her master forth. The party must find clues to the locations of ancient tools used to stop the last attempt hundreds of years before, before those same tools are used by their enemy who is also searching."
        },
        {
            quest: "One of the party has amnesia and is in reality a powerful being who is a natural enemy of the group. Will the party remain friends when the memories return? The party members true identity starts to reveal itself as the member starts displaying abilities they should not have. (Works best when you choose a player's character and you don't tell the player)"
        },
        {
            quest: "The party is a group of monsters! Gaming from a different point of view!"
        },
        {
            quest: "A wild mage in the area talks in his sleep... random craziness happens whenever he goes to bed."
        },
        {
            quest: "The party is constantly being hassled by a person/company/pixie that is insistent on collecting a very small debt and will not take anything but exact payment."
        },
        {
            quest: "A little girl is in reality a horribly powerful vampire. She wants to play..."
        },
        {
            quest: "The party is sent to deliver a package to a private residence, it turns out to be a humiliating task (think pizza delivery). Will the party put up with the insult?"
        },
        {
            quest: "A haunted giant tree's inhabitant, a Sage, has his powers tinkered with and accidentally teleports the party to the top of it. Can the party make it out?"
        },
        {
            quest: "Your party is sent for a peace talk between dwarven clans, but things get messy."
        },
        {
            quest: "The city is being held under siege by monsters; possibly Voadkyn. These Voadkyn wish “The Sacred”; if \"The Sacred” is returned, the city will be left in peace. If not, the city will be ripped apart piece by piece and all within it killed until “The Sacred” is located. The monsters will not react to questions like, “What is ‘The Sacred’?” except by looking stupidly at our adventurers and repeating again: “It is ‘The Sacred’”. The party mus discover what \"The Sacred\" is and return it to the Monsters to save the city from certain doom."
        },
        {
            quest: "Searching for a person (who doesn’t want to be found) on behalf of a well-to-do citizen."
        },
        {
            quest: "An ancient map is found showing locations of 5 ancient cities."
        },
        {
            quest: "A Sphere of Annihilation has appeared. The party must seek out and use the Talisman of the Sphere to prevent the end of all."
        },
        {
            quest: "The party must choose sides or negotiate in a conflict/revolt between overtaxed or oppressed people and their tyrannical rulers."
        },
        {
            quest: "A member of the party receives an inheritance which includes developed land (keep, castle, tower, etc). Upon further investigation, the party finds it inhabited..."
        },
        {
            quest: "Every night, fey creatures from a nearby grove kidnap a person in their sleep and force them to take part in a drinking contest."
        },
        {
            quest: "Rumours of disappearing ships creates food shortages in a local fishing town. The party investigates..."
        },
        {
            quest: "A strange creature is hiding within one of the players and the others must choose to help or to Kill..."
        },
        {
            quest: "The Dead have risen and, while not attacking the nearby towns people, they refuse to let anyone pass in order to protect their still-living loved ones from something that now inhabits the graveyard..."
        },
        {
            quest: "A curse has been set to kill all animals in the country..."
        },
        {
            quest: "An inn keeper leads you to a quest where you must kill a necromancer but it turns out the inn keeper was the necromancer."
        },
        {
            quest: "A dwarven embassy let's in peasants to increase the city population but they won't let anyone leave."
        },
        {
            quest: "The party meets a crazed horse breeder who kills travelers and feeds them to his horses."
        },
        {
            quest: "A small village has a conflict between two chefs on what is the better way to prepare a famous dish in the town. It has the village split into two different sides."
        },
        {
            quest: "A potent curse placed on a pious priestess has a succubus manifest through her body at inopportune times. Each is conscious of what the other does when she's controlling the body, and while they've gone over the initial shock, their differences always lead them to argue and struggle for control."
        },
        {
            quest: "There is a cult in a city that has 100 chickens and the soul of a great hero is trapped in one of the chickens and they don't know which one it is so they worship all of them."
        },
        {
            quest: "There is an underground group of criminals that is branched into separate groups with the leader of each branch having a significant ring and once all gathered together it was unlocked their hidden magical properties."
        },
        {
            quest: "A wise old mage has gone blind and requires you to create a potion reversing the spell on him by creating a potion with him describing what each ingredient looks like."
        },
        {
            quest: "There are five shards of a legendary dagger hidden across the land and they are well hidden. If the party gathers them all they get a legendary prize."
        },
        {
            quest: "A dead man rises from his grave and, oblivious to his own death, goes back to living with his family."
        },
        {
            quest: "A large group of wild animals attacks a population with strategy. They are being lead by a druid in animal form."
        },
        {
            quest: "The town's local hero has gone missing hunting kobolds in the mine."
        },
        {
            quest: "Neighboring kingdoms on opposite sides of a mountain are about to go to war. The only way to stop it is to escort the emissary to the other kingdom - through the mountain passage."
        },
        {
            quest: "The party notices a spider sitting under a peculiar web near a temple of Lolth: its lines read \"I have been cursed for desecrating the temple. Find my Druid son, he can turn me back to normal\""
        },
        {
            quest: "Three Mul from Athas stumble through a portal, and are deposited into a city on the Sword Coast. They are baffled by the differences between the two worlds."
        },
        {
            quest: "A knight asks you to capture a relatively weak monster and sic it on his kind hearted but cowardly squire, hoping he will toughen up from the fight."
        },
        {
            quest: "You are trapped in a small cell for days on end. You are not told why."
        },
        {
            quest: "A riot has erupted on an island, government aid is nowhere to be seen, and gangs are feuding to claim turf and riches. Will the party be the virtuous heroes trying to save innocents and re-enstablish order, lend their strength to one of the factions, or just do their own thing?"
        },
        {
            quest: "Various people have been found drained of all their blood recently. A culprit is caught, but while they confess to being a vampire they claim to be innocent."
        },
        {
            quest: "A succubus is \"haunting\" the dreams of willing victims in exchange for money and favors."
        },
        {
            quest: "Two feuding demons have decided to settle their differences by picking two groups of mortals and directing them like chess pieces."
        },
        {
            quest: "Animals and monsters in an area have gained sentience and the ability to speak. They're mostly friendly, but hunting is an important part of the region's economy and the local lord will have none of it."
        },
        {
            quest: "A fountain that spouts water which heals all sickness has erupted from the ground. Those who drink from it become dependent and violent and soon start killing anyone who approaches the font."
        },
        {
            quest: "A mysterious assassin is on the loose. The only clue is their arrows, which have a distinctive design and always strike the victims through the heart killing them instantly."
        },
        {
            quest: "A civilization which has been cut off for centuries offers to pay you handsomely if you bring them pieces of modern culture and technology."
        },
        {
            quest: "The party is chasing after a certain monster around the continent"
        },
        {
            quest: "After a string a recent freak earthquakes, a ravine opens up near a small, remote village, with what appears to be a large fortress made entirely of dark stone at the bottom."
        },
        {
            quest: "One of the party members is secretly a vampire and is attempting to hide it from the local authorities."
        },
        {
            quest: "The inhabitants of a local village all vanish over night with no trace and no sign of struggle, the party is hired by a family member of a missing villager to investigate."
        },
        {
            quest: "Your party members are champions of the land for different reasons, but they don't remember why, and they all meet at a local tavern and discover each other, so they go questing to find out their past starting at square one, and their champion's gear and their memories are locked away in the final dungeon after each party member completes a trial built around thier character"
        },
        {
            quest: "The town guard think the party's mage is responsible for a magical duel fought atop the cathedral roof last night. Can the party find the real culprit before they are hunted down themselves? Do they dare, knowing that the criminal dispatched his last opponent with a frighteningly high level spell?"
        },
        {
            quest: "The party is taken aside to the guardhouse upon first entering the city. They are told the guard captain wants to speak with them. When the captain arrives, he attempts to shake down the party under pain of death."
        },
        {
            quest: "A woman falls into the street from the second story window in front of the party and dies on impact. Soon after, a PC notices a hooded figure skillfully dropping, uninjured, from another second story window facing into the alley. The figure quickly disappears into a maze of side streets."
        },
        {
            quest: "The party is invited to a manor by an important socialite for a potential job opportunity. When they arrive, they are told to wait in an empty room. Soon after entering the room, the party realizes they are locked in with a magical ward."
        },
        {
            quest: "The party stops to witness a funeral procession for a crime lord. Soon after passing, the party hears an explosion and sees a gigantic smoking fireball rise into the sky a block away."
        },
        {
            quest: "In need of food and shelter from the elements (or from enemies), the characters come to a ruined tower full of revelling adventurers. But the Rules of the House say no one may enter until they have entertained the rabble with a rousing tale."
        },
        {
            quest: "As you step out of the tavern, a disheveled girl smashes into you. \"Wilkenson's dog is loose again!\" she exclaims as she attempts to hide behind you. You turn back in the direction she came to see a metal construct resembling a dog charging toward you."
        },
        {
            quest: "The PCs spot a pregnant woman walking through the bazaar. As she passes the baker's stall she quickly grabs a loaf of bread and keeps walking, favouring one of the PCs with a wink as she goes. Is she a thief or the wife of the store owner?"
        },
        {
            quest: "The PCs are resting in their inn room when suddenly the door bursts open. A well-armed man with weapon drawn storms in and says, \"Don't move, I've...crap, wrong room.\" The intruder then quickly exits."
        },
        {
            quest: "The PCs find the item they have been seeking in the marketplace. As the purchase is completed and they are about to leave, a stranger rushes up to the merchant shouting, \"I know you have it Balthasar, and I want my back now!\""
        },
        {
            quest: "The inhabitants of a large building start a war against an identical neighboring building. At the beginning it's because they are accused of stealing their water, but in fact they have held many petty grudges for years and this way they can vent them out violently. The party is hired by fearful authorities to stop the revolt that threatens to scale into a civil war, but one of the tenants in the rebel building is a PC's distant relative. Does the party intervene impartially, risking a family feud or do they help the relative exact revenge against his neighbors?"
        },
        {
            quest: "The party is mistaken by a wealthy man as carriage caretakers in a shantytown neighborhood. He hands them money to protect his vehicle. The legitimate caretakers challenge the PCs and try to steal the wealthy wagon. Does the party protect the rich man's vehicle or do they leave the locals to do as they please, risking later persecution by the noble client?"
        },
        {
            quest: "13. The PCs arrive at the inn and find a large group (at least three times their number) of mercenaries leaving for the jail where they plan to execute all the prisoners. The party is connected to one of the inmates (an old, recurrent, but not particularly hated enemy, maybe they put him behind bars in the first place) and wishes him to remain alive for some reason. Do they face the killers, race to save the prisoner first, warn the prisoners or set them all free?"
        },
        {
            quest: "The city has a zoo filled with wondrous and dangerous creatures brought from far places. Just recently, some of the creatures escaped and now there is a royal reward for recovering the rare animals unharmed. How can this be done?"
        },
        {
            quest: "A sector of the city lies under quarantine after an outbreak of a mysterious fever. The party is being kept inside, and one of its members is starting to show symptoms of the illness. Do they try to escape, risking further contagion, or do they try to find a cure from the inside?"
        },
        {
            quest: "The PCs are being chased by a criminal party through the streets of a city that celebrates its anniversary with improvised shows over plazas. They get caught in the middle of a show, in front of a demanding audience. The only way the mob will let them leave is by doing a successful artistic performance."
        },
        {
            quest: "A gypsy intercepts the most charismatic member of the party and tells him of a vision she had. She predicts the party member will find a beautiful person in this city and it will be the love of his life. She provides no further details. Later on, a beautiful person flirts with the character."
        },
        {
            quest: "One member of the party is seen carrying an exotic weapon and the authority of the local museum is told about it. This museum curator has been an adventurer and masters some kind of whip weapon. He prepares an ambush to steal the exotic weapon, yelling at the PCs on sight, \"That belongs in a museum!\""
        },
        {
            quest: "The Tourist. The PCs have messed up (possibly been framed) in the eyes of the King and have been apprehended. The King will release the party, if they allow a wealthy, influential and obese merchant to come along on a dungeon delve, where there are sure to be many tight spaces."
        },
        {
            quest: "Medieval Proliferation. Two blacksmiths are in competition to create better melee weapons for the King's army and only one can win the contract. One of the blacksmiths approaches the PCs to try the weapons and plead their virtues to the King. He also claims his competitors are playing dirty."
        },
        {
            quest: "Kindergarten Magic. Street urchins are rumored to have special powers. A representative of the Magicians Guild approaches your party to investigate. In reality, they are learning magic from an unknown source. The children have less inhibition and magical control, but have much more mana and capability of replenishing mana, making them dangerous magic users."
        },
        {
            quest: "As the PCs turn a corner, a law enforcement officer slams into them at breakneck speed. As they help him up, they notice he is covered in blood with grievous wounds. As he dies in their arms, he begs them to find his wife and relay his sincerest love and apologies."
        },
        {
            quest: "\"Psst, do you want to buy a crystal ball that really works? It's cheap!\" says a shady character while sneaking up on the PCs from an alley. The price really is cheap, and you might even lead the PCs to believe the ball works when they try to use it for petty things, but it is unreliable, maybe even cursed. And the big problem is that one or more groups of NPCs badly want this crystal ball."
        },
        {
            quest: "The PCs witness a break-in at a shop. If they intervene, then right at the end of the encounter the shop owner shows up and accuses the PCs of breaking in and causing damage in his shop. He immediately calls for the guard."
        },
        {
            quest: "The party runs over or mortally injures a shepherd's goat by accident. After apologizing, the shepherd starts demanding money equivalent to three or four times what the goat's value is. Then, as things settle down, another shepherd comes up and displays another goat injured. City guards start to show an interest in the event as well...."
        },
        {
            quest: "A merchant discovers the PCs are buying something and comes to give them a more expensive offer for something of lesser quality. However, the merchant insists this is a good deal as his cousin works for the town hall and will cause great grief to the party if they refuse his offer."
        },
        {
            quest: "Two speeding coaches collide, leaving a bloody scene and angry families. The road is blocked, and the guards seem disinterested in assisting with either clearing the road or arbitrating between the families."
        },
        {
            quest: "Townspeople come up to the party and blame them for the local infestation of evil. If the PCs weren't there, so the argument goes, the evil would go elsewhere. A crowd gathers in support of their fellow citizens."
        },
        {
            quest: "There is but one accepted religion in town. What about the party cleric who serves what is here deemed a false god?"
        },
        {
            quest: "Young lovers have taken the PCs' room as refuge to meet in. They are sought after by families that do not approve."
        },
        {
            quest: "Injustice breaks out as revolution against a tyrant. The PCs are there to see the first flames, and may play a pivotal role in either supporting or crushing the uprising."
        },
        {
            quest: "A fast ship in the bay is bombarding the helpless port with siege engines. It's out of range for the locals to deal with, and possibly not alone."
        },
        {
            quest: "The PCs hear shrieks from a dark alley where a young maiden just went. Under the full moon, she is painfully turning into a werewolf for the first time."
        },
        {
            quest: "There have long been rumours of the cemetery being desecrated by someone stealing the corpses. One night the PCs chance upon the necromancer walking home with newly animated undead."
        },
        {
            quest: "One or more PCs are short-changed by a merchant who considers himself untouchable. Whether he truly is...."
        },
        {
            quest: "An NPC seeks the protection of the PCs. To grant it makes her enemies the PCs' enemies, and gives them the responsibility to protect a high-profile, fragile person who can't or won't leave town."
        },
        {
            quest: "PCs are marked by a guild of thieves or assassins for a contest. Low-skill, would-be guild members keep targeting the party with attempts on their health or goods."
        },
        {
            quest: "The spoiled child of a noble finds a PC has something he just *has to have*. The noble's staff does what it can to acquire it, by nearly any means necessary."
        },
        {
            quest: "The appearance of the PCs breaks the balance of a cold war between two rival mages. Each wishes their support to destroy the other, and fears that the other is successful in recruiting the PCs."
        },
        {
            quest: "A string of building construction accidents has occurred lately throughout the city. Fortunately, no one's been seriously hurt, but the accidents are increasing in size and damage. The local guild has put up flyers asking for help in solving their problem."
        },
        {
            quest: "As the PCs walk across a bridge over the river that cuts through town, they notice a couple of young boys standing near the edge of the bridge. They each have a large rock in their hands, and are watching one of the approaching river boats with smiles on their faces. As the boat gets closer, one of the boys raises his rock as if he is going to drop it."
        },
        {
            quest: "While travelling down by the docks, a ship captain waves the PCs over to talk. He's in a bind, he explains, saying that some of his dock workers didn't show up for work and he has a lot of cargo to load onto his ship so he can make the tide. The captain and crew look disreputable, and nervous, but he is willing to pay well for the work."
        },
        {
            quest: "The PCs come upon a sobbing woman holding a teenage boy who looks to have been severely beaten. If the PCs ask the woman if they can help, she explains her youngest son was beaten up by a gang of toughs. Of more immediate danger though, is that her oldest son has gone off to exact revenge on them, and she's afraid of what they will do to him."
        },
        {
            quest: "Down the dimly lit alley, two guards can be seen beating a kneeling man. One rips a coin purse from the kneeling man's belt and says, \"Don't be late next month, old man.\""
        },
        {
            quest: "Storm clouds hang heavy, and thick cold rain pounds down as it has for hours. Gutters gurgle, and the sewers moan as if carrying some great weight. From a drain, a swarm of thousands of black rats burst out and charge the PCs."
        },
        {
            quest: "As the PCs are travelling from one district to another they are confronted by a traffic jam. A building has fallen in and the umber hulk responsible is hiding, waiting for a snack to move near it."
        },
        {
            quest: "The PCs are hired as security for the auction of a mysterious artifact. While stopping repeated theft and auction-rigging attempts, they eventually learn of its evil nature and have to debate breaking their contract and destroying the thing while getting away with it."
        },
        {
            quest: "Someone falls out the window of a high building. It wasn't suicide as he had his hands and feet bound together and three large sacks of gold tied around his neck. What will be more important, the murder or the money?"
        },
        {
            quest: "A rich man walks through a bad part of town with obvious riches and money. If mugged, he gives it willingly. He has been doing this for the last three days."
        },
        {
            quest: "A small animal brushes past the PCs as they walk along a dock. After it jumps into the water, a group of sailors rushes onto the dock, firing crossbows and flinging harpoons at the ripples the animal left in the water. While the sailors curse and fire the last few missiles they have, one of the PCs notices the animal left a muddy gem on the top of her shoe."
        }
    ]
};

module.exports = quest_generator;
