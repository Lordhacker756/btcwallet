import {StyleSheet, Text, View, TextInput, Button, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import './shim';
import * as Bitcoin from 'react-native-bitcoinjs-lib';
import {randomBytes} from 'react-native-randombytes';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import * as ecc from '@bitcoinerlab/secp256k1';
import ECPairFactory from 'ecpair';
import axios from 'axios';
import TransactionList from './components/TransactionList';
import GradientBackground from './components/GradientBackground';
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

  const createNewWallet = async () => {
    try {
      const entropy = randomBytes(16);
      console.log('entropy:', entropy);
      const entropyHex = Buffer.from(entropy).toString('hex');
      console.log('entropyHex:', entropyHex);
      const newMnemonic = bip39.entropyToMnemonic(entropyHex);
      console.log('newMnemonic:', newMnemonic);
      const seed = await bip39.mnemonicToSeed(newMnemonic);
      console.log('seed:', seed);

      // Create Bitcoin wallet
      const root = bip32.fromSeed(Buffer.from(seed));
      console.log('root:', root);
      const child = root.derivePath("m/44'/1'/0'/0/0");
      console.log('child:', child);
      console.log('Private Key:', child.privateKey.toString('hex'));
      console.log('Public Key:', child.publicKey.toString('hex'));
      const keyPair = ECPair.fromPrivateKey(child.privateKey);
      console.log('keyPair:', keyPair);

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
      console.log('address:', address);
      setAddress(address);

      Alert.alert('Success', 'Wallet created successfully');
    } catch (error) {
      console.error('Wallet creation error:', error);
      // Alert.alert('Error', error.message);
    }
  };

  // Import existing wallet
  const importWallet = async (seedPhrase) => {
    console.log('seedPhrase:', seedPhrase);
    try {
      // Fix the validation logic - we were throwing on valid mnemonics
      if (!bip39.validateMnemonic(seedPhrase)) {
        throw new Error('Invalid mnemonic');
      }

      const seed = await bip39.mnemonicToSeed(seedPhrase);
      const root = bip32.fromSeed(seed);
      const child = root.derivePath("m/44'/0'/0'/0/0");
      const keyPair = ECPair.fromPrivateKey(child.privateKey);

      setWallet(keyPair);
      setMnemonic(seedPhrase);

      // Generate address using same method as createNewWallet
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
      fetchUTXOs(address);
    }
  }, [address]);

  const fetchTransactions = async address => {
    try {
      const response = await axios.get(
        `https://mempool.space/testnet4/api/address/${address}/txs`,
      );
      console.log('Transactions response:', response.data);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchUTXOs = async address => {
    try {
      const response = await axios.get(
        `https://mempool.space/testnet4/api/address/${address}/utxo`,
      );
      console.log('UTXOs response:', response.data);
      // return response.data;
      setUTXOs(response.data);
    } catch (error) {
      console.error('Error fetching UTXOs:', error);
    }
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Button title="Create New Wallet" onPress={createNewWallet} />

        <TextInput
          style={styles.input}
          placeholder="Enter mnemonic to import"
          value={mnemonic}
          onChangeText={setMnemonic}
        />
        <Button title="Import Wallet" onPress={() => importWallet(mnemonic)} />

        {address && (
          <TextInput style={styles.address}>
            Receiving Address: {address}
          </TextInput>
        )}

        {address && (
          <>
            <Text style={styles.address}>Balance: {balance} BTC</Text>
            {/* <Text style={styles.address}>UTXO: {utxos} BTC</Text> */}
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Recipient Address"
          value={recipientAddress}
          onChangeText={setRecipientAddress}
        />

        <TextInput
          style={styles.input}
          placeholder="Amount BTC"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <Button
          title="Send Transaction"
          onPress={createTransaction}
          disabled={!wallet}

        />

        {address && (
          <>
            <Text style={styles.address}>
              Transactions: {transactions?.length}
            </Text>
            <TransactionList transactions={transactions} />
          </>
        )}
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    marginVertical: 10,
    color: 'black',
    backgroundColor: 'white',
    borderRadius: 10,
  },
  address: {
    marginVertical: 10,
    color: 'black',
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
