import createError from 'http-errors'
import {BaseService} from './BaseService'
import {IDatabase} from '../database/IDatabase'
import {ICredentials, INewUser, IUser, trim} from '@rondo.dev/common'
import {IUserService} from './IUserService'
import {UserEmail} from '../entities/UserEmail'
import {User} from '../entities/User'
import {compare, hash} from 'bcrypt'
import {validate as validateEmail} from 'email-validator'
import {Validator} from '../validator'

const SALT_ROUNDS = 10
const MIN_PASSWORD_LENGTH = 10

export class UserService implements IUserService {
  constructor(protected readonly db: IDatabase) {}

  async createUser(payload: INewUser): Promise<IUser> {
    const newUser = {
      username: trim(payload.username),
      firstName: trim(payload.firstName),
      lastName: trim(payload.lastName),
    }

    if (!validateEmail(newUser.username)) {
      throw createError(400, 'Username is not a valid e-mail')
    }
    if (payload.password.length < MIN_PASSWORD_LENGTH) {
      throw createError(400,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`)
    }

    new Validator(newUser)
    .ensure('username')
    .ensure('firstName')
    .ensure('lastName')
    .throw()

    const password = await this.hash(payload.password)
    const user = await this.db.getRepository(User).save({
      ...newUser,
      password,
    })
    await this.db.getRepository(UserEmail).save({
      email: newUser.username,
      userId: user.id,
    })
    return {
      id: user.id,
      ...newUser,
    }
  }

  async findOne(id: number) {
    const user = await this.db.getRepository(User).findOne(id, {
      relations: ['emails'],
    })

    if (!user) {
      return undefined
    }

    return {
      id: user.id,
      username: user.emails[0] ? user.emails[0].email : '',
      firstName: user.firstName,
      lastName: user.lastName,
    }
  }

  async findUserByEmail(email: string) {
    const userEmail = await this.db.getRepository(UserEmail)
    .findOne({ email }, {
      relations: ['user'],
    })

    if (!userEmail) {
      return
    }

    const user = userEmail.user!

    return {
      id: userEmail.userId!,
      username: userEmail.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }
  }

  async changePassword(params: {
    userId: number,
    oldPassword: string,
    newPassword: string,
  }) {
    const {userId, oldPassword, newPassword} = params
    const userRepository = this.db.getRepository(User)
    const user = await userRepository
    .createQueryBuilder('user')
    .select('user')
    .addSelect('user.password')
    .whereInIds([ userId ])
    .getOne()
    const isValid = await compare(oldPassword, user ? user.password! : '')
    if (!(user && isValid)) {
      throw createError(400, 'Passwords do not match')
    }
    const password = await this.hash(newPassword)
    await userRepository
    .update(userId, { password })
  }

  async validateCredentials(credentials: ICredentials) {
    const {username, password} = credentials
    const user = await this.db.getRepository(User)
    .createQueryBuilder('user')
    .select('user')
    .addSelect('user.password')
    .addSelect('emails')
    .innerJoin('user.emails', 'emails', 'emails.email = :email', {
      email: username,
    })
    .getOne()

    const isValid = await compare(password, user ? user.password! : '')
    if (user && isValid) {
      return {
        id: user.id,
        username: user.emails[0].email,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    }
  }

  async findUserEmails(userId: number) {
    return this.db.getRepository(UserEmail).find({ userId })
  }

  protected async hash(password: string): Promise<string> {
    return hash(password, SALT_ROUNDS)
  }
}
