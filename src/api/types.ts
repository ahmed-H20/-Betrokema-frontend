export type Pagination = {
  currentPage: number
  limit: number
  numberOfPages: number
  nextPage?: number
  prevPage?: number
}

export type ApiEnvelope<T> = {
  status: 'success'
  data: T
  message?: string
}

export type ApiListEnvelope<T> = ApiEnvelope<T[]> & {
  results?: number
  totalCount?: number
  pagination?: Pagination
}
