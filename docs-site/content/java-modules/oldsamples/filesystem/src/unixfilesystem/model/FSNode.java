package unixfilesystem.model;

import java.time.Instant;
import java.util.Objects;

public abstract class FSNode {
    private String name;
    private final String owner;
    private Directory parent;
    private final Instant createdTs;


    protected FSNode(String name, String owner) {
        this.name = name;
        this.owner = Objects.requireNonNull(owner, "owner cannot be null");
        this.createdTs = Instant.now();
    }

    public String getName() {
        return name;
    }

    public Directory getParent() {
        return parent;
    }

    public String getOwner() {
        return owner;
    }

    public void setParent(Directory parent) {
        this.parent = parent;
    }

    public Instant getCreatedTs() {
        return createdTs;
    }


    public void rename(String newName) {
        this.name = newName;
    }

    public String getPath() {
        if (parent == null) {
            return "/";
        }

        String parentPath = parent.getPath();
        return "/".equals(parentPath) ? parentPath + name : parentPath + "/" + name;
    }

    public boolean isRoot() {
        return parent == null;
    }


    public abstract long getSize();


}
