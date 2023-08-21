import fangiftService from "../services/fangiftService";

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
  const $giftCollectionEl = document.getElementById("drawer-gift-collection");
  const drawerSelectGift = new Drawer($selectGiftEl, drawerOptions);
  const drawerAddGift = new Drawer($addGiftEl, drawerOptions);
  const drawerGiftDetails = new Drawer($giftDetailsEl, drawerOptions);
  const drawerGiftProduct = new Drawer($giftProductEl, drawerOptions);
  const drawerGiftCollection = new Drawer($giftCollectionEl, drawerOptions);

  const state = {
    url: "",
    title: "",
    mainImage: null,
    shippingPrice: 0,
    digitalGood: false,
  };

  document
    .getElementById("btn-add-gift")
    .addEventListener("click", function () {
      drawerSelectGift.show();
    });

  document
    .getElementById("btn-gift-next")
    .addEventListener("click", function () {
      state.giftSource = document.querySelector(
        "input[name=gift-source]:checked"
      ).value;
      drawerSelectGift.hide();

      if (state.giftSource === "fangift") {
        drawerAddGift.show();
      } else if (state.giftSource === "product") {
        drawerGiftProduct.show();
      }
    });

  $("#wrapper-main-image").on("click", function (e) {
    $("#file-main-image").trigger("click");
  });

  $("#file-main-image").on("change", function (e) {
    state.mainImage = e.target.files[0];
    if (state.mainImage) {
      const reader = new FileReader();

      reader.onload = function (e) {
        $("#img-product-main").attr("src", e.target.result);
      };

      reader.readAsDataURL(state.mainImage);
    }
  });

  $("#btn-next-product").on("click", async function () {
    state.url = $("#text-product-link").val();

    $(this).loading(true, true);
    const prodInfo = await fangiftService.post("scraper/product", {
      url: state.url,
    });
    state.mainImage = prodInfo.mainImage;
    $(this).loading(false, true);

    $("#text-product-title").val(prodInfo.title);
    $("#text-product-price").val(prodInfo.price);
    $("#img-product-main").prop("src", prodInfo.mainImage);

    drawerGiftProduct.hide();
    drawerGiftDetails.show();
  });

  $("#btn-add-wishlist").on("click", async function () {
    state.shippingPrice = $("#text-shipping-price").val();
    state.title = $("#text-product-title").val();
    state.price = $("#text-product-price").val();
    state.digitalGood = $("#checkbox-digital-good").prop("checked");

    $(this).loading(true, true);
    try {
      await fangiftService.post("products", {
        title: state.title,
        price: Number(state.price),
        digitalGood: state.digitalGood,
        shippingPrice: Number(state.shippingPrice),
        productUrl: state.url,
        mainImage: state.mainImage,
      });
      drawerGiftDetails.hide();
    } catch (err) {}

    $(this).loading(false, true);
  });

  $("#btn-save-collection").on("click", function () {
    drawerGiftCollection.hide();
  });

  $("#btn-add-next").on("click", function () {
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

  $giftCollectionEl
    .querySelector(".btn-close-drawer")
    .addEventListener("click", function () {
      drawerGiftCollection.hide();
    });
});
