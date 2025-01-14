<template>
  <div class="container">
    <h1>图片展示网站</h1>
    
    <div class="loading-progress" v-if="isLoading">
      <div class="progress-bar" :style="{ width: `${loadingProgress}%` }"></div>
    </div>
    
    <div 
      class="drop-zone" 
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      :class="{ 'drop-zone-active': isDragging }"
    >
      <div class="drop-zone-content">
        <span class="upload-icon">+</span>
        <p>拖拽图片到此处或点击上传</p>
      </div>
      <input 
        type="file" 
        ref="fileInput"
        accept="image/*" 
        multiple 
        @change="handleFileChange"
        style="display: none"
      >
    </div>

    <div class="masonry-gallery" ref="gallery">
      <div 
        v-for="(image, index) in images" 
        :key="index" 
        class="gallery-item"
        :style="{ '--animation-order': index }"
        @click="openPreview(index)"
      >
        <div class="image-placeholder" v-if="!image.loaded">
          <div class="loading-spinner"></div>
        </div>
        <img 
          :src="image.url" 
          :alt="image.name"
          @load="handleImageLoad(index)"
          :class="{ 'loaded': image.loaded }"
        >
        <div class="image-actions">
          <button @click.stop="deleteImage(index)" class="delete-btn">删除</button>
        </div>
      </div>
    </div>

    <div v-if="previewIndex !== null" class="preview-modal" @click="closePreview">
      <div class="preview-content" @click.stop>
        <button class="preview-close" @click="closePreview">&times;</button>
        <button 
          class="preview-nav preview-prev" 
          @click="navigatePreview(-1)"
          v-show="previewIndex > 0"
        >&lt;</button>
        <button 
          class="preview-nav preview-next" 
          @click="navigatePreview(1)"
          v-show="previewIndex < images.length - 1"
        >&gt;</button>
        <img :src="images[previewIndex]?.url" :alt="images[previewIndex]?.name">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const images = ref([])
const fileInput = ref(null)
const gallery = ref(null)
const isLoading = ref(false)
const loadingProgress = ref(0)
const totalImages = ref(0)
const loadedImages = ref(0)
const isDragging = ref(false)
const previewIndex = ref(null)

const handleImageLoad = (index) => {
  images.value[index].loaded = true
  
  loadedImages.value++
  loadingProgress.value = (loadedImages.value / totalImages.value) * 100
  
  if (loadedImages.value === totalImages.value) {
    setTimeout(() => {
      isLoading.value = false
      loadingProgress.value = 0
      loadedImages.value = 0
    }, 500)
  }
  
  if (gallery.value) {
    const items = gallery.value.children
    let maxHeight = 0
    
    for (let i = 0; i < items.length; i++) {
      const height = items[i].getBoundingClientRect().height
      if (height > maxHeight) maxHeight = height
    }
  }
}

const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = url
    img.onload = resolve
    img.onerror = reject
  })
}

const processFiles = (files) => {
  if (files.length === 0) return
  
  isLoading.value = true
  loadingProgress.value = 0
  totalImages.value += files.length
  loadedImages.value = 0
  
  Array.from(files).forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        images.value.push({
          url: e.target.result,
          name: file.name,
          loaded: false
        })
        preloadImage(e.target.result).catch(() => {
          console.error('Failed to load image:', file.name)
        })
      }
      reader.readAsDataURL(file)
    }
  })
}

const handleFileChange = (event) => {
  processFiles(event.target.files)
  event.target.value = ''
}

const uploadImages = () => {
  fileInput.value.click()
}

const deleteImage = (index) => {
  images.value.splice(index, 1)
}

const handleDragOver = (event) => {
  isDragging.value = true
  event.dataTransfer.dropEffect = 'copy'
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (event) => {
  isDragging.value = false
  const files = event.dataTransfer.files
  processFiles(files)
}

const openPreview = (index) => {
  previewIndex.value = index
  document.body.style.overflow = 'hidden'
}

const closePreview = () => {
  previewIndex.value = null
  document.body.style.overflow = ''
}

const navigatePreview = (direction) => {
  const newIndex = previewIndex.value + direction
  if (newIndex >= 0 && newIndex < images.value.length) {
    previewIndex.value = newIndex
  }
}

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show')
      }
    })
  }, {
    threshold: 0.1
  })
  
  const updateObserver = () => {
    const items = document.querySelectorAll('.gallery-item')
    items.forEach(item => observer.observe(item))
  }
  
  updateObserver()
  watch(images, updateObserver)

  window.addEventListener('keydown', (e) => {
    if (previewIndex.value !== null) {
      switch(e.key) {
        case 'ArrowLeft':
          navigatePreview(-1)
          break
        case 'ArrowRight':
          navigatePreview(1)
          break
        case 'Escape':
          closePreview()
          break
      }
    }
  })
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.upload-section {
  text-align: center;
  margin-bottom: 30px;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
}

button:hover {
  background-color: #45a049;
}

.masonry-gallery {
  columns: 4 250px;
  column-gap: 20px;
  padding: 20px;
}

@media (max-width: 1024px) {
  .masonry-gallery {
    columns: 3 200px;
  }
}

@media (max-width: 768px) {
  .masonry-gallery {
    columns: 2 180px;
  }
}

.gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  break-inside: avoid;
  margin-bottom: 20px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
  transition-delay: calc(var(--animation-order) * 0.1s);
  cursor: pointer;
}

.gallery-item.show {
  opacity: 1;
  transform: translateY(0);
}

.gallery-item img {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.gallery-item:hover img {
  transform: scale(1.03);
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #4CAF50;
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.upload-icon {
  font-size: 20px;
  font-weight: bold;
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px;
  display: flex;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.delete-btn {
  background-color: #dc3545;
  padding: 5px 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background-color: #c82333;
  transform: scale(1.05);
}

.loading-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.progress-bar {
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s ease;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.gallery-item img {
  opacity: 0;
  transition: opacity 0.5s ease, transform 0.3s ease;
}

.gallery-item img.loaded {
  opacity: 1;
}

.drop-zone {
  border: 2px dashed #4CAF50;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 30px;
}

.drop-zone-active {
  background-color: rgba(76, 175, 80, 0.1);
  border-color: #45a049;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.preview-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.preview-close {
  position: absolute;
  top: -40px;
  right: -40px;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
}

.preview-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 20px;
  cursor: pointer;
  font-size: 20px;
  transition: background 0.3s;
}

.preview-nav:hover {
  background: rgba(255, 255, 255, 0.2);
}

.preview-prev {
  left: -60px;
}

.preview-next {
  right: -60px;
}
</style> 