import express from 'express';
import multer from 'multer';

import { authorizeUser } from '../middleware/authorizeUser';
import { createPost, getPostsByUserId, updatePost, deletePost, getPostsForUser } from '../models/post';
import { uploadImageToBucket } from '../utils/s3';
import { AuthenticatedRequest } from '../models/user';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authorizeUser, upload.single('image'), async (req, res) => {
  const { title, locationLat, locationLong } = req.body;

  if (!req.file || !title) {
    res.status(400).json({ message: 'Picture and title are required' });
    return;
  }

  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const pictureUrl = await uploadImageToBucket(req.file, 'posts');

    const newPost = await createPost({
      userId,
      picture: pictureUrl,
      title,
      locationLat: locationLat ? parseFloat(locationLat) : undefined,
      locationLong: locationLong ? parseFloat(locationLong) : undefined
    });

    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/:postId', authorizeUser, upload.single('image'), async (req, res) => {
  const { postId } = req.params;
  const { title, locationLat, locationLong } = req.body;

  try {
    const userId = (req as AuthenticatedRequest).user.id;

    const post = await getPostsByUserId(userId);
    const postToEdit = post.find((p) => p.id === parseInt(postId));
    if (!postToEdit) {
      res.status(403).json({ message: 'You can only edit your own posts' });
      return;
    }

    const updates: Partial<{ picture: string; title: string; locationLat: number; locationLong: number }> = {};
    if (req.file) {
      updates.picture = await uploadImageToBucket(req.file, 'posts');
    }
    if (title) updates.title = title;
    if (locationLat) updates.locationLat = parseFloat(locationLat);
    if (locationLong) updates.locationLong = parseFloat(locationLong);

    const updatedPost = await updatePost(parseInt(postId), updates);

    res.json({ message: 'Post updated successfully', post: updatedPost });
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:postId', authorizeUser, async (req, res) => {
  const { postId } = req.params;

  try {
    const userId = (req as AuthenticatedRequest).user.id;

    const post = await getPostsByUserId(userId);
    const postToDelete = post.find((p) => p.id === parseInt(postId));
    if (!postToDelete) {
      res.status(403).json({ message: 'You can only delete your own posts' });
      return;
    }

    await deletePost(parseInt(postId));

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const order = (req.query.order as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  if (page < 1 || limit < 1) {
    res.status(400).json({ message: 'Page and limit must be positive integers' });
    return;
  }

  try {
    const posts = await getPostsForUser(parseInt(userId), page, limit, order as 'ASC' | 'DESC');
    res.json({ page, limit, order, posts });
  } catch (err) {
    console.error('Error fetching posts for user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
export default router;