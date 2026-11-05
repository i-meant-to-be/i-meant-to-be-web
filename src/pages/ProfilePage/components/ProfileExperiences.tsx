import type { ComponentProps } from 'react';
import PortfolioEntry from './PortfolioEntry';

const projects: ComponentProps<typeof PortfolioEntry>[] = [
  {
    id: 'hilit',
    title: 'Hilit 하일릿',
    logoSrc: '/profile/logos/hilit.png',
    projectLinks: {
      github: 'https://github.com/team-hilit/Hilit-Android',
      homepage: 'https://hilit.my',
      playStore:
        'https://play.google.com/store/apps/details?id=com.dminus14.app',
    },
    period: '2026년 05월 - 현재',
    formFactors: ['Android'],
    team: '9명 (PM 1, Android 2, iOS 2, Server 2, 디자이너 2)',
    context: 'IT 직무 취업 준비생 및 이직 예정자 대상 AI 모의 면접 서비스',
    summary:
      'Android 개발자로 참여하여, 멀티 모듈 아키텍처 구조 기반을 마련하고 MVI 기반 코드를 개선하였으며, Compose Multiplatform 기반 웹 카탈로그를 도입해 디자이너와의 협업 경험을 개선했습니다.',
    technologies: ['Kotlin Multiplatform', 'Compose Multiplatform', 'KSP'],
    achievements: [
      'YAPP 제28기 데모데이 우수상 수상',
      'Android 앱 ONEstore 및 Play 스토어 출시',
    ],
    contributions: [
      {
        title: '웹 카탈로그로 디자이너와의 피드백 경험 개선',
        description:
          'React의 Storybook 경험을 바탕으로 **Compose Multiplatform 웹 카탈로그**를 개발했습니다.\n\n디자인 시스템을 KMP 모듈로 구성해 웹 빌드 기반을 마련했고, 디자이너가 값을 조작하며 테스트할 수 있게 KSP로 Story별 입력 필드를 자동 생성하도록 했습니다. GitHub Actions와 GitHub Pages로 빌드·배포를 자동화하고, 에이전트가 따를 카탈로그 작성 지침도 마련했습니다.\n\n디자이너가 기기와 OS에 관계없이 웹에서 빠르게 피드백할 수 있게 되었고, 디자인 시스템은 KMP 모듈로 구성되어 Android Native API 의존성이 제거되었으며 앱과 카탈로그에서도 재사용할 수 있었습니다.',
        evidenceLinks: [
          {
            title: '카탈로그 웹 페이지',
            url: 'https://team-hilit.github.io/Hilit-Android/',
          },
          {
            title: '카탈로그 코드',
            url: 'https://github.com/Team-Hilit/Hilit-Android/tree/develop/catalog',
          },
          {
            title: '블로그 포스트',
            url: '/post/0015-react-storybook-in-android',
          },
        ],
      },
      {
        title: 'ViewModel 책임 분리와 상태 변경 경로 통일',
        description:
          '인터뷰 화면의 ViewModel에서 **이벤트 처리와 상태 계산 책임을 분리**했습니다. ViewModel 파일은 1,262줄에서 218줄로 약 83% 줄었으며, 처리 로직은 Handler와 Reducer로 옮겼습니다.\n\n기능이 복잡하여 매우 많았던 인텐트를 하위 구분에 따라 묶어 별도 Handler로 분리하고, 상태 계산은 순수 Reducer로 모았습니다. 뷰 모델은 입력을 받아 Handler를 연결하는 역할에 집중하도록 구성했고, 작업은 ViewModel 종료 시 함께 취소되도록 했습니다.\n\n같은 방식을 일부 복잡한 다른 화면에도 적용하고, 전체 뷰 모델의 상태 변경 경로를 통일했습니다.',
        evidenceLinks: [
          {
            title: 'ViewModel 책임 분리 PR',
            url: 'https://github.com/Team-Hilit/Hilit-Android/pull/218',
          },
        ],
      },
      {
        title: '작업별 문서 선택과 공통 워크플로로 에이전트 지침 유지보수 개선',
        description:
          '1,000줄이 넘었던 단일 ARCHITECTURE.md를 도메인별로 나누어 불필요한 토큰 소모와 컨텍스트 오염의 영향을 줄였습니다.\n\n기존 ARCHITECTURE.md는 세부 문서로 이어지는 진입점으로 바꿨고, **UI·카탈로그·컨벤션 플러그인·모듈 추가 지침을 분리**했습니다. AGENTS.md를 에이전트 진입점으로 두고 문서 우선순위를 정리했고, Codex와 Claude의 스킬 진입점이 공통 워크플로 문서를 참조하도록 구성했습니다.\n\n에이전트는 작업에 필요한 지침만 선택적으로 읽게 됐고, 스킬 변경 사항은 에이전트마다 총 2번 반영하는 대신 공통 워크플로 문서 하나만 바꾸면 되어 개발자가 할 일도 줄었습니다.',
        evidenceLinks: [
          {
            title: '에이전트 지침 문서 체계',
            url: 'https://github.com/Team-Hilit/Hilit-Android/tree/develop/docs',
          },
        ],
      },
    ],
  },
  {
    id: 'consensus',
    title: 'Consensus 컨센서스',
    projectLinks: {
      github: 'https://github.com/i-meant-to-be/cau-spd-consensus-fe',
    },
    period: '2025년 09월 - 2026년 02월',
    formFactors: ['Android'],
    team: '1명 (기획 및 Android 1)',
    context: '완전 동형 암호(FHE) 기반 기밀성 보장 투표 서비스',
    summary:
      'Android 투표 서비스를 기획 및 개발하고, 프로젝트 종료 후 FHE 곱셈 연산의 병렬 처리 성능을 추가로 실험했습니다.',
    technologies: ['Microsoft SEAL', 'NDK'],
    achievements: ['대학 보안프로젝트 강의 A+'],
    contributions: [
      {
        title: '병렬 처리 벤치마킹을 통한 FHE 곱셈 연산 시간 단축',
        description:
          '병렬 처리로 FHE 곱셈 100회 실행 시간을 **약 76% (46.8초 → 11.1초)** 단축했습니다. Galaxy S24+에서 C++ 단일 스레드와 Kotlin 전용 스레드 풀 10스레드를 비교한 결과입니다.\n\n다수의 행렬 곱 연산을 수반하는 FHE 곱셈 연산 성능을 개선하기 위해, 스레드 수와 병렬 처리 환경을 조작 변인으로 두고 10가지 조건을 비교했습니다. Kotlin의 전용 스레드 풀·`Dispatchers.IO`·`Dispatchers.Default`와 C++ `thread`를 대상으로 벤치마킹 테스트를 설계했습니다.\n\nC++ 10스레드는 10.9초, Kotlin 전용 스레드 풀 10스레드는 11.1초였습니다. 성능이 비슷한 두 방식 중 Android Studio에서 디버깅과 테스트가 쉬운 Kotlin 방식을 유리한 선택으로 판단했습니다.',
        evidenceLinks: [
          {
            title: 'FHE 연산 벤치마킹 코드',
            url: 'https://github.com/i-meant-to-be/cau-spd-consensus-fe/blob/develop/app/src/main/cpp/JNIBenchmark.cpp',
          },
          {
            title: '블로그 포스트',
            url: '/post/0007-kotlin-dispatchers-c-thread-deathmatch',
          },
        ],
      },
    ],
  },
  {
    id: 'debate-timer',
    title: 'Debate Timer 디베이트 타이머',
    logoSrc: '/profile/logos/debate-timer.png',
    projectLinks: {
      github: 'https://github.com/debate-timer/debate-timer-fe',
      homepage: 'https://www.debate-timer.com',
    },
    period: '2024년 12월 - 현재',
    formFactors: ['Web'],
    team: '9명 (React 5, Server 3, 디자이너 1)',
    context: '토론 대회용 타이머 서비스',
    summary:
      'React에 기반을 둔 프로덕트 개발자로 참여하여, UI와 여러 핵심 기능을 기획하고 개발하였습니다.',
    technologies: ['Storybook', 'Electron', 'Tauri'],
    achievements: [
      '경희대 이감·고려대 고란도란 등 대학 토론 동아리와 협력하여 사용자 테스트 진행',
      '중앙선거방송토론위원회에 2025년·2026년 2년 연속 제품 납품',
    ],
    contributions: [
      {
        title: '오프라인 Windows 환경 지원과 배포 파일 크기 절감',
        description:
          '고객 요청에 따라 웹 기반 서비스를 오프라인 Windows 환경에서도 사용할 수 있게 포팅했습니다.\n\n저사양 환경을 고려하여 레거시 Electron 버전과 최신 Windows를 타겟으로 하는 Tauri 기반 버전을 둘 다 마련했고, 데이터 소스 인터페이스를 추상화해 Electron·Tauri 백엔드와 UI를 분리함으로써 **기존 React UI를 재사용**할 수 있는 환경을 마련했습니다.\n\nElectron 바이너리 대비 Tauri 바이너리의 파일 크기는 90% 이상 줄었습니다.',
        evidenceLinks: [
          {
            title: 'Windows 포팅 저장소',
            url: 'https://github.com/debate-timer/debate-timer-fe-win',
          },
        ],
      },
      {
        title: '타이머 정확도 개선',
        description:
          '타이머 로직을 목표 시간 기반 방식으로 변경하여, **콜백 실행 지연이 남은 시간 계산에 누적되지 않도록 개선**했습니다.\n\n브라우저의 타이머 콜백은 메인 스레드의 다른 작업이나 실행 환경에 따라 예약한 간격보다 늦게 실행될 수 있습니다. 그래서 타이머 시작 시 언제 종료되어야 하는지를 계산하고, 이 시간을 목표 시간으로 하여 목표 시간까지 남은 시간을 주기적으로 갱신하도록 로직을 수정했습니다.\n\n콜백마다 일정 시간을 차감하던 방식의 누적 오차를 줄였습니다. 화면 갱신 자체의 지연을 고려해도 정확한 종료 시간을 계산할 수 있게 됐습니다.',
        evidenceLinks: [
          {
            title: '타이머 로직 개선 PR',
            url: 'https://github.com/debate-timer/debate-timer-fe/pull/334#issuecomment-3125833882',
          },
        ],
      },
    ],
  },
];

export default function ProfileExperiences() {
  return (
    <section aria-labelledby="profile-projects">
      <h2
        id="profile-projects"
        className="mb-6 text-xl font-bold md:mb-8 md:text-2xl"
      >
        프로젝트
      </h2>
      {projects.map((project, index) => (
        <PortfolioEntry key={project.id} {...project} projectIndex={index} />
      ))}
    </section>
  );
}
