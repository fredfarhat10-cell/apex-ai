import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json()

    // In production, this would call the actual Plaid API
    // For demo, return mock investment holdings
    const mockHoldings = [
      {
        account_id: "acc_investment_001",
        security_id: "sec_aapl",
        institution_price: 185.5,
        institution_price_as_of: "2025-01-24",
        institution_value: 18550.0,
        cost_basis: 15000.0,
        quantity: 100,
        iso_currency_code: "USD",
        unofficial_currency_code: null,
      },
      {
        account_id: "acc_investment_001",
        security_id: "sec_msft",
        institution_price: 420.25,
        institution_price_as_of: "2025-01-24",
        institution_value: 21012.5,
        cost_basis: 18000.0,
        quantity: 50,
        iso_currency_code: "USD",
        unofficial_currency_code: null,
      },
    ]

    const mockSecurities = [
      {
        security_id: "sec_aapl",
        isin: "US0378331005",
        cusip: "037833100",
        sedol: null,
        institution_security_id: null,
        institution_id: null,
        proxy_security_id: null,
        name: "Apple Inc.",
        ticker_symbol: "AAPL",
        is_cash_equivalent: false,
        type: "equity",
        close_price: 185.5,
        close_price_as_of: "2025-01-24",
        iso_currency_code: "USD",
        unofficial_currency_code: null,
      },
      {
        security_id: "sec_msft",
        isin: "US5949181045",
        cusip: "594918104",
        sedol: null,
        institution_security_id: null,
        institution_id: null,
        proxy_security_id: null,
        name: "Microsoft Corporation",
        ticker_symbol: "MSFT",
        is_cash_equivalent: false,
        type: "equity",
        close_price: 420.25,
        close_price_as_of: "2025-01-24",
        iso_currency_code: "USD",
        unofficial_currency_code: null,
      },
    ]

    return NextResponse.json({ holdings: mockHoldings, securities: mockSecurities })
  } catch (error) {
    console.error("[v0] Error fetching investments:", error)
    return NextResponse.json({ error: "Failed to fetch investments" }, { status: 500 })
  }
}
