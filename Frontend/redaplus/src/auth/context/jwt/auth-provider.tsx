'use client';

import React, { useMemo, useEffect, useReducer, useCallback } from 'react';

import axios, { endpoints, setSession } from 'src/utils/axios';

import { isValidToken } from './utils';
import { AuthContext } from './auth-context';
import { ICategory } from '../../../types/category';
import { AuthUserType, ActionMapType, AuthStateType } from '../../types';
import { currentEntityIdNullKey, currentEntityIdStorageKey } from '../../../types/general';

// ----------------------------------------------------------------------
/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */
// ----------------------------------------------------------------------

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT',
  SET_CURRENT_ENTITY = 'SET_CURRENT_ENTITY',
}

type Payload = {
  [Types.INITIAL]: {
    user: AuthUserType;
  };
  [Types.LOGIN]: {
    user: AuthUserType;
  };
  [Types.REGISTER]: {
    user: AuthUserType;
  };
  [Types.SET_CURRENT_ENTITY]: {
    currentEntity: Partial<ICategory> | null;
  };
  [Types.LOGOUT]: undefined;
};

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>];

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  user: null,
  loading: true,
  currentEntity: null,
};

const reducer = (state: AuthStateType, action: ActionsType) => {
  if (action.type === Types.INITIAL) {
    localStorage.setItem(currentEntityIdStorageKey, currentEntityIdNullKey);
    return {
      loading: false,
      user: action.payload.user,
      currentEntity: null,
    };
  }
  if (action.type === Types.LOGIN) {
    localStorage.setItem(currentEntityIdStorageKey, currentEntityIdNullKey);
    const { user: u } = action.payload;
    const allowed_categories = u?.allowed_categories ?? [];
    let currentEntity = null;
    if (allowed_categories.length === 1) {
      currentEntity = allowed_categories[0];
      if (currentEntity.id) {
        localStorage.setItem(currentEntityIdStorageKey, currentEntity.id);
      }
    }
    return {
      ...state,
      user: action.payload.user,
      currentEntity: currentEntity ?? null,
    };
  }
  if (action.type === Types.SET_CURRENT_ENTITY) {
    localStorage.setItem(
      currentEntityIdStorageKey,
      action.payload.currentEntity?.id ?? currentEntityIdNullKey
    );
    return {
      ...state,
      currentEntity: action.payload.currentEntity,
    };
  }
  if (action.type === Types.REGISTER) {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    localStorage.setItem(currentEntityIdStorageKey, currentEntityIdNullKey);
    return {
      ...state,
      user: null,
      currentEntity: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = '@@access_token';

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    const accessToken = localStorage.getItem(STORAGE_KEY);
    const userString = localStorage.getItem('@user');

    if (accessToken && userString) {
      if (isValidToken(accessToken)) {
        setSession(accessToken);
        const user = JSON.parse(userString);
        dispatch({ type: Types.INITIAL, payload: { user } });
        return;
      }
    }
    // fallback logout / reset state
    dispatch({ type: Types.INITIAL, payload: { user: null } });
  }, []);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const logout = useCallback(async () => {
    setSession(null);
    dispatch({
      type: Types.LOGOUT,
    });
  }, []);

  // LOGIN
  const login = useCallback(async (email: string, password: string) => {
    const res = await axios.post(endpoints.auth.login, { email, password });
    const { access_token, user } = res.data;

    localStorage.setItem(STORAGE_KEY, access_token);
    localStorage.setItem('@user', JSON.stringify(user));
    setSession(access_token);

    dispatch({
      type: Types.LOGIN,
      payload: { user },
    });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      currentEntity: state.currentEntity,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      logout,
    }),
    [state.currentEntity, login, logout, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
