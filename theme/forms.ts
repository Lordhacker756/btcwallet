import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const forms = StyleSheet.create({
    // Input containers
    inputContainer: {
        marginBottom: spacing.md,
        width: '100%',
    },
    inputWrapper: {
        position: 'relative',
    },

    // Labels
    label: {
        ...typography.bodySmall,
        marginBottom: spacing.xs,
        color: colors.fontColor,
    },
    requiredLabel: {
        color: 'red',
        marginLeft: spacing.xs,
    },

    // Text inputs
    input: {
        height: 52,
        backgroundColor: 'rgba(255, 255, 255, 0.45)',
        borderRadius: 8,
        paddingHorizontal: spacing.inputPadding,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.45)',
        color: colors.fontColor,
        ...typography.bodyRegular,
    },
    inputFocused: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
    inputError: {
        borderColor: 'red',
    },
    inputDisabled: {
        backgroundColor: colors.disabledButtonColor,
        borderColor: colors.disabledButtonColor,
        color: colors.fontColor + '80',
    },

    // Helper text and errors
    helperText: {
        ...typography.bodySmall,
        marginTop: spacing.xs,
        color: colors.fontColor + 'CC', // 80% opacity
    },
    errorText: {
        ...typography.bodySmall,
        marginTop: spacing.xs,
        color: 'red',
    },

    // Form groups
    formGroup: {
        marginBottom: spacing.lg,
    },
    formSection: {
        marginBottom: spacing.xl,
    },

    // Checkboxes and radio buttons
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    checkboxLabel: {
        ...typography.bodyRegular,
        marginLeft: spacing.sm,
    },
}); 