import fangiftService from "../services/fangiftService";
import initAvatar from "../components/avatar";
import { getS3Url } from "../utils/string";
import toastr from "toastr";

toastr.options.positionClass = "toast-bottom-center bottom-10";

const tabIds = [
  "profile",
  "account",
  "wishlist",
  "address",
  "social-links",
  "wishlist-analytics",
  "store-analytics",
  "balance",
];

$(function () {
  let avatarFile;
  const tabElements = tabIds.map((tabId) => ({
    id: tabId,
    triggerEl: document.querySelector(`#${tabId}-tab`),
    targetEl: document.querySelector(`#${tabId}`),
  }));

  const options = {
    defaultTabId: tabIds[0],
    activeClasses: "active",
    inactiveClasses: "inactive",
  };

  const tabs = new Tabs(tabElements, options);
  tabs.show(tabIds[0]);

  $("#username").val(gUserInfo.name);
  $("#bio").val(gUserInfo.bio);
  $("#public-name").val(gUserInfo.publicName);

  if (gUserInfo.picture) {
    $("#img-profile-avatar").prop("src", getS3Url(gUserInfo.picture));
  }

  initAvatar((file) => {
    avatarFile = file;
  }, "profile-avatar");

  $("#btn-save-profile").on("click", async function () {
    const publicName = $("#public-name").val();

    if (!publicName) {
      toastr.error("Public name is required field!");
      return;
    }

    $(this).loading(true);

    try {
      const form = new FormData();
      form.append("publicName", publicName);
      form.append("avatar", avatarFile);
      form.append("bio", $("#bio").val());
      await fangiftService.put("/user", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toastr.success("Updated your profile successfully!");
    } catch (err) {
      toastr.error(err.response.data.message);
      return;
    }

    $(this).loading(false);
  });
});
