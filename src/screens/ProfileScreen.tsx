import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Avatar, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Avatar.Text size={80} label="FC" style={styles.avatar} />
          <Text variant="headlineSmall" style={styles.name}>
            Guidefin User
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            user@fincal.com
          </Text>
        </View>

        <Divider style={styles.divider} />

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              App Information
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              Version: 1.0.0{'\n'}
              Platform: React Native + Expo{'\n'}
              Status: Development Mode
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Development Setup
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              ✓ Expo SDK 54{'\n'}
              ✓ React Navigation{'\n'}
              ✓ React Native Paper{'\n'}
              ✓ Zustand State Management{'\n'}
              ✓ Axios for API calls
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  avatar: {
    backgroundColor: '#6200ee',
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: '#757575',
  },
  divider: {
    marginVertical: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#6200ee',
  },
  infoText: {
    color: '#424242',
    lineHeight: 24,
  },
});

