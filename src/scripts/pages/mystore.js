// import templateCardMyStoreProduct from "../templates/card-mystore-product";

import {
  getMyStoreDetails,
  updateMyStoreDetails,
} from "../services/mystoreService";

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
    bodyScrolling: false,
    edge: false,
    edgeOffset: "",
    backdropClasses:
      "bg-primary-black/30 [backdrop-filter:blur(4px)] fixed inset-0 z-30",
  };

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
        class="hidden peer"
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
      const details = await getMyStoreDetails(gUserInfo.sub);
      $("#input-store-name").val(details.storeName);
      $("#input-full-name").val(details.FullName);
      $("#input-email").val(details.email);
      $("#input-phone").val(details.contactNumber);

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
      FullName: $("#input-full-name").val(),
      email: $("#input-email").val(),
      contactNumber: $("#input-phone").val(),
    };
    $(this).loading(true);
    try {
      await updateMyStoreDetails(window.gUserInfo.sub, details);
      drawerStoreDetails.hide();
      drawerCategories.show();
    } catch (err) {
      console.log(err);
    }
    $(this).loading(false);
  });
  $("#btn-next-categories").on("click", function () {
    drawerCategories.hide();
    drawerProduct.show();
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
