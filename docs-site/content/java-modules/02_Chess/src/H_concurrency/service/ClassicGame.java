package H_concurrency.service;

import H_concurrency.board.ChessBoard;
import H_concurrency.board.ClassicBoard;
import H_concurrency.factory.MovementStrategyFactory;
import H_concurrency.model.Color;
import H_concurrency.model.GameState;
import H_concurrency.model.Move;
import H_concurrency.model.Player;

public class ClassicGame extends ChessGame {
    private final Player whitePlayer;
    private final Player blackPlayer;
    private final MoveValidator moveValidator;
    private final GameResultEvaluator gameResultEvaluator;

    public ClassicGame(String gameId, Player whitePlayer, Player blackPlayer) {
        this(gameId, new ClassicBoard(), whitePlayer, blackPlayer);
    }

    public ClassicGame(String gameId, ChessBoard board, Player whitePlayer, Player blackPlayer) {
        super(gameId, board, GameState.NOT_STARTED);
        this.whitePlayer = whitePlayer;
        this.blackPlayer = blackPlayer;
        this.currentPlayer = whitePlayer;
        this.moveValidator = new MoveValidator(new MovementStrategyFactory());
        this.gameResultEvaluator = new GameResultEvaluator();
    }

    @Override
    public void start() {
        if (gameState != GameState.NOT_STARTED) {
            throw new IllegalStateException("Game can only be started from NOT_STARTED state.");
        }
        gameState = GameState.IN_PROGRESS;
    }

    @Override
    public boolean move(Move move) {
        moveValidator.isValid(this, move);

        board.applyMove(move);
        gameResultEvaluator.evaluate(this, move);
        if (gameState == GameState.IN_PROGRESS) {
            switchCurrentPlayer();
        }
        return true;
    }

    @Override
    public Color getPlayerColor(Player player) {
        if (isSamePlayer(whitePlayer, player)) {
            return Color.WHITE;
        }
        if (isSamePlayer(blackPlayer, player)) {
            return Color.BLACK;
        }
        return null;
    }

    private void switchCurrentPlayer() {
        currentPlayer = currentPlayer == whitePlayer ? blackPlayer : whitePlayer;
    }
}




