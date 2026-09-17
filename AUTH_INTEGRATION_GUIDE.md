# 🔐 NovaKart Authentication & OTP Integration Guide

NovaKart includes a production-grade authentication system featuring:
1. **Email & Mobile Phone 6-Digit OTP Verification** for user registration and passwordless login.
2. **Google & Facebook Social Authentication** (1-click sign up & login).
3. **Built-in Developer Mode** (Allows instant local testing with 1-click OTP auto-fill, even before you add API keys!).

---

## ⚡ 1. Immediate Developer Testing (Zero-Config Mode)

You do **not** need external API keys to test OTP and Social Login right now!
- When you request an OTP in the Customer Storefront (`http://localhost:3000/register` or `http://localhost:3000/login`), the system automatically logs the OTP in the backend console and renders a **"⚡ Developer Demo OTP" banner with a 1-Click Auto-Fill button** directly on the screen.
- Clicking **"Continue with Google"** or **"Continue with Facebook"** will instantly authenticate and create a verified session.

---

## ✉️ 2. How to Connect Real Email OTP (Gmail or SMTP)

### Option A: Free Gmail App Password (Recommended for Fast Setup)
1. Go to your **[Google Account Security Settings](https://myaccount.google.com/security)**.
2. Ensure **2-Step Verification** is turned **ON**.
3. In the search bar at the top, type **"App passwords"** (or go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
4. Create a new app password:
   - App Name: `NovaKart E-Commerce`
   - Click **Create**.
5. Google will display a **16-character password** (e.g. `abcd efgh ijkl mnop`).
6. Open `backend/.env` in your code editor and enter:
   ```env
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```
7. Save the file. Real verification emails with styled HTML templates will now be delivered to any email address!

---

### Option B: Custom SMTP (SendGrid, AWS SES, Mailgun, Postmark)
If using an enterprise SMTP relay, configure these in `backend/.env`:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_SECURE=false
EMAIL_FROM="NovaKart Security" <support@yourstore.com>
```

---

## 📱 3. How to Connect Real Mobile SMS OTP (Twilio / Fast2SMS)

### Option A: Twilio SMS (Global Delivery)
1. Sign up for a free account at **[Twilio](https://www.twilio.com/)**.
2. Go to your **Twilio Console Dashboard**.
3. Copy your **Account SID**, **Auth Token**, and your **Twilio Phone Number**.
4. Open `backend/.env` and enter:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```
5. Install the twilio helper package in backend if not present:
   ```bash
   cd backend && npm install twilio
   ```

---

### Option B: Fast2SMS (India Bulk & OTP Delivery)
1. Sign up for a free account at **[Fast2SMS](https://www.fast2sms.com/)**.
2. Navigate to **Dev API** in the sidebar.
3. Copy your **API Authorization Key**.
4. In `backend/.env`:
   ```env
   FAST2SMS_API_KEY=your_fast2sms_authorization_key
   ```

---

## 🌐 4. How to Connect Google Sign-In (Google OAuth 2.0)

1. Go to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Create a new project named **`NovaKart Platform`**.
3. Go to **APIs & Services** ➔ **OAuth consent screen**:
   - User Type: **External**
   - App Name: `NovaKart`
   - User Support Email: your email
4. Go to **APIs & Services** ➔ **Credentials**:
   - Click **Create Credentials** ➔ **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `NovaKart Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `http://localhost:5000`
   - **Authorized redirect URIs**:
     - `http://localhost:3000`
5. Click **Create** and copy your **Client ID**.
6. Paste it into `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   ```

---

## 📘 5. How to Connect Facebook Login (Meta for Developers)

1. Go to **[Meta for Developers](https://developers.facebook.com/)** and log in.
2. Click **My Apps** ➔ **Create App**.
3. Select **Authenticate and request data from users with Facebook Login** ➔ Click **Next**.
4. Choose **Website** and enter your App Name: `NovaKart`.
5. Under **Facebook Login** ➔ **Settings**:
   - Set **Valid OAuth Redirect URIs** to:
     `http://localhost:3000/`
6. Go to **App Settings** ➔ **Basic**:
   - Copy your **App ID** and **App Secret**.
7. In `backend/.env`:
   ```env
   FACEBOOK_APP_ID=your_facebook_app_id
   ```

---

## 🔄 6. Summary of API Endpoints

| Endpoint | Method | Purpose | Sample Body |
| :--- | :--- | :--- | :--- |
| `/api/auth/send-otp` | `POST` | Dispatches 6-digit OTP to Email and/or Phone | `{ "email": "user@test.com", "phone": "+919876543210", "purpose": "registration" }` |
| `/api/auth/verify-otp` | `POST` | Verifies code validity & expiration | `{ "identifier": "user@test.com", "otp": "123456", "purpose": "registration" }` |
| `/api/auth/login-otp` | `POST` | Passwordless login via Mobile or Email | `{ "identifier": "+919876543210", "otp": "123456" }` |
| `/api/auth/social-login` | `POST` | Google / Facebook 1-click sign in / sign up | `{ "provider": "google", "name": "Alex", "email": "alex@gmail.com" }` |

---

All features are active and ready to test! Run `start.bat` to launch the platform.
