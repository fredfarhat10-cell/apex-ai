export interface TravelOption {
  mode: "driving" | "transit" | "walking" | "bicycling" | "rideshare"
  duration: number // in minutes
  distance: string
  cost?: number
  provider?: string // e.g., "Uber", "Lyft"
  arrivalTime: Date
  trafficDelay?: number // additional minutes due to traffic
}

export interface LatenessAlert {
  eventId: string
  eventName: string
  eventLocation: string
  eventTime: Date
  currentLocation: string
  riskLevel: "low" | "medium" | "high" | "critical"
  minutesUntilEvent: number
  fastestTravelTime: number
  recommendedOption: TravelOption
  allOptions: TravelOption[]
  message: string
  actionRequired: boolean
}

export interface RideBooking {
  id: string
  provider: "uber" | "lyft"
  rideType: string
  origin: string
  destination: string
  estimatedPrice: string
  driverArrival: number // minutes
  vehicleInfo?: string
  driverInfo?: string
  status: "pending" | "confirmed" | "arriving" | "in_progress" | "completed" | "cancelled"
  bookedAt: Date
}
