package B_strategy.service;

import B_strategy.datastore.IDatastore;
import B_strategy.model.Move;
import B_strategy.model.Player;
import B_strategy.model.game.TicTacToeGame;

public class TicTacToeFacade {
    private final IDatastore datastore;

    public void startGame() {
        TicTacToeGame game = datastore.getGame();
        game.start();
    }

    public boolean makeMove(Player player, int row, int col) {
        TicTacToeGame game = datastore.getGame();
        Move move = new Move(row, col, player.getSymbol());
        return game.applyMove(move);
    }

    public TicTacToeFacade(IDatastore datastore) {
        this.datastore = datastore;
    }
}
