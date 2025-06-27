import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Simple contract processor without the complex types to avoid linter issues
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename = 'Player: James Williams.md' } = body

    console.log(`📄 Processing contract: ${filename}`)
    
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
    
    // Classify each section
    const processedSections = sections.map((section, index) => ({
      id: `${playerName.toLowerCase().replace(/\s+/g, '-')}-${section.section.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      player: playerName,
      section: section.section,
      content: section.content,
      confidentiality: classifySectionSensitivity(section.section, section.content),
      accessRoles: getRequiredAccessRoles(classifySectionSensitivity(section.section, section.content)),
      chunkIndex: index
    }))

    // TODO: Store in Upstash Vector (when environment variables are available)
    // For now, just return the processed structure
    
    return NextResponse.json({
      success: true,
      message: `Successfully processed contract for ${playerName}`,
      player: playerName,
      sectionsProcessed: processedSections.length,
      sections: processedSections,
      summary: {
        secretSections: processedSections.filter(s => s.confidentiality === 'secret').length,
        confidentialSections: processedSections.filter(s => s.confidentiality === 'confidential').length,
        restrictedSections: processedSections.filter(s => s.confidentiality === 'restricted').length
      }
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
    // List available contracts in docs folder
    const docsPath = path.join(process.cwd(), 'docs')
    const files = fs.readdirSync(docsPath)
    const contracts = files.filter(file => 
      file.endsWith('.md') && file.toLowerCase().includes('player')
    )

    return NextResponse.json({
      success: true,
      message: 'Available contracts',
      contracts,
      usage: {
        processContract: 'POST with { "filename": "Player: James Williams.md" }',
        example: 'POST /api/process-contract'
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
  // Try filename first: "Player: James Williams.md" -> "James Williams"
  const filenameMatch = filename.match(/Player:\s*(.+)\.md$/i)
  if (filenameMatch) {
    return filenameMatch[1].trim()
  }
  
  // Try content first line: "Player: James Williams"
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
    
    // If line looks like a section header
    if (trimmedLine && !line.startsWith(' ') && !line.startsWith('-') && 
        (trimmedLine.endsWith(':') || isSectionHeader(trimmedLine))) {
      
      // Save previous section
      if (currentSection && currentContent.length > 0) {
        sections.push({
          section: currentSection,
          content: currentContent.join('\n').trim()
        })
      }
      
      // Start new section
      currentSection = trimmedLine.replace(':', '')
      currentContent = [line]
    } else {
      // Add to current section
      currentContent.push(line)
    }
  }
  
  // Don't forget the last section
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
      return ['board', 'legal'] // Only board and legal for most sensitive
    case 'confidential':
      return ['board', 'legal', 'finance'] // Add finance for financial details
    case 'restricted':
      return ['board', 'legal', 'finance', 'management'] // Management can see basic info
    default:
      return ['board']
  }
} 