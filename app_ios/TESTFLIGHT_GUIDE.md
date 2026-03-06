# 🚀 دليل رفع التطبيق على TestFlight

## المتطلبات الأساسية
- Mac مع Xcode 15+
- حساب Apple Developer ($99/سنة)
- Node.js 18+

---

## الخطوات

### 1️⃣ تثبيت التبعيات
```bash
npm install
```

### 2️⃣ بناء التطبيق
```bash
npm run build
```

### 3️⃣ إضافة Capacitor iOS
```bash
npx cap add ios
```

### 4️⃣ مزامنة الملفات
```bash
npx cap sync ios
```

### 5️⃣ فتح Xcode
```bash
npx cap open ios
```

---

## في Xcode:

### أ) الإعدادات الأساسية
1. اختر **App** في الشجرة اليسرى
2. في **General** → **Identity**:
   - Bundle Identifier: `com.routinely.app` (يمكن تغييره)
   - Version: `1.0`
   - Build: `1`
3. في **Signing & Capabilities**:
   - اختر Team (حساب Apple Developer)
   - تأكد من Automatically manage signing ✓

### ب) إضافة الأيقونات
- في `App/App/Assets.xcassets/AppIcon.xcassets`
- أضف أيقونة 1024×1024 بكسل
- يمكن استخدام موقع [makeappicon.com](https://makeappicon.com)

### ج) إعدادات iOS المهمة
في `App/App/Info.plist` أضف:
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>نحتاج الوصول لمعرض الصور لإضافة صور للمذكرات</string>
<key>UIRequiresFullScreen</key>
<true/>
<key>UISupportedInterfaceOrientations</key>
<array>
    <string>UIInterfaceOrientationPortrait</string>
</array>
```

### د) رفع على TestFlight
1. **Product** → **Archive**
2. في Organizer → **Distribute App**
3. اختر **App Store Connect**
4. اتبع الخطوات حتى النهاية
5. افتح [App Store Connect](https://appstoreconnect.apple.com)
6. في **TestFlight** → أضف المختبرين

---

## ملاحظات مهمة
- البيانات تُحفظ في `localStorage` داخل WebView
- الأيكونات تحتاج SVG أو PNG بدقة عالية
- الحد الأدنى للإصدار: iOS 16+

## استكشاف الأخطاء
- **Build Error**: تأكد من تحديث Xcode
- **Signing Error**: تحقق من صلاحيات حساب Developer
