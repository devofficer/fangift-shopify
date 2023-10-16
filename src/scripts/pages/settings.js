import fangiftService from "../services/fangiftService";
import restcountriesService from "../services/restcountriesService";
import initAvatar from "../components/avatar";
import { getS3Url } from "../utils/string";
import toastr from "toastr";
import select2 from "select2";
import sniper from "../utils/snip";

toastr.options.positionClass = "toast-bottom-center bottom-10";

select2(window, $);

const tabIds = ["profile", "address"];

$(function () {
  const tabElements = tabIds.map((tabId) => ({
    id: tabId,
    triggerEl: document.querySelector(`#${tabId}-tab`),
    targetEl: document.querySelector(`#${tabId}`),
  }));

  const options = {
    defaultTabId: tabIds[0],
    activeClasses: "active",
    inactiveClasses: "inactive",
    onShow: ({ _activeTab: { id: tabId } }) => {
      switch (tabId) {
        case "address":
          showAddressTab();
          break;
        case "profile":
          showProfileTab();
          break;
        default:
          showProfileTab();
      }

      if (tabId !== "address") {
        $("#address>.content").addClass("blur-sm");
      }
    },
  };

  const tabs = new Tabs(tabElements, options);
  tabs.show(tabIds[0]);
});

function showProfileTab() {
  let avatarFile;
  $("#username").val(gUserInfo.name);
  $("#bio").val(gUserInfo.bio);
  $("#public-name").val(gUserInfo.publicName);

  if (gUserInfo.picture) {
    $("#img-profile-avatar").prop("src", getS3Url(gUserInfo.picture));
  }

  initAvatar((file) => {
    avatarFile = file;
  }, "profile-avatar");

  $("#btn-save-profile")
    .off("click")
    .on("click", async function () {
      const publicName = $("#public-name").val();
      const bio = $("#bio").val();

      if (!publicName) {
        toastr.error("Public name is required field!");
        return;
      }

      $(this).loading(true);

      try {
        const form = new FormData();
        form.append("publicName", publicName);
        form.append("avatar", avatarFile);
        form.append("bio", bio);
        const { picture } = await fangiftService.put("/user", form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const payload = JSON.parse(localStorage.getItem("payload"));
        payload["custom:bio"] = bio;
        payload["custom:publicName"] = publicName;

        if (picture) {
          payload.picture = picture;
        }

        localStorage.setItem("payload", JSON.stringify(payload));
        toastr.success("Updated your profile successfully!");
        location.reload();
      } catch (err) {
        toastr.error(err.response.data.message);
        return;
      }

      $(this).loading(false);
    });
}

async function showAddressTab() {
  $("#address").append(sniper.spin().el);
  const countries = await restcountriesService.get(
    "all?fields=name,flags,cca2"
  );
  const { defaultAddress: addr } = await fangiftService.get("/user/address");
  sniper.stop();
  $("#address>.content").removeClass("blur-sm");

  const state = {
    countryCode: addr?.countryCode,
    addrId: addr?.id,
  };

  $("#select-country").select2({
    width: "100%",
    data: [
      { id: "", text: "Select Country of Residence", flag: "" },
      ...countries
        .map((item) => ({
          id: item.cca2,
          text: item.name.common,
          flag: item.flags.png,
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

  $("#select-country")
    .off("select2:select")
    .on("select2:select", function (e) {
      state.countryCode = e.params.data.id;
      $("#btn-save-address").prop("disabled", !state.countryCode);
      if (state.countryCode) {
        $("label[for=select-country]").removeClass("text-red-500");
      }
    });

  if (addr) {
    $("#select-country").val(addr.countryCode);
    $("#select-country").trigger("change");
    $("#first-name").val(addr.firstName);
    $("#last-name").val(addr.lastName);
    $("#address1").val(addr.address1);
    $("#address2").val(addr.address2);
    $("#city").val(addr.city);
    $("#state").val(addr.province);
    $("#zip").val(addr.zip);
    $("#phone-number").val(addr.phone);
  }

  $("#address .textfield")
    .off("input")
    .on("input", function () {
      const name = $(this).attr("id");
      $(`label[for=${name}]`).removeClass("text-red-500");
    });

  $("#btn-save-address")
    .off("click")
    .on("click", async function () {
      const data = {
        id: state.addrId,
        firstName: $("#first-name").val(),
        lastName: $("#last-name").val(),
        countryCode: state.countryCode,
        address1: $("#address1").val(),
        address2: $("#address2").val(),
        city: $("#city").val(),
        province: $("#state").val(),
        zip: $("#zip").val(),
        phone: $("#phone-number").val(),
      };

      let invalid = false;

      if (!data.countryCode) {
        $("label[for=select-country]").addClass("text-red-500");
        invalid = true;
      }
      if (!data.firstName) {
        $("label[for=first-name]").addClass("text-red-500");
        invalid = true;
      }
      if (!data.lastName) {
        $("label[for=last-name]").addClass("text-red-500");
        invalid = true;
      }
      if (!data.city) {
        $("label[for=city]").addClass("text-red-500");
        invalid = true;
      }
      if (!data.address1) {
        $("label[for=address1]").addClass("text-red-500");
        invalid = true;
      }
      if (!data.province) {
        $("label[for=state]").addClass("text-red-500");
        invalid = true;
      }
      if (!data.zip) {
        $("label[for=zip]").addClass("text-red-500");
        invalid = true;
      }
      if (!data.phone) {
        $("label[for=phone-number]").addClass("text-red-500");
        invalid = true;
      }
      if (invalid) {
        return;
      }

      $(this).loading(true);

      try {
        await fangiftService.put("/user/address", data);
        toastr.success("Successfully updated your address!");
      } catch (err) {
        toastr.error(err.response.data.message);
      }

      $(this).loading(false);
    });
}
