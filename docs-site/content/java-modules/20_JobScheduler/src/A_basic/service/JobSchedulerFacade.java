package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.Job;
import A_basic.model.JobRun;
import A_basic.model.ScheduledJob;
import A_basic.model.enums.RunStatus;
import A_basic.model.enums.ScheduleStatus;

import java.util.ArrayList;
import java.util.List;

public class JobSchedulerFacade {
    private final DataStore dataStore;
    public JobSchedulerFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public List<JobRun> runDueJobs(long nowMillis) {
        List<JobRun> runs = new ArrayList<>();
        for (ScheduledJob scheduledJob : dataStore.getScheduledJobList()) {
            if (scheduledJob.getScheduleStatus() == ScheduleStatus.ACTIVE && scheduledJob.getNextRunAt() <= nowMillis) {
                JobRun jobRun = runJob(scheduledJob, nowMillis);
                runs.add(jobRun);
            }
        }
        return runs;
    }

    // System methods

    public JobRun runJob(ScheduledJob scheduledJob, long nowMillis) {
        JobRun jobRun = new JobRun("run-" + scheduledJob.getScheduledJobId() + "-" + nowMillis, scheduledJob.getJobId(), nowMillis, RunStatus.SUCCESS);
        dataStore.putJobRun(jobRun.getJobRunId(), jobRun);
        scheduledJob.advance();
        return jobRun;
    }

    // Admin methods

    public void addJob(String jobId, String name, String command) { Job job = new Job(jobId, name, command); dataStore.putJob(job.getJobId(), job); }
    public void scheduleJob(String scheduledJobId, String jobId, long nextRunAt, long intervalMillis) { ScheduledJob scheduledJob = new ScheduledJob(scheduledJobId, jobId, nextRunAt, intervalMillis); dataStore.putScheduledJob(scheduledJob.getScheduledJobId(), scheduledJob); }

    // Util/helper methods
}
