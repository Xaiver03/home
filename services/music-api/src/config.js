import { get_runtime } from "./util.js"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

let OVERSEAS = globalThis?.Deno?.env?.get("OVERSEAS") || globalThis?.process?.env?.OVERSEAS
const runtime = get_runtime()

if (['cloudflare', 'vercel'].includes(runtime)) OVERSEAS = true

const PORT = globalThis?.Deno?.env?.get("PORT") || globalThis?.process?.env?.PORT || 3000

OVERSEAS = Boolean(OVERSEAS)

// 读取 blog-api 保存的 QQ 音乐 Cookie
const loadSavedCookie = () => {
  try {
    const cookieFile = join(process.cwd(), '../../apps/blog-api/config/music_cookie.json')
    if (existsSync(cookieFile)) {
      const data = JSON.parse(readFileSync(cookieFile, 'utf-8'))
      return { uin: data.uin || '', qqmusic_key: data.musickey || '' }
    }
  } catch {}
  return { uin: '', qqmusic_key: '' }
}

export default {
  OVERSEAS,
  PORT,
  get COOKIE() { return loadSavedCookie() },
}
