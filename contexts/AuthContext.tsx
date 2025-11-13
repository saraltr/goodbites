"use client";

import { auth } from "@/utils/FirebaseConfig"; 
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType } from "@/lib/types";


// create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => null,
  logout: async () => {},
});

// provider component to wrap the app
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // store the current user
  const [user, setUser] = useState<User | null>(null);
  // store loading state while checking auth
  const [loading, setLoading] = useState(true);

  // subscribe to firebase auth state changes on mount
  useEffect(() => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // update user state
      setLoading(false); // finished checking
    });

    // unsubscribe on unmount
    return unsubscribe;
  }, []);

  useEffect(() => {
  if (!auth) return; // safety check
  
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
    setLoading(false);
  });

  return unsubscribe;
}, []);


  // function to login user with email and password
  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // update user state after login
    setUser(userCredential.user);
    return userCredential.user;
  };

  // function to logout current user
  const logout = async () => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    await signOut(auth);
    setUser(null);
  };

  // provide auth values to all children
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// hook to access auth 
export const useAuth = () => useContext(AuthContext);