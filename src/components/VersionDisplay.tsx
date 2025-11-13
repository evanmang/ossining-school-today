import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { VERSION_INFO, RELEASE_NOTES, getVersionString, getFormattedReleaseDate, type ReleaseNote } from '../data/version'

interface VersionDisplayProps {
  compact?: boolean
}

export default function VersionDisplay({ compact = false }: VersionDisplayProps) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  if (compact) {
    return (
      <>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border, #3a3a3a)',
            borderRadius: '12px',
            padding: '8px 12px',
            color: 'var(--fg)',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.transform = 'translateY(0px)'}
        >
          <span>📋</span>
          {getVersionString()}
        </button>
        {isExpanded && <VersionModal onClose={() => setIsExpanded(false)} />}
      </>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '32px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000
    }}>
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border, #3a3a3a)',
            borderRadius: '12px',
            padding: '8px 12px',
            color: 'var(--fg)',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.transform = 'translateY(0px)'}
        >
          <span>📋</span>
          {getVersionString()}
        </button>
      ) : (
        <VersionModal onClose={() => setIsExpanded(false)} />
      )}
    </div>
  )
}

interface VersionModalProps {
  onClose: () => void
}

function VersionModal({ onClose }: VersionModalProps) {
  const { t } = useTranslation()

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Safari-compatible backdrop click detection
    const target = e.target as HTMLElement
    const currentTarget = e.currentTarget as HTMLElement
    
    // Check if the click was on the backdrop (not on modal content)
    if (target === currentTarget || target.classList.contains('modal-backdrop')) {
      e.preventDefault()
      e.stopPropagation()
      onClose()
    }
  }

  const handleBackdropTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    // Safari touch support
    const target = e.target as HTMLElement
    const currentTarget = e.currentTarget as HTMLElement
    
    if (target === currentTarget || target.classList.contains('modal-backdrop')) {
      e.preventDefault()
      e.stopPropagation()
      onClose()
    }
  }

  return (
    <div 
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
        padding: '20px',
        cursor: 'pointer'
      }}
      onClick={handleBackdropClick}
      onTouchEnd={handleBackdropTouch}
    >
      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--border, #3a3a3a)',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto',
        width: '100%',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        color: 'var(--fg)',
        cursor: 'default',
        pointerEvents: 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📋 Release Notes
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--fg)',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {RELEASE_NOTES.map((release, index) => (
            <ReleaseCard key={release.version} release={release} isLatest={index === 0} />
          ))}
        </div>

        <div style={{
          marginTop: '24px',
          padding: '20px',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          borderRadius: '12px',
          fontSize: '16px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            🏫 Built with ❤️ for Ossining Families
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
            Report issues or suggest features at{' '}
            <a 
              href="https://github.com/evanmang/ossining-school-today" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'rgba(255, 255, 255, 0.9)', textDecoration: 'underline' }}
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

interface ReleaseCardProps {
  release: ReleaseNote
  isLatest: boolean
}

function ReleaseCard({ release, isLatest }: ReleaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(isLatest)

  const typeColors = {
    major: '#dc2626',
    minor: '#2563eb',
    patch: '#059669'
  }

  const typeEmojis = {
    major: '🚀',
    minor: '✨',
    patch: '🔧'
  }

  return (
    <div style={{
      border: isLatest ? '2px solid #2563eb' : '1px solid var(--border, #e5e7eb)',
      borderRadius: '8px',
      padding: '16px',
      background: isLatest ? 'rgba(37, 99, 235, 0.1)' : 'var(--card-bg, rgba(255, 255, 255, 0.05))',
      color: 'var(--fg)'
    }}>
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          marginBottom: isExpanded ? '12px' : '0'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{typeEmojis[release.type]}</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--fg)' }}>
              v{release.version}
              {isLatest && (
                <span style={{
                  marginLeft: '8px',
                  background: '#2563eb',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'normal'
                }}>
                  LATEST
                </span>
              )}
            </div>
              <div style={{ fontSize: '14px', color: 'var(--fg-secondary, #6b7280)' }}>
              {getFormattedReleaseDate(release.date)} • 
              <span style={{ 
                color: typeColors[release.type],
                textTransform: 'uppercase',
                fontWeight: 'bold',
                fontSize: '12px',
                marginLeft: '4px'
              }}>
                {release.type}
              </span>
            </div>
          </div>
        </div>
        <div style={{
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          fontSize: '16px',
          color: 'var(--fg-secondary, #6b7280)'
        }}>
          ▼
        </div>
      </div>

      {isExpanded && (
        <div style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--fg)' }}>
          {release.features.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: 'bold', color: '#059669', marginBottom: '4px' }}>
                ✨ New Features
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--fg)' }}>
                {release.features.map((feature, i) => (
                  <li key={i} style={{ marginBottom: '2px', color: 'var(--fg)' }}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {release.improvements.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: 'bold', color: '#2563eb', marginBottom: '4px' }}>
                🔧 Improvements
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--fg)' }}>
                {release.improvements.map((improvement, i) => (
                  <li key={i} style={{ marginBottom: '2px', color: 'var(--fg)' }}>{improvement}</li>
                ))}
              </ul>
            </div>
          )}

          {release.fixes.length > 0 && (
            <div>
              <div style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: '4px' }}>
                🐛 Bug Fixes
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--fg)' }}>
                {release.fixes.map((fix, i) => (
                  <li key={i} style={{ marginBottom: '2px', color: 'var(--fg)' }}>{fix}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}