export interface IComment {
  // TODO make readonly
  id: number
  storyId: number
  message: string
  votes: number
  spams: number
  parentId: number
  userId: number
  childrenIds?: number[]
}
