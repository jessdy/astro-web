<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

interface Heading {
  id: string
  text: string
  level: number
}

const headings = ref<Heading[]>([])
const activeId = ref<string>('')
const isVisible = ref(false)
const isHeaderHidden = ref(false)

// 提取标题
function extractHeadings() {
  const article = document.querySelector('article.prose')
  if (!article)
    return

  const headingElements = article.querySelectorAll('h2, h3, h4, h5, h6')
  const extracted: Heading[] = []

  const usedIds = new Set<string>()

  headingElements.forEach((element) => {
    const text = element.textContent || ''
    const level = Number.parseInt(element.tagName.charAt(1))

    // 如果没有 id，生成一个
    let id = element.id
    if (!id) {
      const baseId = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      // 确保 ID 唯一
      id = baseId
      let counter = 1
      while (usedIds.has(id)) {
        id = `${baseId}-${counter}`
        counter++
      }
      usedIds.add(id)
      element.id = id
    }
    else {
      usedIds.add(id)
    }

    extracted.push({ id, text, level })
  })

  headings.value = extracted
}

// 滚动到指定标题
function scrollToHeading(id: string) {
  const element = document.getElementById(id)
  if (element) {
    const offset = 100 // 考虑固定头部的高度
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    })

    // 更新 URL hash
    history.pushState(null, '', `#${id}`)
    activeId.value = id
  }
}

// 检测当前活动的标题
function updateActiveHeading() {
  if (headings.value.length === 0)
    return

  const scrollPosition = window.scrollY + 150 // 偏移量

  // 找到当前应该高亮的标题
  let current = ''
  for (let i = headings.value.length - 1; i >= 0; i--) {
    const heading = headings.value[i]
    const element = document.getElementById(heading.id)
    if (element) {
      const elementTop = element.offsetTop
      if (scrollPosition >= elementTop) {
        current = heading.id
        break
      }
    }
  }

  // 如果滚动到顶部，高亮第一个标题
  if (scrollPosition < 200 && headings.value.length > 0) {
    current = headings.value[0].id
  }

  activeId.value = current
}

// 检查导航是否应该显示
function checkVisibility() {
  if (headings.value.length === 0) {
    isVisible.value = false
    return
  }

  const article = document.querySelector('article.prose')
  if (!article) {
    isVisible.value = false
    return
  }

  const articleRect = article.getBoundingClientRect()
  const windowHeight = window.innerHeight
  const windowWidth = window.innerWidth

  // 当文章内容足够长且可见时显示导航，并且屏幕宽度足够大
  isVisible.value
    = windowWidth > 1280
      && articleRect.height > windowHeight * 1.2
      && articleRect.top < windowHeight
      && articleRect.bottom > 0
}

// 检查 header 是否隐藏
function checkHeaderState() {
  const headerEl = document.querySelector('#header')
  if (headerEl) {
    isHeaderHidden.value = headerEl.classList.contains('header-hide')
  }
}

function handleScroll() {
  updateActiveHeading()
  checkVisibility()
  checkHeaderState()
}

onMounted(() => {
  // 等待内容渲染完成
  setTimeout(() => {
    extractHeadings()
    updateActiveHeading()
    checkVisibility()
    checkHeaderState()

    // 如果 URL 中有 hash，滚动到对应位置
    if (window.location.hash) {
      const hash = window.location.hash.slice(1)
      const element = document.getElementById(hash)
      if (element) {
        setTimeout(() => {
          scrollToHeading(hash)
        }, 200)
      }
    }
  }, 100)

  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', checkVisibility)

  // 使用 MutationObserver 监听 header 类变化
  const headerEl = document.querySelector('#header')
  if (headerEl) {
    const observer = new MutationObserver(() => {
      checkHeaderState()
    })
    observer.observe(headerEl, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', checkVisibility)
})
</script>

<template>
  <nav
    v-if="headings.length > 0"
    class="table-of-contents"
    :class="{
      'is-visible': isVisible,
      'header-hidden': isHeaderHidden,
    }"
  >
    <div class="toc-header">
      <h3 class="toc-title">
        目录
      </h3>
    </div>
    <ul class="toc-list">
      <li
        v-for="heading in headings"
        :key="heading.id"
        class="toc-item" :class="[
          `toc-item-${heading.level}`,
          { 'is-active': activeId === heading.id },
        ]"
      >
        <a
          :href="`#${heading.id}`"
          class="toc-link"
          @click.prevent="scrollToHeading(heading.id)"
        >
          {{ heading.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.table-of-contents {
  position: fixed;
  top: 120px;
  left: 2rem;
  width: 240px;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 0.5rem;
  border: 1px solid rgba(125, 125, 125, 0.2);
  opacity: 0;
  transform: translateX(-20px);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease,
    top 0.4s ease;
  pointer-events: none;
  z-index: 100;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.table-of-contents.header-hidden {
  top: 40px;
}

.table-of-contents.is-visible {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.toc-header {
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(125, 125, 125, 0.2);
}

.toc-title {
  font-size: 0.75rem;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc-item {
  margin: 0.25rem 0;
  line-height: 1.5;
}

.toc-item-2 {
  margin-left: 0;
  font-size: 0.8125rem;
  font-weight: 500;
}

.toc-item-3 {
  margin-left: 0.75rem;
  font-size: 0.75rem;
  font-weight: 400;
}

.toc-item-4 {
  margin-left: 1.5rem;
  font-size: 0.6875rem;
  font-weight: 400;
  opacity: 0.8;
}

.toc-item-5,
.toc-item-6 {
  margin-left: 2rem;
  font-size: 0.625rem;
  font-weight: 400;
  opacity: 0.7;
}

.toc-link {
  display: block;
  color: inherit;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  opacity: 0.6;
  border-left: 2px solid transparent;
}

.toc-link:hover {
  opacity: 1;
  background: rgba(125, 125, 125, 0.1);
}

.toc-item.is-active .toc-link {
  opacity: 1;
  font-weight: 500;
  border-left-color: currentColor;
  background: rgba(125, 125, 125, 0.1);
}

/* 滚动条样式 */
.table-of-contents::-webkit-scrollbar {
  width: 4px;
}

.table-of-contents::-webkit-scrollbar-track {
  background: transparent;
}

.table-of-contents::-webkit-scrollbar-thumb {
  background: rgba(125, 125, 125, 0.3);
  border-radius: 2px;
}

.table-of-contents::-webkit-scrollbar-thumb:hover {
  background: rgba(125, 125, 125, 0.5);
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .table-of-contents {
    display: none;
  }
}

/* 暗色模式 */
:global(html.dark) .table-of-contents {
  background: rgba(0, 0, 0, 0.8);
  border-color: rgba(125, 125, 125, 0.3);
}

:global(html.dark) .toc-link:hover,
:global(html.dark) .toc-item.is-active .toc-link {
  background: rgba(125, 125, 125, 0.2);
}
</style>
