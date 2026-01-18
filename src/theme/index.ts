
export const theme = {
    colors: {
        background: {
            primary: '#F5F7FA', // Light Gray/White
            secondary: '#FFFFFF', // Pure White for cards
            accent: '#2196F3', // Professional Blue
            surface: '#FFFFFF',
        },
        gradient: {
            start: '#F5F7FA',
            end: '#FFFFFF',
            hero: ['#2196F3', '#1976D2'] as const, // Blue Gradient
            card: ['#FFFFFF', '#FFFFFF'] as const, // Solid White
            button: ['#2196F3', '#1976D2'] as const, // Classic Blue Gradient
            buttonSecondary: ['#F5F5F5', '#E0E0E0'] as const, // Light Grey
            success: ['#4CAF50', '#388E3C'] as const,
        },
        text: {
            primary: '#263238', // Dark Slate
            secondary: '#546E7A', // Medium Slate
            muted: '#90A4AE', // Light Slate
            accent: '#2196F3', // Blue
            highlight: '#1976D2', // Darker Blue
        },
        border: '#E0E0E0',
        input: {
            background: '#FFFFFF',
            text: '#263238',
            placeholder: '#90A4AE',
            border: '#E0E0E0',
            focusBorder: '#2196F3',
        }
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        full: 9999,
    },
    typography: {
        h1: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -1 },
        h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.5 },
        body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
        button: { fontSize: 16, fontWeight: '600' as const, letterSpacing: 0.5 },
    }
};
