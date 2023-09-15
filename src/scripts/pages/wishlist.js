import fangiftService from "../services/fangiftService";
import { ITEMS_PER_PAGE } from "../utils/constants";
import spinner from "../utils/snip";
import { prodGidToId } from "../utils/string";
import templateCardWishlist from "../templates/card.wishlist";
import toastr from "toastr";

toastr.options.positionClass = "toast-bottom-center";

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
      $("#btn-add-wishlist").show();
      $("#btn-update-wishlist").hide();
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
    editId: null,
  };

  $("#text-username").text(gUserInfo.name);

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

  const loadWishlist = async (showSpinner = false) => {
    const container = $("#container-wishlists");

    if (showSpinner) {
      container.append(spinner.spin().el);
      container.addClass("min-h-[600px]");
    }

    const userInfo = JSON.parse(localStorage.getItem("payload"));
    const { products, pageInfo } = await fangiftService.get("/shop/product", {
      params: {
        after: state.after,
        first: ITEMS_PER_PAGE,
        query: `vendor:${userInfo.name}`,
      },
    });
    state.after = pageInfo.endCursor;

    if (products.length) {
      $("#no-gifts").addClass("hidden");
      $("#no-gifts").removeClass("flex");
      $("#btn-load-more").show();

      products.forEach((product) =>
        container.append(
          templateCardWishlist({
            ...product,
            favorite: JSON.parse(product.metafields.favorite?.value ?? "false"),
            idNum: prodGidToId(product.id),
          })
        )
      );

      $(".just-created .btn-card-delete").on("click", function () {
        const prodId = $(this).data("product");
        state.deleteId = prodId;
        confirmModal.show();
      });

      $(".just-created .btn-card-edit").on("click", function () {
        const prodId = $(this).data("product");
        state.editId = prodId;
        const prod = products.find((p) => p.id === prodId);

        if (prod) {
          $("#text-product-title").val(prod.title);
          $("#text-product-price").val(
            prod.priceRangeV2.minVariantPrice.amount
          );
          $("#img-product-main").prop("src", prod.featuredImage.url);
          $("#checkbox-digital-good").prop(
            "checked",
            prod.metafields.digitalGood
          );
          $("#text-shipping-price").val(prod.metafields.shippingPrice);
          $("#btn-add-wishlist").hide();
          $("#btn-update-wishlist").show();

          drawerGiftDetails.show();
        }
      });

      $(".just-created .btn-favorite").on("click", function () {
        const id = $(this).data("metafield");
        const prodId = $(this).data("product");
        const newValue = !$(this).hasClass("toggled");

        $(this).loading(true);

        fangiftService
          .put("/shop/product/metafield", {
            id,
            value: newValue.toString(),
            prodId,
          })
          .then(() => {
            $(this).toggleClass("toggled");
            $(this).loading(false);
          });
      });

      $(".just-created").removeClass(".just-created");
    } else {
      $("#no-gifts").removeClass("hidden");
      $("#no-gifts").addClass("flex");
      $("#btn-load-more").hide();
    }

    if (showSpinner) {
      container.removeClass("min-h-[600px]");
      spinner.stop();
    }

    $("#btn-load-more").prop("disabled", !pageInfo.hasNextPage);

    return pageInfo.hasNextPage;
  };

  loadWishlist(true);

  $("#btn-add-gift").on("click", function () {
    drawerSelectGift.show();
  });

  $("#btn-gift-next").on("click", function () {
    state.giftSource = document.querySelector(
      "input[name=gift-source]:checked"
    ).value;
    drawerSelectGift.hide();

    if (state.giftSource === "fangift") {
      drawerAddGift.show();
    } else if (state.giftSource === "product") {
      drawerGiftProduct.show();
      $("#btn-update-wishlist").hide();
      $("#btn-add-wishlist").show();
    }
  });

  $("#btn-product-link").on("click", function () {
    state.giftSource = "product";
    $("#btn-add-wishlist").show();
    $("#btn-update-wishlist").hide();
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

    $(this).loading(true);

    try {
      const formData = new FormData();
      formData.append("title", state.title);
      formData.append("price", state.price);
      formData.append("digitalGood", state.digitalGood);
      formData.append("shippingPrice", state.shippingPrice);
      formData.append("productUrl", state.url);
      formData.append("imageUrl", state.mainImage);
      formData.append("imageFile", state.imageFile);

      await fangiftService.post("/shop/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await loadWishlist();
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

  $("#btn-load-more").on("click", async function () {
    $(this).loading(true);
    const hasNextPage = await loadWishlist();
    $(this).loading(false, !hasNextPage);
  });

  $(".btn-sure-modal-delete").on("click", async function () {
    $(this).loading(true, { size: "w-4 h-4" });
    await fangiftService.delete("/shop/product", {
      params: {
        id: state.deleteId,
      },
    });
    $(this).loading(false);
    $(`#card-wishlist-${prodGidToId(state.deleteId)}`).remove();
    confirmModal.hide();
  });

  $(".btn-cancel-modal-delete").on("click", function () {
    confirmModal.hide();
  });
});
