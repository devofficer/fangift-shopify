import axios from "axios";
import fangiftService from "../services/fangiftService";
import templateCardProduct from "../templates/card.product";
import templateCategory from "../templates/category";
import spinner from "../utils/snip";
import { Modal } from "flowbite";
import { convertLabelToId } from "../utils/string";
import { getUserInfo } from "../utils/userinfo";
import { ITEMS_PER_PAGE } from "../utils/constants";
import toastr from "toastr";

/*
 * $targetEl: required
 * options: optional
 */
toastr.options.positionClass = "toast-bottom-center bottom-10";

const modalAddSuccess = new Modal(document.getElementById("popup-add-success"));

const state = {
  after: null,
  priceMin: 0,
  priceMax: Infinity,
  categories: [],
  cancelToken: null,
  products: [],
  imageFile: null,
  addProductId: null,
};

const addWishlistDrawer = new Drawer(
  document.getElementById("drawer-add-wishlist"),
  {
    placement: "right",
    backdrop: true,
    bodyScrolling: false,
    edge: false,
    edgeOffset: "",
    backdropClasses:
      "bg-primary-black/30 [backdrop-filter:blur(4px)] fixed inset-0 z-30",
    onHide() {
      $("#text-product-title").val("");
      $("#text-product-price").val(0);
      $("#text-shipping-price").val("");
      $("#img-product-main").prop("src", "");
      $("#checkbox-digital-good").prop("checked", false);
    },
  }
);

$(async function () {
  initWidgets();
  loadProduct(true);
  loadCategories();
});

function initWidgets() {
  initAccordin();
  initSlider();

  $("#btn-load-more").on("click", loadMore);
  $(".btn-close-drawer").on("click", () => addWishlistDrawer.hide());
  $(".btn-close-add-success").on("click", () => modalAddSuccess.hide());

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
}

async function loadCategories() {
  const container = $("#container-categories");
  const cats = await fangiftService.get("/shop/product/types");

  state.categories = cats.map((cat) => ({
    id: convertLabelToId(cat),
    label: cat,
    checked: true,
  }));

  state.categories.forEach((cat) => container.append(templateCategory(cat)));

  $(".checkbox-category").on("change", function (e) {
    state.categories = state.categories.map((cat) =>
      cat.id === e.target.name
        ? {
            ...cat,
            checked: e.target.checked,
          }
        : cat
    );
    loadProduct(true);
  });
}

async function loadProduct(clear = false) {
  $("#btn-load-more").prop("disabled", true);
  const container = $("#container-products");

  if (state.cancelToken) {
    state.cancelToken.cancel();
  }

  if (clear) {
    state.after = null;
    container.empty();
    container.append(spinner.spin().el);
    container.addClass("min-h-[600px]");
  }
  const cats = state.categories.filter((cat) => cat.checked);
  const query = `vendor:fangift AND status:active AND variants.price:>=${
    state.priceMin
  } AND variants.price:<=${state.priceMax} ${
    cats.length
      ? `AND (${cats.map((cat) => `(product_type:${cat.label})`).join(" OR ")})`
      : ""
  }`;

  // create cancellation token
  state.cancelToken = axios.CancelToken.source();

  try {
    // fetch products
    const { products, pageInfo } = await fangiftService.get("/shop/product", {
      params: { after: state.after, first: ITEMS_PER_PAGE, query },
      cancelToken: state.cancelToken.token,
    });
    state.products = products;
    state.after = pageInfo.hasNextPage ? pageInfo.endCursor : null;
    container.removeClass("min-h-[600px]");
    // add products to container
    products.forEach((prod) => container.append(templateCardProduct(prod)));

    // attach favorite click handler
    $(".just-created .btn-favorite").on("click", async function () {
      const productId = $(this).data("product-id");
      const wishlistId = $(this).data("wishlist-id");
      const toggled = $(this).hasClass("toggled");

      if (toggled) {
        await fangiftService.delete(`/wishlist/${wishlistId}`, {
          productId,
          userId: getUserInfo().email,
        });
        $(this).removeClass("toggled");
      } else {
        const wishlist = await fangiftService.post("/wishlist", {
          productId,
          userId: getUserInfo().email,
        });
        $(this).addClass("toggled");
        $(this).data("wishlist-id", wishlist.id);
      }
    });

    $(".just-created .btn-add-product").on("click", async function () {
      const productId = $(this).data("product");
      const product = products.find((p) => p.id === productId);
      state.addProductId = productId;

      if (product) {
        $("#text-product-title").val(product.title);
        $("#text-product-price").val(
          product.priceRangeV2.minVariantPrice.amount
        );
        $("#img-product-main").prop("src", product.featuredImage.url);
        $("#text-shipping-price").val(0);
        $("#checkbox-digital-good").prop("checked", false);

        addWishlistDrawer.show();
      }
    });

    spinner.stop();
    state.cancelToken = null;
    $(".just-created").removeClass("just-created");
    $("#btn-load-more").prop("disabled", !pageInfo.hasNextPage);

    return pageInfo.hasNextPage;
  } catch (err) {
    toastr.error(err.message);
  }
}

$("#btn-add-wishlist").on("click", async function () {
  $(this).loading(true);

  const product = state.products.find((p) => p.id === state.addProductId);
  const title = $("#text-product-title").val();
  const price = $("#text-product-price").val();
  const imageUrl = $("#img-product-main").prop("src");
  const shippingPrice = $("#text-shipping-price").val();
  const digitalGood = $("#checkbox-digital-good").prop("checked");

  try {
    const formData = new FormData();
    formData.append("userId", gUserInfo["cognito:username"]);
    formData.append("title", title);
    formData.append("price", price);
    formData.append("digitalGood", digitalGood);
    formData.append("shippingPrice", shippingPrice);
    formData.append("productId", product.id);
    formData.append("variantId", product.variants[0].id);

    if (state.imageFile) {
      formData.append("imageFile", state.imageFile);
    } else {
      formData.append("imageUrl", imageUrl);
    }

    await fangiftService.post("/wishlist", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    addWishlistDrawer.hide();
    modalAddSuccess.show();
  } catch (err) {
    toastr.error(err.message);
  }

  $(this).loading(false);
});

async function loadMore() {
  $(this).loading(true);
  const hasNexPage = await loadProduct();
  $(this).loading(false, { keepDisabled: !hasNexPage });
}

function initAccordin() {
  $(".btn-filter-toggle").on("click", function () {
    if ($(this).hasClass("toggled")) {
      $(this).removeClass("toggled");
      $(this).closest(".filter-box").removeClass("toggled");
    } else {
      $(this).addClass("toggled");
      $(this).closest(".filter-box").addClass("toggled");
    }
  });
}

function initSlider() {
  $("#slider-range").slider({
    range: true,
    min: 0,
    max: 1000,
    values: [0, 800],
    slide: function (_event, ui) {
      $("#amount").html(`$${ui.values[0]} - $${ui.values[1]}`);
    },
    change: function (event, ui) {
      state.priceMin = ui.values[0];
      state.priceMax = ui.values[1];
      loadProduct(true);
    },
  });

  const val0 = $("#slider-range").slider("values", 0);
  const val1 = $("#slider-range").slider("values", 1);
  state.priceMin = val0;
  state.priceMax = val1;
  $("#amount").html(`$${val0} - $${val1}`);
}
