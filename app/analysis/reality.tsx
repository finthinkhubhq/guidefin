import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../src/theme';

const { width } = Dimensions.get('window');

export default function RealityCheckScreen() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.secondary} />
                        <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600', color: theme.colors.text.secondary }}>Back</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <Animated.View style={{ flex: 1, opacity: fadeAnim, justifyContent: 'center' }}>

                    <Text style={styles.pageTitle}>Markets Don't Behave Like Averages</Text>

                    <Card style={styles.heroCard}>
                        <View style={styles.heroContent}>
                            <MaterialCommunityIcons name="chart-line-variant" size={64} color={theme.colors.text.highlight} style={{ marginBottom: 24 }} />
                            <Text style={styles.heroSub}>
                                Long-term returns look smooth on paper, but real markets move up and down.
                            </Text>
                        </View>
                    </Card>

                    {/* Spacer */}
                    <View style={{ height: 40 }} />

                    {/* CTA */}
                    <View style={styles.ctaContainer}>
                        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/analysis')}>
                            <LinearGradient
                                colors={theme.colors.gradient.button as unknown as string[]}
                                style={styles.ctaButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.ctaText}>Run a Reality Check</Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    contentContainer: { flex: 1, padding: 24 },

    header: { marginBottom: 16 },
    pageTitle: { fontSize: 32, fontWeight: '800', color: theme.colors.text.primary, marginBottom: 32, letterSpacing: -0.5, lineHeight: 40 },

    // Hero
    heroCard: { backgroundColor: theme.colors.background.secondary, borderRadius: 24, elevation: 4 }, // Removed border
    heroContent: { padding: 32, alignItems: 'center' },
    heroSub: { fontSize: 18, color: theme.colors.text.secondary, textAlign: 'center', lineHeight: 28, fontWeight: '500' },

    // CTA
    ctaContainer: { paddingBottom: 10 },
    ctaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 16, gap: 12, elevation: 6 },
    ctaText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
});
