"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { useApp } from "@/context/AppContext";
import {
  calculateBalances,
  calculateSettlements,
  exportGroupAsCSV,
  exportGroupAsJSON,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/lib/utils";
import { CATEGORIES } from "@/types";
import {
  ArrowLeft,
  BarChart3,
  Download,
  FileText,
  History,
  Plus,
  Search,
  Share2,
  UserPlus,
} from "lucide-react";
import React, { useState } from "react";

interface GroupDetailProps {
  groupId: string;
  onBack: () => void;
}

const GroupDetail: React.FC<GroupDetailProps> = ({ groupId, onBack }) => {
  const { groups, addExpense, deleteExpense, addMember } = useApp();
  const group = groups.find((g) => g.id === groupId);

  const [activeTab, setActiveTab] = useState<
    "overview" | "expenses" | "history"
  >("overview");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");

  // Expense form state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">Group not found</p>
        </div>
      </div>
    );
  }

  const activeMembers = group.members.filter((m) => m.isActive);
  const balances = calculateBalances(group);
  const settlements = calculateSettlements(balances);

  const handleAddExpense = () => {
    if (!description.trim()) {
      alert("Please enter a description");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (!paidBy) {
      alert("Please select who paid");
      return;
    }
    if (participants.length === 0) {
      alert("Please select at least one participant");
      return;
    }

    addExpense(groupId, {
      description: description.trim(),
      amount: parseFloat(amount),
      paidBy,
      participants,
      category,
      date,
    });

    setShowExpenseModal(false);
    setDescription("");
    setAmount("");
    setPaidBy("");
    setParticipants([]);
    setCategory(CATEGORIES[0]);
    setDate(new Date().toISOString().split("T")[0]);
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) {
      alert("Please enter a member name");
      return;
    }
    addMember(groupId, newMemberName.trim());
    setNewMemberName("");
    setShowMemberModal(false);
  };

  const toggleParticipant = (memberId: string) => {
    setParticipants((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllParticipants = () => {
    setParticipants(activeMembers.map((m) => m.id));
  };

  const filteredExpenses = group.expenses.filter((expense) => {
    const matchesSearch = expense.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalSpent = group.expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 transition-all duration-500">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-grid-white dark:bg-grid-dark opacity-10" />
      <div className="fixed top-1/3 right-1/4 w-80 h-80 bg-green-200/20 dark:bg-green-500/10 rounded-full blur-3xl animate-float" />

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="glass-panel p-8 mb-8 animate-slide-up">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={onBack}
                className="glass-button p-3 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {group.name}
                </h1>
                {group.description && (
                  <p className="text-gray-600 dark:text-gray-300">
                    {group.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="glass-card px-6 py-3 text-center sm:text-right">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Total Spent
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalSpent)}
                </div>
              </div>
              <Button
                onClick={() => setShowExpenseModal(true)}
                className="whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>

          {/* Members */}
          <div className="flex flex-wrap gap-3 mt-6">
            {activeMembers.map((member) => (
              <span
                key={member.id}
                className="glass-card px-4 py-2 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium backdrop-blur-sm"
              >
                {member.name}
              </span>
            ))}
            <button
              onClick={() => setShowMemberModal(true)}
              className="glass-button px-4 py-2 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium flex items-center gap-2 hover:scale-105 transition-all duration-300"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 glass-card p-2 rounded-2xl mb-8 w-fit mx-auto">
          {(["overview", "expenses", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize transition-all duration-300 rounded-xl flex items-center gap-2 ${
                activeTab === tab
                  ? "bg-white/20 dark:bg-black/20 text-gray-900 dark:text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab === "overview" && <BarChart3 className="w-4 h-4" />}
              {tab === "expenses" && <FileText className="w-4 h-4" />}
              {tab === "history" && <History className="w-4 h-4" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            {/* Balances */}
            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-500" />
                Member Balances
              </h2>
              <div className="space-y-4">
                {balances.map((balance, index) => (
                  <div
                    key={balance.memberId}
                    className="glass-card p-4 rounded-xl animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {balance.memberName}
                      </span>
                      <span
                        className={`font-bold text-lg ${
                          balance.balance > 0.01
                            ? "text-green-600 dark:text-green-400"
                            : balance.balance < -0.01
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {balance.balance > 0 ? "+" : ""}
                        {formatCurrency(balance.balance)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settlements */}
            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                <Share2 className="w-6 h-6 text-orange-500" />
                Settlement Suggestions
              </h2>
              <div className="space-y-4">
                {settlements.length > 0 ? (
                  settlements.map((settlement, index) => (
                    <div
                      key={index}
                      className="glass-card p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 animate-slide-up"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="text-center">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {settlement.from}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 mx-2">
                          owes
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {settlement.to}
                        </span>
                        <div className="font-bold text-orange-600 dark:text-orange-400 text-lg mt-2">
                          {formatCurrency(settlement.amount)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No settlements needed. Everything is balanced! 🎉
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === "expenses" && (
          <div className="animate-fade-in">
            <div className="glass-panel p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search expenses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="glass-input w-full pl-12 pr-4 py-3 rounded-xl"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="glass-input px-4 py-3 rounded-xl min-w-[140px]"
                  >
                    <option>All</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="glass-panel p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {searchQuery || categoryFilter !== "All"
                    ? "No expenses match your filters"
                    : "No expenses yet. Add your first expense!"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExpenses
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((expense, index) => {
                    const payer = group.members.find(
                      (m) => m.id === expense.paidBy
                    );
                    const splitAmount =
                      expense.amount / expense.participants.length;

                    return (
                      <div
                        key={expense.id}
                        className="glass-panel p-6 hover:scale-105 transition-all duration-500 animate-slide-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                              {expense.description}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Paid by{" "}
                              <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {payer?.name}
                              </span>{" "}
                              • {formatDate(expense.date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {formatCurrency(expense.amount)}
                            </div>
                            <span className="inline-block px-3 py-1 glass-card text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium mt-2">
                              {expense.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="text-gray-600 dark:text-gray-400">
                            Split between {expense.participants.length}{" "}
                            {expense.participants.length === 1
                              ? "person"
                              : "people"}{" "}
                            • {formatCurrency(splitAmount)} each
                          </div>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this expense?"
                                )
                              ) {
                                deleteExpense(groupId, expense.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-300 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="glass-panel p-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <History className="w-6 h-6 text-purple-500" />
                Activity Log
              </h2>
              <div className="flex gap-3">
                <Button
                  variant="glass"
                  onClick={() => exportGroupAsJSON(group)}
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
                <Button
                  variant="glass"
                  onClick={() => exportGroupAsCSV(group)}
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
              {group.history
                .slice()
                .reverse()
                .map((event, index) => (
                  <div
                    key={event.id}
                    className="glass-card p-4 rounded-xl animate-slide-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {formatDateTime(event.timestamp)}
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {event.message}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Add Expense Modal */}
        <Modal
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
          title="Add New Expense"
          size="lg"
        >
          <div className="space-y-6">
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Dinner at restaurant"
              autoFocus
            />
            <Input
              label="Amount (₹)"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Paid By
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="glass-input w-full rounded-xl px-4 py-3 text-gray-900 dark:text-white"
              >
                <option value="">Select member</option>
                {activeMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Split Between
                </label>
                <button
                  onClick={selectAllParticipants}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Select All
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {activeMembers.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center p-3 glass-card rounded-xl cursor-pointer hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-300"
                  >
                    <input
                      type="checkbox"
                      checked={participants.includes(member.id)}
                      onChange={() => toggleParticipant(member.id)}
                      className="mr-3 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {member.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="glass-input w-full rounded-xl px-4 py-3 text-gray-900 dark:text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <div className="flex gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowExpenseModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleAddExpense} className="flex-1">
                Add Expense
              </Button>
            </div>
          </div>
        </Modal>

        {/* Add Member Modal */}
        <Modal
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          title="Add New Member"
        >
          <div className="space-y-6">
            <Input
              label="Member Name"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Enter name"
              autoFocus
              icon={<UserPlus className="w-4 h-4" />}
            />
            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowMemberModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleAddMember} className="flex-1">
                Add Member
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default GroupDetail;
