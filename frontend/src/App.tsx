import { useState } from 'react'
import './App.css'

function App() {
  const [count] = useState(0)

  return (
    <>
      <h1 className='text-3xl'>Hello word {count}</h1>
    </>
  )
}

export default App
