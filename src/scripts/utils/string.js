export const convertLabelToId = (lbl) => lbl.toLowerCase().split(" ").join("-");

export const validateUrl = (url) => url.replace(/([^:])(\/\/)/, "$1/");

export const getS3Url = (key) =>
  validateUrl(`${process.env.API_URL}/s3/?key=${key}`);
