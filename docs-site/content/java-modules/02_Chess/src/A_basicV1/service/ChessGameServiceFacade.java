package A_basicV1.service;

import A_basicV1.datastore.IDatastore;
import A_basicV1.model.Move;
import A_basicV1.model.Player;
import A_basicV1.model.Position;

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
