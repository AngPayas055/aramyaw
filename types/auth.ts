export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  password: string;
};

export type RegisterUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  role: string;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
  user?: RegisterUser;
};