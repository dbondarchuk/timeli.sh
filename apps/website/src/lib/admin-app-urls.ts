const ADMIN_URL = `https://${process.env.NEXT_PUBLIC_ADMIN_DOMAIN}`;

export function getSignUpUrl(): string {
  return `${ADMIN_URL}/auth/signup`;
}

export function getSignInUrl(): string {
  return `${ADMIN_URL}/auth/signin`;
}
