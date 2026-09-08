export interface BaseUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  createdAt: string;
}

export interface AuthUser extends BaseUser {
  email: string;
  geminiKeyHint: string;
}

// Might have different fields in the future
export interface PublicUser extends BaseUser {}
