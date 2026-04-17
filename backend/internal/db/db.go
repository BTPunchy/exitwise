package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func InitDB() error {
	// Construct the database connection string. If deploying to Supabase,
	// you can just set the DATABASE_URL environment variable.
	connString := os.Getenv("DATABASE_URL")
	if connString == "" {
		host := os.Getenv("DB_HOST")
		if host == "" {
			host = "localhost"
		}
		port := os.Getenv("DB_PORT")
		if port == "" {
			port = "5432"
		}
		user := os.Getenv("DB_USER")
		if user == "" {
			user = "postgres"
		}
		password := os.Getenv("DB_PASSWORD")
		if password == "" {
			password = "password"
		}
		dbname := os.Getenv("DB_NAME")
		if dbname == "" {
			dbname = "exitwisedb"
		}

		connString = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, password, host, port, dbname)
	}

	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return fmt.Errorf("unable to parse connection string: %w", err)
	}

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return fmt.Errorf("unable to create connection pool: %w", err)
	}

	// Test the connection with retries for docker-compose startup
	var pingErr error
	for i := 0; i < 5; i++ {
		pingErr = pool.Ping(context.Background())
		if pingErr == nil {
			break
		}
		log.Printf("Database not ready yet, retrying in 2 seconds... (%d/5)", i+1)
		time.Sleep(2 * time.Second)
	}

	if pingErr != nil {
		return fmt.Errorf("unable to ping database after retries: %w", pingErr)
	}

	Pool = pool
	log.Println("Successfully connected to the database!")
	return nil
}

func CloseDB() {
	if Pool != nil {
		Pool.Close()
	}
}
