interface Check {
  id: string;
  method: string;
  phone: number | string;
  protocol: string;
  successCodes: number[];
  timeoutSeconds: number;
  url: string;
}

export {Check};
