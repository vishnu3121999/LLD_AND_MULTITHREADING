package C_command.model.game;

import C_command.model.Move;
import C_command.model.Player;
import C_command.model.board.TicTacToeBoard;
import C_command.model.enums.GameState;
import C_command.model.game.winstrategy.WinStrategy;

import java.util.Random;

public class ClassicGame1v1 extends TicTacToeGame {
    private final Player playerX;
    private final Player playerO;

    public void start() {
        gameState = GameState.IN_PROGRESS;
    }

    public boolean applyMove(Move move) {
        if (!gameState.equals(GameState.IN_PROGRESS)) return false;
        if (!currentPlayer.getSymbol().equals(move.getSymbol())) return false;

        boolean result = board.applyMove(move);
        if (!result) return false;

        if (winStrategy.hasWinner(board.getGrid())) {
            gameState = GameState.WON;
            winner = currentPlayer;
        } else if (board.isFull()) {
            gameState = GameState.DRAW;
        } else {
            currentPlayer = (currentPlayer == playerX) ? playerO : playerX;
        }
        return true;
    }


    public void undoMove(Move move) {
        if (!board.removeMove(move)) {
            return;
        }
        currentPlayer = getPlayerForSymbol(move.getSymbol(), playerX, playerO);
        winner = null;
        gameState = GameState.IN_PROGRESS;
    }

    public ClassicGame1v1(TicTacToeBoard board, Player playerX, Player playerO, WinStrategy winStrategy) {
        super(board, GameState.NOT_STARTED, winStrategy);
        this.playerX = playerX;
        this.playerO = playerO;
        Random random = new Random();
        currentPlayer = random.nextBoolean() ? playerX : playerO;
    }
}
