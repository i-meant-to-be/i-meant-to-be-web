---
title: 멀티 모듈 아키텍처와 Android에서의 적용 방법
description: 자고로 모범적인 Android 개발자라면 Kotlin도 알아야 하고, Android도 알아야 하고, Gradle도 알아야 하고...
date: 2026-05-27
tags: [android, build-logic, gradle]
---

## 서론

Android 개발자들에게 "Android 개발에 있어 가장 중요한 키워드 하나를 뽑자면 무엇인가요?"라는 질문을 던진다면, 아마 꽤 높은 비율로 나올 단어가 '***클린 아키텍처***'라고 생각한다. 사실 어느 분야든 규모가 큰 프로젝트라면 클린 아키텍처가 중요하지 않은 경우는 없겠지만, 유독 Android는 이러한 철학이 더욱 더 강하게 강조되는 것 같다.

그리고 이러한 클린 아키텍처의 '계층 분리'와 '의존성 관리'를 Android 프로젝트 구조 차원에서 더 강하게 드러내는 방식 중 하나가 바로 멀티 모듈 아키텍처라고 생각한다. 아마 단일 모듈 프로젝트에서만 작업을 해 본 개발자라도, 네트워크 요청을 처리하는 기능을 따로 모아두거나, 인증 또는 기밀 정보 저장을 위한 암호화 관련 기능을 작업해 본 경험이 반드시 있을 것이다. 여기서 이 네트워크 관련 코드를 별도 모듈로 빼고, 암호화 관련 코드를 별도 모듈로 빼면 그게 멀티 모듈 아키텍처가 되는 거다.

하지만 이렇게 "단순히 코드를 모아 뺀다"는 식으로 간단하게 접근하기에는 사실 꽤나 어려운 개념인 듯하다. 그래서 이번 포스트에서는 아래 내용들에 대해 알아보고자 한다:

- 멀티 모듈 아키텍처가 무엇이고,
- 멀티 모듈 아키텍처의 장단점은 무엇이며,
- 실무에서나 관례적으로는 어떻게 계층 구조를 설계해야 하고,
- 모듈은 어떻게 생성하며,
- 각 모듈의 개별 빌드 스크립트는 어떻게 작성하는지

...에 대해 단계적으로 알아가보도록 하자.

## 응집도와 결합도

모듈과 멀티 모듈 아키텍처에 대해 파악하기 전에, 우리는 잠시 소프트웨어공학에서 지겹게 봤던 단어인 ***응집도(cohesion)***와 ***결합도(coupling)***에 대해 다시 짚어볼 필요가 있다:

- **응집도** | 모듈 내 구성 요소들이 동일한 목적을 위해 얼마나 밀접히 관련되어 있는지를 나타내는 정도
- **결합도** | 외부 모듈과의 의존성의 정도이며, 이는 모듈의 수뿐만 아니라 변경의 영향력 등도 포함

### 응집도

쉽게 말하면 응집도가 높다는 건 ***하나의 모듈 안에 들어 있는 코드들이 같은 목적이나 책임을 중심으로 밀접하게 모여 있다***는 것이다. 반대로, 한 모듈이 이 기능도 하고 저 기능도 하는 경우에는 응집도가 낮다고 말할 수 있다.

**_응집도는 높을수록 좋다._** 왜냐하면, 응집도가 낮다는 건 여러 기능이 한 모듈에 같이 포함되어 있다는 의미이고, 이 경우 특정 기능에서 문제가 생겼을 때 이 기능이 어느 모듈에 포함되어 있는지 찾아야 하기 때문에 유지보수성이 크게 악화되기 때문이다.

### 결합도

모듈 내부에서 따지는 응집도와는 다르게, 결합도는 모듈과 모듈 간 관계를 따진다. 결합도가 높다는 것은 ***한 모듈이 다른 모듈 여럿을 사용 또는 의존한다***는 것이고, 반대로 결합도가 낮다는 것은 외부 모듈의 구체적인 구현이나 변경에 덜 휘둘리도록 의존 관계가 느슨하게 설계되어 있다는 뜻이다.

**_결합도는 낮을수록 좋다._** 결합도가 높은 모듈은 다른 모듈의 변경에 쉽게 영향을 받는다. 따라서 한 모듈의 API나 구현이 바뀌었을 때, 그 모듈에 의존하는 다른 모듈까지 함께 수정해야 할 가능성이 커진다. 이 때문에 테스트, 리팩터링, 기능 확장 비용이 증가한다. 반대로 결합도가 낮은 모듈은 애초에 의존하는 모듈 수 자체가 적기 때문에, 문제를 일으킬 기회 자체가 적어지는 셈이다.

결합도가 높은 구조는 실타래가 엉킨 상태와 비슷하다. 한 가닥만 당기고 싶어도 주변 실이 함께 딸려 오기 때문에, 작은 수정도 예상보다 넓은 범위의 변경으로 번질 수 있다는 거다.

### 두 개념의 의의

이 두 가지 개념은 이 멀티 모듈 아키텍처에서 매우 중요하다. 왜냐하면 이 아키텍처 자체가 (내가 생각하기엔) 응집도는 높이고 결합도를 낮추는 것을 목적으로 하기 때문이다. (물론 목적을 달성할 수 있을지 여부는 오직 개발자가 얼마나 잘 설계했는지에 달려 있다.)

그 이유는 추후 설명하도록 하겠다. 그러기 위해서 이 개념을 먼저 짚어본 것이니까.

## 모듈

### 정의

> 각 모듈은 ***독립적이며 명확한 역할***을 합니다.

모듈이라는 단어에 관한 위의 정의는 Google의 공식 [Android 앱 모듈화 가이드](https://developer.android.com/topic/modularization?hl=ko)에서 가져왔다. 꽤나 추상적인 정의라서 직관적으로 이해하기에는 다소 어려워 보인다. 그래도 가장 중요한 표현은 '독립성'인 것 같다. 이 단어는 어떤 의미를 암시하는 것일까?

### 응집도, 결합도와 '독립성'

'독립성'이라는 표현은 내가 이해하기로는 모듈에 같은 목적을 위해 작성된 코드만 모아 놓았기 때문에, 밖에서 보면 마치 독립된 한 몸처럼 움직이는 것 같다는 뜻으로 읽힌다. 다시 말해, ***모듈의 독립성은 높은 응집도와 낮은 결합도가 함께 만들어내는 성질***에 가깝다는 것이다.

우리 몸을 생각하면 될 것 같다. 예를 들어 심장은 혈액 순환, 폐는 호흡, 위는 소화라는 비교적 명확한 역할을 가진다. 이 기관들이 서로 연결되어 있더라도 각 기관의 주요 책임은 구분된다. 모듈도 마찬가지로, 다른 모듈과 협력할 수는 있지만 자기 안에 모인 코드들은 하나의 분명한 책임을 중심으로 구성되어야 한다. 네트워크 모듈의 클래스 정의, 함수, 상수와 열거형 등이 각자 맡은 역할은 다를지라도 모두 네트워크 요청의 처리라는 공동의 목적을 향하고 있는 것처럼 말이다.

즉, 모듈이 독립적이라고 말하기 위해서는 반드시 해당 모듈에 묶인 코드 뭉치들이 가능한 ***하나의 명확한 책임 안에서 서로 밀접히 연관***되어 있어야 한다고도 해석할 수 있겠다.

## 멀티 모듈 아키텍처

### 정의

> 여러 Gradle 모듈이 있는 프로젝트를 다중 모듈 프로젝트라고 합니다. (...) 모듈화는 코드베이스를 ***느슨하게 결합된 독립적인 부분***으로 구성하는 방법입니다.

이 정의도 마찬가지로 Google의 공식 [Android 앱 모듈화 가이드](https://developer.android.com/topic/modularization?hl=ko)에서 가져왔다. 이 정의 역시 다소 추상적이기는 하나, 마찬가지로 가장 중요한 표현을 하나 뽑아보자면 '느슨하게 결합'이라고 생각한다.

### 결합도와 '느슨함'

‘느슨하게 결합’되었다는 것은 모듈들이 서로 아무 관련이 없다는 뜻이 아니다. 실제 Android 멀티 모듈 프로젝트에서 모듈들은 서로 의존하고 협력한다. 다만 다른 모듈의 내부 구현이나 변경에 과도하게 휘둘리지 않도록, ***의존 관계가 제한적이고 안정적으로 설계되어 있다***는 뜻에 가깝다.

예를 들어 Android 앱 모듈과 네트워크 모듈을 분리했다고 가정해 보자. 앱 모듈은 API 요청이라는 목적을 달성하기 위해 네트워크 모듈을 사용할 수 있다. 이런 의미에서 두 모듈은 분명 의존 관계를 가진다.

그러나 두 모듈의 책임은 다르다. 앱 모듈은 앱의 진입점, 전체 조립, 네비게이션 조율, DI 구성 등을 담당하고, 네트워크 모듈은 네트워크 요청 생성, 응답 처리, 네트워크 에러 변환 등을 담당한다. 즉, 두 모듈은 협력하지만 같은 책임을 공유하지는 않는다.

따라서 두 모듈은 ‘결합되어 있지 않다’고 말하는 것이 아니라, ‘의존 관계는 존재하지만 그 의존이 제한적이고 느슨하다’고 말하는 편이 더 정확하다. 앱 모듈은 네트워크 모듈의 공개 API만 사용하고, 네트워크 모듈의 내부 구현 세부사항에는 직접 의존하지 않아야 한다.

### 목적

이제 멀티 모듈 아키텍처가 달성하고자 하는 기본 목표를 정리할 수 있다. 핵심은 다음 두 가지다.

- **응집도 높은 모듈 구성** | 하나의 모듈은 명확한 책임을 가져야 하며, 그 책임과 관련된 코드들이 모여 있어야 한다.
- **느슨한 결합 유지** | 모듈들은 필요한 경우 서로 의존할 수 있지만, 다른 모듈의 내부 구현이나 잦은 변경에 과도하게 영향을 받지 않도록 의존 방향과 공개 API를 제한해야 한다.

다시 말하면, 멀티 모듈 아키텍처는 프로젝트 내 코드의 응집도를 높이고 모듈 간 결합도를 낮추기 위한 구조적 접근이다. 이 구조가 잘 설계되면 유지보수성, 재사용성, 캡슐화, 테스트 가능성, 빌드 효율성 같은 이점도 함께 기대할 수 있다.

다음 파트에서는 이러한 장점들이 구체적으로 어떻게 나타나는지 살펴보도록 하자.

### 장점

멀티 모듈 아키텍처의 장점은 아래와 같다:

#### 빌드 효율성

가장 큰 장점 중 하나이겠다. 멀티 모듈 에서는 Gradle이 ***변경된 모듈***과 ***그 영향을 받는 모듈***을 중심으로 다시 빌드할 수 있다. 따라서 단일 모듈 프로젝트에 비해 매번 **_전체 코드베이스를 다시 컴파일해야 하는 상황을 줄일 수 있다._** 반면, 단일 모듈 프로젝트에서는 한 기능에서만 수정이 발생해도 전체 코드를 다시 빌드해야만 한다. (설계가 잘 되어 있다면) 멀티 모듈 아티텍처로 구성된 프로젝트에서의 평균 빌드 시간이 더 적을 것이다.

그리고, 다음은 Gradle을 사용하는 프로젝트에서 취할 수 있는 이점이다: Gradle은 의존 관계가 없는 태스크(task)들을 병렬로 실행할 수 있다. 멀티 모듈 프로젝트에서는 서로 독립적인 모듈의 빌드 태스크가 병렬 실행 대상이 될 수 있으므로, `org.gradle.parallel=true` 같은 설정과 함께 사용하면 빌드 시간을 줄이는 데 도움이 될 수 있다. 안 그래도 빌드해야 할 코드 양도 단일 모듈 프로젝트에 비해 적은데, 병렬 컴파일까지 된다? 마다할 이유가 없다.

#### 재사용성

한 모듈을 여러 다른 모듈에서 공유하며 사용할 수 있다.

예를 들어, 네트워크 모듈을 하나 만들었다고 치자. 이 네트워크 모듈을 여러 페이지 - 정확히는 이후에 말할 '기능 모듈' - 에서 돌려가며 쓸 수 있다. 이건 뭐 말을 많이 붙일 필요가 없는 너무나도 자연스러운 장점이다.

#### 엄격한 인터페이스 공개 여부 제어

모듈을 사용하면 코드베이스에서 다른 모듈에 노출할 인터페이스를 쉽게 제어할 수 있다. (고 Google에서 말했다.)

Kotlin에는 `internal`과 `private` 키워드가 있다. 두 키워드는 다음과 같은 역할을 한다:

> 함수, 변수, 클래스, 객체와 인터페이스에 대해...
>
> - `internal` | 이 접근 제한자가 붙은 경우, 같은 모듈 내에서 접근 가능하다.
> - `private` | 이 접근 제한자가 붙은 경우, Top-level 선언에서는 같은 파일 안에서만 접근 가능하고, 클래스 멤버에서는 해당 클래스 내부에서만 접근 가능하다.

기존에도 `private`와 같은 경우는 모두 잘 사용했을 것이고, 멀티 모듈 아키텍처에서는 `internal`의 이점까지도 활용할 수 있게 된다. 이 접근 제한자의 경우 모듈 내로 공개 범위를 제한하는 만큼, 예를 들어 네트워크 모듈을 가정하면, API의 기준 URL을 네트워크 모듈 밖으로 공개하기 싫을 때 `internal val BASE_URL: String = "www.base-url.com"` 등으로 외부 모듈에 대해 숨길 수도 있을 것이다.

#### 공동 작업에 유리

멀티 모듈 아키텍처가 대형 프로젝트에 유리한 이유 중 하나이다.

프로젝트 자체가 여러 개의 모듈로 분리되고, 각 모듈은 컴파일이 별도로 진행된다. 따라서, 한 모듈에서 수정을 가해도 그 모듈의 공개 API 또는 인터페이스 정의가 변하지 않는다면, 그 영향이 다른 모듈에 즉시 미치지 않는다. 물론 간접적으로는 미칠 수 있겠지만, 대부분 모듈 간 결합은 느슨하게 - 모듈 간 API나 인터페이스가 크게 변하지 않는 선에서 - 이루어질 것이므로 그 영향은 전반적으로는 미미할 것이라고 볼 수 있다.

그리고 이에 더해, 특정 모듈을 수정해도 이를 사용하는 다른 모듈에서 그 변경 사항을 최대한 모르도록 조용히 수정하는 것이 가장 최선이지 않을까 싶다.

#### 명확한 관심사 분리

응집도가 높은 모듈로 분리되므로 각 모듈이 맡는 역할을 명확하게 분리할 수 있다.

이는 곧 개발자들로 하여금 "이 기능이 필요하면 이 모듈을 사용해야 하겠네."라는 생각을 바로 할 수 있게 해 준다. 나는 개인적으로 이런 부분이 굉장히 중요하다고 생각한다. 좋은 함수나 클래스 이름과도 비슷한 지점인데, 직관적이고 명확한 정체성의 확립은 개발자로 하여금 검색 없이도 특정 기능이 있는 위치를 즉시 찾을 수 있게 해 주기 때문이다.

예를 하나 들어보자. 블루투스와 HTTP API를 모두 사용하는 앱을 개발했다고 치자. 개발자가 HTTP API를 사용하는 앱을 개발하기 위해 통신 모듈을 찾아보았다. 그런데 검색된 모듈 이름이 `CommunicationModule` 뿐이었다. 개발자는 이 지점에서 "이 모듈이 블루투스와 HTTP API 중 무엇을 위해 개발된 것일까?"라는 질문에 바로 답할 수 없을 것이다. 그러나 만약 모듈이 `BluetoothModule`과 `HttpApiModule`로 분리되어 있다면, 개발자는 큰 비용 없이 즉시 사용할 모듈을 찾을 수 있다.

이런 검색 하나하나에 2분에서 3분 정도가 걸릴 것이다. 작아 보이지만, 매 모듈에서 이런 일이 반복된다면 매 개발 과정마다 저런 노이즈와 같은 시간이 몇 배가 쌓이게 된다. 그래서 직관적인 네이밍과 모듈화가 중요한 것이라고 생각한다.

#### 테스트 용이성

모듈이 명확하게 분리되어 있으면 특정 기능을 독립적으로 테스트하기가 쉬워진다.

예를 들어 암호화 로직은 `CryptoModule` 모듈의 단위 테스트로 검증하고, 데이터 저장 로직은 `DataModule` 모듈의 테스트로 검증할 수 있다. 전체 앱을 매번 실행하지 않아도 특정 모듈의 동작만 확인할 수 있기 때문에 테스트 범위를 좁히고 피드백 속도를 높일 수 있다.

### 단점

멀티 모듈 아키텍처의 단점은 아래와 같다:

#### 문서화 비용 증가

멀티 모듈 아키텍처에서는 모듈 간 경계가 명확해지는 만큼, 각 모듈이 외부에 제공하는 공개 API의 의미와 사용 방법을 문서화하는 비용이 증가한다.

물론 같은 저장소 안의 멀티 모듈 프로젝트라면 다른 모듈의 소스 코드를 Android Studio에서 확인할 수 있다. 그러나 좋은 멀티 모듈 구조에서는 외부 모듈이 내부 구현을 직접 읽고 의존하기보다, 공개된 API와 그 API의 계약을 기준으로 모듈을 사용하는 것이 바람직하다.

따라서 개방된 `interface`와 `class`, 확장 함수, 네비게이션 진입점처럼 다른 모듈에서 사용할 가능성이 있는 항목에는 KDoc, README, 사용 예시 등을 적절히 제공해야 한다. 이 과정은 분명 추가 비용이지만, 모듈 경계가 커질수록 필요한 비용이기도 하다.

#### 초기 구축 비용

멀티 모듈 아키텍처는 초기 구축 비용이 크다.

우선 `settings.gradle.kts`에 모듈을 등록해야 하고, 각 모듈마다 `build.gradle.kts`, `AndroidManifest.xml`, 이름 공간(namespace), 의존성, 테스트 설정 등을 구성해야 한다. 또한 모듈이 많아질수록 Android Library 모듈, Application 모듈, Compose 모듈, Hilt 적용 모듈 등의 Gradle 설정이 반복되기 쉽다.

이런 구조를 처음 구축하는 개발자라면 Gradle, Android Gradle Plugin, 버전 카탈로그 등에 대한 러닝 커브를 꽤 크게 느낄 수 있다.

#### 복잡한 의존성 관리

##### 러닝 커브 증가

멀티 모듈 아키텍처에서는 여러 모듈 간 의존성이 엉키지 않도록 규칙을 정하고 관리해야 한다. 즉, 모듈을 나누는 것 자체보다 “어떤 모듈이 어떤 모듈을 알아도 되는가”를 정하는 일이 중요해진다.

예를 들어 홈 화면을 구현하는 `:feature:home` 모듈과 설정 화면을 구현하는 `:feature:settings` 모듈이 있다고 하자. 두 모듈은 모두 기능(feature) 계층에 속하므로, 일반적으로는 서로 직접 의존하지 않는 편이 좋다. 만약 `:feature:home` → `:feature:settings` 같은 의존성을 쉽게 허용하면, 화면 단위로 관심사를 나누어 놓고도 feature 간 결합이 커질 수 있다.

이와 비슷하게 기능/UI 모듈이 `:core:network`나 `:core:database` 같은 구현 세부 모듈에 직접 의존하지 않도록 제한할 수도 있다. 대신 도메인 인터페이스나 저장소 API를 통해 필요한 데이터를 얻도록 설계하면 의존 방향을 더 안정적으로 유지할 수 있다.

이런 규칙은 프로젝트마다 다를 수 있지만, 한 번 정하면 모든 개발자가 이해하고 지켜야 한다. 따라서 멀티 모듈 아키텍처는 Gradle 설정뿐 아니라 의존성 규칙 자체에 대한 러닝 커브도 증가시킨다.

##### 의도하지 않은 영향이 미칠 수 있음

멀티 모듈이라고 해서 항상 결합도가 낮아지는 것은 아니다. 모듈 간 관계를 잘못 설정하면 오히려 변경 영향 범위가 더 넓어질 수 있다.

예를 들어 다음과 같이 기능 모듈들이 서로 직접 의존한다고 해 보자.

```text
:feature:home → :feature:settings
:feature:profile → :feature:settings
```

처음에는 단순히 설정 화면으로 이동하기 위해 의존성을 추가한 것처럼 보일 수 있다. 그러나 시간이 지나면서 `:feature:settings`의 API나 내부 구조가 바뀔 때, 이를 참조하는 여러 기능 모듈도 함께 영향을 받을 수 있다. 이 경우 모듈은 나뉘어 있지만 실제로는 각 기능 모듈 간 결합도가 높아진다.

더 극단적으로는 다음과 같은 순환 의존 구조를 떠올릴 수도 있다.

```text
:feature:a → :feature:b
:feature:b → :feature:c
:feature:c → :feature:a
```

실제 Gradle 프로젝트 의존성에서는 이런 순환 구조가 빌드 단계에서 문제가 되거나 허용되지 않는다. 그러나 개념적으로는 모듈을 나누어 놓고도 서로 강하게 얽히면 모듈화의 장점을 잃는다는 점을 보여준다.

따라서 같은 계층의 기능 모듈끼리는 직접 의존하지 않도록 제한하고, 공통으로 필요한 계약이나 네비게이션 라우팅 관련 코드, UI 컴포넌트는 별도의 `:core:_` 또는 `:domain:_` 모듈로 분리하는 식의 규칙이 필요하다.

#### 복잡한 Hilt 설정

멀티 모듈 구조에서는 Hilt 설정도 더 복잡해질 수 있다. 특히 `interface`는 `:domain` 또는 `:data-api`에 있고, 구현체는 `:data`에 있으며, 이를 사용하는 뷰 모델은 `:feature:*` 모듈에 있는 식으로 책임이 나뉘면 바인딩(`@Binds`)이 이루어질 위치를 신중하게 정해야 한다.

구현체가 하나뿐이라면 보통 바인딩 모듈은 구현체가 있는 `:data` 모듈에 두는 것이 자연스럽다.

```kotlin
@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {
    @Binds
    abstract fun bindRecipeRepository(
        impl: DefaultRecipeRepository
    ): RecipeRepository
}
```

다만 앱 변수, 테스트 환경, 런타임 구성에 따라 같은 인터페이스에 다른 구현체를 연결해야 한다면 이야기가 복잡해진다. 예를 들어 디버그 빌드에서는 `FakeRecipeRepository`, 릴리즈 빌드에서는 `DefaultRecipeRepository`를 쓰고 싶다면, 바인딩을 `:data` 모듈 안에 고정하는 것보다 `:app` 모듈이나 별도의 `:di` 모듈에서 조립하는 방식이 더 적절할 수 있다.

이 때 핵심은 “구현체가 몇 개인가?”가 아니라 “어떤 구현체를 선택하는 책임이 어디에 있는가?”이다. 구현 선택이 `:data` 모듈 내부 정책이라면 `:data`에 둘 수 있고, 앱 전체 조립 정책에 가깝다면 `:app` 또는 별도 DI 모듈에 둘 수 있다.

또한 Hilt는 Application 클래스를 컴파일하는 모듈 - 보통 `:app` 모듈이다 - 이 ***1) 모든 Hilt 모듈과 2) `@Inject constructor`가 붙어 있어 Hilt가 생성 방법을 알 수 있는 클래스 전부를 직접 또는 간접 의존성 경로 안에서 볼 수 있어야 한다.*** 이 문장이 꽤나 어려운데, 한 가지 예를 들어보자:

```kotlin
class DefaultRecipeRepository @Inject constructor(
    private val api: RecipeApi,
    private val dao: RecipeDao,
) : RecipeRepository
```

위와 같은 클래스가 있다고 하자. 이 때 `RecipeApi`와 `RecipeDao`는 클래스 `DefaultRecipeRepository`를 컴파일하기 위해 필요한 일종의 재료 객체, 즉 의존성이다. 근데 만약 Hilt가 이 재료를 어떻게 만드는지 방법을 모른다면 당연히 주입을 해 줄 수도 없으므로, Hilt가 의존성 그래프를 생성 및 검증하는 단계에서 오류가 발생한다. 따라서 Hilt는 여러 클래스가 사용하는 모든 Hilt 모듈을 만드는 방법을 다 알고 있어야 하며, 그리고 각 클래스가 어떤 재료를 필요로 하는지도 알아야 한다. 그래야 1) 재료를 가공하고 만든 후 2) 이 재료들을 필요한 클래스에 주입 또는 바인딩해줄 수 있기 때문이다.

따라서 멀티 모듈에서는 단순히 `@Module`을 작성하는 것뿐 아니라, `:app` 모듈이 해당 Hilt 모듈을 볼 수 있는 의존성 그래프를 구성하는 일도 중요하다.

## Android 권장 계층 구조

멀티 모듈 아키텍처의 장단점은 이 정도로 마무리하고, 이제 Android 프로젝트를 진행하면서 여러 기능과 코드를 모듈로 구분할 때 어떻게 나누어야 하는지를 알아보자.

정말 다행히도 Google은 [공식 문서](https://developer.android.com/topic/modularization/patterns?hl=ko)에서 다중 모듈 Android 앱을 만들 때 참고할 수 있는 일반적인 규칙과 공통 패턴을 제시하고 있다. 단, 이 구조가 모든 프로젝트에 그대로 적용되는 정답은 아니며, 프로젝트 요구사항에 맞게 조정해야 함은 반드시 알고 있도록 하자. 세상에 정답은 없으니까. 특히 공학에는.

> - **데이터 모듈** | 데이터 관리
> - **기능 모듈** | 일반적으로 화면 하나 또는 밀접하게 관련된 화면들의 묶음
> - **앱 모듈** | 애플리케이션의 진입점이며, 기능 모듈을 조립하고 루트 네비게이션을 제공하는 모듈
> - **일반 모듈** | 그 외 사소하고 다양한 기능을 지닌 공용 모듈 (네트워크, 암호화, I/O 등)
> - **테스트 모듈** | 테스트를 위해서만 사용하는 모듈

### Android 권장 모듈

#### 데이터 모듈

이 모듈에는 ***저장소, 데이터 소스 및 모델 클래스가 포함***되어 있다고 한다. 주 역할은 아래와 같다:

- 특정 도메인의 모든 데이터 및 로직 캡슐화
- 저장소를 외부 API를 통해 노출
- 외부로부터 구현 정보 및 데이터 소스 은닉

저장소 패턴(repository pattern)의 그 저장소와 저장소가 외부에 개방하는 데이터 타입 등이 이 모듈에 포함된다고 보면 되겠다.

#### 기능 모듈

이 모듈에는 ***일반적으로 화면 또는 해당 화면과 밀접하게 관련된 다른 화면을 포함***한다. 따라서, 이 모듈에 포함된 소위 '페이지'는 하나일 수도 있고, 그 하나와 관련된 여러 화면이 함께 포함될 수도 있다.

예를 들어, 앱에 하단 네비게이션 바가 있고 거기에 여러 메뉴가 있을 경우, 각 메뉴가 하나의 기능 모듈에 해당할 가능성이 높다. 또한 중요한 점으로는 뷰 모델이 연결될 가능성이 높다는 점이다. 아무래도 화면 그 자체를 담당하는 만큼 해당 화면에 종속된 뷰 모델도 같은 모듈에 포함하는 게 당연하다.

그리고, 기능 모듈은 데이터 모듈에 의존한다. 다만, 만약 기능 모듈과 데이터 모듈 사이에 컨트롤러 등 추상 계층이 존재한다면, 의존성이 성립한다고는 해도 간접적일 수도 있다.

#### 앱 모듈

이 모듈은 ***애플리케이션의 진입점***이다.

보통 앱 모듈은 여러 화면을 구현하고 있는 기능 모듈에 의존하며, 여러 화면을 조정하고 포괄하는 만큼 네비게이션 로직이 앱 모듈에 포함되는 경우가 있다. (경우에 따라 네비게이션 모듈을 따로 구성하기도 한다.) 또한, 각 플랫폼은 하나의 앱 모듈에 대응된다. 만약 앱이 스마트폰, Android Auto와 Wear OS를 모두 지원한다면, 3개의 폼 팩터에 대해 앱 모듈을 따로 정의할 수 있다는 거다. 이로서 각 폼 팩터에 특화된 개발 및 빌드를 가능하게 한다.

#### 일반 모듈 (또는 핵심 모듈)

가끔 `:core` 모듈로도 불리는 그것들이다. 여기에는 다양한 모듈이 있다:

- **UI 모듈** | 디자인 시스템을 사용하는 경우, 공통 UI 요소를 여기에 모두 정의하여 사용.
- **네트워크 모듈** | 네트워크 요청을 전담.
- **애널리틱스 모듈** | 사용자 행동 추적 등을 지원하는 Google Analytics 등의 서비스를 여기에 모두 정의하여 사용.
- **유틸리티 모듈** | 문자열 포매팅 등 보조 함수들.

#### 테스트 모듈

테스트를 위해서만 사용하는 Android 모듈이다. 오직 테스트를 위한 코드와 자원을 포함하며, 실제 구동에 필요하지 않다. 보통 아래와 같은 경우 사용한다고 한다:

- **공유 가능한 테스트 코드** | 하나의 테스트 코드를 여러 모듈에서 사용 가능한 경우, 공통 테스트 코드를 모듈로 분리.
- **빌드 설정 간결화** | 각 모듈의 빌드 파일(build.gradle.kts)에 흩어져 있던 테스트 관련 설정을 모두 이 모듈로 통합.
- **통합 및 계측 테스트** | 여러 모듈이 엮인 앱 전체의 동작을 점검해야 하는, Android 에뮬레이터가 동반되는 테스트의 경우.

### 그 외 고려할 만한 모듈

이 부분은 Android 공식 문서에는 없으나 내가 생각하기에 분리를 고려할 만한 모듈이다.

#### 도메인 모듈

이 항목은 위 모듈화 패턴 문서의 “모듈 유형” 목록에는 별도로 등장하지 않지만, Android 공식 앱 아키텍처에는 선택적 도메인 레이어가 존재한다. 프로젝트 규모가 커지거나 여러 뷰 모델에서 재사용되는 비즈니스 로직이 많아진다면 이를 별도 도메인 모듈로 분리하는 것을 고려할 수 있다.

경우에 따라 위에서 언급한 데이터 모듈에서 도메인 로직을 정의할 수도 있다. 그러나 정말로 '클린'한 아키텍처를 원한다면, 다시 말해 ***더 엄격한 계층 분리***를 원한다면, 아예 도메인 로직마저도 별도 모듈로 분리할 수 있겠다.

#### 네비게이션 모듈

네비게이션 테이블이나 그래프, 네비게이션 타입 등이 정의된 모듈이다.

기본적으로 네비게이션은 여러 기능 모듈을 오가기 때문에 이들을 모두 포괄할 수 있어야 한다. 그런 의미에서는 앱 모듈에 네비게이션 관련 기능을 포함하는 것도 가능하나, 명확한 분리를 원한다면 아예 네비게이션 모듈을 따로 파 거기에서 필요한 정의 및 구현을 몰아둘 수도 있을 것이다.

다만, 무엇을 넣을지에 관해서는 주의해야 한다. 보통 앱 전체 NavHost 조립은 앱 모듈이 담당하고, GPT의 설명에 따르면 각 기능 모듈은 자기 화면을 등록하는 네비게이션 진입점만 제공하는 식이 흔하다고 한다. 별도의 네비게이션 모듈을 둔다면 라우트 타입, 네비게이션 인터페이스, 딥 링크 관련 기능처럼 기능 모듈 간 공통 계약만 두는 편이 안전하다.

#### 암호화 모듈

암호화 모듈은 앱 내부에서 사용하는 암/복호화, 해싱, 서명 검증, 키 저장소 연동 같은 보안 관련 기능을 캡슐화하는 모듈이다.

예를 들어 Android Keystore를 사용해 키를 생성·조회하거나, 특정 데이터의 암·복호화를 수행하는 `CryptoManager`를 제공할 수 있다. 단, 개인 키나 API 키 같은 민감 정보를 모듈 내부 상수로 보관하는 식으로 이해해서는 안 된다.

## 모듈화 과정

이제 실제로 Android 프로젝트에서 모듈화를 해 볼 차례다. 한 단계씩 따라가보자.

### 일반적인 모듈 생성 절차

기존에 앱 모듈(`:app`)만 존재하던 프로젝트에 코어 모듈(`:core`)을 추가하는 상황을 가정하자.

#### 새 모듈 생성

아래 과정을 마치면, 프로젝트 루트 디렉토리에 새 모듈이 생성될 것이다.

- Android Studio 상단의 'File → New... → New Module...'로 이동한다.
- 왼쪽에서 모듈 종류로 'Android Library'를 선택한다.
- 모듈 이름으로 `core`을 입력하고, 그 외 필요한 사항을 변경한 후 'Finish' 버튼을 눌러 모듈을 생성한다.

다만 알리고 싶은 점이 있다. 여기서는 가장 단순한 예시로 루트 디렉토리 아래 'core/' 디렉토리에 바로 모듈을 생성했다. 그러나 GPT의 언급에 따르면, 실제 프로젝트에서는 `:core:network`, `:core:crypto`처럼 'core/' 아래에 여러 하위 모듈을 두는 구조도 자주 사용된다고 한다. 이 때에는 일단 먼저 단순하게 'core/' 디렉토리를 생성한 후, 해당 디렉토리 아래에 하위 모듈을 각각 생성해주면 된다. 즉, 'core/' 디렉토리 자체는 모듈이 아님에 유의하자.

(Gradle은 정확히는 프로젝트 내의 서브-프로젝트를 모듈로 인식한다고 한다.)

#### 새 모듈의 build.gradle.kts 준비

새로 생성된 모듈에는 자체 `build.gradle.kts`가 생긴다. Android Library 모듈이라면 보통 `com.android.library`와 `org.jetbrains.kotlin.android` 플러그인이 적용되고, `android { namespace = ... }` 설정이 포함된다. 이 파일에서 새 모듈이 사용할 외부 라이브러리 의존성을 추가한다. 아래 예시를 참고해보자:

```kotlin
plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.example.core"
    compileSdk = 36

    defaultConfig {
        minSdk = 26
    }
}

dependencies {
    // :core 모듈에 필요한 외부 라이브러리
}
```

#### 생성된 모듈을 프로젝트에 추가

프로젝트 루트에 위치한 'settings.gradle.kts`에 다음 한 줄을 입력한다:

```kotlin
// 다른 내용 생략

rootProject.name = "SomeGoodApp"
include(":app")
include(":core") // ← 이거
```

이로서 이 모듈을 프로젝트에 포함한다는 것을 Gradle에게 알릴 수 있다. 다만, 이 과정은 최신 Android Studio 기준으로는 자동으로 진행되는 듯하다. 참고만 하자.

#### 모듈 구현

모듈에 필요한 기능을 구현한다.

새 모듈을 만든 뒤에는 새 기능을 그 모듈에 구현하거나, 기존 `:app` 모듈에 있던 관련 코드를 새 모듈로 이동한다. 이때 패키지 선언과 `import` 구문의 경로도 함께 수정해야 한다.

#### Manifest 갱신

모듈에 필요한 Manifest를 갱신한다.

Android Library 모듈에도 'AndroidManifest.xml'이 존재할 수 있으며, 최종 앱 빌드 시 앱 모듈의 Manifest와 라이브러리 모듈의 Manifest가 병합된다. 따라서 특정 라이브러리 모듈이 Activity, Service, Content Provider, Permission 등을 선언해야 한다면 해당 모듈의 Manifest에 작성할 수 있다. 다만 많은 `:core` 또는 `:data` 모듈은 별도 컴포넌트를 선언하지 않기 때문에 Manifest가 비어 있거나 최소한으로 유지된다.

#### 상위 모듈에서 새 모듈 의존성 추가

새로 생성한 `:core` 모듈을 사용할 상위 모듈의 'build.gradle.kts'에 `core` 모듈을 불러온다. 아래와 같이 수정한다:

```kotlin
dependencies {
    implementation(project(":core")) // ← 이렇게 추가
    implementation(projects.core)    // ← 타입 안전 접근자(type-safe accessors)를 쓴다면 이렇게

    // 기본 의존성
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)

    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui.tooling.preview)
}
```

#### 빌드 진행

빌드를 진행해보고, 멀티 모듈이 제대로 잘 빌드되는지 확인한다.

만약 개별 모듈만 확인하고 싶다면 `./gradlew :core:build` 또는 Android Library 기준으로 `./gradlew :core:assembleDebug`를 실행할 수 있다. 최종적으로는 `./gradlew :app:build` 또는 `./gradlew build`로 앱 전체가 정상적으로 빌드되는지 확인한다.

### Gradle 기반 멀티 모듈 빌드 심화

일반적인 모듈화 과정으로도 충분히 멀티 모듈 아키텍처를 달성할 수 있다. 그러나 사실 Gradle에는 생각보다 여러 방면에서 고급화를 할 수 있는 여지가 꽤 있다. 예를 들어 다음과 같다:

- 여러 모듈에서 공통되는 빌드 설정을 따로 분리
- 타입-안전 프로젝트 접근자 사용

#### `build-logic`이 필요한 이유

예를 들어 여러 모듈에서 Hilt를 사용한다고 하자. 그러면 Hilt를 사용하는 각 모듈의 'build.gradle.kts'에 다음과 같은 설정이 반복될 수 있다.

```kotlin
plugins {
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt)
}

dependencies {
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
}
```

Hilt를 사용하는 모든 모듈에 이 코드를 반복해서 붙여 넣는 것은 비효율적이다. 이런 중복을 줄이기 위해 `build-logic`이라는 별도 Included Build를 만들고, 그 안에 컨벤션 플러그인을 정의할 수 있다.

이렇게 하면 각 모듈에서는 다음처럼 한 줄만 적용하면 된다.

```kotlin
plugins {
    id("convention.hilt")
}
```

#### 과정

아래 과정을 따라가며 `build-logic`을 설정해보자.

`build-logic`은 일반 앱 코드 모듈이 아니다. 그보다는, Gradle 빌드 로직을 담는 별도 Included Build로 구성한다. 따라서 Android Studio의 'New Module' 기능에서 일반 Kotlin 라이브러리로 구현하는 것보다, 다음 디렉토리 구조를 직접 만드는 편이 명확하다.

```
root/
├─ settings.gradle.kts
├─ gradle/
│  └─ libs.versions.toml
├─ build-logic/
│  ├─ settings.gradle.kts
│  └─ convention/
│     ├─ build.gradle.kts
│     └─ src/main/kotlin/
│        └─ com/example/buildlogic/
│           ├─ HiltConventionPlugin.kt
│           └─ util/
│              └─ VersionCatalogExt.kt
├─ app/
└─ core/
```

##### 루트 프로젝트에 `build-logic` 연결

루트 프로젝트의 'settings.gradle.kts'에 `build-logic`을 아래와 같이 연결한다.

```kotlin
pluginManagement {
    includeBuild("build-logic") // ← 여기
}

// 불필요한 내용 생략

rootProject.name = "SomeGoodApp"

include(":app")
include(":core:network")
include(":core:crypto")
```

여기서 중요한 것은 `include(":build-logic")`가 아니라 `includeBuild("build-logic")`를 사용한다는 점이다. 왜? `build-logic`은 서브 모듈이 아니라 Included Build니까. 

##### 타입 안전 프로젝트 접근자 활성화

이 단계는 `build-logic` 자체와 필수 관계는 없지만, 멀티 모듈 프로젝트에서 내부 모듈 의존성을 더 안전하게 선언하는 데 도움이 된다.

프로젝트 루트 'settings.gradle.kts'에 다음을 추가한다:

```kotlin
enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")
```

그러면 다음과 같은 문자열 기반 의존성 선언을:

```kotlin
implementation(project(":core:network"))
```

다음처럼 바꿀 수 있다.

```kotlin
implementation(projects.core.network)
```

##### build-logic/settings.gradle.kts 작성

`build-logic`은 별도 Gradle 빌드이므로 자체 'settings.gradle.kts'가 필요하다.

```kotlin
// build-logic/settings.gradle.kts

pluginManagement {
    // ...
}

dependencyResolutionManagement {
    // ...

    versionCatalogs {
        create("libs") {
            from(files("../gradle/libs.versions.toml"))
        }
    }

}

rootProject.name = "build-logic"

include(":convention")
```

이 설정을 통해 `build-logic` 내부에서도 루트 프로젝트의 버전 카탈로그(libs.versions.toml)을 사용할 수 있다.

##### build-logic/convention/build.gradle.kts 작성

이제 컨벤션 플러그인을 담을 `:convention` 모듈의 빌드 파일을 작성한다.

```kotlin
// build-logic/convention/build.gradle.kts

plugins {
    `kotlin-dsl`
}

group = "com.example.buildlogic"

dependencies {
    implementation(libs.android.gradle.plugin)
    implementation(libs.kotlin.gradle.plugin)
    implementation(libs.ksp.gradle.plugin)
    implementation(libs.hilt.gradle.plugin)
}

gradlePlugin {
    plugins {
        register("hilt") {
            id = "convention.hilt"
            implementationClass = "com.example.buildlogic.HiltConventionPlugin"
        }
    }
}
```

여기서 `id = "convention.hilt"`는 나중에 앱 모듈이나 기능 모듈의 'build.gradle.kts'에서 사용할 플러그인 ID다.

##### 버전 카탈로그 접근을 위한 헬퍼 함수 생성

Kotlin 클래스 기반 플러그인에서는 `libs.hilt.android`와 같은 접근자를 사용하기 어렵다. 따라서 헬퍼 함수를 생성해서 버전 카탈로그에 접근한다:

```kotlin
// build-logic/convention/src/main/kotlin/util/VersionCatalogExt.kt

package util

import org.gradle.api.Project
import org.gradle.api.artifacts.VersionCatalog
import org.gradle.api.artifacts.VersionCatalogsExtension
import org.gradle.kotlin.dsl.getByType

internal val Project.libs: VersionCatalog
    get() = extensions.getByType<VersionCatalogsExtension>().named("libs")
```

##### Hilt 컨벤션 플러그인 생성

다음으로 Hilt 설정을 담당하는 컨벤션 플러그인을 만든다.

```kotlin
// build-logic/convention/src/main/kotlin/com/example/buildlogic/HiltConventionPlugin.kt

package com.example.buildlogic

import com.example.buildlogic.util.libs
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.dependencies

class HiltConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            pluginManager.apply("com.google.devtools.ksp")
            pluginManager.apply("com.google.dagger.hilt.android")

            dependencies {
                add("implementation", libs.findLibrary("hilt-android").get())
                add("ksp", libs.findLibrary("hilt-compiler").get())
            }
        }
    }
}
```

이 플러그인은 Hilt를 사용하는 모듈마다 반복하던 KSP 플러그인, Hilt 플러그인, Hilt 런타임, Hilt 컴파일러 설정을 하나로 묶어준다.

##### 모듈에서 활용

Hilt를 사용하는 모듈의 'build.gradle.kts'에서 다음과 같이 이 컨벤션 플러그인을 불러온다:

```kotlin
// app/build.gradle.kts

plugins {
    // 기타 플러그인

    // Hilt 컨벤션 플러그인 불러오기
    id("convention.hilt")
}
```

## 결론

여기까지가 멀티 모듈 아키텍처에 관한 설명, 장점과 단점 분석, 그리고 실제 Android 프로젝트에서 멀티 모듈 아키텍처를 적용하는 방법이었다.

의외로 인상 깊었던 점은 멀티 모듈 아키텍처에 관한 것보다는 Google의 공식 문서의 수준이 꽤 깊고 상당히 많은 범위를 커버하고 있어서, 그 문서들만 봐도 안정적이고 수준이 높은 앱을 만들 수 있다는 생각이 들었다는 것이다. 괜히 YAPP 면접을 볼 때 면접관께서 Google 권장 앱 아키텍처에 대해 물어보신 게 아니었구나, 하는 생각이 들었다.

근데 꽤나 어렵다. 막 파다 보니 Android보다는 Gradle에 대해서도 잘 알아야 멀티 모듈 아키텍처를 잘 다룰 수 있겠구나 하는 생각이 들었다.

공부할 게 여전히 많다...

## 참고 문헌

- [Android 앱 모듈화 가이드 | App Architecture | Android Developers](https://developer.android.com/topic/modularization?hl=ko). Google Developers.
- [일반적인 모듈화 패턴 | App Architecture | Android Developers](https://developer.android.com/topic/modularization/patterns?hl=ko). Google Developers.
- [Visibility Modifiers | Kotlin Documentation](https://kotlinlang.org/docs/visibility-modifiers.html#packages). Kotlin.
