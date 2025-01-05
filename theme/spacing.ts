// Base spacing unit (4px)
export const spacing = {
    // Spacing values
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,

    // Specific use cases
    screenPadding: 20,
    sectionSpacing: 32,
    inputPadding: 16,
    buttonPadding: 16,

    // Component specific
    cardPadding: 16,
    listItemPadding: 12,
    iconPadding: 8,
};

// Helper function to get negative spacing (for margins)
export const negativeSpacing = (value: number) => -value;

// Common layout styles
export const layout = {
    // Flex layouts
    row: {
        flexDirection: 'row' as const,
    },
    rowCenter: {
        flexDirection: 'row' as const,
        alignItems: 'center',
    },
    rowBetween: {
        flexDirection: 'row' as const,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    center: {
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },

    // Common margins
    marginBottom: {
        marginBottom: spacing.md,
    },
    marginTop: {
        marginTop: spacing.md,
    },
    marginVertical: {
        marginVertical: spacing.md,
    },
    marginHorizontal: {
        marginHorizontal: spacing.md,
    },

    // Common paddings
    padding: {
        padding: spacing.md,
    },
    paddingHorizontal: {
        paddingHorizontal: spacing.md,
    },
    paddingVertical: {
        paddingVertical: spacing.md,
    },
}; 