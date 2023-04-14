var res;
var res2;
var data;

async function fetchData() {
  res = await fetch(
    "http://openapi.seoul.go.kr:8088/7961696649656e6136375774696566/json/RealtimeCityAir/1/25/"
  );
  res2 = await res.json();

  data = res2.RealtimeCityAir.row;
}

async function loadTable() {
  // 데이터가 0일 경우 '-'로 대체
  for (var i = 0; i < 25; i++) {
    if (data[i].PM10 === 0) {
      data[i].PM10 = "-";
    }
    if (data[i].PM25 === 0) {
      data[i].PM25 = "-";
    }
    if (data[i].O3 === 0) {
      data[i].O3 = "-";
    }
    if (data[i].NO2 === 0) {
      data[i].NO2 = "-";
    }
    if (data[i].IDEX_MVL === 0) {
      data[i].IDEX_MVL = "-";
    }
    if (data[i].IDEX_NM === "") {
      data[i].IDEX_NM = "-";
    } else if (data[i].IDEX_NM === "보통") {
      data[i].IDEX_NM = '<span style="color:green;">보통</span>';
    } else if (data[i].IDEX_NM === "좋음") {
      data[i].IDEX_NM = '<span style="color:blue;">좋음</span>';
    } else if (data[i].IDEX_NM === "나쁨") {
      data[i].IDEX_NM = '<span style="color:red;">나쁨</span>';
    }
  }


  // 권역구별로 분류
  var regions = {};
  for (var i = 0; i < data.length; i++) {
    var region = data[i].MSRRGN_NM;
    if (!(region in regions)) {
      regions[region] = [];
    }
    regions[region].push(data[i]);
  }

  // 권역구별 표 생성
  for (var region in regions) {
    var rows = regions[region];
    var rowHTML = "";
    for (var i = 0; i < rows.length; i++) {
      var borderStyle = "";
      // 내가 사는 지역 노란 점선으로 표시하기
      if (rows[i].MSRSTE_NM === "은평구") {
        rowHTML += `<tr style="border-style:dashed; border-color:yellow">`;
      } else {
        rowHTML += "<tr>";
      }
      rowHTML += `
                <td>${rows[i].MSRSTE_NM}</td>
                <td>${rows[i].PM10}</td>
                <td>${rows[i].PM25}</td>
                <td>${rows[i].O3}</td>
                <td>${rows[i].NO2}</td>
                <td>${rows[i].IDEX_NM}</td>
                <td>${rows[i].IDEX_MVL}</td>
            </tr>
            `;
    }
    // 권역구 이름과 함께 표 출력
    document.getElementById("data").innerHTML += `
        <tr class="region">
            <td colspan="7">${region}</td>
        </tr>
        ${rowHTML}
        `;
  }
  
  // IDEX_MVL을 기준으로 하위, 상위 5개 색 바꾸기
  // 데이터 배열 생성
  var dataArray = [];
  var dataRows = document.querySelectorAll("#data tr:not(.region)");
  for (var i = 0; i < dataRows.length; i++) {
    // '-'인 경우는 제외하고 dataArray에 추가
    var idexValue = dataRows[i]
      .querySelector("td:nth-child(7)")
      .textContent.trim();
    if (idexValue !== "-") {
      dataArray.push(dataRows[i]);
    }
  }

  // IDEX_MVL 기준으로 내림차순 정렬
  dataArray.sort(function (a, b) {
    var aIDEX = parseFloat(a.querySelector("td:nth-child(7)").textContent);
    var bIDEX = parseFloat(b.querySelector("td:nth-child(7)").textContent);
    if (aIDEX < bIDEX) return 1;
    if (aIDEX > bIDEX) return -1;
    return 0;
  });

  // 상위 5개와 하위 5개의 지역명에 대해 색 변경
  for (var i = 0; i < dataArray.length; i++) {
    var regionName = dataArray[i].querySelector("td:first-child").textContent;
    if (i < 5) {
      dataArray[i].querySelector("td:first-child").style.color = "red";
      dataArray[i].querySelector("td:first-child").style.fontWeight = "bold";
      dataArray[i].querySelector("td:last-child").style.color = "red";
      dataArray[i].querySelector("td:last-child").style.fontWeight = "bold";
    } else if (i >= dataArray.length - 5) {
      dataArray[i].querySelector("td:first-child").style.color = "blue";
      dataArray[i].querySelector("td:first-child").style.fontWeight = "bold";
      dataArray[i].querySelector("td:last-child").style.color = "blue";
      dataArray[i].querySelector("td:last-child").style.fontWeight = "bold";
    }
  }
}

function loadChart() {
  // 차트에 넣을 데이터 채우기
  const labels = [];
  const datas = [];
  const labels2 = [];
  const datas2 = [];
  for (var i = 0; i < 25; i++) {
    labels.push(data[i].MSRSTE_NM);
    datas.push(data[i].PM10);
    labels2.push(data[i].MSRSTE_NM);
    datas2.push(data[i].PM25);
  }

  // myChart 캔버스에 차트 그리기
  const ctx = document.getElementById("myChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "PM10",
          data: datas,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  const ctx2 = document.getElementById("myChart2");

  new Chart(ctx2, {
    type: "bar",
    data: {
      labels: labels2,
      datasets: [
        {
          label: "PM25",
          data: datas2,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
