/*
    Names froms:
        - Player Handbook 5e
        - http://brandondraga.tumblr.com/post/66804468075/chris-perkins-npc-name-list
*/

const {
    percentage,
    randomFromList
} = Lib.helpers;

const gnome_names = {
    title: 'Gnome',

    generate: function (gender_names) {
        let name = randomFromList(gender_names) + ' ' + randomFromList(this.clans);
        if (percentage() < 30) {
            name += (' aka "' + randomFromList(this.nicknames) + '"');
        }
        return name;
    },

    male: [
        'Alston',
        'Alvyn',
        'Arnost',
        'Bedrich',
        'Benes',
        'Boddynock',
        'Bogdan',
        'Bogdashka',
        'Bohumil',
        'Bozidar',
        'Brocc',
        'Burgen',
        'Cermak',
        'Dalibor',
        'Damek',
        'Dimble',
        'Durko',
        'Eldon',
        'Erky',
        'Evzek',
        'Fonkin',
        'Frug',
        'Gerbo',
        'Gimble',
        'Glim',
        'Han',
        'Holic',
        'Hudak',
        'Jebeddo',
        'Kellen',
        'Kral',
        'Ku',
        'Kubas',
        'Laco',
        'Lev',
        'Marek',
        'Namfoodle',
        'Nim',
        'Novak',
        'Orryn',
        'Otka',
        'Pepik',
        'Pock',
        'Praza',
        'Reznik',
        'Roondar',
        'Rybar',
        'Seebo',
        'Sindri',
        'Tesar',
        'Toman',
        'Warryn',
        'Wrenn',
        'Zook'
    ],

    female: [
        'Alzbeta',
        'Anezka',
        'Berta',
        'Bimpnottin',
        'Breena',
        'Capeka',
        'Caramip',
        'Carlin',
        'Darina',
        'Donella',
        'Duvamil',
        'Ella',
        'Ellyjobell',
        'Ellywick',
        'Fiala',
        'Ivania',
        'Jana',
        'Jirina',
        'Kaleena',
        'Lexa',
        'Lilli',
        'Loopmottin',
        'Lorilla',
        'Mardnab',
        'Marenka',
        'Nissa',
        'Nyx',
        'Oda',
        'Olexa',
        'Orla',
        'Pavla',
        'Risa',
        'Roswyn',
        'Rusalka',
        'Ruza',
        'Ryba',
        'Shamil',
        'Tana',
        'Waywocket',
        'Vanda',
        'Zanna'
    ],

    clans: [
        'Beren',
        'Brada',
        'Benak',
        'Cerma',
        'Daergel',
        'Folkor',
        'Garrick',
        'Huba',
        'Janda',
        'Lanik',
        'Murnig',
        'Nackle',
        'Ningle',
        'Novak',
        'Raulnor',
        'Rybar',
        'Scheppen',
        'Sedlak',
        'Timbers',
        'Turen',
        'Vavrus'
    ],

    nicknames: [
        'Aleslosh',
        'Ashhearth',
        'Badger',
        'Cloak',
        'Doublelock',
        'Filchbatter',
        'Fnipper',
        'Ku',
        'Nim',
        'Oneshoe',
        'Pock',
        'Sparklegem',
        'Stumbleduck'
    ]
}

module.exports = gnome_names;
