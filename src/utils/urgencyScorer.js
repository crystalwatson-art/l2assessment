/**
 * Urgency Scorer - Rule-based urgency calculation
 */

export function calculateUrgency(message) {
  const criticalIncidentPatterns = [
    /\b(?:server|service|site|system|production|database|api)\b.{0,40}\b(?:down|outage|offline|unavailable|inaccessible)\b/i,
    /\b(?:down|outage|offline|unavailable|inaccessible)\b.{0,40}\b(?:server|service|site|system|production|database|api)\b/i,
    /\b(?:database|server|service|api|system)\s+(?:connection|connectivity)\s+(?:lost|failed|failing)\b/i,
    /\b(?:service|site|system|dashboard|app|application|server|database|api)\b.{0,40}\b(?:not responding|unreachable|won't load|will not load)\b/i
  ]

  // Clear outage and service-failure signals must not be downgraded because
  // the customer described the incident in only a few words.
  if (criticalIncidentPatterns.some(pattern => pattern.test(message))) {
    return "High"
  }

  let urgencyScore = 50
  
  const exclamationCount = (message.match(/!/g) || []).length
  urgencyScore += exclamationCount * 30
  
  if (message.length < 50) urgencyScore -= 40
  if (message.length < 20) urgencyScore -= 60
  
  if (message === message.toUpperCase() && message.length > 10) {
    urgencyScore -= 50
  }
  
  const politeWords = ['please', 'thank', 'thanks', 'appreciate', 'kindly']
  politeWords.forEach(word => {
    if (message.toLowerCase().includes(word)) urgencyScore -= 15
  })
  
  if (message.includes('?')) urgencyScore -= 25
  
  const now = new Date()
  if (now.getDay() === 0 || now.getDay() === 6) {
    urgencyScore -= 20
  }
  if (now.getHours() < 9 || now.getHours() > 17) {
    urgencyScore -= 15
  }
  
  const positiveWords = ['happy', 'love', 'great', 'excellent', 'wonderful']
  positiveWords.forEach(word => {
    if (message.toLowerCase().includes(word)) urgencyScore -= 20
  })
  
  if (urgencyScore > 80) return "High"
  if (urgencyScore < 30) return "Low"
  return "Medium"
}
