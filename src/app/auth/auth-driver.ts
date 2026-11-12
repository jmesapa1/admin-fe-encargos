import { InjectionToken, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  User, browserLocalPersistence, onAuthStateChanged,
  setPersistence, signInWithEmailAndPassword, signOut
} from 'firebase/auth';

export interface AuthDriver {
  initialize(): Promise<void>;
  watch(next: (user: User | null) => void, error: () => void): () => void;
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
}

export const AUTH_DRIVER = new InjectionToken<AuthDriver>('Firebase authentication driver', {
  providedIn: 'root',
  factory: () => {
    const auth = inject(Auth);
    return {
      initialize: () => setPersistence(auth, browserLocalPersistence),
      watch: (next, error) => onAuthStateChanged(auth, next, error),
      login: async (email, password) => (await signInWithEmailAndPassword(auth, email, password)).user,
      logout: () => signOut(auth)
    };
  }
});
