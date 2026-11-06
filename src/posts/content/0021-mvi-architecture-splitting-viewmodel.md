---
title: "MVI 아키텍처 개선: 비대해진 뷰 모델 쪼개기 (2/3)"
description: 생각 없이 질러 둔 코드 뒷수습하기
date: 2026-11-06
category: 개발
tags: [Android, Kotlin, JetpackCompose, MVI, 아키텍처]
---

## 배경

[이전 포스트](/post/0020-mvi-architecture-overview)에서 MVI 아키텍처가 어떤 요소들로 구성되는지에 대해 알아보았다. 이제는 [실제 프로젝트 PR](https://github.com/Team-Hilit/Hilit-Android/pull/218)에서 MVI 아키텍처를 어떻게 개선했는지에 대해 설명하겠다.

## 문제

문제는 서비스의 핵심 기능인 면접 화면의 뷰 모델에서 발생했다.

[개선 전 커밋](https://github.com/Team-Hilit/Hilit-Android/tree/7f34d82073b7bcaa1ee1fb6bdfa25fcd65f9b8e4) 기준, 면접 화면의 인텐트 48개를 처리하는 코드가 뷰 모델 파일 하나에 전부 모여 있었다. 덕분에 코드가 1,000줄을 넘으면서 변경과 오류 추적이 어려웠다. 서로 다른 책임과 작업 수명이 한 클래스에 집중되어 있었고, 상태 변경 규칙은 여러 멤버 함수 곳곳에 흩어져 있었다. 이로 인해 발생한 문제를 크게 3가지 차원에서 나누어 살펴보자.

### 책임 경계가 명확히 드러나지 않음

먼저, 뷰 모델 내 멤버 변수와 함수들이 **어떤 책임을 위해 기여하는지**를 명확히 파악할 수 없었다.

거시적인 관점에서 보면 모든 인텐트와 함수, 변수가 면접 기능이라는 하나의 목적을 위해 모인 건 맞았다. 그러나 세부적으로는 장치 준비, 질문 진행, 답변 제출, 복구, 면접 마무리 등 서로 다른 책임으로 나뉘었다. 각 책임에 필요한 함수와 실행 변수가 한 클래스에 모여 있어, 특정 코드를 변경할 때 함께 확인해야 하는 범위를 좁히기 어려웠다.

결론적으로 아래 2가지 사항을 명확히 파악할 수 없었다고 요약할 수 있을 것 같다:

- 각 함수와 실행 변수가 담당하는 책임
- 해당 책임을 변경할 때 함께 살펴봐야 하는 코드 범위

### 상태 변경이 여러 로직에 분산됨

**UI 상태를 갱신하는 함수가 코드 내 여러 멤버 함수에 분산**되어 어떤 함수가 상태를 갱신하는지를 즉시 판단하기 어려웠다.

[코드](https://github.com/Team-Hilit/Hilit-Android/blob/7f34d82073b7bcaa1ee1fb6bdfa25fcd65f9b8e4/core/common/src/main/kotlin/com/dminus14/app/core/common/mvi/MviViewModel.kt)를 살펴보자:

```kotlin
// 뷰 모델 추상 클래스
abstract class MviViewModel<I : MviIntent, S : MviState, E : MviEffect>(
    initialState: S,
) : ViewModel() {
    protected fun reduce(reducer: S.() -> S) {
        _state.update(reducer)
    }
}

// 뷰 모델에서 상태 갱신
class InterviewViewModel
    @Inject
    constructor(
        // 생성자 매개변수 생략
    ) : MviViewModel<InterviewIntent, InterviewState, InterviewEffect>(InterviewState()) {
        // 멤버 변수

        // 상태를 갱신하는 함수
        private fun updateSomeState() {
            reduce {
                copy(
                    screenState = InterviewScreenState.ANSWER_SUBMITTING,
                    isRequestInFlight = true,
                )
            }
        }
    }

```

위 코드처럼 상태 갱신은 공통 `reduce()` 함수를 통했지만, 어떤 값을 어떤 조건에서 바꿀지는 각 호출부의 람다 함수에 직접 작성되어 있었다. 즉, 상태 갱신 API는 통일되어 있었으나 상태 계산 규칙은 여러 처리 함수에 분산되어 있었다.

특정 상태가 언제, 왜 바뀌는지 확인하려면 여러 함수의 `reduce` 호출과 그 주변 작업 흐름을 함께 읽어야 했다. 또한 상태 변경 사유가 별도의 타입으로 표현되지 않아, 변경의 의미를 주변 코드에서 해석해야 했다.

### 비동기 작업의 수명과 실행 순서가 얽힘

이 문제는 앞에서 짚었던, 하나의 목적을 위해 여러 하위 책임이 협력한다는 점에서 발생한다. 여러 하위 책임은 **정해진 순서에 따라 협력**하는데, **이 흐름이 코드에서는 명확히 드러나지 않고 있던 게 문제**였다.

코드에서 질문 및 답변 처리 코드와 면접 종료 처리 코드가 협력하는 것이 대표적인 사례다. 면접 종료 처리 코드는 진행 중이던 제출이 정상적으로 다음 질문을 반환하면, 보류된 종료 요청을 확인한다. 요청이 있으면 종료 제출을 진행하고, 없으면 질문 및 답변 처리 코드를 통해 다음 질문을 받아 시작한다.

이 협력 규칙은 2개의 세부 책임을 구현했던 함수들 그리고 뷰 모델 내에서 공유되는 면접 화면의 UI 상태(UI State)에 나뉘어 구현되어 있었다. 따라서 종료 요청이 언제 보류되고 어떤 조건에서 후속 처리가 실행되는지 이해하려면, 여러 함수와 상태를 함께 추적해야 했다.

## 개선 방안

그래서 이러한 모호했던 지점들을 가능한 쪼개어 나누고 추적이 쉬운 아키텍처를 구성하기 위해 개선안을 반영했다. 이제부터는 어떤 구성 요소를 추가했고, 이들로 어떻게 아키텍처를 쪼갰는지에 대한 설명이다.

### 구성 요소

먼저 개선된 아키텍처의 구성 요소들이다. 기존 MVI 아키텍처의 핵심 요소는 모두 그대로 포함하고 있고, **거기에 몇 개가 더해진 형태**다.

| 구성 요소 | 역할 또는 책임                                          |
| --------- | ------------------------------------------------------- |
| Intent    | 사용자 행동, 화면 수명 변화, 장치 작업 결과 등 외부 입력 |
| ViewModel | 인텐트를 분류하고 그에 따른 작업을 연결하는 중간 관리자 |
| Handler   | 특정 책임에 필요한 작업을 수행하는 담당자               |
| Mutation  | 상태 변경 사유와 변경에 필요한 값                       |
| Reducer   | 현재 상태와 Mutation으로 다음 상태를 계산하는 함수      |
| State     | 화면의 현재 상태                                        |
| Effect    | 화면에서 한 번 수행할 동작을 요청하는 메시지            |
| Context   | Handler가 상태 조회·변경, 이펙트 발행, 작업 실행에 쓰는 공통 통로 |
| Workflow  | 다른 책임으로 이어져야 한다는 내부 후속 작업 요청       |

전체 구성 요소들에 대해, **사람 수를 셀 때 사용하는 카운터**를 예시로 생각하며, 어떤 역할을 하는지에 대해 찬찬히 살펴보자.

#### 상태 State

상태의 역할은 이전과 달라진 게 없다. 여전히 **특정 시점에서의 UI 렌더링에 필요한 값**을 저장하는 역할을 맡는다.

카운터에서는 사람 수에 해당하는 카운트 그 자체가 상태다. 어려울 게 없다.

#### 뮤테이션 Mutation

뮤테이션은 **상태 변경의 사유와 변경에 필요한 값을 표현하는 데이터**다.

카운터의 증가 버튼을 생각해보자. 사용자가 버튼을 눌렀다는 입력은 인텐트로 전달되고, 이를 처리하는 쪽은 '카운트를 증가시켜야 한다'는 뮤테이션을 전달한다. 리듀서는 이 뮤테이션을 보고 현재 카운트에 1을 더한 새 상태를 계산한다. 현재 값이 329라면 새 값은 330이 된다.

새 질문을 받은 경우에는 `NextQuestionReceived(questionId)`처럼 질문 식별자를 함께 전달할 수도 있다. 뮤테이션의 종류와 값은 리듀서가 어떤 계산을 적용할지 판단하는 재료가 된다.

#### 리듀서 Reducer

리듀서는 **현재 상태와 뮤테이션을 받아 다음 상태를 계산하는 순수 함수**다. 여기서 순수하다는 것은 같은 입력에 같은 결과를 반환하고, 계산 중에 네트워크 요청이나 토스트 표시 같은 외부 동작을 수행하지 않는다는 뜻이다.

매개변수로는 2가지가 있다:

- **현재 상태**. 현재 상태를 바탕으로 다음 상태를 계산해야 하기에 필요하다.
- **뮤테이션**. 어떤 변경이 필요한지와 그 변경에 필요한 값을 전달한다.

리듀서는 뮤테이션의 종류에 맞는 계산 규칙을 선택해 새로운 상태를 반환한다. 카운터라면 증가 뮤테이션을 받았을 때 현재 카운트에 1을 더한 상태를 반환하는 식이다. 반환한 상태를 화면에서 관찰하는 상태 저장소에 반영하는 일은 문맥의 `dispatch()` 구현이 담당한다.

#### 문맥 Context

문맥은 **핸들러들이 같은 상태를 읽고, 상태 변경과 이펙트 발행을 요청하며, 비동기 작업을 실행할 수 있도록 제공하는 공통 통로**다. 이 글의 `MviContext`는 다음 기능을 제공한다.

- `state`: 화면이 관찰하는 상태 흐름인 `StateFlow`를 제공한다. 핸들러는 `state.value`로 현재 값을 읽는다.
- `dispatch(mutation)`: 리듀서로 다음 상태를 계산하고, 그 결과를 상태 저장소에 반영한다.
- `sendEffect(effect)`: 화면에서 수행할 일회성 동작을 메시지로 보낸다.
- `launch { ... }`: 뷰 모델의 `viewModelScope`에서 코루틴을 실행하고, 그 작업을 관리할 `Job`을 반환한다.

상태를 저장하는 `StateFlow`, 이펙트를 전달하는 채널, 코루틴의 실행 수명은 기반 클래스인 `MviViewModel`이 소유한다. 문맥은 이 기능을 각 핸들러가 함께 사용할 수 있게 노출한다. 어떤 인텐트에 어떤 작업과 뮤테이션이 필요한지는 뷰 모델과 핸들러가 결정한다.

#### 뷰 모델 ViewModel

뷰 모델은 **화면과 데이터 소스 사이의 중간자**로서 여전히 이전과 같은 역할을 맡지만, 코드 상으로는 조금의 변화가 있다.

면접 뷰 모델은 기반 클래스의 `createContext()`로 하나의 문맥을 만들고, 이를 핸들러들에게 전달한다. 화면에서 인텐트가 들어오면 종류에 맞는 핸들러를 호출하고, 핸들러가 후속 작업을 요청하면 워크플로에 따라 다른 핸들러로 연결한다.

즉, **뷰 모델은 입력을 분류하고 작업을 연결하며, 핸들러는 각 작업을 수행하고, 리듀서는 다음 상태를 계산한다.** 면접 기능의 뷰 모델에는 이 구성 요소를 조립하고 연결하는 코드가 남는다.

#### 인텐트 Intent

인텐트는 **화면에서 뷰 모델로 전달하는 외부 입력**을 표현한다. 사용자 행동뿐 아니라 앱이 백그라운드로 이동했다는 알림, 카메라 권한 요청 결과, 녹화 구간의 파일 생성 완료 같은 입력도 포함한다.

이 프로젝트에서 `ReportAppBackgrounded`는 앱의 백그라운드 이동을, `ReportCameraPermissionGranted`는 카메라 권한 허용을, `ReportRecordingSegmentFinalized`는 녹화 구간의 파일 생성 완료를 보고한다. 화면 쪽에서 요청한 Android 작업의 결과가 인텐트로 들어오는 것이다. 핸들러 내부에서 요청한 서버 응답은 해당 핸들러가 처리하고, 상태에 반영할 내용은 뮤테이션으로, 다른 핸들러에 이어서 요청할 작업은 워크플로로 전달한다.

[이전 포스트](/post/0020-mvi-architecture-overview)에서 중첩 인터페이스 형태로 하나의 인터페이스에 하위 구분을 더하는 형태를 설명했던 적이 있다. 면접 화면의 여러 인텐트도 위처럼 중첩 인터페이스를 사용해 하위 책임에 따라 나누었다.

```kotlin
sealed interface InterviewIntent : MviIntent {
    sealed interface Preparation : InterviewIntent {
        data object LoadInterview : Preparation
        // 이하 생략
    }

    // 다른 하위 분류 생략

    sealed interface Recovery : InterviewIntent {
        data object ReportAppBackgrounded : Recovery
        // 이하 생략
    }
}
```

위 코드를 보면 면접 기능의 인텐트는 면접 준비, 시간 측정, 실패한 면접 복구 등 세부 책임에 따라 구분되어 있다. 그래서 인텐트를 처음 본다고 해도 이 인텐트가 어떤 세부 책임을 위해 존재하는지 즉시 알 수 있다.

> 🚩 여기서 인텐트, 뮤테이션, 리듀서의 관계를 다시 한 번 정리해보자:
>
> | 항목              | 역할                       | 예시                                                           |
> | ----------------- | -------------------------- | -------------------------------------------------------------- |
> | 인텐트 Intent     | 사용자 행동 등 외부의 입력 | 증가 버튼을 눌렀다                                             |
> | 뮤테이션 Mutation | 상태 변경 사유와 필요한 값 | 카운트를 증가시켜야 한다                                       |
> | 리듀서 Reducer    | 다음 상태를 계산           | 이 뮤테이션을 받으면 현재 카운트에 1을 더한 새 상태를 반환한다 |

#### 핸들러 Handler

핸들러는 **특정 책임에 필요한 작업을 수행하는 담당자**다. 면접 준비, 질문 진행, 답변 제출처럼 함께 살펴보고 관리해야 하는 작업을 기준으로 나눈다. 각 핸들러는 담당 작업의 실행 조건과 취소 시점, 재시도 여부 등을 관리한다.

면접 뷰 모델이 조립하는 핸들러는 준비, 시간 측정, 질문 진행, 제출, 마무리, 복구의 6개이며, 인텐트의 하위 그룹은 5개다. 준비 핸들러처럼 인텐트 그룹에 대응하는 경우도 있고, `InterviewSubmissionHandler`처럼 다른 핸들러에서 요청하는 제출 작업을 맡는 경우도 있다. 따라서 핸들러는 **관리할 작업의 책임을 기준으로 분리**하며, 인텐트 그룹과 반드시 일대일로 맞추지는 않는다.

이 분리는 작업이 많아 뷰 모델을 이해하기 어려울 때 사용한다. 간단한 화면에서는 뷰 모델이 직접 작업을 처리해도 되며, 핸들러를 반드시 추가할 필요는 없다.

#### 이펙트 Effect

이펙트는 기존의 MVI 아키텍처에도 있었던 것으로서, **화면에서 한 번 수행할 동작을 요청하는 메시지**다.

카운터 예시로 돌아가 보자. 입장 정원이 330명이고, 인원이 정원에 도달했을 때 직원이 대기 중인 사람들에게 안내를 한 번 해야 한다고 가정하자. 이때 **현재 인원이 330명이라는 값은 상태**이고, **정원에 도달했다는 안내를 표시하라는 요청은 이펙트**다. 인원수는 화면에 계속 표시되어야 하지만, 안내는 화면이 다시 그려질 때마다 반복해서 하는 게 아니라 330명에 도달했을 때 단 한 번만 해야 하는 행위이기 때문이다.

실제 면접 화면에서는 일정 시간이 지나면 조기 종료가 가능하다는 안내를 보여주는 것이 한 사례다. 시간 측정 핸들러는 면접 조기 종료 조건인 8분에 이르면 다음 이펙트를 발행한다.

```kotlin
context.sendEffect(InterviewEffect.ShowEarlyFinishAvailable)
```

화면은 뷰 모델의 이펙트를 수집하고, 메시지의 종류에 따라 실제 UI 동작을 수행한다. 아래는 해당 분기만 남긴 예시다.

```kotlin
LaunchedEffect(viewModel) {
    viewModel.effect.collect { effect ->
        when (effect) {
            InterviewEffect.ShowEarlyFinishAvailable -> {
                Toast.makeText(context, "이제 면접을 종료할 수 있어요", Toast.LENGTH_LONG).show()
            }

            // 다른 이펙트 처리 생략
        }
    }
}
```

즉, 핸들러는 안내가 필요한 시점을 판단해 메시지를 보내고, 화면이 그 메시지를 받아 토스트를 표시한다. 이펙트를 발행하는 쪽에서 Android UI를 직접 실행하지 않는 것이다.

#### 워크플로 Workflow

워크플로는 새로 도입된 것으로 여러 세부 책임 간 선후 관계가 어떻게 이루어지는지를 명확하게 묘사한 것을 말한다.

카운터 비유를 조금 확장해, 인원을 집계하는 담당자와 입장을 관리하는 담당자가 따로 있다고 가정하자. 집계 담당자가 정원 도달을 확인했다면 입장 관리 담당자에게 입장 마감 절차를 넘겨야 한다. 이때 집계 담당자가 다른 담당자의 작업을 직접 실행하는 대신, **다음 책임으로 넘길 요청을 워크플로로 표현해 뷰 모델에 전달**한다. 뷰 모델이 그 요청에 맞는 핸들러를 호출해 작업을 연결한다.

면접 화면에서는 시간 측정 핸들러가 면접 시작 처리를 마친 뒤 질문 진행 핸들러에 질문 재생을 요청하는 것이 한 사례다. 그 요청은 다음 타입으로 표현한다.

```kotlin
internal sealed interface InterviewWorkflow {
    sealed interface Turn : InterviewWorkflow

    data class PlayCurrentQuestion(
        val resetRetry: Boolean,
    ) : Turn

    // 다른 워크플로 생략
}
```

`PlayCurrentQuestion`은 현재 질문의 재생을 요청하고, `resetRetry`는 재생 재시도 횟수를 초기화할지를 전달한다. 사용자나 화면에서 들어온 입력은 인텐트로, 화면에서 처리할 일회성 동작은 이펙트로, **핸들러의 작업을 다른 핸들러로 연결하기 위한 내부 요청은 워크플로로 구분**한 것이다.

워크플로 자체가 작업을 실행하거나 순서를 자동으로 보장하는 것은 아니다. 요청을 보내는 시점은 해당 핸들러가 결정하고, 요청을 받아 다음 핸들러를 호출하는 연결은 뷰 모델이 담당한다.

### 문제 해결

여기까지 개선된 MVI 아키텍처의 구성 요소에 대해 알아보았다. 이제 이 구성 요소들이 어떻게 힘을 합쳐 아까 짚었던 3가지 문제점을 해결하는지에 알아보자.

아까 살펴보았던 기존 아키텍처의 문제 3가지는 다음과 같았다:

- 책임 경계가 명확히 드러나지 않음
- 상태 변경이 여러 로직에 분산됨
- 비동기 작업의 수명과 실행 순서가 얽힘

#### 세부 책임을 분리해 책임 경계를 명확히 구분

책임 경계가 명확히 드러나지 않았던 문제는 인텐트와 핸들러를 세부 책임에 따라 구분함으로써 해결한다.

```kotlin
sealed interface InterviewIntent : MviIntent {
    sealed interface Preparation : InterviewIntent {
        data object LoadInterview : Preparation
        // 이하 생략
    }

    // 다른 하위 분류 생략

    sealed interface Recovery : InterviewIntent {
        data object ReportAppBackgrounded : Recovery
        // 이하 생략
    }
}
```

기존에는 48개 인텐트가 모두 `InterviewIntent` 하나에 묶여 있었다. 개선 후에는 위 코드처럼 `InterviewIntent`가 세부 책임을 나타내는 인터페이스로 구분되어, 각 인텐트가 어떤 세부 책임에 해당되는지를 더 쉽게 파악할 수 있게 되었다.

```kotlin
internal class InterviewPreparationHandler(
    private val context: MviContext<InterviewState, InterviewMutation, InterviewEffect>,
    // 기타 생성자 매개변수
) {
    // 문맥이 제공하는 상태 흐름을 조회
    private val state get() = context.state

    // 면접 준비 작업을 관리하는 멤버 변수들
    private var preparationJob: Job? = null
    private var preparationStageJob: Job? = null

    // 인텐트를 처리하는 핸들링 함수
    fun handle(intent: InterviewIntent.Preparation) {
        when (intent) {
            InterviewIntent.Preparation.LoadInterview -> {
                loadInterview()
            }
        }
    }
}
```

면접 준비 핸들러에는 준비 인텐트를 처리하는 함수와 준비 작업을 관리하는 `Job` 변수가 모여 있다. 준비 동작을 변경할 때 함께 확인할 코드의 범위를 이 핸들러로 좁힐 수 있다.

```kotlin
@HiltViewModel
class InterviewViewModel
    @Inject
    constructor(
        // 생성자 매개변수 생략
    ) : MviViewModel<InterviewIntent, InterviewState, InterviewEffect>(InterviewState()) {
        // 문맥 선언
        private val context = createContext(InterviewReducer)

        // 핸들러 선언 (면접 준비)
        private val preparation =
            InterviewPreparationHandler(
                context = context,
                cleanupExpiredData = cleanupExpiredData,
                getProgress = getProgress,
                getSession = getSession,
                getElapsedTime = getElapsedTime,
                deleteSession = deleteSession,
                workflow = ::onWorkflow,
            )

        // 인텐트 처리 함수
        override fun onIntent(intent: InterviewIntent) {
            when (intent) {
                // 인텐트가 면접 준비와 관련되어 있다면, 면접 준비 핸들러에 인텐트를 전달
                is InterviewIntent.Preparation -> preparation.handle(intent)
            }
        }
    }
```

핸들러와 인텐트를 가지고 사용자 입력을 처리하는 뷰 모델 코드다.

위 코드를 보면, **면접 준비 인텐트가 들어오면 면접 준비 핸들러에 그대로 던지는 것**을 볼 수 있다. 이전에 비해 인텐트가 어떤 책임을 갖고 어떤 로직에 의해 처리되는지가 핸들러로 잘 드러나면서, 코드의 책임 경계가 더 명확해진 모습을 볼 수 있다.

#### 상태 계산 규칙은 리듀서에 모으고 반영은 dispatch로 통일

```kotlin
internal object InterviewReducer : MviReducer<InterviewState, InterviewMutation> {
    // 함수 reduce의 매개변수로 현재 상태와 뮤테이션이 제공된다
    override fun reduce(
        state: InterviewState,
        mutation: InterviewMutation,
    ): InterviewState =
        when (mutation) {
            is InterviewMutation.Preparation -> reducePreparation(state, mutation)
        }

    // 계산 규칙은 뮤테이션의 종류에 따라 달라진다
    private fun reducePreparation(
        state: InterviewState,
        mutation: InterviewMutation.Preparation,
    ): InterviewState =
        when (mutation) {
            is InterviewMutation.CameraPermissionDenied -> {
                state.copy(
                    isCameraPermissionGranted = false,
                    isCameraReady = false,
                )
            }
        }
}
```

위 코드에서 `CameraPermissionDenied`는 카메라 권한이 거절되었다는 변경 사유를 표현한다. 이때 권한과 카메라 준비 상태를 모두 `false`로 만드는 계산 규칙은 리듀서의 `when` 분기에 모여 있다. `state.copy(...)`는 기존 상태의 나머지 값을 유지하면서 지정한 값만 바꾼 새 상태를 만든다.

핸들러는 `context.dispatch(InterviewMutation.CameraPermissionDenied)`로 변경을 요청한다. 문맥의 `dispatch()` 구현은 상태 저장소의 현재 값을 리듀서에 전달하고, 반환된 새 상태를 저장소에 반영한다. 다음은 이 계산과 반영을 담당하는 기반 뷰 모델 코드의 일부다.

```kotlin
override fun dispatch(mutation: M) {
    _state.update { currentState ->
        val nextState = reducer.reduce(currentState, mutation)
        nextState
    }
}
```

`_state`는 기반 뷰 모델이 가진 `MutableStateFlow`이며, `update`는 계산 결과를 새 상태로 반영한다. 이렇게 **무엇을 어떻게 바꿀지는 리듀서에서, 계산한 상태를 저장하는 과정은 `dispatch()`에서** 확인할 수 있다.

#### 워크플로로 여러 책임의 작업 간 관계를 표현

워크플로를 통해 여러 세부 책임 간 작업의 선후 관계를 명확히 표현했다.

면접 시작 후 현재 질문을 재생하는 흐름을 보자. 시간 측정 핸들러는 타이머를 시작하고 면접 시작 상태를 반영한 뒤, 질문 재생이 필요하다는 워크플로를 전달한다. 아래 코드는 준비 상태 검증, 녹화 시작 이펙트 발행 등 주변 처리를 생략하고 연결에 필요한 부분만 남긴 예시다.

```kotlin
internal class InterviewTimingHandler(
    private val context: MviContext<InterviewState, InterviewMutation, InterviewEffect>,
    private val startTimer: StartInterviewTimerUseCase,
    private val workflow: (InterviewWorkflow) -> Unit,
    // 다른 의존성 생략
) {
    // 다른 멤버 생략

    private fun startInterview() {
        // 시작 가능 여부와 중복 실행 검증 생략
        startJob = context.launch {
            startTimer()
            context.dispatch(InterviewMutation.InterviewStarted)
            // 녹화 시작 이펙트 발행 생략
            workflow(InterviewWorkflow.PlayCurrentQuestion(resetRetry = true))
            startTicker()
        }
    }
}
```

시간 측정 핸들러는 질문 진행 핸들러를 직접 참조하지 않는다. 대신 생성자에서 받은 `workflow` 콜백에 요청을 전달한다. 이 콜백으로 연결되는 함수는 뷰 모델의 `onWorkflow()`다.

```kotlin
// InterviewViewModel 내부. 다른 핸들러 조립과 분기는 생략했다.
private val timing = InterviewTimingHandler(
    context = context,
    startTimer = startTimer,
    getElapsedTime = getElapsedTime,
    timerCoordinator = timerCoordinator,
    workflow = ::onWorkflow,
)

private fun onWorkflow(event: InterviewWorkflow) {
    when (event) {
        is InterviewWorkflow.Turn -> onTurn(event)
        // 다른 책임의 워크플로 분기 생략
    }
}

private fun onTurn(event: InterviewWorkflow.Turn) {
    when (event) {
        is InterviewWorkflow.PlayCurrentQuestion -> {
            turn.playCurrentQuestion(event.resetRetry)
        }

        // 다른 질문 진행 요청 분기 생략
    }
}
```

질문 진행 핸들러의 `playCurrentQuestion()`은 질문 재생에 필요한 정보를 준비하고, 상태 변경과 `PlayQuestionAudio` 이펙트 발행을 담당한다. 실제 음성 재생은 화면 쪽에서 이펙트를 받아 처리한다. 전체 연결을 간단히 표현하면 다음과 같다.

```text
시간 측정 핸들러: 타이머 시작 및 면접 시작 상태 반영
    → PlayCurrentQuestion 워크플로 전달
    → 뷰 모델: onWorkflow() → onTurn()
    → 질문 진행 핸들러: playCurrentQuestion()
    → PlayQuestionAudio 이펙트 발행
    → 화면: 질문 음성 재생 처리
```

이 구조에서는 **각 작업의 실행 조건과 대기 및 재시도 판단은 해당 핸들러에, 책임 사이 호출 연결은 뷰 모델에** 놓인다. 따라서 작업 내부의 세부 처리는 해당 핸들러에서 확인하고, 다른 책임으로 이어지는 지점은 워크플로와 뷰 모델에서 확인할 수 있다.

#### 기존 작업 수명을 유지하면서 관리 책임을 핸들러로 분리

비동기 작업의 수명은 작업을 언제 시작하고, 언제까지 실행하며, 어떤 조건에서 취소할지를 뜻한다. 핸들러는 담당 작업의 실행 조건을 확인하고, 개별 작업의 취소나 실행 여부 확인이 필요한 경우 `Job`을 보관한다. `Job`은 실행 중인 코루틴의 상태를 확인하거나 취소할 때 사용하는 객체다.

시간 측정 핸들러에서는 면접 시작 작업을 `startJob`에 보관하고, 새 작업을 시작하기 전에 `if (startJob?.isActive == true) return`으로 이미 실행 중인지 확인한다. 시작 버튼이 연속으로 눌려도 진행 중인 시작 작업을 중복 실행하지 않도록 하는 것이다. 면접 준비 핸들러는 준비 작업을 다시 시작하거나 정리할 때 기존 `Job`에 `cancel()`을 호출한다.

제출 핸들러는 작업 결과를 처리하기 전에 `currentCoroutineContext().ensureActive()`로 현재 코루틴이 취소되었는지 확인한다. 취소되었다면 `CancellationException`이 발생해 이후 처리를 중단한다. 오류 처리에서도 이 취소 예외를 다시 던져 취소 흐름을 이어간다. 이처럼 각 작업의 필요한 지점에서 취소 여부를 확인해, 취소된 작업의 결과가 상태 변경이나 후속 작업으로 이어지는 것을 막는다.

핸들러의 작업은 `context.launch()`를 통해 시작하며, 이 함수는 내부에서 `viewModelScope.launch()`를 호출한다. 따라서 핸들러로 코드를 옮긴 뒤에도 **기존처럼 뷰 모델이 정리될 때 함께 취소되는 수명**을 유지한다. 앱이 잠시 백그라운드로 이동하는 경우처럼 뷰 모델이 유지되는 동안의 중단 여부는 각 작업의 정책에 따라 핸들러에서 관리한다.

이 구조에서 워크플로는 책임 사이의 요청을 드러내고, 핸들러의 실행 조건 검사와 `Job` 관리는 중복 실행과 취소를 다룬다. 두 역할을 나누어 두면 작업이 어디로 이어지는지와 언제 실행을 멈춰야 하는지를 각각 담당 코드에서 확인할 수 있다.

## 결론

이 게시글에서는 기존 MVI 아키텍처에서 **코드 책임 경계가 불명확**하고, **상태 계산 규칙이 분산**되어 있으며, **여러 작업의 수명과 연결 흐름을 추적하기 어려웠다**는 문제를 짚었다. 핸들러에는 각 책임의 작업과 실행·취소 관리를 모았고, 리듀서에는 뮤테이션에 따른 상태 계산 규칙을 모았다. 상태 반영은 문맥의 `dispatch()`를 통하고, 다른 책임으로 이어지는 요청은 워크플로와 뷰 모델에서 확인할 수 있도록 정리했다.

원래는 시리즈를 2개 게시글에서 끝내려고 했지만, 아키텍처가 워낙 복잡한 게 아니라 분량이 너무 길어졌다... 다음 글에서는 **아키텍처에 대한 평가** - 이 아키텍처의 복잡도를 감당해야 할 만큼 이전 아키텍처의 문제가 심각했는가? - 를 내려보고, 내 조치를 리뷰해보는 시간을 가져보자.
