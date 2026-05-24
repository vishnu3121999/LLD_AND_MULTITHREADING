package A_basicV1.service;

import A_basicV1.board.ChessBoard;
import A_basicV1.board.ClassicBoard;
import A_basicV1.model.GameState;
import A_basicV1.model.Move;
import A_basicV1.model.Player;

public class ClassicGame extends ChessGame {
    private final Player whitePlayer;
    private final Player blackPlayer;
    private final GameResultEvaluator gameResultEvaluator;

    public ClassicGame(String gameId, Player whitePlayer, Player blackPlayer) {
        this(gameId, new ClassicBoard(), whitePlayer, blackPlayer);
    }

    public ClassicGame(String gameId, ChessBoard board, Player whitePlayer, Player blackPlayer) {
        super(gameId, board, GameState.NOT_STARTED);
        this.whitePlayer = whitePlayer;
        this.blackPlayer = blackPlayer;
        this.currentPlayer = whitePlayer;
        this.gameResultEvaluator = new GameResultEvaluator();
    }

    @Override
    public void start() {
        gameState = GameState.IN_PROGRESS;
    }

    @Override
    public boolean move(Move move) {
        if (!board.canMove(move)) {
            return false;
        }

        board.applyMove(move);
        gameResultEvaluator.evaluate(this, move);
        if (gameState == GameState.IN_PROGRESS) {
            switchCurrentPlayer();
        }
        return true;
    }

    private void switchCurrentPlayer() {
        currentPlayer = currentPlayer == whitePlayer ? blackPlayer : whitePlayer;
    }
}
