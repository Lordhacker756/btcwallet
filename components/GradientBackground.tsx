import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

const GradientBackground = ({children}) => {
  return (
    <LinearGradient
      colors={['#7BDCBA', '#9BC8FF']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={{flex: 1, width: '100%', height: '100%'}}>
      {children}
    </LinearGradient>
  );
};

export default GradientBackground;
