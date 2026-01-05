## 使用方式

## debug-detect 代码防调试

在 vue3 app 入口中引入并使用
```ts
import { enableDebugDetect } from '@/utils/debug-detect';

// 在 createApp 之前

// 仅在非开发环境开启
if (process.env.NODE_ENV !== 'development') {
  enableDebugDetect();
}

const app = createApp(App);
app.mount('#app');
```
