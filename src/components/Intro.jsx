import Mark from './Mark.jsx'
import Scene from './Scene.jsx'

export default function Intro({ onboarded, onStart, onContinue }) {
  return (
    <div className="screen bare">
      <div className="intro">
        <Scene variant="full" />
        <div className="intro-top">
          <Mark glass light />
          <h1>
            1학년의 관심사부터
            <br />
            4학년의 포트폴리오까지
          </h1>
          <div className="sub">
            내 성향과 관심을 학기마다 알아가며
            <br />
            지금 해야 할 한 걸음을 알려주는 AI 학사 메이트
          </div>
        </div>
        <div className="intro-bottom">
          {onboarded && (
            <button type="button" className="btn-ghost" onClick={onContinue}>
              이어서 보기
            </button>
          )}
          <button type="button" className="btn-solid" onClick={onStart}>
            {onboarded ? '처음부터 다시 설정' : '시작하기'}
          </button>
          <div className="foot">
            학년·관심·학점·시간표는 내 폰에만 저장돼요
            <br />
            국립순천대학교 인공지능공학부 · 바이브코딩 경진대회 출품작
          </div>
        </div>
      </div>
    </div>
  )
}
