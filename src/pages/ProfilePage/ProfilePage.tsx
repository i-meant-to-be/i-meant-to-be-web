import Layout from '../../components/Layout';
import Seo from '../../components/Seo';
import routes from '../../routes/route';
import ProfileIntro from './components/ProfileIntro';
import ProfileExperiences from './components/ProfileExperiences';
import ProfileSkills from './components/ProfileSkills';
import ProfileEducation from './components/ProfileEducation';

export default function ProfilePage() {
  return (
    <Layout>
      <Seo path={routes.PROFILE} />
      <main className="flex min-w-0 flex-col gap-12 select-text wrap-break-word text-sm leading-relaxed md:gap-16 md:text-base">
        <ProfileIntro />
        <ProfileExperiences />
        <ProfileSkills />
        <ProfileEducation />
      </main>
    </Layout>
  );
}
