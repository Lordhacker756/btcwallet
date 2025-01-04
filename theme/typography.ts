import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
    // Headings
    h1: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.fontColor,
        lineHeight: 40,
    },
    h2: {
        fontSize: 28,
        fontWeight: '600',
        color: colors.fontColor,
        lineHeight: 36,
    },
    h3: {
        fontSize: 24,
        fontWeight: '600',
        color: colors.fontColor,
        lineHeight: 32,
    },

    // Body text
    bodyLarge: {
        fontSize: 18,
        fontWeight: '400',
        color: colors.fontColor,
        lineHeight: 28,
    },
    bodyRegular: {
        fontSize: 16,
        fontWeight: '400',
        color: colors.fontColor,
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.fontColor,
        lineHeight: 20,
    },

    // Special text styles
    bold: {
        fontWeight: '700',
    },
    semibold: {
        fontWeight: '600',
    },
    medium: {
        fontWeight: '500',
    },
    regular: {
        fontWeight: '400',
    },

    // Interactive text
    link: {
        color: colors.primary,
        textDecorationLine: 'underline',
    },
    error: {
        color: 'red',
        fontSize: 14,
        lineHeight: 20,
    },
    disabled: {
        color: colors.fontColor + '80', // 50% opacity
    },
}); 