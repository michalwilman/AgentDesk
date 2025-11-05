'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'en' | 'he'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'nav.about': 'About',
    'nav.support': 'Support',
    'nav.login': 'Login',
    'nav.startTrial': 'Start Free Trial',
    
    // Auth - Register Page
    'auth.signUp': 'Sign Up',
    'auth.createAccount': 'Create Your Account',
    'auth.getStarted': 'Create a free account to get started',
    'auth.continueWithGoogle': 'Continue with Google',
    'auth.continueWithFacebook': 'Continue with Facebook',
    'auth.orContinueWithEmail': 'Or continue with email',
    'auth.fullName': 'Full Name',
    'auth.mobileNumber': 'Mobile Number',
    'auth.companyName': 'Company Name',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.createAccountButton': 'Create Account',
    'auth.creatingAccount': 'Creating account...',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.signIn': 'Sign in',
    
    // Auth - Login Page
    'auth.welcomeBack': 'Welcome Back',
    'auth.signInToAccount': 'Sign in to your account',
    'auth.forgotPassword': 'Forgot password?',
    'auth.signingIn': 'Signing in...',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.signUpLink': 'Sign up',
    
    // Placeholders
    'placeholder.fullName': 'John Doe',
    'placeholder.phone': '050-1234567',
    'placeholder.companyName': 'Your Company',
    'placeholder.email': 'you@example.com',
    'placeholder.password': 'At least 6 characters',
    
    // Validation Errors
    'error.fullNameRequired': 'Full name is required',
    'error.fullNameMinLength': 'Full name must be at least 2 characters',
    'error.fullNameTwoWords': 'Please enter both first and last name',
    'error.fullNameOnlyLetters': 'Full name can only contain letters and spaces',
    'error.phoneRequired': 'Phone number is required',
    'error.phoneInvalid': 'Invalid phone number. Format: 05X-XXXXXXX',
    'error.emailRequired': 'Email is required',
    'error.emailInvalid': 'Invalid email address',
    'error.passwordRequired': 'Password is required',
    'error.passwordMinLength': 'Password must be at least 6 characters',
    'error.fixErrors': 'Please fix the errors in the form',
    
    // Success Messages
    'success.checkEmail': 'Check your email!',
    'success.confirmationSent': 'We\'ve sent a confirmation link to',
    'success.verifyAccount': 'Click the link in the email to verify your account and get started.',
    'success.backToLogin': 'Back to Login',
    
    // Dashboard - General
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.description': "Here's what's happening with your bots",
    'dashboard.myBots': 'My AI Agents',
    'dashboard.createNewBot': 'Create New Agent',
    'dashboard.noBots': 'No agents yet',
    'dashboard.noBotsDescription': 'Create your first AI agent to get started',
    'dashboard.logout': 'Logout',
    
    // Dashboard - Bots
    'bots.title': 'AI Agents',
    'bots.active': 'Active',
    'bots.inactive': 'Inactive',
    'bots.edit': 'Edit',
    'bots.delete': 'Delete',
    'bots.view': 'View',
    'bots.settings': 'Settings',
    'bots.analytics': 'Analytics',
    'bots.knowledge': 'Knowledge Base',
    'bots.conversations': 'Conversations',
    'bots.createdAt': 'Created',
    'bots.updatedAt': 'Updated',
    
    // Bot Creation/Edit
    'bot.create': 'Create AI Agent',
    'bot.edit': 'Edit Agent',
    'bot.name': 'Agent Name',
    'bot.description': 'Description',
    'bot.noDescription': 'No description',
    'bot.language': 'Language',
    'bot.personality': 'Personality',
    'bot.welcomeMessage': 'Welcome Message',
    'bot.primaryColor': 'Primary Color',
    'bot.save': 'Save',
    'bot.saving': 'Saving...',
    'bot.cancel': 'Cancel',
    'bot.testChat': 'Test Chat',
    'bot.trained': 'Trained',
    'bot.notTrained': 'Not Trained',
    'bot.status': 'Status',
    'bot.delete.confirm': 'Are you sure you want to delete this agent?',
    'bot.delete.success': 'Agent deleted successfully',
    'bot.create.success': 'Agent created successfully',
    'bot.update.success': 'Agent updated successfully',
    
    // Knowledge Base
    'knowledge.title': 'Knowledge Base',
    'knowledge.uploadDocument': 'Upload Document',
    'knowledge.addWebsite': 'Add Website',
    'knowledge.documents': 'Documents',
    'knowledge.websites': 'Websites',
    'knowledge.noDocuments': 'No documents uploaded yet',
    'knowledge.noWebsites': 'No websites added yet',
    'knowledge.upload': 'Upload',
    'knowledge.uploading': 'Uploading...',
    'knowledge.processing': 'Processing',
    'knowledge.completed': 'Completed',
    'knowledge.failed': 'Failed',
    
    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.account': 'Account',
    'settings.subscription': 'Subscription',
    'settings.billing': 'Billing',
    'settings.integrations': 'Integrations',
    
    // Common Actions
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
  he: {
    // Navigation
    'nav.features': 'תכונות',
    'nav.pricing': 'מחירים',
    'nav.about': 'אודות',
    'nav.support': 'תמיכה',
    'nav.login': 'כניסה',
    'nav.startTrial': 'התחל ניסיון חינם',
    
    // Auth - Register Page
    'auth.signUp': 'הרשמה',
    'auth.createAccount': 'צור את החשבון שלך',
    'auth.getStarted': 'צור חשבון חינם כדי להתחיל',
    'auth.continueWithGoogle': 'המשך עם Google',
    'auth.continueWithFacebook': 'המשך עם Facebook',
    'auth.orContinueWithEmail': 'או המשך עם אימייל',
    'auth.fullName': 'שם מלא',
    'auth.mobileNumber': 'מספר נייד',
    'auth.companyName': 'שם החברה',
    'auth.email': 'אימייל',
    'auth.password': 'סיסמה',
    'auth.createAccountButton': 'צור חשבון',
    'auth.creatingAccount': 'יוצר חשבון...',
    'auth.alreadyHaveAccount': 'כבר יש לך חשבון?',
    'auth.signIn': 'התחבר',
    
    // Auth - Login Page
    'auth.welcomeBack': 'ברוך שובך',
    'auth.signInToAccount': 'התחבר לחשבון שלך',
    'auth.forgotPassword': 'שכחת סיסמה?',
    'auth.signingIn': 'מתחבר...',
    'auth.dontHaveAccount': 'אין לך חשבון?',
    'auth.signUpLink': 'הירשם',
    
    // Placeholders
    'placeholder.fullName': 'ישראל ישראלי',
    'placeholder.phone': '050-1234567',
    'placeholder.companyName': 'שם החברה שלך',
    'placeholder.email': 'email@example.com',
    'placeholder.password': 'לפחות 6 תווים',
    
    // Validation Errors
    'error.fullNameRequired': 'שם מלא הוא שדה חובה',
    'error.fullNameMinLength': 'שם מלא חייב להכיל לפחות 2 תווים',
    'error.fullNameTwoWords': 'יש להזין שם פרטי ושם משפחה',
    'error.fullNameOnlyLetters': 'שם מלא יכול להכיל רק אותיות ורווחים',
    'error.phoneRequired': 'מספר טלפון הוא שדה חובה',
    'error.phoneInvalid': 'מספר טלפון לא תקין. פורמט נכון: 05X-XXXXXXX',
    'error.emailRequired': 'אימייל הוא שדה חובה',
    'error.emailInvalid': 'כתובת אימייל לא תקינה',
    'error.passwordRequired': 'סיסמה היא שדה חובה',
    'error.passwordMinLength': 'סיסמה חייבת להכיל לפחות 6 תווים',
    'error.fixErrors': 'אנא תקן את השגיאות בטופס',
    
    // Success Messages
    'success.checkEmail': 'בדוק את האימייל שלך!',
    'success.confirmationSent': 'שלחנו לך קישור אימות אל',
    'success.verifyAccount': 'לחץ על הקישור באימייל כדי לאמת את החשבון ולהתחיל.',
    'success.backToLogin': 'חזרה לכניסה',
    
    // Dashboard - General
    'dashboard.title': 'לוח בקרה',
    'dashboard.welcome': 'ברוך שובך',
    'dashboard.description': 'הנה מה שקורה עם הסוכנים שלך',
    'dashboard.myBots': 'הסוכנים שלי',
    'dashboard.createNewBot': 'צור סוכן חדש',
    'dashboard.noBots': 'אין סוכנים עדיין',
    'dashboard.noBotsDescription': 'צור את הסוכן הראשון שלך כדי להתחיל',
    'dashboard.logout': 'התנתק',
    
    // Dashboard - Bots
    'bots.title': 'סוכני AI',
    'bots.active': 'פעיל',
    'bots.inactive': 'לא פעיל',
    'bots.edit': 'ערוך',
    'bots.delete': 'מחק',
    'bots.view': 'צפה',
    'bots.settings': 'הגדרות',
    'bots.analytics': 'אנליטיקה',
    'bots.knowledge': 'בסיס ידע',
    'bots.conversations': 'שיחות',
    'bots.createdAt': 'נוצר',
    'bots.updatedAt': 'עודכן',
    
    // Bot Creation/Edit
    'bot.create': 'צור סוכן AI',
    'bot.edit': 'ערוך סוכן',
    'bot.name': 'שם הסוכן',
    'bot.description': 'תיאור',
    'bot.noDescription': 'אין תיאור',
    'bot.language': 'שפה',
    'bot.personality': 'אישיות',
    'bot.welcomeMessage': 'הודעת ברוכים הבאים',
    'bot.primaryColor': 'צבע ראשי',
    'bot.save': 'שמור',
    'bot.saving': 'שומר...',
    'bot.cancel': 'ביטול',
    'bot.testChat': 'בדיקת צ\'אט',
    'bot.trained': 'מאומן',
    'bot.notTrained': 'לא מאומן',
    'bot.status': 'סטטוס',
    'bot.delete.confirm': 'האם אתה בטוח שברצונך למחוק את הסוכן?',
    'bot.delete.success': 'הסוכן נמחק בהצלחה',
    'bot.create.success': 'הסוכן נוצר בהצלחה',
    'bot.update.success': 'הסוכן עודכן בהצלחה',
    
    // Knowledge Base
    'knowledge.title': 'בסיס ידע',
    'knowledge.uploadDocument': 'העלה מסמך',
    'knowledge.addWebsite': 'הוסף אתר',
    'knowledge.documents': 'מסמכים',
    'knowledge.websites': 'אתרים',
    'knowledge.noDocuments': 'אין מסמכים שהועלו עדיין',
    'knowledge.noWebsites': 'אין אתרים שנוספו עדיין',
    'knowledge.upload': 'העלה',
    'knowledge.uploading': 'מעלה...',
    'knowledge.processing': 'מעבד',
    'knowledge.completed': 'הושלם',
    'knowledge.failed': 'נכשל',
    
    // Settings
    'settings.title': 'הגדרות',
    'settings.profile': 'פרופיל',
    'settings.account': 'חשבון',
    'settings.subscription': 'מנוי',
    'settings.billing': 'חיוב',
    'settings.integrations': 'אינטגרציות',
    
    // Common Actions
    'common.save': 'שמור',
    'common.cancel': 'ביטול',
    'common.delete': 'מחק',
    'common.edit': 'ערוך',
    'common.back': 'חזור',
    'common.next': 'הבא',
    'common.previous': 'הקודם',
    'common.search': 'חפש',
    'common.filter': 'סנן',
    'common.loading': 'טוען...',
    'common.error': 'שגיאה',
    'common.success': 'הצלחה',
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    setMounted(true)
    // Always default to English for now
    // TODO: Uncomment below to restore multi-language support
    /*
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'he')) {
      setLanguageState(savedLanguage)
    } else {
      // Detect browser language
      const browserLang = navigator.language
      if (browserLang.startsWith('he')) {
        setLanguageState('he')
      }
    }
    */
  }, [])

  // Update localStorage and document direction when language changes
  useEffect(() => {
    if (!mounted) return
    
    localStorage.setItem('language', language)
    document.documentElement.lang = language
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr'
  }, [language, mounted])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  const dir = language === 'he' ? 'rtl' : 'ltr'

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

