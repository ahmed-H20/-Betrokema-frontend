import React, { createContext, useContext, useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { formatNumber } from '@/lib/format'
import { toast } from 'sonner'
import { useCreateInvoice } from '@/features/invoices/hooks'
import { useAuth } from '@/features/auth/AuthContext'
import type { Product } from '@/api/products.schema'
import { resolveImageUrl } from '@/lib/image'

export interface CartItem {
  productId: string
  productName: string
  productCode: string
  image?: string
  packageIndex: number
  unitName: string
  weight?: string
  colorName?: string
  colorHex?: string
  colorPrice?: number
  price: number
  quantity: number
  giftText?: string
  giftImage?: string
  giftWeight?: string
}

interface ClientCartContextType {
  cart: CartItem[]
  addToCart: (
    product: Product,
    packageIndex: number,
    quantity?: number,
    selectedColor?: { name: string; hex?: string; price?: number },
  ) => void
  updateQuantity: (
    productId: string,
    packageIndex: number,
    delta: number,
    colorName?: string,
  ) => void
  removeFromCart: (
    productId: string,
    packageIndex: number,
    colorName?: string,
  ) => void
  clearCart: () => void
  totalCount: number
  subtotal: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const ClientCartContext = createContext<ClientCartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'petrokema_client_cart'

export function ClientCartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createInvoiceMutation = useCreateInvoice()

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (e) {
      console.error('Failed to save cart to localStorage', e)
    }
  }, [cart])

  const addToCart = (
    product: Product,
    packageIndex: number,
    quantity = 1,
    selectedColor?: { name: string; hex?: string; price?: number },
  ) => {
    const pkg = product.packages[packageIndex]
    const unitName = pkg?.unitName || 'عبوة'
    const colorExtra = selectedColor?.price || 0
    const price = (pkg?.price || 0) + colorExtra
    const weight = pkg?.weight || ''
    const colorName = selectedColor?.name || ''
    const colorHex = selectedColor?.hex || ''
    const productGift = (product as any).gift || {}
    const giftName =
      productGift.name ||
      product.giftTitle ||
      (typeof product.giftProduct === 'object' && product.giftProduct !== null
        ? product.giftProduct.name
        : '')
    const giftImage =
      productGift.image ||
      (typeof product.giftProduct === 'object' && product.giftProduct !== null
        ? product.giftProduct.image
        : '')
    const giftWeight =
      productGift.weight ||
      (typeof product.giftProduct === 'object' && product.giftProduct !== null
        ? (product.giftProduct as any).packages?.[0]?.weight || ''
        : '')

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === product._id &&
          item.packageIndex === packageIndex &&
          (item.colorName || '') === colorName,
      )

      if (existingIndex > -1) {
        const updated = [...prev]
        updated[existingIndex].quantity += quantity
        return updated
      }

      return [
        ...prev,
        {
          productId: product._id,
          productName: product.name,
          productCode: product.code || '',
          image: product.image || (product.images && product.images[0]) || '',
          packageIndex,
          unitName,
          weight,
          colorName: colorName || undefined,
          colorHex: colorHex || undefined,
          colorPrice: colorExtra,
          price,
          quantity,
          giftText: giftName || undefined,
          giftImage: giftImage || undefined,
          giftWeight: giftWeight || undefined,
        },
      ]
    })

    const colorDesc = colorName ? ` - لون: ${colorName}` : ''
    toast.success(`تمت إضافة "${product.name} (${unitName}${colorDesc})" إلى سلة الطلبات`)
  }

  const updateQuantity = (
    productId: string,
    packageIndex: number,
    delta: number,
    colorName = '',
  ) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (
            item.productId === productId &&
            item.packageIndex === packageIndex &&
            (item.colorName || '') === colorName
          ) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    })
  }

  const removeFromCart = (
    productId: string,
    packageIndex: number,
    colorName = '',
  ) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.packageIndex === packageIndex &&
            (item.colorName || '') === colorName
          ),
      ),
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return

    setIsSubmitting(true)
    try {
      const clientProfile = (user as any)?.clientProfile
      const clientId =
        clientProfile?._id ||
        (typeof clientProfile === 'string' ? clientProfile : undefined) ||
        user?.id ||
        ''

      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unit: item.weight ? `${item.unitName} (${item.weight})` : item.unitName,
        color: item.colorName || '',
        price: item.price,
        totalPrice: item.price * item.quantity,
      }))

      const giftsList = cart
        .filter((c) => c.giftText)
        .map((c) => `${c.productName}: (${c.giftText} × ${c.quantity})`)
      const giftsNote = giftsList.length > 0 ? ` [هدايا معتمدة: ${giftsList.join(', ')}]` : ''

      await createInvoiceMutation.mutateAsync({
        client: clientId,
        warehouse: 'مستودع العاشر من رمضان الرئيسي',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        products: items,
        taxAmount: 0,
        notes: deliveryNotes
          ? `طلب عميل إلكتروني: ${deliveryNotes}${giftsNote}`
          : `طلب عميل من كتالوج بتروكيما الميداني${giftsNote}`,
      })

      toast.success('تم إرسال أمر التوريد والطلبية بنجاح! جاري التجهيز بالمستودع')
      clearCart()
      setIsCartOpen(false)
      setDeliveryNotes('')
    } catch (err: any) {
      toast.error(err.message || 'تعذر تأكيد الطلب، يرجى المحاولة مرة أخرى')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ClientCartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}

      {/* Cart Drawer / Modal */}
      <Dialog.Root open={isCartOpen} onOpenChange={setIsCartOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col h-[85dvh] max-h-[85dvh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl bg-[#f8fafc] shadow-2xl transition-all sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                </div>
                <div>
                  <Dialog.Title className="text-base font-bold text-slate-900 leading-tight">
                    سلة طلبات الدهانات
                  </Dialog.Title>
                  <span className="text-xs text-slate-500">
                    {totalCount} صنف مختار
                  </span>
                </div>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 overscroll-contain pb-6">
              {cart.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <span className="material-symbols-outlined text-[48px] text-slate-300">
                    remove_shopping_cart
                  </span>
                  <p className="text-sm font-bold text-slate-700">السلة فارغة حالياً</p>
                  <p className="text-xs text-slate-500">
                    تصفح كتالوج المنتجات واضغط "اطلب الآن" لإضافة الأصناف
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {cart.map((item) => (
                    <div
                      key={`${item.productId}-${item.packageIndex}-${item.colorName || 'def'}`}
                      className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {item.productName}
                        </h4>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5 text-[11px] text-slate-500">
                          <span className="font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                            {item.unitName} {item.weight ? `(${item.weight})` : ''}
                          </span>
                          {item.colorName && (
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
                                style={{ backgroundColor: item.colorHex || '#FFFFFF' }}
                              />
                              <span>{item.colorName}</span>
                              {item.colorPrice && item.colorPrice > 0 ? (
                                <span className="text-[9px] text-orange-600 font-mono">
                                  (+{formatNumber(item.colorPrice)})
                                </span>
                              ) : null}
                            </span>
                          )}
                          <span>{formatNumber(item.price)} ج.م / العبوة</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 font-mono mt-1 block">
                          الإجمالي: {formatNumber(item.price * item.quantity)} ج.م
                        </span>
                        {item.giftText && (
                          <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-amber-900 bg-amber-50/90 border border-amber-200/90 p-1.5 rounded-xl">
                            {item.giftImage ? (
                              <img
                                src={resolveImageUrl(item.giftImage)}
                                alt={item.giftText}
                                className="w-8 h-8 rounded-lg object-cover border border-amber-200 shrink-0 bg-white"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-[17px] text-amber-600 shrink-0">
                                featured_seasonal_and_gifts
                              </span>
                            )}
                            <div className="min-w-0 flex-1">
                              <span className="block truncate font-bold">🎁 هدية: {item.giftText}</span>
                              {item.giftWeight && (
                                <span className="text-[9px] text-amber-700 font-normal block">الوزن: {item.giftWeight}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.packageIndex, -1, item.colorName)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-bold text-xs font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.packageIndex, 1, item.colorName)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.packageIndex, item.colorName)}
                          className="w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center mr-1"
                          title="حذف"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Notes Input */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ملاحظات التوصيل أو الموقع
                    </label>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="ملاحظات موقع المشروع، موعد التسليم المفضل..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            {cart.length > 0 && (
              <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white/95 backdrop-blur-md shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] space-y-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-700">إجمالي الطلبية المبدئي:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-orange-600 font-mono">
                      {formatNumber(subtotal)}
                    </span>
                    <span className="text-xs text-slate-500">ج.م</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-700 via-orange-600 to-orange-500 hover:from-orange-800 hover:to-orange-600 active:scale-[0.98] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all disabled:opacity-70"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  <span>{isSubmitting ? 'جاري إرسال الطلب...' : 'تأكيد وإرسال أمر التوريد للمستودع'}</span>
                </button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ClientCartContext.Provider>
  )
}

export function useClientCart() {
  const context = useContext(ClientCartContext)
  if (!context) {
    throw new Error('useClientCart must be used within a ClientCartProvider')
  }
  return context
}
