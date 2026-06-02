package K_persistence.config;

import K_persistence.datastore.IDatastore;
import K_persistence.datastore.PostgresDataStore;
import K_persistence.repository.ChessGameRepository;
import K_persistence.repository.GameCaretakerRepository;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PersistenceConfig {
    @Bean
    public IDatastore datastore(ChessGameRepository gameRepository, GameCaretakerRepository gameCaretakerRepository) {
        return new PostgresDataStore(gameRepository, gameCaretakerRepository);
    }
}
