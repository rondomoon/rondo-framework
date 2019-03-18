import {ICredentials} from './ICredentials'

export interface INewUser extends ICredentials {
  firstName: string
  lastName: string
}
