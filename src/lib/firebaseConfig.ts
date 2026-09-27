export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const FIREBASE_CONFIG_STORAGE_KEY = "wfa_job_firebase_config_v1";

export function getFirebaseConfig(): FirebaseClientConfig | null {
  // 1. Check local storage override first (set via UI)
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.projectId && parsed.apiKey) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Check environment variables
  const envProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const envApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (envProjectId && envApiKey) {
    return {
      apiKey: envApiKey,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    };
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseClientConfig): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  }
}

export function clearFirebaseConfig(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
  }
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null;
}
