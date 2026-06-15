package unixfilesystem.search.operator;

import java.util.regex.Pattern;

public class RegexMatchOperator implements ComparisonOperator {
    @Override
    public boolean matches(Object actualValue, Object expectedValue) {
        if (actualValue == null || expectedValue == null) {
            return false;
        }
        return Pattern.matches(expectedValue.toString(), actualValue.toString());
    }
}
