import { useState, useMemo } from 'react'
import type { MetaAdData } from '../../data/mock/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis } from 'recharts'

interface Props { data: MetaAdData[] }

type Level = 'campaign' | 'adset' | 'creative'
type SortKey = 'spend' | 'hookRate' | 'holdRate' | 'ctr' | 'cpm' | 'cpa' | 'frequency'

const tooltipStyle = { background: '#0f172a', border: '1px solid #1e293b', color: '#e2e8f0', fontSize: 11, borderRadius: 10 }

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

  const hc = (v: number) => v > 35 ? '#34d399' : v > 15 ? '#fbbf24' : '#f87171'
  const holdC = (v: number) => v > 40 ? '#34d399' : v > 20 ? '#fbbf24' : '#f87171'
  const cpaC = (v: number) => v === 0 ? '#475569' : v > 300 ? '#f87171' : v > 200 ? '#fbbf24' : '#34d399'

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(key); setSortDir('desc') }
  }

  const sortIcon = (key: SortKey) => sortBy === key ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''

  return (
    <div className="flex flex-col gap-5">
      {/* Controls Row */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex bg-slate-800/60 rounded-lg overflow-hidden border border-slate-700/50">
          {(['creative','adset','campaign'] as Level[]).map(l => (
            <button key={l} onClick={()=>setLevel(l)}
              className={`px-4 py-2 text-xs font-semibold transition-all ${level===l ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
              {l==='creative'?'Criativos':l==='adset'?'Conjuntos':'Campanhas'}
            </button>
          ))}
        </div>

        <Sel label="Campanha" value={selectedCampaign} options={[{v:'',l:'Todas'},...campaigns.map(c=>({v:c,l:c.length>25?c.slice(0,25)+'…':c}))]}
          onChange={v => { setSelectedCampaign(v); setSelectedAdset('') }} />
        <Sel label="Conjunto" value={selectedAdset} options={[{v:'',l:'Todos'},...adsets.map(a=>({v:a,l:a.length>20?a.slice(0,20)+'…':a}))]}
          onChange={setSelectedAdset} />

        <div className="flex flex-col gap-0.5">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Gasto Mín.</label>
          <input type="number" value={minSpend} onChange={e=>setMinSpend(+e.target.value)}
            className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-slate-300 text-xs w-20 outline-none focus:border-cyan-500 transition-colors" />
        </div>

        <div className="ml-auto text-[10px] text-slate-500 font-medium">{aggregate.length} itens · {level==='creative'?'Criativos':level==='adset'?'Conjuntos':'Campanhas'}</div>
      </div>

      {/* Scatter Plot */}
      {level === 'creative' && (
        <Card title="Mapa Hook Rate × Hold Rate × Gasto (por Criativo)">
          <div className="text-[10px] text-slate-500 mb-3 flex gap-4 flex-wrap">
            <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1"></span>CPA bom</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1"></span>CPA médio</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1"></span>CPA alto</span>
            <span className="text-slate-600">Tamanho = Gasto</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{left:10,bottom:10}}>
              <XAxis type="number" dataKey="hookRate" name="Hook Rate" unit="%" tick={{fill:'#64748b',fontSize:10}} label={{value:'Hook Rate %',position:'bottom',fill:'#64748b',fontSize:10}} />
              <YAxis type="number" dataKey="holdRate" name="Hold Rate" unit="%" tick={{fill:'#64748b',fontSize:10}} label={{value:'Hold Rate %',angle:-90,position:'insideLeft',fill:'#64748b',fontSize:10}} />
              <ZAxis type="number" dataKey="spend" range={[40,400]} />
              <Tooltip cursor={{strokeDasharray:'3 3'}} contentStyle={tooltipStyle}
                formatter={(v: any,n: any)=>[typeof v==='number'?v.toFixed(1):v, String(n)]} labelFormatter={()=>''} />
              <Scatter data={aggregate.filter(a=>a.format==='video')} name="Criativos">
                {aggregate.filter(a=>a.format==='video').map((e,i) => <Cell key={i} fill={cpaC(e.cpa)} opacity={0.85} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Main Table */}
      <Card title={`Análise por ${level==='creative'?'Criativo':level==='adset'?'Conjunto':'Campanha'}`}>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/50">
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
                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-2 py-2.5 text-slate-200 font-medium max-w-[200px] truncate">{r.name}</td>
                  <td className="px-2 py-2.5 text-slate-400">R$ {r.spend.toLocaleString()}</td>
                  <td className="px-2 py-2.5 font-semibold" style={{color:hc(r.hookRate)}}>{r.hookRate > 0 ? `${r.hookRate}%` : '—'}</td>
                  <td className="px-2 py-2.5 font-semibold" style={{color:holdC(r.holdRate)}}>{r.holdRate > 0 ? `${r.holdRate}%` : '—'}</td>
                  <td className="px-2 py-2.5 text-slate-400">{r.ctr}%</td>
                  <td className="px-2 py-2.5 text-slate-400">R$ {r.cpm}</td>
                  <td className="px-2 py-2.5 font-semibold" style={{color:cpaC(r.cpa)}}>{r.cpa > 0 ? `R$ ${r.cpa}` : '—'}</td>
                  <td className="px-2 py-2.5" style={{color:r.frequency>3?'#f87171':'#64748b'}}>{r.frequency}</td>
                  <td className="px-2 py-2.5">
                    {r.retentionFunnel ? (
                      <div className="flex gap-1 items-center">
                        {[{l:'25',v:r.retentionFunnel.v25},{l:'50',v:r.retentionFunnel.v50},{l:'75',v:r.retentionFunnel.v75},{l:'100',v:r.retentionFunnel.v100}].map((s,j) => (
                          <div key={j} className="rounded px-1.5 py-0.5 text-[9px] text-white min-w-[28px] text-center font-medium"
                            style={{background:`rgba(34,211,238,${Math.min(+s.v/100,1)*0.5+0.1})`}}>{s.v}%</div>
                        ))}
                      </div>
                    ) : <span className="text-slate-600">N/A</span>}
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {r.hookRate > 35 && r.holdRate < 25 && <Tag color="amber">Falso Campeão</Tag>}
                      {r.hookRate < 15 && r.holdRate > 40 && <Tag color="cyan">Diamante Bruto</Tag>}
                      {r.pctLimited > 50 && <Tag color="red">Limited</Tag>}
                      {r.frequency > 3 && <Tag color="red">Saturado</Tag>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Chart */}
      <Card title={`Ranking por ${sortBy === 'hookRate' ? 'Hook Rate' : sortBy === 'holdRate' ? 'Hold Rate' : sortBy === 'ctr' ? 'CTR' : sortBy === 'cpm' ? 'CPM' : sortBy === 'cpa' ? 'CPA' : sortBy === 'frequency' ? 'Frequência' : 'Gasto'}`}>
        <ResponsiveContainer width="100%" height={Math.max(aggregate.slice(0,12).length * 30, 100)}>
          <BarChart data={aggregate.slice(0,12)} layout="vertical" margin={{left:10}}>
            <XAxis type="number" tick={{fill:'#64748b',fontSize:10}} />
            <YAxis type="category" dataKey="name" width={160} tick={{fill:'#94a3b8',fontSize:9}} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey={sortBy} name={sortBy} radius={[0, 4, 4, 0]}>
              {aggregate.slice(0,12).map((_,i) => <Cell key={i} fill={i < 3 ? '#22d3ee' : i < 6 ? '#fbbf24' : '#334155'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

function TH({children,sortable,onClick}: {children:React.ReactNode,sortable?:boolean,onClick?:()=>void}) {
  return (
    <th onClick={onClick}
      className={`text-left px-2 py-2.5 text-slate-500 font-semibold text-[10px] uppercase tracking-wider select-none ${sortable ? 'cursor-pointer hover:text-slate-300 transition-colors' : ''}`}>
      {children}
    </th>
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

const tagColors: Record<string, string> = {
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
}

function Tag({color,children}: {color:string,children:React.ReactNode}) {
  return <span className={`inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full border ${tagColors[color] || tagColors.cyan}`}>{children}</span>
}

function Sel({label,value,options,onChange}: {label:string,value:string,options:{v:string,l:string}[],onChange:(v:string)=>void}) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)}
        className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-slate-300 text-xs outline-none cursor-pointer max-w-[180px] focus:border-cyan-500 transition-colors">
        {options.map(o => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
      </select>
    </div>
  )
}
