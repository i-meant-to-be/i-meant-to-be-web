---
title: 액세스/리프레시 토큰 관리 도구 구현 - Jetpack Compose
description: 왜 모바일에서는 웹에서처럼 세션 저장소 "딸깍"하면 안 될까?
date: 2025-08-03
category: 개발
tags: [jetpack compose, oAuth]
---

## 들어가기
### 배경
현재 나는 React 기반 웹 앱을 Android에서 동작하는 Jetpack Compose 앱으로도 서비스할 수 있게 준비하고 있다. 이 과정에서, 기존 웹 앱에서 사용하던 Google OAuth를 Compose에서도 쓰기 위해, 액세스 토큰과 리프레시 토큰을 저장해야 할 필요가 생겼다. 근데 관련한 지식이 나에겐 없어서, AI 딸깍해서 코드만 취하기에는 코드 자체가 이해가 어렵더라. 그래서 배경 지식을 먼저 확실히 배우고 구현에 들어가기로 했다. 이 게시물은 그 배경 지식들을 나의 이해를 돕기 위해 정리한 글이다.

### OAuth와 액세스 토큰, 리프레시 토큰
쉽게 말하면, Google ID와 PW를 제3자 서비스에 노출하지 않고 Google이 사용자를 대신 인증해주기 위해 사용하는 것으로 보인다. 아무래도 신뢰하기 어려운 제3자에게 (개인의 거의 모든 정보가 담긴 Google 계정의) ID와 PW를 넘겨주는 건 좀 그러니까.

나는 OAuth를 처음 접해봐서, Gemini에게 간단하게 과정을 설명해달라고 요구했다. 그 내용을 간단히 옮겨 보겠다:

#### 토큰 발급 과정
##### 접근 요청
메모 앱이 내 Google 캘린더 정보를 보고 싶어한다. "Google 계정으로 로그인" 버튼을 눌러, OAuth를 시작한다.

##### Google로 이동
메모 앱은 인증을 위해 나를 Google로 보낸다.

##### 인증 및 동의
나는 Google에 로그인을 하고, Google은 내게 메모 앱에 캘린더 접근 권한을 줄 것이냐고 묻는다. 나는 동의 버튼을 누르게 된다.

##### 권한 코드 발급 및 서명(?)
나의 동의를 확인하면, Google은 메모 앱에 권한 코드(authorization code)라는 것을 보낸다. 이건 일종의 임시 확인증 같은 것으로, 아직 최종 승인을 받은 게 아니다. 왜냐하면 Google은 지금 실행되고 있는 메모 앱이 가짜가 아닌지 확인할 수 없기 때문이다. 따라서 메모 앱은 자신이 진짜 메모 앱이라는 걸 증명할 필요가 있다.

개발을 하면서 NAVER 지도 API 서비스 같은 걸 사용하다 보면, API 키 같은 걸 제공하고는 한다. 이 API 키는 각 개인에게 고유하게 지급되기 때문에, 개인을 식별할 수 있는 도구가 된다. Google OAuth를 사용하기 위해 Google Cloud Platform에서도 이 API 키에 해당하는 걸 발급을 해 주는데, 앱 개발 시에 이걸 반드시 집어넣게 되어 있다.  이 API 키를 권한 코드에 붙여서 Google에게 "나 진짜 메모 앱이고 그 증거로 이 API 키를 보낼게. 승인해줘!"라고 말하게 되는 것이다.

서명(?)이라고 쓴 이유는 내부적으로 진짜 서명이 이루어지는지, 아니면 서명은 아니지만 이와 유사한 작업인지, 지금 알고 있는 내용으로는 확실히 판단할 수 없어서이다. 그래서 모호하게 써 놨다.

##### 토큰 수령
앱의 API 키를 확인한 Google은 "얘는 진짜 메모 앱이구나."라는 것을 알게 되고, 적합한 요청이므로 액세스 토큰과 리프레시 토큰을 제공한다. 최종 승인이다. 이제부터 메모 앱은 이 토큰을 사용해 Google의 캘린더 데이터에 접근할 수 있다.

#### 두 토큰의 역할
그럼 2개 토큰은 어떤 일을 할까? 뭐하러 토큰을 2개나 발급해주는 걸까? 이는 보안 위협 때문이다. 만약 토큰 1개만 주고 "이거 평생 써먹어라" 하면 보안에 취약해진다. 한 번만 탈취하면 그 이후부터는 계속 사용 가능하기 때문이다. 그래서 데이터에 접근할 수 있는 토큰에는 제한을 두어야 한다. 이게 액세스 토큰이다.

> #### 액세스 토큰
액세스 토큰은 데이터에 직접 접근(access)할 수 있다. 다만, 제한 시간이 있다. Gemini에 따르면, 보통 3,600초 정도란다. 이건 뭐 서비스나 OAuth 공급자 정책에 따라 다르겠지만, 1시간 정도니까, 공격을 당한다고 해도 그나마 평~생 털릴 걱정은 없다. 그런데 만약 액세스 토큰이 만료되면? 사용자도 1시간 뒤에는 서비스에 접근할 수 없을 것이다. 그래서 주기적으로 재발급을 해 줘야 하는데, 재발급을 위해 필요한 게 리프레시 토큰이다.

> #### 리프레시 토큰
리프레시 토큰은 액세스 토큰을 갱신(refresh)해준다. 액세스 토큰과는 달리 데이터에 접근이 불가능하다.

이처럼, 역할이 분리된 두 가지 토큰을 사용하면, 공격에 어느 정도 대비하면서도 안전하게 인증을 받고 데이터에 접근할 수 있다.

### 웹과 앱에서의 OAuth 차이점
이 지점에서 질문이 생긴다. 내가 지금 토큰 관리자를 구현하려는 이유는, 암호화된 토큰을 안전하게 저장하기 위해서이다. 그러나, 웹 환경에서는 암호화? 그런 거 하지 않는다. 특히나 액세스 토큰 같은 경우는, 웹에서는 암호화가 전혀 안 된 세션 스토리지에 저장해서 사용하는 경우가 잦다. 나는 왜 앱 환경에서는 암호화를 하면서, 웹에서는 그렇지 않은지가 궁금해서 이 부분을 LLM들에게 물어봤다.

#### 모바일 환경에서의 주요 보안 위협: 물리적 탈취 및 공격
모바일 환경에서 주요한 보안 위협은 파일 자체에 대한 물리적인 접근이다. 가장 흔한 시나리오로는 그냥 디바이스 자체를 훔치거나 도난당하는 경우가 있겠다. 이에 더해, 탈옥이나 루팅 등으로 내부 저장소에 더 쉽게 접근할 수 있게 되는 경우도 있다. 따라서, 이런 물리적 위협이 발생하여 파일에 접근이 가능해지는 불상사가 생겨도, 파일을 읽는 것 자체가 소용이 없게 토큰을 암호화하는 게 모바일에서는 적합한 전략인 것이다.

#### 웹 환경에서의 주요 보안 위협: XSS 공격
XSS 공격(Cross-Site Scripting)은 웹 사이트에 악성 스크립트를 사용하여 공격하는 것을 말한다. 즉, 정상 실행되어야 할 스크립트를 다른 악성 스크립트로 교체하여 그게 대신 실행되게 하는 것이다. XSS 공격이 주된 위협이라면, 토큰의 암호화는 아무런 의미가 없다. Samsung Knox처럼 보안을 위한 별도 물리 프로세서나 컨테이너가 마련되어 있는 모바일 디바이스와는 다르게, 웹 브라우저는 그런 거 없기 때문이다.

왜 웹 환경에서 암호화가 의미가 없을까? 이를 이해하기 위해, 토큰을 암호화해서 저장했다고 가정해보자. 이 토큰을 사용하려면 언젠가는 복호화를 해야 하고, 그 복호화 키는 자바스크립트가 접근할 수 있는 어딘가(메모리, 변수 등)에 있어야 할 것이다. 그럼 공격자 스크립트는 암호화된 토큰과 그 복호화 키를 함께 훔쳐가서 자신의 서버에서 복호화하면 그만이다. 애초에 암호화해서 얻을 수 있는 실익이 크지 않은 것이다.

따라서 웹 브라우저에서는 토큰을 암호화하는 것보다는, XSS 공격을 막는 것을 가장 중요하게 본다. 만약 XSS 공격으로 인해 액세스 토큰이 탈취되어도, 공격의 영향이 크지 않게 재설정 시간도 매우 짧게 설정한다. 그리고 이 액세스 토큰을 재발급할 수 있는 ***가장 중요하고 꼭 지켜야 하는*** 리프레시 토큰은, 모바일 환경에서처럼 격리된 공간인 쿠키에 저장한다. 쿠키는 `HttpOnly` 쿠키라고, JS가 아예 접근조차 할 수 없는 공간에 분리되어 저장되고, 다음 보안 옵션도 설정하여 최대한 안전성을 확보한다:

- `Secure` 옵션은 HTTPS 프로토콜에서만 쿠키가 전송되도록 강제한다.
- `SameSite` 옵션은 CSRF(Cross-Site Request Forgery) 공격을 방어하기 위한 옵션이다. 쿠키가 다른 도메인을 가진 사이트에 보내지는 것을 막는다.

#### 정리
정리하면, 모바일과 웹 환경은 서로 많이 다르기 때문에, 각 환경의 고유 특성과 가장 위협적인 공격에 맞추어 다르게 대응하게 되는 것이다.

## 구현
### 과정
자, 이제 왜 토큰을 암호화해야 하는지를 알았으니 구현을 해도 되겠다. 먼저, 무엇이 필요한지를 식별해야 한다:

> 나는 Google에게 받은 액세스 토큰과 리프레시 토큰을, 암호화한 후, 기기에 저장해야 한다.

즉, 나는 다음과 같은 도구를 구현해야만 하는 것이다:

- 평문 토큰을 암/복호화하는 유틸
- 암호화된 토큰을 R/W할 수 있는 저장소

찬찬히 진행해보자.

### 암/복호화 유틸 구현
순서상 이게 먼저 되어야 한다. 그래야 토큰 저장소에서 이걸로 암/복호화를 할 테니까.

##### 암호화 정책

먼저 암호화 정책을 정해야 한다. 이것저것 고려해보고 Gemini와도 얘기해본 결과, 아래 정책을 사용하기로 했다:

- 암호화 알고리즘 AES
- 비트 수 256
- 블록 모드 GCM (갈루아/카운터 모드)
- 패딩 없음

대충 학교에서는 블록 암호인 AES의 성능 향상을 위해 블록 단위로 병렬 처리하는 방법이 여러 가지가 있는데, 그 중 가장 좋은 방법이 카운터 방법이라고 배웠다. 병렬 처리와 사전 연산이 모두 가능하기 때문이다. 갈루아/카운터 모드는 카운터 모드에 무결성과 인증을 위한 대책까지 포함한 방법이라고 한다. 아무튼 현재로서는 제일 좋다는 말인 것 같다. 추가로, 어쨌든 카운터 모드를 사용하기 때문에 IV(initialization vector)가 필요하다. 이것도 염두에 두어야 한다.

##### 토큰 저장을 위한 구조 정의

다음으로는 토큰을 기기에 어떻게 저장할지 그 구조를 정해야 한다. Gemini는 토큰을 바이트 스트림으로 저장할 거기 때문에, 두 토큰을 하나로 접합(concat)하여 관리하기 편하게 하는 방안을 추천했다. 그래서 구현은 아래와 같이 진행했다:

```kotlin
@Serializable
data class TokenBundle(
    val accessToken: String,
    val refreshToken: String,
)

```

먼저, `@Serializable` 어노테이션을 달아서 JSON으로의 직렬화/역직렬화가 가능하게 하였다. 왜냐하면, 액세스 토큰과 리프레시 토큰을 JSON 문자열로 변환하고 이를 바이트 스트림으로 바꿀 것이기 때문이다. 이에 대응하여, Proto 자료형도 아래와 같이 정의했다:

```proto
syntax = "proto3";

option java_package = "com.my.app";
option java_multiple_files = true;

message EncryptedTokens {
  bytes encrypted_token_bundle = 1;
  bytes initialization_vector = 2;
}
```

직렬화되어 JSON 문자열이 된 토큰 번들은 바이트 스트림으로 바뀌어 `encrypted_token_bundle`이라는 이름으로 Proto DataStore에 저장된다. 동일하게, 암호 생성에 필요한 IV가 저장될 공간도 미리 준비해둔다.

##### 암호화 관리자 `CryptoManager` 구현

다음으로는 실제 암/복호화를 담당할 유틸을 구현하자. 가장 먼저, 테스트 환경을 고려해서 가짜 암호화 관리자를 구현할 것에 대비하여, 아래와 같이 인터페이스를 미리 선언해둔다:

```kotlin
interface CryptoManager {
    fun encrypt(plainText: String): Pair<ByteArray, ByteArray>
    fun decrypt(encryptedText: ByteArray, iv: ByteArray): String
}
```

그리고 이 인터페이스를 바탕으로 실제 구현체를 짜 보자:

```kotlin
class CryptoManagerImpl @Inject constructor() : CryptoManager {
	// 구현이 들어갈 자리
}
```

먼저 위와 같이 `CryptoManager` 인터페이스를 상속하도록 하고, Hilt가 어떻게 얘를 만들어야 할지 알 수 있도록 `@Inject constructor`를 달아준다.

```kotlin
companion object {
  // Define the constants for the encryption algorithm and key alias
  private const val KEY_ALIAS = "debate_timer_oauth_key"
  private const val ANDROID_KEYSTORE = "AndroidKeyStore"
  private const val ALGORITHM = KeyProperties.KEY_ALGORITHM_AES
  private const val BLOCK_MODE = KeyProperties.BLOCK_MODE_GCM
  private const val PADDING = KeyProperties.ENCRYPTION_PADDING_NONE
  private const val KEY_SIZE = 256
  private const val TRANSFORMATION = "AES/GCM/NoPadding"
}
```

다음으로는 아까 정해둔 암호화 정책과 관련한 값들을 클래스 컴패니언 객체로 생성한다.

```kotlin
/**
* Android Keystore에 저장된 키를 가져오거나, 없다면 새로 생성합니다.
*/
private fun getOrCreateKey(): SecretKey {
    // 1. Try to get the key
    val existingKey = keyStore.getEntry(KEY_ALIAS, null) as? KeyStore.SecretKeyEntry

    // 2. If key exists, return it
    if (existingKey != null) {
    	return existingKey.secretKey
    }

    // 3. Else, prepare key generation spec
    val paramsBuilder = KeyGenParameterSpec.Builder(
    	KEY_ALIAS,
    	KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
    )
    paramsBuilder.apply {
    	setBlockModes(BLOCK_MODE)
    	setEncryptionPaddings(PADDING)
    	setKeySize(KEY_SIZE)
    }

    // 4. Generate key with the spec
    val keyGenerator = KeyGenerator.getInstance(ALGORITHM, ANDROID_KEYSTORE)
    keyGenerator.init(paramsBuilder.build())
    return keyGenerator.generateKey()
}
```

다음으로는 가장 중요한 키를 Android Keystore에서 가져오는 함수다. 키가 없을 경우에는 생성하고, 키가 있다면 가져오도록 구현한다. 또한, 아까 전에 선언해 두었던 암호화 정책 관련 상수들을 사용해서, 정책이 반영되어 키가 생성되도록 하자.

```kotlin
override fun encrypt(plainText: String): Pair<ByteArray, ByteArray> {
  // 1. Load cipher instance
  val cipher = Cipher.getInstance(TRANSFORMATION)

  // 2. Init cipher with encryption mode
  cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey())

  // 3. Return encrypted text and IV
  return Pair(cipher.doFinal(plainText.toByteArray()), cipher.iv)
}

override fun decrypt(encryptedText: ByteArray, iv: ByteArray): String {
  // 1. Load cipher instance and prepare variables
  val cipher = Cipher.getInstance(TRANSFORMATION)
  val spec = GCMParameterSpec(128, iv)

  // 2. Init cipher with decryption mode
  cipher.init(Cipher.DECRYPT_MODE, getOrCreateKey(), spec)

  // 3. Return decrypted text
  return String(cipher.doFinal(encryptedText), Charsets.UTF_8)
}
```

마지막으로, 방금 만들어 둔 키 생성 함수로 암/복호화하는 함수를 구현한다. Java의 `Cipher` 객체를 사용하여 구현하면 된다. 또한, 이 함수들은 인터페이스에서 반드시 구현하도록 지정해 둔 함수이므로, `override`를 붙이는 것도 까먹지 말자.

이렇게 하면 암호화 유틸은 완성이다. 이제 얘를 써먹어서 토큰을 R/W하는 저장소만 구현하면 된다.


### 토큰 저장소 구현
##### Protobuf 직렬화/역직렬화 코드 구현

```kotlin
const val FILE_NAME = "encrypted_tokens.pb"

object TokenSerializer : Serializer<EncryptedTokens> {
    override val defaultValue: EncryptedTokens = EncryptedTokens.getDefaultInstance()

    override suspend fun readFrom(input: InputStream): EncryptedTokens {
        try {
            return EncryptedTokens.parseFrom(input)
        } catch (exception: InvalidProtocolBufferException) {
            throw CorruptionException("Cannot read proto.", exception)
        }
    }

    override suspend fun writeTo(t: EncryptedTokens, output: OutputStream) {
        t.writeTo(output)
    }
}

val Context.tokenDataStore: DataStore<EncryptedTokens> by dataStore(
    fileName = FILE_NAME,
    serializer = TokenSerializer
)
```

먼저 Protobuf를 사용하는 만큼 직렬화/역직렬화 코드를 만들고, `DataStore` 객체를 Android `Context`에 붙여줘야 한다. Proto DataStore 그 자체에 관해서는 다른 게시글에서도 다룬 바 있을 테니 설명은 생략한다.

##### 저장소 인터페이스 구현
마찬가지로 테스트 용이성을 위해 인터페이스를 먼저 선언하고, 그걸 구현하는 식으로 저장소를 만들 예정이다. 인터페이스는 간단하다:

```kotlin
interface TokenRepo {
    suspend fun getTokens(): Result<TokenBundle>
    suspend fun saveTokens(bundle: TokenBundle): Result<Boolean>
}
```

##### 저장소 구현체 구현
인터페이스를 정의했으니, 이제 각각 토큰을 읽고 쓰는 함수를 구현해야 한다. 가장 먼저, Hilt가 적절하게 필요한 것들을 주입해줄 수 있게 클래스 서명을 다음과 같이 정의한다:

```kotlin
class TokenRepoImpl @Inject constructor(
    @ApplicationContext context: Context,
    private val cryptoManager: CryptoManager
) :
    TokenRepo {
    private val tokenDataStore: DataStore<EncryptedTokens> = context.tokenDataStore
 
    // 그 외 다른 코드
}
```
이렇게 해줌으로써 Hilt가 무엇을 넣어서 `TokenRepoImpl`을 만들어야 할지, 어느 범위의 `Context`를 넣어줘야 할지를 알 수 있게 되었다. 또한, 이 `Context`를 사용해서 아까 붙여준 Proto DataStore에도 접근이 가능하게 되었다. 이제 이것들을 바탕으로 읽기/쓰기 함수를 구현하면 된다.


```kotlin
private suspend fun getBundle(): TokenBundle? {
    try {
        val encryptedTokens = tokenDataStore.data.first()
        val ciphertext = encryptedTokens.encryptedTokenBundle.toByteArray()
        val iv = encryptedTokens.initializationVector.toByteArray()
        val decryptedTokens = cryptoManager.decrypt(ciphertext, iv)

        return Gson().fromJson(decryptedTokens, TokenBundle::class.java)
    } catch (_: NoSuchElementException) {
        return null
    } catch (e: Exception) {
        throw e
    }
}

override suspend fun getTokens(): Result<TokenBundle> {
    try {
        val bundle = getBundle()

        return if (bundle != null) {
            Result.success(bundle)
        } else {
            Result.failure(NoSuchElementException())
        }
    } catch (e: Exception) {
        return Result.failure(e)
    }
}
```

먼저 토큰 읽기 함수다. 대충 순서는 아래와 같다:
- Proto DataStore에서 암호화된 토큰 번들과 IV를 불러옴
- 아까 만들어 둔 암호화 유틸로 복호화
- 성공 시 토큰 번들 반환

굳이 눈 여겨볼 점이 있다면 결과를 `Result<T>`로 감쌌다는 점이겠다. 얘도 결국 저장소이기 때문에 일종의 데이터 입출력에 해당해서, UI를 처리할 때 비동기적으로, 처리 상태에 따라 다른 내용을 보여주어야 한다. 이를 대비하기 위해 미리 `Result<T>`로 감싸서, 추후 조건부 렌더링이 편하게 정리해두었다.

```kotlin
override suspend fun saveTokens(bundle: TokenBundle): Result<Boolean> {
    try {
        tokenDataStore.updateData { current ->
            val serializedBundle = Gson().toJson(bundle)
            val encryptionOutput = cryptoManager.encrypt(serializedBundle)

            current.toBuilder()
                .setEncryptedTokenBundle(encryptionOutput.first.toByteString())
                .setInitializationVector(encryptionOutput.second.toByteString())
                .build()
        }

        return Result.success(true)
    } catch (e: Exception) {
        return Result.failure(e)
    }
}
```

다음으로는 토큰 쓰기 함수다. 암호화를 암호화 도구에 요청하면, 암호화 결과물과 암호화에 쓴 IV를 돌려줄 것이다. 이 두 가지를 Proto DataStore에 저장하면 된다. 마찬가지로 처리에 성공하면 `Result<Boolean>`을 반환하여 추후 비동기 조건부 렌더링이 편하게 만들어 두었다.

## 결론
웹 환경과는 다르게, 모바일 환경에서는 토큰 암호화와 관리에 신경을 많이 써 주어야 한다. 이를 위해, 나는 다음 2가지 도구를 구현했다:

- 토큰 암/복호화 도구
- 암호화한 토큰과 IV를 저장하는 Proto DataStore 저장소

웹 환경에선 그냥 헤더에 액세스 토큰 붙이고 관리도 세션 저장소에서 딸깍 하면 되는데 얘는 손이 왜 이렇게 많이 가는지 모르겠다. Android 바이너리를 이용해야만 테스트가 가능하기 때문에, 자원도 많이 먹는다. 여러모로 웹이 가볍다는 부분을 깨닫는 지점이다.

그래도 난 Android가 좋다...