import { serialize } from 'cookie';

export default function handler(req, res) {
  const host = req.headers.host;
  const domain = host.startsWith('localhost') ? 'localhost' : '.' + host.split('.').slice(-2).join('.');

  const cookies = [
    serialize('app_session', '', {
      maxAge: -1,
      path: '/',
    }),
    serialize('app_session', '', {
      maxAge: -1,
      path: '/',
      domain: domain,
    }),
    serialize('app_session', '', {
      maxAge: -1,
      path: '/',
      domain: host,
    }),
  ];

  res.setHeader('Set-Cookie', cookies);
  res.status(200).json({ message: 'Logged out' });
}