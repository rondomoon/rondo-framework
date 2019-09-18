export interface TransactionManager<Transaction = unknown> {
  isInTransaction: () => boolean
  /**
   * Start a new or reuse an existing transaction.
   */
  doInTransaction: <T>(fn: (t: Transaction) => Promise<T>) => Promise<T>
  /**
   * Always start a new transaction, regardless if there is one already in
   * progress in the current context.
   */
  doInNewTransaction: <T>(fn: (t: Transaction) => Promise<T>) => Promise<T>
}
