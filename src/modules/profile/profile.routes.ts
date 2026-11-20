import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { serialize } from '../../shared/serialize';
import { ProfileModel } from './profile.model';
import { profileFallback } from '../../data/fallback';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const doc = await ProfileModel.findOne({ key: 'main' }).lean();
    if (!doc) return res.json(profileFallback);
    return res.json(serialize(doc));
  }),
);

export default router;
