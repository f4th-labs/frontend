#!/bin/bash

# Configuration
API_URL="http://localhost:5001"
EMAIL="author@example.com"
PASSWORD="password123"
IMAGE_PATH="/path/to/your/image.jpg"

# Register user
echo "Registering user..."
curl -s -X POST "$API_URL/users/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"fullName\":\"Test Author\",\"lastName\":\"User\",\"password\":\"$PASSWORD\"}"

echo -e "\n\nIMPORTANT: Now update the user's role in the database to 'author'"
echo "Press Enter to continue after updating the role..."
read

# Login and get token
echo -e "\nLogging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

# Create news article
echo -e "\nCreating news article..."
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/news" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=First Test Article" \
  -F "description=This is a description of my first article" \
  -F "content=This is the full content of the article with details" \
  -F "category=technology" \
  -F "image=@$IMAGE_PATH")

echo "Response: $CREATE_RESPONSE"
ARTICLE_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Article ID: $ARTICLE_ID"

# Get all news articles
echo -e "\nGetting all news articles..."
ALL_NEWS=$(curl -s -X GET "$API_URL/news/posts")
echo "All News: $ALL_NEWS"

# Get single news article
echo -e "\nGetting single news article..."
SINGLE_NEWS=$(curl -s -X GET "$API_URL/news/post/$ARTICLE_ID")
echo "Single News: $SINGLE_NEWS"

# Update news article
echo -e "\nUpdating news article..."
UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/news/$ARTICLE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Updated Article Title" \
  -F "description=This description has been updated" \
  -F "content=The content has also been updated with new information")
echo "Update Response: $UPDATE_RESPONSE"

# Delete news article
echo -e "\nDeleting news article..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/news/post/$ARTICLE_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "Delete Response: $DELETE_RESPONSE"

echo -e "\nAll tests completed!"
