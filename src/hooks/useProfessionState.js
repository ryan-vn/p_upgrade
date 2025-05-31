import { useReducer } from 'react';

export const ACTIONS = {
  SET_PRICE_MANUAL: 'SET_PRICE_MANUAL',
  SET_PRICE_DATA_LIST: 'SET_PRICE_DATA_LIST',
  SET_USER_CONFIG: 'SET_USER_CONFIG',
  UPDATE_USER_CONFIG: 'UPDATE_USER_CONFIG',
  SET_LIST_STATUS: 'SET_LIST_STATUS',
  SET_IMPORT_MODAL_SHOW: 'SET_IMPORT_MODAL_SHOW',
  SET_IMPORT_DATA_STR: 'SET_IMPORT_DATA_STR',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_STICK: 'SET_STICK',
  SET_PRICE_DATA: 'SET_PRICE_DATA',
  SET_MATERIAL_MODAL_SHOW: 'SET_MATERIAL_MODAL_SHOW',
  SET_PATH_DATA: 'SET_PATH_DATA',
  SET_PROCESS_INDEX: 'SET_PROCESS_INDEX',
  SET_PROCESS_STOP: 'SET_PROCESS_STOP',
  SET_HOVER_ITEM: 'SET_HOVER_ITEM',
  SET_HIGHLIGHT_ITEM: 'SET_HIGHLIGHT_ITEM',
  SET_LOADING_GLOBAL: 'SET_LOADING_GLOBAL',
  SET_LOADING_PRICE_DATA: 'SET_LOADING_PRICE_DATA',
  SET_PRICEDATA_ERROR: 'SET_PRICEDATA_ERROR',
};

export const initialState = {
  priceManual: false,
  priceDataList: [],
  userConfig: JSON.parse(window.localStorage.getItem('userConfig') || '{}'),
  listStatus: 'init',
  importModalShow: false,
  importDataStr: '',
  messages: [],
  stick: false,
  priceData: JSON.parse(window.localStorage.getItem('priceData') || '{}'),
  materialModalShow: false,
  pathData: undefined,
  processIndex: 1,
  processStop: false,
  hoverItem: null,
  highLightItem: null,
  loadingGlobal: false,
  loadingPriceData: false,
  priceDataError: false,
};

export function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_PRICE_MANUAL:
      return { ...state, priceManual: action.payload };
    case ACTIONS.SET_PRICE_DATA_LIST:
      return { ...state, priceDataList: action.payload };
    case ACTIONS.SET_USER_CONFIG:
      return { ...state, userConfig: action.payload };
    case ACTIONS.UPDATE_USER_CONFIG:
      return { ...state, userConfig: { ...state.userConfig, ...action.payload } };
    case ACTIONS.SET_LIST_STATUS:
      return { ...state, listStatus: action.payload };
    case ACTIONS.SET_IMPORT_MODAL_SHOW:
      return { ...state, importModalShow: action.payload };
    case ACTIONS.SET_IMPORT_DATA_STR:
      return { ...state, importDataStr: action.payload };
    case ACTIONS.SET_MESSAGES:
      return { ...state, messages: action.payload };
    case ACTIONS.ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.payload] };
    case ACTIONS.SET_STICK:
      return { ...state, stick: action.payload };
    case ACTIONS.SET_PRICE_DATA:
      return { ...state, priceData: action.payload };
    case ACTIONS.SET_MATERIAL_MODAL_SHOW:
      return { ...state, materialModalShow: action.payload };
    case ACTIONS.SET_PATH_DATA:
      return { ...state, pathData: action.payload };
    case ACTIONS.SET_PROCESS_INDEX:
      return { ...state, processIndex: action.payload };
    case ACTIONS.SET_PROCESS_STOP:
      return { ...state, processStop: action.payload };
    case ACTIONS.SET_HOVER_ITEM:
      return { ...state, hoverItem: action.payload };
    case ACTIONS.SET_HIGHLIGHT_ITEM:
      return { ...state, highLightItem: action.payload };
    case ACTIONS.SET_LOADING_GLOBAL:
      return { ...state, loadingGlobal: action.payload };
    case ACTIONS.SET_LOADING_PRICE_DATA:
      return { ...state, loadingPriceData: action.payload };
    case ACTIONS.SET_PRICEDATA_ERROR:
      return { ...state, priceDataError: action.payload };
    default:
      return state;
  }
}

export function useProfessionState() {
  return useReducer(reducer, initialState);
} 