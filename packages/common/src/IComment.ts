export interface IComment {
  id: number
  storyId: number
  message: string
  score: number
  parentId: number
  children: IComment[]
}
