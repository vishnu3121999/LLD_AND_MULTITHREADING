package B_Strategy.service;

import B_Strategy.board.ChessBoard;
import B_Strategy.board.ClassicBoard;
import B_Strategy.model.Color;
import B_Strategy.model.GameState;
import B_Strategy.model.Move;
import B_Strategy.model.Player;

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
        this.moveValidator = new MoveValidator();
        this.gameResultEvaluator = new GameResultEvaluator();
    }

    @Override
    public void start() {
        gameState = GameState.IN_PROGRESS;
    }

    @Override
    public boolean move(Move move) {
        if (!moveValidator.isValid(this, move)) {
            return false;
        }

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

    private boolean isSamePlayer(Player first, Player second) {
        return first.getPlayerId().equals(second.getPlayerId());
    }
}
