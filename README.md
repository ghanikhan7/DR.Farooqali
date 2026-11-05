# Dr. Syed Farooq Ali — Sudha Clinic Website & Admin Portal (Hyderabad)

Official bilingual (**English LTR** & **Urdu RTL**) healthcare website, appointment request system, and secure administrator portal for **Dr. Syed Farooq Ali — Sudha Clinic**, Murad Mahal Colony, Opposite Primary Health Center, Talab Katta, Hyderabad (`500002`).

Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **Framer Motion**, **Lucide Icons**, **Google Firebase Cloud Firestore**, and **Firebase Authentication** (Spark Free Plan).

---

## Complete Beginner-Friendly Firebase Configuration & Admin Guide

### 1. Enable Firebase Email/Password Authentication
1. Open the [Firebase Console](https://console.firebase.google.com/) and select your project (**`drfarooqali`**).
2. In the left sidebar, click **Build -> Authentication**.
3. Click **Get started** (if opening Authentication for the first time).
4. Go to the **Sign-in method** tab.
5. Click **Email/Password**, toggle **Enable** ON, leave "Email link (passwordless sign-in)" OFF, and click **Save**.

---

### 2. Create the Administrator Account Manually
*(Public self-registration is intentionally disabled so strangers cannot create accounts.)*
1. In **Firebase Console -> Authentication**, open the **Users** tab.
2. Click **Add user**.
3. Enter the administrator's **Email** (for example, your clinic admin email) and a strong **Password** (at least 8 characters).
4. Click **Add user**.

---

### 3. Find Your Firebase Authentication Admin UID
1. In the **Authentication -> Users** table, locate the admin user you just created.
2. Look at the **User UID** column (a 28-character string such as `xYz123AbC456...`) and click the **Copy UID** icon.
3. Add this UID to your `.env` file (and Vercel Environment Variables):
   ```env
   VITE_FIREBASE_ADMIN_UID=paste_your_28_character_user_uid_here
   ```
   *(Tip: You can also sign in at `/admin/login` and click the **Copy** button next to your UID in the Admin Portal sidebar.)*

---

### 4. Publish Secure Firestore Rules (`firestore.rules`)
1. Open [`firestore.rules`](./firestore.rules) in this project.
2. On line 19, replace `'REPLACE_WITH_AUTHORIZED_ADMIN_UID'` with your actual 28-character Admin User UID:
   ```javascript
   function isAuthorizedAdmin() {
     return request.auth != null
       && request.auth.uid == 'paste_your_28_character_user_uid_here';
   }
   ```
3. In the **Firebase Console -> Build -> Firestore Database**, open the **Rules** tab.
4. Paste the entire updated contents of [`firestore.rules`](./firestore.rules) into the editor and click **Publish**.

**What these rules enforce:**
- **Public Visitors**: Can **only** submit validated `pending` appointment requests (`appointment_requests`) and read the public consultation fee (`clinic_settings/consultation`). They can **never** read, list, update, or delete appointments or modify clinic settings.
- **Authorized Admin UID Only**: Only the single account matching your UID can read appointment requests, update appointment statuses (`pending`, `confirmed`, `completed`, `cancelled`), update the consultation fee (`clinic_settings/consultation`), and update general clinic settings (`clinic_settings/general`).

---

### 5. Configure Firebase Password Reset & Verification Emails
1. In **Firebase Console -> Authentication**, click the **Templates** tab.
2. Select **Password reset** (and **Email address change**):
   - Click the pencil (**Edit**) icon to customize the **Sender name** (e.g., `Sudha Clinic Admin`).
   - Under **Authorized domains** (in **Authentication -> Settings -> Authorized domains**), ensure `localhost` and your production Vercel domain (e.g. `sudha-clinic.vercel.app`) are listed so password reset and email verification links work seamlessly.

---

### 6. Logging Into `/admin`
1. Navigate to **`http://localhost:5173/admin`** (or `https://your-domain.vercel.app/admin`).
2. Unauthenticated visitors are automatically redirected to **`/admin/login`**.
3. Enter your administrator email and password and click **Sign In to Dashboard**.
4. Once authenticated, you are redirected to the **Admin Portal** with three sections in the sidebar:
   - **Appointments (`/admin`)**: Search by patient name/phone, filter by date/session/status, refresh live records, view full appointment details, message patients on WhatsApp with one click, and update status (`Pending`, `Confirmed`, `Completed`, `Cancelled`).
   - **Clinic Settings (`/admin/settings`)**: Update the public **Consultation Fee** (initially `₹200`), update **Clinic Name** and **Doctor Name**, and view read-only clinic session timings (`Morning: 10:00 AM – 1:00 PM`, `Evening: 9:00 PM – 12:00 AM`).
   - **Admin Profile (`/admin/profile`)**: View account status, copy your Admin UID, change your password, or change your login email.
5. Click **Logout** in the top header or sidebar at any time to clear your authenticated session.

---

### 7. Resetting a Forgotten Password (`/admin/forgot-password`)
1. On **`/admin/login`**, click **Forgot Password?** (or visit `/admin/forgot-password`).
2. Enter your administrator email address and click **Send Password Reset Email**.
3. Open your email inbox, click the secure Firebase reset link, and enter your new password.
4. Return to `/admin/login` and sign in with your new password.

---

### 8. Changing Your Password & Login Email (`/admin/profile`)
- **To Change Your Password**:
  1. Log in to `/admin` and open **Admin Profile** (`/admin/profile`).
  2. Under **Change Administrator Password**, enter your **Current Password** (required for Firebase reauthentication), your **New Password** (minimum 8 characters), and **Confirm New Password**.
  3. Use the eye icon to toggle password visibility if needed, then click **Update Password**.
- **To Change Your Login Email**:
  1. Open **Admin Profile** (`/admin/profile`) and scroll to **Update Administrator Login Email**.
  2. Enter your **New Login Email Address** and your **Current Password** (for reauthentication).
  3. Click **Verify & Update Email**.
  4. Firebase will send a verification link to your new email address. Once you click that link, your administrator login email is updated in Firebase Authentication (your Admin UID remains the same).

---

## Local Development & Vercel Deployment

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run TypeScript check and production build
npm run build
```

When deploying to **Vercel**, add all environment variables from `.env` (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`, and `VITE_FIREBASE_ADMIN_UID`) under **Vercel Project Settings -> Environment Variables**.
