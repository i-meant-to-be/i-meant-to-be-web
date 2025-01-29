interface TextButtonProps {
  text: string;
  url?: string;
}

export default function TextButton({ text, url }: TextButtonProps) {
  return (
    <button
      className="hover:text-slate-900"
      onClick={() => {
        if (url) {
          window.open(url, '_blank');
        }
      }}
    >
      <h1>{text}</h1>
    </button>
  );
}
