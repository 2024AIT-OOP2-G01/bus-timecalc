from flask import Flask, jsonify, render_template
import datetime

app = Flask(__name__)
a = datetime.datetime.now().strftime("%H:%M:%S")


@app.route('/get_schedule', methods=['GET'])
def get_schedule():
    #徒歩やバス移動は「分単位」、時刻は "HH:MM:SS"
    #現在時刻は13:00:00という設定　固定値から変更が必要
    response = {
        "currentTime": "13:27:00",
        "time_to_bus_stop": 300,  # 徒歩5分
        "bus_departure_times": ["13:15:00", "13:20:00", "13:25:00", "13:30:00", "13:35:00", "13:40:00", "13:45:00", "13:50:00", "13:55:00", "14:00:00"],
        "bus_travel_time": 360,  # バス移動6分
        "train_departure_time": ["13:40:00", "14:00:00", "14:20:00", "14:40:00", "15:00:00"]
    }
    return jsonify(response)

@app.route('/')#とりあえず表示
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host="localhost", port=8888, debug=True)
