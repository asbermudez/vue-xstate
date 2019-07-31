import * as tslib_1 from "tslib";
import { interpret, Machine } from 'xstate';
import { v4 } from 'uuid';
import { Component, Vue, Prop } from 'vue-property-decorator';
let XState = class XState extends Vue {
    constructor() {
        super(...arguments);
        this.context = {};
        this.currentState = '';
        this.stateHash = v4();
        this.$xStateSubscription = null;
    }
    xStateInit(initialContext, machineConfig, configOptions = {}) {
        this.$xStateStateMachine = Machine(machineConfig, {}, initialContext).withConfig(configOptions);
        this.$xStateInterpreter = interpret(this.$xStateStateMachine);
        this.$xStateSubscription =
            this.channel ? this.channel.subscribe((action) => this.$xStateInterpreter.send(action)) : null;
        this.$xStateHandleChange({
            currentState: this.$xStateStateMachine.initialState.value,
            context: this.$xStateStateMachine.context,
            stateHash: v4(),
        });
        this.$xStateInitInterpreter();
    }
    dispatch(action) {
        if (this.$xStateInitInterpreter) {
            this.$xStateInterpreter.send(action);
        }
        else {
            console.warn(`%cx-state mixin: %cThe machine was not initialized,
			 please use %cinitState() %con %ccreated() %cfor it`, 'font-weight:bold; color:black', '', 'color:blue', '', 'color:blue', '');
        }
    }
    beforeDestroy() {
        if (this.$xStateSubscription) {
            this.$xStateSubscription.unsubscribe();
        }
    }
    $xStateHandleChange(change) {
        const { currentState = this.currentState, context = this.context, stateHash, } = change;
        this.currentState = currentState;
        this.context = context;
        this.stateHash = stateHash;
    }
    $xStateInitInterpreter() {
        const interpreter = this.$xStateInterpreter;
        interpreter.start();
        interpreter.onTransition((newState) => {
            const { changed, value, context } = newState;
            if (changed && value !== this.currentState) {
                this.$xStateHandleChange({
                    currentState: value,
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
};
tslib_1.__decorate([
    Prop()
], XState.prototype, "channel", void 0);
XState = tslib_1.__decorate([
    Component
], XState);
export default XState;
//# sourceMappingURL=index.js.map