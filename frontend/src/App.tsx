import { useHealth } from './features/health/useHealth'

function App() {
  const { data, isPending, isError } = useHealth()

  const apiStatus = isPending ? 'checking…' : isError ? 'unreachable' : data.status

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-red-50 text-stone-800">
      <h1 className="text-4xl font-bold text-red-700">Popcorn Cart CMS</h1>
      <p className="text-stone-600">
        API status: <span className="font-semibold">{apiStatus}</span>
      </p>
    </main>
  )
}

export default App
