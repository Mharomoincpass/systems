/**
 * Per-post FAQs, related internal links, authoritative external links,
 * and extra detailed sections merged at read-time.
 */

const EXT = {
  googleSearch: {
    href: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
    label: "Google SEO Starter Guide",
  },
  gbp: {
    href: "https://support.google.com/business/answer/3038177",
    label: "Google Business Profile Help",
  },
  webDev: {
    href: "https://web.dev/learn",
    label: "web.dev Learn",
  },
  cwv: {
    href: "https://web.dev/articles/vitals",
    label: "Core Web Vitals (web.dev)",
  },
  wordpress: {
    href: "https://wordpress.org/documentation/",
    label: "WordPress documentation",
  },
  schema: {
    href: "https://schema.org/docs/gs.html",
    label: "Schema.org getting started",
  },
  wai: {
    href: "https://www.w3.org/WAI/fundamentals/accessibility-intro/",
    label: "W3C accessibility intro",
  },
  pagespeed: {
    href: "https://pagespeed.web.dev/",
    label: "PageSpeed Insights",
  },
  digilocker: {
    href: "https://www.meity.gov.in/",
    label: "MeitY (Ministry of Electronics & IT)",
  },
  nagalandTourism: {
    href: "https://tourism.nagaland.gov.in/",
    label: "Nagaland Tourism (official)",
  },
};

function faq(q, a) {
  return { question: q, answer: a };
}

function p(text, links) {
  return links ? { type: "p", text, links } : { type: "p", text };
}

function h2(text) {
  return { type: "h2", text };
}

function ul(items) {
  return { type: "ul", items };
}

function ol(items) {
  return { type: "ol", items };
}

const commonDetailTail = (relatedHint) => [
  h2("How this connects to the rest of your digital setup"),
  p(
    `A single page rarely fixes growth alone. Pair this topic with a clear homepage offer, a Contact path that includes WhatsApp, and measurement (Search Console + analytics). ${relatedHint}`
  ),
  h2("Implementation checklist"),
  ol([
    "Write down the one primary customer action you want this week",
    "List pages and proof assets (photos, licences, prices) you already have",
    "Decide ownership: domain, hosting, and who updates content",
    "Ship a minimum useful version, then iterate with real enquiry data",
    "Review mobile speed with PageSpeed Insights after launch",
  ]),
];

export const extrasBySlug = {
  "website-development-company-wokha-nagaland": {
    readingMinutes: 14,
    relatedSlugs: [
      "website-cost-nagaland-2026",
      "website-designer-kohima-nagaland",
      "local-seo-wokha-kohima-nagaland",
      "hire-web-developer-nagaland",
    ],
    externalLinks: [EXT.googleSearch, EXT.webDev, EXT.cwv, EXT.pagespeed],
    faqs: [
      faq(
        "Do I need a website if my Wokha business already uses Instagram?",
        "Yes, if you want stable Google visibility, owned content, and a place for licences, products, and contact details that Instagram cannot replace. Social posts expire; a website compounds."
      ),
      faq(
        "How long does a business website take in Wokha?",
        "A focused 5–8 page site often takes 1–3 weeks after content is ready. Ecommerce or custom portals take longer. Content delays (photos, copy) usually matter more than coding time."
      ),
      faq(
        "Will MHAROMO Systems work remotely with Wokha clients?",
        "Yes. Most Northeast projects already run on WhatsApp, video calls, and staged previews. You still own domain, hosting, and source access."
      ),
      faq(
        "What should a website development company in Wokha include in the price?",
        "Design, responsive build, basic on-page SEO, contact/WhatsApp CTAs, analytics setup, and handover documentation. Hosting and domain should be in your name."
      ),
      faq(
        "Can a website help distributors find my product brand?",
        "Yes. Product pages, distributor enquiry forms, and clear brand story pages help B2B discovery — similar to how product brands like MILONI Water present sizes and wholesale intent online."
      ),
    ],
    extraSections: [
      h2("Detailed scope: what “done” looks like for a Wokha site"),
      p(
        "A professional build is more than a homepage banner. Expect agreed page list, mobile layouts, compressed media, title/meta tags, an XML sitemap, robots rules, and a Contact path that works on Android. See our [[0]] for budget ranges and [[1]] for Maps + website pairing.",
        [
          { href: "/blogs/website-cost-nagaland-2026", label: "Nagaland website cost guide" },
          { href: "/blogs/google-business-profile-nagaland", label: "Google Business Profile guide" },
        ]
      ),
      p(
        "For technical quality bar, follow public guidance from [[0]] and performance basics on [[1]]. After launch, test with [[2]].",
        [
          { href: EXT.googleSearch.href, label: EXT.googleSearch.label, external: true },
          { href: EXT.webDev.href, label: EXT.webDev.label, external: true },
          { href: EXT.pagespeed.href, label: EXT.pagespeed.label, external: true },
        ]
      ),
      h2("Local competitors and how to differentiate"),
      p(
        "Many city landing pages for “website design Wokha” are thin templates. Differentiate with real photos, accurate NAP, case studies (even one live project), and vertical relevance — hospitality, packaged goods, schools, or services. Our [[0]] work shows how brand sites can carry product and wholesale stories."
      ,
        [{ href: "https://www.miloniwater.com/", label: "MILONI Water", external: true }]
      ),
      ...commonDetailTail(
        "Also read the Kohima and Dimapur city guides if you sell statewide."
      ),
    ],
  },

  "website-cost-nagaland-2026": {
    readingMinutes: 15,
    relatedSlugs: [
      "website-development-company-wokha-nagaland",
      "hire-web-developer-nagaland",
      "ecommerce-website-nagaland-brands",
      "website-redesign-nagaland",
    ],
    externalLinks: [EXT.googleSearch, EXT.pagespeed, EXT.webDev],
    faqs: [
      faq(
        "Why do website prices in Nagaland range from ₹10,000 to ₹1,00,000+?",
        "Scope. A one-page launch site is not an ecommerce store with payments, inventory, and GST invoices. Templates, custom design, integrations, and ownership terms also change price."
      ),
      faq(
        "Is the cheapest package a good idea for a serious business?",
        "Rarely, if it locks hosting to a vendor, skips mobile performance, or omits SEO basics. Lost enquiries usually cost more than a proper build."
      ),
      faq(
        "What recurring costs should I budget after launch?",
        "Domain, hosting, optional maintenance, and marketing. Development is often a one-time project fee; visibility needs ongoing effort."
      ),
      faq(
        "Does MHAROMO Systems publish a fixed price list?",
        "We quote from written scope — pages, features, and complexity — not from district names. Message WhatsApp for an estimate."
      ),
      faq(
        "How do I compare two quotes fairly?",
        "Compare deliverables, ownership, revisions, SEO inclusions, and support window — not only the headline number. Use our hiring checklist and cost guide together."
      ),
    ],
    extraSections: [
      h2("Cost drivers explained in detail"),
      p(
        "Custom UI, payment gateways, multi-language content, and role-based admin panels add engineering days. A brochure site for a Wokha retailer should not be priced like a statewide booking portal. Read [[0]] if you are still deciding between a marketing site and operational software.",
        [{ href: "/blogs/custom-software-vs-website-wokha-business", label: "website vs custom software guide" }]
      ),
      p(
        "Performance work (image compression, caching, Core Web Vitals) is part of quality, not a luxury. See [[0]] and validate with [[1]].",
        [
          { href: EXT.cwv.href, label: EXT.cwv.label, external: true },
          { href: EXT.pagespeed.href, label: EXT.pagespeed.label, external: true },
        ]
      ),
      h2("Sample budget scenarios"),
      ul([
        "Local service in Wokha: brochure + WhatsApp + Maps — lower end of business-site range",
        "Product brand with catalogue: mid range; add ecommerce when orders justify it",
        "Hotel with seasonal packages: mid range + enquiry forms; booking engine later",
        "Institution with notices and downloads: mid range with easy content updates",
      ]),
      h2("How to brief MHAROMO for an accurate quote"),
      ol([
        "Share business type and primary city (Wokha, Kohima, Dimapur, etc.)",
        "List must-have pages and nice-to-haves separately",
        "Attach sample competitor sites you like",
        "Say whether you need payments, logins, or only enquiries",
        "Confirm who provides photos and copy",
      ]),
    ],
  },

  "software-development-company-nagaland": {
    readingMinutes: 13,
    relatedSlugs: [
      "custom-software-vs-website-wokha-business",
      "website-development-company-wokha-nagaland",
      "school-website-nagaland",
      "ecommerce-website-nagaland-brands",
    ],
    externalLinks: [EXT.webDev, EXT.schema, EXT.digilocker],
    faqs: [
      faq(
        "When do I need software instead of a website?",
        "When staff must run repeat workflows daily — billing, inventory, fees, dispatch — not only when customers need to find you online."
      ),
      faq(
        "Can software and a website share one system?",
        "Yes. Public marketing pages can sit beside a private admin. Start with the painful internal workflow or the missing public presence — whichever blocks revenue more."
      ),
      faq(
        "How long do custom software projects take in Nagaland?",
        "Small tools can ship in weeks; ERP-like systems take months. Prefer phased delivery over big-bang launches."
      ),
      faq(
        "Will we own the code?",
        "With MHAROMO Systems, ownership and handover are part of the engagement. Ask any vendor this before you pay an advance."
      ),
      faq(
        "Do you build mobile apps too?",
        "We prioritise web systems that work on phones first. Native apps come when a web app is no longer enough."
      ),
    ],
    extraSections: [
      h2("Detailed examples of Nagaland software needs"),
      ul([
        "Wholesale order sheets replaced by a dealer login with price lists",
        "School fee ledgers replaced by receipts and role-based staff access",
        "Hotel enquiry spreadsheets replaced by a simple booking pipeline",
        "Plant dispatch notes replaced by status tracking for drivers and office staff",
      ]),
      p(
        "If you only need discovery and trust, start with [[0]]. If operations are the bottleneck, stay on software. Many teams need [[1]] sequencing.",
        [
          { href: "/blogs/website-development-company-wokha-nagaland", label: "website development in Wokha" },
          { href: "/blogs/custom-software-vs-website-wokha-business", label: "the decision guide" },
        ]
      ),
      h2("Security and reliability basics"),
      p(
        "Use HTTPS, strong authentication, backups, and least-privilege roles. Avoid sharing one Excel file as the “system of record.” For public-sector adjacent work, keep data handling explicit in the scope."
      ),
      ...commonDetailTail("See also our school and ecommerce vertical guides."),
    ],
  },

  "ecommerce-website-nagaland-brands": {
    readingMinutes: 13,
    relatedSlugs: [
      "website-cost-nagaland-2026",
      "whatsapp-website-nagaland-business",
      "website-designer-dimapur-nagaland",
      "mobile-first-websites-nagaland",
    ],
    externalLinks: [EXT.googleSearch, EXT.pagespeed, EXT.webDev],
    faqs: [
      faq(
        "Should every Nagaland brand start with full ecommerce checkout?",
        "No. Many brands validate with catalogue + WhatsApp/order form first, then add payments and inventory when volume is real."
      ),
      faq(
        "What payment methods matter in India?",
        "UPI-friendly flows and trusted gateways. Exact providers depend on your entity and bank — decide during scoping."
      ),
      faq(
        "Can I sell handloom or food products pan-India from Nagaland?",
        "Yes, with clear shipping timelines, packaging photos, and honest stock status. Your site must set expectations before payment."
      ),
      faq(
        "How does MILONI Water relate to ecommerce advice?",
        "It is an example of a product brand site with sizes, story, and wholesale intent — a pattern many Nagaland makers can adapt. See miloniwater.com in the resources below."
      ),
      faq(
        "What SEO matters for ecommerce?",
        "Unique product titles/descriptions, fast mobile pages, and internal links from guides. Avoid duplicate thin category pages."
      ),
    ],
    extraSections: [
      h2("Catalogue architecture that scales"),
      p(
        "Group products by size, use-case, or collection. Each product needs unique copy — not manufacturer boilerplate only. Link related products and a clear wholesale/contact path. See [[0]] for conversion habits that pair with chat.",
        [{ href: "/blogs/whatsapp-website-nagaland-business", label: "WhatsApp + website guide" }]
      ),
      p(
        "Study a live product brand presentation at [[0]], then adapt structure to your SKUs — do not copy branding.",
        [{ href: "https://www.miloniwater.com/", label: "miloniwater.com", external: true }]
      ),
      h2("Operations behind the storefront"),
      ul([
        "Who packs orders and on what SLA?",
        "How do you handle Northeast vs rest-of-India shipping?",
        "Who updates stock when Instagram sells the last unit?",
        "How are returns and breakages handled?",
      ]),
      h2("Technical quality"),
      p(
        "Compress images, lazy-load galleries, and keep checkout steps few. Validate performance with [[0]].",
        [{ href: EXT.pagespeed.href, label: EXT.pagespeed.label, external: true }]
      ),
    ],
  },

  "local-seo-wokha-kohima-nagaland": {
    readingMinutes: 12,
    relatedSlugs: [
      "google-business-profile-nagaland",
      "website-development-company-wokha-nagaland",
      "website-designer-kohima-nagaland",
      "website-designer-dimapur-nagaland",
    ],
    externalLinks: [EXT.googleSearch, EXT.gbp, EXT.schema],
    faqs: [
      faq(
        "What is local SEO in simple terms?",
        "Making sure your business appears for city and “near me” searches on Google Search and Maps — with a website and Google Business Profile that match."
      ),
      faq(
        "Is GBP more important than a website?",
        "For many service businesses, Maps drives the first click. The website converts trust. You want both aligned."
      ),
      faq(
        "How long until local SEO shows results?",
        "Listings improvements can help quickly; organic ranking usually takes months of consistency — content, reviews, and accurate citations."
      ),
      faq(
        "Should I keyword-stuff my Google Business name?",
        "No. That violates Google guidelines and risks suspension. Use your real business name."
      ),
      faq(
        "Where should I learn official Google guidance?",
        "Start with Google’s SEO starter materials and Business Profile help — linked in the resources on this page."
      ),
    ],
    extraSections: [
      h2("City page strategy without spam"),
      p(
        "Create useful pages for cities you truly serve — Wokha, Kohima, Dimapur, Mokokchung — with unique proof, not cloned paragraphs. See our city guides: [[0]], [[1]], [[2]].",
        [
          { href: "/blogs/website-designer-kohima-nagaland", label: "Kohima" },
          { href: "/blogs/website-designer-dimapur-nagaland", label: "Dimapur" },
          { href: "/blogs/website-designer-mokokchung-nagaland", label: "Mokokchung" },
        ]
      ),
      p(
        "Official references: [[0]] and [[1]]. For structured data concepts, see [[2]].",
        [
          { href: EXT.googleSearch.href, label: EXT.googleSearch.label, external: true },
          { href: EXT.gbp.href, label: EXT.gbp.label, external: true },
          { href: EXT.schema.href, label: EXT.schema.label, external: true },
        ]
      ),
      h2("Review generation that stays ethical"),
      ul([
        "Ask after a successful delivery or stay — never buy fake reviews",
        "Reply to negative reviews with facts and a path to resolve",
        "Use the same phone number on site, GBP, and WhatsApp CTAs",
      ]),
    ],
  },

  "hire-web-developer-nagaland": {
    readingMinutes: 12,
    relatedSlugs: [
      "website-cost-nagaland-2026",
      "website-redesign-nagaland",
      "wordpress-website-nagaland",
      "website-development-company-wokha-nagaland",
    ],
    externalLinks: [EXT.googleSearch, EXT.webDev, EXT.wai],
    faqs: [
      faq(
        "Freelance or studio — which is better in Nagaland?",
        "Freelancers suit simple brochure sites. Studios fit multi-page brands, software, and ongoing ownership. Choose based on complexity and support needs."
      ),
      faq(
        "What contract terms matter most?",
        "Scope, milestones, ownership of assets, revision limits, and post-launch support window."
      ),
      faq(
        "How much advance should I pay?",
        "Prefer milestones tied to demos. Avoid paying 100% upfront to unknown vendors."
      ),
      faq(
        "How do I verify quality before hiring?",
        "Demand live URLs, test them on your phone, and ask who maintains the site today."
      ),
      faq(
        "Can MHAROMO Systems start from an existing half-built site?",
        "Yes — often as a redesign or rebuild. See our website redesign guide for Nagaland."
      ),
    ],
    extraSections: [
      h2("Interview script you can copy"),
      ol([
        "Show me three live sites and who the client was",
        "Who owns domain/hosting on day one after final payment?",
        "How do you handle content I send late?",
        "What is included in SEO at launch?",
        "What is the warranty for bugs after go-live?",
      ]),
      p(
        "Compare quotes using [[0]]. If WordPress is proposed, read [[1]] so you understand maintenance.",
        [
          { href: "/blogs/website-cost-nagaland-2026", label: "the cost guide" },
          { href: "/blogs/wordpress-website-nagaland", label: "WordPress in Nagaland" },
        ]
      ),
      p(
        "Accessibility is part of professionalism — see [[0]].",
        [{ href: EXT.wai.href, label: EXT.wai.label, external: true }]
      ),
    ],
  },

  "mobile-first-websites-nagaland": {
    readingMinutes: 11,
    relatedSlugs: [
      "website-development-company-wokha-nagaland",
      "whatsapp-website-nagaland-business",
      "ecommerce-website-nagaland-brands",
      "website-redesign-nagaland",
    ],
    externalLinks: [EXT.cwv, EXT.pagespeed, EXT.webDev],
    faqs: [
      faq(
        "What does mobile-first mean?",
        "Designing for small screens first, then enhancing for desktop — because most local customers browse on phones."
      ),
      faq(
        "Why are sites slow in the hills?",
        "Large images, heavy scripts, and weak hosting. Compress media and measure with PageSpeed Insights."
      ),
      faq(
        "Is a separate mobile site required?",
        "No. One responsive site is the modern standard."
      ),
      faq(
        "Where should the WhatsApp button sit?",
        "Easy to reach with a thumb, without covering content. Details in our WhatsApp conversion guide."
      ),
      faq(
        "How do I test properly?",
        "Use a mid-range Android on cellular data, not only office Wi-Fi and a laptop."
      ),
    ],
    extraSections: [
      h2("Performance budget for Nagaland"),
      ul([
        "Hero image well under 200–300KB when possible",
        "System fonts or limited web font weights",
        "Defer non-critical scripts",
        "Avoid autoplaying large background videos on mobile",
      ]),
      p(
        "Learn modern web performance on [[0]] and [[1]], then measure your URL on [[2]].",
        [
          { href: EXT.webDev.href, label: EXT.webDev.label, external: true },
          { href: EXT.cwv.href, label: EXT.cwv.label, external: true },
          { href: EXT.pagespeed.href, label: EXT.pagespeed.label, external: true },
        ]
      ),
      p(
        "Pair speed with conversion: [[0]].",
        [{ href: "/blogs/whatsapp-website-nagaland-business", label: "WhatsApp + website stack" }]
      ),
    ],
  },

  "custom-software-vs-website-wokha-business": {
    readingMinutes: 12,
    relatedSlugs: [
      "software-development-company-nagaland",
      "website-development-company-wokha-nagaland",
      "website-cost-nagaland-2026",
      "school-website-nagaland",
    ],
    externalLinks: [EXT.webDev, EXT.googleSearch],
    faqs: [
      faq(
        "Can I buy both at once?",
        "Yes, but sequence matters. Fix the bottleneck that loses money first."
      ),
      faq(
        "We only have Instagram — website or software first?",
        "Website first for discovery and trust, unless internal chaos is already blocking fulfilment."
      ),
      faq(
        "What is a product system?",
        "A public site plus private admin/tools that share real data — for example catalogue + order desk."
      ),
      faq(
        "How does MHAROMO decide with clients?",
        "A short discovery on goals, users, and the smallest useful release — then a written scope."
      ),
      faq(
        "Where do I see service positioning?",
        "On the MHAROMO Systems homepage services and projects sections."
      ),
    ],
    extraSections: [
      h2("Decision matrix"),
      ul([
        "Invisible online → website / local SEO",
        "Enquiries exist but fulfilment is chaos → software",
        "Brand + wholesale + ops → phased product system",
      ]),
      p(
        "Deepen either path with [[0]] or [[1]]. Budget context: [[2]].",
        [
          { href: "/blogs/website-development-company-wokha-nagaland", label: "website development (Wokha)" },
          { href: "/blogs/software-development-company-nagaland", label: "software development (Nagaland)" },
          { href: "/blogs/website-cost-nagaland-2026", label: "cost guide" },
        ]
      ),
      p(
        "See how we present services on [[0]] and live project examples under Projects (including [[1]]).",
        [
          { href: "/#services", label: "mharomo.systems services" },
          { href: "https://www.miloniwater.com/", label: "MILONI Water", external: true },
        ]
      ),
    ],
  },

  "website-designer-kohima-nagaland": {
    readingMinutes: 12,
    relatedSlugs: [
      "website-designer-dimapur-nagaland",
      "website-designer-mokokchung-nagaland",
      "local-seo-wokha-kohima-nagaland",
      "school-website-nagaland",
    ],
    externalLinks: [EXT.googleSearch, EXT.gbp, EXT.nagalandTourism],
    faqs: [
      faq(
        "Do Kohima clients need on-site meetings?",
        "Helpful but not required. Remote delivery with WhatsApp and staged previews is normal."
      ),
      faq(
        "What industries in Kohima benefit most?",
        "Education, government-adjacent services, hospitality around festival season, clinics, and NGOs."
      ),
      faq(
        "Should my Kohima site mention Hornbill?",
        "Only if you truly serve festival visitors — then be specific about location, booking windows, and logistics."
      ),
      faq(
        "How do I rank for website designer Kohima searches as a service business?",
        "That keyword is for agencies. Your business should target service+Kohima terms that match what you sell."
      ),
      faq(
        "Where can I read official tourism context?",
        "Nagaland Tourism’s official site is a useful external reference for visitor-facing businesses."
      ),
    ],
    extraSections: [
      h2("Kohima-specific content tips"),
      p(
        "Use real locality names, accurate pins, and festival-season FAQs if relevant. Link GBP and keep NAP identical. Read [[0]] and [[1]].",
        [
          { href: "/blogs/google-business-profile-nagaland", label: "GBP guide" },
          { href: "/blogs/local-seo-wokha-kohima-nagaland", label: "local SEO guide" },
        ]
      ),
      p(
        "Visitor context: [[0]]. SEO fundamentals: [[1]].",
        [
          { href: EXT.nagalandTourism.href, label: EXT.nagalandTourism.label, external: true },
          { href: EXT.googleSearch.href, label: EXT.googleSearch.label, external: true },
        ]
      ),
      h2("Related city pages"),
      p(
        "Also see [[0]] and [[1]] if you operate multi-city.",
        [
          { href: "/blogs/website-designer-dimapur-nagaland", label: "Dimapur website designer guide" },
          { href: "/blogs/website-designer-mokokchung-nagaland", label: "Mokokchung guide" },
        ]
      ),
    ],
  },

  "website-designer-dimapur-nagaland": {
    readingMinutes: 12,
    relatedSlugs: [
      "website-designer-kohima-nagaland",
      "ecommerce-website-nagaland-brands",
      "website-cost-nagaland-2026",
      "whatsapp-website-nagaland-business",
    ],
    externalLinks: [EXT.googleSearch, EXT.pagespeed, EXT.gbp],
    faqs: [
      faq(
        "Why is Dimapur different from Kohima for websites?",
        "Dimapur is more commercial/logistics-heavy — catalogues, wholesale, and conversion paths matter more often."
      ),
      faq(
        "Do traders need ecommerce immediately?",
        "Not always. Catalogue + WhatsApp ordering can precede full checkout."
      ),
      faq(
        "What speed target should Dimapur sites hit?",
        "Fast enough on mid-range Android over cellular. Use PageSpeed Insights as a diagnostic, not a vanity score."
      ),
      faq(
        "Can one site serve Dimapur warehouse and Kohima brand office?",
        "Yes — with clear location pages and one primary conversion path."
      ),
      faq(
        "How do I get a quote?",
        "WhatsApp MHAROMO with business type, page list, and whether you need payments."
      ),
    ],
    extraSections: [
      h2("Commerce content that converts"),
      p(
        "Lead with proof: delivery capability, product range, and response time. Add [[0]] patterns and budget with [[1]].",
        [
          { href: "/blogs/whatsapp-website-nagaland-business", label: "WhatsApp conversion" },
          { href: "/blogs/website-cost-nagaland-2026", label: "cost guide" },
        ]
      ),
      p(
        "Measure performance via [[0]]. Keep Maps accurate via [[1]].",
        [
          { href: EXT.pagespeed.href, label: EXT.pagespeed.label, external: true },
          { href: EXT.gbp.href, label: EXT.gbp.label, external: true },
        ]
      ),
    ],
  },

  "website-designer-mokokchung-nagaland": {
    readingMinutes: 11,
    relatedSlugs: [
      "website-designer-kohima-nagaland",
      "website-development-company-wokha-nagaland",
      "local-seo-wokha-kohima-nagaland",
      "mobile-first-websites-nagaland",
    ],
    externalLinks: [EXT.googleSearch, EXT.gbp, EXT.webDev],
    faqs: [
      faq(
        "Is a five-page site enough for Mokokchung?",
        "Usually yes for services and local retail — if content is specific and mobile-fast."
      ),
      faq(
        "Should I hire a national agency with a Mokokchung doorway page?",
        "Only if they provide unique strategy and ownership. Thin cloned city pages are a red flag."
      ),
      faq(
        "What photos should I prepare?",
        "Storefront, team, products/services in use, and any certifications — shot in real light."
      ),
      faq(
        "How important is WhatsApp?",
        "Critical. Most enquiries will continue there after the first click."
      ),
      faq(
        "Where do I start with MHAROMO?",
        "Send a one-paragraph brief on WhatsApp: what you sell, who you serve, and the one action you want."
      ),
    ],
    extraSections: [
      h2("Avoiding thin SEO content"),
      p(
        "Google’s guidance emphasises helpful content. Read [[0]]. Pair your site with [[1]].",
        [
          { href: EXT.googleSearch.href, label: EXT.googleSearch.label, external: true },
          { href: "/blogs/google-business-profile-nagaland", label: "GBP setup" },
        ]
      ),
      p(
        "For Wokha-neighbouring and statewide context, see [[0]] and [[1]].",
        [
          { href: "/blogs/website-development-company-wokha-nagaland", label: "Wokha website development" },
          { href: "/blogs/mobile-first-websites-nagaland", label: "mobile-first guide" },
        ]
      ),
    ],
  },

  "google-business-profile-nagaland": {
    readingMinutes: 13,
    relatedSlugs: [
      "local-seo-wokha-kohima-nagaland",
      "whatsapp-website-nagaland-business",
      "website-development-company-wokha-nagaland",
      "hotel-tourism-website-nagaland-hornbill",
    ],
    externalLinks: [EXT.gbp, EXT.googleSearch, EXT.pagespeed],
    faqs: [
      faq(
        "Is Google Business Profile free?",
        "Yes, creating and managing a profile is free. Optional ads are separate."
      ),
      faq(
        "What if I have no street address?",
        "Service-area businesses can hide the address in some cases — follow Google’s current rules for your category."
      ),
      faq(
        "How often should I post on GBP?",
        "Weekly is a practical cadence for offers, photos, and updates."
      ),
      faq(
        "Can MHAROMO manage GBP for me?",
        "We can guide setup and align it with your website; ongoing posting can be scoped as retainers if needed."
      ),
      faq(
        "Where is the official help centre?",
        "Google Business Profile Help — linked in resources on this page."
      ),
    ],
    extraSections: [
      h2("Website fields that must match GBP"),
      ul([
        "Legal/trading name consistency",
        "Phone with country code (+91…)",
        "Pin location that matches reality",
        "Website URL that resolves on mobile",
      ]),
      p(
        "Official help: [[0]]. Broader SEO: [[1]]. After clicks land, ensure speed via [[2]] and chat via [[3]].",
        [
          { href: EXT.gbp.href, label: EXT.gbp.label, external: true },
          { href: EXT.googleSearch.href, label: EXT.googleSearch.label, external: true },
          { href: EXT.pagespeed.href, label: EXT.pagespeed.label, external: true },
          { href: "/blogs/whatsapp-website-nagaland-business", label: "WhatsApp website guide" },
        ]
      ),
    ],
  },

  "wordpress-website-nagaland": {
    readingMinutes: 13,
    relatedSlugs: [
      "hire-web-developer-nagaland",
      "website-redesign-nagaland",
      "website-cost-nagaland-2026",
      "ecommerce-website-nagaland-brands",
    ],
    externalLinks: [EXT.wordpress, EXT.pagespeed, EXT.webDev],
    faqs: [
      faq(
        "Is WordPress free?",
        "The software is open source; you still pay for hosting, domain, premium plugins/themes, and maintenance labour."
      ),
      faq(
        "Is WordPress secure enough?",
        "Yes when updated and hardened. Neglected plugins are the usual failure mode."
      ),
      faq(
        "WooCommerce or custom ecommerce?",
        "WooCommerce suits many catalogues. Custom wins for unusual workflows — see our ecommerce guide."
      ),
      faq(
        "Can MHAROMO migrate me off WordPress later?",
        "Yes. Plan redirects and content export so SEO equity is preserved."
      ),
      faq(
        "Where do I read official WordPress docs?",
        "wordpress.org documentation — linked in resources."
      ),
    ],
    extraSections: [
      h2("Maintenance plan you should budget"),
      ol([
        "Monthly core/plugin/theme updates on staging first",
        "Offsite backups",
        "Uptime monitoring",
        "Quarterly speed review",
      ]),
      p(
        "Docs: [[0]]. Performance: [[1]]. If a builder site is failing, consider [[2]].",
        [
          { href: EXT.wordpress.href, label: EXT.wordpress.label, external: true },
          { href: EXT.pagespeed.href, label: EXT.pagespeed.label, external: true },
          { href: "/blogs/website-redesign-nagaland", label: "redesign vs rebuild" },
        ]
      ),
    ],
  },

  "hotel-tourism-website-nagaland-hornbill": {
    readingMinutes: 13,
    relatedSlugs: [
      "whatsapp-website-nagaland-business",
      "google-business-profile-nagaland",
      "mobile-first-websites-nagaland",
      "website-designer-kohima-nagaland",
    ],
    externalLinks: [EXT.nagalandTourism, EXT.gbp, EXT.pagespeed],
    faqs: [
      faq(
        "When should hotels open Hornbill booking pages?",
        "Well before December demand peaks — travellers research early. Keep rates and policies updated."
      ),
      faq(
        "Do I need OTA integration on day one?",
        "Not required. Many properties start with direct enquiry + WhatsApp confirmation."
      ),
      faq(
        "What photos convert best?",
        "Rooms as guests see them, bathrooms, views, and location context — not only decorated lobbies."
      ),
      faq(
        "Should I list on Google Business Profile?",
        "Yes. Hotels and stays benefit heavily from Maps. Align NAP with the website."
      ),
      faq(
        "Where is official tourism information?",
        "Nagaland Tourism’s official website is a useful external reference for visitors."
      ),
    ],
    extraSections: [
      h2("Seasonal content calendar"),
      ul([
        "Pre-festival: packages, transport notes, deposit rules",
        "Peak: availability honesty, response-time SLAs on WhatsApp",
        "Off-season: local experiences, long-stay offers",
      ]),
      p(
        "External context: [[0]]. Listings: [[1]]. Conversion: [[2]]. Speed: [[3]].",
        [
          { href: EXT.nagalandTourism.href, label: EXT.nagalandTourism.label, external: true },
          { href: EXT.gbp.href, label: EXT.gbp.label, external: true },
          { href: "/blogs/whatsapp-website-nagaland-business", label: "WhatsApp + website" },
          { href: EXT.pagespeed.href, label: EXT.pagespeed.label, external: true },
        ]
      ),
    ],
  },

  "school-website-nagaland": {
    readingMinutes: 12,
    relatedSlugs: [
      "software-development-company-nagaland",
      "website-designer-dimapur-nagaland",
      "hire-web-developer-nagaland",
      "ngo-church-website-nagaland",
    ],
    externalLinks: [EXT.wai, EXT.googleSearch, EXT.pagespeed],
    faqs: [
      faq(
        "Who should update school notices?",
        "A trained office staff member with a simple checklist — not only the developer."
      ),
      faq(
        "Do we need a parent login portal immediately?",
        "No. Start with public notices and admissions info; add portals when processes are stable."
      ),
      faq(
        "How do we handle fee information?",
        "Publish ranges or process notes carefully; avoid outdated PDFs that cause disputes."
      ),
      faq(
        "Is accessibility important for school sites?",
        "Yes — clear contrast, readable type, and keyboard-friendly navigation help all families. See W3C WAI intro."
      ),
      faq(
        "Can software manage fees later?",
        "Yes. That is custom software territory — see our software development guide."
      ),
    ],
    extraSections: [
      h2("Admissions-season readiness"),
      ol([
        "Update dates and document lists before calls spike",
        "Put phone/WhatsApp above the fold on mobile",
        "Archive old notices so parents are not confused",
        "Compress gallery images from annual day events",
      ]),
      p(
        "Accessibility: [[0]]. SEO basics: [[1]]. Later systems: [[2]].",
        [
          { href: EXT.wai.href, label: EXT.wai.label, external: true },
          { href: EXT.googleSearch.href, label: EXT.googleSearch.label, external: true },
          { href: "/blogs/software-development-company-nagaland", label: "custom software guide" },
        ]
      ),
    ],
  },

  "website-redesign-nagaland": {
    readingMinutes: 13,
    relatedSlugs: [
      "website-cost-nagaland-2026",
      "hire-web-developer-nagaland",
      "wordpress-website-nagaland",
      "mobile-first-websites-nagaland",
    ],
    externalLinks: [EXT.googleSearch, EXT.pagespeed, EXT.cwv],
    faqs: [
      faq(
        "Will a redesign hurt my Google rankings?",
        "It can, if URLs break without redirects. Plan mappings and monitor Search Console after launch."
      ),
      faq(
        "Can you redesign without changing the domain?",
        "Yes — preferred. Keep the domain, improve the site."
      ),
      faq(
        "How do I know if I need a rebuild?",
        "If the CMS is locked, security is failing, or mobile is unusable, rebuild is often cheaper long-term."
      ),
      faq(
        "What should a redesign audit include?",
        "Analytics, keyword landing pages, speed, content inventory, and competitor gaps."
      ),
      faq(
        "How long does a redesign take?",
        "Often 2–6 weeks for brochure sites once content decisions are made."
      ),
    ],
    extraSections: [
      h2("Redirect and QA checklist"),
      ul([
        "Crawl old URLs before launch",
        "301 map important pages",
        "Test forms and WhatsApp CTAs on mobile",
        "Re-submit sitemap",
        "Compare PageSpeed before/after",
      ]),
      p(
        "SEO change management aligns with [[0]]. Measure [[1]] / [[2]]. Hiring help: [[3]].",
        [
          { href: EXT.googleSearch.href, label: EXT.googleSearch.label, external: true },
          { href: EXT.pagespeed.href, label: EXT.pagespeed.label, external: true },
          { href: EXT.cwv.href, label: EXT.cwv.label, external: true },
          { href: "/blogs/hire-web-developer-nagaland", label: "hiring checklist" },
        ]
      ),
    ],
  },

  "whatsapp-website-nagaland-business": {
    readingMinutes: 12,
    relatedSlugs: [
      "mobile-first-websites-nagaland",
      "google-business-profile-nagaland",
      "ecommerce-website-nagaland-brands",
      "hotel-tourism-website-nagaland-hornbill",
    ],
    externalLinks: [EXT.gbp, EXT.pagespeed, EXT.googleSearch],
    faqs: [
      faq(
        "Should WhatsApp replace my website?",
        "No. WhatsApp closes conversations; the website creates trust and searchable information."
      ),
      faq(
        "What is a pre-filled WhatsApp message?",
        "A link that opens chat with a starter sentence, so customers state what they need immediately."
      ),
      faq(
        "Is one number enough?",
        "Yes for small teams — consistency beats multiple unmanaged phones."
      ),
      faq(
        "Can WhatsApp links be tracked?",
        "You can use UTM parameters on the website side and train staff to tag lead sources manually."
      ),
      faq(
        "Does MHAROMO use WhatsApp for clients?",
        "Yes — including our own contact CTAs on mharomo.systems."
      ),
    ],
    extraSections: [
      h2("Message templates that qualify leads"),
      ul([
        "Hi — I want a website quote for my [business type] in [city].",
        "Hi — I want room availability for [dates].",
        "Hi — I want distributor pricing for [product].",
      ]),
      p(
        "Align chat with [[0]] and [[1]]. Keep the landing page fast ([[2]]).",
        [
          { href: "/blogs/google-business-profile-nagaland", label: "GBP" },
          { href: "/blogs/mobile-first-websites-nagaland", label: "mobile-first design" },
          { href: EXT.pagespeed.href, label: EXT.pagespeed.label, external: true },
        ]
      ),
      p(
        "Talk to us on [[0]] or browse [[1]].",
        [
          { href: "https://wa.me/916009325630", label: "WhatsApp MHAROMO", external: true },
          { href: "/#contact", label: "Contact on mharomo.systems" },
        ]
      ),
    ],
  },

  "ngo-church-website-nagaland": {
    readingMinutes: 12,
    relatedSlugs: [
      "school-website-nagaland",
      "website-development-company-wokha-nagaland",
      "hire-web-developer-nagaland",
      "whatsapp-website-nagaland-business",
    ],
    externalLinks: [EXT.wai, EXT.googleSearch, EXT.gbp],
    faqs: [
      faq(
        "Should churches publish sermon videos on the website?",
        "Optional. Many start with service times, location, and contact — then add media."
      ),
      faq(
        "How transparent should NGOs be online?",
        "Publish programmes, contact routes, and updates. Follow applicable rules for fundraising claims."
      ),
      faq(
        "Do we need donations online on day one?",
        "Not required. Enquiry-to-donate is a valid first step."
      ),
      faq(
        "Who maintains the site after launch?",
        "Train a volunteer or staff editor. Document the update steps."
      ),
      faq(
        "Can the same studio build school and NGO sites?",
        "Yes — institutional information architecture is similar. See our school guide."
      ),
    ],
    extraSections: [
      h2("Trust content that donors look for"),
      ul([
        "Clear programme descriptions",
        "Leadership accountability contacts",
        "Recent activity updates",
        "Physical address and map where appropriate",
      ]),
      p(
        "Accessibility matters for public sites — [[0]]. Local discovery: [[1]]. Related: [[2]].",
        [
          { href: EXT.wai.href, label: EXT.wai.label, external: true },
          { href: EXT.gbp.href, label: EXT.gbp.label, external: true },
          { href: "/blogs/school-website-nagaland", label: "school website guide" },
        ]
      ),
    ],
  },
};
