package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/exitwise/backend/internal/auth"
	"github.com/exitwise/backend/internal/directions"
	"github.com/exitwise/backend/internal/planner"
	"github.com/exitwise/backend/internal/poi"
	"github.com/exitwise/backend/internal/station"
	"github.com/exitwise/backend/internal/trip"
	"github.com/exitwise/backend/internal/user"
)

func SetupRoutes() *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// CORS middleware for React Native dev
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	// --- Public Auth Routes ---
	r.Post("/auth/signup", auth.SignUpHandler)
	r.Post("/auth/login", auth.LoginHandler)

	// --- Protected Routes (auth middleware applied) ---
	r.Group(func(r chi.Router) {
		r.Use(auth.AuthMiddleware)

		// User Profile
		r.Get("/user/profile", user.GetProfileHandler)
		r.Put("/user/profile", user.UpdateProfileHandler)

		// Stations
		r.Get("/stations", station.GetStationsHandler)
		r.Get("/station-exits", station.GetStationExitsHandler)

		// POIs
		r.Get("/pois", poi.GetPOIsHandler)
		r.Get("/pois/detail", poi.GetPOIDetailHandler)

		// Directions (Mapbox proxy + optimal exit)
		r.Get("/directions", directions.GetDirectionsHandler)

		// Trip Planner (AI proxy)
		r.Post("/generate-itinerary", planner.PlanTripHandler)

		// Saved Trips
		r.Get("/trips", trip.GetTripsHandler)
		r.Delete("/trips", trip.DeleteTripHandler)
	})

	return r
}
