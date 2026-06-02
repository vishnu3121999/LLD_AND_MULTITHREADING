package J_flyweight.board;

import J_flyweight.flyweight.PieceFlyweightFactory;
import J_flyweight.model.Color;
import J_flyweight.model.PieceType;

public class ClassicBoard extends ChessBoard {
    public ClassicBoard() {
        super(8);
        setupInitialPosition();
    }

    private void setupInitialPosition() {
        setupBackRank(0, Color.BLACK);
        setupPawns(1, Color.BLACK);
        setupPawns(6, Color.WHITE);
        setupBackRank(7, Color.WHITE);
    }

    private void setupBackRank(int row, Color color) {
        placePiece(row, 0, PieceFlyweightFactory.getPiece(PieceType.ROOK, color));
        placePiece(row, 1, PieceFlyweightFactory.getPiece(PieceType.KNIGHT, color));
        placePiece(row, 2, PieceFlyweightFactory.getPiece(PieceType.BISHOP, color));
        placePiece(row, 3, PieceFlyweightFactory.getPiece(PieceType.QUEEN, color));
        placePiece(row, 4, PieceFlyweightFactory.getPiece(PieceType.KING, color));
        placePiece(row, 5, PieceFlyweightFactory.getPiece(PieceType.BISHOP, color));
        placePiece(row, 6, PieceFlyweightFactory.getPiece(PieceType.KNIGHT, color));
        placePiece(row, 7, PieceFlyweightFactory.getPiece(PieceType.ROOK, color));
    }

    private void setupPawns(int row, Color color) {
        for (int col = 0; col < 8; col++) {
            placePiece(row, col, PieceFlyweightFactory.getPiece(PieceType.PAWN, color));
        }
    }
}
