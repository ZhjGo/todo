import { serialize } from 'cookie';

export default function handler(req, res) {
  const cookie = serialize('app_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    maxAge: -1, // Expire the cookie immediately
    path: '/',
    domain: req.headers.host.split(':')[0], // 确保在正确的域名上删除
  });

  res.setHeader('Set-Cookie', cookie);
  res.status(200).json({ message: 'Logged out' });
}