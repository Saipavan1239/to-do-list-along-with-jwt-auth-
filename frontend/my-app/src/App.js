import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [editTaskValue, setEditTaskValue] = useState('');

  useEffect(() => {
    if (token) {
      fetchTasksFromMongoDB();
    }
  }, [token]);

  const fetchTasksFromMongoDB = async () => {
  setLoading(true);
  setError('');
  setSuccess(null);

  try {
    const response = await axios.get('http://localhost:8000/tasks/tasks', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.message === 'No tasks found') {
      setTasks([]);
    } else {
      setTasks(response.data);
    }
  } catch (error) {
    console.error('Failed to fetch tasks', error);
    setError('Failed to fetch tasks');
    setTasks([]); // Default to empty array on error
  } finally {
    setLoading(false);
  }
};


  const handleInputChange = (e) => {
    setTask(e.target.value);
    setError('');
    setSuccess(null);
  };

  const handleSubmit = async () => {
    if (task.trim() === '') {
      setError('Task cannot be empty');
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        'http://localhost:8000/tasks/tasks',
        { task },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('Task added successfully');
      setTask('');
      fetchTasksFromMongoDB();
    } catch (error) {
      setError('Failed to add task');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    setLoading(true);

    try {
      await axios.delete(`http://localhost:8000/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Task deleted successfully');
      fetchTasksFromMongoDB();
    } catch (error) {
      setError('Failed to delete task');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (taskId) => {
    const taskToEdit = tasks.find((t) => t._id === taskId);
    setEditTask(taskId);
    setEditTaskValue(taskToEdit.task);
  };

  const handleUpdateSubmit = async (taskId) => {
    if (editTaskValue.trim() === '') {
      setError('Task cannot be empty');
      return;
    }

    setLoading(true);

    try {
      await axios.put(
        `http://localhost:8000/tasks/${taskId}`,
        { task: editTaskValue },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('Task updated successfully');
      setEditTask(null);
      setEditTaskValue('');
      fetchTasksFromMongoDB();
    } catch (error) {
      setError('Failed to update task');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8000/auth/login', {
        username,
        password,
      });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      fetchTasksFromMongoDB();
    } catch (error) {
      setError('Failed to login');
      console.error(error);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:8000/auth/register', {
        username,
        password,
      });
      setSuccess('User registered successfully');
    } catch (error) {
      setError('Failed to register');
      console.error(error);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setTasks([]);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>To-Do List</h1>

      {!token && (
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: '10px', width: '300px', marginRight: '10px' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '10px', width: '300px', marginRight: '10px' }}
          />
          <button onClick={handleLogin} style={{ padding: '10px 20px' }}>
            Login
          </button>
          <button
            onClick={handleRegister}
            style={{ padding: '10px 20px', marginLeft: '10px' }}
          >
            Register
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
      )}

      {token && (
        <div>
          <button onClick={handleLogout} style={{ padding: '10px 20px' }}>
            Logout
          </button>
          <input
            type="text"
            value={task}
            onChange={handleInputChange}
            placeholder="Enter a new task"
            style={{ padding: '10px', width: '300px', marginRight: '10px' }}
          />
          <button onClick={handleSubmit} style={{ padding: '10px 20px' }}>
            Add Task
          </button>

          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}

          {tasks.length === 0 && <p>No tasks found for this user</p>}

          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {tasks.map((t) => (
              <li key={t._id} style={{ marginBottom: '10px' }}>
                {editTask === t._id ? (
                  <div>
                    <input
                      type="text"
                      value={editTaskValue}
                      onChange={(e) => setEditTaskValue(e.target.value)}
                      style={{ padding: '10px', width: '300px', marginRight: '10px' }}
                    />
                    <button
                      onClick={() => handleUpdateSubmit(t._id)}
                      style={{ padding: '10px 20px', marginRight: '10px' }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditTask(null)}
                      style={{ padding: '10px 20px' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <span>{t.task}</span>
                    <button
                      onClick={() => handleUpdate(t._id)}
                      style={{ padding: '10px 20px', marginLeft: '10px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      style={{ padding: '10px 20px', marginLeft: '10px' }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
