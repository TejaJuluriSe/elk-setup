#!/bin/bash

# Set variables for Elasticsearch credentials and API key
ES_HOST="0.0.0.0"
ES_PORT="9200"
ES_USER="elastic"
ES_PASSWORD="logstashpassword"
API_KEY_NAME="logstash-api-key"

# 1. Start Docker Compose services
echo "Starting Docker Compose services..."
docker-compose up -d

# Wait for Elasticsearch to start (you can adjust this wait time if necessary)
echo "Waiting for Elasticsearch to start..."
sleep 30  # Wait for 30 seconds (or more if needed)

# 2. Create an API Key in Elasticsearch
echo "Creating API key in Elasticsearch..."
API_KEY=$(curl -X POST "http://$ES_HOST:$ES_PORT/_security/api_key" \
    -H "Content-Type: application/json" \
    -u $ES_USER:$ES_PASSWORD \
    -d '{
          "name": "'"$API_KEY_NAME"'",
          "expiration": "1d",
          "role_descriptors": {
            "logstash_writer": {
              "cluster": ["all"],
              "index": {
                "names": ["*"],
                "privileges": ["write"]
              }
            }
          }
        }' | awk -F'"api_key":"' '{print $2}' | awk -F'"' '{print $1}')

# Check if the API key creation was successful
if [ -z "$API_KEY" ]; then
  echo "Failed to create API key in Elasticsearch. Exiting..."
  exit 1
fi

echo "API Key created successfully: $API_KEY"

# 3. Update Logstash configuration with the API key
echo "Updating Logstash configuration with the API key..."
sed -i "s|api_key => .*|api_key => \"$API_KEY\"|" ./elk-config/logstash/logstash.conf

# 4. Restart Logstash to apply the changes
echo "Restarting Logstash..."
docker-compose restart logstash

# 5. Optional: Verify Elasticsearch is receiving data from Logstash
echo "Verifying Elasticsearch is receiving data from Logstash..."
sleep 10  # Give Logstash some time to start sending data
curl -X GET "http://$ES_HOST:$ES_PORT/logstash-*/_search?q=*&size=5"
