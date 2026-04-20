import type { CheckoutOrder, MetaAdData, GoogleSearchData, YouTubeAdData, DemandGenData } from './types'

const rand = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min)
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const dateRange = (days: number): string[] => {
  const dates: string[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date(2026, 3, 20); d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

const META_CAMPAIGNS = [
  { id: 'mc1', name: '[ESCALA] Conversão Principal', adsets: [
    { name: 'Broad 18-45', creatives: ['UGC-001 Depoimento Maria','UGC-002 Antes/Depois','VSL-003 Apresentação','HOOK-004 Pergunta Direta','IMG-005 Carrossel Benefícios'] },
    { name: 'LAL Compradores 1%', creatives: ['UGC-001 Depoimento Maria','VSL-003 Apresentação','HOOK-006 Gatilho Medo'] },
  ]},
  { id: 'mc2', name: '[TOPO] Awareness Vídeos', adsets: [
    { name: 'Interesse Inglês', creatives: ['UGC-007 Dia a Dia','VSL-008 História Fundador','HOOK-009 Erro Comum'] },
  ]},
  { id: 'mc3', name: '[RETARG] Visitantes 7d', adsets: [
    { name: 'Visitantes Página', creatives: ['UGC-010 Urgência','IMG-011 Oferta Direta','VSL-012 FAQ'] },
  ]},
  { id: 'mc4', name: '[ASC] Advantage+ Shopping', adsets: [
    { name: 'ASC Auto', creatives: ['UGC-001 Depoimento Maria','UGC-002 Antes/Depois','VSL-003 Apresentação','HOOK-004 Pergunta Direta','UGC-007 Dia a Dia','HOOK-009 Erro Comum'] },
  ]},
  { id: 'mc5', name: '[CBO] Broad Teste Criativos', adsets: [
    { name: 'Sandbox A', creatives: ['TEST-013 Hook Dor','TEST-014 Hook Curiosidade','TEST-015 Hook Estatística'] },
    { name: 'Sandbox B', creatives: ['TEST-016 Corpo Longo','TEST-017 Corpo Curto','TEST-018 Corpo Emocional'] },
  ]},
]

// Creative archetypes that produce specific patterns
const CREATIVE_PROFILES: Record<string, { hookBase: number, holdBase: number, ctrBase: number }> = {
  'UGC-001': { hookBase: 0.38, holdBase: 0.15, ctrBase: 0.025 },  // Falso Campeão: hook alto, hold baixo
  'UGC-002': { hookBase: 0.12, holdBase: 0.65, ctrBase: 0.035 },  // Diamante Bruto: hook baixo, hold alto
  'VSL-003': { hookBase: 0.22, holdBase: 0.45, ctrBase: 0.020 },
  'HOOK-004': { hookBase: 0.42, holdBase: 0.12, ctrBase: 0.018 }, // Falso Campeão extremo
  'IMG-005': { hookBase: 0, holdBase: 0, ctrBase: 0.032 },
  'HOOK-006': { hookBase: 0.35, holdBase: 0.20, ctrBase: 0.022 },
  'UGC-007': { hookBase: 0.18, holdBase: 0.55, ctrBase: 0.028 },
  'VSL-008': { hookBase: 0.15, holdBase: 0.50, ctrBase: 0.019 },
  'HOOK-009': { hookBase: 0.30, holdBase: 0.30, ctrBase: 0.024 },
  'UGC-010': { hookBase: 0.25, holdBase: 0.40, ctrBase: 0.040 },
  'IMG-011': { hookBase: 0, holdBase: 0, ctrBase: 0.045 },
  'VSL-012': { hookBase: 0.20, holdBase: 0.35, ctrBase: 0.015 },
  'TEST-013': { hookBase: 0.40, holdBase: 0.22, ctrBase: 0.020 },
  'TEST-014': { hookBase: 0.28, holdBase: 0.30, ctrBase: 0.022 },
  'TEST-015': { hookBase: 0.33, holdBase: 0.25, ctrBase: 0.019 },
  'TEST-016': { hookBase: 0.20, holdBase: 0.60, ctrBase: 0.030 },
  'TEST-017': { hookBase: 0.22, holdBase: 0.35, ctrBase: 0.025 },
  'TEST-018': { hookBase: 0.10, holdBase: 0.70, ctrBase: 0.038 }, // Diamante Bruto extremo
}

export function generateMeta(days: number): MetaAdData[] {
  const dates = dateRange(days)
  const data: MetaAdData[] = []
  for (const camp of META_CAMPAIGNS) {
    for (const adset of camp.adsets) {
      for (const creative of adset.creatives) {
        const code = creative.split(' ')[0]
        const profile = CREATIVE_PROFILES[code] || { hookBase: 0.20, holdBase: 0.30, ctrBase: 0.025 }
        const isImage = code.startsWith('IMG')
        for (const date of dates) {
          const spend = camp.id === 'mc1' ? rand(80,250) : rand(20,120)
          const impressions = randInt(Math.round(spend*8), Math.round(spend*25))
          const reach = Math.round(impressions / rand(1.1, 3.0))
          const views3s = isImage ? 0 : Math.round(impressions * (profile.hookBase + rand(-0.05,0.05)))
          const views25 = isImage ? 0 : Math.round(views3s * (profile.holdBase + rand(-0.08,0.08)))
          const clicks = Math.round(impressions * (profile.ctrBase + rand(-0.008,0.008)))
          const conversions = camp.id === 'mc1' ? randInt(0,2) : randInt(0,1)
          data.push({
            campaign_id: camp.id, campaign_name: camp.name,
            adset_name: adset.name, ad_name: creative, date, spend, impressions, reach,
            frequency: +(impressions / Math.max(reach,1)).toFixed(2),
            clicks: Math.max(clicks,0), ctr: +(Math.max(clicks,0)/Math.max(impressions,1)*100).toFixed(2),
            cpm: +(spend/Math.max(impressions,1)*1000).toFixed(2),
            views_3s: Math.max(views3s,0), views_25pct: Math.max(views25,0),
            views_50pct: Math.round(Math.max(views25,0) * rand(0.4,0.7)),
            views_75pct: Math.round(Math.max(views25,0) * rand(0.2,0.5)),
            views_100pct: Math.round(Math.max(views25,0) * rand(0.05,0.25)),
            conversions,
            bid_strategy: pick(['lowest_cost','lowest_cost','cost_cap','bid_cap']),
            learning_status: conversions*7 >= 50 ? 'exited' : (conversions*7 >= 25 ? 'active' : 'limited'),
            edits_last_7d: randInt(0,12),
            creative_format: isImage ? (code.includes('Carrossel') ? 'carousel' : 'image') : 'video',
            utm_campaign: `meta_${camp.id}`, utm_content: code
          })
        }
      }
    }
  }
  return data
}

// --- Google, YouTube, DemandGen, Checkout generators unchanged ---

const GOOGLE_CAMPAIGNS = [
  { id: 'gc1', name: 'Search - Curso Inglês [Exata]', utm: 'gads_search_exact' },
  { id: 'gc2', name: 'Search - Inglês Genérico [Ampla]', utm: 'gads_search_broad' },
  { id: 'gc3', name: 'Search - Brand BeConfident', utm: 'gads_brand' },
  { id: 'gc4', name: 'Search - Concorrência', utm: 'gads_competitor' },
]
const SEARCH_TERMS_MAP: Record<string, { terms: string[], brand: boolean }> = {
  'gc1': { terms: ['curso de inglês online', 'melhor curso inglês', 'aprender inglês rápido', 'curso inglês fluente'], brand: false },
  'gc2': { terms: ['tradutor de inglês', 'como falar oi em inglês', 'curso de inglês grátis', 'inglês básico', 'aprender inglês'], brand: false },
  'gc3': { terms: ['beconfident', 'beconfident curso', 'beconfident inglês', 'curso beconfident preço'], brand: true },
  'gc4': { terms: ['wise up curso', 'open english preço', 'culture inglesa online'], brand: false },
}

export function generateGoogle(days: number): GoogleSearchData[] {
  const dates = dateRange(days)
  const data: GoogleSearchData[] = []
  for (const camp of GOOGLE_CAMPAIGNS) {
    const info = SEARCH_TERMS_MAP[camp.id]
    for (const date of dates) {
      for (const term of info.terms) {
        const matchType: 'exact'|'phrase'|'broad' = camp.id==='gc1' ? 'exact' : (camp.id==='gc2' ? 'broad' : pick(['exact','phrase']))
        const spend = info.brand ? rand(30,80) : rand(50,300)
        const impressions = randInt(100,2000)
        const clicks = randInt(5, Math.round(impressions*0.15))
        const conversions = info.brand ? randInt(1,4) : (matchType==='exact' ? randInt(0,3) : randInt(0,1))
        data.push({
          campaign_id: camp.id, campaign_name: camp.name, date, spend, impressions, clicks, conversions,
          ctr: +(clicks/impressions*100).toFixed(2), cpc: +(spend/clicks).toFixed(2),
          match_type: matchType, search_term: term,
          impression_share: camp.id==='gc1' ? rand(0.35,0.65) : rand(0.55,0.90),
          is_lost_budget: camp.id==='gc1' ? rand(0.15,0.40) : rand(0.02,0.15),
          is_lost_rank: rand(0.05,0.25), is_brand: info.brand,
          bid_strategy: pick(['target_cpa','target_roas','maximize_conversions']),
          bid_status: pick(['learning','limited','eligible','eligible']),
          utm_campaign: camp.utm, utm_content: term.replace(/\s/g,'_').slice(0,20)
        })
      }
    }
  }
  return data
}

const YT_CAMPAIGNS = [
  { id: 'yt1', name: 'YouTube - VSL Principal', utm: 'yt_vsl_main' },
  { id: 'yt2', name: 'YouTube - Testimonial', utm: 'yt_testimonial' },
  { id: 'yt3', name: 'YouTube - Hook Test', utm: 'yt_hook_test' },
]

export function generateYouTube(days: number): YouTubeAdData[] {
  const dates = dateRange(days)
  const data: YouTubeAdData[] = []
  for (const camp of YT_CAMPAIGNS) {
    for (const date of dates) {
      const device = pick(['mobile','mobile','mobile','desktop','smart_tv']) as any
      const channel = pick(['relevant','relevant','kids','kids','music','podcast','competitor']) as any
      const spend = rand(200,800); const impressions = randInt(2000,15000)
      const viewRate = channel==='kids' ? rand(0.03,0.10) : rand(0.12,0.40)
      const views = Math.round(impressions * viewRate)
      const clicks = device==='smart_tv' ? randInt(0,2) : randInt(Math.round(views*0.01), Math.round(views*0.08))
      data.push({
        campaign_id: camp.id, campaign_name: camp.name, date, spend, impressions, views,
        view_rate: +(viewRate*100).toFixed(2), cpv: views > 0 ? +(spend/views).toFixed(3) : 0,
        clicks, ctr: views > 0 ? +(clicks/views*100).toFixed(2) : 0,
        views_25pct: Math.round(views*rand(0.5,0.85)), views_50pct: Math.round(views*rand(0.3,0.6)),
        views_75pct: Math.round(views*rand(0.15,0.45)), views_100pct: Math.round(views*rand(0.05,0.25)),
        channel_category: channel, device, creative_format: pick(['horizontal','horizontal','vertical','static']),
        audience_type: pick(['custom_intent','remarketing','lookalike','placement']),
        utm_campaign: camp.utm, utm_content: `yt_${camp.id}_${randInt(1,3)}`
      })
    }
  }
  return data
}

const DG_CAMPAIGNS = [
  { id: 'dg1', name: 'DemandGen - Lookalike LTV', utm: 'dg_lookalike' },
  { id: 'dg2', name: 'DemandGen - Remarketing', utm: 'dg_remarketing' },
  { id: 'dg3', name: 'DemandGen - Custom Intent', utm: 'dg_custom_intent' },
]

export function generateDemandGen(days: number): DemandGenData[] {
  const dates = dateRange(days)
  const data: DemandGenData[] = []
  for (const camp of DG_CAMPAIGNS) {
    for (const date of dates) {
      const assetType = pick(['video','static_image','static_image']) as any
      const spend = rand(100,500); const impressions = randInt(1000,8000)
      const clicks = assetType==='static_image' ? randInt(20,Math.round(impressions*0.06)) : randInt(5,Math.round(impressions*0.03))
      const conversions = assetType==='video' ? randInt(0,3) : randInt(0,1)
      data.push({
        campaign_id: camp.id, campaign_name: camp.name, date, spend, impressions, clicks, conversions,
        ctr: +(clicks/impressions*100).toFixed(2), cpa: conversions > 0 ? +(spend/conversions).toFixed(2) : 0,
        asset_type: assetType, asset_rating: pick(['low','good','best']),
        audience_source: camp.id==='dg2' ? 'all_visitors' : pick(['customer_match','lookalike']),
        expansion_level: camp.id==='dg2' ? 'broad' : pick(['narrow','balanced']),
        placement: pick(['youtube_infeed','shorts','gmail','discover']),
        utm_campaign: camp.utm, utm_content: `dg_${camp.id}_${randInt(1,3)}`
      })
    }
  }
  return data
}

export function generateCheckout(metaData: MetaAdData[], googleData: GoogleSearchData[], ytData: YouTubeAdData[], dgData: DemandGenData[]): CheckoutOrder[] {
  const orders: CheckoutOrder[] = []; let orderId = 1000
  const add = (date: string, conv: number, src: string, med: string, camp: string, cont: string, dev: 'mobile'|'desktop'|'smart_tv' = 'mobile') => {
    for (let i = 0; i < conv; i++) orders.push({ id: `ORD-${orderId++}`, date, revenue: 700, utm_source: src, utm_medium: med, utm_campaign: camp, utm_content: cont, device: dev })
  }
  metaData.forEach(d => add(d.date, d.conversions, 'facebook', 'cpc', d.utm_campaign, d.utm_content))
  googleData.forEach(d => add(d.date, d.conversions, 'google', 'cpc', d.utm_campaign, d.utm_content))
  ytData.forEach(d => { if (d.clicks > 0) add(d.date, randInt(0,1), 'youtube', 'video', d.utm_campaign, d.utm_content, d.device) })
  dgData.forEach(d => add(d.date, d.conversions, 'google', 'demand_gen', d.utm_campaign, d.utm_content))
  return orders
}
