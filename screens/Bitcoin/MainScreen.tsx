import {
  StyleSheet,
  View,
  Alert,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';
import Text from '../../components/Text';
import TextInput from '../../components/TextInput';
import {useBitcoin} from '../../hooks/bitcoin/useBitcoin';
import Clipboard from '@react-native-clipboard/clipboard';

const MainScreen = () => {
  const {
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
  } = useBitcoin();

  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [importMnemonic, setImportMnemonic] = useState('');

  // Load wallet data when component mounts
  useEffect(() => {
    if (walletInfo?.address) {
      const loadData = async () => {
        try {
          await getBalance();
          await getTransactions();
        } catch (err) {
          console.error('Error loading wallet data:', err);
        }
      };
      loadData();
    }
  }, [walletInfo?.address, getBalance, getTransactions]);

  // Handle wallet creation
  const handleCreateWallet = async () => {
    try {
      const newWalletInfo = await createWallet();
      console.log('newWalletInfo', newWalletInfo);
      Alert.alert(
        'Success',
        'Wallet created successfully! Please save your mnemonic phrase securely.',
        [
          {
            text: 'View Mnemonic',
            onPress: () =>
              Alert.alert('Mnemonic Phrase', newWalletInfo?.mnemonic || '', [
                {
                  text: 'Copy',
                  onPress: () => {
                    Clipboard?.setString(newWalletInfo?.mnemonic || '');
                    Alert.alert('Mnemonic Phrase', 'Copied to clipboard');
                  },
                },
                {text: 'OK'},
              ]),
          },
          {text: 'OK'},
        ],
      );
    } catch (err: any) {
      // Alert.alert('Error', err.message);
      console.log('Error in createWallet', err.message);
    }
  };

  // Handle wallet import
  const handleImportWallet = async () => {
    try {
      if (!importMnemonic) {
        Alert.alert('Error', 'Please enter a mnemonic phrase');
        return;
      }
      await importWallet(importMnemonic);
      Alert.alert('Success', 'Wallet imported successfully!');
      setImportMnemonic('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  // Handle sending bitcoin
  const handleSendBitcoin = async () => {
    try {
      if (!recipientAddress || !amount) {
        Alert.alert('Error', 'Please enter recipient address and amount');
        return;
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      if (amountNum > balance) {
        Alert.alert('Error', 'Insufficient funds');
        return;
      }

      const feeRate = 1; // sat/vB - You might want to make this dynamic
      const txId = await sendBitcoin({
        toAddress: recipientAddress,
        amount: amountNum,
        feeRate,
      });

      Alert.alert('Success', `Transaction sent! TxID: ${txId}`);
      setRecipientAddress('');
      setAmount('');

      // Refresh balance and transactions
      await getBalance();
      await getTransactions();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Bitcoin Wallet</Text>
        {error && <Text style={styles.error}>{error}</Text>}

        {!walletInfo ? (
          <>
            <Button
              title="Create New Wallet"
              onPress={handleCreateWallet}
              variant="primary"
              disabled={creatingWallet}
              loading={creatingWallet}
            />

            <TextInput
              style={styles.input}
              placeholder="Enter mnemonic to import"
              placeholderTextColor="#888"
              value={importMnemonic}
              onChangeText={setImportMnemonic}
              editable={!importingWallet}
            />
            <Button
              title="Import Wallet"
              onPress={handleImportWallet}
              variant="primary"
              disabled={importingWallet}
              loading={importingWallet}
            />
          </>
        ) : (
          <>
            <View style={styles.walletInfo}>
              <Text variant="h2">Wallet Address</Text>
              <View style={styles.addressContainer}>
                <Text
                  style={styles.address}
                  ellipsizeMode="tail"
                  numberOfLines={1}>
                  {walletInfo.address}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Clipboard.setString(walletInfo.address);
                    Alert.alert(
                      'Success',
                      'Wallet address copied to clipboard',
                    );
                  }}
                  style={styles.copyButton}>
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.balanceContainer}>
                <Text variant="h2" style={styles.balanceLabel}>
                  Balance
                </Text>
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await getBalance();
                      await getTransactions();
                    } catch (err: any) {
                      Alert.alert('Error', err.message);
                    }
                  }}
                  style={styles.refreshButton}
                  disabled={gettingBalance || gettingTransactions}>
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
              {gettingBalance ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text style={styles.balance}>{balance.toFixed(8)} tBTC</Text>
              )}
            </View>

            <View style={styles.sendSection}>
              <Text variant="h2">Send Bitcoin</Text>
              <TextInput
                style={styles.input}
                placeholder="Recipient Address"
                placeholderTextColor="#888"
                value={recipientAddress}
                onChangeText={setRecipientAddress}
                editable={!sendingBitcoin}
              />

              <TextInput
                style={styles.input}
                placeholder="Amount BTC"
                placeholderTextColor="#888"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                editable={!sendingBitcoin}
              />

              <Button
                title="Send"
                onPress={handleSendBitcoin}
                variant="primary"
                disabled={sendingBitcoin}
                loading={sendingBitcoin}
              />
            </View>

            <View style={styles.transactionSection}>
              <Text variant="h2">Recent Transactions</Text>
              {gettingTransactions ? (
                <ActivityIndicator size="small" style={styles.loading} />
              ) : transactions.length === 0 ? (
                <Text style={styles.balance}>No transactions found</Text>
              ) : (
                transactions.map(tx => (
                  <View key={tx.txid} style={styles.transaction}>
                    <Text style={styles.txType}>{tx.type}</Text>
                    <Text style={styles.txAmount}>
                      {tx.type === 'received' ? '+' : '-'}{' '}
                      {Math.abs(tx.value).toFixed(8)} BTC
                    </Text>
                    <Text style={styles.txStatus}>{tx.status}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
    marginVertical: 10,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  input: {
    marginVertical: 10,
  },
  walletInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  address: {
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  copyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  balanceLabel: {
    marginTop: 10,
    width: '80%',
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  sendSection: {
    marginVertical: 20,
  },
  transactionSection: {
    marginTop: 20,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 5,
    marginVertical: 5,
  },
  txType: {
    textTransform: 'capitalize',
  },
  txAmount: {
    fontWeight: 'bold',
  },
  txStatus: {
    opacity: 0.7,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default MainScreen;
