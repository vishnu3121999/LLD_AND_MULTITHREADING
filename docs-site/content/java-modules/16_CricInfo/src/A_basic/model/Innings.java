package A_basic.model;

public class Innings {
    private final String inningsId;
    private final String battingTeamId;
    private int runs;
    private int wickets;
    private int balls;
    public Innings(String inningsId, String battingTeamId) { this.inningsId = inningsId; this.battingTeamId = battingTeamId; }
    public void recordBall(int runs, boolean wicket) { this.runs += runs; this.balls++; if (wicket) this.wickets++; }
    @Override public String toString() { return "Innings{" + "inningsId='" + inningsId + "'" + ", battingTeamId='" + battingTeamId + "'" + ", runs=" + runs + ", wickets=" + wickets + ", balls=" + balls + '}'; }
    public String getInningsId() { return inningsId; }
    public String getBattingTeamId() { return battingTeamId; }
    public int getRuns() { return runs; }
    public int getWickets() { return wickets; }
    public int getBalls() { return balls; }
}
