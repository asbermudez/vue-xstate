import Vue from 'vue';
import {
    EventObject,
    StateSchema,
    MachineOptions,
    interpret,
    Machine,
    MachineConfig,
    Interpreter,
    StateNode
} from 'xstate';
import { v4 } from 'uuid';
import { Subject, Subscription } from 'rxjs';
import { Component, Prop } from 'vue-property-decorator';
import { StateMachineStateName, StateMachineProviderChange } from './types';

@Component
export default class XStateMixin<TContext, TStateSchema extends StateSchema, TEvents extends EventObject> extends Vue {
    @Prop()
    public channel?: Subject<TEvents>;

    public context: TContext = {} as TContext;
    public currentState: StateMachineStateName<TStateSchema> = '' as StateMachineStateName<TStateSchema>;
    public stateHash: string = v4();

    private $xStateStateMachine!: StateNode<TContext, TStateSchema, TEvents>;
    private $xStateInterpreter!: Interpreter<TContext, TStateSchema, TEvents>;
    private $xStateSubscription!: Subscription | null;

    public xStateInit(
        initialContext: TContext,
        machineConfig: MachineConfig<TContext, TStateSchema, TEvents>,
        configOptions: Partial<MachineOptions<TContext, TEvents>> = {},
    ): void {
        this.$xStateStateMachine = Machine<TContext, TStateSchema, TEvents>(
            machineConfig,
            {},
            initialContext,
        ).withConfig(configOptions);
        this.$xStateInterpreter = interpret<TContext, TStateSchema, TEvents>(this.$xStateStateMachine);
        this.$xStateSubscription =
            this.channel ? this.channel.subscribe((action) => this.$xStateInterpreter.send(action)) : null;

        this.$xStateHandleChange({
            currentState: this.$xStateStateMachine.initialState.value as StateMachineStateName<TStateSchema>,
            context: this.$xStateStateMachine.context,
            stateHash: v4(),
        });

        this.$xStateInitInterpreter();
    }

    public dispatch(action: TEvents): void {
        if (this.$xStateInitInterpreter) {
            this.$xStateInterpreter.send(action);
        } else {
            console.warn(`%cx-state mixin: %cThe machine was not initialized,
			 please use %cinitState() %con %ccreated() %cfor it`,
                'font-weight:bold; color:black', '', 'color:blue', '', 'color:blue', '');
        }
    }

    public beforeDestroy() {
        if (this.$xStateSubscription) {
            this.$xStateSubscription.unsubscribe();
        }
    }

    private $xStateHandleChange(change: StateMachineProviderChange<TContext, TStateSchema>): void {
        const {
            currentState = this.currentState,
            context = this.context,
            stateHash,
        } = change;

        this.currentState = currentState;
        this.context = context;
        this.stateHash = stateHash;
    }

    private $xStateInitInterpreter(): void {
        const interpreter = this.$xStateInterpreter;
        interpreter.start();

        interpreter.onTransition((newState) => {
            const { changed, value, context } = newState;

            if (changed && value !== this.currentState) {
                this.$xStateHandleChange({
                    currentState: value as StateMachineStateName<StateSchema>,
                    context,
                    stateHash: v4(),
                });
            }
        });

        interpreter.onChange((context) => {
            if (context !== this.context) {
                this.$xStateHandleChange({
                    context,
                    stateHash: v4(),
                });
            }
        });
    }
}
