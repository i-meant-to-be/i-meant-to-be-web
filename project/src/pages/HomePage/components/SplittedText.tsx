interface SplittedTextProps {
  text: string;
}

export default function SplittedText({ text }: SplittedTextProps) {
  const words = text
    .split(' ')
    .map((word, index) => <p key={index}>{`${word}\u00A0`}</p>);

  return <div className="flex flex-wrap">{words}</div>;
}
