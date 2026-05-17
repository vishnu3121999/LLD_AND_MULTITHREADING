package F_Concurrency.command;

public interface Command {
    boolean execute();
    boolean undo();
}


