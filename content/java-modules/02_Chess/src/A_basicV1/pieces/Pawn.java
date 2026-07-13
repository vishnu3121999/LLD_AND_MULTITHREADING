package A_basicV1.pieces;

import A_basicV1.board.ChessBoard;
import A_basicV1.model.Color;
import A_basicV1.model.Move;
import A_basicV1.model.Position;

public class Pawn extends Piece {
    public Pawn(Color color) {
        super(color);
    }

    @Override
    public String getName() {
        return "Pawn";
    }

    @Override
    public String symbol() {
        return getColor() == Color.WHITE ? "P" : "p";
    }

    @Override
    public boolean canMove(ChessBoard board, Move move) {
        int direction = getColor() == Color.WHITE ? -1 : 1;
        int startRow = getColor() == Color.WHITE ? 6 : 1;
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
                && target.getColor() != getColor();
    }
}
