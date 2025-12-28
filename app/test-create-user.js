// Test user creation with admin token
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTUxMmZhMjE3MTdkYzM2MzZmN2MyY2IiLCJpYXQiOjE3NjY5MjkxNDksImV4cCI6MTc2NzAxNTU0OX0.0k-LK2VG93IlvORk8TMEy4TvNZhvfBSWdGCXooVQExc';

fetch('http://localhost:3001/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    name: 'Becky Responder',
    email: 'becky@example.com',
    role: 'responder'
  })
})
.then(response => response.json())
.then(data => console.log('Create user response:', data))
.catch(error => console.error('Create user error:', error));
