import { useState, useMemo } from 'react'
import type { MetaAdData } from '../../data/mock/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis } from 'recharts'

interface Props { data: MetaAdData[] }

type Level = 'campaign' | 'adset' | 'creative'
type SortKey = 'spend' | 'hookRate' | 'holdRate' | 'ctr' | 'cpm' | 'cpa' | 'frequency'

export function MetaDiagnosisView({ data }: Props) {
  const [level, setLevel] = useState<Level>('creative')
  const [sortBy, setSortBy] = useState<SortKey>('spend')
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc')
  const [selectedCampaign, setSelectedCampaign] = useState<string>('')
  const [selectedAdset, setSelectedAdset] = useState<string>('')
  const [minSpend, setMinSpend] = useState(100)

  const aggregate = useMemo(() => {
    let filtered = data
    if (selectedCampaign) filtered = filtered.filter(d => d.campaign_name === selectedCampaign)
    if (selectedAdset) filtered = filtered.filter(d => d.adset_name === selectedAdset)

    const groupKey = (d: MetaAdData) => {
      if (level === 'campaign') return d.campaign_name
      if (level === 'adset') return `${d.campaign_name} → ${d.adset_name}`
      return d.ad_name
    }

    const groups = filtered.reduce((acc, d) => {
      const k = groupKey(d)
      if (!acc[k]) acc[k] = { name: k, spend: 0, impressions: 0, views3s: 0, views25: 0, views50: 0, views75: 0, views100: 0, clicks: 0, conversions: 0, reach: 0, count: 0, lowestCost: 0, limited: 0, edits: 0, format: d.creative_format }
      acc[k].spend += d.spend; acc[k].impressions += d.impressions; acc[k].views3s += d.views_3s
      acc[k].views25 += d.views_25pct; acc[k].views50 += d.views_50pct; acc[k].views75 += d.views_75pct; acc[k].views100 += d.views_100pct
      acc[k].clicks += d.clicks; acc[k].conversions += d.conversions; acc[k].reach += d.reach; acc[k].count++
      if (d.bid_strategy === 'lowest_cost') acc[k].lowestCost++
      if (d.learning_status === 'limited') acc[k].limited++
      acc[k].edits += d.edits_last_7d
      return acc
    }, {} as Record<string, any>)

    return Object.values(groups).map((c: any) => ({
      name: c.name, format: c.format,
      spend: +c.spend.toFixed(0),
      hookRate: c.impressions > 0 ? +((c.views3s / c.impressions) * 100).toFixed(1) : 0,
      holdRate: c.views3s > 0 ? +((c.views25 / c.views3s) * 100).toFixed(1) : 0,
      cpa: c.conversions > 0 ? +(c.spend / c.conversions).toFixed(0) : 0,
      ctr: c.impressions > 0 ? +((c.clicks / c.impressions) * 100).toFixed(2) : 0,
      cpm: c.impressions > 0 ? +(c.spend / c.impressions * 1000).toFixed(0) : 0,
      frequency: c.reach > 0 ? +(c.impressions / c.reach).toFixed(1) : 0,
      conversions: c.conversions, impressions: c.impressions,
      retentionFunnel: c.views3s > 0 ? { v25: +((c.views25/c.views3s)*100).toFixed(0), v50: +((c.views50/c.views3s)*100).toFixed(0), v75: +((c.views75/c.views3s)*100).toFixed(0), v100: +((c.views100/c.views3s)*100).toFixed(0) } : null,
      pctLimited: c.count > 0 ? +((c.limited/c.count)*100).toFixed(0) : 0,
    }))
    .filter(c => c.spend >= minSpend)
    .sort((a: any,b: any) => sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy])
  }, [data, level, sortBy, sortDir, selectedCampaign, selectedAdset, minSpend])

  const campaigns = [...new Set(data.map(d => d.campaign_name))]
  const adsets = [...new Set(data.filter(d => !selectedCampaign || d.campaign_name === selectedCampaign).map(d => d.adset_name))]

  const hc = (v: number) => v > 35 ? '#66fcf1' : v > 15 ? '#fbbf24' : '#ef4444'
  const holdC = (v: number) => v > 40 ? '#66fcf1' : v > 20 ? '#fbbf24' : '#ef4444'
  const cpaC = (v: number) => v === 0 ? '#555' : v > 300 ? '#ef4444' : v > 200 ? '#fbbf24' : '#66fcf1'

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(key); setSortDir('desc') }
  }

  const sortIcon = (key: SortKey) => sortBy === key ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''

  return (
    <div style={{padding:20,display:'flex',flexDirection:'column',gap:20}}>
      {/* Controls Row */}
      <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{display:'flex',background:'#1a1a1a',borderRadius:6,overflow:'hidden',border:'1px solid #333'}}>
          {(['creative','adset','campaign'] as Level[]).map(l => (
            <button key={l} onClick={()=>setLevel(l)}
              style={{padding:'7px 14px',fontSize:11,fontWeight:level===l?700:400,color:level===l?'#0d0d0d':'#999',background:level===l?'#66fcf1':'transparent',border:'none',cursor:'pointer'}}>
              {l==='creative'?'Criativos':l==='adset'?'Conjuntos':'Campanhas'}
            </button>
          ))}
        </div>

        <Sel label="Campanha" value={selectedCampaign} options={[{v:'',l:'Todas'},...campaigns.map(c=>({v:c,l:c.length>30?c.slice(0,30)+'…':c}))]}
          onChange={v => { setSelectedCampaign(v); setSelectedAdset('') }} />
        <Sel label="Conjunto" value={selectedAdset} options={[{v:'',l:'Todos'},...adsets.map(a=>({v:a,l:a}))]}
          onChange={setSelectedAdset} />

        <div style={{display:'flex',flexDirection:'column',gap:2}}>
          <label style={{fontSize:9,color:'#666',textTransform:'uppercase',letterSpacing:1}}>Gasto Mín.</label>
          <input type="number" value={minSpend} onChange={e=>setMinSpend(+e.target.value)}
            style={{background:'#1a1a1a',border:'1px solid #333',borderRadius:4,padding:'5px 8px',color:'#ccc',fontSize:11,width:70,outline:'none'}} />
        </div>

        <div style={{marginLeft:'auto',fontSize:10,color:'#555'}}>{aggregate.length} itens · Nível: {level==='creative'?'Criativos':level==='adset'?'Conjuntos':'Campanhas'}</div>
      </div>

      {/* Scatter Plot: Hook Rate vs Hold Rate (creative level reveals patterns) */}
      {level === 'creative' && (
        <Card title="Mapa Hook Rate × Hold Rate × Gasto (por Criativo)">
          <div style={{fontSize:10,color:'#666',marginBottom:8}}>⬤ Verde = CPA bom · ⬤ Amarelo = CPA médio · ⬤ Vermelho = CPA alto · Tamanho = Gasto</div>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{left:10,bottom:10}}>
              <XAxis type="number" dataKey="hookRate" name="Hook Rate" unit="%" tick={{fill:'#666',fontSize:10}} label={{value:'Hook Rate %',position:'bottom',fill:'#666',fontSize:10}} />
              <YAxis type="number" dataKey="holdRate" name="Hold Rate" unit="%" tick={{fill:'#666',fontSize:10}} label={{value:'Hold Rate %',angle:-90,position:'insideLeft',fill:'#666',fontSize:10}} />
              <ZAxis type="number" dataKey="spend" range={[40,400]} />
              <Tooltip cursor={{strokeDasharray:'3 3'}} contentStyle={{background:'#1a1a1a',border:'1px solid #333',color:'#fff',fontSize:11}}
                formatter={(v: any,n: string)=>[typeof v==='number'?v.toFixed(1):v,n]} labelFormatter={()=>''} />
              <Scatter data={aggregate.filter(a=>a.format==='video')} name="Criativos">
                {aggregate.filter(a=>a.format==='video').map((e,i) => <Cell key={i} fill={cpaC(e.cpa)} opacity={0.8} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Main Table */}
      <Card title={`Análise por ${level==='creative'?'Criativo':level==='adset'?'Conjunto':'Campanha'}`}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead>
              <tr style={{borderBottom:'1px solid #333'}}>
                <TH>Nome</TH>
                <TH sortable onClick={()=>handleSort('spend')}>Gasto{sortIcon('spend')}</TH>
                <TH sortable onClick={()=>handleSort('hookRate')}>Hook%{sortIcon('hookRate')}</TH>
                <TH sortable onClick={()=>handleSort('holdRate')}>Hold%{sortIcon('holdRate')}</TH>
                <TH sortable onClick={()=>handleSort('ctr')}>CTR%{sortIcon('ctr')}</TH>
                <TH sortable onClick={()=>handleSort('cpm')}>CPM{sortIcon('cpm')}</TH>
                <TH sortable onClick={()=>handleSort('cpa')}>CPA{sortIcon('cpa')}</TH>
                <TH sortable onClick={()=>handleSort('frequency')}>Freq{sortIcon('frequency')}</TH>
                <TH>Retenção</TH>
                <TH>Status</TH>
              </tr>
            </thead>
            <tbody>
              {aggregate.map((r,i) => (
                <tr key={i} style={{borderBottom:'1px solid #141414',transition:'background 0.15s'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='#151515')}
                  onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                  <td style={{padding:'8px 6px',color:'#ddd',fontWeight:500,maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.name}</td>
                  <td style={cs}>R$ {r.spend.toLocaleString()}</td>
                  <td style={{...cs,color:hc(r.hookRate),fontWeight:600}}>{r.hookRate > 0 ? `${r.hookRate}%` : '—'}</td>
                  <td style={{...cs,color:holdC(r.holdRate),fontWeight:600}}>{r.holdRate > 0 ? `${r.holdRate}%` : '—'}</td>
                  <td style={cs}>{r.ctr}%</td>
                  <td style={cs}>R$ {r.cpm}</td>
                  <td style={{...cs,color:cpaC(r.cpa),fontWeight:600}}>{r.cpa > 0 ? `R$ ${r.cpa}` : '—'}</td>
                  <td style={{...cs,color:r.frequency>3?'#ef4444':'#999'}}>{r.frequency}</td>
                  <td style={cs}>
                    {r.retentionFunnel ? (
                      <div style={{display:'flex',gap:2,alignItems:'center'}}>
                        {[{l:'25',v:r.retentionFunnel.v25},{l:'50',v:r.retentionFunnel.v50},{l:'75',v:r.retentionFunnel.v75},{l:'100',v:r.retentionFunnel.v100}].map((s,j) => (
                          <div key={j} style={{background:`rgba(102,252,241,${Math.min(+s.v/100,1)*0.6+0.1})`,borderRadius:3,padding:'2px 4px',fontSize:9,color:'#fff',minWidth:28,textAlign:'center'}}>{s.v}%</div>
                        ))}
                      </div>
                    ) : <span style={{color:'#555'}}>N/A</span>}
                  </td>
                  <td style={cs}>
                    {r.hookRate > 35 && r.holdRate < 25 && <Tag color="#fbbf24">Falso Campeão</Tag>}
                    {r.hookRate < 15 && r.holdRate > 40 && <Tag color="#66fcf1">Diamante Bruto</Tag>}
                    {r.pctLimited > 50 && <Tag color="#ef4444">Limited</Tag>}
                    {r.frequency > 3 && <Tag color="#ef4444">Saturado</Tag>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Chart: Top creatives by selected metric */}
      <Card title={`Ranking por ${sortBy === 'hookRate' ? 'Hook Rate' : sortBy === 'holdRate' ? 'Hold Rate' : sortBy === 'ctr' ? 'CTR' : sortBy === 'cpm' ? 'CPM' : sortBy === 'cpa' ? 'CPA' : sortBy === 'frequency' ? 'Frequência' : 'Gasto'}`}>
        <ResponsiveContainer width="100%" height={Math.max(aggregate.slice(0,12).length * 28, 100)}>
          <BarChart data={aggregate.slice(0,12)} layout="vertical" margin={{left:10}}>
            <XAxis type="number" tick={{fill:'#666',fontSize:10}} />
            <YAxis type="category" dataKey="name" width={180} tick={{fill:'#999',fontSize:9}} />
            <Tooltip contentStyle={{background:'#1a1a1a',border:'1px solid #333',color:'#fff',fontSize:11}} />
            <Bar dataKey={sortBy} name={sortBy}>
              {aggregate.slice(0,12).map((_,i) => <Cell key={i} fill={i < 3 ? '#66fcf1' : i < 6 ? '#fbbf24' : '#555'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

const cs: React.CSSProperties = {padding:'8px 6px',color:'#999',fontSize:11}

function TH({children,sortable,onClick}: {children:React.ReactNode,sortable?:boolean,onClick?:()=>void}) {
  return <th onClick={onClick} style={{textAlign:'left',padding:'8px 6px',color:'#888',fontWeight:600,fontSize:9,textTransform:'uppercase' as const,letterSpacing:0.5,cursor:sortable?'pointer':'default',userSelect:'none'}}>{children}</th>
}

function Card({title,children}: {title:string,children:React.ReactNode}) {
  return (
    <div style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:8,padding:16}}>
      <h3 style={{fontSize:12,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:1,marginBottom:12}}>{title}</h3>
      {children}
    </div>
  )
}

function Tag({color,children}: {color:string,children:React.ReactNode}) {
  return <span style={{display:'inline-block',background:`${color}22`,color,fontSize:9,fontWeight:600,padding:'2px 6px',borderRadius:4,marginRight:4}}>{children}</span>
}

function Sel({label,value,options,onChange}: {label:string,value:string,options:{v:string,l:string}[],onChange:(v:string)=>void}) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:2}}>
      <label style={{fontSize:9,color:'#666',textTransform:'uppercase',letterSpacing:1}}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{background:'#1a1a1a',border:'1px solid #333',borderRadius:4,padding:'5px 8px',color:'#ccc',fontSize:11,outline:'none',cursor:'pointer',maxWidth:200}}>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  )
}
