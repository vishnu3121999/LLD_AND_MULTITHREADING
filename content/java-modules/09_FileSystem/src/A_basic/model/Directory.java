package A_basic.model;

import A_basic.model.enums.NodeType;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Directory extends FileSystemNode {
    private final List<String> childList;

    public Directory(String directoryId, String name, String owner) {
        super(directoryId, name, owner, NodeType.DIRECTORY);
        this.childList = new ArrayList<>();
    }

    public void addChild(String childId) {
        childList.add(childId);
    }

    public List<String> getChildList() {
        return Collections.unmodifiableList(childList);
    }

    public String getDirectoryId() {
        return getNodeId();
    }

    @Override
    public String toString() {
        return "Directory{" +
                "directoryId='" + getDirectoryId() + '\'' +
                ", name='" + getName() + '\'' +
                ", owner='" + getOwner() + '\'' +
                ", childList=" + childList +
                '}';
    }
}
