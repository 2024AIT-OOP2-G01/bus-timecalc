from flask import Flask, jsonify, render_template
import datetime

app = Flask(__name__)
a = datetime.datetime.now().strftime("%H:%M:%S")


@app.route('/get_schedule', methods=['GET'])
def get_schedule():
    #徒歩やバス移動は「分単位」、時刻は "HH:MM:SS"
    #現在時刻は13:00:00という設定　固定値から変更が必要
    response = {
        "currentTime": "13:00:00",
        "timeToBusStop": 10,  # 徒歩10分
        "busDepartureTimes": ["13:15:00", "13:30:00", "13:45:00"],
        "busTravelTime": 10,  # バス移動10分
        "trainDepartureTimes": ["14:00:00", "14:30:00"]
    }
    return jsonify(response)

@app.route('/')#とりあえず表示
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host="localhost", port=8888, debug=True)
