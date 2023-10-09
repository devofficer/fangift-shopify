import LINKS from "../constants/links";
import fangiftService from "../services/fangiftService";
import toastr from "toastr";
import { isEmail } from "../utils/string";

toastr.options.positionClass = "toast-bottom-center bottom-10";

$(function () {
  $("#form-reset").on("submit", async function (e) {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    const email = params.get("email");
    const code = params.get("code");

    if (!isEmail(email) || !code) {
      toastr.error("Your reset password link is invalid");
      return;
    }

    $("#btn-reset").loading(true);

    const data = {
      email: params.get("email"),
      code: params.get("code"),
      newPassword: $("#text-new-password").val(),
    };

    try {
      await fangiftService.post("/auth/confirm-password", data);
      location.href = LINKS.login.path;
      toastr.success(
        "Successfully reset your password, will be redirect to login page right now!"
      );
    } catch (err) {
      toastr.error(err.response.data.message);
    }
    $("#btn-reset").loading(false);
  });
});
