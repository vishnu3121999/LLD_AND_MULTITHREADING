package I_AdditionalFeatures.service;

import I_AdditionalFeatures.model.Color;
import I_AdditionalFeatures.model.GameState;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.rules.CheckDetector;
import I_AdditionalFeatures.rules.LegalMoveFinder;

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





