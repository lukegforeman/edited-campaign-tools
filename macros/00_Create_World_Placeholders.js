// Run once as GM after enabling Edited Campaign Tools. Safe to rerun after updates.
if (!globalThis.EditedSession1) {
  ui.notifications.error("Edited Session 1 installer is not ready. Confirm the module is enabled, then reload the world.");
} else {
  await globalThis.EditedSession1.installSession1();
}
