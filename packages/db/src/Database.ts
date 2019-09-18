import { Namespace } from "cls-hooked";
import { TransactionManager } from "./TransactionManager";

export interface Database<
  Connection,
  Transaction,
  TM extends TransactionManager<Transaction>,
> {
  namespace: Namespace
  transactionManager: TM
  connect(): Promise<Connection>
  getConnection(): Connection
  close(): Promise<void>
}
