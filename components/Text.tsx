import React from 'react';
import {Text as RNText, TextProps, StyleSheet} from 'react-native';
import {typography} from '../theme';

interface CustomTextProps extends TextProps {
  variant?: keyof typeof typography;
  children: React.ReactNode;
}

const Text: React.FC<CustomTextProps> = ({
  variant = 'bodyRegular',
  style,
  children,
  ...props
}) => {
  return (
    <RNText style={[typography[variant], style]} {...props}>
      {children}
    </RNText>
  );
};

export default Text;
