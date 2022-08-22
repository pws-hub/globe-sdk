
export type APSConfig = {
  userAgent: string
  provider: string
  baseURL: string
}

declare global {
  var Globe_APSConfig: APSConfig
}
