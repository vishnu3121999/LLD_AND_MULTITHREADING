package B_strategy.service;

import B_strategy.model.Move;
import B_strategy.model.Player;
import B_strategy.model.game.TicTacToeGame;

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
