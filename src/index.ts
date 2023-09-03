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
  value: T;
  emitter: Emitter<SignalEvents<T>>;
  use(): readonly [T, (value: T) => void];
  update(value: T): void;
}

const mitt = defaultImport($mitt);

export function createSignal<T>(initial: T): CreateSignalResult<T> {
  let value = initial;
  const emitter = mitt<SignalEvents<T>>();

  function update(input: T) {
    const previousValue = value;
    value = input;
    emitter.emit('change', { value, previousValue });
  }

  function useSignal() {
    const stateValue = useSyncExternalStore(
      (callback) => {
        emitter.on('change', callback);
        return () => emitter.off('change', callback);
      },
      () => value,
      () => value
    );

    return [stateValue, update] as const;
  }

  return {
    update,
    value,
    emitter,
    use: useSignal,
  };
}
