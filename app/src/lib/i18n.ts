import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
const en = {
  translation: {
    // Common
    'appTitle': 'Rapid Response',
    'home': 'Home',
    'dashboard': 'Dashboard',
    'settings': 'Settings',
    'logout': 'Logout',
    'login': 'Login',
    'loginResponderAdmin': 'Login (Responder / Admin)',
    'register': 'Register',
    'save': 'Save',
    'cancel': 'Cancel',
    'close': 'Close',
    'confirm': 'Confirm',
    'delete': 'Delete',
    'edit': 'Edit',
    'view': 'View',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
    
    // Navigation
    'citizenDashboard': 'Citizen Dashboard',
    'reportIncident': 'Report Incident',
    'liveFeed': 'Live Feed',
    'myReports': 'My Reports',
    'responderDashboard': 'Responder Dashboard',
    'priorityQueue': 'Priority Queue',
    'liveMap': 'Live Map',
    'adminDashboard': 'Admin Dashboard',
    'userManagement': 'User Management',
    'analytics': 'Analytics',
    'configuration': 'Configuration',
    'auditLogs': 'Audit Logs',
    
    // Incident types
    'fire': 'Fire',
    'medicalEmergency': 'Medical Emergency',
    'accident': 'Accident',
    'theft': 'Theft',
    'vandalism': 'Vandalism',
    'other': 'Other',
    
    // Severity levels
    'critical': 'Critical',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low',
    
    // Status
    'unverified': 'Unverified',
    'partiallyVerified': 'Partially Verified',
    'verified': 'Verified',
    'inProgress': 'In Progress',
    'resolved': 'Resolved',
    
    // Incident reporting
    'reportNewIncident': 'Report New Incident',
    'incidentType': 'Incident Type',
    'incidentTitle': 'Title',
    'incidentDescription': 'Description',
    'location': 'Location',
    'selectLocation': 'Select Location on Map',
    'mediaUpload': 'Upload Media (Optional)',
    'submitReport': 'Submit Report',
    'reportSuccess': 'Incident reported successfully!',
    'reportError': 'Failed to submit report. Please try again.',
    
    // Map
    'findOnMap': 'Find on Map',
    'currentLocation': 'Current Location',
    'selectOnMap': 'Select on Map',
    
    // Leaderboard
    'leaderboard': 'Leaderboard',
    'topReporters': 'Top Reporters',
    'rank': 'Rank',
    'user': 'User',
    'points': 'Points',
    'level': 'Level',
    'badges': 'Badges',
    'streak': 'Streak',
    
    // User Profile
    'profile': 'Profile',
    'username': 'Username',
    'email': 'Email',
    'role': 'Role',
    'stats': 'Statistics',
    'totalReports': 'Total Reports',
    'resolvedReports': 'Resolved Reports',
    'totalUpvotes': 'Total Upvotes',
    
    // Accessibility
    'skipToMain': 'Skip to main content',
    'highContrast': 'High Contrast Mode',
    'fontSize': 'Font Size',
    'voiceInput': 'Voice Input',
    'startRecording': 'Start Recording',
    'stopRecording': 'Stop Recording',
    'recording': 'Recording...',
    
    // Alerts
    'alert': 'Alert',
    'notifications': 'Notifications',
    'subscribe': 'Subscribe',
    'unsubscribe': 'Unsubscribe',
    'alertSettings': 'Alert Settings',
    
    // Admin
    'adminPanel': 'Admin Panel',
    'userManager': 'User Manager',
    'incidentManager': 'Incident Manager',
    'systemConfig': 'System Configuration',
    
    // Errors
    'error': 'Error',
    'success': 'Success',
    'warning': 'Warning',
    'info': 'Info',
    
    // Footer
    'about': 'About',
    'contact': 'Contact',
    'privacy': 'Privacy Policy',
    'terms': 'Terms of Service',
    'citizen': 'Citizen',
    'responder': 'Responder',
    'administrator': 'Administrator',
    'backToHome': 'Back to Home',
    'welcomeBack': 'Welcome Back',
    'signInToAccess': 'Sign in to access the command center',
    'emailLabel': 'Email',
    'passwordLabel': 'Password',
    'forgotPassword': 'Forgot password?',
    'signingIn': 'Signing in...',
    'signInAsResponder': 'Sign in as Responder',
    'signInAsAdministrator': 'Sign in as Administrator',
    'areYouCitizen': 'Are you a citizen?',
    'goToCitizenPortal': 'Go to Citizen Portal',
    'heroTagline': 'Real-time Emergency Coordination Platform',
    'heroTitleLine1': 'Report Emergencies.',
    'heroTitleLine2': 'Enable Faster Response.',
    'heroDescription':
      "A unified platform connecting citizens with emergency responders. Report incidents in real-time, track response progress, and help your community stay safe.",
    'activeIncidents': 'Active Incidents',
    'ongoingResponses': 'Ongoing Responses',
    'respondersActive': 'Responders Active',
    'howItWorks': 'How It Works',
    'howItWorksDescription':
      "Our platform streamlines emergency reporting and response coordination, ensuring help reaches where it's needed most.",
    'featureReportInstantlyTitle': 'Report Instantly',
    'featureReportInstantlyDescription':
      'Citizens can quickly report emergencies with location, photos, and detailed descriptions.',
    'featureVerifyTitle': 'Verify & Prioritize',
    'featureVerifyDescription':
      'Responders verify reports and prioritize based on severity, location, and resources.',
    'featureCoordinateTitle': 'Coordinate Response',
    'featureCoordinateDescription':
      'Real-time updates keep everyone informed from incident report to resolution.',
    'readyToMakeDifference': 'Ready to Make a Difference?',
    'ctaDescription':
      'Join thousands of citizens helping to keep their communities safe through rapid incident reporting and coordination.',
    'getStarted': 'Get Started',
    'viewLiveFeed': 'View Live Feed',
    'help': 'Help',
    'responderDescription': 'Emergency response personnel',
    'administratorDescription': 'System management access',
    'passwordPlaceholder': 'Enter your password'
  }
};

// Hindi translations
const hi = {
  translation: {
    // Common
    'appTitle': 'त्वरित प्रतिक्रिया',
    'home': 'होम',
    'dashboard': 'डैशबोर्ड',
    'settings': 'सेटिंग्स',
    'logout': 'लॉग आउट',
    'login': 'लॉग इन',
    'loginResponderAdmin': 'लॉग इन (प्रतिक्रिया दल / एडमिन)',
    'register': 'रजिस्टर',
    'save': 'सेव',
    'cancel': 'रद्द करें',
    'close': 'बंद करें',
    'confirm': 'पुष्टि करें',
    'delete': 'मिटाएं',
    'edit': 'संपादित करें',
    'view': 'देखें',
    'back': 'वापस',
    'next': 'अगला',
    'previous': 'पिछला',
    
    // Navigation
    'citizenDashboard': 'नागरिक डैशबोर्ड',
    'reportIncident': 'हादसा रिपोर्ट करें',
    'liveFeed': 'लाइव फीड',
    'myReports': 'मेरी रिपोर्टें',
    'responderDashboard': 'प्रतिक्रिया डैशबोर्ड',
    'priorityQueue': 'प्राथमिकता कतार',
    'liveMap': 'लाइव मैप',
    'adminDashboard': 'एडमिन डैशबोर्ड',
    'userManagement': 'यूजर मैनेजमेंट',
    'analytics': 'विश्लेषण',
    'configuration': 'कॉन्फ़िगरेशन',
    'auditLogs': 'ऑडिट लॉग्स',
    
    // Incident types
    'fire': 'अग्नि',
    'medicalEmergency': 'चिकित्सा आपातकाल',
    'accident': 'दुर्घटना',
    'theft': 'चोरी',
    'vandalism': 'वैंडलिज़्म',
    'other': 'अन्य',
    
    // Severity levels
    'critical': 'गंभीर',
    'high': 'उच्च',
    'medium': 'मध्यम',
    'low': 'निम्न',
    
    // Status
    'unverified': 'असत्यापित',
    'partiallyVerified': 'आंशिक रूप से सत्यापित',
    'verified': 'सत्यापित',
    'inProgress': 'प्रगति में',
    'resolved': 'निपटा',
    
    // Incident reporting
    'reportNewIncident': 'नया हादसा रिपोर्ट करें',
    'incidentType': 'हादसा प्रकार',
    'incidentTitle': 'शीर्षक',
    'incidentDescription': 'विवरण',
    'location': 'स्थान',
    'selectLocation': 'मैप पर स्थान चुनें',
    'mediaUpload': 'मीडिया अपलोड (वैकल्पिक)',
    'submitReport': 'रिपोर्ट सबमिट करें',
    'reportSuccess': 'हादसा सफलतापूर्वक रिपोर्ट किया गया!',
    'reportError': 'रिपोर्ट सबमिट करने में असफल। कृपया पुनः प्रयास करें।',
    
    // Map
    'findOnMap': 'मैप पर खोजें',
    'currentLocation': 'वर्तमान स्थान',
    'selectOnMap': 'मैप पर चुनें',
    
    // Leaderboard
    'leaderboard': 'लीडरबोर्ड',
    'topReporters': 'शीर्ष रिपोर्टर',
    'rank': 'रैंक',
    'user': 'यूजर',
    'points': 'पॉइंट्स',
    'level': 'स्तर',
    'badges': 'बैज',
    'streak': 'स्ट्रीक',
    
    // User Profile
    'profile': 'प्रोफ़ाइल',
    'username': 'यूजरनेम',
    'email': 'ईमेल',
    'role': 'भूमिका',
    'stats': 'आंकड़े',
    'totalReports': 'कुल रिपोर्टें',
    'resolvedReports': 'निपटाई गई रिपोर्टें',
    'totalUpvotes': 'कुल अपवोट्स',
    
    // Accessibility
    'skipToMain': 'मुख्य सामग्री पर जाएं',
    'highContrast': 'उच्च कंट्रास्ट मोड',
    'fontSize': 'फ़ॉन्ट आकार',
    'voiceInput': 'वॉइस इनपुट',
    'startRecording': 'रिकॉर्डिंग शुरू करें',
    'stopRecording': 'रिकॉर्डिंग रोकें',
    'recording': 'रिकॉर्डिंग...',
    
    // Alerts
    'alert': 'अलर्ट',
    'notifications': 'सूचनाएं',
    'subscribe': 'सब्सक्राइब',
    'unsubscribe': 'अनसब्सक्राइब',
    'alertSettings': 'अलर्ट सेटिंग्स',
    
    // Admin
    'adminPanel': 'एडमिन पैनल',
    'userManager': 'यूजर मैनेजर',
    'incidentManager': 'हादसा मैनेजर',
    'systemConfig': 'सिस्टम कॉन्फ़िगरेशन',
    
    // Errors
    'error': 'त्रुटि',
    'success': 'सफलता',
    'warning': 'चेतावनी',
    'info': 'जानकारी',
    
    // Footer
    'about': 'हमारे बारे में',
    'contact': 'संपर्क',
    'privacy': 'गोपनीयता नीति',
    'terms': 'सेवा की शर्तें',
    'citizen': 'नागरिक',
    'responder': 'प्रतिक्रिया दल',
    'administrator': 'प्रशासक',
    'backToHome': 'होम पर वापस',
    'welcomeBack': 'वापसी पर स्वागत है',
    'signInToAccess': 'कमान्ड सेंटर तक पहुँचने के लिए साइन इन करें',
    'emailLabel': 'ईमेल',
    'passwordLabel': 'पासवर्ड',
    'forgotPassword': 'पासवर्ड भूल गए?',
    'signingIn': 'साइन इन हो रहा है...',
    'signInAsResponder': 'प्रतिक्रिया दल के रूप में साइन इन करें',
    'signInAsAdministrator': 'प्रशासक के रूप में साइन इन करें',
    'areYouCitizen': 'क्या आप नागरिक हैं?',
    'goToCitizenPortal': 'नागरिक पोर्टल पर जाएं',
    'heroTagline': 'रियल-टाइम आपातकाल समन्वय प्लेटफ़ॉर्म',
    'heroTitleLine1': 'आपातकाल रिपोर्ट करें।',
    'heroTitleLine2': 'तेज़ प्रतिक्रिया सक्षम करें।',
    'heroDescription':
      'नागरिकों और आपातकालीन प्रतिक्रिया दल को जोड़ने वाला एक एकीकृत प्लेटफ़ॉर्म। रियल-टाइम में घटनाएं रिपोर्ट करें, प्रतिक्रिया प्रगति ट्रैक करें, और अपने समुदाय को सुरक्षित रखने में मदद करें।',
    'activeIncidents': 'सक्रिय घटनाएं',
    'ongoingResponses': 'चल रही प्रतिक्रियाएं',
    'respondersActive': 'सक्रिय प्रतिक्रिया दल',
    'howItWorks': 'यह कैसे काम करता है',
    'howItWorksDescription':
      'हमारा प्लेटफ़ॉर्म आपातकाल रिपोर्टिंग और प्रतिक्रिया समन्वय को सरल बनाता है, ताकि सहायता सही जगह जल्दी पहुँच सके।',
    'featureReportInstantlyTitle': 'तुरंत रिपोर्ट करें',
    'featureReportInstantlyDescription':
      'नागरिक स्थान, फ़ोटो और विवरण के साथ जल्दी से आपातकाल रिपोर्ट कर सकते हैं।',
    'featureVerifyTitle': 'सत्यापित करें और प्राथमिकता दें',
    'featureVerifyDescription':
      'प्रतिक्रिया दल रिपोर्ट को सत्यापित करके गंभीरता, स्थान और संसाधनों के आधार पर प्राथमिकता देता है।',
    'featureCoordinateTitle': 'प्रतिक्रिया का समन्वय',
    'featureCoordinateDescription':
      'रियल-टाइम अपडेट्स घटना रिपोर्ट से लेकर समाधान तक सभी को जानकारी देते रहते हैं।',
    'readyToMakeDifference': 'क्या आप बदलाव लाने के लिए तैयार हैं?',
    'ctaDescription':
      'तेज़ घटना रिपोर्टिंग और समन्वय के माध्यम से अपने समुदाय को सुरक्षित रखने में हजारों नागरिकों के साथ जुड़ें।',
    'getStarted': 'शुरू करें',
    'viewLiveFeed': 'लाइव फीड देखें',
    'help': 'सहायता',
    'responderDescription': 'आपातकालीन प्रतिक्रिया कर्मी',
    'administratorDescription': 'सिस्टम प्रबंधन एक्सेस',
    'passwordPlaceholder': 'अपना पासवर्ड दर्ज करें'
  }
};

// Initialize i18next
i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: { translation: en.translation },
      hi: { translation: hi.translation }
    },
    fallbackLng: 'en', // Default language
    debug: true,
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
  });

export default i18n;