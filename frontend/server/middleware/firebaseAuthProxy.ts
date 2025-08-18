import { defineEventHandler, getRequestURL, getRequestHeaders, readRawBody } from 'h3'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname || ''

  const shouldProxy = pathname.startsWith('/__/auth/') || pathname.startsWith('/__/firebase/')
  if (!shouldProxy) {
    return
  }

  const projectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID as string | undefined
  const configuredAuthDomain = (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN as string | undefined

  const targetDomain = configuredAuthDomain && configuredAuthDomain.includes('.firebaseapp.com')
    ? configuredAuthDomain
    : projectId
      ? `${projectId}.firebaseapp.com`
      : ''

  if (!targetDomain) {
    event.node.res.statusCode = 500
    event.node.res.setHeader('content-type', 'text/plain; charset=utf-8')
    return 'Firebase auth proxy is misconfigured: missing VITE_FIREBASE_PROJECT_ID or VITE_FIREBASE_AUTH_DOMAIN'
  }

  const targetUrl = `https://${targetDomain}${pathname}${url.search || ''}`

  const method = event.node.req.method || 'GET'
  const headers = getRequestHeaders(event) as Record<string, string>

  // Remove host header to avoid cross-origin issues
  delete (headers as any).host

  let body: any
  if (method !== 'GET' && method !== 'HEAD') {
    body = await readRawBody(event)
  }

  const res = await fetch(targetUrl, {
    method,
    headers: headers as any,
    body: body as any
  })

  event.node.res.statusCode = res.status
  // Copy relevant headers
  res.headers.forEach((value, key) => {
    try {
      // Avoid setting forbidden headers
      if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        event.node.res.setHeader(key, value)
      }
    } catch {}
  })

  const buffer = Buffer.from(await res.arrayBuffer())
  return buffer
})

