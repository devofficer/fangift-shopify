window.addEventListener("DOMContentLoaded", (event) => {
  const tabElements = [
    {
      id: "wishlist",
      triggerEl: document.querySelector("#wishlist-tab"),
      targetEl: document.querySelector("#wishlist"),
    },
    {
      id: "products",
      triggerEl: document.querySelector("#products-tab"),
      targetEl: document.querySelector("#products"),
    },
    {
      id: "gifts",
      triggerEl: document.querySelector("#gifts-tab"),
      targetEl: document.querySelector("#gifts"),
    },
  ];

  const options = {
    defaultTabId: "wishlist",
    activeClasses: "active",
    inactiveClasses: "inactive",
    onShow: (event) => {
      if (event._activeTab.id === "products") {
        document.querySelector("#recent-gifters").classList.add("hidden");
        document.querySelector("#leaderboard").classList.add("hidden");
      } else {
        document.querySelector("#recent-gifters").classList.remove("hidden");
        document.querySelector("#leaderboard").classList.remove("hidden");
      }
    },
  };

  const tabs = new Tabs(tabElements, options);
  tabs.show("wishlist");
});
