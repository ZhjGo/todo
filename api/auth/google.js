import { serialize } from 'cookie';

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

    // 创建 session 对象
    const session = {
      user: {
        id: `google-${userData.id}`, // 添加前缀以区分不同提供商的用户
        name: userData.name,
        image: userData.picture,
      },
      accessToken: access_token,
    };

    // 将 session 信息存储在 cookie 中
    const cookie = serialize('app_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);
    res.redirect('/');

  } catch (error) {
    console.error('Google OAuth Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}