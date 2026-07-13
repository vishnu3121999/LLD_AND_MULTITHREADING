package E_ExceptionHandling.datastore;

import E_ExceptionHandling.command.CommandInvoker;
import E_ExceptionHandling.model.game.TicTacToeGame;

public interface IDatastore {
    TicTacToeGame getGame();
    CommandInvoker getCommandInvoker();
}
