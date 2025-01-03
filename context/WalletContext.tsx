import React, { createContext, useReducer, useContext, ReactNode, Dispatch } from 'react';

interface WalletState {
  wallet: any;
  mnemonic: string;
  address: string;
  balance: number;
  transactions: any[];
}

interface WalletAction {
  type: 'SET_WALLET' | 'SET_MNEMONIC' | 'SET_ADDRESS' | 'SET_BALANCE' | 'SET_TRANSACTIONS';
  payload: any;
}

const WalletContext = createContext<{ state: WalletState; dispatch: Dispatch<WalletAction> } | undefined>(undefined);

const initialState: WalletState = {
  wallet: null,
  mnemonic: '',
  address: '',
  balance: 0,
  transactions: [],
};

const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
  switch (action.type) {
    case 'SET_WALLET':
      return { ...state, wallet: action.payload };
    case 'SET_MNEMONIC':
      return { ...state, mnemonic: action.payload };
    case 'SET_ADDRESS':
      return { ...state, address: action.payload };
    case 'SET_BALANCE':
      return { ...state, balance: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    default:
      return state;
  }
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  return (
    <WalletContext.Provider value={{ state, dispatch }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};