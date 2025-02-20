import select2 from "select2";
import toastr from "toastr";
import initAvatar from "../components/avatar";
import fangiftService from "../services/fangiftService";
import { countries } from "country-flags-svg";
import { isEmail, isValidUsername } from "../utils/string";

toastr.options.positionClass = "toast-bottom-center bottom-10";

select2(window, $);

$(function () {
  let username = "";
  let role = "";
  let email = "";
  let password = "";
  let passwordConfirmed = "";
  let country;
  let avatarImg;
  let publicName;
  let bio;

  initAvatar((file) => {
    avatarImg = file;
  });

  $(".password").password();
  $("#form-details").on("submit", function (e) {
    e.preventDefault();

    if (password.length < 6) {
      toastr.warning("Password should be at least 6 characters");
      return;
    }

    $("#btn-register").loading(true);

    fangiftService
      .get(`auth/check-email/${email}`)
      .then(() => {
        $("#btn-register").loading(false);
        $(this).hide();
        $("#form-country").show();
      })
      .catch((err) => {
        toastr.error(err.response.data.message);
        $("#btn-register").loading(false);
      });
  });

  $("#form-about").on("submit", function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", email);
    formData.append("username", username);
    formData.append("type", role);
    formData.append("password", password);
    formData.append("country", country[0].id);
    formData.append("avatar", avatarImg);
    formData.append("publicName", publicName);
    formData.append("bio", bio || "");

    $("#btn-about").loading(true);

    fangiftService
      .post("auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        $(this).hide();
        $("#form-email").show();
      })
      .catch((err) => {
        toastr.error(err.response.data.message);
        $("#btn-about").loading(false);
      });
  });

  $("#btn-resend").on("click", async function (e) {
    $(this).prop("disabled", true);

    try {
      await fangiftService.get("/auth/resend-code", { params: { email } });
      toastr.info("Re-sent verification email!");
    } catch (err) {
      toastr.error(err.response.data.message);
    }

    $(this).prop("disabled", false);
  });

  $("#select-country").select2({
    width: "100%",
    data: [
      { id: "", text: "Select Country of Residence", flag: "" },
      ...countries
        .map((item) => ({
          id: item.iso2,
          text: item.name,
          flag: item.flag,
        }))
        .sort((a, b) => (a.text > b.text ? 1 : -1)),
    ],
    templateResult: (state) => {
      if (!state.flag) {
        return state.text;
      }
      const $state = $(
        `<div class="flex items-center gap-2">
            ${state.flag ? `<img src="${state.flag}" class="w-[32px]" />` : ""}
            <span>${state.text}</span>
          </div>`
      );
      return $state;
    },
  });

  $("#select-country").on("select2:select", function (e) {
    country = e.params.data;
    $("#btn-next-country").prop("disabled", !country.id);
  });

  country = $("#select-country").select2("data");

  if (!country.id) {
    $("#btn-next-country").prop("disabled", true);
  }

  // handle submit of role selection form
  $("#form-role").on("submit", function (e) {
    e.preventDefault();
    role = $("input[name=role]:checked").val();

    $(this).hide();
    $(`#form-${role}`).show();
  });

  $(".label-role").on("click", function () {
    role = $(this).data("role");
    $("#form-role").hide();
    $(`#form-${role}`).show();
  });

  // handle submit of fan form
  $("#form-fan").on("submit", function (e) {
    e.preventDefault();
    $("#btn-next-fan").loading(true);

    fangiftService
      .get(`auth/check-username/${username}`)
      .then(() => {
        $("#btn-next-fan").prop("disabled", false);
        $(this).hide();
        $("#form-details").show();
      })
      .catch((err) => {
        toastr.error(err.response.data.message);
        $("#btn-next-fan").loading(false);
      });
  });

  // handle submit of creator form
  $("#form-creator").on("submit", function (e) {
    e.preventDefault();
    $("#btn-next-creator").loading(true);

    fangiftService
      .get(`auth/check-username/${username}`)
      .then(() => {
        $("#btn-next-creator").loading(false);
        $(this).hide();
        $("#form-details").show();
      })
      .catch((err) => {
        toastr.error(err.response.data.message);
        $("#btn-next-creator").loading(false);
      });
  });

  $("#form-country").on("submit", function (e) {
    e.preventDefault();
    country = $("#select-country").select2("data");
    $(this).hide();
    $("#form-about").show();
  });

  const handleChangeUsername = (btn) =>
    function (e) {
      e.preventDefault();

      username = $(this).val();
      const isValid = isValidUsername(username);
      $(btn).prop("disabled", !isValid);

      if (!isValid) {
        $(this).error(true);
      } else {
        $(this).error(false);
      }
      $("#lbl-username").text(username);
    };

  $("#username-creator").on("input", handleChangeUsername("#btn-next-creator"));
  $("#username-fan").on("input", handleChangeUsername("#btn-next-fan"));

  $("#btn-create-fan").on("click", function (e) {
    e.preventDefault();
    role = "fan";
    $("#form-creator").hide();
    $("#form-fan").show();
  });

  $("#btn-create-creator").on("click", function (e) {
    e.preventDefault();
    role = "creator";
    $("#form-fan").hide();
    $("#form-creator").show();
  });

  $("#btn-back-details").on("click", function () {
    $("#form-details").hide();
    $(`#form-${role}`).show();
  });

  $("#btn-back-country").on("click", function () {
    $("#form-country").hide();
    $("#form-details").show();
  });

  $("#btn-back-about").on("click", function () {
    $("#form-about").hide();
    $("#form-country").show();
  });

  $("#btn-back-email").on("click", function () {
    $("#form-email").hide();
    $("#form-about").show();
  });

  function validateBasicForm() {
    const isValid = password === passwordConfirmed && isEmail(email);
    $("#btn-register").prop("disabled", !isValid);
    $("#txt-confirm-password").error(password !== passwordConfirmed);
    $("#txt-email").error(!isEmail(email));
  }

  $("#txt-email").on("input", function () {
    email = $(this).val();
    validateBasicForm();
  });

  $("#txt-password").on("input", function () {
    password = $(this).val();
    validateBasicForm();
  });

  $("#txt-confirm-password").on("input", function () {
    passwordConfirmed = $(this).val();
    validateBasicForm();
  });

  function validateAboutForm() {
    $("#btn-about").prop("disabled", !publicName);
  }

  $("#txt-public-name").on("input", function () {
    publicName = $(this).val();
    validateAboutForm();
  });

  $("#txt-bio").on("input", function () {
    bio = $(this).val();
    validateAboutForm();
  });
});
