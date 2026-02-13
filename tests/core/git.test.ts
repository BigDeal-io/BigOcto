import { describe, it, expect } from 'vitest';
import { parseGitRemoteUrl } from '../../src/core/git.js';

describe('parseGitRemoteUrl', () => {
  it('parses SSH URL', () => {
    const result = parseGitRemoteUrl('git@github.com:bigdealio/mzconnect.git');
    expect(result).toEqual({
      owner: 'bigdealio',
      name: 'mzconnect',
      fullName: 'bigdealio/mzconnect',
    });
  });

  it('parses SSH URL without .git suffix', () => {
    const result = parseGitRemoteUrl('git@github.com:bigdealio/bigmux');
    expect(result).toEqual({
      owner: 'bigdealio',
      name: 'bigmux',
      fullName: 'bigdealio/bigmux',
    });
  });

  it('parses HTTPS URL', () => {
    const result = parseGitRemoteUrl('https://github.com/bigdealio/bigocto.git');
    expect(result).toEqual({
      owner: 'bigdealio',
      name: 'bigocto',
      fullName: 'bigdealio/bigocto',
    });
  });

  it('parses HTTPS URL without .git suffix', () => {
    const result = parseGitRemoteUrl('https://github.com/owner/repo');
    expect(result).toEqual({
      owner: 'owner',
      name: 'repo',
      fullName: 'owner/repo',
    });
  });

  it('parses HTTP URL', () => {
    const result = parseGitRemoteUrl('http://github.com/owner/repo.git');
    expect(result).toEqual({
      owner: 'owner',
      name: 'repo',
      fullName: 'owner/repo',
    });
  });

  it('returns null for non-GitHub URL', () => {
    expect(parseGitRemoteUrl('git@gitlab.com:owner/repo.git')).toBeNull();
  });

  it('returns null for invalid URL', () => {
    expect(parseGitRemoteUrl('not-a-url')).toBeNull();
  });
});
