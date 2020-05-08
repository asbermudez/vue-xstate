import {
  EventObject,
  StateSchema,
  MachineOptions,
  interpret,
  Machine,
  MachineConfig,
  Interpreter,
  StateNode,
} from 'xstate';
import { v4 } from 'uuid';
import { StateMachineStateName, StateMachineProviderChange } from './types';

export class StateMachine<TContext, TStateSchema extends StateSchema, TEvents extends EventObject> {
  private $context: TContext = {} as TContext;

  public $state: StateMachineStateName<TStateSchema> = '' as StateMachineStateName<TStateSchema>;

  public $stateHash: string = v4();

  private $machine: StateNode<TContext, TStateSchema, TEvents>;

  private $interpreter: Interpreter<TContext, TStateSchema, TEvents>;

  public get context(): TContext {
    return this.$context;
  }

  public get state(): StateMachineStateName<TStateSchema> {
    return this.$state;
  }

  public get stateHash(): string {
    return this.$stateHash;
  }

  constructor(
    initialContext: TContext,
    machineConfig: MachineConfig<TContext, TStateSchema, TEvents>,
    configOptions: Partial<MachineOptions<TContext, TEvents>> = {},
  ) {
    this.$machine = Machine<TContext, TStateSchema, TEvents>(machineConfig, {}, initialContext).withConfig(
      configOptions,
    );
    this.$interpreter = interpret<TContext, TStateSchema, TEvents>(this.$machine);

    this.onChange({
      currentState: this.$machine.initialState.value as StateMachineStateName<TStateSchema>,
      context: this.$machine.context,
      stateHash: v4(),
    });

    this.startInterpreter();
  }

  public dispatch(action: TEvents): void {
    this.$interpreter.send(action);
  }

  private onChange(change: StateMachineProviderChange<TContext, TStateSchema>): void {
    const { currentState = this.state, context = this.context, stateHash } = change;

    this.$state = currentState;
    this.$context = context;
    this.$stateHash = stateHash;
  }

  private startInterpreter(): void {
    this.$interpreter.start();

    this.$interpreter.onTransition((newState) => {
      const { changed, value, context } = newState;

      if (changed && value !== this.state) {
        this.onChange({
          currentState: value as StateMachineStateName<StateSchema>,
          context,
          stateHash: v4(),
        });
      }
    });

    this.$interpreter.onChange((context) => {
      if (context !== this.context) {
        this.onChange({
          context,
          stateHash: v4(),
        });
      }
    });
  }
}
