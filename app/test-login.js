// Test login endpoint
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@rapidresponse.com',
    password: 'Admin123!',
    role: 'admin'
  })
})
.then(response => response.json())
.then(data => console.log('Login response:', data))
.catch(error => console.error('Login error:', error));
