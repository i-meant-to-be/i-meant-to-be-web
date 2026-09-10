---
title: Jetpack Compose의 상태 관리
description: remember는 뭐고 StateFlow는 뭔가요? 왜 맨날 같이 써요?
date: 2026-09-11
category: 개발
tags: [Android, Kotlin, JetpackCompose, 상태관리]
---

## 배경

Compose를 쓴 지 꽤 오랜 시간이 지났지만 여전히 모르는 것이 많은데 그중 하나는 상태 관리에 관한 것이다. `MutableState`는 뭐고 `StateFlow`는 또 무엇이며 `remember`는 상태 관리에서 어떤 역할을 하는지, `remember`와 `rememberSaveable`은 또 정확히 뭐가 다르고 어떤 상황에 써야 하는지 등의 질문들은 그 차이가 꽤나 미묘하면서도 깊어서 답하기 어려운 질문들이다.

따라서 이 포스트에서는 Compose에서 이루어지는 상태 관리에 대한 여러 내용들을 정리해보려고 한다.

## 상태

가장 중요한 단어에 대한 정의가 먼저 필요하다: "**상태란 무엇인가?**"

[공식 문서](https://developer.android.com/develop/ui/compose/state?hl=ko)는 **상태를 시간에 따라 변할 수 있는 모든 값**이라고 폭넓게 정의한다. 데이터베이스의 값부터 클래스의 변수까지 모두 상태가 될 수 있다.

> Compose is declarative and as such **the only way to update it is by calling the same composable with new arguments**. These arguments are representations of the UI state.

선언형 UI 프레임워크인 Compose는 현재 상태를 나타내는 매개변수로 Composable을 다시 실행하여 UI를 갱신한다. 다만 모든 상태 변수가 직접 Recomposition을 일으키는 것은 아니다. Compose가 관찰하는 `State<T>`를 Composable에서 읽었다면 그 값의 변경이 해당 읽기 범위를 무효화하고 Recomposition을 예약한다. 부모가 새 매개변수로 자식을 다시 호출하는 경우처럼, 관찰 가능한 상태 객체를 직접 읽지 않은 Composable도 다시 실행될 수 있다.

---

## 2가지 측면

자, 그럼 이제 관찰 가능한 상태의 갱신이 Recomposition을 예약한다는 걸 알았으니, 실제 코드에서 상태 관리가 어떻게 이루어지는지 그 과정을 살펴보자.

```kt
var userName by remember { mutableStateOf("") }
```

위 코드는 우리가 Composable에서 상태를 선언할 때 매우 흔하게 쓰는 코드다. 여기서 우리는 Composable 내부 상태를 위해 챙겨야 할 2가지 측면을 살펴볼 수 있다: 바로 `remember`와 `mutableStateOf`이다. '이 둘은 무슨 역할을 하길래 자주 같이 쓰이는 걸까?', '만약 둘 중 하나만 남기면 어떤 일이 일어날까?' 등의 질문은 Compose를 개발해 본 사람이라면 한 번쯤 해 봤을 질문일 것이다.

그럼 이 2가지 요소는 각각 무슨 역할을 하는 걸까?

### `remember`: 지정된 값을 Composition에 유지

> Composable functions can use the remember API **to store an object in memory**. A value computed by remember is stored in the Composition during initial composition, and the stored value is returned during recomposition.

`remember`의 역할은 [공식 문서](https://developer.android.com/develop/ui/compose/state#state-in-composables)에 따르면 특정 객체를 Composition에 저장하는 것이다.

나중에 또 알아볼 것이지만 Composable의 생명주기는 다음과 같다:

|과정|설명|
|---|---|
|Composition 진입|Composable이 처음 실행되어 Composition에 들어감|
|Recomposition|필요한 부분을 다시 실행하여 Composition을 갱신함|
|Composition 이탈|해당 Composable이 Composition에서 제거됨|

위의 생명주기에 기반하여 따져보면, `remember`는 Composable이 Composition에 머물며 Recomposition이 반복되는 동안 값을 유지하고, 해당 호출 위치가 Composition에서 제거되면 값을 잊는다고 설명할 수 있다. `remember`에 키를 전달했다면 키가 바뀌는 경우에도 기존 값을 버리고 다시 계산한다.

다만 여기서 주목해야 할 점은 `remember`는 **객체**를 저장한다는 것이다. 그 객체가 반드시 관찰 가능한 상태여야 한다는 제약 조건은 없다.

```kt
val userNames = remember { mutableListOf("John Doe") }
```

그럼 위 목록의 원소를 `userNames[0] = "Jane Doe"`처럼 변경하면 Recomposition이 유발될까, 아니면 화면이 그대로일까? 답은 후자, '**이 변경만으로는 Recomposition이 예약되지 않는다**'이다. `remember`는 객체를 보존할 뿐 그 객체의 내부 변경을 자동으로 관찰하지 않으며, 일반 `MutableList`도 Compose가 관찰하는 상태 타입이 아니기 때문이다.

목록 객체와 변경된 내용 자체는 해당 호출 위치가 Composition에 남아 있는 동안 유지된다. 따라서 다른 관찰 가능한 상태의 변경으로 같은 UI가 다시 실행되면 변경된 목록 내용이 뒤늦게 화면에 나타날 수 있다. 이런 동작은 화면을 낡은 상태로 보이게 할 수 있으므로, UI가 목록 변경에 반응해야 한다면 `State<List<T>>`에 불변 목록을 담거나 `SnapshotStateList`처럼 Compose가 관찰할 수 있는 컨테이너를 사용해야 한다.

즉, `remember`는 Composition에서 특정 객체를 유지해주지만 그 객체를 관찰 가능한 상태로 만들어 주거나 Recomposition을 직접 예약하지는 않는다.

### `mutableStateOf`: 관찰 가능한 상태 생성

앞에서 언급한 대로 `mutableStateOf`는 Compose 런타임이 관찰할 수 있는 `MutableState<T>`를 생성하는 팩토리 함수이다.

```kt
val userName = mutableStateOf("John Doe")
```

Composable이 `userName.value`를 읽었다면 그 값을 변경할 때 해당 값을 읽은 범위의 Recomposition이 예약된다. 다시 말해, 특정 값이 변경되긴 했지만 해당 값이 현재 Composition에 올라와 있는 Composable에 직접 연관되어 있지 않다면 모든 Composable이 무조건 다시 실행되지는 않는다는 말이다.

다만 위 코드를 Composable 본문에 그대로 두면, 그 Composable이 다시 실행될 때마다 새로운 `MutableState`가 생성된다. 예를 들어 `userName.value = "Jane Doe"`가 Recomposition을 예약하더라도, 다음 실행에서 코드가 새 객체를 만들며 다시 `"John Doe"`로 시작할 수 있다.

즉, `mutableStateOf`는 관찰 가능한 상태를 만들지만, Composable 본문에서 생성한 상태를 Recomposition 사이에 유지하려면 별도의 수명 관리가 필요하다.

### 둘 다 사용하는 경우

위 두 함수는 역할이 다르다:

- `remember`는 객체를 현재 Composition의 호출 위치에 유지함
- `mutableStateOf`는 값 읽기와 쓰기를 Compose가 관찰할 수 있는 상태를 생성함

Composable 내부에서 상태를 소유할 때는 `mutableStateOf`로 관찰 가능한 상태를 만들고, `remember`로 같은 상태 객체를 Recomposition 사이에 유지하는 조합을 자주 사용한다.

다만 **모든 상태 관리에서 두 함수를 반드시 같이 써야 하는 것은 아니다**. 상태를 상위 Composable이나 `ViewModel`이 소유하고 현재 Composable은 매개변수로 받기만 할 수도 있다. 또한 `StateFlow` 같은 외부 관찰 가능 타입은 뒤에서 설명할 수집 API를 통해 Compose의 `State`로 변환해 읽을 수 있다.

---

## 상태 관리에 사용할 수 있는 타입

여기까지가 Compose에서 어떻게 상태 관리가 이루어지는지에 대한 설명이었다. 그럼 이번에는 Compose에서 자주 마주치는 상태 타입을 알아보자.

대표적으로 다음의 두 계열을 비교할 수 있다. 단, Compose가 지원하는 상태 타입이 이 둘뿐인 것은 아니다. `LiveData`나 다른 `Flow`, 사용자 정의 관찰 가능 타입도 적절한 변환 API를 거쳐 Compose의 `State<T>`로 읽을 수 있다.

|이름|설명|
|---|---|
|`State<T>`|Compose 런타임의 관찰 가능한 값 보관 타입|
|`StateFlow<T>`|Kotlin 코루틴의 현재 값이 있는 hot flow|

### `MutableState`

`State<T>`는 Compose 런타임이 제공하는 읽기 전용 상태 인터페이스다. 수정 가능 여부에 따라 `MutableState<T>`와 `State<T>`로 나뉜다. 전자는 값을 쓸 수 있고 후자는 읽기만 가능하다.

```kt
// Composable 내부에서 생성

val state = remember { mutableStateOf(defaultValue) }
var state by remember { mutableStateOf(defaultValue) }
val (state, setState) = remember { mutableStateOf(defaultValue) }
```

일반적으로는 위의 3가지 방법으로 선언할 수 있다. 세 방식은 같은 `MutableState`를 서로 다른 문법으로 다룬다.

```kt
// 읽기 전용 인터페이스로 노출

val writableState: MutableState<Int> = mutableStateOf(340)
val readOnlyState: State<Int> = writableState
```

`MutableState<T>`가 `State<T>`를 확장하므로, 외부에는 `State<T>` 타입으로 노출하여 쓰기 권한을 감출 수 있다.

기본적으로 `mutableStateOf`는 새 값의 내용이 기존 값과 같은지를 `==` 연산자로 비교한다. 예를 들어 현재 값이 340인데 다시 340을 저장하면, Compose는 실제로 달라진 것이 없다고 판단하여 Recomposition을 예약하지 않는다. `data class`처럼 내용 비교를 지원하는 객체도 각 프로퍼티의 값이 모두 같다면 같은 값으로 판단한다.

이러한 비교 방식을 **구조적 동등성 정책**이라고 한다. 필요하다면 `mutableStateOf`를 생성할 때 다른 비교 정책을 전달하여, 같은 객체인지 비교하거나 값을 쓸 때마다 변경된 것으로 처리하게 만들 수도 있다.

### `StateFlow`

> A `SharedFlow` that represents a read-only state with a single updatable data value that emits updates to the value to its collectors.

`StateFlow`는 Kotlin 코루틴에서 지원하는 상태 보관용 flow로, 항상 현재 값을 하나 가지며 수집자(collector)에게 갱신된 값을 내보내는 읽기 전용 인터페이스다. *(`StateFlow`가 확장하는 `SharedFlow`에 대해서는 이 게시글 범위에 포함하지 않으므로 생략한다.)*

보통 `ViewModel` 등 상태 소유자에서 쓰기 가능한 `MutableStateFlow`를 만들고, 외부에는 읽기 전용 `StateFlow`로 노출한다.

```kt
class UserViewModel : ViewModel() {
    private val _userName = MutableStateFlow("John Doe")
    val userName: StateFlow<String> = _userName.asStateFlow()
}
```

단순히 `StateFlow`가 존재하거나 값이 바뀌는 것만으로 Compose가 이를 관찰하지는 않는다. Android UI에서는 다음처럼 `collectAsStateWithLifecycle()`로 수집하여 Compose의 `State<T>`로 변환한 뒤 읽는 방법이 권장된다.

```kt
@Composable
fun UserScreen(viewModel: UserViewModel = viewModel()) {
    val userName by viewModel.userName.collectAsStateWithLifecycle()

    Text(text = userName)
}
```

플랫폼에 독립적인 Compose 코드에서는 `collectAsState()`를 사용할 수 있다.

### 생명주기에 관한 특성

둘 다 시간에 따라 변하는 현재 값을 나타내는 데 쓸 수 있고, 같은 값을 다시 설정했을 때 갱신을 합치는 기본 동작을 가진다. 다만 Compose와 연결되는 방식은 다르다. `MutableState`는 값을 읽은 Composable을 Compose 런타임이 직접 추적하지만, `StateFlow`는 `collectAsStateWithLifecycle()` 또는 `collectAsState()`로 수집해야 최신 방출 값이 Compose의 `State`에 반영되고 Recomposition으로 이어진다.

두 타입 모두 `ViewModel`의 프로퍼티로 둘 수 있지만, 메모리 할당과 해제를 타입별로 `ViewModel`이 대신 수행한다는 의미는 아니다. 일반 객체의 메모리는 런타임의 가비지 컬렉터가 관리하고, `ViewModel`은 자신의 범위가 끝날 때까지 상태를 보관하여 구성 변경을 견디게 한다. `ViewModel` 자체는 시스템에 의한 프로세스 종료를 견디지 못하므로, 그런 복원이 필요하면 `SavedStateHandle`이나 영구 저장소 등을 함께 사용해야 한다.

### 테스트 용이성

`StateFlow`는 Kotlin 코루틴이 제공하므로 Compose 밖의 계층에서도 사용할 수 있고, 여러 `flow` 연산자로 화면 상태를 조합하기 편하다. 이런 특성 때문에 `ViewModel`의 화면 상태를 `StateFlow`로 노출하는 설계가 널리 쓰이지만, 이것이 `MutableState`보다 언제나 우월하다는 뜻은 아니다. 상태의 소유 위치, 필요한 연산과 공개 계약에 맞춰 선택하면 된다.

---

## 변수 유지에 사용할 수 있는 함수

다음으로는 변수를 Composition에서 유지할 수 있도록 해 주는 함수를 알아보자. 크게 다음의 2가지가 있다:

- `remember`
- `rememberSaveable`

### `remember`

```kt
@Composable
inline fun <T : Any?> remember(crossinline calculation: @DisallowComposableCalls () -> T): T
```

> The function `remember` remembers the value produced by `calculation`. `calculation` will only be evaluated during the composition. Recomposition will always return the value produced by composition.

함수 `remember`는 계산한 값을 `remember`를 호출한 Composable이 Composition에 머무는 동안 저장하는 API다.

정확한 동작 방식은 다음과 같다. `calculation`에 제공된 식은 처음 Composition에 들어갈 때 평가되며, 이후 Recomposition에서는 처음 진입 시 계산 및 저장된 값이 반환된다.

```kt
@Composable
inline fun <T : Any?> remember(
    key1: Any?,
    crossinline calculation: @DisallowComposableCalls () -> T
): T
```

다만 위처럼 `key`가 포함된 `remember` 함수의 경우, `key`가 달라지면 기존 값을 무효화하고 `calculation` 블록을 다시 실행한다.

따라서 키는 기억할 값의 **입력 또는 정체성**을 표현한다. 입력과 무관하게 현재 Composable에서 하나의 객체를 계속 유지하기를 원한다면, 키를 안 넣어줘도 된다. 반대로, 계산 결과나 생성한 객체가 특정 입력에 의존한다면 그 입력을 키로 전달해야 입력이 바뀌었을 때 오래된 값을 재사용하지 않는다. 이 경우는, 사용자 ID에 따라 달라지는 이름, 학번, 학부 등 데이터를 새로 불러와야 할 때를 예시로 들 수 있다. 무거운 객체를 캐싱하는 경우에도 단순한 '초기화 여부'가 아니라 결과를 바꿔야 하는 입력을 키로 삼는 것이 핵심이다.

정리하면:
- 하나의 객체를 계속 재사용해도 상관 없으면 키를 제공하지 않음
- 키가 필요한 경우는:
  - 무거운 객체를 캐싱해야 할 때
  - 계산 결과가 특정 입력에 의존할 때

### `rememberSaveable`

> Remember the value produced by init.
>
> It behaves similarly to remember, but the stored value will survive the activity or process recreation using the saved instance state mechanism (for example it happens when the screen is rotated in the Android application).

기본적으로 `remember`와 비슷하지만, 저장 가능한 값을 **Saved Instance State** 방식으로 보존하여 Activity 재생성과 시스템에 의한 프로세스 종료 뒤에도 복원할 수 있게 해준다.

단, 사용자가 앱을 강제 종료하거나 최근 앱 화면에서 작업을 명시적으로 제거한 경우까지 항상 복원한다는 뜻은 아니다. 또한 복잡하거나 큰 데이터를 장기 보존하는 영구 저장소도 아니라는 점은 한계로 알아둘 필요가 있다.

그럼 `rememberSaveable`은 어떻게 Activity가 파괴 및 재생성된 후에도 복원할 수 있을까? 이 과정을 이해하기 위해 먼저 필요한 선행 지식들을 검토해보자.

#### 구성 변경

> **구성 변경**(Configuration Change)은 기기 구성의 변경을 앱에 알리는 사건이다. 앱이 직접 처리하도록 선언하지 않은 구성 변경에서는 보통 Composable을 호스팅하는 Activity가 재생성된다.

Activity 재생성을 일으킬 수 있는 대표적인 예로는 **화면 회전, 다크/라이트 모드 전환, 시스템 언어 변경, DPI 변경 등**이 있다. 기기와 앱 설정에 따라 일부 변경의 처리 방식은 달라질 수 있다.

`remember`는 단순 Recomposition 동안에는 값을 유지하지만 Activity가 재생성되며 기존 Composition이 사라지면 값을 잃는다. 구성 변경 이후에도 작은 UI 상태를 복원해야 할 때 `rememberSaveable`을 사용할 수 있다.

#### Binder IPC

> **Binder IPC**는 Android에서 프로세스 간 통신에 사용하는 핵심 장치다.

Saved Instance State는 `Bundle`을 사용하며, Android 프레임워크가 Activity 상태를 관리하는 과정에는 Binder 트랜잭션이 관여할 수 있다.

Binder 트랜잭션 버퍼의 크기는 현재 1MB이며, 이 버퍼는 **프로세스에서 진행 중인 모든 트랜잭션이 공유**한다. 따라서 `rememberSaveable`의 값 하나마다 1MB가 보장되는 것이 아니며, 저장 상태 전체가 너무 크면 `TransactionTooLargeException`이 발생할 수 있다. 사진이나 영상, 큰 객체 목록을 넣지 말고 화면을 복원하는 데 필요한 ID, 입력값, 스크롤 위치 같은 작은 상태만 저장해야 한다.

#### Bundle

> **Bundle**은 문자열 키와 여러 종류의 값을 함께 담을 수 있는 Android의 컨테이너다.

`rememberSaveable`의 Android 기본 저장소는 `Bundle`이며, 기본적으로 `Bundle`에 저장할 수 있는 타입을 자동으로 처리한다. 원시형과 문자열 외에도 배열, `Parcelable`, `Serializable` 등 `Bundle`이 지원하는 타입이 있지만, 저장 가능한지와 별개로 저장 상태는 작고 단순하게 유지하는 것이 좋다.

커스텀 자료형은 `@Parcelize`를 사용해 `Parcelable` 구현을 생성하거나, 필요한 필드만 저장 가능한 값으로 바꾸는 `Saver`, `listSaver`, `mapSaver`를 정의할 수 있다. `@Parcelize`는 클래스를 단순히 태그하여 바이트 배열 그대로 맡기는 기능이 아니라 `Parcelable` 구현 코드를 생성하는 Kotlin 플러그인의 기능이다.

```kt
@Composable
fun <T : Any> rememberSaveable(
    vararg inputs: Any?,
    saver: Saver<T, Any>,
    init: () -> T
): T
```

위 코드는 `saver`를 요구하는 `rememberSaveable`의 오버로드 중 하나다.

### 상태 저장과 복원이 이루어지는 과정

좋다, 이제 필요한 사전 개념이 대충 확립되었으니 어떤 과정으로 동작하는지를 살펴보자. 먼저 `SaveableStateRegistry`는 저장할 값을 모으고 복원할 값을 전달하는 **중간 관리자**라고 이해하면 된다. 값을 항상 복사해 두는 저장소라기보다는, 나중에 저장이 필요할 때 현재 값을 가져올 방법을 관리하는 역할에 가깝다.

세부 구현은 버전에 따라 달라질 수 있지만 전체 과정은 다음처럼 이해할 수 있다:

1. Composable에서 `rememberSaveable`이 처음 실행되면 `SaveableStateRegistry`에 이전에 저장된 값이 있는지 확인한다.
2. 저장된 값이 있다면 그 값을 가져와 사용한다. 커스텀 `Saver`가 지정되어 있다면 저장용 형태로 바뀌어 있던 값을 원래 자료형으로 되돌린다. 저장된 값이 없다면 `init` 블록을 실행해 새로운 값을 만든다.
3. 그다음 `rememberSaveable`은 나중에 상태를 저장해야 할 때 현재 값을 가져갈 수 있도록 레지스트리에 **값 제공자**를 등록한다. 값 제공자는 일종의 콜백으로 말 그대로 호출된 시점의 현재 값을 돌려주는 함수다.
4. 화면 회전이나 시스템에 의한 프로세스 종료 등에 대비해 Activity의 상태를 저장할 시점이 오면, 레지스트리는 등록된 값 제공자들을 호출하여 그 순간의 값들을 모은다.
5. 커스텀 `Saver`가 있다면 값을 `Bundle`에 넣을 수 있는 형태로 변환한다. 이렇게 모인 값들은 Activity의 Saved Instance State `Bundle`에 포함되어 Android의 상태 저장 방식으로 관리된다.
6. 이후 Activity와 Composition이 다시 만들어지면 Android가 앞에서 저장한 `Bundle`을 전달한다. 새로 만들어진 레지스트리가 이 값을 가지고 있다가, 같은 위치의 `rememberSaveable`이 실행될 때 돌려주면서 상태가 복원된다.

중요한 점은 `rememberSaveable`을 호출하거나 값이 바뀔 때마다 매번 `Bundle`에 복사하는 것이 아니라는 점이다. 평소에는 Composition 안에서 값을 사용하고 있다가, 실제로 상태를 저장해야 하는 시점에서야 그때의 값을 모은다. 또한 이 방식은 Android가 제공하는 임시 UI 상태 복원 기능이므로 데이터베이스나 파일처럼 값을 영구적으로 보관해주는 저장소는 아니다.

## 정리

여기까지가 Compose의 상태 관리에 관한 내용이었다. 요약하면 아래와 같다:

- 상태는 시간에 따라 변할 수 있는 모든 값이다.
- Compose UI가 상태 변화에 반응하려면 관찰 가능한 상태를 읽거나 새 매개변수를 받아야 한다.
- `mutableStateOf`는 Compose가 관찰할 수 있는 `MutableState`를 만들고, `remember`는 Composable 내부에서 만든 객체를 Recomposition 사이에 유지한다.
- `StateFlow`를 Compose에서 관찰하려면 Android에서는 보통 `collectAsStateWithLifecycle()`로 수집해 `State`로 변환한다.
- `remember`는 해당 호출 위치가 Composition에 남아 있는 동안 값을 유지하지만, Activity 재생성으로 Composition이 사라지면 값을 잃는다.
- `rememberSaveable`은 작은 UI 상태를 saved instance state에 저장하여 Activity 재생성과 시스템에 의한 프로세스 종료 뒤 복원할 수 있게 한다.

몇 가지 한계도 있다:

- `MutableState`와 `StateFlow`는 모두 로컬 단위 테스트가 가능하다. 단순한 테스트 가능성보다 상태를 어느 계층이 소유하고 어떤 연산과 공개 계약이 필요한지를 기준으로 선택하자.
- saved instance state의 `Bundle`은 다른 상태와 공간을 공유하며 크기가 제한된다. `rememberSaveable`에는 반드시 필요하고 크기가 작은 값만 넣자.
- `remember`와 관찰 가능한 상태 타입을 항상 동시에 써야 하는 것은 아니다. Composable이 상태를 직접 소유할 때와 외부 상태를 받아 표시할 때를 구분하자.

이 정도로 정리가 가능할 것 같다. 다소 깊어지긴 했는데 뭐 전부 언젠간 알아야 할 내용이니까...

## 참고 문헌

- [상태 및 Jetpack Compose | Android Developers](https://developer.android.com/develop/ui/compose/state?hl=ko)
- [Compose에서 UI 상태 저장 | Android Developers](https://developer.android.com/develop/ui/compose/state-saving?hl=ko)
- [Compose의 Composable 수명 주기 | Android Developers](https://developer.android.com/develop/ui/compose/lifecycle?hl=ko)
- [ViewModel 개요 | Android Developers](https://developer.android.com/topic/libraries/architecture/viewmodel?hl=ko)
- [StateFlow | Kotlin Coroutines API](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/)
- [Bundle | API reference | Android Developers](https://developer.android.com/reference/android/os/Bundle)
- [TransactionTooLargeException | API reference | Android Developers](https://developer.android.com/reference/android/os/TransactionTooLargeException)
- [Parcelable | API reference | Android Developers](https://developer.android.com/reference/android/os/Parcelable)
- [remember | API reference | Android Developers](https://developer.android.com/reference/kotlin/androidx/compose/runtime/remember.composable)
- [rememberSaveable | API reference | Android Developers](https://developer.android.com/reference/kotlin/androidx/compose/runtime/saveable/rememberSaveable.composable)
- [SaveableStateRegistry | API reference | Android Developers](https://developer.android.com/reference/kotlin/androidx/compose/runtime/saveable/SaveableStateRegistry)
