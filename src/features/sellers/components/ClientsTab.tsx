import { createColumnHelper, FlexRender, tableFeatures, useTable } from '@tanstack/react-table'
import { useState, useMemo } from 'react'
import type { Client, ClientPaymentStatus } from '@/api/clients.schema'
import { StateMessage } from '@/components/ui/StateMessage'
import { StatusPill, type StatusPillTone } from '@/components/ui/StatusPill'
import {
  CLIENTS_ADD_BUTTON,
  CLIENTS_COL_CONTACT,
  CLIENTS_COL_CREDIT,
  CLIENTS_COL_DEBT,
  CLIENTS_COL_NAME,
  CLIENTS_COL_STATUS,
  CLIENTS_EMPTY,
  CLIENTS_ERROR,
  CLIENTS_LOADING,
  CLIENTS_TAB_SUBTITLE,
  CLIENTS_TAB_TITLE,
  CLIENT_STATUS_LABELS,
  CLIENT_STATUS_UNKNOWN,
} from '@/constants/strings'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useClientsForSeller } from '@/features/sellers/hooks'
import { AddClientModal } from '@/features/sellers/components/AddClientModal'
import { resetClientPassword } from '@/api/clients'
import {
  AccountCredentialsModal,
  type AccountCredentials,
} from '@/components/ui/AccountCredentialsModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ClientInvoicesModal } from '@/features/sellers/components/ClientInvoicesModal'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { toast } from 'sonner'

const CLIENT_STATUS_TONE: Record<ClientPaymentStatus, StatusPillTone> = {
  regular: 'success',
  over_credit: 'error',
  excellent: 'success',
  settled: 'neutral',
}

// The backend only recalculates `paymentStatus` to "over_credit" when
// creditLimit and currentDebt are sent together in the same credit-debt
// update — a debt raised on its own (as this app's own test-data seeding
// does) leaves a stale paymentStatus behind. Derive the real state from the
// numbers themselves rather than trusting a value that can silently drift.
function effectiveStatus(client: Client): ClientPaymentStatus | 'unknown' {
  if (client.currentDebt > client.creditLimit) return 'over_credit'
  return client.paymentStatus
}

// Below md: one card per client instead of a table row, following
// petrokema_admin_2's client-card shape (icon tile, name+status header,
// contact row, 2-col financial grid) — its own "quick order"/"client
// history" action buttons aren't included since neither feature exists in
// this app yet (see context/ui-tokens.md).
function ClientCard({
  client,
  onResetPassword,
  onViewInvoices,
}: {
  client: Client
  onResetPassword?: (client: Client) => void
  onViewInvoices?: (client: Client) => void
}) {
  const status = effectiveStatus(client)
  const label = status === 'unknown' ? CLIENT_STATUS_UNKNOWN : CLIENT_STATUS_LABELS[status]
  const tone = status === 'unknown' ? 'neutral' : CLIENT_STATUS_TONE[status]
  const overCredit = client.currentDebt > client.creditLimit
  const subtitle = [client.address, client.city].filter(Boolean).join(' · ')
  const cleanPhone = client.phone.replace(/\D/g, '')
  const creditPercent =
    client.creditLimit > 0
      ? Math.min(100, Math.round((client.currentDebt / client.creditLimit) * 100))
      : 0

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-primary">
            <span className="material-symbols-outlined text-[24px]">apartment</span>
          </div>
          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="font-headline-sm truncate text-headline-sm font-bold text-primary">
                {client.organizeName}
              </h3>
              {client.commercialType && (
                <span className="rounded-full bg-secondary-fixed px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-secondary-fixed">
                  {client.commercialType}
                </span>
              )}
            </div>
            {subtitle ? (
              <span className="font-body-sm mt-0.5 flex items-center gap-1 text-body-sm text-on-surface-variant truncate">
                <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                {subtitle}
              </span>
            ) : null}
          </div>
        </div>
        <StatusPill label={label} tone={tone} />
      </div>

      {/* Contact Person & Quick Communications matching petrokema_admin_9 */}
      <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <UserAvatar
            alt={client.contactPerson || client.name}
            shape="circle"
            sizeClassName="h-8 w-8"
          />
          <div className="flex min-w-0 flex-col">
            <span className="font-label-md truncate text-label-md font-semibold text-primary">
              {client.contactPerson || client.name}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant font-mono" dir="ltr">
              {client.phone}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {onViewInvoices && (
            <button
              aria-label="عرض فواتير العميل"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shadow-xs transition-colors hover:bg-primary/20 active:scale-95 border border-primary/20"
              onClick={(e) => {
                e.stopPropagation()
                onViewInvoices(client)
              }}
              title="عرض كافة فواتير العميل"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </button>
          )}
          {onResetPassword && (
            <button
              aria-label="إعادة تعيين كلمة المرور"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-700 shadow-xs transition-colors hover:bg-amber-100 active:scale-95 border border-amber-200"
              onClick={(e) => {
                e.stopPropagation()
                onResetPassword(client)
              }}
              title="إعادة تعيين كلمة المرور للعميل"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">lock_reset</span>
            </button>
          )}
          <a
            aria-label="مراسلة واتساب"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest text-[#15803d] shadow-xs transition-colors hover:bg-surface-container active:scale-95"
            href={`https://wa.me/20${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`}
            onClick={(e) => e.stopPropagation()}
            rel="noopener noreferrer"
            target="_blank"
            title="مراسلة واتساب"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
          </a>
          <a
            aria-label="اتصال هاتفي"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-xs transition-colors hover:bg-surface-container active:scale-95"
            href={`tel:${client.phone}`}
            onClick={(e) => e.stopPropagation()}
            title="اتصال هاتفي"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
          </a>
        </div>
      </div>

      {/* Financials & Credit Limit Gauge matching petrokema_admin_9 */}
      <div className="rounded-lg bg-surface-container-low/70 p-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-label-sm block text-label-sm text-on-surface-variant">
              {CLIENTS_COL_DEBT}
            </span>
            <bdi
              className={cn(
                'font-headline-sm text-headline-sm font-bold',
                overCredit ? 'text-error' : 'text-primary',
              )}
              dir="ltr"
            >
              {formatNumber(client.currentDebt)} ج.م
            </bdi>
          </div>
          <div className="text-left">
            <span className="font-label-sm block text-label-sm text-on-surface-variant">
              {CLIENTS_COL_CREDIT}
            </span>
            <bdi className="font-label-lg text-label-lg font-semibold text-on-surface" dir="ltr">
              {formatNumber(client.creditLimit)} ج.م
            </bdi>
          </div>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              overCredit ? 'bg-error' : 'bg-secondary',
            )}
            style={{ width: `${creditPercent}%` }}
          />
        </div>
      </div>
    </article>
  )
}

const features = tableFeatures({})
const columnHelper = createColumnHelper<typeof features, Client>()

export function ClientsTab({
  sellerId,
  sellerName,
  onSwitchToInvoicesTab,
}: {
  sellerId: string
  sellerName?: string
  onSwitchToInvoicesTab?: (client: Client) => void
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'regular' | 'over_credit'>('all')

  const [clientToReset, setClientToReset] = useState<Client | null>(null)
  const [clientForInvoices, setClientForInvoices] = useState<Client | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [credentialsModalData, setCredentialsModalData] =
    useState<AccountCredentials | null>(null)

  const handleResetClientPassword = async () => {
    if (!clientToReset) return
    try {
      setIsResetting(true)
      const res = await resetClientPassword(clientToReset._id)
      const target = clientToReset
      setClientToReset(null)
      setCredentialsModalData({
        name: res.credentials.name || target.name,
        code: res.credentials.code,
        password: res.credentials.password,
        roleTitle: 'عميل معتمد / معرض طلاء',
        roleBadge: 'عميل',
        phone: res.credentials.phone || target.phone,
      })
      toast.success('تمت إعادة تعيين كلمة المرور للعميل بنجاح!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر إعادة تعيين كلمة المرور'
      toast.error(msg)
    } finally {
      setIsResetting(false)
    }
  }

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor('organizeName', {
          header: CLIENTS_COL_NAME,
          cell: (info) => (
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-bold text-on-surface">
                {info.getValue()}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {[info.row.original.address, info.row.original.city]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </div>
          ),
        }),
        columnHelper.display({
          id: 'contact',
          header: CLIENTS_COL_CONTACT,
          cell: (info) => {
            const client = info.row.original
            return (
              <div className="flex flex-col">
                <span className="text-on-surface">{client.contactPerson || client.name}</span>
                <span className="mt-0.5 flex items-center gap-1 font-mono text-on-surface-variant" dir="ltr">
                  <span className="material-symbols-outlined text-[14px] text-secondary">chat</span>
                  <span className="font-label-sm text-label-sm">{client.phone}</span>
                </span>
              </div>
            )
          },
        }),
        columnHelper.accessor('creditLimit', {
          header: CLIENTS_COL_CREDIT,
          cell: (info) => (
            <span className="font-mono text-on-surface">
              <bdi className="whitespace-nowrap" dir="ltr">
                {formatNumber(info.getValue())} ج.م
              </bdi>
            </span>
          ),
        }),
        columnHelper.accessor('currentDebt', {
          header: CLIENTS_COL_DEBT,
          cell: (info) => {
            const client = info.row.original
            const overCredit = client.currentDebt > client.creditLimit
            return (
              <span className={cn('font-mono font-semibold', overCredit ? 'text-error' : 'text-on-surface')}>
                <bdi className="whitespace-nowrap" dir="ltr">
                  {formatNumber(info.getValue())} ج.م
                </bdi>
              </span>
            )
          },
        }),
        columnHelper.display({
          id: 'paymentStatus',
          header: CLIENTS_COL_STATUS,
          cell: (info) => {
            const status = effectiveStatus(info.row.original)
            const label = status === 'unknown' ? CLIENT_STATUS_UNKNOWN : CLIENT_STATUS_LABELS[status]
            const tone = status === 'unknown' ? 'neutral' : CLIENT_STATUS_TONE[status]
            return <StatusPill label={label} tone={tone} />
          },
        }),
        columnHelper.display({
          id: 'actions',
          header: 'إجراءات',
          cell: (info) => {
            const client = info.row.original
            return (
              <div className="flex items-center gap-1.5 flex-nowrap">
                <button
                  className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-lg border border-primary/20 transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
                  onClick={() => setClientForInvoices(client)}
                  title="عرض جميع فواتير هذا العميل"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px] text-primary">receipt_long</span>
                  <span>فواتير العميل</span>
                </button>

                <button
                  className="flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg border border-amber-200 transition-colors shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
                  onClick={() => setClientToReset(client)}
                  title="إعادة تعيين كلمة المرور للعميل"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px] text-amber-600">lock_reset</span>
                  <span>تعيين كلمة المرور</span>
                </button>
              </div>
            )
          },
        }),
      ]),
    [],
  )

  const clientsQuery = useClientsForSeller(sellerId)
  const data = clientsQuery.data?.data ?? []
  const summary = clientsQuery.data?.summary

  const filteredData = data.filter((client) => {
    if (filterMode === 'regular' && client.currentDebt > client.creditLimit) return false
    if (filterMode === 'over_credit' && client.currentDebt <= client.creditLimit) return false
    if (clientSearch.trim()) {
      const q = clientSearch.trim().toLowerCase()
      return (
        client.organizeName.toLowerCase().includes(q) ||
        client.name.toLowerCase().includes(q) ||
        (client.contactPerson && client.contactPerson.toLowerCase().includes(q)) ||
        client.phone.includes(q)
      )
    }
    return true
  })

  const table = useTable({ features, columns, data: filteredData })

  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-space-xs">
          <span className="font-headline-sm text-headline-sm text-primary">
            {CLIENTS_TAB_TITLE}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {CLIENTS_TAB_SUBTITLE}
          </span>
        </div>
        <button
          className="font-label-sm flex h-10 items-center gap-1 rounded-lg bg-secondary px-space-md text-label-sm text-on-secondary shadow-xs transition-colors hover:bg-secondary/90 md:h-9"
          onClick={() => setAddOpen(true)}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add_business</span>
          {CLIENTS_ADD_BUTTON}
        </button>
      </div>

      {/* Summary Ribbon matching petrokema_admin_9 */}
      {summary && data.length > 0 && (
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface-container-low p-3 text-center">
          <div className="flex flex-col items-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              العملاء المسجلين
            </span>
            <span className="font-headline-sm mt-0.5 text-headline-sm font-bold text-primary">
              {formatNumber(data.length)}
            </span>
          </div>
          <div className="flex flex-col items-center border-r border-l border-outline-variant/30 px-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              إجمالي المديونيات
            </span>
            <span className="font-headline-sm mt-0.5 text-headline-sm font-bold text-error">
              {formatNumber(summary.totalDebt)} ج.م
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              تجاوز الائتمان
            </span>
            <span className="font-headline-sm mt-0.5 text-headline-sm font-bold text-on-error-container">
              {formatNumber(summary.overCreditCount)}
            </span>
          </div>
        </div>
      )}

      {/* Search and Filter Chips matching petrokema_admin_9 */}
      {data.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">
              search
            </span>
            <input
              className="font-body-sm h-10 w-full rounded-lg bg-surface-container-low pl-8 pr-9 text-body-sm text-on-surface placeholder-outline focus:bg-surface-container-lowest focus:outline-none"
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="ابحث باسم المنشأة، المسؤول، أو الهاتف..."
              type="text"
              value={clientSearch}
            />
            {clientSearch && (
              <button
                aria-label="مسح البحث"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-0.5 text-outline hover:text-on-surface"
                onClick={() => setClientSearch('')}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
          <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
            {[
              { id: 'all', label: `الكل (${data.length})` },
              {
                id: 'regular',
                label: `رصيد منتظم (${data.filter((c) => c.currentDebt <= c.creditLimit).length})`,
              },
              {
                id: 'over_credit',
                label: `تجاوز الائتمان (${data.filter((c) => c.currentDebt > c.creditLimit).length})`,
              },
            ].map((chip) => (
              <button
                className={cn(
                  'font-label-sm inline-flex h-7 flex-shrink-0 items-center rounded-full px-3 text-label-sm transition-all active:scale-95',
                  filterMode === chip.id
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
                )}
                key={chip.id}
                onClick={() => setFilterMode(chip.id as any)}
                type="button"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {clientsQuery.isLoading ? (
        <StateMessage minHeightClassName="min-h-[160px]" text={CLIENTS_LOADING} />
      ) : clientsQuery.isError ? (
        <StateMessage minHeightClassName="min-h-[160px]" text={CLIENTS_ERROR} tone="error" />
      ) : filteredData.length === 0 ? (
        <StateMessage minHeightClassName="min-h-[160px]" text={CLIENTS_EMPTY} />
      ) : (
        <>
          <div className="flex flex-col gap-space-sm md:hidden">
            {filteredData.map((client) => (
              <ClientCard
                client={client}
                key={client._id}
                onResetPassword={setClientToReset}
                onViewInvoices={setClientForInvoices}
              />
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-lg md:block">
          <table className="w-full min-w-[480px] border-collapse text-right">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr className="bg-surface-container-low" key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <th
                      className={cn(
                        'font-label-md whitespace-nowrap px-space-md py-space-sm text-label-md text-on-surface-variant',
                        index === 0 && 'rounded-r-lg',
                        index === headerGroup.headers.length - 1 && 'rounded-l-lg',
                      )}
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : <FlexRender header={header} />}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="font-body-sm text-body-sm">
              {table.getRowModel().rows.map((row) => (
                <tr
                  className={cn(
                    'transition-colors hover:bg-surface-container-low',
                    row.index % 2 === 1 && 'bg-surface-container-low/30',
                  )}
                  key={row.id}
                >
                  {row.getAllCells().map((cell) => (
                    <td className="px-space-md py-space-sm" key={cell.id}>
                      <FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}

      <AddClientModal
        onOpenChange={setAddOpen}
        open={addOpen}
        sellerId={sellerId}
        sellerName={sellerName}
      />

      {/* Reset Password Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(clientToReset)}
        onOpenChange={(open) => !open && setClientToReset(null)}
        title="إعادة تعيين كلمة المرور للعميل"
        description={`هل أنت متأكد من رغبتك في إعادة تعيين كلمة المرور لحساب العميل (${clientToReset?.name || clientToReset?.organizeName || ''})؟ سيتم توليد رمز PIN جديد مكون من 6 أرقام لتزويده به فوراً عبر الواتساب.`}
        confirmLabel="نعم، تعيين كلمة مرور جديدة"
        cancelLabel="تراجع"
        destructive={false}
        pending={isResetting}
        onConfirm={handleResetClientPassword}
      />

      {/* Credentials Modal with WhatsApp Sharing */}
      <AccountCredentialsModal
        open={Boolean(credentialsModalData)}
        onOpenChange={(open) => !open && setCredentialsModalData(null)}
        credentials={credentialsModalData}
      />

      {/* Client Invoices Modal */}
      <ClientInvoicesModal
        open={Boolean(clientForInvoices)}
        onOpenChange={(open) => !open && setClientForInvoices(null)}
        client={clientForInvoices}
        sellerName={sellerName}
        onSwitchToInvoicesTab={onSwitchToInvoicesTab}
      />
    </div>
  )
}
