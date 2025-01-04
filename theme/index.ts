export { colors } from './colors';
export { typography } from './typography';
export { spacing, layout, negativeSpacing } from './spacing';
export { forms } from './forms';

// Theme constants
export const BORDER_RADIUS = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
};

export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 5,
    },
}; 