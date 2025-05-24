import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    axios.get('http://localhost:5050')
      .then(res => setMessage(res.data))
      .catch(err => {
        console.error('Error connecting to backend:', err)
        setMessage('Error connecting to backend')
      })
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">🚀 Pi Raffle App</h1>
      <p>{message}</p>
    </div>
  )
}

export default App