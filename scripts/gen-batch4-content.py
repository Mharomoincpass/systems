#!/usr/bin/env python3
"""Batch 4 blogs + append new service pages from audited KEEP keywords."""
from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]

# Audited KEEP gaps (commercial/transactional) — not already covered as money pages
BLOGS = [
    ("software-company-vs-studio-india", "software company", "Software Company vs Studio: What Indian SMEs Should Hire", "Hiring", 60000),
    ("design-agency-for-business-websites", "design agency", "Design Agency for Business Websites: What You Should Demand", "Web development", 55000),
    ("design-company-vs-web-developer", "design company", "Design Company vs Web Developer: Who Builds Your Site?", "Hiring", 45000),
    ("hire-developers-india-nagaland", "hire developers", "Hire Developers in India: Checklist for Nagaland Businesses", "Hiring", 25000),
    ("hire-software-developer-guide", "hire software developer", "Hire a Software Developer: Scope, Cost Signals, and Red Flags", "Hiring", 22000),
    ("software-agency-how-to-choose", "software agency", "How to Choose a Software Agency (Without Getting Locked In)", "Hiring", 12000),
    ("software-solutions-for-smes", "software solutions", "Software Solutions for SMEs: Start Small, Own the System", "Software", 35000),
    ("digital-transformation-nagaland-smes", "digital transformation", "Digital Transformation for Nagaland SMEs: Practical First Steps", "Strategy", 35000),
    ("software-testing-for-business-projects", "software testing", "Software Testing for Business Projects: What Buyers Should Require", "Software", 40000),
    ("software-design-process-explained", "software design", "Software Design Process Explained for Non-Technical Owners", "Software", 33000),
    ("software-engineers-on-your-project", "software engineers", "Software Engineers on Your Project: Roles You Actually Need", "Software", 30000),
    ("custom-solutions-vs-saas-tools", "custom solutions", "Custom Solutions vs SaaS Tools: A Decision Guide", "Strategy", 30000),
    ("cloud-software-small-business-india", "cloud software", "Cloud Software for Small Businesses in India", "Software", 22000),
    ("software-for-business-nagaland", "software for business", "Software for Business in Nagaland: What Pays Off First", "Software", 20000),
    ("software-outsourcing-india-guide", "software outsourcing", "Software Outsourcing in India: How to Stay in Control", "Hiring", 18000),
    ("software-architecture-for-smes", "software architecture", "Software Architecture for SMEs: Simple Patterns That Scale Later", "Software", 18000),
    ("software-project-planning-smes", "software project", "Software Project Planning for SMEs: Scope Before Code", "Software", 16000),
    ("software-automation-workflows", "software automation", "Software Automation: Kill Repetitive WhatsApp + Excel Work", "Software", 15000),
    ("software-consultant-when-to-hire", "software consultant", "Software Consultant vs Builder: When to Hire Which", "Hiring", 14000),
    ("software-integration-for-business", "software integration", "Software Integration for Business: Connect Tools Without Chaos", "Software", 14000),
    ("software-product-development-india", "software product development", "Software Product Development in India: From Idea to Paying Users", "Software", 12000),
    ("software-maintenance-after-launch", "software maintenance", "Software Maintenance After Launch: Budget It or Break It", "Software", 12000),
    ("custom-erp-software-small-business", "custom erp software", "Custom ERP Software for Small Business: When Spreadsheets Fail", "Software", 320),
    ("custom-software-solutions-examples", "custom software solutions", "Custom Software Solutions: Real Examples for Local Businesses", "Software", 210),
    ("custom-software-companies-how-to-vet", "custom software companies", "Custom Software Companies: How to Vet Before You Pay", "Hiring", 90),
]

SERVICES = [
    {
        "slug": "software-company-nagaland",
        "title": "Software Company in Nagaland | MHAROMO Systems",
        "h1": "Software company for Nagaland businesses",
        "description": "MHAROMO Systems is a software company serving Wokha, Kohima, Dimapur and Nagaland — custom tools, websites, and product systems with clear scope.",
        "primaryKeyword": "software company",
        "keywords": ["software company", "software company Nagaland", "software company Wokha", "software company Kohima"],
        "eyebrow": "Software company",
        "summary": "Not a vague IT shop. We build software and web systems you own — scoped, demoed, handed over.",
        "bullets": [
            "Custom tools that replace Excel + WhatsApp chaos",
            "Websites that convert to calls and chat",
            "Written scope and milestone payments",
            "Code and domain ownership in your name",
        ],
        "offer": [
            ["Ops tool", "One painful workflow automated"],
            ["Business website", "SEO + WhatsApp conversion"],
            ["Product system", "Public site + private admin"],
        ],
        "cities": ["Wokha", "Kohima", "Dimapur", "Mokokchung"],
        "relatedBlogs": ["software-company-vs-studio-india", "software-development-company-nagaland", "hire-software-developer-guide"],
        "faqs": [
            ("Are you a software company or only websites?", "Both. Websites for discovery; software when operations need systems."),
            ("Do you work across Nagaland?", "Yes — remote delivery with WhatsApp and staging demos."),
            ("How do quotes work?", "From written scope. Message WhatsApp with your problem and city."),
            ("Will we own the code?", "Yes. Ownership is part of how MHAROMO ships."),
        ],
    },
    {
        "slug": "design-agency-nagaland",
        "title": "Design Agency in Nagaland | Web & Brand Systems — MHAROMO",
        "h1": "Design agency work that ships as a real website",
        "description": "Design agency services for Nagaland brands — modern websites, brand-led UI, and conversion paths. MHAROMO Systems.",
        "primaryKeyword": "design agency",
        "keywords": ["design agency", "design agency Nagaland", "design company", "website design agency"],
        "eyebrow": "Design agency",
        "summary": "Pretty mockups are useless without a live site. We design and build — mobile-first, SEO-ready, WhatsApp-ready.",
        "bullets": [
            "Brand-aware UI without agency theater",
            "Production websites, not only Figma dumps",
            "Local SEO and contact conversion built in",
            "Proof via live projects like MILONI Water",
        ],
        "offer": [
            ["Brand site", "Story + products + enquiry"],
            ["Service site", "Clear offer + WhatsApp CTA"],
            ["Redesign", "Fix slow or outdated sites"],
        ],
        "cities": ["Kohima", "Dimapur", "Wokha"],
        "relatedBlogs": ["design-agency-for-business-websites", "designing-modern-websites-2026", "website-redesign-nagaland"],
        "faqs": [
            ("Do you only design or also develop?", "We design and develop so nothing gets lost between mockup and launch."),
            ("Can you redesign an existing site?", "Yes — with redirects so SEO is protected."),
            ("What cities do you serve?", "Across Nagaland, including Kohima, Dimapur, and Wokha."),
            ("How do I start?", "WhatsApp a short brief and 2–3 sites you like."),
        ],
    },
    {
        "slug": "hire-developers-nagaland",
        "title": "Hire Developers in Nagaland | MHAROMO Systems",
        "h1": "Hire developers for your Nagaland project",
        "description": "Hire developers through MHAROMO Systems — clear scope, staging demos, ownership. Web, software, and product builds for Nagaland businesses.",
        "primaryKeyword": "hire developers",
        "keywords": ["hire developers", "hire software developer", "hire developers Nagaland", "hire web developer Nagaland"],
        "eyebrow": "Hire developers",
        "summary": "Stop gambling on random freelancers with no written scope. Hire a delivery team that demos before final payment.",
        "bullets": [
            "Milestone-based delivery",
            "Staging links you can click",
            "Mobile-first builds",
            "Post-launch support options",
        ],
        "offer": [
            ["Website build", "Brochure to growth sites"],
            ["Custom software", "Ops tools and portals"],
            ["Rescue / redesign", "Fix broken or abandoned projects"],
        ],
        "cities": ["Wokha", "Kohima", "Dimapur"],
        "relatedBlogs": ["hire-developers-india-nagaland", "hire-software-developer-guide", "hire-web-developer-nagaland"],
        "faqs": [
            ("Freelance or MHAROMO?", "For multi-page brands and software, a studio with process is safer."),
            ("How fast can we start?", "After brief + deposit, often within days."),
            ("Can you take over a half-finished project?", "Often yes — after a short audit."),
            ("How do I hire you?", "WhatsApp with your goal and timeline."),
        ],
    },
    {
        "slug": "software-agency-nagaland",
        "title": "Software Agency in Nagaland | MHAROMO Systems",
        "h1": "Software agency delivery without lock-in",
        "description": "Software agency for Nagaland — custom development, integrations, maintenance. Transparent scope from MHAROMO Systems.",
        "primaryKeyword": "software agency",
        "keywords": ["software agency", "software agency Nagaland", "software company Nagaland"],
        "eyebrow": "Software agency",
        "summary": "Agency discipline, studio honesty. We ship systems you can leave with — domain, hosting, and code in your control.",
        "bullets": [
            "Discovery → build → handover",
            "Integrations and automation",
            "Maintenance plans available",
            "No hostage hosting",
        ],
        "offer": [
            ["Build", "New software or web product"],
            ["Integrate", "Connect tools and APIs"],
            ["Maintain", "Updates, fixes, monitoring"],
        ],
        "cities": ["Nagaland", "Wokha", "Kohima", "Dimapur"],
        "relatedBlogs": ["software-agency-how-to-choose", "software-maintenance-after-launch", "software-outsourcing-india-guide"],
        "faqs": [
            ("What makes you different from big agencies?", "Direct communication, smaller scope slices, ownership by default."),
            ("Do you outsource our project abroad?", "Core delivery stays with MHAROMO — no bait-and-switch."),
            ("Can you maintain after launch?", "Yes, as a scoped retainer or pay-per-change."),
            ("How do I get pricing?", "WhatsApp your use case for a written estimate."),
        ],
    },
    {
        "slug": "it-services-nagaland",
        "title": "IT Services in Nagaland | Web & Software — MHAROMO Systems",
        "h1": "IT services that actually move the business",
        "description": "IT services for Nagaland SMEs — websites, custom software, integrations, and support. MHAROMO Systems.",
        "primaryKeyword": "IT services",
        "keywords": ["IT services", "IT services Nagaland", "IT services Wokha", "IT company Nagaland"],
        "eyebrow": "IT services",
        "summary": "Practical IT: get found online, run operations cleaner, keep systems updated — not a pile of unused licenses.",
        "bullets": [
            "Web presence + conversion",
            "Custom software for ops",
            "Integrations and automation",
            "Support after launch",
        ],
        "offer": [
            ["Launch", "Website + GBP guidance"],
            ["Operate", "Tools for orders, fees, inventory"],
            ["Support", "Fixes and improvements"],
        ],
        "cities": ["Wokha", "Kohima", "Dimapur", "Mokokchung"],
        "relatedBlogs": ["it-services-small-business-nagaland", "digital-transformation-nagaland-smes", "software-for-business-nagaland"],
        "faqs": [
            ("Do you sell hardware?", "We focus on software and web systems. We can advise on hosting."),
            ("Can you help schools and NGOs?", "Yes — institutional sites and simple admin tools."),
            ("Remote or on-site?", "Remote-first with WhatsApp; on-site when needed."),
            ("How to contact?", "WhatsApp +91 60093 25630."),
        ],
    },
    {
        "slug": "custom-software-development-nagaland",
        "title": "Custom Software Development in Nagaland | MHAROMO Systems",
        "h1": "Custom software development that fits how you work",
        "description": "Custom software development for Nagaland businesses — billing, portals, dashboards, automation. Clear milestones from MHAROMO Systems.",
        "primaryKeyword": "custom software development",
        "keywords": [
            "custom software development",
            "custom software Nagaland",
            "custom software solutions",
            "custom erp software",
        ],
        "eyebrow": "Custom software",
        "summary": "Off-the-shelf tools fight your process. We build the smallest custom system that removes the pain — then grow it.",
        "bullets": [
            "Phased delivery",
            "Role-based access",
            "Mobile-friendly admin",
            "Documentation and handover",
        ],
        "offer": [
            ["Workflow app", "Replace one spreadsheet"],
            ["Portal", "Dealers, staff, or clients login"],
            ["Light ERP", "Inventory + orders when ready"],
        ],
        "cities": ["Wokha", "Kohima", "Dimapur"],
        "relatedBlogs": [
            "custom-software-development-nagaland-india",
            "custom-erp-software-small-business",
            "custom-software-solutions-examples",
        ],
        "faqs": [
            ("Is custom always more expensive?", "Upfront often yes; long-term it can be cheaper than forcing the wrong SaaS."),
            ("Can you start with an MVP?", "Always preferred."),
            ("Do you build mobile apps too?", "Web-first; native apps when needed."),
            ("How do we begin?", "WhatsApp the workflow that hurts most."),
        ],
    },
    {
        "slug": "software-solutions-nagaland",
        "title": "Software Solutions in Nagaland | MHAROMO Systems",
        "h1": "Software solutions for real Nagaland workflows",
        "description": "Software solutions for Nagaland SMEs — automation, business tools, integrations. Scoped and owned by you. MHAROMO Systems.",
        "primaryKeyword": "software solutions",
        "keywords": ["software solutions", "software solutions Nagaland", "business software Nagaland"],
        "eyebrow": "Software solutions",
        "summary": "Solutions means outcomes: fewer missed orders, cleaner reports, faster replies — not a logo slide deck.",
        "bullets": [
            "Mapped to your actual process",
            "Integrations when useful",
            "Training for your team",
            "Maintenance options",
        ],
        "offer": [
            ["Automate", "Repetitive tasks"],
            ["Organize", "Orders, fees, inventory"],
            ["Connect", "Website + ops tools"],
        ],
        "cities": ["Nagaland", "Wokha", "Kohima", "Dimapur"],
        "relatedBlogs": ["software-solutions-for-smes", "software-automation-workflows", "software-integration-for-business"],
        "faqs": [
            ("What industries do you serve?", "Trade, hospitality, education, product brands, services, NGOs."),
            ("Do you sell licenses only?", "No — we build and implement."),
            ("Can solutions include a website?", "Yes — often the public face of the system."),
            ("Next step?", "WhatsApp your top operational pain."),
        ],
    },
    {
        "slug": "website-design-mokokchung",
        "title": "Website Design in Mokokchung | MHAROMO Systems",
        "h1": "Website design in Mokokchung",
        "description": "Website design for Mokokchung businesses — mobile-first sites with WhatsApp conversion and local SEO foundations. MHAROMO Systems.",
        "primaryKeyword": "website design Mokokchung",
        "keywords": ["website design Mokokchung", "website designer Mokokchung", "web development Mokokchung"],
        "eyebrow": "Mokokchung",
        "summary": "Local businesses need a permanent home online — not only Facebook posts. We design and launch sites that work on phones.",
        "bullets": [
            "Clear service pages",
            "WhatsApp + call CTAs",
            "Google-ready structure",
            "Real photos, not stock spam",
        ],
        "offer": [
            ["Brochure site", "5–8 pages"],
            ["Brand site", "Story + gallery + contact"],
            ["Growth site", "More pages + SEO"],
        ],
        "cities": ["Mokokchung"],
        "relatedBlogs": ["website-designer-mokokchung-nagaland", "mobile-first-websites-nagaland", "whatsapp-website-nagaland-business"],
        "faqs": [
            ("Do you visit Mokokchung?", "Remote delivery works; visits optional."),
            ("How long to launch?", "Often 1–3 weeks after content is ready."),
            ("Can you connect Google Business Profile?", "Yes — we align NAP and CTAs."),
            ("How to hire?", "WhatsApp your business type and photos readiness."),
        ],
    },
]

RELATED = [
    "website-development-company-wokha-nagaland",
    "software-development-company-nagaland",
    "hire-web-developer-nagaland",
    "custom-software-vs-website-wokha-business",
]

EXTERNAL = [
    {"href": "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", "label": "Google SEO Starter Guide"},
    {"href": "https://web.dev/learn", "label": "web.dev Learn"},
    {"href": "https://pagespeed.web.dev/", "label": "PageSpeed Insights"},
]


def pub_date(i: int) -> str:
    day = 1 + i
    if day <= 31:
        return f"2026-05-{day:02d}"
    return f"2026-06-{day - 31:02d}"


def gen_blogs() -> None:
    lines = [
        "/**",
        " * Batch 4 — from audited KEEP keywords (keywords-india-e0f5b_2.csv).",
        " * Junk dropped: WhatsApp Web, Indigo, web series, PDF tools, etc.",
        " * Focus: commercial/transactional software & web buying intent + Nagaland angle.",
        " */",
        "",
        "export const postsBatch4 = [",
    ]
    for i, (slug, kw, title, cat, _vol) in enumerate(BLOGS):
        date = pub_date(i)
        wa = "https://wa.me/916009325630?text=" + quote(f"Hi MHAROMO — I want help with {kw}")
        post = {
            "slug": slug,
            "title": title,
            "description": f"{title} Buyer guide for Indian and Nagaland businesses. Keyword: {kw}. MHAROMO Systems.",
            "keywords": [kw, f"{kw} India", f"{kw} Nagaland", "MHAROMO Systems"],
            "category": cat,
            "primaryKeyword": kw,
            "publishedAt": date,
            "updatedAt": date,
            "readingMinutes": 10,
            "relatedSlugs": RELATED,
            "externalLinks": EXTERNAL,
            "faqs": [
                {
                    "question": f'Is "{kw}" relevant for a Wokha or Nagaland business?',
                    "answer": f"Yes — if it maps to getting found, closing enquiries, or running operations cleaner. MHAROMO scopes {kw} work to your actual workflow.",
                },
                {
                    "question": "Should I buy a cheap package online?",
                    "answer": "Only if you keep ownership of domain/hosting and get mobile + SEO basics. Locked hosting is a red flag.",
                },
                {
                    "question": "How does MHAROMO help?",
                    "answer": "Written scope, staging demos, WhatsApp communication, and handover with ownership.",
                },
                {
                    "question": "Website or software first?",
                    "answer": "Discovery problems → website. Operations chaos → software. We help you choose on the first chat.",
                },
                {
                    "question": "How do I start?",
                    "answer": "WhatsApp +91 60093 25630 with your city, business type, and goal.",
                },
            ],
            "sections": [
                {
                    "type": "p",
                    "text": f'This article targets the keyword "{kw}" for buyers in India — especially Nagaland SMEs who need a clear vendor path with MHAROMO Systems.',
                },
                {"type": "h2", "text": f'What "{kw}" means for your business'},
                {
                    "type": "p",
                    "text": f'People searching "{kw}" want results: a hire, a build, or a system. Translate it into one outcome — more enquiries, fewer errors, or a product customers pay for.',
                },
                {"type": "h2", "text": "Buyer checklist"},
                {
                    "type": "ol",
                    "items": [
                        "Define the one primary user action",
                        "Separate must-haves from nice-to-haves",
                        "Demand written scope and milestones",
                        "Confirm ownership of domain and code",
                        "Require mobile testing before launch",
                    ],
                },
                {"type": "h2", "text": "How MHAROMO Systems delivers"},
                {
                    "type": "p",
                    "text": "See [[0]], [[1]], and [[2]]. Proof of brand work: [[3]].",
                    "links": [
                        {"href": "/services/web-development-nagaland", "label": "Nagaland web development"},
                        {"href": "/services/software-development-nagaland", "label": "software development"},
                        {"href": "/services", "label": "all services"},
                        {"href": "https://www.miloniwater.com/", "label": "MILONI Water", "external": True},
                    ],
                },
                {"type": "h2", "text": "Common mistakes"},
                {
                    "type": "ul",
                    "items": [
                        "Paying 100% upfront with no demo",
                        "Building an app before a website can convert",
                        "Ignoring Google Business Profile",
                        "No one assigned to maintain after launch",
                    ],
                },
                {"type": "h2", "text": "Next step"},
                {
                    "type": "p",
                    "text": "Open the matching service page, then WhatsApp a short brief. Related guides: [[0]] and [[1]].",
                    "links": [
                        {"href": "/blogs/website-cost-nagaland-2026", "label": "cost guide"},
                        {"href": "/blogs/hire-web-developer-nagaland", "label": "hiring checklist"},
                    ],
                },
                {"type": "cta", "text": "WhatsApp MHAROMO for a quote", "href": wa},
            ],
        }
        js = json.dumps(post, indent=2, ensure_ascii=False)
        indented = "\n".join(("  " + line) if line else line for line in js.splitlines())
        lines.append(indented + ",")
    lines.append("];")
    lines.append("")
    out = ROOT / "lib" / "blogs" / "posts-batch4.js"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("blogs", len(BLOGS), "->", out)


def gen_services_append() -> None:
    """Write a JS module with additional services to merge."""
    # Convert faqs tuples to dicts for JSON
    services = []
    for s in SERVICES:
        item = dict(s)
        item["faqs"] = [{"q": q, "a": a} for q, a in s["faqs"]]
        services.append(item)
    out = ROOT / "lib" / "services" / "pages-batch2.js"
    # manual JS export
    body = json.dumps(services, indent=2, ensure_ascii=False)
    text = (
        "/** Extra service pages from audited KEEP commercial keywords. */\n"
        f"export const servicePagesBatch2 = {body};\n"
    )
    out.write_text(text, encoding="utf-8")
    print("services", len(services), "->", out)


if __name__ == "__main__":
    gen_blogs()
    gen_services_append()
