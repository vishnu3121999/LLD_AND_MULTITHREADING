package unixfilesystem.search.operator;

import java.util.Objects;

public class EqualsOperator implements ComparisonOperator {
    @Override
    public boolean matches(Object actualValue, Object expectedValue) {
        return Objects.equals(actualValue, expectedValue);
    }
}
