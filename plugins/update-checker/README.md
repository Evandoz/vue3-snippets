## 使用方式

## 安装必要的依赖
```sh
# 这里使用了 @vueuse/core
npm install @vueuse/core
```

## 在 vue3 app 入口中引入并使用
```ts
import UpdateChecker from './plugins/update-checker';

const app = createApp(App);

// 其他逻辑

// 检查页面更新
app.use(UpdateChecker);
```
