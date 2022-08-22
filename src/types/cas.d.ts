
import type { S3 } from 'aws-sdk'

export type Space = {
  region: string
  endpoint: string
  version: string
  bucket: string
  host: string
}

export type CASConfig = {
  accessKey: string
  secret: string
  compressKey: string
  spaces: Space[]
  staticPrefix?: string
  defaultRegion?: string
  permission?: string
}
export type S3Connection = {
  bucket: string
  host: string
  S3: S3
}
export type SpaceOption = {
  absoluteURL: boolean
}
export type StreamParams = {
  maxLength?: number
  chunkRange?: number
  queueSize?: number
}
export type S3ProgressListener = ( details: S3.ManagedUpload.Progress ) => void
