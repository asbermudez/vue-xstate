import xStateMixin from '@/index';
import { MachineConfig, MachineOptions, interpret } from 'xstate';
import { Subject } from 'rxjs';

jest.mock('xstate', () => ({
    Machine: jest.fn().mockImplementation((a: any, b: any, initialContext: any) => ({
        withConfig: jest.fn().mockReturnValue({
            context: initialContext,
            initialState: { value: 'mockState' }
        })
    })),
    interpret: jest.fn().mockReturnValue({
        onChange: jest.fn(),
        onTransition: jest.fn(),
        send: jest.fn(),
        start: jest.fn()
    })
}));

describe('xStateMixin', () => {
    interface MockEvent { type: 'mock'; }
    const mockEvent: MockEvent = { type: 'mock' };
    let mixin: xStateMixin<{}, {}, MockEvent>;

    describe('xStateInit', () => {
        beforeEach(() => {
            mixin = new xStateMixin();
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
            expect(interpret({} as any).onChange).toHaveBeenCalled();
            expect(interpret({} as any).onTransition).toHaveBeenCalled();
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
            expect(interpret({} as any).send).toHaveBeenCalledWith(mockEvent);
        });
    });

    describe('dispatch', () => {
        beforeEach(() => {
            mixin = new xStateMixin();
            const mockInitialContext = {};
            const mockConfig = { context: mockInitialContext } as MachineConfig<{}, {}, MockEvent>;
            const mockOptions = {} as MachineOptions<{}, MockEvent>;
            mixin.xStateInit(mockInitialContext, mockConfig, mockOptions);
        });

        it('should trigger interpreter send when called', () => {
            // GIVEN
            const sendSpy = interpret({} as any).send;

            // WHEN
            mixin.dispatch(mockEvent);

            // THEN
            expect(sendSpy).toHaveBeenCalledWith(mockEvent);
        });
    });
});
