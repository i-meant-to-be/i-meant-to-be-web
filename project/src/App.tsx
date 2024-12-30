import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1 className="text-sky-300">Hello, Vite + React!</h1>
      <button onClick={() => setCount((count) => count + 1)}>count is: {count}</button>
    </div>
  )
}