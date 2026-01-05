import { App } from 'vue';
import { useStorage } from '@vueuse/core';
/* import { simpleMarkdownParser } from '@/utils/format'; */

export default {
  install(app: App, options: Record<string, any> = {}) {
    const { url = window.location.href } = options;

    const changelogVisible = useStorage('__th_ls_changelog__', false);
    const currentETag = useStorage('__th_ss_etag__', '');

    // 获取最新 ETag
    async function fetchLatestETag() {
      try {
        const timestamp = new Date().getTime(); // 获取当前时间戳
        const response = await fetch(`${url}?_t=${timestamp}`, {
          // 添加时间戳参数
          method: 'HEAD',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (response.ok) {
          return response.headers.get('ETag');
        }
      } catch (err: any) {
        // console.error('获取 ETag 时出错:', err);
      }
      return null;
    }

    // 显示更新日志
    async function showChangelog() {
      if (!changelogVisible.value) return;
      try {
        // 获取更新日志，示例保存在本地 /changelog.md 文件中
        const response = await fetch('/changelog.md');
        if (response.status === 200) {
          // 返回 Markdown 内容
          const markdownData = await response.text();
          console.log('markdownData', markdownData);
          // 日志内容
          // 使用 markdown 解析器将 markdown 转换为 HTML
          // 取决于日志的保存方式，可以是本地文件，也可以是远程接口
          // 这里使用自定义的 markdown 简易解析器
          // utils/format.ts 中定义
          /* const parsedData = simpleMarkdownParser(markdownData); */

          // 结合所使用的 UI 库，实现显示更新日志
          // 这里使用 Arco Design Vue 的 Modal 组件
          /*
          /* Modal.open({
            title: '系统更新',
            width: 720,
            titleAlign: 'start',
            footer: false,
            modalClass: 'no-border',
            content: () => h(Typography, { innerHTML: parsedData }),
            onClose: () => {
              changelogVisible.value = false;
            },
          }); */
        }
      } catch (err: any) {
        console.error(err?.message || '获取更新日志失败');
      }
    }

    // 提示用户刷新页面
    function promptUserToRefresh() {
      // 结合所使用的 UI 库，实现提示用户刷新页面
      // 这里使用 Arco Design Vue 的 Notification 组件
      /* Notification.info({
        id: 'update-checker',
        title: () =>
          h(
            'div',
            { style: { display: 'flex', gap: '4px', alignItems: 'flex-end' } },
            [h(IconBulb, { size: 20 }), h('span', {}, '发现新版本')]
          ),
        showIcon: false,
        content: () =>
          h('div', { style: { lineHeight: '1.5', marginTop: '12px' } }, [
            h(
              'span',
              { style: { whiteSpace: 'nowrap' } }, // 不允许换行
              '立即刷新页面？请确保已保存所有未保存的内容'
            ),
          ]),
        duration: 0,
        footer: () =>
          h(
            'div',
            {
              style: {
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                alignItems: 'center',
              },
            },
            [
              h(
                Link,
                {
                  style: { marginLeft: '-2px', fontSize: '13px' },
                  onClick: () => {
                    // Notification.remove('update-checker');
                    changelogVisible.value = true;
                    showChangelog();
                  },
                },
                {
                  default: () => '查看近期更新',
                }
              ),
              h('div', { style: { flex: '1 1 auto' } }),
              h(
                Button,
                {
                  type: 'secondary',
                  size: 'small',
                  status: 'normal',
                  style: { padding: '0 12px' },
                  onClick: () => {
                    Notification.remove('update-checker');
                    showChangelog();
                  },
                },
                {
                  default: () => '忽略',
                }
              ),
              h(
                Button,
                {
                  type: 'primary',
                  size: 'small',
                  style: { padding: '0 12px' },
                  onClick: () => window.location.reload(),
                },
                {
                  default: () => '刷新',
                }
              ),
            ]
          ),
      }); */
    }

    // 检查更新
    async function checkForUpdate() {
      const latestETag = await fetchLatestETag();

      if (latestETag && latestETag !== currentETag.value) {
        promptUserToRefresh();
        currentETag.value = latestETag;
      }
    }

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate(); // 页面变为可见时检查更新
      }
    });

    // 监听窗口聚焦事件
    window.addEventListener('focus', checkForUpdate); // 窗口获得焦点时检查更新

    // 初次加载时检查更新
    // checkForUpdate();

    // 初次加载时显示更新日志
    showChangelog();
  },
};
