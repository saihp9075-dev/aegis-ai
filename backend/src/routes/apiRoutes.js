import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as ai from '../controllers/aiController.js';
import * as sos from '../controllers/sosController.js';
import * as hospitals from '../controllers/hospitalController.js';
import * as history from '../controllers/historyController.js';
import * as meds from '../controllers/medicineController.js';
import * as pdf from '../controllers/pdfController.js';
import * as telegram from '../controllers/telegramController.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const r = Router();

r.get('/ai/status', requireAuth, ai.aiStatus);
r.post('/ai/triage', requireAuth, aiLimiter, ai.triage);
r.post('/ai/chat', requireAuth, aiLimiter, ai.chat);
r.post('/sos/dispatch', requireAuth, sos.dispatchSos);
r.post('/telegram/test', requireAuth, telegram.testTelegram);
r.get('/hospitals', requireAuth, hospitals.hospitals);
r.get('/history', requireAuth, history.history);
r.get('/medicines', requireAuth, meds.medicines);
r.post('/medicines', requireAuth, meds.createMedicine);
r.patch('/medicines/:id', requireAuth, meds.patchMedicine);
r.delete('/medicines/:id', requireAuth, meds.removeMedicine);
r.post('/pdf/incident', requireAuth, pdf.incidentPdf);

export default r;
