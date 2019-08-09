import { StateSchema, EventObject } from 'xstate';

export type StateMachineStateName<T extends StateSchema> = keyof T['states'];

export interface StateMachineAction<T> extends EventObject {
    data: Partial<T>;
}

export interface StateMachineProviderChange<TContext, TStateSchema extends StateSchema> {
    context?: TContext;
    currentState?: StateMachineStateName<TStateSchema>;
    stateHash: string;
}
