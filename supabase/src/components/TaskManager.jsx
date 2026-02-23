import { useEffect, useState } from 'react'

import supabase from '../supabase-client.js'
import './TaskManager.css'

export default function TaskManager({ user, onSignOut }) {
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [description, setDescription] = useState('')
  const [newDescription, setNewDescription] = useState("");
  const [filter, setFilter] = useState('all') // all, active, completed
  const [loading, setLoading] = useState(true)
  const [taskImage, setTaskImage] = useState(null);

useEffect(()=>{
    fetchTasks()
},[])


// Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('tasks_change')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Real-time update:', payload)
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t))
            )
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id))
          }
        }
      )
      .subscribe()
      setLoading(false)

    return () => {
      channel.unsubscribe()
    }
    
  }, [])


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
        
    } finally {
    setLoading(false)
  }


}


const deleteTask = async (id)=>{
    try {
        setLoading(true)
        const {error } = await supabase
        .from('tasks')
        .delete()
        .eq('id',id)
        
        if (error) throw error
        setTasks(tasks.filter(t => t.id !== id))
        
    } catch (error) {
        console.error('Error deleting task:', error.message)
        
    } finally {
    setLoading(false)
  }


}
const updateTask = async (id)=>{
    try {
        if (!newDescription.trim()) {
            alert('Please enter a description')
             return
        }
        setLoading(true)
        const {error } = await supabase
        .from('tasks')
        .update({ description: newDescription })
        .eq('id',id)
        
        if (error) throw error
        setTasks(tasks.map(t =>
        t.id === id ? { ...t, description: newDescription } : t
      ))
        
    } catch (error) {
        console.error('Error updating task:', error.message)
        
    } finally {
    setLoading(false)
  }


}

const uploadImage = async (taskImage)=>{
    const filePath = `${taskImage.name}-${Date.now()}`;

    const { error } = await supabase.storage
    .from('task_image')
    .upload(filePath, taskImage, {
        cacheControl: '3600',
        upsert: false
    })


    if (error) {
      console.error("Error uploading image:", error.message);
      return null;
    }

    const { data } = await supabase.storage
      .from("task_image")
      .getPublicUrl(filePath);

    return data.publicUrl;

}
const addTask =  async (e) => {
    e.preventDefault()

    let imageUrl = null

    if(taskImage){
        imageUrl = await uploadImage(taskImage)
    }
    

    if (input.trim() === '') return
    if (description.trim() === '') return


    const newTask = {
      title: input,
      description:description,
      user_id: user.id,
      image_url:imageUrl,
      completed: false,
    }

    const { error } = await supabase.from('tasks').insert({...newTask,email:user.email}).single()

    if(error){
        console.error('Error adding tasks:', error.message)
    }
    setTasks([newTask, ...tasks])
    setInput('')
    setDescription('')


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
     } finally {
    setLoading(false)
  }
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
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      onSignOut()
    } catch (error) {
      console.error('Error signing out:', error.message)
    }
  }


  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setTaskImage(e.target.files[0]);
    }
  };


  

  return (
    <div className="task-manager">
      <header className="task-header">
        <h1>📋 Task Manager</h1>
        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleSignOut} className="signout-btn">
            Sign Out
          </button>
        </div>
      </header>

      <div className="task-input-container">
        <div className="input-group">
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
        </div>

        <div className="input-actions">
          <label className="file-input-label">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="file-input"
            />
            <span className="file-input-text">
              {taskImage ? `✓ ${taskImage.name}` : '📷 Upload Image'}
            </span>
          </label>
          <button onClick={addTask} className="add-btn">Add Task</button>
        </div>
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
                  {task.image_url && (
                    <div className="task-image-wrapper">
                      <img src={task.image_url} alt={task.title} className="task-image" />
                    </div>
                  )}
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="task-checkbox"
                  />
                  <div className="task-info">
                    <span className="task-title">{task.title}</span>
                    <p className="task-description">{task.description}</p>
                    <div className="task-edit-section">
                      <input
                        type="text"
                        placeholder="Update description..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="task-edit-input"
                      />
                      <button
                        className="task-edit-btn"
                        onClick={() => updateTask(task.id)}
                      >
                        Update
                      </button>
                    </div>
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
