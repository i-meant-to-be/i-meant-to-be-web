import { PropsWithChildren } from 'react';
import Footer from './Footer';
import Header from './Header';

export default function Layout(props: PropsWithChildren) {
  const { children } = props;

  return (
    <div className="flex items-start justify-baseline w-full min-h-screen px-10 py-32 font-noto-sans-kr md:px-20 md:py-40 select-none bg-cream">
      <section className="flex flex-col w-full max-w-[1024px]">
        <Header />
        {children}
        <Footer />
      </section>
    </div>
  );
}
