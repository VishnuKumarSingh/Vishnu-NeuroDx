import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => string | null   // returns error string or null
  signup: (name: string, email: string, password: string) => string | null
  logout: () => void
  isLoggedIn: boolean
}

const AuthContext = createContext<AuthContextType>(null!)

const USERS_KEY    = 'neuroai_users'
const SESSION_KEY  = 'neuroai_logged'
const EMAIL_KEY    = 'neuroai_email'
const USERNAME_KEY = 'neuroai_username'

function getUsers(): Record<string, { name: string; email: string; password: string }> {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
}
function saveUsers(u: object) {
  localStorage.setItem(USERS_KEY, JSON.stringify(u))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Restore session on mount
  useEffect(() => {
    if (localStorage.getItem(SESSION_KEY) === '1') {
      const name  = localStorage.getItem(USERNAME_KEY) || 'Doctor'
      const email = localStorage.getItem(EMAIL_KEY)    || ''
      setUser({ name, email })
    }
  }, [])

  function login(email: string, password: string): string | null {
    const users = getUsers()
    const e = email.trim().toLowerCase()
    if (!users[e])               return 'Email not found. Please sign up first.'
    if (users[e].password !== password) return 'Incorrect password. Please try again.'
    const name = users[e].name
    localStorage.setItem(SESSION_KEY,  '1')
    localStorage.setItem(EMAIL_KEY,    e)
    localStorage.setItem(USERNAME_KEY, name)
    setUser({ name, email: e })
    return null
  }

  function signup(name: string, email: string, password: string): string | null {
    if (!name || !email || !password) return 'Please fill all required fields.'
    if (password.length < 6)          return 'Password must be at least 6 characters.'
    const users = getUsers()
    const e = email.trim().toLowerCase()
    if (users[e]) return 'This email is already registered. Please login.'
    users[e] = { name: name.trim(), email: e, password }
    saveUsers(users)
    return null
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(EMAIL_KEY)
    localStorage.removeItem(USERNAME_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
