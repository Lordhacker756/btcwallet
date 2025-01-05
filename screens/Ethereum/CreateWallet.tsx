import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { createNewWallet, importWalletFromMnemonic } from '../../utils/ethereum/evmWallet';

const CreateWallet = () => {
  const [mnemonic, setMnemonic] = useState('');
  const [walletDetails, setWalletDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importMnemonic, setImportMnemonic] = useState('');

  const handleGenerateWallet = async () => {
    setLoading(true);
    try {
      const { mnemonic, privateKey, publicKey, address } = await createNewWallet();
      setMnemonic(mnemonic);
      setWalletDetails({ privateKey, publicKey, address });
      Alert.alert('Success', 'Your Ethereum wallet has been created.');
    } catch (error) {
      console.error('Error generating wallet:', error.message);
      Alert.alert('Error', 'Failed to generate wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportWallet = async () => {
    try {
      const wallet = await importWalletFromMnemonic(importMnemonic);
      setMnemonic(importMnemonic);
      setWalletDetails(wallet);
      Alert.alert('Success', 'Wallet successfully imported.');
    } catch (error) {
      console.error('Error importing wallet:', error.message);
      Alert.alert('Error', 'Invalid mnemonic. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Ethereum Wallet Manager</Text>
      <Button
        title={loading ? 'Generating...' : 'Generate New Wallet'}
        onPress={handleGenerateWallet}
        disabled={loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter mnemonic to import wallet"
        value={importMnemonic}
        onChangeText={setImportMnemonic}
      />
      <Button title="Import Wallet" onPress={handleImportWallet} />
      {mnemonic && (
        <>
          <Text style={styles.label}>Mnemonic Phrase:</Text>
          <Text style={styles.value}>{mnemonic}</Text>
        </>
      )}
      {walletDetails && (
        <>
          <Text style={styles.label}>Ethereum Address:</Text>
          <Text style={styles.value}>{walletDetails.address}</Text>
          <Text style={styles.label}>Private Key:</Text>
          <Text style={styles.value}>{walletDetails.privateKey}</Text>
          <Text style={styles.label}>Public Key:</Text>
          <Text style={styles.value}>{walletDetails.publicKey}</Text>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  value: {
    fontSize: 14,
    color: '#000',
    marginTop: 5,
    wordWrap: 'break-word',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
  },
});

export default CreateWallet;
