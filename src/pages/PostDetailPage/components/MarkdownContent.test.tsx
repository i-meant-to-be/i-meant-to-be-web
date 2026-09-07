import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MarkdownContent from './MarkdownContent';

describe('MarkdownContent', () => {
  it('uses the responsive paragraph text size', () => {
    render(<MarkdownContent content="본문" />);

    expect(screen.getByText('본문')).toHaveClass('text-sm', 'md:text-lg');
  });

  it('uses the responsive text size for level-five headings', () => {
    render(<MarkdownContent content="##### 다섯 번째 단계 제목" />);

    expect(screen.getByRole('heading', { level: 5 })).toHaveClass(
      'text-sm',
      'md:text-lg',
    );
  });

  it('uses the responsive text size for list items', () => {
    render(<MarkdownContent content="- 목록 항목" />);

    expect(screen.getByRole('listitem')).toHaveClass(
      'text-sm',
      'md:text-lg',
    );
  });

  it('renders normalized emphasis without exposing Markdown markers', () => {
    render(
      <MarkdownContent content={`'**내용**'으로 **한국어**(English)는 '***강한 강조***'`} />,
    );

    expect(screen.getByText('내용').closest('strong')).not.toBeNull();
    expect(screen.getByText('한국어').closest('strong')).not.toBeNull();
    expect(screen.getByText('강한 강조').closest('strong')).not.toBeNull();
    expect(document.body).not.toHaveTextContent('**');
  });
});
