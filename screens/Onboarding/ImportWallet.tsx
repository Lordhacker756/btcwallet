import {View, Text, StyleSheet, TextInput} from 'react-native';
import React from 'react';
import GradientBackground from '../../components/GradientBackground';

const ImportWallet = () => {
  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text>Import Wallet</Text>
        <TextInput
          placeholder="Enter your seed phrase"
          style={{
            width: '100%',
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            marginTop: 10,
            padding: 10,
            backgroundColor: 'white',
          }}
        />
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
  },
});

export default ImportWallet;
