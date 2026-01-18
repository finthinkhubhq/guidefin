import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../src/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/wizard/calculator');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.content}>

        {/* LOGO SECTION */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/GuideFin_frontlogo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* HERO TEXT */}
        <View style={styles.heroSection}>
          <Text style={styles.headline}>
            Your Financial{'\n'}
            <Text style={styles.highlight}>Freedom</Text> Starts Here.
          </Text>
          <Text style={styles.subhead}>
            Simple, powerful retirement planning for everyone.
          </Text>
        </View>

        {/* ILLUSTRATION PLACEHOLDER (Or simple spacer) */}
        <View style={{ flex: 1 }} />

        {/* CTA */}
        <View style={styles.bottomSection}>
          <TouchableOpacity onPress={handleStart} activeOpacity={0.8}>
            <LinearGradient
              colors={theme.colors.gradient.button as unknown as string[]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <IconButton icon="arrow-right" iconColor="#FFF" size={24} style={{ margin: 0 }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white to blend with logo
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  logoImage: {
    width: 220,
    height: 100,
  },
  heroSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  headline: {
    fontSize: 40,
    fontWeight: '800',
    color: theme.colors.text.primary,
    lineHeight: 48,
    textAlign: 'center',
  },
  highlight: {
    color: theme.colors.text.accent,
  },
  subhead: {
    fontSize: 18,
    color: theme.colors.text.secondary,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 26,
  },
  bottomSection: {
    marginBottom: 20,
  },
  button: {
    borderRadius: theme.borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
});
