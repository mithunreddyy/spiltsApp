import { Balance, Expense, Group, Settlement } from "@/types";

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export const validateGroupName = (name: string): string | null => {
  if (!name.trim()) return "Group name is required";
  if (name.trim().length < 2) return "Group name must be at least 2 characters";
  if (name.length > 50) return "Group name must be less than 50 characters";
  return null;
};

export const validateMemberName = (name: string): string | null => {
  if (!name.trim()) return "Member name is required";
  if (name.trim().length < 2)
    return "Member name must be at least 2 characters";
  if (name.length > 30) return "Member name must be less than 30 characters";
  return null;
};

export const validateExpense = (expense: {
  description: string;
  amount: string | number;
  paidBy: string;
  participants: string[];
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!expense.description.trim()) {
    errors.description = "Description is required";
  } else if (expense.description.length > 100) {
    errors.description = "Description must be less than 100 characters";
  }

  const amount =
    typeof expense.amount === "string"
      ? parseFloat(expense.amount)
      : expense.amount;
  if (isNaN(amount) || amount <= 0) {
    errors.amount = "Amount must be greater than 0";
  } else if (amount > 10000000) {
    errors.amount = "Amount must be less than ₹1,00,00,000";
  }

  if (!expense.paidBy) {
    errors.paidBy = "Please select who paid";
  }

  if (!expense.participants || expense.participants.length === 0) {
    errors.participants = "Please select at least one participant";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// ID GENERATION
// ============================================================================

export const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${timestamp}-${random}`;
};

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

export const formatCurrency = (amount: number): string => {
  try {
    // Handle edge cases
    if (!isFinite(amount)) return "₹0";
    if (isNaN(amount)) return "₹0";

    const roundedAmount = Math.round(amount * 100) / 100;
    const formatted = Math.abs(roundedAmount).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    const sign = roundedAmount < 0 ? "-" : "";
    return `${sign}₹${formatted}`;
  } catch (error) {
    console.error("Error formatting currency:", error);
    return "₹0";
  }
};

export const formatDate = (date: string): string => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

export const formatDateTime = (date: string): string => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";

    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return "Invalid Date";
  }
};

export const formatRelativeTime = (date: string): string => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return formatDate(date);
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "Invalid Date";
  }
};

// ============================================================================
// BALANCE CALCULATIONS (Enhanced with validation)
// ============================================================================

export const calculateBalances = (group: Group): Balance[] => {
  try {
    // Validate input
    if (!group || !group.members || !group.expenses) {
      console.error("Invalid group data");
      return [];
    }

    const balances: { [key: string]: number } = {};

    // Initialize all active members with zero balance
    const activeMembers = group.members.filter((m) => m.isActive);
    if (activeMembers.length === 0) {
      return [];
    }

    activeMembers.forEach((member) => {
      balances[member.id] = 0;
    });

    // Process each valid expense
    const validExpenses = group.expenses.filter((expense) => {
      // Validate expense has required fields
      if (!expense.amount || !expense.paidBy || !expense.participants) {
        return false;
      }
      // Validate amount is positive number
      if (isNaN(expense.amount) || expense.amount <= 0) {
        return false;
      }
      // Validate participants exist
      if (expense.participants.length === 0) {
        return false;
      }
      return true;
    });

    validExpenses.forEach((expense) => {
      const { amount, paidBy, participants } = expense;

      // Ensure payer exists
      if (!balances.hasOwnProperty(paidBy)) {
        return; // Skip if payer not in active members
      }

      // Filter participants to only active members
      const validParticipants = participants.filter((id) =>
        balances.hasOwnProperty(id)
      );
      if (validParticipants.length === 0) {
        return; // Skip if no valid participants
      }

      const splitAmount = amount / validParticipants.length;

      // Credit the payer
      balances[paidBy] += amount;

      // Debit each participant
      validParticipants.forEach((participantId) => {
        balances[participantId] -= splitAmount;
      });
    });

    // Return balances for active members only
    return activeMembers.map((member) => ({
      memberId: member.id,
      memberName: member.name,
      balance: Math.round((balances[member.id] || 0) * 100) / 100,
    }));
  } catch (error) {
    console.error("Error calculating balances:", error);
    return [];
  }
};

// ============================================================================
// SETTLEMENT CALCULATIONS (Enhanced greedy algorithm)
// ============================================================================

export const calculateSettlements = (balances: Balance[]): Settlement[] => {
  try {
    if (!balances || balances.length === 0) {
      return [];
    }

    const settlements: Settlement[] = [];
    const EPSILON = 0.01; // Threshold for rounding errors

    // Separate into debtors and creditors
    const debtors = balances
      .filter((b) => b.balance < -EPSILON)
      .map((b) => ({ ...b }))
      .sort((a, b) => a.balance - b.balance); // Most negative first

    const creditors = balances
      .filter((b) => b.balance > EPSILON)
      .map((b) => ({ ...b }))
      .sort((a, b) => b.balance - a.balance); // Most positive first

    let debtorIndex = 0;
    let creditorIndex = 0;

    // Match debtors with creditors using greedy approach
    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];

      // Calculate settlement amount
      const debtAmount = Math.abs(debtor.balance);
      const creditAmount = creditor.balance;
      const settleAmount = Math.min(debtAmount, creditAmount);

      if (settleAmount > EPSILON) {
        settlements.push({
          from: debtor.memberName,
          to: creditor.memberName,
          amount: Math.round(settleAmount * 100) / 100,
        });

        // Update balances
        debtor.balance += settleAmount;
        creditor.balance -= settleAmount;
      }

      // Move to next debtor/creditor if current one is settled
      if (Math.abs(debtor.balance) < EPSILON) debtorIndex++;
      if (Math.abs(creditor.balance) < EPSILON) creditorIndex++;
    }

    return settlements;
  } catch (error) {
    console.error("Error calculating settlements:", error);
    return [];
  }
};

// ============================================================================
// EXPORT UTILITIES (Enhanced with error handling)
// ============================================================================

const createDownloadLink = (blob: Blob, filename: string): void => {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error("Error creating download:", error);
    alert("Failed to download file. Please try again.");
  }
};

export const exportGroupAsJSON = (group: Group): void => {
  try {
    if (!group) {
      throw new Error("No group data to export");
    }

    const dataStr = JSON.stringify(group, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const filename = `${group.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${
      new Date().toISOString().split("T")[0]
    }.json`;

    createDownloadLink(blob, filename);
  } catch (error) {
    console.error("Error exporting group as JSON:", error);
    alert("Failed to export group. Please try again.");
  }
};

export const exportAllGroupsAsJSON = (groups: Group[]): void => {
  try {
    if (!groups || groups.length === 0) {
      throw new Error("No groups to export");
    }

    const exportData = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      groups: groups,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const filename = `money-splits-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;

    createDownloadLink(blob, filename);
  } catch (error) {
    console.error("Error exporting all groups:", error);
    alert("Failed to export data. Please try again.");
  }
};

export const exportGroupAsCSV = (group: Group): void => {
  try {
    if (!group || !group.expenses || group.expenses.length === 0) {
      throw new Error("No expenses to export");
    }

    const headers = [
      "Date",
      "Description",
      "Amount",
      "Paid By",
      "Category",
      "Participants",
      "Split Amount",
    ];

    const rows = group.expenses.map((expense) => {
      const payer = group.members.find((m) => m.id === expense.paidBy);
      const participantNames = expense.participants
        .map((id) => group.members.find((m) => m.id === id)?.name || "Unknown")
        .join("; ");
      const splitAmount = expense.amount / expense.participants.length;

      return [
        formatDate(expense.date),
        expense.description,
        expense.amount.toFixed(2),
        payer?.name || "Unknown",
        expense.category,
        participantNames,
        splitAmount.toFixed(2),
      ];
    });

    // Escape CSV fields
    const escapeCSV = (field: string | number): string => {
      const str = String(field);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const filename = `${group.name
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()}-expenses-${new Date().toISOString().split("T")[0]}.csv`;

    createDownloadLink(blob, filename);
  } catch (error) {
    console.error("Error exporting as CSV:", error);
    alert("Failed to export CSV. Please try again.");
  }
};

// ============================================================================
// DATA VALIDATION & SANITIZATION
// ============================================================================

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 200); // Limit length
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const validateGroupData = (group: any): group is Group => {
  return (
    group &&
    typeof group.id === "string" &&
    typeof group.name === "string" &&
    Array.isArray(group.members) &&
    Array.isArray(group.expenses) &&
    Array.isArray(group.history)
  );
};

// ============================================================================
// STATISTICS UTILITIES
// ============================================================================

export const calculateGroupStats = (group: Group) => {
  try {
    const totalExpenses = group.expenses.reduce((sum, e) => sum + e.amount, 0);
    const avgExpense =
      group.expenses.length > 0 ? totalExpenses / group.expenses.length : 0;
    const activeMembers = group.members.filter((m) => m.isActive).length;
    const perPersonSpent =
      activeMembers > 0 ? totalExpenses / activeMembers : 0;

    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    group.expenses.forEach((expense) => {
      categoryTotals[expense.category] =
        (categoryTotals[expense.category] || 0) + expense.amount;
    });

    // Top spender
    const spenderTotals: Record<string, number> = {};
    group.expenses.forEach((expense) => {
      spenderTotals[expense.paidBy] =
        (spenderTotals[expense.paidBy] || 0) + expense.amount;
    });

    const topSpenderId = Object.keys(spenderTotals).reduce(
      (a, b) => (spenderTotals[a] > spenderTotals[b] ? a : b),
      Object.keys(spenderTotals)[0]
    );
    const topSpender = group.members.find((m) => m.id === topSpenderId);

    return {
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      avgExpense: Math.round(avgExpense * 100) / 100,
      perPersonSpent: Math.round(perPersonSpent * 100) / 100,
      expenseCount: group.expenses.length,
      categoryBreakdown: categoryTotals,
      topSpender: topSpender?.name || "N/A",
      topSpenderAmount: topSpenderId ? spenderTotals[topSpenderId] : 0,
    };
  } catch (error) {
    console.error("Error calculating stats:", error);
    return null;
  }
};

// ============================================================================
// SEARCH & FILTER UTILITIES
// ============================================================================

export const searchExpenses = (
  expenses: Expense[],
  query: string
): Expense[] => {
  if (!query.trim()) return expenses;

  const lowerQuery = query.toLowerCase();
  return expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(lowerQuery) ||
      expense.category.toLowerCase().includes(lowerQuery)
  );
};

export const filterExpensesByDateRange = (
  expenses: Expense[],
  startDate: string,
  endDate: string
): Expense[] => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return expenses;
    }

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= start && expenseDate <= end;
    });
  } catch (error) {
    console.error("Error filtering by date range:", error);
    return expenses;
  }
};

export const filterExpensesByAmount = (
  expenses: Expense[],
  minAmount: number,
  maxAmount: number
): Expense[] => {
  return expenses.filter(
    (expense) => expense.amount >= minAmount && expense.amount <= maxAmount
  );
};
