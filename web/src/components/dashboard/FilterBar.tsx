import type { Filters } from '../../data/mock/types'
import { Filter } from 'lucide-react'

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  campaigns: string[]
}

export function FilterBar({ filters, onChange, campaigns }: Props) {
  const upd = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })
  const sel = (val: string, key: keyof Filters) => upd({ [key]: val } as any)

  return (
    <div className="flex flex-wrap items-center gap-2 p-2">
      <div className="flex items-center gap-2 text-slate-500 mr-2">
         <Filter size={16} />
         <span className="text-xs font-semibold uppercase tracking-wider hidden md:block">Filtros:</span>
      </div>

      <Select value={filters.period} options={[
        {v:'7d',l:'7 dias'},{v:'14d',l:'14 dias'},{v:'30d',l:'30 dias'},{v:'60d',l:'60 dias'}
      ]} onChange={v => sel(v,'period')} />

      <Select value={filters.platform} options={[
        {v:'all',l:'Todas Plataformas'},{v:'meta',l:'Meta Ads'},{v:'google_search',l:'Google Search'},{v:'demand_gen',l:'Demand Gen'},{v:'youtube',l:'YouTube'}
      ]} onChange={v => sel(v,'platform')} />

      <Select value={filters.campaigns[0]||'all'} options={[
        {v:'all',l:'Todas as Campanhas'}, ...campaigns.map(c => ({v:c,l:c.length > 20 ? c.slice(0,20)+'…' : c}))
      ]} onChange={v => upd({campaigns: v==='all' ? [] : [v]})} />

      {(filters.platform==='all'||filters.platform==='google_search') && (
        <Select value={filters.matchType} options={[
          {v:'all',l:'Correspondência (Opc)'},{v:'exact',l:'Exata'},{v:'phrase',l:'Frase'},{v:'broad',l:'Ampla'}
        ]} onChange={v => sel(v,'matchType')} />
      )}

      {(filters.platform==='all'||filters.platform==='meta'||filters.platform==='youtube') && (
        <Select value={filters.creativeFormat} options={[
          {v:'all',l:'Formato (Opc)'},{v:'video',l:'Vídeo'},{v:'image',l:'Imagem'},{v:'carousel',l:'Carrossel'}
        ]} onChange={v => sel(v,'creativeFormat')} />
      )}

      <Select value={filters.device} options={[
        {v:'all',l:'Dispositivo (Opc)'},{v:'mobile',l:'Mobile'},{v:'desktop',l:'Desktop'},{v:'smart_tv',l:'Smart TV'}
      ]} onChange={v => sel(v,'device')} />

      <input
        value={filters.utmSource}
        onChange={e => upd({utmSource: e.target.value})}
        placeholder="UTM..."
        className="bg-transparent border border-slate-700 hover:border-slate-500 transition-colors rounded-full px-4 py-1.5 text-xs text-slate-300 outline-none w-28 placeholder:text-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
      />
    </div>
  )
}

function Select({value,options,onChange}: {value:string,options:{v:string,l:string}[],onChange:(v:string)=>void}) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      className="bg-transparent border border-slate-700 hover:border-slate-500 transition-colors rounded-full px-3 py-1.5 text-xs text-slate-300 outline-none cursor-pointer appearance-none pr-8 relative focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
      style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '12px' }}
    >
      {options.map(o => <option key={o.v} value={o.v} className="bg-slate-900 text-slate-300">{o.l}</option>)}
    </select>
  )
}
