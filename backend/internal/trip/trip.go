package trip

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/exitwise/backend/internal/db"
)

type SavedTrip struct {
	ID               int             `json:"id"`
	UserID           int             `json:"user_id"`
	RecommendedExit  string          `json:"recommended_exit"`
	EstimatedCost    int             `json:"estimated_total_cost"`
	TravelMode       string          `json:"travel_mode"`
	ItineraryData    json.RawMessage `json:"itinerary_data"`
	CreatedAt        string          `json:"created_at"`
}

// GetTripsHandler returns all saved trips for a user
// GET /trips?user_id=1
func GetTripsHandler(w http.ResponseWriter, r *http.Request) {
	userIDStr := r.URL.Query().Get("user_id")

	// Also try auth context
	if userIDStr == "" {
		if ctxUserID, ok := r.Context().Value("user_id").(int); ok {
			userIDStr = strconv.Itoa(ctxUserID)
		}
	}

	if userIDStr == "" {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	if db.Pool == nil {
		http.Error(w, "Database not available", http.StatusServiceUnavailable)
		return
	}

	rows, err := db.Pool.Query(context.Background(),
		`SELECT id, user_id, COALESCE(recommended_exit, ''), 
		        COALESCE(estimated_total_cost, 0), COALESCE(travel_mode, ''),
		        itinerary_data, created_at::text
		 FROM trips WHERE user_id = $1 ORDER BY created_at DESC`, userIDStr)
	if err != nil {
		http.Error(w, "Failed to query trips: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var trips []SavedTrip
	for rows.Next() {
		var t SavedTrip
		if err := rows.Scan(&t.ID, &t.UserID, &t.RecommendedExit,
			&t.EstimatedCost, &t.TravelMode, &t.ItineraryData, &t.CreatedAt); err == nil {
			trips = append(trips, t)
		}
	}

	if trips == nil {
		trips = []SavedTrip{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"trips": trips})
}

// DeleteTripHandler deletes a specific trip
// DELETE /trips?id=5
func DeleteTripHandler(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "id query parameter required", http.StatusBadRequest)
		return
	}

	if db.Pool == nil {
		http.Error(w, "Database not available", http.StatusServiceUnavailable)
		return
	}

	_, err := db.Pool.Exec(context.Background(), `DELETE FROM trips WHERE id = $1`, idStr)
	if err != nil {
		http.Error(w, "Failed to delete trip: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}
