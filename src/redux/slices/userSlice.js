import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dataProfile: null,
  loadingProfile: false,
  errorProfile: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.dataProfile = action.payload;
      state.loadingProfile = false;
      state.errorProfile = null;
    },
    setLoadingProfile: (state, action) => {
      state.loadingProfile = action.payload;
    },
    setErrorProfile: (state, action) => {
      state.errorProfile = action.payload;
      state.loadingProfile = false;
    },
    clearProfile: (state) => {
      state.dataProfile = null;
      state.loadingProfile = false;
      state.errorProfile = null;
    }
  }
});

export const { setProfile, setLoadingProfile, setErrorProfile, clearProfile } = userSlice.actions;
export default userSlice.reducer; 