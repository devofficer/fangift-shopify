import LINKS from "../constants/links";
import fangiftService from "../services/fangiftService";
import toastr from "toastr";

toastr.options.positionClass = "toast-bottom-center";

$(function () {
  $("#form-login").on("submit", function (e) {
    e.preventDefault();

    $("#btn-login").prop("disabled", true);
    $("#btn-login").loading(true);

    const data = {
      name: $("#txt-email").val(),
      password: $("#txt-password").val(),
    };

    fangiftService
      .post("auth/login", data)
      .then((res) => {
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        localStorage.setItem("exp", Number(res.exp) * 1000);
        location.pathname = LINKS.collections.path;
      })
      .catch((err) => {
        toastr.error(err.response.data.message);
        $("#btn-login").prop("disabled", false);
        $("#btn-login").loading(false);
      });
  });
});
