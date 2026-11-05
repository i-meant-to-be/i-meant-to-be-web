export default function ProfileSkills() {
  return (
    <section aria-labelledby="profile-skills">
      <h2 id="profile-skills" className="text-xl font-bold md:text-2xl">
        사용 기술
      </h2>
      <dl className="mt-4 space-y-6 border-t border-on-cream/20 pt-4 md:mt-6 md:space-y-8 md:pt-6">
        <div>
          <dt className="font-bold">
            주 스택 · Android, Kotlin, Jetpack Compose
          </dt>
          <dd className="mt-2 md:mt-3">
            비동기 처리, 멀티 모듈 아키텍처, 재사용 가능한 Gradle 컨벤션
            스크립트, Kotlin Multiplatform(KMP) 및 Compose Multiplatform(CMP)
            경험이 있습니다.
          </dd>
        </div>
        <div>
          <dt className="font-bold">부 스택</dt>
          <dd className="mt-2 md:mt-3">React, TypeScript</dd>
        </div>
      </dl>
    </section>
  );
}
