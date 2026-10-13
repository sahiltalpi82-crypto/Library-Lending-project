import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { getCategories, getStudents } from '../api.js';

// Global shared state: categories, students and toast notifications.
const initialState = { categories: [], students: [], toasts: [] };

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_STUDENTS':
      return { ...state, students: action.payload };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshCategories = useCallback(async () => {
    try {
      const res = await getCategories();
      dispatch({ type: 'SET_CATEGORIES', payload: res.data });
    } catch {
      // the pages show their own error; categories simply stay empty
    }
  }, []);

  const refreshStudents = useCallback(async () => {
    try {
      const res = await getStudents();
      dispatch({ type: 'SET_STUDENTS', payload: res.data });
    } catch {
      // ignore, pages show their own error
    }
  }, []);

  // show a toast: notify('success' | 'error', 'message')
  const notify = useCallback((type, message) => {
    dispatch({ type: 'ADD_TOAST', payload: { id: Date.now() + Math.random(), type, message } });
  }, []);

  useEffect(() => {
    refreshCategories();
    refreshStudents();
  }, [refreshCategories, refreshStudents]);

  const value = { ...state, dispatch, notify, refreshCategories, refreshStudents };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
