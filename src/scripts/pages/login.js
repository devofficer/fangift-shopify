import $ from "jquery";
import fangiftService from "../services/fangiftService";
import toastr from "toastr";

toastr.options.positionClass = "toast-bottom-center";

$(function () {
  $("#form-login").on("submit", function (e) {
    e.preventDefault();

    $("#btn-login").prop("disabled", true);

    const data = {
      name: $("#txt-email").val(),
      password: $("#txt-password").val(),
    };

    fangiftService
      .post("auth/login", data)
      .then((res) => {
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        location.href = "/collections/all";
      })
      .catch((err) => {
        toastr.error(err.response.data.message);
        $("#btn-login").prop("disabled", false);
      });
  });
});
