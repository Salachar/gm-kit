/*
    Names froms:
        - Player Handbook 5e
        - http://brandondraga.tumblr.com/post/66804468075/chris-perkins-npc-name-list
*/

const {
    percentage,
    randomFromList
} = Lib.helpers;

const halforc_names = {
    title: 'Half Orc',

    generate: function (gender_names) {
        let name = randomFromList(gender_names);
        if (percentage() < 5) {
            name += (' ' + randomFromList(this.surnames));
        }
        return name;
    },

    male: [
        'Adbúr',
        'Agabo',
        'Agram',
        'Azgúk',
        'Baglub',
        'Bakari',
        'Baram',
        'Bogram',
        'Brug',
        'Bruno',
        'Búl',
        'Dench',
        'Dorn',
        'Druuk',
        'Dúl',
        'Feng',
        'Garzuk',
        'Gell',
        'Gharakh',
        'Gharn',
        'Gnarsh',
        'Grumbar',
        'Guntur',
        'Henk',
        'Hogar',
        'Holg',
        'Imsh',
        'Ingram',
        'Jabari',
        'Karash',
        'Keth',
        'Khairi',
        'Kito',
        'Korgul',
        'Krusk',
        'Lubash',
        'Lugúr',
        'Luthor',
        'Mhurren',
        'Mord',
        'Mosi',
        'Mushatúl',
        'Ogrimph',
        'Oghar',
        'Ohr',
        'Orbog',
        'Rendar',
        'Ront',
        'Sark',
        'Scrag',
        'Shagdúrul',
        'Shug',
        'Shump',
        'Shomari',
        'Shuzgam',
        'Sudi',
        'Tanglar',
        'Tarak',
        'Thar',
        'Thokk',
        'Ugarth',
        'Uhlbrecht',
        'Ulrich',
        'Urakh',
        'Ushugha',
        'Utz',
        'Valter',
        'Valt',
        'Yash',
        'Yurk'
    ],

    female: [
        'Augh',
        'Baggi',
        'Barika',
        'Binty',
        'Bree',
        'Clorinda',
        'Dalila',
        'Ekk',
        'Emen',
        'Engong',
        'Gaaki',
        'Gelsey',
        'Grai',
        'Grigri',
        'Gynk',
        'Hasina',
        'Huru',
        'Jina',
        'Kamaria',
        'Kansif',
        'Kesi',
        'Lagazi',
        'Lakeisha',
        'Marjani',
        'Murook',
        'Myev',
        'Neega',
        'Nia',
        'Nogu',
        'Ootah',
        'Ovak',
        'Ownka',
        'Penda',
        'Puyet',
        'Ramla',
        'Roshan',
        'Roxana',
        'Ryba',
        'Shani',
        'Shautha',
        'Sutha',
        'Tawar',
        'Tomph',
        'Ubada',
        'Unai',
        'Usoa',
        'Vanchu',
        'Vola',
        'Volen',
        'Winda',
        'Yevelda',
        'Zuri'
    ],

    surnames: [
        'Fangren',
        'Oda'
    ]
};

module.exports = halforc_names;
