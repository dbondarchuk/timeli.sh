"use client";

import { useInstallWizard } from "@/components/install/install-wizard-context";
import { useI18n } from "@timelish/i18n";
import { Progress, Stepper, type StepperStep } from "@timelish/ui";
import {
  Building2,
  CalendarPlus,
  CheckCircle2,
  CreditCard,
  Link2,
  Palette,
} from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

export function StepInstallHeader({ stepNum }: { stepNum: number }) {
  const t = useI18n("install");
  const { session } = useInstallWizard();

  const stepperSteps: StepperStep[] = useMemo(
    () => [
      {
        id: "business",
        label: t("wizard.steps.business"),
        icon: Building2,
      },
      {
        id: "personalization",
        label: t("wizard.steps.personalization"),
        icon: Palette,
      },
      {
        id: "service",
        label: t("wizard.steps.service"),
        icon: CalendarPlus,
      },
      {
        id: "integrations",
        label: t("wizard.steps.integrations"),
        icon: Link2,
      },
      {
        id: "payments",
        label: t("wizard.steps.payments"),
        icon: CreditCard,
      },
      {
        id: "done",
        label: t("wizard.steps.done"),
        icon: CheckCircle2,
      },
    ],
    [t],
  );

  const currentStepperId = useMemo(() => {
    if (stepNum === 1) return "business";
    if (stepNum === 2) return "personalization";
    if (stepNum === 3) return "service";
    if (stepNum === 4) return "integrations";
    if (stepNum === 5) return "payments";
    if (stepNum === 6) return "done";
    return "business";
  }, [stepNum]);

  const progressPercent = Math.round((stepNum / 6) * 100);

  return (
    <header className="border-b bg-card px-4 py-4 md:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Timeli.sh" width={28} height={28} />
            <div className="text-lg font-semibold tracking-tight">
              timeli<span className="text-primary">.sh</span>
            </div>
          </div>
          <div className="hidden text-sm text-muted-foreground sm:block">
            {session?.user?.name}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("wizard.progressLabel")}
            </p>
            <p className="text-2xl font-semibold">{progressPercent}%</p>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <div className="pt-2">
          <Stepper
            steps={stepperSteps}
            currentStepId={currentStepperId}
            isCompleted={(id) => {
              const order = stepperSteps.map((s) => s.id);
              const cur = order.indexOf(currentStepperId);
              const idx = order.indexOf(id);
              return idx < cur;
            }}
          />
        </div>
      </div>
    </header>
  );
}
