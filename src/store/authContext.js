import { useState, useEffect, useCallback, createContext } from 'react'

let logoutTimer

const AuthContext = createContext({
  token: '',
  login: () => {},
  logout: () => {},
  userId: null
})

const calculateRemainingTime = (exp) => {
  const currentTime = new Date().getTime()
  const expTime = exp 
  const remainingTime = expTime - currentTime
  return remainingTime
}

const getLocalData = () => {
  const storedToken = localStorage.getItem('token')
  const storedExp = localStorage.getItem('exp')
  const storedUserId = localStorage.getItem('userId')

  const remainingTime = calculateRemainingTime(storedExp)

  if (remainingTime <= 1000 * 60 * 30) {
    localStorage.removeItem('token')
    localStorage.removeItem('exp')
    localStorage.removeItem('userId')
    return null
  }


  return {
    token: storedToken,
    duration: remainingTime,
    userId: +storedUserId
  }
}



export const AuthContextProvider = (props) => {
  const localData = getLocalData()
  
  let initialToken
  let initialId
  if (localData) {
    initialToken = localData.token
    initialId = localData.userId
  }

  console.log(initialId)
  const [token, setToken] = useState(initialToken)
  const [userId, setUserId] = useState(initialId)


  const logout = useCallback(() => {
    setToken(null)
    setUserId(null)
    localStorage.removeItem('token')
    localStorage.removeItem('exp')
    localStorage.removeItem('userId')

    if (logoutTimer) {
      clearTimeout(logoutTimer)
    }
  }, [])

  // 8. the login function receives the user's data as parameters
  const login = (token, exp, userId) => {
    // 9. put the user token and id on local state values here in the context. 
    setToken(token)
    setUserId(userId)

    // 10. put the user's data on localStorage 
    localStorage.setItem('token', token)
    localStorage.setItem('exp', exp)
    localStorage.setItem('userId', userId)

    // 11. use the calculateRemainingTime function to check if the expiration has run out
    const remainingTime = calculateRemainingTime(exp)

    // 12. Set a timer based on how much time is left before the token expires. 
    logoutTimer = setTimeout(logout, remainingTime)
  }

  useEffect(() => {
    if (localData) {
      logoutTimer = setTimeout(logout, localData.duration)
    }
  }, [localData, logout])

  // 13. The actual value of the context object is determined here
  const contextValue = {
    token,
    login,
    logout, 
    userId
  }
  console.log(contextValue)

  return (
    // 13.1 we passed the object with state values to the Provider. 
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  )
}

export default AuthContext
