package A_basic.model;

public class FileSystem {
    private final String fileSystemId;
    private final String name;
    private final String rootDirectoryId;
    public FileSystem(String fileSystemId, String name, String rootDirectoryId) { this.fileSystemId = fileSystemId; this.name = name; this.rootDirectoryId = rootDirectoryId; }
    @Override public String toString() { return "FileSystem{" + "fileSystemId='" + fileSystemId + "'" + ", name='" + name + "'" + ", rootDirectoryId='" + rootDirectoryId + "'" + '}'; }
    public String getFileSystemId() { return fileSystemId; }
    public String getName() { return name; }
    public String getRootDirectoryId() { return rootDirectoryId; }
}
