package K_persistence.datastore;

import K_persistence.entity.ChessGameEntity;
import K_persistence.entity.GameCaretakerEntity;
import K_persistence.memento.GameCaretaker;
import K_persistence.repository.ChessGameRepository;
import K_persistence.repository.GameCaretakerRepository;
import K_persistence.service.ChessGame;

import java.util.Objects;

public class PostgresDataStore implements IDatastore {
    private final ChessGameRepository gameRepository;
    private final GameCaretakerRepository gameCaretakerRepository;

    public PostgresDataStore(ChessGameRepository gameRepository, GameCaretakerRepository gameCaretakerRepository) {
        this.gameRepository = Objects.requireNonNull(gameRepository, "gameRepository cannot be null");
        this.gameCaretakerRepository = Objects.requireNonNull(gameCaretakerRepository, "gameCaretakerRepository cannot be null");
    }

    @Override
    public void saveGame(String gameId, ChessGame game) {
        gameRepository.save(ChessGameEntity.fromDomain(gameId, game));
    }

    @Override
    public ChessGame getGame(String gameId) {
        return gameRepository.findById(gameId)
                .map(ChessGameEntity::toDomain)
                .orElse(null);
    }

    @Override
    public void saveGameCaretaker(String gameId, GameCaretaker gameCaretaker) {
        ChessGame game = getGame(gameId);
        if (game == null) {
            throw new IllegalStateException("Cannot save history before game exists: " + gameId);
        }

        gameCaretakerRepository.save(GameCaretakerEntity.fromDomain(gameId, gameCaretaker, game));
    }

    @Override
    public GameCaretaker getGameCaretaker(String gameId) {
        ChessGame game = getGame(gameId);
        if (game == null) {
            return null;
        }

        return gameCaretakerRepository.findById(gameId)
                .map(entity -> entity.toDomain(game))
                .orElse(null);
    }
}
