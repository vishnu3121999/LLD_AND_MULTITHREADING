package H_persistance.model.game.winstrategy;

import H_persistance.model.enums.Symbol;

import java.util.ArrayList;
import java.util.List;

public class CompositeWinStrategy implements WinStrategy {
    private final List<WinStrategy> strategies = new ArrayList<>();

    public void addStrategy(WinStrategy strategy) {
        if (strategy != null) {
            strategies.add(strategy);
        }
    }

    @Override
    public boolean hasWinner(Symbol[][] grid) {
        for (WinStrategy strategy : strategies) {
            if (strategy.hasWinner(grid)) {
                return true;
            }
        }
        return false;
    }
}
