package F_Concurrency.service;

import F_Concurrency.command.CommandInvoker;
import F_Concurrency.command.MoveCommand;
import F_Concurrency.model.Move;
import F_Concurrency.model.Player;
import F_Concurrency.model.game.TicTacToeGame;
import F_Concurrency.observer.GameObserver;

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


