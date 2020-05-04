import { EventObject, StateSchema, MachineOptions, MachineConfig } from 'xstate';
import { StateMachineStateName } from './types';
export declare class StateMachine<TState, TStateSchema extends StateSchema, TEvents extends EventObject> {
    state: TState;
    stateName: StateMachineStateName<TStateSchema>;
    stateHash: string;
    private machine;
    private interpreter;
    constructor(initialContext: TState, machineConfig: MachineConfig<TState, TStateSchema, TEvents>, configOptions?: Partial<MachineOptions<TState, TEvents>>);
    dispatch(action: TEvents): void;
    private onChange;
    private startInterpreter;
}
