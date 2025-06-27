import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename = 'Player: James Williams.md' } = body

    console.log(`📄 Processing contract locally: ${filename}`)
    
    // Read the markdown file
    const filePath = path.join(process.cwd(), 'docs', filename)
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        success: false,
        error: `Contract file not found: ${filename}`
      }, { status: 404 })
    }

    const markdownContent = fs.readFileSync(filePath, 'utf-8')
    
    // Parse the contract sections
    const sections = parseContractSections(markdownContent)
    const playerName = extractPlayerName(filename, markdownContent)
    
    // Process each section
    const processedSections = []

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      const confidentiality = classifySectionSensitivity(section.section, section.content)
      const chunkId = `${playerName.toLowerCase().replace(/\s+/g, '-')}-${section.section.toLowerCase().replace(/\s+/g, '-')}-${i}`
      
      processedSections.push({
        id: chunkId,
        player: playerName,
        section: section.section,
        content: section.content,
        confidentiality,
        accessRoles: getRequiredAccessRoles(confidentiality),
        chunkIndex: i,
        contentPreview: section.content.substring(0, 200) + (section.content.length > 200 ? '...' : ''),
        wordCount: section.content.split(/\s+/).length
      })
    }

    console.log(`✅ Successfully processed ${sections.length} sections for ${playerName}`)

    return NextResponse.json({
      success: true,
      message: `Successfully processed contract for ${playerName}`,
      player: playerName,
      sectionsProcessed: sections.length,
      sections: processedSections,
      summary: {
        secretSections: processedSections.filter(s => s.confidentiality === 'secret').length,
        confidentialSections: processedSections.filter(s => s.confidentiality === 'confidential').length,
        restrictedSections: processedSections.filter(s => s.confidentiality === 'restricted').length,
        totalWords: processedSections.reduce((sum, section) => sum + section.wordCount, 0)
      },
      securityClassification: {
        'secret': processedSections.filter(s => s.confidentiality === 'secret').map(s => s.section),
        'confidential': processedSections.filter(s => s.confidentiality === 'confidential').map(s => s.section),
        'restricted': processedSections.filter(s => s.confidentiality === 'restricted').map(s => s.section)
      },
      readyForVectorStorage: true,
      nextSteps: [
        'Set up Upstash Vector database credentials',
        'Store processed sections in vector database',
        'Enable NICO to query contract data securely'
      ]
    })

  } catch (error) {
    console.error('Contract processing error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to process contract'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Show available contracts
    const docsPath = path.join(process.cwd(), 'docs')
    const files = fs.readdirSync(docsPath)
    const contractFiles = files.filter(file => 
      file.endsWith('.md') && file.toLowerCase().includes('player')
    )

    return NextResponse.json({
      success: true,
      message: 'Available contracts for processing',
      availableContracts: contractFiles,
      exampleUsage: {
        endpoint: '/api/process-contract-local',
        method: 'POST',
        body: {
          filename: 'Player: James Williams.md'
        }
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper functions
function extractPlayerName(filename: string, content: string): string {
  const filenameMatch = filename.match(/Player:\s*(.+)\.md$/i)
  if (filenameMatch) {
    return filenameMatch[1].trim()
  }
  
  const contentMatch = content.match(/^Player:\s*(.+)$/m)
  if (contentMatch) {
    return contentMatch[1].trim()
  }
  
  return 'Unknown Player'
}

function parseContractSections(content: string): Array<{section: string, content: string}> {
  const sections = []
  const lines = content.split('\n')
  let currentSection = ''
  let currentContent: string[] = []
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (trimmedLine && !line.startsWith(' ') && !line.startsWith('-') && 
        (trimmedLine.endsWith(':') || isSectionHeader(trimmedLine))) {
      
      if (currentSection && currentContent.length > 0) {
        sections.push({
          section: currentSection,
          content: currentContent.join('\n').trim()
        })
      }
      
      currentSection = trimmedLine.replace(':', '')
      currentContent = [line]
    } else {
      currentContent.push(line)
    }
  }
  
  if (currentSection && currentContent.length > 0) {
    sections.push({
      section: currentSection,
      content: currentContent.join('\n').trim()
    })
  }
  
  return sections
}

function isSectionHeader(line: string): boolean {
  const sectionKeywords = [
    'Player', 'Contract Start Date', 'Contract End Date', 'Basic Wage', 
    'Wage Changes', 'Appearance Fees', 'Signing On Fees', 'Loyalty Bonus',
    'Bonuses', 'Release Clause', 'Image Rights', 'Definitions'
  ]
  
  return sectionKeywords.some(keyword => 
    line.toLowerCase().includes(keyword.toLowerCase())
  )
}

function classifySectionSensitivity(sectionName: string, content: string): 'confidential' | 'restricted' | 'secret' {
  const secretKeywords = ['release clause', 'loyalty bonus', 'image rights']
  const confidentialKeywords = ['wage', 'salary', 'bonus', 'fee', 'payment']
  
  const lowerSection = sectionName.toLowerCase()
  const lowerContent = content.toLowerCase()
  
  if (secretKeywords.some(keyword => lowerSection.includes(keyword) || lowerContent.includes(keyword))) {
    return 'secret'
  }
  
  if (confidentialKeywords.some(keyword => lowerSection.includes(keyword) || lowerContent.includes(keyword))) {
    return 'confidential'
  }
  
  return 'restricted'
}

function getRequiredAccessRoles(confidentiality: string): string[] {
  switch (confidentiality) {
    case 'secret':
      return ['board', 'legal']
    case 'confidential':
      return ['board', 'legal', 'finance']
    case 'restricted':
      return ['board', 'legal', 'finance', 'management']
    default:
      return ['board']
  }
} 