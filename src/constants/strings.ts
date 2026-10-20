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

// Responsive shell (R1): phone bottom tab bar + tablet/phone nav drawer.
// Short labels for the bottom bar only — the full sidebar/drawer nav keeps
// NAV_ITEMS' longer labels above. See context/responsive-plan.md's Part 3
// "bottom tab bar item set" note for why these 4 + "المزيد" were chosen.
export const BOTTOM_NAV_INVOICES_LABEL = 'الفواتير'
export const BOTTOM_NAV_PRODUCTS_LABEL = 'المنتجات'
export const BOTTOM_NAV_SELLERS_LABEL = 'المناديب'
export const BOTTOM_NAV_WAREHOUSES_LABEL = 'المخازن'
export const BOTTOM_NAV_MORE_LABEL = 'المزيد'
export const OPEN_NAV_DRAWER_LABEL = 'فتح القائمة'
export const CLOSE_NAV_DRAWER_LABEL = 'إغلاق القائمة'
export const SEARCH_ICON_LABEL = 'بحث'

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
// Compact phone pagination (R2-products-responsive): page-number buttons are
// dropped below `sm`, replaced by this single indicator between the prev/next
// buttons — see context/ui-tokens.md.
export const PAGINATION_COMPACT_PAGE = (current: number, total: number) =>
  `صفحة ${current} من ${total}`

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
export const PRODUCT_IMAGE_LABEL = 'صورة المنتج الرئيسية (اختياري)'
export const PRODUCT_IMAGE_PLACEHOLDER = 'اختر صورة من جهازك أو اسحبها هنا'
export const PRODUCT_GALLERY_LABEL = 'معرض صور المنتج (اختياري)'
export const PRODUCT_GALLERY_ADD = '+ إضافة صورة'
export const PRODUCT_IMAGE_URL_ERROR =
  'صيغة الصورة أو الرابط غير صالح'

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
export const DAYS_REMAINING_PLURAL_FORMS = {
  one: 'يوم واحد',
  two: 'يومان',
  few: 'أيام',
  many: 'يوماً',
}
export const REP_CARD_CLIENTS_COUNT_FORMS = {
  one: 'عميل واحد',
  two: 'عميلان',
  few: 'عملاء',
  many: 'عميلاً',
}
export const REP_CARD_CLIENTS_REGISTERED_FORMS = {
  one: 'عميل واحد مسجل',
  two: 'عميلان مسجلان',
  few: 'عملاء مسجلون',
  many: 'عميلاً مسجلاً',
}
export const REP_CARD_INVOICES_QUARTER_FORMS = {
  one: 'فاتورة واحدة هذا الربع',
  two: 'فاتورتان هذا الربع',
  few: 'فواتير هذا الربع',
  many: 'فاتورة هذا الربع',
}

export const SELLER_KPI_LOADING = 'جارِ تحميل مؤشرات المناديب...'
export const SELLER_KPI_ERROR = 'تعذر تحميل مؤشرات المناديب'
export const KPI_CERTIFIED_SELLERS_LABEL = 'المناديب المعتمدون'
export const KPI_CERTIFIED_SELLERS_UNIT = (word: string) => `${word} ميدانياً`
export const KPI_TEAM_SALES_LABEL = 'إجمالي مبيعات الفريق (الشهر)'
export const KPI_TEAM_SALES_TARGET = (target: string) => `المستهدف: ${target} م. ج.م`
export const KPI_TARGET_ACHIEVEMENT_LABEL = 'نسبة تحقيق المستهدف'
export const KPI_TARGET_DAYS_REMAINING = (daysPhrase: string) => `باقي ${daysPhrase} للإغلاق`
export const KPI_REPS_STATUS_ACTIVE = 'نشط'
export const KPI_REPS_STATUS_SUSPENDED = 'قيد التعليق'
export const KPI_REPS_STATUS_VACATION = 'إجازة'
export const KPI_TEAM_SALES_GROWTH_SUFFIX = 'مقارنة بالماضي'
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
export const REP_CERTIFIED_SINCE = (year: number) => `معتمد منذ ${year}`
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
// R3-sellers-responsive: below xl the detail view replaces the list
// (URL-driven, ?rep=<id>) instead of sitting beside it — this is that view's
// back button, see context/ui-tokens.md.
export const REP_DETAIL_BACK = 'العودة إلى القائمة'

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
export const REP_PHOTO_URL_LABEL = 'صورة المندوب الشخصية (اختياري)'
export const REP_PHOTO_URL_PLACEHOLDER = 'اختر صورة المندوب من جهازك'
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

// Warehouses (Chunk 3)
export const WAREHOUSES_PAGE_TITLE = 'إدارة وإعداد المخازن والمستودعات'
export const WAREHOUSES_PAGE_SUBTITLE =
  'التحكم التشغيلي في الأرصدة البتروكيماوية، سعات التخزين الميدانية وحركات المناقلات اللوجستية'
export const WAREHOUSE_LIVE_SYNC = 'تزامن فوري'
export const WAREHOUSE_CALL_ACTION = 'اتصال بالطوارئ'
export const WAREHOUSES_EXPORT_BUTTON = 'تصدير تقرير المخزون (CSV)'
export const WAREHOUSES_ADD_BUTTON = '+ إضافة مخزن جديد'

export const KPI_WAREHOUSES_LABEL = 'المخازن'
export const KPI_WAREHOUSES_CENTERS = (count: number) => `${count} مراكز`
export const KPI_STOCK_BALANCE_LABEL = 'رصيد المنتجات والكيماويات'
export const KPI_STOCK_BALANCE_SUBTITLE = (codePhrase: string) =>
  `موزعة عبر ${codePhrase} منتج نشط`
export const PRODUCT_CODE_PLURAL_FORMS = {
  one: 'كود واحد',
  two: 'كودان',
  few: 'أكواد',
  many: 'كود',
}
export const KPI_TRANSFERS_CRITICAL_LABEL = 'مناقلات وأرصدة حرجة'
export const KPI_TRANSFERS_PENDING_UNIT = 'طلبات مناقلة معلقة'
export const TRANSFER_PENDING_PLURAL_FORMS = {
  one: 'طلب مناقلة معلق',
  two: 'طلبان معلقان',
  few: 'طلبات مناقلة معلقة',
  many: 'طلباً معلقاً',
}
export const TRANSFERS_PENDING_NONE = 'لا توجد طلبات معلقة'
export const WAREHOUSE_CENTER_PLURAL_FORMS = {
  one: 'مركز واحد',
  two: 'مركزان',
  few: 'مراكز',
  many: 'مركزاً',
}
export const KPI_TRANSFERS_ACTION_REQUIRED = 'يتطلب اعتماد مسؤول الإمداد اللوجستي'
export const WAREHOUSES_KPI_LOADING = 'جارِ تحميل مؤشرات المخازن...'
export const WAREHOUSES_KPI_ERROR = 'تعذر تحميل مؤشرات المخازن'

export const WAREHOUSES_SECTION_TITLE = 'المستودعات الإقليمية المعتمدة'
export const WAREHOUSES_FILTER_ALL = (count: number) => `الكل (${count})`
export const WAREHOUSES_FILTER_ACTIVE = (count: number) => `نشط (${count})`
export const WAREHOUSES_EMPTY = 'لا توجد مستودعات مطابقة'
export const WAREHOUSES_ERROR = 'تعذر تحميل المستودعات'
export const WAREHOUSES_LOADING = 'جارِ تحميل المستودعات...'

export const WAREHOUSE_CODE_LABEL = 'رمز المحطة:'
export const WAREHOUSE_CAPACITY_UNIT = 'بالتة'
export const WAREHOUSE_ADDRESS_LABEL = 'العنوان'
export const WAREHOUSE_SUPERVISOR_LABEL = 'أمين العهدة'
export const WAREHOUSE_CAPACITY_USED_LABEL = 'الطاقة المستغلة'
export const WAREHOUSE_LINKED_PRODUCTS_LABEL = 'المنتجات المربوطة'
export const WAREHOUSE_TOTAL_STOCK_LABEL = 'الرصيد الفعلي الإجمالي'
export const WAREHOUSE_STOCK_UNIT = 'وحدة'
export const WAREHOUSE_DISTRIBUTE_BUTTON = 'توزيع المنتجات'
export const WAREHOUSE_EDIT_TOOLTIP = 'تعديل بيانات المستودع'
export const WAREHOUSE_DELETE_TOOLTIP = 'حذف المستودع'

export const WAREHOUSE_STATUS_LABELS = {
  نشط: 'نشط',
  'جرد دوري': 'جرد دوري',
  معلق: 'معلق',
  صيانة: 'صيانة',
} as const

export const WAREHOUSE_FORM_TITLE_CREATE = 'إضافة مخزن جديد'
export const WAREHOUSE_FORM_TITLE_EDIT = (name: string) => `تعديل بيانات: ${name}`
export const WAREHOUSE_FORM_BADGE_CREATE = 'سجل جديد'
export const WAREHOUSE_FORM_BADGE_EDIT = 'تحديث مستودع قائم'
export const WAREHOUSE_FORM_SUBTITLE =
  'قم بتهيئة السجلات الجغرافية، تعيين أمين المستودع، وتحديد السقف الأعلى لاستيعاب المنصات لتجنب التكدس.'
export const WAREHOUSE_NAME_LABEL = 'اسم المستودع / الفرع'
export const WAREHOUSE_NAME_PLACEHOLDER = 'مثال: مستودع السويس اللوجستي'
export const WAREHOUSE_GOVERNORATE_LABEL = 'المحافظة الإقليمية'
export const WAREHOUSE_GOVERNORATE_PLACEHOLDER = 'اختر المحافظة من القائمة...'
export const WAREHOUSE_GOVERNORATE_OPTIONS = [
  { value: 'الشرقية', label: 'الشرقية (العاشر من رمضان / بلبيس)' },
  { value: 'المنوفية', label: 'المنوفية (مدينة السادات)' },
  { value: 'الإسكندرية', label: 'الإسكندرية (برج العرب / العامرية)' },
  { value: 'أسيوط', label: 'أسيوط (الصعيد والوجه القبلي)' },
  { value: 'القاهرة', label: 'القاهرة (حلوان / المرج / التجمع)' },
  { value: 'الجيزة', label: 'الجيزة (السادس من أكتوبر)' },
  { value: 'السويس', label: 'السويس (منطقة القناة)' },
] as const
export const WAREHOUSE_ADDRESS_FORM_LABEL = 'العنوان التفصيلي ومجمع المخازن'
export const WAREHOUSE_ADDRESS_PLACEHOLDER = 'رقم القطعة، المجمع الصناعي، علامة مميزة...'
export const WAREHOUSE_SUPERVISOR_NAME_LABEL = 'أمين العهدة المسؤول'
export const WAREHOUSE_SUPERVISOR_NAME_PLACEHOLDER = 'الاسم ثلاثي'
export const WAREHOUSE_EMERGENCY_PHONE_LABEL = 'هاتف الطوارئ'
export const WAREHOUSE_EMERGENCY_PHONE_PLACEHOLDER = '01000000000'
export const WAREHOUSE_CAPACITY_LABEL = 'السعة الاستيعابية'
export const WAREHOUSE_OCCUPIED_PALLETS_LABEL = 'المنصات المشغولة حالياً'
export const WAREHOUSE_CLASSIFICATION_LABEL = 'تصنيف التشغيل'
export const WAREHOUSE_CLASSIFICATION_OPTIONS = [
  'مستودع رئيسي',
  'توزيع محلي سريع',
  'كيماويات ومواد خام',
] as const
export const WAREHOUSE_ACTIVE_CHECKBOX_LABEL =
  'تنشيط المستودع فوراً وبدء استقبال الحركات المخزنية'
export const WAREHOUSE_FORM_SUBMIT_CREATE = 'حفظ وتثبيت المخزن'
export const WAREHOUSE_FORM_SUBMIT_EDIT = 'حفظ التعديلات الميدانية'
export const WAREHOUSE_FORM_RESET = 'تفريغ الحقول'
export const TOAST_WAREHOUSE_SAVED = 'تم حفظ بيانات المستودع بنجاح'

export const DELETE_WAREHOUSE_CONFIRM_TITLE = 'تأكيد حذف المستودع'
export const DELETE_WAREHOUSE_CONFIRM_DESCRIPTION =
  'سيتم حذف هذا المستودع نهائياً ولا يمكن التراجع عن هذا الإجراء.'
export const DELETE_WAREHOUSE_CONFIRM_BUTTON = 'حذف نهائي'
export const DELETE_WAREHOUSE_BLOCKED_TITLE = 'لا يمكن حذف هذا المستودع'
export const DELETE_WAREHOUSE_BLOCKED_MESSAGE =
  'قم بنقل الأرصدة أو تصفيتها أولاً'
export const TOAST_WAREHOUSE_DELETED = 'تم حذف المستودع بنجاح'

export const INVENTORY_SECTION_TITLE = 'توزيع المنتجات والكميات المخزنية'
export const INVENTORY_SECTION_SUBTITLE =
  'مراقبة الأرصدة المتوفرة، تعديل حد الطلب، وإسناد مواقع التخزين الداخلية (الممر والبالتة)'
export const INVENTORY_SEARCH_PLACEHOLDER = 'بحث باسم المنتج أو الكود...'
export const INVENTORY_ASSIGN_BUTTON = '+ تخصيص منتج للمخزن'
export const INVENTORY_COL_PRODUCT = 'المنتج والتوصيف الفني'
export const INVENTORY_COL_SKU = 'كود الصنف (SKU)'
export const INVENTORY_COL_PACKAGING = 'وحدة التعبئة'
export const INVENTORY_COL_BIN = 'موقع الرف والتخزين'
export const INVENTORY_COL_STOCK = 'الرصيد الفعلي الحالي'
export const INVENTORY_COL_REORDER = 'حد إعادة الطلب'
export const INVENTORY_COL_STATUS = 'حالة التوفر'
export const INVENTORY_COL_ACTIONS = 'إجراءات'
export const INVENTORY_REORDER_UNIT_SUFFIX = (unitWord: string) => `${unitWord}`
export const INVENTORY_CRITICAL_SUFFIX = 'فقط!'
export const INVENTORY_EMPTY = 'لا توجد أصناف مخزنة في هذا المستودع'
export const INVENTORY_ERROR = 'تعذر تحميل بيانات المخزون'
export const INVENTORY_LOADING = 'جارِ تحميل المخزون...'
export const INVENTORY_FOOTER = (
  shown: number,
  total: number,
  productWord: string,
) => `عرض ${shown} أصناف من أصل ${total} ${productWord} مخزناً داخل المستودع المحدد`
export const INVENTORY_UPDATE_TOOLTIP = 'تحديث الرصيد الفوري'
export const INVENTORY_TRANSFER_TOOLTIP = 'نقل إلى مخزن آخر'
export const INVENTORY_URGENT_TRANSFER_TOOLTIP = 'طلب توريد عاجل من مستودع آخر'
export const INVENTORY_FILTER_ALL = 'الكل'
export const INVENTORY_FILTER_CRITICAL = 'رصيد حرج'
export const INVENTORY_FILTER_AVAILABLE = 'متوفر بكفاية'
export const INVENTORY_CRITICAL_BADGE = 'رصيد حرج!'
export const INVENTORY_BELOW_REORDER_NOTE = (limit: number, unit: string) =>
  `المتبقي أقل من حد الأمان (${limit} ${unit})`
export const INVENTORY_REQUEST_TRANSFER = 'طلب مناقلة'
export const INVENTORY_ADJUST_STOCK = 'تعديل الرصيد'

export const ASSIGN_PRODUCT_TITLE = (warehouseName: string) =>
  `إسناد منتج أو خامة لمستودع ${warehouseName}`
export const ASSIGN_PRODUCT_SELECT_LABEL = 'اختر صنف الدهان / الكيماويات'
export const ASSIGN_PRODUCT_STOCK_LABEL = 'الرصيد المبدئي (وحدات)'
export const ASSIGN_PRODUCT_REORDER_LABEL = 'حد تنبيه إعادة الطلب'
export const ASSIGN_PRODUCT_BIN_LABEL = 'الموقع الداخلي (الرف/الممر)'
export const ASSIGN_PRODUCT_SKU_LABEL = 'كود الصنف (SKU) (اختياري)'
export const ASSIGN_PRODUCT_PACKAGING_LABEL = 'وحدة التعبئة (اختياري)'
export const ASSIGN_PRODUCT_SUBMIT = 'تأكيد التخصيص للمستودع'
export const ASSIGN_PRODUCT_SUBMIT_UPDATE = 'تحديث التخصيص'
export const ASSIGN_PRODUCT_OVERWRITE_TITLE = 'تأكيد استبدال الرصيد'
export const ASSIGN_PRODUCT_OVERWRITE_MESSAGE = (current: number, next: number) =>
  `سيتم استبدال الرصيد الحالي (${current}) بـ ${next}`
export const ASSIGN_PRODUCT_TRUNCATED_NOTE =
  'تم عرض أول 500 منتج فقط — استخدم البحث لتضييق النتائج'
export const TOAST_PRODUCT_ASSIGNED = 'تم تخصيص المنتج داخل المستودع بنجاح'

export const EDIT_INVENTORY_ITEM_TITLE = 'تحديث بيانات الصنف المخزني'
export const EDIT_INVENTORY_ITEM_SUBMIT = 'حفظ التحديث'
export const TOAST_INVENTORY_ITEM_UPDATED = 'تم تحديث بيانات الصنف المخزني بنجاح'

export const TRANSFER_MODAL_TITLE = 'إنشاء إذن مناقلة بين المستودعات'
export const TRANSFER_FROM_LABEL = 'من مستودع (المصدر):'
export const TRANSFER_TO_LABEL = 'إلى مستودع (الوجهة):'
export const TRANSFER_PRODUCT_LABEL = 'المنتج المراد نقله:'
export const TRANSFER_QUANTITY_LABEL = 'الكمية المنقولة:'
export const TRANSFER_DRIVER_LABEL = 'رقم سيارة النقل / السائق:'
export const TRANSFER_SUBMIT = 'إنشاء إذن المناقلة'
export const TOAST_TRANSFER_CREATED = (code: string) =>
  `تم إنشاء إذن المناقلة رقم ${code} بنجاح`
export const VALIDATION_TRANSFER_SAME_WAREHOUSE = 'يجب اختيار مستودعين مختلفين'
export const VALIDATION_TRANSFER_PRODUCT_REQUIRED = 'يجب اختيار منتج للنقل'
export const VALIDATION_TRANSFER_QUANTITY_INVALID = 'الكمية يجب أن تكون عدداً صحيحاً أكبر من صفر'
export const VALIDATION_TRANSFER_QUANTITY_EXCEEDS = (available: number) =>
  `الكمية المتاحة في المستودع المصدر: ${available} فقط`

export const TRANSFERS_DIALOG_TITLE = 'طلبات المناقلة بين المستودعات'
export const TRANSFERS_DIALOG_CLOSE = 'إغلاق'
export const TRANSFERS_COL_CODE = 'رقم الإذن'
export const TRANSFERS_COL_ROUTE = 'من / إلى'
export const TRANSFERS_COL_ITEMS = 'الأصناف'
export const TRANSFERS_COL_DATE = 'التاريخ'
export const TRANSFERS_COL_STATUS = 'الحالة'
export const TRANSFERS_COL_ACTIONS = 'إجراءات'
export const TRANSFER_STATUS_LABELS = {
  pending: 'بانتظار الاعتماد',
  approved: 'معتمدة',
  completed: 'مكتملة',
  cancelled: 'ملغاة',
  rejected: 'مرفوضة',
} as const
export const TRANSFER_COMPLETE_ACTION = 'اعتماد وتنفيذ المناقلة'
export const TRANSFER_REJECT_ACTION = 'رفض الطلب'
export const TRANSFER_STOCK_MOVED_NOTE = 'تم تنفيذ حركة المخزون'
export const TRANSFERS_EMPTY = 'لا توجد طلبات مناقلة'
export const TRANSFERS_ERROR = 'تعذر تحميل طلبات المناقلة'
export const TRANSFERS_LOADING = 'جارِ تحميل طلبات المناقلة...'
export const TOAST_TRANSFER_UPDATED = 'تم تحديث حالة المناقلة بنجاح'
export const TRANSFER_STALE_ERROR =
  'تم تحديث حالة هذا الطلب من جهة أخرى، يرجى إعادة الفتح والمحاولة مجدداً'
export const TRANSFER_NOT_FOUND_ERROR = 'طلب المناقلة لم يعد موجوداً'

export const CSV_REPORT_FILENAME_PREFIX = 'warehouse-inventory-report'
export const CSV_REPORT_HEADERS = [
  'اسم المستودع',
  'كود المستودع',
  'المحافظة',
  'أمين العهدة',
  'اسم المنتج',
  'كود الصنف',
  'التصنيف',
  'موقع التخزين',
  'وحدة التعبئة',
  'الرصيد الحالي',
  'حد إعادة الطلب',
  'حالة التوفر',
] as const

// Validation messages
export const VALIDATION_WAREHOUSE_NAME_REQUIRED = 'اسم المستودع / الفرع مطلوب'
export const VALIDATION_WAREHOUSE_GOVERNORATE_REQUIRED = 'المحافظة الإقليمية مطلوبة'
export const VALIDATION_WAREHOUSE_ADDRESS_REQUIRED = 'العنوان التفصيلي مطلوب'
export const VALIDATION_WAREHOUSE_CAPACITY_MIN = 'السعة يجب أن تكون على الأقل 1 بالتة'
export const VALIDATION_MUST_BE_WHOLE_NUMBER = 'يجب أن يكون الرقم صحيحاً (بدون كسور)'
export const VALIDATION_ASSIGN_PRODUCT_REQUIRED = 'يجب اختيار منتج'
export const VALIDATION_ASSIGN_STOCK_NEGATIVE = 'الرصيد لا يمكن أن يكون سالباً'
export const VALIDATION_ASSIGN_REORDER_NEGATIVE = 'حد إعادة الطلب لا يمكن أن يكون سالباً'

export const VALIDATION_PRODUCT_NAME_REQUIRED = 'اسم المنتج التجاري مطلوب'
export const VALIDATION_PRODUCT_CATEGORY_REQUIRED = 'التصنيف الرئيسي مطلوب'
export const VALIDATION_PRODUCT_WAREHOUSE_REQUIRED = 'يرجى تحديد المستودع المستهدف'
export const VALIDATION_QUANTITY_NEGATIVE = 'الكمية لا يمكن أن تكون سالبة'
export const VALIDATION_MIN_STOCK_NEGATIVE = 'الحد لا يمكن أن يكون سالباً'
export const VALIDATION_PACKAGES_MIN = 'يجب إدخال سعر وحدة واحدة على الأقل'
export const VALIDATION_CATEGORY_NAME_REQUIRED = 'اسم التصنيف بالعربية مطلوب'
export const VALIDATION_GALON_PRICE_REQUIRED = 'السعر الأساسي للجالون مطلوب'
export const VALIDATION_BESTELA_PRICE_REQUIRED = 'السعر الأساسي للبستلة مطلوب'
export const VALIDATION_DISCOUNT_NEGATIVE = 'الخصم لا يمكن أن يكون سالباً'
export const VALIDATION_DISCOUNT_MAX = 'الخصم لا يمكن أن يتجاوز 100%'

// Analytics (Step 5)
export const ANALYTICS_PAGE_TITLE = 'التقارير والإحصائيات التنفيذية'
export const ANALYTICS_PAGE_SUBTITLE =
  'لوحة المؤشرات التشغيلية والمالية الشاملة - مراقبة الإيرادات، كفاءة التحصيل، حركة المخزون، وأداء القطاعات'
export const ANALYTICS_LIVE_PULSE = 'محدث آنياً'
export const ANALYTICS_EXPORT_CSV = 'تصدير تقرير شامل (CSV)'
export const ANALYTICS_PRINT_REPORT = 'طباعة التقرير'

export const ANALYTICS_PERIOD_TODAY = 'اليوم'
export const ANALYTICS_PERIOD_WEEK = 'هذا الأسبوع'
export const ANALYTICS_PERIOD_MONTH = 'هذا الشهر'
export const ANALYTICS_PERIOD_QUARTER = 'الربع السنوي'
export const ANALYTICS_PERIOD_YEAR = 'هذا العام'

export const ANALYTICS_KPI_REVENUE = 'إجمالي المبيعات والإيرادات'
export const ANALYTICS_KPI_COLLECTIONS = 'إجمالي التحصيلات المعتمدة'
export const ANALYTICS_KPI_REMAINING = 'المتبقي والذمم المدينة'
export const ANALYTICS_KPI_EFFICIENCY = 'معدل كفاءة التحصيل'
export const ANALYTICS_KPI_OVERDUE = 'المستحقات المتأخرة والحرجة'
export const ANALYTICS_KPI_ORDERS = 'إجمالي الفواتير النشطة'

export const ANALYTICS_CHART_TITLE = 'حركة الإيرادات والتحصيلات'
export const ANALYTICS_CHART_SUBTITLE = 'تطور المبيعات النقدية والآجلة والتحصيلات خلال الأشهر الأخيرة'
export const ANALYTICS_SECTORS_TITLE = 'توزيع المبيعات حسب القطاعات والمحافظات'
export const ANALYTICS_SECTORS_SUBTITLE = 'الحصة السوقية وحجم الطلبات الميدانية عبر المناطق اللوجستية'
export const ANALYTICS_TOP_PRODUCTS_TITLE = 'المنتجات الأكثر مبيعاً وطلباً'
export const ANALYTICS_TOP_PRODUCTS_SUBTITLE = 'الأصناف الأعلى إيراداً وحركة بالمستودعات'
export const ANALYTICS_SELLERS_TITLE = 'لوحة شرف وأداء المناديب الميدانيين'
export const ANALYTICS_SELLERS_SUBTITLE = 'معدلات تحقيق المستهدف الشهري ونسب التحصيل الميداني'
export const ANALYTICS_PAYMENT_METHODS_TITLE = 'قنوات وطرق السداد'
export const ANALYTICS_PAYMENT_METHODS_SUBTITLE = 'توزيع السيولة عبر القنوات البنكية والنقدية'

export const ANALYTICS_LOADING = 'جارِ تحليل البيانات واستخراج التقارير...'
export const ANALYTICS_ERROR = 'تعذر تحميل مؤشرات التحليل المالي والتشغيلي'


