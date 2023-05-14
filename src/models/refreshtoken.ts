export interface RefreshToken {
  id?: number;
  token: string;
  expiryDate: Date;
  userId: string;
}
