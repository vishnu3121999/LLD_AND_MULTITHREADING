# Approach Comparison

## Existing Packages

`A_basic` demonstrates recipients, notification templates, notifications, channels, and direct send simulation.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- Recipients receive notifications.
- Templates store reusable message bodies.
- Notifications have recipient, channel, message, and status.

Action based points:
- Admin adds recipients and templates.
- User/system sends direct or templated notification.
- System marks notification as sent.

Misc:
- A_basic does not integrate real email/SMS/push providers.
- Channel strategies, retries, scheduling, and templates with variables are deferred.

#### Common Misc

Offline or online:
- Treat as online service because recipients/templates/notifications are stored independently.

Extensibility:
- Channel delivery can become Strategy later.

History and undo:
- Notification records provide history; undo is not needed.

Notifications:
- This is the notification domain itself; broadcast/event integration is deferred.

Exception handling:
- Missing recipients/templates and delivery failures are later validations.

Concurrency:
- Duplicate sends and concurrent retries are deferred.

### UseCase Diagram

Actors:
- User/System
- Admin
- System

UseCases:
- addRecipient/addTemplate(Admin)
- sendNotification(User/System) -> create Notification(System) -> deliver(System) -> store Notification(System)
- sendTemplatedNotification(User/System) -> read Template(System) -> sendNotification(System)

### Class Diagram

Core entities:
- `Recipient(recipientId, name, contact)` stores recipient data.
- `NotificationTemplate(notificationTemplateId, body)` stores reusable message body.
- `Notification(notificationId, recipientId, channelType, message, notificationStatus)` stores send record.

Method placement:
- Send workflows belong in the facade because they coordinate template lookup and delivery simulation.
- `markSent` belongs in `Notification` because it only mutates notification state.
