package E_ExceptionHandling.model.game;

import E_ExceptionHandling.model.Move;
import E_ExceptionHandling.model.Player;
import E_ExceptionHandling.model.board.TicTacToeBoard;
import E_ExceptionHandling.model.enums.GameState;
import E_ExceptionHandling.model.game.winstrategy.WinStrategy;
import E_ExceptionHandling.exception.InvalidMoveException;

import java.util.Random;

public class ClassicGame1v1 extends TicTacToeGame {
    private final Player playerX;
    private final Player playerO;

    public void start() {
        if (!gameState.equals(GameState.NOT_STARTED)) {
            throw new IllegalStateException("Game already started");
        }
        gameState = GameState.IN_PROGRESS;
        notifyObservers("Game started");
    }

    public boolean applyMove(Move move) {
        if (!gameState.equals(GameState.IN_PROGRESS)) {
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


    public void undoMove(Move move) {
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


