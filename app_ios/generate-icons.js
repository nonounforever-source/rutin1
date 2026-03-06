#!/usr/bin/env node
// Script to generate iOS icons from a base SVG
// Run: node generate-icons.js
// Requires: npm install sharp

const sizes = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024];

console.log(`
📱 لإنشاء أيقونات التطبيق:

الطريقة السهلة:
1. اذهب إلى https://www.appicon.co
2. ارفع صورة 1024×1024 بكسل
3. حمّل الملفات واستخدمها في Xcode

أو استخدم Capacitor Assets:
npm install @capacitor/assets --save-dev
npx capacitor-assets generate --iconBackgroundColor '#007AFF' --iconBackgroundColorDark '#0A84FF'

الأحجام المطلوبة: ${sizes.join(', ')} بكسل
`);
