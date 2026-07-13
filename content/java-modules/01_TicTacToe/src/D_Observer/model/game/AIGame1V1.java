package D_Observer.model.game;

import D_Observer.model.Move;
import D_Observer.model.Player;
import D_Observer.model.board.TicTacToeBoard;
import D_Observer.model.enums.GameState;
import D_Observer.model.enums.Symbol;
import D_Observer.model.game.winstrategy.WinStrategy;

public class AIGame1V1 extends TicTacToeGame {
    private final Player humanPlayer;
    private final int difficulty;
    private final boolean aiFirstMove;
    private final Symbol aiSymbol;

    public AIGame1V1(TicTacToeBoard board, Player player, int difficulty, boolean aiFirstMove, WinStrategy winStrategy) {
        super(board, GameState.NOT_STARTED, winStrategy);
        this.humanPlayer = player;
        this.difficulty = difficulty;
        this.aiFirstMove = aiFirstMove;
        this.aiSymbol = player.getSymbol().equals(Symbol.O) ? Symbol.X : Symbol.O;
        currentPlayer = humanPlayer;
    }

    @Override
    public void start() {
        gameState = GameState.IN_PROGRESS;
        if (aiFirstMove) {
            applyAIMove();
        }
    }

    @Override
    public boolean applyMove(Move move) {
        if (gameState != GameState.IN_PROGRESS) {
            return false;
        }

        boolean applied = board.applyMove(move);
        if (winStrategy.hasWinner(board.getGrid())) {
            gameState = GameState.WON;
            winner = humanPlayer;
        } else if (board.isFull()) {
            gameState = GameState.DRAW;
        }

        if (applied) {
            applyAIMove();
            if (winStrategy.hasWinner(board.getGrid())) {
                gameState = GameState.WON;
                winner = null;
            } else if (board.isFull()) {
                gameState = GameState.DRAW;
            }
        }
        return applied;
    }

    @Override
    public void undoMove(Move move) {
        if (!board.removeMove(move)) {
            return;
        }
        gameState = GameState.IN_PROGRESS;
        winner = null;
    }

    private Move applyAIMove() {
        // Move aiMove = callEngine(difficulty, aiSymbol);
        // board.applyMove(aiMove);
        return null;
    }
}
