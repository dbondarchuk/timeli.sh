import { clientApi } from "@timelish/api-sdk";
import type { ModifyAppointmentType } from "@timelish/types";
import type {
  AppointmentListResponse,
  AppointmentResponse,
  AppointmentSummaryResponse,
  AuthOptionsResponse,
  CheckSessionResponse,
  CustomerMeResponse,
  GetAppointmentsResponse,
  ModifyInformation,
  RequestOtpResponse,
  VerifyOtpResponse,
} from "./types";

export const checkSessionAction = async (
  appId: string,
): Promise<CheckSessionResponse> => {
  return clientApi.apps.callAppApi<CheckSessionResponse>({
    appId,
    path: "cabinet/auth/check",
    method: "GET",
  });
};

export const getAuthOptionsAction = async (
  appId: string,
): Promise<AuthOptionsResponse> => {
  return clientApi.apps.callAppApi<AuthOptionsResponse>({
    appId,
    path: "cabinet/auth/options",
    method: "GET",
  });
};

export const requestOtpAction = async (
  appId: string,
  payload: { email?: string; phone?: string },
): Promise<RequestOtpResponse> => {
  return clientApi.apps.callAppApi<RequestOtpResponse>({
    appId,
    path: "cabinet/auth/request-otp",
    method: "POST",
    body: payload,
  });
};

export const verifyOtpAction = async (
  appId: string,
  payload: { email?: string; phone?: string; otp: string },
): Promise<VerifyOtpResponse> => {
  return clientApi.apps.callAppApi<VerifyOtpResponse>({
    appId,
    path: "cabinet/auth/verify-otp",
    method: "POST",
    body: payload,
  });
};

export const getAppointmentsAction = async (
  appId: string,
): Promise<GetAppointmentsResponse> => {
  return clientApi.apps.callAppApi<GetAppointmentsResponse>({
    appId,
    path: "cabinet/appointments",
    method: "GET",
  });
};

export const getAppointmentsSummaryAction = async (
  appId: string,
): Promise<AppointmentSummaryResponse> => {
  return clientApi.apps.callAppApi<AppointmentSummaryResponse>({
    appId,
    path: "cabinet/appointments/summary",
    method: "GET",
  });
};

export const getUpcomingAppointmentsAction = async (
  appId: string,
): Promise<AppointmentListResponse> => {
  return clientApi.apps.callAppApi<AppointmentListResponse>({
    appId,
    path: "cabinet/appointments/upcoming",
    method: "GET",
  });
};

export const getPastAppointmentsAction = async (
  appId: string,
  page: number,
  limit = 10,
): Promise<AppointmentListResponse> => {
  return clientApi.apps.callAppApi<AppointmentListResponse>({
    appId,
    path: `cabinet/appointments/past?page=${page}&limit=${limit}`,
    method: "GET",
  });
};

export const getCustomerMeAction = async (
  appId: string,
): Promise<CustomerMeResponse> => {
  return clientApi.apps.callAppApi<CustomerMeResponse>({
    appId,
    path: "cabinet/me",
    method: "GET",
  });
};

export const getAppointmentByIdAction = async (
  appId: string,
  appointmentId: string,
): Promise<AppointmentResponse> => {
  return clientApi.apps.callAppApi<AppointmentResponse>({
    appId,
    path: `cabinet/appointments/${appointmentId}`,
    method: "GET",
  });
};

export const getModifyInformationAction = async (args: {
  type: ModifyAppointmentType;
  fields:
    | { type: "email"; email: string; dateTime: Date }
    | { type: "phone"; phone: string; dateTime: Date };
}): Promise<ModifyInformation> => {
  return clientApi.events.getModifyAppointmentInformation(args);
};

export const submitModifyAction = async (
  appointmentId: string,
  payload: {
    type: ModifyAppointmentType;
    dateTime?: Date;
    fields:
      | { type: "email"; email: string; dateTime: Date }
      | { type: "phone"; phone: string; dateTime: Date };
  },
): Promise<void> => {
  await clientApi.events.modifyAppointment(appointmentId, payload as any);
};
