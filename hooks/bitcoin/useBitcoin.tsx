import {useState, useCallback} from 'react';
import * as bitcoin from 'bitcoinjs-lib';
import {BIP32Factory} from 'bip32';
import * as ecc from '@bitcoinerlab/secp256k1';
import {mnemonicToSeedSync} from 'bip39';
import * as bip39 from 'bip39';
import axios from 'axios';
import * as ecpair from 'ecpair';

// Constants
const NETWORK = bitcoin.networks.testnet;
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
      // HD Wallet
      const mnemonic = bip39.generateMnemonic();
      const seed = mnemonicToSeedSync(mnemonic);
      const root = bip32.fromSeed(seed);
      const child = root.derivePath(PATH); //Native Segwit
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

        console.log('getTransactions::', response.data);

        const formattedTxs: Transaction[] = response.data.map((tx: any) => {
          // Calculate the total input and output values for the target address
          const totalInput = tx.vin
            .filter(
              (input: any) =>
                input.prevout.scriptpubkey_address === targetAddress,
            )
            .reduce((sum: number, input: any) => sum + input.prevout.value, 0);

          const totalOutput = tx.vout
            .filter(
              (output: any) => output.scriptpubkey_address === targetAddress,
            )
            .reduce((sum: number, output: any) => sum + output.value, 0);

          // Calculate transaction amount
          const amount = totalOutput - totalInput;

          return {
            txid: tx.txid,
            value: amount / 100000000, // Convert from satoshis to BTC
            status: tx.status.confirmed ? 'confirmed' : 'pending',
            timestamp: tx.status.block_time,
            type: amount < 0 ? 'sent' : 'received',
          };
        });

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
        console.log('UTXOs:', JSON.stringify(utxos, null, 2));

        // Fetch complete UTXO information for each UTXO
        const completeUtxos = await Promise.all(
          utxos.map(async (utxo: any) => {
            const txResponse = await axios.get(
              `${MEMPOOL_API}/tx/${utxo.txid}`,
            );
            const tx = txResponse.data;
            return {
              ...utxo,
              scriptpubkey: tx.vout[utxo.vout].scriptpubkey,
              scriptpubkey_asm: tx.vout[utxo.vout].scriptpubkey_asm,
              scriptpubkey_type: tx.vout[utxo.vout].scriptpubkey_type,
            };
          }),
        );

        // Create transaction
        const psbt = new bitcoin.Psbt({network: NETWORK});

        let totalInput = 0;
        for (const utxo of completeUtxos) {
          console.log('Processing UTXO:', {
            txid: utxo.txid,
            scriptpubkey: utxo.scriptpubkey,
            value: utxo.value,
            vout: utxo.vout,
          });

          totalInput += utxo.value;
          const txid = Buffer.from(utxo.txid, 'hex').reverse();
          console.log('TXID Buffer created:', txid);

          const witnessScript = Buffer.from(utxo.scriptpubkey, 'hex');
          console.log('Witness Script Buffer created:', witnessScript);

          psbt.addInput({
            hash: txid,
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
        console.log('Private key hex:', walletInfo.privateKey);
        const keyPair = ECPair.fromPrivateKey(
          Buffer.from(walletInfo.privateKey, 'hex'),
          {network: NETWORK},
        );
        console.log('KeyPair created:', {
          publicKey: keyPair.publicKey.toString('hex'),
          compressed: keyPair.compressed,
        });

        for (let i = 0; i < psbt.inputCount; i++) {
          psbt.signInput(i, {
            publicKey: Buffer.from(keyPair.publicKey),
            sign: (hash: Buffer) => {
              console.log('Signing hash:', hash.toString('hex'));
              const sig = keyPair.sign(hash);
              return Buffer.from(sig);
            },
          });
        }

        psbt.finalizeAllInputs();

        const tx = psbt.extractTransaction();

        console.log('Transaction:', tx.toHex());

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
        console.log('Error insendBitcoin::', err);
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
