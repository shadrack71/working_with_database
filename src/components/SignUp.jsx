import { useState } from 'react'
import supabase from '../supabase-client.js'
import './Auth.css'

export default function SignUp({ onSwitchToSignIn }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({email:email,
        password:password,
        name:name,
      })

      const { error:error_insert } = await supabase.from('users').insert({
        email,
        password
      }).single()
      if (error_insert) throw error_insert

      if (error) throw error

      setSuccess('Sign up successful! Check your email for confirmation.')
      setEmail('')
      setName('')
      setPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        onSwitchToSignIn()
      }, 2000)
    } catch (error) {
      setError(error.message || 'Error signing up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Sign up to get started</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSignUp} className="auth-form">

            <div className="form-group">
            <label htmlFor="text">Name </label>
            <input
              id="name"
              type="text"
              placeholder="your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-toggle">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="auth-link-btn"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}
