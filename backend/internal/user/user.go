package user

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/exitwise/backend/internal/db"
)

type UserProfile struct {
	ID                  int    `json:"id"`
	Username            string `json:"username"`
	Email               string `json:"email"`
	AbsoluteWalkingLimit int   `json:"absolute_walking_limit"`
	BudgetRange         int    `json:"budget_range"`
	PreferredTravelMode string `json:"preferred_travel_mode"`
}

type UpdateProfileRequest struct {
	AbsoluteWalkingLimit *int    `json:"absolute_walking_limit,omitempty"`
	BudgetRange         *int    `json:"budget_range,omitempty"`
	PreferredTravelMode *string `json:"preferred_travel_mode,omitempty"`
}

func GetProfileHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromRequest(r)
	if userID == 0 {
		http.Error(w, "User ID required (pass ?user_id= or use auth token)", http.StatusBadRequest)
		return
	}

	if db.Pool == nil {
		http.Error(w, "Database not available", http.StatusServiceUnavailable)
		return
	}

	var profile UserProfile
	err := db.Pool.QueryRow(context.Background(),
		`SELECT id, username, email, absolute_walking_limit, budget_range, 
		        COALESCE(preferred_travel_mode, 'lazy')
		 FROM users WHERE id = $1`, userID,
	).Scan(&profile.ID, &profile.Username, &profile.Email,
		&profile.AbsoluteWalkingLimit, &profile.BudgetRange, &profile.PreferredTravelMode)

	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

func UpdateProfileHandler(w http.ResponseWriter, r *http.Request) {
	userID := getUserIDFromRequest(r)
	if userID == 0 {
		http.Error(w, "User ID required", http.StatusBadRequest)
		return
	}

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if db.Pool == nil {
		http.Error(w, "Database not available", http.StatusServiceUnavailable)
		return
	}

	if req.AbsoluteWalkingLimit != nil {
		db.Pool.Exec(context.Background(),
			`UPDATE users SET absolute_walking_limit = $1 WHERE id = $2`,
			*req.AbsoluteWalkingLimit, userID)
	}
	if req.BudgetRange != nil {
		db.Pool.Exec(context.Background(),
			`UPDATE users SET budget_range = $1 WHERE id = $2`,
			*req.BudgetRange, userID)
	}
	if req.PreferredTravelMode != nil {
		db.Pool.Exec(context.Background(),
			`UPDATE users SET preferred_travel_mode = $1 WHERE id = $2`,
			*req.PreferredTravelMode, userID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

// getUserIDFromRequest checks context (from auth middleware) or query param
func getUserIDFromRequest(r *http.Request) int {
	// First try context (set by AuthMiddleware)
	if ctxUserID, ok := r.Context().Value("user_id").(int); ok {
		return ctxUserID
	}
	// Fallback to query param for development
	if idStr := r.URL.Query().Get("user_id"); idStr != "" {
		id, _ := strconv.Atoi(idStr)
		return id
	}
	return 0
}
