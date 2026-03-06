# 🚀 دليل الرفع على TestFlight عبر GitHub Actions (من Windows)

## المتطلبات
- حساب GitHub (مجاني)
- حساب Apple Developer ($99/سنة) — إلزامي

---

## الخطوة 1: إعداد حساب Apple Developer

### أ) إنشاء App ID
1. افتح [developer.apple.com](https://developer.apple.com)
2. **Certificates, IDs & Profiles** → **Identifiers** → **+**
3. اختر **App IDs** → **App**
4. Description: `Routinely`
5. Bundle ID: `com.routinely.app` (أو أي اسم تريده)
6. اضغط **Continue** → **Register**

### ب) إنشاء Certificate (شهادة التوقيع)
1. **Certificates** → **+**
2. اختر **Apple Distribution**
3. اتبع الخطوات لإنشاء CSR (تحتاج Mac أو أداة مثل [cert.sh](https://github.com/nicklockwood/iOSDesignPatterns))
   - **بديل سهل من Windows**: استخدم [SSL.com CSR Generator](https://www.ssl.com/online-csr-and-key-generator/)
4. حمّل الـ Certificate (.cer) وحوّله لـ .p12:
   ```
   openssl x509 -in certificate.cer -inform DER -out certificate.pem
   openssl pkcs12 -export -out certificate.p12 -inkey private.key -in certificate.pem
   ```
5. حوّل الـ .p12 إلى Base64:
   ```bash
   # على Windows PowerShell:
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("certificate.p12")) | Out-File certificate_base64.txt
   ```

### ج) إنشاء Provisioning Profile
1. **Profiles** → **+**
2. اختر **App Store Connect**
3. اختر App ID الذي أنشأته
4. اختر الـ Certificate
5. اسم الملف: `Routinely App Store Profile`
6. حمّل الملف (.mobileprovision)
7. حوّله لـ Base64:
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("profile.mobileprovision")) | Out-File profile_base64.txt
   ```

### د) إنشاء App Store Connect API Key
1. افتح [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **Users and Access** → **Integrations** → **App Store Connect API**
3. اضغط **+** → اسم: `GitHub Actions` → Role: **App Manager**
4. حمّل الملف (.p8) — **احفظه لأنه لن يظهر مرة ثانية**
5. احفظ: **Key ID** و **Issuer ID**
6. حوّل الـ .p8 لـ Base64:
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("AuthKey_XXXXXX.p8")) | Out-File apikey_base64.txt
   ```

---

## الخطوة 2: إعداد GitHub Repository

### أ) رفع الكود
1. أنشئ repository جديد على GitHub
2. ارفع محتويات المجلد:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```

### ب) إضافة Secrets
1. في GitHub Repository → **Settings** → **Secrets and variables** → **Actions**
2. أضف هذه الـ Secrets (اضغط **New repository secret** لكل واحد):

| اسم الـ Secret | القيمة |
|---|---|
| `BUILD_CERTIFICATE_BASE64` | محتوى ملف `certificate_base64.txt` |
| `P12_PASSWORD` | كلمة مرور ملف الـ .p12 |
| `BUILD_PROVISION_PROFILE_BASE64` | محتوى ملف `profile_base64.txt` |
| `KEYCHAIN_PASSWORD` | أي كلمة مرور عشوائية (مثل: `MyKeychainPass123`) |
| `PROVISIONING_PROFILE_NAME` | `Routinely App Store Profile` |
| `APP_STORE_CONNECT_API_KEY_ID` | الـ Key ID من App Store Connect |
| `APP_STORE_CONNECT_API_ISSUER_ID` | الـ Issuer ID من App Store Connect |
| `APP_STORE_CONNECT_API_KEY_BASE64` | محتوى ملف `apikey_base64.txt` |

---

## الخطوة 3: إنشاء التطبيق في App Store Connect

1. افتح [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **My Apps** → **+** → **New App**
3. Platform: **iOS**
4. Name: `روتيني`
5. Bundle ID: `com.routinely.app`
6. اضغط **Create**

---

## الخطوة 4: تشغيل الـ Workflow

بعد إعداد كل شيء، كل ما عليك هو:
```bash
git push origin main
```
وسيبدأ GitHub تلقائياً في البناء والرفع! 🎉

**أو** يدوياً من:
GitHub → Repository → **Actions** → **Build & Deploy to TestFlight** → **Run workflow**

---

## الخطوة 5: دعوة المختبرين على TestFlight

1. App Store Connect → تطبيقك → **TestFlight**
2. انتظر اكتمال المعالجة (15-30 دقيقة)
3. **+** → أضف بريد المختبر
4. يصله دعوة على بريده

---

## ⏱️ المدة الإجمالية للبناء
حوالي **20-30 دقيقة** في كل مرة

## 🆓 الحد المجاني
- GitHub: 2000 دقيقة/شهر للـ private repos
- بما أن كل build تأخذ ~25 دقيقة = **80 build مجاني شهرياً** ✅
