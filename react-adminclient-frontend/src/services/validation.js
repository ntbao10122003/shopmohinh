export const isValidUsername = (name) => /^[A-Za-z\s]{3,}$/.test(name);
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isPassWord = (password) => password.length >= 6;



var user = null

const setUser = (newUser) => {
  user = newUser
}

const getUser = () => {
  return user
}

var address = null

const setAddress = (object) => {
  address = object
  console.log(address)
}

const getAddress = () => {
  return address
}



export {
  setUser, getUser,
  setAddress, getAddress,
}



