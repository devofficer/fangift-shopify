import LINKS from "../constants/links";
import fangiftService from "../services/fangiftService";
import toastr from "toastr";

toastr.options.positionClass = "toast-bottom-center bottom-10";

$(function () {
  $("#form-login").on("submit", function (e) {
    e.preventDefault();

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
        localStorage.setItem("payload", JSON.stringify(res.payload));
        location.pathname = LINKS.wishlist.path;
      })
      .catch((err) => {
        toastr.error(err.response.data.message);
        $("#btn-login").loading(false);
      });
  });
});
