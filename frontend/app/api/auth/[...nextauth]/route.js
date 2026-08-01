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
    async signIn({ user, account }) {
      console.log("🔄 signIn Google:", { provider: account?.provider, email: user?.email });
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.provider = "google";
        // Créer ou récupérer l'utilisateur dans votre backend
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/google/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
            }),
          });
          const data = await response.json();
          if (data.user) {
            token.id = data.user.id;
            token.email = data.user.email;
            token.name = data.user.name;
          }
        } catch (error) {
          console.error('Erreur callback Google:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.provider = token.provider || "google";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl + '/profile/complete';
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
    maxAge: 30 * 24 * 60 * 60,
  },
});

export { handler as GET, handler as POST };
