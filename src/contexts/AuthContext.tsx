import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import i18n from "@/i18n";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/* ── Split into two contexts to avoid cascading re-renders ── */

interface AuthSessionState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface AuthProfileState {
  profile: Profile | null;
  role: AppRole | null;
  refreshProfile: () => Promise<void>;
}

// Combined type for backward compatibility
type AuthState = AuthSessionState & AuthProfileState;

const AuthSessionContext = createContext<AuthSessionState | undefined>(undefined);
const AuthProfileContext = createContext<AuthProfileState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndRole = useCallback(async (userId: string) => {
    const [profileRes, roleRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.rpc("get_user_role", { _user_id: userId }),
    ]);
    if (profileRes.data) {
      setProfile(profileRes.data);
      const lang = profileRes.data.language || "en";
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
    if (roleRes.data) setRole(roleRes.data);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfileAndRole(user.id);
  }, [user, fetchProfileAndRole]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchProfileAndRole(session.user.id), 0);
        } else {
          setProfile(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfileAndRole]);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signInAnonymously = useCallback(async () => {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  // Stabilise context value objects so consumers don't re-render on unrelated state changes
  const sessionValue = useMemo<AuthSessionState>(
    () => ({ session, user, loading, signUp, signIn, signInAnonymously, signOut }),
    [session, user, loading, signUp, signIn, signInAnonymously, signOut]
  );

  const profileValue = useMemo<AuthProfileState>(
    () => ({ profile, role, refreshProfile }),
    [profile, role, refreshProfile]
  );

  return (
    <AuthSessionContext.Provider value={sessionValue}>
      <AuthProfileContext.Provider value={profileValue}>
        {children}
      </AuthProfileContext.Provider>
    </AuthSessionContext.Provider>
  );
};

/** Use only session/auth actions — won't re-render when profile changes */
export const useAuthSession = () => {
  const context = useContext(AuthSessionContext);
  if (!context) throw new Error("useAuthSession must be used within AuthProvider");
  return context;
};

/** Use only profile/role — won't re-render when session token refreshes */
export const useAuthProfile = () => {
  const context = useContext(AuthProfileContext);
  if (!context) throw new Error("useAuthProfile must be used within AuthProvider");
  return context;
};

/** Combined hook for backward compatibility — re-renders on any auth change */
export const useAuth = (): AuthState => {
  const sessionCtx = useAuthSession();
  const profileCtx = useAuthProfile();
  return { ...sessionCtx, ...profileCtx };
};
