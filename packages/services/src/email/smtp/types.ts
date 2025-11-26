export type SmtpConfiguration = {
  host: string;
  port: number;
  secure: boolean;
  email: string;
  fromName: string;
  auth: {
    user?: string | undefined;
    pass?: string | undefined;
  };
};
