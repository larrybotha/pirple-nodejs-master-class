const safeStringify = (data: any) => {
  try {
    return JSON.stringify(data);
  } catch (err) {
    return undefined;
  }
};

export {safeStringify};
