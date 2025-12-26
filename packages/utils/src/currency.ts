import { Discount } from "@timelish/types";

export const formatAmountString = (value: number): string =>
  value.toFixed(2).replace(/\.00$/, "");

export const formatAmount = (value: number): number =>
  parseFloat(value.toFixed(2).replace(/\.00$/, ""));

export const getDiscountAmount = (
  price: number,
  discount: Discount,
): number => {
  switch (discount.type) {
    case "amount":
      return Math.min(price, discount.value);
    case "percentage":
      return Math.min(price, formatAmount((price * discount.value) / 100));
  }

  return 0;
};
