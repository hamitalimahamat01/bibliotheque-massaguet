import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

console.log("🔧 NextAuth route chargée");
console.log("📌 GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Défini" : "❌ Non défini");
console.log("📌 NEXTAUTH_URL:", process.env.NEXTAUTH_URL);

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("🔄 signIn:", { provider: account?.provider, email: user?.email });
      // Accepter toutes les tentatives de connexion
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log("🔄 redirect:", { url, baseUrl });
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }) {
      console.log("🔄 session:", { user: session?.user?.email });
      return session;
    },
    async jwt({ token, user, account }) {
      console.log("🔄 jwt:", { hasUser: !!user, hasAccount: !!account, provider: account?.provider });
      if (account?.provider === "google" && user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "secret",
  debug: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

export { handler as GET, handler as POST };
