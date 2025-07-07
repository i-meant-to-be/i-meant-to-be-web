import { BiSolidCoffeeBean } from 'react-icons/bi';
import {
  IoMusicalNotesSharp,
  IoPencilSharp,
  IoPersonSharp,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import routes from '../routes/route';

export default function Header() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-row justify-between mb-32">
      <button
        className="bg-indigo size-12 p-3 transition-all hover:bg-indigo-enhanced md:p-4 md:size-20"
        onClick={() => navigate(routes.ROOT)}
      >
        <IoPersonSharp className="size-full text-cream" />
      </button>

      <section className="flex flex-row space-x-4">
        <button
          className="bg-indigo size-12 p-3 transition-all hover:bg-indigo-enhanced md:p-4 md:size-20"
          onClick={() => navigate(routes.POST)}
        >
          <IoPencilSharp className="size-full text-cream" />
        </button>

        <button
          className="bg-indigo size-12 p-3 transition-all hover:bg-indigo-enhanced md:p-4 md:size-20"
          onClick={() => navigate(routes.MUSIC)}
        >
          <IoMusicalNotesSharp className="size-full text-cream" />
        </button>
      </section>
    </div>
  );
}
