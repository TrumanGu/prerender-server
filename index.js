
const Koa = require('koa');
const app = new Koa();
const puppeteer = require('puppeteer');
const schedule = require('node-schedule');
const expireTime = 24*60*60*1000;
const cache = {};
const tragetOrigin = 'https://trumangu.fun';

// 凌晨4点更新所有缓存
schedule.scheduleJob('* * 4 * * *',async ()=>{
  console.log(`========start schedule: ${ new Date() }==========`)
  for(let url in cache){
    const start = Date.now();
    cache[url].content = await cache[url].updateFn(url)
    cache[url].time = Date.now().valueOf();
    const ms = Date.now() - start;
    console.log(`url: ${url} spend time: ${ms}ms`)
  }
  console.log(`========end schedule: ${ new Date() }==========`)
}); 

let getPageHtml = async (url) => {

  let cacheContent = cache[url];
  // cache 过期时间默认设置为30min
  if(cacheContent && cacheContent.time - new Date().valueOf() <= expireTime) 
    return cacheContent.content;
    
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const html = await page.content();
  cache[url] = {
    time: new Date().valueOf(),
    content: html,
    updateFn: getPageHtml
  }
  await browser.close();
  return html
}

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});


app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(async ctx => {
  const url = ctx.request.URL.pathname;
  const html = await getPageHtml(tragetOrigin+url)
  ctx.type = 'text/html'
  ctx.body = html
});

app.listen(1024);