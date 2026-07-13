package C_Factory.movement;

import C_Factory.board.ChessBoard;
import C_Factory.model.Color;
import C_Factory.model.Move;
import C_Factory.model.Piece;
import C_Factory.model.Position;

public class PawnMovementStrategy implements MovementStrategy {
    @Override
    public boolean canMove(ChessBoard board, Piece piece, Move move) {
        int direction = piece.getColor() == Color.WHITE ? -1 : 1;
        int startRow = piece.getColor() == Color.WHITE ? 6 : 1;
        int rowDelta = move.rowDelta();
        int colDelta = move.colDelta();
        Piece target = board.getPiece(move.getTo());

        if (colDelta == 0 && rowDelta == direction && target == null) {
            return true;
        }

        if (colDelta == 0 && rowDelta == 2 * direction && move.getFrom().getRow() == startRow) {
            Position middle = Position.of(move.getFrom().getRow() + direction, move.getFrom().getCol());
            return board.getPiece(middle) == null && target == null;
        }

        return Math.abs(colDelta) == 1
                && rowDelta == direction
                && target != null
                && target.getColor() != piece.getColor();
    }
}
