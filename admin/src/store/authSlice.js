import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  aToken: localStorage.getItem('aToken') || '',
  dToken: localStorage.getItem('dToken') || '',
  docData: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAToken: (state, action) => {
      state.aToken = action.payload;
      if (action.payload) {
        localStorage.setItem('aToken', action.payload);
      } else {
        localStorage.removeItem('aToken');
      }
    },
    setDToken: (state, action) => {
      state.dToken = action.payload;
      if (action.payload) {
        localStorage.setItem('dToken', action.payload);
      } else {
        localStorage.removeItem('dToken');
      }
    },
    setDocData: (state, action) => {
      state.docData = action.payload;
    },
    adminLogout: (state) => {
      state.aToken = '';
      localStorage.removeItem('aToken');
    },
    doctorLogout: (state) => {
      state.dToken = '';
      state.docData = null;
      localStorage.removeItem('dToken');
    },
  },
});

export const { setAToken, setDToken, setDocData, adminLogout, doctorLogout } = authSlice.actions;
export default authSlice.reducer;
