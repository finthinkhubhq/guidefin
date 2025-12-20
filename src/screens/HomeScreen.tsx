import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Welcome to Guidefin
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Your Personal Finance Calculator
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Get Started
            </Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              Start managing your finances with our powerful calculator tools.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => console.log('Pressed')}>
              Explore
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Features
            </Text>
            <Text variant="bodyMedium" style={styles.cardText}>
              • Real-time calculations{'\n'}
              • Secure data storage{'\n'}
              • Beautiful UI/UX{'\n'}
              • Backend integration ready
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#6200ee',
  },
  subtitle: {
    color: '#757575',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  cardText: {
    color: '#424242',
    lineHeight: 24,
  },
});

