#!/usr/bin/env python3
"""Generate posts-batch3.js from filtered CSV-relevant keywords."""
from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "lib" / "blogs" / "posts-batch3.js"

POSTS = [
    ("web-development-guide-india-businesses", "web development", "Web Development for Indian Businesses: What You Actually Need", "Web development", 150000),
    ("software-development-guide-india", "software development", "Software Development in India: A Practical Guide for Business Owners", "Software", 110000),
    ("custom-software-development-nagaland-india", "custom software development", "Custom Software Development: When Off-the-Shelf Tools Fail", "Software", 40000),
    ("what-is-custom-software", "custom software", "What Is Custom Software? Plain-English Guide for SMEs", "Software", 90000),
    ("app-development-vs-website", "app development", "App Development vs Website: Which Should You Build First?", "Strategy", 120000),
    ("mobile-app-development-nagaland", "mobile app development", "Mobile App Development for Nagaland Businesses", "Apps", 90000),
    ("it-services-small-business-nagaland", "IT services", "IT Services for Small Businesses in Nagaland", "IT services", 80000),
    ("crm-software-small-business-india", "CRM software", "CRM Software for Small Businesses in India: Do You Need It?", "Software", 55000),
    ("erp-software-small-business-nagaland", "ERP software", "ERP Software for Small Businesses: A Realistic Nagaland Guide", "Software", 45000),
    ("full-stack-development-explained", "full stack development", "Full Stack Development Explained for Business Buyers", "Web development", 40000),
    ("frontend-vs-backend-development", "frontend development", "Frontend vs Backend Development: Who Builds What on Your Project", "Web development", 25000),
    ("react-development-business-websites", "React development", "React Development for Business Websites and Web Apps", "Web development", 28000),
    ("nodejs-api-development-business", "Node.js development", "Node.js Development for Business APIs and Dashboards", "Software", 20000),
    ("api-development-for-business", "API development", "API Development for Business: Connect Your Tools Without Chaos", "Software", 18000),
    ("saas-development-india-startups", "SaaS development", "SaaS Development in India: Build a Product Customers Pay For", "Software", 16000),
    ("content-management-software-cms-guide", "content management software", "Content Management Software (CMS): WordPress and Beyond", "Platforms", 110000),
    ("business-software-types-explained", "business software", "Types of Business Software Every Growing Company Should Know", "Software", 30000),
    ("enterprise-software-vs-custom-tools", "enterprise software", "Enterprise Software vs Custom Tools: What Fits Nagaland SMEs", "Strategy", 22000),
    ("system-design-basics-business-owners", "system design basics", "System Design Basics for Business Owners (No CS Degree Needed)", "Strategy", 18100),
    ("web-development-course-vs-hire-agency", "web development course", "Web Development Course vs Hiring an Agency: Which Path Wins?", "Hiring", 14800),
    ("designing-modern-websites-2026", "designing modern websites", "Designing Modern Websites in 2026: What Still Converts", "Web development", 880),
    ("web-development-services-what-to-expect", "services web development", "Web Development Services: What a Good Proposal Includes", "Web development", 5400),
    ("software-engineering-business-projects", "software engineering", "Software Engineering on Business Projects: Process That Protects You", "Software", 110000),
    ("hr-systems-small-business-india", "human resource systems", "Human Resource Systems for Small Teams in India", "Software", 135000),
    ("website-vs-web-application", "web development", "Website vs Web Application: Pick the Right Build for Your Budget", "Strategy", 150000),
    ("backend-architecture-for-smes", "backend architecture", "Backend Architecture for SMEs: Simple, Secure, Good Enough", "Software", 14800),
    ("system-design-services-when-to-hire", "system design services", "System Design Services: When to Hire a Consultant vs a Builder", "Hiring", 5400),
    ("custom-software-engineer-vs-agency", "custom software engineer", "Custom Software Engineer vs Agency: How Indian SMEs Should Hire", "Hiring", 1000),
]

RELATED = [
    "website-development-company-wokha-nagaland",
    "software-development-company-nagaland",
    "custom-software-vs-website-wokha-business",
    "hire-web-developer-nagaland",
]

EXTERNAL = [
    {
        "href": "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
        "label": "Google SEO Starter Guide",
    },
    {"href": "https://web.dev/learn", "label": "web.dev Learn"},
    {"href": "https://pagespeed.web.dev/", "label": "PageSpeed Insights"},
]


def pub_date(i: int) -> str:
    # 2026-04-05 onward
    day = 5 + i
    if day <= 30:
        return f"2026-04-{day:02d}"
    return f"2026-05-{day - 30:02d}"


def main() -> None:
    lines: list[str] = []
    lines.append("/**")
    lines.append(" * Batch 3 — keywords from India CSV, filtered for MHAROMO-relevant terms.")
    lines.append(" * Skipped junk volume: WhatsApp Web, Indigo check-in, web series, PDF tools, etc.")
    lines.append(" */")
    lines.append("")
    lines.append("export const postsBatch3 = [")

    for i, (slug, kw, title, cat, _vol) in enumerate(POSTS):
        date = pub_date(i)
        desc = (
            f"{title} Practical buyer guide for Indian and Nagaland businesses. "
            f"Primary keyword: {kw}. By MHAROMO Systems."
        )
        faqs = [
            {
                "question": f'What does "{kw}" mean for a small business?',
                "answer": (
                    f"It means paying for an outcome — enquiries, automation, or a product — not a buzzword. "
                    f"MHAROMO Systems scopes {kw} work around users, budget, and ownership."
                ),
            },
            {
                "question": "How long does a typical project take?",
                "answer": (
                    "Brochure websites often take 1–3 weeks after content is ready. "
                    "Custom software and apps take longer and should ship in phases."
                ),
            },
            {
                "question": "Do you serve Wokha and Nagaland?",
                "answer": (
                    "Yes. We deliver remotely with WhatsApp updates and staging demos, "
                    "and we publish local guides for Wokha, Kohima, and Dimapur."
                ),
            },
            {
                "question": "How do I get a quote?",
                "answer": (
                    "WhatsApp MHAROMO Systems with your business type, city, and must-have features. "
                    "You get a clear next step — not a vague package."
                ),
            },
            {
                "question": "Where should I start if I am unsure?",
                "answer": (
                    "Open /services for web or software pages, or ask us which path fits after a short discovery chat."
                ),
            },
        ]

        wa = "https://wa.me/916009325630?text=" + quote(
            f"Hi MHAROMO — I want help with {kw}"
        )

        sections = [
            {
                "type": "p",
                "text": (
                    f'This guide covers "{kw}" for Indian and Nagaland businesses that need clarity before they spend. '
                    f"India search demand for this topic is high, but most results are generic. "
                    "Below is a buyer-focused explanation tied to how MHAROMO Systems scopes real projects."
                ),
            },
            {"type": "h2", "text": f'What "{kw}" means in plain English'},
            {
                "type": "p",
                "text": (
                    f'When people search "{kw}", they usually want a vendor, a definition, or a course. '
                    "If you run a business in Wokha, Kohima, Dimapur, or elsewhere in Nagaland, translate the phrase into an outcome: "
                    "more enquiries, fewer spreadsheet errors, faster operations, or a product customers pay for."
                ),
            },
            {"type": "h2", "text": "Who this is for"},
            {
                "type": "ul",
                "items": [
                    "Owners comparing DIY tools vs hiring a studio",
                    "Teams replacing WhatsApp + Excel with something durable",
                    "Brands that need a credible web presence before ad spend",
                    "Institutions (schools, NGOs, clinics) that need clear information online",
                ],
            },
            {"type": "h2", "text": "What a good engagement includes"},
            {
                "type": "ol",
                "items": [
                    "Written scope with milestones and acceptance criteria",
                    "Mobile-first delivery tested on mid-range Android phones",
                    "SEO foundations: titles, headings, sitemap, analytics",
                    "WhatsApp or call conversion paths where they help",
                    "Ownership of domain, hosting access, and source code",
                ],
            },
            {"type": "h2", "text": "Common mistakes that waste money"},
            {
                "type": "ul",
                "items": [
                    "Buying the cheapest package with locked hosting",
                    "Building an app when a website would convert first",
                    'Skipping content and photos until after "design is done"',
                    "No one assigned to update the system after launch",
                    "Chasing vanity keywords instead of buyer intent in your city",
                ],
            },
            {"type": "h2", "text": "How MHAROMO Systems approaches it"},
            {
                "type": "p",
                "text": (
                    f'We treat "{kw}" as a business problem. Start with the smallest useful release, prove it with real users, then expand. '
                    "See [[0]], [[1]], and [[2]]. Live brand work includes [[3]]."
                ),
                "links": [
                    {
                        "href": "/services/web-development-wokha",
                        "label": "web development in Wokha",
                    },
                    {
                        "href": "/services/web-development-nagaland",
                        "label": "Nagaland website development",
                    },
                    {
                        "href": "/services/software-development-nagaland",
                        "label": "custom software in Nagaland",
                    },
                    {
                        "href": "https://www.miloniwater.com/",
                        "label": "MILONI Water",
                        "external": True,
                    },
                ],
            },
            {"type": "h2", "text": "Recommended next steps"},
            {
                "type": "ol",
                "items": [
                    "Write one paragraph: who you serve and the one action you want",
                    "List must-have features vs nice-to-haves",
                    "Open our matching /services page and WhatsApp a quote request",
                    "Ask for staging demos before final payment",
                ],
            },
            {
                "type": "p",
                "text": (
                    "Related reading: [[0]], [[1]], [[2]], and [[3]]."
                ),
                "links": [
                    {
                        "href": "/blogs/website-development-company-wokha-nagaland",
                        "label": "Wokha website development guide",
                    },
                    {
                        "href": "/blogs/software-development-company-nagaland",
                        "label": "Nagaland software development guide",
                    },
                    {
                        "href": "/blogs/website-cost-nagaland-2026",
                        "label": "website cost guide",
                    },
                    {
                        "href": "/blogs/hire-web-developer-nagaland",
                        "label": "hiring checklist",
                    },
                ],
            },
            {
                "type": "cta",
                "text": "WhatsApp MHAROMO for a scoped quote",
                "href": wa,
            },
        ]

        post = {
            "slug": slug,
            "title": title,
            "description": desc,
            "keywords": [kw, f"{kw} India", f"{kw} Nagaland", "MHAROMO Systems"],
            "category": cat,
            "primaryKeyword": kw,
            "publishedAt": date,
            "updatedAt": date,
            "readingMinutes": 10,
            "relatedSlugs": RELATED,
            "externalLinks": EXTERNAL,
            "faqs": faqs,
            "sections": sections,
        }

        # Serialize post as JS object (json works for our structure; True -> true)
        js = json.dumps(post, indent=2, ensure_ascii=False)
        js = js.replace(": true", ": true").replace(": false", ": false")
        # convert JSON to JS-ish (already fine); just indent as array element
        indented = "\n".join("  " + line if line else line for line in js.splitlines())
        lines.append(indented + ",")

    lines.append("];")
    lines.append("")
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {len(POSTS)} posts -> {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
