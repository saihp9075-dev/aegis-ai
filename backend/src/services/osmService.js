import axios from 'axios';
import { config } from '../config/index.js';

/** overpass-api.de rejects some UA patterns (e.g. "(contact: email@…)" from .env.example). */
function normalizeOsmUserAgent(ua) {
  const fallback = 'AEGIS-AI-Healthcare-OS/1.0';
  if (!ua || typeof ua !== 'string') return fallback;
  const trimmed = ua.trim();
  if (/\(contact:\s*[^)]+\)/i.test(trimmed)) return fallback;
  return trimmed;
}

const OSM_UA = normalizeOsmUserAgent(config.osmUserAgent);
const UA = { headers: { 'User-Agent': OSM_UA } };

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const OVERPASS_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': OSM_UA,
  Accept: '*/*',
};

async function postOverpass(query) {
  let lastErr;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const { data, status } = await axios.post(url, `data=${encodeURIComponent(query)}`, {
        headers: OVERPASS_HEADERS,
        timeout: 28000,
        validateStatus: () => true,
      });
      if (status >= 400) {
        lastErr = new Error(`Overpass ${status} at ${url}`);
        continue;
      }
      return data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Overpass failed');
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  try {
    const { data } = await axios.get(url, { ...UA, timeout: 12000 });
    return data?.display_name || '';
  } catch {
    return '';
  }
}

export async function fetchHospitalsOverpass(lat, lon, radiusM = 8000) {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radiusM},${lat},${lon});
      way["amenity"="hospital"](around:${radiusM},${lat},${lon});
      relation["amenity"="hospital"](around:${radiusM},${lat},${lon});
      node["amenity"="clinic"](around:${radiusM},${lat},${lon});
      way["amenity"="clinic"](around:${radiusM},${lat},${lon});
      node["healthcare"="hospital"](around:${radiusM},${lat},${lon});
      way["healthcare"="hospital"](around:${radiusM},${lat},${lon});
    );
    out center tags;
  `.trim();
  try {
    const data = await postOverpass(query);
    const elements = data?.elements || [];
    const rows = [];
    for (const el of elements) {
      const tags = el.tags || {};
      const name = tags.name || tags['name:en'] || 'Unknown facility';
      const type = tags.amenity || tags.healthcare || 'hospital';
      let plat = el.lat;
      let plon = el.lon;
      if (el.center) {
        plat = el.center.lat;
        plon = el.center.lon;
      }
      if (typeof plat !== 'number' || typeof plon !== 'number') continue;
      const distanceKm = haversineKm(lat, lon, plat, plon);
      rows.push({
        id: `${el.type}-${el.id}`,
        name,
        type,
        lat: plat,
        lon: plon,
        distanceKm,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${plat},${plon}`,
        osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
      });
    }
    rows.sort((a, b) => a.distanceKm - b.distanceKm);
    const dedup = [];
    const seen = new Set();
    for (const r of rows) {
      const key = `${r.name}-${r.lat.toFixed(4)}-${r.lon.toFixed(4)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      dedup.push(r);
    }
    return dedup.slice(0, 40);
  } catch (e) {
    return { error: e.message || 'Overpass failed' };
  }
}

/** Google Places Nearby Search — optional fallback when Overpass is empty or errors. */
export async function fetchGooglePlacesHospitals(lat, lon, apiKey, radiusM = 5000) {
  if (!apiKey) return [];
  const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
  const { data } = await axios.get(url, {
    params: {
      location: `${lat},${lon}`,
      radius: radiusM,
      type: 'hospital',
      key: apiKey,
    },
    timeout: 22000,
  });
  const status = data?.status;
  if (status !== 'OK' && status !== 'ZERO_RESULTS') {
    const err = data?.error_message || status || 'Places error';
    throw new Error(err);
  }
  const results = data?.results || [];
  const rows = [];
  for (const place of results) {
    const plat = place.geometry?.location?.lat;
    const plon = place.geometry?.location?.lng;
    if (typeof plat !== 'number' || typeof plon !== 'number') continue;
    const distanceKm = haversineKm(lat, lon, plat, plon);
    rows.push({
      id: `gplace-${place.place_id || rows.length}`,
      name: place.name || 'Hospital',
      type: 'hospital',
      lat: plat,
      lon: plon,
      distanceKm,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${plat},${plon}`,
      osmUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name || 'hospital')}&query_place_id=${place.place_id || ''}`,
    });
  }
  rows.sort((a, b) => a.distanceKm - b.distanceKm);
  return rows.slice(0, 40);
}
