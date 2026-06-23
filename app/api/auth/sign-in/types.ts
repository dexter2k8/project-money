export interface ISignInArgs {
  email: string;
  password: string;
  name?: string;
  avatar?: string;
}

export interface ISignInResponse {
  uid: string;
  email: string;
  emailVerified: boolean;
  isAnonymous: boolean;
  providerData: [
    {
      providerId: "password";
      uid: string;
      displayName: string | null;
      email: string;
      phoneNumber: string | null;
      photoURL: string | null;
    },
  ];
  stsTokenManager: {
    refreshToken: string;
    accessToken: string;
    expirationTime: number;
  };
  createdAt: string;
  lastLoginAt: string;
  apiKey: string;
  appName: "[DEFAULT]";
}
