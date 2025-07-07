import Markdown from 'react-markdown';
import { Post } from '../../../utils/posts';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

interface PostItemProps {
  post: Post;
}

export default function PostItem(props: PostItemProps) {
  const post = props.post;

  return (
    <div className="flex w-full">
      <section>
        <Markdown
          rehypePlugins={[rehypeHighlight]}
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ ...props }) => (
              <h1
                {...props}
                className="font-bold font-noto-sans-kr text-4xl mt-8 mb-4 bg-indigo text-cream p-2 w-fit"
              />
            ),
            h2: ({ ...props }) => (
              <h2
                {...props}
                className="font-bold font-noto-sans-kr text-2xl mt-6 mb-3 text-on-cream p-2 w-fit"
              />
            ),
            h3: ({ ...props }) => (
              <h3
                {...props}
                className="font-semibold font-noto-sans-kr text-xl mt-4 mb-2 p-2 text-on-cream w-fit"
              />
            ),
            p: ({ ...props }) => (
              <p
                {...props}
                className="font-noto-sans-kr text-on-cream mb-2 w-fit"
              />
            ),
          }}
        >
          {post.content}
        </Markdown>
      </section>
    </div>
  );
}
