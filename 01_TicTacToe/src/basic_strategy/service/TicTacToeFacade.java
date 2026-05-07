package basic_strategy.service;

import basic_strategy.model.Move;
import basic_strategy.model.Player;
import basic_strategy.model.game.TicTacToeGame;

public class TicTacToeFacade {
    TicTacToeGame game;

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
