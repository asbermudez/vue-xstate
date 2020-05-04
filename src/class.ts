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

export class StateMachine<TState, TStateSchema extends StateSchema, TEvents extends EventObject> {
  public state: TState = {} as TState;

  public stateName: StateMachineStateName<TStateSchema> = '' as StateMachineStateName<TStateSchema>;

  public stateHash: string = v4();

  private machine: StateNode<TState, TStateSchema, TEvents>;

  private interpreter: Interpreter<TState, TStateSchema, TEvents>;

  constructor(
    initialContext: TState,
    machineConfig: MachineConfig<TState, TStateSchema, TEvents>,
    configOptions: Partial<MachineOptions<TState, TEvents>> = {},
  ) {
    this.machine = Machine<TState, TStateSchema, TEvents>(machineConfig, {}, initialContext).withConfig(configOptions);
    this.interpreter = interpret<TState, TStateSchema, TEvents>(this.machine);

    this.onChange({
      currentState: this.machine.initialState.value as StateMachineStateName<TStateSchema>,
      context: this.machine.context,
      stateHash: v4(),
    });

    this.startInterpreter();
  }

  public dispatch(action: TEvents): void {
    this.interpreter.send(action);
  }

  private onChange(change: StateMachineProviderChange<TState, TStateSchema>): void {
    const { currentState = this.stateName, context = this.state, stateHash } = change;

    this.stateName = currentState;
    this.state = context;
    this.stateHash = stateHash;
  }

  private startInterpreter(): void {
    this.interpreter.start();

    this.interpreter.onTransition(newState => {
      const { changed, value, context } = newState;

      if (changed && value !== this.stateName) {
        this.onChange({
          currentState: value as StateMachineStateName<StateSchema>,
          context,
          stateHash: v4(),
        });
      }
    });

    this.interpreter.onChange(context => {
      if (context !== this.state) {
        this.onChange({
          context,
          stateHash: v4(),
        });
      }
    });
  }
}
