package A_basic.model;

import A_basic.model.enums.RunStatus;

public class JobRun { private final String jobRunId; private final String jobId; private final long runAt; private final RunStatus runStatus; public JobRun(String jobRunId, String jobId, long runAt, RunStatus runStatus) { this.jobRunId = jobRunId; this.jobId = jobId; this.runAt = runAt; this.runStatus = runStatus; } @Override public String toString() { return "JobRun{" + "jobRunId='" + jobRunId + "'" + ", jobId='" + jobId + "'" + ", runAt=" + runAt + ", runStatus=" + runStatus + '}'; } public String getJobRunId() { return jobRunId; } public String getJobId() { return jobId; } public long getRunAt() { return runAt; } public RunStatus getRunStatus() { return runStatus; } }
