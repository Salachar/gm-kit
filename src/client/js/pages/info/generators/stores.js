const {
    createElement
} = Lib.helpers;

const {
    randomFromList
} = require('../helpers');

const store_generator = {
    title: "Stores",
    type: "stores",

    init: function (container) {
        Object.keys(this.stores).forEach((store) => {
            const store_type = this.stores[store];
            createElement('div', 'info_button button', {
                html: store_type.title,
                events: {
                    click: (e) => {
                        for (var i = 0; i < container.amount_per_click; ++i) {
                            container.addResult({
                                type: store_type.title,
                                value: this.generate(store_type)
                            });
                        }
                    }
                },
                addTo: container.el_buttons
            });
        })
    },

    generate: function (store) {
        return randomFromList(store.names);
    },

    stores: {
        blacksmith: {
            title: "Blacksmith",
            names: [
                "Gnome Depot",
                "Balthar's Blunts & Blades",
                "Bloodbath and Beyond",
                "Rusty's Discount Sword Emporium",
                "Hammer Time",
                "Curious Forge",
                "Mr. & Mrs. Smith",
                "Metal Matters",
                "Kronk's Krushers and Kleavers (Orc Blacksmith)",
                "The Fancy Forge",
                "The Big Hammer",
                "The Block and Anvil",
                "The Iron Skillet",
                "Volcano Forge Services",
                "Magma Man",
            ]
        },
        fletcher: {
            title: "Fletcher",
            names: [
                "The Snapped String",
                "Straight Arrow Co.",
                "Target",
                "Aster's Winch",
                "The Pointy End",
                "The Oak and Sinew",
                "The Bound Accuracy (one of my favorites)",
                "The True Shot",
                "The Hunter's Mark",
                "Swish 'n' Stab",
                "Featherfall Emporium",
                "Straighten Arrow Path",
            ]
        },
        leatherworker: {
            title: "Leatherworker",
            names: [
                "The Crying Cow",
                "King's Cow Leathers",
                "Tan My Hide Leather Emporium",
                "Bracers and Bootstraps",
                "Now You Dye",
                "The Hide Hide",
                "Big Tanner",
                "What's Left of the Cow",
            ]
        },
        general_store: {
            title: "General Store",
            names: [
                "Octavius's Outrageous Oddities",
                "Trinkets and Baubles",
                "General Nonsense",
                "Wild Widget's Wondrous Warehouse",
                "Harkin's Dry Goods",
                "The Big Deal Storehouse",
                "Crow's Nest Fishing and Tackle",
                "The Ration Shoppe",
                "General Goode's General Goods",
                "Masterwork Faster Work",
                "Chimera Supplies",
                "The One Stop Shock Shop",
            ]
        },
        alchemist: {
            title: "Potion Shop/Alchemist",
            names: [
                "Every Day Elixirs",
                "Victorious Secret",
                "Bottle Shock",
                "The Secret Ingredient",
                "Rosie's Cauldron",
                "The Green Thumb Apothecary and Herbalist",
                "Spoon Full of Sugar",
                "Boils and Bubbles",
                "The Triple Titration Triage",
                "Puffery and the Magic Dragon Apothecary",
            ]
        },
        arcane: {
            title: "Arcane Shop",
            names: [
                "Wizards of the Coast",
                "Discount Enchanters",
                "Mages for Ages",
                "Arcana Farmers",
                "The Blind Witch",
                "The Fair Wizard",
                "The Strange Incantation",
                "Arto's Arcane Assemblage",
                "How do you Spell-It",
                "The Magic Circle",
                "Abi-Dalzim's Horny Wildlings Shoppe",
                "True Resurrection Depot",
                "Tomes Aplenty",
            ]
        },
        stonemason: {
            title: "Stonemason",
            names: [
                "Wall-Mart",
                "Rocks and Rubble",
                "Careful Carvers",
                "Hammer and Chisel Stoneworks",
                "GRANITES AND MALACHITE",
                "BAM BAM'S HAMMER SHOP",
                "ROCK DEALS: WE SELL ROCKS",
            ]
        },
        pets: {
            title: "Pet Shop",
            names: [
                "Bugs, Bears, and Beyond",
                "Unfamiliar Familiars",
                "For Sale: Ass, Never Ridden",
                "Familiars for Families",
                "Phantasmal Force Pet Shop: We're A Legitimate Business That Sells Real Animals",
            ]
        },
        food: {
            title: "Food",
            names: [
                "Hot Buns Bakery",
                "Sweets by Zap and Colby",
                "Dee's Nuts",
                "Slice of Life",
                "Behir Bakery",
                "Cambion Cafe",
            ]
        }
    }
};

module.exports = store_generator;
