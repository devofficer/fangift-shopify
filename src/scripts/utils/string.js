export function convertLabelToId(lbl) {
  return lbl.toLowerCase().split(" ").join("-");
}

export function validateUrl(url) {
  return url.replace(/([^:])(\/\/)/, "$1/");
}

export function getS3Url(key) {
  return validateUrl(`${process.env.API_URL}/s3/?key=${key}`);
}

export function prodIdToGid(id) {
  return `gid://shopify/Product/${id}`;
}

export function prodGidToId(gid) {
  return Number(gid.split("/")[4]);
}

export function isUrl(url) {
  return /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(
    url
  );
}

export function isEmail(email) {
  return /^(([^<>()[\]\\.,;:\s@]+(\.[^<>()[\]\\.,;:\s@]+)*)|(.+))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  );
}

export function isValidUsername(username) {
  return /^(?![_.]+)(?!.*[_.]{2})[\w.]{1,28}(?<![_.])$/.test(username);
}
