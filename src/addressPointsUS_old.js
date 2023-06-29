export const addressPoints = [
    // Region 1 - Northeast
    ...generatePointsWithinRegion(40.5, 44.0, -74.0, -70.0, "Northeast", 20000),
  
    // Region 2 - Midwest
    ...generatePointsWithinRegion(38.5, 43.0, -94.0, -88.0, "Midwest", 20000),
  
    // Region 3 - South
    ...generatePointsWithinRegion(29.5, 34.0, -96.0, -90.0, "South", 20000),
  
    // Region 4 - West
    ...generatePointsWithinRegion(36.5, 41.0, -125.0, -120.0, "West", 20000),
  ];
  
  function generatePointsWithinRegion(latMin, latMax, lngMin, lngMax, regionName, count) {
    const points = [];
    const latRange = latMax - latMin;
    const lngRange = lngMax - lngMin;
  
    for (let i = 0; i < count; i++) {
      const lat = latMin + Math.random() * latRange;
      const lng = lngMin + Math.random() * lngRange;
      points.push([lat, lng, `Sample Location ${i + 1} (${regionName})`]);
    }
  
    return points;
  }
  
  