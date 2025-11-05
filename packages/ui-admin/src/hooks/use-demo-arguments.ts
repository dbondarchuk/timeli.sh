import { adminApi } from "@timelish/api-sdk";
import React from "react";

export const useDemoArguments = (options?: {
  noAppointment?: boolean;
  waitlistEntry?: boolean;
}) => {
  const [demoArguments, setDemoArguments] = React.useState<any>({});

  React.useEffect(() => {
    adminApi.templates
      .getDemoTemplateArguments(options)
      .then((args) => setDemoArguments(args));
  }, []);

  return demoArguments;
};
