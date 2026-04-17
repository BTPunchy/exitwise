package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/exitwise/backend/internal/db"
)

// --- Simple Token System ---
// In production you would use proper JWT (e.g. golang-jwt/jwt).
// This is a lightweight, dependency-free implementation suitable for an MVP.

type SignUpRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token  string `json:"token"`
	UserID int    `json:"user_id"`
}

// hashPassword creates a SHA-256 hash of the password with a salt.
// For production, use bcrypt instead.
func hashPassword(password string) string {
	h := sha256.Sum256([]byte(password))
	return hex.EncodeToString(h[:])
}

// generateToken creates a random hex token for session auth
func generateToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// Simple in-memory token store - maps token -> userID
// In production, use Redis or DB-backed sessions
var tokenStore = make(map[string]int)

func SignUpHandler(w http.ResponseWriter, r *http.Request) {
	var req SignUpRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	if db.Pool == nil {
		http.Error(w, "Database not available", http.StatusServiceUnavailable)
		return
	}

	passwordHash := hashPassword(req.Password)

	// Generate a default username from the email prefix
	username := strings.Split(req.Email, "@")[0] + fmt.Sprintf("_%d", time.Now().UnixMilli()%10000)

	var userID int
	err := db.Pool.QueryRow(context.Background(),
		`INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id`,
		username, req.Email, passwordHash,
	).Scan(&userID)

	if err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			http.Error(w, "Email already registered", http.StatusConflict)
			return
		}
		http.Error(w, "Failed to create account: "+err.Error(), http.StatusInternalServerError)
		return
	}

	token, _ := generateToken()
	tokenStore[token] = userID

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(AuthResponse{Token: token, UserID: userID})
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if db.Pool == nil {
		http.Error(w, "Database not available", http.StatusServiceUnavailable)
		return
	}

	passwordHash := hashPassword(req.Password)

	var userID int
	err := db.Pool.QueryRow(context.Background(),
		`SELECT id FROM users WHERE email = $1 AND password_hash = $2`,
		req.Email, passwordHash,
	).Scan(&userID)

	if err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	token, _ := generateToken()
	tokenStore[token] = userID

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AuthResponse{Token: token, UserID: userID})
}

// AuthMiddleware validates the Bearer token and injects user_id into context
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			// Allow unauthenticated access for now (MVP)
			next.ServeHTTP(w, r)
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		userID, ok := tokenStore[token]
		if !ok {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "user_id", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
