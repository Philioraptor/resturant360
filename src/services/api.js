const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result.data ?? result;
}

export const getMenu = () => apiRequest('/menu');
export const getDashboardSummary = () => apiRequest('/dashboard');
export const getProducts = () => apiRequest('/products');
export const getCategories = () => apiRequest('/categories');
export const getAddonGroups = () => apiRequest('/addons');
export const getInventory = () => apiRequest('/inventory');
export const getTables = () => apiRequest('/tables');
export const getCustomers = () => apiRequest('/customers');
export const getOrders = () => apiRequest('/orders');
export const getReports = () => apiRequest('/reports');
export const getKdsTickets = () => apiRequest('/kds/tickets');
export const getSettings = () => apiRequest('/settings');
export const getChatbotSuggestions = () => apiRequest('/chatbot');

export const createProduct = (payload) =>
  apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateCategory = (categoryId, payload) =>
  apiRequest(`/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const updateCategoryStatus = (categoryId, active) =>
  apiRequest(`/categories/${categoryId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ active }),
  });

export const deleteCategory = (categoryId) =>
  apiRequest(`/categories/${categoryId}`, {
    method: 'DELETE',
  });

export const createCategory = (payload) =>
  apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const createOrder = (payload) =>
  apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const sendChatbotMessage = (payload) =>
  apiRequest('/chatbot/message', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const createAddonGroup = (payload) =>
  apiRequest('/addons', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateAddonGroup = (id, payload) =>
  apiRequest(`/addons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteAddonGroup = (id) =>
  apiRequest(`/addons/${id}`, {
    method: 'DELETE',
  });

export const updateProduct = (productId, payload) =>
  apiRequest(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteProduct = (productId) =>
  apiRequest(`/products/${productId}`, {
    method: 'DELETE',
  });

export const createTable = (payload) =>
  apiRequest('/tables', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateTableStatus = (tableId, status) =>
  apiRequest(`/tables/${tableId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

export const deleteTable = (tableId) =>
  apiRequest(`/tables/${tableId}`, {
    method: 'DELETE',
  });

export const advanceKdsTicket = (ticketId) =>
  apiRequest(`/kds/tickets/${ticketId}/advance`, {
    method: 'PUT',
  });

export const createKdsTicket = (payload) =>
  apiRequest('/kds/tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const deleteKdsTicket = (ticketId) =>
  apiRequest(`/kds/tickets/${ticketId}`, {
    method: 'DELETE',
  });

export const createInventoryItem = (payload) =>
  apiRequest('/inventory', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateInventoryItem = (itemId, payload) =>
  apiRequest(`/inventory/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteInventoryItem = (itemId) =>
  apiRequest(`/inventory/${itemId}`, {
    method: 'DELETE',
  });

export const createCustomer = (payload) =>
  apiRequest('/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateCustomer = (customerId, payload) =>
  apiRequest(`/customers/${customerId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteCustomer = (customerId) =>
  apiRequest(`/customers/${customerId}`, {
    method: 'DELETE',
  });

export const updateSettings = (payload) =>
  apiRequest('/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const resetSettings = () =>
  apiRequest('/settings/reset', {
    method: 'POST',
  });

export default apiRequest;
