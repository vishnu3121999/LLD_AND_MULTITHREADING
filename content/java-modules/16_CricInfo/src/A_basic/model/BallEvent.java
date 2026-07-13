package A_basic.model;

public class BallEvent {
    private final String ballEventId;
    private final String batsmanId;
    private final String bowlerId;
    private final int runs;
    private final boolean wicket;
    public BallEvent(String ballEventId, String batsmanId, String bowlerId, int runs, boolean wicket) { this.ballEventId = ballEventId; this.batsmanId = batsmanId; this.bowlerId = bowlerId; this.runs = runs; this.wicket = wicket; }
    @Override public String toString() { return "BallEvent{" + "ballEventId='" + ballEventId + "'" + ", batsmanId='" + batsmanId + "'" + ", bowlerId='" + bowlerId + "'" + ", runs=" + runs + ", wicket=" + wicket + '}'; }
    public String getBallEventId() { return ballEventId; }
    public String getBatsmanId() { return batsmanId; }
    public String getBowlerId() { return bowlerId; }
    public int getRuns() { return runs; }
    public boolean isWicket() { return wicket; }
}
