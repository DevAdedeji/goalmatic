

type CustomHeadTypes = {
  title: string
  desc?: string
  img?: string
}
export const useCustomHead = ({ title, desc, img }: CustomHeadTypes) => {
  useSeoMeta({
    title,
    ogTitle: title,
    description: desc ?? 'Goalmatic | Get more done, effortlessly, with AI agents and workflows',
    ogDescription: desc ?? 'Goalmatic | Get more done, effortlessly, with AI agents and workflows',
    ogImage: img ?? 'https://www.goalmatic.io/og.png',
    twitterCard: 'summary_large_image'
  })
  useHead({
    title,
    meta: [
      {
        name: 'description',
        content:
          desc ?? 'Goalmatic | Get more done, effortlessly, with AI agents and workflows'
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@taaskly' },
      { name: 'twitter:title', content: title ?? 'Taaskly | Your one stop destination for all your business needs' },
      {
        name: 'twitter:description',
        content:
          desc ?? 'Goalmatic - Get more done, effortlessly, with AI agents and workflows'
      },
      { name: 'twitter:image', content: img ?? 'https://www.goalmatic.io/og.png' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: title ?? 'Goalmatic | Get more done, effortlessly, with AI agents and workflows' },
      { property: 'og:url', content: 'https://goalmatic.io/' },
      { property: 'og:image', content: img ?? 'https://www.goalmatic.io/og.png' },
      { property: 'og:image:secure_url', content: img ?? 'https://www.goalmatic.io/og.png' },
      { property: 'og:image:type', content: 'image/png' },
      {
        property: 'og:description',
        content:
          desc ?? 'Goalmatic | Get more done, effortlessly, with AI agents and workflows'
      }
    ]
  })
}


export const setCustomHead = ({ title, desc, img }: CustomHeadTypes) => {
  if (process.server) return
    document.title = title
    const metaTags = [
      { name: 'description', content: desc ?? 'Goalmatic | Get more done, effortlessly, with AI agents and workflows' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@taaskly' },
      { name: 'twitter:title', content: title ?? 'Goalmatic | Get more done, effortlessly, with AI agents and workflows' },
      { name: 'twitter:description', content: desc ?? 'Goalmatic | Get more done, effortlessly, with AI agents and workflows' },
      { name: 'twitter:image', content: img ?? 'https://www.goalmatic.io/og.png' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: title ?? 'Goalmatic | Get more done, effortlessly, with AI agents and workflows' },
      { property: 'og:url', content: 'https://goalmatic.io/' },
      { property: 'og:image', content: img ?? 'https://www.goalmatic.io/og.png' },
      { property: 'og:image:secure_url', content: img ?? 'https://www.goalmatic.io/og.png' },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:description', content: desc ?? 'Goalmatic | Get more done, effortlessly, with AI agents and workflows' }
    ]

    metaTags.forEach((tag) => {
      const element = document.createElement('meta')
      Object.keys(tag).forEach((key) => {
        element.setAttribute(key, tag[key])
      })
      document.head.appendChild(element)
    })
}
