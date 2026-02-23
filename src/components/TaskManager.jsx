import { useEffect, useState } from 'react'

import supabase from '../supabase-client.js'
import './TaskManager.css'

export default function TaskManager() {
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [description, setDescription] = useState('')
  const [filter, setFilter] = useState('all') // all, active, completed
  const [loading, setLoading] = useState(true)

useEffect(()=>{
    fetchTasks()
},[])


const fetchTasks = async ()=>{
    try {
        setLoading(true)
        const {data , error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        
        if (error) throw error
        setTasks(data || [])
        
    } catch (error) {
        console.error('Error fetching tasks:', error.message)
        
    }


}
const addTask =  async (e) => {
    e.preventDefault()

    if (input.trim() === '') return
    if (description.trim() === '') return


    const newTask = {
      title: input,
      description:description,
      completed: false,
    }



    const { error } = await supabase.from('tasks').insert(newTask).single()

    if(error){
        console.error('Error adding tasks:', error.message)
    }
    setTasks([newTask, ...tasks])
    setInput('')
    setDescription('')
    


  }

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter') {
     await addTask(e)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const completedCount = tasks.filter(task => task.completed).length
  const activeCount = tasks.length - completedCount

//   if (loading) {
//     return <div className="task-manager"><p>Loading tasks...</p></div>
//   }

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
          placeholder="Add a new task description..."
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
                ? 'No tasks yet. Add one to get started!'
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
                    <p className="task-description">{task.description}</p>
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
