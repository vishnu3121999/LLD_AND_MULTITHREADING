package B_strategy.datastore;

import B_strategy.model.game.TicTacToeGame;

public class InMemoryDatastore implements IDatastore {
    private final TicTacToeGame game;

    public InMemoryDatastore(TicTacToeGame game) {
        this.game = game;
    }

    @Override
    public TicTacToeGame getGame() {
        return game;
    }
}
