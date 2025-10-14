<script setup lang="ts">
import { onMounted } from 'vue'

function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text)
    .then(() => {
      // 复制成功
    })
    .catch((err) => {
      console.error('Failed to copy text: ', err)
    })
}

onMounted(() => {
  // 等待一小段时间确保所有内容都已渲染
  setTimeout(() => {
    const codeBlocks = document.querySelectorAll('pre')

    codeBlocks.forEach((block) => {
      // 避免重复添加按钮
      if (block.querySelector('.copy-button')) {
        return
      }

      const handleCopy = () => {
        const button = block.querySelector('.copy-button') as HTMLButtonElement
        if (button) {
          copyToClipboard(block.textContent || '')
          button.textContent = '已复制'
          button.classList.add('copied')
          setTimeout(() => {
            button.textContent = '复制'
            button.classList.remove('copied')
          }, 2000)
        }
      }

      const button = document.createElement('button')
      button.className = 'copy-button'
      button.textContent = '复制'
      button.addEventListener('click', handleCopy)

      block.style.position = 'relative'
      block.appendChild(button)
    })
  }, 100)
})
</script>

<template>
  <div style="display: none;" />
</template>

<style scoped>
.code-block-wrapper {
  position: relative;
}

.copy-button {
  transition: opacity 0.2s ease-in-out;
}

.code-block-wrapper:hover .copy-button {
  opacity: 1 !important;
}
</style>
