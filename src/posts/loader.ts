import type { LoaderFunctionArgs } from 'react-router-dom';
import { loadPost } from './index';
export async function loader({ params }: LoaderFunctionArgs) {
  return params.id ? ((await loadPost(params.id)) ?? null) : null;
}
