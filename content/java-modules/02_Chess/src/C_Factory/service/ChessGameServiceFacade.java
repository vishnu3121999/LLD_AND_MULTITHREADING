package C_Factory.service;

import C_Factory.datastore.IDatastore;
import C_Factory.model.Move;
import C_Factory.model.Player;
import C_Factory.model.Position;

public class ChessGameServiceFacade {
    private final IDatastore datastore;

    public ChessGameServiceFacade(IDatastore datastore) {
        this.datastore = datastore;
    }

    public void createGame(String gameId, Player whitePlayer, Player blackPlayer) {
        datastore.saveGame(gameId, new ClassicGame(gameId, whitePlayer, blackPlayer));
    }

    public void startGame(String gameId) {
        ChessGame game = datastore.getGame(gameId);
        game.start();
        game.getBoard().print();
    }

    public boolean move(String gameId, Player player, Position from, Position to) {
        ChessGame game = datastore.getGame(gameId);
        boolean success = game.move(new Move(player, from, to));
        if (success) {
            game.getBoard().print();
        }
        return success;
    }
}
