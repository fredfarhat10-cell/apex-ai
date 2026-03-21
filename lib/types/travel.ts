export interface TravelRequest {
  id: string
  userId: string
  destination: string
  startDate: string
  endDate: string
  travelers: number
  budget?: number
  interests?: string[]
  preferences?: {
    flightClass?: "economy" | "premium_economy" | "business" | "first"
    hotelRating?: number
    amenities?: string[]
  }
  status: "pending" | "researching" | "ready" | "booked" | "cancelled"
  createdAt: Date
}

export interface TravelItinerary {
  id: string
  requestId: string
  flights: FlightOption[]
  accommodation: HotelOption
  activities: ActivityOption[]
  dailyPlan: DailyPlan[]
  totalCost: number
  budgetStatus: "within_budget" | "over_budget" | "needs_review"
  alternatives?: {
    flights?: FlightOption[]
    accommodation?: HotelOption[]
  }
  createdAt: Date
}

export interface FlightOption {
  id: string
  airline: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  duration: number
  stops: number
  price: number
  cabinClass: string
  bookingLink?: string
}

export interface HotelOption {
  id: string
  name: string
  address: string
  rating: number
  reviewCount: number
  pricePerNight: number
  totalPrice: number
  amenities: string[]
  images?: string[]
  bookingLink?: string
}

export interface ActivityOption {
  id: string
  title: string
  description: string
  duration: number
  price: number
  rating: number
  reviewCount: number
  category: string
  bookingLink?: string
}

export interface DailyPlan {
  day: number
  date: string
  activities: {
    time: string
    activity: string
    description: string
    cost?: number
  }[]
  meals?: {
    breakfast?: string
    lunch?: string
    dinner?: string
  }
  notes?: string
}
