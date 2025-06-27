import { Index } from '@upstash/vector'
import fs from 'fs'
import path from 'path'

interface ContractChunk {
  id: string
  content: string
  metadata: {
    source: string
    player_name: string
    section: string
    confidentiality: 'confidential' | 'restricted' | 'secret'
    contract_type: 'player' | 'staff' | 'commercial'
    chunk_index: number
    timestamp: string
    access_roles: string[]
  }
}

export class MarkdownContractProcessor {
  private vectorDb: Index | null
  
  constructor() {
    try {
      this.vectorDb = new Index({
        url: process.env.UPSTASH_VECTOR_REST_URL!,
        token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
      })
      console.log('✅ Upstash Vector initialized for contract processing')
    } catch (error) {
      console.error('❌ Upstash Vector initialization failed:', error)
      this.vectorDb = null
    }
  }

  /**
   * Process James Williams contract from markdown
   */
  async processPlayerContract(filename: string = 'Player: James Williams.md'): Promise<string[]> {
    const filePath = path.join(process.cwd(), 'docs', filename)
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Contract file not found: ${filename}`)
    }

    console.log(`📄 Processing player contract: ${filename}`)
    
    // Read markdown content
    const markdownContent = fs.readFileSync(filePath, 'utf-8')
    
    // Extract player name from filename or content
    const playerName = this.extractPlayerName(filename, markdownContent)
    
    // Split into logical sections
    const sections = this.parseContractSections(markdownContent)
    
    // Create vector chunks
    const chunkIds: string[] = []
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      const chunkId = await this.storeContractChunk(section, playerName, filename, i)
      if (chunkId) chunkIds.push(chunkId)
    }
    
    console.log(`✅ Successfully processed ${chunkIds.length} contract sections for ${playerName}`)
    return chunkIds
  }

  /**
   * Extract player name from filename or content
   */
  private extractPlayerName(filename: string, content: string): string {
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

  /**
   * Parse contract into logical sections
   */
  private parseContractSections(content: string): Array<{section: string, content: string}> {
    const sections = []
    
    // Split by major sections (lines that don't start with whitespace/dash)
    const lines = content.split('\n')
    let currentSection = ''
    let currentContent: string[] = []
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // If line looks like a section header (no leading whitespace, ends with colon, or is a standalone term)
      if (trimmedLine && !line.startsWith(' ') && !line.startsWith('-') && 
          (trimmedLine.endsWith(':') || this.isSectionHeader(trimmedLine))) {
        
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

  /**
   * Check if a line is likely a section header
   */
  private isSectionHeader(line: string): boolean {
    const sectionKeywords = [
      'Player', 'Contract Start Date', 'Contract End Date', 'Basic Wage', 
      'Wage Changes', 'Appearance Fees', 'Signing On Fees', 'Loyalty Bonus',
      'Bonuses', 'Release Clause', 'Image Rights', 'Definitions'
    ]
    
    return sectionKeywords.some(keyword => 
      line.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  /**
   * Store individual contract section as vector
   */
  private async storeContractChunk(
    section: {section: string, content: string}, 
    playerName: string, 
    filename: string, 
    chunkIndex: number
  ): Promise<string | null> {
    if (!this.vectorDb) {
      console.warn('Vector DB not available - skipping storage')
      return null
    }

    try {
      // Generate embedding (placeholder - replace with actual embedding service)
      const embedding = await this.generateEmbedding(section.content)
      
      // Determine sensitivity level
      const confidentiality = this.classifySectionSensitivity(section.section, section.content)
      
      const chunkId = `${playerName.toLowerCase().replace(/\s+/g, '-')}-${section.section.toLowerCase().replace(/\s+/g, '-')}-${chunkIndex}`
      
      // Store in vector database
      await this.vectorDb.upsert([{
        id: chunkId,
        values: embedding,
        metadata: {
          source: filename,
          player_name: playerName,
          section: section.section,
          content: section.content,
          confidentiality,
          contract_type: 'player',
          chunk_index: chunkIndex,
          timestamp: new Date().toISOString(),
          access_roles: this.getRequiredAccessRoles(confidentiality),
          type: 'contract' // For filtering in hybrid queries
        }
      }])
      
      console.log(`✅ Stored section: ${section.section} (${confidentiality})`)
      return chunkId
      
    } catch (error) {
      console.error(`Error storing section ${section.section}:`, error)
      return null
    }
  }

  /**
   * Classify section sensitivity based on content
   */
  private classifySectionSensitivity(sectionName: string, content: string): 'confidential' | 'restricted' | 'secret' {
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

  /**
   * Get required access roles based on sensitivity
   */
  private getRequiredAccessRoles(confidentiality: string): string[] {
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

  /**
   * Generate embedding (placeholder - integrate with your embedding service)
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // TODO: Replace with actual OpenAI or similar embedding service
    // For now, return dummy embedding
    return new Array(1536).fill(0).map(() => Math.random())
  }

  /**
   * Search contracts by player or criteria
   */
  async searchContracts(query: string, userRole: string = 'general', maxResults: number = 5): Promise<any[]> {
    if (!this.vectorDb) return []
    
    try {
      const embedding = await this.generateEmbedding(query)
      
      // Determine what confidentiality levels this user can access
      const allowedRoles = this.getAllowedConfidentialityLevels(userRole)
      
      const results = await this.vectorDb.query({
        vector: embedding,
        topK: maxResults,
        includeMetadata: true,
        filter: {
          type: 'contract',
          confidentiality: { $in: allowedRoles }
        }
      })
      
      return results.matches?.map(match => ({
        id: match.id,
        content: match.metadata?.content,
        player: match.metadata?.player_name,
        section: match.metadata?.section,
        confidentiality: match.metadata?.confidentiality,
        confidence: match.score
      })) || []
      
    } catch (error) {
      console.error('Contract search error:', error)
      return []
    }
  }

  /**
   * Get allowed confidentiality levels for user role
   */
  private getAllowedConfidentialityLevels(userRole: string): string[] {
    switch (userRole.toLowerCase()) {
      case 'board':
      case 'boardroom':
        return ['restricted', 'confidential', 'secret'] // Full access
      case 'legal':
        return ['restricted', 'confidential', 'secret'] // Full access
      case 'finance':
        return ['restricted', 'confidential'] // No secret access
      case 'management':
        return ['restricted'] // Basic access only
      default:
        return [] // No access to contracts
    }
  }

  /**
   * Process all markdown contracts in docs folder
   */
  async processAllMarkdownContracts(): Promise<{ processed: string[], errors: string[] }> {
    const docsPath = path.join(process.cwd(), 'docs')
    const files = fs.readdirSync(docsPath)
    const markdownFiles = files.filter(file => file.endsWith('.md') && file.toLowerCase().includes('player'))
    
    const processed: string[] = []
    const errors: string[] = []
    
    for (const file of markdownFiles) {
      try {
        console.log(`📄 Processing contract: ${file}`)
        const chunkIds = await this.processPlayerContract(file)
        processed.push(`${file}: ${chunkIds.length} chunks`)
      } catch (error) {
        console.error(`Error processing ${file}:`, error)
        errors.push(`${file}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    return { processed, errors }
  }
}

// Export singleton
export const contractProcessor = new MarkdownContractProcessor() 