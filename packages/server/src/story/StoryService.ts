import URL from 'url'
import {BaseService} from '../services/BaseService'
import {ISiteService} from '../site/ISiteService'
import {IStoryService} from './IStoryService'
import {ITransactionManager} from '../database/ITransactionManager'
import {Story} from '../entities/Story'
import {UniqueTransformer} from '../error/ErrorTransformer'

export class StoryService extends BaseService implements IStoryService {
  constructor(
    transactionManager: ITransactionManager,
    protected readonly siteService: ISiteService,
  ) {
    super(transactionManager)
  }

  async findOne(url: string) {
    const storyRepo = this.getRepository(Story)
    const story = await storyRepo.findOne({
      where: {url},
    })
    if (story) {
      return story
    }

    const domain = URL.parse(url).hostname
    const site = await this.siteService.findByDomain(domain!)

    if (!site) {
      return undefined
    }

    try {
      return await storyRepo.save({
        url,
        siteId: site.id,
      })
    } catch (err) {
      // throw if not a unique constraint error
      UniqueTransformer.throwIfNotMatch(err)

      // This could happen if there are two concurrent requests coming in at
      // the same time, and they both cannot find the story, then decide to
      // create a record.
      return await storyRepo.findOne({
        where: {url},
      })
    }
  }
}
