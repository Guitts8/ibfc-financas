/**
 * Inicialização do Firebase para o app IBFC Finanças.
 *
 * Usamos o Firebase JS SDK (não o react-native-firebase), pois ele funciona
 * no Expo Go — ideal para a fase de testes entre poucas pessoas, sem precisar
 * gerar um build nativo.
 *
 * As credenciais vêm de variáveis de ambiente com prefixo EXPO_PUBLIC_, que o
 * Expo injeta no app automaticamente (ver arquivo .env, fora do controle de
 * versão). Os valores da config "web" do Firebase NÃO são segredos — eles
 * sempre ficam embutidos no app cliente; a segurança real vem das Regras de
 * Segurança do Firestore (ver firestore.rules).
 */

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
// Importamos o Auth do pacote escopado @firebase/auth (não de 'firebase/auth'):
// no Firebase 12 o subcaminho 'firebase/auth' resolve para o build de browser,
// que NÃO contém getReactNativePersistence. O pacote escopado tem a condição
// de export "react-native", então o Metro carrega o build de RN no celular
// (com a persistência) e o de browser na web. O registro do Firebase é
// compartilhado porque 'firebase/app' apenas re-exporta '@firebase/app'.
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  type Auth,
} from '@firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** Verdadeiro quando o .env foi preenchido com as credenciais do Firebase. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

if (!isFirebaseConfigured) {
  console.warn(
    '[IBFC] Firebase ainda não configurado. Copie .env.example para .env e ' +
      'preencha as credenciais do seu projeto Firebase. Veja o README.',
  );
}

// Evita reinicializar em hot reload (Fast Refresh).
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * No React Native, inicializamos o Auth com persistência via AsyncStorage para
 * manter o usuário logado entre reinícios. Na web usamos getAuth padrão.
 */
export const auth: Auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

export const db = getFirestore(app);

export default app;
