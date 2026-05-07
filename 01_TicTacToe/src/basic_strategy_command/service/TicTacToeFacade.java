package basic_strategy_command.service;

import basic_strategy_command.command.CommandInvoker;
import basic_strategy_command.command.MoveCommand;
import basic_strategy_command.model.Move;
import basic_strategy_command.model.Player;
import basic_strategy_command.model.game.TicTacToeGame;

public class TicTacToeFacade {
    private final TicTacToeGame game;
    private final CommandInvoker invoker;

    public void startGame() {
        game.start();
    }

    public boolean makeMove(Player player, int row, int col) {
        Move move = new Move(row, col, player.getSymbol());
        return invoker.execute(new MoveCommand(game, move));
    }

    public boolean undoLastMove() {
        return invoker.undoLast();
    }

    public TicTacToeFacade(TicTacToeGame game) {
        this.game = game;
        this.invoker = new CommandInvoker();
    }
}
