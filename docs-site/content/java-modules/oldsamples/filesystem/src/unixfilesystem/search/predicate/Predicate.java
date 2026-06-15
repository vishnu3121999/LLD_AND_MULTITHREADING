package unixfilesystem.search.predicate;

import unixfilesystem.model.FSNode;

public interface Predicate {
    boolean isMatch(FSNode node);
}
