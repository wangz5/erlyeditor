import reduceReducers from 'reduce-reducers';
import { createReducer } from 'redux-act';
import { combineTransform } from '../reducers';

import filtersReducer from './filters';
import layersReducer from './layers';

import video from '../html5video';
import player from '../player';

import initialState from './initialState';
import {
  update,
  createFilter
} from './actions';

export selector from './selector';
export const partial = combineTransform({
  video,
  player,
  layers: layersReducer,
  filters: filtersReducer
});

let filterId = 100;
const filterDefaults = {
  visible: true,
  locked: false
};

export const editor = createReducer({
  [update]: ({ filters, ...state }, { currentTime }) => {
    const activeFilters = Object.values(filters)
      .filter(filter => {
        const { offset, duration } = filter.timeline;
        return currentTime >= offset && currentTime < (offset + duration);
      }).map(f => f.id);

    return {
      ...state,
      filters,
      activeFilters
    };
  },

  [createFilter]: (state, { layerId, type }) => {
    const {
      filterTypes,
      layers,
      filters
    } = state;

    const filterType = filterTypes[type];
    const layer = layers[layerId];

    const nextId = ++filterId;
    const newFilterId = `${type}${nextId}`;

    const { timeline, appearance } = filterType;

    const newFilter = {
      type,
      layerId,
      id: newFilterId,
      timeline,
      appearance,
      ...filterDefaults,
      attributes: { ...filterType.defaults }
    };

    return {
      ...state,
      filters: {
        ...filters,
        [newFilterId]: newFilter
      },
      layers: {
        ...layers,
        [layerId]: {
          ...layer,
          filters: [...layer.filters, newFilterId]
        }
      }
    };
  }
}, initialState);

export default reduceReducers(editor, partial);
