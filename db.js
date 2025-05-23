//MongoDB client import
import { MongoClient } from "mongodb";
import dotenv from "dotenv"; //환경 변수 설정을 위한 dotenv사용
dotenv.config(); //.env(환경변수파일) 로드

//환경 변수 파일에서 MongoDB 접속 URL가져옴
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri); //MongoDB Client instance생성
let db;

async function connectDB() {
  if (!db) {
    try {
      await client.connect();
      db = client.db("Survay_data"); //DB접속
    } catch (err) {
      console.error("MongoDB 연결 실패:", err); //if, DB접속 실패 
      throw err;
    }
  }
  return db;
}

export async function saveResult(result) {
  try {
    const db = await connectDB();
    const collection = db.collection("User_response_data"); //Colletion선택 
    await collection.insertOne(result);
    console.log("저장 성공"); //if, 저장 성공
  } catch (err) {
    console.error("저장 실패:", err); //else, 저장 실패, 오류 메시지와 함께 반환
  }
}

//모든 응답데이터의 평균 점수 계산 
export async function getAverageScores() { 
  try {
    const db = await connectDB();
    const collection = db.collection("User_response_data");

    //항목별로 평균 점수를 계산하는 MongoDB pipeline구축
    const pipeline = [
      {
        $group: {
          _id: null,
          avgKnowledgeAndExperience: { $avg: "$KnowledgeAndExperience" },
          avgRiskAcceptance: { $avg: "$RiskAcceptance" },
          avgGoalsAndDuration: { $avg: "$GoalsAndDuration" },
          avgSituationAndPossibility: { $avg: "$SituationAndPossibility" }
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    return result[0] || {}; //결과가 존재하지 않을 경우 빈 겍체 반환
  } catch (err) {
    console.error("평균 점수 계산 실패:", err); //if, 저장을 실패할경우
    return {};
  }
}

