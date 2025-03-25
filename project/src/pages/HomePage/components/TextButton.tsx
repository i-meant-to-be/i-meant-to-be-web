interface TextLinkButtonProps {
  text: string;
  url?: string;
}

export default function TextButton({ text, url }: TextLinkButtonProps) {
  return (
    <button
      className="bg-primary-indigo text-primary-cream hover:bg-primary-indigo-enhance"
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
