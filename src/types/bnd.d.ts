
export declare type BNDConfig = {
  host: string
  server: string
  userAgent: string
  application: string
  accessToken: string
  headers?: {[index: string]: string}
}

declare global {
  var Globe_BNDConfig: BNDConfig
}

declare module 'fastify' {
  interface FastifyRequest {
    bnd: any
  }
}