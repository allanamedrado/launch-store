// const input = document.querySelector('input[name="price"]')
// input.addEventListener('keydown', function(e) {

    
//     setTimeout(function() {
//         let value = e.target.value;
//         value = value.replace(/\D/g,"")
//         value = new Intl.NumberFormat('pt-BR', {
//             style: 'currency',
//             currency: 'BRL'
//         }).format(value/100)
//         e.target.value = value
//     }, 1)
// })

const Mask = {
    apply(input, func) {
        setTimeout(function() {
            input.value = Mask[func](input.value)
        }, 1)
    }, formatBRL(value) {
        value = value.replace(/\D/g,"")

        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value/100)
    }
}

const PhotosUpload = {
    preview: document.querySelector('#photos-preview'),
    uploadLimit: 6,
    files: [],
    input: "",
    handleFileInput(event) {
        const { files: fileList } = event.target
        PhotosUpload.input = event.target;

        if(PhotosUpload.hasLimit(event)) return        

        Array.from(fileList).forEach((file) => {
            PhotosUpload.files.push(file)
            const reader = new FileReader()
            reader.onload = () => {
                const image = new Image() //<img>
                image.src = String(reader.result)
                
                const container = PhotosUpload.getContainer(image)
                

                PhotosUpload.preview.appendChild(container)
            }

            reader.readAsDataURL(file)
        })

        PhotosUpload.input.files = PhotosUpload.getAllFiles()
    },
    hasLimit(event) {
        // const { files: fileList } = event.target
        const { uploadLimit, input, preview } = PhotosUpload
        const { files: fileList } = input

        if(fileList.length > uploadLimit) {
            alert(`Envie no máximo ${uploadLimit} fotos`)
            event.preventDefault()
            return true;
        }

        const photosDiv = []
        preview.childNodes.forEach(item => {
            if(item.classList && item.classList.value == "photo"){
                photosDiv.push(item)
            }
        })

        const totalPhotos = fileList.length + photosDiv.length
        if (totalPhotos > uploadLimit) {
            alert("Limite máximo de fotos atingido")
            event.preventDefault()
            return true
        }

        return false;
    },
    getAllFiles() {
        const dataTransfer = new ClipboardEvent("").clipboardData || new DataTransfer()

        PhotosUpload.files.forEach(file => dataTransfer.items.add(file))

        return dataTransfer.files;
    },
    getContainer(image) {
        const container = document.createElement('div')
        container.classList.add('photo')

        container.onclick = PhotosUpload.removerPhoto

        container.appendChild(image)

        container.appendChild(PhotosUpload.getRemoveButton())
        return container;
    },
    getRemoveButton() {
        const button = document.createElement('i')
        button.classList.add('material-icons')
        button.innerHTML = "close"
        return button
    },
    removerPhoto(event) {
        const photoDiv = event.target.parentNode //<div class="photo">
        const photosArray = Array.from(PhotosUpload.preview.children)
        const index = photosArray.indexOf(photoDiv)

        PhotosUpload.files.splice(index, 1)
        PhotosUpload.input.files = PhotosUpload.getAllFiles()

        photoDiv.remove();
    },
    removeOldPhoto(event) {
        const photoDiv = event.target.parentNode
        if(photoDiv.id) {
            const removedFiles = document.querySelector('input[name]="removed_files"')
            if(removedFiles){
                removedFiles.value += `${photoDiv.id},` //concatenar o valor com a div, quando clicar coloca a string 1,2,3 sempre que clicar

            }
        }
        photoDiv.remove()
    }
}
