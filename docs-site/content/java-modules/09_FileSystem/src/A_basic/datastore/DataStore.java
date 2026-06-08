package A_basic.datastore;

        import A_basic.model.FileSystem;
import A_basic.model.Directory;
import A_basic.model.File;

        public interface DataStore {

            FileSystem getFileSystem(String key);

            void putFileSystem(String key, FileSystem value);

            boolean containsFileSystem(String key);

            FileSystem removeFileSystem(String key);
            Directory getDirectory(String key);

            void putDirectory(String key, Directory value);

            boolean containsDirectory(String key);

            Directory removeDirectory(String key);
            File getFile(String key);

            void putFile(String key, File value);

            boolean containsFile(String key);

            File removeFile(String key);
        }
