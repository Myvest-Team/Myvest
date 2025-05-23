//DOM이 모두 로드될 경우 실행
document.addEventListener('DOMContentLoaded', () => {

    //약관 동의 checkbox및 button, theme button요소 가져옴
    const agree1 = document.getElementById('agree1'); //첫 번째 약관 checkbox
    const agree2 = document.getElementById('agree2'); //두 번째 약관 checkbox
    const startBtn = document.getElementById('start-btn'); //"시작하기" button
    const toggleTheme = document.getElementById('toggle-theme'); //theme toggle button
    const body = document.body;
  
    //두 checkbox가 모두 선택되었는지 확인-->버튼 활성화 여부 판단
    function updateButtonState() {

      //모두 선택해야 버튼이 활성화
      startBtn.disabled = !(agree1.checked && agree2.checked);
    }
  
    //checkbox상태가 변화할 때마다 button상태 update
    agree1.addEventListener('change', updateButtonState);
    agree2.addEventListener('change', updateButtonState);
  
    //"시작하기" Button을 클릭할 경우, main survey page로 이동
    startBtn.addEventListener('click', () => {
      window.location.href = 'main.html';
    });
  
    //theme toggle button클릭할 경우, Lightmode-Darkmode전환
    toggleTheme.addEventListener('click', () => {
      body.classList.toggle('dark'); //'dark' clsss추가/제거
      toggleTheme.textContent = body.classList.contains('dark') ? '☀ 라이트 모드' : '🌙 다크 모드'; //현재 theme모드에 따라 button text전환
    });
  });
  