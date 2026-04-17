package directions

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/exitwise/backend/internal/services"
	"github.com/exitwise/backend/internal/station"
)

// DirectionsResponse sent back to the frontend
type DirectionsResponse struct {
	Distance       float64         `json:"distance_meters"`
	Duration       float64         `json:"duration_seconds"`
	OptimalExit    *station.StationExit `json:"optimal_exit,omitempty"`
	ExitInstruction string         `json:"exit_instruction,omitempty"`
}

// GetDirectionsHandler proxies a walking route request to Mapbox
// GET /directions?from_lat=13.73&from_lng=100.52&to_lat=13.74&to_lng=100.53
func GetDirectionsHandler(w http.ResponseWriter, r *http.Request) {
	fromLat, err1 := strconv.ParseFloat(r.URL.Query().Get("from_lat"), 64)
	fromLng, err2 := strconv.ParseFloat(r.URL.Query().Get("from_lng"), 64)
	toLat, err3 := strconv.ParseFloat(r.URL.Query().Get("to_lat"), 64)
	toLng, err4 := strconv.ParseFloat(r.URL.Query().Get("to_lng"), 64)

	if err1 != nil || err2 != nil || err3 != nil || err4 != nil {
		http.Error(w, "from_lat, from_lng, to_lat, to_lng are all required as numbers", http.StatusBadRequest)
		return
	}

	route, err := services.GetWalkingRoute(fromLat, fromLng, toLat, toLng)
	if err != nil {
		http.Error(w, "Failed to get directions: "+err.Error(), http.StatusInternalServerError)
		return
	}

	resp := DirectionsResponse{
		Distance: route.Distance,
		Duration: route.Duration,
	}

	// Try to find the optimal exit for the destination
	exit, err := station.FindOptimalExit(r.Context(), toLat, toLng)
	if err == nil && exit != nil {
		resp.OptimalExit = exit
		resp.ExitInstruction = "Take Exit " + exit.ExitNumber
		if exit.Description != "" {
			resp.ExitInstruction += " — " + exit.Description
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
