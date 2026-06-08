package A_basic.datastore;

        import A_basic.model.FileSystem;
import A_basic.model.Directory;
import A_basic.model.File;

        import java.util.HashMap;
        import java.util.Map;

        public class InMemoryDataStore implements DataStore {
            private final Map<String, FileSystem> fileSystemMap;
    private final Map<String, Directory> directoryMap;
    private final Map<String, File> fileMap;

            public InMemoryDataStore() {
                this.fileSystemMap = new HashMap<>();
        this.directoryMap = new HashMap<>();
        this.fileMap = new HashMap<>();
            }


            @Override
            public FileSystem getFileSystem(String key) {
                return fileSystemMap.get(key);
            }

            @Override
            public void putFileSystem(String key, FileSystem value) {
                fileSystemMap.put(key, value);
            }

            @Override
            public boolean containsFileSystem(String key) {
                return fileSystemMap.containsKey(key);
            }

            @Override
            public FileSystem removeFileSystem(String key) {
                return fileSystemMap.remove(key);
            }
            @Override
            public Directory getDirectory(String key) {
                return directoryMap.get(key);
            }

            @Override
            public void putDirectory(String key, Directory value) {
                directoryMap.put(key, value);
            }

            @Override
            public boolean containsDirectory(String key) {
                return directoryMap.containsKey(key);
            }

            @Override
            public Directory removeDirectory(String key) {
                return directoryMap.remove(key);
            }
            @Override
            public File getFile(String key) {
                return fileMap.get(key);
            }

            @Override
            public void putFile(String key, File value) {
                fileMap.put(key, value);
            }

            @Override
            public boolean containsFile(String key) {
                return fileMap.containsKey(key);
            }

            @Override
            public File removeFile(String key) {
                return fileMap.remove(key);
            }
        }
