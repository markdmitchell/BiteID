export interface USState {
  code: string; // ISO code e.g. "US-VA"
  name: string; // "Virginia"
  abbr: string; // "VA"
  lat: number;  // Centroid latitude
  lng: number;  // Centroid longitude
}

export const ALL_US_STATES: USState[] = [
  { code: "US-AL", name: "Alabama", abbr: "AL", lat: 32.806671, lng: -86.791130 },
  { code: "US-AK", name: "Alaska", abbr: "AK", lat: 61.370716, lng: -152.404419 },
  { code: "US-AZ", name: "Arizona", abbr: "AZ", lat: 33.729759, lng: -111.431221 },
  { code: "US-AR", name: "Arkansas", abbr: "AR", lat: 34.969704, lng: -92.373123 },
  { code: "US-CA", name: "California", abbr: "CA", lat: 36.116203, lng: -119.681564 },
  { code: "US-CO", name: "Colorado", abbr: "CO", lat: 39.059811, lng: -105.311104 },
  { code: "US-CT", name: "Connecticut", abbr: "CT", lat: 41.597782, lng: -72.755371 },
  { code: "US-DE", name: "Delaware", abbr: "DE", lat: 39.318523, lng: -75.507141 },
  { code: "US-DC", name: "District of Columbia", abbr: "DC", lat: 38.897438, lng: -77.026817 },
  { code: "US-FL", name: "Florida", abbr: "FL", lat: 27.766279, lng: -81.686783 },
  { code: "US-GA", name: "Georgia", abbr: "GA", lat: 33.040619, lng: -83.643074 },
  { code: "US-HI", name: "Hawaii", abbr: "HI", lat: 21.094318, lng: -157.498337 },
  { code: "US-ID", name: "Idaho", abbr: "ID", lat: 44.240459, lng: -114.478828 },
  { code: "US-IL", name: "Illinois", abbr: "IL", lat: 40.349457, lng: -88.986137 },
  { code: "US-IN", name: "Indiana", abbr: "IN", lat: 39.849426, lng: -86.258278 },
  { code: "US-IA", name: "Iowa", abbr: "IA", lat: 42.011539, lng: -93.210526 },
  { code: "US-KS", name: "Kansas", abbr: "KS", lat: 38.526600, lng: -96.726486 },
  { code: "US-KY", name: "Kentucky", abbr: "KY", lat: 37.668140, lng: -84.670067 },
  { code: "US-LA", name: "Louisiana", abbr: "LA", lat: 31.169546, lng: -91.867805 },
  { code: "US-ME", name: "Maine", abbr: "ME", lat: 44.693947, lng: -69.381927 },
  { code: "US-MD", name: "Maryland", abbr: "MD", lat: 39.063946, lng: -76.802101 },
  { code: "US-MA", name: "Massachusetts", abbr: "MA", lat: 42.230171, lng: -71.530106 },
  { code: "US-MI", name: "Michigan", abbr: "MI", lat: 43.326618, lng: -84.536095 },
  { code: "US-MN", name: "Minnesota", abbr: "MN", lat: 45.694454, lng: -93.900192 },
  { code: "US-MS", name: "Mississippi", abbr: "MS", lat: 32.741646, lng: -89.678696 },
  { code: "US-MO", name: "Missouri", abbr: "MO", lat: 38.456085, lng: -92.288368 },
  { code: "US-MT", name: "Montana", abbr: "MT", lat: 46.921925, lng: -110.454353 },
  { code: "US-NE", name: "Nebraska", abbr: "NE", lat: 41.125370, lng: -98.268082 },
  { code: "US-NV", name: "Nevada", abbr: "NV", lat: 38.313515, lng: -117.055374 },
  { code: "US-NH", name: "New Hampshire", abbr: "NH", lat: 43.452492, lng: -71.563896 },
  { code: "US-NJ", name: "New Jersey", abbr: "NJ", lat: 40.298960, lng: -74.521011 },
  { code: "US-NM", name: "New Mexico", abbr: "NM", lat: 34.840515, lng: -106.248482 },
  { code: "US-NY", name: "New York", abbr: "NY", lat: 42.165726, lng: -74.948051 },
  { code: "US-NC", name: "North Carolina", abbr: "NC", lat: 35.630066, lng: -79.806419 },
  { code: "US-ND", name: "North Dakota", abbr: "ND", lat: 47.528912, lng: -99.784012 },
  { code: "US-OH", name: "Ohio", abbr: "OH", lat: 40.388783, lng: -82.764915 },
  { code: "US-OK", name: "Oklahoma", abbr: "OK", lat: 35.565342, lng: -96.928917 },
  { code: "US-OR", name: "Oregon", abbr: "OR", lat: 44.572021, lng: -122.070938 },
  { code: "US-PA", name: "Pennsylvania", abbr: "PA", lat: 40.590752, lng: -77.209755 },
  { code: "US-RI", name: "Rhode Island", abbr: "RI", lat: 41.680893, lng: -71.511780 },
  { code: "US-SC", name: "South Carolina", abbr: "SC", lat: 33.856892, lng: -80.945007 },
  { code: "US-SD", name: "South Dakota", abbr: "SD", lat: 44.299782, lng: -99.438828 },
  { code: "US-TN", name: "Tennessee", abbr: "TN", lat: 35.747845, lng: -86.692345 },
  { code: "US-TX", name: "Texas", abbr: "TX", lat: 31.054487, lng: -97.563461 },
  { code: "US-UT", name: "Utah", abbr: "UT", lat: 40.150032, lng: -111.862434 },
  { code: "US-VT", name: "Vermont", abbr: "VT", lat: 44.045876, lng: -72.710686 },
  { code: "US-VA", name: "Virginia", abbr: "VA", lat: 37.769337, lng: -78.169968 },
  { code: "US-WA", name: "Washington", abbr: "WA", lat: 47.400902, lng: -121.490494 },
  { code: "US-WV", name: "West Virginia", abbr: "WV", lat: 38.491226, lng: -80.954453 },
  { code: "US-WI", name: "Wisconsin", abbr: "WI", lat: 44.268543, lng: -89.616508 },
  { code: "US-WY", name: "Wyoming", abbr: "WY", lat: 42.755966, lng: -107.302490 },
];

export function getStateByCode(code: string): USState | undefined {
  return ALL_US_STATES.find(s => s.code.toUpperCase() === code.toUpperCase() || s.abbr.toUpperCase() === code.toUpperCase());
}

export function findClosestStateByLatLng(lat: number, lng: number): USState {
  let closestState = ALL_US_STATES[0];
  let minDistance = Infinity;

  for (const state of ALL_US_STATES) {
    const dLat = state.lat - lat;
    const dLng = state.lng - lng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < minDistance) {
      minDistance = dist;
      closestState = state;
    }
  }

  return closestState;
}

export async function reverseGeocodeLocation(lat: number, lng: number): Promise<{
  stateCode: string;
  stateName: string;
  city?: string;
  formattedLocation: string;
}> {
  const closest = findClosestStateByLatLng(lat, lng);

  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (response.ok) {
      const data = await response.json();
      const principalSubdivisionCode = data.principalSubdivisionCode;
      const city = data.city || data.locality || data.localityInfo?.administrative?.[2]?.name;

      if (principalSubdivisionCode) {
        const cleanCode = principalSubdivisionCode.startsWith("US-")
          ? principalSubdivisionCode
          : `US-${principalSubdivisionCode}`;
        const matchedState = getStateByCode(cleanCode);
        if (matchedState) {
          const stateDisplay = city ? `${city}, ${matchedState.name}` : matchedState.name;
          return {
            stateCode: matchedState.code,
            stateName: matchedState.name,
            city,
            formattedLocation: stateDisplay,
          };
        }
      }
    }
  } catch (e) {
    console.warn("Reverse geocode fetch failed, using spatial centroid fallback:", e);
  }

  return {
    stateCode: closest.code,
    stateName: closest.name,
    formattedLocation: closest.name,
  };
}
