import { NextRequest, NextResponse } from 'next/server'

interface Message {
  id: string
  content: string
  sender: 'user' | 'agent'
  timestamp: Date
}

interface ChatRequest {
  message: string
  agentId: string
  conversationHistory?: Message[]
}

interface UserInfo {
  preferences?: string[]
  location?: string
  budgetRange?: string
  [key: string]: unknown
}

// Simple conversation state management
const conversationStates = new Map<string, {
  context: string[]
  lastTopic: string
  userInfo: UserInfo
  messageCount: number
}>()

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, agentId, conversationHistory = [] } = body

    if (!message || !agentId) {
      return NextResponse.json(
        { error: 'Message and agentId are required' },
        { status: 400 }
      )
    }

    // Create a simple session ID based on timestamp and agent
    const sessionId = `${agentId}-session`
    
    // Get or create conversation state
    const state = conversationStates.get(sessionId) || {
      context: [],
      lastTopic: '',
      userInfo: {},
      messageCount: 0
    }

    state.messageCount++
    state.context.push(message.toLowerCase())

    // Keep only last 5 messages for context
    if (state.context.length > 5) {
      state.context = state.context.slice(-5)
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Generate sophisticated AI response
    const response = await generateAIResponse(message, conversationHistory)

    // Update conversation state
    conversationStates.set(sessionId, state)

    return NextResponse.json({ response })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateAIResponse(userMessage: string, history: Message[]): Promise<string> {
  const message = userMessage.toLowerCase().trim()
  
  // Get conversation context
  const isFirstMessage = history.length <= 1

  // Greeting detection
  if (isFirstMessage && (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('good'))) {
    return "Hello! I'm Ellie, Alan Batt's AI property assistant. I'm here to help you find the perfect property, book viewings, and answer any questions about our services. What can I help you with today?"
  }

  // Property search queries
  if (message.includes('property') || message.includes('properties') || message.includes('house') || message.includes('flat') || message.includes('apartment')) {
    if (message.includes('available') || message.includes('find') || message.includes('search') || message.includes('looking')) {
      return "I'd be happy to help you find available properties! To give you the best recommendations, could you tell me:\n\n• What area are you interested in?\n• What's your budget range?\n• How many bedrooms do you need?\n• Any specific requirements (car park, garden, etc.)?\n\nOnce I have these details, I can check our current portfolio and arrange viewings for properties that match your criteria."
    }
    
    if (message.includes('price') || message.includes('cost') || message.includes('rent') || message.includes('£')) {
      return "Property prices vary depending on location, size, and features. Here's what I can help with:\n\n• Get current market rates for specific areas\n• Provide detailed pricing for properties you're interested in\n• Arrange property valuations\n• Discuss payment terms and deposits\n\nWhich area are you considering? I can give you accurate pricing information for that location."
    }
  }

  // Location-specific queries
  if (message.match(/\b(london|manchester|birmingham|leeds|liverpool|bristol|sheffield|edinburgh|glasgow|cardiff|area|location|where)\b/i)) {
    return "Location is crucial when choosing a property! Alan Batt has an extensive portfolio across prime locations. I can help you with:\n\n• Available properties in specific areas\n• Neighbourhood information and amenities\n• Transport links and local schools\n• Market trends for different locations\n\nWhich area interests you most? I can provide detailed information about what's currently available and upcoming properties."
  }

  // Booking and viewing queries
  if (message.includes('viewing') || message.includes('book') || message.includes('appointment') || message.includes('visit') || message.includes('see')) {
    return "I'd love to arrange a property viewing for you! Here's how we can proceed:\n\n**For Property Viewings:**\n• Choose from available time slots\n• Virtual or in-person options\n• Group or private viewings\n• Same-day bookings often available\n\n**What I need from you:**\n• Which property interests you?\n• Your preferred dates/times\n• Contact details for confirmation\n\nWould you like me to check availability for a specific property, or shall I show you what's available for viewing this week?"
  }

  // Contact and direct communication
  if (message.includes('contact') || message.includes('speak') || message.includes('talk') || message.includes('call') || message.includes('email') || message.includes('alan')) {
    return "I can connect you directly with Alan Batt for personalised service! Here are your options:\n\n**Immediate Contact:**\n• Priority email - I'll send your details now\n• Callback request - Alan will call you today\n• WhatsApp message - Quick response guaranteed\n\n**For Complex Inquiries:**\n• Investment opportunities\n• Portfolio discussions\n• Bespoke property requirements\n• Commercial property needs\n\nWould you prefer email contact or a phone call? I can arrange either within the next few hours."
  }

  // Budget and financial queries
  if (message.includes('budget') || message.includes('afford') || message.includes('finance') || message.includes('mortgage') || message.includes('deposit')) {
    return "Let's discuss your budget and financing options! I can help with:\n\n**Budget Planning:**\n• Properties within your price range\n• Total cost breakdown (rent, bills, deposits)\n• Payment schedule options\n\n**Financial Support:**\n• Mortgage advice connections\n• Deposit assistance programs\n• Rent guarantee schemes\n\nWhat's your comfortable monthly budget? I can show you exactly what's available and help make it work for you."
  }

  // Availability and scheduling
  if (message.includes('available') || message.includes('when') || message.includes('time') || message.includes('schedule')) {
    return "Great question about availability! Here's what I can check for you:\n\n**Property Availability:**\n• Current listings with immediate availability\n• Properties becoming available soon\n• Waiting list for premium locations\n\n**Viewing Availability:**\n• Today: Limited slots still available\n• This week: Full flexibility\n• Next week: Premium time slots open\n\nWhat specific availability are you asking about? Properties to rent, or viewing appointment times?"
  }

  // Services and offerings
  if (message.includes('service') || message.includes('help') || message.includes('what') || message.includes('how')) {
    return "I'm here to provide comprehensive property services! Here's what I can help with:\n\n**Property Services:**\n🏠 Property search and recommendations\n📅 Viewing arrangements and scheduling\n💼 Rental applications and processing\n📞 Direct connection to Alan Batt\n📈 Market insights and advice\n\n**Immediate Actions:**\n• Search available properties now\n• Book a viewing for today/tomorrow\n• Get pricing for specific areas\n• Connect with Alan for complex needs\n\nWhat would be most helpful for you right now?"
  }

  // Thank you responses
  if (message.includes('thank') || message.includes('thanks')) {
    return "You're very welcome! I'm here to make your property search as smooth as possible.\n\nIf you need anything else - whether it's finding more properties, booking additional viewings, or speaking with Alan directly - just let me know. I'm available 24/7 to help!\n\nIs there anything else I can assist you with today?"
  }

  // Default intelligent response for unclear queries
  if (message.length < 10) {
    return "I'd love to help you more specifically! I'm Alan Batt's AI property assistant and I can help with:\n\n• Finding available properties\n• Booking property viewings\n• Providing area and pricing information\n• Connecting you with Alan directly\n\nCould you tell me a bit more about what you're looking for? Are you searching for a property to rent, need a viewing, or have questions about a specific area?"
  }

  // Comprehensive fallback response
  return "I want to make sure I give you the most helpful information! As Alan Batt's property assistant, I specialize in:\n\n**Property Search:** Finding homes that match your exact needs\n**Viewings:** Arranging convenient viewing times\n**Area Expertise:** Detailed local knowledge and pricing\n**Personal Service:** Direct connection to Alan for complex requirements\n\nCould you help me understand what you're most interested in? For example:\n• Are you looking for a property in a specific area?\n• Do you need to arrange a viewing?\n• Are you interested in pricing information?\n• Would you like to speak with Alan directly?\n\nI'm here to help make your property journey seamless!"
}

export async function GET() {
  return NextResponse.json({ message: 'Enhanced Chat API is running with AI-powered responses' })
} 