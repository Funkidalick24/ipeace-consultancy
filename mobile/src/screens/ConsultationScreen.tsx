import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';

import { colors } from '../theme';
import { apiRequest } from '../services/api';

export default function ConsultationScreen() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    serviceType: 'regulatory',
    preferredDate: '',
    preferredTime: 'morning-9',
    consultationType: 'video-call',
    description: '',
  });

  const consultationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('POST', '/api/consultations', data);
    },
    onSuccess: (response) => {
      Alert.alert(
        'Consultation Booked!',
        'Thank you for booking a consultation with IPEACE. We will contact you soon to confirm your appointment.',
        [{ text: 'OK' }]
      );
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        serviceType: 'regulatory',
        preferredDate: '',
        preferredTime: 'morning-9',
        consultationType: 'video-call',
        description: '',
      });
    },
    onError: () => {
      Alert.alert(
        'Error',
        'Failed to book consultation. Please try again.',
        [{ text: 'OK' }]
      );
    },
  });

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.preferredDate || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    consultationMutation.mutate(formData);
  };

  const serviceTypes = [
    { value: 'regulatory', label: 'Regulatory Compliance' },
    { value: 'ai', label: 'AI-Powered Advisory' },
    { value: 'strategy', label: 'Business Strategy' },
    { value: 'training', label: 'Training & Development' },
    { value: 'documents', label: 'Document Services' },
    { value: 'support', label: '24/7 Support' },
  ];

  const timeSlots = [
    { value: 'morning-9', label: '9:00 AM - 10:00 AM' },
    { value: 'morning-10', label: '10:00 AM - 11:00 AM' },
    { value: 'morning-11', label: '11:00 AM - 12:00 PM' },
    { value: 'afternoon-2', label: '2:00 PM - 3:00 PM' },
    { value: 'afternoon-3', label: '3:00 PM - 4:00 PM' },
    { value: 'afternoon-4', label: '4:00 PM - 5:00 PM' },
  ];

  const consultationTypes = [
    { value: 'in-person', label: 'In-Person Meeting' },
    { value: 'video-call', label: 'Video Call' },
    { value: 'phone-call', label: 'Phone Call' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('consultation.title')}</Text>
        <Text style={styles.subtitle}>{t('consultation.subtitle')}</Text>
      </View>

      <Card style={styles.formCard}>
        <Card.Content style={styles.formContent}>
          <Text style={styles.formTitle}>Schedule Your Consultation</Text>
          
          <View style={styles.formRow}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              label={`${t('consultation.form.firstName')} *`}
              value={formData.firstName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              label={`${t('consultation.form.lastName')} *`}
              value={formData.lastName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
            />
          </View>

          <View style={styles.formRow}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              label={`${t('consultation.form.email')} *`}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              label={`${t('consultation.form.phone')} *`}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />
          </View>

          <TextInput
            style={styles.input}
            label={t('consultation.form.company')}
            value={formData.company}
            onChangeText={(text) => setFormData(prev => ({ ...prev, company: text }))}
          />

          <TextInput
            style={styles.input}
            label={`${t('consultation.form.preferredDate')} *`}
            value={formData.preferredDate}
            onChangeText={(text) => setFormData(prev => ({ ...prev, preferredDate: text }))}
            placeholder="YYYY-MM-DD"
          />

          <TextInput
            style={styles.input}
            label={`${t('consultation.form.description')} *`}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
            placeholder="Describe your business needs and what you'd like to discuss..."
          />

          <Button
            mode="contained"
            style={styles.submitButton}
            onPress={handleSubmit}
            loading={consultationMutation.isPending}
            disabled={consultationMutation.isPending}
          >
            {consultationMutation.isPending ? t('consultation.form.booking') : t('consultation.form.book')}
          </Button>
        </Card.Content>
      </Card>

      {/* Next Steps Info */}
      <Card style={styles.infoCard}>
        <Card.Content style={styles.infoContent}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>We'll review your request and contact you within 24 hours</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>We'll confirm your preferred date and time or suggest alternatives</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>You'll receive a calendar invitation with meeting details</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Prepare any documents or questions you'd like to discuss</Text>
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
  infoCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    elevation: 2,
    backgroundColor: colors.gray100,
  },
  infoContent: {
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryBlue,
    marginBottom: 16,
    textAlign: 'center',
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    backgroundColor: colors.primaryBlue,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 24,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 20,
  },
});