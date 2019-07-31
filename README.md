# vue-xstate

This project aims to give users of VueJS a easy access platform to use [xState](https://xstate.js.org/) library in a easy manner.

If you're not familiar with **xState** check first their site before using this! 

The project uses [vue-property-decorator](https://github.com/kaorun343/vue-property-decorator) (and through it [vue-class-component](https://github.com/vuejs/vue-class-component)) and its `Mixin` decorator to provide a nicely typed solution. This decision was made as VueJS is officially moving towards working with classes instead of object initializers.
If there's enough demand I will consider adding a non-typed equivalent **mixin**.
Many thanks to [@kaorun343](https://github.com/kaorun343/) for his decorators!!

## Licence
MIT License

## Install
```
yarn add vue-xstate
```
or
```
npm i vue-xstate
```

## Create your state machine
Using the documentation of [XState](https://xstate.js.org/docs/), define your context, states, events and state machine. For this case you will only define the objects, you don't need to use any of the methods indicated in that documentation as the mixin takes care of all internally.

I do recommend to keep the types and the machine in a separated file to make it easier to read and maintain. I also recommend to follow the nomenclature pattern. In the future I will try to add a small scaffolding tool to use with npm to generate the base files and types.


Here is an example state machine file:
```ts
/// traffic-light.machine.ts

import { MachineConfig, MachineOptions, StateNodeConfig } from 'xstate';
import { assign } from 'xstate/lib/actions';

// State machine context interface
export interface TrafficLigthContext {
    carCount: number,
    finedPlates: string[]
}

// Initial context used in the xStateInit() method
export const TrafficLigtInitialContext: TrafficLigthContext = {
    carCount: 0,
    finedPlates: []
};

// Possible states of the machine
export enum TrafficLigtStates {
  RED = 'RED',
  AMBER = 'AMBER',
  GREEN = 'GREEN'
}

// Possible actions of the whole machine
export enum TrafficLightActions {
  GO_GREEN = 'GO_GREEN',
  GO_AMBER = 'GO_AMBER'
  GO_RED = 'GO_RED'
  COUNT_CAR = 'COUNT_CAR',
  FINE_CAR = 'FINE_CAR'
}

// Utility interface to get proper types on our config
export interface TrafficLightSchema {
  states: {
    [state in TrafficLightStates]: StateNodeConfig<
      TrafficLightContext, 
      TrafficLightStateSchema, 
      TrafficLightEvent
    >;
  }
}

// Events that will be sent on the dispatch with their payload definition
export type TrafficLightEvent =
  | { type: TrafficLightActions.GO_GREEN }
  | { type: TrafficLightActions.GO_AMBER }
  | { type: TrafficLightActions.GO_RED }
  | { type: TrafficLightActions.COUNT_CAR }
  | { type: TrafficLightActions.FINE_CAR, plate: string };

// Definition of the state machine
export const TrafficLightMachineConfig: MachineConfig<
  TrafficLightContext,
  TrafficLightStateSchema,
  TrafficLightEvent
> = {
  initial: TrafficLightStates.RED,
  states: {
    [TrafficLightStates.RED]: {
      on: {
        [TrafficLightActions.GO_GREEN]: {
          target: TrafficLightStates.GREEN
        },
        [TrafficLightActions.FINE_CAR]: {
          actions: assign((ctx, event) => ({
            finedPlates: [...ctx.finedPlates, event.plate]
          }))
        }
      }
    },
    [TrafficLightStates.AMBER]: {
      on: {
        [TrafficLightActions.GO_RED]: {
          target: TrafficLightStates.RED
        }
      }
    },
    [TrafficLightStates.GREEN]: {
      on: {
        [TrafficLightActions.GO_AMBER]: {
          target: TrafficLightStates.AMBER
        },
        [TrafficLightActions.COUNT_CAR]: {
          actions: assign((ctx, event) => ({
            carCount: ctx.carCount + 1;
          }))
        }
      }
    }
  }
};

```
Remember that in the machine configuration you can use any functionality provided by **xState**

## Usage
Once you have your class component created do the following:
```ts
import XStateMixin from 'vue-xstate';
import { Mixin } from 'vue-property-decorator';
// or if you're only using vue-class-component 
// import { mixins } from 'vue-class-component'';
import {MyContext, MyStateSchema, MyEvents} from './foo.machine.ts';

class foo extends Mixin<XStateMixin<MyContext, MyStateSchema, MyEvents>>(XStateMixin) {
    // Your class definition
}
```

## Mixin accessors
Now that you have the mixin in your class you will have access to the following data, methods and props:

### Props
| Name | Type | Optional | Description |
|------|------|----------|-------------|
| channel | `Subject<TEvents>` | `true`  |  Allows to pass a RxJS subject to trigger actions to the machine from the outside the component |

### Data

| Name | Type | Default | Description |
|------|------|---------|-------------|
| context | `TContext` | `{}` |  Contain the context of the state machine,   it will change as you move through the actions |
| currentState | `string` | `''`  | Current state name based on your `StateSchema` definition |
| statehash | `string` | uuid v4 hash | State hash will provide a unique UUID every time there's a state change in the state machine | 

### Methods
#### xStateInit() :exclamation:
This method initialize the state machine, it's **mandatory** and must be run on the `created()` hook to ensure that everything works

```ts
xStateInit(
    initialContext: TContext, 
    machineConfig: MachineConfig<TContext, TStateSchema, TEvents>, 
    configOptions?: Partial<MachineOptions<TContext, TEvents>>
): void
```

##### Method params
| Name | Type | Optional | Description |
|------|------|----------|-------------|
| initialContext | `TContext` | `false`  |  Initial context that will be accessible through `context` data |
| machineConfig | `MachineConfig<TContext, TStateSchema, TEvents>` | `false`  | xState machine configuration [here](https://xstate.js.org/api/interfaces/machineconfig.html) |
| configOptions | `Partial<MachineOptions<TContext, TEvents>` | `true`  | xState machine options [here](https://xstate.js.org/api/interfaces/machineoptions.html) |

#### dispatch()
This method allows to dispatch events to the state machine

```ts
dispatch(action: TEvents): void
```

##### Method params
| Name | Type | Description |
|------|------|-------------|
| action | `TEvents` |  Action object with its payload |

# For forkers
```
yarn install
```

### Compiles and minifies for production
```
yarn run build
```

### Run your unit tests
```
yarn run test
```

### Lints and fixes files
```
yarn run lint
```
