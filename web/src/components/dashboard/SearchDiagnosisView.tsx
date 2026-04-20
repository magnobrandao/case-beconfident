import type { GoogleSearchData, CheckoutOrder } from '../../data/mock/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'

interface Props { data: GoogleSearchData[], checkout: CheckoutOrder[] }

const tooltipStyle = { background: '#0f172a', border: '1px solid #1e293b', color: '#e2e8f0', fontSize: 11, borderRadius: 10 }

export function SearchDiagnosisView({ data, checkout }: Props) {
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

  const byTerm = Object.values(data.reduce((acc, d) => {
    const k = d.search_term
    if (!acc[k]) acc[k] = { term: k, spend: 0, clicks: 0, conv: 0, matchType: d.match_type }
    acc[k].spend += d.spend; acc[k].clicks += d.clicks; acc[k].conv += d.conversions
    return acc
  }, {} as Record<string, any>)).sort((a: any,b: any) => b.spend - a.spend).slice(0,10).map((t: any) => ({
    term: t.term, spend: +t.spend.toFixed(0), cpa: t.conv > 0 ? +(t.spend/t.conv).toFixed(0) : Infinity,
    matchType: t.matchType, conversions: t.conv
  }))

  const byMatch = Object.values(data.reduce((acc, d) => {
    if (!acc[d.match_type]) acc[d.match_type] = {name: d.match_type==='exact'?'Exata':d.match_type==='phrase'?'Frase':'Ampla', value: 0}
    acc[d.match_type].value += d.spend
    return acc
  }, {} as Record<string, any>)).map((m: any) => ({...m, value: +m.value.toFixed(0)}))

  const searchOrders = checkout.filter(o => o.utm_source === 'google' && o.utm_medium === 'cpc')
  const realRevenue = searchOrders.reduce((s, o) => s + o.revenue, 0)
  const totalSpend = data.reduce((s, d) => s + d.spend, 0)
  const realROAS = totalSpend > 0 ? realRevenue / totalSpend : 0

  const COLORS = ['#22d3ee','#fbbf24','#f87171']

  return (
    <div className="flex flex-col gap-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Gasto Total" value={`R$ ${totalSpend.toLocaleString('pt-BR',{maximumFractionDigits:0})}`} />
        <KPI label="Receita UTM (Checkout)" value={`R$ ${realRevenue.toLocaleString()}`} color="text-emerald-400" />
        <KPI label="ROAS Real" value={realROAS.toFixed(2)} color={realROAS > 2 ? 'text-emerald-400' : 'text-red-400'} />
        <KPI label="Vendas via Search" value={String(searchOrders.length)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Impression Share */}
        <div className="md:col-span-2">
          <Card title="Parcela de Impressão por Campanha">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byCampaign} layout="vertical">
                <XAxis type="number" tick={{fill:'#64748b',fontSize:10}} domain={[0,100]} unit="%" />
                <YAxis type="category" dataKey="name" width={140} tick={{fill:'#94a3b8',fontSize:9}} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="impressionShare" name="IS %" stackId="a" fill="#22d3ee" radius={[0,0,0,0]} />
                <Bar dataKey="isLostBudget" name="Perdida (Orçamento)" stackId="a" fill="#fbbf24" />
                <Bar dataKey="isLostRank" name="Perdida (Rank)" stackId="a" fill="#f87171" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Match type pie */}
        <Card title="Gasto por Correspondência">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byMatch} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35}
                label={({name,percent})=>`${name} ${((percent||0)*100).toFixed(0)}%`}
                labelLine={{stroke:'#334155'}}
                stroke="#020617" strokeWidth={2}>
                {byMatch.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `R$ ${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Search Terms Table */}
      <Card title="Top 10 Termos de Pesquisa (por Gasto)">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/50">
                {['Termo','Correspondência','Gasto','Conversões','CPA','Status'].map(h =>
                  <th key={h} className="text-left px-2 py-2.5 text-slate-500 font-semibold text-[10px] uppercase tracking-wider">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {byTerm.map((t,i) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-2 py-2.5 text-slate-200 font-medium">{t.term}</td>
                  <td className="px-2 py-2.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      t.matchType==='broad' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}>{t.matchType==='exact'?'Exata':t.matchType==='phrase'?'Frase':'Ampla'}</span>
                  </td>
                  <td className="px-2 py-2.5 text-slate-400">R$ {t.spend.toLocaleString()}</td>
                  <td className="px-2 py-2.5 text-slate-400">{t.conversions}</td>
                  <td className="px-2 py-2.5 font-semibold" style={{color: t.cpa>500?'#f87171':t.cpa>250?'#fbbf24':'#34d399'}}>
                    {t.cpa===Infinity?'∞':`R$ ${t.cpa}`}
                  </td>
                  <td className="px-2 py-2.5">
                    {t.conversions===0 && t.spend>200
                      ? <span className="text-red-400 font-semibold text-[10px]">⚠ Desperdício</span>
                      : <span className="text-emerald-400 font-semibold text-[10px]">✓ OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {byCampaign.filter(c => c.isLostBudget > 25 && c.roas > 2).map((c,i) => (
          <Alert key={i} color="amber" title={`"Asfixia Orçamentária" — ${c.name}`}
            text={`ROAS de ${c.roas} mas ${c.isLostBudget}% de IS Perdida por orçamento. Realocar verba aqui.`} />
        ))}
        {byCampaign.filter(c => c.isBrand).map((c,i) => (
          <Alert key={i} color="red" title={`Marca misturada — ${c.name}`}
            text={`Termos de marca estão em campanha Non-Brand. CPA mascarado: R$ ${c.cpa}. Isolar em campanha de proteção.`} />
        ))}
      </div>
    </div>
  )
}

function KPI({label,value,color='text-white'}: {label:string,value:string,color?:string}) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/40 rounded-xl p-4 backdrop-blur-sm">
      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2">{label}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  )
}

function Card({title,children}: {title:string,children:React.ReactNode}) {
  return (
    <div className="bg-slate-900/50 border border-slate-700/40 rounded-xl p-5 backdrop-blur-sm">
      <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  )
}

const alertColors: Record<string, string> = {
  amber: 'border-l-amber-400 bg-amber-500/5',
  red: 'border-l-red-400 bg-red-500/5',
  cyan: 'border-l-cyan-400 bg-cyan-500/5',
}
const alertTextColors: Record<string, string> = {
  amber: 'text-amber-400',
  red: 'text-red-400',
  cyan: 'text-cyan-400',
}

function Alert({color,title,text}: {color:string,title:string,text:string}) {
  return (
    <div className={`border border-slate-700/30 border-l-2 rounded-lg p-4 ${alertColors[color] || alertColors.cyan}`}>
      <div className={`text-xs font-bold mb-1 ${alertTextColors[color] || alertTextColors.cyan}`}>{title}</div>
      <div className="text-[10px] text-slate-400 leading-relaxed">{text}</div>
    </div>
  )
}
