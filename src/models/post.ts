import sql from '../utils/db';

export interface Post {
  id: number;
  userId: number;
  picture: string;
  title: string;
  locationLat?: number;
  locationLong?: number;
  createdAt: Date;
}

export const createPost = async (post: Omit<Post, 'id' | 'createdAt'>) => {
  const [newPost] = await sql<Post[]>`
    INSERT INTO posts (user_id, picture, title, location_lat, location_long)
    VALUES (
      ${post.userId},
      ${post.picture},
      ${post.title},
      ${post.locationLat || null},
      ${post.locationLong || null}
    )
    RETURNING *
  `;
  return newPost;
};

export const getPostsByUserId = async (userId: number): Promise<Post[]> => {
  return await sql<Post[]>`
    SELECT id, user_id, picture, title, location_lat AS "location.lat", location_long AS "location.long", created_at
    FROM posts
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
};

export const deletePost = async (postId: number): Promise<void> => {
  await sql`
    DELETE FROM posts
    WHERE id = ${postId}
  `;
};

export const updatePost = async (
  postId: number,
  updates: Partial<{ picture: string; title: string; locationLat: number; locationLong: number }>
): Promise<Post> => {
  const [updatedPost] = await sql<Post[]>`
    UPDATE posts
    SET
      picture = COALESCE(${updates.picture ?? null}, picture),
      title = COALESCE(${updates.title ?? null}, title),
      location_lat = COALESCE(${updates.locationLat ?? null}, location_lat),
      location_long = COALESCE(${updates.locationLong ?? null}, location_long)
    WHERE id = ${postId}
    RETURNING *
  `;
  return updatedPost;
};

export const getPostsForUser = async (userId: number, page: number, limit: number, order: 'ASC' | 'DESC'): Promise<Post[]> => {
  const offset = (page - 1) * limit;
  if (order === 'ASC') {
    return await sql<Post[]>`
      SELECT id, user_id, picture, title, location_lat AS "locationLat", location_long AS "locationLong", created_at AS "createdAt"
      FROM posts
      WHERE user_id = ${userId}
      ORDER BY created_at ASC
      LIMIT ${limit} OFFSET ${offset}
    `; 
  } else {
    return await sql<Post[]>`
      SELECT id, user_id, picture, title, location_lat AS "locationLat", location_long AS "locationLong", created_at AS "createdAt"
      FROM posts
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `; 
  }
};