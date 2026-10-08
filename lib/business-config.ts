/**
 * Centralized Single Source of Truth for Public Business Profile & Contact Information
 * 
 * Sarda Homeplan - House Planning & Consultation
 * Primary Public Business Owner: Dinesh Kumar Sharma
 * Location: Pratapgarh, Uttar Pradesh
 */

export interface BusinessConfig {
  name: string;
  nameHi: string;
  shortName: string;
  brand: string;
  brandHi: string;
  role: string;
  roleHi: string;
  teacherBackgroundEn: string;
  teacherBackgroundHi: string;
  
  // Public Verified Contact Information
  publicPhone: string;
  publicPhoneFormatted: string;
  publicPhoneRaw: string;
  publicWhatsApp: string;
  publicWhatsAppFormatted: string;
  publicWhatsAppUrl: string;
  publicEmail: string;
  
  // Location & Coverage
  location: string;
  locationHi: string;
  serviceArea: string;
  serviceAreaHi: string;
  
  // Metrics & Credibility (Honest, verified figures)
  experienceYears: string;
  experienceLabel: string;
  experienceLabelHi: string;
  completedPlans: string;
  completedPlansLabel: string;
  completedPlansLabelHi: string;
  
  // Visual Asset
  photoUrl: string;
  
  // Bio & Philosophy
  bioEn: string;
  bioHi: string;
  philosophyQuoteEn: string;
  philosophyQuoteHi: string;
  
  // Expertise
  expertise: Array<{
    titleEn: string;
    titleHi: string;
    descEn: string;
    descHi: string;
  }>;
  
  // 5-Step Working Process
  processSteps: Array<{
    stepNumber: number;
    titleEn: string;
    titleHi: string;
    descEn: string;
    descHi: string;
  }>;
  
  // Trust Points
  trustPoints: Array<{
    en: string;
    hi: string;
  }>;
}

export const BUSINESS_CONFIG: BusinessConfig = {
  name: "Dinesh Kumar Sharma",
  nameHi: "दिनेश कुमार शर्मा",
  shortName: "Dinesh",
  brand: "Sarda Homeplan",
  brandHi: "शारदा होमप्लान",
  role: "House Planning Consultant",
  roleHi: "आवास नियोजन परामर्शदाता (House Planning Consultant)",
  teacherBackgroundEn: "Government School Teacher & House Planning Consultant",
  teacherBackgroundHi: "राजकीय विद्यालय शिक्षक एवं आवास नियोजन परामर्शदाता",
  
  // Verified business contact details (from verified Supabase admin credentials)
  publicPhone: "9918833851",
  publicPhoneFormatted: "+91 99188 33851",
  publicPhoneRaw: "+919918833851",
  publicWhatsApp: "9918833851",
  publicWhatsAppFormatted: "+91 99188 33851",
  publicWhatsAppUrl: "https://wa.me/919918833851?text=Namaste%20Dinesh%20ji%2C%20mujhe%20apne%20plot%20ka%20naksha%20banwana%20hai.",
  publicEmail: "dkvaid1978@gmail.com",
  
  location: "Pratapgarh, Uttar Pradesh",
  locationHi: "प्रतापगढ़, उत्तर प्रदेश",
  serviceArea: "Pratapgarh & Nearby Areas",
  serviceAreaHi: "प्रतापगढ़ एवं समीपवर्ती क्षेत्र",
  
  experienceYears: "10+",
  experienceLabel: "Years of House Planning Experience",
  experienceLabelHi: "वर्षों का गृह नियोजन अनुभव",
  completedPlans: "40+",
  completedPlansLabel: "House Maps / Plans Completed",
  completedPlansLabelHi: "सफलतापूर्वक तैयार किए गए गृह नक्शे",
  
  photoUrl: "/dinesh-sharma.jpg",
  
  bioEn: "Dinesh Kumar Sharma is a house planning consultant based in Pratapgarh, Uttar Pradesh. Alongside his professional career as a government school teacher, he has been involved in residential house planning and map preparation for more than 10 years.\n\nHis approach focuses on understanding each customer's plot, family requirements and preferences before preparing a practical house plan tailored to the project.",
  bioHi: "दिनेश कुमार शर्मा प्रतापगढ़, उत्तर प्रदेश में स्थित एक अनुभवी आवास नियोजन परामर्शदाता हैं। राजकीय विद्यालय शिक्षक के रूप में अपनी समर्पित सेवा के साथ-साथ, वे पिछले 10 से अधिक वर्षों से आवासीय गृह मानचित्र और भवन नियोजन में सक्रिय रूप से संलग्न हैं।\n\nउनका मुख्य दृष्टिकोण प्रत्येक ग्राहक के प्लॉट की दिशा, पारिवारिक आवश्यकताओं और प्राथमिकताओं को गहराई से समझना और फिर उसी के अनुरूप एक व्यावहारिक और सटीक गृह नक्शा तैयार करना है।",
  
  philosophyQuoteEn: "Every project starts by understanding the customer's plot, requirements and way of living. The plan is then refined based on customer feedback before final delivery.",
  philosophyQuoteHi: "प्रत्येक योजना ग्राहक के प्लॉट, पारिवारिक आवश्यकताओं और रहन-सहन को गहराई से समझने से शुरू होती है। आपके सुझावों के अनुसार सुधार के बाद ही अंतिम नक्शा सौंपा जाता है।",
  
  expertise: [
    {
      titleEn: "Custom House Planning",
      titleHi: "कस्टम गृह नियोजन",
      descEn: "Room distribution and layout designed specifically around your family lifestyle.",
      descHi: "आपके परिवार की दैनिक आवश्यकताओं व रहन-सहन के अनुकूल कमरों की सटीक योजना।"
    },
    {
      titleEn: "2D Floor Plans",
      titleHi: "2D फ्लोर प्लान्स",
      descEn: "Clear, dimensioned architectural drawings that mason/contractor can construct easily.",
      descHi: "सटीक मापों के साथ स्पष्ट 2D लेआउट, जिससे मिस्त्री व ठेकेदार आसानी से निर्माण कर सकें।"
    },
    {
      titleEn: "Map Redrawing",
      titleHi: "रफ़ नक्शा पुनर्निर्माण",
      descEn: "Transforming paper sketches, diary drawings or rough ideas into neat digital CAD maps.",
      descHi: "कागज़ या डायरी के रफ़ स्केच को स्वच्छ, व्यवस्थित डिजिटल नक्शों में रूपांतरित करना।"
    },
    {
      titleEn: "Vastu-Oriented Planning",
      titleHi: "वास्तु-सम्मत नियोजन",
      descEn: "Practical orientation for positive natural sunlight, cross-ventilation, and balance.",
      descHi: "सूर्य के प्रकाश, वायु प्रवाह और दिशाओं के संतुलन के साथ व्यावहारिक वास्तु योजना।"
    },
    {
      titleEn: "Site Consultation",
      titleHi: "साइट परामर्श व निरीक्षण",
      descEn: "Direct on-ground plot inspection and dimension verification in Pratapgarh area.",
      descHi: "प्रतापगढ़ व आस-पास के क्षेत्रों में ज़मीन का प्रत्यक्ष निरीक्षण व मापों का सत्यापन।"
    },
    {
      titleEn: "Requirement Consultation",
      titleHi: "आवश्यकता परामर्श",
      descEn: "One-on-one discussion to prioritize spaces, future expansions, and budget fit.",
      descHi: "भविष्य के विस्तार, बजट और कमरों की प्राथमिकताओं पर आमने-सामने विस्तृत परामर्श।"
    }
  ],
  
  processSteps: [
    {
      stepNumber: 1,
      titleEn: "LISTEN",
      titleHi: "सुनना (Listen)",
      descEn: "We listen attentively to your requirements, family size, budget, and vision.",
      descHi: "हम आपकी ज़रूरतें, परिवार का आकार, बजट और सपनों को धैर्यपूर्वक सुनते हैं।"
    },
    {
      stepNumber: 2,
      titleEn: "UNDERSTAND",
      titleHi: "समझना (Understand)",
      descEn: "Analyzing plot dimensions, orientation (East/West/North/South), roads, and surroundings.",
      descHi: "प्लॉट की दिशा (पूरब/पश्चिम/उत्तर/दक्षिण), सड़क और ज़मीनी परिस्थितियों को समझना।"
    },
    {
      stepNumber: 3,
      titleEn: "PLAN",
      titleHi: "नियोजन (Plan)",
      descEn: "Drafting optimized room layouts, natural light paths, circulation, and Vastu harmony.",
      descHi: "हवा, रोशनी, प्राइवेसी और वास्तु के संतुलन के साथ वैज्ञानिक रूप से नक्शा तैयार करना।"
    },
    {
      stepNumber: 4,
      titleEn: "REVIEW",
      titleHi: "समीक्षा (Review)",
      descEn: "Reviewing the draft together with you, making necessary adjustments until you are satisfied.",
      descHi: "प्रारूप आपके साथ साझा करना और आपकी संतुष्टि तक आवश्यक संशोधन करना।"
    },
    {
      stepNumber: 5,
      titleEn: "DELIVER",
      titleHi: "सौंपना (Deliver)",
      descEn: "Delivering clean, dimensioned 2D floor plans ready for your contractor to build.",
      descHi: "निर्माण के लिए पूरी तरह तैयार अंतिम, स्वच्छ व सटीक 2D नक्शा आपको सौंपना।"
    }
  ],
  
  trustPoints: [
    {
      en: "10+ years of house planning experience",
      hi: "10+ वर्षों का व्यावहारिक आवास नियोजन अनुभव"
    },
    {
      en: "40+ completed residential house plans",
      hi: "40+ सफलतापूर्वक तैयार किए गए आवासीय गृह नक्शे"
    },
    {
      en: "Direct customer consultation with Dinesh",
      hi: "दिनेश कुमार शर्मा के साथ सीधा व पारदर्शी विचार-विमर्श"
    },
    {
      en: "Plot-specific, zero-waste spatial planning",
      hi: "प्लॉट के प्रत्येक इंच का सुनियोजित व उपयोगी उपयोग"
    },
    {
      en: "Requirement-based realistic designs",
      hi: "वास्तविक बजट और पारिवारिक आवश्यकताओं पर आधारित डिज़ाइन"
    },
    {
      en: "Serving Pratapgarh & nearby areas",
      hi: "प्रतापगढ़ एवं समीपवर्ती क्षेत्रों में विश्वसनीय स्थानीय सेवा"
    }
  ]
};

/**
 * Returns formatted WhatsApp link with optional custom initial message
 */
export function getDineshWhatsAppUrl(customMessage?: string): string {
  const text = customMessage || "Namaste Dinesh ji, mujhe apne plot ka naksha banwana hai.";
  return `https://wa.me/91${BUSINESS_CONFIG.publicWhatsApp}?text=${encodeURIComponent(text)}`;
}

/**
 * Returns tel: URL for direct phone call
 */
export function getDineshCallUrl(): string {
  return `tel:${BUSINESS_CONFIG.publicPhoneRaw}`;
}

/**
 * Returns mailto: URL for direct email
 */
export function getDineshEmailUrl(subject?: string): string {
  const s = subject || "Inquiry for House Planning - Sarda Homeplan";
  return `mailto:${BUSINESS_CONFIG.publicEmail}?subject=${encodeURIComponent(s)}`;
}
