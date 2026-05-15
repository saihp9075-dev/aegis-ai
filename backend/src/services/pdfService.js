import PDFDocument from 'pdfkit';

export function buildIncidentPdfBuffer(payload) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(20).fillColor('#111').text('AEGIS AI — Clinical Handoff Report', { align: 'left' });
    doc.moveDown(0.4);
    doc.fontSize(10).fillColor('#444').text(`Generated: ${payload.timestamp}`);
    doc.moveDown();

    const section = (title) => {
      doc.moveDown(0.6);
      doc.fontSize(13).fillColor('#000').text(title);
      doc.moveDown(0.2);
      doc.fontSize(10).fillColor('#333');
    };

    section('Patient');
    doc.text(`Name: ${payload.name || '—'}`);
    doc.text(`Email: ${payload.email || '—'}`);
    doc.text(`Blood group: ${payload.bloodGroup || '—'}`);
    doc.text(`Allergies: ${(payload.allergies || []).join(', ') || '—'}`);
    doc.text(`Medications: ${(payload.medications || []).join(', ') || '—'}`);
    doc.text(`Conditions: ${(payload.conditions || []).join(', ') || '—'}`);
    doc.text(`Notes: ${payload.notes || '—'}`);

    section('Presentation');
    doc.text(`Symptoms / narrative: ${payload.symptoms || '—'}`);

    section('AI-assisted triage (not a diagnosis)');
    doc.text(`Risk level: ${payload.risk || '—'}`);
    doc.text(`Confidence: ${payload.confidence ?? '—'}`);
    doc.text(`Why this risk: ${payload.whyRisk || '—'}`);
    doc.text(`Summary: ${payload.summary || '—'}`);
    doc.text(`Recommended action: ${payload.action || '—'}`);

    section('Location');
    doc.text(`GPS: ${payload.gps || '—'}`);
    doc.text(`Maps link: ${payload.maps || '—'}`);

    section('Nearby facilities (best effort)');
    (payload.hospitals || []).slice(0, 8).forEach((h, i) => {
      doc.text(`${i + 1}. ${h.name} — ${(h.distanceKm * 1000).toFixed(0)}m approx — ${h.directionsUrl || ''}`);
    });

    section('SOS / alerts');
    doc.text(`Telegram: ${payload.telegramStatus || '—'}`);
    doc.text(`Email: ${payload.emailStatus || '—'}`);

    doc.moveDown(1.2);
    doc.fontSize(9).fillColor('#666').text(
      'Disclaimer: AEGIS AI provides decision support and emergency coordination aids. It does not replace licensed medical care or emergency services.',
      { align: 'left' }
    );

    doc.end();
  });
}
