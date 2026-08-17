// Run once as GM after enabling Edited Campaign Tools.
// Creates or refreshes the module-managed monster and level-1 PC Actors.
if (!globalThis.EditedCampaignActors) {
  ui.notifications.error("Edited Campaign Tools is not ready. Confirm the module is enabled, then reload the world.");
} else {
  await globalThis.EditedCampaignActors.installCampaignActors();
}
