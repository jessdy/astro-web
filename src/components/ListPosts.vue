<script lang="ts" setup>
interface Post {
  id: string
  slug: string
  body: string
  data: Record<string, any>
  collection: string
  render: any
}

withDefaults(defineProps<{
  list?: Post[]
}>(), {
  list: () => [],
})

function getDate(date: string) {
  return new Date(date).toISOString()
}

function getHref(post: Post) {
  if (post.data.redirect)
    return post.data.redirect
  return `/posts/${post.slug}`
}

function getTarget(post: Post) {
  if (post.data.redirect)
    return '_blank'
  return '_self'
}

function isSameYear(a: Date | string | number, b: Date | string | number) {
  return a && b && getYear(a) === getYear(b)
}

function getYear(date: Date | string | number) {
  return new Date(date).getFullYear()
}

// 添加标签链接生成函数
function getTagHref(tag: string) {
  return `/tags/${encodeURIComponent(tag)}`
}
</script>

<template>
  <ul sm:min-h-38 min-h-28 mb-18>
    <template v-if="!list || list.length === 0">
      <div my-12 opacity-50>
        nothing here yet.
      </div>
    </template>
    <li v-for="(post, index) in list " :key="post.data.title" mb-8>
      <div v-if="!isSameYear(post.data.date, list[index - 1]?.data.date)" select-none relative h18 pointer-events-none>
        <span text-7em color-transparent font-bold text-stroke-2 text-stroke-hex-aaa op14 absolute top--0.2em>
          {{ getYear(post.data.date) }}
        </span>
      </div>
      <a text-lg lh-tight nav-link flex="~ col gap-2" :aria-label="post.data.title" :target="getTarget(post)" :href="getHref(post)">
        <div flex="~ col md:row gap-2 md:items-center">
          <div flex="~ gap-2 items-center text-wrap">
            <span lh-normal>
              <i v-if="post.data.draft" text-base vertical-mid i-ri-draft-line />
              {{ post.data.title }}
            </span>
          </div>
          <div opacity-50 text-sm ws-nowrap flex="~ gap-2 items-center">
            <i v-if="post.data.redirect" text-base i-ri-external-link-line />
            <i v-if="post.data.recording || post.data.video" text-base i-ri:film-line />
            <time v-if="post.data.date" :datetime="getDate(post.data.date)">{{ post.data.date.split(',')[0] }}</time>
            <span v-if="post.data.duration">· {{ post.data.duration }}</span>
            <span v-if="post.data.tag">· {{ post.data.tag }}</span>
            <span v-if="post.data.lang && post.data.lang.includes('zh')">· 中文</span>
          </div>
        </div>
        <div opacity-50 text-sm>{{ post.data.description }}</div>
        <!-- 添加标签显示 -->
        <div v-if="post.data.tags && post.data.tags.length" mt-2 flex="~ wrap gap-2">
          <a
            v-for="tag in post.data.tags"
            :key="tag"
            :href="getTagHref(tag)"
            text-xs px-2 py-0.5
            bg-gray-100 dark:bg-gray-800
            rounded-full
            transition-colors duration-300
            hover:bg-gray-800 hover:dark:bg-gray-100
            hover:text-gray-100 hover:dark:text-gray-800
            @click.stop
          >
            {{ tag }}
          </a>
        </div>
      </a>
    </li>
  </ul>
</template>
