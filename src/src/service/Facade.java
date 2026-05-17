package src.service;

import database.Datastore;
import model.Move;
import model.Player;
import model.board.Board;
import model.enums.GameStatus;
import model.game.Game;

public class Facade {
    private Datastore datastore;

    public Facade(Datastore datastore) {
        this.datastore = datastore;
    }

    public void registerPlayer(Player player){
        datastore.putPlayer(player.getId(), player);
    }

    public Board startGame(Game game){
        game.setGameStatus(GameStatus.IN_PROGRESS);
        datastore.putGame(game.getId(),game);
        return game.getBoard();
    }

    public boolean makeMove(String gameId, String playerId, Move move){
        Game game = datastore.getGame(gameId);
        if (game == null || !datastore.containsPlayer(playerId)) {
            return false;
        }
        return game.makeMove(playerId, move);
    }

    public void displayBoard(String gameId) {
        Game game = datastore.getGame(gameId);
        if (game != null) {
            game.displayBoard();
        }
    }

    public Game getGame(String gameId) {
        return datastore.getGame(gameId);
    }
}
