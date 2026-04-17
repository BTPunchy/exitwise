package poi

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/exitwise/backend/internal/db"
	"github.com/exitwise/backend/internal/services"
)

// POI represents a Point of Interest from the database
type POI struct {
	ID         int      `json:"id"`
	Name       string   `json:"name"`
	Category   string   `json:"category"`
	PriceLevel int      `json:"price_level"`
	Distance   float64  `json:"distance,omitempty"`
	Lat        float64  `json:"lat,omitempty"`
	Lng        float64  `json:"lng,omitempty"`
}

// POIDetail is the enriched view returned by the detail endpoint
type POIDetail struct {
	POI
	Description    string                 `json:"description"`
	Rating         *float64               `json:"rating,omitempty"`
	ImageURL       *string                `json:"image_url,omitempty"`
	OperatingHours map[string]interface{} `json:"operating_hours,omitempty"`
	GooglePlaceID  *string                `json:"google_place_id,omitempty"`
}

// GetPOIsHandler returns POIs with optional category and location-based filtering
// Query params: ?category=coffee&lat=13.73&lng=100.53&radius=500
func GetPOIsHandler(w http.ResponseWriter, r *http.Request) {
	if db.Pool == nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"pois": []POI{}})
		return
	}

	category := r.URL.Query().Get("category")
	latStr := r.URL.Query().Get("lat")
	lngStr := r.URL.Query().Get("lng")
	radiusStr := r.URL.Query().Get("radius")

	// If location-based query with radius
	if latStr != "" && lngStr != "" && radiusStr != "" {
		lat, _ := strconv.ParseFloat(latStr, 64)
		lng, _ := strconv.ParseFloat(lngStr, 64)
		radius, _ := strconv.Atoi(radiusStr)

		query := `
			SELECT id, name, COALESCE(category, ''), COALESCE(price_level, 0),
			       ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng,
			       ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as dist
			FROM pois
			WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
		`
		args := []interface{}{lng, lat, radius}

		if category != "" {
			query += ` AND LOWER(category) = LOWER($4)`
			args = append(args, category)
		}
		query += ` ORDER BY dist ASC`

		rows, err := db.Pool.Query(r.Context(), query, args...)
		if err != nil {
			http.Error(w, "Failed to query POIs: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var pois []POI
		for rows.Next() {
			var p POI
			if err := rows.Scan(&p.ID, &p.Name, &p.Category, &p.PriceLevel, &p.Lat, &p.Lng, &p.Distance); err == nil {
				pois = append(pois, p)
			}
		}
		if pois == nil {
			pois = []POI{}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"pois": pois})
		return
	}

	// Default: return all POIs, optionally filtered by category
	query := `SELECT id, name, COALESCE(category, ''), COALESCE(price_level, 0),
	                 ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng
	          FROM pois`
	var args []interface{}

	if category != "" {
		query += ` WHERE LOWER(category) = LOWER($1)`
		args = append(args, category)
	}
	query += ` ORDER BY name`

	rows, err := db.Pool.Query(r.Context(), query, args...)
	if err != nil {
		http.Error(w, "Failed to query POIs", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var pois []POI
	for rows.Next() {
		var p POI
		if err := rows.Scan(&p.ID, &p.Name, &p.Category, &p.PriceLevel, &p.Lat, &p.Lng); err == nil {
			pois = append(pois, p)
		}
	}
	if pois == nil {
		pois = []POI{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"pois": pois})
}

// GetPOIDetailHandler returns enriched detail for a single POI
// GET /pois/detail?id=5
func GetPOIDetailHandler(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "id query parameter required", http.StatusBadRequest)
		return
	}

	if db.Pool == nil {
		http.Error(w, "Database not available", http.StatusServiceUnavailable)
		return
	}

	var detail POIDetail
	var rating, lat, lng *float64
	var imageURL, googlePlaceID, operatingHoursRaw *string

	err := db.Pool.QueryRow(r.Context(),
		`SELECT id, name, COALESCE(category, ''), COALESCE(price_level, 0),
		        COALESCE(description, ''), rating, image_url, google_place_id,
		        operating_hours::text,
		        ST_Y(location::geometry), ST_X(location::geometry)
		 FROM pois WHERE id = $1`, idStr,
	).Scan(&detail.ID, &detail.Name, &detail.Category, &detail.PriceLevel,
		&detail.Description, &rating, &imageURL, &googlePlaceID,
		&operatingHoursRaw, &lat, &lng)

	if err != nil {
		http.Error(w, "POI not found", http.StatusNotFound)
		return
	}

	detail.Rating = rating
	detail.ImageURL = imageURL
	detail.GooglePlaceID = googlePlaceID
	if lat != nil {
		detail.Lat = *lat
	}
	if lng != nil {
		detail.Lng = *lng
	}

	if operatingHoursRaw != nil {
		json.Unmarshal([]byte(*operatingHoursRaw), &detail.OperatingHours)
	}

	// If we have a Google Place ID and the rating is missing, try to enrich from Google Places
	if detail.Rating == nil && detail.GooglePlaceID != nil && *detail.GooglePlaceID != "" {
		if placeDetails, err := services.FetchPOIDetails(*detail.GooglePlaceID); err == nil {
			detail.Rating = &placeDetails.Rating
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(detail)
}

// GetPOIsWithinLimit fetches POIs within a certain distance of an exit, filtered by budget index
func GetPOIsWithinLimit(ctx context.Context, startLat, startLng float64, limitMeters, maxPriceLevel int) ([]POI, error) {
	if db.Pool == nil {
		return nil, fmt.Errorf("database not initialized")
	}

	query := `
		SELECT id, name, COALESCE(category, ''), COALESCE(price_level, 0),
		       ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as dist
		FROM pois
		WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
		  AND price_level <= $4
		ORDER BY dist ASC;
	`

	rows, err := db.Pool.Query(ctx, query, startLng, startLat, limitMeters, maxPriceLevel)
	if err != nil {
		return nil, fmt.Errorf("failed to query pois: %w", err)
	}
	defer rows.Close()

	var pois []POI
	for rows.Next() {
		var p POI
		if err := rows.Scan(&p.ID, &p.Name, &p.Category, &p.PriceLevel, &p.Distance); err == nil {
			pois = append(pois, p)
		}
	}

	return pois, nil
}
