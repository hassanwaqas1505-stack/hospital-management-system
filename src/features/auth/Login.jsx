
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LockKeyhole,
  Mail,
  Hospital,
  Eye,
  EyeOff,
  ShieldCheck,
  UserRound,
  Stethoscope,
} from 'lucide-react'

import { useAuth } from './AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const demoAccounts = [
    {
      role: 'Admin',
      email: 'admin@medicare.com',
      password: 'Admin@123',
      icon: ShieldCheck,
    },
    {
      role: 'Receptionist',
      email: 'reception@medicare.com',
      password: 'Reception@123',
      icon: UserRound,
    },
    {
      role: 'Doctor',
      email: 'testdoctor@medicare.com',
      password: 'Test@12345',
      icon: Stethoscope,
    },
  ]

  function handleDemoLogin(account) {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const result = login(email, password)

    if (!result.success) {
      setError(result.error)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">

        {/* Header */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Hospital size={34} />
          </div>

          <h1 className="text-2xl font-bold text-slate-800">
            MediCare Hospital
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to access your account
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          autoComplete="off"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email Address
            </label>

            <div className="flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-blue-500">
              <Mail size={18} className="text-slate-400" />

              <input
                type="email"
                name="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 outline-none"
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>

            <div className="flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-blue-500">
              <LockKeyhole size={18} className="text-slate-400" />

              <input
                type={showPassword ? 'text' : 'password'}
                name="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 outline-none"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-7 border-t border-slate-200 pt-6">
          <div className="mb-4 text-center">
            <h2 className="text-base font-bold text-slate-800">
              Demo Credentials
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Select a role to automatically fill login details
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((account) => {
              const Icon = account.icon

              return (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleDemoLogin(account)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Icon size={22} />

                  <span className="text-xs font-semibold">
                    {account.role}
                  </span>

                  <span className="text-[10px] font-medium text-blue-600">
                    Use Account
                  </span>
                </button>
              )
            })}
          </div>

          <p className="mt-3 text-center text-xs text-slate-400">
            Click a role above, then press Sign In.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Hospital Management System
        </p>
      </div>
    </div>
  )
}

export default Login
