import fangiftService from "../services/fangiftService";
import { ITEMS_PER_PAGE } from "../utils/constants";
import spinner from "../utils/snip";
import { prodGidToId } from "../utils/string";
import templateCardWishlist from "../templates/card.wishlist";
import toastr from "toastr";

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
    editProd: null,
  };

  $("#text-username").text(gUserInfo.name);
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
      const prodId = $(this).data("product");
      state.deleteId = prodId;
      confirmModal.show();
    });

    $(".just-created .btn-card-edit").on("click", function () {
      const prodId = $(this).data("product");
      const prod = state.products.find((p) => p.id === prodId);
      state.editProd = prod;

      if (prod) {
        $("#text-product-title").val(prod.title);
        $("#text-product-price").val(prod.priceRangeV2.minVariantPrice.amount);
        $("#img-product-main").prop("src", prod.featuredImage.url);
        $("#checkbox-digital-good").prop(
          "checked",
          prod.metafields.digital_good.value === "true"
        );
        $("#text-shipping-price").val(prod.metafields.shipping_price.value);
        $("#btn-add-wishlist").addClass("hidden");
        $("#btn-update-wishlist").removeClass("hidden");

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
  };

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
    state.products = products;

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

      bindEventHandlers();
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

    if (
      !/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(
        state.url
      )
    ) {
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
      window.location.reload();
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
      form.append("id", state.editProd.id);
      form.append("title", state.title);
      form.append("price", state.price);
      form.append("digitalGood", state.digitalGood);
      form.append("shippingPrice", state.shippingPrice);
      form.append("productUrl", state.editProd.metafields.product_url.value);
      form.append("imageUrl", state.editProd.featuredImage.url);
      form.append("imageFile", state.imageFile);

      const updatedProd = await fangiftService.put("/shop/product", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      state.products = state.products.map((prod) =>
        prod.id === updatedProd.id ? updatedProd : prod
      );

      /**
      $("#container-wishlists").append(templateCardWishlist({
        ...updatedProd,
        favorite: JSON.parse(updatedProd.metafields.favorite?.value ?? "false"),
        idNum: prodGidToId(updatedProd.id),
      }));

      bindEventHandlers();

      $(`#card-wishlist-${prodGidToId(updatedProd.id)}`).remove();
      */
      location.reload();
    } catch (err) {
      toastr.error(err.response.data.message);
    }
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
