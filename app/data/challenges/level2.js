const Lvl2Challenges = [{
  description: 'Paint a total of 25 buildings',
  checkCompletion: ({ _doc: { buildingsPainted: n } }) => (n === 25),
  reward: 25000,
}, {
  description: 'Paint a total of 30 buildings',
  checkCompletion: ({ _doc: { buildingsPainted: n } }) => (n === 30),
  reward: 30000,
}, {
  description: 'Paint a total of 35 buildings',
  checkCompletion: ({ _doc: { buildingsPainted: n } }) => (n === 35),
  reward: 35000,
}, {
  description: 'Paint a total of 40 buildings',
  checkCompletion: ({ _doc: { buildingsPainted: n } }) => (n === 40),
  reward: 40000,
}];

export default Lvl2Challenges;
