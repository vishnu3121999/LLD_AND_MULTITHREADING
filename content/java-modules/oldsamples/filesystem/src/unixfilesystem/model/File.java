package unixfilesystem.model;

public class File extends FSNode {
    private String content;
    private long size;

    public File(String name, String owner, String content) {
        super(name, owner);
        setContent(content);
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content == null ? "" : content;
        this.size = this.content.length();
    }

    @Override
    public long getSize() {
        return size;
    }

}
