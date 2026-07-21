import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // Simulation - à remplacer par votre backend
        if (credentials.email === 'demo@massaguet.com' && credentials.password === 'demo123') {
          return {
            id: '1',
            name: 'Utilisateur Demo',
            email: 'demo@massaguet.com',
            role: 'USER',
          };
        }
        return null;
      }
    })
  ],
  
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        console.log('Connexion Google:', user.email);
        return true;
      }
      return true;
    },
    
    async jwt({ token, user, account }) {
      // Connexion Google
      if (account?.provider === 'google' && user) {
        token.id = user.id || `google_${Date.now()}`;
        token.email = user.email;
        token.name = user.name;
        token.role = 'USER';
      }
      
      // Connexion Credentials
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        // @ts-ignore - rôle ajouté dynamiquement
        token.role = user.role || 'USER';
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        // @ts-ignore - rôle ajouté dynamiquement
        session.user.role = token.role as string;
      }
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || 'development_secret_key',
});

export { handler as GET, handler as POST };
