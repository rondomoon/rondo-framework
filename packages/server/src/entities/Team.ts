// import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm'
// import { BaseEntity } from './BaseEntity'
// import { User } from './User'
// import { UserTeam } from './UserTeam'

// @Entity()
// export class Team extends BaseEntity {
//   @Column()
//   name!: string

//   @Column()
//   @Index()
//   userId!: number

//   @ManyToOne(type => User)
//   user?: User

//   @OneToMany(type => UserTeam, userTeam => userTeam.team)
//   userTeams!: UserTeam[]
// }
