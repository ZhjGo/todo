import { kv } from '@vercel/kv';
import { Auth } from '@auth/core';
import GitHub from '@auth/core/providers/github';

// 这是一个辅助函数，用于从请求中获取会话信息
async function getSession(request) {
  // Auth.js 在 Vercel Edge 环境中需要完整的 Request 对象
  // 我们需要构造一个符合要求的对象
  const url = new URL(request.url, `https://${request.headers.host}`);
  const req = new Request(url, {
    headers: request.headers,
    method: request.method,
    body: request.method === 'POST' ? JSON.stringify(request.body) : undefined,
    credentials: 'omit',
  });

  return await Auth(req, {
    providers: [
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
      }),
    ],
    secret: process.env.AUTH_SECRET,
    callbacks: {
      async session({ session, token }) {
        if (session?.user) {
          session.user.id = token.sub;
        }
        return session;
      },
    },
  });
}

export default async function handler(request, response) {
  const session = await getSession(request);

  if (!session?.user?.id) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;
  const userTasksKey = `tasks:${userId}`;
  const { method } = request;

  switch (method) {
    case 'GET':
      try {
        const tasks = await kv.get(userTasksKey);
        return response.status(200).json(tasks || []);
      } catch (error) {
        return response.status(500).json({ error: 'Failed to fetch tasks.' });
      }
    case 'POST':
      try {
        const tasks = request.body;
        await kv.set(userTasksKey, tasks);
        return response.status(200).json({ success: true });
      } catch (error) {
        return response.status(500).json({ error: 'Failed to save tasks.' });
      }
    default:
      response.setHeader('Allow', ['GET', 'POST']);
      response.status(405).end(`Method ${method} Not Allowed`);
  }
}