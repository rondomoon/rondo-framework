import marked from 'marked'
import sanitize from 'sanitize-html'

const allowedTags = sanitize.defaults.allowedTags.concat(['img'])

export class Markdown {
  protected readonly markdownOptions = {
    gfm: true,
  }
  protected readonly sanitizeOptions = {
    allowedTags: sanitize.defaults.allowedTags.concat(['img']),
  }

  parse(markdown: string): string {
    const dangerousHTML = marked(markdown, this.markdownOptions)
    return sanitize(dangerousHTML, this.sanitizeOptions)
  }
}
