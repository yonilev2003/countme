export type UserType = 'zaair' | 'patur' | 'murshe';

export const INCOME_LIMIT = 122_833; // ₪ — annual limit for zaair/patur

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  userType: UserType | null;
  isRegistrationComplete: boolean;
}

export function getIncomeLimit(_userType: UserType): number {
  return INCOME_LIMIT;
}
