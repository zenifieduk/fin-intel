'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface DOMControlEvent {
  action: string
  target?: string
  data?: any
  message?: string
}

interface NicoDOMControllerProps {
  onActionReceived?: (action: DOMControlEvent) => void
}

export default function NicoDOMController({ onActionReceived }: NicoDOMControllerProps) {
  const router = useRouter()
  const [lastAction, setLastAction] = useState<DOMControlEvent | null>(null)
  const [isListening, setIsListening] = useState(false) // Default to OFF to stop terminal spam

  // Poll for DOM control commands from NICO
  useEffect(() => {
    if (!isListening) return

    const pollForCommands = async () => {
      try {
        // This would be replaced with WebSocket or Server-Sent Events in production
        // For now, we'll use a polling mechanism
        const response = await fetch('/api/dom-control/poll', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
          const command = await response.json()
          if (command.action) {
            await executeCommand(command)
          }
        }
      } catch (error) {
        console.error('Error polling for DOM commands:', error)
      }
    }

    const interval = setInterval(pollForCommands, 5000) // Poll every 5 seconds to reduce spam
    return () => clearInterval(interval)
  }, [isListening])

  const executeCommand = async (command: DOMControlEvent) => {
    console.log('🎮 Executing DOM Command:', command)
    setLastAction(command)

    switch (command.action) {
      case 'navigate':
        handleNavigation(command.target || '')
        break

      case 'update_contract_display':
        handleContractDisplay(command.data)
        break

      case 'show_player_details':
        handlePlayerDetails(command.data)
        break

      case 'update_wage_bill':
        handleWageBillUpdate(command.data)
        break

      case 'highlight_risk_players':
        handleRiskHighlight(command.data)
        break

      case 'show_projection':
        handleProjectionDisplay(command.data)
        break

      default:
        console.warn('Unknown DOM command:', command.action)
    }

    // Notify parent component
    if (onActionReceived) {
      onActionReceived(command)
    }
  }

  const handleNavigation = (target: string) => {
    if (target && target.startsWith('/')) {
      router.push(target)
      showNotification(`Navigating to ${target}`)
    }
  }

  const handleContractDisplay = (data: any) => {
    // Update contract display elements
    const contractElements = document.querySelectorAll('[data-contract-display]')
    contractElements.forEach(element => {
      if (data.highlightChanges) {
        element.classList.add('animate-pulse', 'bg-blue-100')
        setTimeout(() => {
          element.classList.remove('animate-pulse', 'bg-blue-100')
        }, 2000)
      }
    })
    showNotification('Contract display updated')
  }

  const handlePlayerDetails = (data: any) => {
    // Show player details modal or sidebar
    const event = new CustomEvent('showPlayerDetails', {
      detail: {
        playerName: data.playerName,
        contractDetails: data.contractDetails
      }
    })
    window.dispatchEvent(event)
    showNotification(`Showing details for ${data.playerName}`)
  }

  const handleWageBillUpdate = (data: any) => {
    // Update wage bill display
    const wageBillElements = document.querySelectorAll('[data-wage-bill]')
    wageBillElements.forEach(element => {
      if (data.animateChange) {
        element.classList.add('animate-bounce')
        setTimeout(() => {
          element.classList.remove('animate-bounce')
        }, 1000)
      }
    })
    showNotification('Wage bill updated')
  }

  const handleRiskHighlight = (data: any) => {
    // Highlight risk players
    const playerElements = document.querySelectorAll('[data-player]')
    playerElements.forEach(element => {
      const playerName = element.getAttribute('data-player')
      if (data.riskPlayers?.includes(playerName)) {
        element.classList.add('ring-2', 'ring-red-500', 'animate-pulse')
        if (data.pulseEffect) {
          setTimeout(() => {
            element.classList.remove('animate-pulse')
          }, 3000)
        }
      }
    })
    showNotification(`Highlighted ${data.riskPlayers?.length || 0} risk players`)
  }

  const handleProjectionDisplay = (data: any) => {
    // Show projection chart/display
    const event = new CustomEvent('showProjections', {
      detail: {
        year: data.year,
        projections: data.projections,
        chartType: data.chartType
      }
    })
    window.dispatchEvent(event)
    showNotification(`Showing ${data.year} projections`)
  }

  const showNotification = (message: string) => {
    // Create a temporary notification
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg z-50 animate-slide-in'
    notification.textContent = `🎤 NICO: ${message}`
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.classList.add('animate-fade-out')
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  // Manual command execution for testing
  const executeManualCommand = async (action: string, data?: any) => {
    const command: DOMControlEvent = { action, data }
    await executeCommand(command)
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 bg-white rounded-lg shadow-lg p-3 border">
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        <span className="font-medium">NICO Controller</span>
        <button
          onClick={() => setIsListening(!isListening)}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
        >
          {isListening ? 'Disable' : 'Enable'}
        </button>
      </div>
      
      {lastAction && (
        <div className="mt-2 text-xs text-gray-600">
          Last: {lastAction.action} {lastAction.message && `- ${lastAction.message}`}
        </div>
      )}

      {/* Debug controls - remove in production */}
      <div className="mt-2 flex gap-1">
        <button
          onClick={() => executeManualCommand('navigate', { target: '/contracts' })}
          className="px-2 py-1 bg-gray-200 text-xs rounded"
        >
          Test Nav
        </button>
        <button
          onClick={() => executeManualCommand('highlight_risk_players', { riskPlayers: ['André Onana'], pulseEffect: true })}
          className="px-2 py-1 bg-red-200 text-xs rounded"
        >
          Test Risk
        </button>
      </div>
    </div>
  )
} 