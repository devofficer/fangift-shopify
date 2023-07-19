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
  };

  const tabs = new Tabs(tabElements, options);
  tabs.show("wishlist");
});
