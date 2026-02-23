import { useState, useEffect } from 'react'
import supabase from './supabase-client.js'
import './Dashboard.css'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)
    try {
      // Fetch sales data
      const { data: salesData, error: salesError } = await supabase
        .from('sales_deals')
        .select('*')
        
        console.log(salesData)

      if (salesError) throw salesError
      setSales(salesData || [])

      // Calculate summary
      const total = salesData?.reduce((sum, sale) => sum + sale.value, 0) || 0
      const average = salesData?.length > 0 ? total / salesData.length : 0

      setSummary({
        totalSales: total,
        averageSale: average,
        totalTransactions: salesData?.length || 0
      })
    } catch (error) {
      console.error('Error loading dashboard:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📊 Sales Dashboard</h1>
        <button className="refresh-btn" onClick={loadDashboard}>Refresh</button>
      </header>

      <div className="summary-cards">
        <div className="card">
          <h3>Total Sales</h3>
          <p className="value">${summary?.totalSales.toFixed(2) || '0.00'}</p>
        </div>
        <div className="card">
          <h3>Average Sale</h3>
          <p className="value">${summary?.averageSale.toFixed(2) || '0.00'}</p>
        </div>
        <div className="card">
          <h3>Transactions</h3>
          <p className="value">{summary?.totalTransactions || 0}</p>
        </div>
      </div>

      <div className="sales-table">
        <h2>Recent Sales</h2>
        {sales.length === 0 ? (
          <p className="no-data">No sales data available</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id}>
                  <td>{sale.id}</td>
                  <td>${sale.amount.toFixed(2)}</td>
                  <td>{new Date(sale.created_at).toLocaleDateString()}</td>
                  <td><span className={`status ${sale.status?.toLowerCase()}`}>{sale.status || 'Completed'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}