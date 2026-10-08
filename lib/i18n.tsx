"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Language = "en" | "hi";

export interface Translations {
  // Brand
  brandName: string;
  brandTagline: string;

  // Language names
  langEnglish: string;
  langHindi: string;

  // Login Page
  welcomeBack: string;
  customerLogin: string;
  loginSubtitle: string;
  emailTab: string;
  mobileTab: string;
  loginViaOtp: string;
  loginViaPassword: string;
  emailLabel: string;
  emailPlaceholder: string;
  mobileLabel: string;
  mobilePlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  rememberMe: string;
  forgotPassword: string;
  sendOtpBtn: string;
  changeMobileBtn: string;
  verifyMobileTitle: string;
  smsSentBadge: string;
  enterOtpPrompt: string;
  enterOtpLabel: string;
  otpPlaceholder: string;
  didNotReceiveSms: string;
  resendOtpIn: string;
  resendOtpBtn: string;
  loginBtn: string;
  verifyAndContinueBtn: string;
  processingBtn: string;
  orDivider: string;
  continueWithGoogle: string;
  noAccountPrompt: string;
  createAccountLink: string;
  dreamHomeQuote1: string;
  dreamHomeQuote2: string;
  dreamHomeQuoteHighlight: string;
  dreamHomeDesc: string;

  // Errors & Alerts
  invalidCredentialsError: string;
  invalidEmailMobileHint: string;
  emailNotConfirmedError: string;
  resendConfirmationEmailBtn: string;
  confirmationEmailSentMsg: string;
  rateLimitError: string;
  networkError: string;
  googleOauthDisabledMsg: string;
  phoneProviderDisabledMsg: string;
  invalidOtpError: string;
  expiredOtpError: string;
  invalidPhoneError: string;
  fillRequiredFieldsError: string;

  // Signup Page
  signupTitle: string;
  signupSubtitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  villageCityLabel: string;
  villageCityPlaceholder: string;
  districtLabel: string;
  districtPlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  passwordsDoNotMatch: string;
  passwordMinLength: string;
  createAccountBtn: string;
  alreadyHaveAccount: string;
  loginLink: string;
  accountCreatedSuccess: string;

  // Customer Dashboard
  dashboardTitle: string;
  welcomeCustomer: string;
  signOutBtn: string;
  myProjects: string;
  myRequests: string;
  siteVisits: string;
  plansAndDrawings: string;
  payments: string;
  notifications: string;
  profile: string;
  editProfile: string;
  saveChanges: string;
}

const translationsEn: Translations = {
  brandName: "SARDA HOMEPLAN",
  brandTagline: "Ghar Ka Naksha, Aapke Sapno Ke Saath",

  langEnglish: "English",
  langHindi: "हिन्दी",

  welcomeBack: "Welcome Back",
  customerLogin: "Customer Login",
  loginSubtitle: "Login to access your projects, plans, and site consultations.",
  emailTab: "Email",
  mobileTab: "Mobile",
  loginViaOtp: "Login via OTP 📲",
  loginViaPassword: "Login via Password 🔒",
  emailLabel: "Email Address",
  emailPlaceholder: "Enter your email or 10-digit mobile number",
  mobileLabel: "Indian Mobile Number",
  mobilePlaceholder: "e.g. 7905916813",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter your password",
  rememberMe: "Keep me signed in",
  forgotPassword: "Forgot Password?",
  sendOtpBtn: "Send OTP",
  changeMobileBtn: "Change",
  verifyMobileTitle: "Verify Your Mobile",
  smsSentBadge: "SMS Sent",
  enterOtpPrompt: "We have sent a 6-digit verification OTP code to",
  enterOtpLabel: "Enter 6-Digit OTP",
  otpPlaceholder: "• • • • • •",
  didNotReceiveSms: "Didn't receive the SMS?",
  resendOtpIn: "Resend OTP in",
  resendOtpBtn: "Resend OTP",
  loginBtn: "Login to Dashboard",
  verifyAndContinueBtn: "Verify OTP & Open Dashboard",
  processingBtn: "Processing...",
  orDivider: "OR",
  continueWithGoogle: "Continue with Google",
  noAccountPrompt: "Don't have an account?",
  createAccountLink: "Create New Account",
  dreamHomeQuote1: "Your Dream Home",
  dreamHomeQuote2: "Starts with",
  dreamHomeQuoteHighlight: "a Plan",
  dreamHomeDesc: "Professional architectural house designs, structural blueprints, and Vastu-compliant layouts.",

  invalidCredentialsError: "Incorrect email, mobile, or password. Please verify your credentials and try again.",
  invalidEmailMobileHint: "If you signed up with your 10-digit mobile number, you can enter it above.",
  emailNotConfirmedError: "Your email address has not been confirmed yet. Please verify your email or click below to resend confirmation.",
  resendConfirmationEmailBtn: "Resend Confirmation Email",
  confirmationEmailSentMsg: "Confirmation email sent! Please check your inbox and spam folder.",
  rateLimitError: "Too many attempts. Please wait a minute before trying again.",
  networkError: "Connection error. Please check your internet connection.",
  googleOauthDisabledMsg: "Google Sign-In is being activated on the server. Please log in using Email & Password or Mobile.",
  phoneProviderDisabledMsg: "SMS gateway is being configured. Please use Email & Password or Mobile Password login below.",
  invalidOtpError: "Invalid OTP code. Please enter the 6-digit code received on your phone.",
  expiredOtpError: "This OTP code has expired. Please click Resend OTP to receive a new code.",
  invalidPhoneError: "Please enter a valid 10-digit Indian mobile number.",
  fillRequiredFieldsError: "Please fill in all required fields.",

  signupTitle: "Create Customer Account",
  signupSubtitle: "Join Sarda Homeplan to request site visits, manage blueprints, and track your dream home.",
  fullNameLabel: "Full Name",
  fullNamePlaceholder: "e.g. Ramesh Kumar Sharma",
  villageCityLabel: "Village / Town / City",
  villageCityPlaceholder: "e.g. Sheetlaganj, Patti",
  districtLabel: "District",
  districtPlaceholder: "e.g. Pratapgarh, Varanasi, Prayagraj",
  confirmPasswordLabel: "Confirm Password",
  confirmPasswordPlaceholder: "Re-enter your password",
  passwordsDoNotMatch: "Passwords do not match.",
  passwordMinLength: "Password must be at least 6 characters.",
  createAccountBtn: "Create My Account",
  alreadyHaveAccount: "Already have an account?",
  loginLink: "Login Here",
  accountCreatedSuccess: "Account created successfully! Forwarding to your dashboard...",

  dashboardTitle: "Customer Dashboard",
  welcomeCustomer: "Welcome",
  signOutBtn: "Sign Out",
  myProjects: "My Projects",
  myRequests: "My Requests",
  siteVisits: "Site Visits",
  plansAndDrawings: "Plans & Blueprints",
  payments: "Payments & Invoices",
  notifications: "Notifications",
  profile: "Profile Settings",
  editProfile: "Edit Profile",
  saveChanges: "Save Changes",
};

const translationsHi: Translations = {
  brandName: "शारदा होमप्लान",
  brandTagline: "घर का नक्शा, आपके सपनों के साथ",

  langEnglish: "English",
  langHindi: "हिन्दी",

  welcomeBack: "वापसी पर स्वागत है",
  customerLogin: "कस्टमर लॉगिन",
  loginSubtitle: "अपने प्रोजेक्ट्स, नक्शे और साइट परामर्श देखने के लिए लॉगिन करें।",
  emailTab: "ईमेल",
  mobileTab: "मोबाइल",
  loginViaOtp: "ओटीपी से लॉगिन करें 📲",
  loginViaPassword: "पासवर्ड से लॉगिन करें 🔒",
  emailLabel: "ईमेल पता",
  emailPlaceholder: "अपना ईमेल या 10-अंकों का मोबाइल नंबर दर्ज करें",
  mobileLabel: "भारतीय मोबाइल नंबर",
  mobilePlaceholder: "उदा. 7905916813",
  passwordLabel: "पासवर्ड",
  passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
  rememberMe: "लॉगिन बनाए रखें",
  forgotPassword: "पासवर्ड भूल गए?",
  sendOtpBtn: "ओटीपी भेजें",
  changeMobileBtn: "बदलें",
  verifyMobileTitle: "मोबाइल नंबर सत्यापित करें",
  smsSentBadge: "एसएमएस भेजा गया",
  enterOtpPrompt: "हमने 6-अंकों का सत्यापन ओटीपी भेजा है:",
  enterOtpLabel: "6-अंकों का ओटीपी दर्ज करें",
  otpPlaceholder: "• • • • • •",
  didNotReceiveSms: "एसएमएस नहीं मिला?",
  resendOtpIn: "पुनः ओटीपी भेजें",
  resendOtpBtn: "पुनः ओटीपी भेजें",
  loginBtn: "डैशबोर्ड में लॉगिन करें",
  verifyAndContinueBtn: "ओटीपी सत्यापित कर डैशबोर्ड खोलें",
  processingBtn: "प्रक्रिया जारी है...",
  orDivider: "या",
  continueWithGoogle: "Google के साथ जारी रखें",
  noAccountPrompt: "खाता नहीं है?",
  createAccountLink: "नया खाता बनाएं",
  dreamHomeQuote1: "आपके सपनों का घर",
  dreamHomeQuote2: "शुरू होता है",
  dreamHomeQuoteHighlight: "एक सटीक नक्शे से",
  dreamHomeDesc: "पेशेवर आर्किटेक्चरल घर के नक्शे, स्ट्रक्चरल ब्लूप्रिंट और संपूर्ण वास्तु-सम्मत डिजाइन।",

  invalidCredentialsError: "गलत ईमेल, मोबाइल नंबर या पासवर्ड। कृपया विवरण जांचें और पुनः प्रयास करें।",
  invalidEmailMobileHint: "यदि आपने 10-अंकों के मोबाइल नंबर से खाता बनाया था, तो उसे ऊपर दर्ज करें।",
  emailNotConfirmedError: "आपका ईमेल पता अभी सत्यापित नहीं हुआ है। कृपया अपना इनबॉक्स देखें या नीचे पुनः सत्यापन लिंक भेजें।",
  resendConfirmationEmailBtn: "सत्यापन ईमेल पुनः भेजें",
  confirmationEmailSentMsg: "सत्यापन ईमेल भेज दिया गया है! कृपया इनबॉक्स और स्पैम फ़ोल्डर जांचें।",
  rateLimitError: "बहुत अधिक प्रयास किए गए। कृपया थोड़ी देर प्रतीक्षा करें।",
  networkError: "इंटरनेट कनेक्शन में समस्या। कृपया अपना नेटवर्क जांचें।",
  googleOauthDisabledMsg: "सर्वर पर Google लॉगिन सक्रिय किया जा रहा है। कृपया ईमेल या मोबाइल से लॉगिन करें।",
  phoneProviderDisabledMsg: "एसएमएस गेटवे सेटअप में है। कृपया नीचे ईमेल या मोबाइल पासवर्ड से लॉगिन करें।",
  invalidOtpError: "अमान्य ओटीपी कोड। कृपया अपने फ़ोन पर प्राप्त 6-अंकों का कोड दर्ज करें।",
  expiredOtpError: "यह ओटीपी कोड समाप्त हो चुका है। कृपया 'पुनः ओटीपी भेजें' पर क्लिक करें।",
  invalidPhoneError: "कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।",
  fillRequiredFieldsError: "कृपया सभी आवश्यक जानकारी भरें।",

  signupTitle: "नया ग्राहक खाता बनाएं",
  signupSubtitle: "शारदा होमप्लान से जुड़ें — साइट विजिट बुक करें, नक्शे देखें और अपने सपनों का घर बनाएं।",
  fullNameLabel: "पूरा नाम",
  fullNamePlaceholder: "उदा. रमेश कुमार शर्मा",
  villageCityLabel: "गाँव / कस्बा / शहर",
  villageCityPlaceholder: "उदा. शीतलगंज, पट्टी",
  districtLabel: "ज़िला",
  districtPlaceholder: "उदा. प्रतापगढ़, वाराणसी, प्रयागराज",
  confirmPasswordLabel: "पासवर्ड की पुष्टि करें",
  confirmPasswordPlaceholder: "अपना पासवर्ड दोबारा दर्ज करें",
  passwordsDoNotMatch: "पासवर्ड मेल नहीं खाते।",
  passwordMinLength: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
  createAccountBtn: "खाता बनाएं",
  alreadyHaveAccount: "पहले से खाता है?",
  loginLink: "यहाँ लॉगिन करें",
  accountCreatedSuccess: "खाता सफलतापूर्वक बन गया! डैशबोर्ड पर भेजा जा रहा है...",

  dashboardTitle: "ग्राहक डैशबोर्ड",
  welcomeCustomer: "स्वागत है",
  signOutBtn: "लॉगआउट करें",
  myProjects: "मेरे प्रोजेक्ट्स",
  myRequests: "मेरे अनुरोध",
  siteVisits: "साइट विजिट्स",
  plansAndDrawings: "नक्शे और ड्रॉइंग्स",
  payments: "भुगतान और रसीद",
  notifications: "सूचनाएं",
  profile: "प्रोफ़ाइल सेटिंग्स",
  editProfile: "प्रोफ़ाइल बदलें",
  saveChanges: "सुरक्षित करें",
};

export const translations: Record<Language, Translations> = {
  en: translationsEn,
  hi: translationsHi,
};

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: translationsEn,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sarda_lang") as Language | null;
      if (saved === "hi" || saved === "en") {
        setLangState(saved);
      }
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("sarda_lang", newLang);
      document.cookie = `sarda_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: "en" as Language,
      setLang: () => {},
      t: translationsEn,
    };
  }
  return context;
}
