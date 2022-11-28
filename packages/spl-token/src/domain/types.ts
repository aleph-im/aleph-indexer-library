export type MintEventsFilters = {
  startDate: number
  endDate: number
  types?: string[]
  limit?: number
  reverse?: boolean
  skip?: number
}

export type MintAccount = {
  mint: string
  timestamp: number
}
