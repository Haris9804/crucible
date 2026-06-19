// Team playground: read own info, fetch active CTFs (answers stripped),
// submit responses (scored server-side, one-time), read own result.
import { Router } from 'express';
import { requireTeam } from '../auth.js';
import {
  publicTeam, activeCtfsForTeam, buildResult, saveResult, getResult,
} from '../store.js';

const router = Router();
router.use(requireTeam);

// Own team info + whether already submitted.
router.get('/me', async (req, res) => {
  const team = await publicTeam(req.session.teamId);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
  res.json({ success: true, team });
});

// Active CTFs and their active flags — never includes answers.
router.get('/ctfs', async (req, res) => {
  res.json({ success: true, ctfs: await activeCtfsForTeam() });
});

// One-time submission. Scoring happens here, not in the browser.
router.post('/submit', async (req, res) => {
  const teamId = req.session.teamId;
  if (await getResult(teamId)) {
    return res.json({ success: false, message: 'Your team has already submitted' });
  }
  const result = await buildResult(teamId, req.body?.responses || {});
  await saveResult(result);
  res.json({ success: true, result });
});

// Own result (if submitted).
router.get('/result', async (req, res) => {
  const result = await getResult(req.session.teamId);
  if (!result) return res.json({ success: false, found: false });
  res.json({ success: true, found: true, result });
});

export default router;
