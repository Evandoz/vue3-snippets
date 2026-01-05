## 使用方式

## aliyun-sts

1. 安装必要的依赖
```shell
npm install crypto-js @vueuse/core
```

2. 在组件中引入并使用
```ts
import useAliyunSts from '@/composables/aliyun-sts'

const { signatureUrl } = useAliyunSts

signatureUrl(xxxurl)
```

也可以对 useAliyunSts 逻辑进行改造 使用 provide/inject 或者 store，详情见代码
