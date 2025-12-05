import { Link } from "@timelish/ui";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "I used to spend my Sunday evenings answering booking emails. Now I just check my calendar and everything's already there. Life-changing!",
    author: "Olesia Bondarchuk",
    role: "Nail Artist",
    link: "https://vividnail.studio",
    linkText: "VIVID Nail Studio",
    rating: 5,
  },
  // {
  //   quote:
  //     "My clients love that they can book me at midnight if they want to. I wake up to new appointments instead of voicemails. It's brilliant.",
  //   author: "James Wilson",
  //   role: "Personal Trainer",
  //   rating: 5,
  // },
  // {
  //   quote:
  //     "I was nervous about setting it up, but honestly my teenage daughter could do it. Had my booking page live in about 20 minutes.",
  //   author: "Linda Thompson",
  //   role: "Massage Therapist",
  //   rating: 5,
  // },
];

export function Testimonials() {
  return (
    <section className="bg-muted/30 px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary uppercase tracking-wide">
            Happy Customers
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            People like you are loving it
          </h2>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
          <div />
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col rounded-2xl border border-border bg-card p-8 "
            >
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm text-muted-foreground leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              <div className="mt-6 border-t border-border pt-4">
                <p className="font-semibold text-foreground">
                  {testimonial.author}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
                <p className="text-sm text-muted-foreground">
                  <Link
                    href={testimonial.link}
                    target="_blank"
                    variant="underline"
                  >
                    {testimonial.linkText}
                  </Link>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
