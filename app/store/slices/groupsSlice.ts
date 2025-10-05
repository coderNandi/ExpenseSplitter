
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Person } from './personSlice';

export interface GroupExpense {
  person: Person;
  amount: number;
}

export interface Group {
  id: string;
  name: string;
  members: Person[]; // array of selected contacts
  expenses: GroupExpense[]; // array of expenses for each person
}

const initialState: Group[] = [];

const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    addGroup: (state, action: PayloadAction<Group>) => {
      state.push({
        id: action.payload.id,
        name: action.payload.name,
        members: action.payload.members || [],
        expenses: action.payload.expenses || [],
      });
    },
    addExpenseToGroup: (
      state,
      action: PayloadAction<{ groupId: string; person: Person; amount: number }>
    ) => {
      const { groupId, person, amount } = action.payload;
      const group = state.find((g) => g.id === groupId);
      if (group) {
        group.expenses.push({ person, amount });
      }
    },
    // Add more reducers as needed
  },
});

export const { addGroup, addExpenseToGroup } = groupsSlice.actions;
export default groupsSlice.reducer;
