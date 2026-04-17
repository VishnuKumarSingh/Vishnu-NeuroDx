import { createContext, useContext, useState, ReactNode } from 'react'

export type Lang = 'en' | 'hi'

const translations = {
  en: {
    nav_dashboard: 'Dashboard', nav_detection: 'MRI Detection',
    nav_history: 'History', nav_chat: 'AI Assistant',
    nav_feedback: 'Feedback', logout: 'Logout',
    welcome: 'Welcome back',
    tumor_found: 'Tumor Detected', no_tumor: 'No Tumor Found',
    confidence: 'Confidence', recommendation: 'Recommendation',
    ai_greeting: 'Hello! I am NeuroAI Assistant. How can I help you today with your neurological queries?',
    chat_placeholder: 'Ask about MRI results, brain health, medications...',
    feedback_thanks: 'Thank you for your feedback!',
    report_rec: 'Schedule follow-up appointment with a neurologist within 2 weeks.',
    report_rec_clear: 'No immediate action required. Continue routine annual check-ups.',
    overview: 'Overview',
    total_scans: 'Total Scans',
    tumors_detected: 'Tumors Detected',
    clear_scans: 'Clear Scans',
    ai_chats: 'AI Chats',
    recent_scans: 'Recent Scans',
    new_scan: 'New Scan',
    ask_ai: 'Ask AI Assistant',
    view_reports: 'View Reports',
    quick_actions: 'Quick Actions',
    clear_chat_confirm: 'Clear all chat history?',
    online: 'Online',
    clear_chat: 'Clear Chat',
    typing: 'Typing...',
    clinical_grade_ai: 'Clinical-grade AI Analysis',
    hipaa_compliant: 'HIPAA-compliant Security',
    english_hindi_support: 'English & Hindi Support',
    sign_in_description: 'Sign in with your registered email',
    email_address: 'Email Address',
    password: 'Password',
    login_to_dashboard: 'Login to Dashboard',
    no_account: "Don't have an account?",
    sign_up: 'Sign up',
    login: 'Login',
    signup: 'Sign Up',
    create_account: 'Create your account',
    join_platform: 'Join the NeuroAI Detect platform',
    full_name: 'Full Name',
    password_min: 'Password (min. 6 characters)',
    create_account_btn: 'Create Account',
    have_account: 'Already have an account?',
    analysis_complete: 'Analysis complete!',
    ai_fingertips: 'AI-assisted neurological analysis at your fingertips.',
    view_all: 'View All',
    no_scans: 'No scans yet',
    first_scan: 'Run your first scan →',
    case: 'Case',
    date: 'Date',
    result: 'Result',
    pdf_generating: 'Generating PDF...',
    report_downloaded: 'Report downloaded!',
    download_failed: 'Download failed.',
    past_scans: 'Past Scans',
    reports: 'Reports',
    all_mri_reports: 'All your MRI scan reports and diagnoses.',
    clear_all: 'Clear All',
    no_reports: 'No reports yet',
    first_mri: 'Run your first MRI detection scan to get started.',
    report_detail: 'Report Detail',
    send_feedback_title: 'Send Feedback',
    help_improve_neuroai: 'Help us improve NeuroAI Detect for healthcare professionals.',
    rate_experience: 'Rate your experience',
    feedback_category: 'Category',
    feedback_message: 'Your Message',
    message_placeholder: 'Tell us what you think or report an issue...',
    submit_feedback: 'Submit Feedback',
    submitted_feedback: 'Your Submitted Feedback',
    fill_required_fields: 'Please add a rating and message.',
    download_report: 'Download Report',
    ask_ai_text: 'Ask AI',
    feedback_page_heading: 'Feedback',
    logout_confirm: 'Are you sure you want to logout?',
    logout_success: 'Logged out.',
  },
  hi: {
    nav_dashboard: 'डैशबोर्ड', nav_detection: 'MRI जांच',
    nav_history: 'इतिहास', nav_chat: 'AI सहायक',
    nav_feedback: 'प्रतिक्रिया', logout: 'लॉगआउट',
    welcome: 'वापस स्वागत है',
    tumor_found: 'ट्यूमर मिला', no_tumor: 'कोई ट्यूमर नहीं',
    confidence: 'विश्वास', recommendation: 'सुझाव',
    ai_greeting: 'नमस्ते! मैं NeuroAI सहायक हूँ। आज आपकी न्यूरोलॉजिकल जिज्ञासाओं में मैं कैसे मदद कर सकता हूँ?',
    chat_placeholder: 'MRI परिणाम, मस्तिष्क स्वास्थ्य, दवाओं के बारे में पूछें...',
    feedback_thanks: 'आपकी प्रतिक्रिया के लिए धन्यवाद!',
    report_rec: '2 सप्ताह के भीतर न्यूरोलॉजिस्ट के साथ फॉलो-अप अपॉइंटमेंट शेड्यूल करें।',
    report_rec_clear: 'तत्काल कार्रवाई की आवश्यकता नहीं। नियमित वार्षिक जांच जारी रखें।',
    overview: 'अवलोकन',
    total_scans: 'कुल स्कैन',
    tumors_detected: 'ट्यूमर पाए गए',
    clear_scans: 'सामान्य स्कैन',
    ai_chats: 'AI चैट',
    recent_scans: 'हाल ही के स्कैन',
    new_scan: 'नई स्कैन',
    ask_ai: 'AI से पूछें',
    view_reports: 'रिपोर्ट देखें',
    quick_actions: 'त्वरित क्रियाएं',
    clear_chat_confirm: 'क्या आप चैट इतिहास मिटाना चाहते हैं?',
    online: 'ऑनलाइन',
    clear_chat: 'चैट साफ करें',
    typing: 'टाइप कर रहा है...',
    clinical_grade_ai: 'क्लिनिकल-ग्रेड AI विश्लेषण',
    hipaa_compliant: 'HIPAA-अनुपालन सुरक्षा',
    english_hindi_support: 'English और हिन्दी सहायता',
    sign_in_description: 'अपने पंजीकृत ईमेल से साइन इन करें',
    email_address: 'ईमेल पता',
    password: 'पासवर्ड',
    login_to_dashboard: 'डैशबोर्ड में लॉगिन करें',
    no_account: 'खाता नहीं है?',
    sign_up: 'साइन अप करें',
    login: 'लॉगिन',
    signup: 'साइन अप',
    create_account: 'अपना खाता बनाएं',
    join_platform: 'NeuroAI Detect प्लेटफॉर्म से जुड़ें',
    full_name: 'पूरा नाम',
    password_min: 'पासवर्ड (न्यूनतम 6 अक्षर)',
    create_account_btn: 'खाता बनाएं',
    have_account: 'पहले से खाता है?',
    analysis_complete: 'विश्लेषण पूर्ण!',
    ai_fingertips: 'AI-सहायक न्यूरोलॉजिकल विश्लेषण आपकी उंगलियों पर।',
    view_all: 'सब देखें',
    no_scans: 'अभी तक कोई स्कैन नहीं',
    first_scan: 'पहली स्कैन शुरू करें →',
    case: 'केस',
    date: 'तारीख',
    result: 'परिणाम',
    pdf_generating: 'PDF बन रही है...',
    report_downloaded: 'रिपोर्ट डाउनलोड हुई!',
    download_failed: 'डाउनलोड विफल।',
    past_scans: 'पिछली जांच',
    reports: 'रिपोर्ट',
    all_mri_reports: 'आपकी सभी MRI स्कैन रिपोर्ट।',
    clear_all: 'सब हटाएं',
    no_reports: 'अभी तक कोई रिपोर्ट नहीं',
    first_mri: 'पहली MRI जांच चलाएं।',
    report_detail: 'रिपोर्ट विवरण',
    send_feedback_title: 'प्रतिक्रिया भेजें',
    help_improve_neuroai: 'स्वास्थ्य पेशेवरों के लिए NeuroAI Detect बेहतर बनाने में मदद करें।',
    rate_experience: 'अपना अनुभव रेट करें',
    feedback_category: 'श्रेणी',
    feedback_message: 'आपका संदेश',
    message_placeholder: 'हमें बताएं कि आप क्या सोचते हैं...',
    submit_feedback: 'प्रतिक्रिया सबमिट करें',
    submitted_feedback: 'आपकी सबमिट की गई प्रतिक्रिया',
    fill_required_fields: 'कृपया सभी फ़ील्ड भरें।',
    download_report: 'रिपोर्ट डाउनलोड',
    ask_ai_text: 'AI से पूछें',
    feedback_page_heading: 'सुझाव',
    logout_confirm: 'क्या आप निश्चित हैं?',
    logout_success: 'लॉगआउट सफल।',
  },
} as const

type TranslationKey = keyof typeof translations.en

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => string
}

const LangContext = createContext<LangContextType>(null!)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('neuroai_lang') as Lang) || 'en'
  })

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('neuroai_lang', l)
  }

  function t(key: TranslationKey): string {
    const val = translations[lang][key]
    return String(val ?? translations.en[key] ?? '')
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}

export { translations }
