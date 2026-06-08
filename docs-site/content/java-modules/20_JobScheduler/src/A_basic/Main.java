package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.model.JobRun;
import A_basic.service.JobSchedulerFacade;

import java.util.UUID;

public class Main { public static void main(String[] args) { System.out.println("=== Job Scheduler Basic Demo ==="); DataStore dataStore = new InMemoryDataStore(); JobSchedulerFacade facade = new JobSchedulerFacade(dataStore); String jobId = id("job"); String scheduleId = id("schedule"); facade.addJob(jobId, "daily-report", "send-report"); facade.scheduleJob(scheduleId, jobId, 1000, 500); for (JobRun run : facade.runDueJobs(1200)) System.out.println(run); System.out.println(dataStore.getScheduledJob(scheduleId)); } private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); } }
