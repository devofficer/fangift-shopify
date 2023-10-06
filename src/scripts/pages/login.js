import LINKS from "../constants/links";
import fangiftService from "../services/fangiftService";
import toastr from "toastr";
import { isEmail } from "../utils/string";

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
        location.pathname =
          res.payload["custom:type"] === "creator"
            ? LINKS.wishlist.path
            : LINKS.explore.path;
      })
      .catch((err) => {
        toastr.error(err.response.data.message);
        $("#btn-login").loading(false);
      });
  });

  $("#btn-send-reset").on("click", async function () {
    const email = $("#txt-email").val();
    if (!isEmail(email)) {
      toastr.error("Please enter valid email address to reset");
      return;
    }

    $(this).prop("disabled", true);

    try {
      await fangiftService.get("/auth/forgot-password", { params: { email } });
      toastr.success("Successfully sent reset password link!");
    } catch (err) {
      toastr.error(err.response.data.message);
    }

    setTimeout(() => {
      $(this).prop("disabled", false);
    }, 1000);
  });
});
