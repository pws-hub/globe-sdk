
export declare type MDPConfig = {
  host: string
  userAgent: string
  accessToken: string
  server: string
  collections: string[]
  dbServer?: string
  dbName?: string
}

export type Process = {
  error: any
  message?: string
  data?: any
  final: { [index: string]: any }
}
export type AnyObject = {
  [index: string]: any
}

declare global {
  var Globe_MDPConfig: MDPConfig
}

declare module 'fastify' {
  interface FastifyInstance {
    dp: any
  }
}
