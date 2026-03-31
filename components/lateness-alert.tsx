"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, MapPin, Car, DollarSign } from "lucide-react"
import type { LatenessAlert, RideBooking } from "@/lib/types/logistics"

interface LatenessAlertProps {
  alert: LatenessAlert
  onBookRide: (option: any) => Promise<RideBooking>
  onDismiss: () => void
}

export function LatenessAlertComponent({ alert, onBookRide, onDismiss }: LatenessAlertProps) {
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState<RideBooking | null>(null)

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      default:
        return "secondary"
    }
  }

  const handleBookRide = async () => {
    setBooking(true)
    try {
      const result = await onBookRide(alert.recommendedOption)
      setBooked(result)
    } catch (error) {
      console.error("Failed to book ride:", error)
    } finally {
      setBooking(false)
    }
  }

  if (booked) {
    return (
      <Card className="border-green-500 bg-green-50 dark:bg-green-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-green-600" />
            Ride Booked Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Provider:</strong> {booked.provider}
            </p>
            <p className="text-sm">
              <strong>Ride Type:</strong> {booked.rideType}
            </p>
            <p className="text-sm">
              <strong>Estimated Price:</strong> {booked.estimatedPrice}
            </p>
            <p className="text-sm">
              <strong>Driver Arrival:</strong> {booked.driverArrival} minutes
            </p>
            {booked.vehicleInfo && (
              <p className="text-sm">
                <strong>Vehicle:</strong> {booked.vehicleInfo}
              </p>
            )}
            {booked.driverInfo && (
              <p className="text-sm">
                <strong>Driver:</strong> {booked.driverInfo}
              </p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Focus on getting your gear ready. I'll handle the logistics.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Lateness Risk Detected
            </CardTitle>
            <CardDescription>
              You're at risk of being late for <strong>{alert.eventName}</strong>
            </CardDescription>
          </div>
          <Badge variant={getRiskColor(alert.riskLevel)}>{alert.riskLevel.toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Event in {alert.minutesUntilEvent} min</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{alert.eventLocation}</span>
          </div>
        </div>

        <div className="rounded-lg border bg-background p-4 space-y-3">
          <h4 className="font-semibold text-sm">Optimal Solution</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {alert.recommendedOption.provider} ({alert.recommendedOption.mode})
              </span>
              <Badge variant="outline">{alert.recommendedOption.duration} min</Badge>
            </div>
            {alert.recommendedOption.cost && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Approx. ${alert.recommendedOption.cost}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Arrives at{" "}
              {alert.recommendedOption.arrivalTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {alert.recommendedOption.trafficDelay && alert.recommendedOption.trafficDelay > 0 && (
                <span className="text-orange-600"> (+{alert.recommendedOption.trafficDelay} min traffic)</span>
              )}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{alert.message}</p>

        <div className="flex gap-2">
          <Button onClick={handleBookRide} disabled={booking} className="flex-1">
            {booking ? "Booking..." : "Yes, Book It"}
          </Button>
          <Button variant="outline" onClick={onDismiss}>
            No, Thanks
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
