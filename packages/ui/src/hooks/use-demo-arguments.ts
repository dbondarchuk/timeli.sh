import React from "react";

export const useDemoArguments = (options?: {
  noAppointment?: boolean;
  waitlistEntry?: boolean;
}) => {
  const [demoArguments, setDemoArguments] = React.useState<any>({});

  const searchParams: Record<string, string> = {};
  if (options?.noAppointment) {
    searchParams.noAppointment = "true";
  }
  if (options?.waitlistEntry) {
    searchParams.waitlistEntry = "true";
  }

  const searchParamsString = Object.entries(searchParams)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const getDemoArguments = async () => {
    const response = await fetch(
      `/admin/api/templates/arguments/demo${searchParamsString ? `?${searchParamsString}` : ""}`,
    );
    return await response.json();
  };

  React.useEffect(() => {
    getDemoArguments().then((args) => setDemoArguments(args));
  }, []);

  return demoArguments;
};
