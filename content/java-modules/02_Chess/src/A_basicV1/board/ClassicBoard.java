package A_basicV1.board;

import A_basicV1.model.Color;
import A_basicV1.pieces.Bishop;
import A_basicV1.pieces.King;
import A_basicV1.pieces.Knight;
import A_basicV1.pieces.Pawn;
import A_basicV1.pieces.Queen;
import A_basicV1.pieces.Rook;

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
        placePiece(row, 0, new Rook(color));
        placePiece(row, 1, new Knight(color));
        placePiece(row, 2, new Bishop(color));
        placePiece(row, 3, new Queen(color));
        placePiece(row, 4, new King(color));
        placePiece(row, 5, new Bishop(color));
        placePiece(row, 6, new Knight(color));
        placePiece(row, 7, new Rook(color));
    }

    private void setupPawns(int row, Color color) {
        for (int col = 0; col < 8; col++) {
            placePiece(row, col, new Pawn(color));
        }
    }
}
