export type ZoomUserSettings = {
  recording: {
    auto_recording: string | null;
  } | null;
  schedule_meeting: {
    default_password_for_scheduled_meetings: string | null;
  } | null;
  in_meeting: {
    waiting_room: boolean | null;
  } | null;
};

export type ZoomCreateMeetingResponse = {
  id: number;
  join_url: string;
  password?: string;
};

export type ZoomMeeting = {
  agenda: string;
  created_at: string;
  duration: number;
  host_id: string;
  id: number;
  join_url: string;
  pmi: string;
  start_time: string;
  timezone: string;
  topic: string;
  type: number;
  uuid: string;
};

export type ZoomMeetingsResponse = {
  meetings: ZoomMeeting[];
  next_page_token?: string;
  page_count: number;
  page_number: number;
  page_size: number;
  total_records: number;
};
