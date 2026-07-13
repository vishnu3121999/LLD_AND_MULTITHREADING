package unixfilesystem.search.predicate;

import unixfilesystem.model.FSNode;

import java.util.List;

public class AndPredicate extends CompositePredicate {
    public AndPredicate(List<Predicate> predicates) {
        super(predicates);
    }

    @Override
    public boolean isMatch(FSNode node) {
        return getPredicates().stream().allMatch(predicate -> predicate.isMatch(node));
    }
}
