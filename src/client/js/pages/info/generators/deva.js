/*
    Names froms:
        - Player Handbook 5e
        - http://brandondraga.tumblr.com/post/66804468075/chris-perkins-npc-name-list
*/

const {
    randomFromList
} = Lib.helpers;

const deva_names = {
    title: 'Deva',

    generate: function (gender_names) {
        return randomFromList(gender_names) + ' ' + randomFromList(this.surnames);
    },

    male: [
        'Adiah',
        'Ansis',
        'Ayab',
        'Bavak',
        'Beriah',
        'Eben',
        'Elyas',
        'Galad',
        'Gamal',
        'Hiyal',
        'Iannes',
        'Kerem',
        'Mahar',
        'Marach',
        'Mathas',
        'Natan',
        'Nehem',
        'Oris',
        'Raham',
        'Ronen',
        'Samel',
        'Sered',
        'Tavar',
        'Vered',
        'Zachar'
    ],

    female: [
        'Abea',
        'Adara',
        'Asha',
        'Chana',
        'Danel',
        'Darah',
        'Davi',
        'Elka',
        'Eranah',
        'Hania',
        'Hava',
        'Idria',
        'Isa',
        'Jael',
        'Kana',
        'Kayah',
        'Lihi',
        'Mahel',
        'Marek',
        'Noma',
        'Navah',
        'Paziah',
        'Ravah',
        'Riya',
        'Sada',
        'Shara',
        'Tirah'
    ],

    surnames: [
        'Azule',
        'Berius',
        'Callan',
        'Duhma',
        'Etoile',
        'Falam',
        'Goultar',
        'Hysiris',
        'Iolten',
        'Jelard',
        'Kaam',
        'Landal',
        'Muzul',
        'Nuterus',
        'Osstin',
        'Perol',
        'Qintz',
        'Rahmsas',
        'Selar',
        'Typhos',
        'Ulbras',
        'Valis',
        'Wordis',
        'Ximack',
        'Yahoon',
        'Zanbas'
    ]
};

module.exports = deva_names;
