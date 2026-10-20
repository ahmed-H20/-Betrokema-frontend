import { SellerRepCard } from './components/SellerRepCard'
import { SellerKpiBento } from './components/SellerKpiBento'
import { SellerClientsList } from './components/SellerClientsList'

export function SellerDashboardPage() {
  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto w-full md:max-w-4xl">
      {/* 1. Representative Profile Card */}
      <SellerRepCard />

      {/* 2. Key Performance Indicators Bento */}
      <SellerKpiBento />

      {/* 3. Clients Directory & Field Invoices Section */}
      <SellerClientsList />
    </div>
  )
}
