const generators = {
  deva_generator: require('./deva'),
  dragonborn_generator: require('./dragonborn'),
  dwarf_generator: require('./dwarf'),
  elf_generator: require('./elf'),
  gnome_generator: require('./gnome'),
  halfling_generator: require('./halfling'),
  human_generator: require('./human'),
  tiefling_generator: require('./tiefling'),
  quests_generator: require('./quests'),
  stores_generator: require('./stores'),
  stores_random_generator: require('./stores_random'),
  tavern_generator: require('./tavern'),
  // treasure_generator: require('./generators/treasure'),
};

module.exports = generators;