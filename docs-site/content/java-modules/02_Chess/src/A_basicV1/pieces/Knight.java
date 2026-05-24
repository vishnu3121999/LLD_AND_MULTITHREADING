package A_basicV1.pieces;

import A_basicV1.board.ChessBoard;
import A_basicV1.model.Color;
import A_basicV1.model.Move;

public class Knight extends Piece {
    public Knight(Color color) {
        super(color);
    }

    @Override
    public String getName() {
        return "Knight";
    }

    @Override
    public String symbol() {
        return getColor() == Color.WHITE ? "N" : "n";
    }

    @Override
    public boolean canMove(ChessBoard board, Move move) {
        int row = Math.abs(move.rowDelta());
        int col = Math.abs(move.colDelta());
        return (row == 2 && col == 1) || (row == 1 && col == 2);
    }
}
