package H_persistance.model.game;

import H_persistance.model.Move;
import H_persistance.model.Player;
import H_persistance.model.board.TicTacToeBoard;
import H_persistance.model.enums.GameState;
import H_persistance.model.enums.Symbol;
import H_persistance.model.game.winstrategy.WinStrategy;
import H_persistance.exception.InvalidMoveException;

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
        if (gameState != GameState.NOT_STARTED) {
            throw new IllegalStateException("Game already started");
        }
        gameState = GameState.IN_PROGRESS;
        if (aiFirstMove) {
            applyAIMove();
        }
    }

    @Override
    public boolean applyMove(Move move) {
        if (gameState != GameState.IN_PROGRESS) {
            throw new IllegalStateException("Game is not in progress");
        }

        boolean applied = board.applyMove(move);
        if (!applied) {
            throw new InvalidMoveException("Cell is already occupied or out of bounds");
        }
        if (winStrategy.hasWinner(board.getGrid())) {
            gameState = GameState.WON;
            winner = humanPlayer;
        } else if (board.isFull()) {
            gameState = GameState.DRAW;
        }

        applyAIMove();
        if (winStrategy.hasWinner(board.getGrid())) {
            gameState = GameState.WON;
            winner = null;
        } else if (board.isFull()) {
            gameState = GameState.DRAW;
        }
        return true;
    }

    @Override
    public void undoMove(Move move) {
        if (!board.removeMove(move)) {
            throw new InvalidMoveException("Move cannot be undone");
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
