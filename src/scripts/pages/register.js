import $ from "jquery";
import select2 from "select2";
import fangiftService from "../services/fangiftService";
import restcountriesService from "../services/restcountriesService";
import initAvatar from "../components/avatar";
import toastr from "toastr";

toastr.options.positionClass = "toast-bottom-center";

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

  $("#form-details").on("submit", function (e) {
    e.preventDefault();
    $("#btn-register").prop("disabled", true);

    const data = {
      username,
      type: role,
      name: email,
      password,
    };

    fangiftService
      .post("auth/register", data)
      .then(() => {
        $(this).hide();
        $("#form-email").show();
      })
      .catch((err) => {
        toastr.error(err.response.data.message);
        $("#btn-register").prop("disabled", false);
      });
  });

  $("#form-about").on("submit", function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", email);
    formData.append("password", password);
    formData.append("country", country);
    formData.append("avatar", avatarImg);
    formData.append("publicName", publicName);
    formData.append("bio", bio);

    $("btn-about").prop("disabled", true);

    fangiftService
      .post("auth/profile", formData, {
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
        $("btn-about").prop("disabled", false);
      });
  });

  restcountriesService.get("all?fields=name,flags").then((data) => {
    $("#select-country").select2({
      width: "100%",
      data: data.map((item) => ({
        id: item.name.official,
        text: item.name.common,
        flag: item.flags.png,
      })),
      templateResult: (state) => {
        if (!state.flag) {
          return state.text;
        }
        const $state = $(
          `<div class="flex items-center gap-2">
            <img src="${state.flag}" class="w-[32px]" />
            <span>${state.text}</span>
          </div>`
        );
        return $state;
      },
    });

    $("#select-country").on("select2:select", function (e) {
      country = e.params.data;
    });

    country = $("#select-country").select2("data");
  });

  // handle submit of role selection form
  $("#form-role").on("submit", function (e) {
    e.preventDefault();
    role = $("input[name=role]:checked").val();

    $(this).hide();
    $(`#form-${role}`).show();
  });

  // handle submit of fan form
  $("#form-fan").on("submit", function (e) {
    e.preventDefault();
    $("#btn-next-fan").prop("disabled", true);

    fangiftService
      .get(`auth/check-unique/${username}`)
      .then(() => {
        $(this).hide();
        $("#form-details").show();
      })
      .catch((err) => {
        toastr.error(err.response.data.message);
        $("#btn-next-fan").prop("disabled", false);
      });
  });

  // handle submit of creator form
  $("#form-creator").on("submit", function (e) {
    e.preventDefault();
    $("#btn-next-creator").prop("disabled", true);

    fangiftService
      .get(`auth/check-unique/${username}`)
      .then(() => {
        $(this).hide();
        $("#form-details").show();
      })
      .catch((err) => {
        toastr.error(err.response.data.message);
        $("#btn-next-creator").prop("disabled", false);
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

      const text = $(this).val();
      let disabled = false;

      if (text) {
        if (text === "@") {
          disabled = true;
        } else if (text.startsWith("@")) {
          username = text.slice(1);
        } else {
          username = text;
        }
      } else {
        disabled = true;
      }

      if (disabled) {
        $(this).val("");
        $(btn).prop("disabled", true);
      } else {
        $(this).val(`@${username}`);
        $(btn).prop("disabled", false);
        $("#lbl-username").html(username);
      }
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
    const ability =
      password === passwordConfirmed && /^[\w.-]+@[\w.-]+\.\w+$/.test(email);
    $("#btn-register").prop("disabled", !ability);
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
