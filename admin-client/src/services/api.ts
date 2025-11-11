// Mở rộng kiểu Error để hỗ trợ response và status
declare global {
  interface Error {
    response?: Response;
    status?: number;
  }
}

const API_BASE_URL = 'http://localhost:5000';

// Helper function to get auth token
function getAuthToken() {
  return localStorage.getItem('token');
}

// Helper function to create headers with auth token
function createHeaders(contentType = 'application/json'): HeadersInit {
  const headers: HeadersInit = {};
  
  // Chỉ thêm Content-Type nếu không phải FormData
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function apiGetJson<T>(url: string): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    headers: createHeaders()
  });
  const data = await res.json();
  if (!res.ok || data.status === 'error' || data.success === false) {
    throw new Error(data.message || `GET ${url} failed`);
  }
  return data;
}

export async function apiPutJson<T>(url: string, body: any): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    method: 'PUT',
    headers: createHeaders(),
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok || data.status === 'error' || data.success === false) {
    throw new Error(data.message || `PUT ${url} failed`);
  }
  return data;
}

export async function apiPostJson<T>(url: string, body: any): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok || data.status === 'error' || data.success === false) {
    throw new Error(data.message || `POST ${url} failed`);
  }
  return data;
}

export async function apiPatchJson<T>(url: string, body: any): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    method: 'PATCH',
    headers: createHeaders(),
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok || data.status === 'error' || data.success === false) {
    throw new Error(data.message || `PATCH ${url} failed`);
  }
  return data;
}

export async function apiDeleteJson<T>(url: string): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl, { 
    method: 'DELETE',
    headers: createHeaders()
  });
  const data = await res.json();
  if (!res.ok || data.status === 'error' || data.success === false) {
    throw new Error(data.message || `DELETE ${url} failed`);
  }
  return data;
}






// Hàm gửi FormData
function createFormData(data: Record<string, any>): FormData {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        // Nếu là mảng, thêm từng phần tử với cùng key
        value.forEach(item => {
          formData.append(key, item);
        });
      } else if (value instanceof File) {
        // Nếu là file, thêm trực tiếp
        formData.append(key, value);
      } else if (typeof value === 'object') {
        // Nếu là object, chuyển thành JSON string
        formData.append(key, JSON.stringify(value));
      } else {
        // Các trường hợp còn lại, chuyển thành string
        formData.append(key, String(value));
      }
    }
  });
  
  return formData;
}

export async function apiPostFormData<T>(
  url: string, 
  formData: FormData,
  options: RequestInit = {}
): Promise<{ data: T }> {
  try {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    console.log('Sending POST request to:', fullUrl);
    console.log('FormData content:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value instanceof File ? `[File: ${value.name}, ${value.size} bytes]` : value);
    }

    const response = await fetch(fullUrl, {
      method: 'POST',
      body: formData,
      // Không đặt Content-Type thủ công khi dùng FormData
      // Browser sẽ tự động set Content-Type với boundary phù hợp
      headers: {},
      credentials: 'include', // Quan trọng: Gửi cookie nếu có
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(errorMessage);
    }

    const data = await response.json().catch(() => ({}));
    return { data };
  } catch (error) {
    console.error('API Request Failed:', {
      url: `${API_BASE_URL}${url}`,
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    
    if (error instanceof Error) {
      // Kiểm tra nếu là lỗi mạng
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') ||
          error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error(
          `Không thể kết nối đến máy chủ. Vui lòng kiểm tra:
          1. Server backend đã chạy chưa?
          2. CORS đã được cấu hình đúng trên server chưa?
          3. Cổng kết nối có chính xác không?`
        );
      }
      
      // Nếu có thông báo lỗi từ server, ném lại
      if (error.message) {
        throw error;
      }
    }
    
    throw new Error('Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau.');
  }
}

export async function apiPatchFormData<T>(
  url: string, 
  formData: FormData
): Promise<T> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const res = await fetch(fullUrl, {
    method: 'PATCH',
    headers: createHeaders(undefined), // Không set Content-Type để browser tự thêm boundary
    body: formData,
    credentials: 'include'
  });
  
  const data = await res.json();
  
  if (!res.ok || data.status === 'error' || data.success === false) {
    throw new Error(data.message || `PATCH ${url} failed`);
  }
  
  return data;
}

// auth
export async function apiLoginAdmin<T>(body: any): Promise<T> {
  return apiPostJson<T>('/api/v1/auth/login', body);
}

export async function apiRegisterAdmin<T>(body: any): Promise<T> {
  return apiPostJson<T>('/api/v1/auth/register', body);
}

