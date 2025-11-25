"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { useApp } from "@/context/AppContext";
import {
  calculateBalances,
  formatCurrency,
  generateId,
  validateGroupName,
  validateMemberName,
} from "@/lib/utils";
import { Member } from "@/types";
import { ArrowRight, Plus, Trash2, Users } from "lucide-react";
import React, { useState } from "react";

interface DashboardProps {
  onSelectGroup: (groupId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectGroup }) => {
  const { groups, addGroup, deleteGroup, isLoading } = useApp();
  const toast = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [memberNames, setMemberNames] = useState([""]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreateGroup = async () => {
    setErrors({});

    const nameError = validateGroupName(groupName);
    if (nameError) {
      setErrors((prev) => ({ ...prev, groupName: nameError }));
      return;
    }

    const validMembers: Member[] = [];
    const memberErrors: Record<string, string> = {};

    memberNames.forEach((name, index) => {
      if (name.trim()) {
        const error = validateMemberName(name);
        if (error) {
          memberErrors[`member-${index}`] = error;
        } else {
          validMembers.push({
            id: generateId(),
            name: name.trim(),
            isActive: true,
          });
        }
      }
    });

    if (Object.keys(memberErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...memberErrors }));
      return;
    }

    if (validMembers.length === 0) {
      setErrors((prev) => ({
        ...prev,
        members: "At least one member is required",
      }));
      return;
    }

    const success = await addGroup({
      name: groupName.trim(),
      description: groupDescription.trim(),
      members: validMembers,
    });

    if (success) {
      toast.success(`Group "${groupName}" created successfully!`);
      setShowCreateModal(false);
      setGroupName("");
      setGroupDescription("");
      setMemberNames([""]);
      setErrors({});
    } else {
      toast.error("Failed to create group. Please try again.");
    }
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    const success = await deleteGroup(id);
    if (success) {
      toast.success(`Group "${name}" deleted`);
      setDeleteConfirmId(null);
    } else {
      toast.error("Failed to delete group");
    }
  };

  const addMemberField = () => {
    if (memberNames.length < 10) {
      setMemberNames([...memberNames, ""]);
    } else {
      toast.warning("Maximum 10 members can be added at once");
    }
  };

  const updateMemberName = (index: number, value: string) => {
    const updated = [...memberNames];
    updated[index] = value;
    setMemberNames(updated);
    if (errors[`member-${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`member-${index}`];
      setErrors(newErrors);
    }
  };

  const removeMemberField = (index: number) => {
    if (memberNames.length > 1) {
      setMemberNames(memberNames.filter((_, i) => i !== index));
      if (errors[`member-${index}`]) {
        const newErrors = { ...errors };
        delete newErrors[`member-${index}`];
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Money Splits
            </h1>
            <p className="text-gray-600">Track expenses with friends</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            New Group
          </Button>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                No groups yet
              </h2>
              <p className="text-gray-600 mb-6">
                Create your first group to start tracking expenses
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                Create Your First Group
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const balances = calculateBalances(group);
              const totalSpent = group.expenses.reduce(
                (sum, e) => sum + e.amount,
                0
              );
              const myBalance = balances[0]?.balance || 0;
              const activeMembers = group.members.filter((m) => m.isActive);

              return (
                <div
                  key={group.id}
                  className="minimal-card p-6 cursor-pointer group"
                  onClick={() => onSelectGroup(group.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-black transition-colors">
                      {group.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(group.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-600"
                      title="Delete group"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {group.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {group.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {activeMembers.length} member
                      {activeMembers.length === 1 ? "" : "s"}
                    </span>
                    <span>{formatCurrency(totalSpent)}</span>
                  </div>

                  {Math.abs(myBalance) > 0.01 && (
                    <div
                      className={`text-sm font-medium px-3 py-1.5 rounded ${
                        myBalance > 0
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {myBalance > 0
                        ? `You get ${formatCurrency(myBalance)}`
                        : `You owe ${formatCurrency(Math.abs(myBalance))}`}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      {group.expenses.length} expenses
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Group Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setErrors({});
          }}
          title="Create New Group"
        >
          <div className="space-y-4">
            <Input
              label="Group Name"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                if (errors.groupName) {
                  setErrors((prev) => ({ ...prev, groupName: "" }));
                }
              }}
              error={errors.groupName}
              placeholder="e.g., Goa Trip, Flatmates"
              autoFocus
            />
            <Input
              label="Description (Optional)"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="e.g., Summer vacation expenses"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Members
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {memberNames.map((name, index) => (
                  <div key={index}>
                    <div className="flex gap-2">
                      <input
                        value={name}
                        onChange={(e) =>
                          updateMemberName(index, e.target.value)
                        }
                        placeholder={`Member ${index + 1} name`}
                        className="minimal-input flex-1"
                      />
                      {memberNames.length > 1 && (
                        <button
                          onClick={() => removeMemberField(index)}
                          className="px-3 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm"
                          type="button"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {errors[`member-${index}`] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[`member-${index}`]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {errors.members && (
                <p className="mt-2 text-sm text-red-600">{errors.members}</p>
              )}
              <Button
                variant="secondary"
                onClick={addMemberField}
                className="w-full mt-2"
                type="button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Member
              </Button>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  setErrors({});
                }}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateGroup}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <Modal
            isOpen={true}
            onClose={() => setDeleteConfirmId(null)}
            title="Delete Group?"
          >
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this group? This action cannot be
              undone and all expenses will be lost.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const group = groups.find((g) => g.id === deleteConfirmId);
                  if (group) {
                    handleDeleteGroup(deleteConfirmId, group.name);
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
                disabled={isLoading}
              >
                Delete
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
