package A_basic.datastore;

        import A_basic.model.Job;
import A_basic.model.ScheduledJob;
import A_basic.model.JobRun;

        import java.util.HashMap;
        import java.util.Map;
import java.util.ArrayList;
import java.util.List;

        public class InMemoryDataStore implements DataStore {
            private final Map<String, Job> jobMap;
    private final Map<String, ScheduledJob> scheduledJobMap;
    private final Map<String, JobRun> jobRunMap;

            public InMemoryDataStore() {
                this.jobMap = new HashMap<>();
        this.scheduledJobMap = new HashMap<>();
        this.jobRunMap = new HashMap<>();
            }


            @Override
            public Job getJob(String key) {
                return jobMap.get(key);
            }

            @Override
            public void putJob(String key, Job value) {
                jobMap.put(key, value);
            }

            @Override
            public boolean containsJob(String key) {
                return jobMap.containsKey(key);
            }

            @Override
            public Job removeJob(String key) {
                return jobMap.remove(key);
            }
            @Override
            public ScheduledJob getScheduledJob(String key) {
                return scheduledJobMap.get(key);
            }

            @Override
            public void putScheduledJob(String key, ScheduledJob value) {
                scheduledJobMap.put(key, value);
            }

            @Override
            public boolean containsScheduledJob(String key) {
                return scheduledJobMap.containsKey(key);
            }

            @Override
            public ScheduledJob removeScheduledJob(String key) {
                return scheduledJobMap.remove(key);
            }

            @Override
            public List<ScheduledJob> getScheduledJobList() {
                return new ArrayList<>(scheduledJobMap.values());
            }
            @Override
            public JobRun getJobRun(String key) {
                return jobRunMap.get(key);
            }

            @Override
            public void putJobRun(String key, JobRun value) {
                jobRunMap.put(key, value);
            }

            @Override
            public boolean containsJobRun(String key) {
                return jobRunMap.containsKey(key);
            }

            @Override
            public JobRun removeJobRun(String key) {
                return jobRunMap.remove(key);
            }
        }
