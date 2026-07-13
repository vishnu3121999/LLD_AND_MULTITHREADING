package A_basicV1.pieces;

import A_basicV1.board.ChessBoard;
import A_basicV1.model.Color;
import A_basicV1.model.Move;

public class Rook extends Piece {
    public Rook(Color color) {
        super(color);
    }

    @Override
    public String getName() {
        return "Rook";
    }

    @Override
    public String symbol() {
        return getColor() == Color.WHITE ? "R" : "r";
    }

    @Override
    public boolean canMove(ChessBoard board, Move move) {
        return (move.rowDelta() == 0 || move.colDelta() == 0) && board.isPathClear(move);
    }
}
