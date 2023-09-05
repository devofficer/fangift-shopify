import templateCardCreator from "../templates/card.creator";
import spinner from "../utils/snip";
import fangiftService from "../services/fangiftService";
import toastr from "toastr";
import { getS3Url } from "../utils/string";

toastr.options.positionClass = "toast-bottom-center";

$(async function () {
  const container = $("#container-creators");
  container.append(spinner.spin().el);

  try {
    const creators = await fangiftService.get("auth/creators");
    creators.forEach((creator) => {
      const bio = creator.bio ?? "0";
      const bioWords = bio.split(" ");
      const bioSliced =
        bioWords.length > 10
          ? bioWords.slice(0, 10).concat("...").join(" ")
          : bio;
      container.append(
        templateCardCreator({
          ...creator,
          avatar: creator.picture ? getS3Url(creator.picture) : "",
          bio: bioSliced,
        })
      );
    });
    spinner.stop();
  } catch (err) {
    toastr.error(err.response.data.message);
  }
});
