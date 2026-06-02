package J_flyweight.service;

import J_flyweight.model.Color;
import J_flyweight.model.GameState;
import J_flyweight.model.Move;
import J_flyweight.rules.CheckDetector;
import J_flyweight.rules.LegalMoveFinder;

public class GameResultEvaluator {
    private final CheckDetector checkDetector;
    private final LegalMoveFinder legalMoveFinder;

    public GameResultEvaluator(CheckDetector checkDetector, LegalMoveFinder legalMoveFinder) {
        this.checkDetector = checkDetector;
        this.legalMoveFinder = legalMoveFinder;
    }

    public void evaluate(ChessGame game, Move lastMove) {
        Color playerToMoveColor = game.getPlayerColor(game.getCurrentPlayer());
        boolean inCheck = checkDetector.isInCheck(game, playerToMoveColor);
        boolean hasLegalMove = legalMoveFinder.hasAnyLegalMove(game, playerToMoveColor);

        if (inCheck && !hasLegalMove) {
            game.setGameState(GameState.WON);
            game.setWinner(lastMove.getPlayer());
            return;
        }

        if (!inCheck && !hasLegalMove) {
            game.setGameState(GameState.DRAW);
            game.setWinner(null);
            return;
        }

        game.setGameState(GameState.IN_PROGRESS);
        game.setWinner(null);
    }
}





