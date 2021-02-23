const generators = {
  deva_generator: require('./deva'),
  dragonborn_generator: require('./dragonborn'),
  dwarf_generator: require('./dwarf'),
  elf_generator: require('./elf'),
  gnome_generator: require('./gnome'),
  halfling_generator: require('./halfling'),
  halforc_generator: require('./halforc'),
  human_generator: require('./human'),
  tiefling_generator: require('./tiefling'),
};

module.exports = generators;