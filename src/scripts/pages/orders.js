import fangiftService from "../services/fangiftService";
import templateTableOrderRecord from "../templates/table-order-record";
import spinner from "../utils/snip";

const loadOrders = async (sent = false) => {
  const table = sent ? "#tbody-sent-gifts" : "#tbody-my-gifts";
  const apiUrl = sent ? "/customer/orders" : "/customer/orders-to-customer";

  $(table).empty();
  $(table).addClass("h-[300px]");
  $(table).append(spinner.spin().el);

  const orders = await fangiftService.get(apiUrl);

  $(table).removeClass("h-[300px]");
  spinner.stop();

  if (orders.length === 0) {
    $(table).html(`
      <tr>
        <td colspan="14">
          <p class="h-[300px] flex items-center justify-center text-body-lg">
            You have no wishlist gift orders at this time
          </P>
        </td>
      </tr>
    `);
  } else {
    orders.forEach((order) => {
      $(table).append(
        templateTableOrderRecord({
          name: order.name,
          items: order.lineItems.map((item) => item.name),
          price: Number(order.totalPriceSet.shopMoney.amount).toFixed(2),
          gifter: sent ? order.attributes.username : order.gifter,
          anonymous: order.gifter === "Anonymous",
          message: order.note,
          date: new Date(order.createdAt).toLocaleDateString(),
          status: order.displayFulfillmentStatus === "FULFILLED",
        })
      );
    });
  }
};

$(function () {
  if (window.gUserInfo?.type === "fan") {
    $("#tab-order-buttons").remove();
    $("#tab-content-wishlist").remove();
    loadOrders(true);
  } else {
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
      defaultTabId: window.gUserInfo?.type === "creator" ? "wishlist" : "sent",
      activeClasses: "active",
      inactiveClasses: "inactive",
      onShow: ({ _activeTab: { id: tabId } }) => {
        if (tabId === "wishlist") {
          loadOrders(false);
        } else if (tabId === "sent") {
          loadOrders(true);
        }
      },
    };

    const tabs = new Tabs(tabElements, options);
    tabs.show("wishlist");
  }
});
