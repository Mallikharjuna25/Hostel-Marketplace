export type ConditionLabel = 'NEW_SEALED' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR'

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface VisionService {
  analyze(imageUrls: string[]): Promise<{
    detectedProduct: string
    confidence: number
    conditionLabel: ConditionLabel
    conditionScore: number
    detectedIssues: string[]
  }>
}

export interface DescriptionService {
  generate(input: {
    title: string
    category: string
    conditionLabel: string
    detectedIssues: string[]
    brand?: string
    model?: string
  }): Promise<string>
}

export interface PricePredictionService {
  predict(input: {
    category: string
    brand?: string
    condition: string
    originalPrice?: number
    ageMonths?: number
  }): Promise<{ low: number; high: number; predicted: number }>
}

export interface MatchingService {
  scoreDonationApplicant(input: {
    listingCategory: string
    listingTitle: string
    applicantSubjects: string[]
    applicantCgpa?: number
    applicantReason: string
    trustScore: number
  }): Promise<{
    academicRelevance: number
    needMatch: number
    trustFactor: number
    overall: number
    explanation: string
  }>
}

export interface ProofAnalysisService {
  analyze(input: {
    taskDescription: string
    completionCriteria: string
    note?: string
    // fileUrls are mocked — real provider would fetch/OCR them
    fileCount: number
  }): Promise<{ coverage: number; summary: string }>
}

// ─── Mock Implementations ──────────────────────────────────────────────────────
// Deterministic pseudo-random from input string so demos are stable.

function pseudoRandom(seed: string, min: number, max: number): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return min + Math.abs(hash % (max - min + 1))
}

export const mockVisionService: VisionService = {
  async analyze(imageUrls) {
    const seed = imageUrls[0] || 'default'
    const conditionScore = pseudoRandom(seed, 55, 95)
    const conditionMap: ConditionLabel[] = ['EXCELLENT', 'GOOD', 'FAIR', 'GOOD', 'GOOD']
    const conditionLabel = conditionMap[pseudoRandom(seed, 0, 4)]
    const allIssues = [
      'Minor surface scratches',
      'Small dent on corner',
      'Screen has a hairline crack',
      'Keys slightly worn',
      'Battery cover loose',
      'Sticker residue on back',
    ]
    const issueCount = pseudoRandom(seed + 'issues', 0, 2)
    const detectedIssues = allIssues.slice(0, issueCount)

    return {
      detectedProduct: 'Electronic Device / Study Equipment',
      confidence: pseudoRandom(seed + 'conf', 72, 97) / 100,
      conditionLabel,
      conditionScore,
      detectedIssues,
    }
  },
}

export const mockDescriptionService: DescriptionService = {
  async generate(input) {
    const condition = input.conditionLabel.toLowerCase().replace('_', ' ')
    const issues =
      input.detectedIssues.length > 0
        ? ` Note: ${input.detectedIssues.join(', ')}.`
        : ' No visible damage.'
    return `This ${input.brand ? input.brand + ' ' : ''}${input.title} is in ${condition} condition and has been well-maintained.${issues} Ideal for ${input.category.toLowerCase()} use. All original functionality is intact. Perfect for students looking for an affordable, reliable option.`
  },
}

export const mockPricePredictionService: PricePredictionService = {
  async predict(input) {
    const seed = `${input.category}-${input.condition}-${input.originalPrice || 0}`
    const depreciation: Record<string, number> = {
      EXCELLENT: 0.75,
      GOOD: 0.55,
      FAIR: 0.35,
      POOR: 0.2,
      NEEDS_REVIEW: 0.15,
    }
    const rate = depreciation[input.condition] || 0.5
    const base = input.originalPrice ? Math.round(input.originalPrice * rate) : pseudoRandom(seed, 200, 2000)
    const variance = Math.round(base * 0.15)
    return {
      low: Math.max(50, base - variance),
      high: base + variance,
      predicted: base,
    }
  },
}

export const mockMatchingService: MatchingService = {
  async scoreDonationApplicant(input) {
    const seed = `${input.listingCategory}-${input.applicantReason}`
    const academicRelevance = pseudoRandom(seed + 'acad', 50, 95)
    const needMatch = pseudoRandom(seed + 'need', 40, 90)
    const trustFactor = Math.min(100, input.trustScore + pseudoRandom(seed + 'trust', -10, 10))
    const overall = Math.round((academicRelevance * 0.4 + needMatch * 0.35 + trustFactor * 0.25))
    return {
      academicRelevance,
      needMatch,
      trustFactor,
      overall,
      explanation: `Strong match because ${input.listingTitle} is directly relevant to the student's coursework in ${input.applicantSubjects[0] || 'their field'}. The applicant's reason demonstrates genuine need.`,
    }
  },
}

export const mockProofAnalysisService: ProofAnalysisService = {
  async analyze(input) {
    const seed = `${input.taskDescription}-${input.fileCount}`
    const coverage = pseudoRandom(seed, 60, 94)
    return {
      coverage,
      summary: `The submitted materials appear to cover the requested topic with ${coverage}% coverage based on content analysis. ${input.fileCount} file(s) reviewed. The work addresses the main requirements outlined in the agreement.`,
    }
  },
}

// ─── Factory ───────────────────────────────────────────────────────────────────

export function getVisionService(): VisionService {
  const provider = process.env.AI_PROVIDER || 'mock'
  if (provider === 'mock') return mockVisionService
  // TODO: return realVisionService when AI_PROVIDER=openai|anthropic
  console.warn(`AI provider "${provider}" not implemented — falling back to mock`)
  return mockVisionService
}

export function getDescriptionService(): DescriptionService {
  return mockDescriptionService
}

export function getPricePredictionService(): PricePredictionService {
  return mockPricePredictionService
}

export function getMatchingService(): MatchingService {
  return mockMatchingService
}

export function getProofAnalysisService(): ProofAnalysisService {
  return mockProofAnalysisService
}
