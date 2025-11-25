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
import { ArrowLeft, FileDown, History, Plus, Search } from "lucide-react";
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
  const [showExportMenu, setShowExportMenu] = useState(false);
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
        <p className="text-gray-600 dark:text-gray-400">Group not found</p>
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

    // Reset form
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header Card */}
        <div className="glass rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                {group.name}
              </h1>
              {group.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {group.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Spent
              </div>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(totalSpent)}
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="flex flex-wrap gap-2 mb-4">
            {activeMembers.map((member) => (
              <span
                key={member.id}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
              >
                {member.name}
              </span>
            ))}
            <button
              onClick={() => setShowMemberModal(true)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              <Plus className="w-3 h-3 inline mr-1" /> Add Member
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            {(["overview", "expenses", "history"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-slide-up">
            <div className="glass rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                Member Balances
              </h2>
              <div className="space-y-3">
                {balances.map((balance) => (
                  <div
                    key={balance.memberId}
                    className="flex justify-between items-center p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <span className="font-medium text-gray-800 dark:text-white">
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
                ))}
              </div>
            </div>

            {settlements.length > 0 && (
              <div className="glass rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                  Settlement Suggestions
                </h2>
                <div className="space-y-3">
                  {settlements.map((settlement, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800"
                    >
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {settlement.from}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {" "}
                        owes{" "}
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {settlement.to}
                      </span>
                      <span className="font-bold text-red-600 dark:text-red-400 ml-2">
                        {formatCurrency(settlement.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === "expenses" && (
          <div className="animate-slide-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                >
                  <option>All</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <Button onClick={() => setShowExpenseModal(true)}>
                <Plus className="w-5 h-5 inline mr-2" />
                Add Expense
              </Button>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 glass rounded-2xl">
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || categoryFilter !== "All"
                    ? "No expenses match your filters"
                    : "No expenses yet. Add your first expense!"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((expense) => {
                    const payer = group.members.find(
                      (m) => m.id === expense.paidBy
                    );
                    const splitAmount =
                      expense.amount / expense.participants.length;

                    return (
                      <div
                        key={expense.id}
                        className="glass rounded-2xl p-6 hover:shadow-xl transition-all"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                              {expense.description}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Paid by {payer?.name} • {formatDate(expense.date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">
                              {formatCurrency(expense.amount)}
                            </div>
                            <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs font-medium mt-1">
                              {expense.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Split between {expense.participants.length}{" "}
                            member(s) • {formatCurrency(splitAmount)} each
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
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors"
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
          <div className="glass rounded-2xl p-6 shadow-xl animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5" />
                Activity Log
              </h2>
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-4 py-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Export
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10">
                    <button
                      onClick={() => {
                        exportGroupAsJSON(group);
                        setShowExportMenu(false);
                      }}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      Export as JSON
                    </button>
                    <button
                      onClick={() => {
                        exportGroupAsCSV(group);
                        setShowExportMenu(false);
                      }}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      Export as CSV
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide">
              {group.history
                .slice()
                .reverse()
                .map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {formatDateTime(event.timestamp)}
                    </div>
                    <div className="text-sm text-gray-800 dark:text-white">
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
          title="Add Expense"
        >
          <Input
            label="Description *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Dinner at restaurant"
            autoFocus
          />
          <Input
            label="Amount (₹) *"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Paid By *
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="">Select member</option>
              {activeMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Split Between *
              </label>
              <button
                onClick={selectAllParticipants}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Select All
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
              {activeMembers.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={participants.includes(member.id)}
                    onChange={() => toggleParticipant(member.id)}
                    className="mr-3 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-800 dark:text-white">
                    {member.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowExpenseModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleAddExpense} className="flex-1">
              Add Expense
            </Button>
          </div>
        </Modal>

        {/* Add Member Modal */}
        <Modal
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          title="Add Member"
        >
          <Input
            label="Member Name *"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Enter name"
            autoFocus
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowMemberModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleAddMember} className="flex-1">
              Add Member
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default GroupDetail;
