import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import {colors, typography, spacing, BORDER_RADIUS} from '../theme';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary';
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  title,
  style,
  textStyle,
  disabled,
  loading,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        (disabled || loading) && styles.disabledButton,
        style,
      ]}
      disabled={disabled || loading}
      {...props}>
      <Text
        style={[
          styles.text,
          variant === 'primary' ? styles.primaryText : styles.secondaryText,
          (disabled || loading) && styles.disabledText,
          textStyle,
        ]}>
        {title}
      </Text>
      {loading && <ActivityIndicator size="small" color={'black'} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.buttonPadding,
    paddingHorizontal: spacing.buttonPadding * 1.5,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primaryButtonColor,
  },
  secondaryButton: {
    backgroundColor: colors.bgtransparent,
    borderWidth: 1,
    borderColor: colors.bgtransparent,
  },
  disabledButton: {
    backgroundColor: colors.disabledButtonColor,
    borderColor: colors.disabledButtonColor,
  },
  text: {
    ...typography.bodyRegular,
    ...typography.semibold,
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: colors.primaryButtonColor,
  },
  disabledText: {
    color: colors.fontColor,
  },
});

export default Button;
