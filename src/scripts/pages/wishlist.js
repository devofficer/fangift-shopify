import toastr from "toastr";
import fangiftService from "../services/fangiftService";
import templateCardWishlist from "../templates/card.wishlist";
import spinner from "../utils/snip";
import LINKS from "../constants/links";
import { isUrl } from "../utils/string";

toastr.options.positionClass = "toast-bottom-center bottom-10";

$(function () {
  const drawerDefaultOptions = {
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
  const $confirmModalEl = document.getElementById("modal-delete");

  const drawerSelectGift = new Drawer($selectGiftEl, drawerDefaultOptions);
  const drawerAddGift = new Drawer($addGiftEl, drawerDefaultOptions);
  const drawerGiftDetails = new Drawer($giftDetailsEl, {
    ...drawerDefaultOptions,
    onHide() {
      $("#text-product-title").val("");
      $("#text-product-price").val(0);
      $("#text-shipping-price").val("");
      $("#img-product-main").prop("src", "");
      $("#checkbox-digital-good").prop("checked", false);
      $("#btn-add-wishlist").removeClass("hidden");
      $("#btn-update-wishlist").addClass("hidden");
    },
  });
  const drawerGiftProduct = new Drawer($giftProductEl, drawerDefaultOptions);
  const drawerGiftCollection = new Drawer(
    $giftCollectionEl,
    drawerDefaultOptions
  );
  const confirmModal = new Modal($confirmModalEl);

  const state = {
    url: "",
    title: "",
    imageFile: null,
    mainImage: "",
    shippingPrice: 0,
    digitalGood: false,
    after: null,
    deleteId: null,
    editWishlist: null,
  };

  $("#text-username").text(gUserInfo.publicName.split(" ")[0]);
  $("#profile-link").prop(
    "href",
    `//${window.location.hostname}/pages/user?username=${gUserInfo.name}`
  );
  $("#profile-link").text(`${window.location.hostname}/${gUserInfo.name}`);

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

  const bindEventHandlers = () => {
    $(".just-created .btn-card-delete").on("click", function () {
      const wishlistId = $(this).data("wishlist");
      state.deleteId = wishlistId;
      confirmModal.show();
    });

    $(".just-created .btn-card-edit").on("click", function () {
      const wishlistId = $(this).data("wishlist");
      const prod = state.wishlists.find((p) => p.id === wishlistId);
      state.editWishlist = prod;

      if (prod) {
        $("#text-product-title").val(prod.title);
        $("#text-product-price").val(prod.price);
        $("#img-product-main").prop("src", prod.imageUrl);
        $("#checkbox-digital-good").prop("checked", prod.digitalGood);
        $("#text-shipping-price").val(prod.shippingPrice);
        $("#btn-add-wishlist").addClass("hidden");
        $("#btn-update-wishlist").removeClass("hidden");

        drawerGiftDetails.show();
      }
    });

    $(".just-created .btn-favorite").on("click", function () {});

    $(".just-created").removeClass(".just-created");
  };

  const loadWishlist = async (showSpinner = false) => {
    const container = $("#container-wishlists");

    if (showSpinner) {
      $(".card-product").remove();
      $("#no-gifts").addClass("hidden");
      $("#no-gifts").removeClass("flex");
      container.append(spinner.spin().el);
      container.addClass("min-h-[600px]");
    }

    const wishlists = await fangiftService.get("/wishlist", {
      params: {
        userId: gUserInfo["cognito:username"],
      },
    });
    state.wishlists = wishlists;

    if (wishlists.length) {
      $("#no-gifts").addClass("hidden");
      $("#no-gifts").removeClass("flex");

      wishlists.forEach((product) =>
        container.append(templateCardWishlist(product))
      );

      bindEventHandlers();
    } else {
      $("#no-gifts").removeClass("hidden");
      $("#no-gifts").addClass("flex");
    }

    if (showSpinner) {
      container.removeClass("min-h-[600px]");
      spinner.stop();
    }
  };

  loadWishlist(true);

  $(".btn-add-gift").on("click", function () {
    drawerSelectGift.show();
  });

  $(".btn-copy-wishlist-link").on("click", function () {
    window.navigator.clipboard.writeText(
      `${window.location.hostname}/pages/user?username=${gUserInfo.name}`
    );
    toastr.info("Copied your wishlist link");
  });

  $("#btn-gift-next").on("click", function () {
    state.giftSource = document.querySelector(
      "input[name=gift-source]:checked"
    ).value;
    drawerSelectGift.hide();

    if (state.giftSource === "fangift") {
      window.location.href = LINKS.marketplace.path;
    } else if (state.giftSource === "product") {
      drawerGiftProduct.show();
      $("#btn-update-wishlist").addClass("hidden");
      $("#btn-add-wishlist").removeClass("hidden");
    }
  });

  $("#btn-product-link").on("click", function () {
    state.giftSource = "product";
    $("#btn-update-wishlist").addClass("hidden");
    $("#btn-add-wishlist").removeClass("hidden");
    drawerGiftProduct.show();
  });

  $("#wrapper-main-image").on("click", function (e) {
    $("#file-main-image").trigger("click");
  });

  $("#file-main-image").on("change", function (e) {
    state.imageFile = e.target.files[0];
    if (state.imageFile) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $("#img-product-main").attr("src", e.target.result);
      };
      reader.readAsDataURL(state.imageFile);
    }
  });

  $("#btn-next-product").on("click", async function () {
    state.url = $("#text-product-link").val();

    if (!isUrl(state.url)) {
      toastr.error("Please enter a valid product url.");
      return;
    }

    $(this).loading(true);

    try {
      const prodInfo = await fangiftService.get("/scraper/product", {
        params: {
          url: state.url,
        },
      });
      state.mainImage = prodInfo.mainImage;

      $("#text-product-title").val(prodInfo.title);
      $("#text-product-price").val(prodInfo.price);
      $("#img-product-main").prop(
        "src",
        prodInfo.mainImage || $("#img-product-main").data("placeholder")
      );

      drawerGiftProduct.hide();
      drawerGiftDetails.show();
      $("#text-product-link").val("");

      if (!prodInfo.mainImage && !prodInfo.title) {
        toastr.warning(
          "Failed to parse product. Please try to fill out fields manually."
        );
      }
    } catch (err) {
      toastr.warning("Please enter valid product URL!");
    }

    $(this).loading(false);
  });

  $("#btn-add-wishlist").on("click", async function () {
    state.shippingPrice = $("#text-shipping-price").val();
    state.title = $("#text-product-title").val();
    state.price = $("#text-product-price").val();
    state.digitalGood = $("#checkbox-digital-good").prop("checked");

    if (!state.title.trim()) {
      toastr.warning("Invalid product title, it is required Field.");
      return;
    }

    $(this).loading(true);

    try {
      const formData = new FormData();
      formData.append("userId", gUserInfo["cognito:username"]);
      formData.append("title", state.title);
      formData.append("price", state.price);
      formData.append("digitalGood", state.digitalGood);
      formData.append("shippingPrice", state.shippingPrice);
      formData.append("productUrl", state.url);
      formData.append("imageUrl", state.mainImage);
      formData.append("imageFile", state.imageFile);

      await fangiftService.post("/wishlist", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      loadWishlist(true);
      drawerGiftDetails.hide();
    } catch (err) {
      toastr.error(err.response.data.message);
      $(this).loading(false);
    }
  });

  $("#btn-update-wishlist").on("click", async function () {
    state.shippingPrice = $("#text-shipping-price").val();
    state.title = $("#text-product-title").val();
    state.price = $("#text-product-price").val();
    state.digitalGood = $("#checkbox-digital-good").prop("checked");

    $(this).loading(true);

    try {
      const form = new FormData();
      form.append("id", state.editWishlist.id);
      form.append("title", state.title);
      form.append("price", state.price);
      form.append("digitalGood", state.digitalGood);
      form.append("shippingPrice", state.shippingPrice);
      form.append("imageUrl", state.editWishlist.imageUrl);
      form.append("imageFile", state.imageFile);

      if (isUrl(state.editWishlist.productUrl)) {
        form.append("productUrl", state.editWishlist.productUrl);
      }

      await fangiftService.put("/wishlist", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      loadWishlist(true);
      drawerGiftDetails.hide();
    } catch (err) {
      toastr.error(err.response.data.message);
    }

    $(this).loading(false);
  });

  $("#btn-save-collection").on("click", function () {
    drawerGiftCollection.hide();
  });

  $("#btn-add-next").on("click", function () {
    drawerAddGift.hide();
    drawerGiftDetails.show();
  });

  $(".btn-sure-modal-delete").on("click", async function () {
    $(this).loading(true, { size: "w-4 h-4" });
    try {
      await fangiftService.delete(`/wishlist/${state.deleteId}`);
      loadWishlist(true);
    } catch (err) {
      toastr.error(err.message);
    }
    $(this).loading(false);
    confirmModal.hide();
  });

  $(".btn-cancel-modal-delete").on("click", function () {
    confirmModal.hide();
  });
});
