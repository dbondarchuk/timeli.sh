export function containsAdminDashboard(value: string) {
  const regex = /^\/admin\/dashboard/i;
  return regex.test(value);
}

export function containsAdminApi(value: string) {
  const regex = /^\/admin\/api/i;
  return regex.test(value);
}

export function containsAdminPath(value: string) {
  return /^\/admin\//i.test(value) || /^\/admin$/i.test(value);
}
