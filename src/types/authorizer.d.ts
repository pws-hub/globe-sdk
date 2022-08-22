
import { FastifyRequest } from 'fastify'

export type AuthorizerConfig = {
  manifest: { [index: string]: any }
  allowedOrigins: string
  agentHeader: string
  tokenHeader: string
  rotateToken: boolean
  expiry?: number
  service?: string
  framework?: string
}

export type DecoratedRequest = FastifyRequest & {
  agent?: {
    name: string
    version: string
    manifest: { [index: string]: any }
  }
}

export type SupportedFrameworks = 'express' | 'fastify'