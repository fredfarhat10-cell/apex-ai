// Plaid-specific type definitions

export interface PlaidAccount {
  account_id: string
  balances: {
    available: number | null
    current: number | null
    limit: number | null
    iso_currency_code: string
    unofficial_currency_code: string | null
  }
  mask: string
  name: string
  official_name: string | null
  type: "depository" | "credit" | "loan" | "investment" | "other"
  subtype: string
}

export interface PlaidTransaction {
  transaction_id: string
  account_id: string
  amount: number
  iso_currency_code: string
  date: string
  name: string
  merchant_name: string | null
  category: string[] | null
  category_id: string | null
  pending: boolean
  payment_channel: "online" | "in store" | "other"
}

export interface PlaidInvestmentHolding {
  account_id: string
  security_id: string
  institution_price: number
  institution_price_as_of: string | null
  institution_value: number
  cost_basis: number | null
  quantity: number
  iso_currency_code: string
  unofficial_currency_code: string | null
}

export interface PlaidSecurity {
  security_id: string
  isin: string | null
  cusip: string | null
  sedol: string | null
  institution_security_id: string | null
  institution_id: string | null
  proxy_security_id: string | null
  name: string
  ticker_symbol: string | null
  is_cash_equivalent: boolean
  type: string
  close_price: number | null
  close_price_as_of: string | null
  iso_currency_code: string
  unofficial_currency_code: string | null
}

export interface PlaidLinkToken {
  link_token: string
  expiration: string
  request_id: string
}

export interface PlaidItem {
  item_id: string
  institution_id: string | null
  webhook: string | null
  error: any | null
  available_products: string[]
  billed_products: string[]
  consent_expiration_time: string | null
  update_type: string
}

export interface PlaidAccessTokenResponse {
  access_token: string
  item_id: string
  request_id: string
}
