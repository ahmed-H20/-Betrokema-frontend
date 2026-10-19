export const APP_NAME = 'بتروكيما'
export const APP_SUBTITLE = 'لوحة التحكم الإدارية'
export const APP_BADGE = 'مؤسسي'

export const NAV_SECTION_LABEL = 'لوحة التحكم والعمليات'

export const NAV_ITEMS = [
  { path: '/invoices', label: 'الفواتير والتحصيل', icon: 'receipt_long' },
  { path: '/products', label: 'المنتجات والتصنيفات', icon: 'inventory_2' },
  { path: '/sellers', label: 'مناديب المبيعات والعملاء', icon: 'badge' },
  {
    path: '/warehouses',
    label: 'إدارة المخازن والمستودعات',
    icon: 'warehouse',
  },
  { path: '/analytics', label: 'إحصائيات وتقارير عامة', icon: 'monitoring' },
] as const

export const SEARCH_PLACEHOLDER =
  'بحث برقم الفاتورة، كود الطلاء، المخزن أو المندوب...'
export const NOTIFICATIONS_LABEL = 'التنبيهات'
export const USER_ROLE_LABEL = 'مسؤول النظام'

export const PLACEHOLDER_TEXT = 'قيد الإنشاء'

export const NOT_FOUND_TITLE = 'الصفحة غير موجودة'
export const NOT_FOUND_MESSAGE =
  'تعذر العثور على الصفحة التي تحاول الوصول إليها.'
export const NOT_FOUND_BACK_LINK = 'العودة إلى الرئيسية'

// Products & Categories (Chunk 1)
export const PRODUCTS_PAGE_TITLE = 'إدارة المنتجات والتصنيفات'
export const PRODUCTS_PAGE_EYEBROW = 'إدارة المستودعات وسلاسل الإمداد'
export const PRODUCTS_ADD_BUTTON = '+ إضافة منتج جديد'

// Arabic numeral-agreement forms (see arabicPlural in src/lib/format.ts) for
// the counted nouns this screen uses repeatedly.
export const WAREHOUSE_PLURAL_FORMS = {
  one: 'مستودع',
  two: 'مستودعان',
  few: 'مستودعات',
  many: 'مستودع',
}
export const CATEGORY_PLURAL_FORMS = {
  one: 'فئة',
  two: 'فئتان',
  few: 'فئات',
  many: 'فئة',
}
export const PRODUCT_PLURAL_FORMS = {
  one: 'منتج',
  two: 'منتجان',
  few: 'منتجات',
  many: 'منتج',
}
export const STOCK_ITEM_PLURAL_FORMS = {
  one: 'صنف',
  two: 'صنفان',
  few: 'أصناف',
  many: 'صنف',
}

export const KPI_TOTAL_PRODUCTS_LABEL = 'إجمالي المنتجات المسجلة'
export const KPI_TOTAL_PRODUCTS_UNIT = (productWord: string) =>
  `${productWord} مفعل`
export const KPI_TOTAL_PRODUCTS_QUARTER = (count: number, productWord: string) =>
  `+${count} ${productWord} أضيف هذا الربع السنوي`
export const KPI_STOCK_VALUE_LABEL = 'قيمة المخزون الإجمالية'
export const CURRENCY_SUFFIX = 'ج.م'
export const KPI_STOCK_VALUE_WAREHOUSES = (count: number, warehouseWord: string) =>
  `موزع على ${count} ${warehouseWord}`
export const KPI_CRITICAL_ALERTS_LABEL = 'تنبيهات المخزون الحرجة'
export const KPI_CRITICAL_ALERTS_UNIT = (itemWord: string) =>
  `${itemWord} قاربت على النفاد`
export const KPI_CRITICAL_ALERTS_HINT = (warehouse: string) =>
  `${warehouse}: يلزم إصدار طلب توريد`
export const KPI_CRITICAL_ALERTS_NONE = 'لا توجد تنبيهات حرجة حالياً'
export const KPI_CATEGORIES_LABEL = 'التصنيفات المعتمدة'
export const KPI_CATEGORIES_UNIT = (categoryWord: string) =>
  `${categoryWord} منتجات`
export const KPI_TOP_CATEGORY = (name: string, count: number, productWord: string) =>
  `أعلى صنف: ${name} (${count} ${productWord})`
export const KPI_TOP_CATEGORY_NONE = 'لا توجد بيانات كافية بعد'
export const KPI_LOADING = 'جارِ تحميل المؤشرات...'
export const KPI_ERROR = 'تعذر تحميل مؤشرات المنتجات'

export const CATEGORY_FORM_TITLE = 'إضافة تصنيف فني جديد'
export const CATEGORY_FORM_BADGE = 'سريع'
export const CATEGORY_FORM_NAME_LABEL = 'اسم التصنيف بالعربية'
export const CATEGORY_FORM_NAME_EN_LABEL = 'اسم التصنيف بالإنجليزية (اختياري)'
export const CATEGORY_FORM_NAME_EN_PLACEHOLDER = 'Protection & Waterproofing'
export const CATEGORY_FORM_SUBMIT = 'حفظ وتثبيت التصنيف'
export const CATEGORY_LIST_TITLE = (count: number) =>
  `التصنيفات المعتمدة (${count})`
export const CATEGORY_DELETE_TITLE = 'حذف التصنيف'
export const CATEGORY_DELETE_BLOCKED_TOOLTIP =
  'لا يمكن حذف تصنيف يحتوي على منتجات'
export const CATEGORY_DELETE_CONFIRM_TITLE = 'تأكيد حذف التصنيف'
export const CATEGORY_DELETE_CONFIRM_DESCRIPTION =
  'سيتم حذف هذا التصنيف نهائياً ولا يمكن التراجع عن هذا الإجراء.'
export const CATEGORY_DELETE_BLOCKED = (count: number, productWord: string) =>
  `لا يمكن حذف هذا التصنيف لارتباطه بـ ${count} ${productWord}. أعد تصنيف هذه المنتجات أولاً.`
export const CATEGORY_DELETE_CONFIRM_BUTTON = 'حذف نهائي'
export const CATEGORIES_EMPTY = 'لا توجد تصنيفات بعد'
export const CATEGORIES_ERROR = 'تعذر تحميل التصنيفات'
export const CATEGORIES_LOADING = 'جارِ تحميل التصنيفات...'

export const FILTER_BY_CATEGORY_LABEL = 'فلترة حسب التصنيف:'
export const FILTER_TOTAL_PRODUCTS = (count: number, productWord: string) =>
  `إجمالي ${count} ${productWord}`
export const FILTER_ALL_CATEGORIES = 'الكل'
export const PRODUCT_SEARCH_PLACEHOLDER =
  'بحث باسم المنتج، الكود الشجري أو المواصفة الفنية...'
export const SORT_BUTTON_LABEL = 'فرز'
export const SORT_OPTION_NAME = 'الاسم'
export const SORT_OPTION_QUANTITY = 'الكمية'
export const SORT_OPTION_NEWEST = 'الأحدث'

export const FEATURED_BEST_SELLER_BADGE = 'الأكثر مبيعاً'
export const FEATURED_FEATURED_BADGE = 'منتج مميز'
export const FEATURED_HIGH_STOCK_BADGE = 'الأعلى مخزوناً'
export const FEATURED_CODE_PREFIX = 'كود:'
export const FEATURED_STOCK_AVAILABLE = 'مخزون متاح'
export const FEATURED_QUICK_EDIT = 'تعديل السريع'
export const FEATURED_EMPTY = 'لا يوجد منتج مميز حالياً'
export const FEATURED_LOADING = 'جارِ تحميل المنتج المميز...'
export const STOCK_UNIT_SUFFIX = 'وحدة'

export const PRODUCT_NO_CATEGORY = 'تصنيف غير محدد'
export const PRODUCT_EDIT_STOCK_PRICE = 'تعديل السعر والمخزون'
export const PRODUCT_DELETE_BUTTON = 'حذف'
export const PRODUCT_LOW_STOCK_BADGE = 'قاربت على النفاد'
export const PRODUCT_STOCK_PREFIX = 'الكمية المتوفرة:'
export const PACKAGE_PRICE_LABEL = (unitName: string, weight: string) =>
  weight ? `سعر ${unitName} (${weight})` : `سعر ${unitName}`
export const PACKAGE_DISCOUNT_LABEL = (percent: number) => `خصم فوري ${percent}%`
export const PRODUCT_DELETE_CONFIRM_TITLE = 'تأكيد حذف المنتج'
export const PRODUCT_DELETE_CONFIRM_DESCRIPTION =
  'سيتم حذف هذا المنتج نهائياً ولا يمكن التراجع عن هذا الإجراء.'
export const PRODUCT_DELETE_CONFIRM_BUTTON = 'حذف نهائي'
export const PRODUCTS_EMPTY = 'لا توجد منتجات مطابقة لبحثك'
export const PRODUCTS_ERROR = 'تعذر تحميل المنتجات'
export const PRODUCTS_LOADING = 'جارِ تحميل المنتجات...'

export const PAGINATION_SUMMARY = (
  from: number,
  to: number,
  total: number,
  productWord: string,
) => `عرض ${from} - ${to} من إجمالي ${total} ${productWord} مسجل بالمنظومة`

export const PRODUCT_MODAL_TITLE = 'إدراج منتج دهانات أو كيماويات جديد'
export const PRODUCT_MODAL_SUBTITLE = 'كتالوج منتجات بتروكيما المركزية'
export const PRODUCT_MODAL_SECTION_BASIC = 'البيانات الأساسية والتصنيف'
export const PRODUCT_NAME_LABEL = 'اسم المنتج التجاري'
export const PRODUCT_NAME_PLACEHOLDER = 'مثال: خيمة ستار 30000 سيليكون كوت'
export const PRODUCT_CATEGORY_LABEL = 'التصنيف الرئيسي'
export const PRODUCT_CATEGORY_PLACEHOLDER = 'اختر التصنيف الفني للمنتج'
export const PRODUCT_DESCRIPTION_LABEL = 'الوصف الفني والتطبيقات'
export const PRODUCT_DESCRIPTION_PLACEHOLDER =
  'اكتب المواصفات الفنية للدهان، معدل التغطية، والاستخدامات الموصى بها...'

export const PRODUCT_MODAL_SECTION_PRICING =
  'تسعير الوحدات المتعددة (Multi-Unit Pricing)'
export const UNIT_GALON_LABEL = 'وحدة الجالون (Galon)'
export const UNIT_GALON_BADGE = 'تجزئة'
export const UNIT_BESTELA_LABEL = 'وحدة البستلة (Bestela)'
export const UNIT_BESTELA_BADGE = 'مشاريع وجملة'
export const UNIT_BASE_PRICE_LABEL = 'السعر الأساسي (ج.م)'
export const UNIT_DISCOUNT_LABEL = 'الخصم المتاح (%)'
export const UNIT_WEIGHT_LABEL = 'الوزن / السعة'

export const PRODUCT_MODAL_SECTION_STOCK = 'كميات المخزون الأولية والتنبيهات'
export const PRODUCT_WAREHOUSE_LABEL = 'المستودع المستهدف'
export const PRODUCT_WAREHOUSE_PLACEHOLDER = 'اختر المستودع'
export const PRODUCT_INITIAL_QUANTITY_LABEL = 'الكمية الأولية المتوفرة'
export const PRODUCT_CURRENT_QUANTITY_LABEL = 'الكمية المتوفرة حالياً'
export const PRODUCT_REORDER_LEVEL_LABEL = 'حد التنبيه الحرج (إعادة الطلب)'

export const PRODUCT_MODAL_SECTION_FEATURES =
  'الخواص الفنية المعتمدة (Technical Features)'
export const PRODUCT_FEATURE_PRESETS = [
  'مقاوم للأشعة UV',
  'ثبات ألوان 10 سنوات',
  'عزل مائي 100%',
  'مضاد للبكتيريا والعفن',
  'صديق للبيئة منعدم VOC',
] as const

export const PRODUCT_MODAL_SECTION_MEDIA = 'الصور الرئيسية ومعرض المنتج'
export const PRODUCT_IMAGE_LABEL = 'رابط الصورة الرئيسية (اختياري)'
export const PRODUCT_IMAGE_PLACEHOLDER = 'https://example.com/image.jpg'
export const PRODUCT_GALLERY_LABEL = 'روابط صور المعرض (اختياري)'
export const PRODUCT_GALLERY_ADD = '+ إضافة رابط صورة'
export const PRODUCT_IMAGE_URL_ERROR =
  'يجب إدخال رابط صالح يبدأ بـ http:// أو https://'

export const REMOVE_LABEL = 'إزالة'
export const MODAL_CANCEL = 'إلغاء الأمر'
export const PRODUCT_MODAL_SUBMIT = 'اعتماد وحفظ المنتج'
export const QUICK_EDIT_TITLE = 'تعديل السعر والمخزون'
export const QUICK_EDIT_SUBMIT = 'حفظ التعديلات'

// Toasts
export const TOAST_PRODUCT_CREATED = 'تم إضافة المنتج بنجاح'
export const TOAST_PRODUCT_DELETED = 'تم حذف المنتج بنجاح'
export const TOAST_PRODUCT_STOCK_UPDATED = 'تم تحديث السعر والمخزون بنجاح'
export const TOAST_CATEGORY_CREATED = 'تم حفظ وتثبيت التصنيف بنجاح'
export const TOAST_CATEGORY_DELETED = 'تم حذف التصنيف بنجاح'
export const GENERIC_ERROR = 'حدث خطأ غير متوقع'

// Sellers & Clients (Chunk 2)
export const SELLERS_PAGE_TITLE = 'مناديب المبيعات والعملاء الميدانيين'
export const SELLERS_PAGE_SUBTITLE =
  'متابعة الأداء الإقليمي، حصص المبيعات الميدانية، تحصيلات الفواتير، ومحفظة العملاء لكل مندوب'
export const SELLERS_ADD_BUTTON = '+ تسجيل مندوب جديد'

export const SELLER_PLURAL_FORMS = {
  one: 'مندوب',
  two: 'مندوبان',
  few: 'مناديب',
  many: 'مندوباً',
}
export const CLIENT_PLURAL_FORMS = {
  one: 'عميل',
  two: 'عميلان',
  few: 'عملاء',
  many: 'عميلاً',
}

export const SELLER_KPI_LOADING = 'جارِ تحميل مؤشرات المناديب...'
export const SELLER_KPI_ERROR = 'تعذر تحميل مؤشرات المناديب'
export const KPI_CERTIFIED_SELLERS_LABEL = 'المناديب المعتمدون'
export const KPI_CERTIFIED_SELLERS_UNIT = (word: string) => `${word} ميدانياً`
export const KPI_TEAM_SALES_LABEL = 'إجمالي مبيعات الفريق (الشهر)'
export const KPI_TEAM_SALES_TARGET = (target: string) => `المستهدف: ${target} م. ج.م`
export const KPI_TARGET_ACHIEVEMENT_LABEL = 'نسبة تحقيق المستهدف'
export const KPI_TARGET_DAYS_REMAINING = (days: number) => `باقي ${days} أيام للإغلاق`
export const KPI_ACTIVE_CLIENTS_LABEL = 'العملاء الميدانيون النشطون'
export const KPI_ACTIVE_CLIENTS_UNIT = (word: string) => `${word} ومعرض طلاء`
export const KPI_ACTIVE_CLIENTS_NEW = (count: number) =>
  `+${count} عميلاً جديداً هذا الأسبوع`

export const REPS_LIST_TITLE = 'قائمة المناديب الميدانيين'
export const REPS_SORT_OPTION_PERFORMANCE = 'الأداء'
export const REPS_SORT_OPTION_SALES = 'المبيعات'
export const REPS_SORT_LABEL = (option: string) => `ترتيب حسب: ${option}`
export const REPS_FILTER_BUTTON = 'تصفية'
export const REPS_SEARCH_PLACEHOLDER = 'بحث باسم المندوب، الكود أو رقم الهاتف...'
export const REPS_STATUS_ALL = 'كل الحالات'
export const REPS_GOVERNORATE_ALL = 'كل المحافظات'
export const REP_CARD_SALES_PREFIX = 'المبيعات:'
export const REP_CARD_CLIENTS_COUNT = (count: string) => `${count} عميلاً`
export const REPS_EMPTY = 'لا يوجد مناديب مطابقون لبحثك'
export const REPS_ERROR = 'تعذر تحميل بيانات المناديب'
export const REPS_LOADING = 'جارِ تحميل المناديب...'

// Seller.status — VACATION has no label in the Stitch export (ui-strings.md
// flags this gap); "في إجازة" coined here to match the other two labels'
// register, logged in context/ui-tokens.md.
export const SELLER_STATUS_LABELS = {
  ACTIVE: 'نشط ميدانياً',
  SUSPENDED: 'معلق',
  VACATION: 'في إجازة',
} as const

export const REP_EDIT_BUTTON = 'تعديل البيانات'
export const REP_MORE_ACTIONS_LABEL = 'خيارات إضافية'
export const REP_METRIC_CURRENT_SALES = 'مبيعات الشهر الحالي'
export const REP_METRIC_ACHIEVEMENT = 'نسبة الإنجاز'
export const REP_METRIC_COMMISSION = 'العمولات المستحقة'
export const REP_METRIC_COLLECTION = 'معدل التحصيل المالي'
export const REP_COLLECTION_RATE_UNKNOWN = '—'
export const REP_DETAIL_EMPTY = 'اختر مندوباً من القائمة لعرض بياناته'

export const TAB_CLIENTS = (count: number) => `العملاء المسجلون (${count} عميل)`
export const TAB_INVOICES = (count: number) => `فواتير المندوب والتحصيل (${count})`
export const TAB_PERFORMANCE = 'الملف الوظيفي والأداء'

export const CLIENTS_TAB_TITLE = 'محفظة عملاء المندوب'
export const CLIENTS_TAB_SUBTITLE = 'معارض الدهانات، مقاولو التشطيبات، والشركات'
export const CLIENTS_ADD_BUTTON = '+ إضافة عميل للمندوب'
export const CLIENTS_COL_NAME = 'اسم العميل / المنشأة'
export const CLIENTS_COL_CONTACT = 'المسؤول والهاتف'
export const CLIENTS_COL_CREDIT = 'حد الائتمان'
export const CLIENTS_COL_DEBT = 'المديونية الحالية'
export const CLIENTS_COL_STATUS = 'حالة الدفع'
export const CLIENT_STATUS_LABELS = {
  regular: 'منتظم بالسداد',
  over_credit: 'تجاوز الائتمان',
  excellent: 'رصيد ممتاز',
  settled: 'خالص تماماً',
} as const
export const CLIENT_STATUS_UNKNOWN = 'غير محدد'
export const CLIENTS_EMPTY = 'لا يوجد عملاء مسجلون لهذا المندوب'
export const CLIENTS_ERROR = 'تعذر تحميل بيانات العملاء'
export const CLIENTS_LOADING = 'جارِ تحميل العملاء...'

export const ADD_CLIENT_TITLE = 'تسجيل عميل جديد للمندوب'
export const ADD_CLIENT_SUBTITLE = (repName: string) =>
  `سيتم ربط العميل بمحفظة ${repName}`
export const CLIENT_NAME_LABEL = 'اسم العميل'
export const CLIENT_ORGANIZE_LABEL = 'اسم المنشأة أو الشركة'
export const CLIENT_CONTACT_LABEL = 'المسؤول (اختياري)'
export const CLIENT_PHONE_LABEL = 'رقم الهاتف'
export const CLIENT_GOVERNORATE_LABEL = 'المحافظة'
export const CLIENT_CITY_LABEL = 'المدينة'
export const CLIENT_ADDRESS_LABEL = 'العنوان (اختياري)'
export const CLIENT_CREDIT_LIMIT_LABEL = 'حد الائتمان الممنوح'
export const CLIENT_COMMERCIAL_TYPE_LABEL = 'النشاط التجاري (اختياري)'
export const CLIENT_NOTES_LABEL = 'ملاحظات (اختياري)'
export const ADD_CLIENT_SUBMIT = 'حفظ وربط العميل'
export const TOAST_CLIENT_CREATED = 'تم إضافة العميل بنجاح'

export const INVOICES_TAB_PILL_COLLECTED = 'فواتير محصلة'
export const INVOICES_TAB_PILL_IN_COLLECTION = 'قيد التحصيل (شيكات/آجل)'
export const INVOICES_TAB_PILL_OVERDUE = 'متأخرات مستحقة'
export const INVOICES_COL_CODE = 'رقم الفاتورة'
export const INVOICES_COL_CLIENT = 'العميل المستلم'
export const INVOICES_COL_DATE = 'تاريخ الإصدار'
export const INVOICES_COL_AMOUNT = 'قيمة الفاتورة'
export const INVOICES_COL_STATUS = 'حالة التحصيل'
export const INVOICE_BADGE_PAID = 'تم السداد كلياً'
export const INVOICE_BADGE_PARTIAL = 'سداد جزئي'
export const INVOICE_BADGE_OVERDUE = 'متأخر عن السداد'
export const INVOICE_BADGE_UNPAID = 'غير مسدد'
export const INVOICE_BADGE_DUE = (date: string) => `مستحق في ${date}`
export const INVOICES_EMPTY = 'لا توجد فواتير مسجلة لهذا المندوب'
export const INVOICES_ERROR = 'تعذر تحميل الفواتير'
export const INVOICES_LOADING = 'جارِ تحميل الفواتير...'

export const PROFILE_COVERAGE_TITLE = 'نطاق التغطية'
export const PROFILE_COVERAGE_REGION_LABEL = 'المنطقة:'
export const PROFILE_COVERAGE_CITY_LABEL = 'المدينة:'
export const PROFILE_COVERAGE_ADDRESS_LABEL = 'العنوان:'
export const PROFILE_COVERAGE_EMPTY = 'لا تتوفر بيانات نطاق تغطية مسجلة'
export const PROFILE_COMMISSION_TITLE = 'العمولة'
export const PROFILE_COMMISSION_RATE_LABEL = 'نسبة العمولة'
export const PROFILE_COMMISSION_AMOUNT_LABEL = 'العمولة المستحقة'
export const PROFILE_COMMISSION_BASIS_NOTE =
  'العمولة محسوبة على إجمالي مبيعات الشهر الحالي، وليس على المبلغ المحصل فعلياً'
export const PROFILE_SUSPEND_BUTTON = 'تعليق الحساب مؤقتاً'
export const PROFILE_REACTIVATE_BUTTON = 'إعادة التفعيل'

export const SUSPEND_DIALOG_TITLE = 'تعليق حساب المندوب'
export const SUSPEND_DIALOG_DESCRIPTION =
  'سيتم تعليق حساب المندوب مؤقتاً ولن يظهر كمندوب نشط. يمكنك إعادة تفعيله في أي وقت.'
export const SUSPEND_REASON_LABEL = 'سبب التعليق (اختياري)'
export const SUSPEND_CONFIRM_BUTTON = 'تعليق الحساب'
export const REACTIVATE_DIALOG_TITLE = 'إعادة تفعيل حساب المندوب'
export const REACTIVATE_DIALOG_DESCRIPTION = 'سيعود المندوب للعمل كمندوب نشط فوراً.'
export const REACTIVATE_CONFIRM_BUTTON = 'إعادة التفعيل'
export const TOAST_SELLER_STATUS_UPDATED = 'تم تحديث حالة المندوب بنجاح'

export const REP_MODAL_TITLE_CREATE = 'تسجيل مندوب مبيعات جديد'
export const REP_MODAL_TITLE_EDIT = 'تعديل بيانات المندوب'
export const REP_MODAL_SUBTITLE = 'إدخال بيانات المندوب الرسمية وتحديد النطاق الجغرافي'
export const REP_NAME_LABEL = 'الاسم بالكامل (ثلاثي أو رباعي)'
export const REP_PHOTO_URL_LABEL = 'رابط صورة المندوب (اختياري)'
export const REP_PHOTO_URL_PLACEHOLDER = 'https://example.com/photo.jpg'
export const REP_PHONE_LABEL = 'رقم الهاتف (الواتساب والمكالمات)'
export const REP_GOVERNORATE_LABEL = 'المحافظة'
export const REP_GOVERNORATE_PLACEHOLDER = 'اختر المحافظة'
export const REP_REGION_LABEL = 'المنطقة الميدانية (اختياري)'
export const REP_PERFORMANCE_SECTION = 'بيانات الأداء (اختياري)'
export const REP_TITLE_LABEL = 'المسمى الوظيفي'
export const REP_SECTOR_LABEL = 'القطاع'
export const REP_MONTHLY_TARGET_LABEL = 'المستهدف الشهري (ج.م)'
export const REP_COMMISSION_RATE_LABEL = 'نسبة العمولة (%)'
export const REP_MODAL_SUBMIT = 'حفظ بيانات المندوب'
export const TOAST_SELLER_SAVED = 'تم حفظ بيانات المندوب'

export const REP_GOVERNORATE_OPTIONS = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الشرقية',
  'الدقهلية',
  'القليوبية',
] as const

export const DELETE_SELLER_BUTTON = 'حذف المندوب'
export const DELETE_SELLER_BLOCKED_TITLE = 'لا يمكن حذف هذا المندوب'
export const DELETE_SELLER_BLOCKED_MESSAGE =
  'لا يمكن حذف مندوب لديه عملاء أو فواتير، يمكنك تعليق الحساب بدلاً من ذلك'
export const DELETE_SELLER_BLOCKED_SUSPEND_BUTTON = 'تعليق الحساب بدلاً من ذلك'
export const DELETE_SELLER_CONFIRM_TITLE = 'تأكيد حذف المندوب'
export const DELETE_SELLER_CONFIRM_DESCRIPTION =
  'سيتم حذف هذا المندوب نهائياً ولا يمكن التراجع عن هذا الإجراء.'
export const DELETE_SELLER_CONFIRM_BUTTON = 'حذف نهائي'
export const TOAST_SELLER_DELETED = 'تم حذف المندوب بنجاح'

export const VALIDATION_SELLER_NAME_REQUIRED = 'الاسم الكامل مطلوب'
export const VALIDATION_SELLER_PHONE_INVALID =
  'رقم هاتف مصري غير صالح (مثال: 01012345678)'
export const SELLER_PHOTO_URL_ERROR =
  'يجب إدخال رابط صالح يبدأ بـ http:// أو https://'
export const VALIDATION_CLIENT_NAME_REQUIRED = 'اسم العميل مطلوب'
export const VALIDATION_CLIENT_ORGANIZE_REQUIRED = 'اسم المنشأة أو الشركة مطلوب'
export const VALIDATION_CLIENT_PHONE_INVALID =
  'رقم هاتف مصري غير صالح (مثال: 01012345678)'

// Validation messages
export const VALIDATION_PRODUCT_NAME_REQUIRED = 'اسم المنتج التجاري مطلوب'
export const VALIDATION_PRODUCT_CATEGORY_REQUIRED = 'التصنيف الرئيسي مطلوب'
export const VALIDATION_QUANTITY_NEGATIVE = 'الكمية لا يمكن أن تكون سالبة'
export const VALIDATION_MIN_STOCK_NEGATIVE = 'الحد لا يمكن أن يكون سالباً'
export const VALIDATION_PACKAGES_MIN = 'يجب إدخال سعر وحدة واحدة على الأقل'
export const VALIDATION_CATEGORY_NAME_REQUIRED = 'اسم التصنيف بالعربية مطلوب'
export const VALIDATION_GALON_PRICE_REQUIRED = 'السعر الأساسي للجالون مطلوب'
export const VALIDATION_BESTELA_PRICE_REQUIRED = 'السعر الأساسي للبستلة مطلوب'
export const VALIDATION_DISCOUNT_NEGATIVE = 'الخصم لا يمكن أن يكون سالباً'
export const VALIDATION_DISCOUNT_MAX = 'الخصم لا يمكن أن يتجاوز 100%'
