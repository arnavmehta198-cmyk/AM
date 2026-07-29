import React from 'react'
import { createRoot } from 'react-dom/client'
import AdminPage from './AdminPage'

const container = document.getElementById('admin-page-root')
if (container) {
  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <AdminPage />
    </React.StrictMode>
  )
}
