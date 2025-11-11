// src/utils/apiResponse.js
export function ok(res, data, message = 'OK') {
  return res.json({
    success: true,
    message,
    data
  })
}

export function created(res, data, message = 'Created') {
  return res.status(201).json({
    success: true,
    message,
    data
  })
}

export function notFound(res, message = 'Not found') {
  return res.status(404).json({
    success: false,
    message
  })
}

export function badRequest(res, message = 'Bad request') {
  return res.status(400).json({
    success: false,
    message
  })
}

export function serverError(res, error) {
  console.error('[SERVER ERROR]', error)
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
}
