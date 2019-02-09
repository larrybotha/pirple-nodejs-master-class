interface User {
  checks?: string[];
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  tosAgreement: boolean | string;
}

export {User};
