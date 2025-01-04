import {useState, useCallback} from 'react';
import * as bitcoin from 'bitcoinjs-lib';
import {BIP32Factory} from 'bip32';
import * as ecc from '@bitcoinerlab/secp256k1';
import {mnemonicToSeedSync} from 'bip39';
import * as bip39 from 'bip39';
import axios from 'axios';
import * as ecpair from 'ecpair';

// Constants
const NETWORK = bitcoin.networks.testnet; // Use networks.testnet for testnet
const PATH = `m/84'/0'/0'/0/0`; // BIP84 path for native segwit
const MEMPOOL_API = 'https://mempool.space/testnet4/api';

// Initialize ECPair
const ECPair = ecpair.ECPairFactory(ecc);

// Types
interface Transaction {
  txid: string;
  value: number;
  status: 'confirmed' | 'pending';
  timestamp: number;
  type: 'sent' | 'received';
}

interface WalletInfo {
  address: string;
  publicKey: string;
  privateKey: string;
  mnemonic: string;
}

interface SendBitcoinParams {
  toAddress: string;
  amount: number; // in BTC
  feeRate: number; // in sat/vB
}

export const useBitcoin = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [creatingWallet, setCreatingWallet] = useState<boolean>(false);
  const [importingWallet, setImportingWallet] = useState<boolean>(false);
  const [sendingBitcoin, setSendingBitcoin] = useState<boolean>(false);
  const [gettingBalance, setGettingBalance] = useState<boolean>(false);
  const [gettingTransactions, setGettingTransactions] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize BIP32
  const bip32 = BIP32Factory(ecc);

  // Create new wallet
  const createWallet = useCallback(async () => {
    setCreatingWallet(true);
    setError(null);

    try {
      const mnemonic = bip39.generateMnemonic();
      const seed = mnemonicToSeedSync(mnemonic);
      const root = bip32.fromSeed(seed);
      const child = root.derivePath(PATH);
      const pubkeyBuffer = Buffer.from(child.publicKey);

      const {address} = bitcoin.payments.p2wpkh({
        pubkey: pubkeyBuffer,
        network: NETWORK,
      });

      const newWalletInfo: WalletInfo = {
        address: address!,
        publicKey: pubkeyBuffer.toString('hex'),
        privateKey: Buffer.from(child.privateKey!).toString('hex'),
        mnemonic,
      };

      setWalletInfo(newWalletInfo);
      return newWalletInfo;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setCreatingWallet(false);
    }
  }, []);

  // Import wallet from mnemonic
  const importWallet = useCallback(async (mnemonic: string) => {
    setImportingWallet(true);
    setError(null);

    try {
      if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic phrase');
      }

      const seed = mnemonicToSeedSync(mnemonic);
      const root = bip32.fromSeed(seed);
      const child = root.derivePath(PATH);
      const pubkeyBuffer = Buffer.from(child.publicKey);

      const {address} = bitcoin.payments.p2wpkh({
        pubkey: pubkeyBuffer,
        network: NETWORK,
      });

      const importedWalletInfo: WalletInfo = {
        address: address!,
        publicKey: pubkeyBuffer.toString('hex'),
        privateKey: Buffer.from(child.privateKey!).toString('hex'),
        mnemonic,
      };

      setWalletInfo(importedWalletInfo);
      return importedWalletInfo;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setImportingWallet(false);
    }
  }, []);

  // Get wallet balance
  const getBalance = useCallback(
    async (address?: string) => {
      setGettingBalance(true);
      setError(null);

      try {
        const targetAddress = address || walletInfo?.address;
        if (!targetAddress) throw new Error('No wallet address available');

        const response = await axios.get(
          `${MEMPOOL_API}/address/${targetAddress}`,
        );

        const {chain_stats} = response.data;
        const balanceInBTC =
          (chain_stats.funded_txo_sum - chain_stats.spent_txo_sum) / 100000000;

        setBalance(balanceInBTC);
        return balanceInBTC;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setGettingBalance(false);
      }
    },
    [walletInfo],
  );

  // Get transaction history
  const getTransactions = useCallback(
    async (address?: string) => {
      setGettingTransactions(true);
      setError(null);

      try {
        const targetAddress = address || walletInfo?.address;
        if (!targetAddress) throw new Error('No wallet address available');

        const response = await axios.get(
          `${MEMPOOL_API}/address/${targetAddress}/txs`,
        );

        const formattedTxs: Transaction[] = response.data.map((tx: any) => ({
          txid: tx.txid,
          value: tx.value / 100000000,
          status: tx.status.confirmed ? 'confirmed' : 'pending',
          timestamp: tx.status.block_time,
          type: tx.vin.some(
            (input: any) =>
              input.prevout.scriptpubkey_address === targetAddress,
          )
            ? 'sent'
            : 'received',
        }));

        setTransactions(formattedTxs);
        return formattedTxs;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setGettingTransactions(false);
      }
    },
    [walletInfo],
  );

  // Send Bitcoin
  const sendBitcoin = useCallback(
    async ({toAddress, amount, feeRate}: SendBitcoinParams) => {
      setSendingBitcoin(true);
      setError(null);

      try {
        if (!walletInfo) throw new Error('No wallet loaded');

        try {
          bitcoin.address.toOutputScript(toAddress, NETWORK);
        } catch (err) {
          throw new Error('Invalid Bitcoin address');
        }

        const utxosResponse = await axios.get(
          `${MEMPOOL_API}/address/${walletInfo.address}/utxo`,
        );
        const utxos = utxosResponse.data;

        // Create transaction
        const psbt = new bitcoin.Psbt({network: NETWORK});

        let totalInput = 0;
        for (const utxo of utxos) {
          totalInput += utxo.value;
          const witnessScript = Buffer.from(utxo.scriptpubkey, 'hex');
          psbt.addInput({
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
              script: witnessScript,
              value: utxo.value,
            },
          });
        }

        const amountInSats = Math.floor(amount * 100000000);
        const estimatedSize = 200;
        const fee = estimatedSize * feeRate;
        const change = totalInput - amountInSats - fee;

        if (change < 0) {
          throw new Error('Insufficient funds');
        }

        // Add outputs
        psbt.addOutput({
          address: toAddress,
          value: amountInSats,
        });

        if (change > 0) {
          psbt.addOutput({
            address: walletInfo.address,
            value: change,
          });
        }

        // Sign transaction
        const keyPair = ECPair.fromPrivateKey(
          Buffer.from(walletInfo.privateKey, 'hex'),
        );

        for (let i = 0; i < psbt.inputCount; i++) {
          psbt.signInput(i, keyPair);
        }

        psbt.finalizeAllInputs();

        const tx = psbt.extractTransaction();

        // Broadcast transaction
        const broadcastResponse = await axios.post(
          `${MEMPOOL_API}/tx`,
          tx.toHex(),
          {
            headers: {'Content-Type': 'text/plain'},
          },
        );

        return broadcastResponse.data; // Returns transaction ID
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setSendingBitcoin(false);
      }
    },
    [walletInfo],
  );

  return {
    walletInfo,
    balance,
    transactions,
    creatingWallet,
    importingWallet,
    sendingBitcoin,
    gettingBalance,
    gettingTransactions,
    error,
    createWallet,
    importWallet,
    getBalance,
    getTransactions,
    sendBitcoin,
  };
};
