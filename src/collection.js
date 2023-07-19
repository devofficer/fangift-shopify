$(function () {
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
});
