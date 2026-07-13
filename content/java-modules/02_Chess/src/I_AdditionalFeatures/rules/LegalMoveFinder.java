package I_AdditionalFeatures.rules;

import I_AdditionalFeatures.model.Color;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.model.Piece;
import I_AdditionalFeatures.model.Position;
import I_AdditionalFeatures.service.ChessGame;
import I_AdditionalFeatures.service.MoveValidator;

public class LegalMoveFinder {
    private final MoveValidator moveValidator;

    public LegalMoveFinder(MoveValidator moveValidator) {
        this.moveValidator = moveValidator;
    }

    public boolean hasAnyLegalMove(ChessGame game, Color color) {
        for (int fromRow = 0; fromRow < game.getBoard().getSize(); fromRow++) {
            for (int fromCol = 0; fromCol < game.getBoard().getSize(); fromCol++) {
                Position from = Position.of(fromRow, fromCol);
                Piece piece = game.getBoard().getPiece(from);
                if (piece == null || piece.getColor() != color) {
                    continue;
                }
                if (hasAnyLegalMoveFrom(game, from)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean hasAnyLegalMoveFrom(ChessGame game, Position from) {
        for (int toRow = 0; toRow < game.getBoard().getSize(); toRow++) {
            for (int toCol = 0; toCol < game.getBoard().getSize(); toCol++) {
                Move candidate = new Move(game.getCurrentPlayer(), from, Position.of(toRow, toCol));
                try {
                    moveValidator.isValid(game, candidate);
                    return true;
                } catch (RuntimeException ignored) {
                    // Try the next square.
                }
            }
        }
        return false;
    }
}
