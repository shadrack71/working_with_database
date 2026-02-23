import { useEffect, useState } from 'react'
import TaskManager from './components/TaskManager'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import supabase from './supabase-client.js'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [authView, setAuthView] = useState('signin')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="app loading">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app">
        {authView === 'signin' ? (
          <SignIn
            onSwitchToSignUp={() => setAuthView('signup')}
            onSignInSuccess={(user) => setUser(user)}
          />
        ) : (
          <SignUp onSwitchToSignIn={() => setAuthView('signin')} />
        )}
      </div>
    )
  }

  return (
    <div className="app">
      <TaskManager user={user} onSignOut={() => setUser(null)} />
    </div>
  )
}

export default App