import { kv } from '@vercel/kv';
import jwt from 'jsonwebtoken';

// Helper function to get user ID from token
function getUserIdFromToken(request) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables.');
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.user?.id;
  } catch (error) {
    return null;
  }
}

export default async function handler(request, response) {
  const userId = getUserIdFromToken(request);

  if (!userId) {
    return response.status(401).json({ error: 'Unauthorized' });
  }
  const userTasksKey = `tasks:${userId}`;
  const { method } = request;

  switch (method) {
    case 'GET':
      try {
        const tasks = await kv.get(userTasksKey);
        return response.status(200).json(tasks || []);
      } catch (error) {
        return response.status(500).json({ error: 'Failed to fetch tasks.' });
      }
    case 'POST':
      try {
        const tasks = request.body;
        await kv.set(userTasksKey, tasks);
        return response.status(200).json({ success: true });
      } catch (error) {
        return response.status(500).json({ error: 'Failed to save tasks.' });
      }
    default:
      response.setHeader('Allow', ['GET', 'POST']);
      response.status(405).end(`Method ${method} Not Allowed`);
  }
}