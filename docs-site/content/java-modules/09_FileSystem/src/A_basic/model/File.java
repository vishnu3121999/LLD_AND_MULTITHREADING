package A_basic.model;

import A_basic.model.enums.NodeType;

public class File extends FileSystemNode {
    private String content;

    public File(String fileId, String name, String owner, String content) {
        super(fileId, name, owner, NodeType.FILE);
        this.content = content;
    }

    public void write(String content) {
        this.content = content;
    }

    public long getSize() {
        return content.length();
    }

    public String getFileId() {
        return getNodeId();
    }

    public String getContent() {
        return content;
    }

    @Override
    public String toString() {
        return "File{" +
                "fileId='" + getFileId() + '\'' +
                ", name='" + getName() + '\'' +
                ", owner='" + getOwner() + '\'' +
                ", size=" + getSize() +
                '}';
    }
}
