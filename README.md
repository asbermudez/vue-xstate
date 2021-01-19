[![npm version](https://badge.fury.io/js/vue-xstate.svg)](https://badge.fury.io/js/vue-xstate)

### :warning: Attention: [Documentation about v1.x.x is here](README-v1.md) :warning:

# vue-xstate v2

This project aims to give users of VueJS a easy access platform to use [xState](https://xstate.js.org/) library in their project.

If you're not familiar with **xState** check first their site before using this!

## Why no longer a mixin?

In this version I've moved away from the **mixin** structure for three reasons:

1. It adds a lot of overhead
2. It's being considered a bad practice as it does merge properties in runtime and you can accidentally overlap them without warning.
3. In mixin form the instance of the machine was mandatory to be linked to the component, having to make use of strange subscriptions to share it through

With the new approach of a class it can be explicitly initialized, doesn't overwrite any property and it can be instantiated anywhere and shared through props/imports. This also adds an extra benefit, this class can now be used in other projects that don't use vue.

## Migration from v1

To migrate your components from v1, you need to remove the mixin from it and the initialization of the machine from your **created()** hook. To simplify a bit your work, you can add this piece of code in your component to have a map of your data to the new machine.

Note that the subscription system has now been removed as now being a class you can initiate, it can be passed as a property and shared the instance through multiple components.

You will have to replace the types with the ones on your state machine

```ts
public machine: StateMachine<TContext, TStateSchema, TEvents> = new StateMachine(initialContext, machineConfig);

public get context(): TContext {
  return this.machine.context;
}

public get currentState(): StateMachineStateName<TStateSchema> {
  return this.machine.state;
}

public get stateHash(): StateMachineStateName<TStateSchema> {
  return this.machine.stateHash;
}

public dispatch(action: TEvents): void {
  this.machine.dispatch(action);
}
```

# Usage

## Install

```
yarn add vue-xstate
```

or

```
npm i vue-xstate
```

:warning: Remember, since version 2.1.0, xstate is a peer dependency and you will have to install it in your project to use with this library.

## Create your state machine

Using the documentation of [XState](https://xstate.js.org/docs/), define your context, states, events and state machine. For this case you will only define the objects, you don't need to use any of the methods indicated in that documentation as the mixin takes care of all internally.

I do recommend to keep the types and the machine in a separated file to make it easier to read and maintain. I also recommend to follow the nomenclature pattern. In the future I will try to add a small scaffolding tool to use with npm to generate the base files and types.

Here is an example state machine file:

```ts
/// traffic-light.machine.ts

import { MachineConfig, StateNodeConfig } from 'xstate';
import { assign } from 'xstate/lib/actions';

// State machine context interface
export interface TrafficLightContext {
  carCount: number;
  finedPlates: string[];
}

// Initial context used in the xStateInit() method
export const TrafficLigtInitialContext: TrafficLightContext = {
  carCount: 0,
  finedPlates: [],
};

// Possible states of the machine
export enum TrafficLightStates {
  RED = 'RED',
  AMBER = 'AMBER',
  GREEN = 'GREEN',
}

// Possible actions of the whole machine
export enum TrafficLightActions {
  GO_GREEN = 'GO_GREEN',
  GO_AMBER = 'GO_AMBER',
  GO_RED = 'GO_RED',
  COUNT_CAR = 'COUNT_CAR',
  FINE_CAR = 'FINE_CAR',
}

// Utility interface to get proper types on our config
export interface TrafficLightSchema {
  states: {
    [state in TrafficLightStates]: StateNodeConfig<TrafficLightContext, TrafficLightSchema, TrafficLightEvent>;
  };
}

// Events that will be sent on the dispatch with their payload definition
export type TrafficLightEvent =
  | { type: TrafficLightActions.GO_GREEN }
  | { type: TrafficLightActions.GO_AMBER }
  | { type: TrafficLightActions.GO_RED }
  | { type: TrafficLightActions.COUNT_CAR }
  | { type: TrafficLightActions.FINE_CAR; plate: string };

// Definition of the state machine
export const TrafficLightMachineConfig: MachineConfig<TrafficLightContext, TrafficLightSchema, TrafficLightEvent> = {
  initial: TrafficLightStates.RED,
  states: {
    [TrafficLightStates.RED]: {
      on: {
        [TrafficLightActions.GO_GREEN]: {
          target: TrafficLightStates.GREEN,
        },
        [TrafficLightActions.FINE_CAR]: {
          actions: assign((ctx, event) => ({
            finedPlates: [...ctx.finedPlates, event.plate],
          })),
        },
      },
    },
    [TrafficLightStates.AMBER]: {
      on: {
        [TrafficLightActions.GO_RED]: {
          target: TrafficLightStates.RED,
        },
      },
    },
    [TrafficLightStates.GREEN]: {
      on: {
        [TrafficLightActions.GO_AMBER]: {
          target: TrafficLightStates.AMBER,
        },
        [TrafficLightActions.COUNT_CAR]: {
          actions: assign((ctx, event) => ({
            carCount: ctx.carCount + 1,
          })),
        },
      },
    },
  },
};
```

Remember that in the machine configuration you can use any functionality provided by **xState**

## Initiate the machine in your component

Once you have your class component created do the following:

```ts
import { Component, Vue } from 'vue-property-decorator';
import { StateMachine } from 'vue-xstate';
import {
  TrafficLightContext,
  TrafficLightStateSchema,
  TrafficLightEvents,
  TrafficLigtInitialContext,
  TrafficLightMachineConfig,
} from './TrafficLight.machine.ts';

@Component
class TrafficLight extends Vue {
  // Your class definition
  readonly machine: StateMachine<TrafficLightContext, TrafficLightStateSchema, TrafficLightEvents> = new StateMachine(
    TrafficLigtInitialContext,
    TrafficLightMachineConfig,
  );
}
```

This will create and initiate the state machine with the defined initial state. Then you can use the _StateMachine_ properties and methods to render and operate your machine.
All the properties are reactive in the normal vue flow, which allows you to use them directly in your template/methods.

# Documentation

## StateMachine class

Now that you have machine initialized, you will have access to the following data, methods and props:

### Data

All the properties listed here are getter to prevent you to accidentally modify them. In any case you should always observe the principle of immutability when designing your states.

| Name      | Type       | Description                                                                                  |
| --------- | ---------- | -------------------------------------------------------------------------------------------- |
| context   | `TContext` | Contain the context of the state machine, it will change as you move through the actions     |
| state     | `string`   | Current state name based on your `StateSchema` definition                                    |
| stateHash | `string`   | State hash will provide a unique UUID every time there's a state change in the state machine |

### Methods

#### constructor()

The constructor method initialize the state machine.

```ts
new StateMachine(
    initialContext: TContext,
    machineConfig: MachineConfig<TContext, TStateSchema, TEvents>,
    configOptions?: Partial<MachineOptions<TContext, TEvents>>
)
```

##### Method params

| Name           | Type                                             | Optional | Description                                                                                  |
| -------------- | ------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------- |
| initialContext | `TContext`                                       | `false`  | Initial context that will be accessible through `context` data                               |
| machineConfig  | `MachineConfig<TContext, TStateSchema, TEvents>` | `false`  | xState machine configuration [here](https://xstate.js.org/api/interfaces/machineconfig.html) |
| configOptions  | `Partial<MachineOptions<TContext, TEvents>`      | `true`   | xState machine options [here](https://xstate.js.org/api/interfaces/machineoptions.html)      |

#### dispatch()

This method allows to dispatch events to the state machine

```ts
dispatch(action: TEvents): void
```

##### Method params

| Name   | Type      | Description                    |
| ------ | --------- | ------------------------------ |
| action | `TEvents` | Action object with its payload |

# Changelog

## 2.1.8

- Dependencies update for security reasons

## 2.1.7

- Removed parcel from dev dependencies

## 2.1.6

- Bump packages for a security issue with node-forge

## 2.1.5

- Bump packages for security issues

## 2.1.4

- Bump elliptic dependency from 6.5.2 to 6.5.3 for a security issue

## 2.1.3

- Security internal dependency lodash
- Realizing I suck on handling versions

## 2.1.2

- Removed js maps from build to thin the package

## 2.1.1

- Updated documentation

## 2.1.0

- Removed unnecessary dependecies
- Turned xstate to a peer dependency

# For forkers

```
yarn install
```

### Compiles and minifies to /lib

```
yarn run build
```

### Run unit tests

```
yarn run test
```

### Lints and fixes files

```
yarn run lint
```

# Licence

MIT License
