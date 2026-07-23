import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

console.log("🔧 NextAuth route chargée");

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
      // Accepter la connexion
      return true;
    },
    async jwt({ token, user, account }) {
      console.log("🔄 jwt:", { hasUser: !!user, provider: account?.provider });
      if (account?.provider === "google" && user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.provider = "google";
      }
      return token;
    },
    async session({ session, token }) {
      console.log("🔄 session:", { user: session?.user?.email });
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.provider = token.provider;
        // Marquer que l'utilisateur est connecté
        session.user.isAuthenticated = true;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("🔄 redirect:", { url, baseUrl });
      // Rediriger vers la page de complétion de profil
      // Si l'utilisateur vient de se connecter
      if (url === '/profile') {
        return `${baseUrl}/profile`;
      }
      // Si c'est une URL relative
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Si c'est une URL absolue sur le même domaine
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Par défaut, rediriger vers le dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "secret",
  debug: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
});

export { handler as GET, handler as POST };
