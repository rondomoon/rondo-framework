# TaskExecutor (table polling)

```sql
   create table job (id, status...);
   create table executing_job(id, jobId UNIQUE, workerId);

   " TRY
     insert into executing_job(jobId, workerId) values (?, ?);
   " CATCH
     " other worker has this job
     return

   update job set status = 'executing' where id = ?;

   " TRY
     executeJob(jobId);
   " CATCH
     update job set status = 'error' where id = ?;
     return
   " FINALLY
     delete from executing_job where jobId = ?, workerId = ?;

   update job set status = 'success' where id = ?;
```

 The
TaskExecutor regularly checks the jobs table for a new job to run.

Pros: No need to fill the tasks after a restart as the jobs table can always be
queried.

Cons: slow to react on new requests - we have to wait for the executor to query
the database every N minutes.

# TaskExecutor (push method)

Every server instance can have a TaskExecutor(N) with a queue of jobs. The
server pushes a new job to the tasks queue for every hook received.

The TaskExecutor can execute N async jobs simultaneously. After a job is
completed, the taskexecutor checks if there is another job available in the
queue, if not it waits until a new job is pushed to the queue.

On boot, the server queries the jobs table with any jobs that have not been
executed yet. The queue is filled with jobs from the table.

If there are multiple nodes, the `executing_job` table will prevent the same
job to be executed twice at the same time.

Pros: No need to poll a table manually, the jobs are simply pushed to the queue

Cons: The `jobs` table could become too big...

## Alternative

The TaskExecutor could query for next available (old) job manually after a
period of inactivity (or after every Nth job handled). This seems like the best
solution.

```
                                                                                       ------
                                             |-----------------------------|          /      \
                      |-------| -----------> | instance1 ---> TaskExecutor | -------> |      |
 incoming request     |       |              |-----------------------------|          |      |   table: job
 ------------------>  | proxy |                                                       |  DB  |
                      |       |              |-----------------------------|          |      |   table executing_job
                      |-------| -----------> | instance2 ---> TaskExecutor | -------> |      |
                                             |-----------------------------|          \      /
                                                                                       ------
```

As the incoming request is received, the instanceN writes the request
information into the job table, then passes the Job, as well as the user
context to TaskExecutor.

To isolate TaskExecutor from the rest of the server-side code (to make it
easier to be a part of a separate microservice altogether in the future), it
can notify the server instance as soon as it is idle to query for old jobs.

For example:

```typescript
interface TaskExecutor {
   constructor(n: number)

   // EventEmitter events:
   // - "idle", () => void
   // - "success", (jobId: number) => void
   // - "fail", (jobId: number) => void
   on(event: string, listener: () => void)
   removeListener(event: string, listener: () => void)

   post(job: Job): void
   start(): void
   stop(): void
}
```
