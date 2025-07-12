import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const token = authHeader.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables.');
    return res.status(500).json({ error: 'Authentication configuration error.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded 结构是 { user: { id, name, image }, iat, exp }
    // 我们只返回 user 部分，以保持和旧 session 结构兼容
    res.status(200).json({ user: decoded.user });
  } catch (error) {
    // 如果 token 过期或无效，会抛出错误
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}