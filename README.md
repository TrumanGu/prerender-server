# prerender-server

a prerender server for SPA's SEO(based on Nodejs)

- nginx判断搜索引擎爬虫后代理到这个prerender服务器
- 内置定时任务定期刷新所有url的缓存
- 使用puppeteer获取加载后的页面喂给蜘蛛
- 蜘蛛访问的新页面会加入到缓存池等待刷新