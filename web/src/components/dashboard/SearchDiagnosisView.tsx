import type { GoogleSearchData, CheckoutOrder } from '../../data/mock/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'

interface Props { data: GoogleSearchData[], checkout: CheckoutOrder[] }

export function SearchDiagnosisView({ data, checkout }: Props) {
  // Group by campaign
  const byCampaign = Object.values(data.reduce((acc, d) => {
    const k = d.campaign_name
    if (!acc[k]) acc[k] = { name: k, spend: 0, clicks: 0, conversions: 0, impressions: 0, isLostBudget: 0, isLostRank: 0, isBrand: d.is_brand, count: 0 }
    acc[k].spend += d.spend; acc[k].clicks += d.clicks; acc[k].conversions += d.conversions
    acc[k].impressions += d.impressions; acc[k].isLostBudget += d.is_lost_budget; acc[k].isLostRank += d.is_lost_rank; acc[k].count++
    return acc
  }, {} as Record<string, any>)).map((c: any) => ({
    name: c.name.length > 30 ? c.name.slice(0,30)+'…' : c.name,
    spend: +c.spend.toFixed(0), cpa: c.conversions > 0 ? +(c.spend/c.conversions).toFixed(0) : 0,
    roas: c.conversions > 0 ? +((c.conversions*700)/c.spend).toFixed(2) : 0,
    isLostBudget: +((c.isLostBudget/c.count)*100).toFixed(0), isLostRank: +((c.isLostRank/c.count)*100).toFixed(0),
    impressionShare: +(100 - (c.isLostBudget/c.count)*100 - (c.isLostRank/c.count)*100).toFixed(0),
    isBrand: c.isBrand, conversions: c.conversions
  }))

  // Group by search term (top 10 by spend)
  const byTerm = Object.values(data.reduce((acc, d) => {
    const k = d.search_term
    if (!acc[k]) acc[k] = { term: k, spend: 0, clicks: 0, conv: 0, matchType: d.match_type }
    acc[k].spend += d.spend; acc[k].clicks += d.clicks; acc[k].conv += d.conversions
    return acc
  }, {} as Record<string, any>)).sort((a: any,b: any) => b.spend - a.spend).slice(0,10).map((t: any) => ({
    term: t.term, spend: +t.spend.toFixed(0), cpa: t.conv > 0 ? +(t.spend/t.conv).toFixed(0) : Infinity,
    matchType: t.matchType, conversions: t.conv
  }))

  // Match type distribution
  const byMatch = Object.values(data.reduce((acc, d) => {
    if (!acc[d.match_type]) acc[d.match_type] = {name: d.match_type==='exact'?'Exata':d.match_type==='phrase'?'Frase':'Ampla', value: 0}
    acc[d.match_type].value += d.spend
    return acc
  }, {} as Record<string, any>)).map((m: any) => ({...m, value: +m.value.toFixed(0)}))

  // UTM cross-reference: checkout orders matched to google search
  const searchOrders = checkout.filter(o => o.utm_source === 'google' && o.utm_medium === 'cpc')
  const realRevenue = searchOrders.reduce((s, o) => s + o.revenue, 0)
  const totalSpend = data.reduce((s, d) => s + d.spend, 0)

  const COLORS = ['#66fcf1','#fbbf24','#ef4444']

  return (
    <div style={{padding:20,display:'flex',flexDirection:'column',gap:24}}>
      <h2 style={{fontSize:20,fontWeight:700,color:'#fff'}}>Diagnóstico Google Search</h2>

      {/* KPI row */}
      <div style={{display:'flex',gap:12}}>
        <KPI label="Gasto Total" value={`R$ ${totalSpend.toLocaleString('pt-BR',{maximumFractionDigits:0})}`} />
        <KPI label="Receita UTM (Checkout)" value={`R$ ${realRevenue.toLocaleString()}`} color="#66fcf1" />
        <KPI label="ROAS Real" value={(realRevenue/totalSpend).toFixed(2)} color={realRevenue/totalSpend > 2 ? '#66fcf1' : '#ef4444'} />
        <KPI label="Vendas via Search" value={String(searchOrders.length)} />
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
        {/* Impression Share */}
        <Card title="Parcela de Impressão por Campanha">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byCampaign} layout="vertical">
              <XAxis type="number" tick={{fill:'#666',fontSize:10}} domain={[0,100]} unit="%" />
              <YAxis type="category" dataKey="name" width={160} tick={{fill:'#999',fontSize:9}} />
              <Tooltip contentStyle={{background:'#1a1a1a',border:'1px solid #333',color:'#fff',fontSize:11}} />
              <Bar dataKey="impressionShare" name="IS %" stackId="a" fill="#66fcf1" />
              <Bar dataKey="isLostBudget" name="Perdida (Orçamento)" stackId="a" fill="#fbbf24" />
              <Bar dataKey="isLostRank" name="Perdida (Rank)" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Match type pie */}
        <Card title="Distribuição de Gasto por Correspondência">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byMatch} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({name,percent})=>`${name} ${((percent||0)*100).toFixed(0)}%`}>
                {byMatch.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{background:'#1a1a1a',border:'1px solid #333',color:'#fff',fontSize:11}} formatter={(v: any) => `R$ ${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Search Terms Table */}
      <Card title="Top 10 Termos de Pesquisa (por Gasto)">
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr style={{borderBottom:'1px solid #333'}}>
            {['Termo','Correspondência','Gasto','Conversões','CPA','Status'].map(h =>
              <th key={h} style={{textAlign:'left',padding:'8px 6px',color:'#888',fontWeight:600,fontSize:9,textTransform:'uppercase',letterSpacing:0.5}}>{h}</th>
            )}
          </tr></thead>
          <tbody>
            {byTerm.map((t,i) => (
              <tr key={i} style={{borderBottom:'1px solid #1a1a1a'}}>
                <td style={{padding:'8px 6px',color:'#ddd'}}>{t.term}</td>
                <td style={{padding:'8px 6px',color:t.matchType==='broad'?'#fbbf24':'#66fcf1',fontSize:10}}>{t.matchType==='exact'?'Exata':t.matchType==='phrase'?'Frase':'Ampla'}</td>
                <td style={cs}>R$ {t.spend.toLocaleString()}</td>
                <td style={cs}>{t.conversions}</td>
                <td style={{...cs,color:t.cpa>500?'#ef4444':t.cpa>250?'#fbbf24':'#66fcf1'}}>{t.cpa===Infinity?'∞':`R$ ${t.cpa}`}</td>
                <td style={cs}>{t.conversions===0 && t.spend>200 ? <span style={{color:'#ef4444'}}>⚠ Desperdício</span> : <span style={{color:'#66fcf1'}}>OK</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Alerts */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {byCampaign.filter(c => c.isLostBudget > 25 && c.roas > 2).map((c,i) => (
          <Alert key={i} color="#fbbf24" title={`"Asfixia Orçamentária" — ${c.name}`}
            text={`ROAS de ${c.roas} mas ${c.isLostBudget}% de IS Perdida por orçamento. Realocar verba aqui.`} />
        ))}
        {byCampaign.filter(c => c.isBrand).map((c,i) => (
          <Alert key={i} color="#ef4444" title={`Marca misturada — ${c.name}`}
            text={`Termos de marca estão em campanha Non-Brand. CPA mascarado: R$ ${c.cpa}. Isolar em campanha de proteção.`} />
        ))}
      </div>
    </div>
  )
}

const cs: React.CSSProperties = {padding:'8px 6px',color:'#999'}

function KPI({label,value,color='#fff'}: {label:string,value:string,color?:string}) {
  return (
    <div style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:8,padding:'12px 16px',flex:1}}>
      <div style={{fontSize:9,color:'#666',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>{label}</div>
      <div style={{fontSize:18,fontWeight:700,color}}>{value}</div>
    </div>
  )
}

function Card({title,children}: {title:string,children:React.ReactNode}) {
  return (
    <div style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:8,padding:16}}>
      <h3 style={{fontSize:12,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>{title}</h3>
      {children}
    </div>
  )
}

function Alert({color,title,text}: {color:string,title:string,text:string}) {
  return (
    <div style={{background:'rgba(255,255,255,0.02)',border:`1px solid ${color}33`,borderRadius:8,padding:14,borderLeft:`3px solid ${color}`}}>
      <div style={{fontSize:11,fontWeight:700,color,marginBottom:4}}>{title}</div>
      <div style={{fontSize:10,color:'#bbb',lineHeight:1.5}}>{text}</div>
    </div>
  )
}
