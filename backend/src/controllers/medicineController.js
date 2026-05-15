import { addMedicine, listMedicines, updateMedicine, deleteMedicine } from '../database/db.js';

export function medicines(req, res) {
  res.json({ items: listMedicines(req.user.sub) });
}

export function createMedicine(req, res) {
  const body = req.body || {};
  const row = addMedicine(req.user.sub, {
    ...body,
    dose: body.dose ?? '',
    frequency: body.frequency || 'everyday',
    telegram: body.telegram !== false,
    active: body.active !== false,
  });
  res.json({ item: row });
}

export function patchMedicine(req, res) {
  const row = updateMedicine(req.user.sub, req.params.id, req.body || {});
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ item: row });
}

export function removeMedicine(req, res) {
  const ok = deleteMedicine(req.user.sub, req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
}
