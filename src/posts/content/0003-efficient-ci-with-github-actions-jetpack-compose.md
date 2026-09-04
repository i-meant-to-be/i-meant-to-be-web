---
title: 효율적인 Android CI 구축 w/ GitHub Actions - Jetpack Compose
description: 캐싱과 함께 CI 시간 쌀먹하기
date: 2025-08-04
category: 개발
tags: [ci, github actions, jetpack compose, 캐싱]
---

## 들어가기
### 배경
보통 프로젝트를 위해 GitHub 저장소를 파면 가장 먼저 하는 것들 중 하나가 (언어나 프레임워크 상관 없이) CI 스크립트를 올리는 것이다. 그런데, React 등 웹 기반 FE 프레임워크랑은 다르게 Android는 CI 돌릴 때 시간이 너무 오래 걸린다. 특히나, Android의 경우 Android 내부 바이너리에 있는 기능을 사용할 경우, 에뮬레이터까지 돌려줘야 해서 훨씬 더 비용이 많이 들게 된다.

따라서, 개발자의 정신 건강과 효율적이고 신속한 개발 템포를 위해서라면, CI 스크립트를 효율적으로 짤 필요가 있다. 이를 위해 나는 GitHub Actions에서 기본으로 제공하는 'actions/cache'를 사용하기로 했다.

### 'actions/cache'에 대해
#### 동작 방식
해당 공식 문서에 나온 동작 방식을 요약하면 아래와 같다:

- 캐시 키를 하나 지정한다.
- GitHub Actions 스크립트에서 지정한 캐시 키를 호출한다.
- 캐시 상태에 따라...
  - Hit일 경우, GitHub의 캐시 저장소에 있던 캐시를 불러온다.
  - Fail일 경우, 일단 남은 작업을 진행하고, 작업 후 Post 단계에서 현재 러너에 저장된 파일을 GitHub 캐시 저장소에 올린다.

### 어떻게 효율성을 달성하는가?
#### 문제 상황
보통 Android CI 스크립트에서 AVD를 돌린다면 아래와 같은 준비 절차가 필요하다:

1. Android 시스템 이미지를 다운받는다.
2. 전체 시스템 이미지를 불러온다.
3. VM을 초기화한다.
4. 부팅을 진행한다. 이 과정에서 부팅에 필요한 스크립트와 프로세스가 전부 올라와야 한다.
5. 홈 스크린이 뜨고 시스템이 안정될 때까지 기다린다.

일단 1번부터 오래 걸린다. 시스템 이미지가 기본 GB 단위이기 때문이다. 여기에 더해, 안 그래도 다운로드에도 시간이 오래 걸리는데, 부팅도 콜드 부팅이다. 부팅도 당연히 오래 걸릴 수밖에 없다. 오래 걸리는 일이 2개니까 당연히 느리고, 만약 CI가 자주 실행되는 환경이라면 이로 인해 잡아먹하는 시간이 점점 많이 늘어나게 될 것이다.

#### 해결 방법
'actions/cache'는 이러한 시간 낭비를 해결할 수 있게 해 준다. ***시간이 많이 걸리거나 용량이 커서 다운로드에 오랜 시간이 필요한 파일***을 캐싱하여, 2번째 실행부터는 해당 준비 과정을 최대한 생략할 수 있기 때문이다. 'actions/cache'를 통해 우리는 다음 2가지 파일을 캐싱할 수 있다:
- 시스템 이미지 → 다운로드 시간 절약
- OS 스냅샷 → 부팅 시간 절약

먼저, 시스템 이미지를 캐시 저장소에서 바로 가져오면 되므로 다운로드 시간이 크게 줄어든다.

중요한 건 다음인데, AVD는 2번째 실행부터는 스냅샷을 불러와 사용하기 때문에, 콜드 부팅을 할 필요가 없어 부팅 시간도 크게 줄어든다. AVD의 스냅샷은 ***특정 시점에서 CPU, GPU, RAM, 저장소와 실행되는 중이었던 프로세스나 앱의 상태를 캡쳐해 저장해 둔 것***을 의미한다. 예를 들어, 내가 오후 3시 20분에 AVD의 상태를 스냅샷으로 떠 두었다면, 다음부터 부팅할 때에는 오후 3시 20분의 상태가 그대로 복원되는 거다. 단순히 특정 시점의 상태를 그대로 복원하면 가상 머신을 그대로 사용할 수 있으므로, 부팅과 애플리케이션이 시작되기를 기다릴 필요가 없다. 부팅에 필요한 시간이 크게 줄어들게 되는 것이다.

## 구현
### gradle-wrapper.jar 업로드
본격적으로 CI 스크립트를 확인하기 전에 먼저 해야 할 일이 있다. .gitignore 파일에서 gradle-wrapper.jar 파일을 제외하는 것이다. 보통은 .jar 파일은 바이너리라서 GitHub 저장소에 올리지 않는데, 이 파일만은 빌드 및 테스트에 사용하는 Gradle을 돌리기 위해 반드시 필요하다. 따라서, 저장소에서 `*.jar`로 모든 .jar 파일의 커밋을 막고 있다면, gradle-wrapper.jar만 예외로 넣어주자.

이 파일이 있어야, GitHub Actions 러너가 Gradle을 돌릴 수 있다. 

### CI 스크립트
#### 요약
내가 작성한 CI 스크립트는 아래 순서대로 진행된다. 이 중, 중요하지 않은 부분은 생략하고 언급할 내용이 있는 부분만 설명을 남겨두겠다.
- GitHub 저장소의 코드 불러오기
- Java 준비
- Gradle 준비
- gradlew에 실행 권한 부여
- KVM 활성화 
- 캐시 확인
- 가상 머신 스냅샷 생성
- 계측 테스트(instrumental test) 진행
- 린팅, 단위 테스트, 빌드 진행
- (선택) 린팅 결과물을 아티팩트로 업로드
- (선택) 빌드 결과물인 .apk 파일을 아티팩트로 업로드

#### KVM 활성화
```yaml
- name: Enable KVM
  run: |
    echo 'KERNEL=="kvm", GROUP="kvm", MODE="0666"' | sudo tee /etc/udev/rules.d/99-kvm.rules
    sudo udevadm control --reload-rules
    sudo udevadm trigger
```

KVM은 Kernel-based Virtual Machine의 약자이다. 이 옵션은 하드웨어의 가상화 지원 기술(Inter의 VT-x 등)을 활성화하기 때문에, 가상 머신 성능 향상에 큰 도움을 준다. 이 부분도 결국은 테스트 시간을 줄일 수 있게 도와주므로, 집어넣도록 하자.

#### 캐시 확인 및 스냅샷 준비
```yaml
- name: AVD cache
  uses: actions/cache@v4
  id: avd-cache # Specify a unique GitHub Actions ID for the cache
  with:
    path: |
      ~/.android/avd/*
      ~/.android/adb*
    key: avd-33
    
- name: Create AVD and generate snapshot for caching
  if: steps.avd-cache.outputs.cache-hit != 'true'
  uses: reactivecircus/android-emulator-runner@v2
  with:
    # 생략...
```

가장 중요한 부분이다. 이상의 2개 단계 중 1번째인 'AVD cache' 단계는 `avd-33`이라는 키를 가진 캐시가 GitHub 캐시 저장소에 존재하는지 여부를 확인한다. (`avd-cache`는 캐시를 식별하기 위한 키가 아니라, 다음 단계에서 캐싱 성공 여부를 확인하기 위해 사용하는 GitHub Actions 전용 변수다. 헷갈리지 말자.) 이 부분에 따라 이후 스크립트가 어떤 일을 하는지가 조금 달라진다. 자세히 알아보자:

##### 캐시 히트 성공 시
- 단계 'AVD cache'에서 `avd-33` 캐시가 있는지를 확인한다.
- 히트 시, 저장된 캐시를 그대로 불러온다.
- 단계 'Create AVD and generate snapshot for caching'에서 `steps.avd-cache.outputs.cache-hit`가 `true`인지를 확인한다.
- 캐시가 히트되어 캐싱된 파일을 불러왔으므로 값은 `true`, 전체 조건식은 `false`이다. 따라서 이 단계를 생략한다.

요약하면, 캐싱 성공 시 캐시 저장소에서 시스템 이미지와 스냅샷을 가져온다. 그리고 다음 단계인 스냅샷 준비 단계 자체를 그냥 생략해버린다. 그러므로 빠른 시간 내에 CI를 위한 준비를 마칠 수 있는 것이다.

##### 캐시 히트 실패 시
- 단계 'AVD cache'에서 `avd-33` 캐시가 있는지를 확인한다.
- 실패 시, 다음 단계로 넘어간다.
- 단계 'Create AVD and generate snapshot for caching'에서 `steps.avd-cache.outputs.cache-hit`가 `true`인지를 확인한다.
- 캐시 히트가 실패하였으므로 값은 `false`, 전체 조건식은 `true`이다. 따라서 이 단계를 진행하여, 시스템 이미지로부터 부팅 후 스냅샷을 생성한다.
- 남은 단계를 마저 진행한다.
- CI 스크립트 가장 마지막의 `Post AVD cache` 단계에서, 지정된 `path`에 있는 파일들을 캐시 키 `avd-33`과 함께 캐시 저장소로 업로드한다.

요약하면, 캐싱 실패 시에는 일단 Android 시스템을 콜드 부팅하고 스냅샷을 만들어 테스트를 진행한다. 그리고, 오직 테스트를 실패했을 때에만 캐시 저장소에 캐시를 업로드한다. 이 때 업로드할 파일을 `path`에 지정해줄 수 있다. 이 CI 스크립트에서는 AVD 관련 파일과 스냅샷이 담긴 ' ~/.android/avd/\*' 그리고 Android 디버그 툴이 담긴 '~/.android/adb\*'를 캐시 저장소에 업로드하하게 된다.

이렇게 캐싱 여부에 따라 적절한 스냅샷을 준비한 후, 준비된 스냅샷 하에서 Android 바이너리 기능이 필요한 계측 테스트(instrumented test) - src/androidTest에 존재하는 테스트 - 를 진행하게 된다. 

#### ADV가 필요 없는 나머지 작업 진행
```yaml
- name: Run unit tests, lint check and build
  run: ./gradlew --no-daemon --stacktrace --continue test lintDebug assembleDebug
```

마지막으로 Android 바이너리가 필요하지 않은 나머지 작업을 AVD 없이 진행한다. 이 과정에서는 아래 작업들이 진행된다:

- Android 바이너리가 필요 없는 단위 테스트 (src/test에 위치)
- 린팅 오류 확인
- 빌드

#### 전체 스크립트
이 과정을 통해 완성된 스크립트는 아래와 같다:

```yaml
name: Android CI

on:
  push:
    branches:
      - develop
  pull_request:
    branches:
      - develop

jobs:
  build_and_test:
    name: build_and_test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v4

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Enable KVM
        run: |
          echo 'KERNEL=="kvm", GROUP="kvm", MODE="0666"' | sudo tee /etc/udev/rules.d/99-kvm.rules
          sudo udevadm control --reload-rules
          sudo udevadm trigger

      - name: AVD cache
        uses: actions/cache@v4
        id: avd-cache # Specify a unique GitHub Actions ID for the cache
        with:
          path: |
            ~/.android/avd/*
            ~/.android/adb*
          key: avd-33

      - name: Create AVD and generate snapshot for caching
        if: steps.avd-cache.outputs.cache-hit != 'true'
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 33
          arch: x86_64
          force-avd-creation: false
          emulator-options: -no-window -gpu swiftshader_indirect -noaudio -no-boot-anim
          disable-animations: false
          script: echo "Generated AVD snapshot for caching."

      - name: Run instrumented tests from snapshot
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 33
          arch: x86_64
          force-avd-creation: false
          emulator-options: -no-snapshot-save -no-window -gpu swiftshader_indirect -noaudio -no-boot-anim
          script: ./gradlew --no-daemon --stacktrace --continue connectedAndroidTest

      - name: Run unit tests, lint check and build
        run: ./gradlew --no-daemon --stacktrace --continue test lintDebug assembleDebug

      - name: Upload lint report artifact
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: lint-report
          path: app/build/reports/lint-results-debug.html
```


## 결론
나는 'actions/cache'를 사용한 GitHub Actions CI 스크립트를 통해 다음 2가지에 필요한 시간을 크게 절약할 수 있었다:
- 시스템 이미지 다운로드
- AVD 콜드 부팅

내가 이 CI 스크립트를 적용한 저장소는 현재로서는 혼자 개발하기 때문에 그렇게 크게 체감되진 않겠지만, 만약 여러 사람이 개발하는 저장소라면 시간 절약 효과를 톡톡히 볼 수 있을 것이라 생각한다.

## 참고 문헌
- [Android Snapshot - Android Developers](https://developer.android.com/studio/run/emulator-snapshots?hl=ko)
- [actions/cache - GitHub Actions](https://github.com/actions/cache)
- [ReactiveCircus/android-emulator-runner - GitHub Actions](https://github.com/ReactiveCircus/android-emulator-runner?tab=readme-ov-file#usage--examples)
- [Dependency caching reference - GitHub Docs](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching)