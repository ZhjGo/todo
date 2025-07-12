import { serialize } from 'cookie';

export default function handler(req, res) {
  const host = req.headers.host;
  const parentDomain = host.startsWith('localhost') ? 'localhost' : host.split('.').slice(-2).join('.');

  // Use the 'cookie' library to ensure consistent serialization.
  // Create two deletion cookies, one for the specific subdomain and one for the parent domain.
  const options = {
    maxAge: -1, // Expire the cookie immediately
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
  };

  const cookies = [
    serialize('app_session', '', { ...options, domain: host }),
    serialize('app_session', '', { ...options, domain: parentDomain }),
  ];

  res.setHeader('Set-Cookie', cookies);
  
  // Redirect back to the homepage to force the browser to acknowledge the change.
  res.writeHead(302, { Location: '/' });
  res.end();
}