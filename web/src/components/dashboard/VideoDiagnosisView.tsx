import type { YouTubeAdData, DemandGenData, CheckoutOrder } from '../../data/mock/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'

interface Props { ytData: YouTubeAdData[], dgData: DemandGenData[], checkout: CheckoutOrder[] }

const tooltipStyle = { background: '#0f172a', border: '1px solid #1e293b', color: '#e2e8f0', fontSize: 11, borderRadius: 10 }

export function VideoDiagnosisView({ ytData, dgData }: Props) {
  const byChannel = Object.values(ytData.reduce((acc, d) => {
    const k = d.channel_category
    if (!acc[k]) acc[k] = {name: k==='kids'?'Infantil':k==='music'?'Música':k==='podcast'?'Podcast':k==='competitor'?'Concorrentes':'Relevante', spend: 0, views: 0, clicks: 0}
    acc[k].spend += d.spend; acc[k].views += d.views; acc[k].clicks += d.clicks
    return acc
  }, {} as Record<string, any>)).map((c: any) => ({...c, spend: +c.spend.toFixed(0), cpc: c.clicks > 0 ? +(c.spend/c.clicks).toFixed(2) : 0}))

  const byDevice = Object.values(ytData.reduce((acc, d) => {
    const k = d.device
    if (!acc[k]) acc[k] = {name: k==='mobile'?'Mobile':k==='desktop'?'Desktop':'Smart TV', spend: 0, clicks: 0, conversions: 0}
    acc[k].spend += d.spend; acc[k].clicks += d.clicks
    return acc
  }, {} as Record<string, any>)).map((d: any) => ({...d, spend: +d.spend.toFixed(0)}))

  const totalViews = ytData.reduce((s, d) => s + d.views, 0)
  const funnel = [
    {stage: 'Views', pct: 100},
    {stage: '25%', pct: totalViews > 0 ? +(ytData.reduce((s,d) => s+d.views_25pct, 0)/totalViews*100).toFixed(1) : 0},
    {stage: '50%', pct: totalViews > 0 ? +(ytData.reduce((s,d) => s+d.views_50pct, 0)/totalViews*100).toFixed(1) : 0},
    {stage: '75%', pct: totalViews > 0 ? +(ytData.reduce((s,d) => s+d.views_75pct, 0)/totalViews*100).toFixed(1) : 0},
    {stage: '100%', pct: totalViews > 0 ? +(ytData.reduce((s,d) => s+d.views_100pct, 0)/totalViews*100).toFixed(1) : 0},
  ]

  const byAsset = Object.values(dgData.reduce((acc, d) => {
    const k = d.asset_type
    if (!acc[k]) acc[k] = {name: k==='video'?'Vídeo':'Imagem Estática', spend: 0, clicks: 0, conv: 0}
    acc[k].spend += d.spend; acc[k].clicks += d.clicks; acc[k].conv += d.conversions
    return acc
  }, {} as Record<string, any>)).map((a: any) => ({
    ...a, spend: +a.spend.toFixed(0), cpa: a.conv > 0 ? +(a.spend/a.conv).toFixed(0) : 0,
    ctr: a.clicks > 0 && a.spend > 0 ? +((a.clicks/(a.spend/5))*100).toFixed(2) : 0
  }))

  const byAudience = Object.values(dgData.reduce((acc, d) => {
    const k = d.audience_source
    const name = k==='all_visitors'?'Todos Visitantes':k==='customer_match'?'Customer Match':'Lookalike'
    if (!acc[k]) acc[k] = {name, spend: 0, conv: 0}
    acc[k].spend += d.spend; acc[k].conv += d.conversions
    return acc
  }, {} as Record<string, any>)).map((a: any) => ({...a, spend: +a.spend.toFixed(0), cpa: a.conv > 0 ? +(a.spend/a.conv).toFixed(0) : 0}))

  const COLORS = ['#22d3ee','#fbbf24','#f87171','#a78bfa','#34d399']

  return (
    <div className="flex flex-col gap-5">

      {/* YouTube Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Gasto por Categoria de Canal (YouTube)">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byChannel} dataKey="spend" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={30}
                label={({name,percent}: any)=>`${name} ${(percent*100).toFixed(0)}%`}
                labelLine={{stroke:'#334155'}}
                stroke="#020617" strokeWidth={2}>
                {byChannel.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any)=>`R$ ${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Gasto por Dispositivo (YouTube)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byDevice}>
              <XAxis dataKey="name" tick={{fill:'#94a3b8',fontSize:10}} />
              <YAxis tick={{fill:'#64748b',fontSize:10}} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="spend" name="Gasto" radius={[6,6,0,0]}>
                {byDevice.map((_,i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Funil de Retenção (YouTube)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={funnel}>
              <XAxis dataKey="stage" tick={{fill:'#94a3b8',fontSize:10}} />
              <YAxis tick={{fill:'#64748b',fontSize:10}} domain={[0,100]} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="pct" name="Retenção %" radius={[6,6,0,0]}>
                {funnel.map((_,i) => <Cell key={i} fill={i===0?'#22d3ee':i<3?'#fbbf24':'#f87171'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Demand Gen Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Performance por Tipo de Recurso (Demand Gen)">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Formato','Gasto','Cliques','Conversões','CPA'].map(h =>
                    <th key={h} className="text-left px-2 py-2.5 text-slate-500 font-semibold text-[10px] uppercase tracking-wider">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {byAsset.map((a,i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-2 py-2.5 text-slate-200 font-medium">{a.name}</td>
                    <td className="px-2 py-2.5 text-slate-400">R$ {a.spend.toLocaleString()}</td>
                    <td className="px-2 py-2.5 text-slate-400">{a.clicks}</td>
                    <td className="px-2 py-2.5 text-slate-400">{a.conv}</td>
                    <td className="px-2 py-2.5 font-semibold" style={{color:a.cpa>300?'#f87171':a.cpa>0?'#34d399':'#475569'}}>
                      {a.cpa > 0 ? `R$ ${a.cpa}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="CPA por Audiência (Demand Gen)">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={byAudience} layout="vertical">
              <XAxis type="number" tick={{fill:'#64748b',fontSize:10}} />
              <YAxis type="category" dataKey="name" width={120} tick={{fill:'#94a3b8',fontSize:10}} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="cpa" name="CPA" radius={[0,6,6,0]}>
                {byAudience.map((_,i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {byChannel.find(c => c.name === 'Infantil' && c.spend > 500) && (
          <Alert color="red" title='"Hemorragia Infantil"'
            text={`R$ ${byChannel.find(c=>c.name==='Infantil')!.spend.toLocaleString()} drenados em canais infantis. Aplicar lista de exclusão de +10.000 canais.`} />
        )}
        {byDevice.find(d => d.name === 'Smart TV' && d.spend > 300) && (
          <Alert color="red" title='"Desperdício Smart TV"'
            text={`R$ ${byDevice.find(d=>d.name==='Smart TV')!.spend.toLocaleString()} em Smart TVs sem possibilidade de clique real. Remover imediatamente.`} />
        )}
        {byAsset.find(a => a.name === 'Imagem Estática' && a.cpa > 300) && (
          <Alert color="amber" title='"Armadilha Estática" (Demand Gen)'
            text={`Imagens estáticas com CPA de R$ ${byAsset.find(a=>a.name==='Imagem Estática')!.cpa}. Pausar e forçar orçamento em formatos de vídeo.`} />
        )}
      </div>
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
