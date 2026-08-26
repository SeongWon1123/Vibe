import Mark from './Mark.jsx'
import Scene from './Scene.jsx'

export default function Intro({ onPick, onBrowse }) {
  return (
    <div className="screen bare">
      <div className="intro">
        <Scene variant="full" />
        <div className="intro-top">
          <Mark glass light />
          <h1>
            4학년이 되어서야
            <br />
            알게 되는 것들,
            <br />
            1학년부터 같이 봐요
          </h1>
          <div className="sub">
            같은 질문에도 학년·이수과목·목표에 따라
            <br />
            다른 답을 주는 국립순천대 AI 학사 선배
          </div>
        </div>
        <div className="intro-bottom">
          <button type="button" className="btn-ghost" onClick={onBrowse}>
            1학년의 나로 둘러보기
          </button>
          <button type="button" className="btn-solid" onClick={onPick}>
            내 학년 고르고 시작하기
          </button>
          <div className="foot">
            데모는 가상 학생 최성원의 1~4학년으로 동작해요
            <br />
            국립순천대학교 인공지능공학부 · 바이브코딩 경진대회 출품작
          </div>
        </div>
      </div>
    </div>
  )
}
