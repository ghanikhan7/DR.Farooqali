export type Language = 'en' | 'ur';
export type SessionId = 'morning' | 'evening';

/**
 * Single centralized default consultation fee and currency for Sudha Clinic.
 * Used across the homepage, appointment booking form, fee cards, translations,
 * and as the baseline Firestore fallback.
 */
export const DEFAULT_CONSULTATION_FEE = 200;
export const DEFAULT_CURRENCY = 'INR';

export interface BilingualService {
  id: string;
  title: {
    en: string;
    ur: string;
  };
  description: {
    en: string;
    ur: string;
  };
}

export interface ClinicSessionConfig {
  id: SessionId;
  /** 24-hour start time (HH:MM), e.g. "10:00" or "21:00" */
  start24h: string;
  /**
   * 24-hour end time (HH:MM), e.g. "13:00" or "00:00".
   * Note: "00:00" on the evening session represents midnight (24:00) at the end of the same calendar day.
   */
  end24h: string;
  label: {
    en: string;
    ur: string;
  };
  displayRange: {
    en: string;
    ur: string;
  };
}

export interface ClinicConfig {
  doctorName: {
    en: string;
    ur: string;
  };
  clinicName: {
    en: string;
    ur: string;
  };
  locationShort: {
    en: string;
    ur: string;
  };
  address: {
    en: string;
    ur: string;
  };
  landmark: {
    en: string;
    ur: string;
  };
  pinCode: string;
  city: {
    en: string;
    ur: string;
  };
  state: {
    en: string;
    ur: string;
  };
  timezone: string;
  sessions: Record<SessionId, ClinicSessionConfig>;
  coordinates: {
    lat: number;
    lng: number;
  };
  googleMapsEmbedUrl: string;
  googleMapsDirectionsUrl: string;
  googleMapsShortUrl: string;
  justdialUrl: string;
  alistechUrl: string;
  images: {
    doctor: string;
    clinic: string;
  };
  phone: string;
  whatsapp: string;
  email: string;
  formEndpoint: string;
  qualifications: {
    en: string;
    ur: string;
  };
  experience: {
    en: string;
    ur: string;
  };
  registration: {
    en: string;
    ur: string;
  };
  hours: {
    en: string;
    ur: string;
  };
  consultationFee: {
    amount: number;
    currency: string;
  };
  approvedServices: BilingualService[];
}

export const CLINIC_CONFIG: ClinicConfig = {
  doctorName: {
    en: 'Dr. Syed Farooq Ali',
    ur: 'ڈاکٹر سید فاروق علی',
  },
  clinicName: {
    en: 'Sudha Clinic',
    ur: 'سدھا کلینک',
  },
  locationShort: {
    en: 'Talab Katta, Hyderabad',
    ur: 'تالاب کٹہ، حیدرآباد',
  },
  address: {
    en: '18-7-198/A/197/A, Murad Mahal Colony, Talab Katta, Hyderabad, Telangana 500002',
    ur: '18-7-198/A/197/A، مراد محل کالونی، تالاب کٹہ، حیدرآباد، تلنگانہ 500002',
  },
  landmark: {
    en: 'Opposite Primary Health Center',
    ur: 'پرائمری ہیلتھ سینٹر کے سامنے',
  },
  pinCode: '500002',
  city: {
    en: 'Hyderabad',
    ur: 'حیدرآباد',
  },
  state: {
    en: 'Telangana, India',
    ur: 'تلنگانہ، بھارت',
  },
  timezone: 'Asia/Kolkata',
  sessions: {
    morning: {
      id: 'morning',
      start24h: '10:00',
      end24h: '13:00',
      label: {
        en: 'Morning Session',
        ur: 'صبح کا سیشن',
      },
      displayRange: {
        en: '10:00 AM – 1:00 PM',
        ur: 'صبح 10:00 تا دوپہر 1:00 بجے',
      },
    },
    evening: {
      id: 'evening',
      start24h: '21:00',
      end24h: '00:00', // Midnight at the end of the same calendar day (24:00)
      label: {
        en: 'Evening Session',
        ur: 'رات کا سیشن',
      },
      displayRange: {
        en: '9:00 PM – 12:00 AM',
        ur: 'رات 9:00 تا 12:00 بجے (نصف شب)',
      },
    },
  },
  coordinates: {
    lat: 17.3552019,
    lng: 78.4808012,
  },
  googleMapsEmbedUrl:
    'https://www.google.com/maps?q=17.3552019,78.4808012&z=17&output=embed',
  googleMapsDirectionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=17.3552019,78.4808012',
  googleMapsShortUrl: 'https://maps.app.goo.gl/eC1uaiDf3xPKiD64A',
  justdialUrl:
    'https://www.justdial.com/Hyderabad/Dr-Syed-Farooq-Ali-Sudha-Clinic-Opposite-Primary-Helath-Center-Talab-Katta-Charminar/040PXX40-XX40-140527104843-C4Y8_BZDET',
  alistechUrl: 'https://alistech.vercel.app/',
  images: {
    doctor: '/images/doctor.jpg',
    clinic: '/images/clinic.jpg',
  },

  phone: '',
  whatsapp: '',
  email: '',
  formEndpoint: '',
  qualifications: {
    en: '',
    ur: '',
  },
  experience: {
    en: '',
    ur: '',
  },
  registration: {
    en: '',
    ur: '',
  },
  hours: {
    en: 'Morning: 10:00 AM – 1:00 PM · Evening: 9:00 PM – 12:00 AM',
    ur: 'صبح: 10:00 تا 1:00 بجے · رات: 9:00 تا 12:00 بجے',
  },
  consultationFee: {
    amount: DEFAULT_CONSULTATION_FEE,
    currency: DEFAULT_CURRENCY,
  },
  approvedServices: [],
};

export const TRANSLATIONS = {
  en: {
    nav: {
      home: 'Home',
      doctor: 'About the Doctor',
      clinic: 'The Clinic',
      services: 'Consultation & Care',
      care: 'Patient Philosophy',
      location: 'Location & Map',
      enquiry: 'Book Appointment',
      bookCta: 'Request Appointment',
      switchLang: 'اردو',
      switchLangAria: 'Switch language to Urdu',
    },
    hero: {
      eyebrow: 'Sudha Clinic · Talab Katta, Hyderabad',
      title: 'Your Health Deserves Care, Trust & Personal Attention.',
      subtitle:
        'Welcome to Sudha Clinic in Murad Mahal Colony, Talab Katta — where compassionate consultation, respectful communication, and patient comfort guide every visit.',
      doctorLabel: 'Consulting Physician',
      landmarkLabel: 'Landmark: Opposite Primary Health Center',
      primaryCta: 'Request an Appointment',
      secondaryCta: 'Get Directions',
      justdialCta: 'Verified Justdial Profile',
      emblemCaption: 'SUDHA CLINIC · TALAB KATTA',
      trustBadge1: 'Personal Attention',
      trustBadge2: 'Respectful Consultation',
      trustBadge3: 'Accessible Local Clinic',
    },
    doctor: {
      eyebrow: 'About the Doctor',
      title: 'Meet Dr. Syed Farooq Ali',
      subtitle: 'Dedicated to thoughtful, patient-first care in Talab Katta, Hyderabad.',
      paragraph1:
        'Dr. Syed Farooq Ali welcomes patients and families to Sudha Clinic in Murad Mahal Colony, Talab Katta. Every consultation is approached with calm attentiveness, clear explanation, and genuine respect for the individual.',
      paragraph2:
        'Located right opposite the Primary Health Center, Dr. Syed Farooq Ali’s practice focuses on making quality outpatient consultation approachable and reassuring for residents across Talab Katta and surrounding neighbourhoods of Hyderabad.',
      quote:
        '“A meaningful consultation begins with listening carefully, understanding the patient’s concerns with patience, and offering clear, trustworthy guidance.”',
      credentialsHeading: 'Doctor & Practice Overview',
      labelDoctor: 'Doctor',
      labelClinic: 'Clinic',
      labelLocation: 'Locality',
      labelLandmark: 'Landmark',
      labelQualifications: 'Qualifications',
      labelExperience: 'Experience',
      labelRegistration: 'Registration',
      portraitCaption: 'Dr. Syed Farooq Ali — Sudha Clinic, Hyderabad',
    },
    clinic: {
      eyebrow: 'Our Clinic',
      title: 'A Welcoming Neighbourhood Practice in Talab Katta',
      description1:
        'Sudha Clinic is situated at Murad Mahal Colony, Talab Katta, Hyderabad — directly opposite the Primary Health Center. Designed as a calm, accessible neighbourhood clinic, it serves patients with dignity and attentive care.',
      description2:
        'From the moment you arrive, the clinic environment prioritizes cleanliness, orderly visits, and courteous communication so that patients and accompanying family members feel comfortable and heard.',
      imageAlt: 'Entrance of Sudha Clinic at Murad Mahal Colony, Talab Katta, Hyderabad',
      imageCaption: 'Sudha Clinic — Opposite Primary Health Center, Murad Mahal Colony, Talab Katta',
      detailsTitle: 'Official Clinic Directory',
      clinicLabel: 'Clinic Name',
      doctorLabel: 'Doctor',
      addressLabel: 'Full Address',
      landmarkLabel: 'Key Landmark',
      hoursLabel: 'Daily Consultation Sessions (IST)',
      hoursPending: 'Please enquire or visit the clinic for current consultation hours.',
      directionsBtn: 'Get Google Maps Directions',
      enquireBtn: 'Request Appointment',
      justdialBtn: 'View on Justdial',
    },
    services: {
      eyebrow: 'Medical Consultation & Services',
      title: 'Outpatient Consultation & Patient Care',
      subtitle:
        'Sudha Clinic provides attentive in-person medical consultation across two daily sessions. In keeping with strict medical accuracy, specific clinical specialties are listed directly as confirmed by Dr. Syed Farooq Ali.',
      pillars: [
        {
          title: 'In-Person Medical Consultation',
          description:
            'One-on-one outpatient consultation with Dr. Syed Farooq Ali in a calm, respectful setting where every patient’s health concerns are heard thoroughly.',
        },
        {
          title: 'Clear Guidance & Follow-Up',
          description:
            'Thoughtful explanation during visits so patients and their families clearly understand guidance, next steps, and ongoing care recommendations.',
        },
        {
          title: 'Accessible Community Healthcare',
          description:
            'Conveniently located opposite the Primary Health Center in Murad Mahal Colony, offering dependable access for residents of Talab Katta, Hyderabad.',
        },
      ],
      approvedHeading: 'Doctor-Confirmed Clinic Services',
      accuracyNoticeTitle: 'Commitment to Medical Transparency',
      accuracyNoticeText:
        'This website shares only verified clinic details. To schedule a consultation with Dr. Syed Farooq Ali, submit a preferred appointment time below or visit Sudha Clinic during morning (10:00 AM – 1:00 PM) or evening (9:00 PM – 12:00 AM) sessions.',
    },
    care: {
      eyebrow: 'Patient-Centered Care',
      title: 'Four Pillars of Every Visit at Sudha Clinic',
      subtitle:
        'Healthcare is built on trust. Every aspect of a visit to Sudha Clinic is shaped around dignity, patience, and personal attention.',
      items: [
        {
          number: '01',
          title: 'Compassionate Attention',
          description:
            'Every patient is welcomed with warmth, empathy, and unhurried patience from the moment they step into the clinic.',
        },
        {
          number: '02',
          title: 'Respectful Communication',
          description:
            'Clear, courteous conversation in a language you are comfortable with, ensuring your questions are answered with care.',
        },
        {
          number: '03',
          title: 'A Calm, Comfortable Visit',
          description:
            'A clean, peaceful, and orderly clinic environment designed to put patients and elderly family members at ease.',
        },
        {
          number: '04',
          title: 'Personal Time & Focus',
          description:
            'Your concerns are listened to attentively and given dedicated time without feeling rushed.',
        },
      ],
    },
    location: {
      eyebrow: 'Location & Directions',
      title: 'Visit Sudha Clinic in Talab Katta',
      subtitle:
        'Conveniently situated in Murad Mahal Colony, opposite the Primary Health Center, making the clinic easy to locate from across Old City and central Hyderabad.',
      addressCardTitle: 'Clinic Address & Landmark',
      addressLabel: 'Street Address',
      landmarkLabel: 'Landmark',
      areaLabel: 'Neighbourhood & PIN',
      areaValue: 'Murad Mahal Colony, Talab Katta · 500002',
      openMapsBtn: 'Open Directions in Google Maps',
      copyAddressBtn: 'Copy Address',
      copiedAddressBtn: 'Address Copied',
      justdialLinkText: 'View Verified Listing on Justdial',
      mapTitle: 'Sudha Clinic Google Maps Location',
    },
    enquiry: {
      eyebrow: 'Appointment Request & Clinic Timings',
      title: 'Request an Appointment at Sudha Clinic',
      subtitle:
        'Select your preferred date and clinic session below. Once confirmed, you may visit the clinic anytime during your selected session.',
      whatsappBtn: 'WhatsApp Enquiry',
      callBtn: 'Call the Clinic',
      directionsBtn: 'Get Directions',
      justdialBtn: 'Justdial Directory',
      whatsappDefaultMsg:
        'Hello, I would like to request an appointment with Dr. Syed Farooq Ali at Sudha Clinic, Talab Katta.',
      timingsCardTitle: 'Daily Clinic Timings (Asia/Kolkata · IST)',
      morningLabel: 'Morning Session',
      morningHours: '10:00 AM – 1:00 PM',
      morning24h: '10:00 – 13:00',
      eveningLabel: 'Evening Session',
      eveningHours: '9:00 PM – 12:00 AM (Midnight)',
      evening24h: '21:00 – 00:00',
      consultationFeeLabel: 'Consultation Fee',
      consultationFeeNote: 'Payable at the clinic during your visit (informational only)',
      formTitle: 'Book an Appointment Request',
      formSubtitle:
        'Please complete all required fields (*). Select your preferred date and session — you may visit the clinic anytime during the chosen session.',
      nameLabel: 'Patient Full Name',
      namePlaceholder: 'Enter patient’s full name',
      phoneLabel: 'Phone Number',
      phonePlaceholder: 'e.g. +91 98765 43210',
      dateLabel: 'Appointment Date',
      sessionLabel: 'Preferred Session',
      sessionMorningOption: 'Morning (10:00 AM – 1:00 PM)',
      sessionEveningOption: 'Evening (9:00 PM – 12:00 AM)',
      sessionEndedBadge: 'Ended for today',
      sessionVisitNote:
        'Patients may visit the clinic anytime during the selected session hours once the request is confirmed.',
      messageLabel: 'Optional Short Message',
      messagePlaceholder:
        'Any brief note regarding your visit preference (please avoid sharing sensitive medical history)...',
      submitBtn: 'Submit Appointment Request',
      submittingBtn: 'Submitting Request...',
      bookAnotherBtn: 'Submit Another Request',
      privacyNote:
        'Please do not include sensitive medical history or urgent emergency symptoms. Your request is securely stored for clinic scheduling.',
      successMsg:
        'Your appointment request has been submitted successfully. The clinic will contact you to confirm your appointment.',
      validation: {
        nameRequired: 'Please enter the patient’s full name (at least 2 characters).',
        phoneRequired: 'Please enter a valid 10-digit mobile or phone number.',
        dateRequired: 'Please select an appointment date.',
        datePast: 'Appointment date cannot be in the past. Please choose today or a future date.',
        sessionRequired: 'Please select a preferred session (Morning or Evening).',
        sessionEndedToday:
          'This session has already ended for today (IST). Please select an active session or choose a future date.',
        duplicateSubmission:
          'This appointment request was just submitted. Please wait a moment before sending an identical request.',
        firebaseNotConfigured:
          'Firebase Cloud Firestore is not configured yet. Please add your VITE_FIREBASE_* credentials in .env.',
        submissionError:
          'We could not submit your appointment request right now. Please check your connection or try again.',
      },
      visitInPersonTitle: 'Visiting in Person',
      visitInPersonText:
        'Patients may also visit Sudha Clinic directly at 18-7-198/A/197/A, Murad Mahal Colony, Opposite Primary Health Center, Talab Katta, Hyderabad 500002.',
    },
    footer: {
      description:
        'Compassionate, patient-centered medical consultation by Dr. Syed Farooq Ali in Talab Katta, Hyderabad.',
      quickLinks: 'Quick Navigation',
      locationHeading: 'Clinic Address',
      landmarkPrefix: 'Landmark:',
      copyright: '© 2026 Sudha Clinic — Dr. Syed Farooq Ali. All rights reserved.',
      creditPrefix: 'Complimentary digital experience crafted by',
      creditBrand: 'AlisTech',
    },
  },
  ur: {
    nav: {
      home: 'صفحہ اول',
      doctor: 'ڈاکٹر کا تعارف',
      clinic: 'ہمارا کلینک',
      services: 'مشاورت اور دیکھ بھال',
      care: 'مریضوں پر توجہ',
      location: 'پتہ اور نقشہ',
      enquiry: 'اپائنٹمنٹ بکنگ',
      bookCta: 'اپائنٹمنٹ کی درخواست',
      switchLang: 'English',
      switchLangAria: 'Switch language to English',
    },
    hero: {
      eyebrow: 'سدھا کلینک · تالاب کٹہ، حیدرآباد',
      title: 'آپ کی صحت توجہ، اعتماد اور ہمدردانہ دیکھ بھال کی مستحق ہے۔',
      subtitle:
        'مراد محل کالونی، تالاب کٹہ میں واقع سدھا کلینک میں خوش آمدید — جہاں ہر مریض کی ملاقات میں ہمدردانہ مشاورت، باوقار گفتگو اور ذاتی توجہ کو اولین اہمیت حاصل ہے۔',
      doctorLabel: 'معالج و ڈاکٹر',
      landmarkLabel: 'نشانی: پرائمری ہیلتھ سینٹر کے سامنے',
      primaryCta: 'اپائنٹمنٹ کی درخواست دیں',
      secondaryCta: 'گوگل میپس سے راستہ دیکھیں',
      justdialCta: 'جسٹ ڈائل پروفائل',
      emblemCaption: 'سدھا کلینک · تالاب کٹہ',
      trustBadge1: 'ذاتی توجہ',
      trustBadge2: 'باوقار مشاورت',
      trustBadge3: 'آسان رسائی والا کلینک',
    },
    doctor: {
      eyebrow: 'ڈاکٹر کے بارے میں',
      title: 'ڈاکٹر سید فاروق علی سے ملیں',
      subtitle: 'تالاب کٹہ، حیدرآباد میں مریضوں کی بہتر دیکھ بھال اور ذاتی توجہ کے لیے وقف۔',
      paragraph1:
        'ڈاکٹر سید فاروق علی مراد محل کالونی، تالاب کٹہ میں واقع سدھا کلینک میں مریضوں اور ان کے اہلِ خانہ کا خیر مقدم کرتے ہیں۔ ہر مشاورت میں سکون، توجہ، واضح رہنمائی اور باوقار انداز کو مدنظر رکھا جاتا ہے۔',
      paragraph2:
        'پرائمری ہیلتھ سینٹر کے بالکل سامنے واقع سدھا کلینک کا مقصد تالاب کٹہ اور حیدرآباد کے قریبی علاقوں کے مکینوں کے لیے معیاری اور قابلِ اعتماد طبی مشاورت کو آسان اور پُرسکون بنانا ہے۔',
      quote:
        '”بہترین طبی مشاورت کی بنیاد مریض کی بات کو صبر و تحمل سے سننا، ان کی پریشانی کو سمجھنا اور واضح و قابلِ اعتماد رہنمائی فراہم کرنا ہے۔“',
      credentialsHeading: 'ڈاکٹر اور کلینک کی تفصیلات',
      labelDoctor: 'ڈاکٹر',
      labelClinic: 'کلینک',
      labelLocation: 'علاقہ',
      labelLandmark: 'مشہور نشانی',
      labelQualifications: 'قابلیت و اسناد',
      labelExperience: 'تجربہ',
      labelRegistration: 'رجسٹریشن',
      portraitCaption: 'ڈاکٹر سید فاروق علی — سدھا کلینک، حیدرآباد',
    },
    clinic: {
      eyebrow: 'ہمارا کلینک',
      title: 'تالاب کٹہ میں ایک پُرسکون اور قابلِ اعتماد کلینک',
      description1:
        'سدھا کلینک مراد محل کالونی، تالاب کٹہ، حیدرآباد میں پرائمری ہیلتھ سینٹر کے بالکل سامنے واقع ہے۔ مقامی آبادی کے لیے آسان رسائی کے ساتھ یہاں ہر مریض کی عزتِ نفس اور آرام کا خاص خیال رکھا جاتا ہے۔',
      description2:
        'کلینک میں آمد کے پہلے لمحے سے ہی صفائی ستھرائی، منظم ماحول اور شائستہ گفتگو کو ترجیح دی جاتی ہے تاکہ مریض اور ان کے ہمراہ آنے والے افراد اطمینان محسوس کریں۔',
      imageAlt: 'سدھا کلینک کا بیرونی منظر — مراد محل کالونی، تالاب کٹہ، حیدرآباد',
      imageCaption: 'سدھا کلینک — پرائمری ہیلتھ سینٹر کے سامنے، مراد محل کالونی، تالاب کٹہ',
      detailsTitle: 'کلینک کی بنیادی معلومات',
      clinicLabel: 'کلینک کا نام',
      doctorLabel: 'ڈاکٹر',
      addressLabel: 'مکمل پتہ',
      landmarkLabel: 'قریبی نشانی',
      hoursLabel: 'روزانہ مشاورت کے اوقات (IST)',
      hoursPending: 'کلینک کے موجودہ اوقات جاننے کے لیے براہِ کرم رابطہ کریں یا کلینک تشریف لائیں۔',
      directionsBtn: 'گوگل میپس پر راستہ دیکھیں',
      enquireBtn: 'اپائنٹمنٹ کی درخواست',
      justdialBtn: 'جسٹ ڈائل پر دیکھیں',
    },
    services: {
      eyebrow: 'طبی مشاورت اور خدمات',
      title: 'مریضوں کی مشاورت اور دیکھ بھال',
      subtitle:
        'سدھا کلینک میں ڈاکٹر سید فاروق علی کی جانب سے روزانہ دو سیشنز میں بالمشافہ طبی مشاورت فراہم کی جاتی ہے۔ طبی درستگی کے اصولوں کے مطابق، مخصوص خدمات ڈاکٹر کی تصدیق کے مطابق ہی درج کی جاتی ہیں۔',
      pillars: [
        {
          title: 'بالمشافہ طبی مشاورت',
          description:
            'پُرسکون اور باوقار ماحول میں ڈاکٹر سید فاروق علی کے ساتھ تفصیلی مشاورت، جہاں ہر مریض کے مسائل کو پوری توجہ سے سنا جاتا ہے۔',
        },
        {
          title: 'واضح رہنمائی اور فالو اپ',
          description:
            'ملاقات کے دوران آسان اور واضح زبان میں رہنمائی تاکہ مریض اور ان کے اہلِ خانہ احتیاطی تدابیر اور اگلے مراحل کو بخوبی سمجھ سکیں۔',
        },
        {
          title: 'مقامی آبادی کے لیے آسان رسائی',
          description:
            'مراد محل کالونی میں پرائمری ہیلتھ سینٹر کے سامنے نمایاں مقام پر واقع، جو تالاب کٹہ اور اطراف کے مکینوں کے لیے انتہائی سہولت بخش ہے۔',
        },
      ],
      approvedHeading: 'ڈاکٹر سے تصدیق شدہ خدمات',
      accuracyNoticeTitle: 'طبی معلومات کی شفافیت اور درستگی',
      accuracyNoticeText:
        'اس ویب سائٹ پر صرف تصدیق شدہ معلومات شامل کی گئی ہیں۔ ڈاکٹر سید فاروق علی سے مشاورت کے لیے نیچے اپائنٹمنٹ کی درخواست بھیجیں یا صبح (10:00 تا 1:00 بجے) یا رات (9:00 تا 12:00 بجے) کے اوقات میں کلینک تشریف لائیں۔',
    },
    care: {
      eyebrow: 'مریضوں کی دیکھ بھال کا انداز',
      title: 'سدھا کلینک میں ہر ملاقات کے چار بنیادی اصول',
      subtitle:
        'صحت کی دیکھ بھال کی بنیاد باہمی اعتماد پر ہے۔ سدھا کلینک میں ہر مریض کی ملاقات احترام، صبر اور ذاتی توجہ کے گرد تشکیل دی جاتی ہے۔',
      items: [
        {
          number: '01',
          title: 'ہمدردانہ توجہ',
          description:
            'کلینک میں داخل ہونے والے ہر مریض کا خیر مقدم خلوص، نرمی اور صبر و تحمل کے ساتھ کیا جاتا ہے۔',
        },
        {
          number: '02',
          title: 'باوقار اور واضح گفتگو',
          description:
            'ہر ملاقات میں شائستہ اور آسان زبان میں بات چیت کی جاتی ہے تاکہ آپ اپنے سوالات اطمینان سے پوچھ سکیں۔',
        },
        {
          number: '03',
          title: 'پُرسکون اور صاف ستھرا ماحول',
          description:
            'ایک منظم، صاف اور پُرسکون ماحول جو بزرگوں اور تمام مریضوں کے آرام کو مدنظر رکھتا ہے۔',
        },
        {
          number: '04',
          title: 'مکمل وقت اور یکسوئی',
          description:
            'بغیر کسی جلد بازی کے آپ کی بات کو غور سے سنا جاتا ہے اور مناسب وقت دیا جاتا ہے۔',
        },
      ],
    },
    location: {
      eyebrow: 'پتہ اور گوگل میپس راستہ',
      title: 'تالاب کٹہ میں سدھا کلینک تشریف لائیں',
      subtitle:
        'مراد محل کالونی میں پرائمری ہیلتھ سینٹر کے بالکل سامنے واقع ہونے کی وجہ سے پرانے شہر اور حیدرآباد کے دیگر حصوں سے یہاں پہنچنا نہایت آسان ہے۔',
      addressCardTitle: 'کلینک کا پتہ اور نشانی',
      addressLabel: 'مکمل پتہ',
      landmarkLabel: 'مشہور نشانی',
      areaLabel: 'علاقہ اور پن کوڈ',
      areaValue: 'مراد محل کالونی، تالاب کٹہ · 500002',
      openMapsBtn: 'گوگل میپس میں راستہ کھولیں',
      copyAddressBtn: 'پتہ کاپی کریں',
      copiedAddressBtn: 'پتہ کاپی ہو گیا',
      justdialLinkText: 'جسٹ ڈائل پر تصدیق شدہ پروفائل دیکھیں',
      mapTitle: 'سدھا کلینک کا گوگل میپس نقشہ',
    },
    enquiry: {
      eyebrow: 'اپائنٹمنٹ کی درخواست اور کلینک کے اوقات',
      title: 'سدھا کلینک میں اپائنٹمنٹ کے لیے درخواست دیں',
      subtitle:
        'ملاقات کے لیے اپنی پسندیدہ تاریخ اور سیشن منتخب کریں۔ تصدیق کے بعد آپ منتخب کردہ سیشن کے اوقات میں کسی بھی وقت کلینک تشریف لا سکتے ہیں۔',
      whatsappBtn: 'واٹس ایپ پر دریافت کریں',
      callBtn: 'کلینک کو کال کریں',
      directionsBtn: 'راستہ دیکھیں',
      justdialBtn: 'جسٹ ڈائل ڈائریکٹری',
      whatsappDefaultMsg:
        'السلام علیکم، میں سدھا کلینک، تالاب کٹہ میں ڈاکٹر سید فاروق علی سے اپائنٹمنٹ کے بارے میں معلومات لینا چاہتا/چاہتی ہوں۔',
      timingsCardTitle: 'کلینک کے روزانہ اوقات (حیدرآباد · IST)',
      morningLabel: 'صبح کا سیشن',
      morningHours: 'صبح 10:00 بجے تا دوپہر 1:00 بجے',
      morning24h: '10:00 – 13:00',
      eveningLabel: 'رات کا سیشن',
      eveningHours: 'رات 9:00 بجے تا 12:00 بجے (نصف شب)',
      evening24h: '21:00 – 00:00',
      consultationFeeLabel: 'مشاورت کی فیس',
      consultationFeeNote: 'کلینک پر ملاقات کے وقت قابلِ ادائیگی (صرف معلومات کے لیے)',
      formTitle: 'اپائنٹمنٹ کی درخواست فارم',
      formSubtitle:
        'براہِ کرم تمام ضروری خانے (*) پُر کریں۔ اپنی پسندیدہ تاریخ اور سیشن منتخب کریں — مریض منتخب سیشن کے اوقات میں کسی بھی وقت تشریف لا سکتے ہیں۔',
      nameLabel: 'مریض کا پورا نام',
      namePlaceholder: 'مریض کا مکمل نام درج کریں',
      phoneLabel: 'فون نمبر',
      phonePlaceholder: 'مثال: +91 98765 43210',
      dateLabel: 'ملاقات کی تاریخ',
      sessionLabel: 'پسندیدہ سیشن',
      sessionMorningOption: 'صبح (10:00 AM – 1:00 PM)',
      sessionEveningOption: 'رات (9:00 PM – 12:00 AM)',
      sessionEndedBadge: 'آج کا وقت ختم ہو چکا ہے',
      sessionVisitNote:
        'درخواست کی تصدیق کے بعد مریض منتخب کردہ سیشن کے اوقات میں کسی بھی وقت کلینک تشریف لا سکتے ہیں۔',
      messageLabel: 'مختصر پیغام (اختیاری)',
      messagePlaceholder:
        'ملاقات سے متعلق کوئی مختصر بات لکھیں (براہِ کرم حساس طبی تفصیلات درج نہ کریں)...',
      submitBtn: 'اپائنٹمنٹ کی درخواست جمع کریں',
      submittingBtn: 'درخواست جمع ہو رہی ہے...',
      bookAnotherBtn: 'نئی درخواست بھیجیں',
      privacyNote:
        'براہِ کرم اس فارم میں حساس طبی ریکارڈ یا ہنگامی علامات درج نہ کریں۔ آپ کی درخواست کلینک کے شیڈولنگ سسٹم میں محفوظ طریقے سے درج کی جاتی ہے۔',
      successMsg:
        'آپ کی ملاقات کی درخواست کامیابی سے جمع ہو گئی ہے۔ کلینک آپ کی ملاقات کی تصدیق کے لیے آپ سے رابطہ کرے گا۔',
      validation: {
        nameRequired: 'براہِ کرم مریض کا پورا نام درج کریں (کم از کم 2 حروف)۔',
        phoneRequired: 'براہِ کرم درست 10 ہندسوں کا موبائل یا فون نمبر درج کریں۔',
        dateRequired: 'براہِ کرم ملاقات کی تاریخ منتخب کریں۔',
        datePast: 'گزشتہ تاریخ منتخب نہیں کی جا سکتی۔ براہِ کرم آج یا آئندہ کی تاریخ منتخب کریں۔',
        sessionRequired: 'براہِ کرم پسندیدہ سیشن (صبح یا رات) منتخب کریں۔',
        sessionEndedToday:
          'آج کے لیے یہ سیشن ختم ہو چکا ہے (IST)۔ براہِ کرم دوسرا سیشن یا آئندہ کی تاریخ منتخب کریں۔',
        duplicateSubmission:
          'یہ درخواست ابھی جمع کرائی جا چکی ہے۔ براہِ کرم دوبارہ بھیجنے سے پہلے تھوڑا انتظار کریں۔',
        firebaseNotConfigured:
          'فائر بیس (Firebase Firestore) کنکشن ابھی ترتیب نہیں دیا گیا۔ براہِ کرم .env میں VITE_FIREBASE_* کی تفصیلات شامل کریں۔',
        submissionError:
          'اس وقت آپ کی درخواست جمع نہیں ہو سکی۔ براہِ کرم اپنا انٹرنیٹ چیک کریں اور دوبارہ کوشش کریں۔',
      },
      visitInPersonTitle: 'کلینک پر براہِ راست تشریف آوری',
      visitInPersonText:
        'مریض براہِ راست سدھا کلینک، 18-7-198/A/197/A، مراد محل کالونی، پرائمری ہیلتھ سینٹر کے سامنے، تالاب کٹہ، حیدرآباد 500002 پر بھی تشریف لا سکتے ہیں۔',
    },
    footer: {
      description:
        'تالاب کٹہ، حیدرآباد میں ڈاکٹر سید فاروق علی کی زیرِ نگرانی ہمدردانہ اور باوقار طبی مشاورت۔',
      quickLinks: 'اہم روابط',
      locationHeading: 'کلینک کا پتہ',
      landmarkPrefix: 'نشانی:',
      copyright: '© 2026 سدھا کلینک — ڈاکٹر سید فاروق علی۔ جملہ حقوق محفوظ ہیں۔',
      creditPrefix: 'خلوص اور احترام کے ساتھ ڈیزائن کردہ:',
      creditBrand: 'AlisTech',
    },
  },
} as const;

export function getDisplayClinicName(
  savedName?: string | null,
  lang: Language = 'en'
): string {
  if (
    savedName &&
    savedName.trim() &&
    savedName.trim() !== CLINIC_CONFIG.clinicName.en
  ) {
    return savedName.trim();
  }
  return CLINIC_CONFIG.clinicName[lang];
}

export function getDisplayDoctorName(
  savedName?: string | null,
  lang: Language = 'en'
): string {
  if (
    savedName &&
    savedName.trim() &&
    savedName.trim() !== CLINIC_CONFIG.doctorName.en
  ) {
    return savedName.trim();
  }
  return CLINIC_CONFIG.doctorName[lang];
}
