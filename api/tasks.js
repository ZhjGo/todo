import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  const { method } = request;

  switch (method) {
    case 'GET':
      try {
        const tasks = await kv.get('tasks');
        return response.status(200).json(tasks || []);
      } catch (error) {
        return response.status(500).json({ error: 'Failed to fetch tasks.' });
      }
    case 'POST':
      try {
        const tasks = request.body;
        await kv.set('tasks', tasks);
        return response.status(200).json({ success: true });
      } catch (error) {
        return response.status(500).json({ error: 'Failed to save tasks.' });
      }
    default:
      response.setHeader('Allow', ['GET', 'POST']);
      response.status(405).end(`Method ${method} Not Allowed`);
  }
}