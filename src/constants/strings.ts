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
