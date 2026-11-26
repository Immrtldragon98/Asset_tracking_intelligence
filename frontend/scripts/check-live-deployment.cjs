const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const web = process.env.ATI_WEB_URL, api = process.env.ATI_API_URL;
async function get(path) {
  const response = await fetch(api + path, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw Error("API returned " + response.status + " for " + path);
  return response.json();
}
async function ready() {
  const deadline = Date.now() + 20 * 60 * 1000;
  let attempts = 0;
  while (Date.now() < deadline) {
    try {
      await get("/health");
      const lines = await get("/api/v1/dashboard/");
      if (Array.isArray(lines) && lines.length === 3 && lines.flatMap(line => line.positions).filter(position => position.current_stand).length === 30) return lines;
    } catch {}
    attempts++;
    if (attempts % 5 === 0) console.log("Waiting for the protected import deployment to become ready.");
    await new Promise(resolve => setTimeout(resolve, 15000));
  }
  throw Error("The imported API did not become ready within the deployment window.");
}
(async () => {
  let browser;
  try {
    const lines = await ready();
    const stands = await get("/api/v1/stands/");
    const inventory = await get("/api/v1/inventory/");
    const catalog = await get("/api/v1/assets/catalog");
    assert.equal(lines.length, 3);
    assert.equal(stands.length, 55);
    assert.equal(inventory.length, 28);
    assert(Array.isArray(catalog.assets) && catalog.assets.length > 0);
    const cors = await fetch(api + "/api/v1/dashboard/", { method:"OPTIONS", headers:{Origin:web,"Access-Control-Request-Method":"GET","Access-Control-Request-Headers":"content-type"}, signal:AbortSignal.timeout(30000)});
    assert.equal(cors.headers.get("access-control-allow-origin"), web);
    browser = await chromium.launch({headless:true});
    const context = await browser.newContext({viewport:{width:1440,height:1000}});
    const page = await context.newPage(), errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(web + "/dashboard", {timeout:90000});
    await page.getByRole("heading",{name:"Shift equipment overview"}).waitFor({timeout:60000});
    await page.locator(".engineer-kpi").filter({hasText:"Installed stands"}).getByText("30",{exact:true}).waitFor({timeout:60000});
    await page.goto(web + "/inventory");
    await page.getByRole("heading",{name:"Spare inventory"}).waitFor();
    await page.locator("tbody tr").nth(27).waitFor({timeout:60000});
    await page.goto(web + "/equipment");
    await page.getByRole("heading",{name:"Equipment explorer"}).waitFor();
    const first = lines[0].positions.find(position => position.current_stand);
    await page.goto(web + "/equipment?line=" + encodeURIComponent(lines[0].name) + "&stand=" + first.current_stand.id);
    await page.getByRole("heading",{name:first.current_stand.code,exact:true}).waitFor({timeout:60000});
    await page.waitForResponse(response => response.url().includes("/stands/" + first.current_stand.id) && response.status()===200,{timeout:60000}).catch(()=>{});
    await page.waitForTimeout(500);
    assert.deepEqual(errors,[]);
    await context.close();
    console.log("Live verification passed: API health, 3 lines, 30 installed stands, 55 stand assets, 28 spares, catalog, CORS and read-only desktop navigation.");
  } finally { if (browser) await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode=1; });
