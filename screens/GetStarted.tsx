import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import GradientBackground from '../components/GradientBackground';
import Button from '../components/Button';
import {useAuth} from '../context/AuthContext';
import {spacing, layout} from '../theme';

const GetStarted = ({navigation}: any) => {
  const {signIn} = useAuth();

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
          <Button title="Register" variant="primary" onPress={() => signIn()} />
          <Button title="Login" variant="secondary" onPress={() => signIn()} />
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...layout.center,
    padding: spacing.screenPadding,
  },
  main: {
    flex: 1,
    ...layout.center,
    height: '100%',
  },
  logo: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
  },
  buttons: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
});

export default GetStarted;
