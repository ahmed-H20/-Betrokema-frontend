import { useState, useMemo } from 'react'
import {
  useWarehouses,
  useWarehouseInventory,
  useWarehouseStats,
} from '@/features/warehouses/hooks'
import { formatNumber } from '@/lib/format'
import { SellerCreateInvoiceModal } from './components/SellerCreateInvoiceModal'
import type { Warehouse } from '@/api/warehouses.schema'

export function SellerWarehousesPage() {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'critical'>('all')
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)

  // 1. Fetch real warehouses and stats
  const { data: warehousesResponse, isLoading: isLoadingWarehouses } = useWarehouses()
  const { data: warehouseStats } = useWarehouseStats()
  const warehouses = warehousesResponse?.data || []

  // Ensure an active warehouse is always selected
  const activeWarehouse: Warehouse | undefined = useMemo(() => {
    if (warehouses.length === 0) return undefined
    if (selectedWarehouseId) {
      const found = warehouses.find((w) => w._id === selectedWarehouseId)
      if (found) return found
    }
    return warehouses[0]
  }, [warehouses, selectedWarehouseId])

  const activeWarehouseId = activeWarehouse?._id

  // 2. Fetch real inventory for selected warehouse
  const {
    data: inventoryResponse,
    isLoading: isLoadingInventory,
  } = useWarehouseInventory(activeWarehouseId, {
    search: search.trim() || undefined,
    status: stockFilter === 'all' ? undefined : stockFilter,
  })

  const inventoryItems = inventoryResponse?.data || []

  // Filter items in memory if search or status filter active
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        item.productName.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        (item.binLocation && item.binLocation.toLowerCase().includes(q))

      const matchesStatus =
        stockFilter === 'all' ||
        (stockFilter === 'available' && !item.isCritical && item.currentStock > item.reorderLevel) ||
        (stockFilter === 'critical' && (item.isCritical || item.currentStock <= item.reorderLevel))

      return matchesSearch && matchesStatus
    })
  }, [inventoryItems, search, stockFilter])

  // Total stock units in active warehouse
  const totalUnitsInActiveWh = useMemo(() => {
    return inventoryItems.reduce((acc, curr) => acc + (curr.currentStock || 0), 0)
  }, [inventoryItems])

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto w-full md:max-w-4xl pb-16">
      {/* 1. Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              خريطة المستودعات والجاهزية الفورية
            </h2>
            <p className="text-xs text-slate-500">
              فحص أرصدة الدهانات والكيماويات المتاحة للتسليم الفوري بالجمهورية
            </p>
          </div>
          <span className="text-xs bg-orange-50 text-orange-700 font-bold px-2.5 py-1 rounded-full border border-orange-200 shrink-0">
            {warehouses.length} مستودعات
          </span>
        </div>
      </div>

      {/* 2. Top KPI Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">إجمالي المخزون</span>
            <span className="material-symbols-outlined text-[18px] text-orange-600">
              inventory
            </span>
          </div>
          <div className="mt-2">
            <div className="text-sm sm:text-base font-bold text-slate-900 font-mono">
              {formatNumber(warehouseStats?.stockAndChemicals.totalUnits || totalUnitsInActiveWh || 5240)}
            </div>
            <span className="text-[10px] text-slate-400">عبوة وبستلة جاهزة</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">المستودع النشط</span>
            <span className="material-symbols-outlined text-[18px] text-emerald-600">
              verified
            </span>
          </div>
          <div className="mt-2">
            <div className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {activeWarehouse?.governorate || 'الشرقية'}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">
              {activeWarehouse?.status || 'جاهز للشحن'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">سعة الإشغال</span>
            <span className="material-symbols-outlined text-[18px] text-blue-600">
              pallet
            </span>
          </div>
          <div className="mt-2">
            <div className="text-sm sm:text-base font-bold text-slate-900 font-mono">
              {activeWarehouse?.occupancyRate || 65}%
            </div>
            <span className="text-[10px] text-slate-400">
              {formatNumber(activeWarehouse?.capacityPallets || 1200)} باليت
            </span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Horizontal Warehouse Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-orange-600">
            warehouse
          </span>
          <span>اختر المستودع لفحص بضائعه:</span>
        </label>

        {isLoadingWarehouses ? (
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {warehouses.map((wh) => {
              const isSelected = wh._id === activeWarehouseId
              return (
                <button
                  key={wh._id}
                  type="button"
                  onClick={() => setSelectedWarehouseId(wh._id)}
                  className={`px-3.5 py-2.5 rounded-2xl text-right transition-all shrink-0 flex flex-col gap-1 border ${isSelected
                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/20 scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50'
                    }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold truncate max-w-[170px]">
                      {wh.name}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'
                        }`}
                    />
                  </div>
                  <div
                    className={`flex items-center gap-2 text-[10px] ${isSelected ? 'text-orange-100' : 'text-slate-500'
                      }`}
                  >
                    <span className="font-semibold">{wh.governorate}</span>
                    <span>•</span>
                    <span className="font-mono">{wh.code}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. Active Warehouse Detailed Card with Supervisor & Location */}
      {activeWarehouse && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                <span className="material-symbols-outlined text-[24px]">
                  storefront
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {activeWarehouse.status || 'نشط'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                    {activeWarehouse.code}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {activeWarehouse.operatingClassification || 'مستودع رئيسي مركزي'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1 truncate">
                  {activeWarehouse.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <span className="material-symbols-outlined text-[14px] text-slate-400 shrink-0">
                    location_on
                  </span>
                  <span className="truncate">
                    {activeWarehouse.address} ({activeWarehouse.governorate})
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Call to Supervisor Button */}
            {(activeWarehouse.supervisorPhone || activeWarehouse.emergencyPhone) && (
              <a
                href={`tel:${activeWarehouse.supervisorPhone || activeWarehouse.emergencyPhone}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition-colors shrink-0"
                title="الاتصال بأمين المستودع"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                <span className="hidden sm:inline">أمين المخزن</span>
              </a>
            )}
          </div>

          {/* Supervisor Information and Capacity Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl">
              <span className="material-symbols-outlined text-[18px] text-orange-600">
                person
              </span>
              <div>
                <span className="text-slate-400 block text-[10px]">المشرف المسئول:</span>
                <strong className="text-slate-800 font-bold">
                  {activeWarehouse.supervisorName || 'م. أمين المستودع'}
                </strong>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-medium">إشغال المساحة التخزينية</span>
                <span className="font-bold text-slate-900">
                  {activeWarehouse.occupancyRate || 65}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, activeWarehouse.occupancyRate || 65)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Inventory Search and Filter Chips */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-orange-600">
              format_paint
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              أصناف الطلاء والكيماويات بالمستودع
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {filteredItems.length} صنف متاح
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم المنتج، كود SKU، أو موقع الرف..."
            className="w-full pr-10 pl-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500 shadow-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'جميع الأصناف' },
            { id: 'available', label: 'جاهز للشحن الفوري' },
            { id: 'critical', label: 'مخزون حرج / قارب على النفاد' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStockFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${stockFilter === tab.id
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Enriched Real Inventory Product Cards */}
      <div className="flex flex-col gap-3">
        {isLoadingInventory ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-100">
            جاري فحص وتحديث أرصدة المخزون الفعلي...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 space-y-2">
            <span className="material-symbols-outlined text-[36px] text-slate-300">
              inventory_2
            </span>
            <p className="text-xs text-slate-600 font-bold">لا توجد أصناف مطابقة للبحث</p>
            <p className="text-[11px] text-slate-400">
              جرب تغيير كلمات البحث أو تغيير المستودع المختار
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isCritical = item.isCritical || item.currentStock <= item.reorderLevel
            const stockUnits = item.packagingUnit || 'عبوة'

            return (
              <article
                key={item._id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3 transition-transform active:scale-[0.99]"
              >
                {/* Product Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                      <span className="material-symbols-outlined text-[24px]">
                        format_paint
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.sku}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCritical
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                        >
                          {isCritical ? 'رصيد حرج (قارب على النفاد)' : 'متوفر للشحن'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1 leading-snug truncate">
                        {item.productName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="bg-slate-50 px-2 py-0.5 rounded text-[11px] text-slate-700 font-medium">
                          {item.packagingUnit || 'بستلة 14 لتر'}
                        </span>
                        {item.binLocation && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-600 font-mono">
                            <span className="material-symbols-outlined text-[14px] text-slate-400">
                              shelves
                            </span>
                            الرف: {item.binLocation}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Level Details and Reorder Bar */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">الرصيد الفعلي الحالي:</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {formatNumber(item.currentStock)}{' '}
                      <span className="text-xs font-normal text-slate-500">{stockUnits}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>حد إعادة الطلب: {formatNumber(item.reorderLevel)} {stockUnits}</span>
                    <span>
                      {item.stockStatus || (isCritical ? 'يلزم التوريد' : 'مخزون مستقر')}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isCritical ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(10, Math.round((item.currentStock / (item.reorderLevel * 2 || 1)) * 100))
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Action Buttons: Fast Invoice & Reserve */}
                <div className="grid grid-cols-1 gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsInvoiceModalOpen(true)
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      add_shopping_cart
                    </span>
                    <span>+ إصدار فاتورة</span>
                  </button>
                </div>
              </article>
            )
          })
        )}
      </div>

      {/* Invoice Creation Modal */}
      <SellerCreateInvoiceModal
        open={isInvoiceModalOpen}
        onOpenChange={setIsInvoiceModalOpen}
      />
    </div>
  )
}
