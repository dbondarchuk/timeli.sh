import { WaitlistPropsSchema } from "./waitlist/schema";

export const WaitlistBlocksSchema = {
  Waitlist: WaitlistPropsSchema,
} as {
  Waitlist: typeof WaitlistPropsSchema;
};
