import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Alert, Linking } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';

import { colors } from '../theme';
import { apiRequest } from '../services/api';

export default function ContactScreen() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    message: '',
  });

  const contactMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('POST', '/api/contact', {
        ...data,
        newsletter: false,
      });
    },
    onSuccess: () => {
      Alert.alert(
        'Message Sent!',
        'Thank you for your message. We will get back to you soon.',
        [{ text: 'OK' }]
      );
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        message: '',
      });
    },
    onError: () => {
      Alert.alert(
        'Error',
        'Failed to send message. Please try again.',
        [{ text: 'OK' }]
      );
    },
  });

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    contactMutation.mutate(formData);
  };

  const openPhone = () => {
    Linking.openURL('tel:+2634123456');
  };

  const openEmail = () => {
    Linking.openURL('mailto:info@ipeace.co.zw');
  };

  const openMaps = () => {
    const address = '135 Baines Avenue, Avenues, Harare, Zimbabwe';
    const url = Platform.OS === 'ios' 
      ? `maps:0,0?q=${encodeURIComponent(address)}`
      : `geo:0,0?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('contact.title')}</Text>
        <Text style={styles.subtitle}>{t('contact.subtitle')}</Text>
      </View>

      {/* Contact Form */}
      <Card style={styles.formCard}>
        <Card.Content style={styles.formContent}>
          <Text style={styles.formTitle}>Send Us a Message</Text>
          
          <View style={styles.formRow}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              label={`${t('contact.form.firstName')} *`}
              value={formData.firstName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              label={`${t('contact.form.lastName')} *`}
              value={formData.lastName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
            />
          </View>

          <TextInput
            style={styles.input}
            label={`${t('contact.form.email')} *`}
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            label={t('contact.form.company')}
            value={formData.company}
            onChangeText={(text) => setFormData(prev => ({ ...prev, company: text }))}
          />

          <TextInput
            style={styles.input}
            label={`${t('contact.form.message')} *`}
            value={formData.message}
            onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
            multiline
            numberOfLines={4}
          />

          <Button
            mode="contained"
            style={styles.submitButton}
            onPress={handleSubmit}
            loading={contactMutation.isPending}
            disabled={contactMutation.isPending}
          >
            {contactMutation.isPending ? t('contact.form.sending') : t('contact.form.send')}
          </Button>
        </Card.Content>
      </Card>

      {/* Office Information */}
      <Card style={styles.officeCard}>
        <Card.Content style={styles.officeContent}>
          <Text style={styles.officeTitle}>{t('contact.office.title')}</Text>
          
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📍</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Address</Text>
              <Text style={styles.contactValue} onPress={openMaps}>
                {t('contact.office.address')}
              </Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📞</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue} onPress={openPhone}>
                {t('contact.office.phone')}
              </Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>✉️</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue} onPress={openEmail}>
                {t('contact.office.email')}
              </Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>🕒</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Business Hours</Text>
              <Text style={styles.contactValue}>Monday - Friday: 8:00 AM - 6:00 PM</Text>
              <Text style={styles.contactValue}>Saturday: 9:00 AM - 1:00 PM</Text>
              <Text style={styles.contactValue}>Sunday: Closed</Text>
              <Text style={[styles.contactValue, { color: colors.primaryBlue, fontWeight: 'bold' }]}>
                AI Chat: 24/7 Available
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
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
  formCard: {
    margin: 16,
    elevation: 2,
  },
  formContent: {
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 20,
    textAlign: 'center',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: colors.primaryBlue,
    marginTop: 8,
  },
  officeCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  officeContent: {
    padding: 20,
  },
  officeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 20,
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  contactIcon: {
    fontSize: 20,
    width: 24,
    textAlign: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 20,
  },
});