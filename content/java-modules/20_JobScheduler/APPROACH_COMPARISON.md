# Approach Comparison

## Existing Packages

`A_basic` demonstrates jobs, scheduled jobs, due-job scanning, job run records, and advancing a recurring schedule.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- A job stores executable metadata.
- A scheduled job points to a job and has next run time and interval.
- A job run records execution result.

Action based points:
- Admin adds and schedules jobs.
- User/system runs due jobs.
- System creates job run records and advances schedules.

Misc:
- A_basic runs synchronously by explicit method call.
- Threads, queues, retries, cron parsing, and distributed locking are deferred.

#### Common Misc

Offline or online:
- Treat as infrastructure/API style.

Extensibility:
- Scheduling policy, retries, and execution backend are future extension points.

History and undo:
- JobRun records provide execution history.

Notifications:
- Job success/failure notification is deferred.

Exception handling:
- Missing jobs and command failures are later validations.

Concurrency:
- Duplicate concurrent execution is deferred.

### UseCase Diagram

Actors:
- Admin
- System

UseCases:
- addJob(Admin) -> create Job(System)
- scheduleJob(Admin) -> create ScheduledJob(System)
- runDueJobs(System) -> scan ScheduledJob list(System) -> runJob(System) -> create JobRun(System) -> advance schedule(System)

### Class Diagram

Core entities:
- `Job(jobId, name, command)` stores executable metadata.
- `ScheduledJob(scheduledJobId, jobId, nextRunAt, intervalMillis, scheduleStatus)` stores scheduling state.
- `JobRun(jobRunId, jobId, runAt, runStatus)` stores execution history.

Method placement:
- `runDueJobs` belongs in the facade because it coordinates schedules and runs.
- `advance` belongs in `ScheduledJob` because it only mutates schedule time.
