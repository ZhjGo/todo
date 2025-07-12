import { kv } from '@vercel/kv';
import { parse } from 'cookie';

export default async function handler(request, response) {
  const cookies = parse(request.headers.cookie || '');
  const sessionCookie = cookies.app_session;

  if (!sessionCookie) {
    return response.status(401).json({ error: 'Not authenticated' });
  }

  let session;
  try {
    session = JSON.parse(sessionCookie);
  } catch (error) {
    return response.status(400).json({ error: 'Invalid session cookie' });
  }
  
  if (!session?.user?.id) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;
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