import fangiftService from "../services/fangiftService";
import templateTableOrderRecord from "../templates/table-order-record";

$(function () {
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

  fangiftService.get("/customer/orders").then((orders) => {
    orders.forEach((order) => {
      $("#tbody-sent-gifts").append(
        templateTableOrderRecord({
          name: order.name,
          items: order.lineItems.map((item) => item.name),
          price: Number(order.totalPriceSet.shopMoney.amount).toFixed(2),
          gifter: order.attributes.username,
          message: order.note,
          date: new Date(order.createdAt).toLocaleDateString(),
          status: order.displayFulfillmentStatus === "FULFILLED",
        })
      );
    });
  });

  fangiftService.get("/customer/orders-to-customer").then((orders) => {
    orders.forEach((order) => {
      $("#tbody-my-gifts").append(
        templateTableOrderRecord({
          name: order.name,
          items: order.lineItems.map((item) => item.name),
          price: Number(order.totalPriceSet.shopMoney.amount).toFixed(2),
          gifter: order.gifter,
          anonymous: order.gifter === "Anonymous",
          message: order.note,
          date: new Date(order.createdAt).toLocaleDateString(),
          status: order.displayFulfillmentStatus === "FULFILLED",
        })
      );
    });
  });
});
