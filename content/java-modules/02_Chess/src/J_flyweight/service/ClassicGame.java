package J_flyweight.service;

import J_flyweight.board.ChessBoard;
import J_flyweight.board.ClassicBoard;
import J_flyweight.factory.MovementStrategyFactory;
import J_flyweight.model.Color;
import J_flyweight.model.GameState;
import J_flyweight.model.Move;
import J_flyweight.model.Player;
import J_flyweight.rules.CheckDetector;
import J_flyweight.rules.LegalMoveFinder;
import J_flyweight.special.SpecialMoveService;

public class ClassicGame extends ChessGame {
    private final Player whitePlayer;
    private final Player blackPlayer;
    private final MoveValidator moveValidator;
    private final GameResultEvaluator gameResultEvaluator;
    private final SpecialMoveService specialMoveService;

    public ClassicGame(String gameId, Player whitePlayer, Player blackPlayer) {
        this(gameId, new ClassicBoard(), whitePlayer, blackPlayer);
    }

    public ClassicGame(String gameId, ChessBoard board, Player whitePlayer, Player blackPlayer) {
        super(gameId, board, GameState.NOT_STARTED);
        this.whitePlayer = whitePlayer;
        this.blackPlayer = blackPlayer;
        this.currentPlayer = whitePlayer;
        CheckDetector checkDetector = new CheckDetector();
        this.specialMoveService = new SpecialMoveService(checkDetector);
        this.moveValidator = new MoveValidator(new MovementStrategyFactory(), checkDetector, specialMoveService);
        this.gameResultEvaluator = new GameResultEvaluator(checkDetector, new LegalMoveFinder(moveValidator));
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

        specialMoveService.applyMove(this, move, true);
        switchCurrentPlayer();
        gameResultEvaluator.evaluate(this, move);
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

    @Override
    public Player getPlayer(Color color) {
        return color == Color.WHITE ? whitePlayer : blackPlayer;
    }

    private void switchCurrentPlayer() {
        currentPlayer = currentPlayer == whitePlayer ? blackPlayer : whitePlayer;
    }
}





