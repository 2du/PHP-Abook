package main

// html/template
// database/sql
import (
	"net/http"
	"github.com/gin-gonic/gin"
)
 
func main() {
	// db, err := sql.Open("sqlite3", "./data.db")
	router := gin.Default()

	router.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusFound, "/main")
	})

	router.GET("/main", func(c *gin.Context) {
		c.String(http.StatusOK, "Hello, World.")
	})
 
    router.Run(":3000")
}