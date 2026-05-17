package F_Concurrency.model.game;

import F_Concurrency.model.Move;
import F_Concurrency.model.Player;
import F_Concurrency.model.board.TicTacToeBoard;
import F_Concurrency.model.enums.GameState;
import F_Concurrency.model.game.winstrategy.WinStrategy;
import F_Concurrency.exception.InvalidMoveException;

import java.util.Random;

public class ClassicGame1v1 extends TicTacToeGame {
    private final Player playerX;
    private final Player playerO;

    public synchronized void start() {
        if (gameState != GameState.NOT_STARTED) {
            throw new IllegalStateException("Game already started");
        }
        gameState = GameState.IN_PROGRESS;
        notifyObservers("Game started");
    }

    public synchronized boolean applyMove(Move move) {
        if (gameState != GameState.IN_PROGRESS) {
            throw new IllegalStateException("Game is not in progress");
        }
        if (!currentPlayer.getSymbol().equals(move.getSymbol())) {
            throw new InvalidMoveException("It is not this player's turn");
        }

        boolean result = board.applyMove(move);
        if (!result) {
            throw new InvalidMoveException("Cell is already occupied or out of bounds");
        }

        if (winStrategy.hasWinner(board.getGrid())) {
            gameState = GameState.WON;
            winner = currentPlayer;
            notifyObservers(currentPlayer.getName() + " won the game");
        } else if (board.isFull()) {
            gameState = GameState.DRAW;
            notifyObservers("Game ended in a draw");
        } else {
            currentPlayer = (currentPlayer == playerX) ? playerO : playerX;
            notifyObservers("Move applied by " + move.getSymbol());
        }
        return true;
    }


    public synchronized void undoMove(Move move) {
        if (!board.removeMove(move)) {
            throw new InvalidMoveException("Move cannot be undone");
        }
        currentPlayer = getPlayerForSymbol(move.getSymbol(), playerX, playerO);
        winner = null;
        gameState = GameState.IN_PROGRESS;
        notifyObservers("Move undone");
    }

    public ClassicGame1v1(TicTacToeBoard board, Player playerX, Player playerO, WinStrategy winStrategy) {
        super(board, GameState.NOT_STARTED, winStrategy);
        this.playerX = playerX;
        this.playerO = playerO;
        Random random = new Random();
        currentPlayer = random.nextBoolean() ? playerX : playerO;
    }
}


