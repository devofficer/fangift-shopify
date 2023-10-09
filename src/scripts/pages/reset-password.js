import toastr from "toastr";
import fangiftService from "../services/fangiftService";
import { isEmail } from "../utils/string";

toastr.options.positionClass = "toast-bottom-center bottom-10";

$(function () {
  $("#btn-reset").on("click", async function () {
    const email = $("#text-email").val();
    if (!isEmail(email)) {
      $("#text-email").error(true);
      return;
    } else {
      $("#text-email").error(false);
    }

    $(this).loading(true);

    try {
      await fangiftService.get("/auth/forgot-password", {
        params: { email: $("#text-email").val() },
      });
      toastr.success(
        "Successfully sent reset password link. Please check your inbox."
      );
    } catch (err) {
      toastr.error(err.response.data.message);
    }

    $(this).loading(false);
  });
});
