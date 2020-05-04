import { StateMachine } from './class';

/// traffic-light.machine.ts

import { MachineConfig, StateNodeConfig } from 'xstate';
import { assign } from 'xstate/lib/actions';

// State machine context interface
export interface TrafficLightContext {
  carCount: number;
  finedPlates: string[];
}

// Initial context used in the xStateInit() method
export const TrafficLigtInitialContext: TrafficLightContext = {
  carCount: 0,
  finedPlates: [],
};

// Possible states of the machine
export enum TrafficLightStates {
  RED = 'RED',
  AMBER = 'AMBER',
  GREEN = 'GREEN',
}

// Possible actions of the whole machine
export enum TrafficLightActions {
  GO_GREEN = 'GO_GREEN',
  GO_AMBER = 'GO_AMBER',
  GO_RED = 'GO_RED',
  COUNT_CAR = 'COUNT_CAR',
  FINE_CAR = 'FINE_CAR',
}

// Utility interface to get proper types on our config
export interface TrafficLightSchema {
  states: {
    [state in TrafficLightStates]: StateNodeConfig<TrafficLightContext, TrafficLightSchema, TrafficLightEvent>;
  };
}

// Events that will be sent on the dispatch with their payload definition
export type TrafficLightEvent =
  | { type: TrafficLightActions.GO_GREEN }
  | { type: TrafficLightActions.GO_AMBER }
  | { type: TrafficLightActions.GO_RED }
  | { type: TrafficLightActions.COUNT_CAR }
  | { type: TrafficLightActions.FINE_CAR; plate: string };

// Definition of the state machine
export const TrafficLightMachineConfig: MachineConfig<TrafficLightContext, TrafficLightSchema, TrafficLightEvent> = {
  initial: TrafficLightStates.RED,
  states: {
    [TrafficLightStates.RED]: {
      on: {
        [TrafficLightActions.GO_GREEN]: {
          target: TrafficLightStates.GREEN,
        },
        [TrafficLightActions.FINE_CAR]: {
          actions: assign((ctx, event) => ({
            finedPlates: [...ctx.finedPlates, event.plate],
          })),
        },
      },
    },
    [TrafficLightStates.AMBER]: {
      on: {
        [TrafficLightActions.GO_RED]: {
          target: TrafficLightStates.RED,
        },
      },
    },
    [TrafficLightStates.GREEN]: {
      on: {
        [TrafficLightActions.GO_AMBER]: {
          target: TrafficLightStates.AMBER,
        },
        [TrafficLightActions.COUNT_CAR]: {
          actions: assign((ctx, event) => ({
            carCount: ctx.carCount + 1,
          })),
        },
      },
    },
  },
};

const stuff = new StateMachine(TrafficLigtInitialContext, TrafficLightMachineConfig);
