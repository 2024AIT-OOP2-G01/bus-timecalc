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

async function fetchData() {
    // データ取得
    const response = await fetch('/get_schedule');
    const data = await response.json();

    // 適当に表示
    const jsonDataDiv = document.getElementById('jsonData');
    jsonDataDiv.innerHTML = `
        <ul>
            <li><strong>現在時刻:</strong> ${data.currentTime}</li>
            <li><strong>バス停までかかる時間:</strong> ${data.timeToBusStop} 分</li>
            <li><strong>バスの出発時間:</strong> ${data.busDepartureTimes.join(", ")}</li>
            <li><strong>バスの移動時間:</strong> ${data.busTravelTime} 分</li>
            <li><strong>電車の出発時間:</strong> ${data.trainDepartureTimes.join(", ")}</li>
        </ul>
    `;

    const nowStr = data.currentTime; // "HH:MM:SS"
    const walkMinutes = data.timeToBusStop; // 徒歩時間 (分単位)
    const busMinutes = data.busTravelTime; // バス移動 (分単位)
    const busTimes = data.busDepartureTimes; // ["HH:MM:SS", ...]
    const trainTimes = data.trainDepartureTimes;

    // 徒歩・バス時間を秒に変換
    const walkSeconds = walkMinutes * 60;
    const busSeconds = busMinutes * 60;

    // 現在時刻を秒に変換
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

        if (timeToLeave < 0) {
            continue;
        }

        // 適当に表示
        resultText = `
            電車時刻: ${trainTime} に乗れる<br>
            バス発車時刻: ${latestBus} に乗れば良いから<br>
            今の場所を出発するまでの残り時間: ${Math.floor(timeToLeave / 60)} 分 ${timeToLeave % 60} 秒
        `;
        isTrainFound = true;
        break;
    }

    if (!isTrainFound) {
        resultText = "該当する電車が見つかりませんでした";
    }

    document.getElementById('calResult').innerHTML = resultText;
}

document.addEventListener('DOMContentLoaded', fetchData);
