import {AsyncRouter} from '../router'
import {BaseRoute} from './BaseRoute'
import {IAPIDef} from '@rondo/common'
import {IStoryService} from '../services/IStoryService'

export class StoryRoutes extends BaseRoute<IAPIDef> {
  constructor(
    protected readonly storyService: IStoryService,
    protected readonly t: AsyncRouter<IAPIDef>,
  ) {
    super(t)
  }

  setup(t: AsyncRouter<IAPIDef>) {

    t.get('/stories/by-url', async req => {
      const {url} = req.query
      return this.storyService.findOne(url)
    })

  }

}
