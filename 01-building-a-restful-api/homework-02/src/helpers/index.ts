const safeStringify = (data: any) => {
const safeJSONParse = (data: any) => {
  try {
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
};

export {safeJSONParse};
