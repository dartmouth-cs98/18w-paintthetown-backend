const Lvl1Challenges = [{
  description: 'Paint a total of 5 buildings',
  checkCompletion: ['AND', 0, 'buildingsPainted', 1],
  reward: 5000,
}, {
  description: 'Paint a total of 10 buildings',
  checkCompletion: ['AND', 0, 'buildingsPainted', 2],
  reward: 10000,
}, {
  description: 'Paint a total of 15 buildings',
  checkCompletion: ['AND', 0, 'buildingsPainted', 3],
  reward: 15000,
}, {
  description: 'Paint a total of 20 buildings',
  checkCompletion: ['AND', 0, 'buildingsPainted', 4],
  reward: 20000,
}];

export default Lvl1Challenges;
