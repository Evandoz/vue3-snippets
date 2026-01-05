/**
 * Aliyun STS
 * https://help.aliyun.com/zh/ram/user-guide/what-is-sts
 * Aliyun 官方 sdk 塞入了很多无用的依赖，导致包体积过大。
 * 适用于由前端对资源进行sts签名，并返回签名后的url，然后直接使用该url访问资源。
 * 如果后端返回的已经是签名后的url，则不需要使用此方法。
 * 阿里云 STS（Security Token Service）是一种临时授权服务，允许用户在一定时间内访问阿里云资源，而不需要使用长期密钥。
 */
import hmacSha1 from 'crypto-js/hmac-sha1';
import Base64 from 'crypto-js/enc-base64';
import axios from 'axios';
import { useStorage } from '@vueuse/core';

// utf-8 -> latin1
function encoder(str: string, encoding = 'utf-8') {
  if (encoding === 'utf-8') {
    return str;
  }

  // 使用 TextEncoder 默认转换为 UTF-8 编码的 Uint8Array
  const utf8Encoder = new TextEncoder();
  const utf8Array = utf8Encoder.encode(str);

  // 使用 TextDecoder 转换 UTF-8 Uint8Array 为 latin1 字符串
  // 注意：浏览器可能不直接支持 'latin1'，使用 'iso-8859-1' 作为替代
  const latin1Decoder = new TextDecoder('iso-8859-1');
  const latin1String = latin1Decoder.decode(utf8Array);

  return latin1String;
}

// 避免多个组件同时触发刷新
let globalRefreshPromise: Promise<any> | null = null;
// 记录上次失败时间，防止接口挂了导致无限重试死循环
let lastErrorTimestamp = 0;
const ERROR_COOL_DOWN = 10000; // 失败后冷却 10 秒

// 这里可以使用 provide/inject 来顶层注入
// 或使用 store(pinia) 来管理控制 STS 令牌，减少重复逻辑
export default function useAliyunSts() {
  // 持久化存储 全局共享 STS 令牌
  const aliyunStsState = useStorage('__th_ss_aliyun_sts__', {
    accessKeyId: undefined,
    accessKeySecret: undefined,
    securityToken: undefined,
    expiration: undefined,
  });

  // 可以把接口解构出去，例如放到 /api 下统一管理
  const queryAliyunSts = async () => {
    const now = Date.now();
    // 如果处于冷却期，直接跳过
    if (now - lastErrorTimestamp < ERROR_COOL_DOWN) {
      return;
    }

    if (globalRefreshPromise) {
      try {
        const data = await globalRefreshPromise;
        if (data) {
          aliyunStsState.value = {
            accessKeyId: data.accessKeyId,
            accessKeySecret: data.accessKeySecret,
            securityToken: data.securityToken,
            expiration: data.expiration,
          };
        }
      } catch (e) {
        // 忽略并发请求的错误，由发起者处理或统一处理
      }
      return;
    }

    globalRefreshPromise = axios
      .get('/sts')
      .then((resp) => resp.data)
      .finally(() => {
        globalRefreshPromise = null;
      });

    try {
      const data = await globalRefreshPromise;
      // 请求成功，重置错误时间
      lastErrorTimestamp = 0;
      aliyunStsState.value = {
        accessKeyId: data.accessKeyId,
        accessKeySecret: data.accessKeySecret,
        securityToken: data.securityToken,
        expiration: data.expiration,
      };
    } catch (error) {
      // 记录失败时间，进入冷却
      lastErrorTimestamp = Date.now();

      // 仅当当前有值时才重置，避免 undefined -> undefined 触发多余的响应式更新
      if (aliyunStsState.value.accessKeyId) {
        aliyunStsState.value = {
          accessKeyId: undefined,
          accessKeySecret: undefined,
          securityToken: undefined,
          expiration: undefined,
        };
      }
      console.error('获取 STS 令牌失败，10秒内不再重试', error);
    }
  };

  // 初始化时立即请求一次
  queryAliyunSts();

  const signatureUrl = (url: string, options: any = {}) => {
    const { accessKeyId, accessKeySecret, securityToken, expiration } =
      aliyunStsState.value;

    const now = Date.now();
    const exp = expiration ? new Date(expiration).getTime() : 0;
    // 提前 5 分钟刷新
    const bufferTime = 5 * 60 * 1000;

    // 1. 无效或完全过期：必须刷新，且无法生成签名
    if (!accessKeyId || !accessKeySecret || !securityToken || exp <= now) {
      // 触发刷新（防抖已在 queryAliyunSts 内部处理）
      queryAliyunSts();
      // 返回空字符串，等待响应式更新后重试
      return '';
    }

    // 2. 临期：静默刷新，但当前仍可用
    if (exp - now < bufferTime) {
      queryAliyunSts();
    }

    // 继续执行签名逻辑
    options = options || {};
    const method = options.method || 'GET';
    const expires = Math.floor(Date.now() / 1000 + (options.expires || 1800));

    const { /* origin, */ hostname, pathname } = new URL(url);
    const bucket = hostname.split('.')?.[0];
    const object = pathname.replace(/^\/+/, '');
    const resource = `/${bucket}/${encoder(object)}`;

    // 构造待签名的字符串
    const canonicalResource = `${method}\n\n\n${expires}\n${resource}?security-token=${securityToken}`;

    // 使用HMAC-SHA1算法生成签名
    const signature = Base64.stringify(
      hmacSha1(canonicalResource, accessKeySecret)
    );

    // 构造完整的URL
    // ${origin}
    // ${import.meta.env.BASE_URL}media
    // 将前缀代理掉，可以避免泄露 oss 域名
    const signedUrl = `${
      import.meta.env.BASE_URL
    }media${pathname}?OSSAccessKeyId=${
      aliyunStsState.value.accessKeyId
    }&Expires=${expires}&Signature=${encodeURIComponent(
      signature
    )}&security-token=${encodeURIComponent(
      aliyunStsState.value.securityToken
    )}`;

    return signedUrl;
  };
  return {
    queryAliyunSts,
    signatureUrl,
  };
}
