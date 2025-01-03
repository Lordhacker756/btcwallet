import React from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';

const TransactionList = ({ transactions }) => {

  const slicer = (str) => {
    return str.slice(0, 6) + '...' + str.slice(-6);
  };

  const renderTransaction = ({ item }) => {
    return (
      <View style={styles.transactionCard}>
        <Text style={styles.txid}>TXID: {slicer(item.txid)}</Text>
        <Text>Version: {item.version}</Text>
        <Text>Locktime: {item.locktime}</Text>
        <Text>Fee: {item.fee}</Text>
        <Text>Status: {item.status.confirmed ? 'Confirmed' : 'Unconfirmed'}</Text>
        <Text>Block Height: {item.status.block_height}</Text>
        <Text>Block Hash: {slicer(item.status.block_hash)}</Text>
        <Text>Block Time: {new Date(item.status.block_time * 1000).toLocaleString()}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inputs:</Text>
          {item.vin.map((input, index) => (
            <View key={index} style={styles.input}>
              <Text>Input TXID: {input.txi}</Text>
              <Text>Value: {input.prevout.value / 100000000}</Text>
              <Text>Address: {input.prevout.scriptpubkey_address}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outputs:</Text>
          {item.vout.map((output, index) => (
            <View key={index} style={styles.output}>
              <Text>Output Address: {output.scriptpubkey_address}</Text>
              <Text>Value: {output.value / 100000000}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.txid}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  transactionCard: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
  },
  txid: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    paddingLeft: 10,
    marginBottom: 5,
  },
  output: {
    paddingLeft: 10,
    marginBottom: 5,
  },
});

export default TransactionList;
