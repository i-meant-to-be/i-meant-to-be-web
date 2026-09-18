---
title: OAuth 2.0 뜯어보기
description: 안전한 소셜 로그인을 위한 온몸 비틀기
date: 2026-09-18
category: 개발
tags: [OAuth, OIDC, PKCE, Android, 보안]
---

## 배경

요즘 취업 준비를 위해 이것저것 공부하고 있는데 OAuth가 생각보다 쉽지 않더라. 보안을 유지하기 위해 온몸을 비틀어버린 나머지 꽤나 복잡하고 많은 것들이 이루어지는 인증 체계였다. 그래서 이번 게시물에서는 간략하게 OAuth 과정을 정리하고 어떤 인증 수단이 사용되는지에 대해 정리해보겠다.

이하에서는 이해를 돕기 위해 Android 앱이 OAuth 2.0 인가 코드 플로우와 PKCE를 사용하고, OIDC를 통해 사용자를 인증한 뒤 자체 서비스 세션을 발급하는 일반적인 소셜 로그인 구조를 가정한다.

---

## 용어 정의

OAuth를 이해하기 전에, 먼저 자주 등장하는 몇 가지 보안 용어를 정확히 이해할 필요가 있다. 이 부분은 ChatGPT의 도움을 받아 작성했다.

### 식별 (Identification)

"**나는 누구인가?**"를 **시스템에 제시하는 것**이다.

예를 들어 로그인 화면에 이메일 `hello@example.com`을 입력하는 것은 자신이 어떤 사용자인지 시스템에 알리는 식별 과정이다. 이 단계만으로는 실제로 그 사용자가 맞는지 증명되지 않는다.

### 인증 (Authentication)

"**네가 정말 네가 주장하는 그 사용자 또는 주체가 맞는가?**"를 **확인하는 과정**이다.

비밀번호 확인, 생체 인증, OTP 등이 대표적인 인증 수단이다.

즉,

- 식별: "나는 홍길동이다."
- 인증: "정말 홍길동이 맞는가?"

라고 구분할 수 있다.

인증의 대상은 사람에 한정되지 않는다. 앱, 서버, 장치처럼 시스템과 상호작용하는 다른 주체의 신원을 확인하는 것도 인증이라고 할 수 있다.

### 인가 (Authorization)

**인증되거나 식별된 주체가 어떤 리소스에 어떤 행위를 할 수 있는지 결정하는 것**이다.

예를 들어 사용자가 로그인에 성공했더라도 관리자 페이지에 접근할 권한이 없다면 인증에는 성공했지만 인가에는 실패한 것이다.

OAuth의 핵심 목적은 바로 이 **인가**에 있다. 사용자는 자신의 비밀번호를 제3자 애플리케이션에 넘기지 않고도 특정 리소스에 접근할 권한을 제한적으로 위임할 수 있다.

### 자격 증명 (Credential)

어떤 주체의 신원을 확인하거나 권한을 증명하기 위해 제시하는 **증거가 되는 정보**를 말한다.

비밀번호, 인증서, 보안 키 등이 이에 해당할 수 있다.

### 토큰 (Token)

시스템이 인증이나 인가 과정의 결과를 이후 요청에서 사용할 수 있도록 발급하는 데이터다.

OAuth의 액세스 토큰은 사용자의 신원을 직접 증명하기 위한 것이 아니라, **특정 리소스에 접근할 권한이 부여되었음을 나타내는 자격**으로 사용된다.

반면 OpenID Connect의 ID 토큰은 인증된 사용자에 관한 정보를 Client에게 전달하기 위한 용도로 사용된다.

따라서 가장 간단하게 정리하면 다음과 같다.

> **인증**(Authentication)은 "**누구인가?**"를 확인하고, **인가**(Authorization)은 "**무엇을 할 수 있는가?**"를 결정한다. OAuth는 후자인 인가를 위한 프레임워크다.

---

## 정의

> The OAuth 2.0 authorization framework enables a third-party application to obtain limited access to an HTTP service, either on behalf of a resource owner by orchestrating an approval interaction between the resource owner and the HTTP service, or by allowing the third-party application to obtain access on its own behalf.

OAuth는 **사용자의 비밀번호를 제3자 애플리케이션에 넘기지 않은 채, 해당 애플리케이션이 사용자를 대신하여 특정 리소스에 제한적으로 접근하도록 권한을 위임하는 것**을 말한다.

보통 OAuth는 Google이나 Kakao 로그인처럼 로그인에 활용되고는 한다. 이 경우, 외부 서비스가 사용자 인증을 담당하므로 서비스가 직접 사용자의 비밀번호를 보관·검증해야 하는 부담을 줄일 수 있다. 다만 OAuth 자체가 서비스의 계정 관리를 대신하는 것은 아님을 확실히 해야 한다. 서비스는 외부 계정과 연결되는 자체 사용자 ID, 서비스 데이터, 권한 및 세션 등을 별도로 관리할 수 있기 때문이다. 또한 OAuth 자체는 인증(Authentication) 프로토콜이 아니다. 사용자의 신원을 표준화된 방식으로 확인하기 위해서는 OAuth 2.0 위에 구축된 OpenID Connect(OIDC) 등을 사용해야 한다.

---

## 과정

### 간략한 버전

대충 아래와 같은 순서로 동작한다:

- 사용자가 앱에서 로그인을 시도하면, 앱은 OAuth 제공자로 유도
- 사용자가 로그인에 성공하면, OAuth 제공자는 인가 코드(Auth Code)를 앱에 반환
- 앱은 인가 코드를 들고 서비스 서버에 전달 → "*나 OAuth 제공자에게 인증 받았어*"
- 서비스 서버는 인가 코드를 다시 OAuth 제공자에 전달해 유효성을 검증 후, 유효한 경우 서비스에서 사용 가능한 액세스 토큰과 리프레시 토큰을 앱에 전달
- 로그인 성공!

보기에는 쉬워 보이고, 우리가 Google과 Kakao로 OAuth를 사용했을 때와 큰 차이가 없어 보인다. 하지만 이 뒤에는 생각보다 많은 요소들이 존재하는데 그것들을 하나하나 살펴보도록 하겠다.

### 자세한 버전

상세하게는 아래 순서대로 작업이 이루어진다. 모르는 내용은 나중에 전부 설명할 것이니 일단은 흐름을 파악하면 된다:

#### 로그인 요청

이 과정은 OAuth 제공자를 통해 로그인을 시도한 사용자가 실제 사용자가 맞음을 증명하는 과정이다.

- 사용자가 앱에서 로그인을 시도
- 앱은 PKCE 규약에 따라 무작위 문자열 `code_verifier`를 생성하고, 이를 `code_challenge_method`에 따라 변환하여 `code_challenge`를 생성
- 앱은 `code_challenge`를 OAuth 제공자에 전송하면서 사용자에게는 로그인 화면을 열어줌
- 사용자가 로그인은 성공하면, 서버는 인가 코드(Auth Code)를 앱에 반환

#### 토큰 발급

이 과정은 사용자의 신원이 확인되었으므로 실제 로그인에 활용 가능한 액세스 토큰(리프레시는 선택적이다)을 서비스 서버로부터 발급받는 과정이다.

- 앱은 인가 코드와 `code_verifier`를 서비스 서버에 전달 (서비스가 서버를 통해 OAuth Token Exchange를 수행하는 구조라고 가정)
- 서비스 서버는 인가 코드와 `code_verifier`를 들고 OAuth 제공자에 토큰 발급 요청을 전달
- OAuth 제공자는 인가 코드와 PKCE를 검증한 뒤, OAuth 액세스 토큰과 필요한 경우 리프레시 토큰도 반환
- OIDC를 사용하는 경우 ID 토큰도 함께 반환
- 서비스 서버는 이 정보로 사용자를 식별하고 자체 서비스 계정과 연결
- 이후 필요하다면 서비스 서버가 자체 서비스용 액세스 토큰과 리프레시 토큰을 앱에 발급

단, 만약 여기서 OAuth 서비스 제공자의 데이터에 접근을 해야 한다면 OAuth 액세스 토큰을 사용해야 하지만, 소셜 로그인만 목적인 경우 OAuth 액세스 토큰은 사용자 정보를 가져오는 데 잠깐 쓰이고 폐기되거나, OIDC의 ID Token만으로 사용자 식별이 충분하다면 아예 별도로 소비할 필요조차 없을 수 있다. 예를 들어, Google로 소셜 로그인을 했을 때 로그인만이 목적이라면 Google Drive나 Google Calander에 접속할 필요가 없기 때문에 Google 액세스 토큰을 폐기하는 경우를 들 수 있다.

---

## 인증에 사용되는 도구

### 인가 코드 (Authorization Code)

인가 코드(Authorization Code)는 **OAuth 제공자가 앱에게 발급하는 짧은 수명의 인가**다. 앱은 이 코드를 OAuth 제공자의 토큰 발급 API에 제출하여 액세스 토큰으로 교환한다.

주의해야 할 점은 **인가 코드 자체를 사용자의 신원을 나타내는 토큰으로 보아서는 안 된다**는 점이다. 인가 코드의 정확한 의미는 “*사용자가 이 앱의 로그인 요청을 승인했으니, 이 코드를 가지고 토큰 발급을 진행할 수 있어.*”를 알리는 것에 불과하기 때문이다. 의사가 있는 것과 실제로 토큰을 발급하는 것은 다르다.

추가로, [표준](https://datatracker.ietf.org/doc/html/rfc6749)의 4장 일부 내용에 따르면, 인가 코드 취급 시에는 다음 보안 사항을 준수해야 한다:
- 인가 코드는 가능한 **보안 채널**로 보내야 한다. 예를 들어 HTTPS/TLS라던지.
- **일회용**이다. 한 번 사용되면 끝. 재사용 불가.
- 수명이 짧아야 한다. 표준에서는 최대 수명을 **10분**으로 제한할 것을 권장한다고 설명한다.

### PKCE (Proof Key for Code Exchange)

PKCE는 'Proof Key for Code Exchange'의 약자로, **OAuth 과정 중간에 발생할 수 있는 공격자 개입을 막는 역할**을 한다.

#### 구성 요소

PKCE는 크게 3가지 요소로 구성되는데 각각에 대한 설명은 아래와 같다:

- `code_verifier`: 접근 허가 요청와 토큰 발급 요청을 연결하기 위한 무작위 비밀 값
- `code_challenge`: `code_verifier`를 `code_challenge_method`로 처리한 결과
- `code_challenge_method`: `code_verifier`를 처리하기 위한 방법으로, 다음의 2가지 방법 허용:
  1. `plain`: 별도 처리 없이 `code_verifier`를 `code_challenge`로 그대로 사용
  2. `S256`: SHA-256 알고리즘을 포함하여 다음과 같이 계산: `code_challenge = BASE64URL-ENCODE(SHA256(ASCII(code_verifier)))`

참고로 RFC 7636에는 `plain`과 `S256`이 둘 다 정의되어 있지만, 현대 구현에서는 `S256`을 사용해야 한다고 보는 것이 안전하다. Kakao 개발자 콘솔에서도 PKCE 메소드를 `S256`만 지원하고 있다.

#### 가능한 공격 시나리오

그럼 공격자 개입이 언제 일어날까? PKCE가 주로 방어하는 공격 유형은 인가 코드 탈취(Authorization Code Interception Attack)다.

보통 앱에서는 다음 순서를 따라 인가 코드를 받아낸다:

> 1. 앱에서 이 앱으로 돌아오는 리다이렉트 URI와 함께 OAuth 제공자에게 로그인 요청
> 2. 로그인 성공
> 3. OAuth 제공자는 인가 코드를 지정된 리다이렉트 URI로 전송
> 4. 앱은 리다이렉트 URI로 받은 인가 코드를 토큰 발급을 위해 서비스 서버에 전공

인가 코드 탈취 공격은 위 과정 중 3번에서 일어날 수 있다. 만약 악성 앱이 정상 앱과 동일한 URI를 등록할 경우, 원래 정상 앱으로 돌아가야 할 인가 코드가 악성 앱으로 돌아갈 수 있기 때문이다. 악성 앱은 이렇게 탈취한 인가 코드를 받아 토큰 발급에 사용할 수 있게 된다. 즉, 다음과 같이 정리가 가능하다:

- **공격**은 인가 코드가 **OAuth 제공자에게서 앱으로 돌아오는 과정**에서 발생
- **탈취**는 인가 코드로 **토큰을 발급**받음으로써 성립

그렇기 때문에 만약 PKCE가 없다면, 공격자는 가로챈 인가 코드를 통해 토큰으로 교환할 수 있지만, PKCE를 사용하면 정상 앱만 `code_verifier`를 알고 있으므로, 공격자가 인가 코드를 가로채더라도 토큰으로 교환할 수 없게 된다.

---

## OAuth를 보완할 수 있는 도구

여기까지가 OAuth 2.0 본체와 PKCE 등 OAuth 표준 확장 및 실무 관례에 해당하는 내용이었다. 이제부터는 OAuth 자체와 별개로 Android 플랫폼에서 OAuth 흐름을 보완할 수 있는 수단을 살펴보자.

### Android 앱 서명 인증서

Android 앱 서명 인증서는 **해당 앱 바이너리가 특정 서명 키 서명되었음을 검증**하는 수단이다. 스토어에 배포 전 Release 키로 앱을 서명하곤 하는데 그 때 사용하는 키, 또는 Play 콘솔에 앱을 올렸을 때 Play 측에서 자동으로 서명해줄 때 사용하는 키 등이 대표적이다.

이 앱 서명 인증서를 통한 서명 확인 절차는 다음과 같다:

- 서명 결과와 서명 키에 대응하는 공개 키를 포함한 서명 인증서가 APK에 포함됨
- 서명을 확인하려는 자는 APK에 있는 공개 키로 서명 검증을 시도
- 공개 키-비밀 키 쌍이 대응되므로 서명이 유효함이 확인됨

Kakao는 이 앱 서명 인증서를 통해 OAuth를 요청하는 앱이 사전 등록된 앱인지를 검증한다. 정확히는 다음과 같다:

- 개발자는 앱 서명 인증서의 인코딩된 바이트에 SHA-1을 적용한 후, 그 결과를 Base64로 인코딩하여 키 해시 생성
- 개발자는 생성한 키 해시와 앱 패키지명을 Kakao 개발자 콘솔에 등록
- 이후 앱에서 OAuth 요청이 발생
- Kakao Auth 모듈은 요청을 발생시킨 앱의 인증서를 찾아 동일하게 `Base64(SHA1(Certificate))`를 통해 키 해시로 변환 후 로그인 요청
- Kakao 인증 서버는 로그인 요청에 포함된 키 해시가 개발자가 등록한 키 해시와 비교하여 일치하는 경우에만 로그인 절차를 진행

물론, 앱에 포함된 서명 인증서는 공개 정보이므로 키 해시 자체는 비밀 값이 아님을 인지해야 한다. Kakao의 키 해시 검증은 Android SDK가 현재 실행 중인 앱의 서명 인증서에서 계산한 값을 사전에 등록된 값과 비교하는 플랫폼 검증 수단이며, OAuth 요청 자체의 보안성을 크게 끌어올릴 수 있는 수단까지는 아니다.

### Android App Links

Android App Links는 **OAuth의 리다이렉트 과정에서 실제로 발생하는 문제를 직접 보완**하는 도구다.

#### 왜 필요한가

Native App에서 이런 Custom Scheme을 쓴다고 생각해보자.

```text
myapp://oauth/callback
```

OAuth 제공자는 다음 주소로 인가 코드를 담아 리다이렉트를 시도할 것이다:

```text
myapp://oauth/callback?code=ABC
```

여기서 가짜 앱이 위와 동일한 URL를 처리하겠다고 OS에 등록할 경우, **정상 앱과 가짜 앱이 동일한 URI 스킴을 가지게 되어 인가 코드가 가짜 앱으로 탈취되는 문제**가 생길 수 있다. PKCE가 바로 이 상황에서 코드가 탈취되더라도 토큰으로 교환하지 못하게 만드는 방어책인데, Android App Links는 HTTPS 도메인과 특정 Android 앱의 관계를 OS가 검증하여 해당 도메인의 URL을 검증된 앱으로 전달하도록 한다.

---

#### 동작 방식

Android App Links를 사용하면 리다이렉트 URI를 `https://auth.example.com/oauth/callback`처럼 만들고, **Android App Links로 해당 도메인이 실제 앱과 연결되었음을 검증**할 수 있다. 과정은 다음과 같다:

##### 앱 매니페스트 등록

```xml
<intent-filter android:autoVerify="true">
    ...
    https://auth.example.com/...
</intent-filter>
```

위와 같이 앱 매니페스트에 URI를 등록한다.

##### 서버에 URI 검증을 위한 파일 등록

```json
[
  {
    "relation": [
      "delegate_permission/common.handle_all_urls"
    ],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example.app",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:..."
      ]
    }
  }
]
```

서버의 URI `https://auth.example.com/.well-known/assetlinks.json`에 위와 같은 JSON 파일을 추가한다.

##### 앱 설치 시 검증

Android OS는 앱 설치 시, 매니페스트를 열어 해당 도메인에서 `assetlinks.json`을 받고, **패키지명과 서명 인증서의 SHA-256 지문을 검증**한다.

---

## 정리

OAuth가 진행되는 과정은 대부분 경험상 알고 있을 것이므로, 마지막에는 OAuth에서 사용하는 여러 보안 수단들이 어디서, 왜 사용하는지를 정리해보도록 하겠다:

|보안 수단|사용 시점|목적|
|---|---|---|
|**인가 코드**|토큰 발급 시|OAuth 제공자가 승인한 **인가를 토큰으로 교환**하기 위한 단기 자격 증명|
|**PKCE**|로그인 요청 및 인가 코드 검증|로그인 요청에 사용된 **`code_challenge`에 대응하는 `code_verifier`를 소유하고 있음**을 증명|
|**앱 서명 인증서**|OAuth 요청 시|로그인을 요청한 앱이 OAuth 제공자에 등록된 **정상적인 앱인지 확인**|
|**Android App Links**|인가 코드 리다이렉션|인가 코드 요청과 토큰 발급 요청을 연결|

---

## 참고 문헌
- [RFC-6749 OAuth 2.0 표준](https://datatracker.ietf.org/doc/html/rfc6749)
- [RFC7636 PKCE 표준](https://datatracker.ietf.org/doc/html/rfc7636)
- [OAuth 2.0 시스템 프론트엔드 개발기 - 1. PKCE](https://velog.io/@chchaeun/OAuth-2.0-%EC%8B%9C%EC%8A%A4%ED%85%9C-%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EA%B0%9C%EB%B0%9C%EA%B8%B0-1.-PKCE)
- [OAuth란? | Microsoft Security](https://www.microsoft.com/ko-kr/security/business/security-101/what-is-oauth)
- [카카오 로그인 > REST API - 카카오디벨로퍼스 | 문서](https://developers.kakao.com/docs/ko/kakaologin/rest-api?#oidc-discovery-response)
