import { useMemo, useState } from 'react'

const API_URL = 'https://http://localhost:5000'

type AssessmentCategory = 'Excellent' | 'Good' | 'Fair' | 'Poor'

type AssessmentResult = {
  score: number
  category: AssessmentCategory
  details: string[]
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

const calculateAssessment = (essay: string): AssessmentResult => {
  const normalized = essay.trim().replace(/\s+/g, ' ')
  const words = normalized.length ? normalized.split(' ') : []
  const wordCount = words.length
  const sentences = normalized.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const sentenceCount = sentences.length || 1

  const uniqueWords = new Set(words.map((word) => word.toLowerCase()))
  const uniqueRatio = wordCount ? uniqueWords.size / wordCount : 0

  let score = 50

  // length
  if (wordCount < 150) score -= 15
  else if (wordCount > 300) score += 10

  // organization and sentence complexity
  const avgSentenceLength = wordCount / sentenceCount
  if (avgSentenceLength < 10 || avgSentenceLength > 25) score -= 8
  else score += 7

  // vocabulary variety
  if (uniqueRatio >= 0.65) score += 10
  else if (uniqueRatio >= 0.45) score += 5
  else score -= 5

  // simple grammar/clarity heuristics
  const repeatedWordMatches = essay.match(/\b(\w+)\s+\1\b/gi) || []
  if (repeatedWordMatches.length > 2) score -= 7
  else if (repeatedWordMatches.length > 0) score -= 3

  const passiveVoiceMatches = essay.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi) || []
  if (passiveVoiceMatches.length > 3) score -= 5

  score = clamp(score, 0, 100)

  const details: string[] = []
  details.push(`Word count: ${wordCount}`)
  details.push(`Sentence count: ${sentenceCount}`)
  details.push(`Average sentence length: ${avgSentenceLength.toFixed(1)} words`)
  details.push(`Lexical diversity: ${(uniqueRatio * 100).toFixed(1)}%`)

  if (wordCount < 150) details.push('Try expanding your essay to include more supporting examples.')
  if (wordCount > 300) details.push('Great depth! Ensure your essay stays focused and concise.')
  if (repeatedWordMatches.length) details.push(`Repeated words detected (${repeatedWordMatches.length})`) 
  if (passiveVoiceMatches.length) details.push(`Passive constructions detected (${passiveVoiceMatches.length})`)

  const category: AssessmentCategory = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Poor'

  return {
    score,
    category,
    details,
  }
}

export default function EssayAssessment() {
  const [essay, setEssay] = useState('')

  const assessment = useMemo(() => calculateAssessment(essay), [essay])

  return (
    <section style={{ maxWidth: 800, margin: '1.4rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: 10 }}>
      <h2>Essay Assessment</h2>
      <p>Paste your essay below and get an instant score with feedback.</p>

      <textarea
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
        rows={10}
        placeholder="Write or paste your essay here..."
        style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: 6, border: '1px solid #bbb', marginBottom: '1rem', resize: 'vertical' }}
      />

      <div style={{ background: '#f7f7f7', padding: '0.9rem', borderRadius: 6, marginBottom: '1rem' }}>
        <strong>Score:</strong> {assessment.score} / 100
        <br />
        <strong>Category:</strong> {assessment.category}
      </div>

      <div>
        <h3>Feedback</h3>
        <ul>
          {assessment.details.map((item, idx) => (
            <li key={`${item}-${idx}`}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
