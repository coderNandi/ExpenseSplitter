import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Person {
  id: string;
  name: string;
  mobile: string;
  upi: string;
}

const initialState: Person[] = [];

const personSlice = createSlice({
  name: 'persons',
  initialState,
  reducers: {
    addPerson: (state, action: PayloadAction<Person>) => {
      state.push(action.payload);
    },
    // Add more reducers as needed
  },
});

export const { addPerson } = personSlice.actions;
export default personSlice.reducer;
