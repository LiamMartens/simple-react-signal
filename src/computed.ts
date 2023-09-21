import { CreateSignalResult, createSignal } from './signal.js';

export function createComputed<
  S extends readonly [CreateSignalResult<any>, ...CreateSignalResult<any>[]],
  T
>(
  dependencies: S,
  fn: (signals: S) => T,
  // only used to prevent excessive updating
  debounceTimeout = 8
) {
  let updateTimeout: ReturnType<typeof setTimeout> | null = null;
  const computed = createSignal<T>(fn(dependencies));

  const debouncedUpdate = () => {
    computed.update(fn(dependencies));
  };

  const dependencyChangedHandler = () => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
      updateTimeout = null;
    }
    updateTimeout = setTimeout(debouncedUpdate, debounceTimeout);
  };

  const listen = () => {
    dependencies.forEach((dep) => {
      dep.emitter.on('change', dependencyChangedHandler);
    });
  };
  const unlisten = () => {
    dependencies.forEach((dep) => {
      dep.emitter.off('change', dependencyChangedHandler);
    });
  };

  listen();

  return {
    ...computed,
    listen,
    unlisten,
  };
}
