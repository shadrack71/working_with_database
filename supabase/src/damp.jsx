import { useState, useEffect } from 'react'
import supabase from '../supabase-client.js'
import './TaskManager.css'

export  function TaskManager() {
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [description, setDescription] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks()
  }, [])

  // Fetch all tasks from Supabase
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // Add new task
  const addTask = async () => {
    if (!input.trim()) {
      alert('Please enter a task title')
      return
    }

    const newTask = {
      title: input,
      description: description,
      completed: false,
      created_at: new Date()
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()

      if (error) throw error

      setTasks([data[0], ...tasks])
      setInput('')
      setDescription('')
    } catch (error) {
      console.error('Error adding task:', error.message)
    }
  }

  // Toggle task completion status
  const toggleTask = async (id) => {
    try {
      const task = tasks.find(t => t.id === id)
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', id)

      if (error) throw error

      setTasks(tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ))
    } catch (error) {
      console.error('Error updating task:', error.message)
    }
  }

  // Delete task
  const deleteTask = async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTasks(tasks.filter(t => t.id !== id))
    } catch (error) {
      console.error('Error deleting task:', error.message)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask()
    }
  }

  // Filter tasks based on status
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  // Calculate statistics
  const completedCount = tasks.filter(task => task.completed).length
  const activeCount = tasks.length - completedCount

  if (loading) {
    return <div className="task-manager"><p>Loading tasks...</p></div>
  }

  return (
    <div className="task-manager">
      <header className="task-header">
        <h1>📋 Task Manager</h1>
      </header>

      <div className="task-input-container">
        <input
          type="text"
          placeholder="Add a new task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="task-input"
        />

        <input
          type="text"
          placeholder="Add a description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyPress={handleKeyPress}
          className="task-input"
        />
        <button onClick={addTask} className="add-btn">Add Task</button>
      </div>

      <div className="task-stats">
        <div className="stat">
          <span className="stat-label">Total</span>
          <span className="stat-value">{tasks.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Active</span>
          <span className="stat-value active">{activeCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Completed</span>
          <span className="stat-value completed">{completedCount}</span>
        </div>
      </div>

      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      <div className="tasks-container">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>
              {tasks.length === 0
                ? '✨ No tasks yet. Add one to get started!'
                : `No ${filter} tasks`}
            </p>
          </div>
        ) : (
          <ul className="tasks-list">
            {filteredTasks.map(task => (
              <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <div className="task-content">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="task-checkbox"
                  />
                  <div className="task-info">
                    <span className="task-title">{task.title}</span>
                    {task.description && <p className="task-description">{task.description}</p>}
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="delete-btn"
                  title="Delete task"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}


// sign up 

export default function  signUP(){

    const handleSubmitLoging = async ()=>{
        let email = "shadr"
        let password = "12345"

        const {error:errorSignup } =  await supabase.auth.signUP({email , password})
        if(errorSignup) throw errorSignup

    }

    handleSubmitLoging()

    const handleSubmit = async ()=>{
        const { data, error:errorSignIn } = await supabase.auth.signInWithPassword({
            email: 'example@email.com',
            password: 'example-password',
            })
             if(errorSignIn) throw errorSignIn

    }
    handleSubmit()


    const fetchSession = async ()=>{
        const session = await supabase.auth.getSession()

        console.log(session.data)
    }

    fetchSession()


const listenLogin = async ()=>{
        const session = await supabase.auth.getSession()

        console.log(session.data)
    }




    




}