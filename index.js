require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const sqlite3 = require('sqlite3').verbose();

// Add body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

// Connect to the SQLite database
const db = new sqlite3.Database('./database.sqlite');

const port = process.env.PORT || 9002;
// Secret key for JWT
const secretKey = 'your-secret-key';

// Create tables in the database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER,
    title TEXT,
    description TEXT,
    image TEXT,
    FOREIGN KEY(teacher_id) REFERENCES teachers(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS student_classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    class_id INTEGER,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(class_id) REFERENCES classes(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS class_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    class_id INTEGER,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(class_id) REFERENCES classes(id)
  )`);
});

// Helper function to run database queries
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        const result = rows.map(row => ({ ...row }));
        resolve(result);
      }
    });
  });
}

// Helper function to generate JWT token
function generateToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    // Get auth header value, should be in the format 'Bearer <token>'
  const token = req.headers.authorization.split(' ')[1];
  console.log(token);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, secretKey, (error, decoded) => {
    if (error) {
      console.error(error);
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (decoded.role === 'teacher') {
      req.teacher = decoded;
    }

    if (decoded.role === 'student') {
        req.student = decoded;
     }
    next();
  });
}

// get all classes
app.get('/api/classes', async (req, res) => {
    try {
        const classes = await runQuery('SELECT * FROM classes');
        res.json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Teacher sign up
app.post('/api/teacher/signup', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  try {
    // Check if teacher with the same email already exists
    const existingTeacher = await runQuery('SELECT * FROM teachers WHERE email = ?', [email]);
    if (existingTeacher.length > 0) {
      return res.status(400).json({ error: 'Teacher with the same email already exists' });
    }

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Register the teacher in the database
    const result = await runQuery(
      'INSERT INTO teachers (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
      [first_name, last_name, email, hashedPassword]
    );

    // Generate token
    const token = generateToken({ id: result.lastID, role: 'teacher' });

    res.json({ message: 'Teacher signed up successfully', teacher_id: result.lastID, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Teacher login
app.post('/api/teacher/login', (req, res) => {
  const { email, password } = req.body;

  // Find the teacher by email
  db.get('SELECT * FROM teachers WHERE email = ?', [email], async (error, row) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (!row) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if the password matches
    const passwordMatches = await bcrypt.compare(password, row.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create and return JWT token
    const token = jwt.sign({ id: row.id, role: 'teacher' }, secretKey, { expiresIn: '1h' });

    res.json({ message: 'Teacher logged in successfully', teacher_id: row.id, token });
  });
});

// Teacher create a class
app.post('/api/classes', verifyToken, async (req, res) => {
  if (!req.teacher) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { title, description, image } = req.body;
  const teacher_id = req.teacher.id;

  try {
    const result = await runQuery(
      'INSERT INTO classes (teacher_id, title, description, image) VALUES (?, ?, ?, ?)',
      [teacher_id, title, description, image]
    );

    res.json({ message: 'Class created successfully', class_id: result.lastID });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Teacher update a class
app.put('/api/classes/:class_id', verifyToken, async (req, res) => {
  if (!req.teacher) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { class_id } = req.params;
  const { title, description, image } = req.body;
  const teacher_id = req.teacher.id;

  try {
    const classResult = await runQuery('SELECT * FROM classes WHERE id = ?', [class_id]);

    if (classResult.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (classResult[0].teacher_id !== teacher_id) {
      return res.status(403).json({ error: 'Not authorized to update this class' });
    }

    await runQuery(
      'UPDATE classes SET title = ?, description = ?, image = ? WHERE id = ?',
      [title, description, class_id, image]
    );

    res.json({ message: 'Class updated successfully', class_id: classResult[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Teacher delete a class
app.delete('/api/classes/:class_id', verifyToken, async (req, res) =>{
  if (!req.teacher) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { class_id } = req.params;
  const teacher_id = req.teacher.id;

  try {
    const classResult = await runQuery('SELECT * FROM classes WHERE id = ?', [class_id]);

    if (classResult.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (classResult[0].teacher_id !== teacher_id) {
      return res.status(403).json({ error: 'Not authorized to delete this class' });
    }

    await runQuery('DELETE FROM classes WHERE id = ?', [class_id]);

    res.json({ message: 'Class deleted successfully', class_id: classResult[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Teacher approve a student's request to join a class
app.post('/api/classes/:class_id/approve/:student_id', verifyToken, async (req, res) => {
  if (!req.teacher) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { class_id } = req.params;
  const { student_id } = req.params;
  const teacher_id = req.teacher.id;

  try {
    const classResult = await runQuery('SELECT * FROM classes WHERE id = ?', [class_id]);

    if (classResult.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    if (classResult[0].teacher_id !== teacher_id) {
      return res.status(403).json({ error: 'Not authorized to approve requests for this class' });
    }

    const requestResult = await runQuery(
      'SELECT * FROM class_requests WHERE class_id = ? AND student_id = ?',
      [class_id, student_id]
    );

    if (requestResult.length === 0) {
      return res.status(404).json({ error: 'Class request not found' });
    }

    await runQuery('DELETE FROM class_requests WHERE id = ?', [requestResult[0].id]);

    await runQuery(
      'INSERT INTO student_classes (student_id, class_id) VALUES (?, ?)',
      [student_id, class_id]
    );

    res.json({ message: 'Request approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Student sign up
app.post('/api/student/signup', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  try {
    // Check if student with the same email already exists
    const existingStudent = await runQuery('SELECT * FROM students WHERE email = ?', [email]);
    if (existingStudent.length > 0) {
      return res.status(400).json({ error: 'Student with the same email already exists' });
    }

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Register the student in the database
    const result = await runQuery(
      'INSERT INTO students (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
      [first_name, last_name, email, hashedPassword]
    );

    // Generate token
    const token = generateToken({ id: result.lastID, role: 'student' });

    res.json({ message: 'Student signed up successfully', student_id: result.lastID, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Student login
app.post('/api/student/login', (req, res) => {
  const { email, password } = req.body;

  // Find the student by email
  db.get('SELECT * FROM students WHERE email = ?', [email], async (error, row) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred' });
    }
    if (!row) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if the password matches
    const passwordMatches = await bcrypt.compare(password, row.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create and return JWT token
    const token = jwt.sign({ id: row.id, role: 'student' }, secretKey, { expiresIn: '1h' });

    res.json({ message: 'Student logged in successfully', student_id: row.id, token });
  });
});

// Teacher view all class requests and student information
app.get('/api/teacher/class-requests', verifyToken, async (req, res) => {
  if (!req.teacher) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const teacher_id = req.teacher.id;

  try {
    // Check if the teacher has permission to view the class requests
    const teacherClasses = await runQuery(
      'SELECT id FROM classes WHERE teacher_id = ?',
      [teacher_id]
    );

    if (teacherClasses.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view class requests' });
    }

    const classRequests = await runQuery(`
      SELECT cr.id AS request_id, s.id AS student_id, s.first_name, s.last_name, s.email,
             c.id AS class_id, c.title AS class_title, c.description AS class_description, c.image AS class_image
      FROM class_requests cr
      INNER JOIN students s ON cr.student_id = s.id
      INNER JOIN classes c ON cr.class_id = c.id
      WHERE cr.class_id IN (${teacherClasses.map(_ => '?').join(', ')})
    `, teacherClasses.map(row => row.id));

    res.json(classRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});



// Student profile
app.get('/api/student/profile', verifyToken, async (req, res) => {
  if (!req.student) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const student_id = req.student.id;

  try {
    const studentProfile = await runQuery('SELECT id, first_name, last_name, email FROM students WHERE id = ?', [student_id]);
    res.json(studentProfile[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Teacher profile
app.get('/api/teacher/profile', verifyToken, async (req, res) => {
  if (!req.teacher) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const teacher_id = req.teacher.id;

  try {
    const teacherProfile = await runQuery('SELECT id, first_name, last_name, email FROM teachers WHERE id = ?', [teacher_id]);
    res.json(teacherProfile[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// Student request to join a class
app.post('/api/classes/:class_id/request', verifyToken, async (req, res) => {
  console.log(req.student)
  if (!req.student) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { class_id } = req.params;
  const student_id = req.student.id;

  try {
    const classResult = await runQuery('SELECT * FROM classes WHERE id = ?', [class_id]);

    if (classResult.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const requestResult = await runQuery(
      'SELECT * FROM class_requests WHERE class_id = ? AND student_id = ?',
      [class_id, student_id]
    );

    if (requestResult.length > 0) {
      return res.status(400).json({ error: 'Request already sent for this class' });
    }

    await runQuery(
      'INSERT INTO class_requests (student_id, class_id) VALUES (?, ?)',
      [student_id, class_id]
    );

    res.json({ message: 'Request sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Teacher view all approved students and the classes they're attending
app.get('/api/teacher/approved-students', verifyToken, async (req, res) => {
  if (!req.teacher) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const teacher_id = req.teacher.id;

  try {
    // Check if the teacher has permission to view approved students
    const teacherClasses = await runQuery(
      'SELECT id FROM classes WHERE teacher_id = ?',
      [teacher_id]
    );

    if (teacherClasses.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view approved students' });
    }

    const approvedStudents = await runQuery(`
      SELECT s.id AS student_id, s.first_name, s.last_name, s.email,
             c.id AS class_id, c.title AS class_title, c.description AS class_description, c.image AS class_image
      FROM students s
      INNER JOIN student_classes sc ON s.id = sc.student_id
      INNER JOIN classes c ON sc.class_id = c.id
      WHERE c.id IN (${teacherClasses.map(_ => '?').join(', ')})
    `, teacherClasses.map(row => row.id));

    res.json(approvedStudents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// Student view all classes they're attending
app.get('/api/student/classes', verifyToken, async (req, res) => {
  if (!req.student) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const student_id = req.student.id;

  try {
    const classes = await runQuery(`
      SELECT c.id, c.title, c.description, c.image, t.first_name, t.last_name
      FROM classes c
      INNER JOIN student_classes sc ON c.id = sc.class_id
      INNER JOIN teachers t ON c.teacher_id = t.id
      WHERE sc.student_id = ?
    `, [student_id]);

    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
