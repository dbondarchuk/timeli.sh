import assert from "node:assert/strict";
import { before, describe, it } from "node:test";

describe("subscription entitlements", () => {
  before(() => {
    process.env.POLAR_BILLING_PLANS = "free:prod_free,pro:prod_pro";
  });

  it("resolves plan tier from product id", async () => {
    const { resolvePlanTierFromProductId } = await import(
      "./subscription-entitlements"
    );

    assert.equal(resolvePlanTierFromProductId("prod_free"), "free");
    assert.equal(resolvePlanTierFromProductId("prod_pro"), "pro");
    assert.equal(
      resolvePlanTierFromProductId("prod_pro", { feesExempt: true }),
      "pro",
    );
    assert.equal(resolvePlanTierFromProductId(null), null);
    assert.equal(resolvePlanTierFromProductId("prod_unknown"), "pro");
  });

  it("gates non-app features by plan tier", async () => {
    const { canUseFeature } = await import("./subscription-entitlements");

    assert.equal(canUseFeature("pro", "financials"), true);
    assert.equal(canUseFeature("free", "financials"), false);
    assert.equal(canUseFeature("free", "sms"), true);
    assert.equal(canUseFeature(null, "discounts"), true);
  });

  it("limits free tier services", async () => {
    const { canCreateMoreServices, canCreateMorePages, FREE_TIER_LIMITS } =
      await import("@timelish/types");

    assert.equal(FREE_TIER_LIMITS.services, 1);
    assert.equal(FREE_TIER_LIMITS.appointments, 15);
    assert.equal(FREE_TIER_LIMITS.pages, 10);
    assert.equal(canCreateMoreServices("free", 0), true);
    assert.equal(canCreateMoreServices("free", 1), false);
    assert.equal(canCreateMoreServices("pro", 5), true);
    assert.equal(canCreateMoreServices(null, 10), true);
    assert.equal(canCreateMorePages("free", 9), true);
    assert.equal(canCreateMorePages("free", 10), false);
    assert.equal(canCreateMorePages("pro", 50), true);
  });

  it("resolves tier from organization", async () => {
    const { resolvePlanTierFromOrganization } = await import(
      "./subscription-entitlements"
    );

    assert.equal(
      resolvePlanTierFromOrganization({
        polarSubscriptionProductId: "prod_free",
      }),
      "free",
    );
    assert.equal(
      resolvePlanTierFromOrganization({
        polarSubscriptionProductId: "prod_pro",
        feesExempt: false,
      }),
      "pro",
    );
    assert.equal(
      resolvePlanTierFromOrganization({
        polarSubscriptionProductId: "prod_free",
        feesExempt: true,
      }),
      "pro",
    );
  });
});
