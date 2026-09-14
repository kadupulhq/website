/** @type {Record<string, { label: string, lang: string, dir?: 'rtl' | 'ltr' }>} */
export const locales = {
	root: { label: 'English', lang: 'en' },
	'zh-cn': { label: '简体中文', lang: 'zh-CN' },
	hi: { label: 'हिन्दी', lang: 'hi' },
	es: { label: 'Español', lang: 'es' },
	ar: { label: 'العربية', lang: 'ar', dir: 'rtl' },
	fr: { label: 'Français', lang: 'fr' },
	de: { label: 'Deutsch', lang: 'de' },
	ja: { label: '日本語', lang: 'ja' },
};

export const translatedLocales = Object.keys(locales).filter((locale) => locale !== 'root');

export const messages = {
	fr: {
		map: 'Plan de la documentation', start: 'Premiers pas', overview: 'Présentation de Kadupul',
		install: 'Installation', device: 'Ajouter un premier appareil', graph: 'Lire un premier graphique',
		guides: 'Guides pratiques', concepts: 'Concepts', reference: 'Référence', project: 'Projet',
		docsLicense: 'Licence de la documentation :', codeLicense: 'Licence du code du site :',
		independent: 'Kadupul n’est ni affilié à The Cacti Group ni approuvé par celui-ci.',
		mapDescription: 'Parcourir la documentation par sujet.',
		fallback: 'Les pages non encore traduites sont affichées en anglais avec un avertissement.',
	},
	de: {
		map: 'Dokumentationsübersicht', start: 'Erste Schritte', overview: 'Was ist Kadupul?',
		install: 'Installation', device: 'Das erste Gerät hinzufügen', graph: 'Das erste Diagramm lesen',
		guides: 'Anleitungen', concepts: 'Konzepte', reference: 'Referenz', project: 'Projekt',
		docsLicense: 'Lizenz der Dokumentation:', codeLicense: 'Lizenz des Website-Codes:',
		independent: 'Kadupul ist nicht mit The Cacti Group verbunden und wird von ihr nicht unterstützt.',
		mapDescription: 'Die Dokumentation nach Themen durchsuchen.',
		fallback: 'Noch nicht übersetzte Seiten werden mit einem Hinweis auf Englisch angezeigt.',
	},
	ja: {
		map: 'ドキュメント一覧', start: 'はじめに', overview: 'Kadupul とは',
		install: 'インストール', device: '最初のデバイスを追加', graph: '最初のグラフを読む',
		guides: '操作ガイド', concepts: '概念', reference: 'リファレンス', project: 'プロジェクト',
		docsLicense: 'ドキュメントのライセンス：', codeLicense: 'サイトコードのライセンス：',
		independent: 'Kadupul は The Cacti Group と提携しておらず、同団体の承認も受けていません。',
		mapDescription: 'トピック別にドキュメントを探します。',
		fallback: '未翻訳のページは、その旨を示す通知とともに英語で表示されます。',
	},
	en: {
		map: 'Documentation map', start: 'Start here', overview: 'What Kadupul is',
		install: 'Install', device: 'Add your first device', graph: 'Read your first graph',
		guides: 'How-to guides', concepts: 'Concepts', reference: 'Reference', project: 'Project',
		docsLicense: 'Documentation license:', codeLicense: 'Site code license:',
		independent: 'Kadupul is not affiliated with or endorsed by The Cacti Group.',
		mapDescription: 'Browse the documentation by topic.',
		fallback: 'Pages not yet translated are available in English with a translation notice.',
	},
	'zh-cn': {
		map: '文档导航', start: '入门', overview: 'Kadupul 简介',
		install: '安装', device: '添加第一台设备', graph: '阅读第一张图表',
		guides: '操作指南', concepts: '概念', reference: '参考', project: '项目',
		docsLicense: '文档许可证：', codeLicense: '网站代码许可证：',
		independent: 'Kadupul 与 The Cacti Group 无隶属关系，也未获得其认可。',
		mapDescription: '按主题浏览文档。',
		fallback: '尚未翻译的页面会显示英文内容，并附有未翻译提示。',
	},
	hi: {
		map: 'दस्तावेज़ मानचित्र', start: 'यहाँ से शुरू करें', overview: 'Kadupul क्या है',
		install: 'स्थापना', device: 'पहला उपकरण जोड़ें', graph: 'पहला ग्राफ़ समझें',
		guides: 'कार्य मार्गदर्शिकाएँ', concepts: 'अवधारणाएँ', reference: 'संदर्भ', project: 'परियोजना',
		docsLicense: 'दस्तावेज़ का लाइसेंस:', codeLicense: 'वेबसाइट कोड का लाइसेंस:',
		independent: 'Kadupul का The Cacti Group से कोई संबंध नहीं है और उसे उसका समर्थन प्राप्त नहीं है।',
		mapDescription: 'विषय के अनुसार दस्तावेज़ देखें।',
		fallback: 'जिन पृष्ठों का अनुवाद अभी नहीं हुआ है, वे सूचना के साथ अंग्रेज़ी में उपलब्ध हैं।',
	},
	es: {
		map: 'Mapa de documentación', start: 'Primeros pasos', overview: 'Qué es Kadupul',
		install: 'Instalación', device: 'Añadir el primer dispositivo', graph: 'Interpretar el primer gráfico',
		guides: 'Guías prácticas', concepts: 'Conceptos', reference: 'Referencia', project: 'Proyecto',
		docsLicense: 'Licencia de la documentación:', codeLicense: 'Licencia del código del sitio:',
		independent: 'Kadupul no está afiliado a The Cacti Group ni cuenta con su respaldo.',
		mapDescription: 'Consulta la documentación por tema.',
		fallback: 'Las páginas aún no traducidas se muestran en inglés con un aviso.',
	},
	ar: {
		map: 'خريطة الوثائق', start: 'ابدأ هنا', overview: 'ما هو Kadupul',
		install: 'التثبيت', device: 'إضافة أول جهاز', graph: 'قراءة أول رسم بياني',
		guides: 'أدلة الاستخدام', concepts: 'المفاهيم', reference: 'المرجع', project: 'المشروع',
		docsLicense: 'ترخيص الوثائق:', codeLicense: 'ترخيص شيفرة الموقع:',
		independent: 'Kadupul غير تابع لمجموعة The Cacti Group ولا يحظى بتأييدها.',
		mapDescription: 'تصفح الوثائق حسب الموضوع.',
		fallback: 'تُعرض الصفحات التي لم تُترجم بعد باللغة الإنجليزية مع إشعار بذلك.',
	},
};

export function getMessages(locale) {
	return messages[locale?.toLowerCase()] || messages.en;
}

export function navigation(key) {
	return {
		label: messages.en[key],
		translations: Object.fromEntries(translatedLocales.map((locale) => [locales[locale].lang, messages[locale][key]])),
	};
}
