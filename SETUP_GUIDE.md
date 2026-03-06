# 📱 دليل رفع التطبيق على GitHub وتثبيته عبر AltStore

---

## 📁 الملفات المضافة (لا تُعدِّل أي شيء آخر)

```
capacitor.config.ts          ← إعدادات Capacitor لـ iOS
.github/
  └── workflows/
      └── build-ios.yml      ← Workflow تلقائي لبناء IPA
```

---

## 🚀 خطوات الرفع على GitHub

### الخطوة 1 — إعداد المشروع محلياً
```bash
# تثبيت Capacitor (مرة واحدة فقط)
npm install --save-dev @capacitor/cli @capacitor/core @capacitor/ios @capacitor/splash-screen
```

### الخطوة 2 — رفع الكود على GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/اسمك/اسم-المستودع.git
git push -u origin main
```

---

## 🔐 إضافة GEMINI_API_KEY كـ Secret

1. افتح مستودعك على GitHub
2. اذهب إلى: **Settings → Secrets and variables → Actions**
3. اضغط **New repository secret**
4. الاسم: `GEMINI_API_KEY`
5. القيمة: مفتاح API الخاص بك

---

## ⚙️ تشغيل الـ Workflow

- يعمل **تلقائياً** عند كل `push` إلى `main`
- أو شغّله يدوياً من: **Actions → Build iOS IPA → Run workflow**

---

## 📥 تحميل ملف IPA

1. اذهب إلى تبويب **Actions** في GitHub
2. افتح آخر تشغيل ناجح
3. في قسم **Artifacts** حمّل `Routines-IPA`
4. فكّ الضغط → ستجد `Routines.ipa`

---

## 📲 تثبيت التطبيق عبر AltStore

### المتطلبات:
- AltServer مثبّت على الكمبيوتر (Mac أو Windows)
- AltStore مثبّت على الآيفون
- الآيفون متصل بنفس الشبكة أو عبر USB

### خطوات التثبيت:
1. افتح **AltStore** على الآيفون
2. اضغط على `+` (أيقونة الإضافة)
3. اختر ملف `Routines.ipa` من الكمبيوتر
4. AltStore سيوقّع التطبيق تلقائياً باستخدام Apple ID الخاص بك
5. ثق بالمطوّر: **الإعدادات ← عام ← إدارة الجهاز**

---

## ⚠️ ملاحظات مهمة

| الموضوع | التفاصيل |
|--------|----------|
| صلاحية التطبيق | 7 أيام مع حساب Apple مجاني، يجدّدها AltStore تلقائياً |
| بيانات التطبيق | محفوظة في localStorage على الجهاز |
| Gemini AI | تأكد من إضافة مفتاح API في GitHub Secrets |
| الخصوصية | المستودع خاص (Private) لأن التطبيق شخصي |

---

## 🔄 تحديث التطبيق لاحقاً

```bash
# بعد أي تعديل:
git add .
git commit -m "تحديث التطبيق"
git push
# الـ Workflow يعمل تلقائياً وينتج IPA جديد
```
