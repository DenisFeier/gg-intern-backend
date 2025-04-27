import multer from 'multer';
import express from 'express';
import { uploadImageToBucket } from '../utils/s3';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/profile-pick', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).send('No image uploaded');
    return;
  }
  try {
    const url = await uploadImageToBucket(req.file, 'profile-picks');
    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).send('Upload failed');
  }
});

router.post('/post', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).send('No image uploaded');
    return;
  }
  try {
    const url = await uploadImageToBucket(req.file, 'posts');
    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).send('Upload failed');
  }
});

export default router;