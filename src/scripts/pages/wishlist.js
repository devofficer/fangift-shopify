import toastr from "toastr";
import fangiftService from "../services/fangiftService";
import templateCardWishlist from "../templates/card.wishlist";
import templateCardProduct from "../templates/card.product";
import spinner from "../utils/snip";
import LINKS from "../constants/links";
import { isUrl } from "../utils/string";

toastr.options.positionClass = "toast-bottom-center bottom-10";

$(function () {
  const drawerDefaultOptions = {
    placement: window.innerWidth > 600 ? "right" : "bottom",
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
  const $confirmModalEl = document.getElementById("modal-delete");
  const $suggestGiftEl = document.getElementById("drawer-suggest-gift");

  const drawerSelectGift = new Drawer($selectGiftEl, drawerDefaultOptions);
  const drawerAddGift = new Drawer($addGiftEl, drawerDefaultOptions);
  const drawerGiftDetails = new Drawer($giftDetailsEl, {
    ...drawerDefaultOptions,
    onHide() {
      $("#text-product-title").val("");
      $("#text-product-price").val(0);
      $("#img-product-main").prop("src", "");
      $("#btn-add-wishlist").removeClass("hidden");
      $("#btn-delete-wishlist").addClass("hidden");
    },
  });
  const drawerSuggestGift = new Drawer($suggestGiftEl, drawerDefaultOptions);
  const drawerGiftProduct = new Drawer($giftProductEl, drawerDefaultOptions);
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

  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("suggest_gift") === "true") {
    drawerGiftProduct.show();
  }

  $("#text-username").text(window.gUserInfo?.publicName.split(" ")[0]);
  $("#profile-link").prop(
    "href",
    `//${window.location.host}/${window.gUserInfo?.name}`
  );
  $("#profile-link").text(`${window.location.host}/${window.gUserInfo?.name}`);

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

  $suggestGiftEl
    .querySelector(".btn-close-drawer")
    .addEventListener("click", function () {
      drawerSuggestGift.hide();
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
        $("#text-product-title").text(prod.title);
        $("#text-product-price").text(`$${prod.price}`);
        $("#img-product-main").prop("src", prod.imageUrl);
        $("#text-desc").html(prod.description);
        $("#btn-add-wishlist").addClass("hidden");
        $("#btn-delete-wishlist").removeClass("hidden");

        if (prod.productUrl) {
          $("#wrapper-main-image").removeClass("pointer-events-none");
          $("#text-product-price").attr("readonly", false);
        } else {
          $("#wrapper-main-image").addClass("pointer-events-none");
          $("#text-product-price").attr("readonly", true);
        }

        drawerGiftDetails.show();
      }
    });

    $(".just-created .btn-favorite").on("click", function () {});

    $(".just-created").removeClass(".just-created");
  };

  const loadWishlist = async (showSpinner = false) => {
    const container = $("#container-wishlists");

    if (showSpinner) {
      $("#container-wishlists .card-product").remove();
      $("#no-gifts").addClass("hidden");
      $("#no-gifts").removeClass("flex");
      container.append(spinner.spin().el);
      container.addClass("min-h-[600px]");
    }

    const wishlists = await fangiftService.get("/wishlist", {
      params: {
        userId: window.gUserInfo["cognito:username"],
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

  $(".btn-copy-wishlist-link").on("click", function () {
    window.navigator.clipboard.writeText(
      `${window.location.host}/${window.gUserInfo?.name}`
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
      $("#btn-delete-wishlist").addClass("hidden");
      $("#btn-add-wishlist").removeClass("hidden");
    }
  });

  $("#btn-product-link").on("click", function () {
    state.giftSource = "product";
    $("#btn-delete-wishlist").addClass("hidden");
    $("#btn-add-wishlist").removeClass("hidden");
    drawerGiftProduct.show();
  });

  $("#btn-delete-wishlist").on("click", function () {
    state.deleteId = state.editWishlist.id;
    drawerGiftDetails.hide();
    confirmModal.show();
  });

  $("#wrapper-suggest-image").on("click", function (e) {
    $("#file-suggest-image").trigger("click");
  });

  $("#btn-close-modal-delete").on("click", function () {
    confirmModal.hide();
  });

  $("#file-suggest-image").on("change", function (e) {
    state.imageFile = e.target.files[0];
    if (state.imageFile) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $("#img-suggest").attr("src", e.target.result);
      };
      reader.readAsDataURL(state.imageFile);
    }
  });

  $("#btn-next-product").on("click", async function () {
    state.url = $("#text-product-link").val();

    if (!state.url) {
      toastr.error("Please enter a valid product url.");
      return;
    }

    $(this).loading(true);

    try {
      await fangiftService.post("/wishlist/suggest", {
        productUrl: state.url,
      });
      drawerGiftProduct.hide();
      drawerSuggestGift.show();
      $("#text-product-link").val("");
    } catch (err) {
      toastr.warning("Please enter valid product URL!");
    }

    $(this).loading(false);
  });

  $("#btn-suggest-close").on("click", function () {
    drawerSuggestGift.hide();
  });
  $("#btn-suggest-another").on("click", function () {
    drawerGiftProduct.show();
    drawerSuggestGift.hide();
  });

  $("#btn-add-wishlist").on("click", async function () {
    if (!state.title.trim()) {
      toastr.warning("Invalid product title, it is required Field.");
      return;
    }

    $(this).loading(true);

    try {
      const formData = new FormData();
      formData.append("userId", window.gUserInfo["cognito:username"]);
      formData.append("title", state.title);
      formData.append("price", state.price);
      formData.append("imageUrl", state.mainImage);
      formData.append("description", state.description);
      formData.append("productUpdatedAt", state.productUpdatedAt);

      if (state.productId && state.variantId) {
        formData.append("productId", state.productId);
        formData.append("variantId", state.variantId);
      } else if (state.url) {
        formData.append("productUrl", state.url);
        formData.append("imageFile", state.imageFile);
      }

      await fangiftService.post("/wishlist", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      loadWishlist(true);
      drawerGiftDetails.hide();
    } catch (err) {
      toastr.error(err.response.data.message);
    }

    state.productId = "";
    state.variantId = "";
    state.url = "";

    $(this).loading(false);
  });

  $("#btn-suggest-gift").on("click", async function () {
    const title = $("#text-suggest-title").val();
    const price = $("#text-suggest-price").val();
    const desc = $("#text-suggest-desc").val();

    if (!title.trim()) {
      toastr.warning("Invalid product title, it is required Field.");
      return;
    }

    $(this).loading(true);

    try {
      const formData = new FormData();
      formData.append("userId", window.gUserInfo["cognito:username"]);
      formData.append("title", title);
      formData.append("price", price);
      formData.append("imageUrl", state.mainImage);
      formData.append("description", desc);
      formData.append("productUrl", state.url);
      formData.append("imageFile", state.imageFile);

      await fangiftService.post("/wishlist", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      loadWishlist(true);
      drawerSuggestGift.hide();
    } catch (err) {
      toastr.error(err.response.data.message);
    }

    state.url = "";

    $(this).loading(false);
  });

  $("#btn-update-wishlist").on("click", async function () {
    state.title = $("#text-product-title").val();
    state.price = $("#text-product-price").val();
    state.description = $("#text-desc").val();

    $(this).loading(true);

    try {
      const form = new FormData();
      form.append("id", state.editWishlist.id);
      form.append("title", state.title);
      form.append("price", state.price);
      form.append("description", state.description);
      form.append("imageUrl", state.editWishlist.imageUrl);
      form.append("imageFile", state.imageFile);

      if (isUrl(state.editWishlist.productUrl)) {
        form.append("productUrl", state.editWishlist.productUrl);
      } else {
        form.append("productUrl", "");
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

  $("#btn-share").on("click", function () {
    const shareData = {
      title: "Checkout my FanGift wishlist",
      text: "Check out this awesome website!",
      url: ` https://fangift.com/${gUserInfo.name}`,
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
        encodeURIComponent(shareData.url);
    }
  });

  $("#carousel-products").slick({
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 5,
    slidesToScroll: 5,
    autoplay: true,
    autoplaySpeed: 4000,
    variableWidth: true,
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 5,
        },
      },
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
        },
      },
    ],
  });

  const loadProducts = async () => {
    const { products } = await fangiftService.get("/shop/product", {
      params: { first: 15 },
    });
    products.forEach((prod) => {
      $("#carousel-products").slick(
        "slickAdd",
        `<div class="w-[200px] rounded-[16px] mx-2 border border-gray-100">${templateCardProduct(
          prod
        )}</div>`
      );
    });

    $(".just-created .btn-add-product").on("click", async function () {
      const productId = $(this).data("product");
      const product = products.find((p) => p.id === productId);

      if (product) {
        state.productId = productId;
        state.variantId = product.variants[0].id;
        state.mainImage = product.featuredImage.url;
        state.description = product.descriptionHtml;
        state.productUpdatedAt = new Date(product.updatedAt).getTime();
        state.title = product.title;
        state.price = product.priceRangeV2.minVariantPrice.amount;
        $("#text-product-title").text(product.title);
        $("#text-product-price").text(`$${state.price}`);
        $("#img-product-main").prop("src", product.featuredImage.url);
        $("#text-desc").html(state.description);

        drawerGiftDetails.show();
      }
    });

    $(".just-created").removeClass("just-created");
  };
  loadProducts();
});
