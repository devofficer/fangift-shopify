document.addEventListener("DOMContentLoaded", function () {
  const drawerOptions = {
    placement: "right",
    backdrop: true,
    bodyScrolling: false,
    edge: false,
    edgeOffset: "",
    backdropClasses:
      "bg-primary-black/30 [backdrop-filter:blur(4px)] fixed inset-0 z-30",
  };

  const $selectGiftEl = document.getElementById("drawer-select-gift");
  const $addGiftEl = document.getElementById("drawer-add-gift");
  const $giftDetailsEl = document.getElementById("drawer-gift-details");
  const $giftProductEl = document.getElementById("drawer-gift-product");
  const drawerSelectGift = new Drawer($selectGiftEl, drawerOptions);
  const drawerAddGift = new Drawer($addGiftEl, drawerOptions);
  const drawerGiftDetails = new Drawer($giftDetailsEl, drawerOptions);
  const drawerGiftProduct = new Drawer($giftProductEl, drawerOptions);

  let giftSource = "";

  document
    .getElementById("btn-add-gift")
    .addEventListener("click", function () {
      drawerSelectGift.show();
    });

  document
    .getElementById("btn-gift-next")
    .addEventListener("click", function () {
      giftSource = document.querySelector(
        "input[name=gift-source]:checked"
      ).value;
      drawerSelectGift.hide();

      if (giftSource === "fangift") {
        drawerAddGift.show();
      } else if (giftSource === "product") {
        drawerGiftProduct.show();
      }
    });

  document
    .getElementById("btn-add-wishlist")
    .addEventListener("click", function () {
      drawerGiftDetails.hide();
    });

  document
    .getElementById("btn-add-next")
    .addEventListener("click", function () {
      drawerAddGift.hide();
      drawerGiftDetails.show();
    });

  $selectGiftEl
    .querySelector(".btn-close-drawer")
    .addEventListener("click", function () {
      drawerSelectGift.hide();
    });

  $addGiftEl
    .querySelector(".btn-close-drawer")
    .addEventListener("click", function () {
      drawerAddGift.hide();
    });

  $giftDetailsEl
    .querySelector(".btn-close-drawer")
    .addEventListener("click", function () {
      drawerGiftDetails.hide();
    });

  $giftProductEl
    .querySelector(".btn-close-drawer")
    .addEventListener("click", function () {
      drawerGiftProduct.hide();
    });
});
