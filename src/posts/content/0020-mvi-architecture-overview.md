---
title: "MVI 아키텍처 개선: MVI 아키텍처에 대해 (1/3)"
description: MVI 아키텍처와 그 기반이 되는 MVVM 아키텍처에 관해
date: 2026-11-03
category: 개발
tags: [Android, Kotlin, JetpackCompose, MVI, 아키텍처]
---

## 배경

진행하던 [Hilit 프로젝트](https://github.com/Team-Hilit/Hilit-Android)에서 특정 화면에 딸린 인텐트 수가 너무 많아 뷰 모델 코드도 덩달아 매우 길어지는 문제가 발생했다. 이 부분을 해결하기 위해 여러 개선 사항을 적용했는데, 그 적용 사항을 소개하기 전에 먼저 Android의 MVI 아키텍처에 대해 간략히 정리해보고자 한다.

## 정의

> MVI 아키텍처는 Model, View, Intent로 구성된 아키텍처를 말한다.

이 셋의 앞 글자만 따서 MVI로 합쳐 부른다.

MVI 아키텍처는 사용자 의도를 인텐트라는 입력으로 받아 상태를 갱신하고, 뷰가 그 상태를 표시하는 **단방향 데이터 흐름**(UDF, Unidirectional Data Flow)을 중심으로 구성한다. Android에서는 뷰 모델을 상태 보유자이자 인텐트 처리자로 활용할 수 있다.

따라서 이 글에서는 Jetpack Compose와 ViewModel을 사용하는 MVI 구현을 기준으로 설명하며, 아래 구성 요소 파트에 뷰 모델에 대한 설명도 함께 포함하였다.

## 구성 요소

이 파트에서는 먼저 MVVM 아키텍처에서 사용하는 모델, 뷰, 뷰 모델의 역할을 간단히 살펴보겠다. 이후 MVI 아키텍처 파트에서 모델을 화면의 UI 상태(UI State)로 표현하는 방식과, 인텐트(Intent)를 통해 상태를 변경하는 흐름을 설명하겠다.

같은 모델이라는 용어라도 설명하는 아키텍처와 맥락에 따라 가리키는 범위가 다를 수 있으므로, 아래에서는 이를 구분해서 설명한다.

### MVVM 아키텍처

MVVM 아키텍처는 뷰 모델을 사용하는 아키텍처로 3가지 구성 요소로 나뉜다:

|항목|책임|
|---|---|
|모델|애플리케이션 데이터와 이를 처리하는 로직|
|뷰|UI 및 화면 표시|
|뷰 모델|모델과 뷰 간 조정자|

#### 모델 Model

> 모델은 애플리케이션이 다루는 데이터와 그 데이터를 처리하는 로직을 의미한다.

모델이라는 용어 자체가 굉장히 다양한 의미를 가지기 때문에 무엇이라고 한정하기 어렵지만, MVVM 아키텍처의 관점에서 뭉뚱그려 설명하면 **애플리케이션 데이터와 그 처리 로직**을 모델이라고 부를 수 있을 것 같다.

여기서 모델은 특정 도메인 모델이나 `data class` 하나만을 가리키지 않는다. 아래 모두를 포함하는 개념이라고 이해하는 게 편하다:
- 도메인 모델
- 데이터 소스 (저장소 등)
- 네트워크 관련 기능

예를 들어 메모 앱에서는 메모의 ID, 본문, 작성 시각 등을 표현하는 데이터뿐 아니라, 데이터 소스를 통해 메모를 조회하고 저장하며 변경하는 로직도 MVVM 아키텍처에서는 모델이라는 단어에 포섭될 수 있다고 말할 수 있을 것이다.

(이후 MVI 설명에서는 화면에 표시할 상태를 표현하는 모델을 다룬다. 메모 자체를 표현하는 도메인 모델과 구분하기 위해, 이 글에서는 화면 상태를 표현하는 모델을 **UI 상태**(UI State)라고 부르겠다는 점을 미리 알린다.)

#### 뷰 View

> 뷰는 화면을 의미한다.

뷰는 말 그대로 화면이다. 사용자에게 필요한 **데이터를 적절한 UI 구성에 맞게 보여주는 책임**을 맡는다. 이때 중요한 점은 뷰에 제공되는 데이터는 가능한 **읽기 전용**이어야 한다는 점이다.

왜 그럴까? 뷰가 만약 데이터 조작 권한까지 갖게 될 경우에는 크게 2가지 문제가 발생한다:
- 오류 발생 시 원인 추적이 어렵다
- 뷰와 모델 한 쪽에서 변경이 발생하면, 다른 쪽에도 영향이 간다

첫 번째 문제도 문제이긴 하지만 두 번째에 비하면 심각하진 않다. 두 번째 문제는 다르게 말해 **결합도 증가**를 의미하기 때문이다. 결합도가 증가하면 두 기능 간 책임 소재가 흐려지고, 한 쪽의 변화가 다른 쪽에도 그대로 전파되어 작업량이 그만큼 늘어나는 문제가 생길 수 있다.

단, 뷰 내부에서만 사용하는 상태는 UI 상태로 끌어올리지 않고 해당 Composable에서 관리할 수 있다. 예를 들어 드롭다운 메뉴의 펼침 여부는 화면 수준의 UiState에 포함하지 않고 `remember` 등으로 관리할 수 있다. 텍스트 입력값 역시 사용 목적에 따라 UI에서 관리하거나, 비즈니스 로직에서 필요하면 뷰 모델로 끌어올릴 수 있다.

정리하면, 뷰는 **화면에 데이터를 표시하는 책임**을 가지며, 기능 간 결합도 상승을 방지하기 위해 뷰에 제공되는 데이터는 가능한 읽기 전용이어야 한다.

#### 뷰 모델 ViewModel

> 뷰 모델은 화면에 필요한 상태를 만들고, 사용자 입력을 처리하는 역할을 맡는다.

메모 화면을 예로 들면, 뷰 모델은 Repository에서 메모 데이터를 받아 화면에 필요한 UI 상태를 만든다. 사용자가 메모를 수정하거나 삭제하면 그 요청을 처리하고, 필요한 경우 Repository에 작업을 요청한 뒤 결과를 UI 상태에 반영한다.

즉, 뷰에는 화면을 표시하는 데 필요한 상태와 사용자 입력을 전달할 경로를 노출한다. 이 글의 MVI 구현에서는 그 입력 경로를 인텐트로 통일한다.

핵심은 **필요한 것만 노출**한다는 점이다. 뷰 모델이 뷰에게 전혀 관련 없는 조작 연산을 노출할 경우, **의도치 않은 데이터 오염**이 발생할 가능성이 있기 때문이다. 예를 들어, 메모 앱의 설정 화면이 있다고 가정하자. 설정 화면에 메모 삭제에 관한 연산이 노출될 경우, (아마 그럴 일이 거의 없겠지만) 설정 로직에 메모 삭제 연산이 포함될 수 있고, 사용자는 설정 조작만 했는데 메모가 삭제되는 불상사가 생길 수 있다. 이런 문제가 발생할 가능성을 원천 차단하기 위해 아예 불필요한 데이터나 연산은 뷰에게 공개하지 않는 것이 건강한 뷰 모델 설계를 위한 제1원칙이다.

### MVI 아키텍처

지금까지 모델, 뷰, 뷰 모델의 역할을 살펴보았다. 이제 이 글의 MVI 구현에서 사용하는 UI 상태와 인텐트를 설명하겠다. UI 상태는 앞에서 언급한 MVI의 모델을 표현하며, 인텐트는 상태 변경을 요청하는 입력이나 사용자의 행동을 표현한다.

#### UI 상태 UI State

> UI 상태는 특정 시점에서의 화면 상태를 스냅샷처럼 묶은 것이다.

목적을 조금 더 상세히 설명하자면, 특정 화면의 상태를 묘사할 때 필요한 데이터는 경우에 따라 매우 많을 수 있는데 이를 전부 뷰 모델 내의 지역 변수로 선언하게 될 경우 코드가 매우 길어지고 복잡해진다. 다시 말해, **상태 값의 일관된 유지/관리**를 위해 UI 상태가 필요하다는 것이다.

Android는 Kotlin을 사용하므로 보통 `data class`로 묶게 된다. 메모 앱의 메모 화면을 예시로 들면 아래와 같이 UI 상태를 묘사할 수 있다:

```kotlin
data class MemoUiState(
    val id: Int,
    val content: String,
    val createdAt: LocalDateTime,
)
```

중요한 점이 하나 있는데 UI 상태는 보통 단일 인스턴스에서 변경된 값만 바꾸는 식이 아니라, **새로운 인스턴스를 생성해 아예 대체**하는 식으로 갱신한다는 것이다.

```kotlin
val uiState = MutableStateFlow(
    MemoUiState(
        id = 1,
        content = "",
        createdAt = LocalDateTime.now(),
    )
)

// 적절한 갱신: 기존 상태를 바탕으로 새 상태를 전달한다.
uiState.update { current ->
    current.copy(content = "새로운 메모 내용")
}

// 부적절한 갱신: content는 val이므로 재할당할 수 없고 컴파일 오류 발생.
uiState.value.content = "새로운 메모 내용"
```

이 글에서는 UI 상태를 불변 객체로 정의하므로, 변경할 프로퍼티를 반영한 새로운 인스턴스를 생성해 `StateFlow.value`에 할당하는 방식으로 갱신한다. 일반 객체 내부의 프로퍼티를 직접 변경하는 것만으로는 `StateFlow`가 그 변경을 관찰하지 못한다.

다만, 새로운 인스턴스를 할당한다고 해서 항상 갱신이 트리거되는 것은 아니다. `StateFlow`는 기존 값과 새 값을 `equals()`로 비교하며, 두 값이 동등하면 새로운 값을 방출하지 않는다. 이 예시의 `MemoUiState`는 `data class`이므로, 자동 생성된 `equals()`는 주 생성자에 선언된 프로퍼티들을 기준으로 동등성을 판단한다.

Compose에서는 이 `StateFlow`를 `collectAsStateWithLifecycle()`로 수집하고, 반환된 `State`의 값을 UI에서 읽는다. 수집한 값이 변경되면 그 값을 읽는 UI가 재구성(recomposition)될 수 있다. Compose의 `mutableStateOf` 역시 기본적으로 `==`를 기준으로 동등성을 판단하지만, 개발자의 필요에 따라 다른 변경 정책을 지정할 수도 있다.

#### 인텐트 Intent

> 인텐트는 화면에서 처리할 입력을 명시적인 타입으로 정의한다.

이를 통해 입력 종류와 처리 경로를 파악하기 쉬워지고, `sealed` 타입과 `when`을 사용하면 누락된 분기를 컴파일 시간에 발견할 수 있다.

다시 메모 앱을 예시로 들어보면, 메모 리스트 화면에서 사용자는 메모를 조회하거나, 새 메모를 추가하거나, 기존 메모를 삭제하는 등의 행위가 가능할 것이다. 이들을 모두 인텐트라고 부른다.

인텐트라는 단어의 정의는 다음과 같다:

> intent (*noun*) / the fact that you want and plan to do something.
>
> from [Cambridge English Dict](https://dictionary.cambridge.org/dictionary/english/intent)

이 단어는 의도, 의향, 의지 등으로 번역할 수 있고, MVI 아키텍처의 맥락에서는 '행위'로 이해하는 게 쉬울 것 같다. 사용자가 특정 화면에서 할 수 있는 **모든 가능한 행위**를 나타낸 것이 인텐트이기 때문이다.

그럼 인텐트는 MVI 아키텍처에서 어떤 책임을 맡을까? **사용자 행위를 예측 가능한 형태로 정의 및 구성**함으로써, 그 범위를 벗어나는 의도하지 않은 일이 일어나지 않게 방지하는 책임을 맡는다. 또한, 문제가 발생한 사용자 시나리오가 어느 지점인지를 명확하게 식별할 수 있다.

## 코드 예시

다음은 Kotlin에서 Jetpack Compose를 위한 MVI 아키텍처를 구성할 때의 코드 예시다. 앞에서 계속 언급했던 메모 앱의 메모 조회 화면을 예시로 들어보겠다.

### 인텐트 Intent

```kotlin
enum class MemoScreenIntent {
    EDIT,
    DELETE,
    SHARE
}
```

위 구현은 가장 기초적이고 편한 열거형을 활용한 형태의 구현이다.

```kotlin
sealed interface MemoScreenIntent {
    // 매개변수가 있는 경우
    data class EditMemo(
        val content: String
    ) : MemoScreenIntent

    // 매개변수가 없는 경우
    data object DeleteMemo : MemoScreenIntent
    data object ShareMemo : MemoScreenIntent
}
```

위처럼 `sealed interface`를 통해 구현하는 방법도 있다. 이 방법의 경우 매개변수가 없는 인텐트와 매개변수가 있는 인텐트에 모두 대응이 가능하다는 장점이 있다.

```kotlin
sealed interface SettingScreenIntent {
    data object OpenVersionInfo : SettingScreenIntent

    sealed interface Profile : SettingScreenIntent {
        data class UpdateNickname(val nickname: String) : Profile
        data class UpdateAge(val int: Int) : Profile
    }

    sealed interface Account : SettingScreenIntent {
        data object Logout: Account
        data object Withdrawal : Account
    }
}
```

위 예시는 메모 앱의 설정 화면을 예로 든 것인데, 위처럼 `sealed interface`를 중첩하여 화면 내의 작업을 그룹으로 묶을 때도 용이하다.

### UI 상태 UI State

```kotlin
@Immutable
data class MemoUiState(
    val id: Int,
    val content: String,
    val createdAt: LocalDateTime,
)
```

보통 위와 같이 `@Immutable` 어노테이션을 붙인 `data class` 형태로 많이 사용한다. 다만 불변성을 강제하거나 검증하지 않으므로, 실제로 불변성을 보장할 수 있는 클래스에만 사용해야 한다. 이를 위반하면 Compose의 최적화로 인해 화면이 올바르게 갱신되지 않을 수 있다.

`data class`는 이것 자체가 데이터를 묘사하기에 적절한 형태이기에 사용하고, `@Immutable`은 Compose에게 이 객체는 한번 생성된 이후에는 내부 값이 절대 바뀌지 않음을 알려주기 위해 달아준다.

### 뷰 모델 ViewModel

```kotlin
class MemoViewModel(
    private val memoRepo: MemoRepo
) : ViewModel() {
    // 상태 개방
    private val _uiState = MutableStateFlow<MemoUiState>(
        MemoUiState(
            id = 1,
            content = "",
            createdAt = LocalDateTime.now()
        )
    )
    val uiState: StateFlow<MemoUiState> = _uiState.asStateFlow()

    // 인텐트 처리
    fun onIntent(intent: MemoScreenIntent) {
        when (intent) {
            is MemoScreenIntent.EditMemo -> {
                _uiState.update { current ->
                    current.copy(content = intent.content)
                }
            }

            MemoScreenIntent.DeleteMemo -> {
                // 삭제 처리 생략
            }

            MemoScreenIntent.ShareMemo -> {
                // 공유 처리 생략
            }
        }
    }
}
```

보통 MVI 아키텍처는 크게는 위와 같이 작성한다.

UI 상태를 묘사하는 데이터 타입을 수정 가능한 `MutableStateFlow`로 만들어두고, 뷰에는 `StateFlow`로 노출하여 함부로 수정할 수 없게 차단한다.

또한, `onIntent` 함수 하나만 두고 `when` 절에 인텐트를 걸어주어, 인텐트 종류에 따라 처리가 가능하게 코드 수준에서 분기한다.

### 뷰 View

```kotlin
@Composable
fun MemoScreen(viewModel: MemoViewModel) {
    val uiState = viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold() {
        // 생략
    }
}
```

뷰 코드는 쉽다. 뷰 모델을 매개변수로 받고, UI 상태는 뷰 모델에서 수집해준다.

함수 `collectAsStateWithLifecycle`는 순수 Kotlin 측 코드인 `StateFlow`를 Android 의존성에 포함된 Compose의 `State`로 변환한다. 기본적으로 현재 `LifecycleOwner`가 `STARTED` 이상일 때 수집하고, 그보다 낮아지면 수집을 중단한다.

## 정리

여기까지가 MVI 아키텍처에 관한 기초적인 정리였다. 표로 역할을 나누면 다음과 같다:

| 구성 요소 | 책임 |
|---|---|
| 모델(Model / UI 상태) | 화면을 표시하는 데 필요한 현재 상태 표현 |
| 인텐트(Intent) | 사용자 의도를 명시적인 입력으로 표현 |
| 뷰(View) | UI 상태를 화면에 표시하고 사용자 입력 전달 |
| 뷰 모델(ViewModel) | 인텐트를 처리하고 UI 상태를 생성·갱신 |
| 데이터 계층(Repository 등) | 상태 생성에 필요한 데이터 제공 및 데이터 변경 처리 |

이번 포스트는 여기까지. 다음 포스트에서 이어서 MVI 아키텍처에서 어떤 문제가 발생했고 어떻게 해결했는지를 소개하겠다.
