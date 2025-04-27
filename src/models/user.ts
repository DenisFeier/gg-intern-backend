import _ from 'lodash';
import express from 'express';

import sql from '../utils/db';

export interface User {
  id: number;
  username: string;
  email: string;
  profilePicture: string | null;
  isPublic: boolean;
  password: string;
}

export interface AuthenticatedRequest extends express.Request {
  user: User;
}

export const createUser = async (user: Omit<User, 'id'>) => {
  const [newUser] = await sql<User[]>`
    INSERT INTO users (username, email, profile_picture, is_public, password)
    VALUES (${user.username}, ${user.email}, ${user.profilePicture}, ${user.isPublic}, ${user.password})
    RETURNING *
  `;
  return newUser;
};

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  const result = await sql<User[]>`
    SELECT id, username, email, profile_picture, is_public, password
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;
  return _.first(result);
};

export const updateUserProfilePicture = async (userId: number, profilePictureUrl: string): Promise<void> => {
  await sql`
    UPDATE users
    SET profile_picture = ${profilePictureUrl}
    WHERE id = ${userId}
  `;
};

export const updateUserVisibility = async (userId: number, isPublic: boolean): Promise<void> => {
  await sql`
    UPDATE users
    SET is_public = ${isPublic}
    WHERE id = ${userId}
  `;
};

export const getPublicUsers = async (page: number, limit: number, search: string | undefined, excludeUserId: number): Promise<User[]> => {
  const offset = (page - 1) * limit;

  return await sql<User[]>`
    SELECT id, username, email, profile_picture, is_public
    FROM users
    WHERE is_public = true
      AND id != ${excludeUserId}
      AND (${search ? sql`username ILIKE ${'%' + search + '%'}` : sql`true`})
    ORDER BY username ASC
    LIMIT ${limit} OFFSET ${offset}
  `;
};