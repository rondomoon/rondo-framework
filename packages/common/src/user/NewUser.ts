import {Credentials} from '../auth'

export interface NewUser extends Credentials {
  firstName?: string
  lastName?: string
  email?: string
}
