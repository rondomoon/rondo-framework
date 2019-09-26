import { UserProfile } from '@rondo.dev/common'

export interface ClientConfig {
  readonly appName: string
  readonly baseUrl: string
  readonly csrfToken: string
  readonly user?: UserProfile
}
