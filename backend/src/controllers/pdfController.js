import { buildIncidentPdfBuffer } from '../services/pdfService.js';
import { findUserById, listHistory, listSosLogs } from '../database/db.js';
import { fetchHospitalsOverpass } from '../services/osmService.js';

export async function incidentPdf(req, res) {
  try {
    const user = findUserById(req.user.sub);
    const { historyId, symptoms, envelope, lat, lng } = req.body || {};
    const histories = listHistory(user.id);
    const h = histories.find((x) => x.id === historyId) || histories[0];
    const sos = listSosLogs(user.id)[0];
    let hospitals = [];
    if (lat && lng) {
      const r = await fetchHospitalsOverpass(Number(lat), Number(lng));
      if (Array.isArray(r)) hospitals = r;
    }
    const profile = user.profile || {};
    const buf = await buildIncidentPdfBuffer({
      timestamp: new Date().toISOString(),
      name: user.name,
      email: user.email,
      bloodGroup: profile.bloodGroup,
      allergies: profile.allergies,
      medications: profile.medications,
      conditions: profile.conditions,
      notes: profile.notes,
      symptoms: symptoms || h?.summary || '',
      risk: envelope?.risk_level || h?.risk,
      confidence: envelope?.confidence_score,
      whyRisk: envelope?.why_this_risk,
      summary: envelope?.medical_summary || h?.summary,
      action: envelope?.recommended_action,
      gps: lat && lng ? `${lat},${lng}` : '',
      maps: lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : '',
      hospitals,
      telegramStatus: h?.telegramStatus || sos?.telegramStatus,
      emailStatus: h?.emailStatus || sos?.emailStatus,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="aegis-report.pdf"');
    res.send(buf);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
