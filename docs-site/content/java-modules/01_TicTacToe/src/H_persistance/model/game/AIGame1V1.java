package H_persistance.model.game;

import H_persistance.model.Move;
import H_persistance.model.Player;
import H_persistance.model.board.TicTacToeBoard;
import H_persistance.model.enums.GameState;
import H_persistance.model.enums.Symbol;
import H_persistance.model.game.winstrategy.WinStrategy;
import H_persistance.exception.InvalidMoveException;

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
    public synchronized void start() {
        if (gameState != GameState.NOT_STARTED) {
            throw new IllegalStateException("Game already started");
        }
        gameState = GameState.IN_PROGRESS;
        if (aiFirstMove) {
            applyAIMove();
        }
        notifyObservers("Game started");
    }

    @Override
    public synchronized boolean applyMove(Move move) {
        if (gameState != GameState.IN_PROGRESS) {
            throw new IllegalStateException("Game is not in progress");
        }
        boolean applied = board.applyMove(move);
        if (!applied) {
            throw new InvalidMoveException("Cell is already occupied or out of bounds");
        }
        if (winStrategy.hasWinner(board.getGrid())) {
            gameState = GameState.WON;
            winner = player;
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

        notifyObservers("Move applied");
        return true;
    }

    @Override
    public synchronized void undoMove(Move move) {
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


