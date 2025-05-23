//필요한 모듈 import 
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";
import favicon from "serve-favicon";
import { saveResult, getAverageScores } from "./db.js";

const app = express(); //express.js앱 생성
const port = 7777; //서버를 실행할 port지정

//main setting
app.use(cors()); //다른 도메인에서도 요청이 가능하도록 설정
app.use(express.json()); //요청에 포함된 .json형식의 데이터 파싱

//현재 파일의 이름을 기준으로 dirname지정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//정적 파일 경로 설정
app.use(express.static(path.join(__dirname, "public"))); //정적 파일 경로를 public폴더로 지정
app.use("/assets", express.static(path.join(__dirname, "assets"))); //정적 파일 경로를 assets폴더로 지정

//파비콘 설정
app.use(favicon(path.join(__dirname, "assets", "favicon.ico")));

//index.html(main page)을 client에 전달
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

//질문 데이터를 저장(불러올)변수 생성
let questions = [];

//server.mjs가 실행될 경우, questions.json파일을 read, 메모리에 저장
(async () => {
    try {
        const questionsPath = path.join(__dirname, "questions.json");
        const questionsData = await fs.readFile(questionsPath, "utf-8");
        questions = JSON.parse(questionsData);
        console.log("질문 데이터 로드 완료");
    } catch (err) {
        console.error("질문 데이터를 불러오는 중 오류 발생:", err);
    }
})();

//질문 데이터를 요청할 경우, questions배열을 응답으로 보내줌
app.get("/questions", (req, res) => {
    res.json(questions);
});

//설문 결과를 받아 DB에 저장
app.post("/addResults", async (req, res) => {
  try {
    //요청에서 보낸 데이터 추출
    const {
      KnowledgeAndExperience,
      RiskAcceptance,
      GoalsAndDuration,
      SituationAndPossibility,
      Age,
      Gender,
      InvestorType,
      AverageScore
    } = req.body;

    //DB에 저장할 객체 지정
    const resultEntry = {
      KnowledgeAndExperience,
      RiskAcceptance,
      GoalsAndDuration,
      SituationAndPossibility,
      Age,
      Gender,
      InvestorType,
      AverageScore
    };

    await saveResult(resultEntry);
    res.status(200).json({ message: "결과 저장 완료" }); //if, 결과 저장 성공
  } catch (err) {
    console.error("결과 저장 오류:", err);
    res.status(500).json({ error: "서버 오류" }); //else, 결과 저장 실패
  }
});

app.get("/averageScores", async (req, res) => {
    try {
        const averages = await getAverageScores();
        res.json(averages);
    } catch (err) {
        console.error("평균 점수 가져오기 오류:", err); //if, 평균 데이터 가져오기 오류
        res.status(500).json({ error: "서버 오류" }); //else if, 서버 오류
    }
});

//서버가 실행되고 있는 주소-->접속을 편리하도록 함
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
