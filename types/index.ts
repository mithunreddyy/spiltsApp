export interface Member {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  participants: string[];
  category: string;
  date: string;
  createdAt: string;
}

export interface HistoryEvent {
  id: string;
  timestamp: string;
  message: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: Member[];
  expenses: Expense[];
  history: HistoryEvent[];
  createdAt: string;
}

export interface Balance {
  memberId: string;
  memberName: string;
  balance: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export type Category =
  | "Food"
  | "Travel"
  | "Rent"
  | "Entertainment"
  | "Utilities"
  | "Other";

export const CATEGORIES: Category[] = [
  "Food",
  "Travel",
  "Rent",
  "Entertainment",
  "Utilities",
  "Other",
];
