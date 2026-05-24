package A_basicV2.board;

import A_basicV2.model.Move;
import A_basicV2.model.Piece;
import A_basicV2.model.Position;

public abstract class ChessBoard {
    protected final Piece[][] grid;

    protected ChessBoard(int size) {
        this.grid = new Piece[size][size];
    }

    public Piece applyMove(Move move) {
        Piece captured = getPiece(move.getTo());
        grid[move.getTo().getRow()][move.getTo().getCol()] = getPiece(move.getFrom());
        grid[move.getFrom().getRow()][move.getFrom().getCol()] = null;
        return captured;
    }

    public boolean isPathClear(Move move) {
        int rowStep = Integer.compare(move.getTo().getRow(), move.getFrom().getRow());
        int colStep = Integer.compare(move.getTo().getCol(), move.getFrom().getCol());
        int row = move.getFrom().getRow() + rowStep;
        int col = move.getFrom().getCol() + colStep;

        while (row != move.getTo().getRow() || col != move.getTo().getCol()) {
            if (grid[row][col] != null) {
                return false;
            }
            row += rowStep;
            col += colStep;
        }
        return true;
    }

    public void print() {
        System.out.println("  0 1 2 3 4 5 6 7");
        for (int row = 0; row < grid.length; row++) {
            System.out.print(row + " ");
            for (int col = 0; col < grid[row].length; col++) {
                Piece piece = grid[row][col];
                System.out.print((piece == null ? "." : piece.symbol()) + " ");
            }
            System.out.println();
        }
        System.out.println();
    }

    protected void placePiece(int row, int col, Piece piece) {
        grid[row][col] = piece;
    }

    public int getSize() {
        return grid.length;
    }

    public Piece getPiece(Position position) {
        return grid[position.getRow()][position.getCol()];
    }
}
