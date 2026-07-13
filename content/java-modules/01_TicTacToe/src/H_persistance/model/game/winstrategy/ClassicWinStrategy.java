package H_persistance.model.game.winstrategy;

import H_persistance.model.enums.Symbol;

public class ClassicWinStrategy implements WinStrategy {
    private final WinStrategy compositeStrategy;

    public ClassicWinStrategy() {
        CompositeWinStrategy compositeWinStrategy = new CompositeWinStrategy();
        compositeWinStrategy.addStrategy(new RowWinStrategy());
        compositeWinStrategy.addStrategy(new ColumnWinStrategy());
        compositeWinStrategy.addStrategy(new MainDiagonalWinStrategy());
        compositeWinStrategy.addStrategy(new AntiDiagonalWinStrategy());
        this.compositeStrategy = compositeWinStrategy;
    }

    @Override
    public boolean hasWinner(Symbol[][] grid) {
        return compositeStrategy.hasWinner(grid);
    }
}


