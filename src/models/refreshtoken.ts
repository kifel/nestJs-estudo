export interface RefreshToken {
  id?: number;
  token: string;
  expiryDate: Date;
  userId: string;
  deviceId: string;
  deviceInfo: string;
  userInfo: string;
}
