import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { code } = req.query;

  // 1. 如果没有 code，重定向到 Google 进行授权
  if (!code) {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `https://` + req.headers.host + `/api/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    res.redirect(url);
    return;
  }

  // 2. 如果有 code (从 Google 回调)
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `https://` + req.headers.host + `/api/auth/google/callback`;

    // 交换 code 获取 access_token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      throw new Error(tokenData.error_description);
    }
    const { access_token } = tokenData;

    // 使用 access_token 获取用户信息
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const userData = await userResponse.json();

    // 创建用于 Token 的 user 对象
    const user = {
      id: `google:${userData.id}`, // 加上 provider 前缀确保唯一性
      name: userData.name,
      image: userData.picture,
    };

    // 从环境变量获取 JWT_SECRET
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables.');
      return res.status(500).json({ error: 'Authentication configuration error.' });
    }

    // 创建 JWT
    const token = jwt.sign({ user }, JWT_SECRET, {
      expiresIn: '7d', // Token 有效期为 7 天
    });

    // 重定向回首页，并在 URL 中附带 token
    const redirectUrl = new URL('/', `https://${req.headers.host}`);
    redirectUrl.searchParams.set('token', token);

    res.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('Google OAuth Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}