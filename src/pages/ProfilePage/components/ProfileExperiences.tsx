import PortfolioEntry from './PortfolioEntry';

export default function ProfileExperiences() {
  return (
    <section aria-labelledby="profile-projects">
      <h2
        id="profile-projects"
        className="mb-6 text-xl font-bold md:mb-8 md:text-2xl"
      >
        프로젝트
      </h2>
      <PortfolioEntry
        id="hilit"
        title="Hilit 하일릿"
        logoSrc="/profile/logos/hilit.png"
        projectLinks={{
          github: 'https://github.com/team-hilit/Hilit-Android',
          homepage: 'https://hilit.my',
          playStore:
            'https://play.google.com/store/apps/details?id=com.dminus14.app',
        }}
        period="2026년 05월 - 현재"
        team="9명 (PM 1, Android 2, iOS 2, Server 2, 디자이너 2)"
        context="IT 직무 취업 준비생 및 이직 예정자 대상 AI 모의 면접 서비스"
        role="Android 개발자"
        technologies={[
          'Jetpack Compose',
          'Kotlin Multiplatform',
          'Compose Multiplatform',
          'GitHub Actions',
          'GitHub Pages',
          'Detekt',
          'Spotless',
          'Ktlint',
          'Slack Compose Lints',
          'OkHttp3',
          'Retrofit2',
          'Navigation3',
          'Gradle Convention Plugin',
          'KSP',
        ]}
        achievements={[
          'YAPP 제28기 데모데이 우수상 수상',
          'Android 앱 ONEstore 및 Play 스토어 출시',
        ]}
        contributions={[
          {
            title: '웹 카탈로그로 디자이너의 디자인 시스템 확인과 피드백 개선',
            problem:
              'Android 디자인 시스템 개발 결과를 디자이너가 빠르게 확인하고 피드백하기 어려웠습니다.',
            action:
              'React의 Storybook 경험을 바탕으로 Compose Multiplatform 웹 카탈로그를 개발했습니다. 디자인 시스템을 KMP 모듈로 구성해 앱과 카탈로그가 공유하도록 했습니다. @Catalog 어노테이션과 KSP로 Story별 입력 필드를 자동 생성하고, 사용자가 값을 조작하며 컴포넌트를 확인하도록 구성했습니다. GitHub Actions와 GitHub Pages로 빌드·배포를 자동화하고, 에이전트가 따를 카탈로그 작성 지침도 마련했습니다.',
            result:
              'PR 생성·병합 시 변경 사항이 카탈로그에 반영되어 디자이너가 기기와 OS에 관계없이 웹에서 확인하고 피드백할 수 있게 했습니다. 디자인 시스템의 Android Native API 의존성을 제거하고 앱과 카탈로그에서 같은 코드를 재사용하도록 개선했습니다.',
          },
          {
            title:
              '작업별 문서 선택과 공통 워크플로로 에이전트 지침 유지보수 개선',
            problem:
              '단일 ARCHITECTURE.md가 1,000줄을 넘어서면서 작업과 무관한 지침까지 읽는 데 따른 토큰 소모와 컨텍스트 오염이 우려되었습니다.',
            action:
              'ARCHITECTURE.md를 세부 문서로 이어지는 진입점으로 바꾸고, UI·카탈로그·컨벤션 플러그인·모듈 추가 지침을 분리했습니다. AGENTS.md를 에이전트 진입점으로 두고 문서 우선순위를 정리했으며, Codex와 Claude의 스킬 진입점이 공통 워크플로 문서를 참조하도록 구성했습니다.',
            result:
              '작업에 필요한 지침만 선택적으로 읽는 구조를 마련했습니다. 스킬 변경 사항은 공통 워크플로 문서 한 곳에서 관리하도록 바꾸었습니다.',
          },
        ]}
        evidenceLinks={[
          {
            label: '디자인 시스템 카탈로그 코드',
            url: 'https://github.com/Team-Hilit/Hilit-Android/tree/develop/catalog',
          },
          {
            label: '에이전트 지침 문서 체계',
            url: 'https://github.com/Team-Hilit/Hilit-Android/tree/develop/docs',
          },
        ]}
      />
      <PortfolioEntry
        id="consensus"
        title="Consensus 컨센서스"
        projectLinks={{
          github: 'https://github.com/i-meant-to-be/cau-spd-consensus-fe',
        }}
        period="2025년 09월 - 2026년 02월"
        team="1명 (기획·Android 1)"
        context="완전 동형 암호(FHE) 기반 기밀성 보장 투표 서비스"
        role="기획, Android 개발자"
        technologies={[
          'Jetpack Compose',
          'GitHub Actions',
          'OkHttp3',
          'Retrofit2',
          'Navigation2',
          'Microsoft SEAL',
          'NDK',
        ]}
        contributions={[
          {
            title: '병렬 처리 벤치마킹을 통한 FHE 곱셈 연산 시간 단축',
            problem:
              'Microsoft SEAL을 사용하는 FHE 곱셈 연산의 부하가 커서 연산 시간을 줄일 필요가 있었습니다.',
            action:
              '스레드 수와 병렬 처리 환경을 조작 변인으로 두고 10가지 조건을 비교했습니다. Kotlin Coroutines, Java ExecutorService, C++ thread를 후보로 선정해 벤치마킹 테스트를 설계했습니다.',
            result:
              '비교 조건 중 가장 느린 경우는 47초, 가장 빠른 C++ 10스레드는 10.7초였습니다. Kotlin 10스레드도 11초로 비슷한 성능을 보여, Android Studio에서의 테스트 용이성을 고려해 Kotlin 방식을 최종 적용했습니다.',
            verification:
              '벤치마킹에서 병렬 처리 환경과 스레드 수에 따른 결과를 비교했습니다. 10.7초는 C++ 측정값이며, 최종 적용한 Kotlin 조건의 측정값은 11초입니다.',
          },
        ]}
        evidenceLinks={[
          {
            label: 'FHE 연산 벤치마킹 코드',
            url: 'https://github.com/i-meant-to-be/cau-spd-consensus-fe/blob/develop/app/src/main/cpp/JNIBenchmark.cpp',
          },
        ]}
      />
      <PortfolioEntry
        id="debate-timer"
        title="Debate Timer 디베이트 타이머"
        logoSrc="/profile/logos/debate-timer.png"
        projectLinks={{
          github: 'https://github.com/debate-timer/debate-timer-fe',
          homepage: 'https://www.debate-timer.com',
        }}
        period="2024년 12월 - 현재"
        team="9명 (React 5, Server 3, 디자이너 1)"
        context="토론 대회용 타이머 서비스"
        role="React 개발자"
        technologies={[
          'React',
          'Storybook',
          'TanStack Query',
          'axios',
          'Tailwind CSS',
          'Vite',
          'Vitest',
          'Electron',
          'Tauri',
        ]}
        achievements={[
          '경희대·고려대 등 대학 토론 동아리와 협력하여 사용자 테스트 진행',
          '중앙선거방송토론위원회에 2025년·2026년 2년 연속 제품 납품',
        ]}
        contributions={[
          {
            title: '오프라인 Windows 환경 지원과 배포 파일 크기 절감',
            problem:
              '고객이 웹 기반 서비스를 오프라인 Windows 환경에서도 사용할 수 있도록 요청했습니다. 초기에는 사용할 장비의 성능을 알 수 없었습니다.',
            action:
              '1년차에는 Windows 7 호환성을 고려해 Electron을 채택했습니다. 장비 환경을 확인한 뒤 2년차에는 Tauri도 추가로 채택했습니다. 데이터 소스 인터페이스를 추상화해 Electron·Tauri 백엔드와 UI를 분리하고 기존 React UI를 재사용했습니다.',
            result:
              '기존 웹 UI를 재사용하면서 오프라인 Windows 실행을 지원했습니다. Electron 바이너리 대비 Tauri 바이너리의 파일 크기를 90% 이상 줄였습니다.',
          },
        ]}
        evidenceLinks={[
          {
            label: 'Windows 포팅 저장소',
            url: 'https://github.com/debate-timer/debate-timer-fe-win',
          },
        ]}
      />
    </section>
  );
}
