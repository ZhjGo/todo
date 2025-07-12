import { serialize } from 'cookie';

export default function handler(req, res) {
  const cookie = serialize('app_session', '', {
    maxAge: -1, // Expire the cookie immediately
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
  res.status(200).json({ message: 'Logged out' });
}