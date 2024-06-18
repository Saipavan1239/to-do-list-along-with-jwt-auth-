import express from 'express';
import Task from '../schema/taskSchema.js';
import { verifyToken, authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Endpoint to get all tasks of a specific user
router.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    if (tasks.length === 0) {
      return res.status(200).json({ message: 'No tasks found' });
    }
    res.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks', error);
    res.status(500).send('Failed to fetch tasks');
  }
});

// Endpoint to add a new task for the authenticated user
router.post('/tasks', authenticateToken, async (req, res) => {
  const { task } = req.body;
  console.log('Adding task:', task);

  try {
    const newTask = new Task({
      user: req.user._id, // Use the authenticated user's _id from middleware
      task,
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Failed to add task', error);
    res.status(500).send('Failed to add task');
  }
});

// Endpoint to update a task belonging to the authenticated user
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { task } = req.body;

  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { task },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).send('Task not found');
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Failed to update task', error);
    res.status(500).send('Failed to update task');
  }
});

// Endpoint to delete a task belonging to the authenticated user
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findOneAndDelete({ _id: id, user: req.user._id });

    if (!deletedTask) {
      return res.status(404).send('Task not found');
    }

    res.json(deletedTask);
  } catch (error) {
    console.error('Failed to delete task', error);
    res.status(500).send('Failed to delete task');
  }
});

export default router;
