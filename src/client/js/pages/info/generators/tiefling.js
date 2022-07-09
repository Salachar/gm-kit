/*
    Names froms:
        - Player Handbook 5e
        - http://brandondraga.tumblr.com/post/66804468075/chris-perkins-npc-name-list
*/

const {
    randomFromList
} = Lib.helpers;

const tiefling_names = {
    title: 'Tiefling',

    generate: function (gender_names) {
        return randomFromList(gender_names) + ' ' + randomFromList(this.surnames);
    },

    male: [
        'Akmenos',
        'Amnon',
        'Ankhus',
        'Arkadi',
        'Armarius',
        'Armillius',
        'Archidius',
        'Balmoloch',
        'Barakas',
        'Calderax',
        'Cavian',
        'Cenereth',
        'Chorum',
        'Corynax',
        'Dacian',
        'Daelius',
        'Damaceus',
        'Damakos',
        'Decimeth',
        'Demedor',
        'Demerian',
        'Dynachus',
        'Ekemon',
        'Grassus',
        'Halius',
        'Heleph',
        'Iados',
        'Incirion',
        'Kairon',
        'Kalaradian',
        'Kamien',
        'Kazimir',
        'Kzandro',
        'Leucis',
        'Machem',
        'Maetheus',
        'Malfias',
        'Marchion',
        'Melech',
        'Menerus',
        'Morthos',
        'Namazeus',
        'Nensis',
        'Pelaios',
        'Prismeus',
        'Pyranikus',
        'Razortail',
        'Sejanus',
        'Severian',
        'Skamos',
        'Suffer',
        'Syken',
        'Tarkus',
        'Therai',
        'Vaius',
        'Xerek',
        'Zeth',
        'Zevon'
    ],

    female: [
        'Affyria',
        'Akta',
        'Bryseis',
        'Cataclysmia',
        'Damaia',
        'Domitia',
        'Dorethau',
        'Ea',
        'Excellence',
        'Felicity',
        'Hacari',
        'Iritra',
        'Kallista',
        'Lachira',
        'Lerissa',
        'Levatra',
        'Makaria',
        'Mecretia',
        'Milvia',
        'Nemeia',
        'Nericia',
        'Orianna',
        'Phelaia',
        'Precious',
        'Rain',
        'Revelation',
        'Rieta',
        'Samantia',
        'Sunshine',
        'Tenerife',
        'Traya',
        'Velavia',
        'Zaidi',
        'Zethaya'
    ],

    surnames: [
        'Amarzian',
        'Carnago',
        'Domarien',
        'Iscitan',
        'Meluzan',
        'Menetrian',
        'Paradas',
        'Romazi',
        'Sarzan',
        'Serechor',
        'Shadowhorn',
        'Szereban',
        'Torzalan',
        'Trelenus',
        'Trevethor',
        'Tryphon',
        'Vadu',
        'Vrago'
    ]
};

module.exports = tiefling_names;
