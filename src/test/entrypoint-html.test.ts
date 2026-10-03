import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const pages = ['newtab', 'settings'] as const;

describe.each(pages)('%s entrypoint html', (page) => {
  const html = readFileSync(resolve(__dirname, '../entrypoints', page, 'index.html'), 'utf-8');
  const head = html.slice(html.indexOf('<head>'), html.indexOf('</head>'));

  it('should paint a dark base background on the root element before the bundle loads', () => {
    expect(head).toMatch(/<style>\s*html\s*\{[^}]*background:\s*#0a1220/);
  });

  it('should not paint the body, so the root background is not covered', () => {
    expect(head).not.toMatch(/body\s*[,{]/);
  });

  it('should declare a dark color scheme', () => {
    expect(head).toMatch(/color-scheme:\s*dark/);
  });

  it('should load the early background script synchronously after the base style', () => {
    const tag = head.match(/<script[^>]*early-background\.js[^>]*>/)?.[0] ?? '';

    expect(tag).not.toBe('');
    expect(tag).not.toMatch(/\b(defer|async|type="module")/);
    expect(head.indexOf('<style>')).toBeLessThan(head.indexOf('early-background.js'));
  });
});
