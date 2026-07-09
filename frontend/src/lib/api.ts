const API_BASE_URL = import.meta.env.VITE_API_URL || "https://violence-detection-api-mhzo.onrender.com"

export interface DetectionResult {
  is_violence: boolean
  confidence: number
  prediction: number
}

export async function detectViolence(file: File, token: string): Promise<DetectionResult> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/detect`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Failed to detect violence")
  }

  return response.json()
}

export async function checkHealth(): Promise<{ status: string; model_loaded: boolean }> {
  const response = await fetch(`${API_BASE_URL}/health`)
  return response.json()
}