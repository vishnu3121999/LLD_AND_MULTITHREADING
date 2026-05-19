package A_basic.datastore;

import A_basic.model.game.TicTacToeGame;

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
