// "HH:MM:SS" → 総秒数に変換する
function toSeconds(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

// timeA と timeB の大小比較
function compareTimes(timeA, timeB) {
    return toSeconds(timeA) - toSeconds(timeB);
}

// timeA - timeB を「秒」で返す
function diffInSeconds(timeA, timeB) {
    return toSeconds(timeA) - toSeconds(timeB);
}

function getCurrentTimeString() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

async function fetchData() {

    const nowStr = getCurrentTimeString(); // "HH:MM"

    // APIエンドポイントに現在時刻を付与してリクエスト
    const bus_api_url = `https://ait-busdiaa-api.onrender.com/next-three?time=${nowStr}`;
    const bus_response = await fetch(bus_api_url);
    const bus_data = await bus_response.json(); // バスの時刻データ

    const time_response = await fetch('/get_schedule');
    const time_data = await time_response.json();

    const next_train_url = `/api/aikann/yakusa_to_kouzouzi/next?time=${nowStr}`;
    const next_train_response = await fetch(next_train_url);
    const next_train_data = await next_train_response.json(); // 電車の時刻データ

    // 電車時刻の結合
    const trainTimes = [next_train_data.next_time, ...next_train_data.next_times];

    // バス時刻
    const busTimes = bus_data.next_three_times;

    // 適当に表示
    const jsonDataDiv = document.getElementById('jsonData');
    //本来は現在時刻は含まれない
    jsonDataDiv.innerHTML = `
        <ul>
            <li><strong>バス停までかかる時間:</strong> ${time_data.time_to_bus_stop} 秒</li>
            <li><strong>バスの出発時間:</strong> ${busTimes.join(", ")}</li>
            <li><strong>バスの移動時間:</strong> 600 秒</li>
            <li><strong>電車の出発時間:</strong> ${trainTimes.join(", ")}</li>
        </ul>
    `;

    
    const walkSeconds = Number(time_data.time_to_bus_stop); // 徒歩時間 (秒単位)
    const busSeconds = 600; // バス移動 (秒単位)
    const nowSeconds = toSeconds(nowStr);

    let resultText = "";
    let isTrainFound = false;

    for (const trainTime of trainTimes) {
        // 電車の出発時刻の秒数
        const trainSeconds = toSeconds(trainTime);

        // 電車出発時刻 - busSeconds (バス移動秒) より早いバスに乗れば間に合う
        const trainMinusBus = trainSeconds - busSeconds;

        // validBusTimes: この電車に間に合うバス時刻たち
        const validBusTimes = busTimes.filter(busTime => {
            const busSeconds = toSeconds(busTime);
            // バス出発が trainMinusBus 以下であればOK
            return busSeconds <= trainMinusBus;
        });

        if (validBusTimes.length === 0) {
            continue; // 乗れるバスがないなら次の電車へ
        }

        // 使えるバスの中で一番遅いバスを選ぶ
        validBusTimes.sort((a, b) => compareTimes(a, b));
        const latestBus = validBusTimes[validBusTimes.length - 1];
        const latestBusSeconds = toSeconds(latestBus);

        // x = (バス出発時刻 - 現在時刻) - walkSeconds(徒歩)
        const timeToLeave = (latestBusSeconds - nowSeconds) - walkSeconds;

        // 時間が-2分以上なら次の電車へ
        if (timeToLeave < -120) {
            continue;
        }
        
        // test
        if (timeToLeave >= 0) {
            resultText = `
            電車時刻: ${trainTime} に乗れる<br>
            バス発車時刻: ${latestBus} に乗れば良いから<br>
            今の場所を出発するまでの残り時間: ${Math.floor(timeToLeave / 60)} 分 ${timeToLeave % 60} 秒
        `;
        }else{
            resultText = `
            電車時刻: ${trainTime} に乗れる<br>
            バス発車時刻: ${latestBus} に乗れば良いから<br>
            ギリ間に合わないかも...
        `;
        }
        
        isTrainFound = true;
        break;
    }

    if (!isTrainFound) {
        resultText = "該当する電車が見つかりませんでした";
    }

    document.getElementById('calResult').innerHTML = resultText;
}

document.addEventListener('DOMContentLoaded', fetchData);
