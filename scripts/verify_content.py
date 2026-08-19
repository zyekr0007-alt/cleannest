#!/usr/bin/env python3
"""CleanNest content-system verifier.
Cross-checks content/*.json against the live HTML so one-update discipline can be
enforced: edit a JSON catalog + the matching HTML, then run this — it reports every
location that still needs the update.

Usage: python3 scripts/verify_content.py   (from repo root)
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ok, bad = [], []

def check(name, cond, detail=""):
    (ok if cond else bad).append(name)
    print(("PASS" if cond else "FAIL"), name, detail)

def read(p):
    return open(os.path.join(ROOT, p), encoding="utf-8").read()

def html(rel):
    return read(rel)

# ---------- SERVICES ----------
from urllib.parse import quote
svc = json.load(open(ROOT + "/content/services.json", encoding="utf-8"))["services"]
idx, srv = html("index.html"), html("services.html")
for s in svc:
    check(f"service page exists: {s['name']}", os.path.isfile(ROOT + "/" + s["url"]), s["url"])
    check(f"service jpg exists: {s['name']}", os.path.isfile(ROOT + "/" + s["image"]))
    check(f"service webp exists: {s['name']}", os.path.isfile(ROOT + "/" + s["webp"]))
    check(f"services.html has {s['name']}", s["name"] in srv)
    name_html = s["name"].replace("&", "&amp;")
    check(f"homepage card: {s['name']}", (s["name"] in idx or name_html in idx) if s["homepage"] else True)
    # WhatsApp prefill appears URL-encoded (spaces %20, apostrophe %27, ! %21)
    phrase = s["waText"].split("quote for ", 1)[1].rstrip(".") if "quote for " in s["waText"] else s["name"]
    enc = quote("a quote for " + phrase, safe="")
    check(f"wa text present somewhere: {s['name']}", enc in idx or enc in srv)
check("schema catalog has 9 services", html("services.html").count('"@type":"Service"') >= 9)

# ---------- REVIEWS ----------
revs = json.load(open(ROOT + "/content/reviews.json", encoding="utf-8"))["reviews"]
about = html("about.html")
for r in revs:
    t = r["text"][:40]
    check(f"review on homepage: {t}...", r["text"][:30] in idx)
    check(f"review on about: {t}...", r["text"][:30] in about)
check("homepage shows 4.9 / 219", "4.9" in idx and "219" in idx)
check("schema review count matches (3 visible)", idx.count('"@type": "Review"') == 3 or idx.count('"@type":"Review"') == 3)

# ---------- AREAS ----------
areas = json.load(open(ROOT + "/content/areas.json", encoding="utf-8"))["areas"]
foot = re.search(r'<div class="footer-cities">(.*?)</div>', idx, re.S)
foot_html = foot.group(1) if foot else ""
for a in areas:
    check(f"area city page: {a['name']}", os.path.isfile(ROOT + "/" + a["url"]), a["url"])
    check(f"area on homepage chips: {a['name']}", a["name"] in idx)
    check(f"area in footer band: {a['name']}", a["name"] in foot_html)
    check(f"area in schema areaServed: {a['name']}", f'"name": "{a["name"]}"' in idx)
    if a["distance"]:
        check(f"distance chip: {a['name']}", a["distance"] in html(a["url"]))
check("12 cities total", len(areas) == 12)

# ---------- BEFORE/AFTER ----------
ba = json.load(open(ROOT + "/content/before-after.json", encoding="utf-8"))["projects"]
for p in ba:
    check(f"BA file exists: {p['before']}", os.path.isfile(ROOT + "/" + p["before"]))
    check(f"BA on homepage: {p['role']}", p["before"].split("/")[-1] in idx)
check("BA slider present", 'data-slider' in idx and 'role="slider"' in idx)

# ---------- BLOG ----------
blog = json.load(open(ROOT + "/content/blog.json", encoding="utf-8"))["posts"]
for p in blog:
    pf = ROOT + "/" + p["url"]
    exists = os.path.isfile(pf)
    check(f"blog file exists: {p['slug']}", exists, p["url"])
    if not exists:
        continue
    pt = open(pf, encoding="utf-8").read()
    check(f"blog canonical: {p['slug']}", p["canonical"] in pt)
    check(f"blog datePublished: {p['slug']}", f'"datePublished": "{p["date"]}"' in pt)
    check(f"blog article schema: {p['slug']}", '"@type": "Article"' in pt)
    check(f"blog featured image: {p['slug']}", p["image"] in pt or "../" + p["image"] in pt)
    check(f"blog image file exists: {p['slug']}", os.path.isfile(ROOT + "/" + p["image"]))
    check(f"blog title in file: {p['slug']}", p["title"][:40] in pt)
check("blog listing has 30 cards", html("blog.html").count("blog-card") >= 30)
check("blog cards have dates", html("blog.html").count("bc-date") >= 30)

# ---------- BRAND ----------
brand = json.load(open(ROOT + "/content/brand.json", encoding="utf-8"))
css = read("assets/css/style.css")
for name, hexv in brand["colors"].items():
    check(f"css token {name}={hexv}", hexv in css)
check("fonts in css", "Sora" in css and "Inter" in css)

print(f"\n=== {len(ok)} PASS / {len(bad)} FAIL ===")
sys.exit(1 if bad else 0)
