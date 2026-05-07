import { RelativeDatePipe } from './relative-date.pipe';

describe('RelativeDatePipe', () => {
  let pipe: RelativeDatePipe;

  beforeEach(() => { pipe = new RelativeDatePipe(); });

  it('should return "just now" equivalent for recent dates', () => {
    const recent = new Date(Date.now() - 30000).toISOString();
    expect(pipe.transform(recent, 'en')).toContain('now');
  });

  it('should return minutes ago for dates < 1 hour', () => {
    const ago = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(pipe.transform(ago, 'en')).toContain('min');
  });

  it('should return hours ago for dates < 24 hours', () => {
    const ago = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(pipe.transform(ago, 'en')).toContain('hour');
  });

  it('should return days ago for older dates', () => {
    const ago = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(pipe.transform(ago, 'en')).toContain('day');
  });
});
