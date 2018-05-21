const Lvl3Challenges = [{
  description: 'Paint a total of 5 buildings',
  checkCompletion: ({ _doc: { buildingsPainted: n } }) => (n === 45),
  reward: 45000,
}, {
  description: 'Paint a total of 10 buildings',
  checkCompletion: ({ _doc: { buildingsPainted: n } }) => (n === 50),
  reward: 50000,
}, {
  description: 'Paint a total of 15 buildings',
  checkCompletion: ({ _doc: { buildingsPainted: n } }) => (n === 55),
  reward: 55000,
}, {
  description: 'Paint a total of 20 buildings',
  checkCompletion: ({ _doc: { buildingsPainted: n } }) => (n === 60),
  reward: 60000,
}];

export default Lvl3Challenges;
