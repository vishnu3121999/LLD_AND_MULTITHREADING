package unixfilesystem.search.predicate;

import unixfilesystem.model.FSNode;
import unixfilesystem.model.NodeAttribute;
import unixfilesystem.search.operator.ComparisonOperator;

public class SimplePredicate implements Predicate {
    private final NodeAttribute attribute;
    private final ComparisonOperator comparisonOperator;
    private final Object expectedValue;

    public SimplePredicate(NodeAttribute attribute,
                           ComparisonOperator comparisonOperator,
                           Object expectedValue) {
        this.attribute = attribute;
        this.comparisonOperator = comparisonOperator;
        this.expectedValue = expectedValue;
    }

    @Override
    public boolean isMatch(FSNode node) {
        Object actualValue = attribute.extract(node);
        return comparisonOperator.matches(actualValue, expectedValue);
    }
}
