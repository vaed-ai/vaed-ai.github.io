'use client'

import { useTheme } from './theme-provider'
import { useColors } from './colors'
import { Highlight, type PrismTheme } from 'prism-react-renderer'

const darkTheme: PrismTheme = {
  plain: { color: '#d4d4d4', backgroundColor: 'transparent' },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#555' } },
    { types: ['punctuation', 'operator'], style: { color: '#888' } },
    { types: ['property', 'tag', 'boolean', 'number', 'constant', 'symbol'], style: { color: '#ccc' } },
    { types: ['selector', 'attr-name', 'string', 'char', 'builtin'], style: { color: '#999' } },
    { types: ['keyword', 'important'], style: { color: '#fff', fontWeight: 'bold' as const } },
    { types: ['function', 'class-name'], style: { color: '#e0e0e0' } },
    { types: ['regex', 'variable'], style: { color: '#bbb' } },
    { types: ['attr-value', 'template-string'], style: { color: '#aaa' } },
  ],
}

const lightTheme: PrismTheme = {
  plain: { color: '#1a1a1a', backgroundColor: 'transparent' },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#aaa' } },
    { types: ['punctuation', 'operator'], style: { color: '#777' } },
    { types: ['property', 'tag', 'boolean', 'number', 'constant', 'symbol'], style: { color: '#333' } },
    { types: ['selector', 'attr-name', 'string', 'char', 'builtin'], style: { color: '#666' } },
    { types: ['keyword', 'important'], style: { color: '#000', fontWeight: 'bold' as const } },
    { types: ['function', 'class-name'], style: { color: '#222' } },
    { types: ['regex', 'variable'], style: { color: '#444' } },
    { types: ['attr-value', 'template-string'], style: { color: '#555' } },
  ],
}

export function Code({ children, language = 'tsx' }: {
  children: string
  language?: string
}) {
  const { theme } = useTheme()
  const colors = useColors()
  const prismTheme = theme === 'dark' ? darkTheme : lightTheme

  return (
    <Highlight theme={prismTheme} code={children.trim()} language={language}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <pre style={{
          fontFamily: '"Menlo", "Consolas", "Liberation Mono", monospace',
          fontSize: 13,
          background: colors.glow,
          padding: '12px 16px',
          lineHeight: 1.7,
          overflowX: 'auto',
          margin: 0,
        }}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}
