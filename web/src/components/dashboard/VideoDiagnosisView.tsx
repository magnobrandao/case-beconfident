import type { YouTubeAdData, DemandGenData, CheckoutOrder } from '../../data/mock/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'

interface Props { ytData: YouTubeAdData[], dgData: DemandGenData[], checkout: CheckoutOrder[] }

export function VideoDiagnosisView({ ytData, dgData, checkout }: Props) {
  // YouTube: by channel category
  const byChannel = Object.values(ytData.reduce((acc, d) => {
    const k = d.channel_category
    if (!acc[k]) acc[k] = {name: k==='kids'?'Infantil':k==='music'?'Música':k==='podcast'?'Podcast':k==='competitor'?'Concorrentes':'Relevante', spend: 0, views: 0, clicks: 0}
    acc[k].spend += d.spend; acc[k].views += d.views; acc[k].clicks += d.clicks
    return acc
  }, {} as Record<string, any>)).map((c: any) => ({...c, spend: +c.spend.toFixed(0), cpc: c.clicks > 0 ? +(c.spend/c.clicks).toFixed(2) : 0}))

  // YouTube: by device
  const byDevice = Object.values(ytData.reduce((acc, d) => {
    const k = d.device
    if (!acc[k]) acc[k] = {name: k==='mobile'?'Mobile':k==='desktop'?'Desktop':'Smart TV', spend: 0, clicks: 0, conversions: 0}
    acc[k].spend += d.spend; acc[k].clicks += d.clicks
    return acc
  }, {} as Record<string, any>)).map((d: any) => ({...d, spend: +d.spend.toFixed(0)}))

  // YouTube: retention funnel avg
  const totalViews = ytData.reduce((s, d) => s + d.views, 0)
  const funnel = [
    {stage: 'Views', pct: 100},
    {stage: '25%', pct: totalViews > 0 ? +(ytData.reduce((s,d) => s+d.views_25pct, 0)/totalViews*100).toFixed(1) : 0},
    {stage: '50%', pct: totalViews > 0 ? +(ytData.reduce((s,d) => s+d.views_50pct, 0)/totalViews*100).toFixed(1) : 0},
    {stage: '75%', pct: totalViews > 0 ? +(ytData.reduce((s,d) => s+d.views_75pct, 0)/totalViews*100).toFixed(1) : 0},
    {stage: '100%', pct: totalViews > 0 ? +(ytData.reduce((s,d) => s+d.views_100pct, 0)/totalViews*100).toFixed(1) : 0},
  ]

  // DemandGen: by asset type
  const byAsset = Object.values(dgData.reduce((acc, d) => {
    const k = d.asset_type
    if (!acc[k]) acc[k] = {name: k==='video'?'Vídeo':'Imagem Estática', spend: 0, clicks: 0, conv: 0}
    acc[k].spend += d.spend; acc[k].clicks += d.clicks; acc[k].conv += d.conversions
    return acc
  }, {} as Record<string, any>)).map((a: any) => ({
    ...a, spend: +a.spend.toFixed(0), cpa: a.conv > 0 ? +(a.spend/a.conv).toFixed(0) : 0,
    ctr: a.clicks > 0 && a.spend > 0 ? +((a.clicks/(a.spend/5))*100).toFixed(2) : 0
  }))

  // DemandGen: by audience
  const byAudience = Object.values(dgData.reduce((acc, d) => {
    const k = d.audience_source
    const name = k==='all_visitors'?'Todos Visitantes':k==='customer_match'?'Customer Match':'Lookalike'
    if (!acc[k]) acc[k] = {name, spend: 0, conv: 0}
    acc[k].spend += d.spend; acc[k].conv += d.conversions
    return acc
  }, {} as Record<string, any>)).map((a: any) => ({...a, spend: +a.spend.toFixed(0), cpa: a.conv > 0 ? +(a.spend/a.conv).toFixed(0) : 0}))

  const COLORS = ['#66fcf1','#fbbf24','#ef4444','#a78bfa','#34d399']

  return (
    <div style={{padding:20,display:'flex',flexDirection:'column',gap:24}}>
      <h2 style={{fontSize:20,fontWeight:700,color:'#fff'}}>Diagnóstico YouTube Ads & Demand Gen</h2>

      {/* YouTube Section */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
        <Card title="Gasto por Categoria de Canal (YouTube)">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={byChannel} dataKey="spend" nameKey="name" cx="50%" cy="50%" outerRadius={65}
                label={({name,percent}: any)=>`${name} ${(percent*100).toFixed(0)}%`}>
                {byChannel.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{background:'#1a1a1a',border:'1px solid #333',color:'#fff',fontSize:11}} formatter={(v: any)=>`R$ ${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Gasto por Dispositivo (YouTube)">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byDevice}>
              <XAxis dataKey="name" tick={{fill:'#999',fontSize:10}} />
              <YAxis tick={{fill:'#666',fontSize:10}} />
              <Tooltip contentStyle={{background:'#1a1a1a',border:'1px solid #333',color:'#fff',fontSize:11}} />
              <Bar dataKey="spend" name="Gasto" fill="#66fcf1">
                {byDevice.map((_,i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Funil de Retenção (YouTube)">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={funnel}>
              <XAxis dataKey="stage" tick={{fill:'#999',fontSize:10}} />
              <YAxis tick={{fill:'#666',fontSize:10}} domain={[0,100]} unit="%" />
              <Tooltip contentStyle={{background:'#1a1a1a',border:'1px solid #333',color:'#fff',fontSize:11}} />
              <Bar dataKey="pct" name="Retenção %">
                {funnel.map((_,i) => <Cell key={i} fill={i===0?'#66fcf1':i<3?'#fbbf24':'#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Demand Gen Section */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <Card title="Performance por Tipo de Recurso (Demand Gen)">
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr style={{borderBottom:'1px solid #333'}}>
              {['Formato','Gasto','Cliques','Conversões','CPA'].map(h =>
                <th key={h} style={{textAlign:'left',padding:'8px 6px',color:'#888',fontWeight:600,fontSize:9,textTransform:'uppercase'}}>{h}</th>
              )}
            </tr></thead>
            <tbody>
              {byAsset.map((a,i) => (
                <tr key={i} style={{borderBottom:'1px solid #1a1a1a'}}>
                  <td style={{padding:'8px 6px',color:'#ddd'}}>{a.name}</td>
                  <td style={cs}>R$ {a.spend.toLocaleString()}</td>
                  <td style={cs}>{a.clicks}</td>
                  <td style={cs}>{a.conv}</td>
                  <td style={{...cs,color:a.cpa>300?'#ef4444':a.cpa>0?'#66fcf1':'#666'}}>{a.cpa > 0 ? `R$ ${a.cpa}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="CPA por Audiência (Demand Gen)">
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={byAudience} layout="vertical">
              <XAxis type="number" tick={{fill:'#666',fontSize:10}} />
              <YAxis type="category" dataKey="name" width={120} tick={{fill:'#999',fontSize:10}} />
              <Tooltip contentStyle={{background:'#1a1a1a',border:'1px solid #333',color:'#fff',fontSize:11}} />
              <Bar dataKey="cpa" name="CPA">
                {byAudience.map((_,i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Alerts */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {byChannel.find(c => c.name === 'Infantil' && c.spend > 500) && (
          <Alert color="#ef4444" title='"Hemorragia Infantil"'
            text={`R$ ${byChannel.find(c=>c.name==='Infantil')!.spend.toLocaleString()} drenados em canais infantis. Aplicar lista de exclusão de +10.000 canais.`} />
        )}
        {byDevice.find(d => d.name === 'Smart TV' && d.spend > 300) && (
          <Alert color="#ef4444" title='"Desperdício Smart TV"'
            text={`R$ ${byDevice.find(d=>d.name==='Smart TV')!.spend.toLocaleString()} em Smart TVs sem possibilidade de clique real. Remover imediatamente.`} />
        )}
        {byAsset.find(a => a.name === 'Imagem Estática' && a.cpa > 300) && (
          <Alert color="#fbbf24" title='"Armadilha Estática" (Demand Gen)'
            text={`Imagens estáticas com CPA de R$ ${byAsset.find(a=>a.name==='Imagem Estática')!.cpa}. Pausar e forçar orçamento em formatos de vídeo.`} />
        )}
      </div>
    </div>
  )
}

const cs: React.CSSProperties = {padding:'8px 6px',color:'#999'}

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
