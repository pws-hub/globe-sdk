
export declare type WPSConfig = {
  server: string
  host: string
  userAgent: string
  provider: string
  accessToken: string
  headers: { [index: string]: string }
  sendVerb?: string
}

declare global {
  var Globe_WPSConfig: WPSConfig
}

export type EventListeners = { [index: string]: (( arg?: any ) => void)[] }
export type CustomListeners = { [index: string]: ( arg?: any ) => void }