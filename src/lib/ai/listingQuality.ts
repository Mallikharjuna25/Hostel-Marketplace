/**
 * Listing Quality Score formula (pure function — no side effects, fully unit-testable)
 *
 * score = 0.25*imageQuality + 0.15*imageCount + 0.20*descriptionCompleteness
 *       + 0.10*billPresence + 0.15*productIdConfidence + 0.15*conditionClarity
 *
 * Gate: score >= 50 → allowed to publish
 *       score <  50 → blocked with specific reasons
 */

export interface QualityInputs {
  imageCount: number         // how many images uploaded
  imageQualityScore: number  // from AI vision (0-100) — use 50 as default if no AI yet
  descriptionLength: number  // character count
  hasBill: boolean
  productIdConfidence: number // AI confidence (0-100) — use 50 if no AI
  conditionLabel: string | null
  hasTitle: boolean
  hasCategory: boolean
  hasCondition: boolean
  hasPrice: boolean
  hasLocation: boolean
}

export interface QualityResult {
  score: number
  passed: boolean            // score >= 50
  breakdown: {
    imageQuality: number
    imageCount: number
    descriptionCompleteness: number
    billPresence: number
    productIdConfidence: number
    conditionClarity: number
  }
  reasons: string[]          // human-readable reasons for failure (when !passed)
  suggestions: string[]      // actionable improvements
}

export function computeListingQualityScore(inputs: QualityInputs): QualityResult {
  // 1. Image quality score (0–100 from AI, or 50 if manual)
  const imageQualityScore = Math.min(100, Math.max(0, inputs.imageQualityScore))

  // 2. Image count score — 1 image = 30, 2 = 60, 3 = 80, 4+ = 100
  const imageCountScore = Math.min(100, Math.max(0, inputs.imageCount * 25))

  // 3. Description completeness — length-based: 0–50 chars = 20, 50–150 = 60, 150–300 = 80, 300+ = 100
  let descriptionScore = 0
  if (inputs.descriptionLength >= 300) descriptionScore = 100
  else if (inputs.descriptionLength >= 150) descriptionScore = 80
  else if (inputs.descriptionLength >= 50) descriptionScore = 60
  else if (inputs.descriptionLength > 0) descriptionScore = 20

  // 4. Bill presence (boolean → 0 or 100)
  const billScore = inputs.hasBill ? 100 : 0

  // 5. Product identification confidence (0–100 from AI)
  const productIdScore = Math.min(100, Math.max(0, inputs.productIdConfidence))

  // 6. Condition clarity — condition label set AND required fields present
  const requiredFieldsSet = inputs.hasTitle && inputs.hasCategory && inputs.hasCondition && inputs.hasLocation
  const conditionClarityScore = inputs.conditionLabel && requiredFieldsSet ? 100 : (requiredFieldsSet ? 50 : 0)

  // Weighted total
  const score = Math.round(
    imageQualityScore * 0.25 +
    imageCountScore * 0.15 +
    descriptionScore * 0.20 +
    billScore * 0.10 +
    productIdScore * 0.15 +
    conditionClarityScore * 0.15
  )

  const passed = score >= 50

  const reasons: string[] = []
  const suggestions: string[] = []

  if (!passed) {
    if (inputs.imageCount < 2) {
      reasons.push('Not enough photos')
      suggestions.push('Upload at least 2 photos (front, back, and any damage shots)')
    }
    if (imageQualityScore < 50) {
      reasons.push('Image quality is too low')
      suggestions.push('Retake photos in better lighting, avoiding blur')
    }
    if (inputs.descriptionLength < 50) {
      reasons.push('Description is too short')
      suggestions.push('Add more detail — condition, usage history, accessories included')
    }
    if (!inputs.hasCondition) {
      reasons.push('Condition not set')
      suggestions.push('Select the item condition (Excellent / Good / Fair / Poor)')
    }
    if (!inputs.hasLocation) {
      reasons.push('Location not set')
      suggestions.push('Add your hostel and block so buyers can find you')
    }
    if (!inputs.hasBill) {
      suggestions.push('Adding a bill/invoice can increase trust and listing score')
    }
  }

  return {
    score,
    passed,
    breakdown: {
      imageQuality: Math.round(imageQualityScore * 0.25),
      imageCount: Math.round(imageCountScore * 0.15),
      descriptionCompleteness: Math.round(descriptionScore * 0.20),
      billPresence: Math.round(billScore * 0.10),
      productIdConfidence: Math.round(productIdScore * 0.15),
      conditionClarity: Math.round(conditionClarityScore * 0.15),
    },
    reasons,
    suggestions,
  }
}
