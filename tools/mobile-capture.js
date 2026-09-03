// Full-page iPhone captures of every page via openclaw's bundled Playwright.
// usage: node tools/mobile-capture.js <outdir> [index,about,...]  (dev server on :8137)
// Scrolls each page first so the reveal sweep runs, then screenshots at 393×852 @2×.
const pw=require('/Users/primary/local/lib/node_modules/openclaw/node_modules/playwright-core');
const S=process.argv[2]; const pages=(process.argv[3]||'index,about,foundation,sponsors,artists,night,walk,donate').split(',');
(async()=>{
  const b=await pw.chromium.launch({executablePath:'/Users/primary/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'});
  const ctx=await b.newContext({viewport:{width:393,height:852},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
  const page=await ctx.newPage();
  for(const p of pages){
    await page.goto('http://localhost:8137/'+(p==='index'?'':p+'.html')+'?m='+Date.now(),{waitUntil:'networkidle'});
    await page.evaluate(async()=>{await document.fonts.ready; const H=document.body.scrollHeight; for(let y=0;y<H;y+=500){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,90));} window.scrollTo(0,0); await new Promise(r=>setTimeout(r,400));});
    const h=await page.evaluate(()=>({H:document.body.scrollHeight,sw:document.documentElement.scrollWidth,vw:innerWidth}));
    await page.screenshot({path:`${S}/m-${p}.png`,fullPage:true});
    console.log(p,JSON.stringify(h));
  }
  // menu open on home
  await page.goto('http://localhost:8137/?menu=1',{waitUntil:'networkidle'}); await page.click('#menuBtn'); await page.waitForTimeout(600); await page.screenshot({path:`${S}/m-menu.png`});
  await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
