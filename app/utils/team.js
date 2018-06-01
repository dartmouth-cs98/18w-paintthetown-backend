import { getOwnedBuildings } from './building';


export const computeTeamOwnership = (teamID) => (
  teamID === null ?
  Promise.resolve(null) :
  getOwnedBuildings().then(all => {
    const { length: n } = all;

    if (n === 0) {
      return Promise.resolve(null);
    }

    const teamOwned = all.reduce((tot, { _doc: { team: t } }) => (
      tot + (`${t}` === `${teamID}`)
    ), 0);

    const percent = Math.round(teamOwned * 10000.0 / n) / 100.0;

    return Promise.resolve(percent);
  })
);
