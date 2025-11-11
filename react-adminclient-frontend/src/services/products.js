import { api } from './api'
export const ProductsApi = {
list(params){ return api.get('/products',{params}).then(r=>r.data) },
get(id){ return api.get(`/products/${id}`).then(r=>r.data) }
}