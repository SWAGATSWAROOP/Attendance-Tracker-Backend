from flask import Flask, request, jsonify
import logging

app = Flask(__name__)


logging.basicConfig(level=logging.INFO)

@app.route('/checkin', methods=['POST'])
def checkin():
    data = request.get_json()
    user_id = data.get('user_id')
    timestamp = data.get('timestamp')
    app.logger.info(f'User {user_id} checked in at {timestamp}')
    
    return jsonify({'message': f'User {user_id} checked in successfully.'}), 200

@app.route('/checkout', methods=['POST'])
def checkout():
    data = request.get_json()
    user_id = data.get('user_id')
    timestamp = data.get('timestamp')
    app.logger.info(f'User {user_id} checked out at {timestamp}')
    
    return jsonify({'message': f'User {user_id} checked out successfully.'}), 200

if __name__ == '__main__':
    app.run(debug=True)


