import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

// Forcer l'URL de production
const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction 
  ? 'https://bibliotheque-frontend-ec0x.onrender.com'
  : 'http://localhost:3000';

console.log('🔧 Environnement:', process.env.NODE_ENV);
console.log('🔧 Base URL:', baseUrl);

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
        console.log('✅ Connexion Google:', user.email);
        return true;
      }
      return true;
    },
    
    async jwt({ token, user, account }) {
      if (account?.provider === 'google' && user) {
        token.id = user.id || `google_${Date.now()}`;
        token.email = user.email;
        token.name = user.name;
        token.role = 'USER';
      }
      
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role || 'USER';
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    },
    
    async redirect({ url, baseUrl: base }) {
      console.log('🔄 Redirection:', { url, base });
      // Utiliser l'URL forcée
      const finalBase = isProduction 
        ? 'https://bibliotheque-frontend-ec0x.onrender.com'
        : 'http://localhost:3000';
      
      if (url.startsWith('/')) return `${finalBase}${url}`;
      else if (new URL(url).origin === finalBase) return url;
      return finalBase;
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
  
  debug: true,
  secret: process.env.NEXTAUTH_SECRET || 'development_secret_key',
  // Forcer l'URL
  url: baseUrl,
});

export { handler as GET, handler as POST };
