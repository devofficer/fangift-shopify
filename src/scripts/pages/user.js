import toastr from "toastr";
import fangiftService from "../services/fangiftService";
import templateCardGift from "../templates/card.gift";
import templateCartItem from "../templates/cart-item";
import { overlay } from "../utils/snip";
import { getS3Url } from "../utils/string";

toastr.options.positionClass = "toast-bottom-center bottom-10";

const drawerOptions = {
  placement: window.innerWidth > 600 ? "right" : "bottom",
  backdrop: true,
  bodyScrolling: false,
  edge: false,
  edgeOffset: "",
  backdropClasses:
    "bg-primary-black/30 [backdrop-filter:blur(4px)] fixed inset-0 z-30",
};

$(async function () {
  const urlParams = new URLSearchParams(location.search);
  const username = urlParams.get("username");

  if (!username) {
    location.pathname = "/pages/creators";
    return;
  }

  const state = {
    selectedGift: null,
  };

  const containerAllGifts = $("#container-all-gifts");
  const $cartEl = document.getElementById("drawer-cart");
  const $giftDetailsEl = document.getElementById("drawer-gift-details");

  const drawerCart = new Drawer($cartEl, drawerOptions);
  const drawerGiftDetails = new Drawer($giftDetailsEl, {
    ...drawerOptions,
    onHide() {
      $("#text-title").text("");
      $("#text-price").text("");
      $("#text-desc").html("");
      $("#img-product-main").prop("src", "");
    },
  });

  const hideOverlay = overlay();
  const [user] = await fangiftService.get("/customer/user", {
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

  $(".btn-gift-details").on("click", function () {
    const giftId = $(this).data("wishlist");
    const gift = products.find((g) => g.id === giftId);

    if (gift) {
      $("#text-title").text(gift.title);
      $("#text-price").text(gift.price);
      $("#text-desc").html(gift.description);
      $("#img-product-main").prop("src", gift.imageUrl);
      state.selectedGift = gift.variantId;

      drawerGiftDetails.show();
    }
  });

  $(".btn-close-drawer").on("click", function () {
    drawerGiftDetails.hide();
  });

  $("#btn-add-cart").on("click", function () {
    updateCart(state.selectedGift);
    drawerGiftDetails.hide();
    drawerCart.show();
  });

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
  if (user.picture) {
    $("#img-user-picture").prop("src", getS3Url(user.picture));
  }
  $("#text-message").prop(
    "placeholder",
    `Your gift message to ${user.publicName}...`
  );

  $(".btn-share").on("click", function () {
    const shareData = {
      title: "Share Example",
      text: "Check out this awesome website!",
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      // Use the Web Share API to invoke the share dialog
      navigator
        .share(shareData)
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.error("Share failed:", error));
    } else {
      // Fallback action (e.g., open a mailto link)
      window.location.href =
        "mailto:?subject=Check out this website&body=" +
        encodeURIComponent(window.location.href);
    }
  });

  $("#btn-checkout").on("click", async function () {
    $(this).loading(true);
    const rawItems = localStorage.getItem("cart_items");
    const cartItems = rawItems ? JSON.parse(rawItems) : {};
    const message = $("#text-message").val();

    if (cartItems[username]) {
      try {
        const draftOrder = await fangiftService.post("/shop/checkout", {
          username,
          message,
          email: user.email,
          customer: user.customer,
          gifter: window.gUserInfo?.customer,
          cartItems: cartItems[username].filter((variantId) =>
            products.some((p) => p.variantId === variantId)
          ),
        });
        cartItems[username] = [];
        localStorage.setItem("cart_items", JSON.stringify(cartItems));
        $("#text-message").val("");

        if (draftOrder.invoiceUrl) {
          window.location.href = draftOrder.invoiceUrl;
          // window.open(draftOrder.invoiceUrl, "_blank").focus();
        }
      } catch (err) {
        console.log(err);
      }
    }
    $(this).loading(false);
    drawerCart.hide();
  });

  $(".btn-share-profile").on("click", function () {
    window.navigator.clipboard.writeText(`${window.location.host}/${username}`);
    toastr.info("Copied wishlist link");
  });

  hideOverlay();
});
