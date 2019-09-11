import {ICredentials} from '../auth/ICredentials'

export interface INewUser extends ICredentials {
  firstName: string
  lastName: string
}
