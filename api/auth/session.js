import { parse } from 'cookie';

export default function handler(req, res) {
  const cookies = parse(req.headers.cookie || '');
  const sessionCookie = cookies.app_session;

  if (!sessionCookie) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const session = JSON.parse(sessionCookie);
    res.status(200).json(session);
  } catch (error) {
    res.status(400).json({ error: 'Invalid session cookie' });
  }
}