interface School {
  name: string;
  qualification: string;
  period: string;
}

interface Activity {
  name: string;
  period: string;
  descriptions: string[];
}

const schools: School[] = [
  {
    name: '중앙대학교 소프트웨어학부 · 철학과',
    qualification: '졸업 · 소프트웨어학 주전공 / 철학 복수전공',
    period: '2018년 3월 - 2026년 8월',
  },
  {
    name: '춘천고등학교',
    qualification: '졸업',
    period: '2015년 3월 - 2018년 2월',
  },
];

const activities: Activity[] = [
  {
    name: 'YAPP 제28기',
    period: '2026년 5월 - 현재까지',
    descriptions: ['Android 개발자로 참여', '데모데이 우수상 수상'],
  },
  {
    name: '과학기술정보통신부 AI/SW마에스트로 제13기',
    period: '2022년 6월 - 2022년 12월',
    descriptions: ['Flutter 개발자로 참여'],
  },
  {
    name: '중앙대학교 자유토론동아리 비꼼',
    period: '2018년 - 2026년',
    descriptions: ['2022년 회장', '2023년 2학기 회장'],
  },
];

export default function ProfileEducation() {
  return (
    <section aria-labelledby="profile-education">
      <h2 id="profile-education" className="text-xl font-bold md:text-2xl">
        관련 교육·활동
      </h2>
      <section
        aria-labelledby="profile-schools"
        className="mt-4 border-t border-on-cream/20 pt-4 md:mt-6 md:pt-6"
      >
        <h3 id="profile-schools" className="text-lg font-bold md:text-xl">
          학교
        </h3>
        <ul className="mt-4 space-y-6 md:mt-6 md:space-y-8">
          {schools.map((school) => (
            <li key={school.name}>
              <p className="font-bold">{school.name}</p>
              <p className="mt-1 md:mt-2">{school.qualification}</p>
              <p className="mt-1 text-on-cream/70 md:mt-2">{school.period}</p>
            </li>
          ))}
        </ul>
      </section>
      <section
        aria-labelledby="profile-activities"
        className="mt-8 border-t border-on-cream/20 pt-4 md:mt-12 md:pt-6"
      >
        <h3 id="profile-activities" className="text-lg font-bold md:text-xl">
          활동
        </h3>
        <ul
          aria-label="활동 목록"
          className="mt-4 space-y-6 md:mt-6 md:space-y-8"
        >
          {activities.map((activity) => (
            <li key={activity.name}>
              <p className="font-bold">{activity.name}</p>
              <p className="mt-1 text-on-cream/70 md:mt-2">{activity.period}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 md:mt-3 md:space-y-2 md:pl-6">
                {activity.descriptions.map((description) => (
                  <li key={description}>{description}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
