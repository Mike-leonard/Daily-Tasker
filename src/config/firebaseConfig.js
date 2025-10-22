import Constants from 'expo-constants';

const manifestExtras =
  Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};
const firebaseExtras = manifestExtras.firebase ?? {};

const envFallback = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ??
    process.env.FIREBASE_API_KEY ??
    '',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    process.env.FIREBASE_AUTH_DOMAIN ??
    '',
  databaseURL:
    process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL ??
    process.env.FIREBASE_DATABASE_URL ??
    '',
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ??
    process.env.FIREBASE_PROJECT_ID ??
    '',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    process.env.FIREBASE_STORAGE_BUCKET ??
    '',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
    process.env.FIREBASE_MESSAGING_SENDER_ID ??
    '',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ??
    process.env.FIREBASE_APP_ID ??
    '',
};

export const firebaseConfig = {
  apiKey: firebaseExtras.apiKey ?? envFallback.apiKey,
  authDomain: firebaseExtras.authDomain ?? envFallback.authDomain,
  databaseURL: firebaseExtras.databaseURL ?? envFallback.databaseURL,
  projectId: firebaseExtras.projectId ?? envFallback.projectId,
  storageBucket: firebaseExtras.storageBucket ?? envFallback.storageBucket,
  messagingSenderId:
    firebaseExtras.messagingSenderId ?? envFallback.messagingSenderId,
  appId: firebaseExtras.appId ?? envFallback.appId,
};

export const isFirebaseConfigValid = Object.values(firebaseConfig).every(
  (value) => typeof value === 'string' && value.length > 0,
);

if (!isFirebaseConfigValid) {
  // eslint-disable-next-line no-console
  console.warn(
    '[firebase] Missing configuration. Ensure environment variables are set in .env/.env.local or supplied via Expo extra.',
  );
}
