import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import GradientBackground from '../components/GradientBackground';
import { colors } from '../theme/colors';

const GetStarted = ({ navigation } : any) => {
  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.main}>
          <Image
            source={require('../assets/gardenlogos/garden_horizontal_darkgrey.png')}
            style={styles.logo}
          />
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('CreateWallet')}
          >
            <Text style={styles.buttonText}>Create Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => navigation.navigate('ImportWallet')}
          >
            <Text style={[styles.buttonText, styles.textsecondary]}>Import Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  logo: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
    // marginBottom: 20,
  },
  buttons: {
    width: '100%',
    // marginTop: 20,
    gap: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: colors.primaryButtonColor,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.bgtransparent, 
    borderWidth: 1,
    borderColor: colors.bgtransparent,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textsecondary: {
    color: colors.fontColor,
  }
});

export default GetStarted;