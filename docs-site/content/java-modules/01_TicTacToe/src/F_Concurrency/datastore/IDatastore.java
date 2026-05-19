package F_Concurrency.datastore;

import F_Concurrency.command.CommandInvoker;
import F_Concurrency.model.game.TicTacToeGame;

public interface IDatastore {
    TicTacToeGame getGame();
    CommandInvoker getCommandInvoker();
}
