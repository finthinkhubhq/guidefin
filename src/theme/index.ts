
export const theme = {
    colors: {
        background: {
            primary: '#1A1A2E', // Deep midnight blue
            secondary: '#16213E',
            accent: '#0F3460',
        },
        gradient: {
            start: '#1A1A2E',
            end: '#16213E',
            card: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'] as const,
            button: ['#E94560', '#C81938'] as const, // Vibrant red/pink for contrast
            buttonSecondary: ['#4ECCA3', '#45B08C'] as const, // Green for money/results
        },
        text: {
            primary: '#FFFFFF',
            secondary: 'rgba(255, 255, 255, 0.7)',
            muted: 'rgba(255, 255, 255, 0.4)',
            accent: '#E94560',
        },
        border: 'rgba(255, 255, 255, 0.1)',
        input: {
            background: 'rgba(0, 0, 0, 0.2)',
            text: '#FFFFFF',
            placeholder: 'rgba(255, 255, 255, 0.3)',
        }
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
    },
    borderRadius: {
        s: 8,
        m: 12,
        l: 20,
        xl: 30,
    }
};
