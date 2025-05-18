export const siteConfig = {
  author: 'Jessdy Zhang',
  title: 'Vitesse theme for Astro',
  subtitle: 'Web3 × AI × Proxies × Projects',
  description: 'Web3资讯 × AI科技 × 代理 × 项目',
  image: {
    src: '/hero.jpg',
    alt: 'Website Main Image',
  },
  email: 'chrisjessdy@gmail.com',
  socialLinks: [
    {
      text: 'GitHub',
      href: 'https://github.com/jessdy',
      icon: 'i-simple-icons-github',
      header: 'i-ri-github-line',
    },
    {
      text: 'Twitter',
      href: 'https://x.com/chrisjessdy',
      icon: 'i-simple-icons-x',
      header: 'i-ri-twitter-x-line',
    },
    {
      text: 'Telegram',
      href: 'http://t.me/jessdy2',
      icon: 'i-simple-icons-telegram',
    },
    {
      text: 'Discord',
      href: '',
      icon: 'i-simple-icons-discord',
    },
  ],
  header: {
    logo: {
      src: '/favicon.svg',
      alt: 'Jessdy',
    },
    navLinks: [
      {
        text: 'Web3',
        href: '/web3',
      },
      {
        text: 'AI',
        href: '/ai',
      },
      {
        text: '代理',
        href: '/proxies',
      },
      {
        text: '项目',
        href: '/projects',
      },
    ],
  },
  page: {
    blogLinks: [
      {
        text: 'Web3',
        href: '/web3',
      },
      {
        text: 'AI',
        href: '/ai',
      },
      {
        text: '代理',
        href: '/proxies',
      },
      {
        text: '项目',
        href: '/projects',
      },
    ],
  },
  footer: {
    navLinks: [
      {
        text: 'Power by Astro',
        href: 'https://astro.build/',
      },
      {
        text: 'GitHub Repository',
        href: 'https://github.com/jessdy/astro-web',
      },
    ],
  },
}

export default siteConfig
