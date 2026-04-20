import { useState, useMemo } from 'react'
import type { Filters } from './data/mock/types'
import { generateMeta, generateGoogle, generateYouTube, generateDemandGen, generateCheckout } from './data/mock/generators'
import { FilterBar } from './components/dashboard/FilterBar'
import { MetaDiagnosisView } from './components/dashboard/MetaDiagnosisView'
import { SearchDiagnosisView } from './components/dashboard/SearchDiagnosisView'
import { VideoDiagnosisView } from './components/dashboard/VideoDiagnosisView'
import { Menu, X, LayoutDashboard, Search, MonitorPlay, Activity, ArrowDownRight, ArrowUpRight, DollarSign } from 'lucide-react'

type Tab = 'meta' | 'search' | 'video'

const periodDays = { '7d': 7, '14d': 14, '30d': 30, '60d': 60 }

function App() {
  const [tab, setTab] = useState<Tab>('meta')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const [filters, setFilters] = useState<Filters>({
    period: '30d', platform: 'all', campaigns: [], matchType: 'all',
    creativeFormat: 'all', device: 'all', utmSource: ''
  })

  // Generate mock data based on period
  const days = periodDays[filters.period]
  const rawMeta = useMemo(() => generateMeta(days), [days])
  const rawGoogle = useMemo(() => generateGoogle(days), [days])
  const rawYT = useMemo(() => generateYouTube(days), [days])
  const rawDG = useMemo(() => generateDemandGen(days), [days])
  const checkout = useMemo(() => generateCheckout(rawMeta, rawGoogle, rawYT, rawDG), [rawMeta, rawGoogle, rawYT, rawDG])

  // Apply filters
  const meta = useMemo(() => rawMeta.filter(d => {
    if (filters.campaigns.length && !filters.campaigns.includes(d.campaign_name)) return false
    if (filters.creativeFormat !== 'all' && d.creative_format !== filters.creativeFormat) return false
    if (filters.utmSource && !d.utm_campaign.includes(filters.utmSource)) return false
    return true
  }), [rawMeta, filters])

  const google = useMemo(() => rawGoogle.filter(d => {
    if (filters.campaigns.length && !filters.campaigns.includes(d.campaign_name)) return false
    if (filters.matchType !== 'all' && d.match_type !== filters.matchType) return false
    if (filters.utmSource && !d.utm_campaign.includes(filters.utmSource)) return false
    return true
  }), [rawGoogle, filters])

  const yt = useMemo(() => rawYT.filter(d => {
    if (filters.campaigns.length && !filters.campaigns.includes(d.campaign_name)) return false
    if (filters.device !== 'all' && d.device !== filters.device) return false
    if (filters.creativeFormat !== 'all') {
      const map: Record<string, string> = { video: 'horizontal', image: 'static' }
      if (map[filters.creativeFormat] && d.creative_format !== map[filters.creativeFormat] && d.creative_format !== 'vertical') return false
    }
    if (filters.utmSource && !d.utm_campaign.includes(filters.utmSource)) return false
    return true
  }), [rawYT, filters])

  const dg = useMemo(() => rawDG.filter(d => {
    if (filters.campaigns.length && !filters.campaigns.includes(d.campaign_name)) return false
    if (filters.utmSource && !d.utm_campaign.includes(filters.utmSource)) return false
    return true
  }), [rawDG, filters])

  const filteredCheckout = useMemo(() => checkout.filter(o => {
    if (filters.device !== 'all' && o.device !== filters.device) return false
    if (filters.utmSource && o.utm_source !== filters.utmSource) return false
    return true
  }), [checkout, filters])

  // Get all campaign names for filter dropdown
  const allCampaigns = useMemo(() => {
    const names = new Set<string>()
    rawMeta.forEach(d => names.add(d.campaign_name))
    rawGoogle.forEach(d => names.add(d.campaign_name))
    rawYT.forEach(d => names.add(d.campaign_name))
    rawDG.forEach(d => names.add(d.campaign_name))
    return Array.from(names).sort()
  }, [rawMeta, rawGoogle, rawYT, rawDG])

  // Global KPIs
  const totalSpend = meta.reduce((s,d)=>s+d.spend,0) + google.reduce((s,d)=>s+d.spend,0) + yt.reduce((s,d)=>s+d.spend,0) + dg.reduce((s,d)=>s+d.spend,0)
  const totalRevenue = filteredCheckout.reduce((s,o)=>s+o.revenue,0)
  const totalConv = filteredCheckout.length
  const globalCPA = totalConv > 0 ? (totalSpend / totalConv) : 0
  const globalROAS = totalSpend > 0 ? (totalRevenue / totalSpend) : 0

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'meta', label: 'Meta Ads', icon: LayoutDashboard },
    { key: 'search', label: 'Google Search', icon: Search },
    { key: 'video', label: 'YouTube & Demand Gen', icon: MonitorPlay },
  ]

  const titleMap = {
    meta: 'Meta Ads',
    search: 'Google Search',
    video: 'YouTube & Demand Gen'
  }

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-300 overflow-hidden font-sans">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-[#0f172a] border-b border-slate-800 p-4 absolute top-0 w-full z-20 h-[60px]">
        <div className="flex items-center gap-2">
          <Activity className="text-cyan-400" size={20} />
          <span className="font-bold text-white tracking-tight">BeConfident</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 p-1">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static top-0 left-0 h-full w-64 bg-[#0f172a] border-r border-[#1e293b] flex flex-col transition-transform duration-300 z-40 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-2xl md:shadow-none`}>
        <div className="p-6 border-b border-[#1e293b] hidden md:flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Activity className="text-cyan-400" size={24} />
            <span className="text-xl font-bold text-white tracking-tight">BeConfident</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Centro de Inteligência</span>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-500 mb-3 px-2 uppercase tracking-widest">Diagnósticos</div>
          <div className="flex flex-col gap-1">
            {tabs.map(t => {
              const Icon = t.icon
              const active = tab === t.key
              return (
                <button 
                  key={t.key} 
                  onClick={() => { setTab(t.key); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-800/50' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon size={18} className={active ? 'text-cyan-400' : 'text-slate-500'} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full w-full overflow-hidden pt-[60px] md:pt-0 relative bg-[#020617]">
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            
            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1e293b] pb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{titleMap[tab]}</h1>
                <p className="text-sm text-slate-400 mt-1">Visão geral e performance de mídia no período</p>
              </div>
              <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95">
                <span>+ Novo Relatório</span>
              </button>
            </div>

            {/* KPI Cards (matching reference style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Vendas (Conversions) */}
              <div className="bg-[#0f172a] rounded-xl p-5 border border-[#1e293b] flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold tracking-wide uppercase">
                  <ArrowUpRight size={14} className="text-emerald-500" />
                  Vendas Geradas
                </div>
                <div className="text-2xl font-bold text-emerald-500">{totalConv.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">conversões no período</div>
              </div>

              {/* Investido */}
              <div className="bg-[#0f172a] rounded-xl p-5 border border-[#1e293b] flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold tracking-wide uppercase">
                  <ArrowDownRight size={14} className="text-yellow-500" />
                  Investido
                </div>
                <div className="text-2xl font-bold text-yellow-500">R$ {totalSpend.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                <div className="text-[10px] text-slate-500">gasto total</div>
              </div>

              {/* Recebido (ROAS / Revenue) */}
              <div className="bg-[#0f172a] rounded-xl p-5 border border-[#1e293b] flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold tracking-wide uppercase">
                  <Activity size={14} className="text-emerald-500" />
                  ROAS Global
                </div>
                <div className={`text-2xl font-bold ${globalROAS > 2 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {globalROAS.toFixed(2)}x
                </div>
                <div className="text-[10px] text-slate-500">R$ {totalRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})} em receita</div>
              </div>

              {/* CPA */}
              <div className="bg-[#0f172a] rounded-xl p-5 border border-[#1e293b] flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold tracking-wide uppercase">
                  <DollarSign size={14} className="text-purple-400" />
                  CPA Médio
                </div>
                <div className={`text-2xl font-bold ${globalCPA > 300 ? 'text-rose-500' : 'text-purple-400'}`}>
                  R$ {globalCPA.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
                <div className="text-[10px] text-slate-500">custo por aquisição</div>
              </div>
            </div>

            {/* Filters Area */}
            <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-2">
               <FilterBar filters={filters} onChange={setFilters} campaigns={allCampaigns} />
            </div>

            {/* Dynamic View */}
            <div className="pb-10">
              {tab === 'meta' && <MetaDiagnosisView data={meta} />}
              {tab === 'search' && <SearchDiagnosisView data={google} checkout={filteredCheckout} />}
              {tab === 'video' && <VideoDiagnosisView ytData={yt} dgData={dg} checkout={filteredCheckout} />}
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default App
