const tabIds = [
  "profile",
  "account",
  "wishlist",
  "address",
  "social-links",
  "wishlist-analytics",
  "store-analytics",
  "balance",
];

$(function () {
  const tabElements = tabIds.map((tabId) => ({
    id: tabId,
    triggerEl: document.querySelector(`#${tabId}-tab`),
    targetEl: document.querySelector(`#${tabId}`),
  }));

  const options = {
    defaultTabId: tabIds[0],
    activeClasses: "active",
    inactiveClasses: "inactive",
  };

  const tabs = new Tabs(tabElements, options);
  tabs.show(tabIds[0]);
});
