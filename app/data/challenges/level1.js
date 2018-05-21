const Lvl1Challenges = [{
  description: 'Paint a total of 5 buildings',
  checkCompletion: ({ _doc: { buildingsPainted: n } }) => (n === 5),
  reward: 5000,
}, {
  description: 'Paint a total of 10 buildings',
  checkCompletion: ({ _doc: { buildingsPainted: n } }) => (n === 10),
  reward: 10000,
}, {
  description: 'Paint a total of 15 buildings',
  checkCompletion: ({ _doc: { buildingsPainted: n } }) => (n === 15),
  reward: 15000,
}, {
  description: 'Paint a total of 20 buildings',
  checkCompletion: ({ _doc: { buildingsPainted: n } }) => (n === 20),
  reward: 20000,
}];

export default Lvl1Challenges;
