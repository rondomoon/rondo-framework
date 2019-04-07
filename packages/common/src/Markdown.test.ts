import {Markdown} from './Markdown'

describe('Markdown', () => {

  const markdown = new Markdown()

  describe('parse', () => {
    it('sanitizes html', () => {
      const html = markdown.parse(
        `Hey check [this](example.com)!

<script>alert(2)</script>
<a href='mailto:test@test.com'>Test</a>
<img src="/my/image" onerror="javascript:alert(1)">`)
      expect(html).toEqual(`<p>Hey check <a href="example.com">this</a>!</p>

<p><a href="mailto:test@test.com">Test</a>
<img src="/my/image" /></p>
`)
    })
  })

})
