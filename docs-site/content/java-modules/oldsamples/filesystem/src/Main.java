import unixfilesystem.core.FSFacade;
import unixfilesystem.core.FileSystem;
import unixfilesystem.model.Directory;
import unixfilesystem.model.FSNode;
import unixfilesystem.search.Criteria;
import unixfilesystem.model.NodeAttribute;
import unixfilesystem.search.predicate.AndPredicate;
import unixfilesystem.search.predicate.Predicate;
import unixfilesystem.search.predicate.SimplePredicate;
import unixfilesystem.search.operator.EqualsOperator;
import unixfilesystem.search.operator.GreaterThanOperator;
import unixfilesystem.search.sort.NodeComparators;

import java.util.List;

public class Main {
    public static void main(String[] args) {
        FSFacade facade = new FSFacade(new FileSystem(new Directory("", "root"), "vishn"));

        facade.createDirectory("/", "documents");
        facade.createDirectory("/documents", "projects");
        facade.createDirectory("/documents", "images");

        facade.createFile("/documents/projects", "design.txt", "unix filesystem design");
        facade.createFile("/documents/projects", "notes.txt", "lld notes");
        facade.createFile("/documents/images", "wallpaper.png", "binary-content");


        Predicate predicate = new AndPredicate(List.of(
                new SimplePredicate(NodeAttribute.OWNER, new EqualsOperator(), "vishn"),
                new SimplePredicate(NodeAttribute.SIZE, new GreaterThanOperator(), 10L)
        ));

        Criteria criteria = Criteria.builder()
                .predicate(predicate)
                .sorter(NodeComparators.byName())
                .limit(10)
                .build();

        List<FSNode> searchResults = facade.search("/documents", criteria);
        for (FSNode node : searchResults) {
            System.out.println(node.getPath());
        }
    }
}
