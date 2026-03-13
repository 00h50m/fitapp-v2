import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession]   = useState(null);
  const [user, setUser]         = useState(null);
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const mountedRef              = useRef(true);

  const loadProfile = async (userId) => {
    try {
      // Tenta primeiro por user_id (coluna real da tabela conforme schema)
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      // Fallback: tenta por id (caso profiles.id == auth.uid)
      if (!data && !error) {
        const res = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        data  = res.data;
        error = res.error;
      }

      if (!mountedRef.current) return;
      if (error) {
        const isAbort = err?.name === "AbortError" || err?.message?.includes("aborted");
        if (!isAbort) console.error("loadProfile error:", error);
      }
      setProfile(data ?? null);
    } catch (err) {
      const isAbort = err?.name === "AbortError" || err?.message?.includes("aborted");
      if (!isAbort) console.error("loadProfile error:", err);
      if (mountedRef.current) setProfile(null);
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    // Safety timeout — nunca fica em loading infinito
    const safetyTimeout = setTimeout(() => {
      if (mountedRef.current) setLoading(false);
    }, 8000);

    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sess = data?.session ?? null;
        if (!mountedRef.current) return;
        setSession(sess);
        setUser(sess?.user ?? null);
        if (sess?.user) await loadProfile(sess.user.id);
      } catch (err) {
        if (err?.name !== "AbortError") console.error("initAuth:", err);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, sess) => {
        if (!mountedRef.current) return;
        setSession(sess);
        setUser(sess?.user ?? null);
        if (sess?.user) {
          await loadProfile(sess.user.id);
        } else {
          setProfile(null);
        }
        if (mountedRef.current) setLoading(false);
      }
    );

    return () => {
      mountedRef.current = false;
      clearTimeout(safetyTimeout);
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const isAdmin         = profile?.role === "admin" || profile?.is_admin === true;
  const isStudent       = profile?.role === "student";
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      session, user, profile, loading,
      login, logout, isAdmin, isStudent, isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);