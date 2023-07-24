window.addEventListener("DOMContentLoaded", (event) => {
  const tabElements = [
    {
      id: "wishlist",
      triggerEl: document.querySelector("#tab-wishlist"),
      targetEl: document.querySelector("#tab-content-wishlist"),
    },
    {
      id: "sent",
      triggerEl: document.querySelector("#tab-sent"),
      targetEl: document.querySelector("#tab-content-sent"),
    },
  ];

  const options = {
    defaultTabId: "wishlist",
    activeClasses: "active",
    inactiveClasses: "inactive",
    onShow: (_event) => {},
  };

  const tabs = new Tabs(tabElements, options);
  tabs.show("wishlist");
});
