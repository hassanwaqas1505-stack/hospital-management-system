
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import initialUsers from '../../data/users'

const AuthContext = createContext(null)

function getInitialUsers() {
  try {
    const savedUsers = localStorage.getItem('hospital_users')

    if (savedUsers) {
      return JSON.parse(savedUsers)
    }

    return initialUsers
  } catch (error) {
    console.error('Error loading accounts:', error)
    return initialUsers
  }
}

function getValidUser(savedUser, availableUsers) {
  if (!savedUser?.email) return null

  const matchedUser = availableUsers.find(
    (item) =>
      item.email.toLowerCase() === savedUser.email.toLowerCase() &&
      item.role === savedUser.role
  )

  if (!matchedUser) return null

  return {
    id: matchedUser.id,
    doctorId: matchedUser.doctorId,
    name: matchedUser.name,
    email: matchedUser.email,
    role: matchedUser.role,
  }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(getInitialUsers)

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('hospital_user')
      const availableUsers = getInitialUsers()

      if (!savedUser) return null

      return getValidUser(
        JSON.parse(savedUser),
        availableUsers
      )
    } catch (error) {
      console.error('Error loading user:', error)
      return null
    }
  })

  
  useEffect(() => {
    localStorage.setItem('hospital_users', JSON.stringify(users))
  }, [users])

  
  useEffect(() => {
    if (user) {
      localStorage.setItem('hospital_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('hospital_user')
    }
  }, [user])

  
  function login(email, password) {
    const matchedUser = users.find(
      (item) =>
        item.email.toLowerCase() === email.trim().toLowerCase() &&
        item.password === password
    )

    if (!matchedUser) {
      return {
        success: false,
        error: 'Invalid email or password.',
      }
    }

    const loggedInUser = {
      id: matchedUser.id,
      doctorId: matchedUser.doctorId,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
    }

    setUser(loggedInUser)

    return {
      success: true,
      user: loggedInUser,
    }
  }

  
  function addDoctorAccount(doctor) {
    const email = doctor.email.trim().toLowerCase()

    const emailExists = users.some(
      (item) => item.email.toLowerCase() === email
    )

    if (emailExists) {
      return {
        success: false,
        error: 'This email already has an account.',
      }
    }

    const newAccount = {
      id: `doctor-${doctor.id}`,
      doctorId: doctor.id,
      name: doctor.name,
      email,
      password: doctor.password,
      role: 'Doctor',
    }

    setUsers((previousUsers) => [
      ...previousUsers,
      newAccount,
    ])

    return { success: true }
  }

  // Update an existing doctor login account
  function updateDoctorAccount(doctor) {
    const email = doctor.email.trim().toLowerCase()
    const accountId = `doctor-${doctor.id}`

    const emailExists = users.some(
      (item) =>
        item.email.toLowerCase() === email &&
        item.id !== accountId
    )

    if (emailExists) {
      return {
        success: false,
        error: 'This email is already used by another account.',
      }
    }

    setUsers((previousUsers) =>
      previousUsers.map((item) =>
        item.id === accountId
          ? {
              ...item,
              name: doctor.name,
              email,
              ...(doctor.password
                ? { password: doctor.password }
                : {}),
            }
          : item
      )
    )

    if (user?.id === accountId) {
      setUser((previousUser) => ({
        ...previousUser,
        name: doctor.name,
        email,
      }))
    }

    return { success: true }
  }

  // Delete a doctor's login account
  function deleteDoctorAccount(doctorId) {
    const accountId = `doctor-${doctorId}`

    setUsers((previousUsers) =>
      previousUsers.filter(
        (item) => item.id !== accountId
      )
    )

    if (user?.id === accountId) {
      setUser(null)
    }
  }

  // Logout
  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        logout,
        addDoctorAccount,
        updateDoctorAccount,
        deleteDoctorAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
