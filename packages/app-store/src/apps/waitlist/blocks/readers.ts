import { ReaderDocumentBlocksDictionary } from "@timelish/builder";
import { BookingWithWaitlistReader } from "./booking-with-waitlist/reader";
import { WaitlistBlocksSchema } from "./schema";
import { WaitlistReader } from "./waitlist/reader";

export const WaitlistReaders: ReaderDocumentBlocksDictionary<
  typeof WaitlistBlocksSchema
> = {
  Waitlist: {
    Reader: WaitlistReader,
  },
  BookingWithWaitlist: {
    Reader: BookingWithWaitlistReader,
  },
};
