import { MachineConfig, MachineOptions, interpret, createMachine } from 'xstate';
import { StateMachine } from '../../src/index';

jest.mock('xstate', () => ({
  Machine: jest.fn().mockImplementation((a: {}, b: {}, initialContext: {}) => ({
    withConfig: jest.fn().mockReturnValue({
      context: initialContext,
      initialState: { value: 'mockState' },
    }),
  })),
  interpret: jest.fn().mockReturnValue({
    onChange: jest.fn(),
    onTransition: jest.fn(),
    send: jest.fn(),
    start: jest.fn(),
  }),
  createMachine: jest.fn(),
}));

describe('XStateMixin', () => {
  interface MockEvent {
    type: 'mock';
  }
  const mockMachine = createMachine({ id: 'mock', initial: 'some', states: { some: {} } });
  const mockInterpret = interpret(mockMachine);
  const mockEvent: MockEvent = { type: 'mock' };

  describe('constructor', () => {
    it('should set the machine and initialize state and hash', () => {
      // GIVEN
      const mockInitialContext = {};
      const mockConfig = { context: mockInitialContext } as MachineConfig<{}, {}, MockEvent>;
      const mockOptions = {} as MachineOptions<{}, MockEvent>;

      // WHEN
      const machine = new StateMachine(mockInitialContext, mockConfig, mockOptions);

      // THEN
      expect(machine.state).toBe(mockInitialContext);
      expect(machine.stateHash).not.toBe('');
      expect(machine.stateName).toBe('mockState');
      expect(mockInterpret.onChange).toHaveBeenCalled();
      expect(mockInterpret.onTransition).toHaveBeenCalled();
    });
  });

  describe('dispatch', () => {
    it('should trigger interpreter send when called', () => {
      // GIVEN
      const mockInitialContext = {};
      const mockConfig = { context: mockInitialContext } as MachineConfig<{}, {}, MockEvent>;
      const mockOptions = {} as MachineOptions<{}, MockEvent>;
      const machine = new StateMachine(mockInitialContext, mockConfig, mockOptions);

      // WHEN
      machine.dispatch(mockEvent);

      // THEN
      expect(mockInterpret.send).toHaveBeenCalledWith(mockEvent);
    });
  });
});
