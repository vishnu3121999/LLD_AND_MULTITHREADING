package E_ExceptionHandling.model.game;

import E_ExceptionHandling.model.Move;
import E_ExceptionHandling.model.Player;
import E_ExceptionHandling.model.board.TicTacToeBoard;
import E_ExceptionHandling.model.enums.GameState;
import E_ExceptionHandling.model.enums.Symbol;
import E_ExceptionHandling.model.game.winstrategy.WinStrategy;
import E_ExceptionHandling.exception.InvalidMoveException;

import java.util.Random;

public class AIGame1V1 extends TicTacToeGame {
    Player player;
    int difficulty;

    boolean aiFirstMove;
    Symbol aiSymbol;

    public AIGame1V1(TicTacToeBoard board, Player player, int difficulty, boolean aiFirstMove, WinStrategy winStrategy) {
        super(board, GameState.NOT_STARTED, winStrategy);
        this.difficulty = difficulty;

        Random random = new Random();
        this.aiFirstMove = random.nextBoolean();
        if (player.getSymbol().equals(Symbol.O)) {
            aiSymbol = Symbol.X;
        } else aiSymbol = Symbol.O;
        currentPlayer = player;
    }

    @Override
    public void start() {
        if (!gameState.equals(GameState.NOT_STARTED)) {
            throw new IllegalStateException("Game already started");
        }
        gameState = GameState.IN_PROGRESS;
        if (aiFirstMove) {
            applyAIMove();
        }
    }

    @Override
    public boolean applyMove(Move move) {
        if (!gameState.equals(GameState.IN_PROGRESS)) {
            throw new IllegalStateException("Game is not in progress");
        }

        boolean result = board.applyMove(move);
        if (!result) {
            throw new InvalidMoveException("Cell is already occupied or out of bounds");
        }
        if (winStrategy.hasWinner(board.getGrid())) {
            gameState = GameState.WON;
            winner = player;
        } else if (board.isFull()) gameState = GameState.DRAW;

        applyAIMove();
        if (winStrategy.hasWinner(board.getGrid())) {
            gameState = GameState.WON;
            winner = null;
        } else if (board.isFull()) gameState = GameState.DRAW;

        notifyObservers("Move applied");
        return true;
    }

    @Override
    public void undoMove(Move move) {
        if (!board.removeMove(move)) {
            throw new InvalidMoveException("Move cannot be undone");
        }
        gameState = GameState.IN_PROGRESS;
        winner = null;
        notifyObservers("Move undone");
    }

    Move applyAIMove(){
//       Move move = callEngine(difficulty,aiSymbol);
//       board.applyMove(move);
        return null;
    }
}


