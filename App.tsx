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
import ECPairFactory, {ECPairInterface, Signer} from 'ecpair';
import axios from 'axios';
import TransactionList from './TransactionList';
import useSecureStorage from './hooks/useSecureStorage';
import {Buffer} from 'buffer';
global.Buffer = Buffer;
import * as bitcoin from 'bitcoinjs-lib';

const network = bitcoin.networks.testnet;
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

const App = () => {
  const [wallet, setWallet] = useState<ECPairInterface | null>(null);
  const [mnemonic, setMnemonic] = useState('');
  const [address, setAddress] = useState('');
  const [recipientAddress, setRecipientAddress] = useState(
    'tb1qz0pnh98kfynptg9dtkj06f7sqnlxl3dxnmnjw4',
  );
  const [amount, setAmount] = useState('0.000001');
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const {loading, error, storeData, getData, removeData} = useSecureStorage();
  const [btcPK, setBtcPK] = useState('');
  let signer_instance: signer;

  class signer {
    wallet: ECPairInterface;
    constructor(wallet: ECPairInterface) {
      this.wallet = wallet;
    }
    sign(hash: Buffer) {
      return wallet?.sign(hash);
    }
    getPublicKey() {
      return wallet?.publicKey;
    }
  }

  const loadWallet = async () => {
    console.log('Loading wallet...');
    try {
      const mnemonic = await getData('mnemonic');
      if (mnemonic) {
        setMnemonic(mnemonic);
      }

      const address = await getData('address');
      if (address) {
        setAddress(address);
      }

      const keyPair = await getData('keyPair');
      if (keyPair) {
        setWallet(JSON.parse(keyPair));
      }
    } catch {
      console.error('Error loading wallet:', error);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  useEffect(() => {
    if (wallet) {
    }
  }, [wallet]);

  // Create Wallet
  const createWallet = async () => {
    try {
      // Generate a random mnemonic using bip39
      const mnemonic = bip39.generateMnemonic();
      console.log('Generated mnemonic:', mnemonic);
      setMnemonic(mnemonic);

      // Validate mnemonic
      if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Generated mnemonic is invalid.');
      }

      // Derive the seed from the mnemonic
      const seed = await bip39.mnemonicToSeed(mnemonic);

      // Create a BIP32 root from the seed
      const root = bip32.fromSeed(seed, network);

      // Derive the first account (m/44'/0'/0')
      const account = root.derivePath("m/44'/0'/0'");

      // Derive the first receiving address (m/44'/0'/0'/0/0)
      const firstKeyPair = account.derive(0).derive(0);

      console.log('Key Pair:: ', firstKeyPair);
      setWallet(firstKeyPair);

      // Get the Bitcoin address
      const {address: btcAddress} = bitcoin.payments.p2pkh({
        pubkey: firstKeyPair.publicKey,
        network,
      });
      setAddress(btcAddress);
      setBtcPK(firstKeyPair.toWIF());
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
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
      storeData('keyPair', JSON.stringify(keyPair));
      signer_instance = new signer(keyPair);

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

  const fetchBalance = async address => {
    try {
      const response = await axios.get(
        `https://mempool.space/testnet4/api/address/${address}`,
      );
      const {funded_txo_sum, spent_txo_sum} = response.data.chain_stats;
      const balance = (funded_txo_sum - spent_txo_sum) / 100000000;
      setBalance(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    if (address) {
      fetchBalance(address);
      fetchTransactions(address);
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

  const createTransaction = async () => {
    try {
      console.log('Starting transaction creation with PSBT...');

      // Fetch UTXOs
      const utxosResponse = await axios.get(
        `https://mempool.space/testnet4/api/address/${address}/utxo`,
      );
      const utxos = utxosResponse.data;
      console.log('UTXOs fetched:', utxos);

      // Create new PSBT
      const psbt = new bitcoin.Psbt({
        network: bitcoin.networks.testnet,
      });
      let inputSum = 0;

      // Add inputs
      for (const utxo of utxos) {
        console.log('Processing UTXO:', utxo);

        // Fetch full transaction for input
        const txResponse = await axios.get(
          `https://mempool.space/testnet4/api/tx/${utxo.txid}/hex`,
        );
        const txHex = txResponse.data;
        console.log('Retrieved transaction hex for input');

        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          nonWitnessUtxo: Buffer.from(txHex, 'hex'),
        });

        inputSum += utxo.value;
        console.log('Added input, running sum:', inputSum);
      }

      // Calculate amounts
      const amountInSatoshis = Math.floor(parseFloat(amount) * 1e8);
      const fee = 1000; // Fixed fee
      console.log('Amount in satoshis:', amountInSatoshis);
      console.log('Fee:', fee);

      // Check funds
      if (inputSum < amountInSatoshis + fee) {
        throw new Error(
          `Insufficient funds. Required: ${
            amountInSatoshis + fee
          }, Available: ${inputSum}`,
        );
      }

      // Add recipient output
      psbt.addOutput({
        address: recipientAddress,
        value: amountInSatoshis,
      });
      console.log('Added recipient output', psbt);

      // Add change output if needed
      const changeAmount = inputSum - amountInSatoshis - fee;
      if (changeAmount > 546) {
        psbt.addOutput({
          address: address,
          value: changeAmount,
        });
        console.log('Added change output:', changeAmount);
      }

      const {signInput, validateSignaturesOfInput} = bitcoin.Psbt.prototype;

      // Sign all inputs
      utxos.forEach((_, index) => {
        console.log(
          'Signer public key:',
          signer_instance?.getPublicKey()?.toString('hex'),
        );
        console.log('Wallet private key:', wallet?.privateKey?.toString('hex'));
        console.log(
          "Testing signer function's sign method...",
          signer_instance.sign('Dattebayo'),
        );
        try {
          psbt.signInput(index, signer_instance);
          console.log(`Input ${index} signed`);
          psbt.validateSignaturesOfInput(index);
          console.log(`Input ${index} signed and validated`);
        } catch (err) {
          console.error(`Error signing input ${index}:`, err);
          throw err;
        }
      });

      // Finalize and build
      psbt.finalizeAllInputs();
      const transaction = psbt.extractTransaction();
      const rawTx = transaction.toHex();
      console.log('Transaction finalized, raw hex:', rawTx);

      // Broadcast
      const broadcastResponse = await axios.post(
        'https://blockstream.info/testnet/api/tx',
        rawTx,
        {
          headers: {
            'Content-Type': 'text/plain',
          },
        },
      );

      if (broadcastResponse.status === 200) {
        console.log('Transaction broadcast successful');
        Alert.alert('Success', 'Transaction sent successfully');
        await fetchBalance(address);
        await fetchTransactions(address);
      }
    } catch (error) {
      console.error('Transaction creation failed:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Bitcoin Wallet</Text>

      <Button
        title="Create New Wallet"
        onPress={createWallet}
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
});

export default App;
