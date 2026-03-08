const adjs = ['Ghost', 'Silent', 'Shadow', 'Hidden', 'Mystic', 'Dark', 'Bright', 'Lonely', 'Brave', 'Cunning'];
const animals = ['Tiger', 'Fox', 'Panda', 'Falcon', 'Wolf', 'Eagle', 'Lion', 'Panther', 'Raven', 'Shark'];

const generateAnonymousName = () => {
  const adj = adjs[Math.floor(Math.random() * adjs.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 99) + 1;
  return `${adj}${animal}${number}`;
};

module.exports = { generateAnonymousName };
