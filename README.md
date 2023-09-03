# simple-react-signal
This is a simple signal library to create reactive values outside of the React lifecycle.

## Usage
```jsx
import { createSignal } from 'simple-react-signal';

const mySignal = createSignal('foo');

export function App() {
  const [value, setValue] = mySignal.use();

  const handleSetBar = () => {
    setValue('bar');
  }

  return (
    <button onClick={handleSetBar}>Set bar</button>
  );
}
```

