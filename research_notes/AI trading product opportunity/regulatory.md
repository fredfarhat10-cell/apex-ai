# Legal and Regulatory Landscape for an AI Trading Decision Product (UK primary; EU, US secondary)

Research notes compiled 25 October 2026. This is research, not legal advice.

**Method and source caveat.** Direct page fetching (WebFetch/curl) was blocked in this session, so every primary source (FCA Handbook, legislation.gov.uk, EUR-Lex, SEC/CFTC releases) is cited by URL as surfaced in search results. Content comes from search-result extracts and from law-firm or trade-press summaries of those primary documents. Where a claim rests only on a secondary summary, the label says so.

**Labels used.**
- **Verified**: a primary source (regulator or statute) says it, confirmed by two or more consistent reports.
- **Strong evidence**: reputable law-firm or regulator-adjacent summaries agree.
- **Anecdotal**: a single secondary source, a forum post or trade press.
- **Speculative**: my inference.
- **Unknown**: not found.

---

## Q1. UK cryptoasset regime status in 2026: activities, consultations, timeline, MLR registration

### Takeaway
The UK FSMA cryptoasset regime is law (SI 2026/102, made 4 Feb 2026). The FCA's final rules came out on 30 June 2026. The authorisation gateway opened on 30 Sep 2026 and closes on 28 Feb 2027, and the regime goes live on **25 Oct 2027**. Until go-live, MLR registration is still the operating requirement. The new activities are trading platform, dealing as principal, dealing as agent, arranging, safeguarding, staking and lending/borrowing. **Advising on and managing unbacked "qualifying cryptoassets" were NOT added as regulated activities.** This is the single most important fact for a UK crypto-decision product.

### Cited Findings
- **Verified.** The governing instrument is The Financial Services and Markets Act 2000 (Cryptoassets) Regulations 2026 (SI 2026/102), made 4 Feb 2026. It amends the RAO to define "qualifying cryptoassets", "qualifying stablecoins" and "specified investment cryptoassets". Preparatory provisions took effect on 26 Feb 2026, and full commencement is scheduled for 25 Oct 2027 — [Regulation Tomorrow (Feb 2026)](https://www.regulationtomorrow.com/2026/02/financial-services-and-markets-act-2000-cryptoassets-regulations-2026-published/); [CMS](https://cms.law/en/gbr/regulatory-news/the-financial-services-and-markets-act-2000-cryptoassets-regulations-2026-102)
- **Strong evidence.** New regulated activities: issuing qualifying stablecoins, safeguarding, operating a qualifying cryptoasset trading platform, dealing as principal, dealing as agent, arranging deals in qualifying cryptoassets, and staking — [Regulation Tomorrow](https://www.regulationtomorrow.com/2026/02/financial-services-and-markets-act-2000-cryptoassets-regulations-2026-published/); [HSF Kramer on HMT amendments](https://www.hsfkramer.com/notes/fsrandcorpcrime/2026-posts/new-uk-cryptoasset-regime-hmt-proposes-amendments-to-cryptoassets-regulations-for-stablecoin-payment-services)
- **Strong evidence.** Advice and management were not extended. Freshfields: "the existing regulated activities of managing investments and advising on specified investments have not been expanded to capture qualifying cryptoassets". Both remain regulated for "specified investment cryptoassets" such as tokenised shares or bonds — [Freshfields, "Drawing the Line" (2026)](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/drawing-the-line-navigating-the-fcas-new-cryptoasset-perimeter-guidance-102mvlt). This is consistent with HMT's Feb 2023 position that it did "not currently propose to bring portfolio management or investment advice in relation to cryptoassets within the scope of regulation" — [Sidley (Feb 2023)](https://www.sidley.com/zh-hans/insights/newsupdates/2023/02/uk-proposes-regulatory-regime-for-cryptoassets)
- **Verified.** On 30 June 2026 the FCA published five policy statements: PS26/9 (admissions and disclosures, and the market abuse regime for cryptoassets, "MARC"), PS26/10 (stablecoin issuance), PS26/11 (regulated cryptoasset activities), PS26/12 (prudential) and PS26/13 (application of the wider Handbook) — [Freshfields "Set in stone" (Jul 2026)](https://www.freshfields.com/en/our-thinking/briefings/2026/07/set-in-stone-five-landmark-crypto-policy-statements); [FCA PS26/11 PDF](https://www.fca.org.uk/publication/policy/ps26-11.pdf); [Regulation Tomorrow (Jun 2026)](https://www.regulationtomorrow.com/2026/06/fca-publishes-cryptoassets-regime-policy-statements-finalised-guidance-and-two-further-guidance-consultations/)
- **Verified.** Application window: 30 Sep 2026 to 28 Feb 2027 — [FCA authorisations webinar Q&A (Feb 2026)](https://www.fca.org.uk/publication/documents/cryptoassets-regulation-authorisations-introductory-webinar-qa-jan-2026.pdf); [Latham UK Cryptoasset Regulatory Tracker](https://www.lw.com/en/uk-cryptoasset-regulatory-tracker)
- **Strong evidence.** Existing firms that apply late and are not determined by go-live enter a transitional provision. Under it they cannot onboard new UK customers or take on new business with existing ones until authorised — [Latham "The Race Is On"](https://www.lw.com/en/insights/the-race-is-on-fca-publishes-final-rules-for-uk-cryptoasset-regime)
- **Strong evidence.** PS26/11 content:
  - Staking for retail is allowed, with pre-contract risk disclosure and express prior consent.
  - Retail lending and borrowing gets appropriateness tests, over-collateralisation and negative balance protection.
  - Best execution expects checks across at least three UK-authorised venues where possible, and client orders must go to UK-authorised execution venues.
  - Some requirements are deferred to Jan 2028, with a further proposed deferral to Apr 2028.

  Sources: [Simmons & Simmons on PS26/11](https://www.simmons-simmons.com/en/publications/cmrvg8szg00cquom8p3dhehn8/ps-26-11-crypto-regime-regulated); [Pinsent Masons Out-Law](https://www.pinsentmasons.com/out-law/analysis/fca-finalises-cryptoasset-regime-2027-authorisation-deadline)
- **Strong evidence.** Consultation lineage:
  - CP25/14 covered stablecoin issuance and custody.
  - CP25/25 (Sep 2025) covered applying the Handbook to crypto activities. It proposed applying the Consumer Duty to all regulated crypto activities, except trading between participants on a trading platform.
  - CP26/4 confirmed the intent to apply PRIN 2A (the Consumer Duty) to crypto firms as for other FSMA firms.

  Sources: [FCA CP25/25](https://www.fca.org.uk/publications/consultation-papers/cp25-25-application-handbook-regulated-cryptoasset-activities/printable/print); [Burges Salmon](https://www.burges-salmon.com/articles/102modr/fca-consults-on-the-handbooks-application-to-regulated-cryptoassets); [PwC](https://www.pwc.co.uk/industries/financial-services/understanding-regulatory-developments/fca-proposes-consumer-protection-for-cryptoassets.html)
- **Verified.** MLR registration still applies until go-live. FCA: "until the new FSMA regime starts, firms must continue to comply with the requirement to be registered with us under the MLRs". There is "no automatic conversion" to FSMA authorisation, and firms wanting MLR registration after 30 Sep 2026 should contact pre-application support first — [FCA MLR-ahead-of-FSMA page](https://www.fca.org.uk/firms/new-regime-cryptoasset-regulation/registration-under-mlrs-ahead-new-fsma-regime/printable/print); [Regulation Tomorrow (Mar 2026)](https://www.regulationtomorrow.com/2026/03/fca-webpage-on-cryptoasset-firms-registration-under-the-mlrs-ahead-of-the-new-regime/)
- **Strong evidence.** HMT draft amending SI and policy note, 21 Apr 2026:
  - Carves UK qualifying stablecoins out of dealing and arranging.
  - Repeals the MLR provisions that let FCA-registered crypto firms approve their own financial promotions.

  A further draft "(Cryptoassets) (Miscellaneous Amendments) Regulations 2026" was laid in Sep 2026. Sources: [Regulation Tomorrow (Apr 2026)](https://www.regulationtomorrow.com/2026/04/hmt-issues-policy-note-and-draft-si-on-amendments-to-the-financial-services-and-markets-act-2000-cryptoassets-regulations-2026/); [Reed Smith](https://www.reedsmith.com/articles/hm-treasury-proposes-some-welcome-amendments-to-the-new-uk-cryptoasset-regime-to-support-uk-stablecoin-development/); [Regulation Tomorrow (Sep 2026)](https://www.regulationtomorrow.com/2026/09/draft-si-the-financial-services-and-markets-act-2000-cryptoassets-miscellaneous-amendments-regulations-2026/)

### Inferences
- **Speculative.** A UK firm that only gives views, signals or analytics on unbacked crypto (BTC, ETH) is probably outside the FSMA authorisation perimeter, both today and after Oct 2027, because advising and managing were not extended. It is still inside the **financial promotions** regime (Q3) and, from Oct 2027, inside the market abuse regime (Q8).
- **Speculative.** The perimeter risk moves to **arranging** and **dealing as agent** in qualifying cryptoassets. These are what a tool that places or routes orders could trigger (Q6).
- **Speculative.** MLR registration is aimed at exchange and custodial-wallet providers. A non-custodial software or analytics business is unlikely to need it, but check the MLR reg 14A definitions before relying on that.

### Gaps
- I could not read the PS26/11 or PS26/13 text directly, so final Consumer Duty carve-outs and the exact deferral dates are from summaries.
- Whether the Sep 2026 Miscellaneous Amendments SI has been made, and in what form, is Unknown.

---

## Q2. When does a tool become "advising", "managing" or "arranging" (UK PERG); signals services, robo-advice, performance fees

### Takeaway
For **specified investments** (shares, ETFs, crypto ETNs, CFDs, tokenised securities), long-standing PERG 8 guidance says software that generates specific buy/sell/hold signals on particular investments is, as a general rule, **regulated advice** (RAO art. 53) by the software provider. The exception is where users set enough parameters that the signals are effectively generated by the user. For crypto, the new PERG 18 (PS26/18, 16 Sep 2026) reads "arranging" broadly: giving users a way to place orders is likely to be arranging. A narrow technical-service exclusion (draft Art. 9Z2A) is out for consultation until 18 Nov 2026.

### Cited Findings
- **Strong evidence.** PERG 8.30:
  - "Some software services involve the generation of specific buy, sell or hold signals relating to particular investments. These signals are liable, as a general rule, to be advice for the purposes of article 53(1) (as well as financial promotions) given by the person responsible for the provision of the software."
  - The exception applies where "the user of the software is required to use enough control over the setting of parameters and inputting of information for the signals to be regarded as having been generated by him rather than by the software itself".
  - The medium makes no difference, except for periodicals, broadcasts and news services.

  Source: [FCA Handbook PERG 8.30](https://handbook.fca.org.uk/handbook/PERG/8/30.html). The text was surfaced via search and the version is dated 2016, so check the live text.
- **Strong evidence.** PERG 8.30B (personal recommendations, updated Mar 2026) covers when advice is a "personal recommendation". Advice given on a website is generally unlikely to be one — [FCA Handbook PERG 8.30B](https://handbook.fca.org.uk/handbook/PERG/8/30B.html). The FCA describes "generic advice" as advice that does not relate to a particular investment — [FCA Advice Unit tools](https://www.fca.org.uk/firms/innovation/advice-unit-tools)
- **Verified.** PS26/18 "Cryptoasset perimeter guidance", 16 Sep 2026, adds the new PERG 18 — [FCA PS26/18](https://www.fca.org.uk/publications/policy-statements/ps26-18-cryptoasset-perimeter-guidance); [FCA PS26/18 PDF](https://www.fca.org.uk/publication/policy/ps26-18.pdf)
- **Strong evidence.** Commentary on PS26/18 and its April draft (CP26/13):
  - Giving users a way to place orders is likely to be regulated arranging.
  - Firms offering users "connectivity to trading functionality" may need authorisation.
  - Giving users the means to send orders and receive confirmations "may amount to both forms of arranging".
  - There is "no general technical services exclusion" for arranging in qualifying cryptoassets.

  Sources: [The Industry Spread](https://theindustryspread.com/fca-ps26-18-crypto-perimeter-guidance-article-9z2a-front-ends/); [Fintech & Digital Assets blog (Apr 2026)](https://www.fintechanddigitalassets.com/2026/04/fca-consultation-on-cryptoasset-perimeter-guidance-key-points-for-defi-and-web3-user-interfaces-and-wallets/); [FCA CP26/13](https://www.fca.org.uk/publication/consultation/cp26-13.pdf); [Skadden (May 2026)](https://www.skadden.com/insights/publications/2026/05/fca-consults-on-cryptoasset)
- **Strong evidence.** CP26/36 (opened 21 Oct 2026, closes 18 Nov 2026) consults on PERG changes for a proposed Art. 9Z2A exclusion. It would cover a provider that is not authorised and not a PSP and "merely provides a technical service" enabling access to a third party's services or to a decentralised protocol, that is, non-discretionary technical interfaces. Final guidance is expected early or spring 2027; sources conflict on the date — [FCA CP26/36](https://www.fca.org.uk/publications/consultation-papers/cp26-36-cryptoasset-perimeter-guidance); [The Industry Spread on CP26/36](https://theindustryspread.com/cp26-36-sets-the-tests-for-cryptoasset-exclusions/); [Freshfields "Patrolling the perimeter"](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/patrolling-the-perimeter-final-fca-perimeter-guidance-and-amendments-to-the-uk-c-102o3mc); [HSF Kramer](https://www.hsfkramer.com/notes/fsrandcorpcrime/2026-posts/new-uk-cryptoasset-regime-greater-clarity-on-regulatory-perimeter-as-fca-authorisation-application-gateway-opens)
- **Strong evidence (EU analogue that UK practitioners often cite).** ESMA's Supervisory Briefing on Copy Trading (30 Mar 2023) classifies copy trading as portfolio management or investment advice. Where "order execution is automatic and does not require any further action from the client", it is portfolio management. It builds on a June 2012 ESMA Q&A on automatic execution of trade signals — [ESMA35-42-1428](https://www.esma.europa.eu/sites/default/files/2023-03/ESMA35-42-1428_Supervisory_Briefing_on_Copy_Trading.pdf); [ESMA press release](https://www.esma.europa.eu/node/200553)
- **Anecdotal.** The FCA regularly lists unauthorised "copy trading" and Telegram signal operators on its warning list (e.g. "@Noah - CopyTrades", "FX Copy Trading", batches in Jan and Sep 2026). It also listed AI-bot sites "fexobot.com" and "orexbot.com" on 14 May 2026 — [FCA warning: @Noah - CopyTrades](https://www.fca.org.uk/news/warnings/noah-copytrades); [FCA warning: FX Copy Trading](https://www.fca.org.uk/news/warnings/fx-copy-trading-fxcopytradingnet); [anwalt24 on Fexobot](https://www.anwalt24.de/fachartikel/kapitalmarktrecht/62557)

### Inferences
- **Speculative (high confidence).** UK equities, ETFs, crypto ETNs:
  - A tool that outputs "Buy TSLA now" or "Sell X" is generally regulated advice unless the user configures the strategy.
  - "We decide and execute on your account" is managing investments (RAO art. 37) plus dealing as agent or arranging. That needs full Part 4A authorisation with capital, SM&CR and Consumer Duty.
  - Robo-advice is fully regulated, with suitability under COBS 9.
- **Speculative.** Crypto (qualifying cryptoassets):
  - Signals and opinions are outside the advice and management perimeter, but are financial promotions.
  - Auto-execution software that sends orders to an exchange is at real risk of being "arranging", and possibly "dealing as agent" from 25 Oct 2027, unless the final Art. 9Z2A exclusion covers non-discretionary interfaces.
  - A discretionary AI that decides trades on the user's behalf is unlikely to be "non-discretionary". It falls outside the exclusion as drafted.
- **Speculative.** Performance fees:
  - Charging a share of profits ties pay to trading outcomes on the user's account. That strengthens the argument that the firm is managing or acting as agent, not just licensing software.
  - For specified investments, authorised managers may charge performance fees subject to COBS disclosure and Consumer Duty fair-value rules.
  - A flat SaaS subscription is the more defensible "software vendor" posture.
- **Speculative.** The "user sets the parameters" exception in PERG 8.30 is a design lever. A strategy builder or backtester where the user picks the rules and assets sits closer to the exception than an "AI picks for you" feed.

### Gaps
- I could not read the PERG 18 text, so whether it specifically addresses API-key trading bots is Unknown. Commentary says neither bots nor API-only access is dealt with explicitly.
- No FCA-specific copy-trading guidance (UK equivalent of ESMA's briefing) was found.

---

## Q3. UK financial promotions for crypto (since 8 Oct 2023), FG24/1 finfluencers, and marketing a public paper-trading record

### Takeaway
Any UK-facing communication that invites or induces crypto investment is a financial promotion under s21 FSMA, and that includes marketing a crypto signals or bot product with performance claims. It must be:
- made by an authorised person,
- approved by an authorised s21 approver,
- made by an MLR-registered crypto firm (a route HMT now proposes to repeal), or
- exempt.

Breach is a criminal offence (up to 2 years in prison). Crypto is a Restricted Mass Market Investment, with risk warnings, a 24h cooling-off period, appropriateness tests and an incentive ban. FG24/1 extends this to influencers and affiliates.

### Cited Findings
- **Strong evidence.** The crypto financial promotion regime has been in force since 8 Oct 2023 (PS23/6, FCA 2023/27). Crypto is a "restricted mass market investment", which brings risk warnings, a ban on incentives (e.g. refer-a-friend bonuses), cooling-off, client categorisation and appropriateness. It applies to firms marketing to UK consumers "whether based in the UK or overseas" — [Elliptic](https://www.elliptic.co/blog/analysis/fca-introduces-tough-new-rules-for-marketing-cryptoassets); [CMS](https://cms.law/en/gbr/legal-updates/fca-publishes-final-rules-and-supplementary-draft-guidance-on-financial-promotions-for-cryptoassets2); [White & Case](https://whitecase.com/node/115726)
- **Verified.** FG24/1 (26 Mar 2024) is the finalised guidance on financial promotions on social media. It replaces FG15/4 and explains when influencers and affiliate marketers fall within s21 — [FCA FG24/1](https://fca.org.uk/publications/finalised-guidance/fg24-1-finalised-guidance-financial-promotions-social-media)
- **Strong evidence.** Breaching s21 is a criminal offence: up to 2 years' imprisonment and/or a fine (s25 FSMA). Firms are liable for affiliates they "cause" to communicate (s21(13)) — [Bratby Law](https://bratby.law/finfluencer-financial-promotions-section-21-fsma/); [A&O Shearman "The reel cost"](https://www.aoshearman.com/en/insights/ao-shearman-on-investigations/the-reel-cost-fca-cracks-down-on-finfluencers)
- **Strong evidence.** June 2025 international finfluencer action week: in the UK, 3 arrests, criminal proceedings against 3 individuals, 7 cease-and-desist letters and 50 warning alerts. Nine individuals were charged in 2024 over a social-media-promoted unauthorised FX scheme — [A&O Shearman](https://www.aoshearman.com/en/insights/ao-shearman-on-investigations/the-reel-cost-fca-cracks-down-on-finfluencers)
- **Strong evidence.** The HMT April 2026 draft SI repeals the MLR provisions that let FCA-registered crypto firms approve their own promotions — [Regulation Tomorrow (Apr 2026)](https://www.regulationtomorrow.com/2026/04/hmt-issues-policy-note-and-draft-si-on-amendments-to-the-financial-services-and-markets-act-2000-cryptoassets-regulations-2026/)
- **Strong evidence.** Crypto ETNs: the FCA lifted the retail ban on crypto ETNs effective **8 Oct 2025**, for products on the Official List traded on a UK RIE. They are RMMIs, with no FSCS cover. The retail ban on **crypto derivatives remains** — [FCA press release](https://www.fca.org.uk/news/press-releases/fca-opens-retail-access-crypto-etns); [Regulation Tomorrow (Oct 2025)](https://www.regulationtomorrow.com/2025/10/fca-provides-information-for-firms-looking-to-offer-cetns/); [Charles Russell Speechlys](https://www.charlesrussellspeechlys.com/en/insights/expert-insights/financial-services/2025/fca-reopens-retail-access-to-crypto-etns-a-strategic-turning-point-for-regulated-crypto-exposure/)

### Inferences
- **Speculative.** Publishing a "paper-trading" or live performance track record to promote a crypto or stock tool is very likely to be a financial promotion if it encourages users to trade. Approved or authorised communications would then need past- or simulated-performance disclosures; the COBS 4.6 standards are the benchmark. An unapproved UK-targeted "our AI made +240%" post is the single fastest route to a criminal-offence problem for an unauthorised UK founder.
- **Speculative.** A pure "journal / research tool" marketed on features (logging, analytics, backtesting), with no return claims and no "trade crypto" call to action, has a better chance of falling outside "invitation or inducement". The line is fact-specific.
- **Speculative.** Because the crypto derivatives ban remains, any product feature that routes UK retail users into crypto perps or futures, even on offshore exchanges, is high risk, both as promotion and for Consumer Duty optics.

### Gaps
- No 2025–26 enforcement case specifically against a crypto signals or bot marketer under the crypto promotion rules was found.
- Whether any 2026 amendments to COBS 4.12A were made is Unknown.

---

## Q4. Prediction markets in the UK (Gambling Commission, FCA), plus Polymarket/Kalshi availability

### Takeaway
UK prediction markets are split:
- Sports and political contracts are **gambling**. The Gambling Commission (4 Feb 2026) said they would likely need a Betting Intermediary licence and cannot classify themselves as non-gambling.
- Financial and some climatic contracts are **FCA** territory. The FCA treats them as binary options, banned for retail since 2019.

Neither Polymarket nor Kalshi is licensed for UK users. The FCA confirmed talks with both on about 6 Oct 2026, but the binary options ban still stands.

### Cited Findings
- **Strong evidence.** Gambling Commission blog, 4 Feb 2026 (Brad Enright):
  - "it would appear current products would fall within the definition of a 'Betting Intermediary'".
  - "we do not believe they would be able to classify themselves as non-gambling products".
  - Unlicensed operators "should take steps to ensure they are not targeting or transacting with consumers in Great Britain".

  Sources: [Gambling Commission blog](https://www.gamblingcommission.gov.uk/blog/post/prediction-markets-heres-what-you-need-to-know) (wording via secondary quotes); [Sigma](https://sigma.world/news/ukgc-prediction-markets-gambling-regulation/); [Gambling.com](https://www.gambling.com/uk/news/are-prediction-markets-legal-in-the-uk)
- **Strong evidence.** Per the FCA 2026 perimeter report, financial prediction-market products it examined are binary options and so stay under the retail ban (in force since Apr 2019). Sports and political contracts go to the Gambling Commission — [Cointelegraph](https://cointelegraph.com/news/uk-financial-watchdog-prediction-markets-ban); [CCN](https://www.ccn.com/news/crypto/polymarket-kalshi-uk-fca-prediction-markets-push-back-gambling/)
- **Anecdotal (relayed from FT/Times).** FCA markets chief Simon Walls confirmed talks with Kalshi and Polymarket around 6 Oct 2026, and the ban remains. Many UK users reportedly reach these platforms via VPN — [The Paypers](https://thepaypers.com/crypto-web3-and-cbdc/news/fca-reportedly-confirms-talks-as-prediction-markets-push-back-on-gambling-label); [Casino.com](https://www.casino.com/news/industry/fca-confirms-prediction-market-talks-as-kalshi-and-polymarket-eye-britain/)

### Inferences
- **Speculative.** Two prediction-market designs are high risk for a UK company:
  - an AI tool that **places** bets or trades on Polymarket/Kalshi for UK users, or markets that ability, because it facilitates unlicensed gambling or banned binary options;
  - a tool that advertises Polymarket/Kalshi to GB users.

  An analytics or odds-research tool, with no execution and no affiliate links, is lower risk but would still attract scrutiny.

### Gaps
- I could not read the FCA perimeter report itself.
- Whether "tipster" or analysis services for prediction markets need any UK licence is Unknown. GB betting tipsters generally do not need a licence, but this was not verified here.

---

## Q5. Operating software where users connect their own exchange API keys (UK, EU, US) and exchange API terms

### Takeaway
"Non-custodial software on the user's own keys" helps a lot on custody and money-transmission questions, but it does not by itself avoid execution-type regulation:
- **UK (from Oct 2027):** arranging, and possibly dealing as agent, for crypto.
- **EU:** MiCA reception and transmission of orders or portfolio management.
- **US:** an investment adviser or CTA if it directs accounts.

Exchanges generally permit third-party key-based bots. Binance banned more than 600 accounts in Oct 2025 for "unauthorized third-party tools", tied mainly to its Alpha events.

### Cited Findings
- **Strong evidence.** UK PERG 18 reads arranging broadly; giving users the means to place orders "is likely to be regulated arranging". The draft Art. 9Z2A exclusion covers only "merely" technical, non-discretionary interfaces — [The Industry Spread](https://theindustryspread.com/fca-ps26-18-crypto-perimeter-guidance-article-9z2a-front-ends/); [FCA CP26/36](https://www.fca.org.uk/publications/consultation-papers/cp26-36-cryptoasset-perimeter-guidance)
- **Strong evidence.** Under MiCA, where a CASP "merely transmits the client's order to a third party" that executes, it provides **reception and transmission of orders** (ESMA Q&A 2653, 14 Oct 2025) — [ESMA Q&A](https://www.esma.europa.eu/print/pdf/node/221381); [MiCA Art. 3 (Springlex)](https://www.springlex.eu/en/packages/mica/mica-regulation/article-3/)
- **Verified.** US FinCEN 2019 guidance (FIN-2019-G001): providers of non-custodial ("unhosted") software wallets, and multi-sig providers who cannot transact unilaterally, are not money transmitters — [FinCEN CVC Guidance (May 2019)](https://www.fincen.gov/sites/default/files/2019-05/FinCEN%20Guidance%20CVC%20FINAL%20508.pdf). This is contested by DOJ positions in the Tornado Cash prosecution — [Lummis–Wyden letter (2024)](https://www.lummis.senate.gov/wp-content/uploads/Lummis-Wyden-Letter-on-Non-Custodial-Crypto-Asset-Software.pdf); [Coin Center](https://www.coincenter.org/when-prosecutors-ignore-the-regulators)
- **Strong evidence.** Non-custodial software generally falls outside state money transmitter definitions, but exemptions are "narrow, inconsistent". About half the states had adopted some or all of the Money Transmission Modernization Act as of Jan 2025 — [Sanction Scanner on MTMA](https://www.sanctionscanner.com/blog/us-money-transmitter-licensing-who-needs-it-and-what-the-mtma-changes-1443); [Global Law Experts](https://globallawexperts.com/crypto-money-transmitter-license-us/)
- **Strong evidence.** Kraken's help centre says its API lets third-party services "such as trading bots, mobile apps and portfolio management services" connect, with users creating and handing over an API key — [Kraken support: using the API with a third-party service](https://support.kraken.com/dk/articles/360041395271-using-the-kraken-api-with-a-third-party-service)
- **Strong evidence.** Coinbase supports OAuth for third-party apps to "act on their behalf". Since 13 May 2025 the Advanced Trade API enforces the portfolio-level permissions users grant to OAuth apps. API use is governed by Coinbase Terms of Use — [Coinbase CDP OAuth access](https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/guides/oauth-access)
- **Strong evidence.** Binance banned more than 600 accounts in Oct 2025 over "unauthorized third-party tools", mainly in Binance Alpha. Forfeiture of Alpha profits was possible — [The Block](https://www.theblock.co/post/375278/binance-bans-more-than-600-accounts-over-unauthorized-third-party-tools). Binance developer docs advise users to "never share your API key/secret key to ANYONE", while Binance.US says sharing with trusted third parties may be required — [Binance dev docs](https://developers.binance.com/legacy-docs/copy_trading/quick-start); [Binance.US support](https://support.binance.us/hc/en-us/articles/9842812)

### Inferences
- **Speculative.** Design principles:
  - Request trade-only keys, never withdrawal permission; this preserves the non-custodial and non-transmitter posture.
  - Prefer exchange OAuth or broker programmes (Coinbase OAuth, exchange "link" programmes) over raw key pasting.
  - Keep keys encrypted client-side if possible.
  - Raw key sharing may breach some exchanges' user terms, which creates account-ban risk for users.
- **Speculative.** The more discretion the AI has (what, when, how much), the more the product looks like management or agency dealing. "User approves each trade" or "user-defined rules executed mechanically" fits the "non-discretionary technical service" framing better.

### Gaps
- I could not read the exact current Binance, Kraken or Coinbase API terms of use on third-party apps, so clause-level restrictions are Unknown.

---

## Q6. EU: MiCA (CASP authorisation, advice on crypto, end of transition), MiFID II, AI Act

### Takeaway
MiCA transitional grandfathering ended **1 July 2026**. Since then, only authorised CASPs may serve EU clients. "Providing advice on crypto-assets", "portfolio management" and "reception and transmission of orders" are all CASP services, unlike in the UK. They sit in capital Class 1 (EUR 50k), and ESMA suitability guidelines mirror MiFID II. Reverse solicitation is very narrow. For stocks, MiFID II applies, and ESMA treats automatic copy trading as portfolio management. The EU AI Act does not list investment advice or trading among the Annex III high-risk uses (only credit scoring and life/health insurance pricing in finance), and Annex III obligations were deferred to 2 Dec 2027.

### Cited Findings
- **Verified.** The MiCA Art. 143(3) transition ended 1 Jul 2026. After that, serving EU clients without MiCA authorisation is a breach, and pending applications do not suffice. Several member states closed windows earlier: NL, FI, LV, HU and SI on 30 Jun 2025, and SE on 30 Sep 2025 — [Elvinger Hoss](https://elvingerhoss.lu/insights/publications/mica-end-transitional-period-1-july-2026); [KPMG Cyprus](https://kpmg.com/cy/en/insights/risk-and-regulation/mica-the-end-of-the-transitional-period-for-casps.html); [AMF on ESMA expectations](https://www.amf-france.org/en/news-publications/news/end-mica-transitional-period-esma-sets-out-its-expectations-professionals-and-warns-retail-investors); [MFSA Dear CEO (Jun 2026)](https://www.mfsa.mt/wp-content/uploads/2026/06/Dear-CEO-Letter-VFA-Licence-and-Transition-to-CASP-under-the-Markets-in-Crypto-Assets-Act-MiCA-Act.pdf)
- **Anecdotal.** About 213 CASP authorisations across 23 jurisdictions appeared on ESMA's interim register at one source's time of writing — [Elliptic](https://www.elliptic.co/blog/the-end-of-micas-transitional-period)
- **Verified.** MiCA Art. 3 lists crypto-asset services, including reception and transmission of orders, providing advice on crypto-assets, and portfolio management on crypto-assets — [MiCA Art. 3 (Springlex, OJ L 150, 9.6.2023)](https://www.springlex.eu/en/packages/mica/mica-regulation/article-3/). Advice and portfolio management are defined like their MiFID II equivalents — [DLA Piper (Apr 2025)](https://www.dlapiper.com/insights/publications/2025/04/how-is-mica-impacting-fund-managers). Annex IV puts these in Class 1 with EUR 50,000 minimum capital — [MiCA Annex IV (Springlex)](https://www.springlex.eu/en/packages/mica/mica-regulation/annex-4/)
- **Strong evidence.** ESMA final guidelines (Dec 2024):
  - Reverse solicitation is narrow: the client must be the "exclusive initiator".
  - SEO targeting, localised websites, digital ads and influencers showing a CASP's logo or directing users can defeat it.
  - Suitability guidelines for crypto advice and portfolio management align with MiFID II.

  Sources: [ESMA press release](https://www.esma.europa.eu/press-news/esma-news/esma-releases-last-policy-documents-get-ready-mica); [AKD](https://www.akd.eu/insights/crypto-asset-service-providers-esma-s-guidelines-on-reverse-solicitation); [Houthoff](https://houthoff.com/insights/news/reverse-solicitation-under-mica)
- **Strong evidence.** ESMA's copy trading briefing (Mar 2023): automatic execution counts as portfolio management under MiFID II, and ESMA's position applies equally to crypto copy trading under MiCA — [ESMA35-42-1428](https://www.esma.europa.eu/sites/default/files/2023-03/ESMA35-42-1428_Supervisory_Briefing_on_Copy_Trading.pdf); [Conventus Law](https://conventuslaw.com/report/eu-update-on-mica-implementation-implications-for-copy-trading-services/)
- **Strong evidence.** ESMA's public statement of 30 May 2024 on AI in retail investment services says MiFID II organisational, conduct and best-interest duties apply to AI-driven advice and portfolio management — [Morgan Lewis](https://morganlewis.com/pubs/2024/08/esma-issues-guidance-on-ai-in-retail-financial-services-as-eu-ai-act-takes-effect)
- **Strong evidence.** AI Act Annex III point 5(b) and (c) are the only financial high-risk uses: credit scoring and creditworthiness, and life and health insurance risk pricing. Investment advice is not listed — [European Parliament resolution TA-10-2025-0286](https://data.europarl.europa.eu/distribution/doc/TA-10-2025-0286_en.pdf). A vendor blog contrarily claims investment advice is "almost certainly" high-risk; that is not a primary source, so I treat it as wrong — [Knowlee](https://www.knowlee.ai/blog/ai-act-financial-services-compliance)
- **Strong evidence.** The Digital Omnibus on AI is Regulation (EU) 2026/1744, published 24 Jul 2026 and in force 27 Jul 2026. Standalone Annex III high-risk obligations move from 2 Aug 2026 to **2 Dec 2027**, and Annex I embedded systems to 2 Aug 2028. Prohibited practices have been enforceable since 2 Feb 2025 and were not delayed — [CSA research note](https://labs.cloudsecurityalliance.org/research/csa-research-note-eu-ai-act-high-risk-deadline-omnibus-20260/); [Sidley (Jun 2026)](https://datamatters.sidley.com/2026/06/22/eu-lawmakers-reach-provisional-agreement-to-delay-key-eu-ai-act-obligations/)

### Inferences
- **Speculative.** For a UK founder, the EU is materially stricter on crypto than the UK. Personalised AI crypto recommendations to EU users are "advice on crypto-assets", which needs a CASP licence in an EU state; there is no UK passport. Active EU marketing defeats reverse solicitation. Lowest-risk EU posture:
  - generic, non-personalised research content (MiCA, like MiFID, distinguishes personal recommendations), or
  - geo-blocking the EU for any advice or execution features.
- **Speculative.** AI Act exposure for a trading-decision tool is likely limited to transparency duties (e.g. Art. 50 chatbot disclosure) and GPAI-provider downstream terms, not high-risk conformity assessment. Misleading "AI" claims would still be caught by consumer-protection and MiFID/MiCA conduct rules.

### Gaps
- The full ESMA crypto suitability guideline text and any ESMA Q&A on AI "signal" bots under MiCA were not retrieved.
- Whether Art. 50 transparency dates moved under the Omnibus is Unknown.

---

## Q7. US: SEC adviser rules (publisher's exclusion, robo-advisers, PDA rule), CFTC (prediction markets, crypto), money transmission, AI-washing

### Takeaway
- **SEC.** Impersonal, regular, general-circulation publications fall under the Lowe publisher's exclusion. Personalised advice or account direction makes you an investment adviser. The predictive data analytics (PDA) conflicts rule was **withdrawn 12 Jun 2025**. AI-washing is enforced under existing anti-fraud and marketing rules (Delphia $225k, Global Predictions $175k, 18 Mar 2024).
- **CFTC.** Signals on futures may require CTA registration unless Rule 4.14(a)(9) applies (standardised advice, no account direction). For prediction markets, there is a federal–state war: the 3rd Cir. sided with Kalshi, while the 9th and 6th Cir. sided with the states (Aug and Sep 2026), and the Supreme Court is likely next.
- **US crypto market structure law.** The CLARITY Act had not been enacted by the latest status found (late Aug 2026).

### Cited Findings
- **Verified.** Lowe v. SEC, 472 U.S. 181 (1985): bona fide publications that are impersonal, disinterested, general-circulation and regularly scheduled fall within the Advisers Act exclusion — [Lowe v. SEC (vLex)](https://case-law.vlex.com/vid/472-u-s-181-604990426); [MTSU First Amendment Encyclopedia](https://firstamendment.mtsu.edu/article/lowe-v-securities-and-exchange-commission/)
- **Strong evidence.** Following Lingley v. Seeking Alpha (S.D.N.Y. 2024), operators relying on the exclusion "including operators of auto-trading platforms … should remain vigilant" — [Mondaq (Aug 2024)](https://mondaq.com/unitedstates/securities/1510364/judge-dismisses-case-against-seeking-alpha-implications-for-publishers-of-financial-information)
- **Strong evidence.** SEC amendments to the Internet Adviser Exemption (Rule 203A-2(e)), adopted 27 Mar 2024 and effective 8 Jul 2024: all clients must be advised through an operational interactive website, and the 14-client de minimis exception is gone — [K&L Gates](https://www.klgates.com/thought-leadership/The-SEC-Limits-the-Internet-Adviser-Exemption-4-15-2024); [Seward & Kissel](https://40actblog.sewkis.com/sec-adopts-amendments-to-the-internet-adviser-exemption)
- **Verified.** On 12 Jun 2025 the SEC withdrew 14 proposed rules, including the July 2023 predictive data analytics conflicts proposal. Any revival requires a new proposal — [Paul Hastings](https://www.paulhastings.com/insights/client-alerts/sec-withdraws-14-pending-rule-proposals); [Ropes & Gray](https://www.ropesgray.com/en/insights/alerts/2025/06/sec-clears-unfinished-rulemakings-from-regulatory-agenda)
- **Verified.** 18 Mar 2024, SEC settled actions:
  - Delphia ($225k) claimed it used AI/ML on client data when it did not.
  - Global Predictions ($175k) claimed to be the "first regulated AI financial advisor" without substantiation.
  - Violations were under Advisers Act §206(2), §206(4), the Marketing Rule 206(4)-1 and Rule 206(4)-7.

  Sources: [Harvard Law Forum](https://corpgov.law.harvard.edu/2024/04/18/decoding-the-secs-first-ai-washing-enforcement-actions); [Morgan Lewis](https://www.morganlewis.com/pubs/2024/03/sec-charges-investment-advisers-with-making-false-and-misleading-statements-about-their-use-of-ai)
- **Strong evidence.** FTC "Operation AI Comply" (Sep 2024) targeted false "AI income" claims (Ascend Ecom, Ecommerce Empire Builders, FBA Machine, DoNotPay $193k) — [Mintz](https://www.mintz.com/insights-center/viewpoints/54731/2024-10-03-ftc-launches-operation-ai-comply-five-enforcement); [MoFo](https://www.mofo.com/resources/insights/241008-ftc-first-ai-related-enforcement-actions)
- **Anecdotal.** In May 2026 the SEC alleged an approximately $12M Ponzi scheme marketed as an AI crypto trading bot — [Law360](https://www.law360.com/articles/2483155). A 2024 CFTC advisory warned that "AI technology can't predict the future" — [The Block](https://www.theblock.co/amp/post/274695/cftc-warns-about-ai-scams)
- **Strong evidence.** CFTC Rule 4.14(a)(9) exempts CTAs giving standardised advice via newsletters, websites and "non-customized computer software", if they do not direct client accounts and advice is not tailored. Paid signal providers may be CTAs — [CFTC Federal Register (Mar 2000)](https://www.cftc.gov/sites/default/files/foia/fedreg00/foi000310a.htm); [CFTC staff letter 01-64](https://www.cftc.gov/sites/default/files/tm/letters/01letters/tm01-64.htm); [CFTC Commissioner Pham statement (Aug 2023)](https://www.cftc.gov/PressRoom/SpeechesTestimony/phamstatement082923)
- **Strong evidence.** Prediction markets:
  - The 3rd Cir. (6 Apr 2026) upheld a preliminary injunction for Kalshi against New Jersey, on CEA preemption.
  - The 9th Cir. (28 Aug 2026) sided with Nevada: "sports bets", not swaps.
  - The 6th Cir. (25 Sep 2026) held that Ohio and Tennessee may apply gambling laws even if the contracts are swaps.
  - The CFTC sued nine states to defend exclusive jurisdiction, and in Jan 2026 scrapped its proposed sports-contract ban.

  Sources: [CNBC (28 Aug 2026)](https://www.cnbc.com/2026/08/28/appeals-court-rules-against-prediction-markets-tees-up-scotus-fight.html); [CNBC (25 Sep 2026)](https://www.cnbc.com/2026/09/25/appeals-court-rules-states-can-regulate-sports-prediction-markets.html); [Holland & Knight (Apr 2026)](https://www.hklaw.com/en/insights/publications/2026/04/federal-appeals-court-cftc-jurisdiction-over-sports-event-contracts)
- **Strong evidence.** Polymarket acquired CFTC-licensed DCM QCEX for $112M (Jul 2025), which became "Polymarket US" (QCX LLC). It began a US rollout around Dec 2025 and filed with the CFTC on 28 Apr 2026 to open its main exchange to US users — [Blockworks](https://blockworks.co/news/polymarket-qcex-acquisition); [The Block](https://www.theblock.co/post/363623/polymarket-plans-to-re-enter-us-with-acquisition-of-derivatives-exchange-qcex); [The Defiant](https://thedefiant.io/news/regulation/polymarket-seeks-full-cftc-blessing-for-its-on-chain-exchange-report)
- **Strong evidence.** CLARITY Act (H.R. 3633): passed the House in Jul 2025 (294–134) and cleared Senate Banking 15–9 on 14 May 2026. A Senate cloture step was expected 15 Sep 2026, but no enactment was found. It would give the CFTC exclusive authority over spot digital commodity markets. The GENIUS Act (stablecoins) was enacted 18 Jul 2025 and takes effect no earlier than 18 Jan 2027 — [Decrypt](https://decrypt.co/372316/galaxy-slashes-clarity-acts-2026-odds-to-50-as-senate-time-runs-short); [Bitcoin.com News](https://news.bitcoin.com/clarity-act-odds-stay-buried-as-senate-showdown-closes-in/); [Sanction Scanner](https://www.sanctionscanner.com/blog/us-money-transmitter-licensing-who-needs-it-and-what-the-mtma-changes-1443)

### Inferences
- **Speculative.** A US-facing tool that offers generic, same-for-everyone research or signals on a regular schedule, with no account direction, has the best footing (Lowe and 4.14(a)(9)).
  - Personalised recommendations, or auto-trading user accounts in securities, means SEC/state investment adviser registration.
  - Auto-trading futures or perps accounts means CTA registration.
  - "AI" marketing claims must be substantiated, per Delphia, Global Predictions and FTC AI Comply.
- **Speculative.** The regulatory status of spot crypto "advice" in the US is unsettled until market-structure legislation passes. Today SEC jurisdiction turns on whether tokens are securities.

### Gaps
- The October 2026 status of CLARITY (post-15 Sep vote) is Unknown.
- 2017 SEC staff robo-adviser guidance was not retrieved.
- No state-by-state analysis of trading-bot software under money transmission laws was found.

---

## Q8. Market manipulation risk for coordinated multi-user bots (UK MAR, UK MARC, MiCA)

### Takeaway
A network where many users' bots receive the same signal and trade at the same moment carries real market abuse risk. It is highest in thin crypto or small-cap markets, and where the operator or insiders trade ahead of broadcasts (scalping, front-running). Three regimes bite:
- **UK MAR** (financial instruments: stocks, ETNs) applies now.
- **MiCA Arts. 91–92** apply now to crypto admitted to EU platforms.
- **UK MARC** (FCA PS26/9) applies to qualifying cryptoassets from Oct 2027.

MiCA explicitly lists voicing opinions on crypto while holding undisclosed positions as manipulation.

### Cited Findings
- **Verified (statute).** MiCA Art. 91 states: "No person shall engage in or attempt to engage in market manipulation". It covers false or misleading signals, cornering, disruptive orders, and using media access to voice opinions on crypto-assets while holding undisclosed positions — [ESMA Interactive Single Rulebook, MiCA Art. 91](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-91-prohibition-market-manipulation); [Springlex Art. 91](https://www.springlex.eu/en/packages/mica/mica-regulation/article-91/)
- **Verified (statute).** MiCA Art. 92: "any person professionally arranging or executing transactions in crypto-assets shall have in place effective arrangements, systems and procedures to prevent and detect market abuse" and must report suspicions — [ESMA Single Rulebook Art. 92](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-92-prevention-and-detection-market); [Mamo TCV commentary](https://www.mamotcv.com/insights/fintech-insights-12-mica-prevention-of-market-abuse/)
- **Strong evidence.** UK MARC is in PS26/9 (30 Jun 2026) and draws on UK MAR, adapted for crypto. Market manipulation under the Cryptoassets Regulations (Reg. 19) includes transactions, orders or behaviour giving "false or misleading signals as to the supply of, demand for, or price of" a qualifying cryptoasset. It applies from 25 Oct 2027 — [Stephenson Harwood](https://www.stephensonharwood.com/insights/the-uk-market-abuse-regime-for-cryptoassets-marc-the-fca-s-final-rules/); [DLA Piper (Jul 2026)](https://www.dlapiper.com/en-cn/insights/publications/2026/07/uk-cryptoassets-and-digital-markets-developments-fca-publishes-final-rules-on-cryptoassets)
- **Verified (statute; not re-fetched this session).** UK MAR Art. 12 covers false or misleading signals, and in Art. 12(2) persons "acting in collaboration" to secure a dominant position, and taking positions then voicing opinions via media ("scalping") — [UK MAR Art. 12, legislation.gov.uk](https://www.legislation.gov.uk/eur/2014/596/article/12)
- **Strong evidence.** Under the Lowe v. SEC discussion, "scalping" (a publisher trading a security it recommends) was a historic SEC concern — [Vermont Law Review (2026)](https://lawreview.vermontlaw.edu/wp-content/uploads/2026/01/11VtLRev175.pdf)

### Inferences
- **Speculative.** Highest-risk patterns:
  - The operator or team pre-positions before broadcasting signals.
  - Synchronised buying in illiquid tokens or small caps, then selling into the follow-on flow.
  - Wash or circular trades among network bots.
  - Announcing "coordinated pumps".

  Mitigations: randomised execution timing and size caps per asset liquidity; staff and operator dealing policy with blackout windows; signal disclosure of operator positions; surveillance logs. A "professionally arranging" operator under MiCA Art. 92 would need STOR-style systems.
- **Speculative.** The "shared signal network" design greatly raises regulatory profile compared with a single-user tool, even where each user holds their own keys. Regulators may view the operator as the person behind the collective behaviour.

### Gaps
- No enforcement case was found specifically against a multi-user bot network for coordinated trading (UK, EU or US).
- FCA MARC guidance text on algorithmic or social-media-driven manipulation was not retrieved.

---

## Q9. Platform terms: social data APIs, social platforms' financial content rules, app stores

### Takeaway
- **Data:** sentiment data from X and Reddit is now paid. X moved to pay-per-use in Feb 2026, with reported enterprise tiers around $42k/month. Reddit requires a commercial agreement for monetised use and prior approval for ML training.
- **App stores:** apps in "highly regulated fields" must be published by an organisation. Apple reportedly added crypto exchanges to that list in 2026. Google Play requires FCA registration for UK crypto exchange or custodial wallet apps, but non-custodial wallets are out of scope.
- **Social platforms:** TikTok bans branded content for financial products.

### Cited Findings
- **Strong evidence.** X replaced its fixed API tiers with pay-per-use in about Feb 2026. Reported per-request prices: $0.005 per post read, $0.010 per user lookup. Sources conflict on whether commercial users must take Enterprise, reported from about $42k/month — [Open Terms Archive memo](https://opentermsarchive.org/en/memos/x-replaces-its-dollar200-entry-level-api-plan-with-a-pay-per-use-model/); [MediaNama (Feb 2026)](https://www.medianama.com/2026/02/223-x-developer-api-pricing-pay-per-use-model/)
- **Strong evidence.** Reddit's developer terms, effective 19 Jun 2023, treat monetised services as commercial access requiring agreement and fees. ML/LLM training on Reddit content needs prior approval. Google pays about $60M a year for a data licence (Feb 2024) — [TechTarget](https://www.techtarget.com/ai/news/365535524/The-effect-of-Reddits-decision-to-charge-for-data-use); [The Register](https://www.theregister.com/2024/02/20/reddit_content_ai_deal)
- **Anecdotal (forum quotes of guideline text).** Apple App Store Guideline 5.1.1(ix): apps in highly regulated fields (banking, financial services and others) must be submitted by an organisation, not an individual. A 2026 change reportedly added crypto exchanges to the list. Guideline 3.1.5 requires exchange-transaction apps to be offered by the exchange itself, and only where licensed — [Apple dev forum](https://developer.apple.com/forums/thread/740042); [Apple dev forum 3.1.5](https://developer.apple.com/forums/thread/719799); [PPC Land (2026)](https://ppc.land/apple-tightens-app-store-age-controls-and-data-sharing-disclosure/)
- **Strong evidence.** Google Play's Cryptocurrency Exchanges and Software Wallets policy needs location-specific licensing, with the UK row requiring FCA registration or approval. **Non-custodial wallets are out of scope.** Developers without a licence must remove that country from targeting — [Google Play Help](https://support.google.com/googleplay/android-developer/answer/16329703); [Decrypt](https://decrypt.co/335134/google-non-custodial-wallets-exempt-new-crypto-app-rules-play-store?amp=1)
- **Anecdotal.** TikTok added financial products and services to categories barred from branded content — [PYMNTS](https://www.pymnts.com/?p=1112094). The FCA forced a regulated trading app to remove paid influencer posts across TikTok and YouTube — [LBC](https://www.lbc.co.uk/article/81519081b2be416cb696c9ca3c1b0c84-DWzbnR_2)

### Inferences
- **Speculative.** An iOS app that places crypto trades through user API keys risks rejection under 3.1.5, since it "facilitates transactions" without being the exchange. A web app or PWA avoids app-store gatekeeping. An analytics-only mobile app is lower risk but still needs an organisation developer account.
- **Speculative.** Sentiment from X or Reddit is a material cost and licensing dependency. Building on free scraping breaches terms. Budget for paid tiers, or use licensed aggregators.

### Gaps
- YouTube's current financial-content and ad policy, TikTok community guidelines on trading signals, and X's developer-agreement clauses on financial or sentiment use were not found.

---

## Q10. Which product designs are lowest risk? (UK founder synthesis)

### Takeaway
Risk rises sharply along this ladder:
1. Research or journal tool (lowest).
2. Generic signals or analytics.
3. User-configured strategy software executed on the user's own keys.
4. AI-discretionary auto-execution on the user's keys.
5. Pooled or managed money with performance fees (highest).

For a UK founder in late 2026, the lowest-risk viable designs are (1) and (3), restricted to unbacked crypto, with careful marketing, no UK-retail crypto derivatives, and geo-blocking the EU/US for anything beyond generic content.

### Cited Findings
- **Strong evidence.** UK advising and managing were not extended to qualifying cryptoassets — [Freshfields](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/drawing-the-line-navigating-the-fcas-new-cryptoasset-perimeter-guidance-102mvlt)
- **Strong evidence.** Software buy/sell/hold signals on specified investments are generally advice, unless the user controls the parameters — [FCA PERG 8.30](https://handbook.fca.org.uk/handbook/PERG/8/30.html)
- **Strong evidence.** Giving users a way to place crypto orders is likely arranging (PERG 18), and the technical-service exclusion is still in consultation — [The Industry Spread](https://theindustryspread.com/fca-ps26-18-crypto-perimeter-guidance-article-9z2a-front-ends/); [FCA CP26/36](https://www.fca.org.uk/publications/consultation-papers/cp26-36-cryptoasset-perimeter-guidance)
- **Strong evidence.** Automatic copy or trade-signal execution is portfolio management in the EU, under both MiFID II and MiCA — [ESMA35-42-1428](https://www.esma.europa.eu/sites/default/files/2023-03/ESMA35-42-1428_Supervisory_Briefing_on_Copy_Trading.pdf)
- **Verified.** Crypto promotions to UK consumers are restricted and criminally enforced — [FCA FG24/1](https://fca.org.uk/publications/finalised-guidance/fg24-1-finalised-guidance-financial-promotions-social-media); [A&O Shearman](https://www.aoshearman.com/en/insights/ao-shearman-on-investigations/the-reel-cost-fca-cracks-down-on-finfluencers)

### Inferences
All points in this section are **Speculative**: a synthesis, not legal advice.

**Design risk matrix**

| Design | UK (crypto) | UK (stocks/ETNs) | EU | US | Overall |
|---|---|---|---|---|---|
| A. Research/journal/backtest tool (user enters trades, AI explains or analyses; no signals on named assets; no execution) | Outside FSMA perimeter; promotions risk only if marketing induces crypto investment | Likely generic or outside advice if not specific recommendations | Generally outside MiCA/MiFID if not a personal recommendation | Publisher-like; low | **Low** |
| B. Generic signals feed (same signals for all, named assets) | Not advice (advice not extended); but every UK post with returns is a crypto financial promotion; Consumer Duty N/A unless authorised | Regulated advice per PERG 8.30 unless user-generated | Risk of "advice on crypto-assets" if personalised; generic research is safer | Lowe exclusion and CTA 4.14(a)(9) if impersonal and regular | **Low–Medium** (marketing-driven) |
| C. Software where user defines rules and approves or auto-runs them on own keys (trade-only API keys, no withdrawal) | Pre-Oct-2027: no FSMA crypto activity. Post-Oct-2027: possible "arranging", depending on final Art. 9Z2A | Arranging or dealing as agent risk; authorisation likely needed | Reception and transmission of orders risk under MiCA; MiFID likewise | Non-custodial helps on money transmission; CTA or IA risk if directing accounts | **Medium** |
| D. AI decides and executes on user's keys (discretionary) | Post-Oct-2027 likely arranging or agency dealing; not "merely technical" | Managing investments + dealing: full authorisation | Portfolio management (CASP/MiFID licence) | Investment adviser/CTA registration | **High** |
| E. Shared bot network broadcasting signals with simultaneous execution | As C/D plus MARC (from Oct 2027) | UK MAR now | MiCA Arts 91–92 now | Manipulation and scalping theories | **High** |
| F. Managed money / pooled funds / performance fees | Collective investment scheme or AIF risk; custody, safeguarding and MLR; dealing | Full authorisation (art 37 managing, CIS) | AIFMD/MiCA | Investment adviser plus possible fund and securities registration | **Very high** |
| G. Prediction-market execution for UK users | Gambling Commission licence or banned binary options | — | Varies by member state gambling law | CFTC vs states litigation | **Very high** |

**Practical guardrails for designs A–C**
- **Product shape.** Flat subscription, not performance fees. No custody. Trade-only keys or OAuth.
- **Analysis framing.** Present output as analysis with user-set parameters, not "the AI says buy".
- **Marketing claims.**
  - No UK crypto return claims unless an authorised s21 approver signs them off.
  - Substantiate any "AI" claims (Delphia, Global Predictions).
  - Treat paper-trading records as promotions: label as simulated, show methodology and include risk warnings.
- **Products and markets.**
  - No crypto derivatives for UK retail.
  - Geo-fence EU and US execution features.
- **Revisit dates.** Revisit the design when the FCA publishes final PERG 18 amendments on Art. 9Z2A, expected early 2027, and before 25 Oct 2027.
- **Distribution.** Prefer web distribution over the iOS App Store for any execution feature.

### Gaps
- No UK case law or FCA decision on non-custodial auto-trading bots specifically was found.
- The final form of the Art. 9Z2A exclusion is the critical unknown for designs C and D. CP26/36 closes 18 Nov 2026, with final guidance expected early or spring 2027.
- Whether UK users connecting to offshore exchanges creates UK "by way of business in the UK" exposure for the software provider (territorial scope) was not analysed in sources retrieved here.
