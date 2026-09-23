// Zero-network offline GPS coordinate-to-US-State resolver.
// Works via satellite GPS hardware on mobile devices even with 0 bars of cell service.

type StateCoordinate = {
  code: string;
  name: string;
  lat: number;
  lng: number;
};

// Geographical centers of all 50 US States + DC
const US_STATE_CENTROIDS: StateCoordinate[] = [
  { code: "US-AL", name: "Alabama", lat: 32.806671, lng: -86.79113 },
  { code: "US-AK", name: "Alaska", lat: 61.370716, lng: -152.404419 },
  { code: "US-AZ", name: "Arizona", lat: 33.729759, lng: -111.431221 },
  { code: "US-AR", name: "Arkansas", lat: 34.969704, lng: -92.373123 },
  { code: "US-CA", name: "California", lat: 36.116203, lng: -119.681564 },
  { code: "US-CO", name: "Colorado", lat: 39.059811, lng: -105.311104 },
  { code: "US-CT", name: "Connecticut", lat: 41.597782, lng: -72.755371 },
  { code: "US-DE", name: "Delaware", lat: 39.318523, lng: -75.507141 },
  { code: "US-DC", name: "District of Columbia", lat: 38.897438, lng: -77.026817 },
  { code: "US-FL", name: "Florida", lat: 27.766279, lng: -81.686783 },
  { code: "US-GA", name: "Georgia", lat: 33.040619, lng: -83.643074 },
  { code: "US-HI", name: "Hawaii", lat: 21.094318, lng: -157.498337 },
  { code: "US-ID", name: "Idaho", lat: 44.240459, lng: -114.478828 },
  { code: "US-IL", name: "Illinois", lat: 40.349457, lng: -88.986137 },
  { code: "US-IN", name: "Indiana", lat: 39.849426, lng: -86.258278 },
  { code: "US-IA", name: "Iowa", lat: 42.011539, lng: -93.210526 },
  { code: "US-KS", name: "Kansas", lat: 38.5266, lng: -96.726486 },
  { code: "US-KY", name: "Kentucky", lat: 37.66814, lng: -84.670067 },
  { code: "US-LA", name: "Louisiana", lat: 31.169546, lng: -91.867805 },
  { code: "US-ME", name: "Maine", lat: 44.693947, lng: -69.381927 },
  { code: "US-MD", name: "Maryland", lat: 39.063946, lng: -76.802101 },
  { code: "US-MA", name: "Massachusetts", lat: 42.230171, lng: -71.530106 },
  { code: "US-MI", name: "Michigan", lat: 43.326618, lng: -84.536095 },
  { code: "US-MN", name: "Minnesota", lat: 45.694454, lng: -93.900192 },
  { code: "US-MS", name: "Mississippi", lat: 32.741646, lng: -89.678696 },
  { code: "US-MO", name: "Missouri", lat: 38.456085, lng: -92.288368 },
  { code: "US-MT", name: "Montana", lat: 46.921925, lng: -110.454353 },
  { code: "US-NE", name: "Nebraska", lat: 41.12537, lng: -98.268082 },
  { code: "US-NV", name: "Nevada", lat: 38.313515, lng: -117.055374 },
  { code: "US-NH", name: "New Hampshire", lat: 43.452492, lng: -71.563896 },
  { code: "US-NJ", name: "New Jersey", lat: 40.298904, lng: -74.521011 },
  { code: "US-NM", name: "New Mexico", lat: 34.840515, lng: -106.248482 },
  { code: "US-NY", name: "New York", lat: 42.165726, lng: -74.948051 },
  { code: "US-NC", name: "North Carolina", lat: 35.630066, lng: -79.806419 },
  { code: "US-ND", name: "North Dakota", lat: 47.528912, lng: -99.784012 },
  { code: "US-OH", name: "Ohio", lat: 40.388783, lng: -82.764915 },
  { code: "US-OK", name: "Oklahoma", lat: 35.565342, lng: -96.928917 },
  { code: "US-OR", name: "Oregon", lat: 44.572021, lng: -122.070938 },
  { code: "US-PA", name: "Pennsylvania", lat: 40.590752, lng: -77.209755 },
  { code: "US-RI", name: "Rhode Island", lat: 41.680893, lng: -71.51178 },
  { code: "US-SC", name: "South Carolina", lat: 33.856892, lng: -80.945007 },
  { code: "US-SD", name: "South Dakota", lat: 44.299782, lng: -99.438828 },
  { code: "US-TN", name: "Tennessee", lat: 35.747845, lng: -86.692345 },
  { code: "US-TX", name: "Texas", lat: 31.054487, lng: -97.563461 },
  { code: "US-UT", name: "Utah", lat: 40.150032, lng: -111.862434 },
  { code: "US-VT", name: "Vermont", lat: 44.045876, lng: -72.710686 },
  { code: "US-VA", name: "Virginia", lat: 37.769337, lng: -78.169968 },
  { code: "US-WA", name: "Washington", lat: 47.400902, lng: -121.490494 },
  { code: "US-WV", name: "West Virginia", lat: 38.491226, lng: -80.954453 },
  { code: "US-WI", name: "Wisconsin", lat: 44.268543, lng: -89.616508 },
  { code: "US-WY", name: "Wyoming", lat: 42.755966, lng: -107.30249 },
];

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolves latitude and longitude coordinates to the closest US State code.
 * Requires 0 network connectivity.
 */
export function resolveStateFromCoordinates(
  lat: number,
  lng: number,
): { stateCode: string; stateName: string } {
  let closest = US_STATE_CENTROIDS[0];
  let minDistance = haversineDistance(lat, lng, closest.lat, closest.lng);

  for (let i = 1; i < US_STATE_CENTROIDS.length; i++) {
    const candidate = US_STATE_CENTROIDS[i];
    const dist = haversineDistance(lat, lng, candidate.lat, candidate.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = candidate;
    }
  }

  return {
    stateCode: closest.code,
    stateName: closest.name,
  };
}

/**
 * Requests device GPS position and maps directly to a US state.
 * Works via device GPS chips without cellular or Wi-Fi data.
 */
export async function detectUsStateFromOfflineGps(): Promise<{
  stateCode: string;
  stateName: string;
  lat: number;
  lng: number;
}> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    throw new Error("Geolocation is not supported on this device.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const state = resolveStateFromCoordinates(lat, lng);
        resolve({
          stateCode: state.stateCode,
          stateName: state.stateName,
          lat,
          lng,
        });
      },
      (err) => {
        reject(new Error(err.message || "Failed to retrieve GPS position."));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  });
}
