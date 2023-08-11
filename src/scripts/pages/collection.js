import fangiftService from "../services/fangiftService";
import templateCardProduct from "../templates/card.product";
import spinner from "../utils/snip";

$(async function () {
  let after = null;
  let loading = true;

  const container = $("#container-products");
  container.append(spinner.el);

  initWidgets();

  // first loading of products
  after = await loadProduct();
  spinner.stop();
  loading = false;

  $("#btn-load-more").on("click", async function () {
    if (loading) return;

    $(this).find("svg").show();
    $(this).find("span").hide();
    loading = true;

    after = await loadProduct(after);

    $(this).find("svg").hide();
    $(this).find("span").show();
    loading = false;

    if (after === null) {
      $(this).prop("disabled", true);
    }
  });
});

function initWidgets() {
  initAccordin();
  initSlider();
}

async function loadProduct(after, first = 12) {
  const { products, pageInfo } = await fangiftService.get("/products", {
    params: { after, first },
  });
  const cursor = pageInfo.hasNextPage ? pageInfo.endCursor : null;
  products.forEach((prod) =>
    $("#container-products").append(templateCardProduct(prod))
  );
  return cursor;
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

  $(".btn-filter-toggle").first().trigger("click");
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
  });

  const val0 = $("#slider-range").slider("values", 0);
  const val1 = $("#slider-range").slider("values", 1);
  $("#amount").html(`$${val0} - $${val1}`);
}
