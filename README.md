# What is This

[ギリ間に合うナビ](https://girimaniau.vercel.app/)のメイン機能である、ギリ表示機能における現在地であと何分間滞在できるかの計算を擬似的に行うことができる。


# Set Up

```bash
pip install flask
python app.py
```


# How To Use

`http://localhost:8888`に入ると、計算された値が表示される。\
`app.py` 内にある `get_schedule` 関数の `response` を編集することで、滞在時間の計算ロジックをカスタマイズできる。

## Response のキーと概要

| キー値                  | 概要                                   |
|-------------------------|----------------------------------------|
| `currentTime`           | 現在時刻                              |
| `time_to_bus_stop`      | バス停までの移動時間(秒)             |
| `bus_departure_times`   | 直近のバスの発車時刻(リスト形式)     |
| `bus_travel_time`       | バス乗車時間(秒)                     |
| `train_departure_time`  | 直近の電車の発車時刻(リスト形式)     |

```python

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

```
# バス停までの移動時間の計算方法

Haversine公式を用いて、ユーザがいる緯度経度から一番近い建物を計算し、その建物から事前に測定しておいた時間を`time_to_bus_stop`としている。

``` python
def calculate_distance(lat1, lon1, lat2, lon2):
    # 2点間の距離をヘベルサイン公式で計算（メートル単位）
    R = 6371000  # 地球の半径（メートル）
    
    # 緯度経度をラジアンに変換
    lat1_rad = math.radians(float(lat1))
    lon1_rad = math.radians(float(lon1))
    lat2_rad = math.radians(float(lat2))
    lon2_rad = math.radians(float(lon2))
    
    # 緯度経度の差分
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c
```

[ソースコードの全文はこちらから »](https://github.com/2024AIT-OOP2-G01/bus-backend/blob/main/routes/place.py)
