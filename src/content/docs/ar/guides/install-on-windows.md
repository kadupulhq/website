---
title: "التثبيت من مضيف Windows"
description: "قيّم Kadupul في Linux مستضاف على Windows وافهم عوائق Windows الأصلي."
banner:
  content: "Kadupul في مرحلة ما قبل ألفا. لم يتم التحقق من إجراء المنصة هذا من البداية إلى النهاية. مسودة ترجمة تنتظر المراجعة اللغوية."
---

## اختيار بيئة التنفيذ

يتطلب `main` الحالي PHP 8.4+ و`pcntl` و`posix`؛ ولا يستطيع PHP الأصلي على Windows استيفاء متطلبات Unix هذه. لا تتجاوز فحوص منصة Composer. استخدم آلة Linux افتراضية أو قيّم WSL 2 على إصدار Windows تدعمه Microsoft. هذه تثبيتات Linux يستضيفها Windows، وليست عمليات نشر IIS أصلية تم التحقق منها. راجع حدود منصة PHP.

## تجهيز Linux ثم التثبيت

بالنسبة إلى WSL، نفّذ ما يلي في PowerShell بصلاحية مسؤول وأعد التشغيل إذا طُلب منك:

```powershell
wsl --install -d Ubuntu
wsl --list --verbose
```

تأكد من الإصدار 2. أكمل إعداد حساب Linux، ثم اتبع التثبيت داخل Linux لقاعدة البيانات وامتدادات PHP والموارد وخادم الويب والمجدول. احتفظ بالشيفرة وتخزين RRD في نظام ملفات Linux، لا ضمن `/mnt/c/`. راجع دليلي Microsoft لـ WSL وأنظمة الملفات.

## فحص دورة الحياة والاستعادة

استخدم حسابات مخصصة غير مميّزة وآلية تشغيل جمع واحدة. تحقّق من ثقة التخزين والاستقصاء وطوابع الرسوم وإعادة التشغيل بعد إعادة تشغيل المضيف أو إغلاق WSL. لا تفترض أن جلسة سطح المكتب تحافظ على الجمع. انسخ قاعدة البيانات والإعدادات وRRD معًا. تظل الصيانة الإتلافية لـ RRD والحذف أو الأرشفة المحلية التلقائية غير متاحة في Windows الأصلي؛ وسلوك Linux لا يتحقق منها. راجع المتطلبات والنسخ الاحتياطي.

[حدود PHP](https://www.php.net/manual/en/pcntl.installation.php) · [التثبيت](/ar/start/install/) · [دليل Microsoft WSL](https://learn.microsoft.com/en-us/windows/wsl/install) · [أنظمة الملفات](https://learn.microsoft.com/en-us/windows/wsl/filesystems) · [المتطلبات](/ar/reference/requirements/) · [النسخ الاحتياطي](/ar/guides/back-up-and-restore/)

تم التحقق من أساس التطبيق في 26 أكتوبر 2026: [cbd6117d6](https://github.com/kadupulhq/kadupul/tree/cbd6117d6e1092ef887c66f9844bef004a65119e).
