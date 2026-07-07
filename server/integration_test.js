const http = require('http');

const request = (method, path, data, token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    if (data) options.headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

async function runTests() {
  const errors = [];
  try {
    console.log('--- Starting Integration Tests ---');
    
    // 1. Register a student
    const testEmail = `test_${Date.now()}@college.edu`;
    console.log(`\n1. Registering student: ${testEmail}`);
    let res = await request('POST', '/api/auth/register', JSON.stringify({
      name: 'Test Student', email: testEmail, password: 'password123', rollNumber: 'TEST1234', branch: 'CSE', cgpa: 9.0
    }));
    if (res.status !== 201) errors.push(`Registration failed: ${JSON.stringify(res.body)}`);
    else console.log('Registration success');

    // 2. Login student
    console.log(`\n2. Logging in student: ${testEmail}`);
    res = await request('POST', '/api/auth/login', JSON.stringify({ email: testEmail, password: 'password123' }));
    let studentToken;
    if (res.status !== 200) errors.push(`Login failed: ${JSON.stringify(res.body)}`);
    else {
      studentToken = res.body.data.accessToken;
      console.log('Login success');
    }

    // 3. Coordinator Login
    console.log('\n3. Logging in Coordinator');
    res = await request('POST', '/api/auth/login', JSON.stringify({ email: 'coordinator@crms.edu', password: 'coordinator123' }));
    let coordToken;
    if (res.status !== 200) errors.push(`Coordinator login failed: ${JSON.stringify(res.body)}`);
    else {
      coordToken = res.body.data.accessToken;
      console.log('Coordinator login success');
    }

    // 4. Fetch Student Dashboard
    if (studentToken) {
      console.log('\n4. Fetching Student Dashboard');
      res = await request('GET', '/api/users/dashboard', null, studentToken);
      if (res.status !== 200) errors.push(`Student dashboard failed: ${JSON.stringify(res.body)}`);
      else console.log('Student dashboard success');
    }

    // 5. Fetch Coordinator Dashboard
    if (coordToken) {
      console.log('\n5. Fetching Coordinator Dashboard');
      res = await request('GET', '/api/users/dashboard', null, coordToken);
      if (res.status !== 200) errors.push(`Coordinator dashboard failed: ${JSON.stringify(res.body)}`);
      else console.log('Coordinator dashboard success');
    }

    // 6. Fetch Companies
    if (studentToken) {
      console.log('\n6. Fetching Companies');
      res = await request('GET', '/api/companies', null, studentToken);
      if (res.status !== 200) errors.push(`Fetching companies failed: ${JSON.stringify(res.body)}`);
      else console.log('Fetching companies success');
    }

    // 7. Fetch Notifications
    if (studentToken) {
      console.log('\n7. Fetching Notifications');
      res = await request('GET', '/api/notifications', null, studentToken);
      if (res.status !== 200) errors.push(`Fetching notifications failed: ${JSON.stringify(res.body)}`);
      else console.log('Fetching notifications success');
    }

    // 8. Fetch Experiences
    if (studentToken) {
      console.log('\n8. Fetching Experiences');
      res = await request('GET', '/api/experiences', null, studentToken);
      if (res.status !== 200) errors.push(`Fetching experiences failed: ${JSON.stringify(res.body)}`);
      else console.log('Fetching experiences success');
    }

    // 9. Forgot Password
    console.log('\n9. Forgot Password');
    res = await request('POST', '/api/auth/forgot-password', JSON.stringify({ email: testEmail }));
    if (res.status !== 200) errors.push(`Forgot password failed: ${JSON.stringify(res.body)}`);
    else console.log('Forgot password success');

  } catch (err) {
    console.error('Test script crashed:', err);
    errors.push(`Script crashed: ${err.message}`);
  }

  if (errors.length > 0) {
    console.log('\n--- ERRORS FOUND ---');
    errors.forEach(e => console.error(e));
  } else {
    console.log('\n--- ALL TESTS PASSED ---');
  }
}

runTests();
