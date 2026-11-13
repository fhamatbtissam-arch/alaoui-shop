Alaoui Shop Coffee and Food — دليل النشر

الملفات:
index.html الصفحة الرئيسية
admin.html لوحة الإدارة
style.css التصميم
app.js عرض بيانات الموقع
admin.js وظائف لوحة الإدارة
config.js إعدادات الربط
supabase_setup.sql جداول قاعدة البيانات وسياسات الوصول

خطوات النشر المجاني:
1) أنشئ مشروعاً في Supabase.
2) افتح SQL Editor وشغّل كامل ملف supabase_setup.sql.
3) من Authentication > Users أنشئ مستخدم المدير ببريدك وكلمة مرور قوية.
4) انسخ UUID للمستخدم ونفذ في SQL Editor:
   insert into public.admin_users(user_id) values('UUID-HERE');
5) من Project Settings > API انسخ Project URL و anon/public key.
6) ضع القيمتين في config.js. لا تضع service_role key في ملفات الموقع.
7) ارفع ملفات هذا المجلد إلى GitHub repository.
8) اربط GitHub بـ Vercel وانشر المشروع كـ Static Site.
9) افتح /admin.html لتسجيل الدخول وإضافة المنتجات والصور.

تنبيه: الموقع لا يصبح متصلاً بقاعدة البيانات ولا منشوراً بمجرد رفع الملفات. يلزم إكمال الخطوات أعلاه. الخطة المجانية لها حدود استخدام وقد تتغير. الطلبات في هذه النسخة تبدأ عبر واتساب، ولا توجد مدفوعات إلكترونية.
