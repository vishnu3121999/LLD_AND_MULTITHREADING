package A_basic.datastore;

        import A_basic.model.Job;
import A_basic.model.ScheduledJob;
import A_basic.model.JobRun;
import java.util.List;

        public interface DataStore {

            Job getJob(String key);

            void putJob(String key, Job value);

            boolean containsJob(String key);

            Job removeJob(String key);
            ScheduledJob getScheduledJob(String key);

            void putScheduledJob(String key, ScheduledJob value);

            boolean containsScheduledJob(String key);

            ScheduledJob removeScheduledJob(String key);

            List<ScheduledJob> getScheduledJobList();
            JobRun getJobRun(String key);

            void putJobRun(String key, JobRun value);

            boolean containsJobRun(String key);

            JobRun removeJobRun(String key);
        }
