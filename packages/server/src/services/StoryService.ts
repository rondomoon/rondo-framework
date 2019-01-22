import {IStoryService} from './IStoryService'
import {Story} from '../entities/Story'
import URL from 'url'

export class StoryService implements IStoryService {
  async findOne(url: string) {
    const parsedUrl = URL.parse(url)
    const hostname = parsedUrl.hostname
  }
}
