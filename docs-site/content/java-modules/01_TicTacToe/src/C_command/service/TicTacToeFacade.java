package C_command.service;

import C_command.command.CommandInvoker;
import C_command.command.MoveCommand;
import C_command.datastore.IDatastore;
import C_command.model.Move;
import C_command.model.Player;
import C_command.model.game.TicTacToeGame;

public class TicTacToeFacade {
    private final IDatastore datastore;

    public void startGame() {
        TicTacToeGame game = datastore.getGame();
        game.start();
    }

    public boolean makeMove(Player player, int row, int col) {
        TicTacToeGame game = datastore.getGame();
        CommandInvoker invoker = datastore.getCommandInvoker();
        Move move = new Move(row, col, player.getSymbol());
        return invoker.execute(new MoveCommand(game, move));
    }

    public boolean undoLastMove() {
        CommandInvoker invoker = datastore.getCommandInvoker();
        return invoker.undoLast();
    }

    public TicTacToeFacade(IDatastore datastore) {
        this.datastore = datastore;
    }
}
