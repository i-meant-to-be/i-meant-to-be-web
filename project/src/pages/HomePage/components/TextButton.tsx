interface TextLinkButtonProps {
  text: string;
  url?: string;
}

export default function TextButton({ text, url }: TextLinkButtonProps) {
  return (
    <button
      className="bg-indigo text-cream hover:bg-indigo-enhanced transition-all"
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
