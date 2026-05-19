package H_persistance.command;

public interface Command {
    boolean execute();
    boolean undo();
}


