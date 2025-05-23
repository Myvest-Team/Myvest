//DOM이 모두 로드될 경우 실행
document.addEventListener("DOMContentLoaded", async () => {

  //local스토리지에서 설문 점수 데이터 불러오기
  const scores = JSON.parse(localStorage.getItem("surveyScores"));

  //Data가 없을 경우 Error알림 표시 이후 종료
  if (!scores) {
    document.body.innerHTML = "<p>점수 데이터를 불러올 수 없습니다.</p>";
    return;
  }

  //각 항목 별 최대 점수 정의(질문 개수 x 최대 점수5점)
  const maxScorePerType = {
    "금융지식,투자경험": 14 * 5,
    "위험수용도": 12 * 5,
    "투자목표,기간": 9 * 5,
    "재무상황,투자가능자산": 17 * 5
  };

  //result를 표시할 HTML요소 가져오기
  const resultDiv = document.getElementById("result");

  //chart, text를 표시할 container생성
  const chartContainer = document.createElement("div");
  const textContainer = document.createElement("div");
  resultDiv.appendChild(chartContainer);
  resultDiv.appendChild(textContainer);

  //각 항목의 백분율 점수 및 조언 저장
  const percentageScores = {};
  const advices = {};

  //백분율 점수에 따른 조언을 반환
  const getAdvice = (type, percentage) => {
    if (percentage >= 80) {
      return `${type} 점수가 높습니다. 적극적인 투자 전략을 고려해보세요.`;
    } else if (percentage >= 50) {
      return `${type} 점수가 중간입니다. 균형 잡힌 포트폴리오가 적합합니다.`;
    } else {
      return `${type} 점수가 낮습니다. 안정적인 투자 위주로 시작하는 것이 좋습니다.`;
    }
  };

  //평균 점수 계산을 위한 변수 지정
  let totalPercentage = 0;
  let typeCount = 0;

  //항목별로 백분율 점수 계산 및 조언 지정(저장)
  for (const [type, maxScore] of Object.entries(maxScorePerType)) {
    const rawScore = scores[type] || 0;
    const percentage = ((rawScore / maxScore) * 100).toFixed(1);
    percentageScores[type] = parseFloat(percentage);
    advices[type] = getAdvice(type, percentageScores[type]);

    totalPercentage += parseFloat(percentage);
    typeCount++;
  }

  //전체 평균 점수 계산
  const averageScore = (totalPercentage / typeCount).toFixed(1);

  //평균 점수를 기준으로 하여 투자자 유형 분류 
  let investorType = "";
  if (averageScore >= 80) {
    investorType = "공격형 투자자";
  } else if (averageScore >= 60) {
    investorType = "적극적 투자자";
  } else if (averageScore >= 40) {
    investorType = "중립형 투자자";
  } else {
    investorType = "안정형 투자자";
  }

  //chart를 위한 canvas요소 생성, 삽입
  const canvas = document.createElement("canvas");
  canvas.id = "radarChart";
  chartContainer.appendChild(canvas);
  
  //server에서 전체 평균 점수 불러옴
  let averageScores = {};
  try {
    const response = await fetch("/averageScores");
    if (!response.ok) {
      throw new Error("평균 점수 데이터를 가져오는 데 실패했습니다.");
    }
    averageScores = await response.json();
  } catch (error) {
    console.error("평균 점수 가져오기 오류:", error);
  }

  //chart.js를 library를 활용한 radar(방사형)chart생성
  new Chart(canvas, {
    type: "radar",
    data: {
      labels: ["금융지식,투자경험", "위험수용도", "투자목표,기간", "재무상황,투자가능자산"],
      datasets: [
        {
          label: "응답자 점수",
          data: [
            percentageScores["금융지식,투자경험"],
            percentageScores["위험수용도"],
            percentageScores["투자목표,기간"],
            percentageScores["재무상황,투자가능자산"]
          ],
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(54, 162, 235, 1)"
        },
        {
          label: "전체 평균 점수",
          data: [
            averageScores.avgKnowledgeAndExperience || 0,
            averageScores.avgRiskAcceptance || 0,
            averageScores.avgGoalsAndDuration || 0,
            averageScores.avgSituationAndPossibility || 0
          ],
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(255, 99, 132, 1)"
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          min: 0,
          max: 140,
          ticks: {
            stepSize: 20
          }
        }
      }
    }
  });

  //분석 결과 text생성 및 text삽입
  const textContent = `
    <h2>설문 결과 (백분율)</h2>
    <ul>
      ${Object.keys(maxScorePerType).map(type => `
        <li><strong>${type}</strong>: ${percentageScores[type]}%<br><em>${advices[type]}</em></li>
      `).join('')}
    </ul>
    <h3>▶ 종합 투자 성향: <mark>${investorType}</mark> (평균 점수: ${averageScore}%)</h3>
  `;
  textContainer.innerHTML = textContent;

  //설문 결과를 server로 전송(저장)
  await fetch("/addResults", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    KnowledgeAndExperience: percentageScores["금융지식,투자경험"],
    RiskAcceptance: percentageScores["위험수용도"],
    GoalsAndDuration: percentageScores["투자목표,기간"],
    SituationAndPossibility: percentageScores["재무상황,투자가능자산"],
    Age: scores["나이"],
    Gender: scores["성별"],
    InvestorType: investorType,
    AverageScore: averageScore
  })
});
});
