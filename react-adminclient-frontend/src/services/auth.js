const API_BASE = "http://localhost:5000/api/v1";


async function request(url, method = "GET", body) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Lỗi kết nối server");
  }

  return data;
}



// User Login
export async function loginUser(email, password) {
  return await request(`${API_BASE}/auth/user/login`, "POST", {
    email,
    password,
  });
}

// User Register
export async function registerUser(fullName, email, password) {
  return await request(`${API_BASE}/auth/user/register`, "POST", {
    fullName,
    email,
    password,
  });
}

// Get Current User (localStorage)
export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

// Logout
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}