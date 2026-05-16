package E_ExceptionHandling.service;

import E_ExceptionHandling.command.CommandInvoker;
import E_ExceptionHandling.command.MoveCommand;
import E_ExceptionHandling.model.Move;
import E_ExceptionHandling.model.Player;
import E_ExceptionHandling.model.game.TicTacToeGame;
import E_ExceptionHandling.observer.GameObserver;

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

    public void addObserver(GameObserver observer) {
        game.addObserver(observer);
    }

    public void removeObserver(GameObserver observer) {
        game.removeObserver(observer);
    }

    public TicTacToeFacade(TicTacToeGame game) {
        this.game = game;
        this.invoker = new CommandInvoker();
    }
}


