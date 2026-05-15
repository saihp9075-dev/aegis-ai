import { fetchHospitalsOverpass, reverseGeocode, fetchGooglePlacesHospitals } from '../services/osmService.js';
import { config } from '../config/index.js';

/** Hospitals: OpenStreetMap / Overpass; optional Google Places when empty or failed. */
export async function hospitals(req, res) {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon || req.query.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: 'lat and lon required' });
    }
    let rows = await fetchHospitalsOverpass(lat, lon);
    let fetchWarning = null;
    if (!Array.isArray(rows)) {
      fetchWarning = rows?.error || 'Hospital lookup failed';
      rows = [];
    }
    if (rows.length === 0 && config.googlePlaces?.key) {
      try {
        const g = await fetchGooglePlacesHospitals(lat, lon, config.googlePlaces.key);
        if (g.length) rows = g;
      } catch {
        /* keep OSM empty */
      }
    }
    const label = await reverseGeocode(lat, lon);
    res.json({ label, hospitals: rows, warning: fetchWarning });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
