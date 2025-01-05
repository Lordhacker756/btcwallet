import React, {useState} from 'react';
import {
  View,
  TextInput as RNTextInput,
  TextInputProps,
  StyleSheet,
} from 'react-native';
import {forms} from '../theme';
import Text from './Text';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  helperText,
  required,
  style,
  disabled,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={forms.inputContainer}>
      {label && (
        <View style={styles.labelContainer}>
          <Text variant="bodySmall" style={forms.label}>
            {label}
          </Text>
          {required && <Text style={forms.requiredLabel}>*</Text>}
        </View>
      )}
      <View style={forms.inputWrapper}>
        <RNTextInput
          style={[
            forms.input,
            isFocused && forms.inputFocused,
            error && forms.inputError,
            disabled && forms.inputDisabled,
            style,
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          placeholderTextColor="#666"
          {...props}
        />
      </View>
      {error ? (
        <Text style={forms.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={forms.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default TextInput;
