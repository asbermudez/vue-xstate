import { StateSchema, EventObject } from 'xstate';

export type StateMachineStateName<T extends StateSchema> = keyof T['states'];

export interface StateMachineProviderChange<TContext, TStateSchema extends StateSchema> {
  context?: TContext;
  currentState?: StateMachineStateName<TStateSchema>;
  stateHash: string;
}
