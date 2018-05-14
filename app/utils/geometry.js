const WALL_WIDTH = 1e-5;

export const EARTH_RADIUS = 6371009;

export const toRadians = (v) => (v / 180.0 * Math.PI);

export const polarTriangleArea = (tan1, lng1, tan2, lng2) => {
  const deltaLng = lng1 - lng2;
  const t = tan1 * tan2;

  return 2 * Math.atan2(t * Math.sin(deltaLng), 1 + t * Math.cos(deltaLng));
};

export const computeSignedArea = (path, radius) => {
  const { length: size } = path;

  if (size < 3) { return 0; }

  let total = 0;
  const prev = path[size - 1];
  let prevTanLat = Math.tan((Math.PI / 2 - toRadians(prev[0])) / 2);
  let prevLng = toRadians(prev[1]);

  path.forEach(point => {
    const tanLat = Math.tan((Math.PI / 2 - toRadians(point[0])) / 2);
    const lng = toRadians(point[1]);

    total += polarTriangleArea(tanLat, lng, prevTanLat, prevLng);

    prevTanLat = tanLat;
    prevLng = lng;
  });

  return total * (radius * radius);
};

export const computeArea = (path) => (
  Math.abs(computeSignedArea(path, EARTH_RADIUS))
);

export const computeBbox = (polygon) => {
  let minLng = Number.POSITIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  polygon.forEach(p => {
    minLng = Math.min(p[0], minLng);
    minLat = Math.min(p[1], minLat);
    maxLng = Math.max(p[0], maxLng);
    maxLat = Math.max(p[1], maxLat);
  });

  return [minLng, minLat, maxLng, maxLat];
};

export const computeSurfaceArea = (baseAltitude, topAltitude, contour) => {
  const height = Math.abs(baseAltitude - topAltitude);
  const [minLng, minLat, maxLng, maxLat] = computeBbox(contour);

  const roofArea = computeArea(contour, EARTH_RADIUS);
  const sidesArea = computeArea([
    [minLng, minLat],
    [minLng, maxLat],
    [minLng + WALL_WIDTH, maxLat + WALL_WIDTH],
    [minLng + WALL_WIDTH, minLat + WALL_WIDTH],
  ]) * height;
  const topsArea = computeArea([
    [minLng, minLat],
    [maxLng, minLat],
    [maxLng + WALL_WIDTH, minLat + WALL_WIDTH],
    [minLng + WALL_WIDTH, minLat + WALL_WIDTH],
  ]) * height;

  return roofArea + 2 * (sidesArea + topsArea);
};

export const featurizeObj = ({ id = '', geometry, properties }) => (
  {
    type: 'Feature',
    id,
    geometry,
    properties,
  }
);

export const featurizeBuilding = ({
  contours: c,
  topAltitude,
  baseAltitude,
  centroidLng,
  centroidLat,
  name,
  id,
}) => (featurizeObj({
  id,
  geometry: {
    type: 'MultiPolygon',
    coordinates: [c.map(([p0, ...path]) => ([p0, ...path, p0]))],
  },
  properties: { name, topAltitude, baseAltitude, centroidLng, centroidLat },
}));

export const reduceBuildingTopology = ({
  arcs,
  bbox,
  objects,
  transform = null,
}) => {
  const keys = Object.keys(objects);
  const topo = [];

  if (transform !== null) {
    const { scale, translate } = transform;
    topo.push([scale, translate]);
  }

  const vals = keys.map(k => (objects[k]))
  .map(({
    arcs: a,
    id,
    properties: { centroidLng, centroidLat, baseAltitude, topAltitude, name },
  }) => ([a, id, [baseAltitude, centroidLat, centroidLng, name, topAltitude]]));

  return [
    arcs,
    bbox,
    vals,
    ...topo,
  ];
};

export const expandBuildingTopology = ([arcs, bbox, objs, ...transform]) => {
  const building = { type: 'Topolgy' };
  const objects = { };

  if (transform.length > 0) {
    const [scale, translate] = transform[0];

    building.transform = { scale, translate };
  }

  objs.forEach(([
    a,
    id,
    [baseAltitude, centroidLat, centroidLng, name, topAltitude],
  ], i) => {
    objects[i] = {
      type: 'MultiPolygon',
      arcs: a,
      id,
      properties: {
        baseAltitude,
        centroidLat,
        centroidLng,
        name,
        topAltitude,
      },
    };
  });

  return Object.assign(building, {
    arcs,
    bbox,
    objects,
  });
};
