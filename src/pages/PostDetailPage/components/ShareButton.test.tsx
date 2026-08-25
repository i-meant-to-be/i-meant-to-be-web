import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ShareButton from './ShareButton';

describe('ShareButton', () => {
  it('copies the current URL and shows the copied state', async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValueOnce(undefined);
    render(<ShareButton />);

    await user.click(screen.getByRole('button', { name: '게시글 링크 복사' }));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(screen.getByText('복사됨').className).not.toContain('invisible');
    expect(screen.getByText('공유').className).toContain('invisible');
  });

  it('shows a failed state instead of throwing when the clipboard write rejects', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(
      new Error('denied'),
    );
    render(<ShareButton />);

    await user.click(screen.getByRole('button', { name: '게시글 링크 복사' }));

    expect(screen.getByText('복사 실패').className).not.toContain('invisible');
  });
});
