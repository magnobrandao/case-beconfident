// Types for the entire mock data system

export interface CheckoutOrder {
  id: string
  date: string
  revenue: number
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  device: 'mobile' | 'desktop' | 'smart_tv'
}

export interface MetaAdData {
  campaign_id: string
  campaign_name: string
  adset_name: string
  ad_name: string
  date: string
  spend: number
  impressions: number
  reach: number
  frequency: number
  clicks: number
  ctr: number
  cpm: number
  views_3s: number
  views_25pct: number
  views_50pct: number
  views_75pct: number
  views_100pct: number
  conversions: number
  bid_strategy: 'lowest_cost' | 'cost_cap' | 'bid_cap'
  learning_status: 'active' | 'limited' | 'exited'
  edits_last_7d: number
  creative_format: 'video' | 'image' | 'carousel'
  utm_campaign: string
  utm_content: string
}

export interface GoogleSearchData {
  campaign_id: string
  campaign_name: string
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  match_type: 'exact' | 'phrase' | 'broad'
  search_term: string
  impression_share: number
  is_lost_budget: number
  is_lost_rank: number
  is_brand: boolean
  bid_strategy: 'target_cpa' | 'target_roas' | 'maximize_conversions'
  bid_status: 'learning' | 'limited' | 'eligible'
  utm_campaign: string
  utm_content: string
}

export interface YouTubeAdData {
  campaign_id: string
  campaign_name: string
  date: string
  spend: number
  impressions: number
  views: number
  view_rate: number
  cpv: number
  clicks: number
  ctr: number
  views_25pct: number
  views_50pct: number
  views_75pct: number
  views_100pct: number
  channel_category: 'relevant' | 'kids' | 'music' | 'podcast' | 'competitor'
  device: 'mobile' | 'desktop' | 'smart_tv'
  creative_format: 'horizontal' | 'vertical' | 'static'
  audience_type: 'custom_intent' | 'remarketing' | 'lookalike' | 'placement'
  utm_campaign: string
  utm_content: string
}

export interface DemandGenData {
  campaign_id: string
  campaign_name: string
  date: string
  spend: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpa: number
  asset_type: 'video' | 'static_image'
  asset_rating: 'low' | 'good' | 'best'
  audience_source: 'all_visitors' | 'customer_match' | 'lookalike'
  expansion_level: 'narrow' | 'balanced' | 'broad'
  placement: 'youtube_infeed' | 'shorts' | 'gmail' | 'discover'
  utm_campaign: string
  utm_content: string
}

export interface Filters {
  period: '7d' | '14d' | '30d' | '60d'
  platform: 'all' | 'meta' | 'google_search' | 'demand_gen' | 'youtube'
  campaigns: string[]
  matchType: 'all' | 'exact' | 'phrase' | 'broad'
  creativeFormat: 'all' | 'video' | 'image' | 'carousel' | 'static'
  device: 'all' | 'mobile' | 'desktop' | 'smart_tv'
  utmSource: string
}
