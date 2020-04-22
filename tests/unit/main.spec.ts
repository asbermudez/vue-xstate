import { MachineConfig, MachineOptions, interpret, createMachine } from 'xstate';
import { Subject } from 'rxjs';
import { XStateMixin } from '../../src/index';

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
  let mixin: XStateMixin<{}, {}, MockEvent>;

  describe('xStateInit', () => {
    beforeEach(() => {
      mixin = new XStateMixin();
    });

    it('should set the machine and initialize state and hash', () => {
      // GIVEN
      const initialHash = mixin.stateHash;
      const mockInitialContext = {};
      const mockConfig = { context: mockInitialContext } as MachineConfig<{}, {}, MockEvent>;
      const mockOptions = {} as MachineOptions<{}, MockEvent>;

      // WHEN
      mixin.xStateInit(mockInitialContext, mockConfig, mockOptions);

      // THEN
      expect(mixin.context).toBe(mockInitialContext);
      expect(mixin.stateHash).not.toBe(initialHash);
      expect(mixin.currentState).toBe('mockState');
      expect(mockInterpret.onChange).toHaveBeenCalled();
      expect(mockInterpret.onTransition).toHaveBeenCalled();
    });

    it('should set the subscription if channel is set in prop', () => {
      // GIVEN
      const mockChannel = new Subject<MockEvent>();
      const subscribeSpy = jest.spyOn(mockChannel, 'subscribe');
      mixin.channel = mockChannel;
      const mockInitialContext = {};
      const mockConfig = { context: mockInitialContext } as MachineConfig<{}, {}, MockEvent>;
      const mockOptions = {} as MachineOptions<{}, MockEvent>;

      // WHEN
      mixin.xStateInit(mockInitialContext, mockConfig, mockOptions);
      mockChannel.next(mockEvent);

      // THEN
      expect(subscribeSpy).toHaveBeenCalled();
      expect(mockInterpret.send).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('dispatch', () => {
    beforeEach(() => {
      mixin = new XStateMixin();
      const mockInitialContext = {};
      const mockConfig = { context: mockInitialContext } as MachineConfig<{}, {}, MockEvent>;
      const mockOptions = {} as MachineOptions<{}, MockEvent>;
      mixin.xStateInit(mockInitialContext, mockConfig, mockOptions);
    });

    it('should trigger interpreter send when called', () => {
      // WHEN
      mixin.dispatch(mockEvent);

      // THEN
      expect(mockInterpret.send).toHaveBeenCalledWith(mockEvent);
    });
  });
});
