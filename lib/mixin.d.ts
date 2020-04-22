import { EventObject, StateSchema, MachineOptions, MachineConfig } from 'xstate';
import { Subject } from 'rxjs';
import { Vue } from 'vue-property-decorator';
import { StateMachineStateName } from './types';
export declare class XStateMixin<TContext, TStateSchema extends StateSchema, TEvents extends EventObject> extends Vue {
    channel?: Subject<TEvents>;
    context: TContext;
    currentState: StateMachineStateName<TStateSchema>;
    stateHash: string;
    private $xStateStateMachine;
    private $xStateInterpreter;
    private $xStateSubscription;
    xStateInit(initialContext: TContext, machineConfig: MachineConfig<TContext, TStateSchema, TEvents>, configOptions?: Partial<MachineOptions<TContext, TEvents>>): void;
    dispatch(action: TEvents): void;
    beforeDestroy(): void;
    private $xStateHandleChange;
    private $xStateInitInterpreter;
}
