function uploadImages() {
    const input = document.getElementById('imageInput');
    const files = input.files;

    if (files.length === 0) {
        alert('请选择要上传的图片！');
        return;
    }

    const gallery = document.getElementById('imageGallery');

    for (const file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const div = document.createElement('div');
                div.className = 'gallery-item';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                
                div.appendChild(img);
                gallery.appendChild(div);
            };
            
            reader.readAsDataURL(file);
        }
    }

    // 清空输入框，允许重复上传相同的图片
    input.value = '';
} 