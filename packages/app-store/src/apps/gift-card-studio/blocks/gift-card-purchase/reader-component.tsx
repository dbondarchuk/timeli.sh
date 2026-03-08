"use client";

import { useI18n } from "@timelish/i18n";
import { Button, Input, Stepper } from "@timelish/ui";
import { CreditCard, Gift } from "lucide-react";
import React, { useState } from "react";
import {
  GiftCardStudioPublicKeys,
  GiftCardStudioPublicNamespace,
  giftCardStudioPublicNamespace,
} from "../../translations/types";
import { GiftCardPurchaseBlockReaderProps } from "./schema";

const STEPS = ["details", "payment"] as const;

export const GiftCardPurchaseBlockReader: React.FC<
  GiftCardPurchaseBlockReaderProps & { appId: string }
> = ({ appId, style }) => {
  const t = useI18n<
    GiftCardStudioPublicNamespace,
    GiftCardStudioPublicKeys
  >(giftCardStudioPublicNamespace);

  const [currentStep, setCurrentStep] = useState<(typeof STEPS)[number]>("details");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    designId: "",
    amount: 50,
    name: "",
    email: "",
    phone: "",
    sendToOther: false,
    toName: "",
    toEmail: "",
    message: "",
  });

  const fetchPreview = async () => {
    if (!appId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/apps/${appId}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designId: form.designId,
          amount: form.amount,
          name: form.name,
          email: form.email,
          phone: form.phone,
          toName: form.sendToOther ? form.toName : undefined,
          toEmail: form.sendToOther ? form.toEmail : undefined,
          message: form.sendToOther ? form.message : undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.imageDataUrl) {
        setPreviewUrl(data.imageDataUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = STEPS.indexOf(currentStep);
  const steps = [
    { id: "details", label: t("block.steps.details"), icon: Gift },
    { id: "payment", label: t("block.steps.payment"), icon: CreditCard },
  ];

  if (!appId) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Configure this block with a Gift Card Studio app.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6" style={style as React.CSSProperties}>
      <div className="text-center space-y-2">
        <h1 className="text-xl font-semibold">{t("block.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("block.description")}</p>
      </div>

      <Stepper
        steps={steps}
        currentStepId={currentStep}
        isCompleted={(id, index) => index < stepIndex}
        className="mb-6"
      />

      {currentStep === "details" && (
        <div className="space-y-4 rounded-lg border p-6">
          <p className="text-sm font-medium">{t("block.details.design")}</p>
          <Input
            placeholder="Design ID"
            value={form.designId}
            onChange={(e) => setForm((f) => ({ ...f, designId: e.target.value }))}
          />
          <p className="text-sm font-medium">{t("block.details.amount")}</p>
          <Input
            type="number"
            min={1}
            value={form.amount}
            onChange={(e) =>
              setForm((f) => ({ ...f, amount: Number(e.target.value) || 0 }))
            }
          />
          <Input
            placeholder={t("block.details.yourName")}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            type="email"
            placeholder={t("block.details.email")}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            placeholder={t("block.details.phone")}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.sendToOther}
              onChange={(e) =>
                setForm((f) => ({ ...f, sendToOther: e.target.checked }))
              }
            />
            <span className="text-sm">{t("block.details.sendToSomeoneElse")}</span>
          </label>
          {form.sendToOther && (
            <>
              <Input
                placeholder={t("block.details.toName")}
                value={form.toName}
                onChange={(e) => setForm((f) => ({ ...f, toName: e.target.value }))}
              />
              <Input
                type="email"
                placeholder={t("block.details.toEmail")}
                value={form.toEmail}
                onChange={(e) => setForm((f) => ({ ...f, toEmail: e.target.value }))}
              />
              <Input
                placeholder={t("block.details.message")}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              />
            </>
          )}
          <Button onClick={fetchPreview} disabled={loading}>
            {loading ? "Loading…" : t("block.details.preview")}
          </Button>
          {previewUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">{t("block.details.preview")}</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded border"
              />
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setCurrentStep("payment")}
              disabled={!previewUrl}
            >
              Continue to payment
            </Button>
          </div>
        </div>
      )}

      {currentStep === "payment" && (
        <div className="rounded-lg border p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Payment step — integrate with your booking payment flow (e.g. create
            payment intent, then on success call app complete endpoint).
          </p>
          <Button variant="outline" onClick={() => setCurrentStep("details")}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
};
