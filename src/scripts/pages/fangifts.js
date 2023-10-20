import axios from "axios";
import { Modal } from "flowbite";
import select2 from "select2";
import toastr from "toastr";
import fangiftService from "../services/fangiftService";
import templateCardProduct from "../templates/card.product";
import { ITEMS_PER_PAGE } from "../utils/constants";
import spinner from "../utils/snip";

select2(window, $);

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
    placement: window.innerWidth > 600 ? "right" : "bottom",
    backdrop: true,
    bodyScrolling: false,
    edge: false,
    edgeOffset: "",
    backdropClasses:
      "bg-primary-black/30 [backdrop-filter:blur(4px)] fixed inset-0 z-30",
    onHide() {
      $("#text-product-title").text("");
      $("#text-product-price").text("");
      $("#text-desc").text("");
      $("#img-product-main").prop("src", "");
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
  // initSlider();

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
  const cats = await fangiftService.get("/shop/product/types");

  $("#select-category").select2({
    width: "100%",
    data: [
      { id: "", text: "All categories" },
      ...cats
        .filter((type) => !!type)
        .map((type) => ({
          id: type,
          text: type,
        })),
    ],
    templateResult: (state) => {
      const $state = $(
        `<div class="flex items-center gap-2">
            <span>${state.text}</span>
        </div>`
      );
      return $state;
    },
  });

  $("#select-category").on("select2:select", function (e) {
    state.category = e.params.data.id;
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
  const query = state.category ? `product_type:'${state.category}'` : "";

  // create cancellation token
  state.cancelToken = axios.CancelToken.source();

  try {
    // fetch products
    const { products, pageInfo } = await fangiftService.get("/shop/product", {
      params: { after: state.after, first: ITEMS_PER_PAGE, query },
      cancelToken: state.cancelToken.token,
    });
    state.products = [...state.products, ...products];
    state.after = pageInfo.hasNextPage ? pageInfo.endCursor : null;
    container.removeClass("min-h-[600px]");
    // add products to container
    products.forEach((prod) => container.append(templateCardProduct(prod)));

    $(".just-created .btn-add-product").on("click", async function () {
      const productId = $(this).data("product");
      const product = products.find((p) => p.id === productId);
      state.addProductId = productId;

      if (product) {
        $("#text-product-title").text(product.title);
        $("#text-product-price").text(
          `$${product.priceRangeV2.minVariantPrice.amount}`
        );
        $("#img-product-main").prop("src", product.featuredImage.url);
        $("#text-desc").html(product.descriptionHtml);
        addWishlistDrawer.show();
      }
    });

    spinner.stop();
    state.cancelToken = null;
    $(".just-created").removeClass("just-created");
    $("#btn-load-more").prop("disabled", !pageInfo.hasNextPage);

    return pageInfo.hasNextPage;
  } catch (err) {
    // toastr.error(err.message);
  }
}

$("#btn-add-wishlist").on("click", async function () {
  $(this).loading(true);

  const product = state.products.find((p) => p.id === state.addProductId);
  const title = product.title;
  const price = product.priceRangeV2.minVariantPrice.amount;
  const imageUrl = $("#img-product-main").prop("src");
  const description = product.descriptionHtml;

  try {
    const formData = new FormData();
    formData.append("userId", window.gUserInfo["cognito:username"]);
    formData.append("title", title);
    formData.append("price", price);
    formData.append("productId", product.id);
    formData.append("variantId", product.variants[0].id);
    formData.append("description", description);

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
