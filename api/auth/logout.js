export default function handler(req, res) {
  const host = req.headers.host;
  const domain = host.startsWith('localhost') ? '' : `Domain=.${host.split('.').slice(-2).join('.')};`;

  // The most robust way to clear a cookie is to set its expiration date to the past.
  const expiredCookie = `app_session=; HttpOnly; Secure; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;

  // Attempt to clear the cookie on both the specific subdomain and the parent domain.
  const cookies = [
    `app_session=; HttpOnly; Secure; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Domain=${host};`,
    `app_session=; HttpOnly; Secure; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; ${domain}`
  ];

  res.setHeader('Set-Cookie', cookies);
  
  // Redirect back to the homepage to force the browser to acknowledge the change.
  res.writeHead(302, { Location: '/' });
  res.end();
}