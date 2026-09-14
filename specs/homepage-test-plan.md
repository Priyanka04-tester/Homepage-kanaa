# Homepage Test Plan — Kanaa (dev-nx.thekanaa.com)

Generated from `state/homepage-map.json` (captured 2026-09-14T06:08:47.793Z) by `scripts/generate-test-plan.js`.

## Source discovery
- URL: https://dev-nx.thekanaa.com/en-sa/
- Title: The Kanaa: Online Toy, Gaming & Electronics Store in KSA
- Viewport at capture: 1280x800
- Sections discovered: 21
- Buttons: 240 · Links: 246 · Inputs: 3 · Images: 442 (broken: 15) · Sliders: 2 · Product widgets: 8 (cards sampled: 71)

## Sections
- **HOME-SEC-001** — Header / Topbar (above first heading) _(carousel)_
- **HOME-SEC-002** — Welcome To Biggest Toys and Game Store of KSA _(carousel)_
- **HOME-SEC-003** — Best Price Guarante _(product-widget)_
- **HOME-SEC-004** — Toys Best Select _(product-widget)_
- **HOME-SEC-005** — Outdoor Best Seller _(product-widget)_
- **HOME-SEC-006** — Happy Kids Pre-Order _(content-block)_
- **HOME-SEC-007** — Deals Of The Week _(product-widget)_
- **HOME-SEC-008** — Most Popular Products _(product-widget)_
- **HOME-SEC-009** — Big adventures start with small steps _(content-block)_
- **HOME-SEC-010** — New to our Collection _(product-widget)_
- **HOME-SEC-011** — Unbeatable Deals You’ll💖 _(content-block)_
- **HOME-SEC-012** — (untitled) _(product-widget)_
- **HOME-SEC-013** — Ready set go _(product-widget)_
- **HOME-SEC-014** — Delivering Happiness, Creating Memories _(content-block)_
- **HOME-SEC-015** — ⭐ Rated 4.7 on Google _(content-block)_
- **HOME-SEC-016** — Kanaa: Online Toy Store in Saudi Arabia _(content-block)_
- **HOME-SEC-017** — Explore Our Wide Range of Toys in KSA _(content-block)_
- **HOME-SEC-018** — Why Shop From Kanaa in Saudi Arabia _(content-block)_
- **HOME-SEC-019** — Frequently Asked Questions _(content-block)_
- **HOME-SEC-020** — Search By Category _(content-block)_
- **HOME-SEC-021** — Site Footer _(footer)_

## Coverage
- Requirements: 70
- Scenarios: 70
- Test cases: 70
- Viewports covered: Desktop 1440x900, Desktop 1920x1080, Tablet 1024x768, Tablet 768x1024, Mobile 390x844, Mobile 393x852, Mobile 412x915
- Browsers covered: chromium, firefox, webkit

## Known risks / assumptions from discovery (not yet confirmed as bugs)
- **RISK-HOME-001** [content-anomaly] — Product widget at top=5538 has an empty section heading (blank title above the product row)
- **RISK-HOME-002** [test-data-leak] — A homepage product widget displays what looks like QA/placeholder test data as a real product: "Testing product for label"
- **RISK-HOME-003** [test-data-leak] — A homepage product widget displays what looks like QA/placeholder test data as a real product: "Rental Test Product"
- **RISK-HOME-004** [broken-image] — Broken image (naturalWidth=0): src="https://media-stage.thekanaa.com/cloud/media/catalog/product/m/a/maisto_rock_crawler_r_c_car_boys_8_10_years_1.jpg?width=240&quality=70&format=webp" alt="Maisto Rock Crawler R/C Car Boys, 8-10 Years"
- **RISK-HOME-005** [broken-image] — Broken image (naturalWidth=0): src="https://media-stage.thekanaa.com/cloud/media/catalog/product/m/a/maisto_1_24_scale_1929_ford_model_a_diecast_car_boys_3_4_years_1.jpg?width=240&quality=70&format=webp" alt="Maisto 1:24 Scale 1929 Ford Model A Diecast Car Boys, 3-4 Years"
- **RISK-HOME-006** [broken-image] — Broken image (naturalWidth=0): src="https://media-stage.thekanaa.com/cloud/media/catalog/product/m/a/maisto_1_24_1967_ford_mustang_gt_diecast_car_boys_3_4_years_1.jpg?width=240&quality=70&format=webp" alt="Maisto 1:24 1967 Ford Mustang GT Diecast Car Boys, 3-4 Years"
- **RISK-HOME-007** [broken-image] — Broken image (naturalWidth=0): src="https://media-stage.thekanaa.com/cloud/media/catalog/product/d/i/disney_stitch_light_up_yoyo_unisex_3_4_years_1.jpg?width=240&quality=70&format=webp" alt="Disney Stitch Light-Up Yoyo Unisex, 3-4 Years"
- **RISK-HOME-008** [broken-image] — Broken image (naturalWidth=0): src="https://media-stage.thekanaa.com/cloud/media/catalog/product/p/o/pop_mart_labubu_assorted_the_monsters_keychain_unisex_3_4_years_1.jpg?width=240&quality=70&format=webp" alt="Pop Mart Labubu The Monsters Blind Box Keychain Unisex, 3-4 Years"
- **RISK-HOME-009** [broken-image] — Broken image (naturalWidth=0): src="https://media-stage.thekanaa.com/cloud/media/catalog/product/e/a/eazy_kids_500ml_water_bottle_with_handle_unisex_3_4_years_1.jpg?width=240&quality=70&format=webp" alt="Eazy Kids 500ml Water Bottle with Handle Unisex, 3-4 Years"
- **RISK-HOME-010** [broken-image] — Broken image (naturalWidth=0): src="https://media-stage.thekanaa.com/cloud/media/catalog/product/s/u/sunce_bts_transformers_earthspark_pencil_case_unisex_3_4_years_1.jpg?width=240&quality=70&format=webp" alt="Sunce BTS Transformers Earthspark Pencil Case Unisex, 3-4 Years"
- **RISK-HOME-011** [broken-image] — Broken image (naturalWidth=0): src="https://media-stage.thekanaa.com/cloud/media/catalog/product/d/i/disney_stitch_bowling_set_unisex_3_4_years_1.jpg?width=240&quality=70&format=webp" alt="Disney Stitch Bowling Set Unisex, 3-4 Years"
- **RISK-HOME-012** [broken-image] — Broken image (naturalWidth=0): src="https://media-stage.thekanaa.com/cloud/media/catalog/product/d/i/disney_stitch_mini_basketball_set_with_hoop_unisex_3_4_years_1.jpg?width=240&quality=70&format=webp" alt="Disney Stitch Mini Basketball Set with Hoop Unisex, 3-4 Years"
- **RISK-HOME-013** [broken-image] — Broken image (naturalWidth=0): src="https://media-stage.thekanaa.com/cloud/media/catalog/product/f/o/foldermate_13_pockets_black_expanding_file_pack_of_10_1.jpg?width=240&quality=70&format=webp" alt="Foldermate 13 Pockets Black Expanding File, Pack of 10"
- **RISK-HOME-014** [broken-image] — Broken image (naturalWidth=0): src="/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fsamaco%2Fthirdlevelbanner%2Fa%2Ft%2Fatlas_banner_en_2_2_2.jpg&w=1920&q=75" alt="Toys & Games"
- **RISK-HOME-015** [broken-image] — Broken image (naturalWidth=0): src="/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fsamaco%2Fthirdlevelbanner%2F0%2F1%2F015f9541c328987d51c1e304dca68cf4f8f429a5_1_.jpg&w=1920&q=75" alt="Consoles"
- **RISK-HOME-016** [broken-image] — Broken image (naturalWidth=0): src="/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fsamaco%2Fthirdlevelbanner%2Fp%2Fo%2Fpokemon_cards_web_banner_1920x600_english_1.jpg&w=1920&q=75" alt="Gaming & Consoles"
- **RISK-HOME-017** [broken-image] — Broken image (naturalWidth=0): src="/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fsamaco%2Fthirdlevelbanner%2F5%2Fi%2F5in1_en_web_2_2_2.jpg&w=1920&q=75" alt="Gaming & Consoles"
- **RISK-HOME-018** [broken-image] — Broken image (naturalWidth=0): src="/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fsamaco%2Fthirdlevelbanner%2Fa%2Ft%2Fatlas_banner_en_2_2_2.jpg&w=1920&q=75" alt="Toys & Games"

## Console errors observed during discovery load (deduplicated)
- Access to fetch at 'https://thekanaa.com/en-sa/pooloutdoor/' (redirected from 'https://dev-nx.thekanaa.com/en-sa/sports-outdoor.html?_rsc=2511f') from origin 'https://dev-nx.thekanaa.com' has been blo
- Failed to load resource: net::ERR_FAILED
- Failed to fetch RSC payload for https://dev-nx.thekanaa.com/en-sa/sports-outdoor.html. Falling back to browser navigation. TypeError: Failed to fetch
    at y (https://dev-nx.thekanaa.com/_next/static
- Failed to load resource: the server responded with a status of 403 ()

## Network failures observed during discovery load
- First-party (dev-nx / media-stage) — **actionable, likely correlates with the 15 broken images above**: 42
  - POST https://www.google.com/ccm/collect?rcb=16&frm=0&apvc=1&ae=g&auid=259133113.1789366142&dt=The%20Kanaa%3A%20Online%20Toy%2C%20Gaming%20%26%20Electronics%20Store%20in%20KSA&en=page_view&dl=https%3A%2F%2Fdev-nx.thekanaa.com%2Fen-sa%2F&scrsrc=www.googletagmanager.com&rnd=472387440.1789366142&navt=n&npa=0&ep.ads_data_redaction=0&gtm=45He6992v9204857697za200zd9204857697xea&gcd=13l3l3l3l1l1&dma=0&tag_exp=115616985~115938465~115938468~118897920~118897930~119793974~120385423~120469145~120469153&tft=1789366142370&tfd=14553&fmt=8 — net::ERR_ABORTED
  - POST https://www.google.com/rmkt/collect/16910419249/?random=1789366142804&cv=11&fst=1789366142804&fmt=8&bg=ffffff&guid=ON&async=1&en=gtag.config&gtm=45be6992v9208454064z89204857697za20gzb9204857697zd9204857697xec&gcd=13l3l3R3l5l1&dma=0&tag_exp=115938465~115938468~118897920~118897930~120213116~120385423~120469145~120469153~120912438&u_w=1280&u_h=800&url=https%3A%2F%2Fdev-nx.thekanaa.com%2Fen-sa%2F&rcb=3&frm=0&tiba=The%20Kanaa%3A%20Online%20Toy%2C%20Gaming%20%26%20Electronics%20Store%20in%20KSA&hn=www.googleadservices.com&npa=0&pscdl=noapi&auid=259133113.1789366142&uaa=x86&uab=64&uafvl=HeadlessChrome%3B153.0.8010.12%7CNot_A%2520Brand%3B8.0.0.0%7CChromium%3B153.0.8010.12&uamb=0&uam=&uap=Windows&uapv=10.0&uaw=0&data=event%3Dgtag.config&ept=68&gcp=5 — net::ERR_ABORTED
  - POST https://www.google.com/rmkt/collect/17524843981/?random=1789366142873&cv=11&fst=1789366142873&fmt=8&bg=ffffff&guid=ON&async=1&en=gtag.config&gtm=45be6992v9208454064z89204857697za20gzb9204857697zd9204857697xec&gcd=13l3l3R3l5l1&dma=0&tag_exp=115938465~115938468~118897920~118897930~120213116~120385423~120469145~120469153~120912438&u_w=1280&u_h=800&url=https%3A%2F%2Fdev-nx.thekanaa.com%2Fen-sa%2F&rcb=3&frm=0&tiba=The%20Kanaa%3A%20Online%20Toy%2C%20Gaming%20%26%20Electronics%20Store%20in%20KSA&hn=www.googleadservices.com&npa=0&pscdl=noapi&auid=259133113.1789366142&uaa=x86&uab=64&uafvl=HeadlessChrome%3B153.0.8010.12%7CNot_A%2520Brand%3B8.0.0.0%7CChromium%3B153.0.8010.12&uamb=0&uam=&uap=Windows&uapv=10.0&uaw=0&data=event%3Dgtag.config&ept=68&gcp=5 — net::ERR_ABORTED
  - POST https://www.google.com/ccm/collect?rcb=3&frm=0&apvc=0&auid=259133113.1789366142&dt=The%20Kanaa%3A%20Online%20Toy%2C%20Gaming%20%26%20Electronics%20Store%20in%20KSA&tid=AW-16910419249&en=page_view&dl=https%3A%2F%2Fdev-nx.thekanaa.com%2Fen-sa%2F&scrsrc=www.googletagmanager.com&rnd=472387440.1789366142&navt=n&npa=0&gtm=45be6992v9208454064z89204857697za20gzb9204857697zd9204857697xec&gcs=G1--&gcd=13l3l3R3l5l1&dma=0&tag_exp=115938465~115938468~118897920~118897930~120213116~120385423~120469145~120469153~120912438&tft=1789366142922&tfd=15105&tids=AW-16910419249~AW-17524843981&fmt=8 — net::ERR_ABORTED
  - POST https://www.merchant-center-analytics.goog/mc/collect?v=2&tid=MC-LFPH9YGF0P&gtm=45be6992v9208454064z89204857697za20gzb9204857697zd9204857697&_p=1789366141737&gcs=G1--&gcd=13l3l3R3l5l1&npa=0&dma=0&cid=958839299.1789366143&frm=0&pscdl=noapi&rcb=3&sr=1280x800&uaa=x86&uab=64&uafvl=HeadlessChrome%3B153.0.8010.12%7CNot_A%2520Brand%3B8.0.0.0%7CChromium%3B153.0.8010.12&uam=&uamb=0&uap=Windows&uapv=10.0&uaw=0&ul=en-us&_s=1&tag_exp=115938465~115938468~118897920~118897930~120213116~120385423~120469145~120469153~120912438&sid=1789366142&sct=1&seg=0&dl=https%3A%2F%2Fdev-nx.thekanaa.com%2Fen-sa%2F&dt=The%20Kanaa%3A%20Online%20Toy%2C%20Gaming%20%26%20Electronics%20Store%20in%20KSA&en=page_view&_fv=1&_nsi=1&_ss=1&tfd=15100 — net::ERR_ABORTED
  - GET https://www.google.com/measurement/1p-conversion/?random=1542404434&cv=11&tid=G-W4DB3SZKSF&fst=1789366143062&fmt=8&en=session_start&gtm=45je6992v9204860558z89204857697za20gzb9204857697zd9204857697xec&gcs=G1--&gcd=13l3l3R3l5l1&dma=0&tag_exp=115616986~115938465~115938469~118897920~118897930~120213116~120385422~120469145~120469153&u_w=1280&u_h=800&url=https%3A%2F%2Fdev-nx.thekanaa.com%2Fen-sa%2F&gacid=958839299.1789366143&frm=0&tiba=The%20Kanaa%3A%20Online%20Toy%2C%20Gaming%20%26%20Electronics%20Store%20in%20KSA&npa=0&pscdl=noapi&auid=259133113.1789366142&uaa=x86&uab=64&uafvl=HeadlessChrome%3B153.0.8010.12%7CNot_A%2520Brand%3B8.0.0.0%7CChromium%3B153.0.8010.12&uamb=0&uam=&uap=Windows&uapv=10.0&uaw=0&rcb=15&ct_cookie_present=false&crd=CLTesQII8t-xAgit4bECCK_hsQIIobixAgixwbECCLDBsQIIscOxAgiKxbECCMLJsQII1-ixAgi0xrECCJPasQII29yxAgiH27ECCNPFsQII68yxAgjtzrECCNXPsQII9NqxAgji6rECCOjusQIIkuuxAgjJ47ECCJfUsQIIyduxAgjN5rECCLHhsQIIs-GxAgim3bECCLDesQIIgNuxAgjN4bECCMvhsQI&cerd=CgiDsL4tyOy-LQ&fsk=ChEI8JOZ1QYQ2t2lw-rYmcuYARIsAI5y_hdUBOFUExj7KsSnDntHCcluxhcUCQguZxvAkmL36H6GXVsHRSp9tOAaAvgN&pscrd=IhMIqrbGrLTtlgMVTqesAh0sygkCOhxodHRwczovL2Rldi1ueC50aGVrYW5hYS5jb20vQldDaEVJOEpPWjFRWVE5cWFsNm9hd2o3cmRBUklzQUVuanVxQmE4ZWpJdDVHWktHV3hlN2I4bEtCX2xhLUg5ZXlhSGptTEtxbGFTa2ViSjdEZ3hwcDhSYTh6DAgJYggIABAAGAAgAA — net::ERR_ABORTED
  - POST https://analytics.google.com/g/collect?v=2&tid=G-W4DB3SZKSF&gtm=45je6992v9204860558z89204857697za20gzb9204857697zd9204857697&_p=1789366141737&em=tv.1~em.jgTAxUGe6K87z3drMY-SuOITOC_7UYtR-nt9FKwuBlk&_gaz=1&gcs=G1--&gcd=13l3l3R3l5l1&npa=0&dma=0&ecid=302333429&_eu=AAAAAGAC&_prs=ok&cid=958839299.1789366143&ec_mode=a&frm=0&pscdl=noapi&rcb=15&sr=1280x800&uaa=x86&uab=64&uafvl=HeadlessChrome%3B153.0.8010.12%7CNot_A%2520Brand%3B8.0.0.0%7CChromium%3B153.0.8010.12&uam=&uamb=0&uap=Windows&uapv=10.0&uaw=0&ul=en-us&gaf=2&_s=1&tag_exp=115616986~115938465~115938469~118897920~118897930~120213116~120385422~120469145~120469153&sid=1789366143&sct=1&seg=0&dl=https%3A%2F%2Fdev-nx.thekanaa.com%2Fen-sa%2F&dt=The%20Kanaa%3A%20Online%20Toy%2C%20Gaming%20%26%20Electronics%20Store%20in%20KSA&en=page_view&_fv=1&_ss=2&tfd=15318 — net::ERR_ABORTED
  - POST https://www.google-analytics.com/g/collect?v=2&tid=G-F1NJ1E2HJ2&gtm=45je6992v9104202608za200zd9104202608&_p=1789366143815&gcd=13l3l3l3l1l1&npa=0&dma=0&cid=958839299.1789366143&frm=1&ngs=1&pscdl=noapi&rcb=17&sr=1280x800&uaa=x86&uab=64&uafvl=HeadlessChrome%3B153.0.8010.12%7CNot_A%2520Brand%3B8.0.0.0%7CChromium%3B153.0.8010.12&uam=&uamb=0&uap=Windows&uapv=10.0&uaw=0&ul=en-us&_s=1&tag_exp=115938466~115938469~118897920~118897930~120213116~120385422~120469145~120469153&sid=1789366144&sct=1&seg=0&dl=https%3A%2F%2Fdev-nx.thekanaa.com%2Fen-sa%2F&dr=https%3A%2F%2Fdev-nx.thekanaa.com%2Fen-sa%2F&dt=&en=page_view&_fv=1&_ss=1&_ee=1&tfd=528 — net::ERR_ABORTED
  - GET https://dev-nx.thekanaa.com/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fcatalog%2Fproduct%2Fm%2Fa%2Fmaisto_1_24_scale_1929_ford_model_a_diecast_car_boys_3_4_years_1.jpg&w=256&q=70 — 403
  - GET https://dev-nx.thekanaa.com/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fcatalog%2Fproduct%2Fm%2Fa%2Fmaisto_1_24_1967_ford_mustang_gt_diecast_car_boys_3_4_years_1.jpg&w=256&q=70 — 403
  - GET https://dev-nx.thekanaa.com/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fcatalog%2Fproduct%2Fm%2Fa%2Fmaisto_rock_crawler_r_c_car_boys_8_10_years_1.jpg&w=256&q=70 — 403
  - POST https://analytics.google.com/g/collect?v=2&tid=G-W4DB3SZKSF&gtm=45je6992v9204860558za20gzb9204857697zd9204857697&_p=1789366141737&gcs=G1--&gcd=13l3l3R3l5l1&npa=0&dma=0&ecid=302333429&_eu=AEAAAGQC&ae=a&cid=958839299.1789366143&frm=0&pscdl=noapi&rcb=15&sr=1280x800&uaa=x86&uab=64&uafvl=HeadlessChrome%3B153.0.8010.12%7CNot_A%2520Brand%3B8.0.0.0%7CChromium%3B153.0.8010.12&uam=&uamb=0&uap=Windows&uapv=10.0&uaw=0&ul=en-us&gaf=2&_s=2&tag_exp=115616986~115938465~115938469~118897920~118897930~120213116~120385422~120469145~120469153&sid=1789366143&sct=1&seg=0&dl=https%3A%2F%2Fdev-nx.thekanaa.com%2Fen-sa%2F&dt=The%20Kanaa%3A%20Online%20Toy%2C%20Gaming%20%26%20Electronics%20Store%20in%20KSA&en=scroll&epn.percent_scrolled=90&_et=110&tfd=20456 — net::ERR_ABORTED
  - GET https://media-stage.thekanaa.com/cloud/media/catalog/product/m/a/maisto_1_24_scale_1929_ford_model_a_diecast_car_boys_3_4_years_1.jpg?width=240&quality=70&format=webp — net::ERR_BLOCKED_BY_ORB
  - GET https://media-stage.thekanaa.com/cloud/media/catalog/product/m/a/maisto_1_24_1967_ford_mustang_gt_diecast_car_boys_3_4_years_1.jpg?width=240&quality=70&format=webp — net::ERR_BLOCKED_BY_ORB
  - GET https://media-stage.thekanaa.com/cloud/media/catalog/product/m/a/maisto_rock_crawler_r_c_car_boys_8_10_years_1.jpg?width=240&quality=70&format=webp — net::ERR_BLOCKED_BY_ORB
  - GET https://dev-nx.thekanaa.com/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fcatalog%2Fproduct%2Fd%2Fi%2Fdisney_stitch_bowling_set_unisex_3_4_years_1.jpg&w=256&q=70 — 403
  - GET https://dev-nx.thekanaa.com/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fcatalog%2Fproduct%2Fd%2Fi%2Fdisney_stitch_light_up_yoyo_unisex_3_4_years_1.jpg&w=256&q=70 — 403
  - GET https://dev-nx.thekanaa.com/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fcatalog%2Fproduct%2Fd%2Fi%2Fdisney_stitch_mini_basketball_set_with_hoop_unisex_3_4_years_1.jpg&w=256&q=70 — 403
  - GET https://dev-nx.thekanaa.com/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fcatalog%2Fproduct%2Fe%2Fa%2Feazy_kids_500ml_water_bottle_with_handle_unisex_3_4_years_1.jpg&w=256&q=70 — 403
  - GET https://dev-nx.thekanaa.com/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fcatalog%2Fproduct%2Ff%2Fo%2Ffoldermate_13_pockets_black_expanding_file_pack_of_10_1.jpg&w=256&q=70 — 403
  - GET https://dev-nx.thekanaa.com/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fcatalog%2Fproduct%2Fs%2Fu%2Fsunce_bts_transformers_earthspark_pencil_case_unisex_3_4_years_1.jpg&w=256&q=70 — 403
  - GET https://dev-nx.thekanaa.com/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fcatalog%2Fproduct%2Fp%2Fo%2Fpop_mart_labubu_assorted_the_monsters_keychain_unisex_3_4_years_1.jpg&w=256&q=70 — 403
  - GET https://media-stage.thekanaa.com/cloud/media/catalog/product/d/i/disney_stitch_light_up_yoyo_unisex_3_4_years_1.jpg?width=240&quality=70&format=webp — net::ERR_BLOCKED_BY_ORB
  - GET https://media-stage.thekanaa.com/cloud/media/catalog/product/d/i/disney_stitch_mini_basketball_set_with_hoop_unisex_3_4_years_1.jpg?width=240&quality=70&format=webp — net::ERR_BLOCKED_BY_ORB
  - GET https://media-stage.thekanaa.com/cloud/media/catalog/product/f/o/foldermate_13_pockets_black_expanding_file_pack_of_10_1.jpg?width=240&quality=70&format=webp — net::ERR_BLOCKED_BY_ORB
  - GET https://media-stage.thekanaa.com/cloud/media/catalog/product/s/u/sunce_bts_transformers_earthspark_pencil_case_unisex_3_4_years_1.jpg?width=240&quality=70&format=webp — net::ERR_BLOCKED_BY_ORB
  - GET https://media-stage.thekanaa.com/cloud/media/catalog/product/d/i/disney_stitch_bowling_set_unisex_3_4_years_1.jpg?width=240&quality=70&format=webp — net::ERR_BLOCKED_BY_ORB
  - POST https://www.google-analytics.com/g/collect?v=2&tid=G-F1NJ1E2HJ2&gtm=45je6992v9104202608za200zd9104202608&_p=1789366143815&gcd=13l3l3l3l1l1&npa=0&dma=0&_eu=AAAAAAQ&cid=958839299.1789366143&frm=1&ngs=1&pscdl=noapi&rcb=17&sr=1280x800&uaa=x86&uab=64&uafvl=HeadlessChrome%3B153.0.8010.12%7CNot_A%2520Brand%3B8.0.0.0%7CChromium%3B153.0.8010.12&uam=&uamb=0&uap=Windows&uapv=10.0&uaw=0&ul=en-us&_s=2&tag_exp=115938466~115938469~118897920~118897930~120213116~120385422~120469145~120469153&sid=1789366144&sct=1&seg=0&dl=https%3A%2F%2Fdev-nx.thekanaa.com%2Fen-sa%2F&dr=https%3A%2F%2Fdev-nx.thekanaa.com%2Fen-sa%2F&dt=&en=USING_CUSTOM_CSS&_ee=1&epn.eventCategory=8877&ep.eventAction=USING_CUSTOM_CSS&ep.url=%2Fkanaa.css&tfd=5567 — net::ERR_ABORTED
  - GET https://media-stage.thekanaa.com/cloud/media/catalog/product/p/o/pop_mart_labubu_assorted_the_monsters_keychain_unisex_3_4_years_1.jpg?width=240&quality=70&format=webp — net::ERR_BLOCKED_BY_ORB
  - GET https://media-stage.thekanaa.com/cloud/media/catalog/product/e/a/eazy_kids_500ml_water_bottle_with_handle_unisex_3_4_years_1.jpg?width=240&quality=70&format=webp — net::ERR_BLOCKED_BY_ORB
  - GET https://dev-nx.thekanaa.com/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fcatalog%2Fproduct%2Fs%2Ft%2Fstep2_whisper_push_car_ride_unisex_3_4_years_1.jpg&w=256&q=70 — 403
  - GET https://dev-nx.thekanaa.com/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fcatalog%2Fproduct%2Fs%2Ft%2Fstep2_play_and_store_sandbox_unisex_3_4_years_1.jpg&w=256&q=70 — 403
  - GET https://dev-nx.thekanaa.com/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fcatalog%2Fproduct%2F5%2F4%2F5432661547st2100382_1.jpg&w=256&q=70 — 403
  - GET https://dev-nx.thekanaa.com/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fcatalog%2Fproduct%2Fr%2Fa%2Frazor_rambler_12_electric_bike_unisex_13_years_1.jpg&w=256&q=70 — 403
  - GET https://dev-nx.thekanaa.com/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fcatalog%2Fproduct%2Fi%2Fn%2Fintex_rectangular_frame_pool_unisex_5-7_years_1_2_1.jpg&w=256&q=70 — 403
  - GET https://dev-nx.thekanaa.com/_next/image/?url=https%3A%2F%2Fmedia-stage.thekanaa.com%2Fcloud%2Fmedia%2Fcatalog%2Fproduct%2Fs%2Ft%2Fstep2_st2811800_push_around_buggy_ride_unisex_3_4_years_3.jpg&w=256&q=70 — 403
  - GET https://media-stage.thekanaa.com/cloud/media/catalog/product/s/t/step2_whisper_push_car_ride_unisex_3_4_years_1.jpg?width=240&quality=70&format=webp — net::ERR_BLOCKED_BY_ORB
  - GET https://media-stage.thekanaa.com/cloud/media/catalog/product/s/t/step2_st2811800_push_around_buggy_ride_unisex_3_4_years_3.jpg?width=240&quality=70&format=webp — net::ERR_BLOCKED_BY_ORB
  - GET https://media-stage.thekanaa.com/cloud/media/catalog/product/5/4/5432661547st2100382_1.jpg?width=240&quality=70&format=webp — net::ERR_BLOCKED_BY_ORB
  - GET https://media-stage.thekanaa.com/cloud/media/catalog/product/s/t/step2_play_and_store_sandbox_unisex_3_4_years_1.jpg?width=240&quality=70&format=webp — net::ERR_BLOCKED_BY_ORB
  - GET https://media-stage.thekanaa.com/cloud/media/catalog/product/r/a/razor_rambler_12_electric_bike_unisex_13_years_1.jpg?width=240&quality=70&format=webp — net::ERR_BLOCKED_BY_ORB
  - GET https://media-stage.thekanaa.com/cloud/media/catalog/product/i/n/intex_rectangular_frame_pool_unisex_5-7_years_1_2_1.jpg?width=240&quality=70&format=webp — net::ERR_BLOCKED_BY_ORB
- Third-party (analytics/ads beacons — informational, not blocking): 2

## Assumptions
- "Every button/link" requirements are executed data-driven against `state/homepage-map.json`, not enumerated one row per element in this plan.
- Product-card test cases sample representative cards (first/middle/last of the widget) per spec section 12, not every card in every widget.
- No real order is ever placed; Add to Cart tests stop at cart confirmation, consistent with README safety notes for this project.
- Login-gated flows are out of scope for the homepage suite (kanaa-test-bot's existing `tests/e2e/login.spec.js`/`checkout.spec.js` cover those separately and are tagged `@otp` since they trigger a real OTP).

## Not yet executed
This plan has been generated but **no test cases have been executed yet**. Execution, evidence capture, bug filing, retesting, regression and the final QA report are later phases — see `agents/homepage-executor.md` and `agents/homepage-bug-analyzer.md`.
