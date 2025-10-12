"use client";

import { ComplexAppPageProps } from "@vivid/types";
import { Skeleton } from "@vivid/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { dismissWaitlistEntry } from "../views/components/actions";

export const WaitlistDismissPage: React.FC<ComplexAppPageProps> = ({
  appId,
}) => {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const router = useRouter();
  useEffect(() => {
    if (!id) {
      router.replace("/admin/dashboard/waitlist");
      return;
    }

    const fn = async () => {
      await dismissWaitlistEntry(appId, id);
      router.replace("/admin/dashboard/waitlist");
    };

    fn();
  }, [id]);
  return <Skeleton className="w-full h-[70vh]" />;
};
