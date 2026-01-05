## 使用方式

## 在 vue3 app 入口中引入并使用

```ts
import BrowserChecker from './plugins/browser-checker';

const app = createApp(App);

// 其他逻辑

// 浏览器检测
app.use(BrowserChecker);
```
