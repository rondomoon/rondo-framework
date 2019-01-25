import {Story} from '../entities/Story'

export interface IStoryService {
  findOne(url: string): Promise<Story | undefined>

  // TODO add other methods
}
