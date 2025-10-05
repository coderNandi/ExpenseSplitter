import { addExpenseToGroup } from "@/app/store/slices/groupsSlice";
import { Person } from "@/app/store/slices/personSlice";
import { MaterialIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const GroupDetails: React.FC = () => {
  const route = useRoute<any>();
  const { groupId } = route.params;
  const group = useSelector((state: RootState) =>
    state.groups.find((g) => g.id === groupId)
  );
  const dispatch = useDispatch();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [amount, setAmount] = useState("");

  if (!group) {
    return (
      <View style={styles.container}>
        <Text>Group not found.</Text>
      </View>
    );
  }

  const handleRemoveMember = (id: string) => {
    // Here you would dispatch an action to remove the member from the group
  };

  const handleAddExpense = () => {
    if (!selectedPerson) return;
    dispatch(
      addExpenseToGroup({
        groupId: group.id,
        person: selectedPerson,
        amount: parseFloat(amount) || 0,
      })
    );
    setModalVisible(false);
    setSelectedPerson(null);
    setAmount("");
    // Optionally, show a toast or alert
  };

  return (
    <View style={styles.container}>
      <Text style={styles.groupName}>{group.name}</Text>
      <Text style={styles.sectionTitle}>Members</Text>
      <View style={styles.membersWrap}>
        {(group.members || []).length === 0 ? (
          <Text style={{ color: "#888", textAlign: "center" }}>
            No members in this group.
          </Text>
        ) : (
          group.members.map((item) => (
            <View key={item.id} style={styles.memberRow}>
              <Text style={styles.memberName}>{item.name}</Text>
              <TouchableOpacity onPress={() => handleRemoveMember(item.id)}>
                <MaterialIcons
                  name="close"
                  size={20}
                  color="#fff"
                  style={styles.removeIcon}
                />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Expenses List */}
      <Text style={styles.sectionTitle}>Expenses</Text>
      {group.expenses && group.expenses.length > 0 ? (
        <View style={styles.expensesWrap}>
          {group.expenses.map((exp, idx) => (
            <View key={idx} style={styles.expenseRow}>
              <Text style={styles.expensePerson}>{exp.person.name}</Text>
              <Text style={styles.expenseAmount}>₹{exp.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ color: '#888', marginBottom: 16 }}>No expenses yet.</Text>
      )}

      <TouchableOpacity
        style={styles.addExpenseButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>
  
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <Text style={styles.modalLabel}>Select Member</Text>
            <FlatList
              data={group.members}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.personOption,
                    selectedPerson?.id === item.id &&
                      styles.selectedPersonOption,
                  ]}
                  onPress={() => setSelectedPerson(item)}
                >
                  <Text
                    style={{
                      color: selectedPerson?.id === item.id ? "#fff" : "#222",
                    }}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              horizontal
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.modalLabel}>Amount</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="Enter amount"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))}
              keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 24,
                gap: 12,
              }}
            >
              <TouchableOpacity
                onPress={handleAddExpense}
                style={[
                  styles.modalAddButton,
                  !selectedPerson && { opacity: 0.5 },
                ]}
                disabled={!selectedPerson}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalCancelButton, { borderColor: '#000', backgroundColor: '#fff' }]}
              >
                <Text style={{ color: "#000", fontWeight: "bold" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Settlement Calculation Section */}
      {group.expenses && group.expenses.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Settlement</Text>
          {(() => {
            // Calculate total paid per person
            const paidMap: Record<string, number> = {};
            group.members.forEach((m) => (paidMap[m.id] = 0));
            group.expenses.forEach((exp) => {
              paidMap[exp.person.id] = (paidMap[exp.person.id] || 0) + exp.amount;
            });
            // Calculate share per person
            const total = group.expenses.reduce((sum, exp) => sum + exp.amount, 0);
            const n = group.members.length;
            const share = n > 0 ? total / n : 0;
            // Calculate net balance per person
            const netMap: Record<string, number> = {};
            group.members.forEach((m) => {
              netMap[m.id] = (paidMap[m.id] || 0) - share;
            });
            // Find who pays whom
            const settlements: { from: string; to: string; amount: number }[] = [];
            // Clone netMap for mutation
            const netArr = group.members.map((m) => ({ id: m.id, name: m.name, balance: netMap[m.id] }));
            // Sort debtors (negative) and creditors (positive)
            let debtors = netArr.filter((p) => p.balance < -0.01).sort((a, b) => a.balance - b.balance);
            let creditors = netArr.filter((p) => p.balance > 0.01).sort((a, b) => b.balance - a.balance);
            while (debtors.length && creditors.length) {
              const debtor = debtors[0];
              const creditor = creditors[0];
              const amount = Math.min(-debtor.balance, creditor.balance);
              if (amount > 0.01) {
                settlements.push({ from: debtor.name, to: creditor.name, amount });
                debtor.balance += amount;
                creditor.balance -= amount;
              }
              if (Math.abs(debtor.balance) < 0.01) debtors.shift();
              if (creditor.balance < 0.01) creditors.shift();
            }
            if (settlements.length === 0) {
              return <Text style={{ color: '#888', marginBottom: 8 }}>All settled up!</Text>;
            }
            return settlements.map((s, idx) => (
              <Text key={idx} style={{ color: '#222', marginBottom: 4 }}>
                {s.from} pays {s.to} <Text style={{ fontWeight: 'bold' }}>₹{s.amount.toFixed(2)}</Text>
              </Text>
            ));
          })()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  groupName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  membersWrap: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    elevation: 1,
    marginBottom: 16,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  memberName: {
    fontSize: 18,
    color: "#222",
  },
  removeIcon: {
    marginLeft: 12,
  },
  expensesWrap: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    elevation: 1,
    marginBottom: 16,
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  expensePerson: {
    fontSize: 16,
    color: "#333",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#e53935",
  },
  addExpenseButton: {
    backgroundColor: "#007bff",
    borderRadius: 50,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 16,
    right: 16,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 24,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  personOption: {
    backgroundColor: "#f1f1f1",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  selectedPersonOption: {
    backgroundColor: "#007bff",
  },
  amountInput: {
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  modalAddButton: {
    backgroundColor: "#28a745",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelButton: {
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default GroupDetails;
