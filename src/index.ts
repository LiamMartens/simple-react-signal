import $mitt from 'mitt';
import { defaultImport } from 'default-import';
import { useSyncExternalStore } from 'react';

type SignalEvents<T> = {
  change: {
    value: T;
    previousValue: T;
  };
};

const mitt = defaultImport($mitt);

export function createSignal<T>(initial: T) {
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
    );

    return [stateValue, update] as const;
  }

  return {
    update,
    use: useSignal,
  };
}

