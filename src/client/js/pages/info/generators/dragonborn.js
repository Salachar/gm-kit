/*
    Names froms:
        - Player Handbook 5e
        - http://brandondraga.tumblr.com/post/66804468075/chris-perkins-npc-name-list
*/

const {
    percentage,
    randomFromList
} = Lib.helpers;

const dragonborn_names = {
    title: 'Dragonborn',

    generate: function (gender_names) {
        let name = randomFromList(gender_names);
        if (percentage() < 10) {
            name += (' ' + randomFromList(this.surnames));
        }
        if (percentage() < 40) {
            name += (' (clan ' + randomFromList(this.clans)) + ')';
        }
        return name;
    },

    male: [
        'Andujar',
        'Arjhan',
        'Armagan',
        'Armek',
        'Arzan',
        'Axaran',
        'Balasar',
        'Belaxarim',
        'Bharash',
        'Brevarr',
        'Djemidor',
        'Donaar',
        'Draxan',
        'Fayal',
        'Ghesh',
        'Grax',
        'Heskan',
        'Iojad',
        'Inzul',
        'Khiraj',
        'Kreytzen',
        'Kriv',
        'Lejek',
        'Malakith',
        'Mar',
        'Medrash',
        'Mehan',
        'Nadarr',
        'Nazir',
        'Nedam',
        'Nevek',
        'Pandjed',
        'Patrin',
        'Ravaran',
        'Razaan',
        'Rhogar',
        'Sarax',
        'Sarram',
        'Savaxis',
        'Shamash',
        'Shedinn',
        'Siangar',
        'Sirizan',
        'Sunan',
        'Szuran',
        'Tajan',
        'Tamajon',
        'Tarhun',
        'Tenahn',
        'Torinn',
        'Toxal',
        'Tzegyr',
        'Vantajar',
        'Vharkus',
        'Xafiq',
        'Zarkhil',
        'Zakhijin'
    ],

    female: [
        'Akra',
        'Artana',
        'Biri',
        'Daar',
        'Farideh',
        'Harann',
        'Havilar',
        'Jheri',
        'Kalas',
        'Kava',
        'Khagra',
        'Korinn',
        'Leytra',
        'Mishann',
        'Myrka',
        'Nala',
        'Naya',
        'Osayah',
        'Perra',
        'Raiann',
        'Sarcha',
        'Shirren',
        'Sirivistra',
        'Sora',
        'Sufana',
        'Surina',
        'Tamara',
        'Thava',
        'Uadjit',
        'Vrumadi',
        'Zovra'
    ],

    // Dragonborn dont usually have last names
    surnames: [
        'Aksu',
        'Baykal',
        'Celik',
        'Demir',
        'Erbil',
        'Gomec',
        'Gul',
        'Kaplan',
        'Kaya',
        'Kirca',
        'Mansur',
        'Muhtar',
        'Oyal',
        'Ozdemir',
        'Pekkan',
        'Polat',
        'Sahin',
        'Senturk',
        'Yilmaz'
    ],

    clans: [
        'Clethinthiallor',
        'Daardendrian',
        'Delmirev',
        'Drachedandion',
        'Fenkenkabradon',
        'Kepeshkmolik',
        'Kerrhylon',
        'Kimbatuul',
        'Linxakasendalor',
        'Myastan',
        'Nemmonis',
        'Norixius',
        'Ophinshtalajiir',
        'Prexijandilin',
        'Shestendeliath',
        'Turnuroth',
        'Verthisathurgiesh',
        'Yarjerit'
    ]
};

module.exports = dragonborn_names;
