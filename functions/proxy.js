export async function onRequest(context) {
  const { request } = context;
  const urlObj = new URL(request.url);
  const target = urlObj.searchParams.get('url');

  if (!target) {
    return new Response('缺少 url 参数', { status: 400 });
  }

  let targetUrl = decodeURIComponent(target);
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'http://' + targetUrl;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: request.headers,
      redirect: 'follow',
      eo: {
        timeoutSetting: {
          connectTimeout: 30000,
          readTimeout: 30000,
          writeTimeout: 30000
        }
      }
    });

    const buf = await response.arrayBuffer();
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*'); // CORS
    headers.set('Content-Disposition', 'attachment'); // 附件下载

    return new Response(buf, { status: response.status, headers });
  } catch (err) {
    return new Response(`请求错误：${err.message}`, { status: 502 });
  }
}
