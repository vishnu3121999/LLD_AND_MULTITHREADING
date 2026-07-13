package A_basicV1.pieces;

import A_basicV1.board.ChessBoard;
import A_basicV1.model.Color;
import A_basicV1.model.Move;

public class Queen extends Piece {
    public Queen(Color color) {
        super(color);
    }

    @Override
    public String getName() {
        return "Queen";
    }

    @Override
    public String symbol() {
        return getColor() == Color.WHITE ? "Q" : "q";
    }

    @Override
    public boolean canMove(ChessBoard board, Move move) {
        int row = Math.abs(move.rowDelta());
        int col = Math.abs(move.colDelta());
        return (row == col || row == 0 || col == 0) && board.isPathClear(move);
    }
}
