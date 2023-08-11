import fangiftService from "../services/fangiftService";
import templateCardProduct from "../templates/card.product";
import templateCategory from "../templates/category";
import spinner from "../utils/snip";
import { convertLabelToId } from "../utils/string";

const ITEMS_PER_PAGE = 12;

const params = {
  after: null,
  priceMin: 0,
  priceMax: Infinity,
  categories: [],
};

$(async function () {
  initWidgets();
  loadProduct(true);
  loadCategories();
});

function initWidgets() {
  initAccordin();
  initSlider();
  $("#btn-load-more").on("click", loadMore);
}

async function loadCategories() {
  const container = $("#container-categories");
  const cats = await fangiftService.get("/products/types");

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
  $("#container-categories").addClass("pointer-events-none");
  $("#btn-load-more").prop("disabled", true);

  if (clear) {
    params.after = null;
    $("#container-products").empty();
    $("#container-products").append(spinner.spin().el);
  }

  const { products, pageInfo } = await fangiftService.get("/products", {
    params: { after: params.after, first: ITEMS_PER_PAGE },
  });
  params.after = pageInfo.hasNextPage ? pageInfo.endCursor : null;
  products.forEach((prod) =>
    $("#container-products").append(templateCardProduct(prod))
  );
  spinner.stop();

  if (pageInfo.hasNextPage) {
    $("#btn-load-more").prop("disabled", false);
  }
  $("#container-categories").removeClass("pointer-events-none");
}

async function loadMore() {
  $(this).find("svg").show();
  $(this).find("span").hide();
  $(this).prop("disabled", true);

  await loadProduct();

  $(this).find("svg").hide();
  $(this).find("span").show();
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
    max: 500,
    values: [75, 300],
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
