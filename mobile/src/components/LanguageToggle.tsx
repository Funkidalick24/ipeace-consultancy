import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme';

export const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'sn' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  return (
    <View style={styles.container}>
      <Button
        mode="outlined"
        onPress={toggleLanguage}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        {i18n.language === 'en' ? 'Shona' : 'English'}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  button: {
    borderColor: colors.primaryBlue,
    minWidth: 80,
  },
  buttonLabel: {
    color: colors.primaryBlue,
    fontSize: 12,
  },
});