/**
 * Contexto de autenticação do IBFC Finanças.
 *
 * Disponibiliza o usuário logado e as ações de cadastro/login/logout para toda
 * a árvore de componentes. Use o hook `useAuth()` nas telas.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
// Mesmo pacote escopado usado em firebase/config.ts, para garantir uma única
// instância do Auth (ver comentário em config.ts).
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from '@firebase/auth';
import { auth } from '@/firebase/config';

interface AuthContextValue {
  /** Usuário logado, ou null se não autenticado. */
  user: User | null;
  /** True enquanto o estado inicial de auth está sendo carregado. */
  initializing: boolean;
  signUp: (params: { name: string; email: string; password: string }) => Promise<void>;
  signIn: (params: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Traduz os códigos de erro do Firebase Auth para mensagens amigáveis. */
function traduzErroAuth(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.';
    case 'auth/weak-password':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha incorretos.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    case 'auth/network-request-failed':
      return 'Falha de conexão. Verifique sua internet.';
    default:
      return 'Não foi possível concluir. Tente novamente.';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      async signUp({ name, email, password }) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
          if (name.trim()) {
            await updateProfile(cred.user, { displayName: name.trim() });
            setUser({ ...cred.user });
          }
        } catch (e: any) {
          throw new Error(traduzErroAuth(e?.code ?? ''));
        }
      },
      async signIn({ email, password }) {
        try {
          await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (e: any) {
          throw new Error(traduzErroAuth(e?.code ?? ''));
        }
      },
      async signOut() {
        await fbSignOut(auth);
      },
    }),
    [user, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  }
  return ctx;
}
