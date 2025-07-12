import { Auth } from "@auth/core";
import GitHub from "@auth/core/providers/github";

export default Auth({
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
        session.user.id = token.sub; // 将 GitHub 用户 ID (token.sub) 添加到 session 中
      }
      return session;
    },
  },
});