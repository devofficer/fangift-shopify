import select2 from "select2";
import toastr from "toastr";
import initAvatar from "../components/avatar";
import fangiftService from "../services/fangiftService";
import { getMySizes, updateMySizes } from "../services/mystoreService";
import restcountriesService from "../services/restcountriesService";
import { refreshSession } from "../utils/session";
import sniper from "../utils/snip";
import { getS3Url } from "../utils/string";

toastr.options.positionClass = "toast-bottom-center bottom-10";

select2(window, $);

const tabIds = ["profile", "address", "size"];

$(function () {
  const tabElements = tabIds.map((tabId) => ({
    id: tabId,
    triggerEl: document.querySelector(`#${tabId}-tab`),
    targetEl: document.querySelector(`#${tabId}`),
  }));
  const modalChangeCountry = new Modal(
    document.getElementById("modal-change-country")
  );
  const urlParams = new URLSearchParams(window.location.search);
  const options = {
    defaultTabId: urlParams.get("tab") ?? tabIds[0],
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
        case "size":
          showSizeTab();
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
  tabs.show(urlParams.get("tab") ?? tabIds[0]);

  async function showProfileTab() {
    let avatarFile;
    $("#username").val(window.gUserInfo?.name);
    $("#bio").val(window.gUserInfo?.bio);
    $("#public-name").val(window.gUserInfo?.publicName);

    if (window.gUserInfo?.picture) {
      $("#img-profile-avatar").prop("src", getS3Url(window.gUserInfo?.picture));
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
          const { picture } = await fangiftService.put("/customer/user", form, {
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
    const { defaultAddress: addr } = await fangiftService.get("/customer");
    sniper.stop();
    $("#address>.content").removeClass("blur-sm");

    const state = {
      countryCode: addr?.countryCode,
      addrId: addr?.id,
    };

    $("#select-country").off("change");
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

    setTimeout(() => {
      $("#select-country")
        .val(addr?.countryCode ?? window.gUserInfo?.country)
        .trigger("change");
      $("#select-country").on("change", function (e) {
        state.countryCode = $(e.target).val();
        if (state.countryCode) {
          $("label[for=select-country]").removeClass("text-red-500");

          if (state.countryCode !== window.gUserInfo?.country) {
            modalChangeCountry.show();
          }
        }
      });
    }, 100);

    $(".btn-cancel-change-country,#btn-close-change-country")
      .off("click")
      .on("click", function () {
        $("#select-country").val(window.gUserInfo?.country).trigger("change");
        $("#input-username-country-change").val("");
        modalChangeCountry.hide();
      });

    $(".btn-sure-change-country")
      .off("click")
      .on("click", function () {
        if (
          window.gUserInfo.name === $("#input-username-country-change").val()
        ) {
          $("#input-username-country-change").val("");
          $("#input-username-country-change").error(false);
          modalChangeCountry.hide();
        } else {
          $("#input-username-country-change").error(true);
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
          await fangiftService.put("/customer", data);
          refreshSession();
          toastr.success("Successfully updated your address!");
        } catch (err) {
          toastr.error(err.response.data.message);
        }

        $(this).loading(false);
      });
  }

  async function showSizeTab() {
    $("#size").append(sniper.spin().el);

    const userId = window.gUserInfo?.sub;
    const sizes = await getMySizes(userId);

    sniper.stop();
    $("#size>.content").removeClass("blur-sm");

    const state = {
      sizeStandard: "",
      gender: "",
      shirtSize: "",
      pantSize: "",
      dressSize: "",
      shoeSize: "",
      braSize: "",
      underwearSize: "",
      ...sizes,
    };

    Object.entries(state).forEach(([key, val]) => {
      $(`#${key}`).val(val);
    });

    function switchView() {
      if (state.sizeStandard && state.gender) {
        if (state.gender === "female" || state.gender === "other") {
          $(".male-size").addClass("hidden");
          $(".female-size").removeClass("hidden");
        } else if (state.gender === "male") {
          $(".female-size").addClass("hidden");
          $(".male-size").removeClass("hidden");
        }
        $("#btn-save-sizes").removeClass("hidden");
      } else {
        $("#btn-save-sizes").addClass("hidden");
        $(".female-size,.male-size").addClass("hidden");
      }
    }

    switchView();

    $("#sizeStandard").on("change", function (e) {
      state.sizeStandard = $(this).val();
      switchView();
    });

    $("#gender").on("change", function (e) {
      state.gender = $(this).val();
      switchView();
    });

    $("#btn-save-sizes").on("click", async function () {
      $(this).loading(true);

      const sizes = Object.keys(state).reduce(
        (acc, key) => ({
          ...acc,
          [key]: $(`#${key}`).val(),
        }),
        {}
      );

      try {
        await updateMySizes(userId, sizes);
        toastr.success("Successfully updated your sizes!");
      } catch (err) {
        console.log(err);
        toastr.error("Get failed to update your sizes!");
      }

      $(this).loading(false);
    });
  }
});
