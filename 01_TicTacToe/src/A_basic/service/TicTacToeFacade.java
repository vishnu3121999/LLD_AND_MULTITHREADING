package A_basic.service;


import A_basic.model.Move;
import A_basic.model.Player;
import A_basic.model.game.TicTacToeGame;


public class TicTacToeFacade {
    private final TicTacToeGame game;

    public void startGame() {
        game.start();
    }

    public boolean makeMove(Player player, int row, int col) {
        Move move = new Move(row, col, player.getSymbol());
        return game.applyMove(move);
    }

    public TicTacToeFacade(TicTacToeGame game) {
        this.game = game;
    }
}
