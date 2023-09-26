import fangiftService from "../services/fangiftService";
import templateCardGift from "../templates/card.gift";
import templateCartItem from "../templates/cart-item";
import { overlay } from "../utils/snip";
import { getS3Url } from "../utils/string";

$(async function () {
  const urlParams = new URLSearchParams(location.search);
  const username = urlParams.get("username");
  const containerAllGifts = $("#container-all-gifts");
  const $cartEl = document.getElementById("drawer-cart");
  const drawerCart = new Drawer($cartEl, {
    placement: "right",
    backdrop: true,
    bodyScrolling: false,
    edge: false,
    edgeOffset: "",
    backdropClasses:
      "bg-primary-black/30 [backdrop-filter:blur(4px)] fixed inset-0 z-30",
  });

  if (!username) {
    location.pathname = "/pages/creators";
    return;
  }

  const hideOverlay = overlay();
  const [user] = await fangiftService.get("/user", {
    params: {
      query: `name="${username}"`,
    },
  });
  const products = await fangiftService.get("/wishlist", {
    params: {
      userId: user.sub,
    },
  });

  // render creator's gift items to all gifts section
  products.forEach((prod) => containerAllGifts.append(templateCardGift(prod)));

  // add or remove gift items to cart
  const updateCart = function (variantId, remove) {
    const rawItems = localStorage.getItem("cart_items");
    const cartItems = rawItems ? JSON.parse(rawItems) : {};
    const container = $("#container-gift-cart");

    if (remove) {
      cartItems[username] = cartItems[username].filter(
        (cartId) => cartId !== variantId
      );
    } else {
      if (cartItems[username] && !cartItems[username].includes(variantId)) {
        cartItems[username].push(variantId);
      } else if (!cartItems[username]) {
        cartItems[username] = [variantId];
      }
    }

    localStorage.setItem("cart_items", JSON.stringify(cartItems));

    container.empty();
    let subtotal = 0;
    cartItems[username].forEach((cartId) => {
      const cardProd = products.find((prod) => prod.variantId === cartId);
      if (cardProd) {
        container.append(templateCartItem(cardProd));
        subtotal += parseFloat(cardProd.price);
      }
    });
    $("#text-subtotal").text(`$${subtotal}`);

    $(".btn-remove-from-cart").off("click");
    $(".btn-remove-from-cart").on("click", function () {
      const variantId = $(this).data("variant-id");
      updateCart(variantId, true);
    });

    drawerCart.show();
  };

  // add gift items to cart
  $(".btn-add-to-cart").on("click", function () {
    const variantId = $(this).data("variant-id");
    updateCart(variantId);
  });

  // close cart drawer when clicking x button
  $("#btn-close-cart").on("click", () => drawerCart.hide());

  // update creator profile section info
  $("#text-username").text(`@${user.name}`);
  $("#text-public-name").text(user.publicName);
  $("#text-bio").text(user.bio);
  $("#img-user-picture").prop("src", getS3Url(user.picture));

  $("#btn-checkout").on("click", async function () {
    $(this).loading(true);
    const rawItems = localStorage.getItem("cart_items");
    const cartItems = rawItems ? JSON.parse(rawItems) : {};

    if (cartItems[username]) {
      const cart = await fangiftService.post("/shop/checkout", {
        creator: username,
        cartItems: cartItems[username].filter((variantId) =>
          products.some((p) => p.variantId === variantId)
        ),
      });
      cartItems[username] = [];
      localStorage.setItem("cart_items", JSON.stringify(cartItems));

      if (cart.checkoutUrl) {
        window.location.href = cart.checkoutUrl;
      } else {
        $(this).loading(false);
      }
    } else {
      $(this).loading(false);
    }
  });

  // initialize tab elements
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
    onShow: async (event) => {
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

  // close body overlay after successful initialization
  hideOverlay();
});
