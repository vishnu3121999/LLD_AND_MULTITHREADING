package A_basic.model;

public class File {
    private final String fileId;
    private final String name;
    private String content;
    public File(String fileId, String name, String content) { this.fileId = fileId; this.name = name; this.content = content; }
    public void write(String content) { this.content = content; }
    public String read() { return content; }
    @Override public String toString() { return "File{" + "fileId='" + fileId + "'" + ", name='" + name + "'" + ", content='" + content + "'" + '}'; }
    public String getFileId() { return fileId; }
    public String getName() { return name; }
    public String getContent() { return content; }
}
