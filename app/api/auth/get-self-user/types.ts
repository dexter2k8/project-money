export interface ISelfUser {
  uid: string;
  displayName: string | null;
  email?: string | null;
  photoURL?: string | null;
  role: string | null;
}
