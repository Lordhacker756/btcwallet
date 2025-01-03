import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import './shim';
import * as Bitcoin from 'react-native-bitcoinjs-lib';
import {randomBytes} from 'react-native-randombytes';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import * as ecc from '@bitcoinerlab/secp256k1';
import ECPairFactory from 'ecpair';
import axios from 'axios';
import GradientBackground from './components/GradientBackground';
import TransactionList from './components/TransactionList';
import useSecureStorage from './hooks/useSecureStorage';
import {Buffer} from 'buffer';

const network = Bitcoin.networks.testnet;
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

const App = () => {
  const [wallet, setWallet] = useState(null);
  const [mnemonic, setMnemonic] = useState('');
  const [address, setAddress] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [utxos, setUTXOs] = useState([]);
  const {loading, error, storeData, getData, removeData} = useSecureStorage();

  const loadWallet = async () => {
    try {
      const mnemonic = await getData('mnemonic');
      if (mnemonic) {
        setMnemonic(mnemonic);
      }

      const address = await getData('address');
      if (address) {
        setAddress(address);
      }
    } catch {
      console.error('Error loading wallet:', error);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const createNewWallet = async () => {
    try {
      const entropy = randomBytes(16);
      const entropyHex = Buffer.from(entropy).toString('hex');
      const newMnemonic = bip39.entropyToMnemonic(entropyHex);
      storeData('mnemonic', newMnemonic);
      const seed = await bip39.mnemonicToSeed(newMnemonic);

      const root = bip32.fromSeed(Buffer.from(seed));
      const child = root.derivePath("m/44'/1'/0'/0/0");
      const keyPair = ECPair.fromPrivateKey(child.privateKey);

      setWallet(keyPair);
      setMnemonic(newMnemonic);

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
      setAddress(address);

      Alert.alert('Success', 'Wallet created successfully');
    } catch (error) {
      console.error('Wallet creation error:', error);
    }
  };


  const importWallet = async seedPhrase => {
    try {
      if (!bip39.validateMnemonic(seedPhrase)) {
        throw new Error('Invalid mnemonic');
      }

      storeData('mnemonic', seedPhrase);

      const seed = await bip39.mnemonicToSeed(seedPhrase);
      const root = bip32.fromSeed(seed);
      const child = root.derivePath("m/44'/0'/0'/0/0");
      const keyPair = ECPair.fromPrivateKey(child.privateKey);
      storeData('privateKey', keyPair);

      setWallet(keyPair);
      setMnemonic(seedPhrase);

      const pubKeyHash = Bitcoin.crypto.hash160(keyPair.publicKey);
      const scriptPubKey = Bitcoin.script.compile([
        Bitcoin.opcodes.OP_DUP,
        Bitcoin.opcodes.OP_HASH160,
        pubKeyHash,
        Bitcoin.opcodes.OP_EQUALVERIFY,
        Bitcoin.opcodes.OP_CHECKSIG,
      ]);

      const address = Bitcoin.address.fromOutputScript(scriptPubKey, network);
      setAddress(address);
      storeData('address', address);

      Alert.alert('Success', 'Wallet imported successfully');
    } catch (error) {
      console.error('Import wallet error:', error);
      Alert.alert('Error', error.message);
    }
  };

  // Create and sign transaction
  const createTransaction = async () => {
    try {
      if (!wallet) throw new Error('No wallet loaded');

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

  const fetchBalance = async (address: any) => {
    try {
      const response = await axios.get(
        `https://mempool.space/testnet4/api/address/${address}`,
      );
      console.log('Balance response:', response.data);
      const {funded_txo_sum, spent_txo_sum} = response.data.chain_stats;
      const balance = (funded_txo_sum - spent_txo_sum) / 100000000;
      console.log('Balance:', balance);
      setBalance(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    if (address) {
      fetchBalance(address);
      fetchTransactions(address);
      // fetchUTXOs(address);
    }
  }, [address]);

  const fetchTransactions = async address => {
    try {
      const response = await axios.get(
        `https://mempool.space/testnet4/api/address/${address}/txs`,
      );
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // const createTransaction = async () => {
  //   try {
  //     const utxosResponse = await axios.get(
  //       `https://blockstream.info/testnet/api/address/${address}/utxo`,
  //     );
  //     const utxos = utxosResponse.data;
  //     const txb = new Bitcoin.TransactionBuilder(network);
  //     let inputSum = 0;

  //     utxos.forEach(utxo => {
  //       txb.addInput(utxo.txid, utxo.vout);
  //       inputSum += utxo.value;
  //     });

  //     const amountInSatoshis = Math.floor(parseFloat(amount) * 1e8);
  //     const fee = 1000;
  //     txb.addOutput(recipientAddress, amountInSatoshis);
  //     txb.addOutput(address, inputSum - amountInSatoshis - fee);

  //     utxos.forEach((utxo, index) => {
  //       txb.sign(index, wallet);
  //     });

  //     const rawTx = txb.build().toHex();

  //     Alert.alert('Success', 'Transaction sent successfully');
  //   } catch (error) {
  //     console.error('Error fetching UTXOs:', error);
  //   }
  // };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Bitcoin Wallet</Text>

      <Button
        title="Create New Wallet"
        onPress={createNewWallet}
        color="#4CAF50"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter mnemonic to import"
        placeholderTextColor="#888"
        value={mnemonic}
        onChangeText={setMnemonic}
      />
      <Button
        title="Import Wallet"
        onPress={() => importWallet(mnemonic)}
        color="#2196F3"
      />

      {address && (
        <Text style={styles.address}>Receiving Address: {address}</Text>
      )}

      {address && <Text style={styles.balance}>Balance: {balance} BTC</Text>}

      <TextInput
        style={styles.input}
        placeholder="Recipient Address"
        placeholderTextColor="#888"
        value={recipientAddress}
        onChangeText={setRecipientAddress}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount BTC"
        placeholderTextColor="#888"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Button
        title="Send Transaction"
        onPress={createTransaction}
        color="#FF5722"
        disabled={!wallet}
      />

      {address && (
        <>
          <Text style={styles.transactionCount}>
            Transactions: {transactions?.length}
          </Text>
          <TransactionList transactions={transactions} />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    width: '100%',
    backgroundColor: '#fff',
    color: '#333',
  },
  address: {
    marginVertical: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  balance: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#4CAF50',
  },
  transactionCount: {
    fontSize: 16,
    marginVertical: 10,
    color: '#555',
  },
  stylesBtn: {
    backgroundColor: 'red',
    color: 'white',
  }
});

export default App;

// mi9jvrXp7uL1MymrNYLaErLJz1RJ5EUk6w
// mi9jvrXp7uL1MymrNYLaErLJz1RJ5EUk6w

// depart attitude liquid pledge enrich into sausage canvas frozen glass anger hybrid
