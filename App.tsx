import {StyleSheet, Text, View, TextInput, Button, Alert} from 'react-native';
import React, {useState} from 'react';
import './shim';
import * as Bitcoin from 'react-native-bitcoinjs-lib';
import {randomBytes} from 'react-native-randombytes';
import * as bip39 from 'bip39';

const App = () => {
  const [wallet, setWallet] = useState(null);
  const [mnemonic, setMnemonic] = useState('');
  const [address, setAddress] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);

  // Create new wallet
  const createNewWallet = async () => {
    try {
      // Generate random bytes
      const entropy = randomBytes(16);
      console.log('entropy:', entropy);

      // Convert entropy buffer to hex string
      const entropyHex = Buffer.from(entropy).toString('hex');
      console.log('entropyHex:', entropyHex);

      // Generate mnemonic from entropy
      const newMnemonic = bip39.entropyToMnemonic(entropyHex);
      console.log('newMnemonic:', newMnemonic);

      // Generate seed from mnemonic
      const seed = await bip39.mnemonicToSeed(newMnemonic);
      console.log('seed:', seed);

      // Generate root node
      const root = Bitcoin.bip32.fromSeed(seed);
      console.log('root:', root);

      // Derive child node
      const child = root.derivePath("m/44'/0'/0'/0/0");
      console.log('child:', child);

      // Create key pair
      const keyPair = Bitcoin.ECPair.fromPrivateKey(child.privateKey);
      console.log('keyPair:', keyPair);

      setWallet(keyPair);
      setMnemonic(newMnemonic);

      const {address} = Bitcoin.payments.p2pkh({pubkey: keyPair.publicKey});
      setAddress(address);

      Alert.alert('Success', 'Wallet created!\nMnemonic: ' + newMnemonic);
    } catch (error) {
      console.error('Wallet creation error:', error);
      // Alert.alert('Error', error.message);
    }
  };

  // Import existing wallet
  const importWallet = async seedPhrase => {
    try {
      if (!Bitcoin.bip39.validateMnemonic(seedPhrase)) {
        throw new Error('Invalid mnemonic');
      }

      const seed = await Bitcoin.bip39.mnemonicToSeed(seedPhrase);
      const root = Bitcoin.bip32.fromSeed(seed);
      const child = root.derivePath("m/44'/0'/0'/0/0");
      const keyPair = Bitcoin.ECPair.fromPrivateKey(child.privateKey);

      setWallet(keyPair);
      setMnemonic(seedPhrase);

      const {address} = Bitcoin.payments.p2pkh({pubkey: keyPair.publicKey});
      setAddress(address);

      Alert.alert('Success', 'Wallet imported!');
    } catch (error) {
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
      Alert.alert('Error', error.message);
      return null;
    }
  };

  return (
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
        <Text style={styles.address}>Receiving Address: {address}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
  },
  address: {
    marginVertical: 10,
  },
});

export default App;
