'use client'

import React from 'react'
import { FormCards } from '@/components/forms'
import { Navigation } from '@/components/navigation'
import './workspace.css'

export default function WorkspacePage() {
  return (
    <div className="workspace-page">
      <Navigation showAuthButton={false} />
      <div className="workspace-header">
        <h1>Your Forms Workspace</h1>
        <p>Manage and organize all your forms</p>
      </div>
      <FormCards showAllForms={true} />
    </div>
  )
}
