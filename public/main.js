//DOM이 모두 로드될 경우 실행
document.addEventListener("DOMContentLoaded", async () => {
  ifi(); //form reset함수 호출

  const questions = await getQuestions(); //서버에서 질문 데이터 불러옴
  window.questions = questions; //전역 변수로 저장하여 다른 function에서도 access가능하게함

  const questionsTobe = document.getElementById("main"); //질문을 저장할 변수 설정

  //질문 데이터를 기반으로 HTML 요소 생성
  questions.forEach((question) => {
    const questionElement = document.createElement("div");
    questionElement.classList.add("form-group"); //style class지정

    //질문 title생성
    const questionTitle = document.createElement("label");
    questionTitle.textContent = `${question.no}. ${question.text}`;
    questionElement.appendChild(questionTitle);

    //응답용 버튼 label정의
    const scale = ["전혀 아니다", "아니다", "보통", "그렇다", "매우 그렇다"];
    const scaleContainer = document.createElement("div");
    scaleContainer.classList.add("vertical-radio-group");

    //각 점수별 button생성
    scale.forEach((label, index) => {
      const labelElement = document.createElement("label");

      const inputElement = document.createElement("input");
      inputElement.type = "radio";
      inputElement.name = `question-${question.no}`; //각 질문별로 name이 다름
      inputElement.value = index + 1; //점수: 1~5점으로 정의

      labelElement.appendChild(inputElement);
      labelElement.appendChild(document.createTextNode(` ${label}`));

      scaleContainer.appendChild(labelElement);
    });

    //질문 요소에 점수 입력 요소 추가
    questionElement.appendChild(scaleContainer);

    //전체 질문 form에 추가
    questionsTobe.appendChild(questionElement);
  });
});

//form reset및 event등록 함수
function ifi() {
  const form = document.getElementById("survey-form");
  const birthYearSelect = document.getElementById("birthYear");

  //출생년도 선택 option생성(1950~2015)
  for (let year = 2015; year >= 1950; year--) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = `${year}년`;
    birthYearSelect.appendChild(option);
  }

  //설문 제출 event처리
  form.addEventListener("submit", (e) => {
    e.preventDefault(); //기본 형식으로 제출하는 동작 막음

    const responses = document.querySelectorAll("input[type=radio]:checked");
    const scores = {
      "금융지식,투자경험": 0,
      "위험수용도": 0,
      "투자목표,기간": 0,
      "재무상황,투자가능자산": 0
    };

    //각 응답 점수를 Class에 맞게 합산
    responses.forEach((input) => {
      const questionNo = parseInt(input.name.replace("question-", ""));
      const question = window.questions.find(q => q.no === questionNo);
      if (question && scores.hasOwnProperty(question.type)) {
        scores[question.type] += parseInt(input.value); //점수 누적으로 계산
      }
    });

    //나이 계산(현재년도-출생년도)
    const birthYear = parseInt(birthYearSelect.value);
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    //성별 선택 값 불러옴
    const genderInput = document.querySelector("input[name='gender']:checked");
    const gender = genderInput ? genderInput.value : "미선택"; //if, 성별 선택이 되지 않았을 경우

    //응답 결과를 localstorage에 저장
    localStorage.setItem("surveyScores", JSON.stringify({
      ...scores,
      나이: age,
      성별: gender
    }));

    //결과 확인 page로 이동
    window.location.href = "submit.html";
  });

  //Light모드, Dark모드 설정 기능 button구현
  const themeToggleBtn = document.getElementById("toggle-theme");
  themeToggleBtn?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode"); //class 토글

    //button텍스트 변경
    themeToggleBtn.textContent = document.body.classList.contains("dark-mode")
      ? "☀ 라이트 모드"
      : "🌙 다크 모드";
  });
}

//서버에서 질문 데이터를 가져오는 함수
async function getQuestions() {
  const response = await fetch("/questions");
  const data = await response.json();
  return data || [];
}
