import os
import json
import pika
import psycopg2
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import numpy as np
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Database connection details from environment variables
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "liftrtrackr")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

# RabbitMQ connection details
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "workout_events")

# Establish database connection
def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

# Initialize RabbitMQ connection and consumer
def setup_rabbitmq_consumer():
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, credentials=credentials)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    
    # Declare the queue
    channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
    
    # Set up consumer
    channel.basic_consume(
        queue=RABBITMQ_QUEUE,
        on_message_callback=process_workout_event,
        auto_ack=True
    )
    
    print(f"PlateauBreaker: Connected to RabbitMQ and listening for messages on {RABBITMQ_QUEUE}")
    
    # Start consuming (non-blocking in a separate thread)
    import threading
    threading.Thread(target=channel.start_consuming, daemon=True).start()
    
    return connection, channel

# Process incoming workout events
def process_workout_event(ch, method, properties, body):
    try:
        event = json.loads(body)
        user_id = event.get('user_id')
        lift = event.get('lift')
        
        print(f"Received workout event: {event}")
        
        # Check for plateau
        has_plateau = check_plateau(user_id, lift)
        
        if has_plateau:
            create_alert(user_id, lift)
    except Exception as e:
        print(f"Error processing workout event: {e}")

# Algorithm to check for plateau
def check_plateau(user_id, lift, weeks_to_check=8, stagnation_threshold=0.01):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get workouts for the past X weeks
        weeks_ago = datetime.now() - timedelta(weeks=weeks_to_check)
        
        cur.execute("""
            SELECT date, weight
            FROM workouts
            WHERE user_id = %s AND lift = %s AND date >= %s
            ORDER BY date ASC
        """, (user_id, lift, weeks_ago.strftime('%Y-%m-%d')))
        
        workouts = cur.fetchall()
        
        # Close connection
        cur.close()
        conn.close()
        
        if len(workouts) < 3:  # Need at least 3 data points
            return False
        
        # Extract dates and weights
        dates = [datetime.strptime(w[0], '%Y-%m-%d') for w in workouts]
        weights = [float(w[1]) for w in workouts]
        
        # Calculate weekly maximums
        weekly_maximums = {}
        for i, (date, weight) in enumerate(zip(dates, weights)):
            week_number = date.isocalendar()[1]  # ISO week number
            year = date.year
            week_key = f"{year}-{week_number}"
            
            if week_key not in weekly_maximums or weight > weekly_maximums[week_key]:
                weekly_maximums[week_key] = weight
        
        # Sort weekly maximums by date
        sorted_weeks = sorted(weekly_maximums.keys())
        sorted_maxes = [weekly_maximums[week] for week in sorted_weeks]
        
        if len(sorted_maxes) < 3:  # Need at least 3 weeks of data
            return False
        
        # Check last 3 weeks for stagnation
        last_three_weeks = sorted_maxes[-3:]
        
        # Calculate percentage improvement
        improvements = []
        for i in range(1, len(last_three_weeks)):
            prev_weight = last_three_weeks[i-1]
            curr_weight = last_three_weeks[i]
            if prev_weight > 0:  # Avoid division by zero
                improvement = (curr_weight - prev_weight) / prev_weight
                improvements.append(improvement)
        
        # Check if all improvements are below threshold
        is_plateau = all(imp < stagnation_threshold for imp in improvements)
        
        return is_plateau
    
    except Exception as e:
        print(f"Error checking plateau: {e}")
        return False

# Create an alert for the user
def create_alert(user_id, lift):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if an alert already exists for this user and lift in the past week
        week_ago = datetime.now() - timedelta(weeks=1)
        
        cur.execute("""
            SELECT id FROM alerts 
            WHERE user_id = %s AND lift = %s AND created_at >= %s AND status = 'active'
        """, (user_id, lift, week_ago))
        
        existing_alert = cur.fetchone()
        
        if existing_alert:
            print(f"Alert already exists for user {user_id} and lift {lift}")
            cur.close()
            conn.close()
            return
        
        # Insert new alert
        cur.execute("""
            INSERT INTO alerts (user_id, lift, message, status, created_at, updated_at)
            VALUES (%s, %s, %s, 'active', NOW(), NOW())
        """, (
            user_id, 
            lift, 
            f"You've hit a plateau in your {lift} progress. Consider changing your routine or adding variation."
        ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"Created plateau alert for user {user_id} and lift {lift}")
    
    except Exception as e:
        print(f"Error creating alert: {e}")

# API endpoint to manually check for plateaus
@app.route('/api/plateau-check', methods=['GET'])
def plateau_check_endpoint():
    user_id = request.args.get('user_id')
    lift = request.args.get('lift')
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # If lift is not specified, check all lifts for the user
        if not lift:
            cur.execute("""
                SELECT DISTINCT lift FROM workouts WHERE user_id = %s
            """, (user_id,))
            
            lifts = [row[0] for row in cur.fetchall()]
            
            plateau_results = {}
            for lift_type in lifts:
                plateau_results[lift_type] = check_plateau(user_id, lift_type)
            
            cur.close()
            conn.close()
            
            return jsonify({
                "user_id": user_id,
                "plateaus": plateau_results
            })
        else:
            # Check specific lift
            plateau_detected = check_plateau(user_id, lift)
            
            cur.close()
            conn.close()
            
            return jsonify({
                "user_id": user_id,
                "lift": lift,
                "plateau_detected": plateau_detected
            })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "OK", "service": "PlateauBreaker"})

if __name__ == '__main__':
    # Set up RabbitMQ consumer
    try:
        connection, channel = setup_rabbitmq_consumer()
    except Exception as e:
        print(f"Warning: Could not connect to RabbitMQ - {e}")
        print("PlateauBreaker will run without event processing")
    
    # Run Flask app
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 