import type { Filters } from '../../data/mock/types'

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  campaigns: string[]
}

export function FilterBar({ filters, onChange, campaigns }: Props) {
  const upd = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })
  const sel = (val: string, key: keyof Filters) => upd({ [key]: val } as any)

  return (
    <div style={{display:'flex',flexWrap:'wrap',gap:10,padding:'14px 20px',background:'#111',borderBottom:'1px solid #1a1a1a',alignItems:'center'}}>
      {/* Period */}
      <Select label="Período" value={filters.period} options={[
        {v:'7d',l:'7 dias'},{v:'14d',l:'14 dias'},{v:'30d',l:'30 dias'},{v:'60d',l:'60 dias'}
      ]} onChange={v => sel(v,'period')} />

      {/* Platform */}
      <Select label="Plataforma" value={filters.platform} options={[
        {v:'all',l:'Todas'},{v:'meta',l:'Meta Ads'},{v:'google_search',l:'Google Search'},{v:'demand_gen',l:'Demand Gen'},{v:'youtube',l:'YouTube Ads'}
      ]} onChange={v => sel(v,'platform')} />

      {/* Campaign */}
      <Select label="Campanha" value={filters.campaigns[0]||'all'} options={[
        {v:'all',l:'Todas'}, ...campaigns.map(c => ({v:c,l:c}))
      ]} onChange={v => upd({campaigns: v==='all' ? [] : [v]})} />

      {/* Match Type */}
      {(filters.platform==='all'||filters.platform==='google_search') && (
        <Select label="Correspondência" value={filters.matchType} options={[
          {v:'all',l:'Todas'},{v:'exact',l:'Exata'},{v:'phrase',l:'Frase'},{v:'broad',l:'Ampla'}
        ]} onChange={v => sel(v,'matchType')} />
      )}

      {/* Creative Format */}
      {(filters.platform==='all'||filters.platform==='meta'||filters.platform==='youtube') && (
        <Select label="Formato" value={filters.creativeFormat} options={[
          {v:'all',l:'Todos'},{v:'video',l:'Vídeo'},{v:'image',l:'Imagem'},{v:'carousel',l:'Carrossel'}
        ]} onChange={v => sel(v,'creativeFormat')} />
      )}

      {/* Device */}
      <Select label="Dispositivo" value={filters.device} options={[
        {v:'all',l:'Todos'},{v:'mobile',l:'Mobile'},{v:'desktop',l:'Desktop'},{v:'smart_tv',l:'Smart TV'}
      ]} onChange={v => sel(v,'device')} />

      {/* UTM Source */}
      <div style={{display:'flex',flexDirection:'column',gap:2}}>
        <label style={{fontSize:9,color:'#666',textTransform:'uppercase',letterSpacing:1}}>UTM Source</label>
        <input
          value={filters.utmSource}
          onChange={e => upd({utmSource: e.target.value})}
          placeholder="ex: facebook"
          style={{background:'#1a1a1a',border:'1px solid #333',borderRadius:4,padding:'5px 8px',color:'#ccc',fontSize:11,width:110,outline:'none'}}
        />
      </div>
    </div>
  )
}

function Select({label,value,options,onChange}: {label:string,value:string,options:{v:string,l:string}[],onChange:(v:string)=>void}) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:2}}>
      <label style={{fontSize:9,color:'#666',textTransform:'uppercase',letterSpacing:1}}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{background:'#1a1a1a',border:'1px solid #333',borderRadius:4,padding:'5px 8px',color:'#ccc',fontSize:11,outline:'none',cursor:'pointer'}}>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  )
}
