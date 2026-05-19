package A_basic.service;


import A_basic.datastore.IDatastore;
import A_basic.model.Move;
import A_basic.model.Player;
import A_basic.model.game.TicTacToeGame;


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
