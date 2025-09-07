import React from 'react';
import { ScrollView, View, StyleSheet, Dimensions } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../theme';
import { LanguageToggle } from '../components/LanguageToggle';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const stats = [
    { value: t('hero.stats.clients'), label: t('hero.stats.clientsLabel') },
    { value: t('hero.stats.compliance'), label: t('hero.stats.complianceLabel') },
    { value: t('hero.stats.experience'), label: t('hero.stats.experienceLabel') },
  ];

  const services = [
    {
      key: 'regulatory',
      title: t('services.regulatory.title'),
      description: t('services.regulatory.description'),
      icon: '⚖️',
    },
    {
      key: 'ai',
      title: t('services.ai.title'),
      description: t('services.ai.description'),
      icon: '🤖',
    },
    {
      key: 'strategy',
      title: t('services.strategy.title'),
      description: t('services.strategy.description'),
      icon: '📈',
    },
    {
      key: 'training',
      title: t('services.training.title'),
      description: t('services.training.description'),
      icon: '🎓',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header with Language Toggle */}
      <View style={styles.header}>
        <LanguageToggle />
      </View>

      {/* Hero Section */}
      <LinearGradient
        colors={[colors.primaryBlue, colors.secondaryBlue]}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{t('hero.title')}</Text>
          <Text style={styles.heroSubtitle}>{t('hero.subtitle')}</Text>
          
          <View style={styles.heroButtons}>
            <Button
              mode="contained"
              style={[styles.heroButton, { backgroundColor: colors.accentYellow }]}
              labelStyle={{ color: colors.primaryBlue }}
              onPress={() => navigation.navigate('Services' as never)}
            >
              {t('hero.startJourney')}
            </Button>
            <Button
              mode="outlined"
              style={styles.heroButton}
              labelStyle={{ color: colors.white }}
              onPress={() => navigation.navigate('Consultation' as never)}
            >
              {t('hero.bookConsultation')}
            </Button>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>

      {/* Services Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('services.title')}</Text>
        <Text style={styles.sectionSubtitle}>{t('services.subtitle')}</Text>
        
        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <Card key={service.key} style={styles.serviceCard}>
              <Card.Content>
                <Text style={styles.serviceIcon}>{service.icon}</Text>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Button
            mode="contained"
            style={styles.actionButton}
            onPress={() => navigation.navigate('Chat' as never)}
          >
            AI Assistant
          </Button>
          <Button
            mode="contained"
            style={styles.actionButton}
            onPress={() => navigation.navigate('Contact' as never)}
          >
            Contact Us
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: colors.white,
  },
  heroSection: {
    padding: 24,
    minHeight: 400,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
    lineHeight: 24,
  },
  heroButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  heroButton: {
    flex: 1,
    maxWidth: 150,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accentYellow,
  },
  statLabel: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  servicesGrid: {
    gap: 16,
  },
  serviceCard: {
    marginBottom: 16,
    elevation: 2,
  },
  serviceIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryBlue,
    textAlign: 'center',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primaryBlue,
  },
});