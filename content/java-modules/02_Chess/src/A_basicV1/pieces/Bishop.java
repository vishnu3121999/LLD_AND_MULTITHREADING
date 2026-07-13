package A_basicV1.pieces;

import A_basicV1.board.ChessBoard;
import A_basicV1.model.Color;
import A_basicV1.model.Move;

public class Bishop extends Piece {
    public Bishop(Color color) {
        super(color);
    }

    @Override
    public String getName() {
        return "Bishop";
    }

    @Override
    public String symbol() {
        return getColor() == Color.WHITE ? "B" : "b";
    }

    @Override
    public boolean canMove(ChessBoard board, Move move) {
        return Math.abs(move.rowDelta()) == Math.abs(move.colDelta()) && board.isPathClear(move);
    }
}
