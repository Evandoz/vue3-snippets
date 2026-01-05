## 使用方式

## 安装必要的依赖
```sh
npm install @fingerprintjs/fingerprintjs
```

## 在 vue3 app 入口中引入并使用
```ts
import Fingerprint from './plugins/fingerprint';

const app = createApp(App);

// 其他逻辑

// 设备指纹
app.use(Fingerprint);
```

## 读取
```ts
// 从 sessionStorage 中读取
// 取决于 保存到 sessionStorage 还是 localStorage
sessionStorage.getItem('__th_ss_fp__')
```

或者
```ts
// 挂载为 vue 全局变量
export default {
  mounted() {
    console.log(this.$fingerprint)
  }
}
```
