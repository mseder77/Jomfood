import React, { createContext, useContext, useReducer } from 'react';

// API Context for global state management
const ApiContext = createContext();

// Action types
const API_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_RESTAURANTS: 'SET_RESTAURANTS',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_SELECTED_CATEGORY: 'SET_SELECTED_CATEGORY',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState = {
  loading: false,
  error: null,
  restaurants: [],
  categories: [],
  selectedCategory: null,
  filters: {
    dietary: null,
    dish: null,
    recommendation: null,
    bakery: null,
    cuisine: null,
    location: null,
    sortBy: 'recommended'
  },
  filterOptions: {
    dietary: [],
    cuisines: [],
    areas: [],
    dishTypes: []
  }
};

// Reducer function
const apiReducer = (state, action) => {
  switch (action.type) {
    case API_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case API_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case API_ACTIONS.SET_RESTAURANTS:
      return { ...state, restaurants: action.payload, loading: false, error: null };
    
    case API_ACTIONS.SET_CATEGORIES:
      return { ...state, categories: action.payload, loading: false, error: null };
    
    case API_ACTIONS.SET_SELECTED_CATEGORY:
      return { ...state, selectedCategory: action.payload };
    
    case API_ACTIONS.SET_FILTERS:
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload } 
      };
    
    case API_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// API Provider component
export const ApiProvider = ({ children }) => {
  const [state, dispatch] = useReducer(apiReducer, initialState);

  // Action creators
  const actions = {
    setLoading: (loading) => 
      dispatch({ type: API_ACTIONS.SET_LOADING, payload: loading }),
    
    setError: (error) => 
      dispatch({ type: API_ACTIONS.SET_ERROR, payload: error }),
    
    setRestaurants: (restaurants) => 
      dispatch({ type: API_ACTIONS.SET_RESTAURANTS, payload: restaurants }),
    
    setCategories: (categories) => 
      dispatch({ type: API_ACTIONS.SET_CATEGORIES, payload: categories }),
    
    setSelectedCategory: (category) => 
      dispatch({ type: API_ACTIONS.SET_SELECTED_CATEGORY, payload: category }),
    
    setFilters: (filters) => 
      dispatch({ type: API_ACTIONS.SET_FILTERS, payload: filters }),
    
    clearError: () => 
      dispatch({ type: API_ACTIONS.CLEAR_ERROR }),
  };

  const value = {
    ...state,
    ...actions,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

// Custom hook to use API context
export const useApiContext = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
};

export default ApiContext;
