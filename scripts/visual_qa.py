from pathlib import Path
import json
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("CN_QA_URL", "http://127.0.0.1:8833/")
OUT = Path(".hermes/artifacts/visual-refresh/current")
OUT.mkdir(parents=True, exist_ok=True)
results = []

with sync_playwright() as pw:
    browser = pw.chromium.launch(
        headless=True,
        executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    )
    for name, width, height in (("desktop", 1440, 900), ("scaled-mac", 782, 1000), ("mobile", 390, 844)):
        context = browser.new_context(
            viewport={"width": width, "height": height}, reduced_motion="reduce"
        )
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        response = page.goto(BASE, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(2500)
        page.evaluate("""async () => {
            for (const el of document.querySelectorAll('section, footer')) {
                el.scrollIntoView({block: 'center'});
                await new Promise(resolve => setTimeout(resolve, 80));
            }
            scrollTo(0, 0);
        }""")
        metrics = page.evaluate("""() => ({
            status: document.readyState,
            viewport: innerWidth,
            scrollXAfterProbe: (scrollTo(1000, 0), scrollX),
            hiddenReveals: [...document.querySelectorAll('.reveal')]
                .filter(el => getComputedStyle(el).opacity === '0').length,
            brokenImages: [...document.images]
                .filter(img => img.complete && img.naturalWidth === 0 && !img.src.startsWith('data:'))
                .map(img => img.src),
            h1Count: document.querySelectorAll('h1').length,
        })""")
        page.evaluate("scrollTo(0, 0)")
        screenshot = OUT / f"home-{name}.jpg"
        page.screenshot(path=str(screenshot), type="jpeg", quality=82)
        results.append({
            "name": name,
            "http": response.status if response else 0,
            "errors": errors,
            "metrics": metrics,
            "screenshot": str(screenshot),
        })
        context.close()
    browser.close()

(OUT / "results.json").write_text(json.dumps(results, indent=2))
for result in results:
    assert result["http"] == 200, result
    assert result["errors"] == [], result
    assert result["metrics"]["scrollXAfterProbe"] == 0, result
    assert result["metrics"]["hiddenReveals"] == 0, result
    assert result["metrics"]["brokenImages"] == [], result
    assert result["metrics"]["h1Count"] == 1, result
print("PASS: 3 responsive viewports")
