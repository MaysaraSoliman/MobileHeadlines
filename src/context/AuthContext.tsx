import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import * as SecureStore from "expo-secure-store";
import { gql, useQuery, useApolloClient } from "@apollo/client";

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      role
      createdAt
      updatedAt
    }
  }
`;

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const client = useApolloClient();

  // We use skip: true initially because we might not have a token yet
  // We will manually refetch when we know we have a token
  const {
    data,
    loading: queryLoading,
    refetch,
    error,
  } = useQuery(ME_QUERY, {
    skip: true, // Don't run immediately, we'll handle it
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (token) {
          // If token exists, try to fetch user
          const result = await refetch();
          if (result.data?.me) {
            setUser(result.data.me);
          }
        }
      } catch (e) {
        console.log("Failed to load user session", e);
        // If error (e.g. token expired), clear it
        await SecureStore.deleteItemAsync("token");
      } finally {
        setInitializing(false);
      }
    };
    loadUser();
  }, []);

  const signIn = async (token: string) => {
    try {
      await SecureStore.setItemAsync("token", token);
      // Reset store to clear any old data and ensure fresh headers are used
      await client.resetStore();
      const result = await refetch();
      if (result.data?.me) {
        setUser(result.data.me);
      }
    } catch (e) {
      console.error("Sign in error", e);
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync("token");
      setUser(null);
      await client.clearStore();
    } catch (e) {
      console.error("Sign out error", e);
    }
  };

  // If query returns data, sync it (in case of background refetches)
  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    }
  }, [data]);

  const refreshUser = async () => {
    try {
      const result = await refetch();
      if (result.data?.me) {
        setUser(result.data.me);
      }
    } catch (e) {
      console.error("Failed to refresh user", e);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading: initializing || (queryLoading && !user),
      signIn,
      signOut,
      refreshUser,
    }),
    [user, initializing, queryLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
