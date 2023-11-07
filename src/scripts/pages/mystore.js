import templateCardMyStoreProduct from "../templates/card-mystore-product";

import {
  createMyStoreProduct,
  deleteMyStoreProduct,
  getMyStoreCategories,
  getMyStoreDetails,
  getMyStoreProducts,
  updateCategories,
  updateMyStoreDetails,
  updateMyStoreProduct,
} from "../services/mystoreService";

import toastr from "toastr";

toastr.options.positionClass = "toast-bottom-center bottom-10";

const categories = [
  "shoes",
  "jewelry",
  "electronics",
  "clothing",
  "fitness_apparel",
  "beauty_perfume",
  "lingerie",
  "handbags",
  "home_products",
  "adult_toys",
];

$(function () {
  const drawerOptions = {
    placement: window.innerWidth > 600 ? "right" : "bottom",
    backdrop: true,
    backdropClasses:
      "bg-primary-black/30 [backdrop-filter:blur(4px)] fixed inset-0 z-30",
  };
  const state = {
    productPhoto: "",
  };
  const userId = window.gUserInfo.sub;
  const uploadWidget = cloudinary.createUploadWidget(
    {
      cloudName: "dk8krvgwg",
      uploadPreset: "gjzdxeij",
      folder: "mystore-products",
    },
    (error, result) => {
      if (!error && result && result.event === "success") {
        state.productPhoto = result.info.url;
        $("#img-mystore-product").prop("src", result.info.url);
        uploadWidget.close();
      }
    }
  );
  const modalDeleteProduct = new Modal(
    document.getElementById("modal-delete-mystore-product")
  );

  const drawerStoreDetails = new Drawer(
    document.getElementById("drawer-store-details"),
    drawerOptions
  );
  const drawerCategories = new Drawer(
    document.getElementById("drawer-categories"),
    drawerOptions
  );
  const drawerProduct = new Drawer(
    document.getElementById("drawer-product"),
    drawerOptions
  );

  categories.forEach((cat) =>
    $("#categories").append(`
    <li class="flex">
      <input
        type="checkbox"
        id="cat-${cat}"
        name="cat"
        value="${cat}"
        class="hidden peer checkbox-category"
        required>
      <label for="cat-${cat}" class="p-6 cursor-pointer select-none text-body-sm bg-primary-border rounded-[100px] peer-checked:bg-accent-purple peer-checked:text-white capitalize">
        ${cat.replace("_", " ")}
      </label>
    </li>
  `)
  );

  $("#btn-create-store").on("click", async function () {
    $(this).loading(true);
    try {
      const details = await getMyStoreDetails(userId);
      $("#input-store-name").val(details.store_name);
      $("#input-full-name").val(details.full_name);
      $("#input-email").val(details.email_address);
      $("#input-phone").val(details.contact_number);

      drawerStoreDetails.show();
    } catch (err) {
      console.log(err);
    }
    $(this).loading(false);
  });
  $("#btn-next-store-details").on("click", async function (e) {
    const details = {
      country: window.gUserInfo.country,
      storeName: $("#input-store-name").val(),
      fullName: $("#input-full-name").val(),
      email: $("#input-email").val(),
      contactNumber: $("#input-phone").val(),
    };
    $(this).loading(true);
    try {
      await updateMyStoreDetails(userId, details);
      const categories = await getMyStoreCategories(userId);

      if (categories) {
        Object.entries(categories).forEach(([cat, val]) => {
          $(`#cat-${cat}`).attr("checked", val);
        });
      }

      drawerStoreDetails.hide();
      drawerCategories.show();
    } catch (err) {
      console.log(err);
    }
    $(this).loading(false);
  });

  function loadProducthandlers() {
    $("#mystore-products .just-created .btn-mystore-product-delete").on(
      "click",
      function () {
        state.deleteProductId = $(this).data("mystore-product");
        modalDeleteProduct.show();
      }
    );

    $("#mystore-products .just-created .btn-mystore-product-edit").on(
      "click",
      function () {
        state.editProductId = $(this).data("mystore-product");
        const prod = state.products.find(
          (p) => p.product_id === state.editProductId
        );
        state.productPhoto = prod.product_photo;
        $("#btn-cancel-product").removeClass("hidden");
        $(
          `#mystore-products .card-product:not(#card-mystore-product-${state.editProductId})`
        ).addClass("blur-sm pointer-events-none");
        $("#input-product-title").val(prod.product_title);
        $("#input-product-desc").val(prod.product_description);
        $("#input-product-price").val(prod.product_price);
        $("#img-mystore-product").prop(
          "src",
          prod.product_photo ?? $("#img-mystore-product").data("placeholder")
        );
        $("#wrapper-btns").removeClass("grid-cols-1").addClass("grid-cols-2");
        $("#btn-add-product").text("Save");
        $("#drawer-product").animate({ scrollTop: 0 }, "slow");
      }
    );

    $("#mystore-products .just-created").removeClass("just-created");
  }

  $("#btn-next-categories").on("click", async function () {
    $(this).loading(true);

    try {
      const categories = Array.from($(".checkbox-category")).reduce(
        (acc, cat) => ({
          ...acc,
          [$(cat).val()]: $(cat).is(":checked"),
        }),
        {}
      );
      await updateCategories(userId, categories);
      state.products = await getMyStoreProducts(userId);

      $("#mystore-products").empty();
      state.products.forEach((prod) =>
        $("#mystore-products").append(templateCardMyStoreProduct(prod))
      );

      loadProducthandlers();

      drawerCategories.hide();
      drawerProduct.show();
    } catch (err) {
      console.log(err);
    }

    $(this).loading(false);
  });

  $("#img-mystore-product").on("click", function () {
    uploadWidget.open();
  });

  $("#btn-add-product").on("click", async function () {
    $(this).loading(true);
    const title = $("#input-product-title").val();
    const desc = $("#input-product-desc").val();
    const price = $("#input-product-price").val();

    if (!state.productPhoto) {
      toastr.error("Product photo can't not be empty");
      $(this).loading(false);
      return;
    }

    if (!title) {
      toastr.error("Product title can't not be empty");
      $(this).loading(false);
      return;
    }

    if (!desc) {
      toastr.error("Product description can't not be empty");
      $(this).loading(false);
      return;
    }

    if (!price) {
      toastr.error("Product price can't not be empty");
      $(this).loading(false);
      return;
    }

    try {
      if (state.editProductId) {
        const data = await updateMyStoreProduct(userId, {
          productId: state.editProductId,
          productTitle: title,
          productDescription: desc,
          productPrice: price,
          productPhoto: state.productPhoto,
        });
        $(`#card-mystore-product-${data.product_id} #title`).text(
          data.product_title
        );
        $(`#card-mystore-product-${data.product_id} #price`).text(
          data.product_price
        );
        $(`#card-mystore-product-${data.product_id} #photo`).prop(
          "src",
          data.product_photo
        );
        state.products = state.products.map((p) =>
          p.product_id === data.product_id ? data : p
        );
      } else {
        const data = await createMyStoreProduct(userId, {
          productTitle: title,
          productDescription: desc,
          productPrice: price,
          productPhoto: state.productPhoto,
        });
        state.products = [...state.products, data];
        $("#mystore-products").append(templateCardMyStoreProduct(data));

        loadProducthandlers();
      }

      // reset form
      $("#input-product-title").val("");
      $("#input-product-desc").val("");
      $("#input-product-price").val("");
      $("#img-mystore-product").prop(
        "src",
        $("#img-mystore-product").data("placeholder")
      );
    } catch (err) {
      console.log(err);
    }

    $(this).loading(false);

    if (state.editProductId) {
      state.editProductId = null;
      $(this).text("Add");
      $(
        `#mystore-products .card-product:not(#card-mystore-product-${state.editProductId})`
      ).removeClass("blur-sm pointer-events-none");
      $("#wrapper-btns").removeClass("grid-cols-2").addClass("grid-cols-1");
      $("#btn-cancel-product").addClass("hidden");
    }
  });

  $("#btn-cancel-product").on("click", function () {
    state.editProductId = null;
    $("#input-product-title").val("");
    $("#input-product-desc").val("");
    $("#input-product-price").val("");
    $("#img-mystore-product").prop(
      "src",
      $("#img-mystore-product").data("placeholder")
    );
    $(
      `#mystore-products .card-product:not(#card-mystore-product-${state.editProductId})`
    ).removeClass("blur-sm pointer-events-none");
    $("#wrapper-btns").removeClass("grid-cols-2").addClass("grid-cols-1");
    $("#btn-add-product").text("Add");
    $(this).addClass("hidden");
  });

  $(".btn-sure-modal-delete-mystore-product").on("click", async function () {
    if (!state.deleteProductId) {
      return;
    }

    $(this).loading(true, { size: "w-4 h-4" });
    try {
      await deleteMyStoreProduct(userId, state.deleteProductId);
      state.products = state.products.filter(
        (p) => p.product_id !== state.deleteProductId
      );
      state.deleteProductId = null;

      if (state.editProductId) {
        state.editProductId = null;
        $(
          `#mystore-products .card-product:not(#card-mystore-product-${state.editProductId})`
        ).removeClass("blur-sm pointer-events-none");
        $("#btn-add-product").text("Add");
        $("#btn-cancel-product").addClass("hidden");
        $("#wrapper-btns").removeClass("grid-cols-2").addClass("grid-cols-1");
      }
      $(`#card-mystore-product-${state.deleteProductId}`).remove();
    } catch (err) {
      console.log(err);
    }
    $(this).loading(false);
    modalDeleteProduct.hide();
  });

  $(
    ".btn-cancel-modal-delete-mystore-product, #btn-close-modal-delete-mystore-product"
  ).on("click", function () {
    modalDeleteProduct.hide();
  });

  $("#btn-close-store-details").on("click", function () {
    drawerStoreDetails.hide();
  });
  $("#btn-close-categories").on("click", function () {
    drawerCategories.hide();
  });
  $("#btn-close-product").on("click", function () {
    drawerProduct.hide();
  });

  $("#btn-back-categories").on("click", function (e) {
    drawerCategories.hide();
    drawerStoreDetails.show();
  });
  $("#btn-back-product").on("click", function (e) {
    drawerProduct.hide();
    drawerCategories.show();
  });
});
