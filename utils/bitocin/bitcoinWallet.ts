import {Alert} from 'react-native';
import {randomBytes} from 'react-native-randombytes';
import * as bip39 from 'bip39';
import * as Bitcoin from 'react-native-bitcoinjs-lib';
import useSecureStorage from '../../hooks/useSecureStorage';
import {Buffer} from 'buffer';
import {useWallet} from '../../context/WalletContext';
import BIP32Factory from 'bip32';
import * as ecc from '@bitcoinerlab/secp256k1';
import ECPairFactory from 'ecpair';
import axios from 'axios';

const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

const createNewWallet = async () => {
  const {storeData} = useSecureStorage();
  const {state, dispatch} = useWallet();
  try {
    const entropy = randomBytes(16);
    const entropyHex = Buffer.from(entropy).toString('hex');
    const newMnemonic = bip39.entropyToMnemonic(entropyHex);
    storeData('mnemonic', newMnemonic);
    const seed = await bip39.mnemonicToSeed(newMnemonic);

    const root = bip32.fromSeed(Buffer.from(seed));
    const child = root.derivePath("m/44'/1'/0'/0/0");
    const keyPair = ECPair.fromPrivateKey(child.privateKey);

    // setWallet(keyPair);
    // dispatch({type: 'SET_WALLET', payload: keyPair});
    // setMnemonic(newMnemonic);
    // dispatch({type: 'SET_MNEMONIC', payload: newMnemonic});

    const pubKeyHash = Bitcoin.crypto.hash160(keyPair.publicKey);
    const scriptPubKey = Bitcoin.script.compile([
      Bitcoin.opcodes.OP_DUP,
      Bitcoin.opcodes.OP_HASH160,
      pubKeyHash,
      Bitcoin.opcodes.OP_EQUALVERIFY,
      Bitcoin.opcodes.OP_CHECKSIG,
    ]);

    const address = Bitcoin.address.fromOutputScript(scriptPubKey, network);
    storeData('address', address);
    // setAddress(address);
    // dispatch({type: 'SET_ADDRESS', payload: address});

    Alert.alert('Success', 'Wallet created successfully');
  } catch (error) {
    console.error('Wallet creation error:', error);
  }
};

const fetchBalance = async (address: any) => {
  const {dispatch} = useWallet();
  try {
    const response = await axios.get(
      `https://mempool.space/testnet4/api/address/${address}`,
    );
    console.log('Balance response:', response.data);
    const {funded_txo_sum, spent_txo_sum} = response.data.chain_stats;
    const balance = (funded_txo_sum - spent_txo_sum) / 100000000;
    console.log('Balance:', balance);
    // setBalance(balance);
    // dispatch({type: 'SET_BALANCE', payload: balance});
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
};

const fetchTransactions = async (address: any) => {
  const {dispatch} = useWallet();
  try {
    const response = await axios.get(
      `https://mempool.space/testnet4/api/address/${address}/txs`,
    );
    // setTransactions(response.data);
    // dispatch({type: 'SET_TRANSACTIONS', payload: response.data});
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
};

const createTransaction = async () => {
  const {state} = useWallet();
  try {
    if (!state.wallet) throw new Error('No wallet loaded');

    const network = Bitcoin.networks.bitcoin;
    const txb = new Bitcoin.TransactionBuilder(network);

    // This is where you'd normally fetch UTXOs and add inputs
    // For demo purposes, we'll just create a basic transaction structure
    txb.addInput('prevTxId', 0); // Replace with actual UTXO

    const satoshis = Math.floor(parseFloat(amount) * 100000000);
    txb.addOutput(recipientAddress, satoshis);

    // Sign the transaction
    txb.sign(0, wallet);

    return txb.build().toHex();
  } catch (error) {
    Alert.alert('Error', error?.message);
    return null;
  }
};

export {createNewWallet, fetchBalance, fetchTransactions, createTransaction};
