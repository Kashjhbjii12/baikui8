import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, firebaseInitError } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (firebaseInitError) {
      console.error("Firebase initialization failed:", firebaseInitError);
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Check if the user exists in the admins collection
        const adminRef = doc(db, "admins", firebaseUser.uid);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
          setUser(firebaseUser);
          setIsAdmin(true);
          setAuthError(null);
        } else {
          const message = "User is not an admin.";
          console.warn(message);
          setAuthError(message);
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Authentication Error:", error);
        setAuthError(error.message || "Authentication error");
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        authError,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    return {
      user: null,
      isAdmin: false,
      loading: false,
      authError: null,
      setAuthError: () => {},
    };
  }
  return context;
};