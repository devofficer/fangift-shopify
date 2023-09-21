import axios from "axios";
import fangiftService from "../services/fangiftService";
import templateCardProduct from "../templates/card.product";
import templateCategory from "../templates/category";
import spinner from "../utils/snip";
import { convertLabelToId } from "../utils/string";
import { getUserInfo } from "../utils/userinfo";
import { ITEMS_PER_PAGE } from "../utils/constants";

const params = {
  after: null,
  priceMin: 0,
  priceMax: Infinity,
  categories: [],
  cancelToken: null,
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

  $("#btn-add-wishlist").on("click", function () {});
}

async function loadCategories() {
  const container = $("#container-categories");
  const cats = await fangiftService.get("/shop/product/types");

  params.categories = cats.map((cat) => ({
    id: convertLabelToId(cat),
    label: cat,
    checked: true,
  }));

  params.categories.forEach((cat) => container.append(templateCategory(cat)));

  $(".checkbox-category").on("change", function (e) {
    params.categories = params.categories.map((cat) =>
      cat.id === e.target.name
        ? {
            ...cat,
            checked: e.target.checked,
          }
        : cat
    );
    loadProduct(true);
  });

  $(".btn-filter-toggle").first().trigger("click");
}

async function loadProduct(clear = false) {
  $("#btn-load-more").prop("disabled", true);
  const container = $("#container-products");

  if (params.cancelToken) {
    params.cancelToken.cancel();
  }

  if (clear) {
    params.after = null;
    container.empty();
    container.append(spinner.spin().el);
    container.addClass("min-h-[600px]");
  }
  const cats = params.categories.filter((cat) => cat.checked);
  const query = `variants.price:>=${params.priceMin} AND variants.price:<=${
    params.priceMax
  } ${
    cats.length
      ? `AND (${cats.map((cat) => `(product_type:${cat.label})`).join(" OR ")})`
      : ""
  }`;

  // create cancellation token
  params.cancelToken = axios.CancelToken.source();

  // fetch products
  const { products, pageInfo } = await fangiftService.get("/shop/product", {
    params: { after: params.after, first: ITEMS_PER_PAGE, query },
    cancelToken: params.cancelToken.token,
  });

  params.after = pageInfo.hasNextPage ? pageInfo.endCursor : null;
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

  $(".just-created .btn-select-product").on("click", async function () {
    const productId = $(this).data("product-id");
    const product = products.find((p) => p.id === productId);

    if (product) {
      $("#text-product-title").val(product.title);
      $("#text-product-price").val(product.priceRangeV2.minVariantPrice.amount);
      $("#img-product-main").prop("src", product.featuredImage.url);
      $("#text-shipping-price").val(product.metafields.shipping_price?.value);
      $("#checkbox-digital-good").prop(
        "checked",
        product.metafields.digital_good?.value
      );

      addWishlistDrawer.show();
    }
  });

  spinner.stop();
  params.cancelToken = null;
  $(".just-created").removeClass("just-created");
  $("#btn-load-more").prop("disabled", !pageInfo.hasNextPage);

  return pageInfo.hasNextPage;
}

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
      params.priceMin = ui.values[0];
      params.priceMax = ui.values[1];
      loadProduct(true);
    },
  });

  const val0 = $("#slider-range").slider("values", 0);
  const val1 = $("#slider-range").slider("values", 1);
  params.priceMin = val0;
  params.priceMax = val1;
  $("#amount").html(`$${val0} - $${val1}`);
}
