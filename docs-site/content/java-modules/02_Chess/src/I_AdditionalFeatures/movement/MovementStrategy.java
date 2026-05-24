package I_AdditionalFeatures.movement;

import I_AdditionalFeatures.board.ChessBoard;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.model.Piece;

public interface MovementStrategy {
    boolean canMove(ChessBoard board, Piece piece, Move move);
}





