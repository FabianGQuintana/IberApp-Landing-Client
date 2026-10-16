// Shapes returned by the backend (IberaReclamos.Application.DTOs.Auth / User).

export type UserProfile = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  portal: string;
  role: "Admin" | "Ranger" | "Helper" | string;
};

export type LoginResponse = {
  token: string;
  expiresAt: string;
  user: UserProfile;
};

/** What the phone keeps after logging in. The profile stays even if the token expires (to keep working offline). */
export type Session = {
  token: string | null;
  expiresAt: string | null;
  user: UserProfile;
};
