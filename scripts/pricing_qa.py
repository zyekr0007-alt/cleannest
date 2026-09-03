from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8833/pricing.html"
OUT = Path(".hermes/artifacts/visual-refresh/current")
OUT.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        executable_path="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    )
    page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda exc: errors.append(str(exc)))
    page.goto(BASE, wait_until="networkidle")
    assert page.locator("h1").count() == 1
    assert page.locator(".brand-strip .desk-nav").count() == 1
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    page.screenshot(path=str(OUT / "pricing-desktop.jpg"), full_page=True, type="jpeg", quality=82)
    page.set_viewport_size({"width": 390, "height": 844})
    page.reload(wait_until="networkidle")
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    page.locator("#menu-btn").click()
    page.wait_for_function("document.querySelector('#menu-panel').classList.contains('open')")
    assert page.locator("#menu-panel").evaluate("el => el.classList.contains('open')")
    assert page.locator("#menu-btn").get_attribute("aria-expanded") == "true"
    page.keyboard.press("Escape")
    page.wait_for_function("document.querySelector('#menu-panel').hasAttribute('hidden')")
    assert page.locator("#menu-panel").evaluate("el => el.hasAttribute('hidden')")
    assert page.locator("#menu-btn").get_attribute("aria-expanded") == "false"
    page.screenshot(path=str(OUT / "pricing-mobile.jpg"), full_page=True, type="jpeg", quality=82)
    assert not errors, errors
    browser.close()
print("pricing QA: desktop/mobile layout, no overflow, menu behavior PASS")
