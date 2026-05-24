package A_basicV1.pieces;

import A_basicV1.board.ChessBoard;
import A_basicV1.model.Color;
import A_basicV1.model.Move;

public class King extends Piece {
    public King(Color color) {
        super(color);
    }

    @Override
    public String getName() {
        return "King";
    }

    @Override
    public String symbol() {
        return getColor() == Color.WHITE ? "K" : "k";
    }

    @Override
    public boolean canMove(ChessBoard board, Move move) {
        int row = Math.abs(move.rowDelta());
        int col = Math.abs(move.colDelta());
        return row <= 1 && col <= 1 && row + col > 0;
    }
}
