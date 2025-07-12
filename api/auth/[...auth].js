import { serialize } from 'cookie';

export default async function handler(req, res) {
  const { code } = req.query;

  // 1. 如果没有 code，重定向到 GitHub 进行授权
  if (!code) {
    const GITHUB_CLIENT_ID = process.env.AUTH_GITHUB_ID;
    const redirectUri = `https://` + req.headers.host + `/api/auth/callback`;
    const scope = 'read:user';
    const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
    res.redirect(url);
    return;
  }

  // 2. 如果有 code (从 GitHub 回调)
  try {
    const GITHUB_CLIENT_ID = process.env.AUTH_GITHUB_ID;
    const GITHUB_CLIENT_SECRET = process.env.AUTH_GITHUB_SECRET;

    // 交换 code 获取 access_token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      throw new Error(tokenData.error_description);
    }
    const { access_token } = tokenData;

    // 使用 access_token 获取用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${access_token}`,
      },
    });
    const userData = await userResponse.json();

    // 创建 session 对象
    const session = {
      user: {
        id: userData.id,
        name: userData.name || userData.login,
        image: userData.avatar_url,
      },
      accessToken: access_token,
    };

    // 将 session 信息加密并存储在 cookie 中
    // 注意：这里为了简单，直接存储了 JSON。生产环境应使用加密库如 iron-session。
    const cookie = serialize('app_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    res.setHeader('Set-Cookie', cookie);
    res.redirect('/');

  } catch (error) {
    console.error('GitHub OAuth Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}