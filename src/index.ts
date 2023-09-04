import $mitt, { Emitter } from 'mitt';
import { defaultImport } from 'default-import';
import { useSyncExternalStore } from 'react';

export type SignalEvents<T> = {
  change: {
    value: T;
    previousValue: T;
  };
};

export interface CreateSignalResult<T> {
  ref: { current: T };
  history: Set<T>;
  emitter: Emitter<SignalEvents<T>>;
  use(): readonly [T, (value: T) => void];
  update(value: T): void;
}

const mitt = defaultImport($mitt);

export function createSignal<T>(
  initial: T,
  equals: (current: T, incoming: T) => boolean = (c, t) => c == t
): CreateSignalResult<T> {
  const valueRef = { current: initial };
  let historySet = new Set<T>([initial]);
  const emitter = mitt<SignalEvents<T>>();

  function update(input: T) {
    const previousValue = valueRef.current;
    valueRef.current = input;
    if (!equals(valueRef.current, previousValue)) {
      historySet.add(valueRef.current);
      emitter.emit('change', { value: valueRef.current, previousValue });
    }
  }

  function useSignal() {
    const stateValue = useSyncExternalStore(
      (callback) => {
        emitter.on('change', callback);
        return () => emitter.off('change', callback);
      },
      () => valueRef.current,
      () => valueRef.current
    );

    return [stateValue, update] as const;
  }

  return {
    update,
    ref: valueRef,
    emitter,
    history: historySet,
    use: useSignal,
  };
}
