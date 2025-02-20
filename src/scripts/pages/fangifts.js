import axios from "axios";
import { Modal } from "flowbite";
import select2 from "select2";
import toastr from "toastr";
import fangiftService from "../services/fangiftService";
import templateCardProduct from "../templates/card.product";
import spinner from "../utils/snip";
import myStoreService from "../services/mystoreService";

select2(window, $);

/*
 * $targetEl: required
 * options: optional
 */
toastr.options.positionClass = "toast-bottom-center bottom-10";

const modalAddSuccess = new Modal(document.getElementById("popup-add-success"));

const state = {
  page: null,
  priceMin: 0,
  priceMax: Infinity,
  categories: [],
  cancelToken: null,
  products: [],
  imageFile: null,
  addProductId: null,
  search: "",
  timestamp: null,
  featured: true,
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

  $("#input-search").on("input", function (e) {
    state.search = $(this).val();
  });

  $("#input-search").on("keydown", function (e) {
    if (e.key === "Enter") {
      loadProduct(true);
    }
  });

  $("#btn-search-fangifts").on("click", function () {
    loadProduct(true);
  });

  $(".btn-add-wishlist").on("click", async function () {
    $(this).loading(true);

    const product = state.products.find(
      (p) => p.productId === state.addProductId
    );
    const title = product.title;
    const price = product.price;
    const imageUrl = $("#img-product-main").prop("src");
    const description = product.description;

    try {
      const formData = new FormData();
      formData.append("userId", window.gUserInfo["cognito:username"]);
      formData.append("title", title);
      formData.append("price", price);
      formData.append("productId", product.productId);
      formData.append("variantId", product.variantId);
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
});

function initWidgets() {
  initAccordin();

  $("#btn-load-more").on("click", loadMore);
  $(window).on("scroll", function () {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      if (!$("#btn-load-more").prop("disabled")) {
        $("#btn-load-more").trigger("click");
      }
    }
  });

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
    state.search = "";
    $("#input-search").val("");
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
    state.page = 1;
    container.empty();
    container.append(spinner.spin().el);
    container.addClass("min-h-[600px]");
  }

  // create cancellation token
  state.cancelToken = axios.CancelToken.source();

  try {
    // fetch products
    const { results: products, totalPages } = await myStoreService.get(
      state.search ? "/products/search" : "/products",
      {
        params: {
          country: window.gUserInfo.country,
          category: state.category,
          page: state.page,
          text: state.search,
        },
        cancelToken: state.cancelToken.token,
      }
    );
    state.timestamp = new Date().getTime();
    state.products = [...state.products, ...products];
    state.page = state.page > totalPages ? totalPages : state.page + 1;

    container.removeClass("min-h-[600px]");
    // add products to container
    products.forEach((prod) =>
      container.append(
        templateCardProduct({
          ...prod,
          price: Number(prod.price).toFixed(2),
        })
      )
    );

    $(".just-created .btn-add-product").on("click", async function () {
      const productId = $(this).data("product").toString();
      const product = state.products.find((p) => p.productId === productId);
      state.addProductId = productId;

      if (product) {
        $("#text-product-title").text(product.title);
        $("#text-product-price").text(`$${product.price}`);
        $("#img-product-main").prop("src", product.imageUrl);
        $("#text-desc").html(product.description);
        addWishlistDrawer.show();
      }
    });

    spinner.stop();
    state.cancelToken = null;
    $(".just-created").removeClass("just-created");
    $("#btn-load-more").prop("disabled", state.page > totalPages);

    return state.page <= totalPages;
  } catch (err) {
    toastr.error(err.message);
  }
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
