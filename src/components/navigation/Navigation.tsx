'use client'

import Link from 'next/link'
import { useUser } from '@/contexts'
import { UserMenu } from '@/components/user'
import { AuthModal } from '@/components/auth'
import { useState } from 'react'

interface NavigationProps {
  showAuthButton?: boolean
}

export default function Navigation({ showAuthButton = true }: NavigationProps) {
  const { isAuthenticated, login } = useUser()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup')

  const handleSignUpClick = () => {
    setAuthMode('signup')
    setShowAuthModal(true)
  }

  const handleAuthSuccess = (user: any, token: string) => {
    // Handle successful authentication by calling login
    console.log('🔑 Navigation: Authentication successful, logging in user:', user.id)
    login(user, token)
    setShowAuthModal(false)
  }

  return (
    <>
      <nav className="nav">
        <Link href="/" className="logo">
          ChatterForms
        </Link>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#examples">Examples</a>
          <a href="#pricing">Pricing</a>
          <UserMenu />
          {showAuthButton && !isAuthenticated && (
            <button onClick={handleSignUpClick} className="sign-up-btn">Sign Up</button>
          )}
        </div>
      </nav>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  )
}
