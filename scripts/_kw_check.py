import csv
from pathlib import Path
from collections import Counter

paths = [
    Path(r"c:\Users\pc\.cursor\projects\f-Mharomo\attachments\cfb4be90-95ce-426d-ad40-48d592299c9d\keywords-india-e0f5b_2.csv"),
    Path(r"c:\Users\pc\.cursor\projects\f-Mharomo\attachments\cfb4be90-95ce-426d-ad40-48d592299c9d\keywords-india-e0f5b_1.csv"),
    Path(r"c:\Users\pc\.cursor\projects\f-Mharomo\attachments\cfb4be90-95ce-426d-ad40-48d592299c9d\keywords-india-e0f5b.csv"),
]
p = next(x for x in paths if x.exists())
print("FILE:", p.name)
rows = list(csv.DictReader(p.open(encoding="utf-8-sig")))
print("ROWS:", len(rows))
print("COLS:", list(rows[0].keys()))

# existing site coverage
import re
existing = set()
for f in Path("lib/blogs").glob("posts*.js"):
    existing |= set(re.findall(r'slug:\s*"([^"]+)"', f.read_text(encoding="utf-8")))
    existing |= set(re.findall(r'"slug":\s*"([^"]+)"', f.read_text(encoding="utf-8")))
for f in Path("lib/services").glob("*.js"):
    existing |= set(re.findall(r'slug:\s*"([^"]+)"', f.read_text(encoding="utf-8")))
print("EXISTING_CONTENT_SLUGS:", len(existing))

junk_sub = [
    "whatsapp", "telegram", "indigo", "web series", "xender", "pdf", "kali",
    "wps", "emacs", "airdroid", "ookla", "hamraaz", "bhoomi", "kea",
    "tournament", "lung", "persistent", "video game", "tactical", "cubic",
    "software guard", "adulthood", "hot web", "hottest", "compiler",
    "sports tracking", "aws web services", "circuit design", "custom hardware",
    "medical", "geographic positioning", "treasury", "environmental water",
    "app lock", "operating systems", "closure systems", "integrated process",
    "benefit administrative", "electronic micro", "energy management",
    "building automation", "interactive advisory", "target marketing",
    "interactive medical", "global closure", "combined tactical",
    "system software associates", "systems computer",
]
core = [
    "web development", "software development", "custom software", "app development",
    "mobile app", "it services", "website", "crm", "erp", "saas", "api",
    "full stack", "frontend", "backend", "react", "node", "cms", "content management",
    "software company", "software agency", "design agency", "design company",
    "hire developer", "hire software", "software testing", "software solutions",
    "digital transformation", "software design", "custom solutions", "business software",
    "enterprise software", "cloud software", "software for business", "software architecture",
    "software outsourcing", "software project", "software automation", "software consultant",
    "software integration", "software maintenance", "software product", "system design",
    "hire developers", "custom software development", "software engineers",
    "software engineering", "ui", "ux", "ecommerce", "wordpress", "seo",
]

def is_junk(k):
    k = k.lower()
    return any(j in k for j in junk_sub)

def is_core(k):
    k = k.lower()
    return any(c in k for c in core)

keep, drop, maybe = [], [], []
seen = set()
for r in rows:
    kw = (r.get("keyword") or "").strip()
    if not kw or kw.lower() in seen:
        continue
    seen.add(kw.lower())
    vol = int(float(r.get("search_volume") or 0))
    diff = int(float(r.get("difficulty") or 0))
    intent = r.get("intent") or ""
    item = (vol, diff, intent, kw)
    if is_junk(kw):
        drop.append(item)
    elif is_core(kw):
        keep.append(item)
    else:
        maybe.append(item)

keep.sort(reverse=True)
drop.sort(reverse=True)
maybe.sort(reverse=True)

print("\n=== KEEP (site-relevant)", len(keep), "===")
for v,d,i,k in keep[:50]:
    print(f"{v:>8} d{d:>2} {i[:4]:4} | {k}")
print("\n=== MAYBE", len(maybe), "===")
for v,d,i,k in maybe[:30]:
    print(f"{v:>8} d{d:>2} {i[:4]:4} | {k}")
print("\n=== DROP sample", len(drop), "===")
for v,d,i,k in drop[:15]:
    print(f"{v:>8} d{d:>2} {i[:4]:4} | {k}")

# map keep keywords to whether we already have content
print("\n=== KEEP not obviously covered yet (top commercial/transactional) ===")
covered_kw_bits = [
    "web development", "software development", "custom software", "app development",
    "mobile app", "it services", "crm", "erp", "full stack", "frontend", "backend",
    "react", "node", "cms", "content management", "system design", "saas", "api development",
    "business software", "enterprise", "hire web", "wordpress", "website cost",
    "website designer", "local seo", "ecommerce",
]
# recommend 25-30 new topics from keep that are commercial and not duplicate of batch3 titles
print("Commercial/transactional keep:")
for v,d,i,k in keep:
    if i in ("commercial", "transactional") or any(x in k.lower() for x in ["hire", "company", "agency", "services", "solutions", "consultant", "outsourcing", "maintenance", "testing", "product"]):
        print(f"  [{i}] vol={v} diff={d} :: {k}")
