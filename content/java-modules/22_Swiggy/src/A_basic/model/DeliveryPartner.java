package A_basic.model;

import A_basic.model.enums.PartnerStatus;

public class DeliveryPartner { private final String deliveryPartnerId; private final String name; private PartnerStatus partnerStatus; public DeliveryPartner(String deliveryPartnerId, String name) { this.deliveryPartnerId = deliveryPartnerId; this.name = name; this.partnerStatus = PartnerStatus.AVAILABLE; } public void assign() { partnerStatus = PartnerStatus.ON_DELIVERY; } public void markAvailable() { partnerStatus = PartnerStatus.AVAILABLE; } @Override public String toString() { return "DeliveryPartner{" + "deliveryPartnerId='" + deliveryPartnerId + "'" + ", name='" + name + "'" + ", partnerStatus=" + partnerStatus + '}'; } public String getDeliveryPartnerId() { return deliveryPartnerId; } public String getName() { return name; } public PartnerStatus getPartnerStatus() { return partnerStatus; } }
