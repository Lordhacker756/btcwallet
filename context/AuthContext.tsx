import React, {createContext, useState, useContext, ReactNode} from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signIn = () => {
    // Add your authentication logic here
    setIsAuthenticated(true);
  };

  const signOut = () => {
    // Add your sign out logic here
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
