---
title: Notification System
slug: notification-system
summary: Send notifications to users across email, SMS and push channels with basic delivery tracking.
tags:
  - Notification
  - Queue
  - Delivery
difficulty: Hard
---

## Functional Requirements

1. System should be able to send notifications to users through multiple channels like email, SMS and push.
2. User should be able to configure notification preferences for different channels.
3. System should be able to schedule notifications for a future time.
4. User should be able to view notification history and delivery status.

## Out of Scope

1. User auth & authz
2. Vendor-specific email/SMS/push implementation details
3. Advanced retry and dead letter queue handling

## Non-Functional Requirements

No single point of failure (fault tolerance).
CAP Theorem:
  Notification creation & dispatch (FR-1 & FR-3):
    availability > consistency
    `1-5 sec` inconsistency allowed
  Notification status & history (FR-2 & FR-4):
    availability > consistency
    Minor delay `(1–5 sec)` in status updates is acceptable.
Throughput & Latencies:
  Notification creation (FR-1 & FR-3):
    Write TPS = `100M/day = 1k/s`
    Write Latency = `200ms`
  Notification delivery (FR-1):
    Read QPS = `100M/day = 1k/s`
    Read Latency = `1-5 sec`
Handle Celebrity/Hot keys
Handle traffic spikes in cost effective way (optional, only if time at end)


## API Design

```http
POST /api/v1/notifications

REQUEST BODY:
{
  "userId": "user-123",
  "channel": "EMAIL",
  "title": "Payment Successful",
  "message": "Your payment of ₹500 was successful."
}

STATUS : 202 ACCEPTED
RESPONSE BODY:
{
  "notificationId": "notif-123",
  "status": "QUEUED"
}
```

```http
POST /api/v1/notifications/scheduled

REQUEST BODY:
{
  "userId": "user-123",
  "channel": "PUSH",
  "title": "Upcoming Meeting",
  "message": "Your meeting starts in 10 minutes.",
  "scheduledAt": "2026-12-31T10:00:00Z"
}

STATUS : 201 CREATED
RESPONSE BODY:
{
  "notificationId": "notif-456",
  "status": "SCHEDULED"
}
```

```http
PUT /api/v1/users/{userId}/notification-preferences

REQUEST BODY:
{
  "emailEnabled": true,
  "smsEnabled": false,
  "pushEnabled": true
}

STATUS : 200 OK
RESPONSE BODY:
{
  "userId": "user-123",
  "emailEnabled": true,
  "smsEnabled": false,
  "pushEnabled": true
}
```

```http
GET /api/v1/users/{userId}/notifications

STATUS : 200 OK
RESPONSE BODY:
{
  "notifications": [
    {
      "notificationId": "notif-123",
      "channel": "EMAIL",
      "title": "Payment Successful",
      "status": "DELIVERED",
      "createdAt": "2026-12-31T09:00:00Z"
    },
    {
      "notificationId": "notif-456",
      "channel": "PUSH",
      "title": "Upcoming Meeting",
      "status": "SCHEDULED",
      "createdAt": "2026-12-31T09:30:00Z"
    }
  ]
}
```


## High-Level Design

FR-1:
Table:
- notifications
  - id
  - userId
  - channel
  - title
  - message
  - status
  - createdAt
  - scheduledAt

```sql
INSERT INTO notifications (
    user_id,
    channel,
    title,
    message,
    status,
    created_at
)
VALUES (
    'user-123',
    'EMAIL',
    'Payment Successful',
    'Your payment of ₹500 was successful.',
    'QUEUED',
    NOW()
);
```

EXPLANATION:
Notification Service receives the notification request.

It stores the notification in Postgres with status `QUEUED`.

Then it pushes the notification id to a queue.

Notification Worker consumes the message from the queue and sends it using the correct channel provider.

For example:

- EMAIL notification goes to Email Provider.
- SMS notification goes to SMS Provider.
- PUSH notification goes to Push Notification Provider.

After sending, the worker updates the notification status.

FR-2:
Table:
- notificationPreferences
  - userId
  - emailEnabled
  - smsEnabled
  - pushEnabled
  - updatedAt

```sql
UPDATE notification_preferences
SET
    email_enabled = true,
    sms_enabled = false,
    push_enabled = true,
    updated_at = NOW()
WHERE user_id = 'user-123';
```

EXPLANATION:
User can configure which notification channels are enabled.

Before sending a notification, Notification Service checks user preferences.

If the requested channel is disabled, the system can mark the notification as `SKIPPED`.

If the requested channel is enabled, the notification is queued for delivery.

This prevents sending unwanted notifications to the user.

FR-3:
Table:
- notifications
  - id
  - userId
  - channel
  - title
  - message
  - status
  - createdAt
  - scheduledAt

```sql
INSERT INTO notifications (
    user_id,
    channel,
    title,
    message,
    status,
    scheduled_at,
    created_at
)
VALUES (
    'user-123',
    'PUSH',
    'Upcoming Meeting',
    'Your meeting starts in 10 minutes.',
    'SCHEDULED',
    '2026-12-31T10:00:00Z',
    NOW()
);
```

EXPLANATION:
For scheduled notifications, Notification Service stores the notification with status `SCHEDULED`.

A Scheduler periodically checks for notifications where `scheduledAt <= current time`.

Those notifications are pushed to the queue.

Notification Worker consumes them and sends them through the required channel.

After successful delivery, status is updated to `DELIVERED`.

FR-4:
Table:
- notifications
  - id
  - userId
  - channel
  - title
  - message
  - status
  - createdAt
  - scheduledAt
  - deliveredAt

```sql
SELECT id, channel, title, message, status, created_at, scheduled_at, delivered_at
FROM notifications
WHERE user_id = 'user-123'
ORDER BY created_at DESC;
```

EXPLANATION:
Notification history can be served from the `notifications` table.

Each notification has a status.

Common statuses:

```text
QUEUED
SCHEDULED
SENT
DELIVERED
FAILED
SKIPPED
```

User can view all previous notifications and their delivery status.

For basic HLD interview discussion, storing notification history in Postgres is enough.

If traffic becomes very high, we can optimize history reads later in the deep dive section.

