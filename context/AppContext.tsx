"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  generateId,
  sanitizeInput,
  validateGroupData,
  validateGroupName,
  validateMemberName,
} from "@/lib/utils";
import { Expense, Group, HistoryEvent, Member } from "@/types";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";

interface AppContextType {
  groups: Group[];
  addGroup: (
    group: Omit<Group, "id" | "createdAt" | "expenses" | "history">
  ) => Promise<boolean>;
  updateGroup: (id: string, updates: Partial<Group>) => Promise<boolean>;
  deleteGroup: (id: string) => Promise<boolean>;
  addExpense: (
    groupId: string,
    expense: Omit<Expense, "id" | "createdAt">
  ) => Promise<boolean>;
  updateExpense: (
    groupId: string,
    expenseId: string,
    updates: Partial<Expense>
  ) => Promise<boolean>;
  deleteExpense: (groupId: string, expenseId: string) => Promise<boolean>;
  addMember: (groupId: string, name: string) => Promise<boolean>;
  removeMember: (groupId: string, memberId: string) => Promise<boolean>;
  updateMember: (
    groupId: string,
    memberId: string,
    name: string
  ) => Promise<boolean>;
  darkMode: boolean;
  toggleDarkMode: () => void;
  getGroup: (id: string) => Group | undefined;
  isLoading: boolean;
  lastError: string | null;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider: React.FC<{
  children: ReactNode;
  userId?: string;
}> = ({ children, userId }) => {
  // Use user-specific storage key if userId is provided
  const storageKey = userId
    ? `money-splits-groups-${userId}`
    : "money-splits-groups";
  const [groups, setGroups] = useLocalStorage<Group[]>(storageKey, []);
  const [darkMode, setDarkMode] = useLocalStorage(
    "money-splits-darkmode",
    false
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [lastError, setLastError] = React.useState<string | null>(null);

  // Validate and clean data on mount
  useEffect(() => {
    try {
      const validGroups = groups.filter(validateGroupData);
      if (validGroups.length !== groups.length) {
        console.warn("Some groups were invalid and removed");
        setGroups(validGroups);
      }
    } catch (error) {
      console.error("Error validating groups:", error);
      setLastError("Failed to load some data. Starting fresh.");
    }
  }, []);

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  const addHistoryEvent = (groupId: string, message: string) => {
    const event: HistoryEvent = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      message: sanitizeInput(message),
    };

    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, history: [...g.history, event] } : g
      )
    );
  };

  const addGroup = useCallback(
    async (
      groupData: Omit<Group, "id" | "createdAt" | "expenses" | "history">
    ): Promise<boolean> => {
      try {
        setIsLoading(true);
        setLastError(null);

        // Validate group name
        const nameError = validateGroupName(groupData.name);
        if (nameError) {
          setLastError(nameError);
          return false;
        }

        // Validate members
        if (!groupData.members || groupData.members.length === 0) {
          setLastError("At least one member is required");
          return false;
        }

        for (const member of groupData.members) {
          const memberError = validateMemberName(member.name);
          if (memberError) {
            setLastError(`Invalid member: ${memberError}`);
            return false;
          }
        }

        // Check for duplicate group names
        const duplicateName = groups.some(
          (g) => g.name.toLowerCase() === groupData.name.trim().toLowerCase()
        );
        if (duplicateName) {
          setLastError("A group with this name already exists");
          return false;
        }

        const newGroup: Group = {
          ...groupData,
          name: sanitizeInput(groupData.name),
          description: sanitizeInput(groupData.description || ""),
          id: generateId(),
          createdAt: new Date().toISOString(),
          expenses: [],
          history: [
            {
              id: generateId(),
              timestamp: new Date().toISOString(),
              message: `Group "${sanitizeInput(groupData.name)}" created`,
            },
          ],
        };

        setGroups((prev) => [...prev, newGroup]);
        return true;
      } catch (error) {
        console.error("Error adding group:", error);
        setLastError("Failed to create group. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [groups, setGroups]
  );

  const updateGroup = useCallback(
    async (id: string, updates: Partial<Group>): Promise<boolean> => {
      try {
        setIsLoading(true);
        setLastError(null);

        // Validate name if provided
        if (updates.name) {
          const nameError = validateGroupName(updates.name);
          if (nameError) {
            setLastError(nameError);
            return false;
          }
        }

        const groupExists = groups.some((g) => g.id === id);
        if (!groupExists) {
          setLastError("Group not found");
          return false;
        }

        setGroups((prev) =>
          prev.map((g) => {
            if (g.id === id) {
              const updated = {
                ...g,
                ...updates,
                name: updates.name ? sanitizeInput(updates.name) : g.name,
                description:
                  updates.description !== undefined
                    ? sanitizeInput(updates.description)
                    : g.description,
              };

              if (updates.name && updates.name !== g.name) {
                updated.history = [
                  ...g.history,
                  {
                    id: generateId(),
                    timestamp: new Date().toISOString(),
                    message: `Group renamed to "${sanitizeInput(updates.name)}"`,
                  },
                ];
              }
              return updated;
            }
            return g;
          })
        );

        return true;
      } catch (error) {
        console.error("Error updating group:", error);
        setLastError("Failed to update group. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [groups, setGroups]
  );

  const deleteGroup = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setLastError(null);

        const groupExists = groups.some((g) => g.id === id);
        if (!groupExists) {
          setLastError("Group not found");
          return false;
        }

        setGroups((prev) => prev.filter((g) => g.id !== id));
        return true;
      } catch (error) {
        console.error("Error deleting group:", error);
        setLastError("Failed to delete group. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [groups, setGroups]
  );

  const addExpense = useCallback(
    async (
      groupId: string,
      expenseData: Omit<Expense, "id" | "createdAt">
    ): Promise<boolean> => {
      try {
        setIsLoading(true);
        setLastError(null);

        const group = groups.find((g) => g.id === groupId);
        if (!group) {
          setLastError("Group not found");
          return false;
        }

        // Validate amount
        if (isNaN(expenseData.amount) || expenseData.amount <= 0) {
          setLastError("Invalid amount");
          return false;
        }

        // Validate payer exists
        const payerExists = group.members.some(
          (m) => m.id === expenseData.paidBy && m.isActive
        );
        if (!payerExists) {
          setLastError("Payer not found or inactive");
          return false;
        }

        // Validate participants
        if (
          !expenseData.participants ||
          expenseData.participants.length === 0
        ) {
          setLastError("At least one participant is required");
          return false;
        }

        const validParticipants = expenseData.participants.filter((id) =>
          group.members.some((m) => m.id === id && m.isActive)
        );

        if (validParticipants.length === 0) {
          setLastError("No valid participants selected");
          return false;
        }

        const newExpense: Expense = {
          ...expenseData,
          id: generateId(),
          description: sanitizeInput(expenseData.description),
          participants: validParticipants,
          createdAt: new Date().toISOString(),
        };

        const payer = group.members.find((m) => m.id === newExpense.paidBy);

        setGroups((prev) =>
          prev.map((g) => {
            if (g.id === groupId) {
              return {
                ...g,
                expenses: [...g.expenses, newExpense],
                history: [
                  ...g.history,
                  {
                    id: generateId(),
                    timestamp: new Date().toISOString(),
                    message: `${payer?.name || "Someone"} added "${sanitizeInput(expenseData.description)}" ₹${expenseData.amount} split between ${validParticipants.length} member(s)`,
                  },
                ],
              };
            }
            return g;
          })
        );

        return true;
      } catch (error) {
        console.error("Error adding expense:", error);
        setLastError("Failed to add expense. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [groups, setGroups]
  );

  const updateExpense = useCallback(
    async (
      groupId: string,
      expenseId: string,
      updates: Partial<Expense>
    ): Promise<boolean> => {
      try {
        setIsLoading(true);
        setLastError(null);

        const group = groups.find((g) => g.id === groupId);
        if (!group) {
          setLastError("Group not found");
          return false;
        }

        const expenseExists = group.expenses.some((e) => e.id === expenseId);
        if (!expenseExists) {
          setLastError("Expense not found");
          return false;
        }

        setGroups((prev) =>
          prev.map((g) => {
            if (g.id === groupId) {
              return {
                ...g,
                expenses: g.expenses.map((e) =>
                  e.id === expenseId
                    ? {
                        ...e,
                        ...updates,
                        description: updates.description
                          ? sanitizeInput(updates.description)
                          : e.description,
                      }
                    : e
                ),
                history: [
                  ...g.history,
                  {
                    id: generateId(),
                    timestamp: new Date().toISOString(),
                    message: `Expense "${updates.description || "item"}" was modified`,
                  },
                ],
              };
            }
            return g;
          })
        );

        return true;
      } catch (error) {
        console.error("Error updating expense:", error);
        setLastError("Failed to update expense. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [groups, setGroups]
  );

  const deleteExpense = useCallback(
    async (groupId: string, expenseId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setLastError(null);

        const group = groups.find((g) => g.id === groupId);
        if (!group) {
          setLastError("Group not found");
          return false;
        }

        const expense = group.expenses.find((e) => e.id === expenseId);
        if (!expense) {
          setLastError("Expense not found");
          return false;
        }

        setGroups((prev) =>
          prev.map((g) => {
            if (g.id === groupId) {
              return {
                ...g,
                expenses: g.expenses.filter((e) => e.id !== expenseId),
                history: [
                  ...g.history,
                  {
                    id: generateId(),
                    timestamp: new Date().toISOString(),
                    message: `Expense "${expense.description}" was deleted`,
                  },
                ],
              };
            }
            return g;
          })
        );

        return true;
      } catch (error) {
        console.error("Error deleting expense:", error);
        setLastError("Failed to delete expense. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [groups, setGroups]
  );

  const addMember = useCallback(
    async (groupId: string, name: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setLastError(null);

        const nameError = validateMemberName(name);
        if (nameError) {
          setLastError(nameError);
          return false;
        }

        const group = groups.find((g) => g.id === groupId);
        if (!group) {
          setLastError("Group not found");
          return false;
        }

        // Check for duplicate member names
        const duplicateName = group.members.some(
          (m) =>
            m.name.toLowerCase() === name.trim().toLowerCase() && m.isActive
        );
        if (duplicateName) {
          setLastError("A member with this name already exists");
          return false;
        }

        const newMember: Member = {
          id: generateId(),
          name: sanitizeInput(name),
          isActive: true,
        };

        setGroups((prev) =>
          prev.map((g) => {
            if (g.id === groupId) {
              return {
                ...g,
                members: [...g.members, newMember],
                history: [
                  ...g.history,
                  {
                    id: generateId(),
                    timestamp: new Date().toISOString(),
                    message: `${sanitizeInput(name)} added to group`,
                  },
                ],
              };
            }
            return g;
          })
        );

        return true;
      } catch (error) {
        console.error("Error adding member:", error);
        setLastError("Failed to add member. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [groups, setGroups]
  );

  const removeMember = useCallback(
    async (groupId: string, memberId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setLastError(null);

        const group = groups.find((g) => g.id === groupId);
        if (!group) {
          setLastError("Group not found");
          return false;
        }

        const member = group.members.find((m) => m.id === memberId);
        if (!member) {
          setLastError("Member not found");
          return false;
        }

        // Check if member has expenses
        const hasExpenses = group.expenses.some(
          (e) => e.paidBy === memberId || e.participants.includes(memberId)
        );

        if (hasExpenses) {
          // Soft delete - keep in history
          setGroups((prev) =>
            prev.map((g) => {
              if (g.id === groupId) {
                return {
                  ...g,
                  members: g.members.map((m) =>
                    m.id === memberId ? { ...m, isActive: false } : m
                  ),
                  history: [
                    ...g.history,
                    {
                      id: generateId(),
                      timestamp: new Date().toISOString(),
                      message: `${member.name} removed from group (kept in history)`,
                    },
                  ],
                };
              }
              return g;
            })
          );
        } else {
          // Hard delete if no expenses
          setGroups((prev) =>
            prev.map((g) => {
              if (g.id === groupId) {
                return {
                  ...g,
                  members: g.members.filter((m) => m.id !== memberId),
                  history: [
                    ...g.history,
                    {
                      id: generateId(),
                      timestamp: new Date().toISOString(),
                      message: `${member.name} removed from group`,
                    },
                  ],
                };
              }
              return g;
            })
          );
        }

        return true;
      } catch (error) {
        console.error("Error removing member:", error);
        setLastError("Failed to remove member. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [groups, setGroups]
  );

  const updateMember = useCallback(
    async (
      groupId: string,
      memberId: string,
      name: string
    ): Promise<boolean> => {
      try {
        setIsLoading(true);
        setLastError(null);

        const nameError = validateMemberName(name);
        if (nameError) {
          setLastError(nameError);
          return false;
        }

        const group = groups.find((g) => g.id === groupId);
        if (!group) {
          setLastError("Group not found");
          return false;
        }

        const member = group.members.find((m) => m.id === memberId);
        if (!member) {
          setLastError("Member not found");
          return false;
        }

        setGroups((prev) =>
          prev.map((g) => {
            if (g.id === groupId) {
              return {
                ...g,
                members: g.members.map((m) =>
                  m.id === memberId ? { ...m, name: sanitizeInput(name) } : m
                ),
                history: [
                  ...g.history,
                  {
                    id: generateId(),
                    timestamp: new Date().toISOString(),
                    message: `Member renamed from "${member.name}" to "${sanitizeInput(name)}"`,
                  },
                ],
              };
            }
            return g;
          })
        );

        return true;
      } catch (error) {
        console.error("Error updating member:", error);
        setLastError("Failed to update member. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [groups, setGroups]
  );

  const getGroup = useCallback(
    (id: string): Group | undefined => {
      return groups.find((g) => g.id === id);
    },
    [groups]
  );

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, [setDarkMode]);

  return (
    <AppContext.Provider
      value={{
        groups,
        addGroup,
        updateGroup,
        deleteGroup,
        addExpense,
        updateExpense,
        deleteExpense,
        addMember,
        removeMember,
        updateMember,
        darkMode,
        toggleDarkMode,
        getGroup,
        isLoading,
        lastError,
        clearError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
