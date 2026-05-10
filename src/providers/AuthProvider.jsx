import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, getDocFromCache, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, hasFirebaseConfig } from '../firebase.js';

const AuthContext = createContext(null);

function authProfileFallback(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    fullName: firebaseUser.displayName || 'qiparh user',
    email: firebaseUser.email || '',
    role: 'Personal command center owner',
    location: '',
    bio: '',
    offline: true,
  };
}

async function loadUserProfile(firebaseUser) {
  const userRef = doc(db, 'users', firebaseUser.uid);
  try {
    const snap = await getDoc(userRef);
    return snap.exists() ? snap.data() : authProfileFallback(firebaseUser);
  } catch (error) {
    try {
      const cachedSnap = await getDocFromCache(userRef);
      if (cachedSnap.exists()) return cachedSnap.data();
    } catch {
      // Firestore has no cached profile yet. Use Firebase Auth data until the network recovers.
    }
    console.warn('Profile unavailable from Firestore; using auth fallback.', error);
    return authProfileFallback(firebaseUser);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasFirebaseConfig) {
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const nextProfile = await loadUserProfile(firebaseUser);
        setProfile(nextProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    hasFirebaseConfig,
    async login(email, password) {
      return signInWithEmailAndPassword(auth, email, password);
    },
    async register(fullName, email, password) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: fullName });
      const profileData = {
        fullName,
        email,
        createdAt: serverTimestamp(),
        role: 'Personal command center owner',
        location: '',
        bio: '',
      };
      await setDoc(doc(db, 'users', credential.user.uid), profileData, { merge: true });
      setProfile(profileData);
      return credential;
    },
    async logout() {
      return signOut(auth);
    },
  }), [loading, profile, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
