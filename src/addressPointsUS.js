export const addressPoints = [
    
    // Generate additional points within Region 1 - Northeast
    ...generatePointsWithinRegion(40.5, 44.0, -74.0, -70.0, "Northeast", 5000),
  
    // Generate additional points within Region 2 - Midwest
    ...generatePointsWithinRegion(38.5, 43.0, -94.0, -88.0, "Midwest", 5000),
  
    // Generate additional points within Region 3 - South
    ...generatePointsWithinRegion(29.5, 34.0, -96.0, -90.0, "South", 5000),
  
    // Generate additional points within Region 4 - West
    ...generatePointsWithinRegion(36.5, 41.0, -125.0, -120.0, "West", 5000),
  ];
  
  function generatePointsWithinRegion(latMin, latMax, lngMin, lngMax, regionName, count) {
    const points = [];
    const latRange = latMax - latMin;
    const lngRange = lngMax - lngMin;
  
    const startDate = new Date('2023-01-01'); // Start date
  
    for (let i = 0; i < count; i++) {
      const lat = latMin + Math.random() * latRange;
      const lng = lngMin + Math.random() * lngRange;
  
      const timeOffset = Math.floor(Math.random() * 365); // Random time offset between 0 and 364 days
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + timeOffset); // Add time offset to start date
  
      points.push([lat, lng, date, `Sample Location ${i + 1} (${regionName})`]);
    }
  
    return points;
  }
  