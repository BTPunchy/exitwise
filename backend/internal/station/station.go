package station

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/exitwise/backend/internal/db"
)

// Station represents a full station record for JSON responses
type Station struct {
	ID     int     `json:"id"`
	NameEN string  `json:"name_en"`
	NameTH string  `json:"name_th,omitempty"`
	Line   string  `json:"line"`
	Lat    float64 `json:"lat"`
	Lng    float64 `json:"lng"`
}

// StationExit represents an exit and its computed distance
type StationExit struct {
	ID             int     `json:"id"`
	StationID      int     `json:"station_id"`
	ExitNumber     string  `json:"exit_number"`
	Description    string  `json:"description"`
	DistanceMeters float64 `json:"distance_meters,omitempty"`
}

// GetStationsHandler returns all stations, with optional ?q= search filtering
func GetStationsHandler(w http.ResponseWriter, r *http.Request) {
	if db.Pool == nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"stations": []Station{},
		})
		return
	}

	searchQuery := r.URL.Query().Get("q")

	var query string
	var args []interface{}

	if searchQuery != "" {
		query = `SELECT id, name_en, COALESCE(name_th, ''), line, 
		         ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng 
		         FROM stations 
		         WHERE name_en ILIKE '%' || $1 || '%' OR name_th ILIKE '%' || $1 || '%'
		         ORDER BY name_en`
		args = append(args, searchQuery)
	} else {
		query = `SELECT id, name_en, COALESCE(name_th, ''), line, 
		         ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng 
		         FROM stations ORDER BY id`
	}

	rows, err := db.Pool.Query(r.Context(), query, args...)
	if err != nil {
		http.Error(w, "Failed to query stations: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var stations []Station
	for rows.Next() {
		var s Station
		if err := rows.Scan(&s.ID, &s.NameEN, &s.NameTH, &s.Line, &s.Lat, &s.Lng); err == nil {
			stations = append(stations, s)
		}
	}

	if stations == nil {
		stations = []Station{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"stations": stations,
	})
}

// GetStationExitsHandler returns all exits for a specific station
func GetStationExitsHandler(w http.ResponseWriter, r *http.Request) {
	stationID := r.URL.Query().Get("station_id")
	if stationID == "" {
		http.Error(w, "station_id query parameter required", http.StatusBadRequest)
		return
	}

	if db.Pool == nil {
		http.Error(w, "Database not available", http.StatusServiceUnavailable)
		return
	}

	rows, err := db.Pool.Query(r.Context(),
		`SELECT id, station_id, exit_number, COALESCE(description, ''),
		        ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng
		 FROM station_exits WHERE station_id = $1 ORDER BY exit_number`, stationID)
	if err != nil {
		http.Error(w, "Failed to query exits", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type ExitWithCoords struct {
		ID          int     `json:"id"`
		StationID   int     `json:"station_id"`
		ExitNumber  string  `json:"exit_number"`
		Description string  `json:"description"`
		Lat         float64 `json:"lat"`
		Lng         float64 `json:"lng"`
	}

	var exits []ExitWithCoords
	for rows.Next() {
		var e ExitWithCoords
		if err := rows.Scan(&e.ID, &e.StationID, &e.ExitNumber, &e.Description, &e.Lat, &e.Lng); err == nil {
			exits = append(exits, e)
		}
	}

	if exits == nil {
		exits = []ExitWithCoords{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"exits": exits})
}

// FindOptimalExit queries PostGIS to find the nearest exit to a destination
func FindOptimalExit(ctx context.Context, destLat, destLng float64) (*StationExit, error) {
	if db.Pool == nil {
		return nil, fmt.Errorf("database not initialized")
	}

	query := `
		SELECT id, station_id, exit_number, COALESCE(description, ''), 
		       ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as dist
		FROM station_exits
		ORDER BY dist ASC
		LIMIT 1;
	`
	// Note: ST_MakePoint takes (longitude, latitude)
	row := db.Pool.QueryRow(ctx, query, destLng, destLat)

	var exit StationExit
	err := row.Scan(&exit.ID, &exit.StationID, &exit.ExitNumber, &exit.Description, &exit.DistanceMeters)
	if err != nil {
		return nil, fmt.Errorf("failed to find optimal exit: %w", err)
	}

	return &exit, nil
}
