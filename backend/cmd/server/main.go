package main

import (
	"log"
	"net/http"
	"os"

	"github.com/exitwise/backend/internal/api"
	"github.com/exitwise/backend/internal/db"
)

func main() {
	// Initialize the database connection pool
	if err := db.InitDB(); err != nil {
		log.Printf("Warning: Database connection failed: %v", err)
		log.Println("Server will start without database — endpoints will return mock data")
	} else {
		defer db.CloseDB()
	}

	router := api.SetupRoutes()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Starting ExitWise backend server on port %s...", port)

	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
