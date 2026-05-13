'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserProfile, createUserProfile } from '../lib/firestore';
import type { UserProfile, UserRole } from '../types';

interface AuthContextValue {
  firebaseUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string, displayNameAr: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(user: User) {
    const profile = await getUserProfile(user.uid);
    setUserProfile(profile);
  }

  useEffect(() => {
    // Handle the result when returning from a Google redirect sign-in
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const user = result.user;
          const existing = await getUserProfile(user.uid);
          if (!existing) {
            await createUserProfile({
              uid: user.uid,
              email: user.email ?? '',
              displayName: user.displayName ?? '',
              displayNameAr: user.displayName ?? '',
              role: 'student' as UserRole,
              isActive: true,
            });
          }
        }
      })
      .catch(() => {});

    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await loadProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
    // Page navigates away — result is handled in getRedirectResult above
  }

  async function signUp(email: string, password: string, displayName: string, displayNameAr: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await createUserProfile({
      uid: result.user.uid,
      email,
      displayName,
      displayNameAr,
      role: 'student' as UserRole,
      isActive: true,
    });
  }

  async function logOut() {
    await signOut(auth);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async function refreshProfile() {
    if (firebaseUser) await loadProfile(firebaseUser);
  }

  return (
    <AuthContext.Provider
      value={{ firebaseUser, userProfile, loading, signIn, signInWithGoogle, signUp, logOut, resetPassword, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
