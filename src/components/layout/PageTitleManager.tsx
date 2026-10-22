import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ROUTE_TITLES: Record<string, string> = {
  '/login': 'تسجيل الدخول | بتروكيما',
  '/products': 'إدارة المنتجات والمخزون | بتروكيما',
  '/invoices': 'فواتير المبيعات وأوامر التوريد | بتروكيما',
  '/sellers': 'إدارة المندوبين والمبيعات | بتروكيما',
  '/warehouses': 'إدارة المستودعات والمخازن | بتروكيما',
  '/analytics': 'التحليلات والتقارير المالية | بتروكيما',
  '/seller': 'بوابة المندوب الميداني | بتروكيما',
  '/seller/dashboard': 'لوحة تحكم المندوب الميداني | بتروكيما',
  '/seller/clients': 'شبكة العملاء والموزعين | بتروكيما',
  '/seller/invoices': 'فواتير المبيعات الميدانية | بتروكيما',
  '/seller/warehouses': 'أرصدة المستودعات والمخازن | بتروكيما',
  '/client': 'بوابة العملاء | بتروكيما',
  '/client/catalog': 'كتالوج المنتجات والأسعار | بتروكيما',
  '/client/invoices': 'سجل فواتيري وسندات السداد | بتروكيما',
  '/client/profile': 'الملف الشخصي والبيانات | بتروكيما',
}

export function PageTitleManager() {
  const location = useLocation()

  useEffect(() => {
    const pathname = location.pathname

    if (ROUTE_TITLES[pathname]) {
      document.title = ROUTE_TITLES[pathname]
      return
    }

    if (pathname.startsWith('/seller/clients/')) {
      document.title = 'ملف العميل والفواتير | بتروكيما'
      return
    }

    if (pathname.startsWith('/client')) {
      document.title = 'بوابة العملاء | بتروكيما'
      return
    }

    if (pathname.startsWith('/seller')) {
      document.title = 'بوابة المندوب الميداني | بتروكيما'
      return
    }

    document.title = 'شركة بتروكيما للدهانات الحديثة'
  }, [location])

  return null
}
