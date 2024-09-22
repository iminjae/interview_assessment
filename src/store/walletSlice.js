import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  address: null,
  signer: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWallet: (state, action) => {
      state.address = action.payload.address;
      state.signer = action.payload.signer;
    },
    clearWallet: (state) => {
      state.address = null;
      state.signer = null;
    },
  },
});

export const { setWallet, clearWallet } = walletSlice.actions;
export default walletSlice.reducer;
