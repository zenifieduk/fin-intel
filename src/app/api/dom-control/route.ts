import { NextRequest, NextResponse } from 'next/server'

interface DOMControlRequest {
  action: string
  target?: string
  data?: any
  page?: string
}

export async function POST(request: NextRequest) {
  try {
    const { action, target, data, page }: DOMControlRequest = await request.json()

    console.log('🎮 DOM Control Request:', { action, target, data, page })

    // Route different DOM control actions
    switch (action) {
      case 'navigate':
        return handleNavigation(page || target || '')
      
      case 'update_contract_display':
        return handleContractDisplay(data)
      
      case 'show_player_details':
        return handlePlayerDetails(data)
      
      case 'update_wage_bill':
        return handleWageBillUpdate(data)
      
      case 'highlight_risk_players':
        return handleRiskHighlight(data)
      
      case 'show_projection':
        return handleProjectionDisplay(data)
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown DOM action',
          availableActions: [
            'navigate', 
            'update_contract_display', 
            'show_player_details',
            'update_wage_bill',
            'highlight_risk_players',
            'show_projection'
          ]
        }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ DOM Control Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process DOM control request'
    }, { status: 500 })
  }
}

async function handleNavigation(page: string) {
  const validPages = ['contracts', 'dashboard', 'reports', 'voice', 'architecture']
  
  if (!validPages.includes(page)) {
    return NextResponse.json({
      success: false,
      error: `Invalid page: ${page}. Available pages: ${validPages.join(', ')}`
    }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    action: 'navigate',
    target: `/${page}`,
    message: `Navigating to ${page} page`
  })
}

async function handleContractDisplay(data: any) {
  return NextResponse.json({
    success: true,
    action: 'update_contract_display',
    data: {
      players: data.players || [],
      highlightChanges: true,
      updateTimestamp: new Date().toISOString()
    },
    message: 'Contract display updated'
  })
}

async function handlePlayerDetails(data: any) {
  return NextResponse.json({
    success: true,
    action: 'show_player_details',
    data: {
      playerName: data.playerName,
      contractDetails: data.contractDetails,
      showModal: true
    },
    message: `Showing details for ${data.playerName}`
  })
}

async function handleWageBillUpdate(data: any) {
  return NextResponse.json({
    success: true,
    action: 'update_wage_bill',
    data: {
      total: data.total,
      breakdown: data.breakdown,
      projection: data.projection,
      animateChange: true
    },
    message: 'Wage bill display updated'
  })
}

async function handleRiskHighlight(data: any) {
  return NextResponse.json({
    success: true,
    action: 'highlight_risk_players',
    data: {
      riskPlayers: data.riskPlayers || [],
      riskLevel: data.riskLevel || 'medium',
      pulseEffect: true
    },
    message: 'Risk players highlighted'
  })
}

async function handleProjectionDisplay(data: any) {
  return NextResponse.json({
    success: true,
    action: 'show_projection',
    data: {
      year: data.year,
      projections: data.projections,
      chartType: data.chartType || 'line',
      showAnimation: true
    },
    message: `Showing ${data.year} projections`
  })
}

export async function GET() {
  return NextResponse.json({
    message: 'DOM Control API is running',
    available_actions: [
      'navigate - Navigate to different pages',
      'update_contract_display - Update contract information display',
      'show_player_details - Show detailed player information',
      'update_wage_bill - Update wage bill calculations',
      'highlight_risk_players - Highlight players at risk',
      'show_projection - Display financial projections'
    ],
    usage: 'POST /api/dom-control with action, target, and data parameters'
  })
} 