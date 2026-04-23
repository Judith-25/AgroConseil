import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    resources: {
      en: {
        translation: {
          app_name: 'AgriConseil West Africa',
          welcome: 'Welcome, Farmer',
          weather: 'Weather',
          advice: 'AI Advice',
          crops: 'My Crops',
          profile: 'Settings',
          login: 'Connect',
          logout: 'Logout',
          prevention: 'Disease Prevention',
          harvest: 'Harvest Tips',
          storage: 'Safe Storage',
          offline: 'Offline Mode Active'
        }
      },
      fr: {
        translation: {
          app_name: 'AgriConseil Afrique de l\'Ouest',
          welcome: 'Bienvenue, Agriculteur',
          weather: 'Météo',
          advice: 'Conseils IA',
          crops: 'Mes Cultures',
          profile: 'Paramètres',
          login: 'Se connecter',
          logout: 'Se déconnecter',
          prevention: 'Prévention Maladies',
          harvest: 'Conseils Récolte',
          storage: 'Stockage Sûr',
          offline: 'Mode Hors-ligne Actif'
        }
      },
      // Local languages can be added here
      wo: {
        translation: {
          app_name: 'AgriConseil Afrique u Sowwu',
          welcome: 'Dalal ak jamm, Beykat bi',
          weather: 'Météo',
        }
      }
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
