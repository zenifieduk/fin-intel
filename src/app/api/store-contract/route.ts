import { NextRequest, NextResponse } from 'next/server'
import { Index, Vector } from '@upstash/vector'
import fs from 'fs'
import path from 'path'

// Initialize Upstash Vector with your credentials
const index = new Index({
  url: "https://busy-mosquito-10553-us1-vector.upstash.io",
  token: "ABcFMGJ1c3ktbW9zcXVpdG8tMTA1NTMtdXMxYWRtaW5PVEExTjJVMFpUSXRObVU4TlMwME9EQmxMVGswTmpRdE9HRTNNR1ExTnpnME5qaGs="
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename = 'Player: James Williams.md' } = body

    console.log(`📄 Storing contract in vector DB: ${filename}`)
    
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
    
    // Create vectors for each section
    const vectors = []
    const processedSections = []

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      const confidentiality = classifySectionSensitivity(section.section, section.content)
      const chunkId = `${playerName.toLowerCase().replace(/\s+/g, '-')}-${section.section.toLowerCase().replace(/\s+/g, '-')}-${i}`
      
      // Create vector with Upstash format
      const vector = {
        id: chunkId,
        data: section.content, // Upstash Vector auto-generates embeddings
        metadata: {
          source: filename,
          player_name: playerName,
          section: section.section,
          confidentiality,
          contract_type: 'player',
          chunk_index: i,
          timestamp: new Date().toISOString(),
          access_roles: getRequiredAccessRoles(confidentiality).join(','),
          type: 'contract'
        }
      }
      
      vectors.push(vector)
      
      processedSections.push({
        id: chunkId,
        player: playerName,
        section: section.section,
        content: section.content,
        confidentiality,
        accessRoles: getRequiredAccessRoles(confidentiality),
        chunkIndex: i
      })
    }

    // Store all vectors in Upstash
    console.log(`💾 Storing ${vectors.length} contract sections in vector database...`)
    
    const upsertResult = await index.upsert(vectors)
    
    console.log(`✅ Successfully stored ${vectors.length} sections for ${playerName}`)

    return NextResponse.json({
      success: true,
      message: `Successfully stored contract for ${playerName} in vector database`,
      player: playerName,
      sectionsStored: vectors.length,
      vectorDbResult: upsertResult,
      sections: processedSections,
      summary: {
        secretSections: processedSections.filter(s => s.confidentiality === 'secret').length,
        confidentialSections: processedSections.filter(s => s.confidentiality === 'confidential').length,
        restrictedSections: processedSections.filter(s => s.confidentiality === 'restricted').length
      },
      vectorDatabase: {
        url: "https://busy-mosquito-10553-us1-vector.upstash.io",
        status: "connected",
        autoEmbeddings: true
      }
    })

  } catch (error) {
    console.error('Vector storage error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to store contract in vector database'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Test vector database connection and query
    const testQuery = await index.query({
      data: "James Williams contract salary wages",
      topK: 3,
      includeMetadata: true,
      includeVectors: false
    })

    return NextResponse.json({
      success: true,
      message: 'Vector database connection test',
      vectorDatabase: {
        url: "https://busy-mosquito-10553-us1-vector.upstash.io", 
        status: "connected"
      },
      testQuery: {
        query: "James Williams contract salary wages",
        results: testQuery.length,
        matches: testQuery.map(match => ({
          id: match.id,
          score: match.score,
          player: match.metadata?.player_name,
          section: match.metadata?.section,
          confidentiality: match.metadata?.confidentiality
        }))
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Vector database connection failed'
    }, { status: 500 })
  }
}

// Helper functions (same as before)
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