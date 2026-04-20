import { useState, useMemo } from 'react'
import type { Filters } from './data/mock/types'
import { generateMeta, generateGoogle, generateYouTube, generateDemandGen, generateCheckout } from './data/mock/generators'
import { FilterBar } from './components/dashboard/FilterBar'
import { MetaDiagnosisView } from './components/dashboard/MetaDiagnosisView'
import { SearchDiagnosisView } from './components/dashboard/SearchDiagnosisView'
import { VideoDiagnosisView } from './components/dashboard/VideoDiagnosisView'

type Tab = 'meta' | 'search' | 'video'

const periodDays = { '7d': 7, '14d': 14, '30d': 30, '60d': 60 }

function App() {
  const [tab, setTab] = useState<Tab>('meta')
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

  const tabs: { key: Tab; label: string }[] = [
    { key: 'meta', label: 'Meta Ads' },
    { key: 'search', label: 'Google Search' },
    { key: 'video', label: 'YouTube & Demand Gen' },
  ]

  return (
    <div style={{width:'100vw',height:'100vh',display:'flex',flexDirection:'column',fontFamily:'Inter,system-ui,sans-serif',background:'#0d0d0d',color:'#c5c6c7',overflow:'hidden'}}>
      {/* Top Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',borderBottom:'1px solid #1a1a1a',background:'#0a0a0a'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <span style={{fontSize:15,fontWeight:700,color:'#fff',letterSpacing:-0.5}}>BeConfident</span>
          <span style={{fontSize:11,color:'#555',borderLeft:'1px solid #333',paddingLeft:12}}>Plataforma de Análise Operacional</span>
        </div>
        <div style={{display:'flex',gap:6}}>
          <KPI label="Investimento" value={`R$ ${(totalSpend/1000).toFixed(0)}k`} />
          <KPI label="CPA" value={`R$ ${globalCPA.toFixed(0)}`} color={globalCPA > 300 ? '#ef4444' : '#66fcf1'} />
          <KPI label="ROAS" value={globalROAS.toFixed(2)} color={globalROAS > 2 ? '#66fcf1' : '#ef4444'} />
          <KPI label="Vendas" value={String(totalConv)} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{display:'flex',borderBottom:'1px solid #1a1a1a',background:'#0e0e0e'}}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{padding:'10px 20px',fontSize:12,fontWeight:tab===t.key?700:400,
              color:tab===t.key?'#66fcf1':'#777',background:'transparent',border:'none',
              borderBottom:tab===t.key?'2px solid #66fcf1':'2px solid transparent',cursor:'pointer',
              transition:'all 0.2s'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} onChange={setFilters} campaigns={allCampaigns} />

      {/* Content */}
      <div style={{flex:1,overflow:'auto'}}>
        {tab === 'meta' && <MetaDiagnosisView data={meta} />}
        {tab === 'search' && <SearchDiagnosisView data={google} checkout={filteredCheckout} />}
        {tab === 'video' && <VideoDiagnosisView ytData={yt} dgData={dg} checkout={filteredCheckout} />}
      </div>
    </div>
  )
}

function KPI({label,value,color='#fff'}: {label:string,value:string,color?:string}) {
  return (
    <div style={{background:'#141414',border:'1px solid #222',borderRadius:6,padding:'6px 12px',minWidth:80,textAlign:'center'}}>
      <div style={{fontSize:8,color:'#555',textTransform:'uppercase',letterSpacing:1}}>{label}</div>
      <div style={{fontSize:14,fontWeight:700,color,marginTop:2}}>{value}</div>
    </div>
  )
}

export default App
