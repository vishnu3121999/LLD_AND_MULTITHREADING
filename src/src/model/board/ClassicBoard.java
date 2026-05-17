package src.model.board;

import model.piece.*;

public class ClassicBoard implements Board {
    private Piece[][] board;

    public ClassicBoard() {
        this.board = new Piece[8][8];
        initializePieces();
    }

    public void print(){
        for (int i = 0; i < 8; i++) {
            for (int j = 0; j < 8; j++) {
                var p = board[i][j];
                if (p == null) {
                    System.out.print("__   ");
                    continue;
                }
                System.out.print((p.isWhite()?"W":"B")+" "+p.getClass().getSimpleName()+"   ");
            }
            System.out.println();
        }
    }

    public Piece getPiece(int row, int col){
        return board[row][col];
    }

    public void setPiece(int row, int col, Piece piece){
        board[row][col] = piece;
    }

    public boolean getColor(int row, int col){
        return ((row+col)%2==0);
    }

    public boolean isInsideBoard(int row, int col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    private void initializePieces() {
        for (int col = 0; col < 8; col++) {
            board[1][col] = new Pawn(false);
            board[6][col] = new Pawn(true);
        }

        board[0][0] = new Rook(false);
        board[0][7] = new Rook(false);
        board[7][0] = new Rook(true);
        board[7][7] = new Rook(true);

        board[0][1] = new Knight(false);
        board[0][6] = new Knight(false);
        board[7][1] = new Knight(true);
        board[7][6] = new Knight(true);

        board[0][2] = new Bishop(false);
        board[0][5] = new Bishop(false);
        board[7][2] = new Bishop(true);
        board[7][5] = new Bishop(true);

        board[0][3] = new Queen(false);
        board[7][3] = new Queen(true);

        board[0][4] = new King(false);
        board[7][4] = new King(true);
    }
}
