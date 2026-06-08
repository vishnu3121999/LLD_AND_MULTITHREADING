package A_basic.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Directory {
    private final String directoryId;
    private final String name;
    private final List<String> directoryList;
    private final List<String> fileList;
    public Directory(String directoryId, String name) { this.directoryId = directoryId; this.name = name; this.directoryList = new ArrayList<>(); this.fileList = new ArrayList<>(); }
    public void addDirectory(String childDirectoryId) { directoryList.add(childDirectoryId); }
    public void addFile(String fileId) { fileList.add(fileId); }
    @Override public String toString() { return "Directory{" + "directoryId='" + directoryId + "'" + ", name='" + name + "'" + ", directoryList=" + directoryList + ", fileList=" + fileList + '}'; }
    public String getDirectoryId() { return directoryId; }
    public String getName() { return name; }
    public List<String> getDirectoryList() { return Collections.unmodifiableList(directoryList); }
    public List<String> getFileList() { return Collections.unmodifiableList(fileList); }
}
