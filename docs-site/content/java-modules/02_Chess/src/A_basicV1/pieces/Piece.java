package A_basicV1.pieces;

import A_basicV1.board.ChessBoard;
import A_basicV1.model.Color;
import A_basicV1.model.Move;

public abstract class Piece {
    private final Color color;

    protected Piece(Color color) {
        this.color = color;
    }

    public Color getColor() {
        return color;
    }

    public abstract String getName();

    public abstract String symbol();

    public abstract boolean canMove(ChessBoard board, Move move);
}
