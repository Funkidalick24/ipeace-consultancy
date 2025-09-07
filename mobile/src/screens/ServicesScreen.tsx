import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../theme';

export default function ServicesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const services = [
    {
      key: 'regulatory',
      title: t('services.regulatory.title'),
      description: t('services.regulatory.description'),
      icon: '⚖️',
      features: [
        'Companies Act compliance audits',
        'Securities registration guidance',
        'Corporate governance frameworks'
      ]
    },
    {
      key: 'ai',
      title: t('services.ai.title'),
      description: t('services.ai.description'),
      icon: '🤖',
      features: [
        '24/7 AI consultation chatbot',
        'Document analysis and review',
        'Risk assessment algorithms'
      ]
    },
    {
      key: 'strategy',
      title: t('services.strategy.title'),
      description: t('services.strategy.description'),
      icon: '📈',
      features: [
        'Market analysis and planning',
        'Digital transformation roadmaps',
        'Performance optimization'
      ]
    },
    {
      key: 'training',
      title: t('services.training.title'),
      description: t('services.training.description'),
      icon: '🎓',
      features: [
        'Compliance workshops',
        'Leadership development',
        'Digital skills training'
      ]
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('services.title')}</Text>
        <Text style={styles.subtitle}>{t('services.subtitle')}</Text>
      </View>

      <View style={styles.servicesContainer}>
        {services.map((service) => (
          <Card key={service.key} style={styles.serviceCard}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.serviceIcon}>{service.icon}</Text>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              
              <View style={styles.featuresContainer}>
                {service.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureBullet}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>

      <View style={styles.ctaContainer}>
        <Card style={styles.ctaCard}>
          <Card.Content style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>Ready to Transform Your Business?</Text>
            <Text style={styles.ctaSubtitle}>
              Get started with a free consultation and discover how IPEACE can accelerate your success.
            </Text>
            <Button
              mode="contained"
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Consultation' as never)}
            >
              Schedule Free Consultation
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    padding: 24,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 24,
  },
  servicesContainer: {
    padding: 16,
    gap: 16,
  },
  serviceCard: {
    elevation: 2,
  },
  cardContent: {
    padding: 20,
  },
  serviceIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryBlue,
    textAlign: 'center',
    marginBottom: 12,
  },
  serviceDescription: {
    fontSize: 16,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureBullet: {
    color: colors.accentYellow,
    fontWeight: 'bold',
    fontSize: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray600,
  },
  ctaContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  ctaCard: {
    backgroundColor: colors.primaryBlue,
    elevation: 4,
  },
  ctaContent: {
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.9,
  },
  ctaButton: {
    backgroundColor: colors.accentYellow,
  },
});