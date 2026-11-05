# Project Technical & Architectural Report
## Dr. Syed Farooq Ali — Sudha Clinic, Hyderabad
**Prepared by:** AlisTech (https://alistech.vercel.app/)

---

## 1. Executive Summary

This project is a bespoke, production-ready bilingual healthcare web application built for **Dr. Syed Farooq Ali — Sudha Clinic**, located at Murad Mahal Colony, Opposite Primary Health Center, Talab Katta, Hyderabad, Telangana (`500002`).

Designed as a complimentary digital flagship from **AlisTech**, the platform combines an editorial private-clinic aesthetic with a **Google Firebase Cloud Firestore** (Spark Free Plan) appointment request backend, **Asia/Kolkata (IST)** session & time-slot validation, and seamless **English (LTR)** and **Urdu (RTL)** language support.

---

## 2. Complete Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React** | `^18.3.1` | Component-based UI architecture, state management, and reactive form handling |
| **Language** | **TypeScript** | `~5.6.2` | Strict static typing across clinic configuration, translations, time-slot utilities, and Firestore payloads |
| **Build Tool & Bundler** | **Vite** | `^6.0.5` | Instant HMR development server and optimized production asset bundling |
| **Styling Engine** | **Tailwind CSS** | `^3.4.17` | Utility-first styling, custom emerald/ivory theme tokens, and logical RTL/LTR layout utilities |
| **Motion & Animations** | **Framer Motion** | `^11.15.0` | Subtle viewport reveal transitions, mobile drawer animations, and receipt confirmation transitions |
| **Iconography** | **Lucide React** | `^0.468.0` | Clean, accessible medical, navigation, time, and directional vector icons |
| **Backend & Database** | **Firebase Cloud Firestore** | `^11.3.1` (`firebase`) | Serverless NoSQL document database on the free Spark plan with strict `firestore.rules` |
| **Typography** | **Google Fonts** | `Cormorant Garamond`, `DM Sans`, `Noto Nastaliq Urdu` | Editorial serif headings, crisp sans-serif body text, and authentic Nastaliq Urdu calligraphy |
| **Deployment Target** | **Vercel** | Edge Network | Zero-config continuous deployment from GitHub with environment variable injection |

---

## 3. Clinic Information & Operating Schedule

| Attribute | English (`en` - LTR) | Urdu (`ur` - RTL) |
| :--- | :--- | :--- |
| **Doctor** | Dr. Syed Farooq Ali | ڈاکٹر سید فاروق علی |
| **Clinic Name** | Sudha Clinic | سدھا کلینک |
| **Street Address** | 18-7-198/A/197/A, Murad Mahal Colony, Talab Katta, Hyderabad, Telangana 500002 | 18-7-198/A/197/A، مراد محل کالونی، تالاب کٹہ، حیدرآباد، تلنگانہ 500002 |
| **Key Landmark** | Opposite Primary Health Center | پرائمری ہیلتھ سینٹر کے سامنے |
| **Timezone** | `Asia/Kolkata` (IST, UTC+05:30) | `Asia/Kolkata` (IST, UTC+05:30) |
| **Morning Session** | `10:00 AM – 1:00 PM` (`10:00–13:00`) | صبح `10:00` بجے تا دوپہر `1:00` بجے (`10:00–13:00`) |
| **Evening Session** | `9:00 PM – 12:00 AM` (`21:00–00:00` Midnight) | رات `9:00` بجے تا `12:00` بجے نصف شب (`21:00–00:00`) |
| **Coordinates** | `17.3552019, 78.4808012` | `17.3552019, 78.4808012` |

### Configurable Appointment Time Slots (`appointmentIntervalMinutes: 30`)

Implemented in `src/utils/appointmentTime.ts`:
- **Morning Session (`10:00` to `13:00`)**:
  - `10:00 AM` (`10:00`), `10:30 AM` (`10:30`), `11:00 AM` (`11:00`), `11:30 AM` (`11:30`), `12:00 PM` (`12:00`), `12:30 PM` (`12:30`)
- **Evening Session (`21:00` to `00:00` Midnight)**:
  - `9:00 PM` (`21:00`), `9:30 PM` (`21:30`), `10:00 PM` (`22:00`), `10:30 PM` (`22:30`), `11:00 PM` (`23:00`), `11:30 PM` (`23:30`)
- **Midnight Boundary Handling**: `parse24hToMinutes` explicitly treats `00:00` at the end of the evening session as `1440` minutes (`24:00` midnight at the end of the same calendar day), preventing any accidental interpretation as `0` or `12:00` noon.
- **Same-Day Past-Slot Protection**: `hasSlotPassedInKolkata` compares each slot against the live clock in `Asia/Kolkata` and disables slots that have already passed when the patient selects today's date.

---

## 4. Backend Database & Security Architecture (`firestore.rules`)

Appointments are stored in the Cloud Firestore collection `appointment_requests` via `src/lib/firebase.ts` and `src/lib/appointments.ts`:
- `patient_name`: Required string (`2..120` chars).
- `phone_number`: Required string (`10..20` chars, validated phone format).
- `appointment_date`: Required `YYYY-MM-DD` string representing the requested visit date.
- `preferred_session`: `'morning'` or `'evening'`.
- `preferred_time`: 12-hour formatted string (`10:00 AM`–`12:30 PM` or `9:00 PM`–`11:30 PM`).
- `preferred_time_24h`: 24-hour string (`10:00`–`12:30` or `21:00`–`23:30`).
- `message`: Optional string (`<= 500` chars) or `null`.
- `status`: `'pending'` (enforced on creation).
- `timezone`: `'Asia/Kolkata'`.
- `language`: `'en'` or `'ur'`.
- `submitted_at`: Generated on the Firebase server via `serverTimestamp()` (`request.resource.data.submitted_at == request.time`), strictly distinct from `appointment_date`.
- **Write-Only Public Access**: `firestore.rules` permits `allow create` only when all schema and session/time rules pass, and sets `allow read, update, delete: if false;` so visitors can never read, list, modify, or delete any patient records.

---

## 5. Project File Structure

```text
sudha-clinic-website/
├── .env.example                    # Template for VITE_FIREBASE_* environment variables
├── .gitignore                      # Ignores .env, node_modules, dist, and private keys
├── firestore.rules                 # Cloud Firestore security rules (write-only validated create)
├── index.html                      # Entry HTML with SEO metadata & Google Fonts
├── package.json                    # Dependencies and scripts (dev, build, preview)
├── postcss.config.js               # PostCSS configuration for Tailwind & Autoprefixer
├── tailwind.config.js              # Custom color tokens, fonts, and shadows
├── tsconfig.json                   # Strict TypeScript compiler configuration
├── vite.config.ts                  # Vite React plugin configuration
├── README.md                       # Step-by-step Firebase & Vercel deployment guide
├── README.txt                      # Quick reference setup guide
├── PROJECT_REPORT.md               # Complete technical and architectural report
├── public/
│   └── images/
│       ├── clinic.jpg              # Authentic photograph of Sudha Clinic entrance
│       └── doctor.jpg              # Authentic portrait of Dr. Syed Farooq Ali
└── src/
    ├── main.tsx                    # React DOM root mount
    ├── App.tsx                     # Root application state (LTR/RTL & language persistence)
    ├── index.css                   # Global styles, Urdu Nastaliq rules & architectural patterns
    ├── vite-env.d.ts               # TypeScript definitions for VITE_FIREBASE_* env vars
    ├── config/
    │   └── clinicConfig.ts         # Centralized clinic data, sessions & EN/UR translations
    ├── lib/
    │   ├── firebase.ts             # Firebase Web SDK & Cloud Firestore initialization
    │   └── appointments.ts         # Appointment validation, deduplication & Firestore submission
    ├── utils/
    │   └── appointmentTime.ts      # Asia/Kolkata date/time & 30-min slot generator/validator
    └── components/
        ├── Navbar.tsx              # Responsive header & language switcher
        ├── HeroSection.tsx         # Editorial hero section
        ├── DoctorSection.tsx       # Dr. Syed Farooq Ali profile & quote
        ├── ClinicSection.tsx       # Clinic overview, photo & directory card
        ├── ServicesSection.tsx     # Consultation pillars & medical transparency banner
        ├── PatientCareSection.tsx  # 4 pillars of patient-centered care
        ├── LocationSection.tsx     # Address, copy tool & Google Maps embed
        ├── EnquirySection.tsx      # Firebase appointment request form & session cards
        └── Footer.tsx              # Bilingual footer with AlisTech credit
```
